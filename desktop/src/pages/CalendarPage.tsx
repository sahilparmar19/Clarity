import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { CalendarEvent } from "@/lib/types";
import dayjs from "dayjs";
import { clsx } from "clsx";

type ViewMode = "year" | "month" | "day";

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [yearHeatmap, setYearHeatmap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

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
    if (view === "year") {
      setCurrentDate(currentDate.add(direction === "next" ? 1 : -1, "year"));
    } else if (view === "month") {
      setCurrentDate(currentDate.add(direction === "next" ? 1 : -1, "month"));
    } else {
      setCurrentDate(currentDate.add(direction === "next" ? 1 : -1, "day"));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {view === "year" && currentDate.format("YYYY")}
            {view === "month" && currentDate.format("MMMM YYYY")}
            {view === "day" && currentDate.format("dddd, MMMM D, YYYY")}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => navigate("prev")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              Today
            </button>
            <button
              onClick={() => navigate("next")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 outline-none"
          >
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="day">Day</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Loading...
          </div>
        ) : view === "year" ? (
          <YearView heatmap={yearHeatmap} year={currentDate.year()} />
        ) : view === "month" ? (
          <MonthView events={events} month={currentDate} />
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
            className="border rounded-lg p-4 hover:shadow-md transition"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${intensity * 0.6})`,
            }}
          >
            <div className="text-lg font-semibold">{m.format("MMMM")}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {count} event{count !== 1 && "s"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ events, month }: { events: CalendarEvent[]; month: dayjs.Dayjs }) {
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
        <div key={d} className="text-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 py-2">
          {d}
        </div>
      ))}
      {blanks.map((i) => (
        <div key={`blank-${i}`} />
      ))}
      {days.map((day) => {
        const date = month.date(day);
        const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = eventsByDate[dateStr] || [];
        const isToday = date.isSame(dayjs(), "day");

        return (
          <div
            key={day}
            className={clsx(
              "border rounded-lg p-2 min-h-[100px] hover:shadow-md transition cursor-pointer",
              isToday && "ring-2 ring-neutral-900 dark:ring-white"
            )}
          >
            <div className={clsx("text-sm font-medium", isToday && "font-bold")}>{day}</div>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  className={clsx(
                    "text-xs px-2 py-1 rounded truncate",
                    e.type === "TASK"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                  )}
                >
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-neutral-500">+{dayEvents.length - 3} more</div>
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

  return (
    <div className="space-y-2">
      {hours.map((hour) => {
        const hourEvents = events.filter((e) =>
          e.startAt ? dayjs(e.startAt).hour() === hour : hour === 0
        );

        return (
          <div key={hour} className="flex gap-4">
            <div className="w-20 text-sm text-neutral-600 dark:text-neutral-400 pt-1">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
            <div className="flex-1 border-t pt-2">
              {hourEvents.map((e) => (
                <div
                  key={e.id}
                  className={clsx(
                    "px-3 py-2 rounded-lg mb-2",
                    e.type === "TASK"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                  )}
                >
                  <div className="font-medium">{e.title}</div>
                  {e.description && (
                    <div className="text-sm mt-1 opacity-80">{e.description}</div>
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
