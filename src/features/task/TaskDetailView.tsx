import React, { useState, useEffect, useCallback } from 'react';
import type { Task } from '../../shared/types/task';
import { commentApi, type Comment } from '../task/infrastructure/comment.client';
import { historyApi, type HistoryItem } from '../task/infrastructure/history.client';
import { taskGroupApi, type TaskGroup } from '../task/infrastructure/taskGroup.client';
import { taskPriorityApi, type TaskPriorityResponse } from '../task/infrastructure/taskPriority.client';
import { projectApi } from '../task/infrastructure/project.client';
import { userApi } from '../user/infrastructure/user.api';
import apiClient from '../../shared/http/apiClient';
import { useFeatures } from '../../shared/hooks/useFeatures';
import { TASK_PERMISSIONS } from './config/taskPermissions';

export interface TaskUpdateData {
  priority: Task['priority'];
  status: Task['status'];
  group: Task['group'];
  description: string;
  taskGroupId?: string;
  statusId?: string;
  priorityId?: string;
}

interface WorkflowStage {
  id: string;       // workflow_status.id
  statusId: string; // task_status.id — dùng để update
  name: string;     // task_status.name — hiển thị
  sortOrder: number;
  isFinal: boolean;
}

interface TaskDetailViewProps {
  task: Task;
  onUpdate?: (data: TaskUpdateData) => void;
  onDelete?: () => void;
}
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 2h9a2 2 0 0 1 2 2z" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 9l-7 7-7-7" />
  </svg>
);
const formatDate = (dateInput: string | number[] | unknown): string => {
  if (!dateInput) return 'Chưa xác định';

  // Handle array format from Jackson: [2026, 5, 1, 0, 0, 0]
  if (Array.isArray(dateInput)) {
    const [year, month, day] = dateInput as number[];
    if (!year || !month || !day) return 'Chưa xác định';
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  const dateString = String(dateInput);
  if (!dateString.trim()) return 'Chưa xác định';

  // Handle ISO string: "2026-05-01T00:00:00" or "2026-05-01T00:00:00.000Z"
  if (dateString.includes('T') || (dateString.includes('-') && !dateString.includes('/'))) {
    // Split on T to get date part only — avoids timezone off-by-one
    const datePart = dateString.split('T')[0]; // "2026-05-01"
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
  }

  // Handle "DD/MM/YYYY" or "DD/MM/YYYY HH:mm:ss"
  const dateParts = dateString.split(' ')[0].split('/');
  if (dateParts.length === 3) {
    const [day, month, year] = dateParts.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
  }

  return 'Chưa xác định';
};
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};
export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [description, setDescription] = useState(task.description || '');

  // Store IDs for type and group
  const [selectedGroupId, setSelectedGroupId] = useState(task.taskGroupId || '');
  // statusId UUID — dùng khi gọi API update
  const [selectedStatusId, setSelectedStatusId] = useState(task.statusId || '');
  // priorityId UUID — dùng khi gọi API update
  const [selectedPriorityId, setSelectedPriorityId] = useState(task.priorityId || '');

  // Lists from API
  const [groupsList, setGroupsList] = useState<TaskGroup[]>([]);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [prioritiesList, setPrioritiesList] = useState<TaskPriorityResponse[]>([]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // userId → fullName map
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());



  // Permission gates — reuses cached result from useFeatures
  const { can, isLoading: featuresLoading } = useFeatures();
  const canUpdate = !featuresLoading && can(TASK_PERMISSIONS.UPDATE);
  const canDelete = !featuresLoading && can(TASK_PERMISSIONS.DELETE);

  // Load comments when tab is active
  useEffect(() => {
    if (activeTab === 'comments' && comments.length === 0) {
      loadComments();
    }
  }, [activeTab]);

  // Load history when tab is active
  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'logs') && history.length === 0) {
      loadHistory();
    }
  }, [activeTab]);

  // Load groups, priorities, and workflow stages on mount
  useEffect(() => {
    const loadLists = async () => {
      try {
        // Load ALL groups (global + project-specific) and priorities
        const [allGroupsRes, prioritiesRes, ...projectGroupsRes] = await Promise.all([
          taskGroupApi.getAll(),
          taskPriorityApi.getActive(),
          ...(task.projectId ? [taskGroupApi.getByProject(task.projectId)] : []),
        ]);
        // Merge global + project groups, deduplicate by id
        const allGroups: TaskGroup[] = allGroupsRes.data || [];
        const projectGroups: TaskGroup[] = projectGroupsRes[0]?.data || [];
        const mergedMap = new Map<string, TaskGroup>();
        [...allGroups, ...projectGroups].forEach(g => mergedMap.set(g.id, g));
        setGroupsList(Array.from(mergedMap.values()));
        const priorities: TaskPriorityResponse[] = prioritiesRes.data || [];
        setPrioritiesList(priorities);

        // Load workflow stages từ workflow của project
        if (task.projectId) {
          try {
            const workflowRes = await projectApi.getWorkflow(task.projectId) as any;
            // WorkflowController trả về Workflow trực tiếp (không wrap ApiResponse)
            const workflow = workflowRes?.data ?? workflowRes;
            if (workflow?.id) {
              // GET /api/workflows/{workflowId}/status/details → TaskStatus[]
              const stagesRes = await apiClient.get(
                `/workflows/${workflow.id}/status/details`
              ) as any;
              const taskStatuses: Array<{ id: string; name: string; code: string; sortOrder: number }> =
                Array.isArray(stagesRes) ? stagesRes : (stagesRes?.data || []);
              const stages: WorkflowStage[] = taskStatuses
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map(ts => ({
                  id: ts.id,
                  statusId: ts.id,
                  name: ts.name,
                  sortOrder: ts.sortOrder ?? 0,
                  isFinal: false,
                }));
              setWorkflowStages(stages);
            }
          } catch {
            // Fallback: dropdown hiển thị trạng thái hiện tại của task
          }
        }
      } catch (err) {
        console.error('Failed to load lists:', err);
      }
    };
    loadLists();
  }, [task.projectId]);



  // Batch-resolve all userIds from comments + history
  const resolveAllUserIds = useCallback(async (commentsList: Comment[], historyList: HistoryItem[]) => {
    const ids = new Set<string>();
    commentsList.forEach(c => { if (c.userId) ids.add(c.userId); });
    historyList.forEach(h => { if (h.userId) ids.add(h.userId); });
    const newMap = new Map(userNames);
    await Promise.all(
      Array.from(ids).filter(id => !newMap.has(id)).map(async (id) => {
        try {
          const user = await userApi.getById(id);
          newMap.set(id, user?.name || id);
        } catch {
          newMap.set(id, id);
        }
      })
    );
    setUserNames(newMap);
  }, [userNames]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await commentApi.getByTaskId(task.id);
      const list = res.data || [];
      setComments(list);
      resolveAllUserIds(list, history);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await historyApi.getByObjectId('TASK', task.id);
      const list = res.data || [];
      setHistory(list);
      resolveAllUserIds(comments, list);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await commentApi.create(task.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const selectedGroup = groupsList.find(g => g.id === selectedGroupId);

  const handleSave = () => {
    if (onUpdate) {
      const selectedStage = workflowStages.find(s => s.statusId === selectedStatusId);
      const statusDisplay = selectedStage?.name || status;
      const selectedPriority = prioritiesList.find(p => p.id === selectedPriorityId);
      const priorityDisplay = selectedPriority
        ? (selectedPriority.code.charAt(0) + selectedPriority.code.slice(1).toLowerCase()) as Task['priority']
        : priority;
      onUpdate({
        priority: priorityDisplay,
        status: statusDisplay as Task['status'],
        group: (selectedGroup?.name || task.group) as Task['group'],
        description,
        taskGroupId: selectedGroupId || task.taskGroupId,
        statusId: selectedStatusId || task.statusId,
        priorityId: selectedPriorityId || task.priorityId,
      });
    }
  };
  return (
    <div className="task-detail-page">
      <div className="task-detail-content">
        {/* Left Panel - Form */}
        <div className="task-detail-form-panel">
          <div className="task-detail-card">
            {/* Card Header */}
            <div className="card-header">
              <h1 className="task-title-text">{task.name}</h1>
              <div className="action-buttons">
                {canUpdate && (
                  <button
                    onClick={handleSave}
                    className="update-button"
                  >
                    <EditIcon />
                    <span>Cập nhật</span>
                  </button>
                )}
                {canDelete && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={onDelete}
                      className="delete-button"
                      title="Xóa công việc"
                    >
                      <TrashIcon />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Form Fields */}
            <div className="form-fields">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Mức độ ưu tiên</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedPriorityId}
                      onChange={(e) => {
                        setSelectedPriorityId(e.target.value);
                        const p = prioritiesList.find(x => x.id === e.target.value);
                        if (p) setPriority((p.code.charAt(0) + p.code.slice(1).toLowerCase()) as Task['priority']);
                      }}
                      className="field-select"
                    >
                      {prioritiesList.length === 0 && (
                        <option value={task.priorityId}>{task.priority}</option>
                      )}
                      {prioritiesList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">Trạng thái hiện tại</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedStatusId}
                      onChange={(e) => {
                        setSelectedStatusId(e.target.value);
                        const stage = workflowStages.find(s => s.statusId === e.target.value);
                        if (stage) setStatus(stage.name as Task['status']);
                      }}
                      className="field-select"
                    >
                      {/* Fallback: nếu workflow chưa load, hiển thị trạng thái hiện tại */}
                      {workflowStages.length === 0 && (
                        <option value={task.statusId}>{task.status}</option>
                      )}
                      {workflowStages.map((stage) => (
                        <option key={stage.statusId} value={stage.statusId}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Nhóm công việc</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="field-select"
                    >
                      <option value="">-- Chọn nhóm --</option>
                      {groupsList.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
                
              </div>
              {/* Description */}
              <div className="form-field form-field-full">
                <label className="field-label">Mô Tả:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="field-textarea"
                  placeholder="Nhập mô tả công việc..."
                />
              </div>
              {/* Upload File */}
              <div className="form-field form-field-full">
                <label className="field-label">Upload file:</label>
                <div className="upload-zone">
                  <span className="upload-text">Kéo thả tệp để đính kèm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Panel - Info */}
        <div className="task-detail-info-panel">
          <div className="task-detail-card">
            {/* Project & Code */}
            <div className="info-row info-row-two-cols">
              <div className="info-item">
                <div className="info-label">
                  <FolderIcon />
                  <span>Dự án</span>
                </div>
                <div className="info-value-text">{task.project || 'Chưa xác định'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <span>Mã công việc</span>
                </div>
                <div className="info-value-text">{task.code}</div>
              </div>
            </div>
            {/* Created Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Ngày tạo việc</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(task.createdAt || '')}</div>
              </div>
            </div>
            {/* Start Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Thời gian bắt đầu</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(task.startDate)}</div>
              </div>
            </div>
            {/* End Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Thời gian kết thúc</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(task.endDate)}</div>
              </div>
            </div>
            {/* Description */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <DocumentIcon />
                  <span>Mô tả công việc</span>
                </div>
                <div className="info-value-text">{description || 'Chưa có mô tả'}</div>
              </div>
            </div>
            {/* People */}
            <div className="info-row info-row-two-cols info-row-last">
              <div className="info-item">
                <div className="info-label">
                  <UserIcon />
                  <span>Người phụ trách</span>
                </div>
                <div className="person-row">
                  <div className="avatar-small avatar-blue">
                    {getInitials(task.manager)}
                  </div>
                  <span className="person-name-text">{task.manager}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <UserIcon />
                  <span>Người thực hiện</span>
                </div>
                <div className="person-row">
                  <div className="avatar-small avatar-green">
                    {getInitials(task.assignee)}
                  </div>
                  <span className="person-name-text">{task.assignee}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Separate Card for Tabs */}
          <div className="task-detail-card task-detail-tabs-card">
            <div className="detail-tabs">
              <div className="tabs-header">
                {[
                  { id: 'comments', label: 'Bình luận' },
                  { id: 'history', label: 'Lịch sử' },
                  { id: 'logs', label: 'Nhật ký công việc' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'tab-active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="tabs-content">
                {activeTab === 'comments' && (
                  <div className="comments-section">
                    {/* Add comment form */}
                    <div className="comment-form" style={{ marginBottom: '16px' }}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          resize: 'none',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        onClick={handleAddComment}
                        style={{
                          backgroundColor: '#F79E61',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Gửi bình luận
                      </button>
                    </div>
                    {/* Comments list */}
                    {isLoadingComments ? (
                      <p style={{ color: '#6b7280' }}>Đang tải...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ color: '#6b7280' }}>Chưa có bình luận nào.</p>
                    ) : (
                      <div className="comments-list">
                        {comments.map((comment) => (
                          <div key={comment.id} style={{
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                              <strong>{userNames.get(comment.userId) || comment.userId}</strong> • {formatDate(comment.createdAt)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              {comment.comment}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="history-section">
                    {isLoadingHistory ? (
                      <p style={{ color: '#6b7280' }}>Đang tải...</p>
                    ) : history.length === 0 ? (
                      <p style={{ color: '#6b7280' }}>Chưa có lịch sử thay đổi.</p>
                    ) : (
                      <div className="history-list">
                        {history.filter(h => h.action !== 'COMMENT').map((item) => (
                          <div key={item.id} style={{
                            padding: '10px 12px',
                            borderLeft: '3px solid #F79E61',
                            backgroundColor: '#f9fafb',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatDate(item.createdAt)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>
                              <strong>{userNames.get(item.userId) || item.userId}</strong> đã {item.action.toLowerCase()} công việc
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'logs' && (
                  <div className="logs-section">
                    {isLoadingHistory ? (
                      <p style={{ color: '#6b7280' }}>Đang tải...</p>
                    ) : history.length === 0 ? (
                      <p style={{ color: '#6b7280' }}>Chưa có nhật ký.</p>
                    ) : (
                      <div className="logs-list">
                        {history.map((item) => (
                          <div key={item.id} style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #e5e7eb',
                            fontSize: '13px'
                          }}>
                            <span style={{ color: '#6b7280' }}>{formatDate(item.createdAt)}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span style={{ color: '#374151' }}>{item.action}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <span style={{ color: '#6b7280' }}>{userNames.get(item.userId) || item.userId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskDetailView;
