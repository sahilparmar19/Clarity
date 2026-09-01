import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, CalendarDays, AlignLeft,
  Loader2, CheckCircle2, Circle, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { clsx } from "clsx";

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
          // split "YYYY-MM-DDTHH:mm"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#FAF9F5] dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#EDE9DF] dark:bg-neutral-800 border-b border-neutral-200/70 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Title *</label>
            <input ref={ref} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm resize-none" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Due date
            </label>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold shadow-xs disabled:opacity-50 transition">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
        }, 300); // Wait for animation
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
    <div className="h-full flex flex-col bg-[#EDE9DF] dark:bg-neutral-950">
      <AnimatePresence>
        {showModal && (
          <NewTaskModal onClose={() => setShowModal(false)} onCreated={(t) => setTasks((p) => [t, ...p])} />
        )}
      </AnimatePresence>

      <div className="border-b border-neutral-200/70 dark:border-neutral-800 px-8 py-5 flex items-center justify-between bg-[#FAF9F5] dark:bg-neutral-900 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Tasks</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Capture everything to get done</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xs text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-neutral-200/60 dark:bg-neutral-800/60 p-1 w-max rounded-xl">
            {(["Pending", "All"] as const).map((lbl) => {
              const active = lbl === "Pending" ? pendingOnly : !pendingOnly;
              return (
                <button
                  key={lbl}
                  onClick={() => setPendingOnly(lbl === "Pending")}
                  className={clsx(
                    "relative z-10 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200",
                    active ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  )}
                >
                  {active && (
                    <motion.div layoutId="task-tab-bg"
                      className="absolute inset-0 bg-[#FAF9F5] dark:bg-neutral-700 rounded-lg shadow-xs -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  {lbl}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center mt-20 text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20 p-10 bg-[#FAF9F5] dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl">
              <div className="w-14 h-14 bg-neutral-200/60 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-7 h-7 text-neutral-400" />
              </div>
              <h3 className="text-base font-bold text-neutral-800 dark:text-white">All caught up!</h3>
              <p className="text-neutral-500 text-sm mt-1">Nothing to do right now.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="group flex items-start gap-3 p-4 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-900 hover:shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                  >
                    <button
                      onClick={() => toggleComplete(task)}
                      className="mt-0.5 flex-shrink-0 text-neutral-300 hover:text-indigo-600 dark:text-neutral-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={clsx(
                        "text-[15px] font-medium transition-colors",
                        task.completed ? "text-neutral-400 line-through dark:text-neutral-500" : "text-neutral-800 dark:text-neutral-100"
                      )}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                          {task.description}
                        </div>
                      )}
                      {task.dueAt && (
                        <div className={clsx(
                          "mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
                          new Date(task.dueAt).getTime() < Date.now() && !task.completed
                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-neutral-200/60 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        )}>
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(task.dueAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
