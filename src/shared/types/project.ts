// Mirrors BE Project entity
export interface Project {
  id: string;
  code: string;       // projectCode from BE
  name: string;
  manager: string;    // resolved from ProjectMember with role === "LEADER"
  assignee: string;   // resolved from ProjectMember userId list
  isPinned: boolean;
  description?: string;
  workflowId?: string | null;
  startDate?: string | null; // from project_detail.start_date
  endDate?: string | null;   // from project_detail.end_date
}

// Maps to BE CreateProjectRequest DTO
// Removed: code, group, startDate, endDate (not in BE DTO)
export interface CreateProjectInput {
  name: string;
  description: string;
  manager: string;    
  members: string;   
  leaderId: string;
  memberIds: string[];
  workflowId?: string;
  startDate?: string;
  endDate?: string;
}
