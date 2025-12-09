-- Création de la table des terrains
CREATE TABLE IF NOT EXISTS public.courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    osm_id BIGINT UNIQUE, -- Pour éviter les doublons lors de l'import
    name TEXT NOT NULL,
    city TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    floor TEXT DEFAULT 'Bitume', -- Type de sol
    lighting BOOLEAN DEFAULT false,
    water BOOLEAN DEFAULT false,
    access_type TEXT DEFAULT 'public',
    max_players INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index pour accélérer les requêtes géographiques (bounding box)
CREATE INDEX IF NOT EXISTS idx_courts_lat_lng ON public.courts (lat, lng);
CREATE INDEX IF NOT EXISTS idx_courts_city ON public.courts (city);

-- RLS (Row Level Security) - Permettre la lecture publique
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courts are viewable by everyone" ON public.courts
    FOR SELECT USING (true);

