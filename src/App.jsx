import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// --- Supabase Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- The "Traffic Cop" Component ---
// This listens for login events and redirects the user
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase provides a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If the user just signed in, send them to the dashboard
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null; // This component is invisible
}

export default function App() {
  return (
    <Router>
      {/* We drop the listener here so it's always active */}
      <AuthListener />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}