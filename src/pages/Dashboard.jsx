import React from 'react';
import { Users, DollarSign, TrendingUp, Activity, Bell, Search, Menu } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-xl text-slate-900 flex items-center gap-2">
          <div className="bg-teal-600 w-8 h-8 rounded-lg flex items-center justify-center text-white">S</div>
          ServiceFlow
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" 
            />
          </div>
          <Bell className="text-slate-500 hover:text-slate-700 cursor-pointer" size={20} />
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
            JD
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, John. Here is what's happening today.</p>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
            + New Client
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">1,234</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Revenue (Mo)</p>
              <p className="text-2xl font-bold text-slate-900">$12,450</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Growth</p>
              <p className="text-2xl font-bold text-slate-900">+15.3%</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-teal-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">New inquiry from Sarah M.</p>
                      <p className="text-xs text-slate-400">2 minutes ago</p>
                    </div>
                  </div>
                  <button className="text-xs text-teal-600 font-bold hover:underline">View</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-900 rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Pro Plan</h3>
              <p className="text-teal-200 text-sm mb-6">You are currently on the professional tier. Your next billing date is Dec 1st.</p>
            </div>
            <button className="bg-white text-teal-900 py-2 px-4 rounded-lg text-sm font-bold w-full hover:bg-teal-50 transition-colors">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}