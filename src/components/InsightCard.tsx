import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';

export const InsightCard: React.FC = () => {
  const { attendance, subjects, tasks } = useApp();

  const getInsights = () => {
    const insights = [];

    // Attendance Insights
    subjects.forEach(sub => {
      const records = attendance.filter(r => r.subjectId === sub.id);
      if (records.length > 0) {
        const present = records.filter(r => r.status === 'present').length;
        const percentage = (present / records.length) * 100;
        if (percentage < 75) {
          insights.push({
            type: 'warning',
            text: `Your attendance in ${sub.name} is ${percentage.toFixed(1)}%, which is below the 75% threshold.`,
            icon: AlertCircle,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
          });
        }
      }
    });

    // Task Insights
    const pendingTasks = tasks.filter(t => !t.completed).length;
    if (pendingTasks > 0) {
      insights.push({
        type: 'info',
        text: `You have ${pendingTasks} pending assignments. Better get started!`,
        icon: CheckCircle2,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      });
    }

    // Default positive insight
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        text: "You're doing great! All your attendance is on track and tasks are managed.",
        icon: Sparkles,
        color: 'text-purple-500',
        bg: 'bg-purple-50'
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn("p-4 rounded-2xl flex items-start gap-4 border border-transparent hover:border-gray-100 transition-all", insight.bg)}
        >
          <div className={cn("p-2 rounded-xl bg-white shadow-sm", insight.color)}>
            <insight.icon size={20} />
          </div>
          <p className="text-sm font-medium text-gray-700 leading-relaxed">
            {insight.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
