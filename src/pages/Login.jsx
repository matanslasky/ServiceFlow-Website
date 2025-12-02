import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Magic Link Login
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to ServiceFlow</h1>
        <p className="text-slate-500 mb-8">Welcome back! Please enter your details.</p>

        {sent ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 text-center">
            <p className="font-bold">Magic Link Sent!</p>
            <p className="text-sm mt-1">Check your email at <strong>{email}</strong> for the login link.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}