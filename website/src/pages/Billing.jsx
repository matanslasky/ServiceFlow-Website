import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Shield, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Logo from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Billing() {
  const navigate = useNavigate();

  // PASTE YOUR LEMON SQUEEZY (OR PAYPAL) LINK HERE
  const PAYMENT_LINK = "https://serviceflow.lemonsqueezy.com/checkout/buy/..."; 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <div className="flex items-center gap-6">
           <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      <div className="p-6 md:p-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Upgrade your Workflow</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Scale your business with advanced automation, unlimited clients, and priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
            <div className="text-4xl font-extrabold text-slate-900 mb-6">$0<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-slate-500 text-sm mb-8">Perfect for trying out the platform.</p>
            <button className="w-full py-3 rounded-xl font-bold border-2 border-slate-200 text-slate-600 mb-8 cursor-default bg-slate-50">Current Plan</button>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Up to 3 Clients</li>
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Basic Dashboard</li>
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Email Support</li>
            </ul>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-white p-8 rounded-2xl border-4 border-teal-500 shadow-2xl relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">Pro <Zap size={20} className="text-amber-400 fill-amber-400"/></h3>
            <div className="text-4xl font-extrabold text-slate-900 mb-6">$29<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-slate-500 text-sm mb-8">For serious consultants scaling up.</p>
            
            {/* PAYMENT LINK BUTTON */}
            <a 
              href={PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-teal-500/30 transition-all mb-8 flex items-center justify-center"
            >
              Upgrade to Pro
            </a>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Unlimited Clients</li>
              <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> AI Email Generator</li>
              <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Client Notes & History</li>
              <li className="flex items-center gap-3 text-sm text-slate-900 font-medium"><Check size={18} className="text-teal-600"/> Priority 24/7 Support</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Agency</h3>
            <div className="text-4xl font-extrabold text-slate-900 mb-6">$99<span className="text-lg text-slate-400 font-medium">/mo</span></div>
            <p className="text-slate-500 text-sm mb-8">For teams and agencies.</p>
            <button className="w-full py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 transition-all mb-8">Contact Sales</button>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Everything in Pro</li>
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Team Accounts</li>
              <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={18} className="text-teal-600"/> Custom Branding</li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
            <Shield size={16} /> Secure payments processed by Lemon Squeezy
          </p>
        </div>
      </div>
    </div>
  );
}