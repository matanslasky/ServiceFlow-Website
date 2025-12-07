import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import Logo from '../components/Logo'; // Central Logo

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check your email to confirm.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings`
      });
      if (error) throw error;
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setShowResetForm(false);
        setMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8"><Logo /></div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-500 w-full max-w-md">
        {!showResetForm ? (
          <>
            <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
              <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isSignUp ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
              <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isSignUp ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>Sign Up</button>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
            {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="email" required className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="password" required className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-teal-500/30">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUp ? "Create Account" : "Sign In")}
              </button>
            </form>

            {!isSignUp && (
              <button 
                onClick={() => setShowResetForm(true)} 
                className="mt-4 w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Forgot password?
              </button>
            )}
            
            <button onClick={() => navigate('/')} className="mt-6 w-full text-center text-sm text-slate-400 hover:text-slate-600">Back to Home</button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Reset Password</h1>
            <p className="text-sm text-slate-500 mb-6 text-center">Enter your email to receive a reset link</p>
            
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
            {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-teal-500/30"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Send Reset Link"}
              </button>
            </form>

            <button 
              onClick={() => {
                setShowResetForm(false);
                setError(null);
                setMessage(null);
              }} 
              className="mt-6 w-full text-center text-sm text-slate-400 hover:text-slate-600"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}