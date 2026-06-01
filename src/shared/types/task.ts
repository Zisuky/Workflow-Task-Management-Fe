import type { TaskGroup, TaskPriority, TaskStatus } from './index';

// FE view model for a task — resolved from BE ProjectTask + lookups
export interface Task {
  id: string;
  code: string;       // generated client-side: name prefix + id prefix
  name: string;
  group: TaskGroup;    // resolved from taskGroupId via TaskGroup.name
  status: TaskStatus;  // resolved from statusId via TaskStatus.code → display
  priority: TaskPriority; // resolved from priorityId via TaskPriority.code → display
  manager: string;    // resolved from TaskMember with role LEADER
  assignee: string;   // resolved from TaskMember with role MEMBER
  startDate: string;
  endDate: string;
  description?: string;
  project?: string;   // resolved from projectId via Project.name
  projectId?: string;
  taskGroupId?: string;
  statusId?: string;    // raw UUID from BE — needed for status update
  priorityId?: string;  // raw UUID from BE — needed for priority update
  isPinned?: boolean;
  parentTaskId?: string | null;
  createdAt?: string;
}

// Input for creating a task — maps to BE CreateTaskRequest
export interface CreateTaskInput {
  name: string;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  description?: string;
  projectId?: string;
  assignerId?: string;
  assigneeId?: string;  // comma-separated user IDs
  taskGroupId?: string;
  statusId?: string;
  priorityId?: string;
}


export interface WorkflowStatusId {
  id: string;
  workflowId ?: string;
  statusId ?: string;
  sortOder : Int16Array;
  isFinal : boolean;
}
