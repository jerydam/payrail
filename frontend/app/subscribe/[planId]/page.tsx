'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckoutWidget } from '@/components/checkout-widget';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SubscribePage() {
  const params = useParams();
  const planId = parseInt(params.planId as string);
  const [plan, setPlan] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*, merchants(*)')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      setPlan(planData);
      setMerchant(planData.merchants);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Plan Not Found</h1>
          <p className="text-slate-400">This subscription plan does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-400 mb-2">Subscribe to</p>
            <h1 className="text-xl font-semibold text-slate-100">{merchant?.name}</h1>
          </div>
          <CheckoutWidget
            planId={plan.id}
            planName={plan.name}
            price={plan.price.toString()}
            interval={plan.interval}
            tokenAddress={plan.token_address}
            tokenSymbol={plan.token_symbol}
            merchantId={merchant.id}
            sponsoredGas={false}
          />
        </div>
      </div>
    </>
  );
}
