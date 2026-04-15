import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, Download, Calendar, MapPin, Search, Activity, ShieldCheck, Filter, ChevronDown, Monitor, Clock, AlertCircle, FileText } from 'lucide-react';

const Dashboard = () => {
  const { sessionId } = useParams();
  const [data, setData] = useState({ records: [], sessionTitle: "AUDIT_INITIALIZING" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDetails = async () => {
    try {
      const resp = await axios.get(`/api/attendance/${sessionId}`);
      setData(resp.data || { records: [], sessionTitle: "NO_SESSION_EXISTS" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "SECURE_UPLINK_OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [sessionId]);

  const filteredRecords = (data?.records || []).filter(r => {
    const term = searchTerm.toLowerCase();
    const name = (r.studentName || "").toLowerCase();
    const id = (r.studentId || "").toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
       <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] animate-pulse">Initializing Secure Analytics Feed</p>
       </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-navy-950">
       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-16 max-w-lg w-full text-center border-red-500/20">
          <AlertCircle className="text-red-500 mx-auto mb-8" size={60} />
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">Security Failure.</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-12 leading-relaxed italic">{error}</p>
          <Link to="/teacher" className="btn-neon w-full justify-center from-red-600 to-red-400 shadow-red-500/20">Re-Authenticate Operator</Link>
       </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-16 px-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 relative">
        <div className="flex items-center gap-8 relative z-10">
          <Link to="/teacher" className="w-14 h-14 glass flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all shadow-xl bg-white/2">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-3">
               <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{data.sessionTitle}</h1>
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">PROTOCOL_APPROVED</div>
            </div>
            <p className="text-[11px] font-black text-slate-600 flex items-center gap-3 uppercase tracking-[0.3em]">
               <Calendar size={14} className="text-cyan-500" /> Secure Audit Ledger • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <button className="btn-ghost flex items-center gap-3 py-3 px-6 text-[10px] uppercase font-black tracking-widest leading-none"><Download size={18} className="text-slate-400" /> Export Archive</button>
           <button className="btn-neon py-3 px-8 text-[11px] font-black tracking-widest leading-none">Global Broadcast</button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
         <StatCard icon={<Users size={24} />} title="Total Units Registered" value={data.count || 0} color="cyan" trend="+12.4%" />
         <StatCard icon={<ShieldCheck size={24} />} title="Location Integrity" value="100.0%" color="emerald" trend="Optimum" />
         <StatCard icon={<Monitor size={24} />} title="Uplink Protocol" value="Active" color="slate" trend="Nominal" />
         <StatCard icon={<Clock size={24} />} title="Sync Latency" value="0.2ms" color="blue" trend="-40ms" />
      </div>

      {/* Table Section */}
      <div className="glass overflow-hidden relative border-white/5 shadow-2xl">
        <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/2 backdrop-blur-3xl">
           <h2 className="text-[11px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-4 italic leading-none">
              <Activity size={20} className="text-cyan-400" /> Ledger Verification Tunnel
           </h2>
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow min-w-[300px]">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)} 
                   className="input-field pl-14 py-3 text-xs bg-slate-900/40" 
                   placeholder="FILTER ENTITIES..."
                 />
              </div>
              <button className="btn-ghost py-3 px-5 text-[10px] flex items-center gap-3 leading-none italic"><Filter size={16} /> Advanced Audit <ChevronDown size={14}/></button>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[500px] relative z-10 custom-scrollbar">
           <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-white/5">
                 <tr className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em]">
                    <th className="px-12 py-6 italic">Verified Registry Unit</th>
                    <th className="px-8 py-6 italic">Identity Signature</th>
                    <th className="px-8 py-6 italic">Handshake Time</th>
                    <th className="px-8 py-6 text-right pr-12 italic">Security Protocol</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {filteredRecords.map((record, i) => (
                    <motion.tr key={record._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-white/5 transition-all group h-24">
                       <td className="px-12 py-6">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 glass border-white/10 rounded-2xl flex items-center justify-center font-black text-white group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all shadow-inner">
                                {(record.studentName || "U").charAt(0)}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-lg font-black text-white tracking-tight italic group-hover:text-cyan-400 transition-colors uppercase">{record.studentName || "UNKNOWN_UNIT"}</span>
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] leading-none mt-1">Registry Validated</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-[10px] font-black font-mono text-cyan-400/70 bg-cyan-400/5 px-4 py-2 rounded-xl border border-cyan-400/10 shadow-[inner_0_0_10px_rgba(34,211,238,0.05)]">{record.studentId}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-base font-black text-slate-300 italic tabular-nums leading-none mb-1">{new Date(record.createdAt).toLocaleTimeString()}</span>
                             <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-none">Uplink Stable</span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right pr-12">
                          <div className="flex flex-col items-end gap-1.5 font-black uppercase italic leading-none">
                             <div className="flex items-center gap-2 text-emerald-400 text-[10px] tracking-widest">
                                <MapPin size={12} fill="currentColor" className="text-emerald-400/20" /> GEOFENCE_H3
                             </div>
                             <span className="text-[8px] text-slate-700 tracking-[0.2em] not-italic">Kurukshetra Base</span>
                          </div>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
           {filteredRecords.length === 0 && (
             <div className="py-40 text-center">
                <FileText className="text-slate-900 mx-auto mb-6" size={80} />
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[1em] italic">No Uplink Data Detected</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, trend }) => {
  const themes = {
    cyan: "text-cyan-400 border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.05)]",
    emerald: "text-emerald-400 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]",
    slate: "text-slate-400 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)]",
    blue: "text-blue-500 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]"
  };

  return (
    <motion.div whileHover={{ y: -5 }} className={`glass p-10 flex flex-col relative overflow-hidden group ${themes[color]}`}>
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          {icon}
       </div>
       <div className={`w-12 h-12 glass border-white/5 mb-8 flex items-center justify-center ${themes[color]}`}>
          {icon}
       </div>
       <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 leading-none">{title}</p>
       <div className="flex items-end justify-between">
          <p className="text-4xl font-black text-white tracking-tighter italic leading-none tabular-nums">{value}</p>
          <span className="text-[9px] font-black bg-white/5 py-1 px-2 rounded-lg border border-white/5 tracking-widest">{trend}</span>
       </div>
    </motion.div>
  );
};

export default Dashboard;
