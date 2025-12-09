-- Création de la table pour l'historique ELO
CREATE TABLE IF NOT EXISTS public.elo_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Pour l'instant TEXT, à migrer vers UUID quand auth.users sera configuré
    new_elo INT NOT NULL,
    match_id UUID, -- Optionnel, pour lier au match qui a causé le changement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index pour récupérer rapidement les 30 derniers jours
CREATE INDEX IF NOT EXISTS idx_elo_history_user_date ON public.elo_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elo_history_user_id ON public.elo_history (user_id);

-- RLS (Row Level Security)
ALTER TABLE public.elo_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own elo history" ON public.elo_history
    FOR SELECT USING (true); -- Pour le MVP, on permet la lecture à tous

CREATE POLICY "Users can insert their own elo history" ON public.elo_history
    FOR INSERT WITH CHECK (true); -- Pour le MVP, on permet l'insertion à tous

