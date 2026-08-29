import { Outlet, NavLink } from "react-router-dom";
import { Calendar, BookOpen, CheckSquare, DollarSign, FolderKanban, LogOut } from "lucide-react";
import { useAuth } from "@/lib/store";
import { clsx } from "clsx";

export default function Layout() {
  const { username, logout } = useAuth();

  const links = [
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/diary", icon: BookOpen, label: "Diary" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/expenses", icon: DollarSign, label: "Expenses" },
    { to: "/projects", icon: FolderKanban, label: "Projects" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-50 dark:bg-neutral-900 border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">Clarity</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {username}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
