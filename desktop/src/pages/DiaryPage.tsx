export default function DiaryPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold">Diary</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Password-protected personal journal
        </p>
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-neutral-500 mt-20">
            Diary UI coming soon — notebook-style interface with date rows
          </div>
        </div>
      </div>
    </div>
  );
}
