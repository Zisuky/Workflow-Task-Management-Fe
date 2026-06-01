import React from 'react';
import type { SelectedStage } from './types';
import { getColor } from './types';

interface Props {
  name: string;
  description: string;
  isDefault: boolean;
  selectedStages: SelectedStage[];
}

const StepReview: React.FC<Props> = ({ name, description, isDefault, selectedStages }) => (
  <div className="space-y-5">
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Thông tin workflow</h3>
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">Tên</span>
          <span className="text-sm font-semibold text-gray-800">{name}</span>
        </div>
        {description && (
          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">Mô tả</span>
            <span className="text-sm text-gray-600">{description}</span>
          </div>
        )}
        <div className="flex items-start gap-3">
          <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">Mặc định</span>
          <span className={`text-sm font-medium ${isDefault ? 'text-green-600' : 'text-gray-500'}`}>
            {isDefault ? '✓ Có' : 'Không'}
          </span>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Giai đoạn ({selectedStages.length})
      </h3>
      {selectedStages.length === 0 ? (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
          ⚠️ Chưa có giai đoạn nào. Quay lại bước 2 để thêm.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selectedStages.map((stage, i) => (
            <div key={stage.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: getColor(i), color: '#374151' }}>
              <span className="text-xs text-gray-400 font-mono">{i + 1}.</span>
              {stage.name}
              {stage.isNew && <span className="text-xs text-[#F79E61]">(mới)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default StepReview;
