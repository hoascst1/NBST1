/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ActionToolbar } from './components/ActionToolbar';
import { ModuleCardsHub } from './components/ModuleCardsHub';
import { ModuleDetailView } from './components/ModuleDetailView';
import { HomeLauncher } from './components/HomeLauncher';
import {
  MODULE_GROUPS,
  ALL_MODULES,
} from './data/warehouseData';
import {
  NavigationModule,
  WarehouseModuleId,
  UserRole,
} from './types/warehouse';
import {
  Check,
  Building2,
  Wrench,
  CheckSquare,
  FileText,
  Settings,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [currentNav, setCurrentNav] = useState<NavigationModule>('warehouse');
  const [activeModuleId, setActiveModuleId] = useState<WarehouseModuleId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin/BGĐ');

  // Active module object if selected
  const activeModule = ALL_MODULES.find((m) => m.id === activeModuleId);

  // Toast notification helper
  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Back button action
  const handleBack = () => {
    if (activeModuleId) {
      setActiveModuleId(null);
    } else if (currentNav !== 'home') {
      setCurrentNav('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-row text-slate-800 font-sans">
      {/* 1. Thanh điều hướng bên trái (Sidebar nền sáng: Thủy điện Sơn Trà 1, 6 phân hệ) */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={(nav) => {
          setCurrentNav(nav);
          if (nav !== 'warehouse') {
            setActiveModuleId(null);
          }
        }}
        onResetToWarehouseHub={() => {
          setActiveModuleId(null);
          setSearchQuery('');
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* 2. Thanh trên cùng (Top bar: Breadcrumb, Đồng hồ thời gian thực, Sun/Moon, Chuông đỏ, Avatar L - Nguyễn Hữu Hòa) */}
        <Topbar
          currentModuleName={activeModule ? activeModule.title : undefined}
          onNavigateHome={() => {
            setCurrentNav('home');
            setActiveModuleId(null);
          }}
          onNavigateWarehouse={() => {
            setCurrentNav('warehouse');
            setActiveModuleId(null);
          }}
          currentUserRole={currentUserRole}
          onChangeUserRole={(role) => {
            setCurrentUserRole(role);
            handleShowToast(`Đã chuyển chức vụ đăng nhập sang: ${role}`);
          }}
        />

        {/* Thanh thao tác phụ ngay dưới Top bar: Ô tìm kiếm nổi bật */}
        {currentNav === 'warehouse' && !activeModule && (
          <ActionToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* 3 & 4. Khu vực nội dung chính */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          {/* Màn hình Trang chủ (Home Launcher) */}
          {currentNav === 'home' && (
            <HomeLauncher
              onSelectNav={(nav) => {
                if (nav === 'warehouse') {
                  setCurrentNav('warehouse');
                  setActiveModuleId(null);
                } else {
                  setCurrentNav(nav);
                }
              }}
              userName="Nguyễn Hữu Hòa"
            />
          )}

          {/* Phân hệ Kho vận */}
          {currentNav === 'warehouse' && (
            <>
              {activeModule ? (
                /* Chi tiết phân hệ khi nhấp thẻ */
                <ModuleDetailView
                  module={activeModule}
                  onBackToHub={() => setActiveModuleId(null)}
                  onShowToast={handleShowToast}
                  currentUserRole={currentUserRole}
                  onChangeUserRole={(role) => {
                    setCurrentUserRole(role);
                    handleShowToast(`Đã chuyển chức vụ đăng nhập sang: ${role}`);
                  }}
                />
              ) : (
                /* Phân nhóm thẻ Kho vận & Bố cục lưới 4 cột */
                <ModuleCardsHub
                  groups={MODULE_GROUPS}
                  searchQuery={searchQuery}
                  onSelectModule={(id) => setActiveModuleId(id)}
                  onClearSearch={() => setSearchQuery('')}
                  onQuickAction={(id) => setActiveModuleId(id)}
                />
              )}
            </>
          )}

          {/* Các phân hệ khác trong 6 phân hệ (Sửa chữa, Công việc, Tài liệu, Hệ thống) */}
          {currentNav !== 'home' && currentNav !== 'warehouse' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-xs animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {currentNav === 'maintenance' && <Wrench className="w-7 h-7" />}
                {currentNav === 'tasks' && <CheckSquare className="w-7 h-7" />}
                {currentNav === 'documents' && <FileText className="w-7 h-7" />}
                {currentNav === 'system' && <Settings className="w-7 h-7" />}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {currentNav === 'maintenance' && 'Phân hệ Sửa chữa & Bảo dưỡng'}
                {currentNav === 'tasks' && 'Phân hệ Quản lý Công việc'}
                {currentNav === 'documents' && 'Phân hệ Tài liệu & Quy trình'}
                {currentNav === 'system' && 'Phân hệ Cấu hình Hệ thống'}
              </h2>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Đang kết nối dữ liệu vận hành Thủy điện Sơn Trà 1. Bạn có thể chuyển sang phân hệ <strong>Kho</strong> để thực hiện nghiệp vụ cấp phát, xuất nhập vật tư và kiểm kê tồn kho.
              </p>

              <button
                onClick={() => {
                  setCurrentNav('warehouse');
                  setActiveModuleId(null);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-600/20"
              >
                <span>Vào phân hệ Kho</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-2 duration-150 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
