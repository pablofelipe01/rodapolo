-- ============================================================================
-- TABLA POSTS
-- Contenido educativo creado por admins y visible para juniors
-- ============================================================================

-- Crear tabla posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- Resumen corto para listados
  cover_image_url TEXT,
  tags TEXT[], -- Array de tags para categorización
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints para validar estado
  CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR
    (status != 'published')
  )
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS posts_created_by_idx ON public.posts(created_by);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS posts_title_search_idx ON public.posts USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS posts_content_search_idx ON public.posts USING gin(to_tsvector('spanish', content));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para manejar publicación de posts
CREATE OR REPLACE FUNCTION handle_post_publication()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está publicando por primera vez, establecer published_at
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at := NOW();
  -- Si se despublica, limpiar published_at
  ELSIF NEW.status != 'published' AND OLD.status = 'published' THEN
    NEW.published_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para manejar publicación
CREATE TRIGGER handle_post_publication_trigger
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION handle_post_publication();

-- Crear tabla para likes de posts
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  junior_id UUID REFERENCES public.junior_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Un junior solo puede dar like una vez por post
  UNIQUE(post_id, junior_id)
);

-- Índices para post_likes
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_junior_id_idx ON public.post_likes(junior_id);

-- Función para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de likes
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Crear tabla para visualizaciones de posts
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  junior_id UUID REFERENCES public.junior_profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  view_date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Crear índice único para permitir solo una vista por día por junior por post
CREATE UNIQUE INDEX IF NOT EXISTS post_views_unique_daily_idx 
  ON public.post_views(post_id, junior_id, view_date);

-- Índices para post_views
CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS post_views_junior_id_idx ON public.post_views(junior_id);
CREATE INDEX IF NOT EXISTS post_views_viewed_at_idx ON public.post_views(viewed_at);

-- Función para establecer view_date automáticamente
CREATE OR REPLACE FUNCTION set_view_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.view_date := DATE(NEW.viewed_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para establecer view_date automáticamente
CREATE TRIGGER set_view_date_trigger
  BEFORE INSERT OR UPDATE ON public.post_views
  FOR EACH ROW EXECUTE FUNCTION set_view_date();

-- Función para actualizar contador de visualizaciones
CREATE OR REPLACE FUNCTION update_post_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET views_count = views_count + 1
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de visualizaciones
CREATE TRIGGER update_post_views_count_trigger
  AFTER INSERT ON public.post_views
  FOR EACH ROW EXECUTE FUNCTION update_post_views_count();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES PARA POSTS
-- ============================================================================

-- Política para que juniors vean solo posts publicados
CREATE POLICY "Juniors can view published posts" ON public.posts
  FOR SELECT USING (
    status = 'published' AND 
    published_at <= NOW()
  );

-- Política para que admins vean todos los posts
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que solo admins puedan crear posts
CREATE POLICY "Only admins can create posts" ON public.posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que solo admins puedan actualizar posts
CREATE POLICY "Only admins can update posts" ON public.posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que solo admins puedan eliminar posts
CREATE POLICY "Only admins can delete posts" ON public.posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- RLS POLICIES PARA POST_LIKES
-- ============================================================================

-- Política para que juniors vean likes de posts publicados
CREATE POLICY "Juniors can view likes on published posts" ON public.post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id 
        AND p.status = 'published'
        AND p.published_at <= NOW()
    )
  );

-- Política para que juniors puedan dar like a posts publicados
CREATE POLICY "Juniors can like published posts" ON public.post_likes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.junior_profiles jp
      WHERE jp.id = junior_id 
        AND jp.unique_code IN (
          SELECT unnest(regexp_split_to_array(auth.jwt() ->> 'junior_codes', ','))
        )
    ) AND
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id 
        AND p.status = 'published'
        AND p.published_at <= NOW()
    )
  );

-- Política para que juniors puedan quitar su like
CREATE POLICY "Juniors can remove own likes" ON public.post_likes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.junior_profiles jp
      WHERE jp.id = junior_id 
        AND jp.unique_code IN (
          SELECT unnest(regexp_split_to_array(auth.jwt() ->> 'junior_codes', ','))
        )
    )
  );

