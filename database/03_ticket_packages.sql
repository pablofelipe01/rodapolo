-- ============================================================================
-- TABLA TICKET_PACKAGES
-- Define los paquetes de tickets disponibles para compra
-- ============================================================================

-- Crear tabla ticket_packages
CREATE TABLE IF NOT EXISTS public.ticket_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  valid_days INTEGER DEFAULT 365 CHECK (valid_days > 0),
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS ticket_packages_active_idx ON public.ticket_packages(active);
CREATE INDEX IF NOT EXISTS ticket_packages_price_idx ON public.ticket_packages(price);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ticket_packages_updated_at 
  BEFORE UPDATE ON public.ticket_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.ticket_packages ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver paquetes activos
CREATE POLICY "Anyone can view active packages" ON public.ticket_packages
  FOR SELECT USING (active = true);

-- Política para que solo admins puedan crear/modificar paquetes
CREATE POLICY "Only admins can manage packages" ON public.ticket_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insertar paquetes iniciales de ejemplo
INSERT INTO public.ticket_packages (name, description, quantity, price, valid_days) VALUES
('Pack 5 Clases', 'Paquete ideal para comenzar', 5, 150.00, 90),
('Pack 10 Clases', 'El más popular - mejor valor', 10, 280.00, 180),
('Pack 20 Clases', 'Para jugadores dedicados', 20, 520.00, 365)
ON CONFLICT DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE public.ticket_packages IS 'Paquetes de tickets disponibles para compra';
COMMENT ON COLUMN public.ticket_packages.quantity IS 'Número de clases incluidas en el paquete';
COMMENT ON COLUMN public.ticket_packages.price IS 'Precio del paquete en la moneda local';
COMMENT ON COLUMN public.ticket_packages.valid_days IS 'Días de validez desde la compra';