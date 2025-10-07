-- =============================================================
-- TABLA PLAYER_RANKING - RANKING GENERAL DE JUGADORES RODAPOLO
-- =============================================================

-- Crear la tabla principal
CREATE TABLE IF NOT EXISTS public.player_ranking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    stars_juego INTEGER NOT NULL DEFAULT 0 CHECK(stars_juego >= 0 AND stars_juego <= 6),
    stars_rueda INTEGER NOT NULL DEFAULT 0 CHECK(stars_rueda >= 0 AND stars_rueda <= 6),
    tournaments_played INTEGER NOT NULL DEFAULT 0 CHECK(tournaments_played >= 0),
    tournaments_won INTEGER NOT NULL DEFAULT 0 CHECK(tournaments_won >= 0),
    ranking_points INTEGER NOT NULL DEFAULT 0 CHECK(ranking_points >= 0),
    general_ranking_position INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::text, NOW()) NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_player_ranking_position ON public.player_ranking(general_ranking_position);
CREATE INDEX IF NOT EXISTS idx_player_ranking_points ON public.player_ranking(ranking_points DESC);
CREATE INDEX IF NOT EXISTS idx_player_ranking_country ON public.player_ranking(country);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('UTC'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_player_ranking_updated_at
    BEFORE UPDATE ON public.player_ranking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.player_ranking ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Allow read access to all authenticated users" ON public.player_ranking
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir inserción solo a admins (por ahora)
CREATE POLICY "Allow insert for admins" ON public.player_ranking
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir actualización solo a admins (por ahora)
CREATE POLICY "Allow update for admins" ON public.player_ranking
    FOR UPDATE
    TO authenticated
    USING (true);

-- Comentarios de documentación
COMMENT ON TABLE public.player_ranking IS 'Tabla de ranking general de jugadores de Rodapolo';
COMMENT ON COLUMN public.player_ranking.player_name IS 'Nombre completo del jugador';
COMMENT ON COLUMN public.player_ranking.country IS 'País del jugador (España, Argentina, Reino Unido, Marruecos)';
COMMENT ON COLUMN public.player_ranking.stars_juego IS 'Nivel de estrellas en modalidad Juego (0-6)';
COMMENT ON COLUMN public.player_ranking.stars_rueda IS 'Nivel de estrellas en modalidad Rueda (0-6)';
COMMENT ON COLUMN public.player_ranking.tournaments_played IS 'Total de torneos jugados';
COMMENT ON COLUMN public.player_ranking.tournaments_won IS 'Total de torneos ganados';
COMMENT ON COLUMN public.player_ranking.ranking_points IS 'Puntos totales del sistema de ranking';
COMMENT ON COLUMN public.player_ranking.general_ranking_position IS 'Posición en el ranking general';