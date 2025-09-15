-- Script simple para crear tickets de prueba
-- Ejecutar en SQL Editor de Supabase

-- 1. Primero crear un paquete de tickets si no existe
INSERT INTO public.ticket_packages (
  name,
  description,
  quantity,
  price,
  is_active
) VALUES (
  'Test Package - 10 Classes',
  'Paquete de prueba para testing con 10 clases',
  10,
  100.00,
  true
) 
ON CONFLICT (name) DO NOTHING;

-- 2. Luego crear la compra de tickets para el usuario autenticado
-- NOTA: Asegúrate de estar autenticado como el usuario parental antes de ejecutar esto
INSERT INTO public.purchased_tickets (
  parental_id,
  package_id,
  total_tickets,
  amount_paid,
  payment_status
)
SELECT 
  p.id as parental_id,
  tp.id as package_id,
  10 as total_tickets,
  100.00 as amount_paid,
  'completed' as payment_status
FROM public.profiles p
CROSS JOIN public.ticket_packages tp
WHERE p.user_id = auth.uid() 
  AND p.role = 'parental'
  AND tp.name = 'Test Package - 10 Classes'
  AND NOT EXISTS (
    SELECT 1 FROM public.purchased_tickets pt2
    WHERE pt2.parental_id = p.id 
      AND pt2.package_id = tp.id
  );

-- 3. Verificar que se crearon los tickets automáticamente
SELECT 
  pt.id as purchase_id,
  tp.name as package_name,
  pt.total_tickets,
  COUNT(tu.id) as tickets_created,
  COUNT(CASE WHEN tu.status = 'available' THEN 1 END) as available_tickets
FROM public.purchased_tickets pt
JOIN public.ticket_packages tp ON pt.package_id = tp.id
LEFT JOIN public.ticket_units tu ON tu.purchase_id = pt.id
JOIN public.profiles p ON pt.parental_id = p.id
WHERE p.user_id = auth.uid()
GROUP BY pt.id, tp.name, pt.total_tickets
ORDER BY pt.created_at DESC;