import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

interface AlertMessageProps {
  type: 'error' | 'success'
  message: string
}

export function AlertMessage({ type, message }: AlertMessageProps) {
  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'}>
      {type === 'success' && <CheckCircle className='h-4 w-4' />}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}