import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERREUR : Les variables d\'environnement sont manquantes.');
  console.error('➡️  VITE_SUPABASE_URL');
  console.error('➡️  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const API_URL = "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records";
// On réduit la taille des lots pour éviter les erreurs réseaux
const BATCH_SIZE = 50; 

async function fetchAndInsert() {
  console.log('🏀 Démarrage de l\'import Data ES (France Entière)...');
  
  let offset = 0;
  let totalProcessed = 0;
  let keepFetching = true;

  while (keepFetching) {
    try {
      // 1. Appel API Data Gouv
      const queryParams = new URLSearchParams({
        select: 'id, com_insee, com_lib, equip_type_lib, equip_type_famille, coordonnees',
        where: 'search(equip_type_lib, "Basket-Ball") and coordonnees is not null',
        limit: BATCH_SIZE,
        offset: offset
      });

      const response = await fetch(`${API_URL}?${queryParams}`);
      const data = await response.json();

      // Si plus de résultats, on arrête
      if (!data.results || data.results.length === 0) {
        keepFetching = false;
        break;
      }

      // 2. Préparation des données pour Supabase
      const courts = data.results.map(record => ({
        osm_id: parseInt(record.id) || Math.floor(Math.random() * 1000000000),
        name: `${record.equip_type_lib} - ${record.com_lib}`,
        city: record.com_lib,
        lat: record.coordonnees.lat,
        lng: record.coordonnees.lon,
        floor: determineFloor(record.equip_type_famille),
        lighting: false,
        access_type: 'public',
        max_players: 20
      }));

      // 3. Envoi vers Supabase
      const { error } = await supabase
        .from('courts')
        .upsert(courts, { onConflict: 'osm_id', ignoreDuplicates: true });

      if (error) {
        console.warn('⚠️ Erreur Supabase (doublon possible):', error.message);
      } else {
        totalProcessed += courts.length;
        // Affichage de progression sur une seule ligne
        process.stdout.write(`\r✅ Terrains traités : ${totalProcessed}`);
      }

      offset += BATCH_SIZE;

    } catch (err) {
      console.error('\n❌ Erreur script:', err);
      // On continue quand même au prochain batch si une erreur survient
    }
  }

  console.log(`\n\n✨ TERMINÉ ! La base contient maintenant ${totalProcessed} terrains.`);
}

function determineFloor(famille) {
  if (!famille) return 'Bitume';
  const f = famille.toLowerCase();
  if (f.includes('découvert')) return 'Bitume';
  if (f.includes('salle') || f.includes('couvert')) return 'Parquet';
  return 'Synthétique';
}

fetchAndInsert();