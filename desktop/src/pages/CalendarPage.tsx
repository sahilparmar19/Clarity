import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X,
  CalendarDays, Clock, Loader2, CheckSquare, StickyNote, AlignLeft,
  Trash2, Pencil, Sparkles, Check
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
      await api.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: eventDate ? new Date(eventDate).toISOString() : undefined
      });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#12141D] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] border border-white/[0.08] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#151824]/80 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.2)]">
              <CheckSquare className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F4F8]">New Calendar Task</h2>
              <p className="text-xs text-[#94A3B8]/60">Add a scheduled item to your agenda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8]/50 hover:text-[#F4F4F8] hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              ref={ref}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly product sync & sprint review"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] placeholder-[#94A3B8]/30 outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Scheduled Date *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5" /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Description & Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add agenda, links or context..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] placeholder-[#94A3B8]/30 outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm transition resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-[#E11D48] font-medium bg-[#E11D48]/10 p-2.5 rounded-lg border border-[#E11D48]/20">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm font-semibold text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F4F4F8] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 transition cursor-pointer"
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

  useEffect(() => {
    loadData();
  }, [view, currentDate, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const effectiveView = tab === "notes" ? "month" : view;

      if (effectiveView === "year") {
        const heatmap = await api.getYearHeatmap(currentDate.year());
        setYearHeatmap(heatmap);
      } else if (effectiveView === "month") {
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
    <div className="h-full flex flex-col bg-[#090A0F]">
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
      <div className="shrink-0 bg-[#0C0D14]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Nav Arrows & Title */}
            <div className="flex items-center gap-1 bg-[#12141D] p-1 rounded-xl border border-white/[0.07]">
              <button
                onClick={() => navigate("prev")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#151824] text-[#94A3B8] hover:text-[#F4F4F8] transition cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                onClick={() => navigate("next")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#151824] text-[#94A3B8] hover:text-[#F4F4F8] transition cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Current View Title */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F4F4F8] flex items-center gap-2">
                {tab === "notes" || view === "month"
                  ? currentDate.format("MMMM")
                  : view === "year"
                    ? currentDate.format("YYYY")
                    : currentDate.format("dddd, MMM D")}
                {(tab === "notes" || view === "month") && (
                  <span className="text-[#94A3B8]/50 font-semibold text-lg">
                    {currentDate.format("YYYY")}
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Today Button */}
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-white/[0.08] bg-[#12141D] text-[#94A3B8] hover:text-[#F4F4F8] hover:bg-[#151824] transition cursor-pointer"
            >
              Today
            </button>

            {/* Tasks / Notes Tab Pill Switcher */}
            <div className="flex items-center bg-[#12141D] rounded-xl p-1 border border-white/[0.07]">
              {(["tasks", "notes"] as TabMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none",
                    tab === t
                      ? "bg-[#151824] text-[#F4F4F8] border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                      : "text-[#94A3B8]/50 hover:text-[#94A3B8]"
                  )}
                >
                  {t === "tasks" ? (
                    <CheckSquare className={clsx("w-3.5 h-3.5 stroke-[2]", tab === t && "text-[#7C3AED]")} />
                  ) : (
                    <StickyNote className={clsx("w-3.5 h-3.5 stroke-[2]", tab === t && "text-[#7C3AED]")} />
                  )}
                  {t === "tasks" ? "Tasks" : "Notes"}
                </button>
              ))}
            </div>

            {/* Add Task Button (Tasks tab only) */}
            {tab === "tasks" && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition shadow-[0_0_20px_rgba(124,58,237,0.25)] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* View Mode Switcher (Year / Month / Day - Only for Tasks) */}
        {tab === "tasks" && (
          <div className="px-6 pb-3.5 flex items-center gap-1.5">
            {(["year", "month", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  "px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer",
                  view === v
                    ? "bg-[#151824] text-[#F4F4F8] border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-[#94A3B8]/50 hover:bg-[#12141D] hover:text-[#94A3B8]"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content Body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[#94A3B8]/50 gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
            <span className="text-sm font-medium">Loading agenda...</span>
          </div>
        ) : tab === "notes" ? (
          <NotesFeed
            events={filteredEvents}
            onCreated={(e) => setAllEvents((p) => [...p, e])}
            onReload={loadData}
          />
        ) : view === "year" ? (
          <div className="max-w-6xl mx-auto p-8">
            <YearView heatmap={yearHeatmap} year={currentDate.year()} />
          </div>
        ) : view === "month" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`month-${tab}-${currentDate.format("YYYY-MM")}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="max-w-7xl mx-auto p-6"
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="max-w-3xl mx-auto p-6"
            >
              <DayView events={filteredEvents} tab={tab} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Notes Feed ───────────────────────────────────────────────────────────────
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

  const byDate: Record<string, CalendarEvent[]> = {};
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

  let days = Array.from(allDateStrings).sort((a, b) => b.localeCompare(a));
  if (!showAll && days.length > 7) {
    days = days.slice(0, 7);
  }

  const handleAddedDay = (date: string) => {
    if (!manualDates.includes(date)) setManualDates(p => [...p, date]);
    setAddingDate(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {days.map((date) => (
        <DiaryDayCard
          key={date}
          date={date}
          notes={byDate[date] || []}
          onCreated={onCreated}
          onReload={onReload}
        />
      ))}

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-6 pb-12 border-t border-white/[0.06]">
        {!showAll && allDateStrings.size > 7 ? (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition cursor-pointer"
          >
            Show earlier notes ({allDateStrings.size - 7} more days) →
          </button>
        ) : showAll && allDateStrings.size > 7 ? (
          <button
            onClick={() => setShowAll(false)}
            className="text-xs font-semibold text-[#94A3B8]/50 hover:text-[#94A3B8] transition cursor-pointer"
          >
            ← Show recent 7 days only
          </button>
        ) : <div />}

        <button
          onClick={() => setAddingDate(dayjs().format("YYYY-MM-DD"))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12141D] border border-white/[0.08] text-[#F4F4F8] font-semibold text-xs hover:bg-[#151824] hover:border-white/[0.12] transition shadow-[0_2px_8px_rgba(0,0,0,0.3)] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
          Add Specific Date
        </button>
      </div>

      {/* Quick Add Day Modal */}
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

// ─── Single Day Note Card ─────────────────────────────────────────────────────
function DiaryDayCard({
  date, notes, onCreated, onReload,
}: {
  date: string;
  notes: CalendarEvent[];
  onCreated: (e: CalendarEvent) => void;
  onReload: () => void;
}) {
  const d = dayjs(date);
  const isToday = d.isSame(dayjs(), "day");
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
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
  };

  return (
    <div className="bg-[#12141D] rounded-2xl border border-white/[0.07] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-white/[0.12] transition-colors">
      {/* Date Header Strip */}
      <div className="px-5 py-3.5 bg-[#151824]/60 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base",
            isToday
              ? "bg-[#7C3AED] text-white shadow-[0_0_16px_rgba(124,58,237,0.4)]"
              : "bg-[#0C0D14] text-[#94A3B8] border border-white/[0.06]"
          )}>
            {d.format("DD")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F4F8]">
                {d.format("dddd")}
              </span>
              {isToday && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#7C3AED]/15 text-[#7C3AED] text-[10px] font-bold uppercase tracking-wide border border-[#7C3AED]/25">
                  Today
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8]/50 font-medium">
              {d.format("MMMM D, YYYY")}
            </p>
          </div>
        </div>

        {notes.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0C0D14] text-[#94A3B8]/60 border border-white/[0.06]">
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Note Items & Writing Area */}
      <div className="p-5 space-y-3.5">
        {/* Existing Note List */}
        {notes.length > 0 && (
          <div className="space-y-2.5">
            {notes.map((note) => (
              <div key={note.id} className="group relative rounded-xl transition-all">
                {editId === note.id ? (
                  <div className="p-3 bg-[#0C0D14] rounded-xl border border-[#7C3AED]/30 space-y-2">
                    <textarea
                      rows={2}
                      className="w-full bg-transparent text-sm text-[#F4F4F8] outline-none resize-none"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSaveEdit();
                        } else if (e.key === "Escape") {
                          setEditId(null);
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] text-[#94A3B8]/40">Ctrl+Enter to save • Esc to cancel</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditId(null)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#94A3B8]/50 hover:text-[#94A3B8] transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-lg shadow-[0_0_12px_rgba(124,58,237,0.3)] transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#0C0D14]/60 border border-white/[0.05] hover:bg-[#151824]/60 hover:border-white/[0.09] transition">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-2 flex-shrink-0 shadow-[0_0_6px_rgba(124,58,237,0.5)]" />
                      <p className="text-sm font-normal text-[#F4F4F8]/80 leading-relaxed whitespace-pre-wrap flex-1">
                        {note.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(note)}
                        title="Edit note"
                        className="p-1 rounded-lg text-[#94A3B8]/40 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        title="Delete note"
                        className="p-1 rounded-lg text-[#94A3B8]/40 hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inline Note Entry Box */}
        <div className="pt-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Add a quick note for ${d.format("MMM D")}... (Ctrl+Enter to save)`}
            rows={1}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C0D14]/80 border border-white/[0.06] text-[#F4F4F8] placeholder-[#94A3B8]/30 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/30 transition resize-none"
            style={{ minHeight: "44px" }}
          />

          {text.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mt-2 px-1"
            >
              <span className="text-[11px] text-[#94A3B8]/40">Ctrl + Enter to save</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition shadow-[0_0_12px_rgba(124,58,237,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[2.2]" />}
                Save Note
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Add Note Modal ─────────────────────────────────────────────────────
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-[#12141D] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] border border-white/[0.08] overflow-hidden"
      >
        <div className="px-6 py-4.5 bg-[#151824]/80 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.2)]">
              <StickyNote className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F8]">Add Date Note</h3>
              <p className="text-[11px] text-[#94A3B8]/50">Pick any date for the notes feed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#94A3B8]/50 hover:text-[#F4F4F8] hover:bg-white/[0.06] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-semibold text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F4F4F8] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-semibold text-xs hover:bg-[#6D28D9] transition shadow-[0_0_16px_rgba(124,58,237,0.3)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              Add Day Card
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Year View (Task Activity Heatmap) ─────────────────────────────────────────
function YearView({ heatmap, year }: { heatmap: Record<number, number>; year: number }) {
  const months = Array.from({ length: 12 }, (_, i) => dayjs().year(year).month(i));
  const maxCount = Math.max(...Object.values(heatmap), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {months.map((m) => {
        const monthNum = m.month() + 1;
        const count = heatmap[monthNum] || 0;
        const intensity = count / maxCount;
        return (
          <motion.div
            key={monthNum}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.12 }}
            className="rounded-2xl p-5 border border-white/[0.07] bg-[#12141D] shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-white/[0.12] transition-all relative overflow-hidden group"
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ backgroundColor: `rgba(124,58,237,${0.03 + intensity * 0.12})` }}
            />
            <div className="relative z-10 flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-[#F4F4F8]">
                {m.format("MMMM")}
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25">
                {count} {count === 1 ? "task" : "tasks"}
              </span>
            </div>
            <div className="relative z-10 w-full bg-[#0C0D14] h-1.5 rounded-full overflow-hidden mt-4 border border-white/[0.04]">
              <div
                className="bg-[#7C3AED] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                style={{ width: `${Math.min(100, Math.max(8, intensity * 100))}%` }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Month View (Grid) ────────────────────────────────────────────────────────
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

  return (
    <div className="bg-[#12141D] rounded-2xl border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-4 overflow-hidden">
      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-[#94A3B8]/40 uppercase tracking-wider py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => (
          <div key={`b${i}`} className="min-h-[100px] rounded-xl bg-[#0C0D14]/30 border border-transparent" />
        ))}
        {days.map((day) => {
          const date = month.date(day);
          const dateStr = date.format("YYYY-MM-DD");
          const dayEvents = byDate[dateStr] || [];
          const isToday = date.isSame(dayjs(), "day");

          return (
            <motion.div
              key={day}
              onClick={() => onDayClick(date)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
              className={clsx(
                "rounded-xl p-2.5 min-h-[100px] cursor-pointer border transition-all flex flex-col justify-between group",
                isToday
                  ? "ring-2 ring-[#7C3AED]/60 bg-[#7C3AED]/[0.06] border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                  : "bg-[#0C0D14]/40 hover:bg-[#151824]/80 border-white/[0.04] hover:border-white/[0.1]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={clsx(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
                  isToday
                    ? "bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                    : "text-[#94A3B8]/60 group-hover:text-[#F4F4F8]"
                )}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    tab === "tasks" ? "bg-[#7C3AED] shadow-[0_0_6px_rgba(124,58,237,0.6)]" : "bg-[#E11D48] shadow-[0_0_6px_rgba(225,29,72,0.6)]"
                  )} />
                )}
              </div>

              {/* Event Chips */}
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className="text-[11px] px-2 py-1 rounded-md truncate font-semibold bg-[#7C3AED]/10 text-[#7C3AED]/80 border-l-2 border-[#7C3AED]/50"
                  >
                    {e.completed ? "✓ " : ""}{e.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-[#94A3B8]/40 font-semibold pl-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day View (Timeline Agenda) ───────────────────────────────────────────────
function DayView({ events, tab }: { events: CalendarEvent[]; tab: TabMode }) {
  const allDay = events.filter((e) => !e.startAt);
  const timed = events.filter((e) => !!e.startAt);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* All-day Section */}
      {allDay.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#12141D] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div className="text-xs font-bold text-[#94A3B8]/40 uppercase tracking-wider mb-3">All Day Tasks</div>
          <div className="space-y-2">
            {allDay.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3.5 py-2.5 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]/90 border-l-[3px] border-[#7C3AED]/60 shadow-[0_0_12px_rgba(124,58,237,0.08)]"
              >
                <div className="font-bold text-sm">{e.completed ? "✓ " : ""}{e.title}</div>
                {e.description && <div className="text-xs mt-0.5 opacity-70">{e.description}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Timeline */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#12141D] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {hours.map((hour) => {
          const hourEvents = timed.filter((e) => e.startAt && dayjs(e.startAt).hour() === hour);
          const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
          return (
            <div
              key={hour}
              className={clsx(
                "flex gap-4 px-5 py-2 min-h-[48px] items-start",
                hour < 23 && "border-b border-white/[0.04]"
              )}
            >
              <div className="w-14 text-xs font-semibold text-[#94A3B8]/30 pt-1 text-right flex-shrink-0">
                {label}
              </div>
              <div className="flex-1 py-0.5 space-y-1.5 border-l border-dashed border-white/[0.05] pl-4 min-h-[36px]">
                {hourEvents.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-3 py-2 rounded-xl text-xs bg-[#7C3AED]/10 text-[#7C3AED]/90 border-l-[3px] border-[#7C3AED]/50 shadow-[0_0_10px_rgba(124,58,237,0.08)]"
                  >
                    <div className="font-bold text-sm">{e.title}</div>
                    {e.description && <div className="opacity-70 mt-0.5 text-xs">{e.description}</div>}
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
