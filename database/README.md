# Base de Datos Rodapolo - Schema y Documentación

## Resumen

Este documento describe el esquema completo de la base de datos para el Sistema Rodapolo, una plataforma para gestionar clases de polo con monociclos eléctricos dirigida principalmente a menores de edad.

## Arquitectura General

El sistema está diseñado con **PostgreSQL** usando **Supabase** como backend, implementando:

- **Row Level Security (RLS)** para seguridad a nivel de fila
- **Triggers automáticos** para mantener consistencia de datos
- **Funciones PLpgSQL** para lógica de negocio compleja
- **Vistas** para consultas optimizadas

## Estructura de Usuarios

### 1. Profiles (Perfiles de Usuarios Registrados)

```sql
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- Supabase Auth
  role TEXT CHECK (role IN ('admin', 'parental')),
  full_name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT
)
```

**Usuarios del sistema:**

- **Admin**: Crea contenido, gestiona clases, ve estadísticas
- **Parental**: Compra tiqueteras, hace reservas para sus hijos

### 2. Junior Profiles (Perfiles de Menores)

```sql
junior_profiles (
  id UUID PRIMARY KEY,
  parental_id UUID REFERENCES profiles(id),
  code VARCHAR(8) UNIQUE,  -- Código único de acceso
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  birth_date DATE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true
)
```

**Características especiales:**

- Los juniors **NO** tienen cuenta en Supabase Auth
- Acceden solo con **código único** de 8 caracteres
- Están vinculados a un parental que los gestiona

## Sistema de Tiqueteras

### 3. Ticket Packages (Paquetes de Tickets)

```sql
ticket_packages (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  price DECIMAL(10,2),
  ticket_count INTEGER,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true
)
```

### 4. Purchased Tickets (Tiqueteras Compradas)

```sql
purchased_tickets (
  id UUID PRIMARY KEY,
  parental_id UUID REFERENCES profiles(id),
  package_id UUID REFERENCES ticket_packages(id),
  purchase_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,  -- Se calcula automáticamente
  total_tickets INTEGER,
  used_tickets INTEGER DEFAULT 0
)
```

### 5. Ticket Units (Tickets Individuales)

```sql
ticket_units (
  id UUID PRIMARY KEY,
  purchase_id UUID REFERENCES purchased_tickets(id),
  status TEXT CHECK (status IN ('available', 'blocked', 'used', 'consumed')),
  blocked_at TIMESTAMP,
  blocked_for_class_id UUID REFERENCES classes(id)
)
```

**Estados del Ticket:**

- `available`: Disponible para usar
- `blocked`: Bloqueado para una clase (24h máximo)
- `used`: Usado exitosamente (clase completada)
- `consumed`: Perdido (cancelación tardía o no asistencia)

## Sistema de Clases

### 6. Classes (Clases de Rodapolo)

```sql
classes (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  capacity INTEGER,
  current_bookings INTEGER DEFAULT 0,  -- Actualizado automáticamente
  location VARCHAR(100),
  instructor VARCHAR(100),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_by UUID REFERENCES profiles(id)
)
```

### 7. Bookings (Reservas)

```sql
bookings (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  junior_id UUID REFERENCES junior_profiles(id),
  ticket_id UUID REFERENCES ticket_units(id),
  booked_by UUID REFERENCES profiles(id),
  booked_at TIMESTAMP DEFAULT NOW(),
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  attended_at TIMESTAMP
)
```

## Sistema de Contenido

### 8. Posts (Contenido Educativo)

```sql
posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  tags TEXT[],  -- Array de tags
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id)
)
```

### 9. Post Likes y Post Views

Tablas auxiliares para gestionar interacciones de los juniors con el contenido.

## Lógica de Negocio Automatizada

### Triggers Principales

1. **Creación Automática de Tickets**

   ```sql
   -- Al comprar tiquetera, se crean tickets individuales automáticamente
   CREATE TRIGGER create_ticket_units_trigger
   ```

