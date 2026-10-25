import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Boxes,
  MapPin,
  ShieldCheck,
  FileCheck2,
  Download,
  Calendar,
  X,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  History,
  PackageSearch,
  Database,
  RotateCw,
  Settings,
  Lock,
  Unlock,
  MessageSquarePlus,
} from 'lucide-react';
import {
  WarehouseModuleId,
  WarehouseModule,
  StockSlip,
  UserRole,
  MaterialRequest,
  StockSlipItem,
  SummaryApprovalStatus,
} from '../types/warehouse';
import {
  MOCK_STOCK_SLIPS,
  MOCK_MATERIAL_REQUESTS,
  MOCK_STOCK_HISTORY,
  MOCK_INVENTORY_AUDITS,
  MOCK_INVENTORY_REPORT,
  MOCK_IN_OUT_REPORT,
  MOCK_MATERIALS,
  MOCK_CONSUMABLES,
  MOCK_TOOLS,
  MOCK_WAREHOUSES,
  MOCK_MATERIAL_TRACKING,
} from '../data/warehouseData';
import { MaterialTrackingItem } from '../types/warehouse';
import { CreateModal } from './CreateModal';
import { EditSlipModal } from './EditSlipModal';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import { fetchPhieuKhoFromSupabase, isSupabaseConfigured } from '../lib/supabase';

interface ModuleDetailViewProps {
  module: WarehouseModule;
  onBackToHub: () => void;
  onShowToast: (msg: string) => void;
  currentUserRole?: UserRole;
  onChangeUserRole?: (role: UserRole) => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  module,
  onBackToHub,
  onShowToast,
  currentUserRole = 'Admin/BGĐ',
  onChangeUserRole,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [movementFilter, setMovementFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'MONTH' | 'YEAR'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<'ALL' | 'Đã mua' | 'Chưa mua' | 'Không mua'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlipDetail, setSelectedSlipDetail] = useState<any | null>(null);

  // Action states for edit & delete in Phieu kho
  const [slipToEdit, setSlipToEdit] = useState<StockSlip | null>(null);
  const [slipToDelete, setSlipToDelete] = useState<StockSlip | null>(null);

  // States for Phiếu đề xuất vật tư (de-xuat-vat-tu) & Bảng Tổng hợp vật tư
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(MOCK_MATERIAL_REQUESTS);
  const [requestDeptFilter, setRequestDeptFilter] = useState<'ALL' | 'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC'>('ALL');
  const [requestCategoryFilter, setRequestCategoryFilter] = useState<'ALL' | 'Cơ khí' | 'Điện'>('ALL');
  const [requestMonthFilter, setRequestMonthFilter] = useState<string>('ALL');
  const [requestYearFilter, setRequestYearFilter] = useState<string>('ALL');
  const [isMaterialSummaryOpen, setIsMaterialSummaryOpen] = useState(false);
  const [summaryApprovalStatus, setSummaryApprovalStatus] = useState<SummaryApprovalStatus>('Chờ duyệt');
  const [summaryApprovalNote, setSummaryApprovalNote] = useState<string>('');
  const [summaryPricingOverrides, setSummaryPricingOverrides] = useState<
    Record<string, { unitPrice?: number; taxRate?: number; note?: string }>
  >({});
  const [requestToEdit, setRequestToEdit] = useState<MaterialRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<MaterialRequest | null>(null);

  // Nếu người đăng nhập thuộc phòng ban cụ thể (Ban KTSC, Ban KTVH, Phòng HCTC)
  const loggedInDepartment: 'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC' | null =
    currentUserRole === 'Ban KTSC'
      ? 'Ban KTSC'
      : currentUserRole === 'Ban KTVH'
      ? 'Ban KTVH'
      : currentUserRole === 'Phòng HCTC'
      ? 'Ban HCTC'
      : null;

