import { useState } from 'react';
import type { SelectedStage } from './types';
import { workflowApi, taskStatusApi } from '../../workflow/infrastructure/workflow.client';
import { useToast } from '../../../ui/toast/useToast';

export const useWizardState = (onClose: () => void) => {
  const toast = useToast();

  // Step 1
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Step 2
  const [selectedStages, setSelectedStages] = useState<SelectedStage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStatusSelected = (statusId: string) =>
    selectedStages.some(s => s.statusId === statusId);

  const toggleStatus = (id: string, name: string) => {
    if (isStatusSelected(id)) {
      setSelectedStages(prev => prev.filter(s => s.statusId !== id));
    } else {
      setSelectedStages(prev => [...prev, { key: id, statusId: id, name, isNew: false }]);
    }
  };

  const addNewStage = (stageName: string) => {
    const key = `new-${Date.now()}`;
    setSelectedStages(prev => [...prev, { key, statusId: null, name: stageName, isNew: true }]);
  };

  const renameStage = (key: string, newName: string) =>
    setSelectedStages(prev => prev.map(s => s.key === key ? { ...s, name: newName } : s));

  const removeStage = (key: string) =>
    setSelectedStages(prev => prev.filter(s => s.key !== key));

  const reorderStages = (stages: SelectedStage[]) => setSelectedStages(stages);

  const handleSubmit = async () => {
    if (!name.trim() || selectedStages.length === 0) return;
    setIsSubmitting(true);
    try {
      const wfRes = await workflowApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault,
      }) as unknown;
      const wfData = (wfRes as { data?: { id: string } }).data ?? (wfRes as { id: string });
      const workflowId = wfData.id;
      if (!workflowId) throw new Error('Không nhận được workflow ID');

      const resolved = await Promise.all(
        selectedStages.map(async (stage, index) => {
          if (!stage.isNew && stage.statusId) return { statusId: stage.statusId, sortOrder: index };
          const code = stage.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').substring(0, 20);
          const tsRes = await taskStatusApi.create({
            code: `${code}_${Date.now()}`,
            name: stage.name,
            sortOrder: index,
          }) as unknown;
          const tsData = (tsRes as { data?: { id: string } }).data ?? (tsRes as { id: string });
          return { statusId: tsData.id, sortOrder: index };
        })
      );

      await Promise.all(resolved.map(({ statusId, sortOrder }, index) => {
        const isFinal = index === resolved.length - 1;
        return workflowApi.addStatus(workflowId, statusId, sortOrder, isFinal);
      }));

      toast.success(`Đã tạo template "${name.trim()}" với ${selectedStages.length} giai đoạn`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Tạo template thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
