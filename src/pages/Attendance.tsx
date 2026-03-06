import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { 
  Plus, 
  Check, 
  X, 
  TrendingUp, 
  PieChart as PieChartIcon,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const Attendance: React.FC = () => {
  const { subjects, attendance, addAttendance } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  const getAttendanceStats = (subjectId: string) => {
    const records = attendance.filter(r => r.subjectId === subjectId);
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const total = records.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, total, percentage };
  };

  const handleMark = (status: 'present' | 'absent') => {
    addAttendance({
      id: Math.random().toString(36).substr(2, 9),
      subjectId: selectedSubject,
      date: new Date().toISOString().split('T')[0],
      status
    });
  };

  const overallStats = subjects.map(sub => {
    const stats = getAttendanceStats(sub.id);
    return {
      name: sub.name,
      percentage: parseFloat(stats.percentage.toFixed(1)),
      color: sub.color
    };
  });

  const currentStats = getAttendanceStats(selectedSubject);
  const pieData = [
    { name: 'Present', value: currentStats.present, color: '#10b981' },
    { name: 'Absent', value: currentStats.absent, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Keep your attendance above 75% to stay eligible.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
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
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mark Attendance</h2>
          <div className="space-y-6">
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

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleMark('present')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Check size={20} />
                </div>
                <span className="text-sm font-bold">Present</span>
              </button>
              <button 
                onClick={() => handleMark('absent')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <X size={20} />
                </div>
                <span className="text-sm font-bold">Absent</span>
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Current Status</span>
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  currentStats.percentage >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {currentStats.percentage.toFixed(1)}%
                </span>
              </div>
              {currentStats.percentage < 75 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 text-orange-600 text-xs font-medium">
                  <AlertCircle size={14} className="mt-0.5" />
                  <span>Warning: Attendance is below 75%. Attend more classes!</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

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
    </div>
  );
};
