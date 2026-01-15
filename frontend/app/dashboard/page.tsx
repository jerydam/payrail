'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, DollarSign, Users, Wallet, TrendingUp, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from 'sonner';

interface DashboardStats {
  totalRevenue: number;
  activeSubscriptions: number;
  walletSubs: number;
  vaultSubs: number;
  pendingVaults: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    walletSubs: 0,
    vaultSubs: 0,
    pendingVaults: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch Merchant ID via API (Authenticated)
      const merchantData = await api.get('/merchants/me');
      
      if (merchantData) {
        setMerchant(merchantData);

        // Fetch data from Supabase using the ID retrieved from API
        const { data: subsData } = await supabase
          .from('subscriptions')
          .select('*, plans!inner(*)')
          .eq('plans.merchant_id', merchantData.id);

        const { data: vaultsData } = await supabase
          .from('deposit_vaults')
          .select('*')
          .eq('merchant_id', merchantData.id);

        const walletCount = subsData?.filter((s: any) => s.subscription_type === 'wallet' && s.status === 'active').length || 0;
        const vaultCount = subsData?.filter((s: any) => s.subscription_type === 'vault' && s.status === 'active').length || 0;
        const pendingCount = vaultsData?.filter((v: any) => v.status === 'PENDING').length || 0;

        setStats({
          totalRevenue: merchantData.total_revenue || 0,
          activeSubscriptions: (walletCount + vaultCount),
          walletSubs: walletCount,
          vaultSubs: vaultCount,
          pendingVaults: pendingCount,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // api.get handles redirect to login on 401
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('payrail_token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // ... Return JSX (unchanged) ...
  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-teal-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                  Payrail
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-400">{merchant?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Same Dashboard Content as before */}
            {/* ... */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
                {/* ... rest of the dashboard UI ... */}
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-teal-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">${stats.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                {/* ... other cards ... */}
            </div>
            
            {/* Tabs */}
             <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-900/50 border border-slate-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-100">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Link href="/dashboard/plans/new">
                                <Button className="w-full justify-between bg-gradient-to-r from-indigo-600 to-teal-600">
                                    Create Your First Plan <ArrowUpRight className="h-4 w-4" />
                                </Button>
                             </Link>
                             <Link href="/dashboard/integration">
                                <Button variant="outline" className="w-full justify-between border-slate-700 text-slate-300">
                                    View Integration Guide <ArrowUpRight className="h-4 w-4" />
                                </Button>
                             </Link>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="subscriptions">
                     {/* Subscription List */}
                     <div className="text-slate-500">View detailed list in Subscriptions tab</div>
                </TabsContent>
             </Tabs>
        </main>
      </div>
    </>
  );
}