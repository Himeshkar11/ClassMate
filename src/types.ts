export type UserRole = 'student' | 'teacher';

export interface User {
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface QRSession {
  id: string;
  subjectId: string;
  date: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string;
  endTime: string;
  room: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface ProductivitySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number; // in minutes
}
