-- ============================================================================
-- SCHEMA COMPLETO DE LA BASE DE DATOS RODAPOLO
-- ============================================================================
-- Este archivo contiene todas las configuraciones adicionales y datos de ejemplo

-- ============================================================================
-- CONFIGURACIONES ADICIONALES
-- ============================================================================

-- Función para buscar posts por texto
CREATE OR REPLACE FUNCTION search_posts(search_term TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER,
  likes_count INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.excerpt,
    p.cover_image_url,
    p.tags,
    p.published_at,
    p.views_count,
    p.likes_count,
    ts_rank(
      to_tsvector('spanish', p.title || ' ' || p.content),
      plainto_tsquery('spanish', search_term)
    ) as rank
  FROM public.posts p
  WHERE 
    p.status = 'published' 
    AND p.published_at <= NOW()
    AND (
      to_tsvector('spanish', p.title || ' ' || p.content) @@ plainto_tsquery('spanish', search_term)
      OR search_term = ANY(p.tags)
    )
  ORDER BY rank DESC, p.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de clases
CREATE OR REPLACE FUNCTION get_class_stats(class_id_param UUID)
RETURNS TABLE (
  total_bookings INTEGER,
  confirmed_bookings INTEGER,
  attended_bookings INTEGER,
  no_show_bookings INTEGER,
  cancelled_bookings INTEGER,
  attendance_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed')::INTEGER as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'attended')::INTEGER as attended_bookings,
    COUNT(*) FILTER (WHERE status = 'no_show')::INTEGER as no_show_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER as cancelled_bookings,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status IN ('attended', 'no_show')) = 0 THEN 0
      ELSE ROUND(
        COUNT(*) FILTER (WHERE status = 'attended')::DECIMAL / 
        COUNT(*) FILTER (WHERE status IN ('attended', 'no_show'))::DECIMAL * 100, 
        2
      )
    END as attendance_rate
  FROM public.bookings
  WHERE class_id = class_id_param;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tickets disponibles de un parental
CREATE OR REPLACE FUNCTION get_available_tickets(parental_id_param UUID)
RETURNS TABLE (
  ticket_id UUID,
  package_name TEXT,
  purchase_date DATE,
  expiry_date DATE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tu.id as ticket_id,
    tp.name as package_name,
    pt.purchase_date,
    pt.expiry_date,
    (pt.expiry_date - CURRENT_DATE)::INTEGER as days_remaining
  FROM public.ticket_units tu
  JOIN public.purchased_tickets pt ON tu.purchase_id = pt.id
  JOIN public.ticket_packages tp ON pt.package_id = tp.id
  WHERE 
    pt.parental_id = parental_id_param
    AND tu.status = 'available'
    AND pt.expiry_date >= CURRENT_DATE
  ORDER BY pt.expiry_date ASC, tu.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS DE EJEMPLO ADICIONALES
-- ============================================================================

-- Insertar paquetes de tickets adicionales
INSERT INTO public.ticket_packages (name, description, price, quantity, valid_days) 
SELECT 'Paquete Familiar', 'Perfecto para familias con múltiples hijos. Incluye 20 clases con validez extendida.', 25000, 20, 90
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_packages WHERE name = 'Paquete Familiar');

INSERT INTO public.ticket_packages (name, description, price, quantity, valid_days) 
SELECT 'Paquete Intensivo', 'Para los más apasionados del Rodapolo. 30 clases para entrenar intensivamente.', 35000, 30, 120
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_packages WHERE name = 'Paquete Intensivo');

-- Insertar posts adicionales de ejemplo
INSERT INTO public.posts (title, content, excerpt, tags, status, published_at, created_by)
SELECT 
  'Técnicas avanzadas de manejo del monociclo',
  'Una vez que domines los conceptos básicos del Rodapolo, es hora de perfeccionar tu técnica de manejo del monociclo eléctrico.

Posición corporal:
- Mantén la espalda recta y los hombros relajados
- Flexiona ligeramente las rodillas para absorber impactos
- Mantén los brazos libres para el manejo del mazo
- Tu peso debe estar centrado sobre el monociclo

Técnicas de aceleración:
- Inclínate suavemente hacia adelante para acelerar
- Usa movimientos fluidos, evita cambios bruscos de velocidad
- Practica arranques y paradas controladas
- Aprende a mantener velocidad constante durante el juego

