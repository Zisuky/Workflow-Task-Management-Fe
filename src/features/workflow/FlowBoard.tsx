import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WorkflowStep, Workflow } from './domain/workflow.entity';
import type { Task } from '../../shared/types/task';
import { workflowRepository } from './infrastructure/workflow.repository';
import { taskRepository } from '../task/infrastructure/task.repository';
import { taskApi } from '../task/infrastructure/task.client';
import { projectApi, type ProjectResponse, type ProjectDetailResponse } from '../task/infrastructure/project.client';
import { userApi } from '../user/infrastructure/user.api';
import { FlowColumn, FlowColumnConfig, BoardMinimap, SubtaskBoard } from './components';
import { AddTaskModal } from '../task';
import { useToast } from '../../ui/toast/useToast';
import ConfirmModal from '../../components/common/ConfirmModal';

const DRAG_STYLES = `
.flow-column-drag-over { outline: 2px dashed #F79E61; outline-offset: -2px; }
.flow-column-dropzone-active { background: rgba(247,158,97,0.06); }
.flow-column-empty-active { color: #F79E61; font-weight: 600; }
`;

const STATUS_PILLS = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'done',       label: 'Hoàn thành' },
  { key: 'blocked',    label: 'Bị chặn' },
  { key: 'overdue',    label: 'Quá hạn' },
  { key: 'upcoming',   label: 'Sắp đến hạn' },
];

