'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Award, Medal } from 'lucide-react'

// Mock data for achievements
const achievements = [
  {
    id: 1,
    title: 'Primera Clase',
    description: 'Completaste tu primera clase de rodapolo',
    icon: '🏆',
    unlocked: true,
    date: '2024-01-15',
    rarity: 'common',
  },
  {
    id: 2,
    title: 'Asistencia Perfecta',
    description: 'No faltaste a ninguna clase por un mes',
    icon: '⭐',
    unlocked: true,
    date: '2024-02-01',
    rarity: 'rare',
  },
  {
    id: 3,
    title: 'Mejoría Continua',
    description: 'Mejoraste tu handicap 3 veces seguidas',
    icon: '📈',
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 4,
    title: 'Líder del Grupo',
    description: 'Fuiste elegido capitán del equipo',
    icon: '👑',
    unlocked: false,
    rarity: 'legendary',
  },
]

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-yellow-100 text-yellow-800',
}

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-white mb-4'>Mis Logros</h1>
        <p className='text-lg text-white/80 max-w-2xl mx-auto'>
          Descubre y celebra tus progresos en el mundo del rodapolo
        </p>

        {/* Progress Stats */}
        <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto'>
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-center space-x-2'>
                <Trophy className='h-8 w-8 text-yellow-300' />
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {unlockedCount}
                  </p>
                  <p className='text-sm text-white/70'>Desbloqueados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-center space-x-2'>
                <Star className='h-8 w-8 text-blue-300' />
                <div>
                  <p className='text-2xl font-bold text-white'>{totalCount}</p>
                  <p className='text-sm text-white/70'>Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-center space-x-2'>
                <Medal className='h-8 w-8 text-purple-300' />
                <div>
                  <p className='text-2xl font-bold text-white'>
                    {Math.round((unlockedCount / totalCount) * 100)}%
                  </p>
                  <p className='text-sm text-white/70'>Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {achievements.map(achievement => (
          <Card
            key={achievement.id}
            className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:scale-105 ${
              achievement.unlocked
                ? 'border-2 border-green-300/50 shadow-lg'
                : 'border-2 border-white/20 opacity-80'
            }`}
          >
            <CardHeader className='text-center'>
              <div className='text-4xl mb-2'>{achievement.icon}</div>
              <CardTitle className='flex items-center justify-center gap-2 text-white'>
                {achievement.title}
                <Badge
                  className={
                    rarityColors[
                      achievement.rarity as keyof typeof rarityColors
                    ]
                  }
                >
                  {achievement.rarity}
                </Badge>
              </CardTitle>
              <CardDescription className='text-white/70'>
                {achievement.description}
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              {achievement.unlocked ? (
                <div className='space-y-2'>
                  <Badge className='bg-green-500/20 text-green-300 border-green-300/30'>
                    <Award className='h-3 w-3 mr-1' />
                    Desbloqueado
                  </Badge>
                  {achievement.date && (
                    <p className='text-sm text-white/60'>
                      {new Date(achievement.date).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              ) : (
                <Badge
                  variant='outline'
                  className='text-white/60 border-white/30'
                >
                  Por desbloquear
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state for no achievements */}
      {achievements.length === 0 && (
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 text-center py-12'>
          <CardContent>
            <Trophy className='h-16 w-16 text-white/30 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-white mb-2'>
              Aún no tienes logros
            </h3>
            <p className='text-white/60'>
              Sigue participando en clases y actividades para desbloquear logros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
