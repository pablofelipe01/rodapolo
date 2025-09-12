'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // El middleware se encargará de redirigir al dashboard apropiado
        router.push('/')
      }
    } catch (error) {
      setError('Error inesperado al iniciar sesión')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout showNavigation={false}>
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Iniciar Sesión
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              ¿No tienes una cuenta?{' '}
              <Link
                href='/auth/register'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acceso para Padres y Administradores</CardTitle>
              <CardDescription>
                Ingresa tu email y contraseña para acceder a tu cuenta
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
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='tu@email.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='••••••••'
                  />
                </div>

                <Button type='submit' className='w-full' disabled={loading}>
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Iniciar Sesión
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              ¿Eres menor de edad?{' '}
              <Link
                href='/auth/junior'
                className='font-medium text-purple-600 hover:text-purple-500'
              >
                Accede con tu código
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
