import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // --- SIGN UP LOGIC ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Account created! You are now logged in.");
        // Optional: If you enabled "Confirm Email" in Supabase, change this message.
        if (data.session) navigate('/dashboard');
      }
    } else {
      // --- SIGN IN LOGIC ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="text-slate-500 mb-6">
          {isSignUp ? "Start automating your business today." : "Sign in to manage your clients."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} 
            className="text-teal-600 font-bold hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}