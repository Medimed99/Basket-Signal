# Installation de StreetSignal

## Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

## Installation des dépendances

```bash
npm install
```

Cela installera toutes les dépendances nécessaires, y compris :
- React 18
- Vite
- Tailwind CSS
- Leaflet & React-Leaflet (pour la carte interactive)
- Lucide React (icônes)

## Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou le port indiqué par Vite).

## Build pour production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

## Preview du build

```bash
npm run preview
```

## Notes importantes

### Leaflet

Si vous rencontrez des problèmes avec les icônes Leaflet, assurez-vous que les fichiers CSS sont bien importés dans `src/index.css` et que les images sont correctement référencées.

### Tutoriel

Le tutoriel s'affichera automatiquement lors du premier lancement. Pour le réinitialiser, supprimez la clé `streetsignal_tutorial_completed` du localStorage de votre navigateur.

### Géolocalisation

L'application tentera d'utiliser la géolocalisation du navigateur. Si celle-ci n'est pas disponible, la position par défaut sera Nantes (47.2186, -1.5547).

## Structure du projet

```
streetsignal/
├── src/
│   ├── components/
│   │   ├── MapView.jsx      # Composant carte Leaflet
│   │   └── Tutorial.jsx     # Système de tutoriel guidé
│   ├── App.jsx              # Composant principal
│   ├── main.jsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── index.html
├── package.json
└── vite.config.js
```

