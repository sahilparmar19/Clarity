export interface User {
  id: number;
  username: string;
  email: string;
  diaryPinHash: string | null;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueAt?: string;
  remindAt?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: number;
  date: string; // ISO LocalDate
  body: string;
  mood?: "HAPPY" | "NEUTRAL" | "SAD" | "ANXIOUS" | "EXCITED";
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string; // ISO LocalDate
  startAt?: string; // ISO Instant
  endAt?: string;
  type: "TASK" | "NOTE";
  remindAt?: string;
  reminderSent: boolean;
  createdAt: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
