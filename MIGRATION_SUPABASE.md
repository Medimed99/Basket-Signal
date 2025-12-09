# Guide de Migration Supabase - StreetSignal

## 📋 Vue d'ensemble

Ce guide détaille la migration de l'application vers Supabase pour remplacer les données statiques par une base de données dynamique.

## 🔧 Prérequis

1. Un projet Supabase créé
2. Les variables d'environnement configurées (voir `.env.example`)
3. Node.js installé pour le script de seed

## 📦 Installation

```bash
npm install @supabase/supabase-js recharts
```

## 🗄️ Configuration Supabase

### 1. Créer les tables

Exécutez les migrations SQL dans l'ordre :

1. `supabase/migrations/001_create_courts_table.sql` - Table des terrains
2. `supabase/migrations/002_create_elo_history_table.sql` - Historique ELO

Dans Supabase Dashboard :
- Allez dans SQL Editor
- Copiez-collez chaque fichier SQL
- Exécutez les requêtes

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

⚠️ **Important** : Ne commitez jamais `.env.local` dans Git !

### 3. Peupler la base de données (OBLIGATOIRE)

**⚠️ ATTENTION CRITIQUE : Utiliser la clé SERVICE_ROLE, pas la clé ANON !**

La clé "anon" publique ne permet pas l'écriture dans Supabase à cause des restrictions RLS (Row Level Security). Vous devez utiliser la clé **SERVICE_ROLE** pour le script de seed.

#### Où trouver la clé SERVICE_ROLE ?

1. Allez dans votre projet Supabase Dashboard
2. Settings > API
3. Copiez la clé **service_role** (celle qui commence par `eyJ...` et est marquée "service_role")

#### Exécution du script

```bash
# Configurer les variables d'environnement
export VITE_SUPABASE_URL="https://votre-projet.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role"

# Lancer le script d'import
node supabase/seed_data_gouv.js
```

**Note** : Le script utilise l'API Data ES (Ministère des Sports) qui recense ~45 000 équipements sportifs en France, incluant tous les terrains de basket. Cela garantit une couverture nationale complète, contrairement à l'ancien script Overpass qui excluait certaines zones (ex: Cergy).

#### Vérification

Après l'exécution du script :
1. Allez dans Supabase Dashboard > Table Editor > `courts`
2. Vérifiez que la table contient des milliers de lignes (pas juste 10 ou 0)
3. Si la table est vide, vérifiez que vous avez bien utilisé la clé SERVICE_ROLE

## 🎯 Fonctionnalités Implémentées

### ✅ Auto-détection de la Ville

- Utilise l'API Nominatim (OpenStreetMap) pour le reverse geocoding
- Pré-remplit automatiquement le champ ville dans l'onboarding
- L'utilisateur peut valider ou corriger

### ✅ Fetch Dynamique des Terrains

- Remplacement de `COURTS_DATA` statique par un fetch Supabase
- Chargement des terrains dans un rayon de 20km autour de la position
- **Protection des données mock** : Si Supabase retourne une liste vide, les données mock sont conservées
- Fallback automatique sur données mock si Supabase n'est pas configuré

### ✅ Suppression des Hardcodes "Nantes"

- Position par défaut changée de Nantes (47.2186, -1.5547) à Paris (48.8566, 2.3522)
- `CURRENT_USER` converti en state React (`currentUser`)
- Ville dynamique basée sur la géolocalisation

### ✅ Graphique ELO avec Recharts

- Remplacement du graphique manuel par Recharts
- Fetch de l'historique depuis Supabase
- Calcul dynamique du delta (+/- points)
- Design cohérent avec le thème orange/slate

## 🔄 Migration des Données

### Structure des données

**Table `courts`** :
- `id` (UUID) - Identifiant unique
- `osm_id` (BIGINT) - ID unique pour éviter doublons
- `name` (TEXT) - Nom du terrain
- `city` (TEXT) - Ville
- `lat`, `lng` (DOUBLE PRECISION) - Coordonnées
- `floor` (TEXT) - Type de sol
- `lighting` (BOOLEAN) - Éclairage
- `water` (BOOLEAN) - Point d'eau
- `max_players` (INT) - Capacité max

