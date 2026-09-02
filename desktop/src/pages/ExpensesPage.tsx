import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, TrendingDown,
  Loader2, Popcorn, Key, ShoppingBag,
  Utensils, Coffee, ShoppingCart, Car, Zap, Film, Pill, Tag,
  CalendarDays, Calculator, ArrowDownRight, Wallet, Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import dayjs from "dayjs";

// ─── Category Configuration ──────────────────────────────────────────────────
export const CATEGORIES = [
  {
    label: "Snacks",
    icon: Popcorn,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  {
    label: "Rent",
    icon: Key,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    label: "Buying / Shopping",
    icon: ShoppingBag,
    color: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
  {
    label: "Food & Meals",
    icon: Utensils,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  {
    label: "Chai & Coffee",
    icon: Coffee,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    badgeColor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
  {
    label: "Groceries",
    icon: ShoppingCart,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    label: "Transport & Fuel",
    icon: Car,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    label: "Bills & Utilities",
    icon: Zap,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    label: "Entertainment",
    icon: Film,
    color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  },
  {
    label: "Health & Meds",
    icon: Pill,
    color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  {
    label: "Other",
    icon: Tag,
    color: "bg-neutral-500/10 text-neutral-400 border-neutral-700",
    badgeColor: "bg-neutral-500/10 text-neutral-400 border-neutral-700",
  },
];

function categoryMeta(label: string) {
  if (!label) return CATEGORIES[CATEGORIES.length - 1];
  const exact = CATEGORIES.find((c) => c.label.toLowerCase() === label.toLowerCase());
  if (exact) return exact;

  const partial = CATEGORIES.find(
    (c) =>
      c.label.toLowerCase().includes(label.toLowerCase()) ||
      label.toLowerCase().includes(c.label.toLowerCase().split(" ")[0])
  );
  return partial ?? CATEGORIES[CATEGORIES.length - 1];
}

function formatDayGroupHeader(dateStr: string) {
  const d = dayjs(dateStr);
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (dateStr === today) {
    return { label: "Today", formattedDate: d.format("MMM D, YYYY") };
  } else if (dateStr === yesterday) {
    return { label: "Yesterday", formattedDate: d.format("MMM D, YYYY") };
  } else {
    return { label: d.format("dddd"), formattedDate: d.format("MMM D, YYYY") };
  }
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function AddExpenseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (e: any) => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Snacks");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Enter a valid expense amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const item = await api.createExpense({
        amount: amt,
        category,
        description: description.trim() || undefined,
        date,
        expenseType: "EXPENSE",
      });
      onCreated(item);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white dark:bg-[#18181B] rounded-3xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Log Expense</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Add an expenditure to your daily log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 font-bold text-lg">
                ₹
              </span>
              <input
                autoFocus
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xl font-bold tracking-tight shadow-xs transition"
              />
            </div>
          </div>

          {/* Quick-Select Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={clsx(
                      "flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 shadow-xs"
                        : "border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    <div className={clsx(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border",
                      isSelected ? "bg-white/20 border-white/30 text-inherit" : cat.color
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate text-[11px] font-medium leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for? (e.g. Evening tea, Samosa, House rent)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm shadow-xs transition"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm shadow-xs transition"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.2]" />}
              Save Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState(dayjs().format("YYYY-MM"));

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses();
      setExpenses(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await api.deleteExpense(id);
      setExpenses((p) => p.filter((e) => e.id !== id));
    } catch {}
  };

  // Filter expenses by selected month and ensure expenseType is expense (or legacy)
  const monthFiltered = expenses.filter((e) => e.date?.startsWith(filterMonth));

  // Expense-only metrics
  const totalSpentThisMonth = monthFiltered
    .filter((e) => e.expenseType !== "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const todaySpending = expenses
    .filter((e) => e.date === todayStr && e.expenseType !== "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);

  const todayCount = expenses.filter(
    (e) => e.date === todayStr && e.expenseType !== "INCOME"
  ).length;

  // Calculate Daily Average
  const isCurrentMonth = filterMonth === dayjs().format("YYYY-MM");
  const daysInCalc = isCurrentMonth
    ? Math.max(1, dayjs().date())
    : dayjs(filterMonth).daysInMonth() || 30;
  const dailyAverage = totalSpentThisMonth > 0 ? totalSpentThisMonth / daysInCalc : 0;

  // Group filtered expenses day-by-day (newest date first)
  const groupedByDate = monthFiltered.reduce<Record<string, typeof expenses>>((acc, item) => {
    const dateKey = item.date || "Unknown Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => (b > a ? 1 : -1));

  // Category breakdown for this month
  const categoryTotals = monthFiltered
    .filter((e) => e.expenseType !== "INCOME")
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs().subtract(i, "month").format("YYYY-MM")
  );

  return (
    <div className="h-full flex flex-col bg-[#F4F1EA] dark:bg-[#0E0E10]">
      <AnimatePresence>
        {showModal && (
          <AddExpenseModal
            onClose={() => setShowModal(false)}
            onCreated={(item) => setExpenses((p) => [item, ...p])}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 bg-[#FAF8F5]/90 dark:bg-[#141416]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-8 py-5 flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Expenses Log</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Daily spending tracker & budget breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs cursor-pointer"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {dayjs(m).format("MMMM YYYY")}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xs text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" /> Log Expense
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 3 Metric Cards: Total Spent, Today's Spending, Daily Average */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Total Spent */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Total Spent This Month
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-xs text-white">
                  <TrendingDown className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                ₹{totalSpentThisMonth.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium mt-1">
                {monthFiltered.length} transactions in {dayjs(filterMonth).format("MMM YYYY")}
              </p>
            </motion.div>

            {/* Card 2: Today's Spending */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Today's Spending
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-xs text-white">
                  <CalendarDays className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                ₹{todaySpending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium mt-1">
                {todayCount > 0 ? `${todayCount} item${todayCount > 1 ? "s" : ""} logged today` : "No expenses yet today"}
              </p>
            </motion.div>

            {/* Card 3: Daily Average */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Daily Average
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xs text-white">
                  <Calculator className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                ₹{dailyAverage.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium mt-1">
                Calculated across {daysInCalc} days
              </p>
            </motion.div>
          </div>

          {/* Top Spending Categories Breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Top Spending Categories
                </h3>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {dayjs(filterMonth).format("MMMM YYYY")}
                </span>
              </div>
              <div className="space-y-3.5">
                {topCategories.map(([cat, total]) => {
                  const meta = categoryMeta(cat);
                  const Icon = meta.icon;
                  const pct = totalSpentThisMonth > 0 ? (total / totalSpentThisMonth) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border", meta.color)}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat}</span>
                          <span className="text-neutral-700 dark:text-neutral-300 font-bold">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-rose-500 dark:bg-rose-400 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-400 w-10 text-right tabular-nums">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day-Wise Grouped Expense Feed */}
          <div>
            <div className="flex items-center justify-between mb-3.5 px-1">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Daily Expense Feed ({monthFiltered.length} items)
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                <span className="text-xs font-medium">Loading expenses...</span>
              </div>
            ) : sortedDates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-xs"
              >
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Receipt className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-white">
                  No expenses in {dayjs(filterMonth).format("MMMM YYYY")}
                </h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Log your daily snacks, groceries, rent, and purchases above.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-5">
                <AnimatePresence initial={false}>
                  {sortedDates.map((dateKey) => {
                    const dayItems = groupedByDate[dateKey];
                    const dayTotal = dayItems.reduce((sum, item) => sum + item.amount, 0);
                    const { label, formattedDate } = formatDayGroupHeader(dateKey);

                    return (
                      <motion.div
                        key={dateKey}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white dark:bg-[#18181B] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs"
                      >
                        {/* Day Group Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/70 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                              <CalendarDays className="w-4 h-4 stroke-[2]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                  {label}
                                </span>
                                <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                                  • {formattedDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 tabular-nums">
                              ₹{dayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                            </span>
                          </div>
                        </div>

                        {/* List of expenses for this day */}
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                          {dayItems.map((expense) => {
                            const meta = categoryMeta(expense.category);
                            const Icon = meta.icon;
                            return (
                              <div
                                key={expense.id}
                                className="group flex items-center gap-3.5 px-5 py-3.5 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
                              >
                                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border", meta.color)}>
                                  <Icon className="w-4 h-4 stroke-[2]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                      {expense.description || expense.category}
                                    </span>
                                    <span className={clsx("text-[10px] font-semibold px-2 py-0.5 rounded-md border", meta.badgeColor)}>
                                      {expense.category}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                                  -₹{expense.amount.toFixed(2)}
                                </div>

                                <button
                                  onClick={() => deleteExpense(expense.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                                  title="Delete expense"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
