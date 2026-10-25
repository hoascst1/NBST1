import React from 'react';
import {
  Boxes,
  Wrench,
  CheckSquare,
  FileText,
  Settings,
  ArrowUpRight,
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
  // Lấy lời chào theo thời gian thực
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Các phân hệ thực tế trong phạm vi dự án Sơn Trà 1
  const modules: SidebarHomeModule[] = [
    {
      id: 'warehouse',
      name: 'Kho',
      desc: 'Quản lý nhập xuất, phiếu kho, kiểm kê, báo cáo và danh mục vật tư thiết bị',
      color: 'bg-blue-600',
      icon: Boxes,
      badge: 'Đang mở',
    },
    {
      id: 'maintenance',
      name: 'Sửa chữa',
      desc: 'Quản lý bảo dưỡng phòng ngừa, sửa chữa sự cố tổ máy và thiết bị điện',
      color: 'bg-amber-500',
      icon: Wrench,
    },
    {
      id: 'tasks',
      name: 'Công việc',
      desc: 'Phân công nhiệm vụ, phiếu thao tác, phiếu công tác và lịch ca trực vận hành',
      color: 'bg-emerald-600',
      icon: CheckSquare,
    },
    {
      id: 'documents',
      name: 'Tài liệu',
      desc: 'Quy trình kỹ thuật, bản vẽ thiết bị, hồ sơ nghiệm thu và quy chế nội bộ',
      color: 'bg-indigo-600',
      icon: FileText,
    },
    {
      id: 'system',
      name: 'Hệ thống',
      desc: 'Phân quyền tài khoản, cấu hình tham số kho và kiểm toán hệ thống',
      color: 'bg-slate-700',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 2.4 & 3.1 Tiêu đề chào mừng ở gần đầu vùng nội dung (khoảng 22-24px, đậm, tên người dùng xanh dương) */}
      <div className="pt-2">
        <h1 className="text-[23px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{getGreeting()},</span>
          <span className="text-blue-600 font-bold">{userName}</span>
          <span className="text-2xl select-none">👋</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Hệ thống Quản lý nội bộ Thủy điện Sơn Trà 1 · Bảng điều khiển phân hệ, cụm nhà máy ST1, V2026.4
        </p>
      </div>

      {/* 2.6 Lưới thẻ chức năng: 5 cột responsive, thẻ cao ~200px, bo góc 24px, icon 60x60px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {modules.map((mod) => {
          const IconComp = mod.icon;
          const isWarehouse = mod.id === 'warehouse';

          return (
            <div
              key={mod.id}
              onClick={() => onSelectNav(mod.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNav(mod.id);
                }
              }}
              className={`group relative bg-white rounded-[24px] border ${
                isWarehouse
                  ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-[0_4px_16px_rgba(37,99,235,0.06)]'
                  : 'border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
              } p-6 min-h-[210px] hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(37,99,235,0.1)] transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              {/* Chỉ báo mũi tên ở góc trên bên phải khi hover theo ảnh tham chiếu */}
              <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Ô vuông bo góc khoảng 60x60px đặt ở gần phần trên thẻ, icon màu trắng nét đơn giản */}
              <div
                className={`w-[60px] h-[60px] rounded-[18px] ${mod.color} text-white flex items-center justify-center mb-4 shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0`}
              >
                <IconComp className="w-7 h-7" />
              </div>

              {/* Tên chức năng đặt dưới icon, chữ đậm khoảng 19-21px */}
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <h3 className="text-[19px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                  {mod.name}
                </h3>
                {mod.badge && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
                    {mod.badge}
                  </span>
                )}
              </div>

              {/* Mô tả ngắn bên dưới, chữ xanh xám khoảng 13-14px, căn giữa, tối đa 2 dòng */}
              <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 max-w-[210px]">
                {mod.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
