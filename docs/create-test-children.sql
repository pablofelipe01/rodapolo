-- ============================================================================
-- SCRIPT DE HIJOS DE PRUEBA
-- Crear perfiles de hijos para testing del sistema de reservas
-- ============================================================================

-- Limpiar datos previos de prueba (opcional)
DELETE FROM public.junior_profiles WHERE full_name LIKE '%Test%' OR full_name LIKE '%Prueba%';

-- Crear hijos de prueba para usuarios parentales existentes
INSERT INTO public.junior_profiles (
  parental_id,
  unique_code,
  full_name,
  nickname,
  birth_date,
  level,
  active
)
SELECT 
  p.id as parental_id,
  'TEST' || SUBSTR(gen_random_uuid()::text, 1, 6) as unique_code,
  CASE 
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'Ana Test'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'Carlos Test'  
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'Sofia Test'
    ELSE 'Junior Test ' || row_number() OVER (PARTITION BY p.id ORDER BY p.id)
  END as full_name,
  CASE 
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'Anita'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'Carlitos'  
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'Sofi'
    ELSE NULL
  END as nickname,
  CURRENT_DATE - INTERVAL '8 years' as birth_date,
  CASE 
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) % 2 = 1 THEN 'alpha'
    ELSE 'beta'
  END as level,
  true as active
FROM public.profiles p
CROSS JOIN generate_series(1, 2) -- 2 hijos por parental
WHERE p.role = 'parental'
  AND NOT EXISTS (
    SELECT 1 FROM public.junior_profiles jp
    WHERE jp.parental_id = p.id 
      AND jp.full_name LIKE '%Test%'
  )
ORDER BY p.id, generate_series;

-- Verificar que se crearon correctamente
SELECT 
  p.full_name as parental_name,
  jp.unique_code,
  jp.full_name as junior_name,
  jp.nickname,
  jp.level,
  jp.active,
  jp.birth_date
FROM public.junior_profiles jp
JOIN public.profiles p ON jp.parental_id = p.id
WHERE jp.full_name LIKE '%Test%'
ORDER BY p.full_name, jp.full_name;

-- Contar cuántos hijos tiene cada parental
SELECT 
  p.full_name as parental_name,
  COUNT(jp.id) as total_children
FROM public.profiles p
LEFT JOIN public.junior_profiles jp ON p.id = jp.parental_id
WHERE p.role = 'parental'
GROUP BY p.id, p.full_name
ORDER BY p.full_name;