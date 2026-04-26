import React, { useState } from 'react';
import { mockWorkflowTemplates } from '../../data/workflow-templates.data';

const TemplateView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = mockWorkflowTemplates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Search Filter */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm template..."
                        className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all text-sm"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-sm text-gray-500 mt-2">Tìm thấy {filteredTemplates.length} template</p>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg">Không tìm thấy template phù hợp</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:border-[#F79E61]/50 transition-all group"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {template.code}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-900 font-semibold text-[15px] group-hover:text-[#F79E61] transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    {template.stagesCount} giai đoạn
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    {template.tasksCount} công việc mẫu
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateView;
