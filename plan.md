# 🚀 Prompt de Développement Final pour frise.chezmehdi.net

## Contexte

Finaliser une application web statique interactive permettant de générer des timelines depuis des tableurs en ligne (Google Sheets et Framacalc). Application accessible sur :

[https://frise.chezmehdi.net](https://frise.chezmehdi.net)

## Objectif Global

Créer une application web fluide, interactive, sécurisée, et facilement partageable avec une excellente expérience utilisateur.

---

## ✅ Spécifications détaillées à respecter

### 1. Interface utilisateur

* Page d'accueil avec champ de saisie pour l’URL du tableur.
* Validation immédiate de l’URL avec prévisualisation.
* Timeline interactive générée automatiquement.
* Navigation fluide et réactive.
* Interface responsive (desktop, tablette, mobile).

### 2. Types de marqueurs chronologiques

* Événement contextuel (ponctuel, contexte)
* Événement déclencheur (ponctuel, action)
* Période contextuelle (plage, contexte)
* Période d'activité (plage, action)

### 3. Structure des données

Tableur avec ces colonnes précises :

* **Type** (`événement_contextuel`, `événement_déclencheur`, `période_contextuelle`, `période_activité`)
* **Date\_début** (format ISO `YYYY-MM-DD` ou timestamp)
* **Date\_fin** (identique à Date\_début pour événements ponctuels)
* **Titre** (texte)
* **Style\_titre** (classes CSS ou JSON styles)
* **Description** (HTML, embed vidéo supporté)
* **Style\_description** (classes CSS)
* **URL\_partage** (ancre unique)

### 4. Fonctionnalités de partage

* URL directe avec ancres (ex : `#event-123`, `#period-456`)
* Bouton copie de lien direct pour chaque marqueur
* Navigation directe via ancres dans l’URL

---

## 🗂 Plan de Travail Final

### 🔧 Phase 1 (Fait)

* Dépôt GitLab
* Cloudflare Pages configuré
* Projet initialisé (Vite recommandé)

### 🎨 Phase 2 : UI Finalisée

* Finaliser page d'accueil
* Validation et gestion des erreurs d'URL
* Design responsive (CSS moderne)
* Micro-interactions agréables (animations discrètes)

### 📡 Phase 3 : Connexion aux Données

* API Google Sheets v4 publique intégrée
* Parser Framacalc opérationnel
* Validation robuste avec Joi/Yup
* Messages d’erreurs précis pour utilisateur

### 📅 Phase 4 : Timeline Interactif

* Utiliser Vis.js Timeline (préféré) ou D3.js
* Différenciation visuelle claire des 4 types de marqueurs
* Intégration HTML complète dans les descriptions
* Styles personnalisés par type via CSS

### 🔗 Phase 5 : Navigation & Partage

* Implémentation complète du système d’ancres
* Navigation directe via URL
* Zoom et défilement fluide
* Boutons de copie URL optimisés UX

### 🎬 Phase 6 : Multimédia et Embeds

* Support embeds vidéo (YouTube, Vimeo)
* Sécurisation du rendu HTML utilisateur
* Chargement optimisé (lazy loading recommandé)

### ⚡️ Phase 7 : Optimisation

* Mise en cache locale des données chargées
* Optimisation du chargement initial (<3s pour 100 lignes)
* Tests cross-browser complets (Chrome, Firefox, Safari, Edge)
* Documentation claire utilisateur finale

### 🚀 Phase 8 : Tests & Déploiement

* Tests end-to-end (E2E) robustes
* Tests de charge (tableurs importants)
* Validation multi-appareils (mobile, tablette, desktop)
* Déploiement final via Cloudflare Pages
* Monitoring post-déploiement opérationnel

---

## 🛠 Stack technique recommandée

* **Frontend** : Vue.js 3 (recommandé) ou Vanilla JS (ES6+)
* **CSS** : CSS moderne, variables personnalisées
* **Timeline** : Vis.js Timeline (prioritaire) ou D3.js
* **Bundler & Build** : Vite
* **Déploiement** : GitLab CI/CD + Cloudflare Pages
* **Validation** : Joi ou Yup

---

## 🎯 Critères de réussite impératifs

* Fonctionnement sans faille avec URL des tableurs
* Chargement performant (<3 secondes, 100 lignes)
* Compatibilité cross-browser
* Responsivité parfaite
* Sécurisation stricte du contenu utilisateur
* UX intuitive et partage simple

---

## 📝 Livrables finaux à fournir

* Code complet (GitLab)
* Pipeline CI/CD opérationnel
* Application en ligne fonctionnelle et validée
* Documentation utilisateur claire

---

🚦 **Action immédiate** : Lance immédiatement cette tâche, fournis un suivi hebdomadaire des avancées et livre chaque phase avec un rapport clair des validations effectuées.

Bon développement ! 🎉
