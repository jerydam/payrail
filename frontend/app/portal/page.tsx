'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, Check, AlertCircle, QrCode } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { connectWallet } from '@/lib/web3';
import QRCode from 'react-qr-code';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Subscription {
  id: string;
  status: string;
  subscription_type: string;
  next_billing_date: string | null;
  created_at: string;
  plans: {
    name: string;
    price: number;
    interval: string;
    token_symbol: string;
    merchants: {
      name: string;
    };
  };
  deposit_vaults?: {
    vault_address: string;
    status: string;
  }[];
}

export default function PortalPage() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>('');

  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      toast.success('Wallet connected!');
      loadSubscriptions(address);
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const loadSubscriptions = async (address: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans!inner(
            *,
            merchants!inner(*)
          ),
          deposit_vaults(*)
        `)
        .eq('subscriber_address', address);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', subId);

      if (error) throw error;

      toast.success('Subscription cancelled');
      loadSubscriptions(walletAddress);
    } catch (error: any) {
      toast.error('Failed to cancel subscription');
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
    });
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-teal-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                  Payrail Portal
                </span>
              </div>
              {walletAddress && (
                <div className="text-sm text-slate-400 font-mono">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!walletAddress ? (
            <Card className="bg-slate-900/50 border-slate-800 max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Wallet className="h-12 w-12 text-teal-400" />
                </div>
                <CardTitle className="text-2xl text-slate-100">Subscriber Portal</CardTitle>
                <CardDescription className="text-slate-400">
                  Connect your wallet to view and manage your subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleConnectWallet}
                  className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-100 mb-2">My Subscriptions</h1>
                <p className="text-slate-400">Manage your active subscriptions</p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                </div>
              ) : subscriptions.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-300 mb-2">No subscriptions found</h3>
                      <p className="text-sm text-slate-500">
                        You don't have any active subscriptions yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {subscriptions.map((sub) => (
                    <Card key={sub.id} className="bg-slate-900/50 border-slate-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl text-slate-100">
                              {sub.plans.merchants.name}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                              {sub.plans.name}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={sub.status === 'active' ? 'default' : 'secondary'}
                            className={
                              sub.status === 'active'
                                ? 'bg-green-900/50 text-green-300 border-green-700'
                                : 'bg-slate-800 text-slate-400'
                            }
                          >
                            {sub.status === 'active'
                              ? sub.subscription_type === 'wallet'
                                ? 'Active (Auto-pull)'
                                : 'Active (Manual Deposit)'
                              : sub.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 mb-1">Price</p>
                            <p className="text-slate-200 font-medium">
                              {sub.plans.price} {sub.plans.token_symbol} / {sub.plans.interval}
                            </p>
                          </div>
                          {sub.next_billing_date && (
                            <div>
                              <p className="text-slate-500 mb-1">Next Billing</p>
                              <p className="text-slate-200 font-medium">
                                {formatDate(sub.next_billing_date)}
                              </p>
                            </div>
                          )}
                        </div>

                        {sub.subscription_type === 'vault' && sub.deposit_vaults?.[0] && (
                          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-slate-400">Your Deposit Address</p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <QrCode className="h-3 w-3 mr-1" />
                                    QR
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 border-slate-800">
                                  <DialogHeader>
                                    <DialogTitle className="text-slate-100">Vault QR Code</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                      Scan to send {sub.plans.token_symbol}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-center p-6 bg-white rounded">
                                    <QRCode value={sub.deposit_vaults[0].vault_address} size={256} />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 text-xs text-slate-200 font-mono break-all bg-slate-900/50 p-2 rounded">
                                {sub.deposit_vaults[0].vault_address}
                              </code>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyToClipboard(sub.deposit_vaults![0].vault_address)}
                                className="flex-shrink-0"
                              >
                                {copied === sub.deposit_vaults[0].vault_address ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              Send funds here to renew your subscription
                            </p>
                          </div>
                        )}

                        {sub.status === 'active' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                              >
                                Cancel Subscription
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800">
                              <DialogHeader>
                                <DialogTitle className="text-slate-100">Cancel Subscription?</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  Are you sure you want to cancel this subscription? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex space-x-3">
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1 border-slate-700">
                                    Keep Subscription
                                  </Button>
                                </DialogTrigger>
                                <Button
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleCancelSubscription(sub.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
