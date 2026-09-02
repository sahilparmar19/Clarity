import { useState, useRef } from "react";
import dayjs from "dayjs";
import {
  Lock, Unlock, Key, BookOpen, AlertCircle, Loader2,
  Plus, ChevronRight, Pencil, CalendarDays, Check, Sparkles
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
    <div className="h-full flex items-center justify-center p-6 bg-[#F4F1EA] dark:bg-[#0E0E10]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#18181B]">
          {/* Header Gradient */}
          <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-8 text-white text-center relative">
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center ring-1 ring-white/25 shadow-inner">
              <BookOpen className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Personal Diary</h2>
            <p className="text-indigo-100/90 text-xs mt-0.5 font-medium">Encrypted & password-protected</p>
          </div>

          <div className="p-7">
            <form onSubmit={isSettingPin ? handleSetPin : handleUnlock} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  {isSettingPin ? "Create PIN" : "Enter PIN"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isSettingPin ? "Min. 4 characters" : "••••••"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm font-semibold tracking-widest shadow-xs"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 py-2.5 px-4 rounded-xl text-xs font-bold transition duration-150 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSettingPin ? (
                  <><Key className="w-4 h-4 stroke-[2.2]" /> Set PIN</>
                ) : (
                  <><Unlock className="w-4 h-4 stroke-[2.2]" /> Unlock Diary</>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setIsSettingPin(!isSettingPin); setError(""); setPin(""); }}
                  className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
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
    <div className="h-full flex overflow-hidden bg-[#F4F1EA] dark:bg-[#0E0E10]">
      {/* ── Left Sidebar: date list ─────────────────────────── */}
      <aside className="w-68 flex-shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col bg-[#FAF8F5]/90 dark:bg-[#141416]/90 shadow-xs">
        {/* header */}
        <div className="px-5 py-4 border-b border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="font-bold text-neutral-900 dark:text-white text-sm tracking-tight">Diary Entries</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Add date"
              onClick={() => setAddingDate((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              title="Lock diary"
              onClick={() => { setIsLocked(true); setPin(""); setEntries({}); }}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 stroke-[1.8]" />
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
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="p-3 border-b border-neutral-200/70 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-800/40 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white shadow-2xs"
                />
                <button
                  onClick={handleAddDate}
                  className="p-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* date list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-1">
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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group cursor-pointer",
                  isSelected
                    ? "bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-700/80 shadow-xs"
                    : "hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40"
                )}
              >
                {/* date badge */}
                <div className={clsx(
                  "w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight",
                  isToday
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                    : isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                      : "bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                )}>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">{d.format("MMM")}</span>
                  <span className="text-xs font-bold -mt-0.5">{d.format("D")}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    "text-xs font-bold truncate",
                    isSelected ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                  )}>
                    {isToday ? "Today" : d.format("dddd")}
                  </div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                    {hasEntry ? entries[date].body!.slice(0, 30) + (entries[date].body!.length > 30 ? "…" : "") : "No entry yet"}
                  </div>
                </div>

                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />}
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
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* date header */}
            <div className="px-10 pt-8 pb-5 border-b border-neutral-200/70 dark:border-neutral-800 flex items-start justify-between bg-[#FAF8F5]/60 dark:bg-[#141416]/60 backdrop-blur-md">
              <div>
                <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {dayjs(selectedDate).format("dddd")}
                </p>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 tracking-tight">
                  {dayjs(selectedDate).format("MMMM D, YYYY")}
                </h2>
              </div>

              {/* save indicator */}
              <div className="h-8 flex items-center">
                <AnimatePresence mode="wait">
                  {savingIds[selectedDate] ? (
                    <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Saving…
                    </motion.span>
                  ) : savedIds[selectedDate] ? (
                    <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Saved
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Pencil className="w-3.5 h-3.5 stroke-[1.8]" /> Auto-saves on blur
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* textarea with editorial serif & subtle notebook lines */}
            <div className="flex-1 overflow-auto relative p-10 notebook-lines">
              <textarea
                ref={textareaRef}
                key={selectedDate}
                defaultValue={entry?.body || ""}
                placeholder="What's on your mind today? Write freely..."
                className="w-full h-full bg-transparent resize-none outline-none leading-[36px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-lg font-serif"
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
