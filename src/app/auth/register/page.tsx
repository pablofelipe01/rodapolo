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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClientSupabase()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!formData.userType) {
      setError('Selecciona el tipo de usuario')
      setLoading(false)
      return
    }

    try {
      // Registrar usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            user_type: formData.userType,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.user) {
        setSuccess(
          'Registro exitoso. Revisa tu email para confirmar tu cuenta.'
        )
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error) {
      setError('Error inesperado al registrarse')
      console.error('Register error:', error)
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
              Crear Cuenta
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              ¿Ya tienes una cuenta?{' '}
              <Link
                href='/auth/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registro para Padres y Administradores</CardTitle>
              <CardDescription>
                Completa la información para crear tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>Nombre</Label>
                    <Input
                      id='firstName'
                      required
                      value={formData.firstName}
                      onChange={e =>
                        handleInputChange('firstName', e.target.value)
                      }
                      placeholder='Tu nombre'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Apellido</Label>
                    <Input
                      id='lastName'
                      required
                      value={formData.lastName}
                      onChange={e =>
                        handleInputChange('lastName', e.target.value)
                      }
                      placeholder='Tu apellido'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    required
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder='tu@email.com'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Teléfono</Label>
                  <Input
                    id='phone'
                    type='tel'
                    required
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder='+1 234 567 8900'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='userType'>Tipo de Usuario</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={value =>
                      handleInputChange('userType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona tu rol' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='parental'>Padre/Madre</SelectItem>
                      <SelectItem value='admin'>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <Input
                    id='password'
                    type='password'
                    required
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder='••••••••'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirmar Contraseña</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    required
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    placeholder='••••••••'
                  />
                </div>

                <Button type='submit' className='w-full' disabled={loading}>
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Crear Cuenta
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
