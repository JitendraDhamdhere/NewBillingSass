'use client'

import React, { useState } from 'react'
import { Plus, Search, User, AlertCircle, Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react'
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/services/customer-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Customer {
  id: string
  business_id: string
  name: string | null
  mobile: string | null
  email: string | null
  address: string | null
  customer_type: 'REGULAR' | 'WAL_IN'
  possible_duplicate: boolean
  created_at: string
}

interface CustomersClientProps {
  initialCustomers: Customer[]
  businessId: string
}

export default function CustomersClient({ initialCustomers, businessId }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [customerType, setCustomerType] = useState<'REGULAR' | 'WAL_IN'>('REGULAR')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.mobile && c.mobile.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    )
  })

  const openCreateModal = () => {
    setEditingCustomer(null)
    setName('')
    setMobile('')
    setEmail('')
    setAddress('')
    setCustomerType('REGULAR')
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setName(customer.name || '')
    setMobile(customer.mobile || '')
    setEmail(customer.email || '')
    setAddress(customer.address || '')
    setCustomerType(customer.customer_type)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (editingCustomer) {
      const res = await updateCustomer(businessId, editingCustomer.id, {
        name,
        mobile,
        email,
        address,
        customer_type: customerType,
      })

      if (res.success && res.data) {
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? (res.data as any) : c)))
        setIsModalOpen(false)
      } else if (res.errors) {
        setErrors(res.errors as any)
      }
    } else {
      const res = await createCustomer(businessId, {
        name,
        mobile,
        email,
        address,
        customer_type: customerType,
      })

      if (res.success && res.data) {
        setCustomers((prev) => [res.data as any, ...prev])
        setIsModalOpen(false)
      } else if (res.errors) {
        setErrors(res.errors as any)
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    const res = await deleteCustomer(businessId, id)
    if (res.success) {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    } else if (res.error) {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers CRM</h2>
          <p className="text-sm text-muted-foreground">Manage your regular and walk-in customer records.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, mobile, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customers List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {customer.name ? customer.name[0].toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">
                      {customer.name || 'Walk-in Customer'}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        customer.customer_type === 'REGULAR'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {customer.customer_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(customer)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)} className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                  </Button>
                </div>
              </div>

              {customer.possible_duplicate && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Possible duplicate mobile number detected</span>
                </div>
              )}

              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {customer.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{customer.mobile}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium">No customers found</p>
            <p className="text-xs">Add your first regular customer to start billing.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20">
                {errors._form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Customer Type</Label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="customer_type"
                      checked={customerType === 'REGULAR'}
                      onChange={() => setCustomerType('REGULAR')}
                      className="accent-primary"
                    />
                    Regular Customer
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="customer_type"
                      checked={customerType === 'WAL_IN'}
                      onChange={() => setCustomerType('WAL_IN')}
                      className="accent-primary"
                    />
                    Walk-in Customer
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="cust-name">Full Name {customerType === 'REGULAR' && <span className="text-destructive">*</span>}</Label>
                <Input
                  id="cust-name"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="cust-mobile">Mobile Number {customerType === 'REGULAR' && <span className="text-destructive">*</span>}</Label>
                <Input
                  id="cust-mobile"
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <Label htmlFor="cust-email">Email Address (Optional)</Label>
                <Input
                  id="cust-email"
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="cust-address">Address / City (Optional)</Label>
                <Input
                  id="cust-address"
                  placeholder="e.g. Shop 4, MG Road, Mumbai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
