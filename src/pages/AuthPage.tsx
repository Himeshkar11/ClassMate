import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, GraduationCap, BookOpen, Shield } from 'lucide-react';

type AuthRole = 'student' | 'teacher';
type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [authRole, setAuthRole] = useState<AuthRole>('student');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { loginStudent, loginTeacher, registerStudent, registerTeacher } = useApp();

  // Student form data
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    section: '',
    email: '',
  });

  // Teacher form data
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: '',
    section: '',
  });

  const [error, setError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      const success = loginStudent(studentForm.rollNumber);
      if (!success) setError('Roll number not found. Please register first.');
    } else {
      if (!studentForm.name || !studentForm.rollNumber || !studentForm.department || !studentForm.year || !studentForm.section || !studentForm.email) {
        setError('All fields are required.');
        return;
      }
      registerStudent({
        ...studentForm,
        role: 'student',
      });
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!teacherForm.email || !teacherForm.password) {
        setError('Email and password are required.');
        return;
      }
      if (!teacherForm.email.endsWith('@class.edu')) {
        setError('Teacher email must end with @class.edu');
        return;
      }
      const success = loginTeacher(teacherForm.email, teacherForm.password);
      if (!success) setError('Invalid email or password.');
    } else {
      if (!teacherForm.name || !teacherForm.email || !teacherForm.password || !teacherForm.department || !teacherForm.year || !teacherForm.section) {
        setError('All fields are required.');
        return;
      }
      if (!teacherForm.email.endsWith('@class.edu')) {
        setError('Teacher email must end with @class.edu');
        return;
      }
      if (teacherForm.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      registerTeacher({
        name: teacherForm.name,
        email: teacherForm.email,
        password: teacherForm.password,
        department: teacherForm.department,
        year: teacherForm.year,
        section: teacherForm.section,
        rollNumber: '',
        role: 'teacher',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="text-white w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Classmate AI
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Your Smart Academic Companion</p>
        </div>

        {/* Role Toggle: Student / Teacher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button 
            onClick={() => { setAuthRole('student'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authRole === 'student' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen size={16} />
            Student
          </button>
          <button 
            onClick={() => { setAuthRole('teacher'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authRole === 'teacher' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Shield size={16} />
            Teacher
          </button>
        </div>

        {/* Login / Register Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'register' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Register
          </button>
        </div>

        {/* STUDENT FORM */}
        {authRole === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {authMode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Rahul Sharma"
                  value={studentForm.name}
                  onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="CS2021001"
                value={studentForm.rollNumber}
                onChange={e => setStudentForm({...studentForm, rollNumber: e.target.value})}
              />
            </div>

            {authMode === 'register' && (
              <>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="CSE"
                      value={studentForm.department}
                      onChange={e => setStudentForm({...studentForm, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="1st Year"
                      value={studentForm.year}
                      onChange={e => setStudentForm({...studentForm, year: e.target.value})}
                    />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Section 3"
                      value={studentForm.section}
                      onChange={e => setStudentForm({...studentForm, section: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="rahul@example.com"
                      value={studentForm.email}
                      onChange={e => setStudentForm({...studentForm, email: e.target.value})}
                    />
                  </div>
                </motion.div>
              </>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {authMode === 'login' ? 'Sign In as Student' : 'Create Student Account'}
            </button>
          </form>
        )}

        {/* TEACHER FORM */}
        {authRole === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            {authMode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Dr. Smith"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({...teacherForm, name: e.target.value})}
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="teacher@class.edu"
                value={teacherForm.email}
                onChange={e => setTeacherForm({...teacherForm, email: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1">Must end with @class.edu</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
                value={teacherForm.password}
                onChange={e => setTeacherForm({...teacherForm, password: e.target.value})}
              />
            </div>

            {authMode === 'register' && (
              <>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Computer Science"
                    value={teacherForm.department}
                    onChange={e => setTeacherForm({...teacherForm, department: e.target.value})}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Year</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="1st Year"
                      value={teacherForm.year}
                      onChange={e => setTeacherForm({...teacherForm, year: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      placeholder="Section 3"
                      value={teacherForm.section}
                      onChange={e => setTeacherForm({...teacherForm, section: e.target.value})}
                    />
                  </div>
                </motion.div>
              </>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {authMode === 'login' ? 'Sign In as Teacher' : 'Create Teacher Account'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
