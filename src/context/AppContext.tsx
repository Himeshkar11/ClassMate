import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Subject, AttendanceRecord, ClassSession, Task, ProductivitySession, QRSession } from '../types';
import { STORAGE_KEYS, loadData, saveData, clearAllData } from '../utils/storage';
import { INITIAL_SUBJECTS, MOCK_SCHEDULE, MOCK_TASKS, MOCK_ATTENDANCE, MOCK_PRODUCTIVITY } from '../data/mockData';

interface AppContextType {
  user: User | null;
  subjects: Subject[];
  attendance: AttendanceRecord[];
  schedule: ClassSession[];
  tasks: Task[];
  productivity: ProductivitySession[];
  qrSessions: QRSession[];
  login: (rollNumber: string) => boolean;
  register: (user: User) => void;
  logout: () => void;
  addSubject: (subject: Subject) => void;
  addAttendance: (record: AttendanceRecord) => void;
  addSchedule: (session: Omit<ClassSession, 'id'>) => void;
  deleteSchedule: (sessionId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addProductivity: (session: ProductivitySession) => void;
  createQRSession: (subjectId: string, expiryMinutes: number) => QRSession;
  validateQRToken: (token: string) => QRSession | null;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadData<User | null>(STORAGE_KEYS.USER, null));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadData<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadData<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, MOCK_ATTENDANCE));
  const [schedule, setSchedule] = useState<ClassSession[]>(() => loadData<ClassSession[]>(STORAGE_KEYS.SCHEDULE, MOCK_SCHEDULE));
  const [tasks, setTasks] = useState<Task[]>(() => loadData<Task[]>(STORAGE_KEYS.TASKS, MOCK_TASKS));
  const [productivity, setProductivity] = useState<ProductivitySession[]>(() => loadData<ProductivitySession[]>(STORAGE_KEYS.PRODUCTIVITY, MOCK_PRODUCTIVITY));
  const [qrSessions, setQrSessions] = useState<QRSession[]>(() => loadData<QRSession[]>(STORAGE_KEYS.QR_SESSIONS, []));

  useEffect(() => { saveData(STORAGE_KEYS.USER, user); }, [user]);
  useEffect(() => { saveData(STORAGE_KEYS.SUBJECTS, subjects); }, [subjects]);
  useEffect(() => { saveData(STORAGE_KEYS.ATTENDANCE, attendance); }, [attendance]);
  useEffect(() => { saveData(STORAGE_KEYS.SCHEDULE, schedule); }, [schedule]);
  useEffect(() => { saveData(STORAGE_KEYS.TASKS, tasks); }, [tasks]);
  useEffect(() => { saveData(STORAGE_KEYS.PRODUCTIVITY, productivity); }, [productivity]);
  useEffect(() => { saveData(STORAGE_KEYS.QR_SESSIONS, qrSessions); }, [qrSessions]);

  const login = (rollNumber: string) => {
    const savedUser = loadData<User | null>(STORAGE_KEYS.USER, null);
    if (savedUser && savedUser.rollNumber === rollNumber) {
      setUser(savedUser);
      return true;
    }
    return false;
  };

  const register = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addSubject = (s: Subject) => setSubjects([...subjects, s]);
  const addAttendance = (r: AttendanceRecord) => setAttendance([...attendance, r]);
  const addSchedule = (s: Omit<ClassSession, 'id'>) => {
    const newSession = { ...s, id: Math.random().toString(36).substr(2, 9) };
    setSchedule([...schedule, newSession]);
  };
  const deleteSchedule = (id: string) => setSchedule(schedule.filter(s => s.id !== id));
  
  const addTask = (t: Omit<Task, 'id'>) => {
    const newTask = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTasks([...tasks, newTask]);
  };
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const addProductivity = (p: ProductivitySession) => setProductivity([...productivity, p]);

  const createQRSession = (subjectId: string, expiryMinutes: number): QRSession => {
    const now = Date.now();
    const session: QRSession = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId,
      date: new Date().toISOString().split('T')[0],
      token: Math.random().toString(36).substr(2, 12) + now.toString(36),
      createdAt: now,
      expiresAt: now + expiryMinutes * 60 * 1000,
    };
    setQrSessions(prev => [...prev, session]);
    return session;
  };

  const validateQRToken = (token: string): QRSession | null => {
    const session = qrSessions.find(s => s.token === token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;
    return session;
  };

  const resetData = () => {
    clearAllData();
    setUser(null);
    setSubjects(INITIAL_SUBJECTS);
    setAttendance(MOCK_ATTENDANCE);
    setSchedule(MOCK_SCHEDULE);
    setTasks(MOCK_TASKS);
    setProductivity(MOCK_PRODUCTIVITY);
    setQrSessions([]);
  };

  return (
    <AppContext.Provider value={{
      user, subjects, attendance, schedule, tasks, productivity, qrSessions,
      login, register, logout, addSubject, addAttendance, addSchedule, deleteSchedule,
      addTask, updateTask, deleteTask, addProductivity, createQRSession, validateQRToken, resetData
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
