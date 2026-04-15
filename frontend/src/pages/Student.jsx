import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ArrowLeft, CheckCircle, Smartphone, AlertCircle, MapPin, ChevronRight, User, KeyRound, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const Student = () => {
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '');
  const [studentName, setStudentName] = useState(localStorage.getItem('studentName') || '');
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, SUBMITTING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (studentId) localStorage.setItem('studentId', studentId);
    if (studentName) localStorage.setItem('studentName', studentName);
  }, [studentId, studentName]);

  const startScanning = () => {
    if (!studentId.trim() || !studentName.trim()) return;
    setStatus('SCANNING');
  };

  useEffect(() => {
    if (status === 'SCANNING') {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 20, 
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      });
      scanner.render(async (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.sessionId && data.token) {
            await scanner.clear();
            submitAttendance(data.sessionId, data.token);
          } else {
            setErrorMessage("INCOMPATIBLE_DATA_SIGNATURE");
            setStatus('ERROR');
            scanner.clear().catch(() => {});
          }
        } catch (e) {
          setErrorMessage("INVALID_FORMAT: NOT_A_SECURE_TOKEN");
          setStatus('ERROR');
          scanner.clear().catch(() => {});
        }
      }, (error) => {
        // Only log specific errors to avoid console spam
        if (error?.includes("NotFoundException")) return; 
        console.warn("QR_HINT:", error);
      });
      return () => { scanner.clear().catch(e => {}); };
    }
  }, [status]);

  const submitAttendance = async (sessionId, token) => {
    setStatus('SUBMITTING');
    // Increased timeout to 15 seconds for slower GPS
    const getPosition = () => new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { 
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }));

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;
      
      const response = await axios.post('/api/mark-attendance', {
        sessionId, token, studentId, studentName, location: { lat: latitude, lng: longitude }
      });
      
      setStatus('SUCCESS');
    } catch (err) {
      console.error("Submission Error:", err);
      // Show the EXACT error from the server if possible
      const msg = err.response?.data?.error || err.message || "Unknown Connection Error";
      setErrorMessage(msg);
      setStatus('ERROR');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-24 px-6 relative">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-400 mb-10 transition-all font-black text-[10px] uppercase tracking-[0.4em]">
        <ArrowLeft size={16} /> Base Dashboard
      </Link>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass overflow-hidden border-cyan-500/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
        <div className="bg-slate-900 border-b border-white/5 p-10 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
           <div className="w-16 h-16 glass border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Radio size={28} className="text-cyan-400 animate-pulse" />
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic italic leading-none mb-2">Unit Uplink</h1>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Biometric Handshake Active v2.0</p>
        </div>

        <div className="p-10 md:p-14">
          <AnimatePresence mode="wait">
            {status === 'IDLE' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 ml-1 italic">Verified Subject Name</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                      <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="input-field pl-14 font-bold" placeholder="E.G. LIAM JASON" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 ml-1 italic">Identity Protocol ID</label>
                    <div className="relative group">
                      <KeyRound size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-blue-500 transition-colors" />
                      <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field pl-14 font-mono font-bold" placeholder="E.G. AUTH-001" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={startScanning} 
                  disabled={!studentId || !studentName}
                  className="btn-neon w-full justify-center disabled:opacity-30 disabled:grayscale"
                >
                  INITIALIZE CAMERA SUITE <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {status === 'SCANNING' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div id="reader" className="w-full rounded-[2rem] overflow-hidden border border-cyan-500/20 shadow-[0_0_80px_rgba(34,211,238,0.1)] mb-10"></div>
                <button onClick={() => setStatus('IDLE')} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-red-500 transition-colors">Abort Procedure [ESC]</button>
              </motion.div>
            )}

            {status === 'SUBMITTING' && (
              <div className="py-24 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_30px_rgba(34,211,238,0.3)]"></div>
                <p className="font-extrabold text-white tracking-[0.2em] uppercase text-sm">SYNCHRONIZING LOCATION...</p>
                <div className="flex gap-1 mt-4">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-cyan-500/30 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                </div>
              </div>
            )}

            {status === 'SUCCESS' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(16,185,129,0.2)] animate-neon">
                  <CheckCircle size={48} fill="currentColor" className="text-emerald-500/5" />
                </div>
                <h2 className="text-5xl font-black text-white mb-4 italic tracking-tighter">APPROVED.</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-16 leading-relaxed">Attendance for <span className="text-cyan-400 underline underline-offset-4 decoration-2">{studentName}</span> has been archived in the secure ledger.</p>
                <button onClick={() => setStatus('IDLE')} className="btn-ghost w-full">Mark Another Protocol</button>
              </motion.div>
            )}

            {status === 'ERROR' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-10">
                  <AlertCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">ACCESS DENIED.</h2>
                <p className="text-red-500/70 text-[10px] font-black uppercase mb-16 tracking-[0.2em] leading-relaxed max-w-[250px] mx-auto">{errorMessage}</p>
                <button onClick={() => setStatus('IDLE')} className="btn-ghost w-full border-red-500/10 text-red-500 hover:bg-red-500/5">Restart Sequence</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Student;
