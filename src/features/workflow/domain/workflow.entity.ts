export interface FlowStep {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  assignee: string;
  status: string;
}
