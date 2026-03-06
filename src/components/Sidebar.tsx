import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  ScanLine,
  QrCode,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { logout, user } = useApp();

  const teacherMenuItems = [
    { id: 'dashboard', label: 'QR Scanner', icon: ScanLine, color: 'text-blue-500' },
    { id: 'attendance', label: 'Class Attendance', icon: CalendarCheck, color: 'text-purple-500' },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Generate QR', icon: QrCode, color: 'text-blue-500' },
  ];

  const menuItems = user?.role === 'teacher' ? teacherMenuItems : studentMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Classmate AI
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === item.id ? item.color : "text-gray-400")} />
              <span className="font-medium">{item.label}</span>
              
              {activeTab === item.id && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
