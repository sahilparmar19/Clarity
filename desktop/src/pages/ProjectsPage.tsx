import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, LayoutGrid,
  CheckCircle2, Loader2, FolderOpen,
  ChevronRight, ArrowRight, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import dayjs from "dayjs";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

const COLUMNS: { id: TaskStatus; label: string; dotColor: string; dotGlow: string; gradientClass: string }[] = [
  { id: "TODO",        label: "To Do",       dotColor: "bg-[#7A889B]",   dotGlow: "",                                gradientClass: "morning-gradient-sky" },
  { id: "IN_PROGRESS", label: "In Progress", dotColor: "bg-[#D97706]",   dotGlow: "shadow-[0_0_6px_rgba(217,119,6,0.4)]", gradientClass: "morning-gradient-honey" },
  { id: "DONE",        label: "Done",        dotColor: "bg-[#6B8065]",   dotGlow: "shadow-[0_0_6px_rgba(107,128,101,0.4)]", gradientClass: "morning-gradient-sage" },
];

const PROJECT_COLORS = [
  { bg: "bg-indigo-500",  hex: "#6366F1", ring: "ring-indigo-400"  },
  { bg: "bg-emerald-500", hex: "#10B981", ring: "ring-emerald-400" },
  { bg: "bg-orange-500",  hex: "#F97316", ring: "ring-orange-400"  },
  { bg: "bg-rose-500",    hex: "#F43F5E", ring: "ring-rose-400"    },
  { bg: "bg-violet-500",  hex: "#8B5CF6", ring: "ring-violet-400"  },
  { bg: "bg-cyan-500",    hex: "#06B6D4", ring: "ring-cyan-400"    },
  { bg: "bg-amber-500",   hex: "#F59E0B", ring: "ring-amber-400"   },
  { bg: "bg-teal-500",    hex: "#14B8A6", ring: "ring-teal-400"    },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md morning-card-elevated overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#FAF8F5] border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D98A7E]/15 flex items-center justify-center text-[#C87467] shadow-sm">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#24211E] font-serif">Create New Project</h2>
              <p className="text-xs text-[#827A72]">Organize your work into Kanban columns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#827A72] hover:text-[#24211E] hover:bg-black/[0.04] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="morning-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the goal of this project?"
              rows={2}
              className="morning-input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-2">
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
                    colorIdx === i ? `ring-2 ring-offset-2 ring-offset-[#FAF8F5] scale-110 ${c.ring}` : "hover:scale-105 opacity-70 hover:opacity-100"
                  )}
                >
                  {colorIdx === i && <div className="w-2 h-2 bg-white rounded-full shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#C87467] font-semibold bg-[#C87467]/10 p-2.5 rounded-lg border border-[#C87467]/20">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-black/[0.08] text-sm font-semibold text-[#6E6862] hover:bg-black/[0.04] hover:text-[#24211E] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 transition cursor-pointer"
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
        className="w-full mt-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-[#6E6862] hover:text-[#24211E] bg-[#F2EFE9] hover:bg-[#FAF8F5] rounded-xl transition border border-black/[0.06] hover:border-black/[0.12] cursor-pointer group shadow-xs"
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
      className="mt-3 morning-card p-3 space-y-2.5"
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
        className="morning-input py-1.5 text-xs"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setOpen(false); setTitle(""); }}
          className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-black/[0.08] text-[#6E6862] hover:bg-black/[0.04] hover:text-[#24211E] transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-1 morning-btn-accent py-1.5 text-xs"
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
    <div className="h-full flex flex-col bg-transparent">
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
      <div className="shrink-0 bg-[#F5F2EC]/85 backdrop-blur-md border-b border-[#DDD7CE] px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#24211E] tracking-tight font-serif">Projects & Boards</h2>
          <p className="text-[#827A72] text-xs font-semibold mt-0.5">Manage kanban workflows and multi-step tasks</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="morning-btn-accent"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" /> New Board
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#94A3B8]/50 gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#F2EFE9] rounded-2xl border border-black/[0.06] flex items-center justify-center mb-4 shadow-sm">
            <FolderOpen className="w-7 h-7 text-[#827A72] stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-[#24211E] font-serif mb-1">No projects yet</h3>
          <p className="text-[#827A72] text-xs mb-5 max-w-xs leading-relaxed">
            Create your first project and start organizing tasks in an interactive Kanban board.
          </p>
          <button
            onClick={() => setShowNewProject(true)}
            className="morning-btn-accent"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" /> Create Project
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Project Sidebar ─────────────────────────────────── */}
          <aside className="w-64 flex-shrink-0 border-r border-[#DCD6CC] flex flex-col bg-[#ECE8E1]/80">
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]/50 border-b border-white/[0.06]">
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
                        ? "bg-[#FAF8F5] border border-black/[0.08] shadow-xs text-[#24211E]"
                        : "hover:bg-black/[0.03] border border-transparent text-[#6E6862]"
                    )}
                  >
                    <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", c.bg)} />
                    <div className="flex-1 min-w-0">
                      <div className={clsx("text-xs font-bold truncate", isActive ? "text-[#24211E]" : "text-[#6E6862]")}>
                        {project.title}
                      </div>
                      {total > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-black/[0.06] rounded-full overflow-hidden">
                            <div className={clsx("h-full rounded-full transition-all", c.bg)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-[#827A72] tabular-nums">{pct}%</span>
                        </div>
                      )}
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#827A72] flex-shrink-0" />}
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
                <div className="flex items-center gap-3.5 mb-6 morning-card p-4 shadow-xs">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color.hex, boxShadow: `0 0 8px ${color.hex}60` }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-[#24211E] font-serif leading-tight">
                      {activeProject.title}
                    </h3>
                    {activeProject.description && (
                      <p className="text-xs text-[#827A72] mt-0.5">{activeProject.description}</p>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1.5 ml-4">
                    {COLUMNS.map((col) => {
                      const n = currentTasks.filter((t: any) => t.status === col.id).length;
                      return (
                        <span key={col.id} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-black/[0.06] text-[#524B45]">
                          {n} {col.label.toLowerCase()}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex-1" />
                  <button
                    onClick={() => deleteProject(activeProject.id)}
                    title="Delete project"
                    className="p-2 text-[#827A72] hover:text-[#C87467] hover:bg-[#C87467]/10 rounded-xl transition cursor-pointer"
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
                        className={clsx("flex flex-col min-h-0 morning-card p-4 shadow-xs", column.gradientClass)}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", column.dotColor, column.dotGlow)} />
                            <span className="text-xs font-bold text-[#24211E] uppercase tracking-wider">
                              {column.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#524B45] bg-[#F2EFE9] px-2 py-0.5 rounded-lg border border-black/[0.06] tabular-nums">
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
                                  className="group bg-[#FAF8F5] border border-black/[0.07] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-black/[0.12] hover:-translate-y-0.5 transition-all cursor-default"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold text-[#24211E] leading-snug flex-1">
                                      {task.title}
                                    </p>
                                    <button
                                      onClick={() => moveTask(task.id, nextStatus(task.status))}
                                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity p-1 rounded-md hover:bg-black/[0.06] cursor-pointer"
                                      title={task.status === "DONE" ? "Restart task" : "Move to next column"}
                                    >
                                      {task.status === "DONE" ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <ArrowRight className="w-4 h-4 text-[#827A72]" />
                                      )}
                                    </button>
                                  </div>

                                  {task.description && (
                                    <p className="text-[11px] text-[#827A72]/70 mt-1 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="mt-3 pt-2 border-t border-black/[0.05] flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-[#827A72]/50">
                                      {dayjs(task.createdAt || undefined).isValid() ? dayjs(task.createdAt).format("MMM D") : "—"}
                                    </span>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-[#827A72] hover:text-[#C87467] hover:bg-[#C87467]/10 rounded-md transition cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {colTasks.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-12 text-[#94A3B8]/30">
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
