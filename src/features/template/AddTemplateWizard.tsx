import React, { useState } from 'react';
import StepIndicator from './wizard/StepIndicatior';
import StepInfo from './wizard/StepInfo';
import StepStages from './wizard/StepStages';
import StepReview from './wizard/StepReview';
import { useWizardState } from './wizard/useWizardState';

interface Props {
  onClose: () => void;
}

const AddTemplateWizard: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const {
    name, setName,
    description, setDescription,
    isDefault, setIsDefault,
    selectedStages,
    isSubmitting,
    isStatusSelected,
    toggleStatus,
    addNewStage,
    renameStage,
    removeStage,
    reorderStages,
    handleSubmit,
  } = useWizardState(onClose);

  const canNext =
    step === 0 ? name.trim().length > 0 :
    step === 1 ? selectedStages.length > 0 :
    false;

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-10 px-4 pb-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Tạo template mới</h1>
              <p className="text-sm text-gray-500 mt-0.5">Thiết lập workflow và các giai đoạn</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <StepIndicator current={step} />
        </div>

        {/* Body */}
        <div className="px-8 pb-6">
          {step === 0 && (
            <StepInfo
              name={name}
              description={description}
              isDefault={isDefault}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onToggleDefault={() => setIsDefault(v => !v)}
            />
          )}

          {step === 1 && (
            <StepStages
              selectedStages={selectedStages}
              isStatusSelected={isStatusSelected}
              onToggle={toggleStatus}
              onAddNew={addNewStage}
              onRename={renameStage}
              onRemove={removeStage}
              onReorder={reorderStages}
            />
          )}

          {step === 2 && (
            <StepReview
              name={name}
              description={description}
              isDefault={isDefault}
              selectedStages={selectedStages}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={step === 0 ? onClose : back}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {step === 0 ? 'Hủy' : '← Quay lại'}
          </button>

          {step < 2 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                canNext
                  ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedStages.length === 0}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isSubmitting && selectedStages.length > 0
                  ? 'bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white hover:from-[#162d4a] hover:to-[#244d73] shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang tạo...
                </span>
              ) : (
                '✓ Kích hoạt template'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTemplateWizard;
