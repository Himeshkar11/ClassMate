import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Zap,
  Calendar,
  Clock
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { subjects, attendance, tasks, productivity } = useApp();

  // Attendance Data
  const attendanceData = subjects.map(sub => {
    const records = attendance.filter(r => r.subjectId === sub.id);
    const present = records.filter(r => r.status === 'present').length;
    const percentage = records.length > 0 ? (present / records.length) * 100 : 0;
    return { name: sub.name, percentage: Math.round(percentage), color: sub.color };
  });

  // Task Completion Data
  const taskStats = [
    { name: 'Completed', value: tasks.filter(t => t.completed).length, color: '#10b981' },
    { name: 'Pending', value: tasks.filter(t => !t.completed).length, color: '#f59e0b' },
  ];

  // Weekly Productivity Data
  const weeklyData = [
    { day: 'Mon', study: 4, attendance: 90 },
    { day: 'Tue', study: 6, attendance: 100 },
    { day: 'Wed', study: 3, attendance: 80 },
    { day: 'Thu', study: 7, attendance: 95 },
    { day: 'Fri', study: 5, attendance: 85 },
    { day: 'Sat', study: 2, attendance: 0 },
    { day: 'Sun', study: 4, attendance: 0 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Deep dive into your academic performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Overall Rank</p>
          <h3 className="text-2xl font-black text-gray-900">Top 5%</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 mb-4">
            <Target size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Goal Progress</p>
          <h3 className="text-2xl font-black text-gray-900">82%</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 mb-4">
            <Award size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Badges Earned</p>
          <h3 className="text-2xl font-black text-gray-900">14</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
            <Zap size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Focus Score</p>
          <h3 className="text-2xl font-black text-gray-900">9.2/10</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-8">Attendance Analytics</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} unit="%" />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {attendanceData.map((entry, index) => (
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
          transition={{ delay: 0.1 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-8">Task Completion Rate</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-8">Weekly Performance Trends</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="study" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Study Hours" />
              <Line type="monotone" dataKey="attendance" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
