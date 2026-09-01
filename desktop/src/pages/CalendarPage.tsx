import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X,
  CalendarDays, Clock, Loader2, CheckSquare, StickyNote, AlignLeft,
  Trash2, Pencil, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { CalendarEvent, Task } from "@/lib/types";
import dayjs from "dayjs";
import { clsx } from "clsx";

type ViewMode = "year" | "month" | "day";
type TabMode = "tasks" | "notes";

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({
  defaultDate, onClose, onCreated,
}: {
  defaultDate: string;
  onClose: () => void;
  onCreated: (e: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
      await api.createTask({ title: title.trim(), description: description.trim() || undefined, dueAt: eventDate ? new Date(eventDate).toISOString() : undefined });
      const created = await api.createCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate,
        type: "TASK",
        startAt: startTime ? `${eventDate}T${startTime}:00` : undefined,
        endAt: endTime ? `${eventDate}T${endTime}:00` : undefined,
      });
      onCreated(created);
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
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold dark:text-white">New Task</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Title *</label>
            <input ref={ref} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Date *
            </label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Start
              </label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5" /> End
              </label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm" />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Notes
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Details (optional)..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm resize-none" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none disabled:opacity-50 transition">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main CalendarPage ────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [tab, setTab] = useState<TabMode>("tasks");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [yearHeatmap, setYearHeatmap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => { loadData(); }, [view, currentDate, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const effectiveView = tab === "notes" ? "month" : view;

      if (effectiveView === "year") {
        const heatmap = await api.getYearHeatmap(currentDate.year());
        setYearHeatmap(heatmap);
      } else if (effectiveView === "month") {
        // For notes, fetch a broader range (last 90 days)
        const from = tab === "notes"
          ? dayjs().subtract(90, "day").format("YYYY-MM-DD")
          : currentDate.startOf("month").format("YYYY-MM-DD");
        const to = tab === "notes"
          ? dayjs().format("YYYY-MM-DD")
          : currentDate.endOf("month").format("YYYY-MM-DD");
        const [evts, taskList] = await Promise.all([
          api.getCalendarRange(from, to),
          api.getTasks(false),
        ]);
        setAllEvents(evts);
        setTasks(taskList);
      } else {
        const [evts, taskList] = await Promise.all([
          api.getCalendarDay(currentDate.format("YYYY-MM-DD")),
          api.getTasks(false),
        ]);
        setAllEvents(evts);
        setTasks(taskList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mergedEvents: CalendarEvent[] = [
    ...allEvents,
    ...tasks
      .filter((t) => t.dueAt)
      .map((t): CalendarEvent => ({
        id: -(t.id),
        title: t.title,
        description: t.description,
        eventDate: dayjs(t.dueAt).format("YYYY-MM-DD"),
        type: "TASK",
        startAt: t.dueAt,
        endAt: undefined,
        completed: t.completed,
        reminderSent: t.reminderSent,
        createdAt: t.createdAt,
      }))
      .filter(
        (synced) =>
          !allEvents.some(
            (e) => e.type === "TASK" && e.title === synced.title && e.eventDate === synced.eventDate
          )
      ),
  ];

  const filteredEvents = mergedEvents.filter((e) =>
    tab === "tasks" ? e.type === "TASK" : e.type === "NOTE"
  );

  const navigate = (dir: "prev" | "next") => {
    const delta = dir === "next" ? 1 : -1;
    const unit = (tab === "tasks" && view === "year") ? "year" : (tab === "notes" || view === "month") ? "month" : "day";
    setCurrentDate(currentDate.add(delta, unit));
  };

  const defaultDate = currentDate.format("YYYY-MM-DD");

  return (
    <div className="h-full flex flex-col bg-[#EDE9DF] dark:bg-neutral-950">
      <AnimatePresence>
        {showTaskModal && (
          <AddTaskModal
            defaultDate={defaultDate}
            onClose={() => setShowTaskModal(false)}
            onCreated={(e) => { setAllEvents((p) => [...p, e]); }}
          />
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#FAF9F5] dark:bg-neutral-900 border-b border-neutral-200/70 dark:border-neutral-800 shadow-xs">
        {/* Top row: title + nav + add button */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Nav arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("prev")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("next")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month/Year title */}
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {tab === "notes" || view === "month"
                ? currentDate.format("MMMM")
                : view === "year"
                  ? currentDate.format("YYYY")
                  : currentDate.format("MMMM D")}
              {(tab === "notes" || view === "month") && (
                <span className="text-neutral-400 dark:text-neutral-500 font-medium ml-2 text-xl">
                  {currentDate.format("YYYY")}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Today button */}
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
            >
              Today
            </button>

            {/* Tab toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
              {(["tasks", "notes"] as TabMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    "flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200",
                    tab === t
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  )}
                >
                  {t === "tasks" ? <CheckSquare className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                  {t === "tasks" ? "Tasks" : "Notes"}
                </button>
              ))}
            </div>

            {/* Add task button (tasks only) */}
            {tab === "tasks" && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: View toggle pills (tasks only) */}
        {tab === "tasks" && (
          <div className="px-6 pb-3 flex items-center gap-1">
            {(["year", "month", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 capitalize",
                  view === v
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : tab === "notes" ? (
          <NotesFeed
            events={filteredEvents}
            onCreated={(e) => setAllEvents((p) => [...p, e])}
            onReload={loadData}
          />
        ) : view === "year" ? (
          <div className="p-6">
            <YearView heatmap={yearHeatmap} year={currentDate.year()} />
          </div>
        ) : view === "month" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`month-${tab}-${currentDate.format("YYYY-MM")}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="p-6"
            >
              <MonthView
                events={filteredEvents}
                month={currentDate}
                tab={tab}
                onDayClick={(date) => { setCurrentDate(date); setView("day"); }}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`day-${tab}-${currentDate.format("YYYY-MM-DD")}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="p-6"
            >
              <DayView events={filteredEvents} tab={tab} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Notes Feed — diary-style, last 7 days by default ────────────────────────
function NotesFeed({
  events, onCreated, onReload,
}: {
  events: CalendarEvent[];
  onCreated: (e: CalendarEvent) => void;
  onReload: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [manualDates, setManualDates] = useState<string[]>([]);

  // Group events by date
  const byDate: Record<string, CalendarEvent[]> = {};

  // Always include the last 7 days by default so the user has immediate day cards
  const defaultRecentDays = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(i, "day").format("YYYY-MM-DD")
  );
  const allDateStrings = new Set<string>(defaultRecentDays);

  events.forEach((e) => {
    if (!byDate[e.eventDate]) byDate[e.eventDate] = [];
    byDate[e.eventDate].push(e);
    allDateStrings.add(e.eventDate);
  });
  manualDates.forEach(d => allDateStrings.add(d));

  // Build date list sorted descending, take top 7 if not showAll
  let days = Array.from(allDateStrings).sort((a,b) => b.localeCompare(a));
  if (!showAll && days.length > 7) {
    days = days.slice(0, 7);
  }

  const handleCreated = (e: CalendarEvent) => {
    onCreated(e);
  };

  const handleAddedDay = (date: string) => {
    if (!manualDates.includes(date)) setManualDates(p => [...p, date]);
    setAddingDate(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
      {days.map((date) => (
        <DiaryDayCard
          key={date}
          date={date}
          notes={byDate[date] || []}
          onCreated={handleCreated}
          onReload={onReload}
        />
      ))}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-6 pb-8 border-t border-neutral-200/60 dark:border-neutral-800 mt-4">
        {!showAll && allDateStrings.size > 7 ? (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            See all notes →
          </button>
        ) : showAll && allDateStrings.size > 7 ? (
          <button
            onClick={() => setShowAll(false)}
            className="text-sm font-semibold text-neutral-500 hover:underline"
          >
            ← Show less
          </button>
        ) : <div />}

        <button
          onClick={() => setAddingDate(dayjs().format("YYYY-MM-DD"))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:bg-neutral-700 dark:hover:bg-neutral-100 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Day / Note
        </button>
      </div>

      {/* Quick-add modal for extra date */}
      <AnimatePresence>
        {addingDate && (
          <QuickAddNoteModal
            date={addingDate}
            onClose={() => setAddingDate(null)}
            onAdded={handleAddedDay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Single diary day card ────────────────────────────────────────────────────
function DiaryDayCard({
  date, notes, onCreated,
}: {
  date: string;
  notes: CalendarEvent[];
  onCreated: (e: CalendarEvent) => void;
  onReload: () => void;
}) {
  const d = dayjs(date);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEdit = (note: CalendarEvent) => {
    setEditId(note.id);
    setEditText(note.title);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    await api.updateCalendarEvent(editId, editText.trim());
    setEditId(null);
    onReload();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this note?")) {
      await api.deleteCalendarEvent(id);
      onReload();
    }
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const created = await api.createCalendarEvent({
        title: trimmed,
        description: undefined,
        eventDate: date,
        type: "NOTE",
      });
      onCreated(created);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.value = "";
      }
    } catch {
      // noop
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 220) + "px";
  };

  return (
    <div className="mb-1">
      {/* Date header — styled like the diary screenshot */}
      <div className="bg-[#EDE9DF] dark:bg-neutral-800/60 rounded-t-xl px-5 py-3 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-neutral-900 dark:text-white mr-2">
            {d.format("DD")}
          </span>
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            {d.format("MMM, dddd").toUpperCase()}
          </span>
        </div>
        {notes.length > 0 && (
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="bg-[#FAF9F5] dark:bg-neutral-900 border border-t-0 border-neutral-200/70 dark:border-neutral-800 rounded-b-xl px-5 pt-4 pb-5 mb-4 shadow-sm">
        {/* Existing notes */}
        {notes.map((note) => (
          <div key={note.id} className="group relative flex flex-col mb-3">
            {editId === note.id ? (
              <div className="flex flex-col gap-2 mb-2 p-2 bg-white dark:bg-neutral-800/80 rounded-xl border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
                <textarea
                  rows={2}
                  className="w-full px-2 py-1 outline-none text-sm bg-transparent text-neutral-900 dark:text-neutral-100 resize-none"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      setEditId(null);
                    }
                  }}
                  autoFocus
                />
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-700">
                  <span className="text-[11px] text-neutral-400">Press Ctrl+Enter to save</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditId(null)}
                      className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-neutral-800 dark:text-neutral-200 text-[15px] leading-relaxed pl-2 border-l-2 border-indigo-400/60 dark:border-indigo-500 whitespace-pre-wrap">
                  {note.title}
                </p>
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-[#FAF9F5] dark:bg-neutral-900 px-1 rounded shadow-sm">
                  <button onClick={() => handleEdit(note)} title="Edit note" className="p-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={() => handleDelete(note.id)} title="Delete note" className="p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded transition"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Inline write area */}
        <div className="relative mt-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Write your thoughts here... (Ctrl+Enter to save)"
            rows={2}
            className="w-full bg-transparent resize-none outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400/70 dark:placeholder:text-neutral-600 text-[15px] leading-relaxed"
            style={{ minHeight: "48px" }}
          />
          {text.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800"
            >
              <span className="text-[11px] text-neutral-400">Ctrl+Enter to save</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-100 transition disabled:opacity-50 shadow-xs"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Save Note
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick-add note modal (for "Add Day" button) ──────────────────────────────
function QuickAddNoteModal({
  date, onClose, onAdded,
}: {
  date: string;
  onClose: () => void;
  onAdded: (date: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(date);

  const handleSave = () => {
    onAdded(selectedDate);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
      >
        {/* Date header */}
        <div className="bg-[#EDE9DF] dark:bg-neutral-800 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mr-2">
              {dayjs(selectedDate).format("DD")}
            </span>
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              {dayjs(selectedDate).format("MMM, dddd").toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-neutral-700 transition">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:bg-neutral-700 dark:hover:bg-neutral-100 transition">
              <Plus className="w-3.5 h-3.5" />
              Add Day
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Year View ────────────────────────────────────────────────────────────────
function YearView({ heatmap, year }: { heatmap: Record<number, number>; year: number }) {
  const months = Array.from({ length: 12 }, (_, i) => dayjs().year(year).month(i));
  const maxCount = Math.max(...Object.values(heatmap), 1);

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map((m) => {
        const monthNum = m.month() + 1;
        const count = heatmap[monthNum] || 0;
        const intensity = count / maxCount;
        return (
          <motion.div
            key={monthNum}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: `rgba(99, 102, 241, ${0.06 + intensity * 0.3})` }}
          >
            <div className="text-base font-bold dark:text-white">{m.format("MMMM")}</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {count} event{count !== 1 && "s"}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({
  events, month, tab, onDayClick,
}: {
  events: CalendarEvent[];
  month: dayjs.Dayjs;
  tab: TabMode;
  onDayClick: (date: dayjs.Dayjs) => void;
}) {
  const startDay = month.startOf("month").day();
  const daysInMonth = month.daysInMonth();
  const blanks = Array.from({ length: startDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const byDate = events.reduce((acc, e) => {
    const k = e.eventDate;
    if (!acc[k]) acc[k] = [];
    acc[k].push(e);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const accent = tab === "tasks"
    ? { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-800 dark:text-indigo-200", ring: "ring-indigo-300 dark:ring-indigo-700" }
    : { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-800 dark:text-emerald-200", ring: "ring-emerald-300 dark:ring-emerald-700" };

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider py-2">{d}</div>
      ))}
      {blanks.map((_, i) => <div key={`b${i}`} />)}
      {days.map((day) => {
        const date = month.date(day);
        const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = byDate[dateStr] || [];
        const isToday = date.isSame(dayjs(), "day");

        return (
          <motion.div
            key={day}
            onClick={() => onDayClick(date)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.12 }}
            className={clsx(
              "rounded-2xl p-2.5 min-h-[88px] cursor-pointer border transition-shadow hover:shadow-md dark:border-neutral-800",
              isToday
                ? `ring-2 ${accent.ring} bg-white dark:bg-neutral-900 border-transparent`
                : "bg-white/60 dark:bg-neutral-900/40 border-neutral-100"
            )}
          >
            <div className={clsx(
              "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
              isToday
                ? (tab === "tasks" ? "bg-indigo-500 text-white" : "bg-emerald-500 text-white")
                : "text-neutral-700 dark:text-neutral-300"
            )}>
              {day}
            </div>
            <div className="mt-1 space-y-0.5">
              {dayEvents.slice(0, 3).map((e) => (
                <div key={e.id} className={clsx("text-[11px] px-1.5 py-0.5 rounded-lg truncate font-medium", accent.bg, accent.text)}>
                  {e.completed ? "✓ " : ""}{e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[11px] text-neutral-400 pl-1">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────
function DayView({ events, tab }: { events: CalendarEvent[]; tab: TabMode }) {
  const allDay = events.filter((e) => !e.startAt);
  const timed = events.filter((e) => !!e.startAt);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const tagCls = tab === "tasks"
    ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200 border-l-2 border-indigo-400"
    : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200 border-l-2 border-emerald-400";

  return (
    <div className="max-w-2xl space-y-3">
      {allDay.length > 0 && (
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 p-4">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">All Day</div>
          <div className="space-y-1.5">
            {allDay.map((e) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className={clsx("px-3 py-2 rounded-xl", tagCls)}>
                <div className="font-semibold text-sm">{e.completed ? "✓ " : ""}{e.title}</div>
                {e.description && <div className="text-xs mt-0.5 opacity-75">{e.description}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 overflow-hidden">
        {hours.map((hour) => {
          const hourEvents = timed.filter((e) => e.startAt && dayjs(e.startAt).hour() === hour);
          const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
          return (
            <div key={hour} className={clsx("flex gap-4 px-4 py-1 min-h-[40px]", hour < 23 && "border-b border-neutral-50 dark:border-neutral-800/50")}>
              <div className="w-14 text-xs text-neutral-300 dark:text-neutral-600 pt-1 text-right flex-shrink-0">{label}</div>
              <div className="flex-1 py-0.5 space-y-1">
                {hourEvents.map((e) => (
                  <motion.div key={e.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    className={clsx("px-2.5 py-1.5 rounded-lg text-xs", tagCls)}>
                    <div className="font-semibold">{e.title}</div>
                    {e.description && <div className="opacity-70 mt-0.5">{e.description}</div>}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
