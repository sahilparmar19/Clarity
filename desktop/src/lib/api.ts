import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "./store";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  DiaryEntry,
  CalendarEvent,
} from "./types";

class ApiClient {
  private getUserId(): number {
    const state = useAuth.getState();
    if (!state.userId) throw new Error("Not authenticated");
    return state.userId;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return invoke("register", { ...data });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return invoke("login", { ...data });
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────

  async getTasks(pendingOnly = false): Promise<Task[]> {
    return invoke("get_tasks", { userId: this.getUserId(), pendingOnly });
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return invoke("create_task", {
      userId: this.getUserId(),
      title: task.title,
      description: task.description || null,
      dueAt: task.dueAt || null,
    });
  }

  async updateTask(id: number, patch: Partial<Task>): Promise<Task> {
    return invoke("update_task", {
      id,
      title: patch.title,
      description: patch.description,
      completed: patch.completed,
      dueAt: patch.dueAt,
    });
  }

  async deleteTask(id: number): Promise<void> {
    return invoke("delete_task", { id });
  }

  // ─── Diary ───────────────────────────────────────────────────────────────

  async checkDiaryPin(): Promise<boolean> {
    return invoke("check_diary_pin", { userId: this.getUserId() });
  }

  async verifyDiaryPin(pin: string): Promise<boolean> {
    return invoke("verify_diary_pin", { userId: this.getUserId(), pin });
  }

  async setDiaryPin(pin: string): Promise<void> {
    return invoke("set_diary_pin", { userId: this.getUserId(), pin });
  }

  async getDiaryEntries(pin: string): Promise<DiaryEntry[]> {
    await this.verifyDiaryPin(pin);
    return invoke("get_diary_entries", { userId: this.getUserId() });
  }

  async saveDiaryEntry(date: string, pin: string, body: Partial<DiaryEntry>): Promise<DiaryEntry> {
    await this.verifyDiaryPin(pin);
    return invoke("save_diary_entry", {
      userId: this.getUserId(),
      date,
      body: body.body || "",
      mood: body.mood || null,
    });
  }

  // ─── Calendar ────────────────────────────────────────────────────────────

  async getYearHeatmap(year: number): Promise<Record<number, number>> {
    return invoke("get_year_heatmap", { userId: this.getUserId(), year });
  }

  async getCalendarDay(date: string): Promise<CalendarEvent[]> {
    return invoke("get_calendar_day", { userId: this.getUserId(), date });
  }

  async getCalendarRange(from: string, to: string): Promise<CalendarEvent[]> {
    return invoke("get_calendar_range", { userId: this.getUserId(), from, to });
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return invoke("create_calendar_event", {
      userId: this.getUserId(),
      title: event.title,
      description: event.description || null,
      eventDate: event.eventDate,
      startAt: event.startAt || null,
      endAt: event.endAt || null,
      eventType: event.type,
    });
  }

  async updateCalendarEvent(id: number, title: string): Promise<void> {
    return invoke("update_calendar_event", { id, title });
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    return invoke("delete_calendar_event", { id });
  }

  // ─── Expenses ────────────────────────────────────────────────────────────

  async getExpenses(): Promise<any[]> {
    return invoke("get_expenses", { userId: this.getUserId() });
  }

  async createExpense(expense: any): Promise<any> {
    return invoke("create_expense", {
      userId: this.getUserId(),
      amount: expense.amount,
      category: expense.category,
      description: expense.description || null,
      date: expense.date,
      expenseType: expense.expenseType,
    });
  }

  async deleteExpense(id: number): Promise<void> {
    return invoke("delete_expense", { id });
  }

  // ─── Projects ────────────────────────────────────────────────────────────

  async getProjects(): Promise<any[]> {
    return invoke("get_projects", { userId: this.getUserId() });
  }

  async createProject(project: any): Promise<any> {
    return invoke("create_project", {
      userId: this.getUserId(),
      title: project.title,
      description: project.description || null,
    });
  }

  async deleteProject(id: number): Promise<void> {
    return invoke("delete_project", { id });
  }

  async getProjectTasks(projectId: number): Promise<any[]> {
    return invoke("get_project_tasks", { projectId });
  }

  async createProjectTask(task: any): Promise<any> {
    return invoke("create_project_task", {
      projectId: task.projectId,
      title: task.title,
      description: task.description || null,
      status: task.status,
    });
  }

  async updateProjectTaskStatus(id: number, status: string): Promise<void> {
    return invoke("update_project_task_status", { id, status });
  }

  async deleteProjectTask(id: number): Promise<void> {
    return invoke("delete_project_task", { id });
  }
}

export const api = new ApiClient();
