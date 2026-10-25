import React from 'react';
import {
  Home,
  Boxes,
  Wrench,
  CheckSquare,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { NavigationModule } from '../types/warehouse';

interface SidebarProps {
  currentNav: NavigationModule;
  onSelectNav: (nav: NavigationModule) => void;
  onResetToWarehouseHub: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  onResetToWarehouseHub,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Modules verified in project scope
  const navItems: { id: NavigationModule; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'warehouse', label: 'Kho', icon: Boxes },
    { id: 'maintenance', label: 'Sửa chữa', icon: Wrench },
    { id: 'tasks', label: 'Công việc', icon: CheckSquare },
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'system', label: 'Hệ thống', icon: Settings },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-[263px]'
      } bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200/90 select-none min-h-screen transition-all duration-200 z-20 sticky top-0 h-screen`}
    >
      {/* 2.2 Khu vực nhận diện thương hiệu trên cùng (cao khoảng 65-75px) */}
      <div className="h-[68px] px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 min-w-0 pr-1">
            {/* Logo / Biểu tượng thương hiệu */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 tracking-wider">
              ST1
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14.5px] font-bold text-slate-900 tracking-tight truncate leading-tight">
                Thủy điện Sơn Trà 1
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Hệ thống Quản lý nội bộ
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs mx-auto shadow-xs">
            ST1
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Menu xếp theo chiều dọc, mỗi mục menu cao khoảng 51-54px */}
      <nav className="flex-1 py-3.5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectNav(item.id);
                if (item.id === 'warehouse') {
                  onResetToWarehouseHub();
                }
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group relative flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'justify-start px-3.5'
              } h-[52px] rounded-xl text-[14px] transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-50/85 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50/90 hover:text-slate-900 font-medium'
              }`}
            >
              {/* Vạch xanh dọc ở mép trái khi mục đang chọn (đặc trưng chuẩn 5F template) */}
              {isActive && (
                <span
                  className="absolute left-0 top-2.5 bottom-2.5 w-[3.5px] bg-blue-600 rounded-r-full"
                  aria-hidden="true"
                />
              )}

              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                } ${!isCollapsed ? 'mr-3.5' : ''}`}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer nhỏ dưới đáy sidebar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-mono">V2026.4</span>
          <span className="text-slate-300">·</span>
          <span>Sơn Trà 1</span>
        </div>
      )}
    </aside>
  );
};
