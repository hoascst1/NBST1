import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  X,
  LogOut,
  Home,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserRole } from '../types/warehouse';

interface TopbarProps {
  currentModuleName?: string;
  onNavigateHome: () => void;
  onNavigateWarehouse: () => void;
  currentUserRole?: UserRole;
  onChangeUserRole?: (role: UserRole) => void;
}

const USER_ROLES: UserRole[] = [
  'Admin/BGĐ',
  'BGĐ',
  'Kế toán',
  'Phòng HCTC',
  'Ban KTSC',
  'Ban KTVH',
  'Thủ kho',
  'Nhân viên lập phiếu',
];

export const Topbar: React.FC<TopbarProps> = ({
  currentModuleName,
  onNavigateHome,
  onNavigateWarehouse,
  currentUserRole = 'Admin/BGĐ',
  onChangeUserRole,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDate(`${dayName}, ${day}/${month}/${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const canUnlockStatus =
    currentUserRole === 'Admin/BGĐ' ||
    currentUserRole === 'BGĐ' ||
    currentUserRole === 'Kế toán' ||
    currentUserRole === 'Phòng HCTC';

  return (
    <header className="h-[60px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left zone: Breadcrumb điều hướng: Trang chủ > Kho vận với biểu tượng ngôi nhà và thẻ bo góc */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Trang chủ</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

        <button
          onClick={onNavigateWarehouse}
          className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
            !currentModuleName
              ? 'text-blue-700 bg-blue-50 border border-blue-200/60'
              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
          }`}
        >
          Kho vận
        </button>

        {currentModuleName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 font-bold border border-blue-200/80">
              {currentModuleName}
            </span>
          </>
        )}
      </div>

      {/* Right zone: Real-time clock, Dark/Light mode, Notification bell with red dot, User Nguyễn Hữu Hòa */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-3 text-slate-600 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold tabular-nums text-slate-800 tracking-tight">
              {currentTime || '16:13:28'}
            </span>
          </div>

          <span className="text-slate-300">·</span>

          <div className="flex items-center gap-1.5 font-sans text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate || 'Thứ 7, 17/10/2026'}</span>
          </div>
        </div>

        {/* Nút chuyển đổi giao diện Sáng/Tối (Sun/Moon) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Chuông thông báo có chấm đỏ cảnh báo */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Thông báo Kho vận & Nhà máy</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-left">
                  <div className="font-semibold text-slate-800">Phiếu đề xuất DX-VT-090 chờ duyệt</div>
                  <div className="text-[11px] text-slate-500">Đội Vận hành Tổ máy yêu cầu cấp phát vật tư khẩn</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-left">
                  <div className="font-semibold text-slate-800">Cảnh báo tồn kho an toàn</div>
                  <div className="text-[11px] text-slate-500">Biến tần và gioăng chịu nhiệt chạm ngưỡng tối thiểu</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tài khoản người dùng: Avatar chữ L màu vàng cam, tên Nguyễn Hữu Hòa + Chức vụ */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {/* Avatar chữ L màu vàng cam */}
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs">
              L
            </div>
            <div className="text-left leading-tight">
              <div className="font-semibold text-slate-800 text-xs">
                Nguyễn Hữu Hòa
              </div>
              <div
                className={`text-[10px] font-semibold ${
                  canUnlockStatus ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                {currentUserRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-68 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">Nguyễn Hữu Hòa</div>
                <div className="text-[11px] text-slate-500">hoascst1@gmail.com</div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Chức vụ đang đăng nhập: {currentUserRole}</span>
                </div>
              </div>

              {onChangeUserRole && (
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Chuyển đổi chức vụ đăng nhập
                  </div>
                  <div className="space-y-1">
                    {USER_ROLES.map((role) => {
                      const isSelected = currentUserRole === role;
                      const isPrivileged =
                        role === 'Admin/BGĐ' ||
                        role === 'BGĐ' ||
                        role === 'Kế toán' ||
                        role === 'Phòng HCTC';
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            onChangeUserRole(role);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{role}</span>
                            {isPrivileged && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                Mở khóa trạng thái
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="py-1">
                <div className="px-3.5 py-1.5 hover:bg-slate-50 cursor-pointer">Hồ sơ cá nhân</div>
                <div className="px-3.5 py-1.5 hover:bg-slate-50 cursor-pointer">Cấu hình phân quyền kho</div>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
