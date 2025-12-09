import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// On récupère les variables d'environnement
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERREUR : Les variables d\'environnement sont manquantes.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// URL de l'API Data ES (Ministère des Sports)
const API_URL = "https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records";
const BATCH_SIZE = 50;

async function runImport() {
  console.log('🔍 ANALYSE DE L\'API GOUV...');

  // 1. Test de connexion SANS filtre pour voir la structure réelle
  try {
    const testUrl = `${API_URL}?limit=1`;
    const testRes = await fetch(testUrl);
    const testJson = await testRes.json();

    if (!testJson.results || testJson.results.length === 0) {
      console.error('❌ ERREUR : L\'API Gouv renvoie une liste vide (même sans filtre).');
      console.error('   Réponse reçue :', JSON.stringify(testJson, null, 2));
      return;
    }

    const firstRecord = testJson.results[0];
    console.log('✅ Structure des données détectée :');
    // On affiche les clés pour debug si besoin
    console.log('   Champs disponibles :', Object.keys(firstRecord).slice(0, 5).join(', ') + '...');

    // Détection automatique des champs de coordonnées
    let latField = null;
    let lonField = null;

    if (firstRecord.coordonnees) {
      latField = (r) => r.coordonnees.lat;
      lonField = (r) => r.coordonnees.lon;
    } else if (firstRecord.geo_point_2d) {
      latField = (r) => r.geo_point_2d.lat;
      lonField = (r) => r.geo_point_2d.lon;
    }

    if (!latField) {
      console.error('❌ ERREUR : Impossible de trouver les coordonnées GPS dans les données.');
      return;
    }

    // 2. Lancement de l'import avec un filtre plus large ("Basket")
    console.log('\n🏀 Démarrage de l\'import (Filtre large "Basket")...');
    
    let offset = 0;
    let totalProcessed = 0;
    let keepFetching = true;

    while (keepFetching) {
      // On cherche "Basket" de manière générique pour éviter les problèmes de majuscules/tirets
      const queryParams = new URLSearchParams({
        select: 'id, com_insee, com_lib, equip_type_lib, equip_type_famille, coordonnees, geo_point_2d',
        where: 'equip_type_lib like "Basket*"', // Filtre plus souple
        limit: BATCH_SIZE,
        offset: offset
      });

      const response = await fetch(`${API_URL}?${queryParams}`);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        keepFetching = false;
        break;
      }

      // Mapping et Nettoyage
      const courts = [];
      for (const record of data.results) {
        // Sécurité : on ignore les terrains sans GPS
        const lat = latField(record);
        const lon = lonField(record);
        
        if (lat && lon) {
          courts.push({
            osm_id: parseInt(record.id) || Math.floor(Math.random() * 1000000000),
            name: `${record.equip_type_lib || 'Terrain'} - ${record.com_lib || 'Ville'}`,
            city: record.com_lib || 'Inconnue',
            lat: lat,
            lng: lon,
            floor: determineFloor(record.equip_type_famille),
            lighting: false,
            access_type: 'public',
            max_players: 20
          });
        }
      }

      if (courts.length > 0) {
        const { error } = await supabase
          .from('courts')
          .upsert(courts, { onConflict: 'osm_id', ignoreDuplicates: true });

        if (error) {
          console.warn('⚠️ Erreur Supabase :', error.message);
        } else {
          totalProcessed += courts.length;
          process.stdout.write(`\r✅ Terrains importés : ${totalProcessed}`);
        }
      }

      offset += BATCH_SIZE;
      
      // Sécurité anti-boucle infinie (optionnel)
      if (offset > 50000) keepFetching = false;
    }

    console.log(`\n\n✨ SUCCÈS ! ${totalProcessed} terrains sont maintenant dans la base.`);

  } catch (err) {
    console.error('\n❌ CRASH DU SCRIPT :', err);
  }
}

function determineFloor(famille) {
  if (!famille) return 'Bitume';
  const f = famille.toLowerCase();
  if (f.includes('découvert')) return 'Bitume';
  if (f.includes('salle') || f.includes('couvert')) return 'Parquet';
  return 'Synthétique';
}

runImport();