import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AttendanceRecord, StudentQRData } from '../types';
import { STORAGE_KEYS, loadData, saveData, clearAllData } from '../utils/storage';

interface AppContextType {
  user: User | null;
  attendance: AttendanceRecord[];
  loginStudent: (rollNumber: string) => boolean;
  loginTeacher: (email: string, password: string) => boolean;
  registerStudent: (user: User) => void;
  registerTeacher: (user: User) => void;
  logout: () => void;
  addAttendance: (record: AttendanceRecord) => void;
  getClassAttendance: (className: string, date?: string) => AttendanceRecord[];
  markAttendanceFromQR: (qrData: StudentQRData) => { success: boolean; message: string };
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadData<User | null>(STORAGE_KEYS.USER, null));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadData<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []));

  useEffect(() => { saveData(STORAGE_KEYS.USER, user); }, [user]);
  useEffect(() => { saveData(STORAGE_KEYS.ATTENDANCE, attendance); }, [attendance]);

  const [teachers, setTeachers] = useState<User[]>(() => loadData<User[]>(STORAGE_KEYS.TEACHERS, []));
  useEffect(() => { saveData(STORAGE_KEYS.TEACHERS, teachers); }, [teachers]);

  const [students, setStudents] = useState<User[]>(() => loadData<User[]>(STORAGE_KEYS.STUDENTS, []));
  useEffect(() => { saveData(STORAGE_KEYS.STUDENTS, students); }, [students]);

  const loginStudent = (rollNumber: string) => {
    const savedStudents = loadData<User[]>(STORAGE_KEYS.STUDENTS, []);
    const student = savedStudents.find(s => s.rollNumber === rollNumber && s.role === 'student');
    if (student) {
      setUser(student);
      return true;
    }
    return false;
  };

  const loginTeacher = (email: string, password: string) => {
    const savedTeachers = loadData<User[]>(STORAGE_KEYS.TEACHERS, []);
    const teacher = savedTeachers.find(t => t.email === email && t.password === password);
    if (teacher) {
      setUser(teacher);
      return true;
    }
    return false;
  };

  const registerStudent = (newUser: User) => {
    const studentUser = { ...newUser, role: 'student' as const };
    setStudents(prev => [...prev, studentUser]);
    setUser(studentUser);
  };

  const registerTeacher = (newUser: User) => {
    const teacherUser = { ...newUser, role: 'teacher' as const };
    setTeachers(prev => [...prev, teacherUser]);
    setUser(teacherUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addAttendance = (r: AttendanceRecord) => setAttendance(prev => [...prev, r]);

  const getClassAttendance = (className: string, date?: string): AttendanceRecord[] => {
    return attendance.filter(r => {
      const classMatch = r.className === className;
      if (date) return classMatch && r.date === date;
      return classMatch;
    });
  };

  const markAttendanceFromQR = (qrData: StudentQRData): { success: boolean; message: string } => {
    if (!user || user.role !== 'teacher') {
      return { success: false, message: 'Only teachers can mark attendance.' };
    }

    const teacherClass = `${user.year} - ${user.section}`;
    const studentClass = `${qrData.year} - ${qrData.section}`;

    if (teacherClass !== studentClass) {
      return { success: false, message: `This student belongs to ${studentClass}, not your class (${teacherClass}).` };
    }

    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = attendance.some(
      r => r.studentRollNumber === qrData.rollNumber && r.date === today
    );

    if (alreadyMarked) {
      return { success: false, message: `Attendance already marked for ${qrData.name} today.` };
    }

    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentRollNumber: qrData.rollNumber,
      studentName: qrData.name,
      className: studentClass,
      date: today,
      status: 'present',
      markedBy: user.email,
    };

    addAttendance(record);
    return { success: true, message: `Attendance marked for ${qrData.name} (${qrData.rollNumber}).` };
  };

  const resetData = () => {
    clearAllData();
    setUser(null);
    setAttendance([]);
    setTeachers([]);
    setStudents([]);
  };

  return (
    <AppContext.Provider value={{
      user, attendance,
      loginStudent, loginTeacher, registerStudent, registerTeacher, logout,
      addAttendance, getClassAttendance, markAttendanceFromQR, resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
