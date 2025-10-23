export type JuniorProfile = {
  id: string
  parental_id: string
  unique_code: string
  full_name: string
  nickname: string | null
  birth_date: string | null
  avatar_url: string | null
  handicap: number
  level: 'alpha' | 'beta'
  active: boolean
  created_at: string
  updated_at: string
}

export type ClassInfo = {
  id: string
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field: string | null
  notes: string | null
  current_bookings: number
}

export type Booking = {
  id: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  class_date: string
  start_time: string
  end_time: string
  instructor_name: string
  junior_name: string
  junior_nickname: string | null
  junior_id?: string
  class_id?: string
  notes: string | null // Add this
  field: string | null // Add this
  level?: 'alpha' | 'beta' | 'mixed' // Optional, if you want to include level
}

export type NewChildForm = {
  full_name: string
  nickname: string
  birth_date: string
  level: 'alpha' | 'beta'
}

export type DashboardStats = {
  totalChildren: number
  activeChildren: number
  alphaChildren: number
  betaChildren: number
}
