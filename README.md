# StreetSignal 🏀

Application mobile ultra-simple permettant aux joueurs de basket partout en France — surtout dans les petites villes — de trouver en temps réel d'autres personnes pour jouer.

## 🎯 Concept

Au lieu d'événements compliqués, un bouton suffit : **"J'y suis"** ou **"J'arrive"**, ce qui génère des sessions instantanées et visibles autour de toi.

L'app se distingue en se concentrant sur :
- **L'hyper-local** : Focus sur les terrains proches
- **L'immédiateté** : Sessions en temps réel
- **Le jeu loisir** : Ambiance détendue et conviviale
- **Carte qualitative des terrains** : Informations détaillées sur chaque spot
- **Classement local** : "MVP du terrain" et leaderboard
- **Vibe Check** : Évaluation de l'ambiance en temps réel

## ✨ Fonctionnalités

### 🎮 Core Features

- **Live Radar** : Vue radar interactive des terrains actifs autour de toi
- **Carte Interactive** : Carte Leaflet avec tuiles dark mode (CartoDB Dark Matter)
- **Sessions instantanées** : Système "J'y suis" / "J'arrive" pour créer des sessions de jeu
- **Recherche avancée** : Recherche par nom, ville, quartier
- **Filtres intelligents** : Filtrage par éclairage, point d'eau, statut
- **Géolocalisation intelligente** : Calcul automatique des distances avec formule Haversine

### 🏆 Gamification

- **Système ELO** : Classement basé sur les matchs avec graphique Recharts
- **MVP du terrain** : Titre honorifique pour le joueur le plus actif sur un terrain
- **Leaderboard local** : Classement des joueurs par ville
- **Badges** : Récompenses pour différentes actions
- **Karma** : Monnaie virtuelle gagnée en aidant la communauté
- **Confettis** : Animation lors des victoires

### 📊 Statistiques & Profil

- **Profil détaillé** : Stats complètes (ELO, Karma, matchs, taux de victoire)
- **Graphique ELO** : Visualisation de l'évolution avec Recharts
- **Historique des matchs** : Tous tes matchs avec scores et évolution ELO
- **Terrains favoris** : Liste de tes terrains préférés
- **Statistiques avancées** : Graphiques et tendances

### 🎯 Vibe Check

- **Évaluation en temps réel** : Note l'ambiance du terrain (Compétition, Niveau, Convivialité, Intensité)
- **Historique des vibes** : Suivi de l'évolution de l'ambiance
- **Score de vibe** : Note globale visible par tous

### 💬 Social

- **Chat de terrain** : Communication avec les joueurs présents
- **Sessions actives** : Liste des joueurs en jeu ou en attente
- **Partage social** : Partage de terrains avec tes amis
- **Notifications** : Alertes pour les terrains hot, matchs, validations

### 🛍️ Shop & Récompenses

- **Street Shop** : Échange ton Karma contre des récompenses
- **Partenariats B2B** : Offres exclusives (Decathlon, Nike, etc.)
- **Partenariats B2G** : Signalements de maintenance pour les mairies avec génération de tickets

### 🛠️ Maintenance & Signalement

- **Signalement de problèmes** : Aide la communauté et gagne du Karma
- **Partenariat Smart City** : Tes signalements aident les mairies à prioriser les réparations
- **Génération de tickets** : Numéro de ticket Mairie automatique

### 🎨 UX/UI Premium

- **Animations Framer Motion** : Micro-interactions fluides et engageantes
- **Feedback haptique** : Vibrations sur interactions clés
- **Skeleton Loading** : Chargement élégant avec placeholders
- **Onboarding contextuel** : 3 écrans d'introduction avec détection automatique de la ville
- **Screen shake** : Animation lors des victoires
- **Transitions** : Animations entre onglets

## 🚀 Technologies

- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Styling moderne et responsive
- **Lucide React** : Icons modernes
- **Leaflet & React-Leaflet** : Carte interactive avec OpenStreetMap
- **Framer Motion** : Animations fluides
- **Recharts** : Graphiques professionnels
- **Supabase** : Backend as a Service (base de données)
- **Canvas Confetti** : Gamification visuelle
- **PWA Ready** : Prêt pour installation mobile

## 📱 Installation & Développement

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Un projet Supabase (optionnel, l'app fonctionne en mode mock sans)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement (optionnel)
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase
```

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

### Configuration Supabase (Optionnel)

Voir le guide complet dans [MIGRATION_SUPABASE.md](./MIGRATION_SUPABASE.md)

1. Créer un projet Supabase
2. Exécuter les migrations SQL dans `supabase/migrations/`
3. Configurer `.env.local` avec vos clés
4. (Optionnel) Importer les terrains avec `node supabase/seed_overpass.js`

## 🎨 Design

L'application utilise un design dark mode moderne avec :
- Palette de couleurs : Slate (dark) + Orange/Red (accents)
- Animations fluides et transitions
- UI mobile-first optimisée pour le tactile
- Scrollbars personnalisées
- Carte dark mode (CartoDB Dark Matter)

## 📋 Roadmap

### ✅ Implémenté
- [x] Système de signalement "J'y suis" / "J'arrive"
- [x] Vue Radar, Liste et **Carte interactive** (Leaflet)
- [x] Système de Vibe Check
- [x] Chat de terrain
- [x] Déclaration de matchs (ELO)
- [x] Leaderboard local
- [x] Profil avec statistiques
- [x] Système de favoris
- [x] Recherche de terrains
- [x] Sessions actives
- [x] Photos de terrains
- [x] Partage social
- [x] Shop avec Karma
- [x] **Tutoriel guidé pas à pas**
- [x] **Géolocalisation réelle**
- [x] **Système MVP** (remplace "Maire")
- [x] **Persistance avec localStorage**
- [x] **Animations Framer Motion**
- [x] **Onboarding contextuel**
- [x] **Graphique ELO avec Recharts**
- [x] **Intégration Supabase** (optionnel)

### 🚧 À venir
- [ ] Authentification utilisateur (Supabase Auth)
- [ ] Backend API (temps réel avec WebSockets)
- [ ] Notifications push
- [ ] Upload de photos
- [ ] Système de vérification de photos
- [ ] Heatmap visuelle
- [ ] Clustering de marqueurs
- [ ] Mode hors-ligne
- [ ] Export de statistiques
- [ ] PWA complète

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Made with ❤️ for the French basketball community**
