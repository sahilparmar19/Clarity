import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, CalendarDays, AlignLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { clsx } from "clsx";

// --- New Task Modal ---
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
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
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
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold dark:text-white">New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              <AlignLeft className="w-4 h-4" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition resize-none"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              <CalendarDays className="w-4 h-4" /> Due date
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [pendingOnly]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(pendingOnly);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreated={(t) => setTasks((prev) => [t, ...prev])}
        />
      )}

      <div className="border-b p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Tasks</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your to-dos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="flex gap-2 mb-6">
          {(["Pending", "All"] as const).map((label) => {
            const active = label === "Pending" ? pendingOnly : !pendingOnly;
            return (
              <button
                key={label}
                onClick={() => setPendingOnly(label === "Pending")}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition",
                  active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center mt-20 text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-neutral-500 mt-20">
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Hit "New Task" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition bg-white dark:bg-neutral-800/50"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                  className="mt-0.5 w-5 h-5 cursor-pointer accent-neutral-900"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={clsx(
                      "font-medium dark:text-white",
                      task.completed && "line-through opacity-50"
                    )}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                      {task.description}
                    </div>
                  )}
                  {task.dueAt && (
                    <div className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Due {new Date(task.dueAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
