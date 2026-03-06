import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { InsightCard } from '../components/InsightCard';
import { cn } from '../utils/storage';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { attendance, tasks, productivity, subjects, schedule } = useApp();

  // Calculate stats
  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0';
  
  const totalStudyMinutes = productivity.reduce((acc, curr) => acc + curr.duration, 0);
  const studyHours = (totalStudyMinutes / 60).toFixed(1);
  
  const pendingTasks = tasks.filter(t => !t.completed).length;
  
  const weeklyProductivity = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 3 },
    { day: 'Thu', hours: 7 },
    { day: 'Fri', hours: 5 },
    { day: 'Sat', hours: 2 },
    { day: 'Sun', hours: 4 },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = schedule.filter(s => s.day === today);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Academic Overview</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Track your progress and stay ahead of your schedule.</p>
        </div>
        <button 
          onClick={() => setActiveTab('schedule')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          View Full Schedule <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Attendance" value={`${attendancePercentage}%`} icon={Users} color="blue" delay={0.1} />
        <StatCard title="Study Hours" value={`${studyHours}h`} icon={Clock} color="purple" delay={0.2} />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={CheckSquare} color="pink" delay={0.3} />
        <StatCard title="Productivity" value="High" icon={TrendingUp} color="orange" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Weekly Study Trends</h2>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProductivity}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Smart Insights</h2>
          <InsightCard />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Classes</h2>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{today}</span>
          </div>
          <div className="space-y-4">
            {todaysClasses.length > 0 ? todaysClasses.map((cls, idx) => {
              const subject = subjects.find(s => s.id === cls.subjectId);
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: subject?.color }}>
                    {subject?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{subject?.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">{cls.startTime} - {cls.endTime} • {cls.room}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <Calendar size={18} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10">
                <p className="text-gray-400 italic">No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Assignments</h2>
          <div className="space-y-4">
            {tasks.filter(t => !t.completed).slice(0, 3).map((task, idx) => {
              const subject = subjects.find(s => s.id === task.subjectId);
              return (
                <div key={idx} className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: subject?.color }}>{subject?.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      task.priority === 'High' ? 'bg-red-50 text-red-500' : 
                      task.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Deadline: {task.deadline}</p>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Mark Done</button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
