'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { createClientSupabase } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'
import {
  JuniorProfile,
  ClassInfo,
  Booking,
  NewChildForm,
  DashboardStats,
} from '../types'

export function useParentalDashboard() {
  const { user, profile } = useAuth()
  const [children, setChildren] = useState<JuniorProfile[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<ClassInfo[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [selectedJuniors, setSelectedJuniors] = useState<string[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [newChildForm, setNewChildForm] = useState<NewChildForm>({
    full_name: '',
    nickname: '',
    birth_date: '',
    level: 'alpha',
  })
  const [availableTickets, setAvailableTickets] = useState(0)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  const supabase = createClientSupabase()

  const fetchChildren = useCallback(async () => {
    if (!profile?.id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('junior_profiles')
        .select('*')
        .eq('parental_id', profile.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setChildren(data || [])
    } catch (err) {
      console.error('Error fetching children:', err)
      setError('Error al cargar perfiles de hijos')
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  const fetchUpcomingClasses = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10)
      if (error) throw error
      setUpcomingClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }, [supabase])

  const fetchBookings = useCallback(async () => {
    if (!profile?.id) return
    try {
      // Use the simple_bookings_view that worked before
      const { data, error } = await supabase
        .from('simple_bookings_view')
        .select('*')
        .eq('parental_id', profile.id)
        .order('class_date', { ascending: true })

      if (error) {
        console.error('Error fetching bookings:', error)
        setBookings([])
      } else {
        setBookings(data || [])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setBookings([])
    }
  }, [profile?.id, supabase])

  const fetchAvailableTickets = useCallback(async () => {
    if (!profile?.id) return
    try {
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchased_tickets')
        .select('id')
        .eq('parental_id', profile.id)
      if (purchasesError) throw purchasesError
      if (!purchases || purchases.length === 0) {
        setAvailableTickets(0)
        return
      }
      const purchaseIds = (purchases as { id: string }[]).map(p => p.id)
      const {
        data: tickets,
        error: ticketsError,
        count,
      } = await supabase
        .from('ticket_units')
        .select('*', { count: 'exact' })
        .in('purchase_id', purchaseIds)
        .eq('status', 'available')
      if (ticketsError) throw ticketsError
      // Prefer the exact count returned by Supabase, otherwise fall back to array length
      const available =
        typeof count === 'number'
          ? count
          : Array.isArray(tickets)
            ? (tickets as any[]).length
            : 0
      setAvailableTickets(available)
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setAvailableTickets(0)
    }
  }, [profile?.id, supabase])

  // Check if a child already has a booking for the selected class
  const hasExistingBooking = useCallback(
    (juniorId: string, classId: string) => {
      return bookings.some(
        booking =>
          booking.junior_id === juniorId &&
          booking.class_id === classId &&
          booking.status === 'confirmed'
      )
    },
    [bookings]
  )

  const createBooking = async (classId: string, juniorIds: string[]) => {
    if (!profile?.id || juniorIds.length === 0) return

    try {
      setBookingLoading(true)

      const successCount = []
      const errors = []

      // Create a booking for each selected child
      for (const juniorId of juniorIds) {
        try {
          // Check if already booked (additional safety check)
          if (hasExistingBooking(juniorId, classId)) {
            errors.push(`El hijo ya tiene una reserva para esta clase`)
            continue
          }

          const rpcRes = await (supabase as any).rpc(
            'create_reservation_final',
            { p_junior_id: juniorId, p_class_id: classId }
          )
          const data = rpcRes.data as {
            success?: boolean
            error?: string
          } | null
          const error = rpcRes.error as any

          if (data && data.success === false) {
            errors.push(
              `Error para ${juniorId}: ${data.error ?? 'Error desconocido'}`
            )
            continue
          }

          if (error) {
            errors.push(`Error para ${juniorId}: ${error.message}`)
            continue
          }

          successCount.push(juniorId)
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Error desconocido'
          errors.push(`Error para ${juniorId}: ${errorMessage}`)
        }
      }

      // Refresh data including tickets
      await Promise.all([
        fetchBookings(),
        fetchUpcomingClasses(),
        fetchAvailableTickets(), // Refresh tickets count after booking
      ])

      setError(null)
      setShowBookingModal(false)
      setSelectedClass(null)
      setSelectedJuniors([])

      // Show success message
      if (successCount.length === juniorIds.length) {
        alert(
          `¡${successCount.length} reserva(s) creada(s) exitosamente! Se utilizaron ${successCount.length} tickets.`
        )
      } else if (successCount.length > 0) {
        alert(
          `${successCount.length} de ${juniorIds.length} reservas creadas exitosamente. Se utilizaron ${successCount.length} tickets.`
        )
      } else {
        throw new Error(
          'No se pudo crear ninguna reserva: ' + errors.join(', ')
        )
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear las reservas'
      setError(errorMessage)
    } finally {
      setBookingLoading(false)
    }
  }

  const createChild = async () => {
    if (!profile?.id || !newChildForm.full_name) return
    try {
      setLoading(true)
      const randomCode = Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()
      const uniqueCode = randomCode.padEnd(7, '0')
      const { error } = await supabase
        .from('junior_profiles')
        .insert({
          parental_id: profile.id,
          unique_code: uniqueCode,
          full_name: newChildForm.full_name,
          nickname: newChildForm.nickname || null,
          birth_date: newChildForm.birth_date || null,
          level: newChildForm.level,
          active: true,
        } as any)
        .select()
        .single()
      if (error) throw error
      await fetchChildren()
      setNewChildForm({
        full_name: '',
        nickname: '',
        birth_date: '',
        level: 'alpha',
      })
      setShowAddChildModal(false)
      alert('¡Hijo agregado exitosamente!')
    } catch (err) {
      console.error('Error creating child:', err)
      setError('Error al crear el perfil del hijo')
    } finally {
      setLoading(false)
    }
  }

  const purchaseTickets = async (packageType: string) => {
    if (!profile?.id) return
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType, parentalId: profile.id }),
      })
      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error || 'Error al crear sesión de pago')
      const stripe = await getStripe()
      if (!stripe) throw new Error('Stripe no está disponible')
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })
      if (error) throw new Error(error.message)
    } catch (err) {
      console.error('Error purchasing tickets:', err)
      alert('Error al procesar la compra. Por favor, intenta de nuevo.')
    }
  }

  const toggleJuniorSelection = (juniorId: string) => {
    setSelectedJuniors(prev =>
      prev.includes(juniorId)
        ? prev.filter(id => id !== juniorId)
        : [...prev, juniorId]
    )
  }

  const openBookingModal = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo)
    setSelectedJuniors([])
    setShowBookingModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!selectedClass || selectedJuniors.length === 0) return
    await createBooking(selectedClass.id, selectedJuniors)
  }

  useEffect(() => {
    if (profile?.role === 'parental') {
      fetchChildren()
      fetchUpcomingClasses()
      fetchBookings()
      fetchAvailableTickets()
    }
  }, [
    profile,
    fetchChildren,
    fetchUpcomingClasses,
    fetchBookings,
    fetchAvailableTickets,
  ])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const payment = urlParams.get('payment')
    if (payment === 'success') {
      setPaymentStatus('success')
      fetchAvailableTickets()
      window.history.replaceState({}, '', '/parental')
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled')
      window.history.replaceState({}, '', '/parental')
    }
  }, [fetchAvailableTickets])

  const getStats = (): DashboardStats => {
    const totalChildren = children.length
    const activeChildren = children.filter(child => child.active).length
    const alphaChildren = children.filter(
      child => child.level === 'alpha'
    ).length
    const betaChildren = children.filter(child => child.level === 'beta').length
    return { totalChildren, activeChildren, alphaChildren, betaChildren }
  }

  return {
    // State
    user,
    profile,
    children,
    upcomingClasses,
    bookings,
    loading,
    error,
    selectedClass,
    selectedJuniors,
    showBookingModal,
    bookingLoading,
    showAddChildModal,
    newChildForm,
    availableTickets,
    showTicketModal,
    paymentStatus,
    stats: getStats(),

    // Actions
    setError,
    setShowBookingModal,
    setSelectedClass,
    setSelectedJuniors,
    setShowAddChildModal,
    setNewChildForm,
    setShowTicketModal,

    // Functions
    createBooking,
    createChild,
    purchaseTickets,
    toggleJuniorSelection,
    openBookingModal,
    handleConfirmBooking,
    fetchChildren,
    fetchAvailableTickets,
    hasExistingBooking,
  }
}
