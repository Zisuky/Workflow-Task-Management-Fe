import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { mockWorkflowTemplates } from '../../data/workflow-templates.data';

interface AddTemplateWizardProps {
    onClose: () => void;
}

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'KHỞI TẠO & CHỌN MẪU' },
        { number: 2, title: 'THIẾT LẬP' },
        { number: 3, title: 'KIỂM TRA & XÁC NHẬN' },
        { number: 4, title: 'GIAO VIỆC & KÍCH HOẠT' },
    ];

    return (
        <div className="flex items-center gap-6">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${currentStep >= step.number
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                        }`}>
                        {step.number}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                        {step.title}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 ml-2 ${currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}></div>
                    )}
                </div>
            ))}
        </div>
    );
};

const AddTemplateWizard: React.FC<AddTemplateWizardProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const target = document.getElementById('header-right-actions');
        setPortalTarget(target);
    }, []);

    const selectedTemplate = mockWorkflowTemplates.find(t => t.id === selectedTemplateId);

    const calculateEndDate = () => {
        if (!startDate) return '';
        const start = new Date(startDate);
        start.setDate(start.getDate() + 145);
        return start.toLocaleDateString('vi-VN');
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    return (
        <>
            {portalTarget && createPortal(<StepIndicator currentStep={currentStep} />, portalTarget)}

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chọn quy trình mẫu</h2>
                        <p className="text-gray-500 mb-6">Chọn một quy trình mẫu để bắt đầu tạo template mới hoặc tự tạo quy trình của riêng bạn</p>
                        <div className="grid grid-cols-2 gap-4">

                            {/* Thêm bảng chứa */}

                            {/* Custom workflow option */}
                            <div
                                onClick={() => setSelectedTemplateId('custom')}
                                className={`p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedTemplateId === 'custom'
                                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                    : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">Tự tạo quy trình mới</h4>
                                        <p className="text-sm text-gray-500 mt-1">Tạo quy trình từ đầu với các giai đoạn và công việc tùy chỉnh theo nhu cầu của bạn</p>
                                        <div className="flex gap-2 mt-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                                Tùy chỉnh
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                                Linh hoạt
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Template options */}
                            {mockWorkflowTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplateId(template.id)}
                                    className={`p-5 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedTemplateId === template.id
                                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {template.code}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{template.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                            <div className="flex gap-2 mt-3">
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                    {template.stagesCount} giai đoạn
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                    {template.tasksCount} công việc mẫu
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thiết lập các giai đoạn</h2>
                        <p className="text-gray-500 mb-6">Cấu hình các giai đoạn và công việc trong template</p>

                        <div className="space-y-6">
                            {/* Phase 1 */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-amber-600 font-bold">GĐ 1</span>
                                        <input
                                            type="text"
                                            placeholder="Tên giai đoạn"
                                            defaultValue="Tạo đơn hàng"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 bg-white">
                                    <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Task trong giai đoạn</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500 w-6">1.</span>
                                            <input type="text" defaultValue="Nhập thông tin KH" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" defaultValue="1" min="1" className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                                <span className="text-sm text-gray-500">ngày</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500 w-6">2.</span>
                                            <input type="text" defaultValue="Chọn sản phẩm" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" defaultValue="2" min="1" className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                                <span className="text-sm text-gray-500">ngày</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500 w-6">3.</span>
                                            <input type="text" defaultValue="Xác nhận đơn" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" defaultValue="1" min="1" className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                                <span className="text-sm text-gray-500">ngày</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="mt-3 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm task
                                    </button>
                                </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-blue-600 font-bold">GĐ 2</span>
                                        <input
                                            type="text"
                                            placeholder="Tên giai đoạn"
                                            defaultValue="Xử lý đơn hàng"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 bg-white">
                                    <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Task trong giai đoạn</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500 w-6">1.</span>
                                            <input type="text" defaultValue="Kiểm tra tồn kho" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" defaultValue="1" min="1" className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                                <span className="text-sm text-gray-500">ngày</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-500 w-6">2.</span>
                                            <input type="text" defaultValue="Đóng gói hàng" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" defaultValue="3" min="1" className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                                                <span className="text-sm text-gray-500">ngày</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="mt-3 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm task
                                    </button>
                                </div>
                            </div>

                            {/* Add Phase Button */}
                            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Thêm giai đoạn mới
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Kiểm tra lại cấu trúc dự án</h2>

                        <div className="grid grid-cols-2 gap-8">
                            {/* WBS Section */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-4 uppercase text-sm">Danh sách {selectedTemplate?.name} của bạn gồm:  </h3>
                                <div className="space-y-4 bg-gray-50 rounded-xl p-5">
                                    <div className="border-l-4 border-amber-400 pl-4">
                                        <h4 className="font-semibold text-amber-600">📁 Giai đoạn 1: Khảo sát & Phân tích (15 ngày)</h4>
                                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                Phỏng vấn Stakeholders (3 ngày)
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                Viết tài liệu SRS (7 ngày)
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                Chốt tài liệu PTYC (5 ngày)
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="border-l-4 border-amber-400 pl-4">
                                        <h4 className="font-semibold text-amber-600">📁 Giai đoạn 2: Thiết kế Giải pháp (20 ngày)</h4>
                                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                Thiết kế Database (10 ngày)
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Gantt Preview */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-4 uppercase text-sm">Biểu đồ Gantt tự động (Dự kiến)</h3>
                                <div className="space-y-3 bg-gray-50 rounded-xl p-5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-24">Giai đoạn 1</span>
                                        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-24">- Phỏng vấn</span>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-24">- Viết SRS</span>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-24">Giai đoạn 2</span>
                                        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-3">
                                    * Quan hệ phụ thuộc (Dependancy) đã được thiết lập tự động: Finish-to-Start.
                                </p>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="mt-8 p-5 bg-blue-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-blue-600 text-xl">📅</span>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu thực tế cho dự án:</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Hệ thống tính toán: Dự án sẽ kết thúc vào <span className="font-bold text-emerald-600">{calculateEndDate()}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    (Dựa trên tổng 145 ngày làm việc và các mối quan hệ phụ thuộc)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn tất thiết lập!</h2>
                        <p className="text-gray-500 mb-6">Template đã được lưu. Bạn có thể giao việc và kích hoạt ngay.</p>
                        <div className="inline-flex gap-4">
                            <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                                Giao việc sau
                            </button>
                            <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                                Kích hoạt ngay
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentStep === 1 && !selectedTemplateId}
                    className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${currentStep === 1 && !selectedTemplateId
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                >
                    {currentStep === 4 ? 'Hoàn tất' : currentStep === 3 ? 'Tiếp theo: Giao việc' : 'Tiếp theo'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

        </>
    );
};

export default AddTemplateWizard;

