type StatsCardsProps = {
  stats: {
    total: number;
    completed: number;
    dueToday: number;
    mastered: number;
  };
};

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="px-8 py-5 bg-white border-b border-gray-200 grid grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-gray-600 text-xs font-medium mt-1">Total Problems</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
        <div className="text-gray-600 text-xs font-medium mt-1">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
        <div className="text-gray-600 text-xs font-medium mt-1">Due Today</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-indigo-600">{stats.mastered}</div>
        <div className="text-gray-600 text-xs font-medium mt-1">Mastered</div>
      </div>
    </div>
  );
};
