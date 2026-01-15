import React, { useState } from 'react';
import { mockMembers, mockRoles } from './data/members.data';
import type { Member, Role } from './data/members.data';

type RoleFilter = 'all' | 'Admin' | 'Member' | 'Viewer';

const SettingsPage: React.FC = () => {
    const [members] = useState<Member[]>(mockMembers);
    const [roles] = useState<Role[]>(mockRoles);
    const [activeTab, setActiveTab] = useState<RoleFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');

    const roleCounts = {
        Admin: members.filter(m => m.role === 'Admin').length,
        Member: members.filter(m => m.role === 'Member').length,
        Viewer: members.filter(m => m.role === 'Viewer').length,
    };

    const filteredMembers = members.filter(m => {
        const matchesTab = activeTab === 'all' || m.role === activeTab;
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleEditRole = (member: Member) => {
        setEditingMember(member);
        setSelectedRole(member.role);
    };

    const handleSaveRole = () => {
        setEditingMember(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    />
                    <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none">
                    <option>Vai trò: Tất cả</option>
                    <option>Admin</option>
                    <option>Member</option>
                    <option>Viewer</option>
                </select>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none">
                    <option>Vai trò</option>
                </select>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => setActiveTab('Admin')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${activeTab === 'Admin' ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent'
                        }`}
                >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Admin</div>
                        <div className="text-xs text-gray-500">{roleCounts.Admin} người</div>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('Member')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${activeTab === 'Member' ? 'bg-green-50 border-green-500' : 'bg-white border-transparent'
                        }`}
                >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Member</div>
                        <div className="text-xs text-gray-500">{roleCounts.Member} người</div>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('Viewer')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${activeTab === 'Viewer' ? 'bg-purple-50 border-purple-500' : 'bg-white border-transparent'
                        }`}
                >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Viewer</div>
                        <div className="text-xs text-gray-500">{roleCounts.Viewer} người</div>
                    </div>
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản lý thành viên</h2>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tên thành viên</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ngày tạo</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Vai trò</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <input type="checkbox" className="rounded" />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{member.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Đã đăng ký' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Đã đăng ký' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{member.createdAt}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditRole(member)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Sửa vai trò"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Cài đặt">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Thêm">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Role Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản lý vai trò</h2>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tên vai trò</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Mô tả</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Số thành viên</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <input type="checkbox" className="rounded" />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{role.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{role.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{role.memberCount}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Business Operations Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Thêm nghiệp vụ</h2>
                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tên</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">Nhóm công việc</td>
                            <td className="px-4 py-3 text-sm text-gray-900">Loại công việc</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Edit Role Modal */}

            {editingMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Sửa vai trò</h3>
                            <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{editingMember.name}</p>
                        <div className="space-y-3">
                            {['Admin', 'Member', 'Viewer'].map((role) => (
                                <label key={role} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={selectedRole === role}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">{role}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingMember(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleSaveRole}
                                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
