import {
  ModuleGroup,
  WarehouseModule,
  StockSlip,
  MaterialRequest,
  StockHistoryItem,
  InventoryAudit,
  InventoryReportItem,
  InOutBalanceReportItem,
  MaterialItem,
  ToolEquipmentItem,
  WarehouseLocation,
  MaterialTrackingItem,
} from '../types/warehouse';

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: 'inout',
    code: 'A',
    title: 'Nhập xuất kho',
    description: 'Nghiệp vụ xuất nhập vật tư, luân chuyển kho bãi, đề xuất và đối chiếu kiểm kê',
    modules: [
      {
        id: 'phieu-kho',
        groupId: 'inout',
        groupName: 'Nhập xuất kho',
        title: 'Phiếu kho',
        description: 'Quản lý nghiệp vụ nhập kho, xuất kho và luân chuyển nội bộ',
        iconName: 'ArrowLeftRight',
        iconBg: 'bg-emerald-50 border border-emerald-100',
        iconColor: 'text-emerald-600',
        badge: 'Chính',
        itemCount: 42,
        isFavorite: true,
      },
      {
        id: 'de-xuat-vat-tu',
        groupId: 'inout',
        groupName: 'Nhập xuất kho',
        title: 'Phiếu đề xuất vật tư',
        description: 'Theo dõi đề xuất vật tư chi tiết theo nơi, người đề xuất, người phê duyệt',
        iconName: 'ClipboardList',
        iconBg: 'bg-purple-50 border border-purple-100',
        iconColor: 'text-purple-600',
        badge: '5 chờ duyệt',
        itemCount: 18,
        isFavorite: false,
      },
      {
        id: 'kiem-ke-kho',
        groupId: 'inout',
        groupName: 'Nhập xuất kho',
        title: 'Kiểm kê kho',
        description: 'Quản lý đợt kiểm kê, đối chiếu số liệu và điều chỉnh tồn kho',
        iconName: 'ClipboardCheck',
        iconBg: 'bg-teal-50 border border-teal-100',
        iconColor: 'text-teal-600',
        itemCount: 8,
        isFavorite: false,
      },
      {
        id: 'lich-su-xuat-nhap',
        groupId: 'inout',
        groupName: 'Nhập xuất kho',
        title: 'Lịch sử xuất nhập vật tư',
        description: 'Theo dõi vật tư xuất nhập theo ngày, tháng, năm',
        iconName: 'History',
        iconBg: 'bg-sky-50 border border-sky-100',
        iconColor: 'text-sky-600',
        itemCount: 156,
        isFavorite: false,
      },
    ],
  },
  {
    id: 'reports',
    code: 'B',
    title: 'Báo cáo',
    description: 'Thống kê tồn kho, phân tích số lượng khả dụng và đối chiếu nhập xuất tồn',
    modules: [
      {
        id: 'bao-cao-ton-kho',
        groupId: 'reports',
        groupName: 'Báo cáo',
        title: 'Tồn kho',
        description: 'Thống kê theo sản phẩm, theo nơi lưu và số liệu tồn kho',
        iconName: 'Boxes',
        iconBg: 'bg-blue-50 border border-blue-100',
        iconColor: 'text-blue-600',
        badge: 'Cập nhật tức thì',
        itemCount: 320,
        isFavorite: true,
      },
      {
        id: 'bao-cao-nxt',
        groupId: 'reports',
        groupName: 'Báo cáo',
        title: 'Báo cáo nhập xuất tồn',
        description: 'Tổng hợp nhập, xuất, tồn theo kỳ báo cáo',
        iconName: 'FileSpreadsheet',
        iconBg: 'bg-indigo-50 border border-indigo-100',
        iconColor: 'text-indigo-600',
        itemCount: 12,
        isFavorite: false,
      },
      {
        id: 'theo-doi-vat-tu',
        groupId: 'reports',
        groupName: 'Báo cáo',
        title: 'Theo dõi vật tư',
        description: 'Theo dõi tình trạng mua sắm, ngày đề xuất và trạng thái đã mua, chưa mua, không mua',
        iconName: 'PackageSearch',
        iconBg: 'bg-emerald-50 border border-emerald-100',
        iconColor: 'text-emerald-600',
        badge: 'Mới',
        itemCount: 12,
        isFavorite: true,
      },
    ],
  },
  {
    id: 'settings',
    code: 'C',
    title: 'Thiết lập và danh mục',
    description: 'Quản lý danh mục vật tư kỹ thuật, phụ liệu tiêu hao, công cụ dụng cụ và vị trí kho',
    modules: [
      {
        id: 'danh-muc-vat-tu',
        groupId: 'settings',
        groupName: 'Thiết lập và danh mục',
        title: 'Danh mục vật tư',
        description: 'Quản lý từng vật tư, đơn vị tính, mã vật tư, thông số',
        iconName: 'PackageOpen',
        iconBg: 'bg-amber-50 border border-amber-100',
        iconColor: 'text-amber-600',
        itemCount: 485,
        isFavorite: false,
      },
      {
        id: 'vat-tu-tieu-hao',
        groupId: 'settings',
        groupName: 'Thiết lập và danh mục',
        title: 'Danh mục vật tư tiêu hao',
        description: 'Quản lý từng vật tư, đơn vị tính, mã vật tư, thông số',
        iconName: 'Fuel',
        iconBg: 'bg-rose-50 border border-rose-100',
        iconColor: 'text-rose-600',
        itemCount: 164,
        isFavorite: false,
      },
      {
        id: 'cong-cu-dung-cu',
        groupId: 'settings',
        groupName: 'Thiết lập và danh mục',
        title: 'Danh mục công cụ, dụng cụ',
        description: 'Quản lý từng dụng cụ, đơn vị tính, mã dụng cụ, thông số',
        iconName: 'Wrench',
        iconBg: 'bg-cyan-50 border border-cyan-100',
        iconColor: 'text-cyan-600',
        itemCount: 92,
        isFavorite: false,
      },
      {
        id: 'danh-sach-kho',
        groupId: 'settings',
        groupName: 'Thiết lập và danh mục',
        title: 'Danh sách kho',
        description: 'Quản lý chi nhánh kho, vị trí lưu trữ, người phụ trách',
        iconName: 'Warehouse',
        iconBg: 'bg-violet-50 border border-violet-100',
        iconColor: 'text-violet-600',
        itemCount: 4,
        isFavorite: true,
      },
    ],
  },
];

export const ALL_MODULES: WarehouseModule[] = MODULE_GROUPS.flatMap((group) => group.modules);

