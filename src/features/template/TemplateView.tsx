import React from 'react';

// Mock data as per image
const templates = [
    { id: 1, name: 'Template: Mẫu dự án 1', code: 'PMCC-29' },
    { id: 2, name: 'Template: Mẫu dự án 2', code: 'PMCC-29' },
    { id: 3, name: 'Template: Mẫu dự án 3', code: 'PMCC-29' },
    { id: 4, name: 'Template: Mẫu dự án 3', code: 'PMCC-29' },
];

const TemplateView: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
                <div
                    key={template.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-[6px] border-l-emerald-400 p-6 h-40 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
                >
                    <div>
                        <h3 className="text-gray-900 font-semibold text-[15px] group-hover:text-blue-600 transition-colors">
                            {template.name}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-[4px] border-blue-100 bg-blue-500"></div>
                        <span className="text-blue-500 font-semibold text-xs">
                            {template.code}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TemplateView;
