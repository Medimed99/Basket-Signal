import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERREUR : Variables manquantes.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const API_URL = "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records";
const BATCH_SIZE = 99;

async function finalImport() {
  console.log('🚀 Démarrage de l\'import V4 (Schéma détecté : equip_coordonnees)...');
  
  let offset = 0;
  let totalProcessed = 0;
  let keepFetching = true;

  while (keepFetching) {
    try {
      // Construction de la requête avec les bons champs détectés
      const queryParams = new URLSearchParams({
        limit: BATCH_SIZE,
        offset: offset,
        // Filtre sur le champ confirmé "equip_type_name"
        where: 'equip_type_name like "Basket*"', 
        // Tri par nom d'installation pour la stabilité
        order_by: 'inst_nom'
      });

      const url = `${API_URL}?${queryParams}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ Erreur API : ${response.status}`);
        keepFetching = false;
        break;
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        if (offset === 0) console.warn("⚠️ Aucun résultat. Vérifiez le filtre.");
        keepFetching = false;
        break;
      }

      // Mapping avec le champ "equip_coordonnees"
      const courts = [];
      for (const record of data.results) {
        
        let lat, lng;
        
        // C'est ICI que ça change : on utilise le champ découvert
        const geo = record.equip_coordonnees;
        
        if (geo) {
            lat = geo.lat;
            lng = geo.lon;
        }

        if (lat && lng) {
          courts.push({
            osm_id: parseInt(record.id) || Math.floor(Math.random() * 1000000000),
            // On utilise les champs inst_nom et inst_lib trouvés dans les logs
            name: `${record.equip_type_name || 'Terrain'} - ${record.inst_nom || ''}`,
            city: record.com_nom || record.inst_cp || 'France', // inst_cp trouvé dans les logs
            lat: lat,
            lng: lng,
            floor: determineFloor(record.equip_type_famille),
            lighting: false,
            access_type: 'public',
            max_players: 20
          });
        }
      }

      // Insertion Supabase
      if (courts.length > 0) {
        const { error } = await supabase
          .from('courts')
          .upsert(courts, { onConflict: 'osm_id', ignoreDuplicates: true });

        if (error) {
           // On ignore les doublons
        } else {
          totalProcessed += courts.length;
          process.stdout.write(`\r✅ Terrains importés : ${totalProcessed}`);
        }
      }

      offset += BATCH_SIZE;

    } catch (err) {
      console.error('\n❌ CRASH :', err);
      keepFetching = false;
    }
  }

  console.log(`\n\n✨ SUCCÈS V4 ! ${totalProcessed} terrains sont maintenant dans la base.`);
}

function determineFloor(famille) {
  if (!famille) return 'Bitume';
  const f = famille.toLowerCase();
  if (f.includes('découvert')) return 'Bitume';
  if (f.includes('salle') || f.includes('couvert')) return 'Parquet';
  return 'Synthétique';
}

finalImport();