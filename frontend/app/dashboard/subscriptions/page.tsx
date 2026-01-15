'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Wallet, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  subscriber_address: string;
  status: string;
  subscription_type: string;
  created_at: string;
  plans: {
    name: string;
    price: number;
    interval: string;
  };
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // 1. Authenticate via API
      const merchantData = await api.get('/merchants/me');
      if (!merchantData) return;

      // 2. Fetch data (filtered by merchant ID from step 1)
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans!inner(name, price, interval)
        `)
        .eq('plans.merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      setSubscriptions(subsData || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center">
              <Button variant="ghost" className="text-slate-300 hover:text-slate-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Subscriptions</h1>
          <p className="text-slate-400">View all active and cancelled subscriptions</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            {subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No subscriptions yet</h3>
                <p className="text-sm text-slate-500">
                  Subscriptions will appear here as customers sign up for your plans
                </p>
              </div>
            ) : (
               <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-400">Subscriber</TableHead>
                      <TableHead className="text-slate-400">Plan</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Price</TableHead>
                      <TableHead className="text-slate-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell className="text-slate-200 font-mono text-sm">
                          <div className="flex items-center space-x-2">
                            <span>{shortAddress(sub.subscriber_address)}</span>
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => copyToClipboard(sub.subscriber_address)}>
                              {copied === sub.subscriber_address ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-200">{sub.plans.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sub.subscription_type === 'wallet' ? 'border-indigo-700 text-indigo-300' : 'border-teal-700 text-teal-300'}>
                            {sub.subscription_type === 'wallet' ? 'Auto-Pull' : 'Vault'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge className={sub.status === 'active' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-slate-800 text-slate-400 border border-slate-700'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-200">{sub.plans.price} / {sub.plans.interval}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{formatDate(sub.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}