-- ============================================================================
-- POLÍTICAS DE SEGURIDAD PARA RODAPOLO
-- ============================================================================

-- Opción 1: Deshabilitar RLS temporalmente (SOLO PARA DESARROLLO)
-- ALTER TABLE junior_profiles DISABLE ROW LEVEL SECURITY;

-- Opción 2: Configurar políticas RLS correctas (RECOMENDADO)

-- Política para permitir SELECT a usuarios autenticados
CREATE POLICY "Allow authenticated users to view junior profiles" ON junior_profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir INSERT a administradores
CREATE POLICY "Allow admins to insert junior profiles" ON junior_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para permitir UPDATE a administradores
CREATE POLICY "Allow admins to update junior profiles" ON junior_profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para permitir DELETE a administradores
CREATE POLICY "Allow admins to delete junior profiles" ON junior_profiles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política adicional: Permitir a usuarios parentales ver sus propios hijos
CREATE POLICY "Allow parental users to view their own children" ON junior_profiles
    FOR SELECT
    TO authenticated
    USING (
        parental_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'parental'
        )
    );

-- Política adicional: Permitir a usuarios parentales actualizar sus propios hijos
CREATE POLICY "Allow parental users to update their own children" ON junior_profiles
    FOR UPDATE
    TO authenticated
    USING (
        parental_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'parental'
        )
    );