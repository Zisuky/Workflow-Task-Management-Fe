import type { JobGroup, JobPriority, JobStatus, JobType } from './index';

export interface Job {
  id: string;
  code: string;
  name: string;
  type: JobType;
  group: JobGroup;
  status: JobStatus;
  manager: string;
  assignee: string;
  priority: JobPriority;
  startDate: string;
  estimatedHours: number;
  endDate: string;
  description?: string;
  project?: string;
  projectId?: string;
  typeId?: string;
  taskGroupId?: string;
}

export interface CreateJobInput {
  name: string;
  code?: string;
  type: JobType;
  group: JobGroup;
  manager: string;
  assignee: string;
  priority: JobPriority;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  description?: string;
  project?: string;
  projectId?: string;
  assignerId?: string;
  assigneeId?: string;
  typeId?: string;
  taskGroupId?: string;
}
