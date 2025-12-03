import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, User, Calendar, Send, Trash2 } from 'lucide-react';

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
      // 1. Fetch Client Info
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      setClient(clientData);

      // 2. Fetch Notes
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
      setNotes([data[0], ...notes]); // Add to top of list
      setNewNote('');
    }
  };

  const handleDeleteNote = async (noteId) => {
    await supabase.from('notes').delete().eq('id', noteId);
    setNotes(notes.filter(n => n.id !== noteId));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading client details...</div>;
  if (!client) return <div className="p-8 text-center text-slate-500">Client not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Client Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-2xl font-bold uppercase">
                {client.name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
                <p className="text-slate-500">{client.email}</p>
              </div>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                client.status === 'Active Client' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {client.status}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left: Add Note Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={18} /> Add a Note
              </h3>
              <form onSubmit={handleAddNote}>
                <textarea 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-32 bg-slate-50"
                  placeholder="Had a call today. They are interested in..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
                  <Send size={16} /> Save Note
                </button>
              </form>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} /> History
            </h3>
            {notes.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 italic">No notes yet. Add one on the left!</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow">
                  <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
                    <span>
                      {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}