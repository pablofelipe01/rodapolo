'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Users,
  Trophy,
  Zap,
  ArrowRight,
  PlayCircle,
  Shield,
  Calendar,
  Target,
  Sparkles,
  CheckCircle2,
  Award,
  Heart,
} from 'lucide-react'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [_isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!loading && user && profile) {
      router.push(`/${profile.role}`)
    }
    setIsVisible(true)
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <MainLayout showNavigation={false}>
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto mb-4'></div>
            <p className='text-cyan-100 font-light'>Cargando experiencia...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (user && profile) {
    return null
  }

  const features = [
    {
      icon: <Users className='h-10 w-10' />,
      title: 'Para Padres',
      description:
        'Control total sobre las actividades de tus hijos con herramientas intuitivas y seguras.',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      features: [
        'Gestión de perfiles',
        'Reservas inteligentes',
        'Seguimiento en tiempo real',
        'Pagos seguros',
      ],
    },
    {
      icon: <Trophy className='h-10 w-10' />,
      title: 'Para Administradores',
      description:
        'Dashboard completo con analytics avanzados y gestión integral del centro deportivo.',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      features: [
        'Panel de control',
        'Gestión de usuarios',
        'Analytics avanzados',
        'Reportes automáticos',
      ],
    },
    {
      icon: <Zap className='h-10 w-10' />,
      title: 'Para Jóvenes',
      description:
        'Experiencia gamificada con recompensas, logros y comunidad interactiva.',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      features: [
        'Acceso con código',
        'Sistema de logros',
        'Comunidad social',
        'Contenido exclusivo',
      ],
    },
  ]

  const stats = [
    {
      number: '2.5K+',
      label: 'Miembros Activos',
      icon: <Users className='h-6 w-6' />,
    },
    {
      number: '15K+',
      label: 'Clases Impartidas',
      icon: <Calendar className='h-6 w-6' />,
    },
    {
      number: '98%',
      label: 'Satisfacción',
      icon: <Heart className='h-6 w-6' />,
    },
    {
      number: '24/7',
      label: 'Soporte Premium',
      icon: <Shield className='h-6 w-6' />,
    },
  ]

  const benefits = [
    {
      icon: <Sparkles className='h-6 w-6' />,
      text: 'Interfaz moderna e intuitiva',
    },
    {
      icon: <Target className='h-6 w-6' />,
      text: 'Enfoque en experiencia móvil',
    },
    {
      icon: <Award className='h-6 w-6' />,
      text: 'Tecnología de última generación',
    },
    {
      icon: <CheckCircle2 className='h-6 w-6' />,
      text: 'Implementación rápida',
    },
  ]

  return (
    <MainLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50'>
        {/* ===== MODERN HERO SECTION ===== */}
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800'>
          {/* Animated background elements */}
          <div className='absolute inset-0'>
            <div className='absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse'></div>
            <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
            <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500'></div>
          </div>

          {/* Main content */}
          <div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            {/* Logo with glow effect - 3x larger */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: 'spring' }}
              className='mx-auto mb-12 flex justify-center'
            >
              <div className='relative'>
                <div className='w-96 h-96 lg:w-120 lg:h-120 relative'>
                  {' '}
                  {/* 3x larger: 32*3=96, 40*3=120 */}
                  <Image
                    src='/logo.png'
                    alt='Rodapolo'
                    fill
                    className='object-contain drop-shadow-2xl'
                    priority
                  />
                </div>
                <div className='absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl animate-pulse'></div>
              </div>
            </motion.div>

            {/* Subheading - Removed the main heading with "RODAPOLO" text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className='mb-8 text-2xl lg:text-3xl text-cyan-100 font-light max-w-4xl mx-auto leading-relaxed'
            >
              Revolucionamos el{' '}
              <span className='text-cyan-300 font-semibold'>
                polo con monociclos eléctricos
              </span>{' '}
              con una plataforma que conecta, inspira y transforma experiencias
              deportivas
            </motion.p>

            {/* Benefits pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className='flex flex-wrap justify-center gap-3 mb-12'
            >
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-cyan-100 text-sm'
                >
                  {benefit.icon}
                  {benefit.text}
                </div>
              ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className='flex flex-col sm:flex-row gap-4 justify-center items-center'
            >
              <Link href='/auth/register' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border-0'
                >
                  <Sparkles className='mr-2 h-5 w-5' />
                  Comenzar Ahora
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </Link>

              <Link href='/auth/login' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300'
                >
                  Iniciar Sesión
                </Button>
              </Link>

              <Link href='/auth/junior' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0'
                >
                  <PlayCircle className='mr-2 h-5 w-5' />
                  Acceso con Código
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className='absolute bottom-8 left-1/2 transform -translate-x-1/2'
          >
            <div className='animate-bounce'>
              <div className='w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center'>
                <div className='w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse'></div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===== MODERN STATS SECTION ===== */}
        <section className='py-20 bg-white relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-cyan-50 to-purple-50 opacity-50'></div>
          <div className='relative container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className='text-center group'
                >
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300'>
                    {stat.icon}
                  </div>
                  <div className='text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2'>
                    {stat.number}
                  </div>
                  <div className='text-slate-600 font-medium text-sm uppercase tracking-wider'>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MODERN FEATURES SECTION ===== */}
        <section className='py-20 bg-gradient-to-br from-slate-50 to-cyan-50 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl'></div>

          <div className='relative container mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className='text-center mb-20'
            >
              <div className='inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-6 py-3 text-slate-600 text-sm font-medium mb-6'>
                <Sparkles className='h-4 w-4 text-cyan-500' />
                PLATAFORMA INTEGRAL
              </div>
              <h2 className='text-5xl lg:text-6xl font-black text-slate-800 mb-6'>
                Diseñado para{' '}
                <span className='bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent'>
                  Cada Usuario
                </span>
              </h2>
              <p className='text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed'>
                Una experiencia personalizada que se adapta perfectamente a las
                necesidades específicas de padres, administradores y jóvenes
                deportistas
              </p>
            </motion.div>

            {/* Feature cards */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`${feature.bgColor} ${feature.borderColor} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border-2 relative overflow-hidden group`}
                >
                  {/* Background pattern */}
                  <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/50 to-transparent rounded-full -translate-y-16 translate-x-16'></div>

                  {/* Feature icon */}
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.color} text-white mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    {feature.icon}
                  </div>

                  {/* Feature title */}
                  <h3 className='text-2xl font-bold text-slate-800 mb-4 relative z-10'>
                    {feature.title}
                  </h3>

                  {/* Feature description */}
                  <p className='text-slate-600 mb-6 text-lg leading-relaxed relative z-10'>
                    {feature.description}
                  </p>

                  {/* Feature list */}
                  <ul className='space-y-3 relative z-10'>
                    {feature.features.map((item, idx) => (
                      <li
                        key={idx}
                        className='flex items-center text-slate-700 font-medium'
                      >
                        <CheckCircle2 className='h-5 w-5 text-green-500 mr-3 flex-shrink-0' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MODERN CTA SECTION ===== */}
        <section className='py-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden'>
          <div className='absolute inset-0'>
            <div className='absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl'></div>
          </div>

          <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-cyan-100 text-sm font-medium mb-6'>
                <Sparkles className='h-4 w-4 text-cyan-300' />
                ¿LISTO PARA COMENZAR?
              </div>

              <h2 className='text-4xl lg:text-5xl font-black text-white mb-6'>
                Transforma tu Experiencia{' '}
                <span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                  Deportiva
                </span>
              </h2>

              <p className='text-xl text-cyan-100 mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed'>
                Únete a la comunidad más innovadora de rodapolo y descubre por
                qué miles de usuarios confían en nuestra plataforma
              </p>

              {/* CTA buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href='/auth/register'>
                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border-0'
                  >
                    <Sparkles className='mr-2 h-5 w-5' />
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href='/auth/login'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300'
                  >
                    Acceder a Mi Cuenta
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
