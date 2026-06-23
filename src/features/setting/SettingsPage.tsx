import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { userApi, useCurrentUser } from '../user/infrastructure/user.api';
import type { User } from '../../shared/types';
import api from '../../shared/http/apiClient';
import { taskGroupApi } from '../task/infrastructure/taskGroup.client';
import { useToast } from '../../ui/toast';


interface Role { id: string; code: string; name: string; disabled?: boolean; isDefault?: boolean; }
interface Feature { id: string; code: string; name: string; disabled?: boolean; }
interface RoleFeature { id: string; roleId: string; featureId: string; feature?: Feature; }
interface TaskGroup { id: string; name: string; description?: string; projectId?: string; }
interface MemberRow extends User { roles: string[]; roleIds: string[]; }

type ActiveTab = 'members' | 'roles' | 'taskgroups' | 'profile';

// ─── API clients ──────────────────────────────────────────────────────────────

const roleApi = {
  getAll:    ()                              => api.get('/roles'),
  create:    (b: {code:string;name:string}) => api.post('/roles', b),
  update:    (id:string, b: Partial<Role>)  => api.put(`/roles/${id}`, b),
  delete:    (id:string)                    => api.delete(`/roles/${id}`),
};

const featureApi = {
  getAll:  ()                                 => api.get('/features'),
  create:  (b:{code:string;name:string})      => api.post('/features', b),
  update:  (id:string, b:Partial<Feature>)    => api.put(`/features/${id}`, b),
  delete:  (id:string)                        => api.delete(`/features/${id}`),
};

const roleFeatureApi = {
  getByRole:   (roleId:string)               => api.get(`/role-features/role/${roleId}`),
  createBatch: (items:{roleId:string;featureId:string}[]) => api.post('/role-features/batch', items),
  delete:      (id:string)                   => api.delete(`/role-features/${id}`),
};

const userRoleApi = {
  getByUser: (userId:string)                 => api.get(`/user-roles/${userId}`),
  update:    (userId:string, roleIds:string[]) => api.put(`/user-roles/${userId}`, roleIds),
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Avatar: React.FC<{name:string}> = ({name}) => {
  const initials = name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
      {initials||'?'}
    </div>
  );
};

