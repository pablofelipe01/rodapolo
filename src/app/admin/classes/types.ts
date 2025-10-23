export type UserProfile = {
  id: string
  role: 'admin' | 'parental' | 'junior'
}

export type ClassRow = {
  id: string
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  field?: string | null
  notes?: string | null
  admin_id: string
  current_bookings: number
  created_at: string
  updated_at: string
}

export type FormData = {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  field?: string | null
  notes?: string | null
}

export type SeasonData = {
  name: string
  startDate: string
  endDate: string
  daysOfWeek: number[]
  startTime: string
  endTime: string
  instructorName: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field: string
  notes: string
}

export type CalendarView = 'list' | 'day' | 'week' | 'month'
export type TimeFilter = 'upcoming' | 'past' | 'all'
export type CityFilter = 'all' | 'sotogrande' | 'marbella'
