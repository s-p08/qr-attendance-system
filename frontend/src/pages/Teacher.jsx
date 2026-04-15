import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, CheckCircle, Users, ArrowLeft, FileText, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const Teacher = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [title, setTitle] = useState("AI Fundamentals");
  const [error, setError] = useState(null);
  const [dynamicToken, setDynamicToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  const generateToken = (baseSecret) => {
    const windowIndex = Math.floor(Date.now() / 30000);
    const hash = CryptoJS.HmacSHA256(windowIndex.toString(), baseSecret);
    return hash.toString(CryptoJS.enc.Hex).slice(0, 16);
  };

  const createSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post('/api/create-session', { title });
      setSession(resp.data.session);
    } catch (err) {
      setError(err.response?.data?.error || "Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    const updateToken = () => {
      setDynamicToken(generateToken(session.token));
      setTimeLeft(Math.floor(30 - ((Date.now() / 1000) % 30)));
    };
    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchAttendance = async () => {
    if (!session?._id) return;
    try {
      const resp = await axios.get('/api/attendance/' + session._id);
      setAttendance(resp.data.records || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    let interval;
    if (session) {
      fetchAttendance();
      interval = setInterval(fetchAttendance, 10000);
    }
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-12 transition-all font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> Home Baseline
      </Link>

      {!session ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
          <Shield size={44} className="mx-auto mb-10 text-indigo-500" />
          <h2 className="text-5xl font-black mb-4 tracking-tighter text-white uppercase italic">Commander Mode.</h2>
          <div className="max-w-md mx-auto mb-10">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field text-center py-5" />
          </div>
          <button onClick={createSession} disabled={loading} className="btn-primary w-full max-w-sm py-5 uppercase font-black tracking-widest bg-gradient-to-r from-indigo-600 to-indigo-400">
            INITIALIZE PROTOCOL
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-4 glass p-10 flex flex-col items-center justify-center min-h-[500px] border-l-4 border-indigo-500">
            <Activity size={14} className="text-emerald-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-widest text-center">{session.title}</h2>
            {dynamicToken ? (
              <QRCodeSVG value={JSON.stringify({ sessionId: session._id, token: dynamicToken })} size={240} level="H" className="bg-white p-4 shadow-2xl mb-10" />
            ) : (
              <div className="w-[240px] h-[240px] bg-white/5 animate-pulse mb-10 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase text-slate-700">Generating Secure Key...</div>
            )}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div animate={{ width: `${(timeLeft / 30) * 100}%` }} className="h-full bg-indigo-500" transition={{ duration: 1, ease: 'linear' }} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic font-mono">Rotating Signature: {timeLeft}s</p>
          </div>

          <div className="xl:col-span-8 glass p-12 flex flex-col border-r-4 border-emerald-500">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h3 className="text-6xl font-black text-white tracking-tighter uppercase mb-2 italic">Presence.</h3>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-slate-600">Unit Verification Feed</span>
              </div>
              <div className="text-right">
                <p className="text-7xl font-black text-indigo-400 tabular-nums">{attendance.length}</p>
                <p className="text-[0.6rem] font-bold text-slate-700 uppercase tracking-widest">Active Units</p>
              </div>
            </div>

            <div className="flex-grow space-y-4 custom-scrollbar overflow-y-auto max-h-[400px]">
              <AnimatePresence>
                {attendance.map((entry) => (
                  <motion.div key={entry._id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400">{entry.studentName.charAt(0)}</div>
                      <div>
                        <p className="text-2xl font-black text-white leading-tight">{entry.studentName}</p>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{entry.studentId} • {new Date(entry.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <CheckCircle className="text-emerald-500" size={24} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Link to={`/dashboard/${session._id}`} className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 text-center text-[0.65rem] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              Audit Master Dashboard <ChevronRight size={14} className="inline ml-2" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
