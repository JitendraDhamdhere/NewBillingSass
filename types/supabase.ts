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
    }
    Enums: {
      [_ in never]: never
    }
  }
}
