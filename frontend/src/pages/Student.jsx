import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ArrowLeft, CheckCircle, Smartphone, AlertCircle, MapPin, ChevronRight, User, KeyRound, Radio, Camera, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Student = () => {
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '');
  const [studentName, setStudentName] = useState(localStorage.getItem('studentName') || '');
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, IDENTIFYING, SUBMITTING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (studentId) localStorage.setItem('studentId', studentId);
    if (studentName) localStorage.setItem('studentName', studentName);
  }, [studentId, studentName]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    if (status === 'SCANNING') {
      const startCamera = async () => {
        try {
          scannerRef.current = new Html5Qrcode("reader");
          const config = { 
            fps: 20, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          await scannerRef.current.start(
            { facingMode: "environment" }, 
            config, 
            async (decodedText) => {
              try {
                const data = JSON.parse(decodedText);
                if (data.sessionId && data.token) {
                  setScannedData(data);
                  await stopScanner();
                  setStatus('IDENTIFYING');
                }
              } catch (e) {
                // Not our JSON, ignore or show hint
              }
            }
          );
        } catch (err) {
          console.error("Camera Start Error:", err);
          setErrorMessage("Failed to access back camera. Please ensure permissions are granted.");
          setStatus('ERROR');
        }
      };

      startCamera();
      return () => { stopScanner(); };
    }
  }, [status]);

  const submitAttendance = async () => {
    if (!studentId || !studentName) return;
    const { sessionId, token } = scannedData;
    
    setStatus('SUBMITTING');
    const getPosition = () => new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { 
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }));

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;
      
      await axios.post('/api/mark-attendance', {
        sessionId, token, studentId, studentName, location: { lat: latitude, lng: longitude }
      });
      
      setStatus('SUCCESS');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || "Connection Error");
      setStatus('ERROR');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-24 px-6 relative">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-cyan-400 mb-10 transition-all font-black text-[10px] uppercase tracking-[0.4em]">
        <ArrowLeft size={16} /> Base Dashboard
      </Link>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass overflow-hidden border-cyan-500/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-white/5 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="w-16 h-16 glass border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Radio size={28} className="text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">Unit Uplink</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Biometric Handshake Active v4.0</p>
        </div>

        <div className="p-10 md:p-14">
          <AnimatePresence mode="wait">
            {status === 'IDLE' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center mx-auto mb-10 shadow-inner">
                   <Camera size={40} className="text-cyan-500/30" />
                </div>
                <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest italic">Ready for Scanning</h2>
                <button onClick={() => setStatus('SCANNING')} className="btn-neon w-full justify-center">
                  INITIALIZE CAMERA <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {status === 'SCANNING' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[320px] rounded-[2.5rem] overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.1)] mb-10">
                  <div id="reader" className="w-full h-full object-cover"></div>
                  
                  {/* Scanner Overlay Animation */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10 animate-scan-line"></div>
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                  
                  {/* Target Corners */}
                  <div className="absolute top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-cyan-400 rounded-tl-lg"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-cyan-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-cyan-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-cyan-400 rounded-br-lg"></div>
                </div>
                
                <button onClick={() => setStatus('IDLE')} className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-red-500 transition-colors">
                  <RefreshCw size={14} /> Abort Procedure
                </button>
              </motion.div>
            )}

            {status === 'IDENTIFYING' && (
              <motion.div key="identifying" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="text-emerald-500" size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Verified</p>
                      <p className="text-white font-bold text-sm">Session Handshake Successful</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 ml-1">Verified Subject Name</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                      <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="input-field pl-14 font-bold" placeholder="E.G. LIAM JASON" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 ml-1">Identity Protocol ID</label>
                    <div className="relative group">
                      <KeyRound size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-blue-500 transition-colors" />
                      <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field pl-14 font-mono font-bold" placeholder="E.G. AUTH-001" />
                    </div>
                  </div>
                </div>
                
                <button onClick={submitAttendance} disabled={!studentId || !studentName} className="btn-neon w-full justify-center">
                  FINALIZE ATTENDANCE <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {status === 'SUBMITTING' && (
              <div key="submitting" className="py-24 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-10"></div>
                <p className="font-black text-white tracking-[0.3em] uppercase text-[10px]">Verifying Location Persistence...</p>
              </div>
            )}

            {status === 'SUCCESS' && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-5xl font-black text-white mb-4 italic tracking-tighter uppercase">Archived.</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-16 italic">Unit {studentName} successfully synchronized.</p>
                <button onClick={() => setStatus('IDLE')} className="btn-ghost w-full">Mark Another Unit</button>
              </motion.div>
            )}

            {status === 'ERROR' && (
              <motion.div key="error" className="text-center py-12">
                <AlertCircle size={60} className="text-red-500 mx-auto mb-10" />
                <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Access Denied.</h2>
                <p className="text-red-500/70 text-[10px] font-black uppercase mb-16 tracking-widest">{errorMessage}</p>
                <button onClick={() => setStatus('IDLE')} className="btn-ghost w-full text-red-500 border-red-500/10">Restart Protocol</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Student;
