import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/storage';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Trash2,
  Filter,
  Search
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks, subjects, addTask, updateTask, deleteTask } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Medium' as 'High' | 'Medium' | 'Low'
  });

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...newTask,
      completed: false
    });
    setShowAddModal(false);
    setNewTask({
      title: '',
      subjectId: subjects[0]?.id || '',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'Medium'
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Stay on top of your assignments and deadlines.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-4">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap",
                    filter === f ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 text-gray-400 border-t md:border-t-0 pt-2 md:pt-0">
              <Search size={18} />
              <input type="text" placeholder="Search tasks..." className="bg-transparent border-none outline-none text-sm w-full md:w-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, idx) => {
                const subject = subjects.find(s => s.id === task.subjectId);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "bg-white p-6 rounded-3xl border border-gray-100 transition-all group",
                      task.completed ? "opacity-60" : "hover:shadow-xl hover:shadow-gray-100"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${subject?.color}15`, color: subject?.color }}
                      >
                        {subject?.name}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        task.priority === 'High' ? 'bg-red-50 text-red-500' : 
                        task.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                      )}>
                        {task.priority}
                      </div>
                    </div>

                    <h3 className={cn("text-lg font-bold text-gray-900 mb-4", task.completed && "line-through")}>
                      {task.title}
                    </h3>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={14} />
                        <span className="text-xs font-medium">{task.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateTask(task.id, { completed: !task.completed })}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            task.completed ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                          )}
                        >
                          {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Task Progress</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <motion.circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={364}
                    initial={{ strokeDashoffset: 364 }}
                    animate={{ strokeDashoffset: 364 - (364 * progress) / 100 }}
                    className="text-indigo-600"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Done</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 rounded-2xl bg-gray-50">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total</p>
                  <p className="text-xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-gray-50">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{tasks.length - completedCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold text-orange-900">Deadline Alerts</h3>
            </div>
            <p className="text-sm text-orange-700 leading-relaxed">
              3 tasks are due in the next 48 hours. Focus on high priority items first!
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Assignment name..."
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.subjectId}
                    onChange={e => setNewTask({...newTask, subjectId: e.target.value})}
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.deadline}
                  onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