2. **Gestión de Estado de Tickets**

   ```sql
   -- Bloqueo automático al hacer reserva
   -- Liberación automática si se cancela con +24h
   -- Consumo automático si se cancela con -24h
   ```

3. **Actualización de Contadores**

   ```sql
   -- current_bookings en classes
   -- used_tickets en purchased_tickets
   -- views_count y likes_count en posts
   ```

4. **Validaciones de Negocio**
   ```sql
   -- No reservar clases llenas
   -- No usar tickets expirados
   -- No reservar clases pasadas
   -- Verificar pertenencia junior-parental
   ```

### Funciones Útiles

1. **search_posts(search_term)** - Búsqueda full-text en posts
2. **get_class_stats(class_id)** - Estadísticas de asistencia
3. **get_available_tickets(parental_id)** - Tickets disponibles

## Seguridad (Row Level Security)

### Políticas por Rol

**Admins:**

- Acceso completo a todas las tablas
- Pueden crear/editar clases y posts
- Ven estadísticas globales

**Parentales:**

- Solo ven sus propios datos y los de sus hijos
- Pueden comprar tiqueteras y hacer reservas
- No pueden acceder a datos de otros parentales

**Juniors (sin autenticación tradicional):**

- Solo ven posts publicados
- Pueden dar likes y registrar visualizaciones
- Acceso controlado por códigos únicos

## Vistas Optimizadas

1. **class_details** - Clases con información del creador
2. **booking_details** - Reservas con datos completos
3. **ticket_details** - Tickets con información del paquete

## Orden de Ejecución de Scripts

Para crear la base de datos completa, ejecutar en este orden:

1. `01_profiles.sql` - Perfiles de usuarios base
2. `02_junior_profiles.sql` - Perfiles de menores
3. `03_ticket_packages.sql` - Paquetes de tickets
4. `04_purchased_tickets.sql` - Compras de tiqueteras
5. `05_ticket_units.sql` - Tickets individuales
6. `06_classes.sql` - Clases de Rodapolo
7. `07_bookings.sql` - Sistema de reservas
8. `08_posts.sql` - Contenido educativo
9. `09_additional_config.sql` - Configuraciones adicionales y datos de ejemplo

## Casos de Uso Principales

### 1. Flujo de Compra de Tiquetera

1. Parental compra paquete → `purchased_tickets`
2. Se crean tickets individuales automáticamente → `ticket_units`
3. Tickets quedan `available` para usar

### 2. Flujo de Reserva

1. Parental selecciona clase y junior
2. Sistema valida ticket disponible
3. Ticket pasa a `blocked` → `bookings` creada
4. Si se cancela +24h: ticket vuelve a `available`
5. Si se cancela -24h: ticket pasa a `consumed`
6. Si se asiste: ticket pasa a `used`

### 3. Acceso Junior

1. Junior ingresa código único
2. Sistema verifica en `junior_profiles`
3. Acceso a posts publicados y funciones de like/view

## Tipos TypeScript

El archivo `src/types/database.ts` contiene todos los tipos generados automáticamente para TypeScript, incluyendo:

- Tipos base para todas las tablas
- Tipos para Insert/Update operations
- Tipos para vistas y funciones
- Tipos extendidos con relaciones
- Tipos para formularios y respuestas de API

## Consideraciones de Performance

- **Índices** en campos de búsqueda frecuente
- **Índices GIN** para arrays y búsqueda full-text
- **Vistas materializadas** para consultas complejas frecuentes
- **Paginación** implementada en consultas grandes

## Backup y Mantenimiento

- Los datos críticos están en `profiles`, `junior_profiles`, `purchased_tickets`
- Las tablas de contenido (`posts`) pueden regenerarse
- Los `ticket_units` mantienen el historial completo de transacciones
- Las estadísticas se pueden recalcular desde las tablas base