const FlowBoard: React.FC = () => {
  const [workflows, setWorkflows]               = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [steps, setSteps]                       = useState<WorkflowStep[]>([]);
  const [projects, setProjects]                 = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedProject, setSelectedProject]   = useState<ProjectResponse | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectDetailResponse | null>(null);
  const [projectLeader, setProjectLeader]       = useState<string>('');
  const [tasks, setTasks]                       = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks]     = useState(false);
  const [isLoadingSteps, setIsLoadingSteps]     = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [filterPriority, setFilterPriority]     = useState('all');
  const [filterAssignee, setFilterAssignee]     = useState('all');
  const [statusPill, setStatusPill]             = useState('all');
  const [viewMode, setViewMode]                 = useState<'columns' | 'steps'>('columns');
  const [draggedTaskId, setDraggedTaskId]       = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen]         = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen]         = useState(false);
  const [incompleteHighlight, setIncompleteHighlight] = useState(false);
  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId]       = useState<string | null>(null);
  // Level 2 drill-down
  const [drillTask, setDrillTask]               = useState<Task | null>(null);
  const [useMock, setUseMock]                   = useState(false);
  const [portalTarget, setPortalTarget]         = useState<HTMLElement | null>(null);
  const boardContainerRef                       = useRef<HTMLDivElement>(null);
  const toast                                   = useToast();

  useEffect(() => {
    const id = 'flow-board-drag-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = DRAG_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => { setPortalTarget(document.getElementById('header-right-actions')); }, []);

  useEffect(() => {
    const init = async () => {
      const [wfs, projs] = await Promise.all([
        workflowRepository.getWorkflows(),
        projectApi.getAll().then(r => r.data?.content ?? r.data ?? []).catch(() => []),
      ]);
      setWorkflows(wfs);
      setProjects(projs);
      if (wfs.length > 0) {
        const defaultWf = wfs.find(w => w.isDefault) ?? wfs[0];
        setSelectedWorkflowId(defaultWf.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProjectId === 'all') {
      setSelectedProject(null);
      setSelectedProjectDetail(null);
      setProjectLeader('');
      const defaultWf = workflows.find(w => w.isDefault);
      if (defaultWf) setSelectedWorkflowId(defaultWf.id);
      return;
    }
    const project = projects.find(p => p.id === selectedProjectId) ?? null;
    setSelectedProject(project);
    if (project?.workflowId) setSelectedWorkflowId(project.workflowId);
    Promise.all([
      projectApi.getDetail(selectedProjectId).catch(() => null),
      projectApi.getMembers(selectedProjectId).catch(() => ({ data: [] })),
    ]).then(async ([detailRes, membersRes]) => {
      const raw = detailRes as { data?: ProjectDetailResponse } | ProjectDetailResponse | null;
      const detail = raw ? ((raw as { data?: ProjectDetailResponse }).data ?? (raw as ProjectDetailResponse)) : null;
      setSelectedProjectDetail(detail ?? null);
      const members: Array<{ userId: string }> = (membersRes as { data?: Array<{ userId: string }> })?.data ?? [];
      if (members.length > 0) {
        const user = await userApi.getById(members[0].userId).catch(() => null);
        setProjectLeader(user?.name ?? '');
      } else {
        setProjectLeader('');
      }
    });
  }, [selectedProjectId, projects, workflows]);

  useEffect(() => {
    if (!selectedWorkflowId) return;
    setIsLoadingSteps(true);
    workflowRepository.getWorkflowSteps(selectedWorkflowId).then(setSteps).finally(() => setIsLoadingSteps(false));
  }, [selectedWorkflowId]);

  useEffect(() => {
    setIsLoadingTasks(true);
    const load = async () => {
      try {
        const tasks = selectedProjectId === 'all'
          ? await taskRepository.getTasks()
          : await taskRepository.getTasksByProject(selectedProjectId);
        setTasks(tasks);
      } catch {''} finally {
        setIsLoadingTasks(false);
      }
    };
    load();
  }, [selectedProjectId, useMock]);

  const filteredTasks = tasks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(t.name.toLowerCase().includes(q) || (t.project ?? '').toLowerCase().includes(q) || (t.assignee ?? '').toLowerCase().includes(q))) return false;
    }
    if (filterPriority !== 'all' && t.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (filterAssignee !== 'all' && !(t.assignee ?? '').toLowerCase().includes(filterAssignee.toLowerCase())) return false;
    if (statusPill === 'processing') { const c = (t.status ?? '').toLowerCase(); if (c === 'done' || c === 'hoàn thành') return false; }
    if (statusPill === 'done') { const c = (t.status ?? '').toLowerCase(); if (c !== 'done' && c !== 'hoàn thành') return false; }
    if (statusPill === 'overdue') { if (!t.endDate || new Date(t.endDate) >= new Date()) return false; }
    if (statusPill === 'upcoming') { if (!t.endDate) return false; const diff = new Date(t.endDate).getTime() - Date.now(); if (diff < 0 || diff > 3 * 24 * 60 * 60 * 1000) return false; }
    return true;
  });

  const assigneeOptions = Array.from(new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'Chưa có')));

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const targetStep = steps.find(s => s.id === targetStepId);
    if (!targetStep) return;
    const task = tasks.find(t => t.id === draggedTaskId);
    if (!task || task.statusId === targetStep.statusId) { setDraggedTaskId(null); return; }
    const prevTasks = tasks;
    setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, statusId: targetStep.statusId, status: targetStep.name as Task['status'] } : t));
    setDraggedTaskId(null);
    try {
      await taskApi.updateStatus(draggedTaskId, targetStep.statusId);
      toast.success(targetStep.isFinal ? `✅ Đã chuyển sang "${targetStep.name}" — Dự án đã hoàn thành!` : `Đã chuyển sang "${targetStep.name}"`);
    } catch (err: unknown) {
      setTasks(prevTasks);
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr?.response?.status === 422) {
        toast.error(`⚠️ ${axiosErr.response.data?.message ?? 'Vẫn còn task chưa hoàn thành trong dự án.'}`);
        setIncompleteHighlight(true);
        setTimeout(() => setIncompleteHighlight(false), 3000);
      } else {
        toast.error('Cập nhật trạng thái thất bại');
      }
    }
  }, [draggedTaskId, steps, tasks, toast]);

  const handlePin = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    try {
      task.isPinned ? await taskApi.unpin(taskId) : await taskApi.pin(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isPinned: !t.isPinned } : t));
    } catch (err) {
      console.error('[Pin/Unpin task] Thao tác thất bại:', err);
      toast.error('Thao tác ghim thất bại');
    }
  }, [tasks, toast]);

  const handleDelete = useCallback((taskId: string) => {
    setDeleteTargetId(taskId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await taskRepository.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Đã xóa công việc');
    } catch { toast.error('Xóa thất bại'); }
  }, [deleteTargetId, toast]);

  // Click on task card → drill down to Level 2 (SubtaskBoard)
  const handleCardClick = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) setDrillTask(task);
  }, [tasks]);

  const handleAddTaskSuccess = useCallback(async (input: Parameters<typeof taskRepository.addTask>[0]) => {
    try {
      const newTask = await taskRepository.addTask(input);
      setTasks(prev => [newTask, ...prev]);
      setIsAddTaskOpen(false);
      toast.success('Tạo công việc thành công');
    } catch { toast.error('Tạo công việc thất bại'); }
  }, [toast]);

  const handleConfigSave = useCallback((newSteps: WorkflowStep[]) => {
    setSteps(newSteps);
    toast.success('Đã lưu cấu hình workflow');
  }, [toast]);

  const handleReset = () => { setSearchQuery(''); setFilterPriority('all'); setFilterAssignee('all'); setStatusPill('all'); };

  const toolbarContent = (
    <div className="flex items-center gap-2">
      <button onClick={() => setIsAddTaskOpen(true)} className="h-9 px-4 text-sm bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white rounded-lg font-medium hover:from-[#e88d50] hover:to-[#e07d3a] transition-all">
        + Tạo công việc
      </button>
      <button onClick={() => setIsConfigOpen(true)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
        Cấu hình
      </button>
      <button onClick={() => setUseMock(v => !v)} className={`h-9 px-3 text-xs rounded-lg border font-medium transition-colors ${useMock ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`}>
        Mock: {useMock ? 'ON' : 'OFF'}
      </button>
    </div>
  );

  return (
    <div className="flow-board-container relative flex flex-col h-full">
      {portalTarget && createPortal(toolbarContent, portalTarget)}

      {/* ── Level 2: SubtaskBoard drill-down ─────────────────────────────────── */}
      {drillTask ? (
        <SubtaskBoard
          parentTask={drillTask}
          projectName={selectedProject?.name ?? drillTask.project ?? 'Dự án'}
          onBack={() => setDrillTask(null)}
        />
      ) : (
        <>
          {/* ── Filter bar ──────────────────────────────────────────────────── */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-white flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Dự án</span>
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="h-8 py-1 px-2 text-sm border border-gray-200 rounded-lg bg-white min-w-[130px]">
                  <option value="all">Tất cả dự án</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">Ưu tiên</span>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="h-8 py-1 px-2 text-sm border border-gray-200 rounded-lg bg-white min-w-[100px]">
                  <option value="all">Tất cả</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="highest">Cao nhất</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">Người nhận</span>
                <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="h-8 py-1 px-2 text-sm border border-gray-200 rounded-lg bg-white min-w-[120px]">
                  <option value="all">Tất cả</option>
                  {assigneeOptions.map(a => <option key={a} value={a!}>{a}</option>)}
                </select>
              </div>
              <div className="relative flex-1 min-w-[200px] max-w-xs ml-auto">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm công việc, dự án, người nhận..." className="w-full h-8 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/40 focus:border-[#F79E61]" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {STATUS_PILLS.map(pill => (
                  <button key={pill.key} onClick={() => setStatusPill(pill.key)} className={`h-7 px-3 rounded-full text-xs font-medium transition-all ${statusPill === pill.key ? 'bg-[#F79E61] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {pill.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="h-7 px-3 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Reset</button>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button onClick={() => setViewMode('columns')} className={`h-7 px-3 text-xs font-medium transition-colors ${viewMode === 'columns' ? 'bg-[#F79E61] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Columns</button>
                  <button onClick={() => setViewMode('steps')} className={`h-7 px-3 text-xs font-medium transition-colors ${viewMode === 'steps' ? 'bg-[#F79E61] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Steps</button>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">Hiện thị {filteredTasks.length}/{tasks.length} công việc</span>
              </div>
            </div>
          </div>

          {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
          <div className="px-4 pt-2 flex items-center gap-1.5 text-sm">
            <button onClick={() => setSelectedProjectId('all')} className={`text-gray-500 hover:text-[#F79E61] transition-colors ${selectedProjectId === 'all' ? 'font-semibold text-gray-800' : ''}`}>Tất cả</button>
            {selectedProject && (
              <>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="font-semibold text-[#F79E61]">{selectedProject.name}</span>
              </>
            )}
          </div>

          {/* ── Project banner ───────────────────────────────────────────────── */}
          {selectedProject && (
            <div className="mx-4 mt-2 mb-1 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => setSelectedProjectId('all')} className="flex items-center gap-1.5 h-8 px-3 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Quay lại
                  </button>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base leading-tight">{selectedProject.name}</h2>
                    {selectedProject.description && <p className="text-xs text-gray-500 mt-0.5">{selectedProject.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
                    <span className="font-medium">{selectedProject.name}</span>
                  </div>
                  {projectLeader && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span>{projectLeader}</span>
                    </div>
                  )}
                  {selectedProjectDetail?.endDate && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Hạn: <strong className="text-gray-700">{new Date(selectedProjectDetail.endDate).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${selectedProject.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : selectedProject.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedProject.status === 'COMPLETED' ? '✅ Hoàn thành' : selectedProject.status === 'ON_HOLD' ? '⏸ Tạm dừng' : '🔄 Đang thực hiện'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isLoadingSteps ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
            </div>
          ) : (
            <div ref={boardContainerRef} className="flow-board pt-3 flex-1">
              {steps.map(step => (
                <FlowColumn
                  key={step.id}
                  step={step}
                  tasks={isLoadingTasks ? [] : filteredTasks}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onEdit={handleCardClick}
                  onCardClick={handleCardClick}
                  highlightIncomplete={incompleteHighlight && !step.isFinal}
                />
              ))}
              {steps.length === 0 && (
                <div className="flex items-center justify-center w-full h-48 text-gray-400">Chọn một workflow để hiển thị board</div>
              )}
            </div>
          )}

          <BoardMinimap containerRef={boardContainerRef} columnCount={steps.length} />

          <FlowColumnConfig isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} workflowId={selectedWorkflowId} steps={steps} onSave={handleConfigSave} />
          <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onSubmit={handleAddTaskSuccess} defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined} />
        </>
      )}

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Bạn xác nhận xóa?"
        message="Hành động này không thể hoàn tác."
        confirmLabel="Có"
        cancelLabel="Không"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default FlowBoard;
