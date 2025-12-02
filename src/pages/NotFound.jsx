import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-9xl font-bold text-teal-100">404</h1>
      <p className="text-2xl font-bold text-slate-900 mt-4">Page not found</p>
      <p className="text-slate-500 mt-2 mb-8">Sorry, we couldn't find the page you're looking for.</p>
      
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
      >
        <Home size={20} />
        Go back home
      </Link>
    </div>
  );
}