# Phân Hệ Quản Lý Kho Vận - Hệ Thống 5F ERP

Xây dựng giao diện và cấu trúc chức năng chuyên sâu cho phân hệ "Kho vận" (Warehouse & Logistics) thuộc hệ thống Quản lý nội bộ doanh nghiệp 5F. Ứng dụng cung cấp bảng điều khiển module dạng thẻ (Card-based UI) phân cấp khoa học, thanh điều hướng sidebar chuẩn ERP, thanh topbar tích hợp đồng hồ thời gian thực và quản lý tài khoản, cùng màn hình tương tác chi tiết cho từng nghiệp vụ kho.

## User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các định hướng thiết kế và nghiệp vụ đã được xác nhận để tiến hành triển khai:

- **Cơ chế tương tác khi chọn thẻ module**: Khi bấm vào bất kỳ thẻ chức năng nào (như Phiếu kho, Tồn kho, Kiểm kê, Danh mục vật tư...), hệ thống sẽ chuyển sang màn hình làm việc chi tiết của module đó kèm thanh breadcrumb quay lại, bảng dữ liệu mẫu thực tế, bộ lọc trạng thái và form mẫu nghiệp vụ.
- **Phong cách & Nhận diện thương hiệu (5F ERP)**: Sử dụng hệ màu Xanh dương doanh nghiệp chuyên nghiệp (Corporate Blue `#1E40AF` / `#2563EB`) kết hợp đường nét thanh lịch, vạch chỉ báo nhóm dọc (Vertical Accent Rule), thẻ bo góc hiện đại không lạm dụng viền đậm hoặc màu mè AI slop.
- **Dữ liệu & Tác vụ**: Cung cấp khung giao diện hoàn chỉnh, thanh tìm kiếm module tức thời bằng tên hoặc mô tả, cùng bộ dữ liệu tĩnh thực tế (mã phiếu, ngày tạo, kho lưu, người lập, số lượng, trạng thái duyệt) chuẩn quy trình doanh nghiệp Việt Nam.

---

## 1. Overview & Core Concept

- **Mục tiêu**: Cung cấp một cổng điều hành kho vận trực quan, chuẩn hóa quy trình 5S/5F cho doanh nghiệp sản xuất, dịch vụ kỹ thuật hoặc thương mại.
- **Đối tượng người dùng**: Thủ kho, nhân viên kế toán kho, quản lý kỹ thuật và ban giám đốc (tài khoản mẫu: Nguyễn Hữu Hòa - Quản trị viên hệ thống).
- **Giá trị cốt lõi**:
  - Phân loại rõ ràng 3 phân nhóm chức năng: **Nhập xuất kho**, **Báo cáo thống kê**, **Thiết lập và danh mục**.
  - Tìm kiếm nhanh chóng module cần thao tác chỉ trong 1 thao tác gõ phím.
  - Chuyển đổi linh hoạt giữa trang Tổng quan phân hệ (Module Hub) và Màn hình chi tiết nghiệp vụ (Detail View).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Truy cập Tổng quan Kho vận**:
   - Sidebar bên trái làm nổi bật phân hệ "Kho" đang hoạt động (kèm các phân hệ Trang chủ, Sửa chữa, Công việc, Tài liệu, Hệ thống).
   - Topbar hiển thị breadcrumb `Trang chủ > Kho vận`, đồng hồ điện tử cập nhật từng giây (`HH:mm:ss - DD/MM/YYYY`), chuông thông báo có badge đếm số lượng việc cần duyệt, avatar và chức vụ của `Nguyễn Hữu Hòa - Admin`.
2. **Tìm kiếm & Lọc module**:
   - Nhập từ khóa vào ô `"Tìm module theo tên hoặc mô tả..."` (ví dụ: gõ "kiểm kê", "vật tư", "phiếu").
   - Các nhóm thẻ và thẻ con tự động lọc real-time, làm nổi bật kết quả phù hợp.
3. **Mở Chi tiết Nghiệp vụ Module**:
   - Nhấp vào một thẻ (ví dụ `Phiếu kho` hoặc `Kiểm kê kho`).
   - Giao diện chuyển mượt mà sang chế độ chi tiết với:
     - Header nghiệp vụ: Tiêu đề, mô tả, nút "Quay lại danh sách module", nút "Tạo mới / Thao tác".
     - Thanh thống kê nhanh (KPI mini cards: Tổng số, Chờ duyệt, Hoàn thành, Cần lưu ý).
     - Bộ lọc tìm kiếm theo mã, ngày, kho bãi.
     - Bảng dữ liệu hiển thị rõ ràng với phông số liệu `tabular-nums`, trạng thái duyệt được định dạng chuẩn mực.
     - Modal form xem trước phiếu nhập/xuất hoặc thông tin vật tư.

