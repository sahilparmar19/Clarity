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
  completed?: boolean;
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

export type ExpenseType = "EXPENSE" | "INCOME";

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
  type: ExpenseType;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export type ProjectTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: ProjectTaskStatus;
  createdAt: string;
}
