# Plan Tracer

Outil web de tracé de plans pour la construction modulaire en ossature bois. Permet aux commerciaux de retranscrire des plans architecturaux en traçant des éléments constructifs (murs, cloisons, menuiseries) et d'exporter un fichier JSON pour Revit.

## 🎯 Fonctionnalités

### Import de plans
- ✅ Import de fichiers PDF (première page convertie en image)
- ✅ Import d'images (PNG, JPG)
- ⚠️ Fichiers DWG : conversion préalable en PDF requise

### Calibration et grille
- ✅ Calibration de l'échelle en deux clics
- ✅ Grille paramétrable avec espacement personnalisable
- ✅ Préréglages pour trames modulaires (1.20m, 0.60m, etc.)
- ✅ Magnétisme sur la grille (snap to grid)

### Outils de tracé
- ✅ **Murs/Cloisons** : tracé de segments avec détection automatique des intersections (V2)
- ✅ **MEX** (Menuiseries extérieures) : placement de fenêtres, portes, baies vitrées
- ✅ **Tags de pièces** : annotation des zones

### Bibliothèque d'éléments
- ✅ Bibliothèque configurable via JSON
- ✅ Éléments pour ossature bois : murs (145mm, 120mm, 200mm), cloisons, menuiseries
- ✅ Filtres par catégorie
- ✅ Propriétés techniques (épaisseur, résistance thermique, etc.)

### Quantitatifs
- ✅ Calcul automatique en temps réel
- ✅ Métrés linéaires par type de mur/cloison
- ✅ Comptage des menuiseries par type

### Export
- ✅ Export JSON pour intégration Revit
- ✅ Structure claire avec coordonnées en mètres
- ✅ Métadonnées projet (nom, date, échelle)

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm

### Installation des dépendances

```bash
npm install
```

## 💻 Lancement

### Mode développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

### Preview du build
```bash
npm run preview
```

## 📖 Guide d'utilisation

### 1. Import d'un plan

1. Cliquez sur **"📁 Importer plan"** dans le header
2. Sélectionnez un fichier PDF ou image
3. Le plan s'affiche en fond de canvas

### 2. Calibration de l'échelle

1. Cliquez sur **"Calibration"** dans la barre d'outils (ou appuyez sur `C`)
2. Cliquez sur deux points de référence sur le plan dont vous connaissez la distance
3. Saisissez la distance réelle en mètres
4. Validez → l'échelle est calibrée ✓

### 3. Configuration de la grille

Dans le panneau **"Paramètres de la grille"** :
- Activez/désactivez l'affichage de la grille
- Activez le magnétisme (snap to grid)
- Choisissez l'espacement principal (ex: 1.20m)
- Optionnel : ajoutez une subdivision (ex: 0.60m)
- Utilisez les préréglages pour les trames courantes

### 4. Sélection d'éléments dans la bibliothèque

Dans le panneau de droite **"Bibliothèque"** :
- Filtrez par catégorie (Murs, Cloisons, Menuiseries)
- Cliquez sur un type d'élément pour le sélectionner
- Les propriétés s'affichent en bas du panneau

### 5. Tracé d'éléments

**Murs et cloisons** (raccourci `W`) :
1. Sélectionnez un type de mur dans la bibliothèque
2. Activez l'outil "Mur/Cloison"
3. Cliquez pour définir le point de départ
4. Déplacez la souris (le segment suit)
5. Cliquez pour terminer le segment
6. Les intersections avec d'autres murs sont détectées automatiquement

**Menuiseries** (raccourci `M`) :
1. Sélectionnez un type de menuiserie
2. Activez l'outil "MEX"
3. Cliquez pour placer la menuiserie

**Tags de pièces** (raccourci `T`) :
1. Activez l'outil "Tag pièce"
2. Cliquez à l'emplacement souhaité
3. Saisissez le nom de la pièce
4. Le tag s'affiche sur le plan

### 6. Visualisation des quantitatifs

Le panneau inférieur **"Quantitatifs"** affiche en temps réel :
- Les métrés linéaires par type de mur/cloison
- Le nombre de menuiseries par type
- Les totaux

