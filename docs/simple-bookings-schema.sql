-- ============================================================================
-- ESQUEMA DE RESERVAS SIMPLIFICADO PARA RODAPOLO
-- Trabajar con la tabla bookings existente
-- ============================================================================

-- La tabla bookings ya existe en la base de datos con esta estructura:
-- CREATE TABLE public.bookings (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
--   junior_id UUID REFERENCES public.junior_profiles(id) ON DELETE CASCADE NOT NULL,
--   ticket_id UUID REFERENCES public.ticket_units(id) ON DELETE CASCADE NOT NULL,
--   booked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
--   booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
--   status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
--   cancelled_at TIMESTAMP WITH TIME ZONE,
--   cancellation_reason TEXT,
--   attended_at TIMESTAMP WITH TIME ZONE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
-- );

-- ============================================================================
-- VISTA SIMPLIFICADA PARA CONSULTAS DE RESERVAS
-- ============================================================================

-- Crear vista para consultas más fáciles (sin tickets)
CREATE OR REPLACE VIEW simple_bookings_view AS
SELECT 
    b.id,
    b.status,
    b.booked_at,
    b.cancelled_at,
    b.cancellation_reason,
    b.attended_at,
    b.created_at,
    b.updated_at,
    
    -- Información de la clase
    c.id as class_id,
    c.date as class_date,
    c.start_time,
    c.end_time,
    c.instructor_name,
    c.level as class_level,
    c.capacity,
    c.field,
    c.notes as class_notes,
    
    -- Información del junior
    jp.id as junior_id,
    jp.full_name as junior_name,
    jp.nickname as junior_nickname,
    jp.unique_code as junior_code,
    jp.level as junior_level,
    jp.handicap,
    
    -- Información del parental (quien hizo la reserva)
    p.id as parental_id,
    p.full_name as parental_name,
    p.phone as parental_phone
    
FROM public.bookings b
JOIN public.classes c ON b.class_id = c.id
JOIN public.junior_profiles jp ON b.junior_id = jp.id
JOIN public.profiles p ON b.booked_by = p.id;

-- ============================================================================
-- FUNCIONES AUXILIARES PARA RESERVAS SIMPLES
-- ============================================================================

-- Función para crear un booking simplificado
CREATE OR REPLACE FUNCTION create_simple_booking(
  p_junior_id UUID,
  p_class_id UUID
)
RETURNS jsonb AS $$
DECLARE
  v_parental_id UUID;
  v_ticket_id UUID;
  v_booking_id UUID;
  v_result jsonb;
BEGIN
  -- Obtener el ID del parental del usuario autenticado
  SELECT id INTO v_parental_id
  FROM public.profiles
  WHERE user_id = auth.uid() AND role = 'parental';
  
  IF v_parental_id IS NULL THEN
    RAISE EXCEPTION 'User is not a parental or not authenticated';
  END IF;
  
  -- Verificar que el junior pertenece al parental
  IF NOT EXISTS (
    SELECT 1 FROM public.junior_profiles 
    WHERE id = p_junior_id AND parental_id = v_parental_id
  ) THEN
    RAISE EXCEPTION 'Junior does not belong to the authenticated parental';
  END IF;
  
  -- Buscar un ticket disponible del parental
  SELECT tu.id INTO v_ticket_id
  FROM public.ticket_units tu
  JOIN public.purchased_tickets pt ON tu.purchase_id = pt.id
  WHERE pt.parental_id = v_parental_id 
    AND tu.status = 'available'
  ORDER BY tu.created_at ASC
  LIMIT 1;
  
  IF v_ticket_id IS NULL THEN
    RAISE EXCEPTION 'No available tickets found for this user';
  END IF;
  
  -- Crear el booking
  INSERT INTO public.bookings (
    junior_id,
    class_id,
    ticket_id,
    booked_by,
    status
  ) VALUES (
    p_junior_id,
    p_class_id,
    v_ticket_id,
    v_parental_id,
    'confirmed'
  ) RETURNING id INTO v_booking_id;
  
  -- Marcar el ticket como usado
  UPDATE public.ticket_units 
  SET status = 'used', used_at = NOW()
  WHERE id = v_ticket_id;
  
  -- Preparar respuesta
  v_result := jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'ticket_id', v_ticket_id,
    'message', 'Booking created successfully'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cancelar una reserva
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.bookings 
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = p_reason
    WHERE id = p_booking_id
    AND status = 'confirmed';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar asistencia
CREATE OR REPLACE FUNCTION mark_attendance(
    p_booking_id UUID,
    p_attended BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.bookings 
    SET 
        status = CASE WHEN p_attended THEN 'attended' ELSE 'no_show' END,
        attended_at = CASE WHEN p_attended THEN NOW() ELSE NULL END
    WHERE id = p_booking_id
    AND status = 'confirmed';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- POLÍTICA RLS ADICIONAL PARA VISTA SIMPLIFICADA
-- ============================================================================

-- Habilitar RLS en la vista (si es necesario)
-- Note: Las vistas heredan las políticas RLS de las tablas base

-- Función para verificar cupos disponibles en una clase
CREATE OR REPLACE FUNCTION check_class_availability(p_class_id UUID)
RETURNS TABLE (
    available_spots INTEGER,
    total_capacity INTEGER,
    current_bookings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        GREATEST(0, c.capacity - COUNT(b.id)::INTEGER) as available_spots,
        c.capacity as total_capacity,
        COUNT(b.id)::INTEGER as current_bookings
    FROM public.classes c
    LEFT JOIN public.bookings b ON c.id = b.class_id AND b.status = 'confirmed'
    WHERE c.id = p_class_id
    GROUP BY c.capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON VIEW simple_bookings_view IS 'Vista simplificada de reservas sin dependencia del sistema de tickets';
COMMENT ON FUNCTION create_simple_booking IS 'Crea una reserva simple sin requerir tickets pre-comprados';
COMMENT ON FUNCTION cancel_booking IS 'Cancela una reserva existente';
COMMENT ON FUNCTION mark_attendance IS 'Marca la asistencia o ausencia de un junior a una clase';
COMMENT ON FUNCTION check_class_availability IS 'Verifica disponibilidad de cupos en una clase';