
export const TASK_PERMISSIONS = {
  UPDATE: 'TASK_UPDATE',
  DELETE: 'TASK_DELETE',
  // CREATE: 'TASK_CREATE',
  // VIEW:   'TASK_VIEW',
} as const;

export type TaskPermissionKey = keyof typeof TASK_PERMISSIONS;
export type TaskPermissionCode = (typeof TASK_PERMISSIONS)[TaskPermissionKey];
