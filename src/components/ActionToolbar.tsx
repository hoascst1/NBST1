import React from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';

interface ActionToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onBack?: () => void;
  hasBackAction?: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onBack,
  hasBackAction = false,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-3 sticky top-14 z-20 shadow-2xs">
      {/* Back button if in detail view */}
      {hasBackAction && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-blue-300 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Quay lại</span>
        </button>
      )}

      {/* Ô tìm kiếm nổi bật: Tìm module theo tên hoặc mô tả... với icon kính lúp và nút xóa nhanh */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm module theo tên hoặc mô tả..."
          className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
