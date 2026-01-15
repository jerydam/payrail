'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, Check, Loader2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { connectWallet, subscribeWithWallet, getPredictedVaultAddress } from '@/lib/web3';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';

interface CheckoutWidgetProps {
  planId: number;
  planName: string;
  price: string;
  interval: string;
  tokenAddress: string;
  tokenSymbol: string;
  merchantId: string;
  sponsoredGas?: boolean;
}

export function CheckoutWidget({
  planId,
  planName,
  price,
  interval,
  tokenAddress,
  tokenSymbol,
  merchantId,
  sponsoredGas = false,
}: CheckoutWidgetProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'vault'>('wallet');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [vaultAddress, setVaultAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      toast.success('Wallet connected!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleWalletSubscribe = async () => {
    setLoading(true);
    try {
      if (!walletAddress) {
        await handleConnectWallet();
        return;
      }

      await subscribeWithWallet(planId, tokenAddress, price);

      const { error } = await supabase.from('subscriptions').insert({
        plan_id: planId,
        subscriber_address: walletAddress,
        status: 'active',
        subscription_type: 'wallet',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      toast.success('Subscription activated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleVaultGenerate = async () => {
    setLoading(true);
    try {
      const tempAddress = walletAddress || `0x${Math.random().toString(16).substring(2, 42)}`;

      const predictedAddress = await getPredictedVaultAddress(tempAddress, planId);
      setVaultAddress(predictedAddress);

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          plan_id: planId,
          subscriber_address: tempAddress,
          status: 'pending',
          subscription_type: 'vault',
        })
        .select()
        .single();

      if (subError) throw subError;

      const { error: vaultError } = await supabase.from('deposit_vaults').insert({
        subscription_id: subData.id,
        vault_address: predictedAddress,
        subscriber_address: tempAddress,
        plan_id: planId,
        merchant_id: merchantId,
        status: 'PENDING',
      });

      if (vaultError) throw vaultError;

      setWatching(true);
      toast.success('Vault address generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate vault');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Wallet className="h-6 w-6 text-teal-400" />
          {sponsoredGas && (
            <Badge variant="secondary" className="bg-teal-900/50 text-teal-300 border-teal-700">
              Gasless
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl text-slate-100">{planName}</CardTitle>
        <CardDescription className="text-slate-400">
          {price} {tokenSymbol} / {interval}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'wallet' | 'vault')}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="wallet" className="data-[state=active]:bg-slate-700">
              Connect Wallet
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-slate-700">
              Direct Deposit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4 mt-6">
            {!walletAddress ? (
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Connected</p>
                  <p className="text-sm text-slate-200 font-mono">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </p>
                </div>
                <Button
                  onClick={handleWalletSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
                {sponsoredGas && (
                  <p className="text-xs text-center text-slate-500">
                    No gas fees - Sponsored by merchant
                  </p>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="vault" className="space-y-4 mt-6">
            {!vaultAddress ? (
              <>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300 mb-2">Send funds from anywhere</p>
                  <p className="text-xs text-slate-500">
                    Get a unique deposit address that automatically activates your subscription when funded
                  </p>
                </div>
                <Button
                  onClick={handleVaultGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Vault Address'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Your Deposit Address</p>
                    {watching && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-700">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Watching ...
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs text-slate-200 font-mono break-all bg-slate-900/50 p-2 rounded">
                      {vaultAddress}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(vaultAddress)}
                      className="border-slate-700 flex-shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="w-full border-slate-700"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </Button>
                  {showQR && (
                    <div className="flex justify-center p-4 bg-white rounded">
                      <QRCode value={vaultAddress} size={200} />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-lg">
                  <p className="text-sm text-indigo-200 font-medium mb-1">Important</p>
                  <p className="text-xs text-indigo-300/80">
                    This address belongs only to you for this service. Send exactly {price} {tokenSymbol} to activate your subscription.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
