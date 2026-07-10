export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ApplicationStatus =
  | 'new'
  | 'consultation'
  | 'docs_collection'
  | 'docs_review'
  | 'docs_ready'
  | 'submitted'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'closed'

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected' | 'expired'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type VisaTypeCode = 'tourist' | 'business' | 'student' | 'work' | 'medical' | 'family' | 'transit'
export type MessageChannel = 'whatsapp' | 'telegram' | 'email' | 'internal'
export type MessageDirection = 'inbound' | 'outbound'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          whatsapp_id: string | null
          telegram_id: string | null
          full_name: string
          iin: string | null
          birth_date: string | null
          passport_number: string | null
          passport_expiry: string | null
          citizenship: string
          preferred_language: string
          lead_source: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          is_vip: boolean
          is_admin: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      countries: {
        Row: {
          id: string
          name_ru: string
          name_en: string
          code: string
          flag_emoji: string | null
          processing_time_days: number
          processing_time_express_days: number
          base_price: number
          express_price: number
          embassy_info: Json
          requirements: Json
          is_active: boolean
          popularity_rank: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      visa_types: {
        Row: {
          id: string
          country_id: string
          type_code: VisaTypeCode
          name_ru: string
          name_en: string
          price: number
          express_price: number | null
          processing_days: number
          express_days: number | null
          validity_days: number | null
          max_stay_days: number | null
          entries: string
          requirements: Json
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['visa_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['visa_types']['Insert']>
      }
      applications: {
        Row: {
          id: string
          application_number: string
          user_id: string | null
          country_id: string | null
          visa_type_id: string | null
          status: ApplicationStatus
          travel_purpose: string | null
          travel_date_from: string | null
          travel_date_to: string | null
          adults_count: number
          children_count: number
          is_express: boolean
          price: number
          discount_percent: number
          final_price: number
          payment_status: PaymentStatus
          payment_amount: number
          manager_id: string | null
          manager_notes: string | null
          deadline: string | null
          appointment_date: string | null
          appointment_location: string | null
          ai_checklist: Json | null
          ai_risk_score: number | null
          ai_recommendations: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'application_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      documents: {
        Row: {
          id: string
          application_id: string | null
          user_id: string | null
          doc_type: string
          doc_name: string
          file_url: string | null
          file_size: number | null
          ocr_text: string | null
          ocr_data: Json | null
          status: DocumentStatus
          rejection_reason: string | null
          verified_by: string | null
          verified_at: string | null
          expires_at: string | null
          ai_validation_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      messages: {
        Row: {
          id: string
          application_id: string | null
          user_id: string | null
          channel: MessageChannel
          direction: MessageDirection
          content: string
          media_url: string | null
          media_type: string | null
          whatsapp_message_id: string | null
          is_read: boolean
          sent_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      leads: {
        Row: {
          id: string
          phone: string | null
          whatsapp_id: string | null
          name: string | null
          country_interest: string | null
          source: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          status: LeadStatus
          notes: string | null
          converted_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      payments: {
        Row: {
          id: string
          application_id: string | null
          user_id: string | null
          amount: number
          currency: string
          payment_method: string | null
          provider: string | null
          provider_transaction_id: string | null
          status: string
          invoice_url: string | null
          receipt_url: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: Database['public']['Tables']['settings']['Row']
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Country = Database['public']['Tables']['countries']['Row']
export type VisaType = Database['public']['Tables']['visa_types']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

// Extended types with joins
export type ApplicationWithDetails = Application & {
  country: Country | null
  visa_type: VisaType | null
  user: User | null
}

export type CountryWithVisaTypes = Country & {
  visa_types: VisaType[]
}
