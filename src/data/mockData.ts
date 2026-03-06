import { Subject, ClassSession, Task, AttendanceRecord, ProductivitySession } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', color: '#3b82f6' },
  { id: '2', name: 'Physics', color: '#8b5cf6' },
  { id: '3', name: 'Computer Science', color: '#ec4899' },
  { id: '4', name: 'English', color: '#f59e0b' },
  { id: '5', name: 'DBMS', color: '#06b6d4' },
];

export const MOCK_SCHEDULE: ClassSession[] = [
  { id: 's1', subjectId: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'Room 101' },
  { id: 's2', subjectId: '3', day: 'Monday', startTime: '10:30', endTime: '12:00', room: 'Lab 2' },
  { id: 's3', subjectId: '2', day: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'Room 202' },
  { id: 's4', subjectId: '5', day: 'Wednesday', startTime: '11:00', endTime: '12:30', room: 'Room 303' },
  { id: 's5', subjectId: '4', day: 'Thursday', startTime: '14:00', endTime: '15:30', room: 'Room 105' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Calculus Assignment', subjectId: '1', deadline: '2026-03-10', priority: 'High', completed: false },
  { id: 't2', title: 'Physics Lab Report', subjectId: '2', deadline: '2026-03-08', priority: 'Medium', completed: true },
  { id: 't3', title: 'Database Normalization', subjectId: '5', deadline: '2026-03-12', priority: 'High', completed: false },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', subjectId: '1', date: '2026-03-01', status: 'present' },
  { id: 'a2', subjectId: '1', date: '2026-03-02', status: 'present' },
  { id: 'a3', subjectId: '1', date: '2026-03-03', status: 'absent' },
  { id: 'a4', subjectId: '5', date: '2026-03-01', status: 'present' },
  { id: 'a5', subjectId: '5', date: '2026-03-02', status: 'absent' },
];

export const MOCK_PRODUCTIVITY: ProductivitySession[] = [
  { id: 'p1', subjectId: '3', date: '2026-03-01', duration: 120 },
  { id: 'p2', subjectId: '1', date: '2026-03-02', duration: 90 },
  { id: 'p3', subjectId: '5', date: '2026-03-03', duration: 150 },
  { id: 'p4', subjectId: '2', date: '2026-03-04', duration: 60 },
];
