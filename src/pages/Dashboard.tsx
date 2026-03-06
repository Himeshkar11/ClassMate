import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { StudentQRData } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  ScanLine, 
  Check, 
  X, 
  Camera,
  CameraOff,
  Users,
  CalendarCheck
} from 'lucide-react';

// ─── Student Dashboard: Generate QR Code ───
const StudentDashboard: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  const qrData: StudentQRData = {
    rollNumber: user.rollNumber,
    name: user.name,
    department: user.department,
    year: user.year,
    section: user.section,
  };

  const qrValue = JSON.stringify(qrData);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your QR Code</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Show this QR code to your teacher to mark attendance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center"
        >
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 inline-block mb-6">
            <QRCodeSVG 
              value={qrValue} 
              size={240} 
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1e1b4b"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.rollNumber}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
              <CalendarCheck size={12} />
              {user.year} - {user.section}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Name', value: user.name },
              { label: 'Roll Number', value: user.rollNumber },
              { label: 'Department', value: user.department },
              { label: 'Year', value: user.year },
              { label: 'Section', value: user.section },
              { label: 'Email', value: user.email },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                <span className="text-sm font-medium text-gray-400">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">
              Show this QR code to your teacher when they scan for attendance. Your class is <strong>{user.year} - {user.section}</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── Teacher Dashboard: QR Scanner + Today's Attendance ───
const TeacherDashboard: React.FC = () => {
  const { user, attendance, markAttendanceFromQR } = useApp();
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const teacherClass = user ? `${user.year} - ${user.section}` : '';
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(r => r.className === teacherClass && r.date === today);

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

  const handleScanSuccess = useCallback((decodedText: string) => {
    try {
      const data = JSON.parse(decodedText) as StudentQRData;
      if (!data.rollNumber || !data.name || !data.year || !data.section) {
        setScanResult({ success: false, message: 'Invalid QR code format.' });
      } else {
        const result = markAttendanceFromQR(data);
        setScanResult(result);
      }
    } catch {
      setScanResult({ success: false, message: 'Invalid QR code format.' });
    }

    // Stop scanner after a read
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  }, [markAttendanceFromQR]);

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
        () => {}
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setScanResult({ success: false, message: 'Could not access camera. Please allow camera permissions.' });
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Scan student QR codes to mark attendance for <strong>{teacherClass}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ScanLine size={22} className="text-indigo-500" />
            Scan Student QR
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
        </motion.div>

        {/* Scan Result + Today's Attendance */}
        <div className="space-y-8">
          {/* Scan result feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px]"
          >
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
                  onClick={() => setScanResult(null)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all"
                >
                  Scan Again
                </button>
              </motion.div>
            ) : (
              <div className="text-center space-y-3 text-gray-400">
                <ScanLine size={64} strokeWidth={1} />
                <p className="text-sm font-medium">Scan a student's QR code to mark attendance</p>
              </div>
            )}
          </motion.div>

          {/* Today's attendance count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" />
                Today's Attendance
              </h3>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                {todayAttendance.length} students
              </span>
            </div>
            {todayAttendance.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {todayAttendance.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{record.studentName}</p>
                      <p className="text-xs text-gray-400">{record.studentRollNumber}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Check size={14} />
                      <span className="text-xs font-bold">Present</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No attendance marked yet today.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard: Routes by role ───
export const Dashboard: React.FC = () => {
  const { user } = useApp();

  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};
