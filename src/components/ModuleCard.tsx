import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ClipboardList,
  History,
  ClipboardCheck,
  Boxes,
  FileSpreadsheet,
  PackageOpen,
  Fuel,
  Wrench,
  Warehouse,
  PackageSearch,
  Star,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { WarehouseModule } from '../types/warehouse';

interface ModuleCardProps {
  module: WarehouseModule;
  onSelect: (moduleId: WarehouseModule['id']) => void;
  onToggleFavorite?: (moduleId: WarehouseModule['id']) => void;
}

const iconComponentMap: Record<string, LucideIcon> = {
  ArrowLeftRight,
  ClipboardList,
  History,
  ClipboardCheck,
  Boxes,
  FileSpreadsheet,
  PackageOpen,
  Fuel,
  Wrench,
  Warehouse,
  PackageSearch,
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onSelect,
  onToggleFavorite,
}) => {
  const [isFav, setIsFav] = useState(module.isFavorite || false);
  const IconComponent = iconComponentMap[module.iconName] || Boxes;

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFav(!isFav);
    if (onToggleFavorite) {
      onToggleFavorite(module.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(module.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(module.id);
        }
      }}
      className="group relative bg-white rounded-[20px] border border-slate-200/80 p-4.5 hover:border-blue-400 hover:shadow-[0_6px_20px_rgba(37,99,235,0.07)] transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left select-none min-h-[160px]"
    >
      <div>
        {/* Top Header Row: Icon + Title + Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Colorful Rounded Icon Box */}
            <div
              className={`w-11 h-11 rounded-[14px] ${module.iconBg} ${module.iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Title */}
            <h3 className="text-[14.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate leading-snug">
              {module.title}
            </h3>
          </div>

          {/* Right Action Icons: Star & Arrow */}
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <button
              onClick={handleStarClick}
              className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${
                isFav ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-500'
              }`}
              title="Đánh dấu yêu thích"
            >
              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <div className="p-1 rounded-md text-slate-300 group-hover:text-blue-600 transition-colors">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mt-1">
          {module.description}
        </p>
      </div>

      {/* Footer Info: unboxed metadata */}
      <div className="pt-3 mt-3 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-400 flex items-center gap-1">
          <span className="font-mono font-bold text-slate-700 tabular-nums">
            {module.itemCount}
          </span>
          <span>bản ghi</span>
        </span>

        {module.badge ? (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
            {module.badge}
          </span>
        ) : (
          <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Mở phân hệ →
          </span>
        )}
      </div>
    </div>
  );
};
