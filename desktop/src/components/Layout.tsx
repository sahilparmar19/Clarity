import { Outlet, NavLink } from "react-router-dom";
import { Calendar, BookOpen, CheckSquare, DollarSign, FolderKanban, LogOut } from "lucide-react";
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F3EE] dark:bg-neutral-950">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200/70 dark:border-neutral-800 flex flex-col z-20">
        {/* Logo */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-2.5 mb-6">
            {/* Simple book icon like the diary reference */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Clarity</span>
          </div>

          {/* Greeting */}
          <p className="text-[13px] text-neutral-400 dark:text-neutral-500 leading-snug">
            {greeting()},<br />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{username}</span>
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-[14px] font-medium",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-300"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={clsx(
                    "w-[18px] h-[18px] flex-shrink-0",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                  )} />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[14px] font-medium text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-0.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-1 relative overflow-auto bg-[#F5F3EE] dark:bg-neutral-950 page-transition">
        <Outlet />
      </main>
    </div>
  );
}
