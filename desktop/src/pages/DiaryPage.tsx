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
    <div className="h-full flex items-center justify-center p-6 bg-[#090A0F]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#12141D] shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
          {/* Header — obsidian with gradient accent bar */}
          <div className="relative px-8 pt-8 pb-7 text-center overflow-hidden">
            {/* Crimson/violet glow behind icon */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/[0.08] to-transparent pointer-events-none" />
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#151824] border border-white/[0.08] flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.2)]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E11D48]/80 to-[#7C3AED]/80 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.35)]">
                <BookOpen className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            </div>
            <h2 className="relative text-xl font-bold tracking-tight text-[#F4F4F8]">Personal Diary</h2>
            <p className="relative text-[#94A3B8]/50 text-xs mt-0.5 font-medium">Encrypted & password-protected</p>
          </div>

          {/* Divider accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#7C3AED]/25 to-transparent" />

          <div className="p-7">
            <form onSubmit={isSettingPin ? handleSetPin : handleUnlock} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 text-[#E11D48] bg-[#E11D48]/10 rounded-xl text-xs font-semibold border border-[#E11D48]/20"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wider mb-2">
                  {isSettingPin ? "Create PIN" : "Enter PIN"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]/40" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isSettingPin ? "Min. 4 characters" : "••••••"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#0C0D14] text-[#F4F4F8] outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 transition text-sm font-semibold tracking-widest"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 cursor-pointer"
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
                  className="text-xs font-semibold text-[#94A3B8]/50 hover:text-[#7C3AED] transition cursor-pointer"
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
    <div className="h-full flex overflow-hidden bg-[#090A0F]">
      {/* ── Left Sidebar: date list ─────────────────────────── */}
      <aside className="w-68 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0C0D14]/80">
        {/* header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="font-bold text-[#F4F4F8] text-sm tracking-tight">Diary Entries</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Add date"
              onClick={() => setAddingDate((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#94A3B8]/60 hover:text-[#F4F4F8] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              title="Lock diary"
              onClick={() => { setIsLocked(true); setPin(""); setEntries({}); }}
              className="p-1.5 rounded-lg hover:bg-[#E11D48]/10 text-[#94A3B8]/40 hover:text-[#E11D48] transition-colors cursor-pointer"
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
              <div className="p-3 border-b border-white/[0.06] bg-[#151824]/60 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="flex-1 text-xs bg-[#0C0D14] border border-white/[0.08] rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]/40 text-[#F4F4F8]"
                />
                <button
                  onClick={handleAddDate}
                  className="p-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors cursor-pointer shadow-[0_0_10px_rgba(124,58,237,0.3)]"
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
                    ? "bg-[#151824] border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]"
                    : "hover:bg-white/[0.03] border border-transparent"
                )}
              >
                {/* date badge */}
                <div className={clsx(
                  "w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight",
                  isToday
                    ? "bg-gradient-to-tr from-[#E11D48]/80 to-[#7C3AED]/80 text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                    : isSelected
                      ? "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/25"
                      : "bg-[#151824] text-[#94A3B8]/60 border border-white/[0.06]"
                )}>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">{d.format("MMM")}</span>
                  <span className="text-xs font-bold -mt-0.5">{d.format("D")}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    "text-xs font-bold truncate",
                    isSelected ? "text-[#F4F4F8]" : "text-[#94A3B8]/70"
                  )}>
                    {isToday ? "Today" : d.format("dddd")}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]/40 truncate mt-0.5">
                    {hasEntry ? entries[date].body!.slice(0, 30) + (entries[date].body!.length > 30 ? "…" : "") : "No entry yet"}
                  </div>
                </div>

                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]/40 flex-shrink-0" />}
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
            <div className="px-10 pt-8 pb-5 border-b border-white/[0.06] flex items-start justify-between bg-[#0C0D14]/60 backdrop-blur-md">
              <div>
                <p className="text-xs font-bold text-[#94A3B8]/40 uppercase tracking-wider">
                  {dayjs(selectedDate).format("dddd")}
                </p>
                <h2 className="text-2xl font-bold text-[#F4F4F8] mt-1 tracking-tight">
                  {dayjs(selectedDate).format("MMMM D, YYYY")}
                </h2>
              </div>

              {/* save indicator */}
              <div className="h-8 flex items-center">
                <AnimatePresence mode="wait">
                  {savingIds[selectedDate] ? (
                    <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-[#94A3B8]/50 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" /> Saving…
                    </motion.span>
                  ) : savedIds[selectedDate] ? (
                    <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-900/50">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Saved
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-[#94A3B8]/30">
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
                className="w-full h-full bg-transparent resize-none outline-none leading-[36px] text-[#F4F4F8] placeholder-[#94A3B8]/30 text-lg font-serif"
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
