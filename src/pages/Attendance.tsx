import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  ScanLine, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  RefreshCw,
  Camera,
  CameraOff,
  BarChart3
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer, 
  Tooltip,
  Cell
} from 'recharts';

type TabType = 'generate' | 'scan' | 'stats';

export const Attendance: React.FC = () => {
  const { user, subjects, attendance, addAttendance, createQRSession, validateQRToken } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [qrValue, setQrValue] = useState('');
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Countdown timer for QR expiry
  useEffect(() => {
    if (!qrExpiry) return;
    const interval = setInterval(() => {
      const remaining = qrExpiry - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Expired');
        setQrValue('');
        setQrExpiry(null);
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [qrExpiry]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const handleGenerateQR = () => {
    const session = createQRSession(selectedSubject, expiryMinutes);
    const qrData = JSON.stringify({
      token: session.token,
      subjectId: session.subjectId,
      date: session.date,
    });
    setQrValue(qrData);
    setQrExpiry(session.expiresAt);
    setScanResult(null);
  };

  const handleScanSuccess = useCallback((decodedText: string) => {
    try {
      const data = JSON.parse(decodedText) as { token: string; subjectId: string; date: string };
      const session = validateQRToken(data.token);
      if (session) {
        const alreadyMarked = attendance.some(
          r => r.subjectId === session.subjectId && r.date === session.date && r.status === 'present'
        );
        if (alreadyMarked) {
          setScanResult({ success: false, message: 'Attendance already marked for this session!' });
        } else {
          addAttendance({
            id: Math.random().toString(36).substr(2, 9),
            subjectId: session.subjectId,
            date: session.date,
            status: 'present',
          });
          const subjectName = subjects.find(s => s.id === session.subjectId)?.name || 'Unknown';
          setScanResult({ success: true, message: `Attendance marked for ${subjectName} on ${session.date}!` });
        }
      } else {
        setScanResult({ success: false, message: 'Invalid or expired QR code.' });
      }
    } catch {
      setScanResult({ success: false, message: 'Invalid QR code format.' });
    }

    // Stop scanner after a successful read
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  }, [validateQRToken, attendance, addAttendance, subjects]);

  const startScanner = async () => {
    setScanResult(null);
    if (!scannerContainerRef.current) return;

    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    } catch {
      // ignore cleanup errors
    }

    const scannerId = 'qr-scanner-element';
    // Ensure the container has the element
    if (!document.getElementById(scannerId)) {
      const div = document.createElement('div');
      div.id = scannerId;
      scannerContainerRef.current.innerHTML = '';
      scannerContainerRef.current.appendChild(div);
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => {} // ignore scan failures (no QR found yet)
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setScanResult({ success: false, message: 'Could not access camera. Please allow camera permissions or try entering the code manually.' });
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      setIsScanning(false);
    }
  };

  const [manualCode, setManualCode] = useState('');
  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
    setManualCode('');
  };

  const getAttendanceStats = (subjectId: string) => {
    const records = attendance.filter(r => r.subjectId === subjectId);
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const total = records.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, total, percentage };
  };

  const overallStats = subjects.map(sub => {
    const stats = getAttendanceStats(sub.id);
    return {
      name: sub.name,
      percentage: parseFloat(stats.percentage.toFixed(1)),
      color: sub.color
    };
  });

  const allTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'generate', label: 'Generate QR', icon: <QrCode size={16} /> },
    { id: 'scan', label: 'Scan QR', icon: <ScanLine size={16} /> },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.id === 'stats') return true;
    if (tab.id === 'generate') return user?.role === 'teacher';
    if (tab.id === 'scan') return user?.role === 'student';
    return false;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">QR code-based attendance. Generate or scan to mark presence.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setScanResult(null);
              if (tab.id !== 'scan' && isScanning) {
                stopScanner();
              }
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeTab === tab.id 
                ? "bg-indigo-500 text-white shadow-md" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* GENERATE QR TAB */}
        {activeTab === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <QrCode size={22} className="text-indigo-500" />
                Generate Attendance QR
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Duration</label>
                  <div className="flex gap-2">
                    {[2, 5, 10, 15].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setExpiryMinutes(mins)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                          expiryMinutes === mins 
                            ? "bg-indigo-500 text-white shadow-md" 
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateQR}
                  className="w-full py-3.5 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Generate QR Code
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              {qrValue ? (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 inline-block">
                    <QRCodeSVG 
                      value={qrValue} 
                      size={220} 
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#1e1b4b"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {subjects.find(s => s.id === selectedSubject)?.name}
                    </p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
                      timeLeft === 'Expired' 
                        ? "bg-red-50 text-red-600" 
                        : "bg-emerald-50 text-emerald-600"
                    )}>
                      <Clock size={12} />
                      {timeLeft === 'Expired' ? 'Expired' : `Expires in ${timeLeft}`}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Show this QR to students to mark attendance</p>
                </div>
              ) : (
                <div className="text-center space-y-3 text-gray-400">
                  <QrCode size={64} strokeWidth={1} />
                  <p className="text-sm font-medium">Select a subject and generate a QR code</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SCAN QR TAB */}
        {activeTab === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ScanLine size={22} className="text-indigo-500" />
                Scan QR Code
              </h2>
              
              <div className="space-y-4">
                <div 
                  ref={scannerContainerRef}
                  className="w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-gray-900 relative"
                >
                  {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Camera size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">Camera preview</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isScanning ? (
                    <button
                      onClick={startScanner}
                      className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera size={16} />
                      Start Scanning
                    </button>
                  ) : (
                    <button
                      onClick={stopScanner}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CameraOff size={16} />
                      Stop Scanning
                    </button>
                  )}
                </div>

                {/* Manual code entry */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-3">Or paste the QR data manually:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder='Paste QR data here...'
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleManualSubmit(); }}
                    />
                    <button
                      onClick={handleManualSubmit}
                      className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
              {scanResult ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                    scanResult.success ? "bg-emerald-100" : "bg-red-100"
                  )}>
                    {scanResult.success ? (
                      <Check size={36} className="text-emerald-600" />
                    ) : (
                      <X size={36} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-bold",
                      scanResult.success ? "text-emerald-600" : "text-red-600"
                    )}>
                      {scanResult.success ? 'Attendance Marked!' : 'Scan Failed'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{scanResult.message}</p>
                  </div>
                  <button
                    onClick={() => { setScanResult(null); }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all"
                  >
                    Scan Again
                  </button>
                </motion.div>
              ) : (
                <div className="text-center space-y-3 text-gray-400">
                  <ScanLine size={64} strokeWidth={1} />
                  <p className="text-sm font-medium">Scan a QR code to mark your attendance</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Attendance</h2>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overallStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} unit="%" />
                      <Tooltip 
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                        {overallStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <QrCode size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Generate QR</span>
                      <span className="text-xs text-indigo-400">Create QR for a class</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <ScanLine size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">Scan QR</span>
                      <span className="text-xs text-emerald-400">Mark your attendance</span>
                    </div>
                  </button>
                </div>

                {/* Overall attendance summary */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Overall Attendance</h3>
                  {(() => {
                    const totalPresent = attendance.filter(r => r.status === 'present').length;
                    const totalRecords = attendance.length;
                    const overallPct = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Average</span>
                          <span className={cn(
                            "font-bold px-2 py-0.5 rounded-full text-xs",
                            overallPct >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                            {overallPct.toFixed(1)}%
                          </span>
                        </div>
                        {overallPct < 75 && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 text-orange-600 text-xs font-medium">
                            <AlertCircle size={14} className="mt-0.5" />
                            <span>Warning: Attendance is below 75%!</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Subject Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((sub, idx) => {
                const stats = getAttendanceStats(sub.id);
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: sub.color }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Total Classes</p>
                        <p className="text-sm font-bold text-gray-900">{stats.total}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-4">{sub.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Progress</span>
                        <span className={stats.percentage >= 75 ? "text-emerald-500" : "text-red-500"}>{stats.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.percentage}%` }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider pt-2">
                        <span className="text-emerald-500">{stats.present} Present</span>
                        <span className="text-red-500">{stats.absent} Absent</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
