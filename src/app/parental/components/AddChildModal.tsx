import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { NewChildForm } from './types'

interface AddChildModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: NewChildForm
  onFormChange: (form: NewChildForm) => void
  onSubmit: () => void
  loading: boolean
}

export function AddChildModal({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  loading,
}: AddChildModalProps) {
  const handleChange = (field: keyof NewChildForm, value: string) => {
    onFormChange({
      ...formData,
      [field]: value,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Hijo</DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo hijo
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='full_name'>Nombre completo *</Label>
            <Input
              id='full_name'
              placeholder='Nombre completo del hijo/a'
              value={formData.full_name}
              onChange={e => handleChange('full_name', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='nickname'>Apodo (opcional)</Label>
            <Input
              id='nickname'
              placeholder='Apodo o diminutivo'
              value={formData.nickname}
              onChange={e => handleChange('nickname', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='birth_date'>Fecha de nacimiento (opcional)</Label>
            <Input
              id='birth_date'
              type='date'
              value={formData.birth_date}
              onChange={e => handleChange('birth_date', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Nivel inicial</Label>
            <Select
              value={formData.level}
              onValueChange={value => handleChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='alpha'>Alpha (Principiante)</SelectItem>
                <SelectItem value='beta'>Beta (Intermedio)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formData.full_name || loading}
            >
              {loading ? 'Creando...' : 'Crear Hijo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}