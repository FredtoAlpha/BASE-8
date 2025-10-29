# GROUPS FINAL

## 1. Ce que vous voyez à l'écran

### A. Barre supérieure (étapes 1 à 5)
- **Étape 1 – Mode** : choisissez le type de groupe (Brassage, Langue, Options).
- **Étape 2 – Classes** : cochez les classes dont les élèves doivent être pris en compte.
- **Étape 3 – Paramètres** : définissez le nombre de groupes, la stratégie (aléatoire, homogène, hétérogène) et la note de référence.
- **Étape 4 – Aperçu** : vérifiez la liste des élèves détectés avant génération.
- **Étape 5 – Groupes générés** : écran principal avec les colonnes par groupe, les boutons d'action et les statistiques.

### B. Zone centrale (colonnes violettes)
- Chaque colonne correspond à un groupe.
- Les cartes élèves peuvent être glissées-déposées pour rééquilibrer manuellement les groupes.
- Le bandeau de chaque carte rappelle le score normalisé (0-20), la LV2, la classe d'origine et les indicateurs COM/TRA/PART/ABS.

### C. Bandeau d'actions (boutons au-dessus des colonnes)
- **Regénérer les groupes** : relance le calcul avec les paramètres courants.
- **Sauver en TEMP** : envoie les groupes au script Apps Script pour créer des onglets `TEMP`.
- **Finaliser** : remplace les onglets définitifs (`grBe1`, `grBe2`, …) par la version courante.
- **Export PDF / Export CSV** : boutons présents mais sans logique complète dans le dépôt actuel.
- **Charger les TEMP** : relit les onglets `TEMP` existants et recharge l'interface.

### D. Panneau de droite (statistiques)
- Affiche le nombre total d'élèves, la moyenne du score choisi et la répartition F/M.
- Le tableau récapitule, par groupe, la moyenne, l'écart-type et les compteurs F/M.
- Les indicateurs « Les indicateurs ne sont pas appliqués » signalent que les filtres LV2/Options ne sont pas encore actifs.

## 2. Workflow actuellement possible (une seule passe)
1. Sélectionnez le type de groupe et les classes, configurez les paramètres puis cliquez sur « Générer ».
2. Ajustez manuellement si besoin (drag & drop).
3. Cliquez sur **Sauver en TEMP** pour créer les onglets temporaires.
4. Contrôlez que les groupes vous conviennent puis cliquez sur **Finaliser** pour remplacer l'ancienne série.

Ce flux fonctionne pour créer **une** série de groupes à la fois.

## 3. Pourquoi les passes successives ne fonctionnent pas
1. **Purge automatique des TEMP** : chaque sauvegarde commence par supprimer **tous** les onglets `TEMP` du même préfixe (`grBe`, `grLv`, `grOp`). Dès que vous relancez une génération pour le même type, vos groupes précédents sont effacés.
2. **Finalisation destructive** : le script efface aussi les onglets définitifs existants avant de renommer les `TEMP`. Finaliser une seconde vague écrase donc la première.
3. **Numérotation réinitialisée** : l'interface renomme les colonnes `Groupe 1…N` à chaque calcul. Il n'existe aucun offset ni message indiquant que vous continuez une série déjà commencée.

Résultat : il est impossible, dans l'état actuel du code, de réaliser 2 ou 3 passes successives sur le même niveau sans écraser la passe précédente.

## 4. Ce qu'il faudrait ajouter pour un workflow multi-passes
1. **Mode « Continuer la série »**
   - Bouton ou option dans l'UI pour signaler que la sauvegarde doit ajouter des groupes à ceux déjà présents.
   - L'Apps Script doit conserver les onglets `TEMP` existants, détecter le dernier index (`grBe7TEMP`, etc.) et numéroter la nouvelle vague en conséquence.
2. **Finalisation non destructive**
   - Variante de finalisation qui renomme uniquement les nouveaux `TEMP` sans supprimer les onglets définitifs déjà existants.
3. **Indicateur visuel d'offset**
   - Afficher en haut de l'écran un bandeau « Mode continuation : prochains groupes à partir du n° 4 ».
   - Nommer les colonnes `Groupe 4`, `Groupe 5`, etc. lorsque l'on poursuit la série.
4. **Historique clair**
   - Tableau listant les vagues déjà sauvegardées (date, numéro de début/fin) pour vérifier qu'on travaille sur la bonne plage.

Sans ces évolutions, l'interface reste limitée à une démonstration en une seule passe.

## 5. Recommandation immédiate
- **Usage production :** déconseillé tant que les trois verrous ci-dessus ne sont pas levés.
- **Usage démonstration / POC :** possible en suivant le workflow « une vague → finaliser → exporter ».
- **Pour plusieurs classes (ex. 6°1 à 6°5)** : regrouper tous les élèves dans une seule génération et créer directement les 7 groupes nécessaires, ou bien attendre l'ajout du mode « continuation » avant de travailler en plusieurs passes.

---
Dernière mise à jour : 2025-10-29
