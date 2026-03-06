import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/storage';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'blue' | 'purple' | 'pink' | 'orange' | 'cyan' | 'indigo';
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color, delay = 0 }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    purple: 'from-purple-500 to-purple-600 shadow-purple-200',
    pink: 'from-pink-500 to-pink-600 shadow-pink-200',
    orange: 'from-orange-500 to-orange-600 shadow-orange-200',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-200',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  };

  const bgMap = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    pink: 'bg-pink-50',
    orange: 'bg-orange-50',
    cyan: 'bg-cyan-50',
    indigo: 'bg-indigo-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr shadow-lg group-hover:scale-110 transition-transform duration-300", colorMap[color])}>
        <Icon className="text-white w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && <span className="text-xs font-bold text-emerald-500">{trend}</span>}
        </div>
      </div>
    </motion.div>
  );
};
