import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Trash2, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Star,
  Info
} from 'lucide-react';

export const Schedule: React.FC = () => {
  const { subjects, schedule, addSchedule, deleteSchedule } = useApp();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }) || 'Monday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newClass, setNewClass] = useState({
    subjectId: '',
    startTime: '',
    endTime: '',
    room: '',
    day: activeDay
  });

  const getClassesForDay = (day: string) => {
    return schedule.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.subjectId || !newClass.startTime || !newClass.endTime || !newClass.room) return;
    
    addSchedule({
      ...newClass,
      day: activeDay
    });
    
    setIsModalOpen(false);
    setNewClass({
      subjectId: '',
      startTime: '',
      endTime: '',
      room: '',
      day: activeDay
    });
  };

  const academicEvents = [
    { date: 'Mar 15', title: 'Mid-Term Examinations', type: 'Exam' },
    { date: 'Mar 22', title: 'Spring Break Starts', type: 'Holiday' },
    { date: 'Apr 05', title: 'Project Submission Deadline', type: 'Academic' },
    { date: 'Apr 12', title: 'Guest Lecture: AI in Education', type: 'Event' },
    { date: 'May 01', title: 'Labor Day', type: 'Holiday' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Class Timetable</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your weekly academic schedule efficiently.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Class
        </button>
      </div>

      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={cn(
              "flex-1 min-w-[100px] py-3 rounded-xl text-sm font-bold transition-all",
              activeDay === day 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {getClassesForDay(activeDay).length > 0 ? getClassesForDay(activeDay).map((cls, idx) => {
            const subject = subjects.find(s => s.id === cls.subjectId);
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-8 hover:shadow-xl hover:shadow-gray-100 transition-all group"
              >
                <div className="flex flex-col items-center justify-center min-w-[100px] py-2 border-r border-gray-100">
                  <span className="text-lg font-bold text-gray-900">{cls.startTime}</span>
                  <span className="text-xs text-gray-400 font-medium">to</span>
                  <span className="text-sm font-semibold text-gray-500">{cls.endTime}</span>
                </div>

                <div className="flex-1 flex items-center gap-6">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: subject?.color }}
                  >
                    {subject?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{subject?.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin size={14} />
                        <span className="text-xs font-medium">{cls.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={14} />
                        <span className="text-xs font-medium">1.5 Hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteSchedule(cls.id)}
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          }) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="text-gray-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Classes Today</h3>
              <p className="text-gray-400 max-w-xs mt-2">Enjoy your free time or add a new class to your schedule.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <h3 className="text-xl font-bold mb-2">Weekly Summary</h3>
            <p className="text-indigo-100 text-sm mb-6">You have {schedule.length} classes scheduled for this week.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Completed</span>
                <span className="font-bold">12 / {schedule.length}</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[66%]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" />
              Academic Calendar
            </h3>
            <div className="space-y-4">
              {academicEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                  <div className="flex flex-col items-center justify-center min-w-[45px] p-1.5 bg-indigo-50 rounded-xl group-hover:bg-white transition-colors">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{event.date.split(' ')[0]}</span>
                    <span className="text-lg font-black text-gray-900 leading-none">{event.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                      event.type === 'Exam' ? 'bg-red-50 text-red-500' : 
                      event.type === 'Holiday' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                    )}>
                      {event.type}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">{event.title}</h4>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Event
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Subject Colors</h3>
            <div className="space-y-3">
              {subjects.map(sub => (
                <div key={sub.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                  <span className="text-sm font-medium text-gray-600">{sub.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Removed old Academic Calendar section from bottom */}

      {/* Add Class Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Class</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleAddClass} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                    <select 
                      required
                      value={newClass.subjectId}
                      onChange={(e) => setNewClass({...newClass, subjectId: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Start Time</label>
                      <input 
                        required
                        type="time"
                        value={newClass.startTime}
                        onChange={(e) => setNewClass({...newClass, startTime: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">End Time</label>
                      <input 
                        required
                        type="time"
                        value={newClass.endTime}
                        onChange={(e) => setNewClass({...newClass, endTime: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Room / Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Room 101, Lab 2"
                        value={newClass.room}
                        onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                      Add to Schedule
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