  // Helper parse tháng & năm từ chuỗi ngày (DD/MM/YYYY hoặc YYYY-MM-DD)
  const extractMonthYear = (dateStr: string): { month: string; year: string } => {
    if (!dateStr) return { month: '', year: '' };
    const clean = dateStr.trim().split(' ')[0];
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        return { month: parts[1].padStart(2, '0'), year: parts[2] };
      }
    } else if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length === 3) {
        return { year: parts[0], month: parts[1].padStart(2, '0') };
      }
    }
    return { month: '', year: '' };
  };

  // Helper loại bỏ phần ghi chú vai trò trong ngoặc ở cột người tạo (ví dụ: 'Trần Văn Mạnh (Thủ kho)' -> 'Trần Văn Mạnh')
  const formatCreatorName = (name: string) => {
    if (!name) return '—';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Supabase state for table Phieu_kho
  const [warehouseSlips, setWarehouseSlips] = useState<StockSlip[]>(MOCK_STOCK_SLIPS);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(isSupabaseConfigured());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Load live data from Supabase table Phieu_kho
  const loadPhieuKhoData = async (silent = false) => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseConnected(false);
      return;
    }
    if (!silent) setIsSupabaseLoading(true);
    const { data, error } = await fetchPhieuKhoFromSupabase();
    if (!silent) setIsSupabaseLoading(false);
    if (!error && data) {
      setIsSupabaseConnected(true);
      if (data.length > 0) {
        setWarehouseSlips(data);
      }
    } else if (error) {
      setIsSupabaseConnected(false);
      console.warn('Lỗi kết nối Supabase Phieu_kho:', error);
    }
  };

  useEffect(() => {
    if (module.id === 'phieu-kho') {
      loadPhieuKhoData(true);
    }
  }, [module.id]);

  // Status badge styling helper - Nhất quán chuẩn giao diện rounded-full cho tất cả trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã mua':
      case 'Đã duyệt':
      case 'Đã phê duyệt':
      case 'Phòng HCTC Đã duyệt':
      case 'BGĐ Đã duyệt':
      case 'Hoàn tất':
      case 'Đang hoạt động':
      case 'Sẵn sàng':
      case 'Đủ hàng':
      case 'Đang áp dụng':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{status}</span>
          </span>
        );
      case 'Chưa mua':
      case 'Chờ duyệt':
      case 'Đang kiểm kê':
      case 'Chờ đối chiếu':
      case 'Sắp hết':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{status}</span>
          </span>
        );
      case 'Phòng HCTC Duyệt có ghi chú':
      case 'BGĐ Duyệt có ghi chú':
      case 'Đang xử lý':
      case 'Đang sử dụng':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
            <span>{status}</span>
          </span>
        );
      case 'Không mua':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <X className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Không mua</span>
          </span>
        );
      case 'Đã hủy':
      case 'Từ chối':
      case 'Phòng HCTC Từ chối':
      case 'BGĐ Từ chối':
      case 'Bảo trì':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Dynamic button label
  const getCreateButtonLabel = () => {
    switch (module.id) {
      case 'phieu-kho':
        return 'Lập phiếu kho mới';
      case 'de-xuat-vat-tu':
        return 'Lập phiếu đề xuất vật tư';
      case 'kiem-ke-kho':
        return 'Lập đợt kiểm kê kho';
      case 'lich-su-xuat-nhap':
        return 'Ghi nhận biến động kho';
      default:
        return 'Tạo mới dữ liệu';
    }
  };

  // Render specific tables based on module ID
  const renderTableContent = () => {
    switch (module.id) {
      case 'phieu-kho': {
        const filtered = warehouseSlips.filter((s) => {
          const matchQ =
            s.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            s.creator.toLowerCase().includes(filterQuery.toLowerCase()) ||
            (s.note && s.note.toLowerCase().includes(filterQuery.toLowerCase()));
          const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
          const matchType = movementFilter === 'ALL' || s.type === movementFilter;
          return matchQ && matchStatus && matchType;
        });

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th
                    className="py-3 px-4 text-center font-bold"
                    style={{ fontFamily: 'Arial', fontWeight: 'bold', textAlign: 'center' }}
                  >
                    Mã phiếu
                  </th>
                  <th
                    className="py-3 px-4 text-center font-bold"
                    style={{ fontFamily: 'Arial', textAlign: 'center' }}
                  >
                    Loại phiếu
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">Thời gian</th>
                  <th className="py-3 px-4 font-semibold">Người tạo</th>
                  <th className="py-3 px-4 font-semibold">Mô tả</th>
                  <th className="py-3 px-4 text-center font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Mã phiếu */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-center tracking-tight">
                      {row.code}
                    </td>

                    {/* 2. Loại phiếu */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          row.type === 'Nhập kho'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.type === 'Xuất kho'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>

                    {/* 3. Thời gian */}
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 text-center">
                      {row.createdAt}
                    </td>

                    {/* 4. Người tạo */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {formatCreatorName(row.creator)}
                    </td>

                    {/* 5. Mô tả */}
                    <td className="py-3 px-4 text-slate-600 text-xs max-w-sm">
                      {row.note || (
                        row.warehouseSource
                          ? `Xuất từ ${row.warehouseSource}`
                          : row.warehouseTarget
                          ? `Nhập vào ${row.warehouseTarget}`
                          : '—'
                      )}
                    </td>

                    {/* 6. Trạng thái */}
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge(row.status)}
                    </td>

                    {/* 7. Thao tác: 3 icon gồm Xem, Sửa, Xóa */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedSlipDetail({ ...row, kind: 'slip' })}
                          title="Xem chi tiết phiếu kho"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSlipToEdit(row)}
                          title="Chỉnh sửa phiếu kho"
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSlipToDelete(row)}
                          title="Xóa phiếu kho"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'de-xuat-vat-tu': {
        const filtered = materialRequests.filter((r) => {
          const q = filterQuery.toLowerCase().trim();
          const matchQ =
            !q ||
            r.code.toLowerCase().includes(q) ||
            r.department.toLowerCase().includes(q) ||
            r.requester.toLowerCase().includes(q) ||
            (r.purpose && r.purpose.toLowerCase().includes(q)) ||
            (r.approvalLevel && r.approvalLevel.toLowerCase().includes(q));

          const matchDept =
            requestDeptFilter === 'ALL' || r.department === requestDeptFilter;

          const matchCategory =
            requestCategoryFilter === 'ALL' ||
            r.category === requestCategoryFilter ||
            (r.items && r.items.some((it) => it.category === requestCategoryFilter));

          const { month, year } = extractMonthYear(r.requestDate);
          const matchMonth =
            requestMonthFilter === 'ALL' || month === requestMonthFilter;
          const matchYear =
            requestYearFilter === 'ALL' || year === requestYearFilter;

          const matchStatus =
            statusFilter === 'ALL' ||
            r.status === statusFilter ||
            (statusFilter === 'Đã duyệt' && r.status === 'Đã phê duyệt');

          return matchQ && matchDept && matchCategory && matchMonth && matchYear && matchStatus;
        });

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 text-center">Thời gian</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Người đề xuất</th>
                  <th className="py-3 px-4 min-w-[240px]">Mục đích</th>
                  <th className="py-3 px-4 text-center">Cấp duyệt</th>
                  <th className="py-3 px-4 text-center">Mức độ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Không tìm thấy phiếu đề xuất vật tư nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const canSeeRowStatus =
                      !loggedInDepartment || row.department === loggedInDepartment;

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Thời gian */}
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700 text-center font-semibold">
                          {row.requestDate}
                        </td>

                        {/* 2. Phòng ban */}
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-bold">
                              {row.department}
                            </span>
                            {row.category && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  row.category === 'Cơ khí'
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {row.category}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Người đề xuất */}
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {formatCreatorName(row.requester)}
                        </td>

                        {/* 4. Mục đích */}
                        <td className="py-3 px-4 text-slate-600 max-w-md">
                          {row.purpose || '—'}
                        </td>

                        {/* 5. Cấp duyệt (Ban KTSC, Ban KTVH, Ban HCTC) */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {row.approvalLevel || row.department}
                          </span>
                        </td>

                        {/* 6. Mức độ */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              row.urgency === 'Khẩn cấp'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : row.urgency === 'Gấp'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {row.urgency}
                          </span>
                        </td>

                        {/* 7. Trạng thái (Nếu người đăng nhập thuộc phòng ban nào chỉ nhìn thấy trạng thái của phòng ban đó) */}
                        <td className="py-3 px-4 text-center">
                          {canSeeRowStatus ? (
                            renderStatusBadge(row.status)
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full"
                              title={`Người đăng nhập thuộc ${currentUserRole} chỉ nhìn thấy trạng thái của phòng ban mình`}
                            >
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Nội bộ {row.department}</span>
                            </span>
                          )}
                        </td>

                        {/* 8. Thao tác (Xem, Sửa, Xóa) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedSlipDetail({ ...row, kind: 'request' })}
                              title="Xem chi tiết phiếu đề xuất vật tư"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRequestToEdit(row)}
                              title="Chỉnh sửa phiếu đề xuất vật tư"
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRequestToDelete(row)}
                              title="Xóa phiếu đề xuất vật tư"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );
      }

      case 'lich-su-xuat-nhap': {
        const filtered = MOCK_STOCK_HISTORY.filter((h) => {
          const matchQ =
            h.itemCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
            h.itemName.toLowerCase().includes(filterQuery.toLowerCase()) ||
            h.referenceSlip.toLowerCase().includes(filterQuery.toLowerCase());
          const matchMove = movementFilter === 'ALL' || h.movementType === movementFilter;
          return matchQ && matchMove;
        });

        return (
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Mã vật tư</th>
                    <th className="py-3 px-4">Tên vật tư / Thiết bị</th>
                    <th className="py-3 px-4 text-center">Biến động</th>
                    <th className="py-3 px-4 text-right">Số lượng</th>
                    <th className="py-3 px-4">ĐVT</th>
                    <th className="py-3 px-4">Kho ghi nhận</th>
                    <th className="py-3 px-4">Chứng từ gốc</th>
                    <th className="py-3 px-4">Thủ kho thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.itemCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{row.itemName}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            row.movementType === 'Nhập'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.movementType === 'Xuất'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {row.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {row.movementType === 'Xuất' ? `-${row.quantity}` : `+${row.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{row.unit}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{row.warehouse}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{row.referenceSlip}</td>
                      <td className="py-3 px-4 text-slate-600">{row.performer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        );
      }

      case 'kiem-ke-kho': {
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã đợt</th>
                  <th className="py-3 px-4">Tên đợt kiểm kê</th>
                  <th className="py-3 px-4">Kho áp dụng</th>
                  <th className="py-3 px-4">Thời gian kiểm</th>
                  <th className="py-3 px-4">Chủ tịch đoàn / Trưởng đoàn</th>
                  <th className="py-3 px-4 text-right">Số mục kiểm</th>
                  <th className="py-3 px-4 text-center">Lệch tồn</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_INVENTORY_AUDITS.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.title}</td>
                    <td className="py-3 px-4 text-slate-600">{row.warehouse}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.auditPeriod}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{row.leadAuditor}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {row.itemsAudited} SKU
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {row.discrepanciesCount > 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {row.discrepanciesCount} lệch
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Khớp 100%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{renderStatusBadge(row.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSlipDetail({ ...row, kind: 'audit' })}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded transition-colors cursor-pointer border border-teal-200"
                      >
                        Biên bản
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'bao-cao-ton-kho': {
        const filtered = MOCK_INVENTORY_REPORT.filter(
          (i) =>
            i.itemCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
            i.itemName.toLowerCase().includes(filterQuery.toLowerCase()) ||
            i.location.toLowerCase().includes(filterQuery.toLowerCase())
        );

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Tên hàng hóa / Vật tư</th>
                  <th className="py-3 px-4">Kho & Kệ lưu trữ</th>
                  <th className="py-3 px-4 text-right">Tồn thực tế</th>
                  <th className="py-3 px-4 text-right">Khả dụng</th>
                  <th className="py-3 px-4 text-right">Đang giữ chỗ</th>
                  <th className="py-3 px-4 text-right">Định mức tối thiểu</th>
                  <th className="py-3 px-4 text-right">Đơn giá vốn</th>
                  <th className="py-3 px-4 text-right">Tổng giá trị</th>
                  <th className="py-3 px-4 text-center">Tình trạng tồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.itemCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.itemName}</div>
                      <div className="text-[11px] text-slate-400">{row.category}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{row.location}</div>
                      <div className="text-[11px] font-mono text-slate-400">{row.shelf}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {row.quantityOnHand} {row.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-emerald-700">
                      {row.availableQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {row.reservedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {row.minThreshold}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.unitCost}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {row.totalValue}
                    </td>
                    <td className="py-3 px-4 text-center">{renderStatusBadge(row.stockStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'bao-cao-nxt': {
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Tên hàng hóa</th>
                  <th className="py-3 px-4">ĐVT</th>
                  <th className="py-3 px-4 text-right">Tồn đầu kỳ</th>
                  <th className="py-3 px-4 text-right text-emerald-700">Tổng nhập kỳ</th>
                  <th className="py-3 px-4 text-right text-amber-700">Tổng xuất kỳ</th>
                  <th className="py-3 px-4 text-right font-bold text-blue-700">Tồn cuối kỳ</th>
                  <th className="py-3 px-4 text-center">Hệ số quay vòng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_IN_OUT_REPORT.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 tracking-tight">{row.itemCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.itemName}</td>
                    <td className="py-3 px-4 text-slate-500">{row.unit}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-700">
                      {row.openingStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600">
                      +{row.inStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-amber-600">
                      -{row.outStock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-700 bg-blue-50/40">
                      {row.closingStock}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-700">
                      {row.turnoverRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'theo-doi-vat-tu': {
        const filtered = MOCK_MATERIAL_TRACKING.filter((item) => {
          const q = filterQuery.toLowerCase().trim();
          const matchQuery =
            !q ||
            item.code.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            item.department.toLowerCase().includes(q) ||
            (item.supplier && item.supplier.toLowerCase().includes(q)) ||
            (item.poNumber && item.poNumber.toLowerCase().includes(q)) ||
            (item.note && item.note.toLowerCase().includes(q));

          const matchStatus =
            purchaseStatusFilter === 'ALL' || item.status === purchaseStatusFilter;

          const matchStartDate = !startDate || item.requestDate >= startDate;
          const matchEndDate = !endDate || item.requestDate <= endDate;

          return matchQuery && matchStatus && matchStartDate && matchEndDate;
        });

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[130px]">Mã vật tư</th>
                  <th className="py-3 px-4 min-w-[220px]">Tên quy cách vật tư</th>
                  <th className="py-3 px-4 text-center">ĐVT</th>
                  <th className="py-3 px-4 text-right">Số lượng</th>
                  <th className="py-3 px-4 min-w-[150px]">Đơn vị đề xuất</th>
                  <th className="py-3 px-4 min-w-[180px]">Nhà cung cấp / Đơn vị thực hiện</th>
                  <th className="py-3 px-4 text-center">Ngày đề xuất</th>
                  <th className="py-3 px-4 text-center">Dự kiến về kho</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[110px]">Số PO / HĐ</th>
                  <th className="py-3 px-4 min-w-[200px]">Ghi chú tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PackageSearch className="w-8 h-8 text-slate-300" />
                        <span className="font-medium text-slate-500">
                          Không tìm thấy vật tư phù hợp với điều kiện lọc
                        </span>
                        {(filterQuery || startDate || endDate || purchaseStatusFilter !== 'ALL') && (
                          <button
                            onClick={() => {
                              setFilterQuery('');
                              setStartDate('');
                              setEndDate('');
                              setPurchaseStatusFilter('ALL');
                            }}
                            className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer font-semibold"
                          >
                            Xóa tất cả bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {row.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {row.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {row.quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {row.department}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.supplier || <span className="text-slate-400 italic">Chưa chỉ định</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.requestDate.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.expectedDate ? row.expectedDate.split('-').reverse().join('/') : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderStatusBadge(row.status)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                        {row.poNumber || <span className="text-slate-400 font-normal">-</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic">
                        {row.note || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      }

      case 'danh-muc-vat-tu': {
        const filtered = MOCK_MATERIALS.filter(
          (m) =>
            m.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            m.specifications.toLowerCase().includes(filterQuery.toLowerCase())
        );

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã vật tư</th>
                  <th className="py-3 px-4">Tên quy chuẩn</th>
                  <th className="py-3 px-4">ĐVT</th>
                  <th className="py-3 px-4">Nhóm danh mục</th>
                  <th className="py-3 px-4">Thông số kỹ thuật chi tiết</th>
                  <th className="py-3 px-4">Hãng sản xuất</th>
                  <th className="py-3 px-4">Xuất xứ</th>
                  <th className="py-3 px-4">Tiêu chuẩn kỹ thuật</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{row.unit}</td>
                    <td className="py-3 px-4 text-slate-600">{row.category}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{row.specifications}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.brand}</td>
                    <td className="py-3 px-4 text-slate-600">{row.origin}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{row.standard}</td>
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge('Đang áp dụng')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'vat-tu-tieu-hao': {
        const filtered = MOCK_CONSUMABLES.filter(
          (m) =>
            m.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            m.name.toLowerCase().includes(filterQuery.toLowerCase())
        );

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã phụ liệu</th>
                  <th className="py-3 px-4">Tên vật tư tiêu hao</th>
                  <th className="py-3 px-4">ĐVT đóng gói</th>
                  <th className="py-3 px-4">Phân nhóm</th>
                  <th className="py-3 px-4">Đặc tính kỹ thuật & Bảo quản</th>
                  <th className="py-3 px-4">Hãng / Nhà cung cấp</th>
                  <th className="py-3 px-4">Xuất xứ</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{row.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{row.unit}</td>
                    <td className="py-3 px-4 text-slate-600">{row.category}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{row.specifications}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.brand}</td>
                    <td className="py-3 px-4 text-slate-600">{row.origin}</td>
                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge('Sẵn sàng')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'cong-cu-dung-cu': {
        const filtered = MOCK_TOOLS.filter(
          (t) =>
            t.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.serialNumber.toLowerCase().includes(filterQuery.toLowerCase())
        );

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã tài sản</th>
                  <th className="py-3 px-4">Tên công cụ / Thiết bị</th>
                  <th className="py-3 px-4">Số Serial</th>
                  <th className="py-3 px-4">ĐVT</th>
                  <th className="py-3 px-4">Thông số & Dải làm việc</th>
                  <th className="py-3 px-4">Đơn vị / Nhân sự quản lý</th>
                  <th className="py-3 px-4 text-center">Tình trạng</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 tracking-tight tabular-nums">{row.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{row.serialNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{row.unit}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{row.specs}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.assignedTo || 'Chưa bàn giao'}</td>
                    <td className="py-3 px-4 text-center">{renderStatusBadge(row.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSlipDetail({ ...row, kind: 'tool' })}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        Sổ theo dõi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'danh-sach-kho': {
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã kho</th>
                  <th className="py-3 px-4">Tên chi nhánh kho</th>
                  <th className="py-3 px-4">Khu vực / Chi nhánh</th>
                  <th className="py-3 px-4">Địa chỉ thực tế</th>
                  <th className="py-3 px-4">Thủ kho phụ trách</th>
                  <th className="py-3 px-4">Số điện thoại liên hệ</th>
                  <th className="py-3 px-4 text-center">Số dãy kệ</th>
                  <th className="py-3 px-4 text-center">Tỷ lệ lấp đầy</th>
                  <th className="py-3 px-4 text-center">Vận hành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_WAREHOUSES.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 tracking-tight tabular-nums">{row.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.branch}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{row.address}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.manager}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{row.phone}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {row.totalAisles} dãy
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.capacityPercentage > 75
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${row.capacityPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {row.capacityPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{renderStatusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Ô tóm tắt trên cùng: Ẩn hoàn toàn đối với Phiếu kho theo yêu cầu */}
      {module.id !== 'phieu-kho' && (
        <div
          className={`grid grid-cols-1 ${
            module.id === 'theo-doi-vat-tu' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
          } gap-3`}
        >
          {module.id === 'theo-doi-vat-tu' ? (
            <>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Tổng vật tư theo dõi
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {MOCK_MATERIAL_TRACKING.length} mặt hàng
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
                <span className="text-xs font-medium text-emerald-700 block mb-1">
                  Đã mua về kho
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {MOCK_MATERIAL_TRACKING.filter((i) => i.status === 'Đã mua').length} mục
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 bg-amber-50/20 shadow-2xs">
                <span className="text-xs font-medium text-amber-700 block mb-1">
                  Chưa mua (Đang xử lý)
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-amber-700">
                  {MOCK_MATERIAL_TRACKING.filter((i) => i.status === 'Chưa mua').length} mục
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Không mua / Tận dụng kho
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-600">
                  {MOCK_MATERIAL_TRACKING.filter((i) => i.status === 'Không mua').length} mục
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  {module.id === 'lich-su-xuat-nhap' ? 'Tổng biến động' : 'Tổng bản ghi'}
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {module.itemCount}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  {module.id === 'de-xuat-vat-tu'
                    ? 'Đề xuất cần duyệt'
                    : module.id === 'kiem-ke-kho'
                    ? 'Lệch cần đối chiếu'
                    : 'Ưu tiên xử lý'}
                </span>
                <div className="text-lg font-bold font-mono tabular-nums text-amber-600">
                  {module.id === 'kiem-ke-kho' ? '2 mục' : '3 phiếu'}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  Cập nhật gần nhất
                </span>
                <div className="text-sm font-semibold font-mono tabular-nums text-slate-800">
                  17/10/2026
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table filter toolbar */}
        {module.id === 'theo-doi-vat-tu' ? (
          <div className="p-3.5 border-b border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5 flex-1 flex-wrap">
              {/* Nút quay lại (mũi tên) */}
              <button
                onClick={onBackToHub}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer shrink-0"
                title="Quay lại danh sách phân hệ Kho"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Ô tìm kiếm */}
              <div className="relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Tìm kiếm vật tư theo mã, tên..."
                  style={{ width: '250px' }}
                  className="w-[250px] pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Chọn từ ngày đến ngày */}
              <div className="flex items-center gap-1.5 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 shrink-0 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-medium">Từ ngày:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none font-mono cursor-pointer"
                  title="Chọn ngày bắt đầu"
                />
                <span className="text-[11px] text-slate-400 font-medium">Đến ngày:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 focus:outline-none font-mono cursor-pointer"
                  title="Chọn ngày kết thúc"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Xóa khoảng ngày"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Ô trạng thái lọc chọn: đã mua, chưa mua, không mua */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={purchaseStatusFilter}
                  onChange={(e) => setPurchaseStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="Đã mua">Đã mua</option>
                  <option value="Chưa mua">Chưa mua</option>
                  <option value="Không mua">Không mua</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 border-b border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5 flex-1 flex-wrap">
              {/* Nút quay lại (mũi tên) */}
              <button
                onClick={onBackToHub}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer shrink-0"
                title="Quay lại danh sách phân hệ Kho"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Ô tìm kiếm */}
              <div className="relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Lọc dữ liệu theo từ khóa..."
                  style={{ width: '250px' }}
                  className="w-[250px] pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Ô xổ xuống: Loại phiếu và Trạng thái cho Phiếu kho */}
              {module.id === 'phieu-kho' && (
                <>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Loại phiếu:</span>
                    <select
                      value={movementFilter}
                      onChange={(e) => setMovementFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">Tất cả loại phiếu</option>
                      <option value="Nhập kho">Phiếu nhập kho</option>
                      <option value="Xuất kho">Phiếu xuất kho</option>
                      <option value="Chuyển kho">Phiếu chuyển kho</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Trạng thái:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="Đã duyệt">Đã duyệt</option>
                      <option value="Chờ duyệt">Chờ duyệt</option>
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>

                  {/* Button Lập phiếu kho mới đặt ngang hàng với trạng thái */}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lập phiếu kho mới</span>
                  </button>

                  {/* Nút kết nối Supabase bảng Phieu_kho */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsConfigModalOpen(true)}
                      title="Cấu hình & kiểm tra kết nối bảng Phieu_kho trong Supabase"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                        isSupabaseConnected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span>{isSupabaseConnected ? `Supabase: Phieu_kho (${warehouseSlips.length})` : 'Supabase: Phieu_kho'}</span>
                      <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    </button>

                    <button
                      onClick={() => {
                        loadPhieuKhoData();
                        onShowToast('Đang làm mới dữ liệu từ bảng Phieu_kho trên Supabase...');
                      }}
                      disabled={isSupabaseLoading}
                      title="Tải lại dữ liệu từ Supabase"
                      className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isSupabaseLoading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                  </div>
                </>
              )}

              {/* Bộ lọc cho Đề xuất vật tư: Đơn vị đề xuất, Hạng mục (Cơ khí, Điện), Thời gian (Tháng, Năm), Trạng thái */}
              {module.id === 'de-xuat-vat-tu' && (
                <>
                  {/* Ô lọc theo Đơn vị đề xuất */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shrink-0 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Đơn vị đề xuất:</span>
                    <select
                      value={requestDeptFilter}
                      onChange={(e) => setRequestDeptFilter(e.target.value as any)}
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả đơn vị</option>
                      <option value="Ban KTSC">Ban KTSC</option>
                      <option value="Ban KTVH">Ban KTVH</option>
                      <option value="Ban HCTC">Ban HCTC</option>
                    </select>
                  </div>

                  {/* Ô lọc theo Hạng mục (Cơ khí, Điện) */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shrink-0 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Hạng mục:</span>
                    <select
                      value={requestCategoryFilter}
                      onChange={(e) =>
                        setRequestCategoryFilter(e.target.value as 'ALL' | 'Cơ khí' | 'Điện')
                      }
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả hạng mục</option>
                      <option value="Cơ khí">Cơ khí</option>
                      <option value="Điện">Điện</option>
                    </select>
                  </div>

                  {/* Ô thời gian (Tháng, năm) */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shrink-0 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 font-medium">Thời gian:</span>
                    <select
                      value={requestMonthFilter}
                      onChange={(e) => setRequestMonthFilter(e.target.value)}
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      title="Chọn tháng"
                    >
                      <option value="ALL">Tất cả tháng</option>
                      <option value="01">Tháng 01</option>
                      <option value="02">Tháng 02</option>
                      <option value="03">Tháng 03</option>
                      <option value="04">Tháng 04</option>
                      <option value="05">Tháng 05</option>
                      <option value="06">Tháng 06</option>
                      <option value="07">Tháng 07</option>
                      <option value="08">Tháng 08</option>
                      <option value="09">Tháng 09</option>
                      <option value="10">Tháng 10</option>
                      <option value="11">Tháng 11</option>
                      <option value="12">Tháng 12</option>
                    </select>
                    <span className="text-slate-300">/</span>
                    <select
                      value={requestYearFilter}
                      onChange={(e) => setRequestYearFilter(e.target.value)}
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      title="Chọn năm"
                    >
                      <option value="ALL">Tất cả năm</option>
                      <option value="2026">Năm 2026</option>
                      <option value="2025">Năm 2025</option>
                    </select>
                  </div>

                  {/* Ô lọc Trạng thái */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs shrink-0 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Trạng thái:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="Đã phê duyệt">Đã phê duyệt</option>
                      <option value="Chờ duyệt">Chờ duyệt</option>
                      <option value="Từ chối">Từ chối</option>
                    </select>
                  </div>
                </>
              )}

              {/* Ô xổ xuống: Trạng thái cho Kiểm kê kho */}
              {module.id === 'kiem-ke-kho' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium">Trạng thái:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="Đã duyệt">Đã duyệt (Khớp số)</option>
                    <option value="Đang kiểm kê">Đang kiểm kê</option>
                  </select>
                </div>
              )}

              {/* Ô xổ xuống: Biến động và Thời gian cho Lịch sử xuất nhập */}
              {module.id === 'lich-su-xuat-nhap' && (
                <>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Biến động:</span>
                    <select
                      value={movementFilter}
                      onChange={(e) => setMovementFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">Tất cả biến động</option>
                      <option value="Nhập">Nhập kho</option>
                      <option value="Xuất">Xuất kho</option>
                      <option value="Điều chuyển">Điều chuyển</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Thời gian:</span>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="ALL">Tất cả thời gian</option>
                      <option value="TODAY">Hôm nay (17/10)</option>
                      <option value="MONTH">Tháng 10/2026</option>
                      <option value="YEAR">Năm 2026</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Cụm nút hành động bên phải cho các phân hệ */}
            {['de-xuat-vat-tu', 'kiem-ke-kho', 'lich-su-xuat-nhap'].includes(module.id) && (
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {module.id === 'de-xuat-vat-tu' && (
                  <button
                    type="button"
                    onClick={() => setIsMaterialSummaryOpen(true)}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer shrink-0"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Tổng hợp vật tư</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{getCreateButtonLabel()}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Table Content */}
        {renderTableContent()}

        {/* Table Pagination bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>Hiển thị tất cả bản ghi hợp lệ theo kỳ</span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <button className="px-2 py-1 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed">
              Trước
            </button>
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold">1</span>
            <button className="px-2 py-1 border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Professional Full Slip Detail Modal */}
      {selectedSlipDetail && (() => {
        const isStockSlip = selectedSlipDetail.kind === 'slip';
        const slipType: 'Nhập kho' | 'Xuất kho' | 'Chuyển kho' =
          selectedSlipDetail.type === 'Xuất kho' || selectedSlipDetail.type === 'Chuyển kho'
            ? selectedSlipDetail.type
            : 'Nhập kho';

        const cleanRawCreator = formatCreatorName(
          selectedSlipDetail.creator ||
            selectedSlipDetail.requester ||
            selectedSlipDetail.leadAuditor ||
            'Nguyễn Hữu Hòa'
        );
        const normalizedCreator = isStockSlip
          ? cleanRawCreator === 'Lê Văn Hải' || cleanRawCreator === 'Nguyễn Hữu Hòa'
            ? cleanRawCreator
            : 'Nguyễn Hữu Hòa'
          : cleanRawCreator;

        const normalizedApprover = 'Đinh Bạt Quân';

        const normalizedDeliverer =
          selectedSlipDetail.deliverer === 'Trần Quang Hiếu' ||
          selectedSlipDetail.deliverer === 'Ngô Thiện Nhân'
            ? selectedSlipDetail.deliverer
            : 'Ngô Thiện Nhân';

        const normalizedReceiver =
          selectedSlipDetail.receiver === 'Lê Ngọc Nhàn' ||
          selectedSlipDetail.receiver === 'Bùi Văn Thuận' ||
          selectedSlipDetail.receiver === 'Thái Ngọc Thức'
            ? selectedSlipDetail.receiver
            : 'Lê Ngọc Nhàn';

        const validWarehouses = ['Kho cơ 1A', 'Kho điện 1A', 'Kho cơ điện 1C'];
        const validPlants = ['Nhà máy 1A', 'Nhà máy 1B', 'Nhà máy 1C', 'Nhà QLVH'];

        const normalizedSource =
          selectedSlipDetail.warehouseSource &&
          validWarehouses.includes(selectedSlipDetail.warehouseSource)
            ? selectedSlipDetail.warehouseSource
            : 'Kho cơ 1A';

        const normalizedTarget =
          slipType === 'Nhập kho'
            ? selectedSlipDetail.warehouseTarget &&
              validWarehouses.includes(selectedSlipDetail.warehouseTarget)
              ? selectedSlipDetail.warehouseTarget
              : 'Kho cơ 1A'
            : slipType === 'Xuất kho'
            ? selectedSlipDetail.warehouseTarget &&
              validPlants.includes(selectedSlipDetail.warehouseTarget)
              ? selectedSlipDetail.warehouseTarget
              : 'Nhà máy 1A'
            : selectedSlipDetail.warehouseTarget &&
              validWarehouses.includes(selectedSlipDetail.warehouseTarget)
            ? selectedSlipDetail.warehouseTarget
            : 'Kho điện 1A';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-6">
              {/* Document Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-600 uppercase">
                      CÔNG TY CỔ PHẦN THỦY ĐIỆN ĐẠT PHƯƠNG SƠN TRÀ
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Nhà máy thủy điện Sơn Trà 1
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-blue-700">
                      Số: {selectedSlipDetail.code}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Ngày: {selectedSlipDetail.createdAt || selectedSlipDetail.requestDate || '17/10/2026'}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                    {selectedSlipDetail.kind === 'slip' && `PHIẾU ${slipType.toUpperCase()}`}
                    {selectedSlipDetail.kind === 'request' && 'PHIẾU ĐỀ XUẤT VẬT TƯ KỸ THUẬT'}
                    {selectedSlipDetail.kind === 'audit' && 'BIÊN BẢN KIỂM KÊ VÀ ĐỐI CHIẾU SỐ LIỆU KHO'}
                    {selectedSlipDetail.kind === 'tool' && 'SỔ THEO DÕI THIẾT BỊ / DỤNG CỤ'}
                  </h2>
                </div>
              </div>

              {/* Document Info Body - Phần thông tin chung theo đúng loại phiếu */}
              {isStockSlip ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      1. Phần thông tin chung
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Trạng thái:</span>
                      {renderStatusBadge(selectedSlipDetail.status || 'Chờ duyệt')}
                    </div>
                  </div>

                  {/* Hàng 1: Mã phiếu, Người lập phiếu, Người duyệt, Loại phiếu */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Mã phiếu
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        {selectedSlipDetail.code}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Người lập phiếu
                      </div>
                      <div className="font-bold text-slate-800">
                        {normalizedCreator}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Người duyệt
                      </div>
                      <div className="font-bold text-slate-800">
                        {normalizedApprover}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Loại phiếu
                      </div>
                      <div className="font-bold text-blue-700">
                        {slipType}
                      </div>
                    </div>
                  </div>

                  {/* Hàng 2: Thay đổi theo đúng Nhập kho / Xuất kho / Chuyển kho */}
                  {slipType === 'Nhập kho' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Người giao
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedDeliverer}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nơi nhận
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedTarget}
                        </div>
                      </div>
                    </div>
                  )}

                  {slipType === 'Xuất kho' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Người giao
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedDeliverer}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Người nhận
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedReceiver}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nơi xuất
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedSource}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nơi nhận
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedTarget}
                        </div>
                      </div>
                    </div>
                  )}

                  {slipType === 'Chuyển kho' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Người giao
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedDeliverer}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Người nhận
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedReceiver}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Kho chuyển
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedSource}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                          Kho nhận
                        </div>
                        <div className="font-bold text-slate-800">
                          {normalizedTarget}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedSlipDetail.kind === 'request' ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      1. Phần thông tin chung — Phiếu đề xuất vật tư
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Trạng thái:</span>
                      {renderStatusBadge(selectedSlipDetail.status || 'Chờ duyệt')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Thời gian
                      </div>
                      <div className="font-mono font-bold text-slate-800">
                        {selectedSlipDetail.requestDate}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Phòng ban (Đơn vị đề xuất)
                      </div>
                      <div className="font-bold text-blue-700">
                        {selectedSlipDetail.department}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Người đề xuất
                      </div>
                      <div className="font-bold text-slate-800">
                        {formatCreatorName(selectedSlipDetail.requester)}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Cấp duyệt
                      </div>
                      <div className="font-bold text-slate-800">
                        {selectedSlipDetail.approvalLevel || selectedSlipDetail.department}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Mức độ
                      </div>
                      <div className="font-bold text-slate-800">
                        {selectedSlipDetail.urgency}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Mã đề xuất
                      </div>
                      <div className="font-mono font-bold text-blue-700">
                        {selectedSlipDetail.code}
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-3 bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                        Mục đích
                      </div>
                      <div className="font-medium text-slate-800">
                        {selectedSlipDetail.purpose || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Người lập phiếu:</span>{' '}
                    <strong className="text-slate-800">{normalizedCreator}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Người duyệt:</span>{' '}
                    <strong className="text-slate-800">{normalizedApprover}</strong>
                  </div>
                  {selectedSlipDetail.department && (
                    <div>
                      <span className="text-slate-500">Đơn vị yêu cầu:</span>{' '}
                      <strong className="text-slate-800">{selectedSlipDetail.department}</strong>
                    </div>
                  )}
                  {selectedSlipDetail.note && (
                    <div className="col-span-2">
                      <span className="text-slate-500">Mô tả / Nội dung:</span>{' '}
                      <span className="text-slate-700 italic">{selectedSlipDetail.note}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Items list preview: STT, Tên vật tư, Mã vật tư, ĐVT, Số lượng, Ghi chú */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs mb-5">
                <div className="bg-slate-100 p-2 font-semibold text-slate-700 text-[11px] uppercase">
                  2. Phần chi tiết vật tư
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase">
                      <tr>
                        <th className="py-2 px-2.5 text-center w-10">STT</th>
                        <th className="py-2 px-2.5">Tên vật tư</th>
                        <th className="py-2 px-2.5">Mã vật tư</th>
                        <th className="py-2 px-2.5 text-center">ĐVT</th>
                        <th className="py-2 px-2.5 text-right">Số lượng</th>
                        <th className="py-2 px-2.5">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(
                        selectedSlipDetail.items && selectedSlipDetail.items.length > 0
                          ? selectedSlipDetail.items
                          : [
                              {
                                id: '1',
                                name: 'Bộ điều khiển PLC Siemens S7-1200',
                                code: 'VT-PLC-S71200',
                                unit: 'Bộ',
                                quantity: 2,
                                note: 'Dự phòng tủ điều khiển',
                              },
                              {
                                id: '2',
                                name: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
                                code: 'TH-MO-KLUBER',
                                unit: 'Tuýp 1kg',
                                quantity: 5,
                                note: 'Bảo dưỡng gối trục tuabin',
                              },
                            ]
                      ).map((it: any, idx: number) => (
                        <tr key={it.id || idx}>
                          <td className="py-2 px-2.5 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 font-medium text-slate-800">{it.name}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{it.code}</td>
                          <td className="py-2 px-2.5 text-center text-slate-600">{it.unit}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            {it.quantity}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600">{it.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures - Đồng bộ theo đúng Người lập phiếu, Người giao, Người nhận, Người duyệt */}
              {isStockSlip && slipType === 'Nhập kho' ? (
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Người lập phiếu</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedCreator}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người giao</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedDeliverer}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người duyệt</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedApprover}</div>
                  </div>
                </div>
              ) : isStockSlip ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Người lập phiếu</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedCreator}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người giao</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedDeliverer}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người nhận</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedReceiver}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người duyệt</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedApprover}</div>
                  </div>
                </div>
              ) : selectedSlipDetail.kind === 'request' ? (
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Người đề xuất</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">
                      {formatCreatorName(selectedSlipDetail.requester)}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      Cấp duyệt ({selectedSlipDetail.approvalLevel || selectedSlipDetail.department})
                    </div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">
                      {selectedSlipDetail.approvalLevel || selectedSlipDetail.department}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Phê duyệt</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedApprover}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Người lập phiếu</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedCreator}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Thủ kho phụ trách</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">Ngô Thiện Nhân</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Người duyệt</div>
                    <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                    <div className="font-semibold text-slate-800">{normalizedApprover}</div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setSelectedSlipDetail(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        moduleId={module.id}
        moduleTitle={module.title}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={(msg) => onShowToast(msg)}
        onCreatedSlip={(newSlip) => {
          setWarehouseSlips((prev) => [newSlip, ...prev]);
        }}
        onCreatedMaterialRequest={(newReq) => {
          setMaterialRequests((prev) => [newReq, ...prev]);
        }}
      />

      {/* Supabase Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConnectionSuccess={() => loadPhieuKhoData()}
        onShowToast={onShowToast}
      />

      {/* Edit Slip Modal */}
      <EditSlipModal
        isOpen={Boolean(slipToEdit)}
        slip={slipToEdit}
        onClose={() => setSlipToEdit(null)}
        currentUserRole={currentUserRole}
        onChangeUserRole={onChangeUserRole}
        onSave={(updatedSlip) => {
          setWarehouseSlips((prev) =>
            prev.map((s) => (s.id === updatedSlip.id ? updatedSlip : s))
          );
          onShowToast(`Đã cập nhật thành công phiếu kho [${updatedSlip.code}]!`);
          setSlipToEdit(null);
        }}
      />

      {/* Delete Confirmation Modal for Phieu kho */}
      {slipToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Xác nhận xóa phiếu kho
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa phiếu kho <strong className="text-rose-700 font-mono font-bold">{slipToDelete.code}</strong> khỏi hệ thống Quản lý nội bộ Thủy điện Sơn Trà 1 không? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSlipToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = slipToDelete.code;
                  setWarehouseSlips((prev) => prev.filter((s) => s.id !== slipToDelete.id));
                  onShowToast(`Đã xóa thành công phiếu kho [${code}]!`);
                  setSlipToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Phiếu đề xuất vật tư */}
      {requestToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chỉnh sửa phiếu đề xuất vật tư
                  </h3>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">
                    {requestToEdit.code}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestToEdit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMaterialRequests((prev) =>
                  prev.map((r) => (r.id === requestToEdit.id ? requestToEdit : r))
                );
                onShowToast(`Đã cập nhật thành công phiếu đề xuất [${requestToEdit.code}]!`);
                setRequestToEdit(null);
              }}
              className="p-6 space-y-4 overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thời gian
                  </label>
                  <input
                    type="text"
                    value={requestToEdit.requestDate}
                    onChange={(e) =>
                      setRequestToEdit({ ...requestToEdit, requestDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phòng ban (Đơn vị đề xuất)
                  </label>
                  <select
                    value={requestToEdit.department}
                    onChange={(e) =>
                      setRequestToEdit({
                        ...requestToEdit,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Ban KTSC">Ban KTSC</option>
                    <option value="Ban KTVH">Ban KTVH</option>
                    <option value="Ban HCTC">Ban HCTC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người đề xuất
                  </label>
                  <input
                    type="text"
                    value={requestToEdit.requester}
                    onChange={(e) =>
                      setRequestToEdit({ ...requestToEdit, requester: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cấp duyệt
                  </label>
                  <select
                    value={requestToEdit.approvalLevel}
                    onChange={(e) =>
                      setRequestToEdit({
                        ...requestToEdit,
                        approvalLevel: e.target.value as 'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Ban KTSC">Ban KTSC</option>
                    <option value="Ban KTVH">Ban KTVH</option>
                    <option value="Ban HCTC">Ban HCTC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mức độ
                  </label>
                  <select
                    value={requestToEdit.urgency}
                    onChange={(e) =>
                      setRequestToEdit({
                        ...requestToEdit,
                        urgency: e.target.value as 'Bình thường' | 'Gấp' | 'Khẩn cấp',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Gấp">Gấp</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={requestToEdit.status}
                    onChange={(e) =>
                      setRequestToEdit({
                        ...requestToEdit,
                        status: e.target.value as 'Đã phê duyệt' | 'Chờ duyệt' | 'Từ chối',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã phê duyệt">Đã phê duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hạng mục
                  </label>
                  <select
                    value={requestToEdit.category || 'Cơ khí'}
                    onChange={(e) =>
                      setRequestToEdit({
                        ...requestToEdit,
                        category: e.target.value as 'Cơ khí' | 'Điện',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Cơ khí">Cơ khí</option>
                    <option value="Điện">Điện</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mục đích
                  </label>
                  <input
                    type="text"
                    value={requestToEdit.purpose}
                    onChange={(e) =>
                      setRequestToEdit({ ...requestToEdit, purpose: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestToEdit(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa Phiếu đề xuất vật tư */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Xác nhận xóa phiếu đề xuất vật tư
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa phiếu đề xuất <strong className="text-rose-700 font-mono font-bold">{requestToDelete.code}</strong> của <strong>{requestToDelete.department}</strong> không?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = requestToDelete.code;
                  setMaterialRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
                  onShowToast(`Đã xóa thành công phiếu đề xuất vật tư [${code}]!`);
                  setRequestToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-rose-600/20"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tổng hợp vật tư đề xuất */}
      {isMaterialSummaryOpen && (() => {
        // Quyền hiển thị các cột tài chính: Đơn giá, Thành tiền trước thuế, Thuế suất, Tiền thuế, Thành tiền sau thuế
        const canViewFinancialColumns =
          currentUserRole === 'Admin/BGĐ' ||
          currentUserRole === 'BGĐ' ||
          currentUserRole === 'Kế toán';

        // Quyền thay đổi ô Trạng thái: Chỉ những người có vai trò là BGĐ (Admin/BGĐ, BGĐ), Kế toán được quyền thay đổi
        const canChangeSummaryStatus =
          currentUserRole === 'Admin/BGĐ' ||
          currentUserRole === 'BGĐ' ||
          currentUserRole === 'Kế toán';

        // Danh sách tùy chọn Trạng thái theo phòng ban người đăng nhập
        const allSummaryStatusOptions: SummaryApprovalStatus[] = [
          'Chờ duyệt',
          'Phòng HCTC Đã duyệt',
          'Phòng HCTC Từ chối',
          'Phòng HCTC Duyệt có ghi chú',
          'BGĐ Đã duyệt',
          'BGĐ Từ chối',
          'BGĐ Duyệt có ghi chú',
        ];

        const visibleStatusOptions: SummaryApprovalStatus[] =
          currentUserRole === 'Phòng HCTC'
            ? [
                'Chờ duyệt',
                'Phòng HCTC Đã duyệt',
                'Phòng HCTC Từ chối',
                'Phòng HCTC Duyệt có ghi chú',
              ]
            : allSummaryStatusOptions;

        const isNoteRequired =
          summaryApprovalStatus === 'Phòng HCTC Duyệt có ghi chú' ||
          summaryApprovalStatus === 'BGĐ Duyệt có ghi chú';

        // Lọc các phiếu đề xuất phù hợp với Hạng mục, Thời gian (Tháng, Năm) và Phòng ban
        const matchingRequests = materialRequests.filter((r) => {
          const matchDept =
            loggedInDepartment
              ? r.department === loggedInDepartment
              : requestDeptFilter === 'ALL' || r.department === requestDeptFilter;
          const { month, year } = extractMonthYear(r.requestDate);
          const matchMonth =
            requestMonthFilter === 'ALL' || month === requestMonthFilter;
          const matchYear =
            requestYearFilter === 'ALL' || year === requestYearFilter;
          const matchStatus =
            statusFilter === 'ALL' ||
            r.status === statusFilter ||
            (statusFilter === 'Đã duyệt' && r.status === 'Đã phê duyệt');
          const matchCategory =
            requestCategoryFilter === 'ALL' ||
            r.category === requestCategoryFilter ||
            (r.items && r.items.some((it) => it.category === requestCategoryFilter));

          return matchDept && matchMonth && matchYear && matchStatus && matchCategory;
        });

        const summaryMap = new Map<
          string,
          {
            key: string;
            code: string;
            name: string;
            unit: string;
            category: 'Cơ khí' | 'Điện';
            totalQuantity: number;
            defaultUnitPrice: number;
            defaultTaxRate: number;
            defaultNote: string;
          }
        >();

        matchingRequests.forEach((req) => {
          const reqItems: StockSlipItem[] =
            req.items && req.items.length > 0
              ? req.items
              : [
                  {
                    id: '1',
                    name: 'Vòng bi SKF 6205-2RSH/C3',
                    code: 'VT-BEARING-6205',
                    unit: 'Chiếc',
                    quantity: 4,
                    category: req.category || 'Cơ khí',
                    unitPrice: 245000,
                    taxRate: 8,
                    note: req.purpose || '',
                  },
                ];

          reqItems.forEach((it) => {
            const itemCat = it.category || req.category || 'Cơ khí';
            if (requestCategoryFilter !== 'ALL' && itemCat !== requestCategoryFilter) {
              return;
            }

            const key = it.code || it.name;
            const existing = summaryMap.get(key);
            if (existing) {
              existing.totalQuantity += Number(it.quantity) || 0;
              if (it.note && !existing.defaultNote.includes(it.note)) {
                existing.defaultNote = existing.defaultNote
                  ? `${existing.defaultNote}; ${it.note}`
                  : it.note;
              }
            } else {
              summaryMap.set(key, {
                key,
                code: it.code,
                name: it.name,
                unit: it.unit,
                category: itemCat,
                totalQuantity: Number(it.quantity) || 0,
                defaultUnitPrice: it.unitPrice ?? 250000,
                defaultTaxRate: it.taxRate ?? 8,
                defaultNote: it.note || req.purpose || '',
              });
            }
          });
        });

        const aggregatedRows = Array.from(summaryMap.values()).map((item) => {
          const override = summaryPricingOverrides[item.key] || {};
          const unitPrice =
            override.unitPrice !== undefined ? override.unitPrice : item.defaultUnitPrice;
          const taxRate =
            override.taxRate !== undefined ? override.taxRate : item.defaultTaxRate;
          const note =
            override.note !== undefined ? override.note : item.defaultNote;

          const amountBeforeTax = item.totalQuantity * unitPrice;
          const taxAmount = Math.round((amountBeforeTax * taxRate) / 100);
          const amountAfterTax = amountBeforeTax + taxAmount;

          return {
            ...item,
            unitPrice,
            taxRate,
            note,
            amountBeforeTax,
            taxAmount,
            amountAfterTax,
          };
        });

        const totalAggregatedQty = aggregatedRows.reduce(
          (sum, r) => sum + r.totalQuantity,
          0
        );
        const totalBeforeTax = aggregatedRows.reduce(
          (sum, r) => sum + r.amountBeforeTax,
          0
        );
        const totalTaxAmount = aggregatedRows.reduce(
          (sum, r) => sum + r.taxAmount,
          0
        );
        const totalAfterTax = aggregatedRows.reduce(
          (sum, r) => sum + r.amountAfterTax,
          0
        );

        const formatCurrency = (val: number) =>
          val.toLocaleString('vi-VN');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-teal-50/70 border-b border-teal-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Bảng Tổng Hợp Vật Tư Đề Xuất
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Tổng hợp vật tư dụng cụ theo Hạng mục (Cơ khí, Điện), Thời gian và Phê duyệt
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Chuyển nhanh vai trò đăng nhập để kiểm tra phân quyền cột Đơn giá/Thuế & quyền sửa Trạng thái */}
                  <div className="flex items-center gap-1.5 bg-white border border-teal-200 rounded-lg px-2.5 py-1 text-[11px] shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="text-slate-500">Vai trò đăng nhập:</span>
                    {onChangeUserRole ? (
                      <select
                        value={currentUserRole}
                        onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
                        className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                        title="Chuyển vai trò đăng nhập để kiểm tra hiển thị cột Đơn giá/Thuế và quyền thay đổi Trạng thái"
                      >
                        <option value="Admin/BGĐ">Admin/BGĐ</option>
                        <option value="BGĐ">BGĐ</option>
                        <option value="Kế toán">Kế toán</option>
                        <option value="Phòng HCTC">Phòng HCTC</option>
                        <option value="Ban KTSC">Ban KTSC</option>
                        <option value="Ban KTVH">Ban KTVH</option>
                        <option value="Thủ kho">Thủ kho</option>
                        <option value="Nhân viên lập phiếu">Nhân viên lập phiếu</option>
                      </select>
                    ) : (
                      <strong className="text-slate-800">{currentUserRole}</strong>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMaterialSummaryOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter & Status Bar inside Modal (Đã bỏ Đơn vị đề xuất & Số phiếu đề xuất; Thêm Hạng mục & Trạng thái) */}
              <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Ô Hạng mục (Cơ khí, Điện) */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Hạng mục:</span>
                    <select
                      value={requestCategoryFilter}
                      onChange={(e) =>
                        setRequestCategoryFilter(e.target.value as 'ALL' | 'Cơ khí' | 'Điện')
                      }
                      className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả hạng mục</option>
                      <option value="Cơ khí">Cơ khí</option>
                      <option value="Điện">Điện</option>
                    </select>
                  </div>

                  {/* Ô Tháng */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Tháng:</span>
                    <select
                      value={requestMonthFilter}
                      onChange={(e) => setRequestMonthFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả tháng</option>
                      <option value="01">Tháng 01</option>
                      <option value="02">Tháng 02</option>
                      <option value="03">Tháng 03</option>
                      <option value="04">Tháng 04</option>
                      <option value="05">Tháng 05</option>
                      <option value="06">Tháng 06</option>
                      <option value="07">Tháng 07</option>
                      <option value="08">Tháng 08</option>
                      <option value="09">Tháng 09</option>
                      <option value="10">Tháng 10</option>
                      <option value="11">Tháng 11</option>
                      <option value="12">Tháng 12</option>
                    </select>
                  </div>

                  {/* Ô Năm */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium">Năm:</span>
                    <select
                      value={requestYearFilter}
                      onChange={(e) => setRequestYearFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả năm</option>
                      <option value="2026">Năm 2026</option>
                      <option value="2025">Năm 2025</option>
                    </select>
                  </div>

                  {/* Ô Trạng thái: Mặc định Chờ duyệt, chỉ BGĐ / Kế toán được thay đổi */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      {canChangeSummaryStatus ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span>Trạng thái:</span>
                    </span>
                    <select
                      value={
                        visibleStatusOptions.includes(summaryApprovalStatus)
                          ? summaryApprovalStatus
                          : 'Chờ duyệt'
                      }
                      disabled={!canChangeSummaryStatus}
                      onChange={(e) => {
                        if (canChangeSummaryStatus) {
                          setSummaryApprovalStatus(e.target.value as SummaryApprovalStatus);
                        }
                      }}
                      title={
                        canChangeSummaryStatus
                          ? `Được phép thay đổi bởi vai trò ${currentUserRole}`
                          : 'Chỉ những người có vai trò là BGĐ, Kế toán được quyền thay đổi'
                      }
                      className={`text-xs font-bold focus:outline-none ${
                        canChangeSummaryStatus
                          ? 'text-teal-700 bg-transparent cursor-pointer'
                          : 'text-slate-500 bg-transparent cursor-not-allowed opacity-80'
                      }`}
                    >
                      {visibleStatusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {loggedInDepartment && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 font-semibold text-blue-700">
                      Phòng ban: <strong>{loggedInDepartment}</strong>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
                    Tổng mặt hàng: <strong className="text-teal-700">{aggregatedRows.length}</strong>
                  </span>
                </div>
              </div>

              {/* Form Ghi chú bên dưới khi chọn Duyệt có ghi chú (Phòng HCTC Duyệt có ghi chú / BGĐ Duyệt có ghi chú) */}
              {isNoteRequired && (
                <div className="px-6 py-3.5 bg-amber-50/80 border-b border-amber-200 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <MessageSquarePlus className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Form Ghi chú phê duyệt ({summaryApprovalStatus}):</span>
                    </label>
                    <span className="text-[11px] text-amber-700">
                      Nhập nội dung ghi chú điều chỉnh số lượng, đơn giá hoặc yêu cầu bổ sung
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={summaryApprovalNote}
                      disabled={!canChangeSummaryStatus}
                      onChange={(e) => setSummaryApprovalNote(e.target.value)}
                      placeholder="Nhập ghi chú duyệt cho bảng tổng hợp vật tư..."
                      className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-100"
                    />
                    {canChangeSummaryStatus && (
                      <button
                        type="button"
                        onClick={() => {
                          onShowToast(
                            `Đã lưu trạng thái "${summaryApprovalStatus}" kèm ghi chú phê duyệt!`
                          );
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Lưu ghi chú duyệt
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Aggregated Table: STT, Tên vật tư dụng cụ, ĐVT, Số lượng, [Đơn giá, Thành tiền trước thuế, Thuế suất, Tiền thuế, Thành tiền sau thuế], Ghi chú */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">STT</th>
                        <th className="py-2.5 px-3 min-w-[210px]">Tên vật tư dụng cụ</th>
                        <th className="py-2.5 px-3 text-center w-20">ĐVT</th>
                        <th className="py-2.5 px-3 text-right w-24">Số lượng</th>
                        {canViewFinancialColumns && (
                          <>
                            <th className="py-2.5 px-3 text-right min-w-[130px]">Đơn giá</th>
                            <th className="py-2.5 px-3 text-right min-w-[140px]">
                              Thành tiền trước thuế
                            </th>
                            <th className="py-2.5 px-3 text-center w-28">Thuế suất</th>
                            <th className="py-2.5 px-3 text-right min-w-[120px]">Tiền thuế</th>
                            <th className="py-2.5 px-3 text-right min-w-[145px]">
                              Thành tiền sau thuế
                            </th>
                          </>
                        )}
                        <th className="py-2.5 px-3 min-w-[170px]">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aggregatedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={canViewFinancialColumns ? 10 : 5}
                            className="py-8 text-center text-slate-400"
                          >
                            Không có vật tư dụng cụ đề xuất nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        aggregatedRows.map((item, idx) => (
                          <tr key={item.key + idx} className="hover:bg-slate-50/80">
                            {/* 1. STT */}
                            <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>

                            {/* 2. Tên vật tư dụng cụ */}
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{item.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-blue-700 font-semibold">
                                  {item.code}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.category}
                                </span>
                              </div>
                            </td>

                            {/* 3. ĐVT */}
                            <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                              {item.unit}
                            </td>

                            {/* 4. Số lượng */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                              {item.totalQuantity}
                            </td>

                            {/* 5 - 9. Các cột tài chính (Chỉ hiển thị khi vai trò là Admin/BGĐ, BGĐ, Kế toán) */}
                            {canViewFinancialColumns && (
                              <>
                                {/* 5. Đơn giá (Nhập tay) */}
                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={item.unitPrice}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value) || 0);
                                      setSummaryPricingOverrides((prev) => ({
                                        ...prev,
                                        [item.key]: {
                                          ...prev[item.key],
                                          unitPrice: val,
                                        },
                                      }));
                                    }}
                                    className="w-28 px-2 py-1 text-right bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                  />
                                </td>

                                {/* 6. Thành tiền trước thuế (Tự động tính) */}
                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                                  {formatCurrency(item.amountBeforeTax)}
                                </td>

                                {/* 7. Thuế suất (Nhập tay %) */}
                                <td className="py-2 px-3 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={item.taxRate}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value) || 0);
                                        setSummaryPricingOverrides((prev) => ({
                                          ...prev,
                                          [item.key]: {
                                            ...prev[item.key],
                                            taxRate: val,
                                          },
                                        }));
                                      }}
                                      className="w-16 px-2 py-1 text-right bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                    <span className="text-slate-500 font-semibold">%</span>
                                  </div>
                                </td>

                                {/* 8. Tiền thuế (Tự động tính) */}
                                <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-700 tabular-nums">
                                  {formatCurrency(item.taxAmount)}
                                </td>

                                {/* 9. Thành tiền sau thuế (Tự động tính) */}
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                                  {formatCurrency(item.amountAfterTax)}
                                </td>
                              </>
                            )}

                            {/* 10. Ghi chú */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.note}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSummaryPricingOverrides((prev) => ({
                                    ...prev,
                                    [item.key]: {
                                      ...prev[item.key],
                                      note: val,
                                    },
                                  }));
                                }}
                                placeholder="Nhập ghi chú..."
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-400"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {aggregatedRows.length > 0 && (
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                        <tr>
                          <td colSpan={3} className="py-2.5 px-3 text-right text-slate-700">
                            Tổng cộng:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-teal-700">
                            {totalAggregatedQty}
                          </td>
                          {canViewFinancialColumns && (
                            <>
                              <td className="py-2.5 px-3"></td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                                {formatCurrency(totalBeforeTax)}
                              </td>
                              <td className="py-2.5 px-3"></td>
                              <td className="py-2.5 px-3 text-right font-mono text-amber-700 tabular-nums">
                                {formatCurrency(totalTaxAmount)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-blue-700 tabular-nums">
                                {formatCurrency(totalAfterTax)}
                              </td>
                            </>
                          )}
                          <td className="py-2.5 px-3"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span>Trạng thái bảng tổng hợp:</span>
                  {renderStatusBadge(summaryApprovalStatus)}
                  {!canViewFinancialColumns && (
                    <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Các cột Đơn giá & Thuế chỉ hiển thị cho vai trò Admin/BGĐ, Kế toán
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onShowToast('Đã xuất file Tổng hợp vật tư đề xuất!');
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất bảng tổng hợp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMaterialSummaryOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
