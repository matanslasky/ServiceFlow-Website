import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-600 mt-2">Welcome to your internal application.</p>
      
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-32 flex items-center justify-center text-slate-400">Stat 1</div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-32 flex items-center justify-center text-slate-400">Stat 2</div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-32 flex items-center justify-center text-slate-400">Stat 3</div>
      </div>
    </div>
  );
}