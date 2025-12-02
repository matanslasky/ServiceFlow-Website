import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// --- Supabase Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- The "Traffic Cop" Component ---
// This listens for login/logout events and redirects the user automatically
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase provides a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      // 1. If the user just signed in, send them to the dashboard
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
      
      // 2. If the user signs out, send them back to the home page
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null; // This component is invisible
}

export default function App() {
  return (
    <Router>
      {/* We drop the listener here so it's always watching */}
      <AuthListener />
      
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}