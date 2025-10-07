-- =============================================================
-- DATOS DE PRUEBA PARA PLAYER_RANKING
-- 20 jugadores de España, Argentina, Reino Unido y Marruecos
-- =============================================================

-- Primero, limpiar la tabla si existe data previa
TRUNCATE TABLE public.player_ranking RESTART IDENTITY CASCADE;

-- Insertar jugadores de prueba con datos realistas
INSERT INTO public.player_ranking (
    player_name, 
    country, 
    stars_juego, 
    stars_rueda, 
    tournaments_played, 
    tournaments_won, 
    ranking_points, 
    general_ranking_position
) VALUES 
-- ESPAÑA (5 jugadores)
('Carlos Martínez Ruiz', 'España', 6, 5, 28, 12, 1450, 1),
('María García López', 'España', 5, 6, 24, 8, 1280, 3),
('Alejandro Fernández', 'España', 5, 4, 22, 6, 1120, 7),
('Carmen Rodríguez', 'España', 4, 5, 20, 4, 980, 11),
('Pablo Sánchez Torres', 'España', 3, 4, 18, 2, 780, 16),

-- ARGENTINA (5 jugadores)
('Diego Hernández', 'Argentina', 6, 6, 30, 15, 1520, 2),
('Sofía Rodríguez Paz', 'Argentina', 5, 5, 26, 9, 1320, 4),
('Mateo López Silva', 'Argentina', 4, 5, 21, 5, 1050, 8),
('Valentina Morales', 'Argentina', 4, 4, 19, 3, 890, 13),
('Santiago Gutiérrez', 'Argentina', 3, 3, 15, 1, 650, 18),

-- REINO UNIDO (5 jugadores)
('James Thompson', 'Reino Unido', 5, 5, 25, 7, 1200, 5),
('Emma Wilson Clarke', 'Reino Unido', 5, 4, 23, 6, 1150, 6),
('Oliver Johnson', 'Reino Unido', 4, 4, 20, 4, 920, 12),
('Sophie Brown Davis', 'Reino Unido', 3, 5, 17, 2, 810, 15),
('Harry Williams', 'Reino Unido', 3, 3, 16, 1, 690, 17),

-- MARRUECOS (5 jugadores)
('Omar Hassan Alami', 'Marruecos', 5, 4, 24, 8, 1180, 9),
('Fatima Benali', 'Marruecos', 4, 5, 22, 5, 1080, 10),
('Youssef El Mansouri', 'Marruecos', 4, 4, 19, 3, 870, 14),
('Aicha Tazi Benkirane', 'Marruecos', 3, 4, 16, 2, 720, 19),
('Mehdi Chakir', 'Marruecos', 2, 3, 12, 0, 520, 20);

-- Función para calcular puntos automáticamente basada en la fórmula
-- Puntos = (tournaments_won * 100) + (tournaments_played * 10) + ((stars_juego + stars_rueda) * 5)
UPDATE public.player_ranking 
SET ranking_points = (
    tournaments_won * 100 + 
    tournaments_played * 10 + 
    (stars_juego + stars_rueda) * 5
);

-- Actualizar posiciones de ranking basadas en puntos (descendente)
WITH ranked_players AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY ranking_points DESC, tournaments_won DESC, player_name ASC) as new_position
    FROM public.player_ranking
)
UPDATE public.player_ranking 
SET general_ranking_position = ranked_players.new_position
FROM ranked_players 
WHERE player_ranking.id = ranked_players.id;

-- Verificar los datos insertados
SELECT 
    general_ranking_position as "Pos",
    player_name as "Jugador",
    country as "País",
    stars_juego as "⭐Juego",
    stars_rueda as "⭐Rueda", 
    tournaments_played as "T.Jugados",
    tournaments_won as "T.Ganados",
    ranking_points as "Puntos"
FROM public.player_ranking 
ORDER BY general_ranking_position;

-- Mostrar estadísticas por país
SELECT 
    country as "País",
    COUNT(*) as "Jugadores",
    AVG(ranking_points)::INTEGER as "Puntos Promedio",
    MAX(ranking_points) as "Mejor Puntaje",
    SUM(tournaments_won) as "Torneos Ganados Total"
FROM public.player_ranking 
GROUP BY country 
ORDER BY "Puntos Promedio" DESC;