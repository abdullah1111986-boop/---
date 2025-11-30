export interface RawRow {
  [key: string]: string | number;
}

export interface CourseRecord {
  courseName: string;
  courseCode?: string;
  semester?: string;
  grade: string | number;
  credits?: number | string;
  status?: string; // General status string
  // Specific flags for the required column
  isCompleted?: boolean | string;
}

export interface TraineeProfile {
  id: string;
  name: string;
  // Stores any extra columns found in the Excel for the student (e.g., Mobile, GPA, Major, Advisor)
  details: Record<string, string | number>; 
  courses: CourseRecord[];
}

export interface GeminiAnalysis {
  summary: string;
  estimatedGPA: string;
  strengths: string[];
  recommendation: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SEARCH = 'SEARCH',
  VIEW = 'VIEW',
}