'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function JuniorAccessPage() {
  const [uniqueCode, setUniqueCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientSupabase()
  const { signIn } = useJuniorAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Buscar el perfil junior por código único
      const { data: juniorProfile, error: profileError } = await supabase
        .from('junior_profiles')
        .select('*')
        .eq('unique_code', uniqueCode.toUpperCase())
        .eq('active', true)
        .single()

      if (profileError || !juniorProfile) {
        setError('Código no válido o inactivo')
        return
      }

      // Crear sesión temporal para el junior usando el provider
      signIn(juniorProfile)

      // Redirigir al dashboard junior
      router.push('/junior')
    } catch (error) {
      setError('Error al verificar el código')
      console.error('Junior access error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout showNavigation={false}>
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto mb-6 flex justify-center'>
              <div className='h-20 w-20 rounded-full bg-white flex items-center justify-center'>
                <span className='text-4xl'>⚡</span>
              </div>
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-white'>
              Acceso Juvenil
            </h2>
            <p className='mt-2 text-sm text-purple-100'>
              Ingresa tu código único para acceder
            </p>
          </div>

          <Card className='backdrop-blur-sm bg-white/90'>
            <CardHeader>
              <CardTitle className='text-center'>
                🎯 Tu Código Especial
              </CardTitle>
              <CardDescription className='text-center'>
                Usa el código que te dieron tus padres o el administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='uniqueCode' className='text-lg'>
                    Código de Acceso
                  </Label>
                  <Input
                    id='uniqueCode'
                    name='uniqueCode'
                    type='text'
                    required
                    value={uniqueCode}
                    onChange={e => setUniqueCode(e.target.value.toUpperCase())}
                    placeholder='ABC123'
                    className='text-center text-xl font-mono tracking-wider'
                    maxLength={10}
                  />
                  <p className='text-xs text-gray-500 text-center'>
                    Ingresa las letras y números tal como te los dieron
                  </p>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-purple-600 hover:bg-purple-700 text-lg py-3'
                  disabled={loading || uniqueCode.length < 3}
                >
                  {loading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
                  🚀 Entrar
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className='text-center'>
            <p className='text-sm text-purple-100'>
              ¿No tienes un código?{' '}
              <span className='font-medium'>
                Pídele ayuda a tus padres o al entrenador
              </span>
            </p>
            <div className='mt-4'>
              <Link
                href='/auth/login'
                className='text-sm text-purple-100 hover:text-white underline'
              >
                ¿Eres adulto? Accede aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
