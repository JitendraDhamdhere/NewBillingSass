export type UserRole = 'OWNER' | 'ACCOUNTANT' | 'STAFF'

export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'PRINT'
  | 'EXPORT'
  | 'WHATSAPP'

export type PermissionResource =
  | 'invoices'
  | 'receipts'
  | 'payments'
  | 'expenses'
  | 'loans'
  | 'reports'
  | 'settings'
  | 'team'

export interface ResourcePermission {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_print: boolean
  can_export: boolean
  can_whatsapp: boolean
}

/**
 * Returns default permission matrix per role
 */
export function getDefaultRolePermissions(role: UserRole, resource: PermissionResource): ResourcePermission {
  if (role === 'OWNER') {
    return {
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
      can_print: true,
      can_export: true,
      can_whatsapp: true,
    }
  }

  if (role === 'ACCOUNTANT') {
    if (resource === 'settings' || resource === 'team') {
      return {
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_print: false,
        can_export: false,
        can_whatsapp: false,
      }
    }
    return {
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: false, // Accountant cannot hard-delete financial history
      can_print: true,
      can_export: true,
      can_whatsapp: true,
    }
  }

  // STAFF Role Defaults
  if (resource === 'invoices' || resource === 'receipts') {
    return {
      can_view: true,
      can_create: true,
      can_edit: false,
      can_delete: false,
      can_print: true,
      can_export: false,
      can_whatsapp: true,
    }
  }

  // Staff cannot access P&L reports, capital loans, business settings, or team management!
  return {
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_print: false,
    can_export: false,
    can_whatsapp: false,
  }
}

/**
 * Evaluates whether a role is authorized for an action on a resource
 */
export function isActionAuthorized(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction,
  customPermission?: Partial<ResourcePermission> | null
): boolean {
  // OWNER always has full access
  if (role === 'OWNER') return true

  const effPerm = {
    ...getDefaultRolePermissions(role, resource),
    ...(customPermission || {}),
  }

  switch (action) {
    case 'VIEW':
      return effPerm.can_view
    case 'CREATE':
      return effPerm.can_create
    case 'EDIT':
      return effPerm.can_edit
    case 'DELETE':
      return effPerm.can_delete
    case 'PRINT':
      return effPerm.can_print
    case 'EXPORT':
      return effPerm.can_export
    case 'WHATSAPP':
      return effPerm.can_whatsapp
    default:
      return false
  }
}
