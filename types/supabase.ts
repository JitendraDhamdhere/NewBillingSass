export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          owner_info: string | null
          mobile: string | null
          whatsapp: string | null
          email: string | null
          address: string | null
          logo: string | null
          business_type: string | null
          upi_id: string | null
          upi_name: string | null
          whatsapp_templates: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_info?: string | null
          mobile?: string | null
          whatsapp?: string | null
          email?: string | null
          address?: string | null
          logo?: string | null
          business_type?: string | null
          upi_id?: string | null
          upi_name?: string | null
          whatsapp_templates?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_info?: string | null
          mobile?: string | null
          whatsapp?: string | null
          email?: string | null
          address?: string | null
          logo?: string | null
          business_type?: string | null
          upi_id?: string | null
          upi_name?: string | null
          whatsapp_templates?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string | null
          mobile: string | null
          email: string | null
          address: string | null
          customer_type: 'REGULAR' | 'WAL_IN'
          possible_duplicate: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name?: string | null
          mobile?: string | null
          email?: string | null
          address?: string | null
          customer_type?: 'REGULAR' | 'WAL_IN'
          possible_duplicate?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string | null
          mobile?: string | null
          email?: string | null
          address?: string | null
          customer_type?: 'REGULAR' | 'WAL_IN'
          possible_duplicate?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          default_rate: number
          category: string | null
          pricing_mode: 'FIXED' | 'CUSTOM' | 'HOURLY' | 'QUANTITY_BASED'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          default_rate?: number
          category?: string | null
          pricing_mode?: 'FIXED' | 'CUSTOM' | 'HOURLY' | 'QUANTITY_BASED'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          default_rate?: number
          category?: string | null
          pricing_mode?: 'FIXED' | 'CUSTOM' | 'HOURLY' | 'QUANTITY_BASED'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoice_sequences: {
        Row: {
          id: string
          business_id: string
          numbering_mode: 'CONTINUOUS' | 'FY_WISE'
          fy_year: string
          current_val: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          numbering_mode: 'CONTINUOUS' | 'FY_WISE'
          fy_year?: string
          current_val?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          numbering_mode?: 'CONTINUOUS' | 'FY_WISE'
          fy_year?: string
          current_val?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          business_id: string
          invoice_number: string
          invoice_prefix: string
          sequence_number: number
          fy_year: string
          numbering_mode: 'CONTINUOUS' | 'FY_WISE'
          customer_id: string | null
          customer_name: string | null
          customer_mobile: string | null
          is_walk_in: boolean
          invoice_date: string
          due_date: string | null
          subtotal: number
          discount_percentage: number
          discount_amount: number
          tax_amount: number
          grand_total: number
          paid_amount: number
          balance_due: number
          status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
          notes: string | null
          terms: string | null
          cancellation_reason: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          invoice_number: string
          invoice_prefix?: string
          sequence_number: number
          fy_year: string
          numbering_mode?: 'CONTINUOUS' | 'FY_WISE'
          customer_id?: string | null
          customer_name?: string | null
          customer_mobile?: string | null
          is_walk_in?: boolean
          invoice_date?: string
          due_date?: string | null
          subtotal?: number
          discount_percentage?: number
          discount_amount?: number
          tax_amount?: number
          grand_total?: number
          paid_amount?: number
          balance_due?: number
          status?: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
          notes?: string | null
          terms?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          invoice_number?: string
          invoice_prefix?: string
          sequence_number?: number
          fy_year?: string
          numbering_mode?: 'CONTINUOUS' | 'FY_WISE'
          customer_id?: string | null
          customer_name?: string | null
          customer_mobile?: string | null
          is_walk_in?: boolean
          invoice_date?: string
          due_date?: string | null
          subtotal?: number
          discount_percentage?: number
          discount_amount?: number
          tax_amount?: number
          grand_total?: number
          paid_amount?: number
          balance_due?: number
          status?: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
          notes?: string | null
          terms?: string | null
          cancellation_reason?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          business_id: string
          service_id: string | null
          description: string
          quantity: number
          unit_price: number
          amount: number
          discount_amount: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          business_id: string
          service_id?: string | null
          description: string
          quantity?: number
          unit_price?: number
          amount?: number
          discount_amount?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          business_id?: string
          service_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          discount_amount?: number
          sort_order?: number
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          business_id: string
          receipt_number: string
          customer_id: string | null
          category: string
          description: string | null
          receipt_date: string
          amount: number
          payment_mode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          receipt_number: string
          customer_id?: string | null
          category?: string
          description?: string | null
          receipt_date?: string
          amount?: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          receipt_number?: string
          customer_id?: string | null
          category?: string
          description?: string | null
          receipt_date?: string
          amount?: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      receipt_allocations: {
        Row: {
          id: string
          receipt_id: string
          invoice_id: string
          business_id: string
          allocated_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          invoice_id: string
          business_id: string
          allocated_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          invoice_id?: string
          business_id?: string
          allocated_amount?: number
          created_at?: string
        }
      }
      credit_notes: {
        Row: {
          id: string
          business_id: string
          credit_note_number: string
          invoice_id: string | null
          customer_id: string | null
          credit_note_date: string
          amount: number
          reason: string
          status: 'OPEN' | 'APPLIED' | 'REFUNDED' | 'VOID'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          credit_note_number: string
          invoice_id?: string | null
          customer_id?: string | null
          credit_note_date?: string
          amount?: number
          reason: string
          status?: 'OPEN' | 'APPLIED' | 'REFUNDED' | 'VOID'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          credit_note_number?: string
          invoice_id?: string | null
          customer_id?: string | null
          credit_note_date?: string
          amount?: number
          reason?: string
          status?: 'OPEN' | 'APPLIED' | 'REFUNDED' | 'VOID'
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          business_id: string
          payment_number: string
          paid_to: string
          mobile: string | null
          work_purpose: string
          invoice_id: string | null
          amount: number
          payment_date: string
          payment_mode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          attachment_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          payment_number: string
          paid_to: string
          mobile?: string | null
          work_purpose: string
          invoice_id?: string | null
          amount?: number
          payment_date?: string
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          attachment_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          payment_number?: string
          paid_to?: string
          mobile?: string | null
          work_purpose?: string
          invoice_id?: string | null
          amount?: number
          payment_date?: string
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          attachment_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          business_id: string
          expense_number: string
          category: string
          description: string
          amount: number
          expense_date: string
          payment_mode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          payee_vendor: string | null
          attachment_url: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          expense_number: string
          category?: string
          description: string
          amount?: number
          expense_date?: string
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          payee_vendor?: string | null
          attachment_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          expense_number?: string
          category?: string
          description?: string
          amount?: number
          expense_date?: string
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          payee_vendor?: string | null
          attachment_url?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          business_id: string
          lender_borrower_name: string
          loan_type: 'TAKEN' | 'GIVEN'
          principal_amount: number
          outstanding_principal: number
          interest_rate_annual: number
          start_date: string
          due_date: string | null
          status: 'ACTIVE' | 'CLOSED'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          lender_borrower_name: string
          loan_type?: 'TAKEN' | 'GIVEN'
          principal_amount: number
          outstanding_principal?: number
          interest_rate_annual?: number
          start_date?: string
          due_date?: string | null
          status?: 'ACTIVE' | 'CLOSED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          lender_borrower_name?: string
          loan_type?: 'TAKEN' | 'GIVEN'
          principal_amount?: number
          outstanding_principal?: number
          interest_rate_annual?: number
          start_date?: string
          due_date?: string | null
          status?: 'ACTIVE' | 'CLOSED'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loan_repayments: {
        Row: {
          id: string
          loan_id: string
          business_id: string
          repayment_date: string
          principal_paid: number
          interest_paid: number
          total_amount: number
          payment_mode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          business_id: string
          repayment_date?: string
          principal_paid?: number
          interest_paid?: number
          total_amount?: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          business_id?: string
          repayment_date?: string
          principal_paid?: number
          interest_paid?: number
          total_amount?: number
          payment_mode?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      business_permissions: {
        Row: {
          id: string
          business_id: string
          role: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          resource: string
          can_view: boolean
          can_create: boolean
          can_edit: boolean
          can_delete: boolean
          can_print: boolean
          can_export: boolean
          can_whatsapp: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          role: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          resource: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_print?: boolean
          can_export?: boolean
          can_whatsapp?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          role?: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
          resource?: string
          can_view?: boolean
          can_create?: boolean
          can_edit?: boolean
          can_delete?: boolean
          can_print?: boolean
          can_export?: boolean
          can_whatsapp?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          user_email: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          user_email?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string | null
          user_email?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: any | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_businesses: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_id: string
        }[]
      }
      generate_next_invoice_number: {
        Args: {
          p_business_id: string
          p_numbering_mode?: string
          p_invoice_date?: string
          p_prefix?: string
        }
        Returns: {
          out_invoice_number: string
          out_sequence_number: number
          out_fy_year: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