### 7. Export JSON

1. Cliquez sur **"💾 Exporter JSON"**
2. Le fichier JSON est téléchargé
3. Il contient :
   - Métadonnées (nom projet, date, échelle)
   - Liste des murs avec coordonnées en mètres
   - Liste des menuiseries
   - Tags de pièces
   - Quantitatifs calculés

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| `V` | Outil Sélection |
| `W` | Outil Mur/Cloison |
| `M` | Outil MEX |
| `T` | Outil Tag pièce |
| `C` | Outil Calibration |
| `H` | Outil Déplacer (pan) |
| `Esc` | Retour à Sélection |

## 🏗 Stack technique

- **Frontend** : React 18 + TypeScript
- **Canvas** : Fabric.js (manipulation d'objets 2D)
- **PDF** : PDF.js (rendu de PDF en image)
- **State** : Zustand (gestion d'état légère)
- **Build** : Vite (bundler rapide)

## 📁 Structure du projet

```
src/
  ├── components/
  │   ├── Canvas/           # Composant canvas principal (Fabric.js)
  │   ├── Toolbar/          # Barre d'outils
  │   ├── LibraryPanel/     # Panneau bibliothèque
  │   ├── QuantityPanel/    # Panneau quantitatifs
  │   ├── ScaleCalibration/ # Calibration échelle
  │   └── GridSettings/     # Paramètres grille
  ├── store/
  │   └── useStore.ts       # Store Zustand global
  ├── types/
  │   └── index.ts          # Types TypeScript
  ├── utils/
  │   ├── geometry.ts       # Utilitaires géométriques
  │   └── fileImport.ts     # Import PDF/images
  ├── data/
  │   └── library.json      # Bibliothèque d'éléments
  ├── App.tsx               # Composant principal
  └── main.tsx              # Point d'entrée
```

## 🔧 Configuration de la bibliothèque

Modifiez `src/data/library.json` pour ajouter ou modifier des types d'éléments :

```json
{
  "elements": [
    {
      "id": "MUR_OSS_145",
      "name": "Mur ossature bois 145mm",
      "category": "mur",
      "thickness": 0.145,
      "color": "#2C3E50",
      "metadata": {
        "description": "Mur extérieur ossature bois 145mm",
        "resistance": "R=3.8 m².K/W"
      }
    }
  ]
}
```

## 📄 Format JSON d'export

```json
{
  "metadata": {
    "name": "Projet exemple",
    "date": "2025-01-15T10:30:00.000Z",
    "scale": {
      "pixelsPerMeter": 150.5,
      "isCalibrated": true
    }
  },
  "walls": [
    {
      "id": "wall_001",
      "typeId": "MUR_OSS_145",
      "start": { "x": 0, "y": 0 },
      "end": { "x": 3.6, "y": 0 }
    }
  ],
  "mex": [
    {
      "id": "mex_001",
      "typeId": "MEX_FENETRE_125x100",
      "position": { "x": 1.8, "y": 0 },
      "rotation": 0
    }
  ],
  "roomTags": [
    {
      "id": "tag_001",
      "label": "Salon",
      "position": { "x": 2.0, "y": 2.0 }
    }
  ],
  "quantities": {
    "walls": {
      "MUR_OSS_145": 14.4
    },
    "mexCount": {
      "MEX_FENETRE_125x100": 2
    }
  }
}
```

## 🐛 Dépannage

### Le PDF ne s'affiche pas
- Vérifiez que le fichier PDF n'est pas corrompu
- Essayez de convertir le PDF en image avec un outil externe

### Les murs ne se tracent pas
- Vérifiez qu'un type de mur est sélectionné dans la bibliothèque
- Assurez-vous que l'outil "Mur/Cloison" est actif

### L'échelle n'est pas correcte
- Recalibrez en utilisant une cote connue sur le plan
- Vérifiez que vous avez bien saisi la distance en mètres

## 📝 Licence

MIT

## 👥 Support

Pour toute question ou problème, créez une issue sur le repository.
