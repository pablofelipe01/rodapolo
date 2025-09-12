-- ============================================================================
-- TABLA TICKET_UNITS
-- Tickets individuales con estados para el sistema de reservas
-- ============================================================================

-- Crear tabla ticket_units
CREATE TABLE IF NOT EXISTS public.ticket_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES public.purchased_tickets(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'blocked', 'used', 'consumed', 'expired')),
  blocked_at TIMESTAMP WITH TIME ZONE,
  blocked_for_class_id UUID, -- Se definirá la FK después de crear tabla classes
  used_at TIMESTAMP WITH TIME ZONE,
  consumed_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS ticket_units_purchase_id_idx ON public.ticket_units(purchase_id);
CREATE INDEX IF NOT EXISTS ticket_units_status_idx ON public.ticket_units(status);
CREATE INDEX IF NOT EXISTS ticket_units_blocked_at_idx ON public.ticket_units(blocked_at);
CREATE INDEX IF NOT EXISTS ticket_units_blocked_for_class_id_idx ON public.ticket_units(blocked_for_class_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ticket_units_updated_at 
  BEFORE UPDATE ON public.ticket_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear tickets automáticamente cuando se compra una tiquetera
CREATE OR REPLACE FUNCTION create_ticket_units()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
BEGIN
  -- Crear ticket_units individuales según la cantidad del paquete
  FOR i IN 1..NEW.total_tickets LOOP
    INSERT INTO public.ticket_units (purchase_id) VALUES (NEW.id);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear tickets automáticamente
CREATE TRIGGER create_ticket_units_on_purchase
  AFTER INSERT ON public.purchased_tickets
  FOR EACH ROW EXECUTE FUNCTION create_ticket_units();

-- Función para validar transiciones de estado de tickets
CREATE OR REPLACE FUNCTION validate_ticket_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar transiciones válidas
  IF OLD.status IS NOT NULL AND NEW.status != OLD.status THEN
    CASE OLD.status
      WHEN 'available' THEN
        IF NEW.status NOT IN ('blocked', 'expired') THEN
          RAISE EXCEPTION 'Invalid transition from available to %', NEW.status;
        END IF;
      WHEN 'blocked' THEN
        IF NEW.status NOT IN ('used', 'available', 'consumed') THEN
          RAISE EXCEPTION 'Invalid transition from blocked to %', NEW.status;
        END IF;
      WHEN 'used' THEN
        RAISE EXCEPTION 'Cannot change status from used';
      WHEN 'consumed' THEN
        RAISE EXCEPTION 'Cannot change status from consumed';
      WHEN 'expired' THEN
        RAISE EXCEPTION 'Cannot change status from expired';
    END CASE;
  END IF;

  -- Actualizar timestamps según el nuevo estado
  CASE NEW.status
    WHEN 'blocked' THEN
      IF OLD.status != 'blocked' THEN
        NEW.blocked_at := NOW();
      END IF;
    WHEN 'used' THEN
      IF OLD.status != 'used' THEN
        NEW.used_at := NOW();
      END IF;
    WHEN 'consumed' THEN
      IF OLD.status != 'consumed' THEN
        NEW.consumed_at := NOW();
      END IF;
    WHEN 'expired' THEN
      IF OLD.status != 'expired' THEN
        NEW.expired_at := NOW();
      END IF;
    WHEN 'available' THEN
      -- Limpiar timestamps cuando vuelve a disponible
      NEW.blocked_at := NULL;
      NEW.blocked_for_class_id := NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar transiciones de estado
CREATE TRIGGER validate_ticket_status_transition_trigger
  BEFORE UPDATE ON public.ticket_units
  FOR EACH ROW EXECUTE FUNCTION validate_ticket_status_transition();

-- Función para liberar tickets bloqueados automáticamente después de 24h
CREATE OR REPLACE FUNCTION release_expired_blocked_tickets()
RETURNS void AS $$
BEGIN
  UPDATE public.ticket_units 
  SET status = 'available',
      blocked_at = NULL,
      blocked_for_class_id = NULL
  WHERE status = 'blocked' 
    AND blocked_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Función para marcar tickets como expirados cuando expira la tiquetera
CREATE OR REPLACE FUNCTION expire_tickets_from_expired_purchases()
RETURNS void AS $$
BEGIN
  UPDATE public.ticket_units 
  SET status = 'expired',
      expired_at = NOW()
  WHERE status IN ('available', 'blocked')
    AND purchase_id IN (
      SELECT id FROM public.purchased_tickets 
      WHERE status = 'expired'
    );
END;
$$ LANGUAGE plpgsql;

-- Configurar Row Level Security (RLS)
ALTER TABLE public.ticket_units ENABLE ROW LEVEL SECURITY;

-- Política para que parentales solo vean tickets de sus propias compras
CREATE POLICY "Parentals can view own ticket units" ON public.ticket_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchased_tickets pt
      JOIN public.profiles p ON pt.parental_id = p.id
      WHERE pt.id = purchase_id AND p.user_id = auth.uid()
    )
  );

-- Política para que parentales puedan actualizar sus tickets (para reservas)
CREATE POLICY "Parentals can update own ticket units" ON public.ticket_units
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.purchased_tickets pt
      JOIN public.profiles p ON pt.parental_id = p.id
      WHERE pt.id = purchase_id AND p.user_id = auth.uid()
    )
  );

-- Política para que admins puedan ver todos los tickets
CREATE POLICY "Admins can view all ticket units" ON public.ticket_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que admins puedan actualizar cualquier ticket
CREATE POLICY "Admins can update any ticket unit" ON public.ticket_units
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.ticket_units IS 'Tickets individuales con estados para control de reservas';
COMMENT ON COLUMN public.ticket_units.status IS 'Estado: available, blocked, used, consumed, expired';
COMMENT ON COLUMN public.ticket_units.blocked_at IS 'Timestamp cuando se bloqueó para reserva';
COMMENT ON COLUMN public.ticket_units.blocked_for_class_id IS 'ID de la clase para la cual está bloqueado';
COMMENT ON COLUMN public.ticket_units.used_at IS 'Timestamp cuando se usó (asistió a clase)';
COMMENT ON COLUMN public.ticket_units.consumed_at IS 'Timestamp cuando se consumió (no canceló a tiempo)';
COMMENT ON COLUMN public.ticket_units.expired_at IS 'Timestamp cuando expiró';