const Badge: React.FC<{label:string}> = ({label}) => {
  const map: Record<string,string> = {ADMIN:'bg-blue-100 text-blue-700',MANAGER:'bg-purple-100 text-purple-700',VIEWER:'bg-gray-100 text-gray-600',MEMBER:'bg-green-100 text-green-700'};
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[label.toUpperCase()]??'bg-orange-100 text-orange-700'}`}>{label}</span>;
};

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"/>
  </div>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);

const IconDelete = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
);

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────

const Modal: React.FC<{title:string;onClose:()=>void;children:React.ReactNode;width?:string}> =
  ({title,onClose,children,width='w-96'}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className={`bg-white rounded-2xl shadow-2xl ${width} p-6 max-h-[90vh] flex flex-col`}>
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><IconClose/></button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Tab 1: Members ───────────────────────────────────────────────────────────

interface AddMemberModalProps { allRoles: Role[]; onClose:()=>void; onCreated:()=>void; }
const AddMemberModal: React.FC<AddMemberModalProps> = ({allRoles, onClose, onCreated}) => {
  const [form, setForm] = useState({fullName:'',account:'',email:'',phone:''});
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()||!form.account.trim()||!form.email.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }
    setSaving(true);
    try {
      // Use /auth/register so password is hashed + UserDetail created + email sent
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        account: form.account.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      // Assign roles if selected — need to find the new user by account
      if (selectedRoleIds.length > 0) {
        try {
          const usersRes = await api.get(`/users/all`) as any;
          const users: any[] = usersRes?.data || usersRes || [];
          const newUser = users.find((u: any) => u.account === form.account.trim());
          if (newUser?.id) {
            await userRoleApi.update(newUser.id, selectedRoleIds);
          }
        } catch {
          // Role assignment failed silently — user was created successfully
        }
      }
      userApi.clearCache();
      toast.success('Thêm thành công, yêu cầu xác thực email');
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.includes('Tài khoản đã tồn tại')) {
        setError('Tài khoản đã tồn tại.');
      } else if (msg.includes('Email đã tồn tại')) {
        setError('Email đã tồn tại.');
      } else {
        setError('Tạo thành viên thất bại. Email hoặc tài khoản có thể đã tồn tại.');
      }
    }
    finally { setSaving(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p=>({...p,[k]:e.target.value}));

  return (
    <Modal title="Thêm thành viên mới" onClose={onClose} width="w-[480px]">
      <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1">
        {[
          {label:'Họ và tên *',key:'fullName',type:'text',placeholder:'Nguyễn Văn A'},
          {label:'Tài khoản *',key:'account',type:'text',placeholder:'nguyenvana'},
          {label:'Email *',key:'email',type:'email',placeholder:'a@example.com'},
          {label:'Số điện thoại',key:'phone',type:'text',placeholder:'0901234567'},
        ].map(({label,key,type,placeholder}) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} value={form[key as keyof typeof form]} onChange={f(key as keyof typeof form)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
          </div>
        ))}
        <p className="text-xs text-gray-400 italic">Mật khẩu sẽ được tạo tự động và gửi qua email.</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Vai trò</label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
            {allRoles.map(r => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                <input type="checkbox" checked={selectedRoleIds.includes(r.id)}
                  onChange={() => setSelectedRoleIds(p => p.includes(r.id)?p.filter(x=>x!==r.id):[...p,r.id])}
                  className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300"/>
                <span className="text-sm text-gray-700">{r.name}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Huỷ</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
            {saving?'Đang tạo...':'Thêm thành viên'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface EditMemberModalProps { member: MemberRow; allRoles: Role[]; onClose:()=>void; onSaved:()=>void; }
const EditMemberModal: React.FC<EditMemberModalProps> = ({member, allRoles, onClose, onSaved}) => {
  const [form, setForm] = useState({fullName: member.name, email: member.email, phone: member.phone??''});
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(member.roleIds);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${member.id}`, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim()||null,
        account: member.account,
      });
      await userRoleApi.update(member.id, selectedRoleIds);
      toast.success('Cập nhật thành viên thành công');
      onSaved(); onClose();
    } catch {
      toast.error('Cập nhật thành viên thất bại');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Cập nhật thành viên" onClose={onClose} width="w-[480px]">
      <div className="space-y-3 overflow-y-auto flex-1">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-1">
          <Avatar name={member.name}/>
          <div>
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-400">{member.account}</p>
          </div>
        </div>
        {[
          {label:'Họ và tên',key:'fullName',type:'text'},
          {label:'Email',key:'email',type:'email'},
          {label:'Số điện thoại',key:'phone',type:'text'},
        ].map(({label,key,type}) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} value={form[key as keyof typeof form]}
              onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Vai trò</label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
            {allRoles.map(r => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                <input type="checkbox" checked={selectedRoleIds.includes(r.id)}
                  onChange={() => setSelectedRoleIds(p => p.includes(r.id)?p.filter(x=>x!==r.id):[...p,r.id])}
                  className="w-3.5 h-3.5 text-orange-500 rounded border-gray-300"/>
                <span className="text-sm text-gray-700">{r.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
            {saving?'Đang lưu...':'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface MembersTabProps {
  members: MemberRow[];
  allRoles: Role[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}
const MembersTab: React.FC<MembersTabProps> = ({members, allRoles, loading, currentPage, totalPages, totalItems, onRefresh, onPageChange}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MemberRow|null>(null);
  const [deletingId, setDeletingId] = useState<string|null>(null);
  const toast = useToast();

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (m.name.toLowerCase().includes(q)||m.email.toLowerCase().includes(q)||m.account.toLowerCase().includes(q))
      && (!roleFilter || m.roles.some(r=>r.toLowerCase().includes(roleFilter.toLowerCase())));
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xoá thành viên "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      userApi.clearCache();
      toast.success(`Đã xoá thành viên "${name}"`);
      onRefresh();
    } catch {
      toast.error(`Xoá thành viên thất bại`);
    } finally { setDeletingId(null); }
  };

  if (loading) return <Spinner/>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Tìm theo tên, email, tài khoản..." value={search}
            onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Tất cả vai trò</option>
          {allRoles.map(r=><option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        <button onClick={()=>setShowAdd(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Thêm thành viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thành viên</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tài khoản</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vai trò</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length===0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Không tìm thấy thành viên nào</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name}/>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{m.account}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {m.roles.length>0 ? m.roles.map(r=><Badge key={r} label={r}/>) : <span className="text-xs text-gray-400">Chưa có vai trò</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={()=>setEditing(m)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Cập nhật">
                      <IconEdit/>
                    </button>
                    <button onClick={()=>handleDelete(m.id, m.name)} disabled={deletingId===m.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Xoá">
                      <IconDelete/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddMemberModal allRoles={allRoles} onClose={()=>setShowAdd(false)} onCreated={onRefresh}/>}
      {editing && <EditMemberModal member={editing} allRoles={allRoles} onClose={()=>setEditing(null)} onSaved={onRefresh}/>}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">
            Trang {currentPage + 1} / {totalPages} ({totalItems} thành viên)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
              // Show pages around current page
              const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                    p === currentPage
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab 2: Roles & Features ──────────────────────────────────────────────────

// Modal: assign features to a role
interface AssignFeaturesModalProps { role: Role; allFeatures: Feature[]; onClose:()=>void; onSaved:()=>void; }
const AssignFeaturesModal: React.FC<AssignFeaturesModalProps> = ({role, allFeatures, onClose, onSaved}) => {
  const [currentRFs, setCurrentRFs] = useState<RoleFeature[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await roleFeatureApi.getByRole(role.id);
        const rfs: RoleFeature[] = (res as {data?:RoleFeature[]})?.data ?? [];
        setCurrentRFs(rfs);
        setSelected(rfs.map(rf=>rf.featureId));
      } finally { setLoading(false); }
    })();
  }, [role.id]);

  const toggle = (fid: string) =>
    setSelected(p => p.includes(fid) ? p.filter(x=>x!==fid) : [...p, fid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentIds = currentRFs.map(rf=>rf.featureId);
      const toAdd = selected.filter(fid => !currentIds.includes(fid));
      const toRemove = currentRFs.filter(rf => !selected.includes(rf.featureId));

      await Promise.all([
        toAdd.length > 0
          ? roleFeatureApi.createBatch(toAdd.map(featureId => ({roleId: role.id, featureId})))
          : Promise.resolve(),
        ...toRemove.map(rf => roleFeatureApi.delete(rf.id)),
      ]);
      toast.success(`Đã cập nhật quyền cho vai trò "${role.name}"`);
      onSaved(); onClose();
    } catch {
      toast.error('Cập nhật quyền thất bại');
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`Gán quyền — ${role.name}`} onClose={onClose} width="w-[480px]">
      {loading ? <Spinner/> : (
        <>
          <p className="text-xs text-gray-500 mb-3">Chọn các quyền áp dụng cho vai trò này</p>
          <div className="space-y-1.5 overflow-y-auto flex-1 max-h-72 border border-gray-100 rounded-lg p-2 mb-4">
            {allFeatures.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">Chưa có quyền nào trong hệ thống</p>
              : allFeatures.map(f => (
                <label key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={()=>toggle(f.id)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400"/>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name}</p>
                    <code className="text-xs text-gray-400 font-mono">{f.code}</code>
                  </div>
                </label>
              ))
            }
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{selected.length} quyền được chọn</span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
                {saving?'Đang lưu...':'Lưu'}
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

// Inline form modal for Role / Feature CRUD
interface SimpleFormModalProps {
  title: string; fields: {label:string;key:string;placeholder?:string}[];
  initial?: Record<string,string>; onClose:()=>void;
  onSubmit:(values:Record<string,string>)=>Promise<void>;
  submitLabel?: string;
}
const SimpleFormModal: React.FC<SimpleFormModalProps> = ({title,fields,initial={},onClose,onSubmit,submitLabel='Lưu'}) => {
  const [values, setValues] = useState<Record<string,string>>(
    Object.fromEntries(fields.map(f=>[f.key, initial[f.key]??'']))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.some(f=>!values[f.key]?.trim())) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    setSaving(true);
    try { await onSubmit(values); toast.success('Lưu thành công'); onClose(); }
    catch { setError('Thao tác thất bại. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <input value={values[f.key]} onChange={e=>setValues(p=>({...p,[f.key]:e.target.value}))}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
          </div>
        ))}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Huỷ</button>
          <button type="submit" disabled={saving}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
            {saving?'Đang lưu...':submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface RolesTabProps { roles: Role[]; features: Feature[]; loadingRoles: boolean; loadingFeatures: boolean; onRefreshRoles:()=>void; onRefreshFeatures:()=>void; }
const RolesTab: React.FC<RolesTabProps> = ({roles, features, loadingRoles, loadingFeatures, onRefreshRoles, onRefreshFeatures}) => {
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role|null>(null);
  const [assigningRole, setAssigningRole] = useState<Role|null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string|null>(null);

  const [showCreateFeature, setShowCreateFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature|null>(null);
  const [deletingFeatureId, setDeletingFeatureId] = useState<string|null>(null);

  const toast = useToast();

  const handleDeleteRole = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xoá vai trò "${name}"?`)) return;
    setDeletingRoleId(id);
    try {
      await roleApi.delete(id);
      toast.success(`Đã xoá vai trò "${name}"`);
      onRefreshRoles();
    } catch {
      toast.error(`Xoá vai trò thất bại`);
    } finally { setDeletingRoleId(null); }
  };

  const handleDeleteFeature = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xoá quyền "${name}"?`)) return;
    setDeletingFeatureId(id);
    try {
      await featureApi.delete(id);
      toast.success(`Đã xoá quyền "${name}"`);
      onRefreshFeatures();
    } catch {
      toast.error(`Xoá quyền thất bại`);
    } finally { setDeletingFeatureId(null); }
  };

  const roleFields = [{label:'Mã vai trò (CODE)',key:'code',placeholder:'VD: MANAGER'},{label:'Tên vai trò',key:'name',placeholder:'VD: Quản lý dự án'}];
  const featureFields = [{label:'Mã quyền (CODE)',key:'code',placeholder:'VD: PROJECT_VIEW'},{label:'Tên quyền',key:'name',placeholder:'VD: Xem dự án'}];

  return (
    <div className="space-y-6">
      {/* ── Panel trên: Vai trò ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Vai trò trong hệ thống</h2>
            <p className="text-xs text-gray-400 mt-0.5">{roles.length} vai trò</p>
          </div>
          <button onClick={()=>setShowCreateRole(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Tạo vai trò
          </button>
        </div>
        {loadingRoles ? <Spinner/> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên vai trò</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roles.length===0
                ? <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Chưa có vai trò nào</td></tr>
                : roles.map(role => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{role.name}</span>
                        {role.isDefault && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Mặc định</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{role.code}</code></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${role.disabled?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${role.disabled?'bg-red-500':'bg-green-500'}`}/>
                        {role.disabled?'Vô hiệu':'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>setAssigningRole(role)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Gán quyền">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                          Gán quyền
                        </button>
                        <button onClick={()=>setEditingRole(role)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Sửa"><IconEdit/></button>
                        <button onClick={()=>handleDeleteRole(role.id,role.name)} disabled={deletingRoleId===role.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Xoá"><IconDelete/></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>

      {/* ── Panel dưới: Quyền ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Quyền trong hệ thống</h2>
            <p className="text-xs text-gray-400 mt-0.5">{features.length} quyền</p>
          </div>
          <button onClick={()=>setShowCreateFeature(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Tạo quyền
          </button>
        </div>
        {loadingFeatures ? <Spinner/> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên quyền</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {features.length===0
                ? <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Chưa có quyền nào</td></tr>
                : features.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{f.name}</td>
                    <td className="px-5 py-3.5"><code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{f.code}</code></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${f.disabled?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${f.disabled?'bg-red-500':'bg-green-500'}`}/>
                        {f.disabled?'Vô hiệu':'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>setEditingFeature(f)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Sửa"><IconEdit/></button>
                        <button onClick={()=>handleDeleteFeature(f.id,f.name)} disabled={deletingFeatureId===f.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Xoá"><IconDelete/></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showCreateRole && (
        <SimpleFormModal title="Tạo vai trò mới" fields={roleFields} submitLabel="Tạo vai trò" onClose={()=>setShowCreateRole(false)}
          onSubmit={async v => { await roleApi.create({code:v.code.toUpperCase(),name:v.name}); onRefreshRoles(); }}/>
      )}
      {editingRole && (
        <SimpleFormModal title="Chỉnh sửa vai trò" fields={roleFields} initial={{code:editingRole.code,name:editingRole.name}} onClose={()=>setEditingRole(null)}
          onSubmit={async v => { await roleApi.update(editingRole.id,{code:v.code.toUpperCase(),name:v.name}); onRefreshRoles(); }}/>
      )}
      {assigningRole && (
        <AssignFeaturesModal role={assigningRole} allFeatures={features} onClose={()=>setAssigningRole(null)} onSaved={()=>{}}/>
      )}
      {showCreateFeature && (
        <SimpleFormModal title="Tạo quyền mới" fields={featureFields} submitLabel="Tạo quyền" onClose={()=>setShowCreateFeature(false)}
          onSubmit={async v => { await featureApi.create({code:v.code.toUpperCase(),name:v.name}); onRefreshFeatures(); }}/>
      )}
      {editingFeature && (
        <SimpleFormModal title="Chỉnh sửa quyền" fields={featureFields} initial={{code:editingFeature.code,name:editingFeature.name}} onClose={()=>setEditingFeature(null)}
          onSubmit={async v => { await featureApi.update(editingFeature.id,{code:v.code.toUpperCase(),name:v.name}); onRefreshFeatures(); }}/>
      )}
    </div>
  );
};

// ─── Tab 3: Task Groups ───────────────────────────────────────────────────────

interface TaskGroupsTabProps { groups: TaskGroup[]; loading: boolean; onRefresh:()=>void; }
const TaskGroupsTab: React.FC<TaskGroupsTabProps> = ({groups, loading, onRefresh}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<TaskGroup|null>(null);
  const [deletingId, setDeletingId] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description??'').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xoá nhóm "${name}"?`)) return;
    setDeletingId(id);
    try {
      await taskGroupApi.delete(id);
      toast.success(`Đã xoá nhóm "${name}"`);
      onRefresh();
    } catch {
      toast.error(`Xoá nhóm thất bại`);
    } finally { setDeletingId(null); }
  };

  const groupFields = [
    {label:'Tên nhóm *', key:'name', placeholder:'VD: Frontend'},
    {label:'Mô tả', key:'description', placeholder:'VD: Các công việc liên quan đến UI'},
  ];

  if (loading) return <Spinner/>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Tìm nhóm công việc..." value={search}
            onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} nhóm</span>
        <button onClick={()=>setShowCreate(true)}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Tạo nhóm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên nhóm</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length===0
              ? <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-400">Chưa có nhóm công việc nào</td></tr>
              : filtered.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{g.description||<span className="text-gray-300 italic">Chưa có mô tả</span>}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>setEditing(g)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Sửa"><IconEdit/></button>
                      <button onClick={()=>handleDelete(g.id,g.name)} disabled={deletingId===g.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Xoá"><IconDelete/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showCreate && (
        <SimpleFormModal title="Tạo nhóm công việc" fields={groupFields} submitLabel="Tạo nhóm" onClose={()=>setShowCreate(false)}
          onSubmit={async v => { await taskGroupApi.create({name:v.name.trim(),description:v.description.trim()||undefined}); onRefresh(); }}/>
      )}
      {editing && (
        <SimpleFormModal title="Chỉnh sửa nhóm" fields={groupFields} initial={{name:editing.name,description:editing.description??''}} onClose={()=>setEditing(null)}
          onSubmit={async v => { await taskGroupApi.update(editing.id,{name:v.name.trim(),description:v.description.trim()||undefined}); onRefresh(); }}/>
      )}
    </div>
  );
};

// ─── Tab 4: Profile & Password Settings ────────────────────────────────────────

interface ProfileTabProps {
  currentUser: User | null;
  onRefresh: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, onRefresh }) => {
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const toast = useToast();

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    setSavingProfile(true);
    try {
      await userApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        avatarUrl: avatarUrl || null,
      });
      toast.success('Cập nhật thông tin cá nhân thành công');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện không vượt quá 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const initials = fullName ? fullName.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase() : '?';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cột trái: Ảnh đại diện & Thông tin nhanh */}
      <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-6 self-start">Ảnh đại diện</h3>
        <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-orange-50 text-orange-600 text-3xl font-bold mb-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Thay đổi ảnh
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        
        {avatarUrl && (
          <button 
            type="button"
            onClick={() => setAvatarUrl('')} 
            className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium mb-6"
          >
            Xoá ảnh đại diện
          </button>
        )}

        <div className="w-full border-t border-gray-100 pt-4 text-center">
          <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{currentUser?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {currentUser?.roles?.map(r => (
              <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Form cập nhật */}
      <div className="md:col-span-2 space-y-6">
        {/* Form thông tin cá nhân */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Thông tin cá nhân</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tài khoản</label>
                <input type="text" value={currentUser?.account || ''} disabled className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input type="text" value={currentUser?.email || ''} disabled className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên hiển thị *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nhập tên hiển thị..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingProfile} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
                {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>

        {/* Form đổi mật khẩu */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu hiện tại</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu mới</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>

            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingPassword} className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-medium transition-colors">
                {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');

  // Check URL query parameters to set active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'profile') {
      setActiveTab('profile');
    }
  }, [location.search]);

  const [members,  setMembers]  = useState<MemberRow[]>([]);
  const [roles,    setRoles]    = useState<Role[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [groups,   setGroups]   = useState<TaskGroup[]>([]);

  // Pagination state for members
  const [memberPage,       setMemberPage]       = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(0);
  const [memberTotalItems, setMemberTotalItems] = useState(0);
  const MEMBER_PAGE_SIZE = 20;

  const [loadingMembers,  setLoadingMembers]  = useState(true);
  const [loadingRoles,    setLoadingRoles]    = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [loadingGroups,   setLoadingGroups]   = useState(true);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await roleApi.getAll();
      setRoles((res as {data?:Role[]})?.data ?? []);
    } catch { setRoles([]); } finally { setLoadingRoles(false); }
  }, []);

  const fetchFeatures = useCallback(async () => {
    setLoadingFeatures(true);
    try {
      const res = await featureApi.getAll();
      setFeatures((res as {data?:Feature[]})?.data ?? []);
    } catch { setFeatures([]); } finally { setLoadingFeatures(false); }
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await taskGroupApi.getAll();
      const raw = (res as {data?:unknown})?.data;
      const list = Array.isArray(raw) ? raw as TaskGroup[] : [];
      setGroups(list);
    } catch { setGroups([]); } finally { setLoadingGroups(false); }
  }, []);

  const fetchMembers = useCallback(async (page = 0) => {
    setLoadingMembers(true);
    try {
      // Paginated: GET /users?page=X&size=20
      // Returns ApiResponse<Page<UserProfileDTO>> — includes fullName, roles, phone, avatarUrl
      const res = await api.get(`/users?page=${page}&size=${MEMBER_PAGE_SIZE}`) as any;

      // apiClient interceptor returns response.data → res = ApiResponse<Page<UserProfileDTO>>
      const pageObj = res?.data ?? res;

      // Spring Page fields
      const rawList: any[] = Array.isArray(pageObj?.content)
        ? pageObj.content
        : Array.isArray(pageObj)
          ? pageObj
          : [];

      setMemberTotalPages(pageObj?.totalPages ?? 1);
      setMemberTotalItems(pageObj?.totalElements ?? rawList.length);

      // UserProfileDTO already includes roles + roleIds — no per-user API calls needed
      const rows: MemberRow[] = rawList.map((u: any) => ({
        id: u.id,
        account: u.account,
        email: u.email,
        name: u.fullName || u.account || 'Unknown',
        phone: u.phone || null,
        address: u.address || null,
        avatarUrl: u.avatarUrl || null,
        roles: Array.isArray(u.roles) ? u.roles : [],
        roleIds: Array.isArray(u.roleIds) ? u.roleIds : [],
      } as MemberRow));

      setMembers(rows);
      setMemberPage(page);
    } catch (err) {
      console.error('[fetchMembers] error:', err);
      setMembers([]);
    } finally { setLoadingMembers(false); }
  }, []);

  // Initial load
  useEffect(() => { fetchRoles(); fetchFeatures(); fetchGroups(); }, [fetchRoles, fetchFeatures, fetchGroups]);
  useEffect(() => { if (!loadingRoles) fetchMembers(0); }, [loadingRoles, fetchMembers]);

  const tabs: {key:ActiveTab; label:string; icon:React.ReactNode}[] = [
    {
      key: 'members', label: 'Thành viên',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
    {
      key: 'roles', label: 'Vai trò & Quyền',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    },
    {
      key: 'taskgroups', label: 'Nhóm công việc',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
    },
    {
      key: 'profile', label: 'Thông tin tài khoản',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
    },
  ];

  const stats = [
    {label:'Tổng thành viên',   value: memberTotalItems,                                  color:'text-blue-600',   bg:'bg-blue-50'},
    {label:'Vai trò hệ thống',  value: roles.length,                                      color:'text-orange-600', bg:'bg-orange-50'},
    {label:'Quyền hệ thống',    value: features.length,                                   color:'text-purple-600', bg:'bg-purple-50'},
    {label:'Nhóm công việc',    value: groups.length,                                     color:'text-green-600',  bg:'bg-green-50'},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thành viên, vai trò, quyền và nhóm công việc</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(tab => (
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab===tab.key ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab==='members' && (
          <MembersTab
            members={members}
            allRoles={roles}
            loading={loadingMembers}
            currentPage={memberPage}
            totalPages={memberTotalPages}
            totalItems={memberTotalItems}
            onRefresh={() => fetchMembers(memberPage)}
            onPageChange={(page) => fetchMembers(page)}
          />
        )}
        {activeTab==='roles' && (
          <RolesTab roles={roles} features={features}
            loadingRoles={loadingRoles} loadingFeatures={loadingFeatures}
            onRefreshRoles={fetchRoles} onRefreshFeatures={fetchFeatures}/>
        )}
        {activeTab==='taskgroups' && (
          <TaskGroupsTab groups={groups} loading={loadingGroups} onRefresh={fetchGroups}/>
        )}
        {activeTab==='profile' && (
          <ProfileTab currentUser={currentUser} onRefresh={refetchCurrentUser} />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
