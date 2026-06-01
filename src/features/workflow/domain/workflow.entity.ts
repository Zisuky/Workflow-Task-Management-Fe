// Workflow domain entities — aligned with BE TaskStatus + WorkflowStatus entities

/** A step/column in a workflow, resolved from WorkflowStatus + TaskStatus */
export interface WorkflowStep {
  id: string;          // WorkflowStatus.id
  statusId: string;    // TaskStatus.id
  name: string;        // TaskStatus.name (display)
  code: string;        // TaskStatus.code (e.g. NOT_STARTED, IN_PROGRESS)
  sortOrder: number;   // WorkflowStatus.sortOrder
  color: string;       // UI-only pastel color (stored in localStorage per workflow)
  isFinal: boolean;    // WorkflowStatus.isFinal — marks terminal/completion stage
}

/** Minimal workflow info from GET /api/workflows */
export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt?: string;
}

/** Color config stored locally per workflow step */
export interface WorkflowStepColorConfig {
  [statusId: string]: string; // statusId → pastel hex color
}
