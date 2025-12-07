import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientDetails from './pages/ClientDetails';
import Billing from './pages/Billing';
import Success from './pages/Success';
import Settings from './pages/Settings';
import CalendarView from './pages/CalendarView';
import NotFound from './pages/NotFound';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- The "Smart" Traffic Cop ---
function AuthListener() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_IN') {
        // BUG FIX: Only redirect to dashboard if user is on the home or login page.
        // If they are already on /calendar or /settings, let them stay there!
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/login') {
          navigate('/dashboard');
        }
      }

      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthListener />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/client/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}