import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Eye,
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
} from 'lucide-react';
import { WarehouseModuleId, WarehouseModule } from '../types/warehouse';
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

interface ModuleDetailViewProps {
  module: WarehouseModule;
  onBackToHub: () => void;
  onShowToast: (msg: string) => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  module,
  onBackToHub,
  onShowToast,
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

  // Status badge styling helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã mua':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Đã mua
          </span>
        );
      case 'Chưa mua':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            Chưa mua
          </span>
        );
      case 'Không mua':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <X className="w-3 h-3 text-slate-400" />
            Không mua
          </span>
        );
      case 'Đã duyệt':
      case 'Đã phê duyệt':
      case 'Hoàn tất':
      case 'Đang hoạt động':
      case 'Sẵn sàng':
      case 'Đủ hàng':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {status}
          </span>
        );
      case 'Chờ duyệt':
      case 'Đang kiểm kê':
      case 'Chờ đối chiếu':
      case 'Sắp hết':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            {status}
          </span>
        );
      case 'Đang xử lý':
      case 'Đang sử dụng':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {status}
          </span>
        );
      case 'Đã hủy':
      case 'Từ chối':
      case 'Bảo trì':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="text-xs text-slate-600 font-medium">
            {status}
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
        const filtered = MOCK_STOCK_SLIPS.filter((s) => {
          const matchQ =
            s.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            s.creator.toLowerCase().includes(filterQuery.toLowerCase()) ||
            (s.note && s.note.toLowerCase().includes(filterQuery.toLowerCase()));
          const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
          const matchType = movementFilter === 'ALL' || s.type === movementFilter;
          return matchQ && matchStatus && matchType;
        });

        return (
          <div>
            {/* Filter tags for Phiếu kho */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium mr-1">Loại phiếu:</span>
                {['ALL', 'Nhập kho', 'Xuất kho', 'Chuyển kho'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setMovementFilter(t)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      movementFilter === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {t === 'ALL' ? 'Tất cả' : t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium mr-1">Trạng thái:</span>
                {['ALL', 'Đã duyệt', 'Chờ duyệt', 'Đang xử lý'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'Mọi trạng thái' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Mã phiếu</th>
                    <th className="py-3 px-4">Loại nghiệp vụ</th>
                    <th className="py-3 px-4">Kho liên quan</th>
                    <th className="py-3 px-4">Thời gian tạo</th>
                    <th className="py-3 px-4">Người lập & Duyệt</th>
                    <th className="py-3 px-4 text-right">Số lượng mặt hàng</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 font-semibold text-slate-700">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.warehouseSource && <div>Từ: {row.warehouseSource}</div>}
                        {row.warehouseTarget && <div>Đến: {row.warehouseTarget}</div>}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.createdAt}</td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{row.creator}</div>
                        <div className="text-[11px] text-slate-400">Duyệt: {row.approver}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-800">
                        {row.totalItems} mục
                      </td>
                      <td className="py-3 px-4 text-center">{renderStatusBadge(row.status)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedSlipDetail({ ...row, kind: 'slip' })}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex items-center gap-1 border border-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem phiếu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'de-xuat-vat-tu': {
        const filtered = MOCK_MATERIAL_REQUESTS.filter((r) => {
          const matchQ =
            r.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
            r.department.toLowerCase().includes(filterQuery.toLowerCase()) ||
            r.requester.toLowerCase().includes(filterQuery.toLowerCase());
          return matchQ;
        });

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã đề xuất</th>
                  <th className="py-3 px-4">Phòng ban / Xưởng</th>
                  <th className="py-3 px-4">Vị trí lắp đặt</th>
                  <th className="py-3 px-4">Người đề xuất</th>
                  <th className="py-3 px-4">Cấp duyệt</th>
                  <th className="py-3 px-4">Ngày cần hàng</th>
                  <th className="py-3 px-4 text-center">Độ khẩn</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.department}</td>
                    <td className="py-3 px-4 text-slate-600">{row.location}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{row.requester}</td>
                    <td className="py-3 px-4 text-slate-600">{row.approver}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.requiredDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          row.urgency === 'Khẩn cấp'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : row.urgency === 'Gấp'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{renderStatusBadge(row.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSlipDetail({ ...row, kind: 'request' })}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer border border-blue-200"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
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
          <div>
            {/* Thanh lọc thời gian và loại biến động */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 font-medium mr-1">Thời gian:</span>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'TODAY', label: 'Hôm nay (17/10)' },
                  { id: 'MONTH', label: 'Tháng 10/2026' },
                  { id: 'YEAR', label: 'Năm 2026' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id as any)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      timeFilter === tf.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 font-medium mr-1">Biến động:</span>
                {['ALL', 'Nhập', 'Xuất', 'Điều chuyển'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMovementFilter(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      movementFilter === m
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'ALL' ? 'Mọi loại' : m}
                  </button>
                ))}
              </div>
            </div>

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
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.itemCode}</td>
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
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Đang áp dụng
                      </span>
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
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Đang cấp phát
                      </span>
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
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{row.code}</td>
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
                    <td className="py-3 px-4 font-mono font-bold text-violet-700">{row.code}</td>
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
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Tìm kiếm vật tư theo mã, tên, quy cách..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onShowToast(`Đã xuất báo cáo [${module.title}] định dạng Excel thành công!`);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`Đang in biểu mẫu quy chuẩn [${module.title}]...`);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>In biểu mẫu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5 flex-1">
              <button
                onClick={onBackToHub}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer shrink-0"
                title="Quay lại danh sách phân hệ Kho"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Lọc dữ liệu theo từ khóa..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Chuyển Lập phiếu kho mới xuống bên cạnh ô tìm kiếm */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{getCreateButtonLabel()}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onShowToast(`Đã xuất báo cáo [${module.title}] định dạng Excel thành công!`);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`Đang in biểu mẫu quy chuẩn [${module.title}]...`);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>In biểu mẫu</span>
              </button>
            </div>
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
      {selectedSlipDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6">
            {/* Document Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase">
                    CÔNG TY CỔ PHẦN THỦY ĐIỆN SƠN TRÀ 1
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Phân hệ Quản lý Kho vận & Vật tư kỹ thuật
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
                  {selectedSlipDetail.kind === 'slip' && `PHIẾU ${selectedSlipDetail.type.toUpperCase()}`}
                  {selectedSlipDetail.kind === 'request' && 'PHIẾU ĐỀ XUẤT VẬT TƯ KỸ THUẬT'}
                  {selectedSlipDetail.kind === 'audit' && 'BIÊN BẢN KIỂM KÊ VÀ ĐỐI CHIẾU SỐ LIỆU KHO'}
                  {selectedSlipDetail.kind === 'tool' && 'SỔ THEO DÕI THIẾT BỊ / DỤNG CỤ'}
                </h2>
              </div>
            </div>

            {/* Document Info Body */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">Người lập / Đề xuất:</span>{' '}
                <strong className="text-slate-800">{selectedSlipDetail.creator || selectedSlipDetail.requester || selectedSlipDetail.leadAuditor}</strong>
              </div>
              <div>
                <span className="text-slate-500">Cấp phê duyệt:</span>{' '}
                <strong className="text-blue-700">{selectedSlipDetail.approver || 'Nguyễn Hữu Hòa (Admin)'}</strong>
              </div>
              {selectedSlipDetail.warehouseSource && (
                <div>
                  <span className="text-slate-500">Kho nguồn:</span>{' '}
                  <strong className="text-slate-800">{selectedSlipDetail.warehouseSource}</strong>
                </div>
              )}
              {selectedSlipDetail.warehouseTarget && (
                <div>
                  <span className="text-slate-500">Kho đích / Nơi nhận:</span>{' '}
                  <strong className="text-slate-800">{selectedSlipDetail.warehouseTarget}</strong>
                </div>
              )}
              {selectedSlipDetail.department && (
                <div>
                  <span className="text-slate-500">Đơn vị yêu cầu:</span>{' '}
                  <strong className="text-slate-800">{selectedSlipDetail.department}</strong>
                </div>
              )}
              {selectedSlipDetail.note && (
                <div className="col-span-2">
                  <span className="text-slate-500">Lý do / Mục đích:</span>{' '}
                  <span className="text-slate-700 italic">{selectedSlipDetail.note}</span>
                </div>
              )}
            </div>

            {/* Items list preview */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs mb-5">
              <div className="bg-slate-100 p-2 font-semibold text-slate-700 text-[11px] uppercase">
                Danh mục vật tư thực hiện
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-mono text-slate-700 font-semibold">VT-PLC-S71200</span>
                  <span className="font-medium text-slate-800">Bộ điều khiển PLC Siemens S7-1200</span>
                  <span className="font-mono tabular-nums text-slate-900 font-bold">2 Bộ</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-mono text-slate-700 font-semibold">TH-MO-KLUBER</span>
                  <span className="font-medium text-slate-800">Mỡ tra ổ bi Kluber Isoflex NBU 15</span>
                  <span className="font-mono tabular-nums text-slate-900 font-bold">5 Tuýp</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-200">
              <div>
                <div className="font-bold text-slate-800">Người lập phiếu</div>
                <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                <div className="font-medium text-slate-700">Nguyễn Hữu Hòa</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Thủ kho phụ trách</div>
                <div className="text-[10px] text-slate-400 mb-6">(Ký & ghi rõ họ tên)</div>
                <div className="font-medium text-slate-700">Trần Văn Mạnh</div>
              </div>
              <div>
                <div className="font-bold text-slate-800">Lãnh đạo phê duyệt</div>
                <div className="text-[10px] text-slate-400 mb-6">(Ký & đóng dấu)</div>
                <div className="font-bold text-emerald-600 bg-emerald-50 py-0.5 rounded border border-emerald-200 text-[11px]">
                  [ĐÃ DUYỆT 5F]
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onShowToast(`Đang in bản sao phiếu ${selectedSlipDetail.code}...`);
                }}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>In phiếu lưu sổ</span>
              </button>

              <button
                onClick={() => setSelectedSlipDetail(null)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        moduleId={module.id}
        moduleTitle={module.title}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={(msg) => onShowToast(msg)}
      />
    </div>
  );
};
