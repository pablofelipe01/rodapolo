-- ============================================================================
-- SCRIPT DE TICKETS DE PRUEBA CORREGIDO
-- Crear datos de prueba para el sistema de reservas
-- ============================================================================

-- Limpiar datos previos de prueba (opcional)
DELETE FROM public.purchased_tickets WHERE package_id IN (
  SELECT id FROM public.ticket_packages WHERE name LIKE '%Test%' OR name LIKE '%Prueba%'
);
DELETE FROM public.ticket_packages WHERE name LIKE '%Test%' OR name LIKE '%Prueba%';

-- 1. Crear paquetes de tickets de prueba
INSERT INTO public.ticket_packages (id, name, description, quantity, price, valid_days, active) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Paquete Básico Test', 'Paquete de 4 clases para principiantes', 4, 50000, 30, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Paquete Intermedio Test', 'Paquete de 8 clases nivel intermedio', 8, 90000, 60, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Paquete Avanzado Test', 'Paquete de 12 clases nivel avanzado', 12, 120000, 90, true);

-- 2. Crear purchased_tickets para usuarios parentales existentes
-- Esto asume que ya existen perfiles con role='parental'
INSERT INTO public.purchased_tickets (
  parental_id,
  package_id,
  expiry_date,
  total_tickets,
  used_tickets,
  status
)
SELECT 
  p.id as parental_id,
  '550e8400-e29b-41d4-a716-446655440000' as package_id,
  NOW() + INTERVAL '30 days' as expiry_date,
  4 as total_tickets,
  0 as used_tickets,
  'active' as status
FROM public.profiles p
WHERE p.role = 'parental'
  AND NOT EXISTS (
    SELECT 1 FROM public.purchased_tickets pt
    WHERE pt.parental_id = p.id 
      AND pt.package_id = '550e8400-e29b-41d4-a716-446655440000'
  )
LIMIT 5; -- Solo para los primeros 5 usuarios parentales

-- 3. Crear ticket_units individuales para cada purchased_tickets
-- Esto crea tickets individuales basados en la cantidad total_tickets
INSERT INTO public.ticket_units (purchase_id, status)
SELECT 
  pt.id as purchase_id,
  'available' as status
FROM public.purchased_tickets pt
JOIN public.ticket_packages tp ON pt.package_id = tp.id
CROSS JOIN generate_series(1, pt.total_tickets) -- Crear tickets según la cantidad
WHERE tp.name LIKE '%Test%'
  AND NOT EXISTS (
    SELECT 1 FROM public.ticket_units tu 
    WHERE tu.purchase_id = pt.id
  );

-- 4. Verificar que se crearon correctamente
SELECT 
  p.id as parental_id,
  p.full_name,
  tp.name as package_name,
  pt.total_tickets,
  pt.used_tickets,
  pt.status,
  pt.expiry_date,
  COUNT(tu.id) as ticket_units_created,
  COUNT(CASE WHEN tu.status = 'available' THEN 1 END) as available_tickets
FROM public.purchased_tickets pt
JOIN public.profiles p ON pt.parental_id = p.id
JOIN public.ticket_packages tp ON pt.package_id = tp.id
LEFT JOIN public.ticket_units tu ON tu.purchase_id = pt.id
WHERE tp.name LIKE '%Test%'
GROUP BY p.id, p.full_name, tp.name, pt.total_tickets, pt.used_tickets, pt.status, pt.expiry_date, pt.created_at
ORDER BY pt.created_at DESC;

-- 5. Script adicional para crear tickets para un usuario específico
-- (Ejecutar solo si necesitas tickets para un usuario en particular)
/*
-- Reemplaza 'TU_USER_ID_AQUI' con el user_id real del usuario parental
INSERT INTO public.purchased_tickets (
  parental_id,
  package_id,
  expiry_date,
  total_tickets,
  used_tickets,
  status
)
SELECT 
  p.id as parental_id,
  '550e8400-e29b-41d4-a716-446655440001' as package_id,
  NOW() + INTERVAL '60 days' as expiry_date,
  8 as total_tickets,
  0 as used_tickets,
  'active' as status
FROM public.profiles p
WHERE p.user_id = 'TU_USER_ID_AQUI'
  AND p.role = 'parental';
*/