'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, Calendar, MapPin, Edit } from 'lucide-react'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'

export default function ProfilePage() {
  const { juniorProfile } = useJuniorAuth()

  // Mock data for profile - in real app, this would come from your auth provider
  const profileData = {
    email: 'juanito@ejemplo.com',
    phone: '+34 612 345 678',
    birth_date: '2015-03-15',
    address: 'Calle Principal 123, Madrid',
    emergency_contact: {
      name: 'María Pérez',
      phone: '+34 600 123 456',
      relationship: 'Madre',
    },
  }

  const getLevelColor = () => {
    return juniorProfile?.level === 'alpha' ? 'bg-yellow-400' : 'bg-blue-400'
  }

  const getLevelEmoji = () => {
    return juniorProfile?.level === 'alpha' ? '⭐' : '🌟'
  }

  const getAvatarFallback = () => {
    return juniorProfile?.full_name?.charAt(0)?.toUpperCase() || '👤'
  }

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-white mb-4'>Mi Perfil</h1>
        <p className='text-lg text-white/80'>
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Profile Card */}
        <div className='lg:col-span-1'>
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 sticky top-24'>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <Avatar className='h-24 w-24 mx-auto mb-4'>
                  <AvatarImage
                    src={juniorProfile?.avatar_url}
                    alt={juniorProfile?.full_name}
                  />
                  <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-bold'>
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>

                <h2 className='text-xl font-bold text-white'>
                  {juniorProfile?.nickname || juniorProfile?.full_name}
                </h2>
                <p className='text-white/80'>{juniorProfile?.full_name}</p>

                <Badge
                  className={`${getLevelColor()} text-white border-0 px-3 py-1 text-sm font-bold mt-2`}
                >
                  {getLevelEmoji()} {juniorProfile?.level?.toUpperCase()}
                </Badge>

                <div className='mt-4 space-y-2'>
                  <div className='flex items-center justify-center text-sm text-white/80'>
                    <span className='font-semibold'>Código:</span>
                    <span className='ml-2 font-mono'>
                      {juniorProfile?.unique_code}
                    </span>
                  </div>
                  <div className='flex items-center justify-center text-sm text-white/80'>
                    <span className='font-semibold'>Handicap:</span>
                    <span className='ml-2'>⛳ {juniorProfile?.handicap}</span>
                  </div>
                </div>

                <Button className='w-full mt-6 bg-white/20 hover:bg-white/30 border-white/20'>
                  <Edit className='h-4 w-4 mr-2' />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Personal Information */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <User className='h-5 w-5' />
                Información Personal
              </CardTitle>
              <CardDescription className='text-white/70'>
                Tus datos de contacto e información básica
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>Email</p>
                    <p className='text-sm text-white/80'>{profileData.email}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>Teléfono</p>
                    <p className='text-sm text-white/80'>{profileData.phone}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Calendar className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Fecha de Nacimiento
                    </p>
                    <p className='text-sm text-white/80'>
                      {new Date(profileData.birth_date).toLocaleDateString(
                        'es-ES'
                      )}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <MapPin className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>Dirección</p>
                    <p className='text-sm text-white/80'>
                      {profileData.address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='text-white'>
                Contacto de Emergencia
              </CardTitle>
              <CardDescription className='text-white/70'>
                Persona a contactar en caso de emergencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-medium text-white'>
                      {profileData.emergency_contact.name}
                    </p>
                    <p className='text-sm text-white/80'>
                      {profileData.emergency_contact.relationship}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-white'>
                      {profileData.emergency_contact.phone}
                    </p>
                    <p className='text-xs text-white/60'>Teléfono</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='text-white'>Estadísticas</CardTitle>
              <CardDescription className='text-white/70'>
                Tu progreso y actividad en Rodapolo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                <div className='p-4 bg-white/10 rounded-lg'>
                  <p className='text-2xl font-bold text-purple-300'>24</p>
                  <p className='text-sm text-white/70'>Clases</p>
                </div>
                <div className='p-4 bg-white/10 rounded-lg'>
                  <p className='text-2xl font-bold text-green-300'>18</p>
                  <p className='text-sm text-white/70'>Asistencias</p>
                </div>
                <div className='p-4 bg-white/10 rounded-lg'>
                  <p className='text-2xl font-bold text-blue-300'>6</p>
                  <p className='text-sm text-white/70'>Logros</p>
                </div>
                <div className='p-4 bg-white/10 rounded-lg'>
                  <p className='text-2xl font-bold text-yellow-300'>12</p>
                  <p className='text-sm text-white/70'>Handicap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
