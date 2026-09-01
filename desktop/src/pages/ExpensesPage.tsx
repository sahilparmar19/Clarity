import { useState, useEffect } from "react";
import {
  Plus, Trash2, X, TrendingUp, TrendingDown,
  Loader2, DollarSign, Tag, CalendarDays, ShoppingCart,
  Coffee, Car, Home, Zap, Heart, Briefcase, BookOpen, Music,
  Utensils, Plane, Gift, Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { clsx } from "clsx";
import dayjs from "dayjs";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Food",        icon: Utensils,   color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { label: "Coffee",      icon: Coffee,     color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "Transport",   icon: Car,        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Housing",     icon: Home,       color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { label: "Utilities",   icon: Zap,        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { label: "Health",      icon: Heart,      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { label: "Shopping",    icon: ShoppingCart, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
  { label: "Work",        icon: Briefcase,  color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  { label: "Education",   icon: BookOpen,   color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { label: "Travel",      icon: Plane,      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { label: "Entertainment", icon: Music,    color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400" },
  { label: "Gifts",       icon: Gift,       color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
  { label: "Tech",        icon: Smartphone, color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" },
  { label: "Other",       icon: Tag,        color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
];

function categoryMeta(label: string) {
  return CATEGORIES.find((c) => c.label === label) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function AddExpenseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (e: any) => void;
}) {
  const [expenseType, setExpenseType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
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
    if (!amount || isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    setSaving(true);
    setError("");
    try {
      const item = await api.createExpense({
        amount: amt,
        category,
        description: description.trim() || undefined,
        date,
        expenseType,
      });
      onCreated(item);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const isExpense = expenseType === "EXPENSE";

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
        className="w-full max-w-md bg-[#FAF9F5] dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#EDE9DF] dark:bg-neutral-800 border-b border-neutral-200/70 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Add Transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setExpenseType(t)}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  expenseType === t
                    ? t === "EXPENSE"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-emerald-600 text-white shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                )}
              >
                {t === "EXPENSE" ? "Expense" : "Income"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">₹</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const selected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={clsx(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold transition-all border",
                      selected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "border-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-xs"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Transaction
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

  useEffect(() => { loadExpenses(); }, []);

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

  // Filter by selected month
  const filtered = expenses.filter((e) => e.date?.startsWith(filterMonth));

  const totalExpenses = filtered
    .filter((e) => e.expenseType === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = filtered
    .filter((e) => e.expenseType === "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Category breakdown (expenses only)
  const categoryTotals = filtered
    .filter((e) => e.expenseType === "EXPENSE")
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
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {showModal && (
          <AddExpenseModal
            onClose={() => setShowModal(false)}
            onCreated={(item) => setExpenses((p) => [item, ...p])}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-neutral-200/70 dark:border-neutral-800 px-8 py-5 flex items-center justify-between bg-[#FAF9F5] dark:bg-neutral-900 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Expenses</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Track your personal spending and income</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            {months.map((m) => (
              <option key={m} value={m}>{dayjs(m).format("MMMM YYYY")}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xs text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-[#EDE9DF] dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Income", amount: totalIncome, icon: TrendingUp, color: "bg-emerald-600", textColor: "text-emerald-700 dark:text-emerald-400" },
              { label: "Expenses", amount: totalExpenses, icon: TrendingDown, color: "bg-rose-600", textColor: "text-rose-700 dark:text-rose-400" },
              { label: "Net Balance", amount: balance, icon: DollarSign, color: balance >= 0 ? "bg-indigo-600" : "bg-amber-600", textColor: balance >= 0 ? "text-indigo-700 dark:text-indigo-400" : "text-amber-700 dark:text-amber-400" },
            ].map(({ label, amount, icon: Icon, color, textColor }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FAF9F5] dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={clsx("text-2xl font-bold tracking-tight", textColor)}>
                  ₹{Math.abs(amount).toFixed(2)}
                </div>
                {label === "Net Balance" && amount < 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Over budget</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Category Breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-[#FAF9F5] dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-4">Top Spending Categories</h3>
              <div className="space-y-3">
                {topCategories.map(([cat, total]) => {
                  const meta = categoryMeta(cat);
                  const Icon = meta.icon;
                  const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                          <span className="text-neutral-500 dark:text-neutral-400 font-semibold">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-200/70 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">
              Transactions
              <span className="ml-2 text-neutral-400 font-normal">({filtered.length})</span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-[#FAF9F5] dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl">
                <div className="w-14 h-14 bg-neutral-200/60 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="text-base font-bold text-neutral-800 dark:text-white">No transactions yet</h3>
                <p className="text-neutral-500 text-sm mt-1">Add your first expense or income above.</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {filtered.map((expense) => {
                    const meta = categoryMeta(expense.category);
                    const Icon = meta.icon;
                    const isIncome = expense.expenseType === "INCOME";
                    return (
                      <motion.div
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                        className="group flex items-center gap-3 p-4 bg-[#FAF9F5] dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 rounded-2xl hover:shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                              {expense.description || expense.category}
                            </span>
                            <span className={clsx(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                              meta.color
                            )}>
                              {expense.category}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5">
                            {dayjs(expense.date).format("MMM D, YYYY")}
                          </div>
                        </div>
                        <div className={clsx(
                          "text-base font-bold",
                          isIncome ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                        )}>
                          {isIncome ? "+" : "-"}₹{expense.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
