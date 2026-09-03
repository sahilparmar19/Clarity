import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, TrendingDown,
  Loader2, Popcorn, Key, ShoppingBag,
  Utensils, Coffee, ShoppingCart, Car, Zap, Film, Pill, Tag,
  CalendarDays, Calculator, Receipt
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
    color: "bg-[#FDF3E7] text-[#D97706] border-[#FDE68A]",
    badgeColor: "bg-[#FDF3E7] text-[#D97706] border-[#FDE68A]",
  },
  {
    label: "Rent",
    icon: Key,
    color: "bg-[#F5EFF8] text-[#7C3AED] border-[#DDD6FE]",
    badgeColor: "bg-[#F5EFF8] text-[#7C3AED] border-[#DDD6FE]",
  },
  {
    label: "Buying / Shopping",
    icon: ShoppingBag,
    color: "bg-[#FDF2F4] text-[#BE185D] border-[#FBCFE8]",
    badgeColor: "bg-[#FDF2F4] text-[#BE185D] border-[#FBCFE8]",
  },
  {
    label: "Food & Meals",
    icon: Utensils,
    color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
    badgeColor: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
  },
  {
    label: "Chai & Coffee",
    icon: Coffee,
    color: "bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]",
    badgeColor: "bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]",
  },
  {
    label: "Groceries",
    icon: ShoppingCart,
    color: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    badgeColor: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
  },
  {
    label: "Transport & Fuel",
    icon: Car,
    color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    badgeColor: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  {
    label: "Bills & Utilities",
    icon: Zap,
    color: "bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]",
    badgeColor: "bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]",
  },
  {
    label: "Entertainment",
    icon: Film,
    color: "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]",
    badgeColor: "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]",
  },
  {
    label: "Health & Meds",
    icon: Pill,
    color: "bg-[#FFF1F2] text-[#BE1239] border-[#FECDD3]",
    badgeColor: "bg-[#FFF1F2] text-[#BE1239] border-[#FECDD3]",
  },
  {
    label: "Other",
    icon: Tag,
    color: "bg-[#F5F2EB] text-[#524B45] border-[#E2DDD3]",
    badgeColor: "bg-[#F5F2EB] text-[#524B45] border-[#E2DDD3]",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg morning-card-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#FAF8F5] border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#D98A7E]/15 flex items-center justify-center text-[#C87467] shadow-sm">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#24211E] tracking-tight font-serif">Log Expense</h2>
              <p className="text-xs text-[#827A72]">Add an expenditure to your daily log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#827A72] hover:text-[#24211E] hover:bg-black/[0.04] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827A72] font-bold text-lg">
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-black/[0.12] bg-[#FAF8F5] text-[#24211E] placeholder-[#A39B92] outline-none focus:ring-2 focus:ring-[#C87467]/20 focus:border-[#C87467] text-2xl font-black font-mono tracking-tight transition"
              />
            </div>
          </div>

          {/* Quick-Select Category Grid */}
          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-2">
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
                        ? "border-[#C87467] bg-[#FBF4F0] text-[#24211E] shadow-sm font-bold"
                        : "border-black/[0.06] bg-[#FAF8F5] hover:bg-white text-[#524B45] hover:text-[#24211E]"
                    )}
                  >
                    <div className={clsx(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border",
                      isSelected ? "bg-[#C87467] text-white border-[#C87467]" : cat.color
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate text-[11px] leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for? (e.g. Evening tea, Samosa, House rent)"
              className="morning-input"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-[#524B45] uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="morning-input"
            />
          </div>

          {error && (
            <p className="text-xs text-[#C87467] font-semibold bg-[#C87467]/10 p-3 rounded-xl border border-[#C87467]/20">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-black/[0.08] text-sm font-semibold text-[#6E6862] hover:bg-black/[0.04] hover:text-[#24211E] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 morning-btn-accent"
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
    <div className="h-full flex flex-col bg-transparent">
      <AnimatePresence>
        {showModal && (
          <AddExpenseModal
            onClose={() => setShowModal(false)}
            onCreated={(item) => setExpenses((p) => [item, ...p])}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 bg-[#F5F2EC]/85 backdrop-blur-md border-b border-[#DDD7CE] px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#24211E] tracking-tight font-serif">Expenses Log</h2>
          <p className="text-[#827A72] text-xs font-semibold mt-0.5">Daily spending tracker & budget breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-black/[0.08] bg-[#FAF8F5] text-xs font-bold text-[#24211E] outline-none focus:ring-2 focus:ring-[#C87467]/20 transition cursor-pointer shadow-xs"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {dayjs(m).format("MMMM YYYY")}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="morning-btn-accent"
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
              className="morning-card morning-gradient-rose p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-[#827A72] uppercase tracking-wider">
                  Total Spent This Month
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#D98A7E]/15 flex items-center justify-center text-[#C87467] shadow-xs">
                  <TrendingDown className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight text-[#C87467] font-mono">
                ₹{totalSpentThisMonth.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#827A72] font-medium mt-1">
                {monthFiltered.length} transactions in {dayjs(filterMonth).format("MMM YYYY")}
              </p>
            </motion.div>

            {/* Card 2: Today's Spending */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="morning-card morning-gradient-honey p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-[#827A72] uppercase tracking-wider">
                  Today's Spending
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700 shadow-xs">
                  <CalendarDays className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight text-[#D97706] font-mono">
                ₹{todaySpending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#827A72] font-medium mt-1">
                {todayCount > 0 ? `${todayCount} item${todayCount > 1 ? "s" : ""} logged today` : "No expenses yet today"}
              </p>
            </motion.div>

            {/* Card 3: Daily Average */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="morning-card morning-gradient-sage p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-[#827A72] uppercase tracking-wider">
                  Daily Average
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#EAE5DE] flex items-center justify-center text-[#24211E] shadow-xs">
                  <Calculator className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight text-[#24211E] font-mono">
                ₹{dailyAverage.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-[#827A72] font-medium mt-1">
                Calculated across {daysInCalc} days
              </p>
            </motion.div>
          </div>

          {/* Top Spending Categories Breakdown */}
          {topCategories.length > 0 && (
            <div className="morning-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#24211E] font-serif">
                  Top Spending Categories
                </h3>
                <span className="text-[11px] font-bold text-[#827A72]">
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
                          <span className="font-bold text-[#24211E]">{cat}</span>
                          <span className="text-[#24211E] font-mono font-bold">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-[#EAE5DE] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-[#C87467] rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#827A72] w-10 text-right font-mono">
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
              <h3 className="text-base font-bold text-[#24211E] font-serif">
                Daily Expense Ledger ({monthFiltered.length} items)
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-[#827A72] gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#C87467]" />
                <span className="text-xs font-medium">Loading expenses...</span>
              </div>
            ) : sortedDates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 morning-card p-6"
              >
                <div className="w-12 h-12 bg-[#F2EFE9] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#827A72] border border-black/[0.06]">
                  <Receipt className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-base font-bold text-[#24211E] font-serif">
                  No expenses in {dayjs(filterMonth).format("MMMM YYYY")}
                </h3>
                <p className="text-[#827A72] text-xs mt-1">
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
                        className="morning-card overflow-hidden"
                      >
                        {/* Day Group Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF8F5] border-b border-black/[0.05]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#524B45] border border-black/[0.05]">
                              <CalendarDays className="w-4 h-4 stroke-[2]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#24211E] font-serif">
                                  {label}
                                </span>
                                <span className="text-[11px] font-semibold text-[#827A72]">
                                  • {formattedDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FBF4F0] text-[#C87467] border border-[#C87467]/30 font-mono shadow-xs">
                              ₹{dayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                            </span>
                          </div>
                        </div>

                        {/* List of expenses for this day */}
                        <div className="divide-y divide-black/[0.04]">
                          {dayItems.map((expense) => {
                            const meta = categoryMeta(expense.category);
                            const Icon = meta.icon;
                            return (
                              <div
                                key={expense.id}
                                className="group flex items-center gap-3.5 px-5 py-3.5 hover:bg-black/[0.015] transition-colors"
                              >
                                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-xs", meta.color)}>
                                  <Icon className="w-4 h-4 stroke-[2]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-[#24211E] truncate">
                                      {expense.description || expense.category}
                                    </span>
                                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md border", meta.badgeColor)}>
                                      {expense.category}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-sm font-black font-mono text-[#C87467]">
                                  -₹{expense.amount.toFixed(2)}
                                </div>

                                <button
                                  onClick={() => deleteExpense(expense.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#827A72] hover:text-[#C87467] hover:bg-[#C87467]/10 rounded-lg transition cursor-pointer"
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
