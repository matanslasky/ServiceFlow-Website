import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Twitter, Linkedin, Github, X, Clock } from 'lucide-react'; // Added Clock

export default function Footer() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Effect to manage the fade-out time
  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Start fade out after 1.0s (was 2.5s)
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);

      // Fully clear state after 1.5s transition (was 3.0s)
      const clearTimer = setTimeout(() => {
        setNotification(null);
      }, 1500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [notification]);

  const showNotification = (msg) => {
    setNotification(msg);
  };

  const handleComingSoon = (e) => {
    e.preventDefault();
    showNotification("Feature Coming Soon");
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 relative">
      {/* Notification Toast - Enhanced Styling & Fade Effect */}
      {notification && (
        <div 
          // Reduced duration in useEffect (1.5s total time) makes the fade faster
          className={`fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <Clock size={16} className="text-teal-400" />
          <span className="text-sm font-medium">{notification}</span>
          <button onClick={() => { setIsVisible(false); setNotification(null); }} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4"><Logo /></Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              Empowering service professionals with autonomous AI agents that handle the busy work, so you can focus on the real work.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-teal-600 transition-colors"
              >
                <Twitter size={20} />
              </a>
              {/* UPDATED LINKEDIN URL */}
              <a 
                href="https://www.linkedin.com/in/matan-slasky-45ba5a23a/?originalSubdomain=il" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-teal-600 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://github.com/matanslasky" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-teal-600 transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Agents</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Integrations</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Pricing</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Changelog</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Docs</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">About Us</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Careers</a> <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full ml-1 font-bold">Hiring</span></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Blog</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Contact</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" onClick={handleComingSoon} className="hover:text-teal-600 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} ServiceFlow Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" onClick={handleComingSoon} className="hover:text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Systems Operational</a>
          </div>
        </div>
      </div>
    </footer>
  );
}