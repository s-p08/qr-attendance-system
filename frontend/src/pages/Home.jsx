import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, UserCheck, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-vh-80 pt-16 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-24 max-w-5xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-indigo-400 border border-white/10 text-[0.65rem] font-bold uppercase tracking-[0.25em] mb-12 shadow-inner">
          <ShieldCheck size={14} className="text-pink-500" />
          Secure Protocol 2.5 Active
        </div>
        <h1 className="text-7xl md:text-[9rem] font-black leading-[0.85] tracking-tighter mb-12 text-white">
          Smart Attendance.<br />
          <span className="text-gradient-blue italic">ATTENDANCE.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-xl font-medium leading-relaxed mb-6">
          Fast, secure, and paperless attendance using real-time location and QR codes.
        </p>
        <div className="flex items-center justify-center gap-8 text-slate-700 text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><Zap size={14} className="text-yellow-500" /> INSTANT SCAN</span>
          <span className="flex items-center gap-2"><Globe size={14} className="text-emerald-500" /> GEO-FENCED</span>
          <span className="flex items-center gap-2"><Sparkles size={14} className="text-pink-500" /> DASHBOARDS</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl w-full">
        <motion.div
          whileHover={{ y: -10, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="glass card-neon-blue p-12 flex flex-col items-start relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-indigo-500/10 transition-colors">
            <School size={160} />
          </div>
          <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 text-indigo-400 shadow-2xl">
            <School size={36} />
          </div>
          <h2 className="text-4xl font-black mb-6 tracking-tighter text-white">INSTRUCTOR PORTAL</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-sm"></p>
          <Link to="/teacher" className="btn-primary px-10 group-hover:shadow-indigo-500/30">Generate QR</Link>
        </motion.div>

        <motion.div
          whileHover={{ y: -10, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="glass card-neon-pink p-12 flex flex-col items-start relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-pink-500/10 transition-colors">
            <UserCheck size={160} />
          </div>
          <div className="w-20 h-20 bg-pink-500/20 rounded-3xl flex items-center justify-center mb-8 text-pink-400 shadow-2xl">
            <UserCheck size={36} />
          </div>
          <h2 className="text-4xl font-black mb-6 tracking-tighter text-white">STUDENT SCAN</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-sm">Mark Presence. Scan the QR code to verify your attendance instantly.</p>
          <Link to="/student" className="btn-primary bg-gradient-to-br from-pink-500 to-purple-600 px-10 group-hover:shadow-pink-500/30">Verify Presence</Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-40 text-center"
      >
        <span className="text-slate-800 text-[10vw] font-black select-none pointer-events-none tracking-tighter opacity-10 uppercase italic">
          Kuru-Kshetra
        </span>
      </motion.div>
    </div>
  );
};

export default Home;
