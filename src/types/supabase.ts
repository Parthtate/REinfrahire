export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          role?: string
          created_at?: string
        }
      }
      // Add other tables here as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}