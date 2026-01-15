'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Zap, Lock, BarChart3, ArrowRight, Code2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                Payrail
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-slate-300 hover:text-slate-100">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/portal">
                    <Button variant="ghost" className="text-slate-300 hover:text-slate-100">
                      Portal
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-slate-300 hover:text-slate-100">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 inline-block">
              <span className="inline-flex items-center rounded-full bg-teal-900/30 px-4 py-1.5 text-sm font-medium text-teal-300 border border-teal-800/50">
                <Zap className="mr-2 h-4 w-4" />
                The Programmable Payment Rail
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-100 mb-6 leading-tight">
              Hybrid Subscriptions for
              <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent"> Web3</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Accept both native wallet subscriptions and deterministic deposit vaults. Automated fee splitting, gasless onboarding, and seamless integrations for the global economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Financial-Grade Features
            </h2>
            <p className="text-lg text-slate-400">
              Everything you need for production-ready subscription payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-indigo-900/20 border border-indigo-800/50">
                  <Wallet className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-slate-100">Hybrid Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Connect wallet for auto-pull or send funds from any source with deterministic vault addresses
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-teal-900/20 border border-teal-800/50">
                  <Zap className="h-6 w-6 text-teal-400" />
                </div>
                <CardTitle className="text-slate-100">Automated Sweeps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Real-time deposit detection and automated vault sweeps to merchant treasury
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-green-900/20 border border-green-800/50">
                  <Lock className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-slate-100">Fee Splitting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Transparent 1% protocol fee. 99% net earnings go directly to your treasury
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-yellow-900/20 border border-yellow-800/50">
                  <BarChart3 className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-slate-100">Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Track wallet vs vault subscriptions, revenue streams, and pending deposits at a glance
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-purple-900/20 border border-purple-800/50">
                  <Code2 className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-slate-100">API First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Embed checkout widget, manage plans, and handle webhooks with our clean REST API
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg bg-orange-900/20 border border-orange-800/50">
                  <Shield className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-slate-100">Subscriber Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Customers manage subscriptions, view vault addresses, and cancel anytime with one click
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20">
          <Card className="bg-gradient-to-br from-indigo-900/20 to-teal-900/20 border-indigo-800/30 overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-3xl text-slate-100 mb-4">
                Ready to launch hybrid subscriptions?
              </CardTitle>
              <CardDescription className="text-lg text-slate-300">
                Join merchants already using Payrail to accept crypto payments at scale
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <footer className="py-12 border-t border-slate-800 mt-20">
          <div className="text-center text-slate-500 text-sm">
            <p>© 2026 Payrail. The programmable payment rail for the global economy.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