**Table `elo_history`** :
- `id` (UUID) - Identifiant unique
- `user_id` (TEXT) - ID utilisateur
- `new_elo` (INT) - Nouveau score ELO
- `match_id` (UUID, optionnel) - Match associé
- `created_at` (TIMESTAMP) - Date de création

## 🧪 Tests

### Test de Géolocalisation

1. Ouvrir les DevTools Chrome (F12)
2. Aller dans "Sensors"
3. Simuler une position à Cergy (49.03, 2.07)
4. Vérifier que :
   - L'onboarding propose "Cergy"
   - La carte se centre sur Cergy
   - Les terrains alentours s'affichent

### Test Supabase

1. Vérifier que les variables d'environnement sont bien chargées
2. Ouvrir la console du navigateur
3. Vérifier qu'il n'y a pas d'erreurs de connexion
4. Si Supabase n'est pas configuré, l'app doit fonctionner en mode mock

### Test de Protection des Données Mock

1. Si Supabase est configuré mais retourne une liste vide (base vide ou zone sans terrains)
2. L'application doit **conserver** les données mock
3. Les terrains de démo doivent rester visibles

## 🐛 Dépannage

### Les terrains ne s'affichent pas

**Problème 1 : Base de données vide**
- Vérifier que le script de seed a bien été exécuté avec la clé SERVICE_ROLE
- Vérifier dans Supabase Dashboard que la table `courts` contient des données
- Si la table est vide, réexécuter le script avec la bonne clé

**Problème 2 : Zone sans terrains**
- L'application filtre à 20km autour de la position
- Si vous simulez une position en plein océan ou dans un désert, aucun terrain ne sera trouvé
- Les données mock doivent quand même s'afficher (protection implémentée)

**Problème 3 : Erreur de requête**
- Vérifier les logs de la console du navigateur (F12)
- Vérifier que les variables d'environnement sont bien configurées
- Vérifier que Supabase est accessible

### Le graphique ELO est vide

- Vérifier que la table `elo_history` existe
- Vérifier que des données sont présentes
- En mode démo, des données mock sont utilisées automatiquement

### La ville n'est pas détectée

- Vérifier que la géolocalisation est autorisée
- Vérifier la connexion internet (Nominatim nécessite une connexion)
- En cas d'échec, l'app utilise "Paris" par défaut

## 📝 Notes Techniques

- L'app fonctionne en mode "graceful degradation" : si Supabase n'est pas configuré, elle utilise les données mock
- Le reverse geocoding utilise Nominatim (gratuit, mais avec rate limiting)
- Les requêtes Supabase utilisent un bounding box simple (pas PostGIS pour le MVP)
- **Protection critique** : Les données mock ne sont jamais écrasées par une liste vide de Supabase

## 🚀 Prochaines Étapes

- [ ] Implémenter l'authentification Supabase
- [ ] Migrer `user_id` vers UUID (auth.users)
- [ ] Ajouter PostGIS pour requêtes géographiques optimisées
- [ ] Implémenter le cache des terrains (localStorage + Supabase)

## ⚠️ Erreurs Communes

### "La base est vide après le seed"

**Cause** : Utilisation de la clé ANON au lieu de SERVICE_ROLE

**Solution** : Utiliser la clé SERVICE_ROLE pour le script de seed. La clé ANON ne peut pas écrire dans Supabase à cause des restrictions RLS.

### "Cergy n'apparaît pas dans les résultats"

**Cause** : L'ancien script Overpass avait une bounding box qui excluait Cergy (longitude 2.03 vs limite 2.09)

**Solution** : Utiliser le nouveau script `seed_data_gouv.js` qui utilise l'API Data ES avec couverture nationale complète.

### "Les terrains disparaissent après le fetch Supabase"

**Cause** : L'app écrasait les données mock même si Supabase retournait une liste vide

**Solution** : Protection implémentée - les données mock ne sont écrasées que si Supabase retourne des résultats valides.
