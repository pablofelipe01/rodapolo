import { Alert, AlertDescription } from '@/components/ui/alert'

interface AlertMessagesProps {
  error: string | null
  paymentStatus: string | null
}

export function AlertMessages({ error, paymentStatus }: AlertMessagesProps) {
  return (
    <>
      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>{error}</AlertDescription>
        </Alert>
      )}

      {paymentStatus === 'success' && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>
            ¡Pago exitoso! Tus tickets han sido agregados a tu cuenta.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === 'cancelled' && (
        <Alert className='border-yellow-200 bg-yellow-50'>
          <AlertDescription className='text-yellow-800'>
            Pago cancelado. Puedes intentar nuevamente cuando quieras.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
