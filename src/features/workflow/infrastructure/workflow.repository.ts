import type { Workflow, WorkflowStep, WorkflowStepColorConfig } from '../domain/workflow.entity';
import { workflowApi } from './workflow.client';

const PASTEL_PALETTE = [
  '#FEF3C7', // amber-100
  '#D1FAE5', // emerald-100
  '#DBEAFE', // blue-100
  '#FCE7F3', // pink-100
  '#E0E7FF', // indigo-100
  '#FED7AA', // orange-100
  '#F3E8FF', // purple-100
  '#CCFBF1', // teal-100
];

const COLOR_STORAGE_PREFIX = 'workflow_step_colors_';

export const loadStepColors = (workflowId: string): WorkflowStepColorConfig => {
  try {
    const raw = localStorage.getItem(COLOR_STORAGE_PREFIX + workflowId);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStepColors = (workflowId: string, config: WorkflowStepColorConfig): void => {
  try {
    localStorage.setItem(COLOR_STORAGE_PREFIX + workflowId, JSON.stringify(config));
  } catch {}
};

export const workflowRepository = {
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const res = await workflowApi.getAll() as unknown as { data?: Workflow[] } | Workflow[];
      if (Array.isArray(res)) return res;
      const inner = (res as { data?: Workflow[] }).data;
      return Array.isArray(inner) ? inner : [];
    } catch {
      return [];
    }
  },

  async getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
    try {
      const [mappingsRaw, detailsRaw] = await Promise.all([
        workflowApi.getStatusMappings(workflowId) as unknown,
        workflowApi.getStatusDetails(workflowId) as unknown,
      ]);

      const unwrap = (raw: unknown): unknown[] => {
        if (Array.isArray(raw)) return raw;
        const r = raw as Record<string, unknown>;
        if (Array.isArray(r?.data)) return r.data as unknown[];
        return [];
      };

      const mappings = unwrap(mappingsRaw) as Array<{
        id: string;
        statusId: string;
        sortOrder: number | null;
        isFinal: boolean | null;
      }>;
      const details = unwrap(detailsRaw) as Array<{ id: string; code: string; name: string }>;

      const savedColors = loadStepColors(workflowId);

      return mappings
        .map((mapping, idx) => {
          const detail = details.find(d => d.id === mapping.statusId);
          const color = savedColors[mapping.statusId] ?? PASTEL_PALETTE[idx % PASTEL_PALETTE.length];
          return {
            id: mapping.id,
            statusId: mapping.statusId,
            name: detail?.name ?? mapping.statusId,
            code: detail?.code ?? '',
            sortOrder: mapping.sortOrder ?? idx,
            color,
            isFinal: mapping.isFinal ?? false,
          } satisfies WorkflowStep;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      return [];
    }
  },

  async updateStepSortOrder(
    workflowId: string,
    workflowStatusId: string,
    sortOrder: number
  ): Promise<void> {
    await workflowApi.updateSortOrder(workflowId, workflowStatusId, sortOrder);
  },
};