// Home Launcher modules shown when clicking "Trang chủ"
export const HOME_MODULES = [
  { id: 'admin', name: 'Hành chính', desc: 'Công văn, hợp đồng, văn phòng', color: 'bg-amber-600', icon: 'Building' },
  { id: 'hr', name: 'Nhân sự', desc: 'Tuyển dụng, đào tạo, chấm công', color: 'bg-emerald-600', icon: 'Users' },
  { id: 'operations', name: 'Vận hành', desc: 'Quy trình, điều phối (Placeholder)', color: 'bg-sky-500', icon: 'Cog' },
  { id: 'sales', name: 'Kinh doanh', desc: 'Khách hàng, đơn hàng, doanh số', color: 'bg-blue-700', icon: 'TrendingUp' },
  { id: 'marketing', name: 'Marketing', desc: 'Chiến dịch, leads, thương hiệu', color: 'bg-pink-600', icon: 'Megaphone' },
  { id: 'finance', name: 'Tài chính', desc: 'Kế toán, thu chi, ngân sách', color: 'bg-purple-600', icon: 'Wallet' },
  { id: 'purchasing', name: 'Mua hàng', desc: 'Nhà cung cấp, PO, đơn giá', color: 'bg-red-600', icon: 'ShoppingCart' },
  { id: 'production', name: 'Sản xuất', desc: 'Kế hoạch sản xuất, lệnh SX', color: 'bg-lime-600', icon: 'Factory' },
  { id: 'warehouse', name: 'Kho vận', desc: 'Nhập xuất, kiểm kê, tồn kho', color: 'bg-teal-600', icon: 'Boxes' },
  { id: 'executive', name: 'Điều hành', desc: 'Báo cáo quản trị, KPI tổng thể', color: 'bg-emerald-700', icon: 'Compass' },
  { id: 'system', name: 'Hệ thống', desc: 'Phân quyền, người dùng, cấu hình', color: 'bg-slate-800', icon: 'Settings' },
  { id: 'ai', name: 'Trợ lý AI', desc: 'Hỗ trợ nghiệp vụ thông minh', color: 'bg-indigo-600', icon: 'Bot' },
];

// Mock data: Stock Slips (Phiếu kho)
export const MOCK_STOCK_SLIPS: StockSlip[] = [
  {
    id: 'sl-1',
    code: 'PN-20261017_01',
    type: 'Nhập kho',
    deliverer: 'Ngô Thiện Nhân',
    warehouseSource: 'Ngô Thiện Nhân',
    warehouseTarget: 'Kho cơ 1A',
    createdAt: '17/10/2026 08:10',
    creator: 'Nguyễn Hữu Hòa',
    approver: 'Đinh Bạt Quân',
    totalItems: 2,
    status: 'Đã duyệt',
    note: 'Nhập kho - Người giao: Ngô Thiện Nhân - Nơi nhận: Kho cơ 1A (Mỡ tra ổ bi Kluber Isoflex NBU 15, Vòng bi SKF 6205-2RSH/C3)',
    items: [
      {
        id: '1',
        name: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
        code: 'TH-MO-KLUBER',
        unit: 'Tuýp 1kg',
        quantity: 5,
        note: 'Bảo dưỡng gối trục tuabin',
      },
      {
        id: '2',
        name: 'Vòng bi SKF 6205-2RSH/C3',
        code: 'VT-BEARING-6205',
        unit: 'Chiếc',
        quantity: 10,
        note: 'Dự phòng cơ khí Kho cơ 1A',
      },
    ],
  },
  {
    id: 'sl-2',
    code: 'PN-20261017_02',
    type: 'Nhập kho',
    deliverer: 'Trần Quang Hiếu',
    warehouseSource: 'Trần Quang Hiếu',
    warehouseTarget: 'Kho điện 1A',
    createdAt: '17/10/2026 14:30',
    creator: 'Lê Văn Hải',
    approver: 'Đinh Bạt Quân',
    totalItems: 2,
    status: 'Đang xử lý',
    note: 'Nhập kho - Người giao: Trần Quang Hiếu - Nơi nhận: Kho điện 1A (Biến tần Fuji Frenic-Mini 7.5kW, Cảm biến quang Omron E3Z-D62)',
    items: [
      {
        id: '1',
        name: 'Biến tần Fuji Frenic-Mini 7.5kW',
        code: 'VT-INV-FUJI-7.5',
        unit: 'Chiếc',
        quantity: 2,
        note: 'Nhập mới dự phòng tủ điều khiển',
      },
      {
        id: '2',
        name: 'Cảm biến quang Omron E3Z-D62',
        code: 'VT-CB-OPT',
        unit: 'Chiếc',
        quantity: 6,
        note: 'Lắp đặt tủ tự động hóa',
      },
    ],
  },
  {
    id: 'sl-3',
    code: 'PX-20261017_01',
    type: 'Xuất kho',
    deliverer: 'Ngô Thiện Nhân',
    receiver: 'Lê Ngọc Nhàn',
    warehouseSource: 'Kho cơ 1A',
    warehouseTarget: 'Nhà máy 1A',
    createdAt: '17/10/2026 10:15',
    creator: 'Nguyễn Hữu Hòa',
    approver: 'Đinh Bạt Quân',
    totalItems: 2,
    status: 'Đã duyệt',
    note: 'Xuất kho - Người giao: Ngô Thiện Nhân - Người nhận: Lê Ngọc Nhàn - Nơi xuất: Kho cơ 1A - Nơi nhận: Nhà máy 1A (Vòng bi SKF 6205-2RSH/C3, Keo khóa ren chống xoay Loctite 243)',
    items: [
      {
        id: '1',
        name: 'Vòng bi SKF 6205-2RSH/C3',
        code: 'VT-BEARING-6205',
        unit: 'Chiếc',
        quantity: 4,
        note: 'Xuất bảo trì định kỳ Nhà máy 1A',
      },
      {
        id: '2',
        name: 'Keo khóa ren chống xoay Loctite 243',
        code: 'TH-KE-LOCTITE-243',
        unit: 'Chai 50ml',
        quantity: 2,
        note: 'Cố định bulong bệ máy',
      },
    ],
  },
  {
    id: 'sl-3b',
    code: 'PX-20261017_02',
    type: 'Xuất kho',
    deliverer: 'Trần Quang Hiếu',
    receiver: 'Bùi Văn Thuận',
    warehouseSource: 'Kho cơ điện 1C',
    warehouseTarget: 'Nhà máy 1C',
    createdAt: '17/10/2026 15:45',
    creator: 'Lê Văn Hải',
    approver: 'Đinh Bạt Quân',
    totalItems: 2,
    status: 'Đã duyệt',
    note: 'Xuất kho - Người giao: Trần Quang Hiếu - Người nhận: Bùi Văn Thuận - Nơi xuất: Kho cơ điện 1C - Nơi nhận: Nhà máy 1C (Bộ điều khiển PLC Siemens S7-1200, Băng dính cách điện 3M Temflex 1500)',
    items: [
      {
        id: '1',
        name: 'Bộ điều khiển PLC Siemens S7-1200',
        code: 'VT-PLC-S71200',
        unit: 'Bộ',
        quantity: 1,
        note: 'Thay thế khẩn cấp tại Nhà máy 1C',
      },
      {
        id: '2',
        name: 'Băng dính cách điện 3M Temflex 1500',
        code: 'TH-BANG-KEO-3M',
        unit: 'Cuộn',
        quantity: 10,
        note: 'Đấu nối tủ bảng điện',
      },
    ],
  },
  {
    id: 'sl-4',
    code: 'PC-20261016_01',
    type: 'Chuyển kho',
    deliverer: 'Ngô Thiện Nhân',
    receiver: 'Thái Ngọc Thức',
    warehouseSource: 'Kho cơ 1A',
    warehouseTarget: 'Kho cơ điện 1C',
    createdAt: '16/10/2026 16:45',
    creator: 'Nguyễn Hữu Hòa',
    approver: 'Đinh Bạt Quân',
    totalItems: 2,
    status: 'Chờ duyệt',
    note: 'Chuyển kho - Người giao: Ngô Thiện Nhân - Người nhận: Thái Ngọc Thức - Kho chuyển: Kho cơ 1A - Kho nhận: Kho cơ điện 1C (Van khí nén Festo 5/2 VUVS-L25, Găng tay sợi phủ lòng bàn tay PU)',
    items: [
      {
        id: '1',
        name: 'Van khí nén Festo 5/2 VUVS-L25',
        code: 'VT-VAN-FESTO-02',
        unit: 'Cái',
        quantity: 3,
        note: 'Điều chuyển dự phòng sang Kho cơ điện 1C',
      },
      {
        id: '2',
        name: 'Găng tay sợi phủ lòng bàn tay PU',
        code: 'TH-GANG-PU',
        unit: 'Đôi',
        quantity: 20,
        note: 'Bổ sung bảo hộ lao động',
      },
    ],
  },
  {
    id: 'sl-5',
    code: 'PN-20261016_01',
    type: 'Nhập kho',
    deliverer: 'Ngô Thiện Nhân',
    warehouseSource: 'Ngô Thiện Nhân',
    warehouseTarget: 'Kho cơ điện 1C',
    createdAt: '16/10/2026 09:30',
    creator: 'Nguyễn Hữu Hòa',
    approver: 'Đinh Bạt Quân',
    totalItems: 1,
    status: 'Đã duyệt',
    note: 'Nhập kho - Người giao: Ngô Thiện Nhân - Nơi nhận: Kho cơ điện 1C (Bộ điều khiển PLC Siemens S7-1200)',
    items: [
      {
        id: '1',
        name: 'Bộ điều khiển PLC Siemens S7-1200',
        code: 'VT-PLC-S71200',
        unit: 'Bộ',
        quantity: 2,
        note: 'Nhập dự phòng tủ điều khiển',
      },
    ],
  },
  {
    id: 'sl-6',
    code: 'PX-20261015_01',
    type: 'Xuất kho',
    deliverer: 'Trần Quang Hiếu',
    receiver: 'Thái Ngọc Thức',
    warehouseSource: 'Kho điện 1A',
    warehouseTarget: 'Nhà QLVH',
    createdAt: '15/10/2026 14:15',
    creator: 'Lê Văn Hải',
    approver: 'Đinh Bạt Quân',
    totalItems: 1,
    status: 'Đã duyệt',
    note: 'Xuất kho - Người giao: Trần Quang Hiếu - Người nhận: Thái Ngọc Thức - Nơi xuất: Kho điện 1A - Nơi nhận: Nhà QLVH (Ampe kìm đo dòng Fluke 376 FC True-RMS)',
    items: [
      {
        id: '1',
        name: 'Ampe kìm đo dòng Fluke 376 FC True-RMS',
        code: 'DC-FLUKE-376',
        unit: 'Cái',
        quantity: 1,
        note: 'Cấp phát trực vận hành tại Nhà QLVH',
      },
    ],
  },
  {
    id: 'sl-7',
    code: 'PN-20261012_01',
    type: 'Nhập kho',
    deliverer: 'Trần Quang Hiếu',
    warehouseSource: 'Trần Quang Hiếu',
    warehouseTarget: 'Kho cơ 1A',
    createdAt: '12/10/2026 10:00',
    creator: 'Lê Văn Hải',
    approver: 'Đinh Bạt Quân',
    totalItems: 1,
    status: 'Đã hủy',
    note: 'Nhập kho - Người giao: Trần Quang Hiếu - Nơi nhận: Kho cơ 1A (Van khí nén Festo 5/2 VUVS-L25 - Sai thông số áp suất)',
    items: [
      {
        id: '1',
        name: 'Van khí nén Festo 5/2 VUVS-L25',
        code: 'VT-VAN-FESTO-02',
        unit: 'Cái',
        quantity: 4,
        note: 'Hoàn trả do sai thông số áp suất',
      },
    ],
  },
];

