import { useState, useRef } from "react";
import dayjs from "dayjs";
import {
  Lock, Unlock, Key, BookOpen, AlertCircle, Loader2,
  Plus, ChevronRight, Pencil, CalendarDays, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { DiaryEntry } from "@/lib/types";
import { clsx } from "clsx";

// ─── PIN / Lock screen ──────────────────────────────────────────────────────
function LockScreen({
  onUnlocked,
}: {
  onUnlocked: (pin: string, entries: DiaryEntry[]) => void;
}) {
  const [pin, setPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.getDiaryEntries(pin);
      onUnlocked(pin, data);
    } catch (err: any) {
      if (err.message?.includes("Diary PIN not set") || err.message?.includes("Conflict")) {
        setIsSettingPin(true);
        setError("No PIN set yet — create one to protect your diary.");
      } else {
        setError("Incorrect PIN. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) { setError("PIN must be at least 4 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await api.setDiaryPin(pin);
      await handleUnlock(e);
      setIsSettingPin(false);
    } catch {
      setError("Failed to set PIN. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/60 dark:border-neutral-800">
          {/* gradient top bar */}
          <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-10 text-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-1 ring-white/30">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Your Diary</h2>
            <p className="text-indigo-100 text-sm mt-1">Private. Locked. Yours.</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-8">
            <form onSubmit={isSettingPin ? handleSetPin : handleUnlock} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  {isSettingPin ? "Create PIN" : "Enter PIN"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isSettingPin ? "Min. 4 characters" : "••••••"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSettingPin ? (
                  <><Key className="w-4 h-4" /> Set PIN</>
                ) : (
                  <><Unlock className="w-4 h-4" /> Unlock Diary</>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsSettingPin(!isSettingPin); setError(""); setPin(""); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isSettingPin ? "Already have a PIN? Unlock" : "First time? Set your PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Diary unlocked view ─────────────────────────────────────────────────────
export default function DiaryPage() {
  const [pin, setPin] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [addingDate, setAddingDate] = useState(false);
  const [newDate, setNewDate] = useState(dayjs().format("YYYY-MM-DD"));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Build the default date list: last 14 days
  const buildDefaultDates = () =>
    Array.from({ length: 14 }, (_, i) => dayjs().subtract(i, "day").format("YYYY-MM-DD"));

  const handleUnlocked = (unlockedPin: string, fetchedEntries: DiaryEntry[]) => {
    setPin(unlockedPin);
    const map: Record<string, DiaryEntry> = {};
    fetchedEntries.forEach((e) => { map[e.date] = e; });
    setEntries(map);

    // Build date list: default 14 days + any extra dates from entries
    const defaults = buildDefaultDates();
    const extraDates = fetchedEntries
      .map((e) => e.date)
      .filter((d) => !defaults.includes(d));
    const all = [...new Set([...defaults, ...extraDates])].sort((a, b) => (a > b ? -1 : 1));
    setDates(all);
    setIsLocked(false);
  };

  const handleAddDate = () => {
    if (!dates.includes(newDate)) {
      const updated = [...new Set([...dates, newDate])].sort((a, b) => (a > b ? -1 : 1));
      setDates(updated);
    }
    setSelectedDate(newDate);
    setAddingDate(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSave = async (date: string, body: string) => {
    setSavingIds((p) => ({ ...p, [date]: true }));
    try {
      const saved = await api.saveDiaryEntry(date, pin, { body });
      setEntries((p) => ({ ...p, [date]: saved }));
      setSavedIds((p) => ({ ...p, [date]: true }));
      setTimeout(() => setSavedIds((p) => ({ ...p, [date]: false })), 2000);
    } catch {
      alert(`Failed to save entry for ${date}`);
    } finally {
      setSavingIds((p) => ({ ...p, [date]: false }));
    }
  };

  if (isLocked) return <LockScreen onUnlocked={handleUnlocked} />;

  const entry = entries[selectedDate];

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Left Sidebar: date list ─────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-neutral-200/70 dark:border-neutral-800 flex flex-col bg-white/50 dark:bg-neutral-900/40 backdrop-blur-xl">
        {/* header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm">Diary</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Add date"
              onClick={() => setAddingDate((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              title="Lock diary"
              onClick={() => { setIsLocked(true); setPin(""); setEntries({}); }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* add-date picker */}
        <AnimatePresence>
          {addingDate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-indigo-50/60 dark:bg-indigo-900/10 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white"
                />
                <button
                  onClick={handleAddDate}
                  className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* date list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {dates.map((date) => {
            const d = dayjs(date);
            const isToday = date === dayjs().format("YYYY-MM-DD");
            const isSelected = date === selectedDate;
            const hasEntry = !!entries[date]?.body;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group",
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50"
                    : "hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50"
                )}
              >
                {/* date badge */}
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight",
                  isToday
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm"
                    : isSelected
                      ? "bg-indigo-100 dark:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                )}>
                  <span className="text-[11px] opacity-80">{d.format("MMM")}</span>
                  <span className="text-sm">{d.format("D")}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    "text-sm font-medium truncate",
                    isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-300"
                  )}>
                    {isToday ? "Today" : d.format("dddd")}
                  </div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                    {hasEntry ? entries[date].body!.slice(0, 28) + (entries[date].body!.length > 28 ? "…" : "") : "No entry yet"}
                  </div>
                </div>

                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Right: editor ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* date header */}
            <div className="px-8 pt-8 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {dayjs(selectedDate).format("dddd")}
                </p>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mt-0.5">
                  {dayjs(selectedDate).format("MMMM D, YYYY")}
                </h2>
              </div>

              {/* save indicator */}
              <div className="h-8 flex items-center">
                <AnimatePresence mode="wait">
                  {savingIds[selectedDate] ? (
                    <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                    </motion.span>
                  ) : savedIds[selectedDate] ? (
                    <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-neutral-300 dark:text-neutral-600">
                      <Pencil className="w-3.5 h-3.5" /> Auto-saves on blur
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* textarea with notebook lines */}
            <div className="flex-1 overflow-auto relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)",
                  backgroundSize: "100% 32px",
                  backgroundPosition: "0 48px",
                  opacity: 0.4,
                }}
              />
              <textarea
                ref={textareaRef}
                key={selectedDate}
                defaultValue={entry?.body || ""}
                placeholder="What's on your mind today?"
                className="relative w-full h-full p-8 pt-6 bg-transparent resize-none outline-none leading-[32px] text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 text-base"
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (entry?.body || "").trim()) {
                    handleSave(selectedDate, val);
                  }
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
