import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Baby, Users, Star, Trophy, Ticket, CreditCard } from 'lucide-react'
import { DashboardStats } from './types'

interface StatsCardsProps {
  stats: DashboardStats
  availableTickets: number
  onBuyTickets: () => void
}

export function StatsCards({ stats, availableTickets, onBuyTickets }: StatsCardsProps) {
  const cards = [
    { icon: Baby, label: 'Mis Hijos', value: stats.totalChildren, color: 'bg-blue-500' },
    { icon: Users, label: 'Activos', value: stats.activeChildren, color: 'bg-green-500' },
    { icon: Star, label: 'Nivel Alpha', value: stats.alphaChildren, color: 'bg-purple-500' },
    { icon: Trophy, label: 'Nivel Beta', value: stats.betaChildren, color: 'bg-orange-500' },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className={`rounded-full ${card.color} p-3`}>
                <card.icon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>{card.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center'>
            <div className='rounded-full bg-indigo-500 p-3'>
              <Ticket className='h-6 w-6 text-white' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Tickets Disponibles</p>
              <p className='text-2xl font-bold text-gray-900'>{availableTickets}</p>
            </div>
          </div>
          <div className='mt-3'>
            <Button 
              size='sm' 
              className='w-full bg-indigo-600 hover:bg-indigo-700'
              onClick={onBuyTickets}
            >
              <CreditCard className='h-4 w-4 mr-2' />
              Comprar Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}