-- Política para que admins vean todos los likes
CREATE POLICY "Admins can view all likes" ON public.post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- RLS POLICIES PARA POST_VIEWS
-- ============================================================================

-- Política para que juniors registren visualizaciones de posts publicados
CREATE POLICY "Juniors can record views on published posts" ON public.post_views
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.junior_profiles jp
      WHERE jp.id = junior_id 
        AND jp.unique_code IN (
          SELECT unnest(regexp_split_to_array(auth.jwt() ->> 'junior_codes', ','))
        )
    ) AND
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id 
        AND p.status = 'published'
        AND p.published_at <= NOW()
    )
  );

-- Política para que admins vean todas las visualizaciones
CREATE POLICY "Admins can view all post views" ON public.post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.posts IS 'Contenido educativo creado por admins para juniors';
COMMENT ON COLUMN public.posts.status IS 'Estado: draft, published, archived';
COMMENT ON COLUMN public.posts.tags IS 'Array de tags para categorización';
COMMENT ON COLUMN public.posts.excerpt IS 'Resumen corto para listados';
COMMENT ON TABLE public.post_likes IS 'Likes dados por juniors a posts';
COMMENT ON TABLE public.post_views IS 'Visualizaciones de posts por juniors (una por día)';

-- Insertar algunos posts de ejemplo
INSERT INTO public.posts (title, content, excerpt, tags, status, published_at, created_by) 
SELECT 
  'Bienvenidos al mundo del Rodapolo',
  'El Rodapolo combina la emoción del polo tradicional con la innovación de los monociclos eléctricos. En este deporte único, los jugadores montan monociclos eléctricos mientras intentan marcar goles con un mazo y una pelota específicamente diseñada para este juego.

Historia del Rodapolo:
El Rodapolo surgió como una evolución natural del polo tradicional, adaptándose a los nuevos tiempos y tecnologías. Los monociclos eléctricos proporcionan una experiencia completamente nueva, donde el equilibrio, la coordinación y la estrategia se combinan de manera única.

Beneficios del Rodapolo:
- Mejora el equilibrio y la coordinación
- Desarrolla habilidades de trabajo en equipo
- Proporciona ejercicio cardiovascular
- Es ecológico al usar vehículos eléctricos
- Desarrolla la concentración y reflexes

¡Únete a la revolución del Rodapolo y descubre un deporte que combina tradición, tecnología y diversión!',
  'Descubre el emocionante mundo del Rodapolo, donde la tradición del polo se encuentra con la innovación de los monociclos eléctricos.',
  ARRAY['introduccion', 'historia', 'beneficios'],
  'published',
  NOW(),
  p.id
FROM public.profiles p WHERE p.role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.posts (title, content, excerpt, tags, status, published_at, created_by)
SELECT 
  'Reglas básicas del Rodapolo',
  'El Rodapolo sigue reglas específicas que garantizan un juego seguro y emocionante para todos los participantes.

Equipamiento necesario:
- Monociclo eléctrico homologado
- Casco protector obligatorio
- Rodilleras y coderas
- Mazo de Rodapolo (más corto que el polo tradicional)
- Pelota oficial de Rodapolo

Reglas fundamentales:
1. Cada equipo está formado por 4 jugadores
2. Los partidos duran 4 períodos de 7 minutos
3. Solo se puede golpear la pelota con el mazo
4. No está permitido el contacto físico entre jugadores
5. Los monociclos deben mantenerse en movimiento durante el juego

Faltas y sanciones:
- Uso incorrecto del mazo: falta menor
- Contacto físico: falta mayor
- Juego peligroso: expulsión temporal
- Conducta antideportiva: tarjeta amarilla/roja

¡Recuerda siempre jugar limpio y respetar a tus compañeros!',
  'Conoce las reglas fundamentales del Rodapolo para disfrutar de un juego seguro y divertido.',
  ARRAY['reglas', 'equipamiento', 'seguridad'],
  'published',
  NOW(),
  p.id
FROM public.profiles p WHERE p.role = 'admin' LIMIT 1
ON CONFLICT DO NOTHING;