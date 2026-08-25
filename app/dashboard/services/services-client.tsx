'use client'

import React, { useState } from 'react'
import { Plus, Search, Tag, Edit2, CheckCircle, XCircle } from 'lucide-react'
import { createService, updateService, toggleServiceActive } from '@/lib/services/service-catalog-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ServiceItem {
  id: string
  business_id: string
  name: string
  default_rate: number
  category: string | null
  pricing_mode: 'FIXED' | 'CUSTOM' | 'HOURLY' | 'QUANTITY_BASED'
  is_active: boolean
  created_at: string
}

interface ServicesClientProps {
  initialServices: ServiceItem[]
  businessId: string
}

export default function ServicesClient({ initialServices, businessId }: ServicesClientProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [defaultRate, setDefaultRate] = useState<number>(0)
  const [category, setCategory] = useState('')
  const [pricingMode, setPricingMode] = useState<'FIXED' | 'CUSTOM' | 'HOURLY' | 'QUANTITY_BASED'>('FIXED')
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const filteredServices = services.filter((s) => {
    const term = search.toLowerCase()
    return s.name.toLowerCase().includes(term) || (s.category && s.category.toLowerCase().includes(term))
  })

  const openCreateModal = () => {
    setEditingService(null)
    setName('')
    setDefaultRate(0)
    setCategory('')
    setPricingMode('FIXED')
    setIsActive(true)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (s: ServiceItem) => {
    setEditingService(s)
    setName(s.name)
    setDefaultRate(s.default_rate)
    setCategory(s.category || '')
    setPricingMode(s.pricing_mode)
    setIsActive(s.is_active)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (editingService) {
      const res = await updateService(businessId, editingService.id, {
        name,
        default_rate: Number(defaultRate),
        category: category || null,
        pricing_mode: pricingMode,
        is_active: isActive,
      })

      if (res.success && res.data) {
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? (res.data as any) : s)))
        setIsModalOpen(false)
      } else if (res.errors) {
        setErrors(res.errors)
      }
    } else {
      const res = await createService(businessId, {
        name,
        default_rate: Number(defaultRate),
        category: category || null,
        pricing_mode: pricingMode,
        is_active: isActive,
      })

      if (res.success && res.data) {
        setServices((prev) => [...prev, res.data as any])
        setIsModalOpen(false)
      } else if (res.errors) {
        setErrors(res.errors)
      }
    }
    setLoading(false)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const res = await toggleServiceActive(businessId, id, newStatus)
    if (res.success) {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: newStatus } : s)))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Services & Items Catalog</h2>
          <p className="text-sm text-muted-foreground">Catalog items and services for quick line-item selection in billing.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Item / Service
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-base">{service.name}</h3>
                  {service.category && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                      {service.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(service)} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xl font-bold text-primary">₹{Number(service.default_rate).toFixed(2)}</span>
                <span className="text-xs font-mono uppercase bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                  {service.pricing_mode}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1 ${service.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                {service.is_active ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {service.is_active ? 'Active' : 'Disabled'}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleToggleActive(service.id, service.is_active)}
              >
                {service.is_active ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-medium">No items or services found</p>
            <p className="text-xs">Add services to speed up invoice creation.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold">
              {editingService ? 'Edit Item / Service' : 'Add Item / Service'}
            </h3>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20">
                {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="srv-name">Service / Item Name <span className="text-destructive">*</span></Label>
                <Input
                  id="srv-name"
                  placeholder="e.g. AC Servicing / Printing Paper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="srv-rate">Default Rate (₹) <span className="text-destructive">*</span></Label>
                <Input
                  id="srv-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                />
                {errors.default_rate && <p className="text-xs text-destructive mt-1">{errors.default_rate}</p>}
              </div>

              <div>
                <Label htmlFor="srv-cat">Category (Optional)</Label>
                <Input
                  id="srv-cat"
                  placeholder="e.g. Labor, Materials, Maintenance"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <Label>Pricing Mode</Label>
                <select
                  value={pricingMode}
                  onChange={(e: any) => setPricingMode(e.target.value)}
                  className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="FIXED">FIXED (Set unit rate)</option>
                  <option value="QUANTITY_BASED">QUANTITY BASED (Qty x Rate)</option>
                  <option value="HOURLY">HOURLY (Hours x Rate)</option>
                  <option value="CUSTOM">CUSTOM (Variable input)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="srv-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <Label htmlFor="srv-active" className="cursor-pointer">Active and visible in billing menu</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update Item' : 'Save Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
