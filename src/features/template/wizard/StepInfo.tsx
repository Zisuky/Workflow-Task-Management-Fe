import React from 'react';

interface Props {
  name: string;
  description: string;
  isDefault: boolean;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onToggleDefault: () => void;
}

const StepInfo: React.FC<Props> = ({ name, description, isDefault, onNameChange, onDescriptionChange, onToggleDefault }) => (
  <div className="space-y-5">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Tên template <span className="text-red-500">*</span>
      </label>
      <input type="text" value={name} onChange={e => onNameChange(e.target.value)} autoFocus
        placeholder="VD: Quy trình phát triển phần mềm"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
      <textarea value={description} onChange={e => onDescriptionChange(e.target.value)} rows={3}
        placeholder="Mô tả ngắn về workflow này..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all resize-none" />
    </div>

    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onToggleDefault}>
      <div className="relative flex-shrink-0" style={{ width: 40, height: 22 }}>
        <div className={`absolute inset-0 rounded-full transition-colors ${isDefault ? 'bg-[#F79E61]' : 'bg-gray-200'}`} />
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDefault ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-gray-700">Đặt làm workflow mặc định</span>
    </div>
  </div>
);

export default StepInfo;
