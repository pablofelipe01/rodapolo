import { useState, useEffect } from 'react'
import type { ClassRow, FormData } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IndividualClassFormProps {
  editingClass: ClassRow | null
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  loading: boolean
}

export function IndividualClassForm({
  editingClass,
  onSubmit,
  onCancel,
  loading,
}: IndividualClassFormProps) {
  const [formData, setFormData] = useState<FormData>({
    date: '',
    start_time: '',
    end_time: '',
    instructor_name: '',
    capacity: 8,
    level: 'mixed',
    status: 'scheduled',
    field: null,
    notes: null,
  })

  useEffect(() => {
    if (editingClass) {
      setFormData({
        date: editingClass.date,
        start_time: editingClass.start_time,
        end_time: editingClass.end_time,
        instructor_name: editingClass.instructor_name,
        capacity: editingClass.capacity,
        level: editingClass.level,
        status: editingClass.status,
        field: editingClass.field,
        notes: editingClass.notes,
      })
    }
  }, [editingClass])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='date'>Fecha</Label>
          <Input
            id='date'
            type='date'
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='instructor'>Instructor</Label>
          <Input
            id='instructor'
            value={formData.instructor_name}
            onChange={e => setFormData({ ...formData, instructor_name: e.target.value })}
            placeholder='Nombre del instructor'
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='start_time'>Hora de Inicio</Label>
          <Input
            id='start_time'
            type='time'
            value={formData.start_time}
            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='end_time'>Hora de Fin</Label>
          <Input
            id='end_time'
            type='time'
            value={formData.end_time}
            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='capacity'>Capacidad</Label>
          <Input
            id='capacity'
            type='number'
            min='1'
            max='50'
            value={formData.capacity}
            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='level'>Nivel</Label>
          <Select
            value={formData.level}
            onValueChange={value => setFormData({ ...formData, level: value as 'alpha' | 'beta' | 'mixed' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='alpha'>Alpha</SelectItem>
              <SelectItem value='beta'>Beta</SelectItem>
              <SelectItem value='mixed'>Mixto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='status'>Estado</Label>
          <Select
            value={formData.status}
            onValueChange={value => setFormData({ 
              ...formData, 
              status: value as 'scheduled' | 'confirmed' | 'cancelled' | 'completed' 
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='scheduled'>Programada</SelectItem>
              <SelectItem value='confirmed'>Confirmada</SelectItem>
              <SelectItem value='cancelled'>Cancelada</SelectItem>
              <SelectItem value='completed'>Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='field'>Ciudad</Label>
          <Select
            value={formData.field || ''}
            onValueChange={value => setFormData({ 
              ...formData, 
              field: value as 'sotogrande' | 'marbella' | null 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='sotogrande'>Sotogrande</SelectItem>
              <SelectItem value='marbella'>Marbella</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>Notas</Label>
        <Input
          id='notes'
          value={formData.notes || ''}
          onChange={e => setFormData({ ...formData, notes: e.target.value || null })}
          placeholder='Notas adicionales'
        />
      </div>

      <div className='flex gap-2'>
        <Button type='submit' disabled={loading}>
          {loading ? 'Guardando...' : editingClass ? 'Actualizar' : 'Crear'} Clase
        </Button>
        <Button type='button' variant='outline' onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}