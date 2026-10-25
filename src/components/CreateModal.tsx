import React, { useState, useMemo } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Boxes,
  ClipboardList,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  FolderPlus,
  Search,
} from 'lucide-react';
import { WarehouseModuleId, StockSlip, StockSlipItem, MaterialRequest } from '../types/warehouse';
import {
  CatalogCategoryType,
  findCatalogItemByName,
  getAllUnifiedCatalogItems,
  generateCatalogCode,
  addNewItemToCatalog,
  getCatalogLabel,
} from '../data/warehouseData';
import { insertPhieuKhoToSupabase, isSupabaseConfigured } from '../lib/supabase';

interface CreateModalProps {
  isOpen: boolean;
  moduleId: WarehouseModuleId;
  moduleTitle: string;
  onClose: () => void;
  onSubmitSuccess: (msg: string) => void;
  onCreatedSlip?: (slip: StockSlip) => void;
  onCreatedMaterialRequest?: (req: MaterialRequest) => void;
}

interface ItemRow {
  id: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  note: string;
  matchedCatalog?: string;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  moduleId,
  moduleTitle,
  onClose,
  onSubmitSuccess,
  onCreatedSlip,
  onCreatedMaterialRequest,
}) => {
  // Helper to generate code format: PN-yyyymmdd_03, PX-yyyymmdd_03, PC-yyyymmdd_02
  const getFormattedSlipCode = (type: 'Nhập kho' | 'Xuất kho' | 'Chuyển kho') => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyymmdd = `${yyyy}${mm}${dd}`;
    if (type === 'Nhập kho') {
      return `PN-${yyyymmdd}_03`;
    } else if (type === 'Xuất kho') {
      return `PX-${yyyymmdd}_03`;
    } else {
      return `PC-${yyyymmdd}_02`;
    }
  };

  // 1. Phần thông tin chung của Phiếu kho
  const [slipType, setSlipType] = useState<'Nhập kho' | 'Xuất kho' | 'Chuyển kho'>('Nhập kho');
  const [slipCode, setSlipCode] = useState(
    moduleId === 'phieu-kho'
      ? getFormattedSlipCode('Nhập kho')
      : moduleId === 'de-xuat-vat-tu'
      ? `DX-VT-2026-${Math.floor(100 + Math.random() * 900)}`
      : moduleId === 'kiem-ke-kho'
      ? `KK-2026-Q4-${Math.floor(10 + Math.random() * 90)}`
      : `LS-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [creator, setCreator] = useState<'Nguyễn Hữu Hòa' | 'Lê Văn Hải'>('Nguyễn Hữu Hòa');
  const [approver] = useState('Đinh Bạt Quân');
  const [deliverer, setDeliverer] = useState<'Ngô Thiện Nhân' | 'Trần Quang Hiếu'>('Ngô Thiện Nhân');
  const [receiver, setReceiver] = useState<'Lê Ngọc Nhàn' | 'Bùi Văn Thuận' | 'Thái Ngọc Thức'>(
    'Lê Ngọc Nhàn'
  );
  const [receivingLocation, setReceivingLocation] = useState<string>('Kho cơ 1A');
  const [exportLocation, setExportLocation] = useState<
    'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
  >('Kho cơ 1A');
  const [transferFromWarehouse, setTransferFromWarehouse] = useState<
    'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
  >('Kho cơ 1A');
  const [transferToWarehouse, setTransferToWarehouse] = useState<
    'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
  >('Kho điện 1A');

  // State cho các phân hệ khác (Đề xuất vật tư / Kiểm kê kho)
  const [sourceWarehouse, setSourceWarehouse] = useState('Kho cơ 1A');
  const [department, setDepartment] = useState<'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC'>('Ban KTSC');
  const [requestCategory, setRequestCategory] = useState<'Cơ khí' | 'Điện'>('Cơ khí');
  const [requesterName, setRequesterName] = useState('Nguyễn Hữu Hòa');
  const [approvalLevel, setApprovalLevel] = useState<'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC'>('Ban KTSC');
  const [requestDateStr, setRequestDateStr] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${now.getFullYear()}`;
  });
  const [purpose, setPurpose] = useState('Bảo dưỡng định kỳ và thay thế vật tư kỹ thuật Nhà máy 1A');
  const [usageLocation, setUsageLocation] = useState('Nhà máy 1A');
  const [urgency, setUrgency] = useState<'Bình thường' | 'Gấp' | 'Khẩn cấp'>('Bình thường');
  const [requiredDate, setRequiredDate] = useState('20/10/2026');
  const [reason, setReason] = useState('');
  const [leadAuditor, setLeadAuditor] = useState('Nguyễn Hữu Hòa');
  const [auditPeriod, setAuditPeriod] = useState('22/10/2026 - 24/10/2026');

  // 2. Phần chi tiết vật tư: STT, Tên vật tư, Mã vật tư, ĐVT, Số lượng, Ghi chú
  const [items, setItems] = useState<ItemRow[]>([
    {
      id: '1',
      name: 'Bộ điều khiển PLC Siemens S7-1200',
      code: 'VT-PLC-S71200',
      unit: 'Bộ',
      quantity: 2,
      note: 'Dự phòng tủ điều khiển',
      matchedCatalog: 'Danh mục vật tư',
    },
    {
      id: '2',
      name: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
      code: 'TH-MO-KLUBER',
      unit: 'Tuýp 1kg',
      quantity: 5,
      note: 'Bảo dưỡng gối trục tuabin',
      matchedCatalog: 'Danh mục vật tư tiêu hao',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [activeSuggestionRowId, setActiveSuggestionRowId] = useState<string | null>(null);

  // State cho Modal bắt buộc thêm vật tư mới vào đúng Danh mục để sinh mã vật tư
  const [quickAddTargetRowId, setQuickAddTargetRowId] = useState<string | null>(null);
  const [newCatalogType, setNewCatalogType] = useState<CatalogCategoryType>('danh-muc-vat-tu');
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogUnit, setNewCatalogUnit] = useState('Cái');
  const [newCatalogSpecs, setNewCatalogSpecs] = useState('');
  const [newCatalogBrand, setNewCatalogBrand] = useState('');
  const [catalogSuccessBanner, setCatalogSuccessBanner] = useState<string | null>(null);

  // Lấy toàn bộ danh sách vật tư từ 3 danh mục (Danh mục vật tư, Danh mục vật tư tiêu hao, Danh mục công cụ, dụng cụ)
  const allCatalogItems = useMemo(() => {
    return getAllUnifiedCatalogItems();
  }, [catalogVersion, isOpen]);

  // Mã vật tư tự động sinh khi mở hộp thoại thêm vào Danh mục
  const previewGeneratedCode = useMemo(() => {
    if (!newCatalogName.trim()) return '';
    return generateCatalogCode(newCatalogType, newCatalogName);
  }, [newCatalogType, newCatalogName, catalogVersion]);

  // Thêm dòng vật tư mới
  const handleAddItem = () => {
    const newItem: ItemRow = {
      id: String(Date.now()),
      name: '',
      code: '',
      unit: 'Cái',
      quantity: 1,
      note: '',
      matchedCatalog: undefined,
    };
    setItems((prev) => [...prev, newItem]);
    setValidationError(null);
  };

  // Xóa dòng vật tư
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    setValidationError(null);
  };

  // Khi người dùng nhập Tên vật tư -> Kiểm tra trong 3 danh mục để tự động điền Mã vật tư
  const handleMaterialNameChange = (rowId: string, inputName: string) => {
    setValidationError(null);
    const matched = findCatalogItemByName(inputName);

    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (matched) {
          return {
            ...row,
            name: inputName,
            code: matched.code,
            unit: matched.unit || row.unit,
            matchedCatalog: matched.catalogLabel,
          };
        } else {
          return {
            ...row,
            name: inputName,
            code: '',
            matchedCatalog: undefined,
          };
        }
      })
    );
  };

  // Khi người dùng chọn một vật tư từ danh sách gợi ý của 3 danh mục
  const handleSelectCatalogSuggestion = (
    rowId: string,
    entry: { name: string; code: string; unit: string; catalogLabel: string }
  ) => {
    setValidationError(null);
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              name: entry.name,
              code: entry.code,
              unit: entry.unit,
              matchedCatalog: entry.catalogLabel,
            }
          : row
      )
    );
    setActiveSuggestionRowId(null);
  };

  // Cập nhật các trường khác của dòng vật tư (ĐVT, Số lượng, Ghi chú)
  const handleUpdateItemField = (
    id: string,
    field: 'unit' | 'quantity' | 'note',
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Mở hộp thoại thêm tên vật tư vào đúng Danh mục để sinh mã vật tư
  const handleOpenAddCatalogModal = (row: ItemRow) => {
    setQuickAddTargetRowId(row.id);
    setNewCatalogName(row.name.trim());
    setNewCatalogUnit(row.unit.trim() || 'Cái');
    setNewCatalogType('danh-muc-vat-tu');
    setNewCatalogSpecs('');
    setNewCatalogBrand('');
    setActiveSuggestionRowId(null);
  };

  // Lưu vật tư mới vào đúng Danh mục -> Sinh mã vật tư -> Điền vào dòng phiếu kho và quay lại phiếu kho
  const handleConfirmAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTargetRowId || !newCatalogName.trim()) return;

    // Kiểm tra xem tên này đã tồn tại trong 3 danh mục chưa
    const existing = findCatalogItemByName(newCatalogName);
    const createdEntry =
      existing ||
      addNewItemToCatalog({
        catalogType: newCatalogType,
        name: newCatalogName,
        unit: newCatalogUnit,
        specifications: newCatalogSpecs,
        brand: newCatalogBrand,
      });

    setCatalogVersion((v) => v + 1);

    // Tự động điền mã vật tư vừa sinh và ĐVT vào đúng dòng trong Phiếu kho
    setItems((prev) =>
      prev.map((row) =>
        row.id === quickAddTargetRowId
          ? {
              ...row,
              name: createdEntry.name,
              code: createdEntry.code,
              unit: createdEntry.unit,
              matchedCatalog: createdEntry.catalogLabel,
            }
          : row
      )
    );

    setCatalogSuccessBanner(
      `Đã thêm "${createdEntry.name}" vào [${getCatalogLabel(
        createdEntry.catalogType
      )}] và sinh mã vật tư: ${createdEntry.code}`
    );
    setValidationError(null);
    setQuickAddTargetRowId(null);
  };

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Kiểm tra bắt buộc đối với tất cả các dòng vật tư
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.name.trim()) {
        setValidationError(`Dòng STT ${i + 1}: Vui lòng nhập Tên vật tư.`);
        return;
      }
      const matched = findCatalogItemByName(row.name);
      if (!matched || !row.code.trim()) {
        setValidationError(
          `Dòng STT ${i + 1}: Vật tư "${row.name}" chưa có trong Danh mục vật tư, Danh mục vật tư tiêu hao hoặc Danh mục công cụ, dụng cụ. Vui lòng thêm vào đúng Danh mục để sinh mã vật tư trước khi lưu phiếu kho.`
        );
        handleOpenAddCatalogModal(row);
        return;
      }
    }

    setIsSubmitting(true);
    let actionTitle = 'Phiếu';

    if (moduleId === 'phieu-kho') {
      actionTitle = `Phiếu kho [${slipCode}]`;
      const now = new Date();
      const createdAtStr = `${String(now.getDate()).padStart(2, '0')}/${String(
        now.getMonth() + 1
      ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(
        2,
        '0'
      )}:${String(now.getMinutes()).padStart(2, '0')}`;

      const slipItems: StockSlipItem[] = items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        code: item.code.trim(),
        unit: item.unit.trim(),
        quantity: Number(item.quantity) || 1,
        note: item.note?.trim() || '',
      }));

      const itemsSummary = items.map((i) => i.name).join(', ');
      const computedSource =
        slipType === 'Nhập kho'
          ? deliverer
          : slipType === 'Xuất kho'
          ? exportLocation
          : transferFromWarehouse;
      const computedTarget =
        slipType === 'Chuyển kho' ? transferToWarehouse : receivingLocation;

      const autoNote =
        reason.trim() ||
        (slipType === 'Nhập kho'
          ? `Nhập kho - Người giao: ${deliverer} - Nơi nhận: ${receivingLocation} (${itemsSummary})`
          : slipType === 'Xuất kho'
          ? `Xuất kho - Người giao: ${deliverer} - Người nhận: ${receiver} - Nơi xuất: ${exportLocation} - Nơi nhận: ${receivingLocation} (${itemsSummary})`
          : `Chuyển kho - Người giao: ${deliverer} - Người nhận: ${receiver} - Kho chuyển: ${transferFromWarehouse} - Kho nhận: ${transferToWarehouse} (${itemsSummary})`);

      const newSlip: StockSlip = {
        id: `sl-${Date.now()}`,
        code: slipCode,
        type: slipType,
        deliverer,
        receiver: slipType === 'Nhập kho' ? undefined : receiver,
        warehouseSource: computedSource,
        warehouseTarget: computedTarget,
        createdAt: createdAtStr,
        creator: creator.replace(/\s*\([^)]*\)/g, '').trim() || 'Nguyễn Hữu Hòa',
        approver,
        totalItems: slipItems.length || 1,
        status: 'Chờ duyệt',
        note: autoNote,
        items: slipItems,
      };

      if (isSupabaseConfigured()) {
        const res = await insertPhieuKhoToSupabase(newSlip);
        if (res.success) {
          onSubmitSuccess(`Đã lưu thành công ${actionTitle} vào bảng Phieu_kho trên Supabase!`);
        } else {
          onSubmitSuccess(`Đã lưu ${actionTitle} vào giao diện (Lưu ý Supabase: ${res.error})`);
        }
      } else {
        onSubmitSuccess(`Đã lập thành công ${actionTitle}!`);
      }

      onCreatedSlip?.(newSlip);
    } else if (moduleId === 'de-xuat-vat-tu') {
      actionTitle = `Phiếu đề xuất [${slipCode}]`;
      const reqItems: StockSlipItem[] = items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        code: item.code.trim(),
        unit: item.unit.trim(),
        quantity: Number(item.quantity) || 1,
        note: item.note?.trim() || '',
        category: requestCategory,
        unitPrice: 250000,
        taxRate: 8,
      }));

      const newReq: MaterialRequest = {
        id: `mr-${Date.now()}`,
        code: slipCode,
        requestDate: requestDateStr.trim() || '17/10/2026',
        department,
        category: requestCategory,
        requester: requesterName.trim() || 'Nguyễn Hữu Hòa',
        purpose: purpose.trim() || 'Đề xuất vật tư phục vụ sản xuất',
        approvalLevel,
        urgency,
        status: 'Chờ duyệt',
        location: usageLocation,
        approver: 'Đinh Bạt Quân',
        requiredDate,
        itemCount: reqItems.length,
        items: reqItems,
      };

      onCreatedMaterialRequest?.(newReq);
      onSubmitSuccess(`Đã lập thành công ${actionTitle}!`);
    } else {
      if (moduleId === 'kiem-ke-kho') actionTitle = `Đợt kiểm kê [${slipCode}]`;
      else actionTitle = `Bản ghi [${moduleTitle}]`;
      onSubmitSuccess(`Đã lưu thành công ${actionTitle} vào hệ thống Thủy điện Sơn Trà 1!`);
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              {moduleId === 'phieu-kho' && <Boxes className="w-5 h-5" />}
              {moduleId === 'de-xuat-vat-tu' && <ClipboardList className="w-5 h-5" />}
              {moduleId === 'kiem-ke-kho' && <ClipboardCheck className="w-5 h-5" />}
              {moduleId !== 'phieu-kho' &&
                moduleId !== 'de-xuat-vat-tu' &&
                moduleId !== 'kiem-ke-kho' && <Boxes className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {moduleId === 'phieu-kho' && 'Lập phiếu kho'}
                {moduleId === 'de-xuat-vat-tu' && 'Lập Phiếu Đề Xuất Vật Tư Kỹ Thuật'}
                {moduleId === 'kiem-ke-kho' && 'Khởi Tạo Đợt Kiểm Kê & Đối Chiếu Kho'}
                {moduleId !== 'phieu-kho' &&
                  moduleId !== 'de-xuat-vat-tu' &&
                  moduleId !== 'kiem-ke-kho' &&
                  `Tạo mới / Thiết lập cho ${moduleTitle}`}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Thông báo khi vừa thêm vật tư mới vào danh mục và sinh mã */}
          {catalogSuccessBanner && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-800 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{catalogSuccessBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setCatalogSuccessBanner(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Thông báo lỗi nếu có vật tư chưa có trong Danh mục */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{validationError}</div>
            </div>
          )}

          {/* Section 1: Phần thông tin chung */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Phần thông tin chung
            </div>

            {moduleId === 'phieu-kho' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Mã phiếu */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã phiếu
                    </label>
                    <input
                      type="text"
                      value={slipCode}
                      onChange={(e) => setSlipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  {/* Người lập phiếu (Nguyễn Hữu Hòa, Lê Văn Hải) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người lập phiếu
                    </label>
                    <select
                      value={creator}
                      onChange={(e) =>
                        setCreator(e.target.value as 'Nguyễn Hữu Hòa' | 'Lê Văn Hải')
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Nguyễn Hữu Hòa">Nguyễn Hữu Hòa</option>
                      <option value="Lê Văn Hải">Lê Văn Hải</option>
                    </select>
                  </div>

                  {/* Người duyệt (Đinh Bạt Quân) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người duyệt
                    </label>
                    <input
                      type="text"
                      value={approver}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 cursor-default"
                    />
                  </div>

                  {/* Loại phiếu (Nhập kho, Xuất kho, Chuyển kho) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Loại phiếu
                    </label>
                    <select
                      value={slipType}
                      onChange={(e) => {
                        const val = e.target.value as 'Nhập kho' | 'Xuất kho' | 'Chuyển kho';
                        setSlipType(val);
                        setSlipCode(getFormattedSlipCode(val));
                        if (val === 'Nhập kho') {
                          setReceivingLocation('Kho cơ 1A');
                        } else if (val === 'Xuất kho') {
                          setReceivingLocation('Nhà máy 1A');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Nhập kho">Nhập kho</option>
                      <option value="Xuất kho">Xuất kho</option>
                      <option value="Chuyển kho">Chuyển kho</option>
                    </select>
                  </div>
                </div>

                {/* Hàng 2: Thay đổi theo Loại phiếu */}
                {slipType === 'Nhập kho' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Người giao (Ngô Thiện Nhân, Trần Quang Hiếu) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Người giao
                      </label>
                      <select
                        value={deliverer}
                        onChange={(e) =>
                          setDeliverer(e.target.value as 'Ngô Thiện Nhân' | 'Trần Quang Hiếu')
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Ngô Thiện Nhân">Ngô Thiện Nhân</option>
                        <option value="Trần Quang Hiếu">Trần Quang Hiếu</option>
                      </select>
                    </div>

                    {/* Nơi nhận (Kho cơ 1A, Kho điện 1A, Kho cơ điện 1C) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nơi nhận
                      </label>
                      <select
                        value={receivingLocation}
                        onChange={(e) => setReceivingLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Kho cơ 1A">Kho cơ 1A</option>
                        <option value="Kho điện 1A">Kho điện 1A</option>
                        <option value="Kho cơ điện 1C">Kho cơ điện 1C</option>
                      </select>
                    </div>
                  </div>
                )}

                {slipType === 'Xuất kho' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {/* Người giao (Ngô Thiện Nhân, Trần Quang Hiếu) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Người giao
                      </label>
                      <select
                        value={deliverer}
                        onChange={(e) =>
                          setDeliverer(e.target.value as 'Ngô Thiện Nhân' | 'Trần Quang Hiếu')
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Ngô Thiện Nhân">Ngô Thiện Nhân</option>
                        <option value="Trần Quang Hiếu">Trần Quang Hiếu</option>
                      </select>
                    </div>

                    {/* Người nhận (Lê Ngọc Nhàn, Bùi Văn Thuận, Thái Ngọc Thức) - Giữa Người giao và Nơi xuất */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Người nhận
                      </label>
                      <select
                        value={receiver}
                        onChange={(e) =>
                          setReceiver(
                            e.target.value as
                              | 'Lê Ngọc Nhàn'
                              | 'Bùi Văn Thuận'
                              | 'Thái Ngọc Thức'
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Lê Ngọc Nhàn">Lê Ngọc Nhàn</option>
                        <option value="Bùi Văn Thuận">Bùi Văn Thuận</option>
                        <option value="Thái Ngọc Thức">Thái Ngọc Thức</option>
                      </select>
                    </div>

                    {/* Nơi xuất (Kho cơ 1A, Kho điện 1A, Kho cơ điện 1C) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nơi xuất
                      </label>
                      <select
                        value={exportLocation}
                        onChange={(e) =>
                          setExportLocation(
                            e.target.value as 'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Kho cơ 1A">Kho cơ 1A</option>
                        <option value="Kho điện 1A">Kho điện 1A</option>
                        <option value="Kho cơ điện 1C">Kho cơ điện 1C</option>
                      </select>
                    </div>

                    {/* Nơi nhận (Nhà máy 1A, Nhà máy 1B, Nhà máy 1C, Nhà QLVH) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nơi nhận
                      </label>
                      <select
                        value={receivingLocation}
                        onChange={(e) => setReceivingLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Nhà máy 1A">Nhà máy 1A</option>
                        <option value="Nhà máy 1B">Nhà máy 1B</option>
                        <option value="Nhà máy 1C">Nhà máy 1C</option>
                        <option value="Nhà QLVH">Nhà QLVH</option>
                      </select>
                    </div>
                  </div>
                )}

                {slipType === 'Chuyển kho' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {/* Người giao (Ngô Thiện Nhân, Trần Quang Hiếu) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Người giao
                      </label>
                      <select
                        value={deliverer}
                        onChange={(e) =>
                          setDeliverer(e.target.value as 'Ngô Thiện Nhân' | 'Trần Quang Hiếu')
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Ngô Thiện Nhân">Ngô Thiện Nhân</option>
                        <option value="Trần Quang Hiếu">Trần Quang Hiếu</option>
                      </select>
                    </div>

                    {/* Người nhận (Lê Ngọc Nhàn, Bùi Văn Thuận, Thái Ngọc Thức) - Giữa Người giao và Kho chuyển */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Người nhận
                      </label>
                      <select
                        value={receiver}
                        onChange={(e) =>
                          setReceiver(
                            e.target.value as
                              | 'Lê Ngọc Nhàn'
                              | 'Bùi Văn Thuận'
                              | 'Thái Ngọc Thức'
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Lê Ngọc Nhàn">Lê Ngọc Nhàn</option>
                        <option value="Bùi Văn Thuận">Bùi Văn Thuận</option>
                        <option value="Thái Ngọc Thức">Thái Ngọc Thức</option>
                      </select>
                    </div>

                    {/* Kho chuyển (Kho cơ 1A, Kho điện 1A, Kho cơ điện 1C) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kho chuyển
                      </label>
                      <select
                        value={transferFromWarehouse}
                        onChange={(e) =>
                          setTransferFromWarehouse(
                            e.target.value as 'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Kho cơ 1A">Kho cơ 1A</option>
                        <option value="Kho điện 1A">Kho điện 1A</option>
                        <option value="Kho cơ điện 1C">Kho cơ điện 1C</option>
                      </select>
                    </div>

                    {/* Kho nhận (Kho cơ 1A, Kho điện 1A, Kho cơ điện 1C) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kho nhận
                      </label>
                      <select
                        value={transferToWarehouse}
                        onChange={(e) =>
                          setTransferToWarehouse(
                            e.target.value as 'Kho cơ 1A' | 'Kho điện 1A' | 'Kho cơ điện 1C'
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="Kho cơ 1A">Kho cơ 1A</option>
                        <option value="Kho điện 1A">Kho điện 1A</option>
                        <option value="Kho cơ điện 1C">Kho cơ điện 1C</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : moduleId === 'de-xuat-vat-tu' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã đề xuất
                    </label>
                    <input
                      type="text"
                      value={slipCode}
                      onChange={(e) => setSlipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời gian
                    </label>
                    <input
                      type="text"
                      value={requestDateStr}
                      onChange={(e) => setRequestDateStr(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phòng ban (Đơn vị đề xuất)
                    </label>
                    <select
                      value={department}
                      onChange={(e) => {
                        const val = e.target.value as 'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC';
                        setDepartment(val);
                        setApprovalLevel(val);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Ban KTSC">Ban KTSC</option>
                      <option value="Ban KTVH">Ban KTVH</option>
                      <option value="Ban HCTC">Ban HCTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người đề xuất
                    </label>
                    <select
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Nguyễn Hữu Hòa">Nguyễn Hữu Hòa</option>
                      <option value="Lê Văn Hải">Lê Văn Hải</option>
                      <option value="Lê Ngọc Nhàn">Lê Ngọc Nhàn</option>
                      <option value="Bùi Văn Thuận">Bùi Văn Thuận</option>
                      <option value="Thái Ngọc Thức">Thái Ngọc Thức</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hạng mục
                    </label>
                    <select
                      value={requestCategory}
                      onChange={(e) => setRequestCategory(e.target.value as 'Cơ khí' | 'Điện')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Cơ khí">Cơ khí</option>
                      <option value="Điện">Điện</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cấp duyệt
                    </label>
                    <select
                      value={approvalLevel}
                      onChange={(e) =>
                        setApprovalLevel(e.target.value as 'Ban KTSC' | 'Ban KTVH' | 'Ban HCTC')
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Ban KTSC">Ban KTSC</option>
                      <option value="Ban KTVH">Ban KTVH</option>
                      <option value="Ban HCTC">Ban HCTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mức độ
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="Bình thường">Bình thường</option>
                      <option value="Gấp">Gấp</option>
                      <option value="Khẩn cấp">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mục đích
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Nhập mục đích đề xuất vật tư..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã chứng từ / Phiếu
                    </label>
                    <input
                      type="text"
                      value={slipCode}
                      onChange={(e) => setSlipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người lập phiếu
                    </label>
                    <select
                      value={creator}
                      onChange={(e) =>
                        setCreator(e.target.value as 'Nguyễn Hữu Hòa' | 'Lê Văn Hải')
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <option value="Nguyễn Hữu Hòa">Nguyễn Hữu Hòa</option>
                      <option value="Lê Văn Hải">Lê Văn Hải</option>
                    </select>
                  </div>

                  {moduleId === 'kiem-ke-kho' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kỳ kiểm kê
                      </label>
                      <input
                        type="text"
                        value={auditPeriod}
                        onChange={(e) => setAuditPeriod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                      />
                    </div>
                  ) : null}
                </div>

                {moduleId === 'kiem-ke-kho' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chủ tịch / Trưởng ban kiểm kê
                      </label>
                      <input
                        type="text"
                        value={leadAuditor}
                        onChange={(e) => setLeadAuditor(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kho bãi kiểm kê
                      </label>
                      <select
                        value={sourceWarehouse}
                        onChange={(e) => setSourceWarehouse(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      >
                        <option value="Kho cơ 1A">Kho cơ 1A</option>
                        <option value="Kho Điện 1A">Kho Điện 1A</option>
                        <option value="Kho Cơ điện 1C">Kho Cơ điện 1C</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 2: Phần chi tiết vật tư */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Phần chi tiết vật tư ({items.length} mặt hàng)
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Nhập <strong>Tên vật tư</strong> để tự động tra cứu & điền <strong>Mã vật tư</strong> từ Danh mục vật tư, Danh mục vật tư tiêu hao hoặc Danh mục công cụ, dụng cụ.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dòng vật tư</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-visible shadow-2xs bg-white">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3 min-w-[230px]">Tên vật tư</th>
                      <th className="py-2.5 px-3 min-w-[175px]">Mã vật tư</th>
                      <th className="py-2.5 px-3 w-24 text-center">ĐVT</th>
                      <th className="py-2.5 px-3 w-24 text-right">Số lượng</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Ghi chú</th>
                      <th className="py-2.5 px-2 w-10 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => {
                      const hasName = item.name.trim().length > 0;
                      const isMatched = Boolean(item.code.trim());

                      // Gợi ý các vật tư trong 3 danh mục khi người dùng gõ Tên vật tư
                      const suggestions = hasName
                        ? allCatalogItems
                            .filter(
                              (c) =>
                                c.name.toLowerCase().includes(item.name.trim().toLowerCase()) ||
                                c.code.toLowerCase().includes(item.name.trim().toLowerCase())
                            )
                            .slice(0, 6)
                        : allCatalogItems.slice(0, 6);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 align-top">
                          {/* 1. STT */}
                          <td className="py-2.5 px-3 text-slate-500 font-mono font-bold text-xs text-center pt-3.5">
                            {index + 1}
                          </td>

                          {/* 2. Tên vật tư */}
                          <td className="py-2.5 px-3 relative">
                            <div className="relative">
                              <input
                                type="text"
                                value={item.name}
                                onFocus={() => setActiveSuggestionRowId(item.id)}
                                onBlur={() => {
                                  // Delay nhẹ để cho phép click vào danh sách gợi ý
                                  setTimeout(() => {
                                    setActiveSuggestionRowId((prev) =>
                                      prev === item.id ? null : prev
                                    );
                                  }, 180);
                                }}
                                onChange={(e) => handleMaterialNameChange(item.id, e.target.value)}
                                className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 ${
                                  hasName && !isMatched
                                    ? 'border-amber-400 focus:ring-amber-500/20'
                                    : 'border-slate-300 focus:ring-blue-500/20'
                                }`}
                                placeholder="Nhập hoặc chọn tên vật tư..."
                                required
                              />

                              {/* Dropdown gợi ý vật tư có sẵn trong 3 danh mục */}
                              {activeSuggestionRowId === item.id && suggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                                  <div className="px-2.5 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                    <span>Vật tư có sẵn trong 3 Danh mục</span>
                                    <Search className="w-3 h-3 text-slate-400" />
                                  </div>
                                  {suggestions.map((sug) => (
                                    <button
                                      type="button"
                                      key={sug.id}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectCatalogSuggestion(item.id, sug);
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50/80 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                                    >
                                      <div className="min-w-0">
                                        <div className="font-semibold text-slate-800 text-xs truncate">
                                          {sug.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                          {sug.catalogLabel} · ĐVT: {sug.unit}
                                        </div>
                                      </div>
                                      <span className="font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                        {sug.code}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Trạng thái khớp danh mục */}
                            {hasName && isMatched && item.matchedCatalog && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Đã có trong: {item.matchedCatalog}</span>
                              </div>
                            )}

                            {hasName && !isMatched && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Chưa có trong 3 danh mục chuẩn</span>
                              </div>
                            )}
                          </td>

                          {/* 3. Mã vật tư (Tự động điền nếu có trong danh mục, nếu chưa có bắt buộc thêm vào danh mục để sinh mã) */}
                          <td className="py-2.5 px-3">
                            {isMatched ? (
                              <input
                                type="text"
                                value={item.code}
                                readOnly
                                title="Mã vật tư được tự động điền từ Danh mục"
                                className="w-full px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-800 cursor-default"
                              />
                            ) : hasName ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAddCatalogModal(item)}
                                className="w-full px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                title="Bắt buộc thêm tên vật tư vào đúng Danh mục để sinh mã vật tư"
                              >
                                <FolderPlus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>+ Thêm vào Danh mục để sinh mã</span>
                              </button>
                            ) : (
                              <input
                                type="text"
                                value=""
                                readOnly
                                placeholder="Tự động điền theo tên..."
                                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-400 cursor-not-allowed"
                              />
                            )}
                          </td>

                          {/* 4. ĐVT */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) =>
                                handleUpdateItemField(item.id, 'unit', e.target.value)
                              }
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="ĐVT"
                              required
                            />
                          </td>

                          {/* 5. Số lượng */}
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItemField(
                                  item.id,
                                  'quantity',
                                  Math.max(1, Number(e.target.value))
                                )
                              }
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              required
                            />
                          </td>

                          {/* 6. Ghi chú */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.note || ''}
                              onChange={(e) =>
                                handleUpdateItemField(item.id, 'note', e.target.value)
                              }
                              placeholder="Ghi chú..."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </td>

                          {/* Xóa dòng */}
                          <td className="py-2.5 px-2 text-center pt-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={items.length <= 1}
                              className={`p-1 rounded text-slate-400 hover:text-rose-600 transition-colors ${
                                items.length <= 1
                                  ? 'opacity-30 cursor-not-allowed'
                                  : 'cursor-pointer'
                              }`}
                              title="Xóa dòng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-right text-slate-600">
                        Tổng số lượng ({items.length} mặt hàng):
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {totalQuantity}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Kiểm tra đồng bộ mã vật tư với Danh mục chuẩn Thủy điện Sơn Trà 1
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>
                  {moduleId === 'phieu-kho' && 'Lưu phiếu kho'}
                  {moduleId === 'de-xuat-vat-tu' && 'Gửi duyệt Phiếu đề xuất'}
                  {moduleId === 'kiem-ke-kho' && 'Lập đợt kiểm kê'}
                  {moduleId !== 'phieu-kho' &&
                    moduleId !== 'de-xuat-vat-tu' &&
                    moduleId !== 'kiem-ke-kho' &&
                    'Lưu dữ liệu'}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Sub-Modal: Bắt buộc thêm tên vật tư vào đúng Danh mục để sinh mã vật tư rồi quay lại phiếu kho */}
        {quickAddTargetRowId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Yêu cầu bắt buộc trước khi lập phiếu kho
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Thêm vật tư vào Danh mục & Sinh mã vật tư
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickAddTargetRowId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmAddCatalogItem} className="p-5 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                  Vật tư <strong className="text-slate-900">"{newCatalogName}"</strong> chưa có trong hệ thống. Vui lòng chọn đúng <strong>Danh mục</strong> bên dưới để hệ thống tự động sinh <strong>Mã vật tư</strong> rồi quay lại phiếu kho.
                </div>

                {/* Chọn đúng Danh mục */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    1. Chọn Danh mục cần thêm vào <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(
                      [
                        {
                          id: 'danh-muc-vat-tu',
                          title: 'Danh mục vật tư',
                          desc: 'Vật tư kỹ thuật, phụ tùng thay thế cơ điện (Tiền tố mã: VT-...)',
                        },
                        {
                          id: 'vat-tu-tieu-hao',
                          title: 'Danh mục vật tư tiêu hao',
                          desc: 'Dầu mỡ, hóa chất, băng keo, bảo hộ, phụ liệu (Tiền tố mã: TH-...)',
                        },
                        {
                          id: 'cong-cu-dung-cu',
                          title: 'Danh mục công cụ, dụng cụ',
                          desc: 'Thiết bị đo, máy cầm tay, dụng cụ sửa chữa (Tiền tố mã: DC-...)',
                        },
                      ] as const
                    ).map((cat) => (
                      <label
                        key={cat.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          newCatalogType === cat.id
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/15'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="catalogType"
                          value={cat.id}
                          checked={newCatalogType === cat.id}
                          onChange={() => setNewCatalogType(cat.id)}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{cat.title}</div>
                          <div className="text-[11px] text-slate-500">{cat.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tên vật tư & ĐVT */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên vật tư <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatalogName}
                      onChange={(e) => setNewCatalogName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ĐVT <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatalogUnit}
                      onChange={(e) => setNewCatalogUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Mã vật tư được sinh tự động */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-600 block">
                        Mã vật tư tự động sinh theo {getCatalogLabel(newCatalogType)}:
                      </span>
                      <span className="font-mono font-bold text-sm text-blue-700">
                        {previewGeneratedCode || '—'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Tự động điền
                  </span>
                </div>

                {/* Thông số kỹ thuật bổ sung (tùy chọn) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thông số kỹ thuật / Ghi chú danh mục (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newCatalogSpecs}
                    onChange={(e) => setNewCatalogSpecs(e.target.value)}
                    placeholder="Nhập quy cách, thông số hoặc hãng sản xuất..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAddTargetRowId(null)}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Lưu vào Danh mục & Sinh mã quay lại Phiếu kho</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
