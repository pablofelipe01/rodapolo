import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ClassInfo, JuniorProfile } from './types'
import { MapPin, Ticket, CheckCircle2 } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedClass: ClassInfo | null
  selectedJuniors: string[]
  children: JuniorProfile[]
  onToggleJunior: (juniorId: string) => void
  onConfirm: () => void
  loading: boolean
  hasExistingBooking: (juniorId: string, classId: string) => boolean
}

export function BookingModal({
  open,
  onOpenChange,
  selectedClass,
  selectedJuniors,
  children,
  onToggleJunior,
  onConfirm,
  loading,
  hasExistingBooking,
}: BookingModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  // Get location color based on admin side colors
  const getLocationColor = (field: string | null) => {
    if (!field) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    const fieldLower = field.toLowerCase()
    if (fieldLower.includes('marbella')) return 'bg-green-100 text-green-800 border-green-200'
    if (fieldLower.includes('sotogrande')) return 'bg-blue-100 text-blue-800 border-blue-200'
    
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Get display name for field
  const getLocationDisplayName = (field: string | null) => {
    if (!field) return 'Sin ubicación'
    
    const fieldLower = field.toLowerCase()
    if (fieldLower.includes('marbella')) return 'Marbella'
    if (fieldLower.includes('sotogrande')) return 'Sotogrande'
    
    return field
  }

  const availableChildren = children.filter(
    child =>
      child.active &&
      (selectedClass?.level === 'mixed' || child.level === selectedClass?.level)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar Clase</DialogTitle>
          <DialogDescription>
            Selecciona para cuál(es) de tus hijos quieres reservar esta clase
          </DialogDescription>
        </DialogHeader>

        {selectedClass && (
          <div className='space-y-4'>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-medium'>{selectedClass.instructor_name}</h3>
              <div className='flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap'>
                <span>{formatDate(selectedClass.date)}</span>
                <span>
                  {formatTime(selectedClass.start_time)} -{' '}
                  {formatTime(selectedClass.end_time)}
                </span>
                <Badge
                  variant={selectedClass.level === 'mixed' ? 'outline' : 'default'}
                >
                  {selectedClass.level === 'mixed'
                    ? 'MIXTO'
                    : selectedClass.level.toUpperCase()}
                </Badge>
                <Badge 
                  variant='outline' 
                  className={getLocationColor(selectedClass.field)}
                >
                  <MapPin className='h-3 w-3 mr-1' />
                  {getLocationDisplayName(selectedClass.field)}
                </Badge>
              </div>
            </div>

            {/* Ticket Usage Info */}
            <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
              <div className='flex items-center gap-2 text-sm text-blue-800'>
                <Ticket className='h-4 w-4' />
                <span>
                  Esta reserva utilizará <strong>{selectedJuniors.length} ticket(s)</strong>
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <label className='text-sm font-medium'>
                Seleccionar hijo(s):
              </label>
              <div className='space-y-3 max-h-48 overflow-y-auto'>
                {availableChildren.map(child => {
                  const alreadyBooked = selectedClass ? hasExistingBooking(child.id, selectedClass.id) : false
                  
                  return (
                    <div
                      key={child.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg ${
                        alreadyBooked 
                          ? 'bg-green-50 border-green-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {alreadyBooked ? (
                        <div className='flex items-center gap-3 text-green-700 flex-1'>
                          <CheckCircle2 className='h-5 w-5 text-green-600' />
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{child.full_name}</span>
                            <Badge variant='outline' className='bg-green-100 text-green-800'>
                              RESERVADO
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Checkbox
                            id={`junior-${child.id}`}
                            checked={selectedJuniors.includes(child.id)}
                            onCheckedChange={() => onToggleJunior(child.id)}
                            disabled={alreadyBooked}
                          />
                          <label
                            htmlFor={`junior-${child.id}`}
                            className='flex items-center gap-2 cursor-pointer flex-1'
                          >
                            <span>{child.full_name}</span>
                            <Badge variant='outline'>
                              {child.level.toUpperCase()}
                            </Badge>
                          </label>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
              {availableChildren.length === 0 && (
                <p className='text-sm text-gray-500 italic'>
                  No tienes hijos disponibles para esta clase.
                </p>
              )}
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={selectedJuniors.length === 0 || loading}
              >
                {loading
                  ? 'Reservando...'
                  : selectedJuniors.length === 1
                    ? `Confirmar Reserva (1 ticket)`
                    : `Confirmar ${selectedJuniors.length} Reservas (${selectedJuniors.length} tickets)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}