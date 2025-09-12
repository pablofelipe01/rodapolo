-- ============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY PARA TABLA CLASSES
-- Sistema Rodapolo - Gestión de Clases de Polo
-- ============================================================================

-- 1. POLÍTICA PARA SELECT (Ver clases)
-- Los admins pueden ver todas las clases
-- Los usuarios parentales pueden ver todas las clases (para hacer reservas)
CREATE POLICY "Admins and parentals can view all classes" ON public.classes
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.profiles 
            WHERE role IN ('admin', 'parental')
        )
    );

-- 2. POLÍTICA PARA INSERT (Crear clases)
-- Solo los admins pueden crear nuevas clases
CREATE POLICY "Only admins can create classes" ON public.classes
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM public.profiles 
            WHERE role = 'admin'
        )
    );

-- 3. POLÍTICA PARA UPDATE (Actualizar clases)
-- Solo los admins pueden actualizar clases
CREATE POLICY "Only admins can update classes" ON public.classes
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.profiles 
            WHERE role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM public.profiles 
            WHERE role = 'admin'
        )
    );

-- 4. POLÍTICA PARA DELETE (Eliminar clases)
-- Solo los admins pueden eliminar clases
CREATE POLICY "Only admins can delete classes" ON public.classes
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.profiles 
            WHERE role = 'admin'
        )
    );

-- 5. HABILITAR RLS EN LA TABLA CLASSES
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICACIÓN DE POLÍTICAS
-- ============================================================================
-- Para verificar que las políticas se crearon correctamente, ejecuta:
-- SELECT * FROM pg_policies WHERE tablename = 'classes';