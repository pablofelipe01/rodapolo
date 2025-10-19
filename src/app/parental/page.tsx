'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useParentalDashboard } from './components/hooks/useParentalDashboard'
import { DashboardHeader } from './components/DashboardHeader'
import { StatsCards } from './components/StatsCards'
import { AlertMessages } from './components/AlertMessages'
import { ChildrenTab } from './components/ChildrenTab'
import { ClassesTab } from './components/ClassesTab'
import { BookingsTab } from './components/BookingsTab'
import { PostsSection } from '@/components/PostsSection'
import { AddChildModal } from './components/AddChildModal'
import { BookingModal } from './components/BookingModal'
import { TicketModal } from './components/TicketModal'
import { AccessDenied } from './components/AccessDenied'

export default function ParentalDashboard() {
  const {
    user,
    profile,
    loading,
    error,
    stats,
    children,
    upcomingClasses,
    bookings,
    selectedClass,
    selectedJuniors,
    showBookingModal,
    bookingLoading,
    showAddChildModal,
    newChildForm,
    availableTickets,
    showTicketModal,
    paymentStatus,
    setError,
    setShowBookingModal,
    setSelectedClass,
    setSelectedJuniors,
    setShowAddChildModal,
    setNewChildForm,
    setShowTicketModal,
    createChild,
    purchaseTickets,
    toggleJuniorSelection,
    openBookingModal,
    handleConfirmBooking,
    hasExistingBooking,
  } = useParentalDashboard()

  if (!user) {
    return <AccessDenied message="Debes iniciar sesión para acceder al dashboard parental." />
  }

  if (profile?.role !== 'parental') {
    return <AccessDenied message="Esta área es solo para usuarios parentales." />
  }

  return (
    <div className='space-y-6'>
      <DashboardHeader profile={profile} />
      
      <AlertMessages error={error} paymentStatus={paymentStatus} />
      
      <StatsCards 
        stats={stats} 
        availableTickets={availableTickets} 
        onBuyTickets={() => setShowTicketModal(true)} 
      />

      <Tabs defaultValue='children' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='children'>Mis Hijos</TabsTrigger>
          <TabsTrigger value='classes'>Clases Disponibles</TabsTrigger>
          <TabsTrigger value='bookings'>Mis Reservas</TabsTrigger>
          <TabsTrigger value='posts'>Contenido</TabsTrigger>
        </TabsList>

        <TabsContent value='children' className='space-y-4'>
          <ChildrenTab
            children={children}
            loading={loading}
            onAddChild={() => setShowAddChildModal(true)}
          />
        </TabsContent>

        <TabsContent value='classes' className='space-y-4'>
          <ClassesTab
            classes={upcomingClasses}
            children={children}
            onBookClass={openBookingModal}
          />
        </TabsContent>

        <TabsContent value='bookings' className='space-y-4'>
          <BookingsTab bookings={bookings} />
        </TabsContent>

        <TabsContent value='posts' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Contenido Educativo</h2>
          </div>
          <PostsSection />
        </TabsContent>
      </Tabs>

      <AddChildModal
        open={showAddChildModal}
        onOpenChange={setShowAddChildModal}
        formData={newChildForm}
        onFormChange={setNewChildForm}
        onSubmit={createChild}
        loading={loading}
      />

      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        selectedClass={selectedClass}
        selectedJuniors={selectedJuniors}
        children={children}
        onToggleJunior={toggleJuniorSelection}
        onConfirm={handleConfirmBooking}
        loading={bookingLoading}
        hasExistingBooking={hasExistingBooking}
      />

      <TicketModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        availableTickets={availableTickets}
        onPurchase={purchaseTickets}
      />
    </div>
  )
}