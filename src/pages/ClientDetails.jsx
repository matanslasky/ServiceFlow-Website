import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, User, Calendar, Send, Trash2, LogOut } from 'lucide-react';
import Logo from '../components/Logo'; // Central Logo

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientData } = await supabase.from('clients').select('*').eq('id', id).single();
      setClient(clientData);
      
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      setNotes(notesData || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote) return;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ content: newNote, client_id: id }])
      .select();

    if (!error && data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading details...</div>;
  if (!client) return <div className="h-screen flex items-center justify-center text-slate-500">Client not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Navbar (Matches Dashboard) */}
      <div className="bg-white border-b border-slate-200 border-t-4 border-t-teal-600 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>
        <button 
          onClick={handleLogout} 
          className="text-slate-500 hover:text-teal-600 text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 mb-8 font-bold transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Client Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-teal-500">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shadow-teal-500/20">
              {client.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{client.name}</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                {client.email}
              </p>
            </div>
          </div>
          <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${
              client.status === 'Active Client' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {client.status}
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Left: Add Note Form */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-teal-600" /> Add Note
              </h3>
              <form onSubmit={handleAddNote}>
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-40 bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Meeting notes, tasks, or reminders..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Send size={16} /> Save Note
                </button>
              </form>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <Calendar size={20} className="text-teal-600" /> Client History
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 font-medium italic">No history yet. Add your first note!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map(note => (
                  <div key={note.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative hover:border-teal-200">
                    <div className="absolute left-0 top-8 w-1 h-8 bg-teal-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                        title="Delete Note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}