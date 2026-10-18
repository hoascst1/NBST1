export type NavigationModule =
  | 'home'
  | 'warehouse'
  | 'maintenance'
  | 'tasks'
  | 'documents'
  | 'system';

export type WarehouseModuleId =
  | 'phieu-kho'
  | 'de-xuat-vat-tu'
  | 'kiem-ke-kho'
  | 'lich-su-xuat-nhap'
  | 'bao-cao-ton-kho'
  | 'bao-cao-nxt'
  | 'theo-doi-vat-tu'
  | 'danh-muc-vat-tu'
  | 'vat-tu-tieu-hao'
  | 'cong-cu-dung-cu'
  | 'danh-sach-kho';

export interface MaterialTrackingItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  department: string;
  supplier?: string;
  requestDate: string; // YYYY-MM-DD
  expectedDate?: string; // YYYY-MM-DD
  status: 'Đã mua' | 'Chưa mua' | 'Không mua';
  poNumber?: string;
  note?: string;
}

export type ModuleGroupId = 'inout' | 'reports' | 'settings';

export interface WarehouseModule {
  id: WarehouseModuleId;
  groupId: ModuleGroupId;
  groupName: string;
  title: string;
  description: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
  itemCount: number;
  isFavorite?: boolean;
}

export interface ModuleGroup {
  id: ModuleGroupId;
  title: string;
  code: string;
  description?: string;
  modules: WarehouseModule[];
}

export interface StockSlip {
  id: string;
  code: string;
  type: 'Nhập kho' | 'Xuất kho' | 'Chuyển kho';
  warehouseSource?: string;
  warehouseTarget?: string;
  createdAt: string;
  creator: string;
  approver: string;
  totalItems: number;
  totalValue?: string;
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Đang xử lý' | 'Đã hủy';
  note?: string;
}

export interface MaterialRequest {
  id: string;
  code: string;
  department: string;
  location: string;
  requester: string;
  approver: string;
  requestDate: string;
  requiredDate: string;
  itemCount: number;
  urgency: 'Bình thường' | 'Gấp' | 'Khẩn cấp';
  status: 'Đã phê duyệt' | 'Chờ duyệt' | 'Từ chối';
}

export interface StockHistoryItem {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  movementType: 'Nhập' | 'Xuất' | 'Điều chuyển';
  quantity: number;
  unit: string;
  warehouse: string;
  referenceSlip: string;
  performer: string;
}

export interface InventoryAudit {
  id: string;
  code: string;
  title: string;
  warehouse: string;
  auditPeriod: string;
  leadAuditor: string;
  itemsAudited: number;
  discrepanciesCount: number;
  status: 'Hoàn tất' | 'Đang kiểm kê' | 'Chờ đối chiếu';
  adjusted: boolean;
}

export interface InventoryReportItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  location: string;
  shelf: string;
  quantityOnHand: number;
  availableQuantity: number;
  reservedQuantity: number;
  minThreshold: number;
  unit: string;
  unitCost: string;
  totalValue: string;
  stockStatus: 'Đủ hàng' | 'Sắp hết' | 'Vượt định mức';
}

export interface InOutBalanceReportItem {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  openingStock: number;
  inStock: number;
  outStock: number;
  closingStock: number;
  turnoverRate: string;
}

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  specifications: string;
  brand: string;
  origin: string;
  standard: string;
  active: boolean;
}

export interface ToolEquipmentItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  serialNumber: string;
  specs: string;
  assignedTo?: string;
  status: 'Sẵn sàng' | 'Đang sử dụng' | 'Bảo trì';
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  branch: string;
  address: string;
  manager: string;
  phone: string;
  capacityPercentage: number;
  totalAisles: number;
  status: 'Đang hoạt động' | 'Tạm dừng';
}
