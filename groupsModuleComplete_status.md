# Status du Module groupsModuleComplete.html

**État actuel**: ⚠️ **DÉMONSTRATIF / PRE-PRODUCTION**

Ce document clarifie le périmètre actuel du module et les éléments critiques à finaliser avant un passage en production.

---

## 📋 Périmètre Actuel

### ✅ Implémenté et Fonctionnel

#### 1. Gestion Multi-Vagues (Continuité)
- **Toggle Replace/Append** : Choix entre remplacer ou ajouter une vague
- **Détection TEMP** : Identification automatique des groupes TEMP existants
- **Dialog Continuation** : Popup de choix pour continuer ou redémarrer une série
- **Offset Dynamique** : Calcul et application du numéro de départ pour la nouvelle vague
- **Numérotation Persistante** : Les groupes affichent le bon numéro (Groupe 4, 5, 6... pas 1, 2, 3...)
- **Bandeau Visuel** : Affichage d'une zone bleue "MODE CONTINUATION ACTIF" avec range précédent et prochain

**Limitations** :
- ⚠️ La persistance des offsets dépend entièrement de l'état JS en session
- ⚠️ Rechargement de page = perte de `state.lastTempRange` et `state.tempOffsetStart`
- ⚠️ Pas d'historique sauvegardé en base (le cas "revenir 30 min plus tard" n'est pas supporté)

#### 2. Filtrage par Spécialisation
- **Filtrage LV2** : Les élèves sont filtrés par langue vivante (ESP, ITA, etc.) quand `groupType='language'`
- **Structure Option** : Infrastructure en place pour filtrer par option (OPT) - module futur
- **Logs de Debug** : Console affiche les réductions ("Filtre LV2 appliqué: 120 → 45 élèves")

**Limitations** :
- ⚠️ Filtre appliqué APRÈS chargement (pas de pré-filtrage à la source)
- ⚠️ Pas de UI pour sélectionner/confirmer le filtre appliqué
- ⚠️ Pas de statistiques pré/post filtre visibles à l'utilisateur

#### 3. Gestion Quota Google Sheets
- **Calcul Réaliste** : `totalCells_()` utilise `getLastRow() × getLastColumn()` (cellules utilisées, pas allouées)
- **Shrinking Automatique** : Les onglets de groupe sont réduits aux dimensions strictement nécessaires
- **Avoidance Pré-détection** : `willExceedCapForNewSheets_()` vérifie avant création

**Limitations** :
- ⚠️ Pas de gestion "soft limit" (alerte avant 8M cellules)
- ⚠️ Pas de compression ou archivage automatique
- ⚠️ Pas de migration vers plusieurs spreadsheets quand limite approchée

#### 4. Interface Utilisateur
- **5 Étapes Guidées** : Sélection type → classes → groupes → génération → visualisation
- **Responsive Grid** : Adaptation du nombre de colonnes (1, 2 ou 3) selon le nombre de groupes
- **Cartes Élèves** : Affichage complet (ID, nom, prénom, sexe, classe, scores F/M, comportements, LV2, SOURCE)
- **Drag-Drop Reordering** : Réorganisation des élèves entre groupes via SortableJS

**Limitations** :
- ⚠️ Pas de prévisualisation PDF avant finalisation
- ⚠️ Export CSV basique (pas de mapping personnalisé)
- ⚠️ Statistiques non implémentées (bouton stub)
- ⚠️ Pas de comparaison vague précédente ↔ vague courante

---

## 🚨 Chantiers Critiques Avant Production

### 1. **Persistance Multi-Vagues Robuste** (🔴 CRITIQUE)

#### Problème
Actuellement, l'offset et l'historique de continuation sont stockés **en mémoire JS uniquement** :
- Rechargement page = perte totale
- Fermeture du navigateur = perte totale
- Reprise 30 min plus tard impossible

#### Solution Requise
```javascript
// Backend (Code.js)
function saveContinuationMetadata(type, metadata) {
  // Sauvegarder dans PropertiesService ou feuille '_META'
  // metadata = { lastOffset, lastRange, timestamp, user }
}

function loadContinuationMetadata(type) {
  // Récupérer état de continuation persistant
}

// Frontend (groupsModuleComplete.html)
// Au chargement: charger depuis server au lieu de chercher juste les TEMP
```

**Impact** : Bloquant pour workflow multi-jours

---

### 2. **Filtrage LV2/Options avec UI et Validation** (🔴 CRITIQUE)

#### Problème
- Filtre appliqué silencieusement sans confirmation utilisateur
- Pas de visibilité sur le nombre d'élèves avant/après
- Pas de possibilité de modifier le filtre après chargement

#### Solution Requise
```html
<!-- Ajouter après Étape 2 (sélection classes) -->
<div class="filter-confirmation">
  <p>Élèves chargés: <span id="before-filter">120</span></p>
  <p>Après filtre LV2:  <span id="after-filter">45</span></p>
  <label>
    <input type="checkbox" id="confirm-filter"> J'ai vérifiée le filtre
  </label>
</div>
```

**Impact** : Risque d'erreur pédagogique (élèves oubliés sans raison)

---

### 3. **Équilibrage Multi-Critères Robuste** (🟠 HAUTE)

