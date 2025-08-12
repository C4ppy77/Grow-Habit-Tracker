import { createClient } from "@supabase/supabase-js"

// Use environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
          lock_past_days: boolean
          theme_preference: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          lock_past_days?: boolean
          theme_preference?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
          lock_past_days?: boolean
          theme_preference?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          is_active: boolean
          order_index: number
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          is_active?: boolean
          order_index?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          is_active?: boolean
          order_index?: number
        }
      }
      habit_completions: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          completed_date: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          completed_date: string
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          completed_date?: string
          created_at?: string
          notes?: string | null
        }
      }
    }
  }
}
