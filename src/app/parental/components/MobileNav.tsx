'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, Users, Ticket, Calendar, Home } from 'lucide-react'

interface MobileNavProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'children', label: 'Mis Hijos', icon: Users },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'bookings', label: 'Reservas', icon: Calendar },
  ]

  const handleSelect = (view: string) => {
    onViewChange(view)
    setOpen(false)
  }

  const getCurrentIcon = () => {
    const currentItem = menuItems.find(item => item.id === currentView)
    return currentItem ? currentItem.icon : Menu
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <div className="md:hidden">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <CurrentIcon className="h-4 w-4 mr-2" />
            <span className="capitalize">
              {menuItems.find(item => item.id === currentView)?.label || 'Menú'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-2 ${
                  currentView === item.id ? 'bg-accent' : ''
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}