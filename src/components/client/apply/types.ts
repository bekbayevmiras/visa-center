export type ApplyFormData = {
  country_id: string
  country_code: string
  country_name: string
  country_flag: string
  visa_type_id: string
  visa_type_name: string
  visa_price: number
  express_price: number
  is_express: boolean
  travel_date_from: string
  travel_date_to: string
  travel_purpose: string
  adults_count: number
  children_count: number
  full_name: string
  phone: string
  email: string
  passport_number: string
  passport_expiry: string
  application_id?: string
}

export type InitialProfile = {
  full_name?: string
  phone?: string
  email?: string
  passport_number?: string
  passport_expiry?: string
}
