'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import type { ClassRow, FormData, SeasonData, UserProfile } from '../types'
import { IndividualClassForm } from './IndividualClassForm'
import { SeasonClassForm } from './SeasonClassForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ClassFormProps {
  editingClass: ClassRow | null
  activeTab: 'individual' | 'season'
  onTabChange: (tab: 'individual' | 'season') => void
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

// Define a specific type for class operations that matches the database schema
type ClassOperationData = {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field: string | null
  notes: string | null
  admin_id?: string
  current_bookings?: number
}

export function ClassForm({
  editingClass,
  activeTab,
  onTabChange,
  onSuccess,
  onError,
  onCancel,
}: ClassFormProps) {
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClientSupabase())

  const getCurrentUserProfile = async (): Promise<UserProfile> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      if (!profile) throw new Error('Profile not found')
      return profile as UserProfile
    } catch (err) {
      console.error('Error getting user profile:', err)
      throw err
    }
  }

  const handleIndividualSubmit = async (formData: FormData) => {
    try {
      setLoading(true)
      console.log('🟡 Starting individual class submission...')

      const userProfile = await getCurrentUserProfile()
      console.log('👤 User profile:', userProfile)

      if (userProfile.role !== 'admin') {
        throw new Error('Solo los administradores pueden gestionar clases')
      }

      if (editingClass) {
        console.log('✏️ Updating class:', editingClass.id)
        const updateData: ClassOperationData = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          level: formData.level,
          field: formData.field || null,
          notes: formData.notes || null,
        }
        console.log('📝 Update data:', updateData)

        // Fix for TypeScript error - use type assertion
        const { data, error } = await supabase
          .from('classes')
          .update(updateData as never)
          .eq('id', editingClass.id)
          .select()

        if (error) {
          console.error('❌ Database update error:', error)
          throw error
        }
        console.log('✅ Class updated successfully:', data)
      } else {
        console.log('➕ Creating new class')
        const insertData: ClassOperationData = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          level: formData.level,
          field: formData.field || null,
          notes: formData.notes || null,
          admin_id: userProfile.id,
          current_bookings: 0,
        }
        console.log('📝 Insert data:', insertData)

        // Fix for TypeScript error - use type assertion
        const { data, error } = await supabase
          .from('classes')
          .insert([insertData as never])
          .select()

        if (error) {
          console.error('❌ Database insert error:', error)
          throw error
        }
        console.log('✅ Class created successfully:', data)
      }

      console.log('🎉 Individual class operation completed successfully')
      onSuccess()
    } catch (err) {
      console.error('💥 Error in handleIndividualSubmit:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar la clase'
      console.error('💥 Error details:', JSON.stringify(err, null, 2))
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSeasonSubmit = async (seasonData: SeasonData) => {
    try {
      setLoading(true)
      console.log('🟡 Starting season creation...')
      console.log('📋 Season data:', seasonData)

      const userProfile = await getCurrentUserProfile()
      console.log('👤 User profile:', userProfile)

      // Validaciones básicas
      if (!seasonData.name || !seasonData.startDate || !seasonData.endDate) {
        throw new Error('Nombre, fecha de inicio y fecha de fin son requeridos')
      }

      if (seasonData.daysOfWeek.length === 0) {
        throw new Error('Selecciona al menos un día de la semana')
      }

      if (!seasonData.startTime || !seasonData.endTime) {
        throw new Error('Hora de inicio y fin son requeridas')
      }

      if (!seasonData.instructorName) {
        throw new Error('Nombre del instructor es requerido')
      }

      // Generar todas las fechas en el rango
      const startDate = new Date(seasonData.startDate)
      const endDate = new Date(seasonData.endDate)
      const classesToCreate: ClassOperationData[] = []

      console.log(
        '📅 Generating classes for date range:',
        startDate,
        'to',
        endDate
      )
      console.log('📅 Selected days:', seasonData.daysOfWeek)

      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay()
        if (seasonData.daysOfWeek.includes(dayOfWeek)) {
          const classData: ClassOperationData = {
            date: currentDate.toISOString().split('T')[0],
            start_time: seasonData.startTime,
            end_time: seasonData.endTime,
            instructor_name: seasonData.instructorName,
            capacity: seasonData.capacity,
            level: seasonData.level,
            field: seasonData.field || null,
            notes: seasonData.notes || null,
            admin_id: userProfile.id,
            current_bookings: 0,
          }
          classesToCreate.push(classData)
          console.log(
            `➕ Added class for ${classData.date} at ${classData.start_time}`
          )
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log(`📊 Total classes to create: ${classesToCreate.length}`)

      if (classesToCreate.length === 0) {
        throw new Error(
          'No se generaron clases. Verifica el rango de fechas y días seleccionados.'
        )
      }

      // Test with just one class first to see if the basic operation works
      console.log('🚀 Attempting to create classes in database...')
      console.log('📝 First class sample:', classesToCreate[0])

      // Fix for TypeScript error - use type assertion
      const { data, error } = await supabase
        .from('classes')
        .insert(classesToCreate as never)
        .select()

      if (error) {
        console.error('❌ Database error details:', error)
        console.error('❌ Error code:', error.code)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error details:', error.details)
        console.error('❌ Error hint:', error.hint)
        throw error
      }

      console.log('✅ Season created successfully!')
      console.log('📊 Created classes:', data)
      onSuccess()
    } catch (err: unknown) {
      console.error('💥 Error in handleSeasonSubmit:')
      console.error('💥 Error object:', err)
      console.error('💥 Error type:', typeof err)
      console.error('💥 Error keys:', Object.keys(err || {}))

      let errorMessage = 'Error al crear la temporada'

      if (err instanceof Error) {
        errorMessage = err.message
        console.error('💥 Error message:', err.message)
        console.error('💥 Error stack:', err.stack)
      } else if (err && typeof err === 'object') {
        // Handle Supabase errors
        const supabaseError = err as {
          code?: string
          message?: string
          details?: string
          hint?: string
        }
        if (supabaseError.message) {
          errorMessage = supabaseError.message
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details
        } else if (supabaseError.code) {
          errorMessage = `Error de base de datos: ${supabaseError.code}`
        }

        console.error('💥 Supabase error details:', {
          code: supabaseError.code,
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
        })
      }

      console.error('💥 Final error message to display:', errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activeTab === 'individual'
            ? editingClass
              ? 'Editar Clase'
              : 'Nueva Clase'
            : 'Nueva Temporada'}
        </CardTitle>
        <CardDescription>
          {activeTab === 'individual'
            ? 'Completa la información de la clase'
            : 'Configura una temporada para crear múltiples clases automáticamente'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='individual'>Clase Individual</TabsTrigger>
            <TabsTrigger value='season'>Temporada</TabsTrigger>
          </TabsList>

          <TabsContent value='individual'>
            <IndividualClassForm
              editingClass={editingClass}
              onSubmit={handleIndividualSubmit}
              onCancel={onCancel}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value='season'>
            <SeasonClassForm
              onSubmit={handleSeasonSubmit}
              onCancel={onCancel}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
