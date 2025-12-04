import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4"><Logo /></Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              Empowering service professionals with autonomous AI agents that handle the busy work, so you can focus on the real work.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-teal-600 transition-colors"><Github size={20} /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-600 transition-colors">Agents</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Docs</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Careers</a> <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full ml-1 font-bold">Hiring</span></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} ServiceFlow Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Systems Operational</a>
          </div>
        </div>
      </div>
    </footer>
  );
}