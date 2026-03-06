export type UserRole = 'student' | 'teacher';

export interface User {
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface AttendanceRecord {
  id: string;
  studentRollNumber: string;
  studentName: string;
  className: string; // e.g., "1st Year - Section 3"
  date: string;
  status: 'present';
  markedBy: string; // teacher email
}

export interface StudentQRData {
  rollNumber: string;
  name: string;
  department: string;
  year: string;
  section: string;
}
