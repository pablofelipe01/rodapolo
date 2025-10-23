interface DashboardHeaderProps {
  profile: any
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <div className='flex items-center justify-between w-full'>
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
          ¡Hola, {profile.full_name}!
        </h1>
        <p className='text-gray-600 text-sm sm:text-base'>
          Bienvenido al portal de familias de Rodapolo
        </p>
      </div>
    </div>
  )
}
