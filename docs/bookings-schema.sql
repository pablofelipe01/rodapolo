-- ============================================================================
-- ESQUEMA DE RESERVAS PARA RODAPOLO
-- ============================================================================

-- Crear tabla de reservas (bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relaciones
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  junior_id UUID NOT NULL REFERENCES junior_profiles(id) ON DELETE CASCADE,
  parental_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Estado de la reserva
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  
  -- Información adicional
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_junior_id ON bookings(junior_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parental_id ON bookings(parental_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Constraint para evitar reservas duplicadas (mismo junior, misma clase)
ALTER TABLE bookings ADD CONSTRAINT unique_booking_per_junior_class 
    UNIQUE (class_id, junior_id);

-- Habilitar RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS PARA BOOKINGS
-- ============================================================================

-- Política para permitir SELECT a usuarios autenticados (ver sus propias reservas)
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT
    TO authenticated
    USING (
        parental_id = (
            SELECT id FROM profiles WHERE profiles.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para permitir INSERT a usuarios parentales (crear reservas para sus hijos)
CREATE POLICY "Parentals can create bookings for their children" ON bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        parental_id = (
            SELECT id FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'parental'
        )
        AND
        junior_id IN (
            SELECT id FROM junior_profiles 
            WHERE junior_profiles.parental_id = (
                SELECT id FROM profiles WHERE profiles.user_id = auth.uid()
            )
        )
    );

-- Política para permitir UPDATE a usuarios parentales (modificar sus reservas)
CREATE POLICY "Parentals can update their own bookings" ON bookings
    FOR UPDATE
    TO authenticated
    USING (
        parental_id = (
            SELECT id FROM profiles WHERE profiles.user_id = auth.uid()
        )
    )
    WITH CHECK (
        parental_id = (
            SELECT id FROM profiles WHERE profiles.user_id = auth.uid()
        )
    );

-- Política para permitir DELETE a usuarios parentales (cancelar sus reservas)
CREATE POLICY "Parentals can delete their own bookings" ON bookings
    FOR DELETE
    TO authenticated
    USING (
        parental_id = (
            SELECT id FROM profiles WHERE profiles.user_id = auth.uid()
        )
    );

-- Política para permitir a admins gestionar todas las reservas
CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- VISTA PARA CONSULTAS OPTIMIZADAS DE RESERVAS
-- ============================================================================

CREATE OR REPLACE VIEW bookings_with_details AS
SELECT 
    b.id,
    b.status,
    b.notes,
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
    
    -- Información del parental
    p.id as parental_id,
    p.full_name as parental_name,
    p.email as parental_email
    
FROM bookings b
JOIN classes c ON b.class_id = c.id
JOIN junior_profiles jp ON b.junior_id = jp.id
JOIN profiles p ON b.parental_id = p.id;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para contar reservas activas de una clase
CREATE OR REPLACE FUNCTION get_active_bookings_count(class_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM bookings
        WHERE class_id = class_uuid
        AND status = 'confirmed'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si una clase tiene cupo disponible
CREATE OR REPLACE FUNCTION has_available_capacity(class_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    class_capacity INTEGER;
    current_bookings INTEGER;
BEGIN
    SELECT capacity INTO class_capacity
    FROM classes
    WHERE id = class_uuid;
    
    SELECT get_active_bookings_count(class_uuid) INTO current_bookings;
    
    RETURN (current_bookings < class_capacity);
END;
$$ LANGUAGE plpgsql;