// Mock data: Material Requests (Phiếu đề xuất vật tư)
export const MOCK_MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'mr-1',
    code: 'DX-VT-2026-088',
    requestDate: '17/10/2026',
    department: 'Ban KTSC',
    category: 'Cơ khí',
    requester: 'Nguyễn Hữu Hòa',
    purpose: 'Bảo dưỡng định kỳ hệ thống điều tốc và gối đỡ tuabin Nhà máy 1A',
    approvalLevel: 'Ban KTSC',
    urgency: 'Gấp',
    status: 'Đã phê duyệt',
    location: 'Nhà máy 1A',
    approver: 'Đinh Bạt Quân',
    requiredDate: '19/10/2026',
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Vòng bi SKF 6205-2RSH/C3',
        code: 'VT-BEARING-6205',
        unit: 'Chiếc',
        quantity: 6,
        category: 'Cơ khí',
        unitPrice: 285000,
        taxRate: 8,
        note: 'Thay thế vòng bi cụm bơm dầu điều tốc',
      },
      {
        id: '2',
        name: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
        code: 'TH-MO-KLUBER',
        unit: 'Tuýp 1kg',
        quantity: 4,
        category: 'Cơ khí',
        unitPrice: 1250000,
        taxRate: 8,
        note: 'Bôi trơn ổ đỡ tuabin',
      },
    ],
  },
  {
    id: 'mr-2',
    code: 'DX-VT-2026-089',
    requestDate: '16/10/2026',
    department: 'Ban KTVH',
    category: 'Điện',
    requester: 'Lê Ngọc Nhàn',
    purpose: 'Dự phòng vật tư tự động hóa và cảm biến tủ điều khiển Nhà máy 1B',
    approvalLevel: 'Ban KTVH',
    urgency: 'Bình thường',
    status: 'Chờ duyệt',
    location: 'Nhà máy 1B',
    approver: 'Đinh Bạt Quân',
    requiredDate: '22/10/2026',
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Bộ điều khiển PLC Siemens S7-1200',
        code: 'VT-PLC-S71200',
        unit: 'Bộ',
        quantity: 2,
        category: 'Điện',
        unitPrice: 6800000,
        taxRate: 10,
        note: 'Dự phòng tủ điều khiển trung tâm',
      },
      {
        id: '2',
        name: 'Cảm biến quang Omron E3Z-D62',
        code: 'VT-CB-OPT',
        unit: 'Chiếc',
        quantity: 5,
        category: 'Điện',
        unitPrice: 750000,
        taxRate: 8,
        note: 'Lắp đặt hệ thống giám sát hành trình van',
      },
    ],
  },
  {
    id: 'mr-3',
    code: 'DX-VT-2026-090',
    requestDate: '15/10/2026',
    department: 'Ban KTSC',
    category: 'Cơ khí',
    requester: 'Bùi Văn Thuận',
    purpose: 'Xử lý sự cố hệ thống van khí nén và tủ biến tần Nhà máy 1C',
    approvalLevel: 'Ban KTSC',
    urgency: 'Khẩn cấp',
    status: 'Chờ duyệt',
    location: 'Nhà máy 1C',
    approver: 'Đinh Bạt Quân',
    requiredDate: '16/10/2026',
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Van khí nén Festo 5/2 VUVS-L25',
        code: 'VT-VAN-FESTO-02',
        unit: 'Cái',
        quantity: 3,
        category: 'Cơ khí',
        unitPrice: 1450000,
        taxRate: 8,
        note: 'Thay thế van khí nén buồng điều khiển',
      },
      {
        id: '2',
        name: 'Biến tần Fuji Frenic-Mini 7.5kW',
        code: 'VT-INV-FUJI-7.5',
        unit: 'Chiếc',
        quantity: 1,
        category: 'Điện',
        unitPrice: 9200000,
        taxRate: 10,
        note: 'Dự phòng bơm tiêu nước',
      },
    ],
  },
  {
    id: 'mr-4',
    code: 'DX-VT-2026-087',
    requestDate: '11/10/2026',
    department: 'Ban HCTC',
    category: 'Điện',
    requester: 'Lê Văn Hải',
    purpose: 'Trang bị bảo hộ lao động và vật tư tiêu hao phục vụ ca trực Nhà QLVH',
    approvalLevel: 'Ban HCTC',
    urgency: 'Bình thường',
    status: 'Đã phê duyệt',
    location: 'Nhà QLVH',
    approver: 'Đinh Bạt Quân',
    requiredDate: '15/10/2026',
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Găng tay sợi phủ lòng bàn tay PU',
        code: 'TH-GANG-PU',
        unit: 'Đôi',
        quantity: 30,
        category: 'Cơ khí',
        unitPrice: 18000,
        taxRate: 8,
        note: 'Cấp phát cho ca trực vận hành & sửa chữa',
      },
      {
        id: '2',
        name: 'Băng dính cách điện 3M Temflex 1500',
        code: 'TH-BANG-KEO-3M',
        unit: 'Cuộn',
        quantity: 15,
        category: 'Điện',
        unitPrice: 22000,
        taxRate: 8,
        note: 'Bổ sung tủ dụng cụ an toàn điện',
      },
    ],
  },
  {
    id: 'mr-5',
    code: 'DX-VT-2026-082',
    requestDate: '24/09/2026',
    department: 'Ban KTVH',
    category: 'Điện',
    requester: 'Thái Ngọc Thức',
    purpose: 'Bổ sung thiết bị đo kiểm điện và keo khóa ren bảo dưỡng định kỳ tháng 09',
    approvalLevel: 'Ban KTVH',
    urgency: 'Bình thường',
    status: 'Đã phê duyệt',
    location: 'Nhà máy 1A',
    approver: 'Đinh Bạt Quân',
    requiredDate: '28/09/2026',
    itemCount: 2,
    items: [
      {
        id: '1',
        name: 'Ampe kìm đo dòng Fluke 376 FC True-RMS',
        code: 'DC-FLUKE-376',
        unit: 'Cái',
        quantity: 2,
        category: 'Điện',
        unitPrice: 11500000,
        taxRate: 10,
        note: 'Phục vụ đo kiểm dòng điện tủ tự dùng',
      },
      {
        id: '2',
        name: 'Keo khóa ren chống xoay Loctite 243',
        code: 'TH-KE-LOCTITE-243',
        unit: 'Chai 50ml',
        quantity: 5,
        category: 'Cơ khí',
        unitPrice: 390000,
        taxRate: 8,
        note: 'Cố định bulong chịu rung động',
      },
    ],
  },
];

