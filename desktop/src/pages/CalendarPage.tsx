import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, AlignLeft, CalendarDays, Clock, Tag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import dayjs from "dayjs";
import { clsx } from "clsx";

type ViewMode = "year" | "month" | "day";

// --- New Event Modal ---
function NewEventModal({
  defaultDate,
  onClose,
  onCreated,
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
  const [type, setType] = useState<"TASK" | "NOTE">("NOTE");
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
    if (!eventDate) { setError("Event date is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload: Partial<CalendarEvent> = {
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate,
        type,
        startAt: startTime ? `${eventDate}T${startTime}:00` : undefined,
        endAt: endTime ? `${eventDate}T${endTime}:00` : undefined,
      };
      const created = await api.createCalendarEvent(payload);
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create event.");
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
          <h2 className="text-lg font-semibold dark:text-white">New Event</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["NOTE", "TASK"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition",
                  type === t
                    ? t === "TASK"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-green-600 text-white border-green-600"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}
              >
                <Tag className="w-3.5 h-3.5" />
                {t === "TASK" ? "Task" : "Note"}
              </button>
            ))}
          </div>

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
              placeholder="Event name..."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              <CalendarDays className="w-4 h-4" /> Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <Clock className="w-4 h-4" /> Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <Clock className="w-4 h-4" /> End
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition"
              />
            </div>
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
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [yearHeatmap, setYearHeatmap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [view, currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === "year") {
        const heatmap = await api.getYearHeatmap(currentDate.year());
        setYearHeatmap(heatmap);
      } else if (view === "month") {
        const from = currentDate.startOf("month").format("YYYY-MM-DD");
        const to = currentDate.endOf("month").format("YYYY-MM-DD");
        const data = await api.getCalendarRange(from, to);
        setEvents(data);
      } else {
        const data = await api.getCalendarDay(currentDate.format("YYYY-MM-DD"));
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (direction: "prev" | "next") => {
    const delta = direction === "next" ? 1 : -1;
    const unit = view === "year" ? "year" : view === "month" ? "month" : "day";
    setCurrentDate(currentDate.add(delta, unit));
  };

  const defaultModalDate = currentDate.format("YYYY-MM-DD");

  return (
    <div className="h-full flex flex-col">
      {showModal && (
        <NewEventModal
          defaultDate={defaultModalDate}
          onClose={() => setShowModal(false)}
          onCreated={(e) => {
            setEvents((prev) => [...prev, e]);
            // also refresh heatmap if year view
            if (view === "year") loadData();
          }}
        />
      )}

      {/* Header */}
      <div className="border-b p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold dark:text-white">
            {view === "year" && currentDate.format("YYYY")}
            {view === "month" && currentDate.format("MMMM YYYY")}
            {view === "day" && currentDate.format("dddd, MMMM D, YYYY")}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => navigate("prev")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              Today
            </button>
            <button
              onClick={() => navigate("next")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 dark:text-white outline-none"
          >
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="day">Day</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : view === "year" ? (
          <YearView heatmap={yearHeatmap} year={currentDate.year()} />
        ) : view === "month" ? (
          <MonthView
            events={events}
            month={currentDate}
            onDayClick={(date) => {
              setCurrentDate(date);
              setView("day");
            }}
          />
        ) : (
          <DayView events={events} date={currentDate} />
        )}
      </div>
    </div>
  );
}

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
          <div
            key={monthNum}
            className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer"
            style={{ backgroundColor: `rgba(59, 130, 246, ${intensity * 0.6})` }}
          >
            <div className="text-lg font-semibold dark:text-white">{m.format("MMMM")}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {count} event{count !== 1 && "s"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({
  events,
  month,
  onDayClick,
}: {
  events: CalendarEvent[];
  month: dayjs.Dayjs;
  onDayClick: (date: dayjs.Dayjs) => void;
}) {
  const startDay = month.startOf("month").day();
  const daysInMonth = month.daysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const eventsByDate = events.reduce((acc, e) => {
    const key = e.eventDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400 py-2">
          {d}
        </div>
      ))}
      {blanks.map((i) => <div key={`blank-${i}`} />)}
      {days.map((day) => {
        const date = month.date(day);
        const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = eventsByDate[dateStr] || [];
        const isToday = date.isSame(dayjs(), "day");

        return (
          <div
            key={day}
            onClick={() => onDayClick(date)}
            className={clsx(
              "border rounded-xl p-2 min-h-[90px] hover:shadow-md transition cursor-pointer dark:border-neutral-700",
              isToday && "ring-2 ring-neutral-900 dark:ring-white"
            )}
          >
            <div className={clsx("text-sm font-medium dark:text-white", isToday && "font-bold")}>
              {day}
            </div>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  className={clsx(
                    "text-xs px-1.5 py-0.5 rounded truncate",
                    e.type === "TASK"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                  )}
                >
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-neutral-400">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ events, date }: { events: CalendarEvent[]; date: dayjs.Dayjs }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const allDayEvents = events.filter((e) => !e.startAt);

  return (
    <div className="space-y-2 max-w-2xl">
      {allDayEvents.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">All day</div>
          <div className="space-y-1.5">
            {allDayEvents.map((e) => (
              <div
                key={e.id}
                className={clsx(
                  "px-3 py-2 rounded-xl",
                  e.type === "TASK"
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200"
                    : "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-200"
                )}
              >
                <div className="font-medium">{e.title}</div>
                {e.description && <div className="text-sm mt-0.5 opacity-80">{e.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {hours.map((hour) => {
        const hourEvents = events.filter(
          (e) => e.startAt && dayjs(e.startAt).hour() === hour
        );
        const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;

        return (
          <div key={hour} className="flex gap-4">
            <div className="w-16 text-sm text-neutral-400 pt-1 text-right shrink-0">{label}</div>
            <div className="flex-1 border-t border-neutral-100 dark:border-neutral-800 pt-1 min-h-[36px]">
              {hourEvents.map((e) => (
                <div
                  key={e.id}
                  className={clsx(
                    "px-3 py-2 rounded-xl mb-1.5",
                    e.type === "TASK"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-200"
                  )}
                >
                  <div className="font-medium text-sm">{e.title}</div>
                  {e.description && (
                    <div className="text-xs mt-0.5 opacity-80">{e.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
