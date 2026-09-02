import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, LayoutGrid,
  CheckCircle2, Loader2, FolderOpen,
  ChevronRight, ArrowRight, Sparkles,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import dayjs from "dayjs";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

const COLUMNS: { id: TaskStatus; label: string; accent: string; dotColor: string }[] = [
  { id: "TODO",        label: "To Do",       accent: "bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",  dotColor: "bg-neutral-400" },
  { id: "IN_PROGRESS", label: "In Progress", accent: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",         dotColor: "bg-indigo-500" },
  { id: "DONE",        label: "Done",        accent: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",   dotColor: "bg-emerald-500" },
];

const PROJECT_COLORS = [
  { bg: "bg-indigo-500",  light: "bg-indigo-50/80 dark:bg-indigo-950/40",  text: "text-indigo-600 dark:text-indigo-400",  ring: "ring-indigo-400"  },
  { bg: "bg-emerald-500", light: "bg-emerald-50/80 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-400" },
  { bg: "bg-orange-500",  light: "bg-orange-50/80 dark:bg-orange-950/40",  text: "text-orange-600 dark:text-orange-400",  ring: "ring-orange-400"  },
  { bg: "bg-rose-500",    light: "bg-rose-50/80 dark:bg-rose-950/40",      text: "text-rose-600 dark:text-rose-400",      ring: "ring-rose-400"    },
  { bg: "bg-violet-500",  light: "bg-violet-50/80 dark:bg-violet-950/40",  text: "text-violet-600 dark:text-violet-400",  ring: "ring-violet-400"  },
  { bg: "bg-cyan-500",    light: "bg-cyan-50/80 dark:bg-cyan-950/40",      text: "text-cyan-600 dark:text-cyan-400",      ring: "ring-cyan-400"    },
  { bg: "bg-amber-500",   light: "bg-amber-50/80 dark:bg-amber-950/40",    text: "text-amber-600 dark:text-amber-400",    ring: "ring-amber-400"   },
  { bg: "bg-teal-500",    light: "bg-teal-50/80 dark:bg-teal-950/40",      text: "text-teal-600 dark:text-teal-400",      ring: "ring-teal-400"    },
];

// ─── New Project Modal ────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const project = await api.createProject({ title: title.trim(), description: description.trim() || undefined });
      onCreated({ ...project, colorIdx, tasks: [] });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4.5 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create New Project</h2>
              <p className="text-xs text-neutral-500">Organize your work into Kanban columns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-xs transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the goal of this project?"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-xs transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Color Tag
            </label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  className={clsx(
                    `w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center cursor-pointer`,
                    colorIdx === i ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 scale-110 " + c.ring : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                >
                  {colorIdx === i && <div className="w-2 h-2 bg-white rounded-full shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.2]" />}
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Inline quick-add row inside a column ────────────────────────────────────
function InlineAddTask({
  projectId, status, onCreated,
}: {
  projectId: number;
  status: TaskStatus;
  onCreated: (t: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const task = await api.createProjectTask({ projectId, title: title.trim(), status });
      onCreated(task);
      setTitle("");
      setOpen(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-white/70 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 rounded-xl transition border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs cursor-pointer group"
      >
        <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform stroke-[2.2]" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 bg-white dark:bg-[#18181B] border border-neutral-200 dark:border-neutral-700/80 rounded-xl p-3 space-y-2.5 shadow-xs"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") { setOpen(false); setTitle(""); }
        }}
        placeholder="Enter task title…"
        className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-neutral-900 dark:text-white transition"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setOpen(false); setTitle(""); }}
          className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 disabled:opacity-50 transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      const withColors = data.map((p: any, i: number) => ({ ...p, colorIdx: i % PROJECT_COLORS.length }));
      setProjects(withColors);
      if (withColors.length > 0) setActiveProjectId(withColors[0].id);
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadTasksForProject = async (projectId: number) => {
    try {
      const data = await api.getProjectTasks(projectId);
      setTasks((p) => ({ ...p, [projectId]: data }));
    } catch {}
  };

  useEffect(() => {
    if (activeProjectId != null) loadTasksForProject(activeProjectId);
  }, [activeProjectId]);

  const currentTasks = activeProjectId != null ? (tasks[activeProjectId] || []) : [];

  const moveTask = async (taskId: number, newStatus: TaskStatus) => {
    if (activeProjectId == null) return;
    setTasks((prev) => ({
      ...prev,
      [activeProjectId]: prev[activeProjectId].map((t) => t.id === taskId ? { ...t, status: newStatus } : t),
    }));
    try { await api.updateProjectTaskStatus(taskId, newStatus); } catch {}
  };

  const deleteTask = async (taskId: number) => {
    if (activeProjectId == null) return;
    setTasks((prev) => ({
      ...prev,
      [activeProjectId]: prev[activeProjectId].filter((t) => t.id !== taskId),
    }));
    try { await api.deleteProjectTask(taskId); } catch {}
  };

  const deleteProject = async (projectId: number) => {
    setProjects((p) => p.filter((pr) => pr.id !== projectId));
    if (activeProjectId === projectId) {
      const remaining = projects.filter((pr) => pr.id !== projectId);
      setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
    try { await api.deleteProject(projectId); } catch {}
  };

  const nextStatus = (current: TaskStatus): TaskStatus => {
    if (current === "TODO") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "DONE";
    return "TODO";
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const color = activeProject ? PROJECT_COLORS[activeProject.colorIdx] : PROJECT_COLORS[0];

  return (
    <div className="h-full flex flex-col bg-[#F4F1EA] dark:bg-[#0E0E10]">
      <AnimatePresence>
        {showNewProject && (
          <NewProjectModal
            onClose={() => setShowNewProject(false)}
            onCreated={(p) => {
              setProjects((prev) => [p, ...prev]);
              setTasks((prev) => ({ ...prev, [p.id]: [] }));
              setActiveProjectId(p.id);
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 bg-[#FAF8F5]/90 dark:bg-[#141416]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-8 py-5 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Project Boards</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Manage tasks and track project workflows</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xs text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-neutral-400 gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-16 h-16 bg-white dark:bg-[#18181B] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center mb-4 shadow-xs">
            <FolderOpen className="w-7 h-7 text-neutral-400 dark:text-neutral-500 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">No projects yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-5 max-w-xs leading-relaxed">
            Create your first project and start organizing tasks in an interactive Kanban board.
          </p>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" /> Create Project
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Project Sidebar ─────────────────────────────────── */}
          <aside className="w-64 flex-shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col bg-[#FAF8F5]/80 dark:bg-[#141416]/80 shadow-xs">
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-200/70 dark:border-neutral-800">
              Your Projects ({projects.length})
            </div>
            <nav className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1">
              {projects.map((project) => {
                const projectTasks = tasks[project.id] || [];
                const done = projectTasks.filter((t: any) => t.status === "DONE").length;
                const total = projectTasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isActive = project.id === activeProjectId;
                const c = PROJECT_COLORS[project.colorIdx];
                return (
                  <button
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group cursor-pointer",
                      isActive
                        ? "bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-700/80 shadow-xs"
                        : "hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400"
                    )}
                  >
                    <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", c.bg)} />
                    <div className="flex-1 min-w-0">
                      <div className={clsx("text-xs font-bold truncate", isActive ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300")}>
                        {project.title}
                      </div>
                      {total > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full transition-all", c.bg)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-neutral-400 tabular-nums">{pct}%</span>
                        </div>
                      )}
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Kanban Board ─────────────────────────────────────── */}
          <div className="flex-1 overflow-auto p-8">
            {activeProject && (
              <>
                {/* Project Title Bar */}
                <div className="flex items-center gap-3.5 mb-6 bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
                  <div className={clsx("w-3.5 h-3.5 rounded-full flex-shrink-0", color.bg)} />
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                      {activeProject.title}
                    </h3>
                    {activeProject.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{activeProject.description}</p>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1.5 ml-4">
                    {COLUMNS.map((col) => {
                      const n = currentTasks.filter((t: any) => t.status === col.id).length;
                      return (
                        <span key={col.id} className={clsx("text-[11px] font-semibold px-2 py-0.5 rounded-md", col.accent)}>
                          {n} {col.label.toLowerCase()}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex-1" />
                  <button
                    onClick={() => deleteProject(activeProject.id)}
                    title="Delete project"
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>

                {/* Kanban Columns Grid */}
                <div className="grid grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 270px)" }}>
                  {COLUMNS.map((column) => {
                    const colTasks = currentTasks.filter((t: any) => t.status === column.id);
                    return (
                      <div
                        key={column.id}
                        className="flex flex-col min-h-0 bg-neutral-200/40 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800/80 rounded-2xl p-4 shadow-2xs"
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", column.dotColor)} />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                              {column.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-200/70 dark:border-neutral-700/80 tabular-nums shadow-2xs">
                            {colTasks.length}
                          </span>
                        </div>

                        {/* Cards List */}
                        <div className="flex-1 overflow-y-auto flex flex-col pr-0.5">
                          <div className="space-y-2.5 flex-1">
                            <AnimatePresence initial={false}>
                              {colTasks.map((task: any) => (
                                <motion.div
                                  key={task.id}
                                  layout
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                                  className="group bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800/90 rounded-xl p-3.5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-0.5 transition-all cursor-default"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug flex-1">
                                      {task.title}
                                    </p>
                                    <button
                                      onClick={() => moveTask(task.id, nextStatus(task.status))}
                                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                                      title={task.status === "DONE" ? "Restart task" : "Move to next column"}
                                    >
                                      {task.status === "DONE" ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <ArrowRight className="w-4 h-4 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
                                      )}
                                    </button>
                                  </div>

                                  {task.description && (
                                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-neutral-400">
                                      {dayjs(task.createdAt || undefined).isValid() ? dayjs(task.createdAt).format("MMM D") : "—"}
                                    </span>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3 stroke-[1.8]" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {colTasks.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-600">
                                <LayoutGrid className="w-5 h-5 mb-1.5 opacity-40" />
                                <p className="text-xs font-medium">No tasks here</p>
                              </div>
                            )}
                          </div>

                          {/* Inline Add Task */}
                          {activeProjectId != null && (
                            <InlineAddTask
                              projectId={activeProjectId}
                              status={column.id}
                              onCreated={(t) => setTasks((prev) => ({
                                ...prev,
                                [activeProjectId]: [...(prev[activeProjectId] || []), t],
                              }))}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