// Mock data: Stock Movement History (Lịch sử xuất nhập)
export const MOCK_STOCK_HISTORY: StockHistoryItem[] = [
  {
    id: 'his-1',
    date: '17/10/2026 08:35',
    itemCode: 'VT-MOTOR-04',
    itemName: 'Động cơ giảm tốc Sew 1.5kW',
    movementType: 'Nhập',
    quantity: 4,
    unit: 'Bộ',
    warehouse: 'Kho Tổng ST1',
    referenceSlip: 'PN-20261017_01',
    performer: 'Trần Văn Mạnh',
  },
  {
    id: 'his-2',
    date: '17/10/2026 10:20',
    itemCode: 'TH-MO-KLUBER',
    itemName: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
    movementType: 'Xuất',
    quantity: 6,
    unit: 'Tuýp 1kg',
    warehouse: 'Kho Phụ tùng',
    referenceSlip: 'PX-20261017_01',
    performer: 'Phạm Thị Thảo',
  },
  {
    id: 'his-3',
    date: '16/10/2026 11:10',
    itemCode: 'VT-PLC-S71200',
    itemName: 'Bộ điều khiển PLC Siemens S7-1200',
    movementType: 'Điều chuyển',
    quantity: 2,
    unit: 'Bộ',
    warehouse: 'Kho Tổng → Phụ tùng ST1',
    referenceSlip: 'PC-20261016_01',
    performer: 'Lê Hoàng Nam',
  },
  {
    id: 'his-4',
    date: '15/10/2026 16:50',
    itemCode: 'DC-KIM-FLUKE',
    itemName: 'Ampe kìm Fluke 376 FC True-RMS',
    movementType: 'Xuất',
    quantity: 1,
    unit: 'Cái',
    warehouse: 'Kho Dụng cụ',
    referenceSlip: 'PX-20261015_01',
    performer: 'Nguyễn Văn Tuấn',
  },
  {
    id: 'his-5',
    date: '15/10/2026 09:15',
    itemCode: 'VT-CB-OPT',
    itemName: 'Cảm biến quang Omron E3Z-D62',
    movementType: 'Nhập',
    quantity: 25,
    unit: 'Chiếc',
    warehouse: 'Kho Tổng ST1',
    referenceSlip: 'PN-20261016_01',
    performer: 'Trần Văn Mạnh',
  },
  {
    id: 'his-6',
    date: '14/10/2026 14:00',
    itemCode: 'TH-GANG-PU',
    itemName: 'Găng tay sợi phủ lòng bàn tay PU size L',
    movementType: 'Xuất',
    quantity: 120,
    unit: 'Đôi',
    warehouse: 'Kho Tiêu hao',
    referenceSlip: 'PX-20261014_01',
    performer: 'Trần Văn Mạnh',
  },
];

// Mock data: Inventory Audits (Kiểm kê kho)
export const MOCK_INVENTORY_AUDITS: InventoryAudit[] = [
  {
    id: 'audit-1',
    code: 'KK-2026-Q3-01',
    title: 'Kiểm kê định kỳ Quý 3/2026 toàn bộ Kho Tổng 5F',
    warehouse: 'Kho Tổng 5F - KCN Tân Bình',
    auditPeriod: '01/10/2026 - 03/10/2026',
    leadAuditor: 'Nguyễn Hữu Hòa (Chủ tịch đoàn)',
    itemsAudited: 320,
    discrepanciesCount: 2,
    status: 'Hoàn tất',
    adjusted: true,
  },
  {
    id: 'audit-2',
    code: 'KK-2026-DX-04',
    title: 'Kiểm kê đột xuất Kho Công cụ & Dụng cụ đo',
    warehouse: 'Kho Dụng cụ & Thiết bị đo',
    auditPeriod: '14/10/2026 - 15/10/2026',
    leadAuditor: 'Nguyễn Hữu Hòa (Admin)',
    itemsAudited: 92,
    discrepanciesCount: 0,
    status: 'Hoàn tất',
    adjusted: false,
  },
  {
    id: 'audit-3',
    code: 'KK-2026-Q4-01',
    title: 'Kiểm kê thường niên Quý 4 Kho Chi nhánh Bình Dương',
    warehouse: 'Kho Chi nhánh 2 - Bình Dương',
    auditPeriod: '20/10/2026 - 22/10/2026',
    leadAuditor: 'Lê Hoàng Nam (Phụ trách CN)',
    itemsAudited: 180,
    discrepanciesCount: 0,
    status: 'Đang kiểm kê',
    adjusted: false,
  },
];

