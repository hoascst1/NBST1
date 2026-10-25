import React from 'react';
import { ModuleGroup, WarehouseModule, WarehouseModuleId } from '../types/warehouse';
import { ModuleCard } from './ModuleCard';
import { Boxes } from 'lucide-react';

interface ModuleCardsHubProps {
  groups: ModuleGroup[];
  searchQuery: string;
  onSelectModule: (moduleId: WarehouseModuleId) => void;
  onClearSearch: () => void;
  onQuickAction?: (actionId: 'phieu-kho' | 'de-xuat-vat-tu' | 'kiem-ke-kho' | 'lich-su-xuat-nhap') => void;
}

export const ModuleCardsHub: React.FC<ModuleCardsHubProps> = ({
  groups,
  searchQuery,
  onSelectModule,
  onClearSearch,
  onQuickAction,
}) => {
  const filteredGroups = groups
    .map((group) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return group;

      const matchedModules = group.modules.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.groupName.toLowerCase().includes(q)
      );

      return {
        ...group,
        modules: matchedModules,
      };
    })
    .filter((group) => group.modules.length > 0);

  const totalMatches = filteredGroups.reduce((acc, g) => acc + g.modules.length, 0);

  return (
    <div className="space-y-6">

      {/* Zero match empty state */}
      {totalMatches === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Không tìm thấy module</h3>
          <p className="text-xs text-slate-500 mb-4">
            Không có module nào phù hợp với &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={onClearSearch}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* Module Groups List */}
      <div className="space-y-7">
        {filteredGroups.map((group) => (
          <section key={group.id} className="space-y-3.5">
            {/* Phân nhóm tiêu đề với đường kẻ dọc màu xanh */}
            <div className="border-l-[3.5px] border-blue-600 pl-3 py-0.5 flex items-center justify-between">
              <h2 className="text-[14.5px] font-bold text-blue-700 tracking-tight flex items-center gap-2">
                <span>{group.title}</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium font-mono tabular-nums">
                {group.modules.length} phân hệ
              </span>
            </div>

            {/* Bố cục lưới card gồm 4 CỘT theo yêu cầu của người dùng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {group.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onSelect={onSelectModule}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
