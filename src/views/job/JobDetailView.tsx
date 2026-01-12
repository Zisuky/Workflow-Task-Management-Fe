import React, { useState, useEffect } from 'react';
import type { Job } from '../../models';
import { commentApi, type Comment } from '../../api/commentApi';
import { historyApi, type HistoryItem } from '../../api/historyApi';
import { taskTypeApi, type TaskType } from '../../api/taskTypeApi';
import { taskGroupApi, type TaskGroup } from '../../api/taskGroupApi';

export interface JobUpdateData {
  priority: Job['priority'];
  status: Job['status'];
  group: Job['group'];
  type: Job['type'];
  description: string;
  typeId?: string;
  taskGroupId?: string;
}

interface JobDetailViewProps {
  job: Job;
  onUpdate?: (data: JobUpdateData) => void;
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
const formatDate = (dateString: string) => {
  if (!dateString) return 'Chưa xác định';

  if (dateString.includes('-')) {
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      const day = isoDate.getDate();
      const month = isoDate.getMonth() + 1;
      const year = isoDate.getFullYear();
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
  }

  const parts = dateString.split(' ');
  const dateParts = parts[0].split('/');
  if (dateParts.length !== 3) {
    return 'Chưa xác định';
  }
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const year = parseInt(dateParts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return 'Chưa xác định';
  }
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};
const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};
export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [priority, setPriority] = useState(job.priority);
  const [status, setStatus] = useState(job.status);
  const [description, setDescription] = useState(job.description || '');

  // Store IDs for type and group
  const [selectedTypeId, setSelectedTypeId] = useState(job.typeId || '');
  const [selectedGroupId, setSelectedGroupId] = useState(job.taskGroupId || '');

  // Lists from API
  const [typesList, setTypesList] = useState<TaskType[]>([]);
  const [groupsList, setGroupsList] = useState<TaskGroup[]>([]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  // Load types and groups on mount
  useEffect(() => {
    const loadLists = async () => {
      try {
        const [typesRes, groupsRes] = await Promise.all([
          taskTypeApi.getAll(),
          taskGroupApi.getAll(),
        ]);
        setTypesList(typesRes.data || []);
        setGroupsList(groupsRes.data || []);
      } catch (err) {
        console.error('Failed to load types/groups:', err);
      }
    };
    loadLists();
  }, []);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await commentApi.getByTaskId(job.id);
      setComments(res.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await historyApi.getByObjectId('TASK', job.id);
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await commentApi.create(job.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const selectedType = typesList.find(t => t.id === selectedTypeId);
  const selectedGroup = groupsList.find(g => g.id === selectedGroupId);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        priority,
        status,
        group: (selectedGroup?.name || job.group) as Job['group'],
        type: (selectedType?.name || job.type) as Job['type'],
        description,
        typeId: selectedTypeId || job.typeId,
        taskGroupId: selectedGroupId || job.taskGroupId,
      });
    }
  };
  return (
    <div className="job-detail-page">
      <div className="job-detail-content">
        {/* Left Panel - Form */}
        <div className="job-detail-form-panel">
          <div className="job-detail-card">
            {/* Card Header */}
            <div className="card-header">
              <h1 className="job-title-text">{job.name}</h1>
              <div className="action-buttons">
                <button
                  onClick={handleSave}
                  className="update-button"
                >
                  <EditIcon />
                  <span>Cập nhật</span>
                </button>
                <button
                  onClick={onDelete}
                  className="delete-button"
                >
                  <TrashIcon />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
            {/* Form Fields */}
            <div className="form-fields">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Mức độ ưu tiên</label>
                  <div className="select-wrapper">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="field-select"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">Trạng thái hiện tại</label>
                  <div className="select-wrapper">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="field-select"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
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
                <div className="form-field">
                  <label className="field-label">Loại công việc</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(e.target.value)}
                      className="field-select"
                    >
                      <option value="">-- Chọn loại --</option>
                      {typesList.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
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
        <div className="job-detail-info-panel">
          <div className="job-detail-card">
            {/* Project & Code */}
            <div className="info-row info-row-two-cols">
              <div className="info-item">
                <div className="info-label">
                  <FolderIcon />
                  <span>Dự án</span>
                </div>
                <div className="info-value-text">{job.project || 'Chưa xác định'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <span>Mã công việc</span>
                </div>
                <div className="info-value-text">{job.code}</div>
              </div>
            </div>
            {/* Read Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Ngày tạo việc</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(job.startDate)}</div>
              </div>
            </div>
            {/* Start Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Ngày bắt đầu</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(job.startDate)}</div>
              </div>
            </div>
            {/* End Date */}
            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <CalendarIcon />
                  <span>Ngày đến hạn</span>
                </div>
                <div className="info-value-text info-value-bold">{formatDate(job.endDate)}</div>
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
                    {getInitials(job.manager)}
                  </div>
                  <span className="person-name-text">{job.manager}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <UserIcon />
                  <span>Người thực hiện</span>
                </div>
                <div className="person-name-text" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                  {job.assignee}
                </div>
              </div>
            </div>
          </div>
          {/* Separate Card for Tabs */}
          <div className="job-detail-card job-detail-tabs-card">
            <div className="detail-tabs">
              <div className="tabs-header">
                {[
                  { id: 'details', label: 'Chi tiết' },
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
                {activeTab === 'details' && (
                  <div className="tab-placeholder">
                    <p>Chi tiết khác về công việc...</p>
                  </div>
                )}
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
                              <strong>{comment.userId}</strong> • {formatDate(comment.createdAt)}
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
                              <strong>{item.userId}</strong> đã {item.action.toLowerCase()} công việc
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
                            <span style={{ color: '#6b7280' }}>{item.userId}</span>
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
export default JobDetailView;