// Mock data: Stock Inventory (Tồn kho)
export const MOCK_INVENTORY_REPORT: InventoryReportItem[] = [
  {
    id: 'inv-1',
    itemCode: 'VT-PLC-S71200',
    itemName: 'Bộ điều khiển PLC Siemens S7-1200',
    category: 'Tự động hóa',
    location: 'Kho Tổng 5F',
    shelf: 'Kệ A3 - Tầng 2',
    quantityOnHand: 14,
    availableQuantity: 11,
    reservedQuantity: 3,
    minThreshold: 5,
    unit: 'Bộ',
    unitCost: '8.450.000 ₫',
    totalValue: '118.300.000 ₫',
    stockStatus: 'Đủ hàng',
  },
  {
    id: 'inv-2',
    itemCode: 'VT-INV-FUJI-7.5',
    itemName: 'Biến tần Fuji Electric Frenic-Mini 7.5kW',
    category: 'Truyền động',
    location: 'Kho Tổng 5F',
    shelf: 'Kệ A1 - Tầng 1',
    quantityOnHand: 4,
    availableQuantity: 2,
    reservedQuantity: 2,
    minThreshold: 4,
    unit: 'Chiếc',
    unitCost: '11.800.000 ₫',
    totalValue: '47.200.000 ₫',
    stockStatus: 'Sắp hết',
  },
  {
    id: 'inv-3',
    itemCode: 'TH-MO-KLUBER',
    itemName: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
    category: 'Vật tư tiêu hao',
    location: 'Kho Phụ tùng',
    shelf: 'Tủ hóa chất C2',
    quantityOnHand: 28,
    availableQuantity: 22,
    reservedQuantity: 6,
    minThreshold: 10,
    unit: 'Tuýp 1kg',
    unitCost: '1.650.000 ₫',
    totalValue: '46.200.000 ₫',
    stockStatus: 'Đủ hàng',
  },
  {
    id: 'inv-4',
    itemCode: 'VT-VAN-FESTO-02',
    itemName: 'Van điện từ Festo VUVS-L25',
    category: 'Khí nén',
    location: 'Kho Tổng 5F',
    shelf: 'Kệ B2 - Tầng 3',
    quantityOnHand: 3,
    availableQuantity: 1,
    reservedQuantity: 2,
    minThreshold: 8,
    unit: 'Cái',
    unitCost: '2.150.000 ₫',
    totalValue: '6.450.000 ₫',
    stockStatus: 'Sắp hết',
  },
  {
    id: 'inv-5',
    itemCode: 'VT-BEARING-6205',
    itemName: 'Vòng bi cầu SKF Explorer 6205',
    category: 'Cơ khí',
    location: 'Kho Tổng 5F',
    shelf: 'Kệ D1 - Tầng 2',
    quantityOnHand: 180,
    availableQuantity: 175,
    reservedQuantity: 5,
    minThreshold: 50,
    unit: 'Chiếc',
    unitCost: '145.000 ₫',
    totalValue: '26.100.000 ₫',
    stockStatus: 'Đủ hàng',
  },
  {
    id: 'inv-6',
    itemCode: 'TH-GANG-PU',
    itemName: 'Găng tay sợi phủ PU chống tĩnh điện',
    category: 'Vật tư tiêu hao',
    location: 'Kho Tiêu hao',
    shelf: 'Kệ E1 - Tầng 1',
    quantityOnHand: 1450,
    availableQuantity: 1450,
    reservedQuantity: 0,
    minThreshold: 300,
    unit: 'Đôi',
    unitCost: '8.500 ₫',
    totalValue: '12.325.000 ₫',
    stockStatus: 'Vượt định mức',
  },
];

// Mock data: In-Out-Balance Report (Nhập xuất tồn)
export const MOCK_IN_OUT_REPORT: InOutBalanceReportItem[] = [
  {
    id: 'nxt-1',
    itemCode: 'VT-PLC-S71200',
    itemName: 'Bộ điều khiển PLC Siemens S7-1200',
    unit: 'Bộ',
    openingStock: 12,
    inStock: 8,
    outStock: 6,
    closingStock: 14,
    turnoverRate: '0.46',
  },
  {
    id: 'nxt-2',
    itemCode: 'VT-INV-FUJI-7.5',
    itemName: 'Biến tần Fuji Electric Frenic-Mini 7.5kW',
    unit: 'Chiếc',
    openingStock: 6,
    inStock: 3,
    outStock: 5,
    closingStock: 4,
    turnoverRate: '1.00',
  },
  {
    id: 'nxt-3',
    itemCode: 'TH-MO-KLUBER',
    itemName: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
    unit: 'Tuýp 1kg',
    openingStock: 15,
    inStock: 25,
    outStock: 12,
    closingStock: 28,
    turnoverRate: '0.56',
  },
  {
    id: 'nxt-4',
    itemCode: 'VT-VAN-FESTO-02',
    itemName: 'Van điện từ Festo VUVS-L25',
    unit: 'Cái',
    openingStock: 10,
    inStock: 5,
    outStock: 12,
    closingStock: 3,
    turnoverRate: '1.85',
  },
  {
    id: 'nxt-5',
    itemCode: 'VT-BEARING-6205',
    itemName: 'Vòng bi cầu SKF 6205-2RSH/C3',
    unit: 'Chiếc',
    openingStock: 220,
    inStock: 60,
    outStock: 100,
    closingStock: 180,
    turnoverRate: '0.50',
  },
];

// Mock data: Material Catalog (Danh mục vật tư kỹ thuật)
export const MOCK_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-1',
    code: 'VT-PLC-S71200',
    name: 'Bộ điều khiển PLC Siemens S7-1200',
    unit: 'Bộ',
    category: 'Tự động hóa',
    specifications: 'CPU 1214C DC/DC/DC, 14 DI / 10 DO / 2 AI onboard, nguồn 24VDC',
    brand: 'Siemens',
    origin: 'Đức',
    standard: 'IEC 61131-2',
    active: true,
  },
  {
    id: 'mat-2',
    code: 'VT-INV-FUJI-7.5',
    name: 'Biến tần Fuji Frenic-Mini 7.5kW',
    unit: 'Chiếc',
    category: 'Truyền động',
    specifications: 'Công suất 7.5kW, điện áp 3 pha 380V - 480V, tích hợp bộ hãm động năng',
    brand: 'Fuji Electric',
    origin: 'Nhật Bản',
    standard: 'CE, UL, cUL',
    active: true,
  },
  {
    id: 'mat-3',
    code: 'VT-CB-OPT',
    name: 'Cảm biến quang Omron E3Z-D62',
    unit: 'Chiếc',
    category: 'Cảm biến',
    specifications: 'Khoảng cách phát hiện 1m phản xạ khuếch tán, ngõ ra NPN, cáp 2m',
    brand: 'Omron',
    origin: 'Nhật Bản',
    standard: 'IP67',
    active: true,
  },
  {
    id: 'mat-4',
    code: 'VT-VAN-FESTO-02',
    name: 'Van khí nén Festo 5/2 VUVS-L25',
    unit: 'Cái',
    category: 'Khí nén',
    specifications: 'Van cuộn hút 24VDC, ren kết nối G1/4, áp suất làm việc 2.5 - 10 bar',
    brand: 'Festo',
    origin: 'Đức',
    standard: 'ISO 5599-1',
    active: true,
  },
  {
    id: 'mat-5',
    code: 'VT-BEARING-6205',
    name: 'Vòng bi SKF 6205-2RSH/C3',
    unit: 'Chiếc',
    category: 'Cơ khí',
    specifications: 'Kích thước 25x52x15mm, phớt cao su 2 mặt, khe hở hướng tâm C3',
    brand: 'SKF',
    origin: 'Thụy Điển',
    standard: 'DIN 625-1',
    active: true,
  },
];

