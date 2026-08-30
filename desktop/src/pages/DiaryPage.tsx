import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Lock, Unlock, Key, Save, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { DiaryEntry } from "@/lib/types";
import { clsx } from "clsx";

export default function DiaryPage() {
  const [pin, setPin] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  // Generate the last 14 days for the notebook view
  const days = Array.from({ length: 14 }).map((_, i) =>
    dayjs().subtract(i, "day").format("YYYY-MM-DD")
  );

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.getDiaryEntries(pin);
      const map: Record<string, DiaryEntry> = {};
      data.forEach((entry) => {
        map[entry.date] = entry;
      });
      setEntries(map);
      setIsLocked(false);
    } catch (err: any) {
      if (err.message.includes("Diary PIN not set") || err.message.includes("Conflict")) {
        setIsSettingPin(true);
        setError("You haven't set a PIN yet. Create one now to lock your diary.");
      } else {
        setError("Incorrect PIN or error accessing diary.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("PIN must be at least 4 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.setDiaryPin(pin);
      // After setting, unlock immediately
      await handleUnlock(e);
      setIsSettingPin(false);
    } catch (err: any) {
      setError("Failed to set PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (date: string, body: string, mood?: any) => {
    setSavingIds((prev) => ({ ...prev, [date]: true }));
    try {
      const saved = await api.saveDiaryEntry(date, pin, { body, mood });
      setEntries((prev) => ({ ...prev, [date]: saved }));
    } catch (err) {
      console.error("Failed to save entry", err);
      alert(`Failed to save entry for ${date}`);
    } finally {
      setSavingIds((prev) => ({ ...prev, [date]: false }));
    }
  };

  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-700">
          <div className="bg-indigo-600 p-8 text-white text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-1">Your Diary</h2>
            <p className="text-indigo-100">Safe, private, and secure</p>
          </div>

          <div className="p-8">
            <form onSubmit={isSettingPin ? handleSetPin : handleUnlock} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {isSettingPin ? "Create a new PIN" : "Enter your PIN"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isSettingPin ? "Min 4 characters" : "••••"}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pin}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSettingPin ? (
                  <>
                    <Key className="w-5 h-5" /> Set PIN
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" /> Unlock Diary
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingPin(!isSettingPin);
                    setError("");
                    setPin("");
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isSettingPin ? "Already have a PIN? Unlock" : "First time? Set your PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-neutral-900">
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Diary
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Your private notebook</p>
        </div>
        <button
          onClick={() => {
            setIsLocked(true);
            setPin("");
            setEntries({});
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Lock className="w-4 h-4" />
          Lock
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {days.map((date) => {
            const entry = entries[date];
            const isSaving = savingIds[date];
            const displayDate = dayjs(date);

            return (
              <div
                key={date}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-[#e5e0d8] dark:border-neutral-700 overflow-hidden"
              >
                <div className="bg-[#f0ebd8] dark:bg-neutral-800/80 px-4 py-3 border-b border-[#e5e0d8] dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                      {displayDate.format("DD")}
                    </span>
                    <span className="text-md font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      {displayDate.format("MMM, dddd")}
                    </span>
                  </div>
                  {isSaving ? (
                    <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  ) : entry ? (
                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <Save className="w-3 h-3" /> Saved
                    </span>
                  ) : null}
                </div>

                <div className="p-0 relative">
                  {/* Notebook lines effect */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #000 31px, #000 32px)',
                      backgroundSize: '100% 32px',
                      marginTop: '8px'
                    }}
                  />
                  <textarea
                    defaultValue={entry?.body || ""}
                    placeholder="Write your thoughts here..."
                    className={clsx(
                      "w-full min-h-[160px] p-6 bg-transparent resize-y outline-none leading-[32px] text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-600",
                    )}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val !== (entry?.body || "")) {
                        handleSaveEntry(date, val);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}