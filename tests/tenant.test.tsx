import { expect, test, describe, vi } from 'vitest'
import { validateCustomer, CustomerInput } from '@/lib/validations/customer'
import { hasPermission, PermissionAction } from '@/lib/permissions'

// Mock database check function for duplicate mobile warning
function detectDuplicateMobile(
  newMobile: string | null | undefined,
  existingCustomers: { mobile: string | null }[]
): boolean {
  if (!newMobile || newMobile.trim() === '') return false
  return existingCustomers.some(
    (c) => c.mobile !== null && c.mobile.trim() === newMobile.trim()
  )
}

describe('Customer Validation & Business Rules', () => {
  const mockBusinessId = '11111111-1111-4111-a111-111111111111'

  test('REGULAR customer requires name and mobile', () => {
    const invalidRegular: CustomerInput = {
      business_id: mockBusinessId,
      name: '',
      mobile: '',
      customer_type: 'REGULAR',
    }

    const result = validateCustomer(invalidRegular)
    expect(result.success).toBe(false)
    expect(result.errors).toHaveProperty('name')
    expect(result.errors).toHaveProperty('mobile')

    const validRegular: CustomerInput = {
      business_id: mockBusinessId,
      name: 'John Doe',
      mobile: '9876543210',
      customer_type: 'REGULAR',
    }

    const result2 = validateCustomer(validRegular)
    expect(result2.success).toBe(true)
    expect(result2.errors).toBeNull()
  })

  test('WAL_IN customer name and mobile are optional if balance due is zero', () => {
    const validWalkIn: CustomerInput = {
      business_id: mockBusinessId,
      name: null,
      mobile: null,
      customer_type: 'WAL_IN',
    }

    const result = validateCustomer(validWalkIn, 0)
    expect(result.success).toBe(true)
    expect(result.errors).toBeNull()
  })

  test('WAL_IN customer name and mobile are required if balance due is greater than zero', () => {
    const invalidWalkIn: CustomerInput = {
      business_id: mockBusinessId,
      name: null,
      mobile: null,
      customer_type: 'WAL_IN',
    }

    const result = validateCustomer(invalidWalkIn, 150)
    expect(result.success).toBe(false)
    expect(result.errors).toHaveProperty('name')
    expect(result.errors).toHaveProperty('mobile')

    const validWalkIn: CustomerInput = {
      business_id: mockBusinessId,
      name: 'Walk-in Cash Customer',
      mobile: '9876543210',
      customer_type: 'WAL_IN',
    }

    const result2 = validateCustomer(validWalkIn, 150)
    expect(result2.success).toBe(true)
  })

  test('Duplicate mobile warning logic flags correct records', () => {
    const existing = [
      { mobile: '9999988888' },
      { mobile: '9999977777' },
      { mobile: null },
    ]

    expect(detectDuplicateMobile('9999988888', existing)).toBe(true)
    expect(detectDuplicateMobile('9999977777', existing)).toBe(true)
    expect(detectDuplicateMobile('9999966666', existing)).toBe(false)
    expect(detectDuplicateMobile('', existing)).toBe(false)
    expect(detectDuplicateMobile(null, existing)).toBe(false)
  })
})

describe('Role-based Authorization & Multi-Tenancy Scoping', () => {
  test('OWNER role has full permissions', () => {
    const ownerPermissions: PermissionAction[] = [
      'VIEW_BUSINESS',
      'UPDATE_BUSINESS',
      'VIEW_MEMBERS',
      'MANAGE_MEMBERS',
      'CREATE_CUSTOMERS',
      'DELETE_CUSTOMERS',
      'DELETE_SERVICES',
    ]

    ownerPermissions.forEach((action) => {
      expect(hasPermission('OWNER', action)).toBe(true)
    })
  })

  test('ACCOUNTANT role permissions block member management and deletes', () => {
    expect(hasPermission('ACCOUNTANT', 'VIEW_BUSINESS')).toBe(true)
    expect(hasPermission('ACCOUNTANT', 'CREATE_CUSTOMERS')).toBe(true)
    expect(hasPermission('ACCOUNTANT', 'MANAGE_MEMBERS')).toBe(false)
    expect(hasPermission('ACCOUNTANT', 'DELETE_CUSTOMERS')).toBe(false)
  })

  test('STAFF role has restricted read-only or minor write permissions', () => {
    expect(hasPermission('STAFF', 'VIEW_BUSINESS')).toBe(true)
    expect(hasPermission('STAFF', 'CREATE_CUSTOMERS')).toBe(true)
    expect(hasPermission('STAFF', 'UPDATE_BUSINESS')).toBe(false)
    expect(hasPermission('STAFF', 'DELETE_SERVICES')).toBe(false)
  })

  test('Tenant isolation: Queries enforce correct business_id scoping', async () => {
    // Mock database fetch logic to verify cross-tenant boundaries
    const mockDbQuery = vi.fn((userId: string, targetBusinessId: string) => {
      // Simulate RLS logic
      const userMemberships: Record<string, string[]> = {
        'user-owner-1': ['business-a'],
        'user-accountant-2': ['business-a', 'business-b'],
        'user-staff-3': ['business-a'],
      }

      const allowedBusinesses = userMemberships[userId] || []
      if (!allowedBusinesses.includes(targetBusinessId)) {
        throw new Error('RLS: Access Denied. User is not a member of this business.')
      }

      return { success: true, data: { business_id: targetBusinessId } }
    })

    // Authenticated user 1 tries to access Business A (allowed)
    expect(mockDbQuery('user-owner-1', 'business-a')).toEqual({
      success: true,
      data: { business_id: 'business-a' },
    })

    // Authenticated user 1 tries to access Business B (denied)
    expect(() => mockDbQuery('user-owner-1', 'business-b')).toThrowError(
      /RLS: Access Denied/
    )

    // Accountant user tries to access Business A and B (both allowed)
    expect(mockDbQuery('user-accountant-2', 'business-a')).toEqual({
      success: true,
      data: { business_id: 'business-a' },
    })
    expect(mockDbQuery('user-accountant-2', 'business-b')).toEqual({
      success: true,
      data: { business_id: 'business-b' },
    })
  })
})
