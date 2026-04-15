import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Teacher from './pages/Teacher';
import Student from './pages/Student';
import Dashboard from './pages/Dashboard';
import { Shield, Fingerprint } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Enterprise Header */}
        <header className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50 backdrop-blur-md bg-white/80">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Shield size={20} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">SENTINEL<span className="text-blue-600">QR</span></span>
            </Link>

            <nav className="flex items-center gap-8">
              <Link to="/teacher" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Instructor</Link>
              <Link to="/student" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Student</Link>
              <div className="w-[1px] h-4 bg-slate-100 mx-2" />
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">ADM</div>
            </nav>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacher" element={<Teacher />} />
            <Route path="/student" element={<Student />} />
            <Route path="/dashboard/:sessionId" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Professional Footer */}
        <footer className="bg-white border-t border-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">&copy; 2026 Sentinel-QR Infrastructure</p>
            <div className="flex gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span className="hover:text-slate-600 cursor-pointer">Security Protocol</span>
              <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
              <span className="hover:text-slate-600 cursor-pointer">Audit Logs</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
