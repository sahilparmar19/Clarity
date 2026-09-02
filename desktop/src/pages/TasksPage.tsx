import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, CalendarDays, AlignLeft,
  Loader2, CheckCircle2, Circle, CheckSquare, Sparkles, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { clsx } from "clsx";
import dayjs from "dayjs";

// ─── New Task Modal ──────────────────────────────────────────────────────────
function NewTaskModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
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
      const task = await api.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });

      // SYNC to Calendar: if the task has a due date, create a matching Calendar Event
      if (dueAt) {
        try {
          const datePart = dueAt.split("T")[0];
          const timePart = dueAt.includes("T") ? dueAt.split("T")[1] : undefined;
          await api.createCalendarEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            eventDate: datePart,
            startAt: timePart ? `${datePart}T${timePart}:00` : undefined,
            type: "TASK",
          });
        } catch (syncErr) {
          console.warn("Could not sync task to calendar:", syncErr);
        }
      }

      onCreated(task);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create task.");
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
              <CheckSquare className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create New Task</h2>
              <p className="text-xs text-neutral-500">Add an action item with optional deadline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              ref={ref}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-xs transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or links..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-xs transition resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Due Date & Time
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-xs transition"
            />
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.2]" />}
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadTasks(); }, [pendingOnly]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(pendingOnly);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      if (pendingOnly) {
        setTimeout(() => {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        }, 300);
      }
    } catch {
      // Revert
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t)));
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F1EA] dark:bg-[#0E0E10]">
      <AnimatePresence>
        {showModal && (
          <NewTaskModal onClose={() => setShowModal(false)} onCreated={(t) => setTasks((p) => [t, ...p])} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 bg-[#FAF8F5]/90 dark:bg-[#141416]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-8 py-5 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Tasks & To-Do</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Capture, schedule, and track action items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xs text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Segmented Filter Switcher */}
          <div className="flex items-center gap-1 bg-neutral-200/50 dark:bg-neutral-800/60 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 w-max shadow-2xs">
            {(["Pending", "All"] as const).map((lbl) => {
              const active = lbl === "Pending" ? pendingOnly : !pendingOnly;
              return (
                <button
                  key={lbl}
                  onClick={() => setPendingOnly(lbl === "Pending")}
                  className={clsx(
                    "relative z-10 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors duration-150 select-none cursor-pointer",
                    active
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="task-tab-bg"
                      className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-lg shadow-xs -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {lbl}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-xs font-medium">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-8 shadow-xs"
            >
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <CheckSquare className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">All caught up!</h3>
              <p className="text-neutral-400 text-xs mt-1">
                {pendingOnly ? "No pending tasks remaining. Great job!" : "No tasks found in your workspace."}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {tasks.map((task) => {
                  const isOverdue = task.dueAt && new Date(task.dueAt).getTime() < Date.now() && !task.completed;
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                      className="group flex items-start gap-3.5 px-4.5 py-4 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#18181B] hover:shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                    >
                      <button
                        onClick={() => toggleComplete(task)}
                        className="mt-0.5 flex-shrink-0 text-neutral-300 hover:text-indigo-600 dark:text-neutral-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 stroke-[2.2]" />
                        ) : (
                          <Circle className="w-5 h-5 stroke-[1.8]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={clsx(
                          "text-sm font-semibold transition-colors leading-snug",
                          task.completed ? "text-neutral-400 line-through dark:text-neutral-500" : "text-neutral-900 dark:text-neutral-100"
                        )}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        {task.dueAt && (
                          <div className={clsx(
                            "mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                            isOverdue
                              ? "bg-rose-50/80 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                          )}>
                            <Clock className="w-3 h-3 stroke-[2]" />
                            {dayjs(task.dueAt).format("MMM D, YYYY [at] h:mm A")}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.8]" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
