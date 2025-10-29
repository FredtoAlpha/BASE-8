# CORRECTIONS OBLIGATOIRES – Module de création des groupes

## 1. Constat d'ergonomie et de workflow
- **Barre d'actions surchargée** : l'étape 5 aligne huit boutons d'action, dont trois variantes d'export et deux actions de sauvegarde, sans hiérarchie ni séparation claire. Un utilisateur non expert se retrouve face à un "pavé" de choix qui mélange régénération, exports et opérations critiques de sauvegarde/finalisation, ce qui rend le parcours peu naturel.【F:groupsModuleComplete.html†L1031-L1070】
- **Espace de statistiques envahissant** : l'interface réserve la moitié de la largeur aux statistiques dès que `state.showStatistics` est actif, réduisant d'autant la zone de glisser-déposer pourtant centrale. Cette disposition va à l'encontre de l'objectif principal (manipuler les élèves) et justifie une limitation explicite à un tiers, voire un panneau escamotable avec poignée de redimensionnement.【F:groupsModuleComplete.html†L1076-L1084】
- **Étape 2 trop basique** : la sélection des classes se limite à cocher des cases. Il n'existe aucune notion de "regroupement" permettant de dire "6°1 + 6°2 + 6°3 → 3 groupes" puis "6°4 + 6°5 → 4 groupes". Sans ce modèle, l'utilisateur ne peut pas préparer plusieurs passes sur un même niveau ni comprendre comment elles seront restituées.【F:groupsModuleComplete.html†L624-L700】
- **Absence de visualisation des passes** : une fois des groupes générés, la numérotation repart systématiquement à `Groupe 1`, sans indicateur de continuation ni possibilité de choisir le regroupement affiché. L'utilisateur ne sait pas s'il travaille sur la passe 1 ou 2, ni quels groupes seront écrasés.【F:groupsModuleComplete.html†L1101-L1109】

## 2. Corrections UI obligatoires
1. **Repenser l'étape 2 autour des regroupements**
   - Introduire une zone "Regroupements" où l'utilisateur compose des ensembles de classes (ex. `Regroupement A = 6°1 + 6°2`, `Regroupement B = 6°3 + 6°5`).
   - Pour chaque regroupement, demander le nombre de groupes à produire et un libellé libre ("Passe 1", "Passe 2"...).
   - Permettre de conserver des regroupements non utilisés immédiatement (cases actives/inactives) afin que l'utilisateur prépare plusieurs passes avant génération.
2. **Navigation claire entre les passes**
   - À l'étape 5, remplacer la liste plate de colonnes par un sélecteur de regroupement (pills ou onglets) : l'utilisateur choisit "Regroupement 1" ou "Regroupement 2" pour afficher les groupes concernés.
   - Ajouter un bandeau "Mode continuation" indiquant la plage de numéros utilisée (ex. `Groupes 4 à 7`) lorsque l'on ajoute une passe supplémentaire.
3. **Hiérarchiser la barre d'actions**
   - Séparer visuellement les actions "Calcul" (Regénérer, Statistiques) des actions "Sauvegarde" (Temp, Finaliser) et des "Exports" (PDF, CSV) ; utiliser des groupes de boutons avec intitulés clairs ou un menu déroulant pour les exports.
   - Introduire un bouton spécifique "Nouvelle passe" qui bascule l'UI en mode ajout et verrouille les actions destructives tant que la passe n'est pas confirmée.
4. **Redimensionnement de la zone statistiques**
   - Limiter par défaut le panneau statistique à un tiers de la largeur et ajouter une poignée (drag) pour l'élargir au besoin.
   - Prévoir un mode "plein écran" temporaire pour consulter le dashboard sans bloquer la manipulation des élèves.
5. **Indicateurs pédagogiques visibles**
   - Afficher dans chaque carte de groupe : libellé du regroupement, plage de numéros, compte filles/garçons et rappel du critère (Besoin, LV2...).
   - Mettre en avant les alertes (déséquilibre, LV2 manquante) directement dans la carte, avec des couleurs cohérentes.

## 3. Corrections moteur obligatoires
1. **Persistance multi-passes réelle**
   - Stocker dans Apps Script les regroupements, numéros de groupes et offsets dans `PropertiesService` ou une feuille dédiée au lieu de purger systématiquement les onglets `TEMP`.【F:Code.js†L2535-L2629】
   - Lors d'une nouvelle passe, détecter la première place libre (`grBe4TEMP` par exemple) et numéroter à partir de cet offset plutôt que de repartir à 1.
2. **Finalisation non destructive**
   - Adapter `finalizeTempGroups` pour renommer uniquement les onglets correspondant au regroupement en cours et laisser intacts les groupes finalisés précédemment, au lieu de supprimer toutes les feuilles du préfixe.【F:Code.js†L2932-L2997】
   - Ajouter un mécanisme de rollback si la finalisation échoue (restauration des snapshots ou annulation de la série).
3. **Gestion structurée des regroupements**
   - Étendre le payload envoyé par l'UI : `regroupements = [{ id, label, classes, groupCount, offsetStart }]`.
   - L'Apps Script doit créer des onglets nommés par regroupement (`grBeA1TEMP`, `grBeB1TEMP`…) ou par plage (`grBe4TEMP`). L'objectif est que l'utilisateur puisse retrouver clairement ses passes.
4. **Filtres cohérents selon le type**
   - Appliquer dès le chargement les filtres LV2/Options pour éviter que des regroupements mélangent des élèves hors périmètre ; sinon les passes perdent leur cohérence pédagogique.
5. **Journalisation lisible côté interface**
   - Lier l'historique des snapshots à chaque regroupement pour afficher : date, classes concernées, numéros utilisés et auteur. Cela sécurise la production multi-jours.

## 4. Workflow cible recommandé
1. L'utilisateur définit tous ses regroupements à l'étape 2 (ex. Passe A = 6°1+6°2, 3 groupes ; Passe B = 6°3+6°5, 4 groupes).
2. À l'étape 3, il configure les paramètres communs ou spécifiques par regroupement (matière, distribution, LV2).
3. À l'étape 4, il vérifie l'aperçu filtré par regroupement.
4. À l'étape 5, il sélectionne un regroupement, génère les groupes correspondants puis les ajuste en drag & drop.
5. Il sauvegarde en TEMP avec offset automatique, vérifie dans le bandeau que la plage `Groupes 4-7` est bien réservée, puis finalise sans perdre la passe précédente.

## 5. Priorisation
1. **Implémenter la structure de regroupements (UI + payload + persistance)** : condition sine qua non pour un workflow multi-passes compréhensible.
2. **Revoir la barre d'actions et le mode continuation** : réduire la charge cognitive et sécuriser les opérations critiques.
3. **Réduire/ajustar le panneau statistiques** : la manipulation des élèves doit redevenir centrale.
4. **Renforcer la persistance Apps Script** : offsets, finalisation sélective, rollback.

Ces corrections sont indispensables pour livrer un moteur d'UI réellement exploitable par un utilisateur lambda et permettre la fabrication de groupes en plusieurs passes sur un même niveau.
