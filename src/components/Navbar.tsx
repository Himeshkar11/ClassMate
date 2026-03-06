import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, AlertCircle, CheckCircle2, Clock, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/storage';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, tasks, attendance, subjects } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifications = () => {
    const notifications = [];
    
    // Low attendance warnings
    subjects.forEach(sub => {
      const records = attendance.filter(r => r.subjectId === sub.id);
      if (records.length > 0) {
        const present = records.filter(r => r.status === 'present').length;
        const percentage = (present / records.length) * 100;
        if (percentage < 75) {
          notifications.push({
            id: `att-${sub.id}`,
            title: 'Attendance Warning',
            message: `${sub.name} attendance is ${percentage.toFixed(0)}%`,
            icon: AlertCircle,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
          });
        }
      }
    });

    // Pending tasks
    const pendingTasks = tasks.filter(t => !t.completed);
    pendingTasks.slice(0, 3).forEach(task => {
      notifications.push({
        id: `task-${task.id}`,
        title: 'Pending Task',
        message: `${task.title} is due on ${task.deadline}`,
        icon: Clock,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      });
    });

    return notifications;
  };

  const notifications = getNotifications();

  return (
    <div className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-2xl w-64 lg:w-96">
          <Search className="text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search assignments..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-2 rounded-xl transition-all duration-300",
              showNotifications ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50"
            )}
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.bg, n.color)}>
                          <n.icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-400">All caught up!</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <button className="w-full py-4 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50/50">
                    Clear All Notifications
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3 md:pl-6 md:border-l border-gray-100">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">Welcome, {user?.name.split(' ')[0]} 👋</p>
            <p className="text-xs text-gray-400 font-medium">
              {user?.role === 'teacher' ? user?.email : user?.rollNumber}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
};
