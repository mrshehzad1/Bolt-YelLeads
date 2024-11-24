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
          email: string
          business_name: string
          yelp_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          business_name: string
          yelp_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string
          yelp_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          email: string
          phone: string | null
          message: string
          status: 'NEW' | 'RESPONDED' | 'CLOSED'
          source: 'YELP' | 'MANUAL'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          email: string
          phone?: string | null
          message: string
          status?: 'NEW' | 'RESPONDED' | 'CLOSED'
          source: 'YELP' | 'MANUAL'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          email?: string
          phone?: string | null
          message?: string
          status?: 'NEW' | 'RESPONDED' | 'CLOSED'
          source?: 'YELP' | 'MANUAL'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          lead_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          sender: 'BUSINESS' | 'CUSTOMER' | 'AI'
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          sender: 'BUSINESS' | 'CUSTOMER' | 'AI'
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          sender?: 'BUSINESS' | 'CUSTOMER' | 'AI'
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          business_id: string
          name: string
          content: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          content: string
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          content?: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}