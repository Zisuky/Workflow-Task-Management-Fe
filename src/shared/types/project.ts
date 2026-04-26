export interface Project {
  id: string;
  code: string;
  name: string;
  manager: string;
  assignee: string;
  isPinned: boolean;
  group?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateProjectInput {
  name: string;
  code?: string;
  group: string;
  description: string;
  manager: string;
  members: string;
  leaderId: string;
  memberIds: string[];
  startDate: string;
  endDate: string;
}
