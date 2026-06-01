import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowApi, type WorkflowStatusDetail } from '../workflow/infrastructure/workflow.client';
import type { Workflow } from '../workflow/domain/workflow.entity';
import { useToast } from '../../ui/toast';
import StepStages from './wizard/StepStages';
import type { SelectedStage } from './wizard/types';

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedStages, setSelectedStages] = useState<SelectedStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mappings, setMappings] = useState<any[]>([]);

  // We keep a copy of original to detect changes
  const [originalStages, setOriginalStages] = useState<SelectedStage[]>([]);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  const loadData = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const wfRes = await workflowApi.getById(workflowId) as unknown;
      const wf = (wfRes as { data?: Workflow }).data ?? (wfRes as Workflow);
      setWorkflow(wf);

      // Fetch statuses
      const detailsRes = await workflowApi.getStatusDetails(workflowId) as unknown;
      const rawDetails = detailsRes as { data?: WorkflowStatusDetail[] } | WorkflowStatusDetail[];
      const detailsList = Array.isArray(rawDetails) ? rawDetails : (rawDetails.data || []);

      const mappingsRes = await workflowApi.getStatusMappings(workflowId) as unknown;
      const rawMappings = mappingsRes as { data?: any[] } | any[];
      const mappingsList = Array.isArray(rawMappings) ? rawMappings : (rawMappings.data || []);
      
      setMappings(mappingsList);

      const stages: SelectedStage[] = detailsList.map(d => {
        const mapping = mappingsList.find(m => m.taskStatusId === d.id || m.statusId === d.id);
        const sortOrder = mapping?.sortOrder ?? d.sortOrder ?? 0;
        return {
          key: d.id,
          statusId: d.id,
          name: d.name,
          sortOrder
        };
      }).sort((a, b) => a.sortOrder - b.sortOrder);

      setSelectedStages(stages);
      setOriginalStages(stages);
    } catch (err) {
      toast.error('Không thể tải chi tiết template');
      navigate('/template');
    } finally {
      setIsLoading(false);
    }
  };

  const isStatusSelected = (statusId: string) =>
    selectedStages.some(s => s.statusId === statusId);

  const toggleStatus = (statusId: string, name: string) => {
    if (isStatusSelected(statusId)) {
      setSelectedStages(prev => prev.filter(s => s.statusId !== statusId));
    } else {
      setSelectedStages(prev => [...prev, { key: statusId, statusId, name }]);
    }
  };

  const removeStage = (key: string) => {
    setSelectedStages(prev => prev.filter(s => s.key !== key));
  };

  const reorderStages = (stages: SelectedStage[]) => {
    setSelectedStages(stages);
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      // 1. Find removed stages (in original but not in selected)
      const removed = originalStages.filter(orig => !selectedStages.some(sel => sel.statusId === orig.statusId));
      for (const r of removed) {
        if (r.statusId) {
          await workflowApi.removeStatus(id, r.statusId);
        }
      }

      // 2. Find added stages (in selected but not in original)
      const added = selectedStages.filter(sel => !originalStages.some(orig => orig.statusId === sel.statusId));
      for (const a of added) {
        if (a.statusId) {
          const index = selectedStages.findIndex(s => s.statusId === a.statusId);
          await workflowApi.addStatus(id, a.statusId, index, index === selectedStages.length - 1);
        }
      }

      // 3. Re-fetch mappings to get the correct mapping IDs for all stages
      const mappingsRes = await workflowApi.getStatusMappings(id) as unknown;
      const rawMappings = mappingsRes as { data?: any[] } | any[];
      const mappingsList = Array.isArray(rawMappings) ? rawMappings : (rawMappings.data || []);

      // 4. Update sort orders for all stages
      for (let i = 0; i < selectedStages.length; i++) {
        const stage = selectedStages[i];
        // find mapping
        const mapping = mappingsList.find(m => m.taskStatusId === stage.statusId || m.statusId === stage.statusId);
        if (mapping && mapping.id) {
           await workflowApi.updateSortOrder(id, mapping.id, i);
        }
      }

      toast.success('Cập nhật template thành công');
      loadData(id); // reload data
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại. Vui lòng thử lại');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-200 rounded-full animate-spin border-t-[#F79E61]" />
      </div>
    );
  }

  if (!workflow) return null;

  const hasChanges = JSON.stringify(selectedStages) !== JSON.stringify(originalStages);

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/template')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quay lại"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{workflow.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{workflow.description || 'Chưa có mô tả'}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button
             onClick={handleSave}
             disabled={!hasChanges || isSaving}
             className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
               hasChanges && !isSaving
                 ? 'bg-gradient-to-r from-[#F79E61] to-[#f0884a] text-white hover:from-[#e88d50] hover:to-[#e07d3a] shadow-sm'
                 : 'bg-gray-100 text-gray-400 cursor-not-allowed'
             }`}
           >
             {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Cấu hình giai đoạn (Steps)</h2>
        <StepStages
          selectedStages={selectedStages}
          isStatusSelected={isStatusSelected}
          onToggle={toggleStatus}
          onAddNew={() => {}}
          onRename={() => {}}
          onRemove={removeStage}
          onReorder={reorderStages}
          allowCreate={false}
        />
      </div>
    </div>
  );
};

export default TemplateDetailPage;
