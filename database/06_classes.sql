-- ============================================================================
-- TABLA CLASSES
-- Clases programadas por los administradores
-- ============================================================================

-- Crear tabla classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  instructor_name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_bookings INTEGER DEFAULT 0 CHECK (current_bookings >= 0),
  level TEXT DEFAULT 'mixed' CHECK (level IN ('alpha', 'beta', 'mixed')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  field TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraint para que current_bookings no exceda capacity
  CONSTRAINT bookings_capacity_limit CHECK (current_bookings <= capacity),
  -- Constraint para que end_time sea después de start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS classes_admin_id_idx ON public.classes(admin_id);
CREATE INDEX IF NOT EXISTS classes_date_idx ON public.classes(date);
CREATE INDEX IF NOT EXISTS classes_date_time_idx ON public.classes(date, start_time);
CREATE INDEX IF NOT EXISTS classes_level_idx ON public.classes(level);
CREATE INDEX IF NOT EXISTS classes_status_idx ON public.classes(status);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_classes_updated_at 
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar que no haya clases superpuestas en el mismo campo
CREATE OR REPLACE FUNCTION validate_class_schedule()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar solapamiento de horarios en el mismo campo y fecha
  IF EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id != COALESCE(NEW.id, gen_random_uuid())
      AND date = NEW.date
      AND COALESCE(field, '') = COALESCE(NEW.field, '')
      AND status != 'cancelled'
      AND (
        (start_time <= NEW.start_time AND end_time > NEW.start_time) OR
        (start_time < NEW.end_time AND end_time >= NEW.end_time) OR
        (start_time >= NEW.start_time AND end_time <= NEW.end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Class schedule conflicts with existing class on % at field %', 
      NEW.date, COALESCE(NEW.field, 'default');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar horarios
CREATE TRIGGER validate_class_schedule_trigger
  BEFORE INSERT OR UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION validate_class_schedule();

-- Función para actualizar contador de reservas
CREATE OR REPLACE FUNCTION update_class_bookings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.classes 
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.class_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.classes 
    SET current_bookings = current_bookings - 1
    WHERE id = OLD.class_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si cambió la clase
    IF OLD.class_id != NEW.class_id THEN
      UPDATE public.classes 
      SET current_bookings = current_bookings - 1
      WHERE id = OLD.class_id;
      
      UPDATE public.classes 
      SET current_bookings = current_bookings + 1
      WHERE id = NEW.class_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función para marcar clases como completadas automáticamente
CREATE OR REPLACE FUNCTION mark_completed_classes()
RETURNS void AS $$
BEGIN
  UPDATE public.classes 
  SET status = 'completed'
  WHERE status = 'confirmed'
    AND date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Configurar Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver clases (needed for booking)
CREATE POLICY "Anyone authenticated can view classes" ON public.classes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para que solo admins puedan crear/modificar clases
CREATE POLICY "Only admins can manage classes" ON public.classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Agregar la FK que faltaba en ticket_units
ALTER TABLE public.ticket_units 
ADD CONSTRAINT fk_ticket_units_class 
FOREIGN KEY (blocked_for_class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- Agregar el trigger que faltaba para actualizar bookings count
-- (Se agregará después de crear la tabla bookings)

-- Comentarios para documentación
COMMENT ON TABLE public.classes IS 'Clases programadas por administradores';
COMMENT ON COLUMN public.classes.capacity IS 'Número máximo de estudiantes';
COMMENT ON COLUMN public.classes.current_bookings IS 'Número actual de reservas confirmadas';
COMMENT ON COLUMN public.classes.level IS 'Nivel: alpha (principiante), beta (avanzado), mixed (mixto)';
COMMENT ON COLUMN public.classes.status IS 'Estado: scheduled, confirmed, cancelled, completed';
COMMENT ON COLUMN public.classes.field IS 'Campo o ubicación donde se imparte la clase';