// Mock data: Consumables Catalog (Vật tư tiêu hao)
export const MOCK_CONSUMABLES: MaterialItem[] = [
  {
    id: 'con-1',
    code: 'TH-MO-KLUBER',
    name: 'Mỡ tra ổ bi Kluber Isoflex NBU 15',
    unit: 'Tuýp 1kg',
    category: 'Dầu mỡ công nghiệp',
    specifications: 'Gốc dầu khoáng + dầu tổng hợp, barium complex soap, dải nhiệt -40°C đến 130°C',
    brand: 'Kluber Lubrication',
    origin: 'Đức',
    standard: 'DIN 51825',
    active: true,
  },
  {
    id: 'con-2',
    code: 'TH-KE-LOCTITE-243',
    name: 'Keo khóa ren chống xoay Loctite 243',
    unit: 'Chai 50ml',
    category: 'Hóa chất công nghiệp',
    specifications: 'Khóa ren lực trung bình, thích hợp bulong ốc vít M6 - M20, chống rung lắc',
    brand: 'Henkel Loctite',
    origin: 'Mỹ',
    standard: 'MIL-S-46163A',
    active: true,
  },
  {
    id: 'con-3',
    code: 'TH-GANG-PU',
    name: 'Găng tay sợi phủ lòng bàn tay PU',
    unit: 'Đôi',
    category: 'Bảo hộ lao động',
    specifications: 'Vải sợi carbon chống tĩnh điện 10^6 - 10^9 ohm, phủ polyurethane đầu ngón',
    brand: 'CleanRoom Tech',
    origin: 'Hàn Quốc',
    standard: 'EN 388:2016',
    active: true,
  },
  {
    id: 'con-4',
    code: 'TH-BANG-KEO-3M',
    name: 'Băng dính cách điện 3M Temflex 1500',
    unit: 'Cuộn',
    category: 'Vật tư phụ điện',
    specifications: 'Kích thước 18mm x 10m x 0.13mm, chịu điện áp 600V, nhiệt độ tới 90°C',
    brand: '3M',
    origin: 'Mỹ',
    standard: 'IEC 60454-3-1',
    active: true,
  },
];

// Mock data: Tools & Equipment (Công cụ dụng cụ)
export const MOCK_TOOLS: ToolEquipmentItem[] = [
  {
    id: 'tool-1',
    code: 'DC-FLUKE-376',
    name: 'Ampe kìm đo dòng Fluke 376 FC True-RMS',
    unit: 'Cái',
    category: 'Thiết bị đo điện',
    serialNumber: 'SN-FLK-883921',
    specs: 'Đo dòng AC/DC 1000A, tích hợp đầu dò iFlex tới 2500A, kết nối Fluke Connect',
    assignedTo: 'Đội Bảo trì Cơ điện',
    status: 'Đang sử dụng',
  },
  {
    id: 'tool-2',
    code: 'DC-MAKITA-DHP484',
    name: 'Máy khoan vặn vít búa dùng pin Makita 18V',
    unit: 'Bộ',
    category: 'Dụng cụ cầm tay',
    serialNumber: 'SN-MKT-202409',
    specs: 'Động cơ không chổi than BL Motor, momen xoắn 54Nm, 2 pin 5.0Ah kèm sạc nhanh',
    assignedTo: 'Xưởng Sản xuất 1',
    status: 'Sẵn sàng',
  },
  {
    id: 'tool-3',
    code: 'DC-MITUTOYO-CALIP',
    name: 'Thước kẹp điện tử Mitutoyo 0-200mm',
    unit: 'Chiếc',
    category: 'Dụng cụ đo cơ khí',
    serialNumber: 'SN-MIT-500-197',
    specs: 'Dải đo 0 - 200mm, độ chính xác ±0.02mm, chuẩn chống nước IP67',
    assignedTo: 'Phòng Kiểm chuẩn QA',
    status: 'Sẵn sàng',
  },
  {
    id: 'tool-4',
    code: 'DC-BOSCH-GWS750',
    name: 'Máy mài góc Bosch GWS 750-100',
    unit: 'Cái',
    category: 'Dụng cụ gia công',
    serialNumber: 'SN-BSC-44109',
    specs: 'Công suất 750W, đường kính đĩa 100mm, tốc độ không tải 11000 v/p',
    assignedTo: 'Xưởng Hàn kết cấu',
    status: 'Bảo trì',
  },
];

// Mock data: Warehouse Locations (Danh sách kho)
export const MOCK_WAREHOUSES: WarehouseLocation[] = [
  {
    id: 'wh-1',
    code: 'KHO-TONG-01',
    name: 'Kho Tổng 5F - KCN Tân Bình',
    branch: 'TP. Hồ Chí Minh',
    address: 'Lô C2, Đường CN13, KCN Tân Bình, Phường Tây Thạnh, Quận Tân Phú',
    manager: 'Trần Văn Mạnh (Thủ kho trưởng)',
    phone: '0903 124 568',
    capacityPercentage: 78,
    totalAisles: 16,
    status: 'Đang hoạt động',
  },
  {
    id: 'wh-2',
    code: 'KHO-PHUTUNG-02',
    name: 'Kho Phụ tùng & Linh kiện Xưởng',
    branch: 'TP. Hồ Chí Minh',
    address: 'Khu kỹ thuật tầng trệt, Nhà máy 5F Tân Bình',
    manager: 'Võ Minh Trí (Kỹ thuật viên kho)',
    phone: '0918 456 789',
    capacityPercentage: 62,
    totalAisles: 8,
    status: 'Đang hoạt động',
  },
  {
    id: 'wh-3',
    code: 'KHO-BINHDUONG-03',
    name: 'Kho Chi nhánh 2 - KCN VSIP 1',
    branch: 'Bình Dương',
    address: 'Đại lộ Hữu Nghị, KCN VSIP 1, Phường An Phú, TP. Thuận An',
    manager: 'Lê Hoàng Nam (Phụ trách chi nhánh)',
    phone: '0937 654 321',
    capacityPercentage: 45,
    totalAisles: 12,
    status: 'Đang hoạt động',
  },
  {
    id: 'wh-4',
    code: 'KHO-DCC-04',
    name: 'Kho Công cụ & Thiết bị đo lường',
    branch: 'TP. Hồ Chí Minh',
    address: 'Phòng kiểm định chất lượng, Nhà xưởng B',
    manager: 'Nguyễn Văn Tuấn (Quản lý thiết bị)',
    phone: '0945 987 654',
    capacityPercentage: 54,
    totalAisles: 6,
    status: 'Đang hoạt động',
  },
];

