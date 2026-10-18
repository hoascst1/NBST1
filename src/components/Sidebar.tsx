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
  // Exact 6 modules specified by user
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
        isCollapsed ? 'w-18' : 'w-60'
      } bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none min-h-screen transition-all duration-200 z-20`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
        {!isCollapsed ? (
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[15px] font-bold text-slate-900 tracking-tight truncate">
              Thủy điện Sơn Trà 1
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              Hệ thống Quản lý nội bộ
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs mx-auto shadow-2xs">
            ST1
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation items list */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
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
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
              } py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500'
                } ${!isCollapsed ? 'mr-3' : ''}`}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

    </aside>
  );
};
