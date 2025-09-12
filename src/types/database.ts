// Tipos más flexibles para operaciones CRUD
export type FlexibleClassInsert = {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field?: string | null
  notes?: string | null
  admin_id?: string | null
  current_bookings?: number
}

export type FlexibleClassUpdate = {
  date?: string
  start_time?: string
  end_time?: string
  instructor_name?: string
  capacity?: number
  level?: 'alpha' | 'beta' | 'mixed'
  field?: string | null
  notes?: string | null
}

// ============================================================================
// TIPOS TYPESCRIPT PARA LA BASE DE DATOS RODAPOLO
// Generados automáticamente basados en el schema de Supabase
// ============================================================================

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
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'parental'
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'parental'
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'parental'
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      junior_profiles: {
        Row: {
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
        Insert: {
          id?: string
          parental_id: string
          unique_code?: string
          full_name: string
          nickname?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          handicap?: number
          level?: 'alpha' | 'beta'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parental_id?: string
          unique_code?: string
          full_name?: string
          nickname?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          handicap?: number
          level?: 'alpha' | 'beta'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          quantity: number
          price: number
          valid_days: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          quantity: number
          price: number
          valid_days?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          quantity?: number
          price?: number
          valid_days?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchased_tickets: {
        Row: {
          id: string
          parental_id: string
          package_id: string
          purchase_date: string
          expiry_date: string
          total_tickets: number
          used_tickets: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parental_id: string
          package_id: string
          purchase_date?: string
          expiry_date?: string
          total_tickets: number
          used_tickets?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parental_id?: string
          package_id?: string
          purchase_date?: string
          expiry_date?: string
          total_tickets?: number
          used_tickets?: number
          created_at?: string
          updated_at?: string
        }
      }
      ticket_units: {
        Row: {
          id: string
          purchase_id: string
          status: 'available' | 'blocked' | 'used' | 'consumed'
          blocked_at: string | null
          blocked_for_class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          status?: 'available' | 'blocked' | 'used' | 'consumed'
          blocked_at?: string | null
          blocked_for_class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          status?: 'available' | 'blocked' | 'used' | 'consumed'
          blocked_at?: string | null
          blocked_for_class_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          admin_id: string | null
          date: string
          start_time: string
          end_time: string
          instructor_name: string
          capacity: number
          current_bookings: number
          level: 'alpha' | 'beta' | 'mixed'
          status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
          field: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          date: string
          start_time: string
          end_time: string
          instructor_name: string
          capacity: number
          current_bookings?: number
          level?: 'alpha' | 'beta' | 'mixed'
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
          field?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          date?: string
          start_time?: string
          end_time?: string
          instructor_name?: string
          capacity?: number
          current_bookings?: number
          level?: 'alpha' | 'beta' | 'mixed'
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
          field?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          class_id: string
          junior_id: string
          ticket_id: string
          booked_by: string
          booked_at: string
          status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          cancelled_at: string | null
          cancellation_reason: string | null
          attended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          junior_id: string
          ticket_id: string
          booked_by: string
          booked_at?: string
          status?: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          cancelled_at?: string | null
          cancellation_reason?: string | null
          attended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          junior_id?: string
          ticket_id?: string
          booked_by?: string
          booked_at?: string
          status?: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          cancelled_at?: string | null
          cancellation_reason?: string | null
          attended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          cover_image_url: string | null
          tags: string[] | null
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          views_count: number
          likes_count: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          cover_image_url?: string | null
          tags?: string[] | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          likes_count?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          cover_image_url?: string | null
          tags?: string[] | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          likes_count?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          junior_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          junior_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          junior_id?: string
          created_at?: string
        }
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          junior_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          post_id: string
          junior_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          junior_id?: string
          viewed_at?: string
        }
      }
    }
    Views: {
      class_details: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          instructor_name: string
          capacity: number
          current_bookings: number
          available_spots: number
          level: 'alpha' | 'beta' | 'mixed'
          status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
          field: string | null
          notes: string | null
          created_by_name: string | null
          created_at: string
          updated_at: string
        }
      }
      booking_details: {
        Row: {
          id: string
          class_id: string
          class_date: string
          class_start_time: string
          class_instructor: string
          class_field: string | null
          junior_id: string
          junior_full_name: string
          junior_unique_code: string
          ticket_id: string
          booked_by: string
          booked_by_name: string
          booked_at: string
          status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          cancelled_at: string | null
          cancellation_reason: string | null
          attended_at: string | null
        }
      }
      ticket_details: {
        Row: {
          id: string
          purchase_id: string
          status: 'available' | 'blocked' | 'used' | 'consumed'
          blocked_at: string | null
          blocked_for_class_id: string | null
          blocked_for_class_info: string | null
          parental_id: string
          parental_name: string
          package_id: string
          package_name: string
          package_price: number
          purchase_date: string
          expiry_date: string
          days_remaining: number | null
          created_at: string
        }
      }
    }
    Functions: {
      search_posts: {
        Args: {
          search_term: string
        }
        Returns: {
          id: string
          title: string
          excerpt: string | null
          cover_image_url: string | null
          tags: string[] | null
          published_at: string | null
          views_count: number
          likes_count: number
          rank: number
        }[]
      }
      get_class_stats: {
        Args: {
          class_id_param: string
        }
        Returns: {
          total_bookings: number
          confirmed_bookings: number
          attended_bookings: number
          no_show_bookings: number
          cancelled_bookings: number
          attendance_rate: number
        }[]
      }
      get_available_tickets: {
        Args: {
          parental_id_param: string
        }
        Returns: {
          ticket_id: string
          package_name: string
          purchase_date: string
          expiry_date: string
          days_remaining: number
        }[]
      }
    }
    Enums: {
      user_role: 'admin' | 'parental'
      junior_level: 'alpha' | 'beta'
      class_level: 'alpha' | 'beta' | 'mixed'
      class_status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
      ticket_status: 'available' | 'blocked' | 'used' | 'consumed'
      booking_status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
      post_status: 'draft' | 'published' | 'archived'
    }
  }
}

