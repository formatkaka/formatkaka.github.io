import { Search } from 'lucide-react';

type FilterBarProps = {
  topics: string[];
  currentFilter: string;
  onFilterChange: (topic: string) => void;
};

export const FilterBar = ({ topics, currentFilter, onFilterChange }: FilterBarProps) => {
  return (
    <div className="p-5 px-8 bg-white border-b border-gray-200 flex gap-4 items-center">
      <div className="flex items-center gap-2.5 bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200 focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border-none bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer min-w-[150px]"
        >
          <option value="all">All Topics</option>
          {topics.map(topic => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
