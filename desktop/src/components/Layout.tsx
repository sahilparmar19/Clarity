import { Outlet, NavLink } from "react-router-dom";
import { Calendar, BookOpen, CheckSquare, DollarSign, FolderKanban, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { clsx } from "clsx";

export default function Layout() {
  const { username, logout } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const links = [
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/diary", icon: BookOpen, label: "Diary" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/expenses", icon: DollarSign, label: "Expenses" },
    { to: "/projects", icon: FolderKanban, label: "Projects" },
  ];

  const userInitial = (username || "U").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F1EA] dark:bg-[#0E0E10]">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 bg-[#FAF8F5]/90 dark:bg-[#141416]/90 backdrop-blur-md border-r border-neutral-200/80 dark:border-neutral-800/80 flex flex-col z-20 shadow-xs">
        {/* Logo & Brand Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20 ring-1 ring-black/5 dark:ring-white/10">
              <Sparkles className="w-4.5 h-4.5 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white block leading-none">
                Clarity
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500">
                Personal OS
              </span>
            </div>
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-200/40 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
                {greeting()}
              </p>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {username || "Sahil"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group text-[13.5px] font-medium select-none",
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    className={clsx(
                      "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-white dark:text-neutral-950 stroke-[2.2]"
                        : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 stroke-[1.8]"
                    )}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out Action */}
        <div className="p-3 border-t border-neutral-200/70 dark:border-neutral-800/80">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl w-full text-[13.5px] font-medium text-neutral-500 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-0.5 stroke-[1.8]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-1 relative overflow-auto bg-[#F4F1EA] dark:bg-[#0E0E10] page-transition">
        <Outlet />
      </main>
    </div>
  );
}
