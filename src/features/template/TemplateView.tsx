import React, { useState, useEffect } from 'react';
import { workflowApi, type WorkflowStatusDetail } from '../workflow/infrastructure/workflow.client';
import type { Workflow } from '../workflow/domain/workflow.entity';
import { useToast } from '../../ui/toast';
import { useFeatures } from '../../shared/hooks/useFeatures';


const toCode = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
};

const toDescription = (wf: Workflow): string =>
  wf.description || `Workflow: ${wf.name}`;

const fetchWorkflows = async (): Promise<Workflow[]> => {
  const res = await workflowApi.getAll() as unknown;
  const raw = res as { data?: unknown };
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  return list as Workflow[];
};

// ─── Component ────────────────────────────────────────────────────────────────
const TemplateView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  const toast = useToast();

  // Feature-based permission check — calls GET /api/features/active
  const { can } = useFeatures();
  const canCreate = can('WORKFLOW_CREATE');
  const canDelete = can('WORKFLOW_DELETE');
  const canUpdate = can('WORKFLOW_UPDATE');

  const refresh = async () => {
    setIsLoading(true);
    try {
      const wfs = await fetchWorkflows();
      setWorkflows(wfs);
      // Load stage counts for all workflows in parallel
      const counts = await Promise.all(
        wfs.map(async wf => {
          try {
            const res = await workflowApi.getStatusDetails(wf.id) as unknown;
            const raw = res as { data?: WorkflowStatusDetail[] } | WorkflowStatusDetail[];
            const list: WorkflowStatusDetail[] = Array.isArray(raw) ? raw
              : Array.isArray((raw as { data?: WorkflowStatusDetail[] }).data)
              ? (raw as { data: WorkflowStatusDetail[] }).data : [];
            return { id: wf.id, count: list.length };
          } catch {
            return { id: wf.id, count: 0 };
          }
        })
      );
      setStageCounts(Object.fromEntries(counts.map(c => [c.id, c.count])));
    } catch {
      toast.error('Không thể tải danh sách workflow');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = workflows.filter(wf =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wf.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = async (wf: Workflow) => {
    if (!canUpdate) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }
    try {
      await workflowApi.setAsDefault(wf.id);
      await refresh();
      toast.success(`Đã đặt "${wf.name}" làm workflow mặc định`);
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (wf: Workflow) => {
    if (!canDelete) {
      toast.error('Bạn không có quyền xóa workflow');
      return;
    }
    if (!window.confirm(`Xóa workflow "${wf.name}"?`)) return;
    setDeletingId(wf.id);
    try {
      await workflowApi.delete(wf.id);
      await refresh();
      toast.success(`Đã xóa "${wf.name}"`);
    } catch {
      toast.error('Xóa thất bại — workflow mặc định không thể xóa');
    } finally {
      setDeletingId(null);
    }
  };

  // Column layout: admin gets extra delete column
  const gridCols = canDelete
    ? 'grid-cols-[1fr_100px_100px_120px_180px]'
    : 'grid-cols-[1fr_100px_100px_120px_140px]';

  return (
    <div>
      {/* Search + count */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative max-w-md w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm template..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61]"
          />
        </div>
        <span className="text-sm text-gray-500">Tìm thấy {filtered.length} template</span>
      </div>

      {/* Role-based info banner — shown only when user cannot create */}
      {!canCreate && (
        <div className="mb-5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          Bạn chỉ có quyền xem và dùng template. Liên hệ admin để tạo mới.
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Không tìm thấy template phù hợp</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`grid ${gridCols} gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide`}>
            <span>Template</span>
            <span className="text-center">Giai đoạn</span>
            <span className="text-center">Cập nhật</span>
            <span className="text-center">Trạng thái</span>
            <span className="text-center">Hành động</span>
          </div>

          {/* Rows */}
          {filtered.map(wf => {
            const code = toCode(wf.name);
            const desc = toDescription(wf);
            const updatedAt = wf.createdAt
              ? new Date(wf.createdAt).toLocaleDateString('vi-VN')
              : '—';

            return (
              <div
                key={wf.id}
                className={`grid ${gridCols} gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0 hover:bg-orange-50/30 transition-colors items-center`}
              >
                {/* Name + description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {code}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{wf.name}</p>
                    <p className="text-xs text-gray-500 truncate">{desc}</p>
                  </div>
                </div>

                {/* Stage count */}
                <div className="text-center text-sm text-gray-700 font-medium">
                  {stageCounts[wf.id] !== undefined
                    ? <span className="inline-flex items-center gap-1">
                        <span className="font-semibold">{stageCounts[wf.id]}</span>
                        <span className="text-gray-400 text-xs">giai đoạn</span>
                      </span>
                    : '—'}
                </div>

                {/* Updated at */}
                <div className="text-center text-sm text-gray-600">{updatedAt}</div>

                {/* Status */}
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    wf.isDefault ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {wf.isDefault ? 'Đang dùng' : 'Không dùng'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-center items-center gap-2">
                  {/* "Dùng template" — requires WORKFLOW_UPDATE */}
                  <button
                    onClick={() => handleUseTemplate(wf)}
                    disabled={wf.isDefault || !canUpdate}
                    title={!canUpdate ? 'Bạn không có quyền thực hiện thao tác này' : undefined}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      wf.isDefault || !canUpdate
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#F79E61] hover:bg-[#e88d50] text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {wf.isDefault ? 'Đang dùng' : 'Dùng template'}
                  </button>

                  {/* Delete — requires WORKFLOW_DELETE */}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(wf)}
                      disabled={deletingId === wf.id || wf.isDefault}
                      title={wf.isDefault ? 'Không thể xóa workflow đang dùng' : 'Xóa'}
                      className={`p-1.5 rounded-lg transition-all ${
                        wf.isDefault
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplateView;
