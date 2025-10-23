import { useState } from 'react'
import type { SeasonData } from '../types'
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

interface SeasonClassFormProps {
  onSubmit: (seasonData: SeasonData) => void
  onCancel: () => void
  loading: boolean
}

export function SeasonClassForm({
  onSubmit,
  onCancel,
  loading,
}: SeasonClassFormProps) {
  const [seasonData, setSeasonData] = useState<SeasonData>({
    name: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '',
    endTime: '',
    instructorName: '',
    capacity: 8,
    level: 'mixed',
    field: 'sotogrande', // Default city
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(seasonData)
  }

  const toggleDayOfWeek = (dayIndex: number) => {
    const newDays = seasonData.daysOfWeek.includes(dayIndex)
      ? seasonData.daysOfWeek.filter(d => d !== dayIndex)
      : [...seasonData.daysOfWeek, dayIndex]
    setSeasonData({ ...seasonData, daysOfWeek: newDays })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='season-name'>Nombre de la Temporada</Label>
        <Input
          id='season-name'
          value={seasonData.name}
          onChange={e => setSeasonData({ ...seasonData, name: e.target.value })}
          placeholder='Ej: Clases Alpha - Septiembre 2025'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='start-date'>Fecha de Inicio</Label>
          <Input
            id='start-date'
            type='date'
            value={seasonData.startDate}
            onChange={e =>
              setSeasonData({ ...seasonData, startDate: e.target.value })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='end-date'>Fecha de Fin</Label>
          <Input
            id='end-date'
            type='date'
            value={seasonData.endDate}
            onChange={e =>
              setSeasonData({ ...seasonData, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Días de la Semana</Label>
        <div className='flex gap-2 flex-wrap'>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(
            (day, index) => (
              <Button
                key={index}
                type='button'
                variant={
                  seasonData.daysOfWeek.includes(index) ? 'default' : 'outline'
                }
                className='w-16'
                onClick={() => toggleDayOfWeek(index)}
              >
                {day}
              </Button>
            )
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='season-start-time'>Hora de Inicio</Label>
          <Input
            id='season-start-time'
            type='time'
            value={seasonData.startTime}
            onChange={e =>
              setSeasonData({ ...seasonData, startTime: e.target.value })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='season-end-time'>Hora de Fin</Label>
          <Input
            id='season-end-time'
            type='time'
            value={seasonData.endTime}
            onChange={e =>
              setSeasonData({ ...seasonData, endTime: e.target.value })
            }
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='season-instructor'>Instructor</Label>
          <Input
            id='season-instructor'
            value={seasonData.instructorName}
            onChange={e =>
              setSeasonData({ ...seasonData, instructorName: e.target.value })
            }
            placeholder='Nombre del instructor'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='season-capacity'>Capacidad</Label>
          <Input
            id='season-capacity'
            type='number'
            min='1'
            max='20'
            value={seasonData.capacity}
            onChange={e =>
              setSeasonData({
                ...seasonData,
                capacity: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='season-level'>Nivel</Label>
          <Select
            value={seasonData.level}
            onValueChange={value =>
              setSeasonData({
                ...seasonData,
                level: value as 'alpha' | 'beta' | 'mixed',
              })
            }
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
          <Label htmlFor='season-field'>Ciudad</Label>
          <Select
            value={seasonData.field}
            onValueChange={value =>
              setSeasonData({
                ...seasonData,
                field: value as 'sotogrande' | 'marbella',
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='sotogrande'>Sotogrande</SelectItem>
              <SelectItem value='marbella'>Marbella</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='season-notes'>Notas</Label>
        <Input
          id='season-notes'
          value={seasonData.notes}
          onChange={e =>
            setSeasonData({ ...seasonData, notes: e.target.value })
          }
          placeholder='Notas adicionales'
        />
      </div>

      <div className='flex gap-2'>
        <Button type='submit' disabled={loading}>
          {loading ? 'Creando...' : 'Crear Temporada'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
