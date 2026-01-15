'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api'; // Use API
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function IntegrationPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadMerchant();
  }, []);

  const loadMerchant = async () => {
    try {
      // Replaced Supabase auth with API
      const merchantData = await api.get('/merchants/me');
      setMerchant(merchantData);
    } catch (error) {
      console.error('Error loading merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
    toast.success('Copied to clipboard');
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
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Integration Guide</h1>
          <p className="text-slate-400">Everything you need to integrate Payrail into your application</p>
        </div>

        <Tabs defaultValue="embed" className="space-y-4">
            {/* Same Tabs Content as before */}
            {/* ... */}
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="embed">Embed Widget</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="embed" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Embed Checkout Widget</CardTitle>
                <CardDescription className="text-slate-400">
                  Add the Payrail checkout to your subscription page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* Embed code examples */}
                 <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <code className="text-xs text-slate-200 font-mono">
                        {`<iframe src="https://payrail.io/checkout?planId=YOUR_PLAN_ID" ... ></iframe>`}
                    </code>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">API Key</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-slate-800/50 p-3 rounded text-xs text-slate-200 font-mono break-all border border-slate-700">
                        {merchant?.api_key_hash || 'sk_live_••••••••'}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(merchant?.api_key_hash || '', 'api')}
                        className="border-slate-700 flex-shrink-0"
                      >
                        {copied === 'api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                   {/* Webhook Secret UI */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Webhooks Tab ... */}
        </Tabs>
      </main>
    </div>
  );
}