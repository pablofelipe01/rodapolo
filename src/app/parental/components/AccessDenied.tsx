import { Alert, AlertDescription } from '@/components/ui/alert'

interface AccessDeniedProps {
  message: string
}

export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <div className='text-center py-12'>
      <Alert className='max-w-md mx-auto border-orange-200 bg-orange-50'>
        <AlertDescription className='text-orange-800'>{message}</AlertDescription>
      </Alert>
    </div>
  )
}