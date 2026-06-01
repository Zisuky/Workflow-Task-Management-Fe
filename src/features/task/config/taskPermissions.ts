/**
 * Feature codes for task-related permission gates.
 * Values must match the `code` column in the backend `feature` table.
 *
 * Usage:
 *   const { can, isLoading: featuresLoading } = useFeatures();
 *   const canUpdate = !featuresLoading && can(TASK_PERMISSIONS.UPDATE);
 *   // ...
 *   {canUpdate && <button onClick={handleSave}>Cập nhật</button>}
 */
export const TASK_PERMISSIONS = {
  UPDATE: 'TASK_UPDATE',
  DELETE: 'TASK_DELETE',
  // Extend here as new feature codes are added:
  // CREATE: 'TASK_CREATE',
  // VIEW:   'TASK_VIEW',
} as const;

export type TaskPermissionKey = keyof typeof TASK_PERMISSIONS;
export type TaskPermissionCode = (typeof TASK_PERMISSIONS)[TaskPermissionKey];
