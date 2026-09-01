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
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-base font-semibold dark:text-white">Add Transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setExpenseType(t)}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  expenseType === t
                    ? t === "EXPENSE"
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-emerald-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
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
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
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
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition",
                isExpense
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200 dark:shadow-none"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-200 dark:shadow-none"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isExpense ? "Add Expense" : "Add Income"}
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
      <div className="border-b border-neutral-100 dark:border-neutral-800 px-8 py-6 flex items-center justify-between bg-white/50 dark:bg-neutral-900/40 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold dark:text-white tracking-tight">Expenses</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm font-medium">Track your spending</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {months.map((m) => (
              <option key={m} value={m}>{dayjs(m).format("MMMM YYYY")}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-sm text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Income", amount: totalIncome, icon: TrendingUp, color: "from-emerald-500 to-green-600", textColor: "text-emerald-600 dark:text-emerald-400" },
              { label: "Expenses", amount: totalExpenses, icon: TrendingDown, color: "from-red-500 to-rose-600", textColor: "text-red-600 dark:text-red-400" },
              { label: "Balance", amount: balance, icon: DollarSign, color: balance >= 0 ? "from-blue-500 to-indigo-600" : "from-orange-500 to-red-500", textColor: balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400" },
            ].map(({ label, amount, icon: Icon, color, textColor }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-5 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={clsx("text-2xl font-bold", textColor)}>
                  ₹{Math.abs(amount).toFixed(2)}
                </div>
                {label === "Balance" && amount < 0 && (
                  <p className="text-xs text-orange-500 mt-1 font-medium">Over budget</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Category Breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-white dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-5 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Top Categories</h3>
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
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">{cat}</span>
                          <span className="text-neutral-500 dark:text-neutral-400">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
              Transactions
              <span className="ml-2 text-neutral-400 font-normal">({filtered.length})</span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-base font-semibold dark:text-white">No transactions yet</h3>
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
                        className="group flex items-center gap-3 p-4 bg-white dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-600 transition-all backdrop-blur-xl"
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
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                        )}>
                          {isIncome ? "+" : "-"}₹{expense.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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
