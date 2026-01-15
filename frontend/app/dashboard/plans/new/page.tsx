'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import { USDC_ADDRESS } from '@/lib/contracts';

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    interval: 'monthly',
    token_address: USDC_ADDRESS,
    token_symbol: 'USDC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get authenticated merchant ID from API
      const merchantData = await api.get('/merchants/me');
      if (!merchantData) throw new Error('Merchant not found');

      // 2. Insert into Supabase (Requires valid merchant_id)
      const { error } = await supabase.from('plans').insert({
        merchant_id: merchantData.id,
        name: formData.name,
        price: parseFloat(formData.price),
        interval: formData.interval,
        token_address: formData.token_address,
        token_symbol: formData.token_symbol,
        chain_id: 84532,
        active: true,
      });

      if (error) throw error;

      toast.success('Plan created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-slate-400 hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100">Create Subscription Plan</CardTitle>
              <CardDescription className="text-slate-400">
                Define your pricing and billing interval
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Pro Monthly"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-800/50 border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-200">Price (USDC)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="9.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="bg-slate-800/50 border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-slate-200">Billing Interval</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={(value) => setFormData({ ...formData, interval: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-slate-200">Payment Token</Label>
                  <Select
                    value={formData.token_symbol}
                    onValueChange={(value) => setFormData({ ...formData, token_symbol: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="USDC">USDC (Base Sepolia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating Plan...' : 'Create Plan'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}