import React, { useState } from 'react';
import type { FlowStep } from '../../../data/workflow.data';
import { mockRoles } from '../../../data/workflow.data';

interface FlowColumnConfigProps {
    isOpen: boolean;
    onClose: () => void;
    steps: FlowStep[];
    onSave: (steps: FlowStep[]) => void;
}

const FlowColumnConfig: React.FC<FlowColumnConfigProps> = ({
    isOpen,
    onClose,
    steps,
    onSave,
}) => {
    const [localSteps, setLocalSteps] = useState<FlowStep[]>(steps);
    const [newStepName, setNewStepName] = useState('');
    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAddStep = () => {
        if (!newStepName.trim()) return;
        const newStep: FlowStep = {
            id: `step-${Date.now()}`,
            name: newStepName.toUpperCase(),
            color: '#E5E7EB',
            order: localSteps.length,
            allowedRoles: [],
            requiredFields: [],
        };
        setLocalSteps([...localSteps, newStep]);
        setNewStepName('');
    };

    const handleDeleteStep = (stepId: string) => {
        setLocalSteps(localSteps.filter(s => s.id !== stepId));
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= localSteps.length) return;

        const newSteps = [...localSteps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        newSteps.forEach((step, i) => (step.order = i));
        setLocalSteps(newSteps);
    };

    const updateStep = (stepId: string, updates: Partial<FlowStep>) => {
        setLocalSteps(localSteps.map(s =>
            s.id === stepId ? { ...s, ...updates } : s
        ));
    };

    const toggleRole = (stepId: string, role: string) => {
        const step = localSteps.find(s => s.id === stepId);
        if (!step) return;

        const newRoles = step.allowedRoles.includes(role)
            ? step.allowedRoles.filter(r => r !== role)
            : [...step.allowedRoles, role];

        updateStep(stepId, { allowedRoles: newRoles });
    };

    const toggleRequiredField = (stepId: string, field: string) => {
        const step = localSteps.find(s => s.id === stepId);
        if (!step) return;

        const newFields = step.requiredFields.includes(field)
            ? step.requiredFields.filter(f => f !== field)
            : [...step.requiredFields, field];

        updateStep(stepId, { requiredFields: newFields });
    };

    const handleSave = () => {
        onSave(localSteps);
        onClose();
    };

    const colorOptions = [
        '#FEF3C7', '#E0E7FF', '#D1FAE5', '#DBEAFE',
        '#FCE7F3', '#FEE2E2', '#F3E8FF', '#E5E7EB',
    ];

    const fieldOptions = [
        { value: 'title', label: 'Tiêu đề' },
        { value: 'assignee', label: 'Người thực hiện' },
        { value: 'priority', label: 'Độ ưu tiên' },
        { value: 'description', label: 'Mô tả' },
        { value: 'dueDate', label: 'Ngày hết hạn' },
        { value: 'tags', label: 'Tags' },
    ];

    return (
        <div className="flow-config-overlay">
            <div className="flow-config-modal">
                <div className="flow-config-header">
                    <h2>Cấu hình các bước</h2>
                    <button onClick={onClose} className="flow-config-close">×</button>
                </div>

                <div className="flow-config-body">
                    <div className="flow-config-steps">
                        {localSteps.map((step, index) => (
                            <div key={step.id} className="flow-config-step-wrapper">
                                {/* Step Header / Basic Info */}
                                <div className="flow-config-step-item">
                                    <div className="flow-config-step-order">
                                        <button
                                            onClick={() => handleMoveStep(index, 'up')}
                                            disabled={index === 0}
                                            className="flow-config-arrow"
                                        >↑</button>
                                        <button
                                            onClick={() => handleMoveStep(index, 'down')}
                                            disabled={index === localSteps.length - 1}
                                            className="flow-config-arrow"
                                        >↓</button>
                                    </div>

                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => updateStep(step.id, { name: e.target.value.toUpperCase() })}
                                        className="flow-config-step-input"
                                    />

                                    <div className="flow-config-colors">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                className={`flow-config-color ${step.color === color ? 'selected' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => updateStep(step.id, { color })}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                                        className={`flow-config-expand ${expandedStepId === step.id ? 'active' : ''}`}
                                        title="Cấu hình nâng cao"
                                    >
                                        ⚙️
                                    </button>

                                    <button
                                        onClick={() => handleDeleteStep(step.id)}
                                        className="flow-config-delete"
                                    >🗑</button>
                                </div>

                                {/* Advanced Config Panel */}
                                {expandedStepId === step.id && (
                                    <div className="flow-config-advanced">
                                        {/* WIP Limits */}
                                        <div className="flow-config-group">
                                            <label>Giới hạn WIP (Min - Max)</label>
                                            <div className="flow-config-wip-inputs">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={step.wipMin || ''}
                                                    onChange={(e) => updateStep(step.id, { wipMin: e.target.value ? Number(e.target.value) : undefined })}
                                                    className="flow-input-small"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={step.wipMax || ''}
                                                    onChange={(e) => updateStep(step.id, { wipMax: e.target.value ? Number(e.target.value) : undefined })}
                                                    className="flow-input-small"
                                                />
                                            </div>
                                        </div>

                                        {/* Allowed Roles */}
                                        <div className="flow-config-group">
                                            <label>Roles được phép thả vào</label>
                                            <div className="flow-config-checkboxes">
                                                {mockRoles.map(role => (
                                                    <label key={role} className="flow-checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={step.allowedRoles?.includes(role) || false}
                                                            onChange={() => toggleRole(step.id, role)}
                                                        />
                                                        {role}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Required Fields */}
                                        <div className="flow-config-group">
                                            <label>Trường bắt buộc nhập</label>
                                            <div className="flow-config-checkboxes">
                                                {fieldOptions.map(field => (
                                                    <label key={field.value} className="flow-checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={step.requiredFields?.includes(field.value) || false}
                                                            onChange={() => toggleRequiredField(step.id, field.value)}
                                                        />
                                                        {field.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="flow-config-group" style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleDeleteStep(step.id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#fee2e2',
                                                        color: '#dc2626',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '6px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <span>🗑</span> Xóa cột này
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add New Step */}
                    <div className="flow-config-add">
                        <input
                            type="text"
                            value={newStepName}
                            onChange={(e) => setNewStepName(e.target.value)}
                            placeholder="Tên bước mới..."
                            className="flow-config-add-input"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                        />
                        <button onClick={handleAddStep} className="flow-config-add-btn">
                            + Thêm bước
                        </button>
                    </div>
                </div>

                <div className="flow-config-footer">
                    <button onClick={onClose} className="flow-config-cancel">Hủy</button>
                    <button onClick={handleSave} className="flow-config-save">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

export default FlowColumnConfig;