// Mock data: Theo dõi vật tư (Báo cáo mua sắm và tiến độ cung ứng vật tư)
export const MOCK_MATERIAL_TRACKING: MaterialTrackingItem[] = [
  {
    id: 'trk-1',
    code: 'VT-PLC-S71200',
    name: 'Bộ điều khiển PLC Siemens S7-1200 CPU 1214C DC/DC/DC',
    unit: 'Bộ',
    quantity: 2,
    department: 'Xưởng Vận hành Cơ điện',
    supplier: 'Công ty TNHH Thiết bị Tự động hóa Siemens VN',
    requestDate: '2026-10-15',
    expectedDate: '2026-10-22',
    status: 'Đã mua',
    poNumber: 'PO-2026-108',
    note: 'Đã phát hành PO, hàng đang vận chuyển về kho ST1',
  },
  {
    id: 'trk-2',
    code: 'TH-MO-KLUBER',
    name: 'Mỡ bôi trơn vòng bi chịu nhiệt Kluber Isoflex NBU 15',
    unit: 'Tuýp 1kg',
    quantity: 10,
    department: 'Đội Bảo dưỡng Tổ máy 1',
    supplier: 'Nhà phân phối Hóa chất Kỹ thuật Kluber',
    requestDate: '2026-10-14',
    expectedDate: '2026-10-18',
    status: 'Đã mua',
    poNumber: 'PO-2026-105',
    note: 'Đã thanh toán đợt 1, thủ kho chuẩn bị nhận hàng',
  },
  {
    id: 'trk-3',
    code: 'VT-BT-FUJI',
    name: 'Biến tần công nghiệp Fuji Frenic-Mega 15kW 380V',
    unit: 'Bộ',
    quantity: 1,
    department: 'Xưởng Cơ điện Nhà máy',
    supplier: 'Công ty Cổ phần Kỹ thuật Điện Fuji Á Châu',
    requestDate: '2026-10-12',
    expectedDate: '2026-10-26',
    status: 'Chưa mua',
    note: 'Đang trong quá trình so sánh báo giá 3 nhà cung cấp',
  },
  {
    id: 'trk-4',
    code: 'DC-KIM-FLUKE',
    name: 'Ampe kìm chuyên dụng Fluke 376 FC True-RMS AC/DC 1000A',
    unit: 'Cái',
    quantity: 3,
    department: 'Phòng Thí nghiệm & Đo lường ST1',
    supplier: 'Đại lý Thiết bị Đo lường Fluke VN',
    requestDate: '2026-10-10',
    expectedDate: '2026-10-16',
    status: 'Đã mua',
    poNumber: 'PO-2026-098',
    note: 'Đã nhập kho ngày 15/10/2026 theo phiếu PX-20261015_01',
  },
  {
    id: 'trk-5',
    code: 'VT-RL-OMRON',
    name: 'Rơle kiếng trung gian Omron MY4N 24VDC có đèn LED',
    unit: 'Chiếc',
    quantity: 50,
    department: 'Ban Vận hành Trạm Biến áp 110kV',
    supplier: 'Công ty Thiết bị Tự động Omron VN',
    requestDate: '2026-10-09',
    expectedDate: '2026-10-19',
    status: 'Chưa mua',
    note: 'Đã trình duyệt bảng tổng hợp nhu cầu, chờ ký phê duyệt',
  },
  {
    id: 'trk-6',
    code: 'TH-CAT-KIM',
    name: 'Đá cắt kim loại Bosch Pro 100x1.2mm tiêu chuẩn EN12413',
    unit: 'Hộp 50 viên',
    quantity: 8,
    department: 'Xưởng Cơ khí & Hàn cắt',
    supplier: '',
    requestDate: '2026-10-08',
    status: 'Không mua',
    note: 'Kho Tổng còn tồn 15 hộp khả dụng, tận dụng hàng lưu kho cũ',
  },
  {
    id: 'trk-7',
    code: 'VT-VAN-FESTO',
    name: 'Van điện từ khí nén Festo VUVS-L25-M52-MD-G14-F8',
    unit: 'Chiếc',
    quantity: 4,
    department: 'Đội Khí nén & Thủy lực ST1',
    supplier: 'Festo Vietnam Authorized Distributor',
    requestDate: '2026-10-05',
    expectedDate: '2026-10-25',
    status: 'Chưa mua',
    note: 'Đang thương thảo điều khoản bảo hành 24 tháng',
  },
  {
    id: 'trk-8',
    code: 'VT-DAY-CADIVI',
    name: 'Dây cáp điện lực hạ thế Cadivi CVV 4x16 mm2 - 0.6/1kV',
    unit: 'Cuộn 100m',
    quantity: 5,
    department: 'Ban Quản lý Dự án Mở rộng trạm',
    supplier: '',
    requestDate: '2026-10-04',
    status: 'Không mua',
    note: 'Thay đổi phương án thiết kế sang dùng cáp chống cháy CXV',
  },
  {
    id: 'trk-9',
    code: 'VT-LOC-DAU',
    name: 'Lõi lọc dầu áp lực cao Hydac 0330D010BN4HC',
    unit: 'Bộ',
    quantity: 6,
    department: 'Xưởng Vận hành Cơ điện',
    supplier: 'Công ty Cổ phần Thủy lực Thủy điện Đông Dương',
    requestDate: '2026-10-02',
    expectedDate: '2026-10-11',
    status: 'Đã mua',
    poNumber: 'PO-2026-092',
    note: 'Đã hoàn tất nghiệm thu và cấp phát cho tổ máy H1',
  },
  {
    id: 'trk-10',
    code: 'TH-GANG-PU',
    name: 'Găng tay sợi phủ lòng bàn tay PU size L chống trơn trượt',
    unit: 'Đôi',
    quantity: 200,
    department: 'Ban An toàn & Bảo hộ Lao động',
    supplier: 'Công ty BHLĐ Tân Bình Minh',
    requestDate: '2026-09-28',
    expectedDate: '2026-10-05',
    status: 'Đã mua',
    poNumber: 'PO-2026-085',
    note: 'Đã cấp phát đầy đủ cho các kíp trực ca vận hành',
  },
  {
    id: 'trk-11',
    code: 'VT-CAM-BIEN',
    name: 'Cảm biến áp suất thủy lực Danfoss MBS 3000 (0-250 bar)',
    unit: 'Chiếc',
    quantity: 2,
    department: 'Tổ Điều khiển - Tự động hóa',
    supplier: 'Danfoss Industrial Solutions VN',
    requestDate: '2026-09-25',
    expectedDate: '2026-10-30',
    status: 'Chưa mua',
    note: 'Chờ phản hồi thời gian giao hàng từ nhà máy Đan Mạch',
  },
  {
    id: 'trk-12',
    code: 'DC-COLE-KST',
    name: 'Bộ cờ lê tròng miệng tự động KS Tools 8-32mm (21 chi tiết)',
    unit: 'Bộ',
    quantity: 2,
    department: 'Xưởng Bảo dưỡng Cơ khí',
    supplier: '',
    requestDate: '2026-09-20',
    status: 'Không mua',
    note: 'Xưởng cơ khí mượn dùng chung bộ dụng cụ số 2 của Trạm ST1',
  },
];

