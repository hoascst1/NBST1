import React from 'react';
import {
  Boxes,
  Wrench,
  CheckSquare,
  FileText,
  Settings,
  LucideIcon,
} from 'lucide-react';
import { NavigationModule } from '../types/warehouse';

interface HomeLauncherProps {
  onSelectNav: (nav: NavigationModule) => void;
  userName?: string;
}

interface SidebarHomeModule {
  id: NavigationModule;
  name: string;
  desc: string;
  color: string;
  icon: LucideIcon;
  badge?: string;
}

export const HomeLauncher: React.FC<HomeLauncherProps> = ({
  onSelectNav,
  userName = 'Nguyễn Hữu Hòa',
}) => {
  // Exact modules matching the Sidebar
  const sidebarModules: SidebarHomeModule[] = [
    {
      id: 'warehouse',
      name: 'Kho',
      desc: 'Quản lý nhập xuất, kiểm kê, báo cáo và danh mục vật tư',
      color: 'bg-blue-600',
      icon: Boxes,
      badge: 'Đang mở',
    },
    {
      id: 'maintenance',
      name: 'Sửa chữa',
      desc: 'Quản lý bảo dưỡng, sửa chữa thiết bị và tổ máy',
      color: 'bg-amber-600',
      icon: Wrench,
    },
    {
      id: 'tasks',
      name: 'Công việc',
      desc: 'Phân công công việc, phiếu công tác và lịch bảo trì',
      color: 'bg-emerald-600',
      icon: CheckSquare,
    },
    {
      id: 'documents',
      name: 'Tài liệu',
      desc: 'Hồ sơ kỹ thuật, quy trình vận hành và tài liệu nội bộ',
      color: 'bg-sky-600',
      icon: FileText,
    },
    {
      id: 'system',
      name: 'Hệ thống',
      desc: 'Phân quyền người dùng, cấu hình và nhật ký hệ thống',
      color: 'bg-slate-800',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Greeting Banner: Chào buổi chiều, Nguyễn Hữu Hòa 👋 */}
      <div className="pt-2 pb-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Chào buổi chiều, {userName}</span>
          <span className="text-2xl">👋</span>
        </h1>
      </div>

      {/* Grid thẻ ứng dụng tương ứng chính xác theo Sidebar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sidebarModules.map((mod) => {
          const IconComp = mod.icon;
          const isWarehouse = mod.id === 'warehouse';

          return (
            <div
              key={mod.id}
              onClick={() => onSelectNav(mod.id)}
              role="button"
              tabIndex={0}
              className={`group bg-white rounded-2xl border ${
                isWarehouse
                  ? 'border-blue-400 ring-2 ring-blue-500/10 shadow-xs'
                  : 'border-slate-200/90'
              } p-5 hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col items-center text-center cursor-pointer`}
            >
              {/* Colorful Icon Box */}
              <div
                className={`w-14 h-14 rounded-2xl ${mod.color} text-white flex items-center justify-center mb-3.5 shadow-sm transition-transform group-hover:scale-105`}
              >
                <IconComp className="w-7 h-7" />
              </div>

              {/* Module Name */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {mod.name}
                </h3>
                {mod.badge && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.2 rounded border border-blue-200">
                    {mod.badge}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {mod.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
