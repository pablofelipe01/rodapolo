
-- Política para permitir acceso público SOLO para login de juniors
CREATE POLICY "Allow public access for junior login" ON junior_profiles
    FOR SELECT
    TO public
    USING (active = true);

