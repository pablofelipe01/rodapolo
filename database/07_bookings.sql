-- ============================================================================
-- TABLA BOOKINGS
-- Reservas de clases realizadas por los padres para sus hijos
-- ============================================================================

-- Crear tabla bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  junior_id UUID REFERENCES public.junior_profiles(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES public.ticket_units(id) ON DELETE CASCADE NOT NULL,
  booked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  attended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraint para que no haya reservas duplicadas
  UNIQUE(class_id, junior_id),
  -- Constraint para que el ticket esté bloqueado
  CHECK (
    (status = 'confirmed' AND ticket_id IS NOT NULL) OR
    (status != 'confirmed')
  )
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS bookings_class_id_idx ON public.bookings(class_id);
CREATE INDEX IF NOT EXISTS bookings_junior_id_idx ON public.bookings(junior_id);
CREATE INDEX IF NOT EXISTS bookings_ticket_id_idx ON public.bookings(ticket_id);
CREATE INDEX IF NOT EXISTS bookings_booked_by_idx ON public.bookings(booked_by);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_booked_at_idx ON public.bookings(booked_at);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar reserva antes de crear/actualizar
CREATE OR REPLACE FUNCTION validate_booking()
RETURNS TRIGGER AS $$
DECLARE
  class_capacity INTEGER;
  current_count INTEGER;
  class_date DATE;
  class_start_time TIME;
  ticket_status TEXT;
  ticket_purchase_id UUID;
  parental_id UUID;
BEGIN
  -- Obtener información de la clase
  SELECT capacity, current_bookings, date, start_time 
  INTO class_capacity, current_count, class_date, class_start_time
  FROM public.classes 
  WHERE id = NEW.class_id;
  
  -- Verificar que la clase no esté llena (solo para INSERT)
  IF TG_OP = 'INSERT' THEN
    IF current_count >= class_capacity THEN
      RAISE EXCEPTION 'Class is full (capacity: %)', class_capacity;
    END IF;
  END IF;
  
  -- Verificar que no se pueda reservar para clases pasadas
  IF class_date < CURRENT_DATE OR 
     (class_date = CURRENT_DATE AND class_start_time <= CURRENT_TIME) THEN
    RAISE EXCEPTION 'Cannot book class in the past';
  END IF;
  
  -- Verificar que el ticket esté disponible (solo para INSERT o cambio de ticket)
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.ticket_id != NEW.ticket_id) THEN
    SELECT status, purchase_id INTO ticket_status, ticket_purchase_id
    FROM public.ticket_units 
    WHERE id = NEW.ticket_id;
    
    IF ticket_status != 'available' THEN
      RAISE EXCEPTION 'Ticket is not available (status: %)', ticket_status;
    END IF;
    
    -- Verificar que el ticket pertenezca al parental que hace la reserva
    SELECT pt.parental_id INTO parental_id
    FROM public.purchased_tickets pt
    WHERE pt.id = ticket_purchase_id;
    
    IF parental_id != NEW.booked_by THEN
      RAISE EXCEPTION 'Ticket does not belong to the user making the booking';
    END IF;
    
    -- Verificar que el junior pertenezca al parental
    IF NOT EXISTS (
      SELECT 1 FROM public.junior_profiles 
      WHERE id = NEW.junior_id AND parental_id = NEW.booked_by
    ) THEN
      RAISE EXCEPTION 'Junior does not belong to the user making the booking';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar reservas
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION validate_booking();

-- Función para manejar cambios de estado de tickets al hacer/cancelar reservas
CREATE OR REPLACE FUNCTION handle_booking_ticket_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Bloquear ticket cuando se hace reserva
    UPDATE public.ticket_units 
    SET status = 'blocked',
        blocked_for_class_id = NEW.class_id
    WHERE id = NEW.ticket_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Manejar cambios de estado de la reserva
    IF OLD.status != NEW.status THEN
      CASE NEW.status
        WHEN 'cancelled' THEN
          NEW.cancelled_at := NOW();
          -- Liberar ticket o consumirlo según el tiempo
          DECLARE
            class_date DATE;
            class_start_time TIME;
            is_24h_before BOOLEAN;
          BEGIN
            SELECT date, start_time INTO class_date, class_start_time
            FROM public.classes WHERE id = NEW.class_id;
            
            is_24h_before := (class_date::timestamp + class_start_time) > (NOW() + INTERVAL '24 hours');
            
            IF is_24h_before THEN
              -- Devolver ticket a disponible
              UPDATE public.ticket_units 
              SET status = 'available',
                  blocked_at = NULL,
                  blocked_for_class_id = NULL
              WHERE id = NEW.ticket_id;
            ELSE
              -- Consumir ticket
              UPDATE public.ticket_units 
              SET status = 'consumed'
              WHERE id = NEW.ticket_id;
            END IF;
          END;
          
        WHEN 'attended' THEN
          NEW.attended_at := NOW();
          -- Marcar ticket como usado
          UPDATE public.ticket_units 
          SET status = 'used'
          WHERE id = NEW.ticket_id;
          
        WHEN 'no_show' THEN
          -- Consumir ticket por no asistir
          UPDATE public.ticket_units 
          SET status = 'consumed'
          WHERE id = NEW.ticket_id;
      END CASE;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Liberar ticket si se elimina la reserva
    UPDATE public.ticket_units 
    SET status = 'available',
        blocked_at = NULL,
        blocked_for_class_id = NULL
    WHERE id = OLD.ticket_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para manejar estado de tickets
CREATE TRIGGER handle_booking_ticket_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION handle_booking_ticket_status();

-- Añadir el trigger que faltaba para actualizar el contador de clases
CREATE TRIGGER update_class_bookings_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_class_bookings_count();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Política para que parentales solo vean reservas de sus hijos
CREATE POLICY "Parentals can view own children bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.junior_profiles jp
      WHERE jp.id = junior_id 
        AND jp.parental_id = booked_by
        AND EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = jp.parental_id AND p.user_id = auth.uid()
        )
    )
  );

-- Política para que parentales puedan crear reservas para sus hijos
CREATE POLICY "Parentals can create bookings for children" ON public.bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.junior_profiles jp ON jp.parental_id = p.id
      WHERE p.user_id = auth.uid() 
        AND jp.id = junior_id 
        AND p.id = booked_by
    )
  );

-- Política para que parentales puedan cancelar reservas de sus hijos
CREATE POLICY "Parentals can update own children bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.junior_profiles jp
      WHERE jp.id = junior_id 
        AND jp.parental_id = booked_by
        AND EXISTS (
          SELECT 1 FROM public.profiles p 
          WHERE p.id = jp.parental_id AND p.user_id = auth.uid()
        )
    )
  );

-- Política para que admins puedan ver todas las reservas
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que admins puedan actualizar cualquier reserva
CREATE POLICY "Admins can update any booking" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.bookings IS 'Reservas de clases realizadas por padres para sus hijos';
COMMENT ON COLUMN public.bookings.status IS 'Estado: confirmed, cancelled, attended, no_show';
COMMENT ON COLUMN public.bookings.cancelled_at IS 'Timestamp de cancelación';
COMMENT ON COLUMN public.bookings.attended_at IS 'Timestamp de asistencia confirmada';
COMMENT ON COLUMN public.bookings.booked_by IS 'Parental que realizó la reserva';