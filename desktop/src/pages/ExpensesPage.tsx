import { DollarSign, Sparkles } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="h-full flex flex-col page-transition">
      <div className="p-8 md:p-12 pb-4">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Expenses</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Track spending and manage budgets
        </p>
      </div>

      <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-800/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm hover-lift transform rotate-3">
            <DollarSign className="w-10 h-10 text-emerald-600 dark:text-emerald-400 -rotate-3" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-center gap-2">
            Coming Soon <Sparkles className="w-5 h-5 text-yellow-500" />
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The expenses tracker is currently under development. It will feature category tracking, monthly budgets, and chart visualizations.
          </p>

          <div className="mt-10 p-6 bg-white/60 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 rounded-2xl backdrop-blur-sm">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full"
                    style={{ width: `${Math.random() * 40 + 30}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
