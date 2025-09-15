-- Script para crear tickets de prueba para testing del sistema de reservas
-- NOTA: Ejecutar solo en ambiente de desarrollo/testing

-- Crear un paquete de tickets de prueba para el usuario autenticado
DO $$
DECLARE
  v_parental_id UUID;
  v_package_id UUID;
  v_purchase_id UUID;
BEGIN
  -- Obtener el ID del parental del usuario autenticado
  SELECT id INTO v_parental_id
  FROM public.profiles
  WHERE user_id = auth.uid() AND role = 'parental';
  
  IF v_parental_id IS NULL THEN
    RAISE NOTICE 'No parental profile found for authenticated user';
    RETURN;
  END IF;
  
  -- Verificar si ya tiene un paquete de prueba
  IF EXISTS (
    SELECT 1 FROM public.purchased_tickets pt
    JOIN public.ticket_packages tp ON pt.package_id = tp.id
    WHERE pt.parental_id = v_parental_id AND tp.name LIKE '%Test%'
  ) THEN
    RAISE NOTICE 'User already has test tickets';
    RETURN;
  END IF;
  
  -- Crear un paquete de tickets de prueba si no existe
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
  ON CONFLICT (name) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active
  RETURNING id INTO v_package_id;
  
  -- Si no se insertó, obtener el ID existente
  IF v_package_id IS NULL THEN
    SELECT id INTO v_package_id
    FROM public.ticket_packages
    WHERE name = 'Test Package - 10 Classes';
  END IF;
  
  -- Crear la compra de tickets
  INSERT INTO public.purchased_tickets (
    parental_id,
    package_id,
    total_tickets,
    amount_paid,
    payment_status
  ) VALUES (
    v_parental_id,
    v_package_id,
    10,
    100.00,
    'completed'
  ) RETURNING id INTO v_purchase_id;
  
  RAISE NOTICE 'Test tickets created successfully for parental_id: %, purchase_id: %', v_parental_id, v_purchase_id;
  
END $$;

-- Verificar que se crearon los tickets
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