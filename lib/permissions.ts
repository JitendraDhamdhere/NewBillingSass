export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'STAFF'

export type PermissionAction =
  | 'VIEW_BUSINESS'
  | 'UPDATE_BUSINESS'
  | 'VIEW_MEMBERS'
  | 'MANAGE_MEMBERS'
  | 'VIEW_CUSTOMERS'
  | 'CREATE_CUSTOMERS'
  | 'UPDATE_CUSTOMERS'
  | 'DELETE_CUSTOMERS'
  | 'VIEW_SERVICES'
  | 'CREATE_SERVICES'
  | 'UPDATE_SERVICES'
  | 'DELETE_SERVICES'

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  OWNER: [
    'VIEW_BUSINESS',
    'UPDATE_BUSINESS',
    'VIEW_MEMBERS',
    'MANAGE_MEMBERS',
    'VIEW_CUSTOMERS',
    'CREATE_CUSTOMERS',
    'UPDATE_CUSTOMERS',
    'DELETE_CUSTOMERS',
    'VIEW_SERVICES',
    'CREATE_SERVICES',
    'UPDATE_SERVICES',
    'DELETE_SERVICES',
  ],
  ACCOUNTANT: [
    'VIEW_BUSINESS',
    'VIEW_MEMBERS',
    'VIEW_CUSTOMERS',
    'CREATE_CUSTOMERS',
    'UPDATE_CUSTOMERS',
    'VIEW_SERVICES',
    'CREATE_SERVICES',
    'UPDATE_SERVICES',
  ],
  STAFF: [
    'VIEW_BUSINESS',
    'VIEW_CUSTOMERS',
    'CREATE_CUSTOMERS',
    'VIEW_SERVICES',
  ],
}

/**
 * Checks if a user role is authorized to perform an action.
 * 
 * @param role UserRole
 * @param action PermissionAction
 */
export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(action)
}
