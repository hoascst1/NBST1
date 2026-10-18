import React, { useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalModules: number;
  matchedModules: number;
  selectedGroupFilter: string;
  onGroupFilterChange: (groupId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  totalModules,
  matchedModules,
  selectedGroupFilter,
  onGroupFilterChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-blue-600" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm module theo tên hoặc mô tả..."
          className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-300/90 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
        />

        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-2 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-2 pr-2.5 flex items-center pointer-events-none">
            <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </span>
          </div>
        )}
      </div>

      {/* Filter and Status strip */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg text-xs font-medium text-slate-600 border border-slate-200/60">
          <button
            onClick={() => onGroupFilterChange('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Tất cả ({totalModules})
          </button>
          <button
            onClick={() => onGroupFilterChange('inout')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedGroupFilter === 'inout'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            A. Nhập xuất
          </button>
          <button
            onClick={() => onGroupFilterChange('reports')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedGroupFilter === 'reports'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            B. Báo cáo
          </button>
          <button
            onClick={() => onGroupFilterChange('settings')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedGroupFilter === 'settings'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            C. Danh mục
          </button>
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-500 whitespace-nowrap pl-2">
            Khớp: <strong className="text-blue-700 font-mono">{matchedModules}</strong> module
          </div>
        )}
      </div>
    </div>
  );
};