#### Problème
Actuellement, l'algorithme de répartition utilise :
- Un seul critère de score (F ou M ou moyenne)
- Pas de pondération configurable
- Pas de respect de contraintes (parité, distribution par classe d'origine)

#### Solution Requise
```javascript
function generateGroupsWithOptimization(params) {
  // 1. Score composite : (F×0.3 + M×0.3 + COM×0.2 + PART×0.2)
  // 2. Contraintes :
  //    - ±1 élève par groupe (effectifs proches)
  //    - Parité F/M respectée (±1)
  //    - Distribution SOURCE équilibrée (pas >2 d'une même classe)
  // 3. Algorithme glouton avec échanges locaux
  // 4. Tableau de bord : écart-type par métrique
}
```

**Impact** : Groupes mal équilibrés = insatisfaction pédagogique

---

### 4. **Traçabilité et Audit Complet** (🟠 HAUTE)

#### Problème
- Pas d'historique des sauvegarde (qui, quand, quoi)
- Pas de versioning des groupes
- Impossible de "revenir en arrière" sur une finalisation

#### Solution Requise
```javascript
function logGroupOperation(operation, details) {
  // Écrire dans feuille '_AUDIT_LOG' :
  // Timestamp | Utilisateur | Opération | Type | NumGroupes | NbEleves | Détails
  // Ex: 2025-10-29 14:32 | teacher@school.fr | SAVE_TEMP | language | 3-5 | 145 | ESP
}

function createGroupSnapshot(type) {
  // Créer version "_v1_ESP", "_v2_ESP", etc.
  // Garder historique des 5 dernières versions
}
```

**Impact** : Conformité RGPD, responsabilité pédagogique

---

### 5. **Gestion des Erreurs et Rollback** (🟠 HAUTE)

#### Problème
- Finalization partiellement échouée = données corrompues
- Pas de possibilité d'annuler une opération
- Pas de validation pré-finalisation

#### Solution Requise
```javascript
function finalizeTempGroupsWithRollback(type, finalizeMode) {
  try {
    // Créer backup des sheets actuelles
    createBackup(type);

    // Tenter la finalisation
    finalizeTempGroups(type, finalizeMode);

    // Valider l'intégrité
    validateFinalizedGroups(type);
  } catch (e) {
    // Restaurer depuis backup
    restoreFromBackup(type);
    throw e;
  }
}
```

**Impact** : Éviter corruptions de données critiques

---

## 📊 Chantiers Moyens (À Faire Avant Premier Déploiement)

### 6. Statistiques Dashboard
- Écart-type des scores par groupe
- Distribution F/M par groupe
- Moyenne de participation par groupe
- Décompte par SOURCE (classe d'origine)

### 7. Export Avancé
- **PDF** : Prévisualisation avant export
- **CSV** : Mapping personnalisé des colonnes
- **Google Sheets** : Export direct dans document externe

### 8. Optimisation Performance
- Virtualisation des listes longues (>500 élèves)
- Indexation élèves par classe pour chargement rapide
- Cache des feuilles FIN pour rechargement sans latence

---

## 🔧 Chantiers Bas (Post-Production)

### 9. Options et Autres Spécialisations
- UI pour sélection option (actuellement stub)
- Règles de filtrage spécifiques à chaque option
- Module dédié aux options (comme specs l'indiquent)

### 10. Algorithme Avancé (Scoring Multi-Critères)
- Interface de configuration des poids
- Simulation avant finalisation
- Détection automatique du meilleur équilibre

### 11. Intégration avec Modules Voisins
- Liaison avec analytics (qui a reçu quel groupe)
- Synchronisation avec modules de composition (BEsoin, OPTion)
- Export vers planning ou emploi du temps

---

## ✅ Checklist Avant Production

- [ ] **1. Persistance multi-vagues** : Offset et historique sauvegardés en PropertiesService
- [ ] **2. Filtrage LV2/Options** : UI de confirmation + affichage avant/après
- [ ] **3. Équilibrage robuste** : Algorithme multi-critères + tableau dashboard
- [ ] **4. Traçabilité complète** : Feuille audit + versioning des groupes
- [ ] **5. Gestion erreurs** : Backup + rollback + validation pré-finalisation
- [ ] **6. Statistiques** : Dashboard avec écart-type, parité, distribution
- [ ] **7. Export avancé** : PDF, CSV personnalisé, Google Sheets
- [ ] **8. Tests complets** : 50 élèves, 200 élèves, cas limites quota
- [ ] **9. Documentation utilisateur** : Tutoriel, FAQ, troubleshooting
- [ ] **10. Permissions & Sécurité** : Validations utilisateur, protection données

---

## 📝 Résumé

| Domaine | État | Blocker? | Timeline |
|---------|------|----------|----------|
| **Sélection classes & groupes** | ✅ OK | Non | - |
| **Génération groupes basique** | ✅ OK | Non | - |
| **Continuation multi-vagues** | 🟡 Partiellement | **OUI** | 1-2 sprints |
| **Filtrage LV2/Options** | 🟡 Sans UI | **OUI** | 1 sprint |
| **Équilibrage robuste** | 🟡 Simple | **OUI** | 2 sprints |
| **Traçabilité audit** | ❌ Manquant | **OUI** | 1 sprint |
| **Statistiques** | ❌ Stub | Non | 1 sprint |
| **Export avancé** | ❌ Minimal | Non | 1 sprint |

---

## 🎯 Recommandation

**Le module est actuellement adapté pour** :
✅ Démonstration et POC
✅ Prototypage algorithmique
✅ Tests avec petits groupes (< 200 élèves)

**Ne pas utiliser en production pour** :
❌ Continuité pédagogique sérieuse (multi-jours)
❌ Groupes de plus de 500 élèves
❌ Contextes sensibles (RGPD, traçabilité obligatoire)

**Estimer 4-6 sprints pour atteindre production-ready**.

---

**Dernière mise à jour** : 2025-10-29
**Responsable** : Module groupsModuleComplete.html
**Prochaine revue** : Après implémentation chantier #1
