-- Actualizar función create_simple_booking para usar tickets reales
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