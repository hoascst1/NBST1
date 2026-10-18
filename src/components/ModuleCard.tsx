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
      className="group bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left"
    >
      <div>
        {/* Top Header Row: Icon + Title + Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Colorful Rounded Icon Box */}
            <div
              className={`w-10 h-10 rounded-xl ${module.iconBg} ${module.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight truncate">
              {module.title}
            </h3>
          </div>

          {/* Right Action Icons: Star & Arrow */}
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <button
              onClick={handleStarClick}
              className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                isFav ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-500'
              }`}
              title="Đánh dấu yêu thích"
            >
              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <div className="p-1 rounded-md text-slate-300 group-hover:text-blue-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {module.description}
        </p>
      </div>

      {/* Footer Info: unboxed metadata */}
      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium text-slate-400">
          <span className="font-mono font-semibold text-slate-600 tabular-nums">
            {module.itemCount}
          </span>{' '}
          bản ghi
        </span>

        {module.badge ? (
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/50">
            {module.badge}
          </span>
        ) : (
          <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Mở →
          </span>
        )}
      </div>
    </div>
  );
};
