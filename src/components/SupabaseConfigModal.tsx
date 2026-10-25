import React, { useState } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  UploadCloud,
  ExternalLink,
  Code2,
} from 'lucide-react';
import {
  getCurrentSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  fetchPhieuKhoFromSupabase,
  insertPhieuKhoToSupabase,
  SUPABASE_PHIEU_KHO_SQL,
} from '../lib/supabase';
import { MOCK_STOCK_SLIPS } from '../data/warehouseData';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
  onShowToast,
}) => {
  const currentConfig = getCurrentSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng điền đầy đủ Supabase URL và Anon Public Key.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Temporarily save to test
    saveSupabaseConfig(url, key);

    const { data, error } = await fetchPhieuKhoFromSupabase();
    setIsTesting(false);

    if (error) {
      if (error.includes('does not exist') || error.includes('42P01') || error.includes('Phieu_kho')) {
        setTestResult({
          success: false,
          message:
            'Kết nối Supabase thành công nhưng chưa tìm thấy bảng "Phieu_kho". Bạn hãy chạy mã SQL bên dưới để tạo bảng!',
        });
        setShowSql(true);
      } else {
        setTestResult({
          success: false,
          message: `Lỗi kết nối Supabase: ${error}`,
        });
      }
    } else {
      setTestResult({
        success: true,
        message: `Kết nối thành công tới bảng "Phieu_kho"! Hiện có ${data?.length || 0} bản ghi.`,
        count: data?.length || 0,
      });
      onShowToast('Đã kết nối thành công với bảng Phieu_kho trong Supabase!');
      onConnectionSuccess();
    }
  };

  const handleSeedMockData = async () => {
    setIsSeeding(true);
    let successCount = 0;
    for (const slip of MOCK_STOCK_SLIPS) {
      const res = await insertPhieuKhoToSupabase({
        code: slip.code,
        type: slip.type,
        createdAt: slip.createdAt,
        creator: slip.creator,
        note: slip.note,
        status: slip.status,
        warehouseSource: slip.warehouseSource,
        warehouseTarget: slip.warehouseTarget,
        approver: slip.approver,
        totalItems: slip.totalItems,
      });
      if (res.success) successCount++;
    }
    setIsSeeding(false);
    onShowToast(`Đã đồng bộ ${successCount}/${MOCK_STOCK_SLIPS.length} phiếu kho mẫu vào Supabase!`);
    onConnectionSuccess();
    setTestResult({
      success: true,
      message: `Đã nạp thành công ${successCount} phiếu kho mẫu vào bảng Phieu_kho!`,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_PHIEU_KHO_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    onShowToast('Đã sao chép mã SQL tạo bảng Phieu_kho vào bộ nhớ tạm!');
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult(null);
    onShowToast('Đã xóa cấu hình kết nối Supabase, sử dụng dữ liệu mặc định.');
    onConnectionSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase font-mono">
                Cơ sở dữ liệu đám mây · Supabase PostgreSQL
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Kết nối dữ liệu bảng Phieu_kho
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            Hệ thống hỗ trợ kết nối trực tiếp với bảng <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700">Phieu_kho</code> trong cơ sở dữ liệu Supabase của Nhà máy Thủy điện Sơn Trà 1 để đồng bộ phiếu nhập, xuất và chuyển kho theo thời gian thực.
          </p>

          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400">
                Lấy tại Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400">
                Khóa công khai anon/public (an toàn cho ứng dụng web với RLS)
              </span>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="font-semibold">{testResult.message}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra & Kết nối'}</span>
                </button>

                {(currentConfig.url || currentConfig.key) && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ngắt kết nối
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showSql ? 'Ẩn câu lệnh SQL' : 'Xem SQL tạo bảng Phieu_kho'}</span>
              </button>
            </div>
          </form>

          {/* Seed button if connected */}
          {testResult?.success && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Nạp dữ liệu mẫu vào Supabase</h4>
                <p className="text-[11px] text-slate-500">
                  Nạp nhanh 7 phiếu kho mẫu của Thủy điện Sơn Trà 1 vào bảng <code className="font-mono font-semibold">Phieu_kho</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedMockData}
                disabled={isSeeding}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Đang nạp...' : 'Nạp dữ liệu mẫu'}</span>
              </button>
            </div>
          )}

          {/* SQL Script Viewer */}
          {showSql && (
            <div className="mt-3 bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] space-y-2 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-semibold text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Mã SQL tạo bảng Phieu_kho trong Supabase
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto text-emerald-300 leading-relaxed max-h-48">
                {SUPABASE_PHIEU_KHO_SQL}
              </pre>
              <div className="text-[10px] text-slate-400 font-sans pt-1">
                Gợi ý: Mở <strong>Supabase Dashboard &gt; SQL Editor &gt; New query</strong>, dán đoạn mã trên và nhấn <strong>Run</strong> để tự động tạo bảng.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Bạn cũng có thể cấu hình qua file</span>
            <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800 text-[10px]">.env</code>
            <span>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
