'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api'; // Import the new helper
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Wallet, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [treasuryAddress, setTreasuryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for API Keys returned by backend
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [copiedApi, setCopiedApi] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Python Backend
      const response = await api.post('/auth/signup', {
        email,
        password,
        business_name: businessName, // Matches Pydantic model
        treasury_address: treasuryAddress
      });

      // 1. Store the JWT Token
      localStorage.setItem('payrail_token', response.access_token);

      // 2. Display the generated keys
      setApiKey(response.api_key);
      setWebhookSecret(response.webhook_secret);
      setShowApiKeys(true);

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'api' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'api') {
      setCopiedApi(true);
      setTimeout(() => setCopiedApi(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-8 w-8 text-teal-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                  Payrail
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-slate-100">Create merchant account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Start accepting crypto subscriptions
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-slate-200">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="My SaaS Company"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="merchant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treasuryAddress" className="text-slate-200">Treasury Address</Label>
                <Input
                  id="treasuryAddress"
                  placeholder="0x..."
                  value={treasuryAddress}
                  onChange={(e) => setTreasuryAddress(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-teal-600"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-center text-slate-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-teal-400 hover:text-teal-300">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* API Key Modal - Triggered only after successful Backend Signup */}
      <Dialog open={showApiKeys} onOpenChange={(open) => !open && router.push('/dashboard')}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your API Credentials</DialogTitle>
            <DialogDescription className="text-slate-400">
              Generated by Payrail. Save these securely; they are only shown once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">API Key</Label>
              <div className="flex items-center space-x-2">
                <Input value={apiKey} readOnly className="bg-slate-800/50 border-slate-700 font-mono text-sm" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(apiKey, 'api')} className="border-slate-700">
                   {copiedApi ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Webhook Secret</Label>
              <div className="flex items-center space-x-2">
                <Input value={webhookSecret} readOnly className="bg-slate-800/50 border-slate-700 font-mono text-sm" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(webhookSecret, 'webhook')} className="border-slate-700">
                  {copiedWebhook ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full bg-gradient-to-r from-indigo-600 to-teal-600">
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}