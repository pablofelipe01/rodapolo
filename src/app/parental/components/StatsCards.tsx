import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Baby, Users, Star, Trophy, Ticket, CreditCard } from 'lucide-react'
import { DashboardStats } from './types'

interface StatsCardsProps {
  stats: DashboardStats
  availableTickets: number
  onBuyTickets: () => void
}

export function StatsCards({
  stats,
  availableTickets,
  onBuyTickets,
}: StatsCardsProps) {
  const cards = [
    {
      icon: Baby,
      label: 'Mis Hijos',
      value: stats.totalChildren,
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      label: 'Activos',
      value: stats.activeChildren,
      color: 'bg-green-500',
    },
    {
      icon: Star,
      label: 'Alpha',
      value: stats.alphaChildren,
      color: 'bg-purple-500',
    },
    {
      icon: Trophy,
      label: 'Beta',
      value: stats.betaChildren,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
      {cards.map((card, index) => (
        <Card key={index} className='overflow-hidden'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center'>
              <div className={`rounded-full ${card.color} p-2 sm:p-3`}>
                <card.icon className='h-4 w-4 sm:h-6 sm:w-6 text-white' />
              </div>
              <div className='ml-2 sm:ml-3'>
                <p className='text-xs sm:text-sm font-medium text-gray-600'>
                  {card.label}
                </p>
                <p className='text-lg sm:text-2xl font-bold text-gray-900'>
                  {card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className='col-span-2 md:col-span-1 overflow-hidden'>
        <CardContent className='p-3 sm:p-4'>
          <div className='flex items-center'>
            <div className='rounded-full bg-indigo-500 p-2 sm:p-3'>
              <Ticket className='h-4 w-4 sm:h-6 sm:w-6 text-white' />
            </div>
            <div className='ml-2 sm:ml-3'>
              <p className='text-xs sm:text-sm font-medium text-gray-600'>
                Tickets
              </p>
              <p className='text-lg sm:text-2xl font-bold text-gray-900'>
                {availableTickets}
              </p>
            </div>
          </div>
          <div className='mt-2 sm:mt-3'>
            <Button
              size='sm'
              className='w-full bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm'
              onClick={onBuyTickets}
            >
              <CreditCard className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
              Comprar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
