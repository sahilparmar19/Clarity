import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { clsx } from "clsx";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [loading, setLoading] = useState(false);

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
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track your to-dos
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPendingOnly(true)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition",
              pendingOnly
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800"
            )}
          >
            Pending
          </button>
          <button
            onClick={() => setPendingOnly(false)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition",
              !pendingOnly
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800"
            )}
          >
            All
          </button>
        </div>

        {loading ? (
          <div className="text-center text-neutral-500 mt-20">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-neutral-500 mt-20">
            No tasks yet — create one to get started
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                  className="mt-1 w-5 h-5 cursor-pointer"
                />
                <div className="flex-1">
                  <div className={clsx("font-medium", task.completed && "line-through opacity-60")}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {task.description}
                    </div>
                  )}
                  {task.dueAt && (
                    <div className="text-xs text-neutral-500 mt-2">
                      Due: {new Date(task.dueAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
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