### Visual Identity & Theme Tokens
- **Chủ đạo**: Corporate Blue (`text-blue-700`, `bg-blue-600`, `border-blue-500`).
- **Nền & Bề mặt**: Nền canvas xám nhẹ tinh tế (`bg-slate-50`), bề mặt thẻ màu trắng (`bg-white`), viền hairline (`border-slate-200/80`).
- **Đường kẻ nhóm (Vertical Accent Rule)**: Mỗi nhóm chức năng có đường kẻ dọc màu xanh dương (`border-l-4 border-blue-600` hoặc vạch phân cách màu xanh đặc trưng) giúp phân tách vùng thị giác rõ nét.
- **Typography**: Phông chữ không chân hiện đại kết hợp số liệu dạng tabular (`font-sans` cho tiêu đề và nội dung, `font-mono tabular-nums` cho mã phiếu, số lượng, ngày tháng).
- **Biểu tượng (Lucide Icons)**: Mỗi thẻ chức năng sở hữu biểu tượng minh họa ngữ nghĩa chuyên biệt (Box, ClipboardList, History, ClipboardCheck, BarChart3, TrendingUp, Layers, Wrench, Warehouse, FileText...).

---

## 3. Key Product Decisions & Trade-Offs

- **Cấu trúc Thẻ 3 Nhóm Chức Năng**:
  - **Nhóm A: Nhập xuất kho**: Phiếu kho (Nhập/Xuất/Chuyển), Phiếu đề xuất vật tư (Theo nơi, người lập, người duyệt), Lịch sử xuất nhập (Theo ngày/tháng/năm), Kiểm kê kho (Đối chiếu & điều chỉnh).
  - **Nhóm B: Báo cáo**: Tồn kho (Theo sản phẩm & vị trí kho), Báo cáo nhập xuất tồn (Theo kỳ).
  - **Nhóm C: Thiết lập và danh mục**: Danh mục vật tư, Danh mục vật tư tiêu hao, Danh mục công cụ dụng cụ, Danh sách kho chi nhánh & vị trí.
- **Phân tách trạng thái Router nhẹ trong Component**: Sử dụng state điều hướng cục bộ (`activeModuleId: null | 'stock-slips' | 'material-requests' | ...`) giúp chuyển đổi tức thì, giữ trạng thái mượt mà mà không phụ thuộc cấu hình server phức tạp.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Root (src/App.tsx)                          │
├───────────────────┬────────────────────────────────────────────────────┤
│                   │                    Top Bar                         │
│     Sidebar       │  Breadcrumb | Live Clock | Notifications | User    │
│   (5F Nav Menu)   ├────────────────────────────────────────────────────┤
│   - Trang chủ     │                Search & Action Bar                 │
│   - Kho (Active)  │        [ Tìm module theo tên hoặc mô tả... ]        │
│   - Sửa chữa      ├────────────────────────────────────────────────────┤
│   - Công việc     │                Main Content Area                   │
│   - Tài liệu      │   ┌──────────────────────────────────────────────┐ │
│   - Hệ thống      │   │ Chế độ 1: Module Hub (Cards Grid 3 Groups)  │ │
│                   │   │  A. Nhập xuất kho (4 thẻ)                    │ │
│                   │   │  B. Báo cáo kho (2 thẻ)                      │ │
│                   │   │  C. Thiết lập & Danh mục (4 thẻ)             │ │
│                   │   ├──────────────────────────────────────────────┤ │
│                   │   │ Chế độ 2: Module Detail View (Bảng & Dữ liệu)│ │
│                   │   │  KPIs, Bộ lọc, Bảng dữ liệu mẫu, Modal Form  │ │
│                   │   └──────────────────────────────────────────────┘ │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Module Registry & Mock Entities
- Cấu trúc dữ liệu tĩnh chuẩn xác phản ánh đầy đủ các nghiệp vụ được yêu cầu:
  - Mã phiếu (VD: `NK-2026-001`, `XK-2026-042`, `DX-VT-109`, `KK-K1-03`)
  - Kho nguồn, Kho đích, Vị trí kệ
  - Người đề xuất, Người duyệt, Bộ phận yêu cầu
  - Số lượng tồn, số lượng khả dụng, đơn vị tính (Cái, Bộ, Mét, Thùng, Kg)
  - Thông số kỹ thuật cho vật tư & công cụ dụng cụ

---

## Verification & Compilation Plan
1. Viết mã nguồn hoàn chỉnh với đầy đủ các tương tác, biểu tượng, animation và responsive.
2. Kiểm tra bằng `compile_applet` để đảm bảo không có lỗi biên dịch TypeScript hay Tailwind CSS.
3. Cập nhật `metadata.json` và `index.html` với tiêu đề tiếng Việt chuẩn cho phân hệ Kho vận 5F ERP.
