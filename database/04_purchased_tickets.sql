-- ============================================================================
-- TABLA PURCHASED_TICKETS
-- Registro de tiqueteras compradas por los padres
-- ============================================================================

-- Crear tabla purchased_tickets
CREATE TABLE IF NOT EXISTS public.purchased_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parental_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.ticket_packages(id) ON DELETE RESTRICT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
  used_tickets INTEGER DEFAULT 0 CHECK (used_tickets >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraint para que used_tickets nunca sea mayor que total_tickets
  CONSTRAINT used_tickets_limit CHECK (used_tickets <= total_tickets)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS purchased_tickets_parental_id_idx ON public.purchased_tickets(parental_id);
CREATE INDEX IF NOT EXISTS purchased_tickets_package_id_idx ON public.purchased_tickets(package_id);
CREATE INDEX IF NOT EXISTS purchased_tickets_status_idx ON public.purchased_tickets(status);
CREATE INDEX IF NOT EXISTS purchased_tickets_expiry_date_idx ON public.purchased_tickets(expiry_date);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_purchased_tickets_updated_at 
  BEFORE UPDATE ON public.purchased_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular fecha de expiración automáticamente
CREATE OR REPLACE FUNCTION set_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NULL THEN
    SELECT INTO NEW.expiry_date 
      NEW.purchase_date + (tp.valid_days || ' days')::INTERVAL
    FROM public.ticket_packages tp 
    WHERE tp.id = NEW.package_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular fecha de expiración automáticamente
CREATE TRIGGER set_expiry_date_on_insert
  BEFORE INSERT ON public.purchased_tickets
  FOR EACH ROW EXECUTE FUNCTION set_expiry_date();

-- Función para marcar tickets expirados automáticamente
CREATE OR REPLACE FUNCTION mark_expired_tickets()
RETURNS void AS $$
BEGIN
  UPDATE public.purchased_tickets 
  SET status = 'expired'
  WHERE expiry_date < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Configurar Row Level Security (RLS)
ALTER TABLE public.purchased_tickets ENABLE ROW LEVEL SECURITY;

-- Política para que parentales solo vean sus propias compras
CREATE POLICY "Parentals can view own purchases" ON public.purchased_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = parental_id AND user_id = auth.uid()
    )
  );

-- Política para que parentales puedan crear compras
CREATE POLICY "Parentals can create purchases" ON public.purchased_tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = parental_id AND user_id = auth.uid() AND role = 'parental'
    )
  );

-- Política para que admins puedan ver todas las compras
CREATE POLICY "Admins can view all purchases" ON public.purchased_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.purchased_tickets IS 'Registro de tiqueteras compradas por padres';
COMMENT ON COLUMN public.purchased_tickets.total_tickets IS 'Número total de tickets en la tiquetera';
COMMENT ON COLUMN public.purchased_tickets.used_tickets IS 'Número de tickets ya utilizados';
COMMENT ON COLUMN public.purchased_tickets.status IS 'Estado: active, expired, consumed';