export type CatalogCategoryType = 'danh-muc-vat-tu' | 'vat-tu-tieu-hao' | 'cong-cu-dung-cu';

export interface UnifiedCatalogEntry {
  id: string;
  code: string;
  name: string;
  unit: string;
  catalogType: CatalogCategoryType;
  catalogLabel: string;
}

const normalizeVietnameseText = (str: string): string => {
  return (str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const toAsciiCodeSlug = (str: string): string => {
  const withoutDiacritics = (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .trim();

  const words = withoutDiacritics.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'MOI';
  if (words.length === 1) return words[0].slice(0, 6);
  if (words.length === 2) return `${words[0].slice(0, 4)}-${words[1].slice(0, 4)}`;
  // Take first word (up to 4 chars) + initials of remaining words
  const prefix = words[0].slice(0, 4);
  const initials = words
    .slice(1, 5)
    .map((w) => w[0])
    .join('');
  return `${prefix}-${initials}`;
};

export const getCatalogLabel = (catalogType: CatalogCategoryType): string => {
  switch (catalogType) {
    case 'danh-muc-vat-tu':
      return 'Danh mục vật tư';
    case 'vat-tu-tieu-hao':
      return 'Danh mục vật tư tiêu hao';
    case 'cong-cu-dung-cu':
      return 'Danh mục công cụ, dụng cụ';
  }
};

export const getAllUnifiedCatalogItems = (): UnifiedCatalogEntry[] => {
  const materials: UnifiedCatalogEntry[] = MOCK_MATERIALS.map((m) => ({
    id: m.id,
    code: m.code,
    name: m.name,
    unit: m.unit,
    catalogType: 'danh-muc-vat-tu',
    catalogLabel: 'Danh mục vật tư',
  }));

  const consumables: UnifiedCatalogEntry[] = MOCK_CONSUMABLES.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    unit: c.unit,
    catalogType: 'vat-tu-tieu-hao',
    catalogLabel: 'Danh mục vật tư tiêu hao',
  }));

  const tools: UnifiedCatalogEntry[] = MOCK_TOOLS.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    unit: t.unit,
    catalogType: 'cong-cu-dung-cu',
    catalogLabel: 'Danh mục công cụ, dụng cụ',
  }));

  return [...materials, ...consumables, ...tools];
};

export const findCatalogItemByName = (rawName: string): UnifiedCatalogEntry | null => {
  const normalized = normalizeVietnameseText(rawName);
  if (!normalized) return null;

  const allItems = getAllUnifiedCatalogItems();
  const exactMatch = allItems.find((item) => normalizeVietnameseText(item.name) === normalized);
  return exactMatch || null;
};

export const generateCatalogCode = (
  catalogType: CatalogCategoryType,
  itemName: string
): string => {
  const prefix =
    catalogType === 'danh-muc-vat-tu'
      ? 'VT'
      : catalogType === 'vat-tu-tieu-hao'
      ? 'TH'
      : 'DC';

  const count =
    catalogType === 'danh-muc-vat-tu'
      ? MOCK_MATERIALS.length + 1
      : catalogType === 'vat-tu-tieu-hao'
      ? MOCK_CONSUMABLES.length + 1
      : MOCK_TOOLS.length + 1;

  const slug = toAsciiCodeSlug(itemName);
  const seq = String(count).padStart(2, '0');
  const candidate = `${prefix}-${slug}-${seq}`;

  const allCodes = new Set(getAllUnifiedCatalogItems().map((i) => i.code.toUpperCase()));
  if (!allCodes.has(candidate)) {
    return candidate;
  }
  return `${prefix}-${slug}-${String(Date.now()).slice(-3)}`;
};

export const addNewItemToCatalog = (params: {
  catalogType: CatalogCategoryType;
  name: string;
  code?: string;
  unit: string;
  category?: string;
  specifications?: string;
  brand?: string;
  origin?: string;
}): UnifiedCatalogEntry => {
  const cleanName = params.name.trim();
  const cleanUnit = params.unit.trim() || 'Cái';
  const finalCode = (params.code || '').trim() || generateCatalogCode(params.catalogType, cleanName);

  if (params.catalogType === 'danh-muc-vat-tu') {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      code: finalCode,
      name: cleanName,
      unit: cleanUnit,
      category: params.category || 'Vật tư kỹ thuật',
      specifications: params.specifications || 'Bổ sung từ nghiệp vụ lập phiếu kho',
      brand: params.brand || 'Tiêu chuẩn ST1',
      origin: params.origin || 'Việt Nam',
      standard: 'TCVN / IEC',
      active: true,
    };
    MOCK_MATERIALS.unshift(newMat);
    const mod = ALL_MODULES.find((m) => m.id === 'danh-muc-vat-tu');
    if (mod) mod.itemCount += 1;
    return {
      id: newMat.id,
      code: newMat.code,
      name: newMat.name,
      unit: newMat.unit,
      catalogType: 'danh-muc-vat-tu',
      catalogLabel: 'Danh mục vật tư',
    };
  } else if (params.catalogType === 'vat-tu-tieu-hao') {
    const newCon: MaterialItem = {
      id: `con-${Date.now()}`,
      code: finalCode,
      name: cleanName,
      unit: cleanUnit,
      category: params.category || 'Vật tư tiêu hao',
      specifications: params.specifications || 'Bổ sung từ nghiệp vụ lập phiếu kho',
      brand: params.brand || 'Tiêu chuẩn ST1',
      origin: params.origin || 'Việt Nam',
      standard: 'TCVN',
      active: true,
    };
    MOCK_CONSUMABLES.unshift(newCon);
    const mod = ALL_MODULES.find((m) => m.id === 'vat-tu-tieu-hao');
    if (mod) mod.itemCount += 1;
    return {
      id: newCon.id,
      code: newCon.code,
      name: newCon.name,
      unit: newCon.unit,
      catalogType: 'vat-tu-tieu-hao',
      catalogLabel: 'Danh mục vật tư tiêu hao',
    };
  } else {
    const newTool: ToolEquipmentItem = {
      id: `tool-${Date.now()}`,
      code: finalCode,
      name: cleanName,
      unit: cleanUnit,
      category: params.category || 'Công cụ dụng cụ',
      serialNumber: `SN-ST1-${String(Date.now()).slice(-6)}`,
      specs: params.specifications || 'Bổ sung từ nghiệp vụ lập phiếu kho',
      assignedTo: 'Kho Thủy điện Sơn Trà 1',
      status: 'Sẵn sàng',
    };
    MOCK_TOOLS.unshift(newTool);
    const mod = ALL_MODULES.find((m) => m.id === 'cong-cu-dung-cu');
    if (mod) mod.itemCount += 1;
    return {
      id: newTool.id,
      code: newTool.code,
      name: newTool.name,
      unit: newTool.unit,
      catalogType: 'cong-cu-dung-cu',
      catalogLabel: 'Danh mục công cụ, dụng cụ',
    };
  }
};