Maniobras evasivas:
- Domina el giro en ocho para esquivar oponentes
- Practica cambios de dirección rápidos pero seguros
- Aprende a frenar gradualmente sin perder el equilibrio
- Desarrolla la habilidad de moverte hacia atrás

¡La práctica constante es la clave del éxito en el Rodapolo!',
  'Perfecciona tu técnica de manejo del monociclo con estos consejos avanzados.',
  ARRAY['tecnica', 'monociclo', 'avanzado'],
  'published',
  NOW() - INTERVAL '2 days',
  p.id
FROM public.profiles p WHERE p.role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.posts (title, content, excerpt, tags, status, published_at, created_by)
SELECT 
  'Estrategias de equipo en Rodapolo',
  'El Rodapolo no es solo habilidad individual; la coordinación en equipo es fundamental para el éxito.

Formaciones básicas:
- Formación diamante: Un defensor, dos mediocampistas y un delantero
- Formación línea: Todos los jugadores en línea horizontal
- Formación escalonada: Jugadores en diferentes niveles de profundidad

Roles del equipo:
- Defensor: Protege la portería y inicia ataques
- Mediocampistas: Conectan defensa y ataque, controlan el centro del campo
- Delantero: Se encarga de marcar goles y presionar la defensa rival

Comunicación en el campo:
- Usa señales claras y simples
- Comunica la posición de la pelota constantemente
- Avisa sobre jugadores rivales que se acercan
- Coordina los movimientos de equipo

Tácticas especiales:
- Juego de pared: Pases rápidos entre compañeros
- Contraataque: Ataque rápido tras recuperar la pelota
- Presión alta: Presionar al rival en su campo

¡Un equipo bien coordinado siempre supera a jugadores individuales talentosos!',
  'Descubre las estrategias de equipo que te llevarán a la victoria en Rodapolo.',
  ARRAY['estrategia', 'equipo', 'tactica'],
  'published',
  NOW() - INTERVAL '5 days',
  p.id
FROM public.profiles p WHERE p.role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista para clases con información completa
CREATE OR REPLACE VIEW class_details AS
SELECT 
  c.id,
  c.date,
  c.start_time,
  c.end_time,
  c.instructor_name,
  c.capacity,
  c.current_bookings,
  (c.capacity - c.current_bookings) as available_spots,
  c.level,
  c.status,
  c.field,
  c.notes,
  p.full_name as created_by_name,
  c.created_at,
  c.updated_at
FROM public.classes c
LEFT JOIN public.profiles p ON c.admin_id = p.id;

-- Vista para reservas con información completa
CREATE OR REPLACE VIEW booking_details AS
SELECT 
  b.id,
  b.class_id,
  c.date as class_date,
  c.start_time as class_start_time,
  c.instructor_name as class_instructor,
  c.field as class_field,
  b.junior_id,
  jp.full_name as junior_full_name,
  jp.unique_code as junior_unique_code,
  b.ticket_id,
  b.booked_by,
  p.full_name as booked_by_name,
  b.booked_at,
  b.status,
  b.cancelled_at,
  b.cancellation_reason,
  b.attended_at
FROM public.bookings b
JOIN public.classes c ON b.class_id = c.id
JOIN public.junior_profiles jp ON b.junior_id = jp.id
JOIN public.profiles p ON b.booked_by = p.id;

-- Vista para tickets con información del paquete
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
  tu.id,
  tu.purchase_id,
  tu.status,
  tu.blocked_at,
  tu.blocked_for_class_id,
  CONCAT(c.date, ' - ', c.start_time, ' con ', c.instructor_name) as blocked_for_class_info,
  pt.parental_id,
  p.full_name as parental_name,
  pt.package_id,
  tp.name as package_name,
  tp.price as package_price,
  pt.purchase_date,
  pt.expiry_date,
  (pt.expiry_date - CURRENT_DATE) as days_remaining,
  tu.created_at
FROM public.ticket_units tu
JOIN public.purchased_tickets pt ON tu.purchase_id = pt.id
JOIN public.ticket_packages tp ON pt.package_id = tp.id
JOIN public.profiles p ON pt.parental_id = p.id
LEFT JOIN public.classes c ON tu.blocked_for_class_id = c.id;

-- Comentarios para las vistas
COMMENT ON VIEW class_details IS 'Vista completa de clases con información del creador';
COMMENT ON VIEW booking_details IS 'Vista completa de reservas con información de clase y junior';
COMMENT ON VIEW ticket_details IS 'Vista completa de tickets con información de paquete y parental';