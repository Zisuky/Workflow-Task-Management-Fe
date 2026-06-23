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
  statusId?: string | null;      // project_status.id
  statusCode?: string | null;    // "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
  statusName?: string | null;    // "Đang thực hiện" | ...
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
