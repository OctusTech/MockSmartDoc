export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  VIEWER = 'Viewer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
  size: string;
  status: 'Processed' | 'Pending' | 'Error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalysisResult {
  summary: string;
  risks: string[];
  keyTerms: string[];
  score: number;
}
