import { FolderKanban, Sparkles } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="h-full flex flex-col page-transition">
      <div className="p-8 md:p-12 pb-4">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Projects</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Organize goals and track progress
        </p>
      </div>

      <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-purple-100 to-fuchsia-50 dark:from-purple-900/40 dark:to-fuchsia-800/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm hover-lift transform -rotate-3">
            <FolderKanban className="w-10 h-10 text-purple-600 dark:text-purple-400 rotate-3" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-center gap-2">
            Coming Soon <Sparkles className="w-5 h-5 text-yellow-500" />
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The project board is currently under construction. Soon you'll be able to organize sub-tasks, track milestones, and view progress on a Kanban board.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 opacity-60">
            {['To Do', 'In Progress', 'Done'].map((col, i) => (
              <div key={col} className="bg-white/60 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 rounded-xl p-3 backdrop-blur-sm h-32 flex flex-col">
                <div className="text-xs font-medium text-neutral-400 mb-3 text-left">{col}</div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-full bg-neutral-200/50 dark:bg-neutral-700/50 rounded-full" />
                  {i < 2 && <div className="h-2 w-3/4 bg-neutral-200/50 dark:bg-neutral-700/50 rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
