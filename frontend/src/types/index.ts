// Shared TypeScript types derived from backend Mongoose models

export interface User {
  // backend uses userId as unique identifier; also _id/id may exist
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  semester?: number | null;
  section?: string | null;
  designation?: string | null;
}

export interface TimetableEntry {
  _id: string;
  dayOfWeek?: number; // 0-6
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:00"
  subject: string;
  subjectCode?: string;
  faculty: { _id?: string; name?: string } | string;
  classroom: string;
  department: string;
  semester: number;
  section: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSession {
  _id: string;
  timetableEntry: string; // references TimetableEntry._id
  subject: string;
  faculty: string | { _id?: string; name?: string };
  classroom: string;
  department: string;
  semester: number;
  section: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  startTime?: string | null; // ISO date
  endTime?: string | null; // ISO date
  attendanceCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Helper types for API responses
export interface ApiResponse<T> {
  data: T;
}
