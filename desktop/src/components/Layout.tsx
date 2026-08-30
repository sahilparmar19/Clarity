import { Outlet, NavLink } from "react-router-dom";
import { Calendar, BookOpen, CheckSquare, DollarSign, FolderKanban, LogOut, Sun } from "lucide-react";
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
    <div className="flex h-screen overflow-hidden bg-[#FCFAF8] dark:bg-neutral-950">
      {/* Sidebar - light transparent background, soft border */}
      <aside className="w-64 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl border-r border-neutral-200/60 dark:border-neutral-800/60 flex flex-col z-20">
        <div className="p-6 pt-8 pb-8">
          <div className="flex items-center gap-3 text-primary-600 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Sun className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Clarity</h1>
          </div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {greeting()}, <br/><span className="text-neutral-800 dark:text-neutral-200 font-semibold">{username}</span>
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium shadow-sm border border-primary-100/50 dark:border-primary-800/30"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                )
              }
            >
              <link.icon className={clsx(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                "origin-center"
              )} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl w-full text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content background with subtle gradient */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#FCFAF8] to-[#f3f4f6] dark:from-neutral-950 dark:to-neutral-900">
        {/* Soft blur shapes in background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-50/40 dark:bg-green-900/5 rounded-full blur-3xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <main className="h-full overflow-auto relative z-10 page-transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
