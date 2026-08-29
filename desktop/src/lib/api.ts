import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  DiaryEntry,
  Expense,
  CalendarEvent,
  Project,
} from "./types";

const API_BASE = "http://localhost:8080/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    return res.json();
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(pendingOnly = false): Promise<Task[]> {
    return this.fetch(`/tasks?pendingOnly=${pendingOnly}`);
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.fetch("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: number, patch: Partial<Task>): Promise<Task> {
    return this.fetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  }

  async deleteTask(id: number): Promise<void> {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  // Diary (requires PIN in X-Diary-Pin header)
  async getDiaryEntries(pin: string): Promise<DiaryEntry[]> {
    return this.fetch("/diary", { headers: { "X-Diary-Pin": pin } });
  }

  async getDiaryEntry(date: string, pin: string): Promise<DiaryEntry> {
    return this.fetch(`/diary/${date}`, { headers: { "X-Diary-Pin": pin } });
  }

  async saveDiaryEntry(
    date: string,
    pin: string,
    body: Partial<DiaryEntry>
  ): Promise<DiaryEntry> {
    return this.fetch(`/diary/${date}`, {
      method: "PUT",
      headers: { "X-Diary-Pin": pin },
      body: JSON.stringify(body),
    });
  }

  async deleteDiaryEntry(id: number, pin: string): Promise<void> {
    await fetch(`${API_BASE}/diary/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "X-Diary-Pin": pin,
      },
    });
  }

  async setDiaryPin(pin: string): Promise<void> {
    await this.fetch("/diary/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  }

  // Expenses
  async getExpenses(from?: string, to?: string): Promise<Expense[]> {
    const query = from && to ? `?from=${from}&to=${to}` : "";
    return this.fetch(`/expenses${query}`);
  }

  async getExpenseSummary(year: number, month: number): Promise<number> {
    return this.fetch(`/expenses/summary?year=${year}&month=${month}`);
  }

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    return this.fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id: number): Promise<void> {
    await fetch(`${API_BASE}/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  // Calendar
  async getYearHeatmap(year: number): Promise<Record<number, number>> {
    return this.fetch(`/calendar/year/${year}`);
  }

  async getCalendarDay(date: string): Promise<CalendarEvent[]> {
    return this.fetch(`/calendar/day/${date}`);
  }

  async getCalendarRange(from: string, to: string): Promise<CalendarEvent[]> {
    return this.fetch(`/calendar?from=${from}&to=${to}`);
  }

  async createCalendarEvent(
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    return this.fetch("/calendar", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  async updateCalendarEvent(
    id: number,
    patch: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    return this.fetch(`/calendar/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await fetch(`${API_BASE}/calendar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.fetch("/projects");
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.fetch("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: number, patch: Partial<Project>): Promise<Project> {
    return this.fetch(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  }

  async deleteProject(id: number): Promise<void> {
    await fetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

export const api = new ApiClient();
