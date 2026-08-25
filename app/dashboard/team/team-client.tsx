'use client'

import React, { useState } from 'react'
import {
  Users,
  Shield,
  UserPlus,
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  History,
  Sliders,
  AlertTriangle,
} from 'lucide-react'
import {
  inviteTeamMember,
  updateMemberRole,
  removeTeamMember,
  updatePermissionMatrix,
} from '@/lib/services/team-service'
import { getDefaultRolePermissions, PermissionResource, UserRole } from '@/lib/auth/rbac'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TeamClientProps {
  members: any[]
  permissions: any[]
  auditLogs: any[]
  currentUserRole: UserRole
  currentUserId: string
  currentUserEmail: string
  businessId: string
  businessName: string
}

const RESOURCES: PermissionResource[] = [
  'invoices',
  'receipts',
  'payments',
  'expenses',
  'loans',
  'reports',
  'settings',
]

export default function TeamClient({
  members: initialMembers,
  permissions: initialPermissions,
  auditLogs: initialAuditLogs,
  currentUserRole,
  currentUserId,
  currentUserEmail,
  businessId,
  businessName,
}: TeamClientProps) {
  const [members, setMembers] = useState(initialMembers)
  const [permissions, setPermissions] = useState(initialPermissions)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'MATRIX' | 'AUDIT'>('MEMBERS')

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('STAFF')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const isOwner = currentUserRole === 'OWNER'

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError('')

    const res = await inviteTeamMember(businessId, currentUserId, currentUserEmail, inviteEmail, inviteRole)
    if (res.success && res.data) {
      setMembers((prev) => [...prev, res.data])
      setIsInviteModalOpen(false)
      setInviteEmail('')
    } else if (res.error) {
      setInviteError(res.error)
    }
    setInviteLoading(false)
  }

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (!isOwner) return
    const res = await updateMemberRole(businessId, currentUserId, currentUserEmail, memberId, newRole)
    if (res.success && res.data) {
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)))
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!isOwner) return
    if (!confirm('Are you sure you want to revoke access for this team member?')) return

    const res = await removeTeamMember(businessId, currentUserId, currentUserEmail, memberId)
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
  }

  const handlePermissionToggle = async (
    role: 'ACCOUNTANT' | 'STAFF',
    resource: PermissionResource,
    actionKey: string,
    currentValue: boolean
  ) => {
    if (!isOwner) return

    const newPerms = { [actionKey]: !currentValue }

    const res = await updatePermissionMatrix(
      businessId,
      currentUserId,
      currentUserEmail,
      role,
      resource,
      newPerms
    )

    if (res.success && res.data) {
      setPermissions((prev) => {
        const existingIdx = prev.findIndex((p) => p.role === role && p.resource === resource)
        if (existingIdx >= 0) {
          const copy = [...prev]
          copy[existingIdx] = res.data
          return copy
        }
        return [...prev, res.data]
      })
    }
  }

  // Get effective permission for display in Matrix
  const getEffPerm = (role: 'ACCOUNTANT' | 'STAFF', resource: PermissionResource) => {
    const found = permissions.find((p) => p.role === role && p.resource === resource)
    const defaults = getDefaultRolePermissions(role, resource)
    if (!found) return defaults
    return {
      can_view: found.can_view ?? defaults.can_view,
      can_create: found.can_create ?? defaults.can_create,
      can_edit: found.can_edit ?? defaults.can_edit,
      can_delete: found.can_delete ?? defaults.can_delete,
      can_print: found.can_print ?? defaults.can_print,
      can_export: found.can_export ?? defaults.can_export,
      can_whatsapp: found.can_whatsapp ?? defaults.can_whatsapp,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management & Access Security</h2>
          <p className="text-sm text-muted-foreground">Manage employee roles, configurable permission matrix, and real-time audit trail.</p>
        </div>

        {isOwner && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-1.5 font-bold text-xs">
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'MEMBERS' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" /> Team Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'MATRIX' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-4 w-4" /> Configurable Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'AUDIT' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" /> Immutable Audit Trail
        </button>
      </div>

      {/* TAB 1: TEAM MEMBERS LIST */}
      {activeTab === 'MEMBERS' && (
        <Card className="p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Date Added</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono font-semibold text-foreground">{m.user_id}</td>
                    <td className="p-3">
                      {isOwner ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value as UserRole)}
                          className="bg-background border rounded px-2 py-1 text-xs font-bold"
                        >
                          <option value="OWNER">OWNER</option>
                          <option value="ACCOUNTANT">ACCOUNTANT</option>
                          <option value="STAFF">STAFF</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold bg-secondary uppercase">{m.role}</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono">{m.created_at?.split('T')[0]}</td>
                    <td className="p-3 text-right">
                      {isOwner && m.role !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: CONFIGURABLE PERMISSION MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base">Owner-Configurable Permission Matrix</h3>
              <p className="text-xs text-muted-foreground">Toggle fine-grained actions for Accountant and Staff roles. Owner maintains 100% full access.</p>
            </div>

            {['ACCOUNTANT', 'STAFF'].map((roleKey) => (
              <div key={roleKey} className="space-y-3 pt-4 border-t">
                <h4 className="font-bold text-xs uppercase text-primary tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Role: {roleKey}
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
                        <th className="p-2.5">Resource</th>
                        <th className="p-2.5 text-center">VIEW</th>
                        <th className="p-2.5 text-center">CREATE</th>
                        <th className="p-2.5 text-center">EDIT</th>
                        <th className="p-2.5 text-center">DELETE</th>
                        <th className="p-2.5 text-center">PRINT</th>
                        <th className="p-2.5 text-center">EXPORT</th>
                        <th className="p-2.5 text-center">WHATSAPP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      {RESOURCES.map((r) => {
                        const eff = getEffPerm(roleKey as any, r)
                        return (
                          <tr key={r} className="hover:bg-muted/20">
                            <td className="p-2.5 font-sans font-bold capitalize">{r}</td>

                            {['can_view', 'can_create', 'can_edit', 'can_delete', 'can_print', 'can_export', 'can_whatsapp'].map(
                              (actionKey) => (
                                <td key={actionKey} className="p-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    disabled={!isOwner}
                                    checked={(eff as any)[actionKey]}
                                    onChange={() =>
                                      handlePermissionToggle(roleKey as any, r, actionKey, (eff as any)[actionKey])
                                    }
                                    className="h-4 w-4 rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Immutable System Audit Logs</h3>
              <p className="text-xs text-muted-foreground">Complete historical trail of financial, operational, and security permission actions.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">User / Actor</th>
                  <th className="p-3">Safe Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-primary/10 text-primary text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold font-sans">{log.entity_type}</td>
                    <td className="p-3 text-muted-foreground">{log.entity_id || '-'}</td>
                    <td className="p-3 font-sans text-foreground">{log.user_email || log.user_id || 'System'}</td>
                    <td className="p-3 text-[11px] text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground font-sans">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Invite Team Member
            </h3>
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold">Employee Email Address *</label>
                <Input
                  type="email"
                  required
                  placeholder="employee@business.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold">Assigned Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full mt-1 p-2 border rounded text-xs bg-background font-bold"
                >
                  <option value="ACCOUNTANT">ACCOUNTANT (Financial & Reporting)</option>
                  <option value="STAFF">STAFF (Operational Billing & Receipts)</option>
                  <option value="OWNER">OWNER (Full Admin Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteLoading} className="font-bold">
                  {inviteLoading ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
