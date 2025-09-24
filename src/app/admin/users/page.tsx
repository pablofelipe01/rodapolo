'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSupabase } from '@/lib/supabase'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  Baby,
  ShieldCheck,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Star,
} from 'lucide-react'

type UserProfile = {
  id: string
  user_id: string
  role: 'admin' | 'parental'
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

type JuniorProfile = {
  id: string
  parental_id: string
  unique_code: string
  full_name: string
  nickname: string | null
  birth_date: string | null
  avatar_url: string | null
  handicap: number
  level: 'alpha' | 'beta'
  active: boolean
  created_at: string
  updated_at: string
}

type FormData = {
  full_name: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'parental'
}

type JuniorFormData = {
  full_name: string
  nickname: string
  birth_date: string
  handicap: number
  level: 'alpha' | 'beta'
  active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [juniors, setJuniors] = useState<JuniorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [juniorLoading, setJuniorLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showJuniorForm, setShowJuniorForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [editingJunior, setEditingJunior] = useState<JuniorProfile | null>(null)
  const [selectedParental, setSelectedParental] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'parental',
  })
  const [juniorFormData, setJuniorFormData] = useState<JuniorFormData>({
    full_name: '',
    nickname: '',
    birth_date: '',
    handicap: 0,
    level: 'alpha',
    active: true,
  })

  const supabase = createClientSupabase()

  // Función para obtener todos los usuarios
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Función para obtener junior profiles
  const fetchJuniors = useCallback(async () => {
    try {
      setJuniorLoading(true)
      const { data, error } = await supabase
        .from('junior_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJuniors(data || [])
    } catch (err) {
      console.error('Error fetching juniors:', err)
      setError('Error al cargar perfiles de hijos')
    } finally {
      setJuniorLoading(false)
    }
  }, [supabase])

  // Función para manejar el envío del formulario de usuarios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError(null)
      setSuccess(null)

      if (editingUser) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('profiles')
          // @ts-expect-error - Temporary ignore for type inference issue
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            role: formData.role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id)

        if (error) throw error
        setSuccess('Usuario actualizado exitosamente')
      } else {
        // Crear nuevo usuario usando Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role,
              },
            },
          }
        )

        if (authError) throw authError

        // Si se creó el usuario correctamente, crear el perfil en la tabla profiles
        if (authData.user) {
          console.log(
            '✅ Usuario creado en Auth, creando perfil...',
            authData.user.id
          )

          const { error: profileError } = await supabase
            .from('profiles')
            // @ts-expect-error - Temporary ignore for type inference issue
            .insert([
              {
                user_id: authData.user.id,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || null,
                role: formData.role,
              },
            ])

          if (profileError) {
            console.error('❌ Error creando perfil:', profileError)
            throw new Error(`Error creando perfil: ${profileError.message}`)
          }

          console.log('✅ Perfil creado exitosamente')
        }

        setSuccess('Usuario creado exitosamente')
      }

      resetForm()
      fetchUsers()
    } catch (err: unknown) {
      console.error('Error saving user:', err)
      setError(
        `Error al guardar usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    }
  }

  // Función para eliminar usuario
  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      setSuccess('Usuario eliminado exitosamente')
      fetchUsers()
    } catch (err: unknown) {
      console.error('Error deleting user:', err)
      setError(
        `Error al eliminar usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    }
  }

  // Función para editar usuario
  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      password: '', // No mostramos la contraseña existente
      role: user.role,
    })
    setShowForm(true)
  }

  // Función para resetear formulario
  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'parental',
    })
    setEditingUser(null)
    setShowForm(false)
  }

  // Funciones para manejar junior profiles
  const handleJuniorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError(null)
      setSuccess(null)

      console.log('🔍 Datos del formulario junior:', juniorFormData)
      console.log('🔍 Usuario parental seleccionado:', selectedParental)

      if (!selectedParental) {
        setError('Debes seleccionar un usuario parental')
        return
      }

      if (!juniorFormData.full_name || juniorFormData.full_name.trim() === '') {
        setError('El nombre completo es requerido')
        return
      }

      if (editingJunior) {
        // Actualizar junior existente
        const updateData = {
          full_name: juniorFormData.full_name,
          nickname: juniorFormData.nickname || null,
          birth_date: juniorFormData.birth_date || null,
          handicap: juniorFormData.handicap,
          level: juniorFormData.level,
          active: juniorFormData.active,
          updated_at: new Date().toISOString(),
        }

        console.log('🔍 Actualizando junior con datos:', updateData)

        const { error } = await supabase
          .from('junior_profiles')
          // @ts-expect-error - Temporary ignore for type inference issue
          .update(updateData)
          .eq('id', editingJunior.id)

        if (error) {
          console.error('❌ Error actualizando junior:', error)
          throw error
        }
        setSuccess('Perfil de hijo actualizado exitosamente')
      } else {
        // Crear nuevo junior
        console.log('🔍 Verificando usuario parental...')

        // Verificar que el usuario parental existe
        const { data: parentalUser, error: parentalError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', selectedParental)
          .single()

        console.log('🔍 Usuario parental encontrado:', parentalUser)

        if (parentalError || !parentalUser) {
          console.error('❌ Error buscando usuario parental:', parentalError)
          throw new Error('Usuario parental no encontrado')
        }

        // @ts-expect-error - Temporary ignore for type inference issue
        if (parentalUser.role !== 'parental') {
          throw new Error('El usuario seleccionado no es de tipo parental')
        }

        // Generar código único más robusto
        const namePrefix = juniorFormData.full_name
          .replace(/[^a-zA-Z]/g, '') // Solo letras
          .substring(0, 3)
          .toUpperCase()
          .padEnd(3, 'X') // Rellenar con X si es muy corto

        const timeStamp = Date.now().toString().slice(-4)
        const uniqueCode = `${namePrefix}${timeStamp}`

        console.log('🔍 Código único generado:', uniqueCode)

        const insertData = {
          parental_id: selectedParental,
          unique_code: uniqueCode,
          full_name: juniorFormData.full_name,
          nickname: juniorFormData.nickname || null,
          birth_date: juniorFormData.birth_date || null,
          handicap: juniorFormData.handicap,
          level: juniorFormData.level,
          active: juniorFormData.active,
        }

        console.log('🔍 Creando junior con datos completos:', insertData)

        const { data, error } = await supabase
          .from('junior_profiles')
          // @ts-expect-error - Temporary ignore for type inference issue
          .insert([insertData])
          .select()

        console.log('🔍 Resultado insert junior:', { data, error })

        if (error) {
          console.error('❌ Error creando junior:', error)
          throw error
        }

        setSuccess('Perfil de hijo creado exitosamente')
      }

      resetJuniorForm()
      fetchJuniors()
    } catch (err: unknown) {
      console.error('Error saving junior:', err)
      setError(
        `Error al guardar perfil de hijo: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    }
  }

  const handleJuniorDelete = async (juniorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este perfil?')) return

    try {
      const { error } = await supabase
        .from('junior_profiles')
        .delete()
        .eq('id', juniorId)

      if (error) throw error
      setSuccess('Perfil de hijo eliminado exitosamente')
      fetchJuniors()
    } catch (err: unknown) {
      console.error('Error deleting junior:', err)
      setError(
        `Error al eliminar perfil de hijo: ${err instanceof Error ? err.message : 'Error desconocido'}`
      )
    }
  }

  const handleJuniorEdit = (junior: JuniorProfile) => {
    setEditingJunior(junior)
    setSelectedParental(junior.parental_id)
    setJuniorFormData({
      full_name: junior.full_name,
      nickname: junior.nickname || '',
      birth_date: junior.birth_date || '',
      handicap: junior.handicap,
      level: junior.level,
      active: junior.active,
    })
    setShowJuniorForm(true)
  }

  const resetJuniorForm = () => {
    setJuniorFormData({
      full_name: '',
      nickname: '',
      birth_date: '',
      handicap: 0,
      level: 'alpha',
      active: true,
    })
    setEditingJunior(null)
    setSelectedParental('')
    setShowJuniorForm(false)
  }

  // Función para obtener estadísticas
  const getStats = () => {
    const totalUsers = users.length
    const parentalUsers = users.filter(user => user.role === 'parental').length
    const adminUsers = users.filter(user => user.role === 'admin').length
    const totalJuniors = juniors.length
    const activeJuniors = juniors.filter(junior => junior.active).length

    return {
      totalUsers,
      parentalUsers,
      adminUsers,
      totalJuniors,
      activeJuniors,
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchJuniors()
  }, [fetchUsers, fetchJuniors])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const stats = getStats()
  const parentalUsersForSelect = users.filter(user => user.role === 'parental')

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Usuarios y Familias
          </h1>
          <p className='text-gray-600'>
            Administra cuentas de padres, administradores y perfiles de hijos
          </p>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-blue-500 p-3'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Usuarios
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-green-500 p-3'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Parentales</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.parentalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-purple-500 p-3'>
                <ShieldCheck className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Administradores
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.adminUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-orange-500 p-3'>
                <Baby className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Hijos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.totalJuniors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-green-600 p-3'>
                <Star className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Hijos Activos
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.activeJuniors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para separar usuarios y junior profiles */}
      <Tabs defaultValue='users' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='users'>Usuarios Parentales</TabsTrigger>
          <TabsTrigger value='juniors'>Perfiles de Hijos</TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value='users' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Usuarios del Sistema</h2>
            <Button onClick={() => setShowForm(true)}>
              <UserPlus className='mr-2 h-4 w-4' />
              Nuevo Usuario
            </Button>
          </div>

          {/* Formulario de usuarios */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </CardTitle>
                <CardDescription>
                  Completa la información del usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='full_name'>Nombre Completo</Label>
                      <Input
                        id='full_name'
                        value={formData.full_name}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder='Ej: Juan Pérez'
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder='juan@ejemplo.com'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='phone'>Teléfono</Label>
                      <Input
                        id='phone'
                        value={formData.phone}
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder='+54 11 1234-5678'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='role'>Rol</Label>
                      <Select
                        value={formData.role}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            role: value as 'admin' | 'parental',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='parental'>Parental</SelectItem>
                          <SelectItem value='admin'>Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!editingUser && (
                    <div className='space-y-2'>
                      <Label htmlFor='password'>Contraseña</Label>
                      <Input
                        id='password'
                        type='password'
                        value={formData.password}
                        onChange={e =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder='Mínimo 6 caracteres'
                        required={!editingUser}
                        minLength={6}
                      />
                    </div>
                  )}

                  <div className='flex gap-2'>
                    <Button type='submit'>
                      {editingUser ? 'Actualizar' : 'Crear'} Usuario
                    </Button>
                    <Button type='button' variant='outline' onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Todos los usuarios registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='text-sm text-gray-500'>
                    Cargando usuarios...
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay usuarios
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Los usuarios aparecerán aquí cuando se registren.
                  </p>
                  <div className='mt-6'>
                    <Button onClick={() => setShowForm(true)}>
                      <UserPlus className='mr-2 h-4 w-4' />
                      Crear Primer Usuario
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {users.map(user => (
                    <div
                      key={user.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-medium text-blue-600'>
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-sm font-medium text-gray-900'>
                              {user.full_name}
                            </h3>
                            <Badge
                              variant={
                                user.role === 'admin' ? 'default' : 'secondary'
                              }
                            >
                              {user.role === 'admin' ? 'Admin' : 'Parental'}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 mt-1 text-xs text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Mail className='w-3 h-3' />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className='flex items-center gap-1'>
                                <Phone className='w-3 h-3' />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Junior Profiles */}
        <TabsContent value='juniors' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Perfiles de Hijos</h2>
            <Button onClick={() => setShowJuniorForm(true)}>
              <Baby className='mr-2 h-4 w-4' />
              Nuevo Perfil
            </Button>
          </div>

          {/* Formulario de junior profiles */}
          {showJuniorForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingJunior ? 'Editar Perfil' : 'Nuevo Perfil de Hijo'}
                </CardTitle>
                <CardDescription>
                  Completa la información del perfil del hijo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJuniorSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='parental_select'>Usuario Parental</Label>
                      <Select
                        value={selectedParental}
                        onValueChange={setSelectedParental}
                        disabled={!!editingJunior}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona un padre/madre' />
                        </SelectTrigger>
                        <SelectContent>
                          {parentalUsersForSelect.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='junior_full_name'>Nombre Completo</Label>
                      <Input
                        id='junior_full_name'
                        value={juniorFormData.full_name}
                        onChange={e =>
                          setJuniorFormData({
                            ...juniorFormData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder='Ej: María Pérez'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='nickname'>Apodo</Label>
                      <Input
                        id='nickname'
                        value={juniorFormData.nickname}
                        onChange={e =>
                          setJuniorFormData({
                            ...juniorFormData,
                            nickname: e.target.value,
                          })
                        }
                        placeholder='Ej: Mari'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='birth_date'>Fecha de Nacimiento</Label>
                      <Input
                        id='birth_date'
                        type='date'
                        value={juniorFormData.birth_date}
                        onChange={e =>
                          setJuniorFormData({
                            ...juniorFormData,
                            birth_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='handicap'>Handicap</Label>
                      <Input
                        id='handicap'
                        type='number'
                        min='0'
                        value={juniorFormData.handicap}
                        onChange={e =>
                          setJuniorFormData({
                            ...juniorFormData,
                            handicap: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder='0'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='level'>Nivel</Label>
                      <Select
                        value={juniorFormData.level}
                        onValueChange={value =>
                          setJuniorFormData({
                            ...juniorFormData,
                            level: value as 'alpha' | 'beta',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='alpha'>Alpha</SelectItem>
                          <SelectItem value='beta'>Beta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='active'>Estado</Label>
                      <Select
                        value={juniorFormData.active ? 'true' : 'false'}
                        onValueChange={value =>
                          setJuniorFormData({
                            ...juniorFormData,
                            active: value === 'true',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='true'>Activo</SelectItem>
                          <SelectItem value='false'>Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button type='submit'>
                      {editingJunior ? 'Actualizar' : 'Crear'} Perfil
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={resetJuniorForm}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Junior Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Perfiles de Hijos</CardTitle>
              <CardDescription>
                Todos los perfiles de hijos registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {juniorLoading ? (
                <div className='text-center py-8'>
                  <div className='text-sm text-gray-500'>
                    Cargando perfiles...
                  </div>
                </div>
              ) : juniors.length === 0 ? (
                <div className='text-center py-8'>
                  <Baby className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay perfiles de hijos
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Los perfiles aparecerán aquí cuando se registren.
                  </p>
                  <div className='mt-6'>
                    <Button onClick={() => setShowJuniorForm(true)}>
                      <Baby className='mr-2 h-4 w-4' />
                      Crear Primer Perfil
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {juniors.map(junior => {
                    const parentalUser = users.find(
                      user => user.id === junior.parental_id
                    )
                    return (
                      <div
                        key={junior.id}
                        className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                              <span className='text-sm font-medium text-orange-600'>
                                {junior.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='text-sm font-medium text-gray-900'>
                                {junior.full_name}
                              </h3>
                              {junior.nickname && (
                                <span className='text-xs text-gray-500'>
                                  ({junior.nickname})
                                </span>
                              )}
                              <Badge
                                variant={
                                  junior.level === 'alpha'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {junior.level.toUpperCase()}
                              </Badge>
                              <Badge
                                variant={
                                  junior.active ? 'default' : 'destructive'
                                }
                              >
                                {junior.active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-4 mt-1 text-xs text-gray-500'>
                              <div className='flex items-center gap-1'>
                                <Users className='w-3 h-3' />
                                Padre: {parentalUser?.full_name || 'N/A'}
                              </div>
                              <div className='flex items-center gap-1'>
                                <Star className='w-3 h-3' />
                                Handicap: {junior.handicap}
                              </div>
                              {junior.birth_date && (
                                <div className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {new Date(
                                    junior.birth_date
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleJuniorEdit(junior)}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleJuniorDelete(junior.id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
