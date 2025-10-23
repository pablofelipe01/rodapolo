import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableTickets: number
  onPurchase: (packageType: string) => void
}

export function TicketModal({
  open,
  onOpenChange,
  availableTickets,
  onPurchase,
}: TicketModalProps) {
  const packages = [
    {
      id: 'basic',
      name: 'Paquete Básico',
      tickets: 5,
      price: '$25.00',
      pricePerTicket: '$5.00 por ticket',
      description: '5 tickets',
    },
    {
      id: 'popular',
      name: 'Paquete Popular',
      tickets: 10,
      price: '$45.00',
      pricePerTicket: '$4.50 por ticket',
      description: '10 tickets',
      badge: 'Más vendido',
      savings: 'Ahorra $5.00',
    },
    {
      id: 'premium',
      name: 'Paquete Premium',
      tickets: 20,
      price: '$80.00',
      pricePerTicket: '$4.00 por ticket',
      description: '20 tickets',
      badge: 'Mejor valor',
      savings: 'Ahorra $20.00',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Comprar Tickets</DialogTitle>
          <DialogDescription>
            Selecciona un paquete de tickets para las clases de tus hijos
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='bg-indigo-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium text-indigo-900'>
                  Tickets Disponibles
                </p>
                <p className='text-sm text-indigo-600'>
                  Puedes usar estos tickets para reservar clases
                </p>
              </div>
              <div className='text-2xl font-bold text-indigo-900'>
                {availableTickets}
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <h4 className='font-medium'>Paquetes Disponibles</h4>

            {packages.map(pkg => (
              <Card
                key={pkg.id}
                className='border-2 hover:border-indigo-200 cursor-pointer transition-colors'
              >
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h5 className='font-semibold'>{pkg.name}</h5>
                      <p className='text-sm text-gray-600'>{pkg.description}</p>
                      {pkg.badge && (
                        <Badge variant='secondary' className='mt-1'>
                          {pkg.badge}
                        </Badge>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold'>{pkg.price}</p>
                      <p className='text-xs text-gray-500'>
                        {pkg.pricePerTicket}
                      </p>
                      {pkg.savings && (
                        <p className='text-xs text-green-600 font-medium'>
                          {pkg.savings}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className='w-full mt-3 bg-indigo-600 hover:bg-indigo-700'
                    onClick={() => onPurchase(pkg.id)}
                  >
                    Comprar {pkg.tickets} Tickets
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
