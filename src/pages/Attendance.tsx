import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { 
  Check, 
  Users,
  Calendar,
  Search
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const { user, attendance, getClassAttendance } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'teacher') return null;

  const teacherClass = `${user.year} - ${user.section}`;
  const classAttendance = getClassAttendance(teacherClass, selectedDate);
  
  // Get all attendance records for this class (all dates) for stats
  const allClassAttendance = getClassAttendance(teacherClass);
  
  // Get unique dates
  const uniqueDates = [...new Set(allClassAttendance.map(r => r.date))].sort().reverse();

  // Filter by search
  const filteredAttendance = classAttendance.filter(r =>
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Class Attendance</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Attendance records for <strong>{teacherClass}</strong>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
            <Users className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Today's Count</p>
            <h3 className="text-2xl font-bold text-gray-900">{classAttendance.length}</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-purple-500 to-purple-600 shadow-lg shadow-purple-200">
            <Calendar className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Total Days</p>
            <h3 className="text-2xl font-bold text-gray-900">{uniqueDates.length}</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
            <Check className="text-white w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Total Records</p>
            <h3 className="text-2xl font-bold text-gray-900">{allClassAttendance.length}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex-1">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Calendar size={18} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Attendance List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Attendance for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
            {filteredAttendance.length} students
          </span>
        </div>

        {filteredAttendance.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredAttendance.map((record, idx) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                    {record.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{record.studentName}</p>
                    <p className="text-xs text-gray-400">{record.studentRollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
                  <Check size={14} />
                  <span className="text-xs font-bold">Present</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No attendance records for this date.</p>
            <p className="text-xs text-gray-300 mt-1">Scan student QR codes from the dashboard to mark attendance.</p>
          </div>
        )}
      </motion.div>

      {/* Recent dates quick access */}
      {uniqueDates.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Dates</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueDates.slice(0, 10).map((date) => {
              const count = allClassAttendance.filter(r => r.date === date).length;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    selectedDate === date
                      ? "bg-indigo-500 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