// ============================================================================
// TIPOS DE ENTIDADES ESPECÍFICAS
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type JuniorProfile =
  Database['public']['Tables']['junior_profiles']['Row']
export type TicketPackage =
  Database['public']['Tables']['ticket_packages']['Row']
export type PurchasedTicket =
  Database['public']['Tables']['purchased_tickets']['Row']
export type TicketUnit = Database['public']['Tables']['ticket_units']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type PostView = Database['public']['Tables']['post_views']['Row']

// Tipos para inserts
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type JuniorProfileInsert =
  Database['public']['Tables']['junior_profiles']['Insert']
export type TicketPackageInsert =
  Database['public']['Tables']['ticket_packages']['Insert']
export type PurchasedTicketInsert =
  Database['public']['Tables']['purchased_tickets']['Insert']
export type TicketUnitInsert =
  Database['public']['Tables']['ticket_units']['Insert']
export type ClassInsert = Database['public']['Tables']['classes']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostLikeInsert =
  Database['public']['Tables']['post_likes']['Insert']
export type PostViewInsert =
  Database['public']['Tables']['post_views']['Insert']

// Tipos para updates
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type JuniorProfileUpdate =
  Database['public']['Tables']['junior_profiles']['Update']
export type TicketPackageUpdate =
  Database['public']['Tables']['ticket_packages']['Update']
export type PurchasedTicketUpdate =
  Database['public']['Tables']['purchased_tickets']['Update']
export type TicketUnitUpdate =
  Database['public']['Tables']['ticket_units']['Update']
export type ClassUpdate = Database['public']['Tables']['classes']['Update']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

// Tipos de vistas
export type ClassDetails = Database['public']['Views']['class_details']['Row']
export type BookingDetails =
  Database['public']['Views']['booking_details']['Row']
export type TicketDetails = Database['public']['Views']['ticket_details']['Row']

// Tipos de funciones
export type SearchPostsResult =
  Database['public']['Functions']['search_posts']['Returns'][0]
export type ClassStatsResult =
  Database['public']['Functions']['get_class_stats']['Returns'][0]
export type AvailableTicketsResult =
  Database['public']['Functions']['get_available_tickets']['Returns'][0]

// ============================================================================
// TIPOS EXTENDIDOS CON RELACIONES
// ============================================================================

export interface JuniorProfileWithParental extends JuniorProfile {
  parental: Profile
}

export interface ClassWithCreator extends Class {
  admin_profile: Profile | null
}

export interface BookingWithDetails extends Booking {
  class: Class
  junior: JuniorProfile
  ticket: TicketUnit
  booked_by_profile: Profile
}

export interface PostWithAuthor extends Post {
  created_by_profile: Profile
}

export interface PurchasedTicketWithDetails extends PurchasedTicket {
  parental: Profile
  package: TicketPackage
  tickets: TicketUnit[]
}

export interface TicketUnitWithDetails extends TicketUnit {
  purchase: PurchasedTicketWithDetails
  blocked_for_class?: Class
}

// ============================================================================
// TIPOS PARA FORMULARIOS Y ESTADO
// ============================================================================

export interface CreateJuniorForm {
  full_name: string
  nickname?: string
  birth_date?: string
  avatar_url?: string
  handicap?: number
  level?: 'alpha' | 'beta'
}

export interface CreateClassForm {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field?: string
  notes?: string
}

export interface CreateBookingForm {
  class_id: string
  junior_id: string
  ticket_id: string
}

export interface CreatePostForm {
  title: string
  content: string
  excerpt?: string
  cover_image_url?: string
  tags?: string[]
  status: Database['public']['Enums']['post_status']
}

export interface PurchaseTicketForm {
  package_id: string
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// TIPOS PARA AUTENTICACIÓN JUNIOR
// ============================================================================

export interface JuniorAuth {
  code: string
  junior?: JuniorProfile
  authenticated: boolean
}

export interface JuniorSession {
  junior: JuniorProfile
  parental: Profile
  sessionId: string
  expiresAt: string
}

// ============================================================================
// TIPOS PARA ESTADÍSTICAS Y DASHBOARD
// ============================================================================

export interface DashboardStats {
  totalJuniors: number
  activeClasses: number
  totalBookings: number
  totalPosts: number
  recentBookings: BookingDetails[]
  upcomingClasses: ClassDetails[]
  popularPosts: PostWithAuthor[]
}

export interface ParentalDashboardStats {
  children: JuniorProfile[]
  availableTickets: number
  upcomingBookings: BookingDetails[]
  expiringSoon: TicketDetails[]
}

export interface ClassAttendanceStats {
  classId: string
  totalBookings: number
  attendedCount: number
  noShowCount: number
  attendanceRate: number
  bookings: BookingDetails[]
}
