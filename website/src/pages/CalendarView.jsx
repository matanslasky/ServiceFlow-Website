import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // This imports the default calendar styles
import { ArrowLeft, Clock, Zap, LogOut } from 'lucide-react';
import Logo from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CalendarView() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        // Fetch clients that actually have a date set
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, next_follow_up')
          .not('next_follow_up', 'is', null);

        if (error) throw error;
        if (data) setFollowUps(data);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowUps();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // This function puts a dot on days with tasks
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      // Check if this calendar day matches any client follow-up date
      const dayHasEvent = followUps.some(client => {
        if (!client.next_follow_up) return false;
        const clientDate = new Date(client.next_follow_up);
        return clientDate.toDateString() === date.toDateString();
      });

      if (dayHasEvent) {
        return <div className="bg-teal-500 w-2 h-2 rounded-full mx-auto mt-1"></div>;
      }
    }
    return null;
  };

  // Filter tasks for the list on the right
  const tasksForSelectedDate = followUps.filter(client => {
    if (!client.next_follow_up) return false;
    const clientDate = new Date(client.next_follow_up);
    return clientDate.toDateString() === calendarDate.toDateString();
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 text-sm font-bold flex items-center gap-2 transition-colors">
            <LogOut size={18} /> <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          Smart Scheduler <Zap className="text-amber-400 fill-amber-400" size={24} />
        </h1>
        <p className="text-slate-500 mb-8">View and manage upcoming client follow-ups.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Component */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading Calendar...</div>
            ) : (
              <div className="custom-calendar-wrapper">
                <Calendar
                  onChange={setCalendarDate}
                  value={calendarDate}
                  tileContent={tileContent}
                  className="w-full border-none rounded-xl"
                />
              </div>
            )}
            {/* Custom CSS for the Calendar */}
            <style>{`
              .react-calendar { width: 100%; border: none; font-family: inherit; }
              .react-calendar__tile { height: 80px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding-top: 10px; }
              .react-calendar__tile--active { background: #0d9488 !important; color: white !important; border-radius: 8px; }
              .react-calendar__tile--now { background: #e2e8f0; border-radius: 8px; color: black; }
              .react-calendar__tile:hover { background: #f0f9ff; border-radius: 8px; }
            `}</style>
          </div>
          
          {/* Task List Sidebar */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 h-fit">
            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Tasks: {calendarDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>

            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p>No tasks scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksForSelectedDate.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => navigate(`/client/${task.id}`)}
                    className="bg-white p-4 rounded-xl border border-teal-100 hover:border-teal-400 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-teal-700">{task.name}</span>
                    <Clock size={16} className="text-teal-400 group-hover:text-teal-600" />
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
            >
              Add New Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}