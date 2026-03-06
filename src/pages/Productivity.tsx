import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Clock, 
  Flame,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const Productivity: React.FC = () => {
  const { subjects, productivity, addProductivity } = useApp();
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  React.useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    if (timer < 60) return; // Min 1 minute
    addProductivity({
      id: Math.random().toString(36).substr(2, 9),
      subjectId: selectedSubject,
      date: new Date().toISOString().split('T')[0],
      duration: Math.floor(timer / 60)
    });
    setTimer(0);
    setIsActive(false);
  };

  const subjectProductivity = subjects.map(sub => {
    const totalMins = productivity
      .filter(p => p.subjectId === sub.id)
      .reduce((acc, curr) => acc + curr.duration, 0);
    return {
      name: sub.name,
      hours: parseFloat((totalMins / 60).toFixed(1)),
      color: sub.color
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Productivity</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Focus on your goals and track your study time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
          <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4 sm:mb-8">Focus Timer</h3>
          
          <div className="relative mb-6 sm:mb-10">
            <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="120" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
              <motion.circle 
                cx="128" cy="128" r="120" stroke="#6366f1" strokeWidth="8" fill="transparent" 
                strokeDasharray={754}
                animate={{ strokeDashoffset: 754 - (754 * (timer % 3600)) / 3600 }}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 tabular-nums">
                {formatTime(timer)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Focusing</span>
            </div>
          </div>

          <div className="w-full space-y-6">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110",
                  isActive ? "bg-orange-500 shadow-orange-200" : "bg-indigo-600 shadow-indigo-200"
                )}
              >
                {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              <button 
                onClick={() => { setTimer(0); setIsActive(false); }}
                className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <RotateCcw size={28} />
              </button>
            </div>

            <button 
              onClick={handleSaveSession}
              disabled={timer < 60}
              className="w-full py-4 rounded-2xl font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Save Session
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                <Flame size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Study Streak</p>
                <h3 className="text-3xl font-black text-gray-900">12 Days</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                <Award size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Focus</p>
                <h3 className="text-3xl font-black text-gray-900">48.5h</h3>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-8">Subject-wise Study Time</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectProductivity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} unit="h" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 600}} width={120} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
                    {subjectProductivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
