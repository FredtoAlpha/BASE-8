/**************************** MENU GOOGLE SHEETS *********************************/

/**
 * Crée le menu personnalisé lors de l'ouverture du fichier
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Menu principal
  ui.createMenu('🎓 Répartition Classes')
    .addItem('📊 Dashboard', 'showDashboard')
    .addSeparator()
    .addItem('⚙️ Configuration Optimisation', 'showOptimizationPanel')
    .addItem('🎯 Lancer Optimisation', 'showOptimizationPanel')
    .addSeparator()
    .addItem('👥 Interface Répartition V2', 'showInterfaceV2')
    .addSeparator()
    .addItem('📈 Analytics & Statistiques', 'showAnalytics')
    .addItem('👥 Groupes de Besoin', 'showGroupsModule')
    .addSeparator()
    .addItem('📄 Finalisation & Export', 'showFinalisationUI')
    .addSeparator()
    .addItem('🔧 Paramètres Avancés', 'showAdvancedSettings')
    .addItem('📋 Logs Système', 'showSystemLogs')
    .addToUi();
  
  // Menu LEGACY (Pipeline complet : Sources → TEST)
  ui.createMenu('⚙️ LEGACY Pipeline')
    .addItem('📋 Voir Classes Sources (6°1, 6°2...)', 'legacy_viewSourceClasses')
    .addItem('⚙️ Configurer _STRUCTURE', 'legacy_openStructure')
    .addSeparator()
    .addItem('▶️ Créer Onglets TEST (Pipeline Complet)', 'legacy_runFullPipeline')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Phases Individuelles')
      .addItem('🎯 Phase 1 - Options & LV2', 'legacy_runPhase1')
      .addItem('🔗 Phase 2 - ASSO/DISSO', 'legacy_runPhase2')
      .addItem('⚖️ Phase 3 - Effectifs & Parité', 'legacy_runPhase3')
      .addItem('🔄 Phase 4 - Équilibrage Scores', 'legacy_runPhase4'))
    .addSeparator()
    .addItem('📊 Voir Résultats TEST', 'legacy_viewTestResults')
    .addToUi();
}

/**
 * Affiche le dashboard principal
 */
function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(1400)
    .setHeight(800)
    .setTitle('📊 Dashboard - Répartition Classes');
  SpreadsheetApp.getUi().showModalDialog(html, 'Dashboard');
}

/**
 * Affiche le panneau de configuration de l'optimisation
 */
function showOptimizationPanel() {
  const html = HtmlService.createHtmlOutputFromFile('OptimizationPanel')
    .setWidth(1400)
    .setHeight(900)
    .setTitle('⚙️ Configuration & Optimisation');
  SpreadsheetApp.getUi().showModalDialog(html, 'Optimisation');
}

/**
 * Affiche l'interface de répartition V2
 */
function showInterfaceV2() {
  const html = HtmlService.createHtmlOutputFromFile('InterfaceV2')
    .setWidth(1600)
    .setHeight(900)
    .setTitle('👥 Interface Répartition V2');
  SpreadsheetApp.getUi().showModalDialog(html, 'Répartition V2');
}

/**
 * Affiche le module Analytics
 */
function showAnalytics() {
  const html = HtmlService.createHtmlOutputFromFile('Analytics')
    .setWidth(1400)
    .setHeight(800)
    .setTitle('📈 Analytics & Statistiques');
  SpreadsheetApp.getUi().showModalDialog(html, 'Analytics');
}

/**
 * Affiche le module Groupes de Besoin
 */
function showGroupsModule() {
  const html = HtmlService.createHtmlOutputFromFile('groupsModuleComplete')
    .setWidth(1400)
    .setHeight(1400)
    .setTitle('👥 Groupes de Besoin');
  SpreadsheetApp.getUi().showModalDialog(html, 'Groupes');
}

/**
 * Affiche l'interface de finalisation
 */
function showFinalisationUI() {
  const html = HtmlService.createHtmlOutputFromFile('FinalisationUI')
    .setWidth(1200)
    .setHeight(700)
    .setTitle('📄 Finalisation & Export');
  SpreadsheetApp.getUi().showModalDialog(html, 'Finalisation');
}

/**
 * Affiche les paramètres avancés
 */
function showAdvancedSettings() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Paramètres Avancés',
    'Cette fonctionnalité sera disponible dans BASE 5 HUB.\n\n' +
    'Pour l\'instant, utilisez les autres modules disponibles.',
    ui.ButtonSet.OK
  );
}

/**
 * Affiche les logs système
 */
function showSystemLogs() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Logs Système',
    'Consultez les logs dans :\n' +
    '• Exécutions > Journaux (Apps Script)\n' +
    '• Console Cloud (si configuré)\n\n' +
    'Un visualiseur de logs sera disponible dans BASE 5 HUB.',
    ui.ButtonSet.OK
  );
}

/**************************** 🆕 AUDIT LOGGING SYSTEM *********************************/

/**
 * SPRINT #5: Socle de Journalisation Centralisée
 * Traçabilité complète des opérations critiques
 * Conforme RGPD avec historique versioning
 */

/**
 * Journalise une opération critique du module groupes
 * @param {string} operation - Type d'opération (CREATE, SAVE, FINALIZE, RESTORE, DELETE)
 * @param {string} groupType - Type de groupes (needs, language, option)
 * @param {object} metadata - Données contextuelles (groupName, count, mode, etc.)
 */
function logGroupOperation(operation, groupType, metadata = {}) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let auditSheet = ss.getSheetByName('_AUDIT_LOG');

    // Créer _AUDIT_LOG si absent
    if (!auditSheet) {
      console.log('📋 Création de l\'onglet _AUDIT_LOG...');
      auditSheet = ss.insertSheet('_AUDIT_LOG');
      auditSheet.appendRow([
        'Timestamp',
        'Operation',
        'GroupType',
        'GroupName',
        'StudentCount',
        'Mode',
        'User',
        'Status',
        'Details',
        'SnapshotCreated'
      ]);
      auditSheet.setFrozenRows(1);
      auditSheet.hideSheet();
    }

    // Construire la ligne d'audit
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail() || 'UNKNOWN';
    const groupName = metadata.groupName || '';
    const studentCount = metadata.count || metadata.studentCount || 0;
    const mode = metadata.mode || metadata.saveMode || '';
    const status = metadata.status || 'SUCCESS';
    const details = JSON.stringify(metadata.details || {});
    const snapshotCreated = metadata.snapshotCreated || '';

    // Ajouter la ligne
    auditSheet.appendRow([
      timestamp,
      operation,
      groupType,
      groupName,
      studentCount,
      mode,
      user,
      status,
      details,
      snapshotCreated
    ]);

    console.log(`✅ Audit enregistré: ${operation} | ${groupType} | ${groupName} | ${user}`);

    return { success: true, timestamp, operation, groupName };
  } catch (e) {
    console.error('❌ Erreur logGroupOperation:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Récupère l'historique d'audit pour un groupe
 * @param {string} groupName - Nom du groupe (ex: grBe1)
 * @param {number} limit - Nombre de lignes à retourner
 */
function getAuditLog(groupName, limit = 50) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('_AUDIT_LOG');

    if (!auditSheet) {
      return { success: false, error: 'Aucun journal d\'audit trouvé', logs: [] };
    }

    const data = auditSheet.getDataRange().getValues();
    const headers = data[0];

    // Trouver l'index de la colonne GroupName
    const groupNameIndex = headers.indexOf('GroupName');
    if (groupNameIndex === -1) {
      return { success: false, error: 'Colonne GroupName introuvable', logs: [] };
    }

    // Filtrer et formater
    const logs = data
      .slice(1)
      .filter(row => row[groupNameIndex] === groupName)
      .reverse()
      .slice(0, limit)
      .map((row, idx) => ({
        index: idx + 1,
        timestamp: row[headers.indexOf('Timestamp')],
        operation: row[headers.indexOf('Operation')],
        groupType: row[headers.indexOf('GroupType')],
        studentCount: row[headers.indexOf('StudentCount')],
        mode: row[headers.indexOf('Mode')],
        user: row[headers.indexOf('User')],
        status: row[headers.indexOf('Status')],
        details: row[headers.indexOf('Details')],
        snapshotCreated: row[headers.indexOf('SnapshotCreated')]
      }));

    return { success: true, groupName, logs, count: logs.length };
  } catch (e) {
    console.error('❌ Erreur getAuditLog:', e.toString());
    return { success: false, error: e.toString(), logs: [] };
  }
}

/**
 * Récupère toutes les opérations d'audit sur une période
 * @param {string} startDate - Date de début (ISO format)
 * @param {string} endDate - Date de fin (ISO format)
 */
function getAuditLogByDateRange(startDate, endDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('_AUDIT_LOG');

    if (!auditSheet) {
      return { success: false, error: 'Aucun journal d\'audit trouvé', logs: [] };
    }

    const data = auditSheet.getDataRange().getValues();
    const headers = data[0];
    const timestampIndex = headers.indexOf('Timestamp');

    const start = new Date(startDate);
    const end = new Date(endDate);

    const logs = data
      .slice(1)
      .filter(row => {
        const rowDate = new Date(row[timestampIndex]);
        return rowDate >= start && rowDate <= end;
      })
      .map(row => ({
        timestamp: row[timestampIndex],
        operation: row[headers.indexOf('Operation')],
        groupType: row[headers.indexOf('GroupType')],
        groupName: row[headers.indexOf('GroupName')],
        user: row[headers.indexOf('User')],
        status: row[headers.indexOf('Status')]
      }));

    return { success: true, logs, count: logs.length };
  } catch (e) {
    console.error('❌ Erreur getAuditLogByDateRange:', e.toString());
    return { success: false, error: e.toString(), logs: [] };
  }
}

/**
 * Génère un rapport d'audit au format JSON (pour export)
 * @param {string} groupName - Groupe à auditer
 */
function exportAuditReport(groupName) {
  try {
    const auditData = getAuditLog(groupName, 100);
    if (!auditData.success) {
      return { success: false, error: auditData.error };
    }

    const report = {
      title: `Rapport d'Audit - ${groupName}`,
      generatedAt: new Date().toISOString(),
      group: groupName,
      totalOperations: auditData.count,
      operations: auditData.logs,
      summary: {
        creates: auditData.logs.filter(l => l.operation === 'CREATE').length,
        saves: auditData.logs.filter(l => l.operation === 'SAVE').length,
        finalizes: auditData.logs.filter(l => l.operation === 'FINALIZE').length,
        restores: auditData.logs.filter(l => l.operation === 'RESTORE').length,
        deletes: auditData.logs.filter(l => l.operation === 'DELETE').length
      }
    };

    return { success: true, report, json: JSON.stringify(report, null, 2) };
  } catch (e) {
    console.error('❌ Erreur exportAuditReport:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * 🆕 GROUPINGS METADATA - PropertiesService storage/retrieval (SPRINT #6)
 */

function storeGroupingMetadata(groupType, groupingId, metadata) {
  const ps = PropertiesService.getUserProperties();
  const key = `GROUPING_${groupType}_${groupingId}`;
  ps.setProperty(key, JSON.stringify(metadata));
  console.log(`✅ Stored grouping metadata: ${key}`);
}

function loadGroupingMetadata(groupType, groupingId) {
  const ps = PropertiesService.getUserProperties();
  const key = `GROUPING_${groupType}_${groupingId}`;
  const data = ps.getProperty(key);
  return data ? JSON.parse(data) : null;
}

function getGroupingMetadataList(groupType) {
  const ps = PropertiesService.getUserProperties();
  const allProps = ps.getProperties();
  const prefix = `GROUPING_${groupType}_`;
  const result = {};

  for (const key in allProps) {
    if (key.startsWith(prefix)) {
      const groupingId = key.substring(prefix.length);
      result[groupingId] = JSON.parse(allProps[key]);
    }
  }
  return result;
}

function deleteGroupingMetadata(groupType, groupingId) {
  const ps = PropertiesService.getUserProperties();
  const key = `GROUPING_${groupType}_${groupingId}`;
  ps.deleteProperty(key);
  console.log(`🗑️  Deleted grouping metadata: ${key}`);
}

/**
 * Get next available offset for a specific grouping
 * Scans sheets for pattern: typePrefix + groupingId + number + optional TEMP
 * Example: if using "A" as groupingId: grBeA1, grBeA2, grBeA3TEMP → returns 4
 * Or if no groupingId: grBe1, grBe2, grBe3 → returns 4
 */
function getNextOffsetForGrouping(typePrefix, groupingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let maxNum = 0;

  for (const sheet of sheets) {
    const name = sheet.getName();

    // Pattern matching depends on whether groupingId is used
    let pattern;
    if (groupingId && groupingId !== 'default') {
      // Pattern: grBe${groupingId}${number}(TEMP)?
      // Example: grBeA1, grBeA2, grBeA3TEMP
      pattern = new RegExp(`^${typePrefix}${groupingId}(\\d+)(TEMP)?$`);
    } else {
      // Pattern: grBe${number}(TEMP)?
      // Example: grBe1, grBe2, grBe3TEMP
      pattern = new RegExp(`^${typePrefix}(\\d+)(TEMP)?$`);
    }

    const match = name.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return maxNum + 1;
}

/**
 * Get offset range (min-max) for a grouping
 * Returns {min: X, max: Y, count: Z}
 */
function getGroupingOffsetRange(typePrefix, groupingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let minNum = null;
  let maxNum = null;

  for (const sheet of sheets) {
    const name = sheet.getName();

    let pattern;
    if (groupingId && groupingId !== 'default') {
      pattern = new RegExp(`^${typePrefix}${groupingId}(\\d+)(TEMP)?$`);
    } else {
      pattern = new RegExp(`^${typePrefix}(\\d+)(TEMP)?$`);
    }

    const match = name.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (minNum === null || num < minNum) minNum = num;
      if (maxNum === null || num > maxNum) maxNum = num;
    }
  }

  if (minNum === null || maxNum === null) {
    return { min: null, max: null, count: 0 };
  }

  return {
    min: minNum,
    max: maxNum,
    count: maxNum - minNum + 1
  };
}

/**
 * List all TEMP sheets for a grouping
 */
function listGroupingTempSheets(typePrefix, groupingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const result = [];

  for (const sheet of sheets) {
    const name = sheet.getName();

    let pattern;
    if (groupingId && groupingId !== 'default') {
      pattern = new RegExp(`^${typePrefix}${groupingId}(\\d+)TEMP$`);
    } else {
      pattern = new RegExp(`^${typePrefix}(\\d+)TEMP$`);
    }

    if (name.match(pattern)) {
      result.push(name);
    }
  }

  return result.sort();
}

/**
 * Delete all TEMP sheets for a grouping (used for cleanup/reset)
 */
function deleteGroupingTempSheets(typePrefix, groupingId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tempSheets = listGroupingTempSheets(typePrefix, groupingId);

  for (const sheetName of tempSheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
      console.log(`🗑️  Deleted TEMP sheet for grouping: ${sheetName}`);
    }
  }
}

/**************************** FONCTIONS LEGACY PIPELINE *********************************/

/**
 * Affiche les classes sources (6°1, 6°2, etc.)
 */
function legacy_viewSourceClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const sourceSheets = sheets.filter(s => /^\d+°\d+$/.test(s.getName()));
  
  if (sourceSheets.length === 0) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Aucune Classe Source',
      'Aucun onglet source trouvé (format : 6°1, 6°2, etc.).\n\n' +
      'Créez d\'abord les onglets sources avec vos élèves.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const classList = sourceSheets.map(s => s.getName()).join(', ');
  ss.setActiveSheet(sourceSheets[0]);
  SpreadsheetApp.getUi().alert(
    '📋 Classes Sources',
    `${sourceSheets.length} classe(s) source(s) trouvée(s) :\n\n${classList}\n\n` +
    'Premier onglet activé : ' + sourceSheets[0].getName(),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Ouvre l'onglet _STRUCTURE pour configuration manuelle
 */
function legacy_openStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('_STRUCTURE');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Onglet Manquant',
      '_STRUCTURE n\'existe pas.\n\n' +
      'Créez-le manuellement avec les colonnes :\n' +
      '• CLASSE\n' +
      '• CAPACITY\n' +
      '• ITA, ESP, CHAV, etc. (quotas)',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert(
    '⚙️ Configuration _STRUCTURE',
    'Onglet _STRUCTURE activé.\n\n' +
    'Configurez manuellement :\n' +
    '• Capacités des classes\n' +
    '• Quotas ITA, ESP, CHAV, etc.\n\n' +
    'Puis lancez le pipeline LEGACY.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Lance le pipeline LEGACY complet
 * Sources (6°1, 6°2...) → TEST (6°1TEST, 6°2TEST...)
 */
function legacy_runFullPipeline() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Créer Onglets TEST (Pipeline LEGACY)',
    'Cette action va :\n\n' +
    '1. Lire les classes sources (6°1, 6°2, etc.)\n' +
    '2. Lancer les 4 phases LEGACY\n' +
    '3. Créer les onglets TEST (6°1TEST, 6°2TEST, etc.)\n\n' +
    'Durée estimée : 2-5 minutes\n\n' +
    'Continuer ?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  try {
    const startTime = new Date();
    SpreadsheetApp.getActiveSpreadsheet().toast('Lancement pipeline LEGACY...', 'En cours', -1);
    
    // Construire le contexte LEGACY
    const ctx = typeof makeCtxFromUI_ === 'function' ? makeCtxFromUI_() : null;
    if (!ctx) throw new Error('makeCtxFromUI_() non trouvée');
    
    // Phase 1
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 1/4...', 'Options & LV2', -1);
    if (typeof Phase1I_dispatchOptionsLV2_ === 'function') {
      Phase1I_dispatchOptionsLV2_(ctx);
    } else {
      throw new Error('Phase1I_dispatchOptionsLV2_() non trouvée');
    }
    
    // Phase 2
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 2/4...', 'ASSO/DISSO', -1);
    if (typeof Phase2I_applyDissoAsso_ === 'function') {
      Phase2I_applyDissoAsso_(ctx);
    } else {
      throw new Error('Phase2I_applyDissoAsso_() non trouvée');
    }
    
    // Phase 3
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 3/4...', 'Effectifs & Parité', -1);
    if (typeof Phase3I_completeAndParity_ === 'function') {
      Phase3I_completeAndParity_(ctx);
    } else {
      throw new Error('Phase3I_completeAndParity_() non trouvée');
    }
    
    // Phase 4
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4/4...', 'Équilibrage Scores', -1);
    if (typeof Phase4_balanceScoresSwaps_ === 'function') {
      Phase4_balanceScoresSwaps_(ctx);
    } else {
      throw new Error('Phase4_balanceScoresSwaps_() non trouvée');
    }
    
    const duration = ((new Date() - startTime) / 1000).toFixed(1);
    
    // Compter les onglets TEST créés
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheets = ss.getSheets().filter(s => s.getName().endsWith('TEST'));
    
    ui.alert(
      '✅ Pipeline LEGACY Terminé',
      `Pipeline complet réussi en ${duration}s\n\n` +
      `${testSheets.length} onglet(s) TEST créé(s)\n\n` +
      'Vous pouvez maintenant utiliser InterfaceV2\n' +
      'pour lire depuis TEST.',
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('❌ Erreur', e.toString(), ui.ButtonSet.OK);
  } finally {
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
  }
}

/**
 * Lance Phase 1 LEGACY - Options & LV2
 */
function legacy_runPhase1() {
  const ui = SpreadsheetApp.getUi();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 1 LEGACY en cours...', 'Options & LV2', -1);
    
    // Construire le contexte LEGACY
    const ctx = typeof makeCtxFromUI_ === 'function' ? makeCtxFromUI_() : null;
    if (!ctx) throw new Error('makeCtxFromUI_() non trouvée');
    
    // Lancer Phase 1 LEGACY
    if (typeof Phase1I_dispatchOptionsLV2_ === 'function') {
      const result = Phase1I_dispatchOptionsLV2_(ctx);
      ui.alert('✅ Phase 1 Terminée', result.message || 'Options & LV2 répartis dans CACHE', ui.ButtonSet.OK);
    } else {
      throw new Error('Phase1I_dispatchOptionsLV2_() non trouvée');
    }
  } catch (e) {
    ui.alert('❌ Erreur Phase 1', e.toString(), ui.ButtonSet.OK);
  } finally {
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
  }
}

/**
 * Lance Phase 2 LEGACY - ASSO/DISSO
 */
function legacy_runPhase2() {
  const ui = SpreadsheetApp.getUi();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 2 LEGACY en cours...', 'ASSO/DISSO', -1);
    
    const ctx = typeof makeCtxFromUI_ === 'function' ? makeCtxFromUI_() : null;
    if (!ctx) throw new Error('makeCtxFromUI_() non trouvée');
    
    if (typeof Phase2I_applyDissoAsso_ === 'function') {
      const result = Phase2I_applyDissoAsso_(ctx);
      ui.alert('✅ Phase 2 Terminée', result.message || 'ASSO/DISSO appliqués dans CACHE', ui.ButtonSet.OK);
    } else {
      throw new Error('Phase2I_applyDissoAsso_() non trouvée');
    }
  } catch (e) {
    ui.alert('❌ Erreur Phase 2', e.toString(), ui.ButtonSet.OK);
  } finally {
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
  }
}

/**
 * Lance Phase 3 LEGACY - Effectifs & Parité
 */
function legacy_runPhase3() {
  const ui = SpreadsheetApp.getUi();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 3 LEGACY en cours...', 'Effectifs & Parité', -1);
    
    const ctx = typeof makeCtxFromUI_ === 'function' ? makeCtxFromUI_() : null;
    if (!ctx) throw new Error('makeCtxFromUI_() non trouvée');
    
    if (typeof Phase3I_completeAndParity_ === 'function') {
      const result = Phase3I_completeAndParity_(ctx);
      ui.alert('✅ Phase 3 Terminée', result.message || 'Effectifs & Parité équilibrés dans CACHE', ui.ButtonSet.OK);
    } else {
      throw new Error('Phase3I_completeAndParity_() non trouvée');
    }
  } catch (e) {
    ui.alert('❌ Erreur Phase 3', e.toString(), ui.ButtonSet.OK);
  } finally {
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
  }
}

/**
 * Lance Phase 4 LEGACY - Équilibrage Scores
 */
function legacy_runPhase4() {
  const ui = SpreadsheetApp.getUi();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Phase 4 LEGACY en cours...', 'Équilibrage Scores', -1);
    
    const ctx = typeof makeCtxFromUI_ === 'function' ? makeCtxFromUI_() : null;
    if (!ctx) throw new Error('makeCtxFromUI_() non trouvée');
    
    if (typeof Phase4_balanceScoresSwaps_ === 'function') {
      const result = Phase4_balanceScoresSwaps_(ctx);
      ui.alert('✅ Phase 4 Terminée', result.message || 'Équilibrage scores terminé dans CACHE', ui.ButtonSet.OK);
    } else {
      throw new Error('Phase4_balanceScoresSwaps_() non trouvée');
    }
  } catch (e) {
    ui.alert('❌ Erreur Phase 4', e.toString(), ui.ButtonSet.OK);
  } finally {
    SpreadsheetApp.getActiveSpreadsheet().toast('', '', 1);
  }
}

/**
 * Affiche les résultats dans les onglets TEST
 */
function legacy_viewTestResults() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const testSheets = ss.getSheets().filter(s => s.getName().endsWith('TEST'));
  
  if (testSheets.length === 0) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Aucun Résultat',
      'Aucun onglet TEST trouvé.\n\n' +
      'Lancez d\'abord le pipeline LEGACY\n' +
      'pour créer les onglets TEST.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const testList = testSheets.map(s => s.getName()).join(', ');
  ss.setActiveSheet(testSheets[0]);
  SpreadsheetApp.getUi().alert(
    '📊 Résultats TEST',
    `${testSheets.length} onglet(s) TEST trouvé(s) :\n\n${testList}\n\n` +
    'Premier onglet activé : ' + testSheets[0].getName() + '\n\n' +
    'Vous pouvez maintenant utiliser InterfaceV2\n' +
    'pour lire depuis TEST.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**************************** CONFIGURATION LOCALE *********************************/
const ELEVES_MODULE_CONFIG = {
  TEST_SUFFIX: 'TEST',
  CACHE_SUFFIX: 'CACHE',
  SNAPSHOT_SUFFIX: 'INT',
  STRUCTURE_SHEET: '_STRUCTURE',
  DEFAULT_CAPACITY: null, // ✅ PLUS DE VALEUR EN DUR - Calculé dynamiquement
  DEFAULT_MOBILITY: 'LIBRE',
  SHEET_EXCLUSION_PATTERN: /^(?:level|grp|groupe|group|niv(?:eau)?)\b/i
};

/**************************** ALIAS DES COLONNES *********************************/
const ELEVES_ALIAS = {
  id      : ['ID_ELEVE','ID','UID','IDENTIFIANT','NUM ELÈVE'],
  nom     : ['NOM'],
  prenom  : ['PRENOM','PRÉNOM'],
  sexe    : ['SEXE','S'],
  lv2     : ['LV2','LANGUE2','L2'],
  opt     : ['OPT','OPTION'],
  disso   : ['DISSO','DISSOCIÉ','DISSOCIE'],
  asso    : ['ASSO','ASSOCIÉ','ASSOCIE'],
  com     : ['COM'],
  tra     : ['TRA'],
  part    : ['PART'],
  abs     : ['ABS'],
  source  : ['SOURCE','ORIGINE','CLASSE_ORIGINE'],
  dispo   : ['DISPO','PAI','PPRE','PAP','GEVASCO'],
  mobilite: ['MOBILITE','MOB']
};

/**************************** FONCTIONS UTILITAIRES *********************************/
const _eleves_s   = v => String(v || '').trim();
const _eleves_up  = v => _eleves_s(v).toUpperCase();
const _eleves_num = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
function _eleves_idx(head, aliases){
  for(let i=0;i<head.length;i++)
    if(aliases.some(a => head[i] === a)) return i;
  return -1;
}
function _eleves_sanitizeForSerialization(obj) {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
}
const ElevesBackend = (function(global) {
  const baseLogger = global.console || { log: () => {}, warn: () => {}, error: () => {} };

  function escapeRegExp(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function toStringValue(value) { return _eleves_s(value); }
  function toUpperValue(value) { return _eleves_up(value); }
  function toNumberValue(value) { return _eleves_num(value); }
  function sanitize(data) { return _eleves_sanitizeForSerialization(data); }
  function stripSuffix(name, suffix) {
    if (!suffix) return toStringValue(name);
    const regex = new RegExp(`${escapeRegExp(suffix)}$`, 'i');
    return toStringValue(name).replace(regex, '').trim();
  }

  const baseConfig = {
    sheetSuffixes: {
      test: ELEVES_MODULE_CONFIG.TEST_SUFFIX,     // 'TEST'
      cache: ELEVES_MODULE_CONFIG.CACHE_SUFFIX,   // 'CACHE'
      snapshot: ELEVES_MODULE_CONFIG.SNAPSHOT_SUFFIX // 'INT'
    },
    structureSheet: ELEVES_MODULE_CONFIG.STRUCTURE_SHEET,
    defaultCapacity: ELEVES_MODULE_CONFIG.DEFAULT_CAPACITY || 28,
    defaultMobility: ELEVES_MODULE_CONFIG.DEFAULT_MOBILITY || 'LIBRE',
    columnAliases: ELEVES_ALIAS,
    sheetExclusionPattern: ELEVES_MODULE_CONFIG.SHEET_EXCLUSION_PATTERN || null
  };

  /* ----------------------- Domaine ----------------------- */
  function createDomain({ config = baseConfig, logger = baseLogger } = {}) {
    const aliasMap = config.columnAliases;
    const defaultMobility = config.defaultMobility;

    function buildColumnIndex(headerRow) {
      const normalizedHead = Array.isArray(headerRow) ? headerRow.map(toUpperValue) : [];
      const indexes = {};
      Object.keys(aliasMap).forEach(key => {
        const aliases = (aliasMap[key] || []).map(toUpperValue);
        indexes[key] = _eleves_idx(normalizedHead, aliases);
      });
      return indexes;
    }

    function createStudent(row, columns) {
      const idIndex = columns.id;
      if (idIndex === undefined || idIndex === -1) return null;
      const id = toStringValue(row[idIndex]);
      if (!id) return null;

      const valueAt = (field, formatter = toStringValue) => {
        const idx = columns[field];
        if (idx === undefined || idx === -1) return formatter === toNumberValue ? 0 : '';
        return formatter(row[idx]);
      };

      let directMobilite = columns.mobilite !== -1 && columns.mobilite !== undefined
        ? toUpperValue(row[columns.mobilite]) : '';
      const fallbackMobilite = columns.dispo !== -1 && columns.dispo !== undefined
        ? toUpperValue(row[columns.dispo]) : '';

      // ✅ CORRECTION CRITIQUE : Normaliser les formats GROUPE_FIXE/GROUPE_PERMUT/CONDI
      // Mobility_System écrit des formats descriptifs, mais InterfaceV2 attend des mots-clés simples
      let mobilite = directMobilite || fallbackMobilite || defaultMobility;
      if (mobilite.startsWith('GROUPE_FIXE')) {
        mobilite = 'FIXE';
      } else if (mobilite.startsWith('CONDI')) {
        mobilite = 'CONDI';
      } else if (mobilite.startsWith('GROUPE_PERMUT')) {
        mobilite = 'PERMUT';
      } else if (mobilite.startsWith('PERMUT(')) {
        mobilite = 'PERMUT';
      }

      return {
        id,
        nom: valueAt('nom'),
        prenom: valueAt('prenom'),
        sexe: valueAt('sexe', toUpperValue),
        lv2: valueAt('lv2', toUpperValue),
        opt: valueAt('opt', toUpperValue),
        disso: valueAt('disso', toUpperValue),
        asso: valueAt('asso', toUpperValue),
        scores: {
          COM: valueAt('com', toNumberValue),
          TRA: valueAt('tra', toNumberValue),
          PART: valueAt('part', toNumberValue),
          ABS: valueAt('abs', toNumberValue)
        },
        source: valueAt('source'),
        dispo: valueAt('dispo', toUpperValue),
        mobilite: mobilite
      };
    }

    function createClassFromSheet(sheet, { suffix, logger: localLogger = logger } = {}) {
      if (!sheet || !Array.isArray(sheet.values) || sheet.values.length < 2) return null;
      const header = sheet.values[0];
      const columns = buildColumnIndex(header);
      if (columns.id === -1) {
        localLogger?.warn?.(`Feuille ${sheet.name} ignorée: aucune colonne ID reconnue.`);
        return null;
      }
      const students = [];
      for (let r = 1; r < sheet.values.length; r++) {
        const student = createStudent(sheet.values[r], columns);
        if (student) students.push(student);
      }
      if (!students.length) return null;
      return { classe: stripSuffix(sheet.name, suffix), eleves: students };
    }

    function buildClassesData(sheets, { suffix, logger: localLogger = logger } = {}) {
      const classes = [];
      (sheets || []).forEach(sheet => {
        const classe = createClassFromSheet(sheet, { suffix, logger: localLogger });
        if (classe) classes.push(classe);
      });
      return classes;
    }

    function parseStructureRules(values) {
      if (!Array.isArray(values) || values.length < 2) return {};
      const head = values[0].map(toUpperValue);
      const colDest = head.findIndex(h => h.includes('DEST'));
      if (colDest === -1) {
        logger?.warn?.('❌ Pas de colonne CLASSE_DEST dans _STRUCTURE');
        return {};
      }
      const colEff = head.findIndex(h => h.includes('EFFECTIF'));
      const colOptions = head.findIndex(h => h.includes('OPTION'));
      const rules = {};
      for (let r = 1; r < values.length; r++) {
        const dest = toStringValue(values[r][colDest]);
        if (!dest) continue;

        let capacity = config.defaultCapacity;
        if (colEff !== -1 && values[r][colEff] !== '' && values[r][colEff] != null) {
          const parsed = parseInt(values[r][colEff], 10);
          if (!Number.isNaN(parsed)) capacity = parsed;
        }
        const quotas = {};
        if (colOptions !== -1 && values[r][colOptions] !== '' && values[r][colOptions] != null) {
          String(values[r][colOptions]).replace(/^'/, '')
            .split(',').map(s => s.trim()).filter(Boolean)
            .forEach(pair => {
              const [opt, val = '0'] = pair.split('=').map(x => toUpperValue(x));
              if (opt) {
                const parsed = parseInt(val, 10);
                quotas[opt] = Number.isNaN(parsed) ? 0 : parsed;
              }
            });
        }
        rules[dest] = { capacity, quotas };
      }
      return rules;
    }

    return {
      buildColumnIndex,
      createStudent,
      createClassFromSheet,
      buildClassesData,
      parseStructureRules,
      sanitize,
      stripSuffix
    };
  }

  /* ----------------------- Accès données ----------------------- */
  function createDataAccess({ SpreadsheetApp, logger = baseLogger, config = baseConfig } = {}) {
    const hasSpreadsheet = SpreadsheetApp && typeof SpreadsheetApp.getActiveSpreadsheet === 'function';
    function getSpreadsheet() {
      if (!hasSpreadsheet) return null;
      try { return SpreadsheetApp.getActiveSpreadsheet(); }
      catch (err) { logger?.error?.('Erreur lors de la récupération du classeur actif', err); return null; }
    }

    function getClassSheetsForSuffix(suffix, { includeValues = true, includeHidden = false } = {}) {
      const spreadsheet = getSpreadsheet();
      if (!spreadsheet || typeof spreadsheet.getSheets !== 'function') return [];
      const suffixUpper = _eleves_up(suffix);
      const exclusionPattern = config.sheetExclusionPattern;
      const structureName = config.structureSheet;

      return spreadsheet.getSheets().reduce((acc, sh) => {
        const name = sh?.getName?.() || '';
        if (name === structureName) return acc;                    // exclure _STRUCTURE
        if (!_eleves_up(name).endsWith(suffixUpper)) return acc;   // filtrer le suffixe
        if (exclusionPattern && exclusionPattern.test(name)) return acc;
        if (!includeHidden && sh.isSheetHidden()) return acc;

        const entry = { name };
        if (includeValues) {
          try {
            const dataRange = sh.getDataRange?.();
            entry.values = dataRange?.getValues?.() || [];
          } catch (err) {
            logger?.error?.(`Erreur lors de la lecture de la feuille ${name}`, err);
            entry.values = [];
          }
        }
        acc.push(entry);
        return acc;
      }, []);
    }

    function getStructureSheetValues() {
      const spreadsheet = getSpreadsheet();
      if (!spreadsheet || typeof spreadsheet.getSheetByName !== 'function') return null;
      try {
        const sheet = spreadsheet.getSheetByName(config.structureSheet);
        if (!sheet) return null;
        const range = sheet.getDataRange?.();
        if (!range || typeof range.getValues !== 'function') return [];
        return range.getValues();
      } catch (err) {
        logger?.error?.('Erreur lors de la lecture de _STRUCTURE', err);
        return null;
      }
    }

    return { getClassSheetsForSuffix, getStructureSheetValues };
  }

  /* ----------------------- Service ----------------------- */
  function createService({
    config = baseConfig,
    domain = createDomain({ config }),
    dataAccess = createDataAccess(),
    logger = baseLogger
  } = {}) {

    // <<< SUFFIX MAP MISE À JOUR >>>
    const suffixMap = new Map([
      ['TEST', 'TEST'],
      ['CACHE', 'CACHE'],
      ['INT', 'INT'],
      ['SNAPSHOT', 'INT'],
      ['WIP', 'WIP'],      // conservé
      ['PREVIOUS', null],  // cas particulier
      ['FIN', 'FIN'],      // nouveau mode finalisées
      ['FINAL', 'FIN']     // alias vers FIN
    ]);

    function resolveSuffix(mode) {
      const normalized = _eleves_up(mode || '');
      if (suffixMap.has(normalized)) return suffixMap.get(normalized);
      if (normalized) logger?.warn?.(`Mode inconnu: ${mode}, utilisation de ${config.sheetSuffixes.test} par défaut`);
      return config.sheetSuffixes.test;
    }

    function getElevesData() { return getElevesDataForMode('TEST'); }

    function getElevesDataForMode(mode) {
      const norm = _eleves_up(mode || 'TEST');

      // <<< MODE PREVIOUS : Base admin (°1, 5°1, PREVERT°2, etc.) - SANS suffixe >>>
      if (norm === 'PREVIOUS') {
        const previousClassPattern = /^.*°\d+$/; // accepte TOUT ce qui finit par °+chiffre (°1, 5°1, PREVERT°1, etc.)
        try {
          const ss = SpreadsheetApp.getActiveSpreadsheet();
          const sheets = ss.getSheets();
          const previous = [];
          const exclusionPattern = config.sheetExclusionPattern;
          const structureName = config.structureSheet;

          // 🔍 AUDIT : Lister TOUS les onglets
          const allSheetNames = sheets.map(sh => sh.getName());
          logger?.log?.(`🔍 AUDIT PREVIOUS - Total onglets : ${sheets.length}`);
          logger?.log?.(`🔍 Tous les onglets : ${JSON.stringify(allSheetNames)}`);
          logger?.log?.(`🔍 Pattern recherché : /^.*°\\d+$/ (accepte TOUT ce qui finit par °+chiffre)`);
          logger?.log?.(`🔍 Pattern exclusion : ${exclusionPattern}`);
          logger?.log?.(`🔍 Structure sheet : ${structureName}`);

          sheets.forEach(sh => {
            const name = sh.getName();
            
            // 🔍 AUDIT : Tester chaque condition
            const isStructure = (name === structureName);
            const isExcluded = exclusionPattern && exclusionPattern.test(name);
            const matchesPattern = previousClassPattern.test(String(name).trim());
            
            logger?.log?.(`🔍 Onglet "${name}" : structure=${isStructure}, excluded=${isExcluded}, matches=${matchesPattern}`);
            
            if (isStructure) {
              logger?.log?.(`  ❌ Ignoré (structure)`);
              return;
            }
            if (isExcluded) {
              logger?.log?.(`  ❌ Ignoré (exclusion pattern)`);
              return;
            }
            if (!matchesPattern) {
              logger?.log?.(`  ❌ Ignoré (ne match pas le pattern)`);
              return;
            }
            
            try {
              const values = sh.getDataRange().getValues();
              if (values && values.length > 1) {
                previous.push({ name, values });
                logger?.log?.(`  ✅ Ajouté (${values.length} lignes)`);
              } else {
                logger?.log?.(`  ❌ Ignoré (pas assez de données : ${values?.length || 0} lignes)`);
              }
            } catch (err) {
              logger?.log?.(`  ❌ Erreur lecture : ${err.message}`);
            }
          });

          logger?.log?.(`🔍 Total onglets retenus : ${previous.length}`);

          const classes = domain.buildClassesData(
            previous.map(p => ({ name: p.name, values: p.values })),
            { suffix: '', logger }
          );
          const serialized = domain.sanitize(classes) || [];
          logger?.log?.(`✅ ${serialized.length} classes trouvées pour PREVIOUS`);
          return serialized;
        } catch (error) {
          logger?.error?.('💥 Erreur PREVIOUS', error);
          return [];
        }
      }

      // autres modes via suffix
      const suffix = resolveSuffix(norm);
      logger?.log?.(`📊 Chargement données: mode=${norm} (suffixe: ${suffix})`);

      try {
        const sheets = dataAccess.getClassSheetsForSuffix(suffix, {
          includeValues: true,
          // <<< inclure les onglets cachés pour TEST, WIP, CACHE et FIN >>>
          includeHidden: (norm === 'TEST' || norm === 'WIP' || norm === 'CACHE' || norm === 'FIN')
        });
        const classes = domain.buildClassesData(sheets, { suffix, logger });
        const serialized = domain.sanitize(classes) || [];
        logger?.log?.(`✅ ${serialized.length} classes trouvées pour mode ${norm}`);
        return serialized;
      } catch (error) {
        logger?.error?.('Erreur dans getElevesDataForMode', error);
        return [];
      }
    }

    function getStructureRules() {
      try {
        const values = dataAccess.getStructureSheetValues();
        if (!values) { logger?.warn?.('❌ Onglet _STRUCTURE absent'); return {}; }
        const rules = domain.parseStructureRules(values);
        const serialized = domain.sanitize(rules) || {};
        logger?.log?.('✅ rules (DEST-only) :', JSON.stringify(serialized, null, 2));
        return serialized;
      } catch (error) {
        logger?.error?.('💥 Erreur getStructureRules', error);
        return {};
      }
    }

    return {
      getElevesData,
      getElevesDataForMode,
      getStructureRules,
      resolveSuffix
    };
  }

  const api = {
    config: baseConfig,
    utils: { escapeRegExp, toStringValue, toUpperValue, toNumberValue, sanitize, stripSuffix },
    createDomain,
    createDataAccess,
    createService
  };

  global.ElevesBackend = api;
  return api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
const __elevesBackendLogger = (typeof console !== 'undefined' ? console : { log: () => {}, warn: () => {}, error: () => {} });
const __elevesBackendDomain = ElevesBackend.createDomain({ config: ElevesBackend.config, logger: __elevesBackendLogger });
const __elevesBackendDataAccess = ElevesBackend.createDataAccess({
  SpreadsheetApp: typeof SpreadsheetApp !== 'undefined' ? SpreadsheetApp : null,
  logger: __elevesBackendLogger,
  config: ElevesBackend.config
});
const __elevesBackendService = ElevesBackend.createService({
  config: ElevesBackend.config,
  domain: __elevesBackendDomain,
  dataAccess: __elevesBackendDataAccess,
  logger: __elevesBackendLogger
});
/************************ API Lecture simple *********************************/
function getElevesData(){ return __elevesBackendService.getElevesData(); }
function getElevesDataForMode(mode) { return __elevesBackendService.getElevesDataForMode(mode); }
function getStructureRules() { return __elevesBackendService.getStructureRules(); }

/******************** updateStructureRules ***********************/
function updateStructureRules(newRules) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(ELEVES_MODULE_CONFIG.STRUCTURE_SHEET);
    if (!sh) {
      sh = ss.insertSheet(ELEVES_MODULE_CONFIG.STRUCTURE_SHEET);
      sh.getRange(1, 1, 1, 4).setValues([["", "CLASSE_DEST", "EFFECTIF", "OPTIONS"]]);
      sh.getRange(1, 1, 1, 4).setBackground('#5b21b6').setFontColor('#ffffff').setFontWeight('bold');
    }
    const data = sh.getDataRange().getValues();
    const header = data[0].map(h => _eleves_up(h));
    let colClasse=-1, colEffectif=-1, colOptions=-1;
    for (let i = 0; i < header.length; i++) {
      if (header[i].includes('CLASSE') && header[i].includes('DEST')) colClasse = i;
      if (header[i].includes('EFFECTIF')) colEffectif = i;
      if (header[i].includes('OPTIONS')) colOptions = i;
    }
    if (colClasse === -1 || colEffectif === -1 || colOptions === -1) {
      return {success: false, error: "Colonnes requises non trouvées dans _STRUCTURE"};
    }
    const classMap = {};
    for (let i = 1; i < data.length; i++) {
      const classe = _eleves_s(data[i][colClasse]);
      if (classe) classMap[classe] = i;
    }
    Object.keys(newRules).forEach(classe => {
      const rule = newRules[classe];
      const quotasStr = Object.entries(rule.quotas || {}).map(([k, v]) => `${k}=${v}`).join(', ');
      if (classMap[classe]) {
        const row = classMap[classe];
        sh.getRange(row + 1, colEffectif + 1).setValue(rule.capacity);
        sh.getRange(row + 1, colOptions + 1).setValue(quotasStr);
      } else {
        const newRow = sh.getLastRow() + 1;
        sh.getRange(newRow, colClasse + 1).setValue(classe);
        sh.getRange(newRow, colEffectif + 1).setValue(rule.capacity);
        sh.getRange(newRow, colOptions + 1).setValue(quotasStr);
      }
    });
    try {
      const timestamp = new Date();
      const user = Session.getActiveUser().getEmail();
      console.log(`Règles _STRUCTURE mises à jour par ${user} à ${timestamp}`);
    } catch(_) {}
    return {success: true, message: "Règles mises à jour avec succès"};
  } catch (e) {
    console.error('Erreur dans updateStructureRules:', e);
    return {success: false, error: e.toString()};
  }
}

/******************** Utilitaires d'indexage *************************/
function buildStudentIndex_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const domain = __elevesBackendDomain;
  const index = {};
  let header = null;

  sheets.forEach(sh => {
    const name = sh.getName();
    // ✅ Optimisation : ne lire que les onglets TEST, CACHE, ou FIN (ignorer backups, INT, etc.)
    if (!/TEST$|CACHE$|FIN$/i.test(name)) return;
    if (/INT$/i.test(name)) return; // on ignore les *INT
    const data = sh.getDataRange().getValues();
    if (data.length < 2) return;
    const columns = domain.buildColumnIndex(data[0]);
    const colId = columns.id;
    if (colId === -1) return;
    if (!header) header = data[0];
    for (let r = 1; r < data.length; r++) {
      const id = _eleves_s(data[r][colId]);
      if (id) {
        // ✅ CORRECTION CRITIQUE : Garder la version la plus complète (avec FIXE/MOBILITE)
        // Ne pas écraser si la nouvelle ligne est plus courte (perte de colonnes P/T)
        if (!index[id] || data[r].length > index[id].length) {
          index[id] = data[r];
        }
      }
    }
  });
  return { header, rows:index };
}

/******************** Sauvegardes DRY (générique) *************************/
/**
 * Sauvegarde générique des classes dans des onglets <classe><suffix>
 * options: { suffix, backup, hideSheet, lightFormat, withLock, meta:{version} }
 */
function saveElevesGeneric(classMap, options = {}) {
  // 🔍 AUDIT CRITIQUE : Logs de débogage
  console.log('🔍 saveElevesGeneric appelée');
  console.log('  📊 classMap:', classMap ? 'OUI' : 'NULL/UNDEFINED');
  console.log('  📊 options:', JSON.stringify(options));
  
  const {
    suffix,
    backup = false,
    hideSheet = false,
    lightFormat = false,
    withLock = true,
    meta = { version: '2.0' }
  } = options;

  console.log('  📌 suffix:', suffix);
  console.log('  📌 withLock:', withLock);

  if (!classMap || typeof classMap !== 'object') {
    console.error('❌ classMap invalide ou manquant');
    return { success: false, message: '❌ classMap invalide ou manquant' };
  }
  
  const classCount = Object.keys(classMap).length;
  console.log('  📋 Nombre de classes à sauvegarder:', classCount);
  
  if (classCount === 0) {
    console.error('⚠️ Aucune classe à sauvegarder');
    return { success: false, message: '⚠️ Aucune classe à sauvegarder' };
  }

  const LOCK_KEY = `SAVE_${suffix}_LOCK`;
  const LOCK_TIMEOUT = 300000;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const acquire = () => {
    if (!withLock) return () => {};
    const lock = LockService.getScriptLock();
    try { lock.waitLock(30000); } catch(_) { return () => {}; }
    PropertiesService.getDocumentProperties().setProperty(
      LOCK_KEY, JSON.stringify({ user: Session.getActiveUser().getEmail(), timestamp: Date.now() })
    );
    return () => {
      try {
        PropertiesService.getDocumentProperties().deleteProperty(LOCK_KEY);
        LockService.getScriptLock().releaseLock();
      } catch(_) {}
    };
  };

  const release = acquire();
  const releaseSafely = () => { try { release(); } catch(_){} };

  let header, rows;
  try {
    const idx = buildStudentIndex_();
    header = idx.header; rows = idx.rows;
    if (!header) throw new Error('Aucune feuille avec colonne ID trouvée.');
  } catch (err) {
    releaseSafely();
    return { success: false, message: `❌ Indexation impossible: ${err.message}` };
  }

  const currentSheetCount = ss.getSheets().length;
  const maxSheets = 200;
  const sheetsNeeded = Object.keys(classMap).length;
  if (currentSheetCount + sheetsNeeded > maxSheets) {
    releaseSafely();
    return { success: false, message: `❌ Trop d'onglets (${currentSheetCount}/${maxSheets}).` };
  }

  const savedSheets = [];
  const errors = [];

  Object.keys(classMap).forEach(classe => {
    try {
      const ids = classMap[classe] || [];
      if (!Array.isArray(ids)) { errors.push(`⚠️ ${classe}: IDs non valides`); return; }

      let rowData = ids.map(id => rows[id] || [id]);
      const maxCols = Math.max(header.length, ...rowData.map(r => r.length));
      rowData = rowData.map(r => (r.length < maxCols) ? r.concat(Array(maxCols - r.length).fill('')) : r.slice(0, maxCols));
      const hdr = (header.length < maxCols) ? header.concat(Array(maxCols - header.length).fill('')) : header.slice(0, maxCols);

      const sheetName = classe + suffix;
      let sh = ss.getSheetByName(sheetName);
      if (sh) {
        if (backup) {
          const BACKUP_SUFFIX = `${suffix}_BACKUP`;
          const backupName = classe + BACKUP_SUFFIX;
          const old = ss.getSheetByName(backupName);
          if (old) ss.deleteSheet(old);
          const b = sh.copyTo(ss);
          b.setName(backupName);
          b.hideSheet();
        }
        sh.clear();
      } else {
        sh = ss.insertSheet(sheetName);
      }

      sh.getRange(1, 1, 1, maxCols).setValues([hdr]);
      if (rowData.length) sh.getRange(2, 1, rowData.length, maxCols).setValues(rowData);

      const metadata = {
        timestamp: new Date().toISOString(),
        version: meta.version || '2.0',
        eleveCount: ids.length,
        checksum: generateChecksum(ids)
      };
      sh.getRange(1, maxCols + 1).setValue(metadata.timestamp);
      sh.getRange(1, maxCols + 2).setValue(metadata.version);
      sh.getRange(1, maxCols + 3).setValue(metadata.eleveCount);
      sh.getRange(1, maxCols + 4).setValue(metadata.checksum);

      if (hideSheet) sh.hideSheet();
      if (!lightFormat) {
        const headerRange = sh.getRange(1, 1, 1, maxCols);
        headerRange.setBackground('#5b21b6').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
        if (rowData.length) {
          const range = sh.getRange(2, 1, rowData.length, maxCols);
          sh.setRowHeights(2, rowData.length, 25);
          range.setBorder(true, true, true, true, true, true, '#e0e0e0', SpreadsheetApp.BorderStyle.SOLID);
        }
        sh.setFrozenRows(1);
      }

      savedSheets.push(classe);
    } catch (err) {
      errors.push(`❌ ${classe}: ${err.message}`);
    }
  });

  const successCount = savedSheets.length;
  const total = Object.keys(classMap).length;
  const result = (successCount === 0)
    ? { success: false, message: '❌ Aucune classe sauvegardée', errors }
    : (successCount < total)
      ? { success: true, partial: true, message: `⚠️ ${successCount}/${total} classes sauvegardées`, savedSheets, errors }
      : { success: true, message: `✅ ${successCount} onglet(s) ${suffix} mis à jour`, savedSheets };

  logSaveOperation(`saveElevesGeneric(${suffix})`, result);
  releaseSafely();
  return result;
}

function saveElevesCache(classMap) {
  // 🔍 AUDIT CRITIQUE : Logs de débogage
  console.log('🔍 saveElevesCache appelée');
  console.log('  📊 classMap reçu:', classMap ? 'OUI' : 'NULL/UNDEFINED');
  
  if (classMap) {
    const classes = Object.keys(classMap);
    console.log('  📋 Nombre de classes:', classes.length);
    console.log('  📋 Classes:', classes.join(', '));
    
    classes.forEach(function(classe) {
      const ids = classMap[classe];
      console.log('  📌 ' + classe + ':', Array.isArray(ids) ? ids.length + ' élèves' : 'INVALIDE');
    });
  } else {
    console.error('❌ ERREUR CRITIQUE: classMap est null ou undefined !');
    return { success: false, message: '❌ classMap est null ou undefined' };
  }
  
  console.log('  ⚙️ Appel saveElevesGeneric avec suffix=CACHE...');
  const result = saveElevesGeneric(classMap, {
    suffix: 'CACHE', backup: false, hideSheet: false, lightFormat: true, withLock: true, meta: { version: '2.0' }
  });
  
  console.log('  ✅ Résultat saveElevesGeneric:', result);
  return result;
}
function saveElevesSnapshot(classMap) {
  return saveElevesGeneric(classMap, {
    suffix: ELEVES_MODULE_CONFIG.SNAPSHOT_SUFFIX || 'INT', backup: false, hideSheet: true, lightFormat: false, withLock: false, meta: { version: '2.0' }
  });
}
function saveElevesWIP(disposition) {
  return saveElevesGeneric(disposition, {
    suffix: 'WIP', backup: false, hideSheet: true, lightFormat: true, withLock: false, meta: { version: 'WIP' }
  });
}

/******************** Restauration / Infos *************************/
function restoreBySuffix(suffix) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().filter(sh => sh.getName().endsWith(suffix));
  const result = [];
  sheets.forEach(sh => {
    const name = sh.getName();
    const classe = name.replace(new RegExp(suffix + '$', 'i'), '');
    const data = sh.getDataRange().getValues();
    if (data.length < 2) return;
    const head = data[0].map(c => String(c));
    const eleves = [];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row[0]) continue;
      const eleve = {};
      head.forEach((col, i) => { eleve[col] = row[i]; });
      eleves.push(eleve);
    }
    result.push({ classe, eleves });
  });
  return result;
}
function restoreElevesCache(){ return restoreBySuffix('CACHE'); }

function getSuffixInfo(suffix) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().filter(sh => sh.getName().endsWith(suffix));
  let lastDate = null;
  sheets.forEach(sh => {
    const data = sh.getDataRange().getValues();
    if (data.length && data[0].length > 0) {
      const dateCell = data[0][data[0].length - 1];
      if (dateCell) {
        const d = new Date(dateCell);
        if (!isNaN(d) && (!lastDate || d > lastDate)) lastDate = d;
      }
    }
  });
  return lastDate ? { exists:true, date: lastDate.toISOString() } : { exists:false };
}
function getCacheInfo(){ return getSuffixInfo('CACHE'); }
function getWIPInfo(){ return getSuffixInfo('WIP'); }

/******************** Autres utilitaires *************************/
function getEleveById_(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idStr  = _eleves_s(id);
  if (!idStr) return null;
  const domain = __elevesBackendDomain;

  for (const sh of ss.getSheets()) {
    const name = sh.getName();
    if (/INT$/i.test(name)) continue;
    const data = sh.getDataRange().getValues();
    if (!data.length) continue;
    const columns = domain.buildColumnIndex(data[0]);
    const colId = columns.id;
    if (colId === -1) continue;
    for (let r = 1; r < data.length; r++) {
      if (_eleves_s(data[r][colId]) === idStr) {
        const student = domain.createStudent(data[r], columns);
        if (student) return domain.sanitize(student);
      }
    }
  }
  return null;
}

function getElevesStats(){
  try {
    const groups = getElevesData();
    if(!groups || groups.length === 0) return { global: {COM: 0, TRA: 0, PART: 0}, parClasse: [] };

    const realClasses = groups.filter(grp => {
      const className = String(grp.classe || '').trim();
      return !className.match(/^(?:level[\s_-]?|niv(?:eau)?[\s_-]?|grp(?:oupe)?[\s_-]?|groupe[\s_-]?|group[\s_-]?|niveau[\s_-]?)/i) &&
             className.length > 0;
    });

    const g = {COM: 0, TRA: 0, PART: 0, count: 0};
    const list = [];
    realClasses.forEach(grp => {
      if (!grp.eleves || grp.eleves.length === 0) return;
      const s = {COM: 0, TRA: 0, PART: 0};
      grp.eleves.forEach(e => {
        if (e.scores) { s.COM += e.scores.COM || 0; s.TRA += e.scores.TRA || 0; s.PART += e.scores.PART || 0; }
      });
      const n = grp.eleves.length;
      list.push({ classe: grp.classe, COM: Math.round(s.COM / n * 100) / 100, TRA: Math.round(s.TRA / n * 100) / 100, PART: Math.round(s.PART / n * 100) / 100 });
      g.COM += s.COM; g.TRA += s.TRA; g.PART += s.PART; g.count += n;
    });

    const globalStats = g.count > 0 ? {
      COM: Math.round(g.COM / g.count * 100) / 100,
      TRA: Math.round(g.TRA / g.count * 100) / 100,
      PART: Math.round(g.PART / g.count * 100) / 100
    } : {COM: 0, TRA: 0, PART: 0};

    return _eleves_sanitizeForSerialization({ global: globalStats, parClasse: list });
  } catch (e) {
    console.error('Erreur dans getElevesStats:', e);
    return {global: {COM: 0, TRA: 0, PART: 0}, parClasse: []};
  }
}

function getINTScores() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const intSheets = sheets.filter(sheet => /INT$/i.test(sheet.getName()));
    if (intSheets.length === 0) return { success: false, error: 'Aucun fichier INT trouvé' };

    const scores = [];
    intSheets.forEach(sheet => {
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return;
      const headers = data[0].map(h => String(h || '').toUpperCase());
      const idCol = headers.findIndex(h => h === 'ID' || h === 'ID_ELEVE');
      const mathCol = headers.findIndex(h => h === 'MATH' || h === 'MATHEMATIQUES');
      const frCol = headers.findIndex(h => h === 'FR' || h === 'FRANCAIS' || h === 'FRANÇAIS');
      if (idCol === -1) return;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const id = String(row[idCol] || '').trim();
        if (!id) continue;
        const score = { id, MATH: null, FR: null, source: sheet.getName() };

        if (mathCol !== -1 && row[mathCol] !== undefined && row[mathCol] !== '') {
          const mathScore = parseFloat(row[mathCol]);
          if (!isNaN(mathScore) && mathScore >= 0 && mathScore <= 20) score.MATH = mathScore > 4 ? (mathScore / 5) : mathScore;
        }
        if (frCol !== -1 && row[frCol] !== undefined && row[frCol] !== '') {
          const frScore = parseFloat(row[frCol]);
          if (!isNaN(frScore) && frScore >= 0 && frScore <= 20) score.FR = frScore > 4 ? (frScore / 5) : frScore;
        }
        if (score.MATH !== null || score.FR !== null) scores.push(score);
      }
    });

    return { success: true, scores, count: scores.length, sources: intSheets.map(s => s.getName()) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/******************** Optimisation (inchangé, version courte) *************************/
// (tu peux garder tes fonctions d'optimisation avancées si tu les utilises réellement)
// ... createRandomSolution, evaluateSolutionAdvanced, selectParent, crossover, mutate, etc.
// (Par souci de concision, je ne les recolle pas ici ; reprends tes versions si besoin.)

/*************************** include() pour templates *******************************/
// Fonction include pour inclure d'autres fichiers HTML dans les templates
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    console.error('Erreur include:', error);
    return '';
  }
}

/*************************** doGet *******************************/
function doGet(e) {
  // ✅ CORRECTION : Utiliser createTemplateFromFile pour évaluer les <?!= include() ?>
  const template = HtmlService.createTemplateFromFile('InterfaceV2');
  return template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Répartition Classes - Interface Compacte avec Swaps');
}

/************************* Fonctions de test **************************/
function testGetStructureRules() { const rules = getStructureRules(); console.log('Règles depuis _STRUCTURE:', JSON.stringify(rules, null, 2)); return rules; }
function testGetElevesDataV2() {
  const result = getElevesData(); console.log('Résultat getElevesData:', JSON.stringify(result, null, 2));
  if (result.length > 0) { console.log('\nRésumé:'); result.forEach(group => { console.log(`- ${group.classe}: ${group.eleves.length} élèves`); }); }
  return result;
}

/**
 * Lit les règles depuis _OPTI_CONFIG
 * Retourne format compatible avec _STRUCTURE pour InterfaceV2
 * @returns {Object|null} Règles ou null si erreur/absent
 */
function getOptiConfigRules_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const optiSheet = ss.getSheetByName('_OPTI_CONFIG');

    if (!optiSheet) {
      console.log('📊 _OPTI_CONFIG non trouvé');
      return null;
    }

    const data = optiSheet.getDataRange().getValues();
    const rules = {};

    // Parser _OPTI_CONFIG pour extraire targets.byClass et offers.byClass
    for (let i = 1; i < data.length; i++) {
      const key = String(data[i][0] || '').trim();
      const value = String(data[i][1] || '').trim();

      // targets.byClass = {"6°1":25,"6°2":24,...}
      if (key === 'targets.byClass') {
        try {
          const targets = JSON.parse(value);
          Object.keys(targets).forEach(function(classe) {
            if (!rules[classe]) rules[classe] = { capacity: 0, quotas: {} };
            rules[classe].capacity = targets[classe];
          });
        } catch (e) {
          console.log('⚠️ Erreur parsing targets.byClass : ' + e.message);
        }
      }

      // offers.byClass = {"6°1":{"ITA":6,"CHAV":10},...}
      if (key === 'offers.byClass') {
        try {
          const offers = JSON.parse(value);
          Object.keys(offers).forEach(function(classe) {
            if (!rules[classe]) rules[classe] = { capacity: 0, quotas: {} };
            rules[classe].quotas = offers[classe];
          });
        } catch (e) {
          console.log('⚠️ Erreur parsing offers.byClass : ' + e.message);
        }
      }
    }

    const count = Object.keys(rules).length;
    if (count > 0) {
      console.log('✅ Règles chargées depuis _OPTI_CONFIG : ' + count + ' classes');
      return rules;
    } else {
      console.log('⚠️ _OPTI_CONFIG existe mais aucune règle trouvée');
      return null;
    }

  } catch (e) {
    console.log('⚠️ Erreur lecture _OPTI_CONFIG : ' + e.message);
    return null;
  }
}

/**
 * Détection intelligente : quelle source de règles utiliser ?
 * PRIORITÉ :
 * 1. Si _BASEOPTI existe ET date récente (< 24h) → _OPTI_CONFIG
 * 2. Sinon → _STRUCTURE (défaut)
 * @returns {Object} Règles actives
 */
function getActiveRules_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baseopti = ss.getSheetByName('_BASEOPTI');

  // Vérifier si OPTI a tourné récemment
  if (baseopti) {
    try {
      // Vérifier timestamp de _BASEOPTI
      const lastModified = baseopti.getLastUpdated();
      const now = new Date();
      const hoursSince = (now - lastModified) / (1000 * 60 * 60);

      console.log('📊 _BASEOPTI détecté, dernière modification : ' + hoursSince.toFixed(1) + 'h');

      // Si _BASEOPTI modifié il y a moins de 24h → utiliser _OPTI_CONFIG
      if (hoursSince < 24) {
        console.log('📊 Détection : OPTI utilisé récemment (< 24h) → tentative lecture _OPTI_CONFIG');
        const optiRules = getOptiConfigRules_();
        if (optiRules && Object.keys(optiRules).length > 0) {
          console.log('✅ Utilisation des règles depuis _OPTI_CONFIG');
          return optiRules;
        } else {
          console.log('⚠️ _OPTI_CONFIG invalide ou vide → fallback _STRUCTURE');
        }
      } else {
        console.log('📊 _BASEOPTI trop ancien (> 24h) → utilisation _STRUCTURE');
      }
    } catch (e) {
      console.log('⚠️ Erreur détection _BASEOPTI : ' + e.message + ' → fallback _STRUCTURE');
    }
  } else {
    console.log('📊 _BASEOPTI absent → utilisation _STRUCTURE (défaut)');
  }

  // Fallback : _STRUCTURE (toujours disponible)
  console.log('✅ Utilisation des règles depuis _STRUCTURE');
  return getStructureRules();
}

/**
 * Fonction attendue par l'interface V2 pour charger les classes et règles
 * Détection automatique : _OPTI_CONFIG (si récent) ou _STRUCTURE (défaut)
 * @param {string} mode - 'TEST', 'CACHE', 'INT', 'FIN', 'PREVIOUS'
 */
function getClassesData(mode) {
  try {
    const data = getElevesDataForMode(mode);

    // ✅ DÉTECTION INTELLIGENTE : Utiliser _OPTI_CONFIG si disponible, sinon _STRUCTURE
    const rules = getActiveRules_();

    return { success: true, data, rules };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/******************** FINALISATION – créer onglets <classe>FIN ********************/

/**
 * Formate un onglet FIN avec mise en forme professionnelle et moyennes
 * @param {Sheet} sheet - L'onglet à formater
 * @param {Array} rowData - Les données des élèves
 * @param {Array} header - L'en-tête des colonnes
 */
function formatFinSheet(sheet, rowData, header) {
  try {
    const numRows = rowData.length;
    if (numRows === 0) return;

    // ========== 1. LARGEURS DES COLONNES ==========
    sheet.setColumnWidth(4, 240);   // D: NOM & PRENOM
    sheet.setColumnWidth(5, 70);    // E: SEXE
    sheet.setColumnWidth(6, 90);    // F: LV2
    sheet.setColumnWidth(7, 110);   // G: OPT
    sheet.setColumnWidth(8, 75);    // H: COM
    sheet.setColumnWidth(9, 75);    // I: TRA
    sheet.setColumnWidth(10, 75);   // J: PART
    sheet.setColumnWidth(11, 75);   // K: ABS
    sheet.setColumnWidth(12, 90);   // L: DISPO
    sheet.setColumnWidth(13, 80);   // M: ASSO
    sheet.setColumnWidth(14, 80);   // N: DISSO
    sheet.setColumnWidth(15, 130);  // O: SOURCE

    // ========== 2. EN-TÊTE (ligne 1) - Violet foncé + Blanc gras + Capitales ==========
    const headerRange = sheet.getRange(1, 1, 1, header.length);
    headerRange
      .setBackground('#5b21b6')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(11)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    // Mettre en capitales
    const headerValues = header.map(h => String(h).toUpperCase());
    sheet.getRange(1, 1, 1, header.length).setValues([headerValues]);

    // ========== 3. FORMATAGE COLONNE D (NOM & PRENOM) - Gras 14pt ==========
    if (numRows > 0) {
      const namesRange = sheet.getRange(2, 4, numRows, 1);
      namesRange.setFontWeight('bold').setFontSize(14);
    }

    // ========== 4. FORMATAGE COLONNE E (SEXE) - F=rose, M=bleu ==========
    if (numRows > 0) {
      for (let r = 0; r < numRows; r++) {
        const sexeValue = String(rowData[r][4] || '').toUpperCase().trim(); // colonne 5 = index 4
        const sexeCell = sheet.getRange(r + 2, 5);

        sexeCell.setFontWeight('bold').setFontColor('#000000');

        if (sexeValue === 'F') {
          // F = Fond rose
          sexeCell.setBackground('#fce7f3');
        } else if (sexeValue === 'M') {
          // M = Fond bleu
          sexeCell.setBackground('#dbeafe');
        }
      }
    }

    // ========== 5. FORMATAGE COLONNE F (LV2) - ITA=vert, ESP=orange, autres=noir+blanc ==========
    if (numRows > 0) {
      for (let r = 0; r < numRows; r++) {
        const lv2Value = String(rowData[r][5] || '').toUpperCase().trim(); // colonne 6 = index 5
        const lv2Cell = sheet.getRange(r + 2, 6);

        if (lv2Value === 'ITA' || lv2Value === 'ITALIEN') {
          // ITA = Vert
          lv2Cell.setBackground('#86efac').setFontWeight('bold').setFontColor('#000000');
        } else if (lv2Value === 'ESP' || lv2Value === 'ESPAGNOL') {
          // ESP = Orange
          lv2Cell.setBackground('#fb923c').setFontWeight('bold').setFontColor('#000000');
        } else if (lv2Value) {
          // Autres langues = Fond noir + texte blanc
          lv2Cell.setBackground('#000000').setFontWeight('bold').setFontColor('#ffffff');
        }
      }
    }

    // ========== 6. FORMATAGE COLONNE G (OPT) - CHAV=violet, autres=gris ==========
    if (numRows > 0) {
      for (let r = 0; r < numRows; r++) {
        const optValue = String(rowData[r][6] || '').toUpperCase().trim(); // colonne 7 = index 6
        const optCell = sheet.getRange(r + 2, 7);

        if (optValue === 'CHAV') {
          // CHAV = Fond violet + texte blanc
          optCell.setBackground('#5b21b6').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
        } else if (optValue) {
          // Autres options = Fond gris + texte noir
          optCell.setBackground('#d1d5db').setFontColor('#000000').setFontWeight('bold').setHorizontalAlignment('center');
        }
      }
    }

    // ========== 7. FORMATAGE COLONNE M (ASSO) - Gras noir + Fond bleu SI REMPLI ==========
    if (numRows > 0) {
      for (let r = 0; r < numRows; r++) {
        const assoValue = String(rowData[r][12] || '').trim(); // colonne 13 = index 12
        const assoCell = sheet.getRange(r + 2, 13);

        // Toujours mettre en gras noir
        assoCell.setFontWeight('bold').setFontColor('#000000');

        if (assoValue) {
          // Fond bleu uniquement si rempli
          assoCell.setBackground('#3b82f6').setFontColor('#ffffff');
        }
      }
    }

    // ========== 8. FORMATAGE COLONNE N (DISSO) - Blanc gras sur bleu UNIQUEMENT SI REMPLI ==========
    if (numRows > 0) {
      for (let r = 0; r < numRows; r++) {
        const dissoValue = String(rowData[r][13] || '').trim(); // colonne 14 = index 13
        const dissoCell = sheet.getRange(r + 2, 14);

        if (dissoValue) {
          // Uniquement colorier si la cellule est remplie
          dissoCell.setBackground('#3b82f6').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
        }
      }
    }

    // ========== 9. FORMATAGE CONDITIONNEL DES SCORES (colonnes H, I, J, K) ==========
    if (numRows > 0) {
      const scoreColumns = [8, 9, 10, 11]; // H, I, J, K

      for (let col of scoreColumns) {
        for (let r = 0; r < numRows; r++) {
          const scoreValue = rowData[r][col - 1]; // index = col - 1
          const scoreCell = sheet.getRange(r + 2, col);
          scoreCell.setHorizontalAlignment('center').setFontWeight('bold');

          if (scoreValue === 1 || scoreValue === '1') {
            // Score 1 = Rouge + Blanc gras
            scoreCell.setBackground('#dc2626').setFontColor('#ffffff');
          } else if (scoreValue === 2 || scoreValue === '2') {
            // Score 2 = Jaune CLAIR + Noir gras
            scoreCell.setBackground('#fde047').setFontColor('#000000');
          } else if (scoreValue === 3 || scoreValue === '3') {
            // Score 3 = Vert clair + Noir gras
            scoreCell.setBackground('#86efac').setFontColor('#000000');
          } else if (scoreValue === 4 || scoreValue === '4') {
            // Score 4 = Vert foncé + Blanc gras
            scoreCell.setBackground('#16a34a').setFontColor('#ffffff');
          }
        }
      }
    }

    // ========== 10. CENTRAGE DES COLONNES E à O (sauf D) ==========
    if (numRows > 0) {
      const centerCols = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // E à N
      centerCols.forEach(col => {
        sheet.getRange(2, col, numRows, 1).setHorizontalAlignment('center');
      });
    }

    // ========== 11. BORDURES POUR TOUTES LES DONNÉES ==========
    if (numRows > 0) {
      const dataRange = sheet.getRange(2, 1, numRows, header.length);
      dataRange.setBorder(true, true, true, true, true, true, '#d1d5db', SpreadsheetApp.BorderStyle.SOLID);
    }

    // ========== 12. MOYENNES DYNAMIQUES AVEC FORMULES ==========
    // Position : 2 lignes après le dernier élève
    const avgRow = numRows + 4; // +2 pour l'en-tête, +2 lignes vides

    // Écrire "MOYENNE" dans la colonne D
    sheet.getRange(avgRow, 4).setValue('MOYENNE').setFontWeight('bold').setFontSize(12).setHorizontalAlignment('right');

    // Créer des formules AVERAGE pour les colonnes H, I, J, K
    const firstDataRow = 2;
    const lastDataRow = numRows + 1;

    // Formule pour COM (colonne H)
    sheet.getRange(avgRow, 8).setFormula(`=AVERAGE(H${firstDataRow}:H${lastDataRow})`);
    // Formule pour TRA (colonne I)
    sheet.getRange(avgRow, 9).setFormula(`=AVERAGE(I${firstDataRow}:I${lastDataRow})`);
    // Formule pour PART (colonne J)
    sheet.getRange(avgRow, 10).setFormula(`=AVERAGE(J${firstDataRow}:J${lastDataRow})`);
    // Formule pour ABS (colonne K)
    sheet.getRange(avgRow, 11).setFormula(`=AVERAGE(K${firstDataRow}:K${lastDataRow})`);

    // Formater la ligne des moyennes (fond gris clair + gras + centré)
    const avgRange = sheet.getRange(avgRow, 4, 1, 8); // D à K
    avgRange
      .setBackground('#f3f4f6')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setFontSize(11)
      .setNumberFormat('0.00')
      .setBorder(true, true, true, true, false, false, '#9ca3af', SpreadsheetApp.BorderStyle.SOLID);

    // ========== 13. FIGER L'EN-TÊTE ==========
    sheet.setFrozenRows(1);

    console.log(`✅ Formatage FIN appliqué : ${numRows} élèves, moyennes DYNAMIQUES ligne ${avgRow}`);

  } catch (error) {
    console.error('❌ Erreur dans formatFinSheet:', error);
  }
}

/**
 * Construit un index des classes d'origine à partir de l'onglet CONSOLIDATION.
 * @returns {Object} Un objet mappant ID_ELEVE -> SOURCE.
 */
function buildSourceIndexFromConsolidation() {
  const sourceIndex = {};
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const consolidationSheet = ss.getSheetByName('CONSOLIDATION');
    if (!consolidationSheet) {
      console.warn('Onglet CONSOLIDATION introuvable. La source ne sera pas corrigée.');
      return sourceIndex;
    }

    const data = consolidationSheet.getDataRange().getValues();
    const header = data[0].map(h => h.toString().toUpperCase().trim());
    
    const idCol = header.indexOf('ID_ELEVE');
    const sourceCol = header.indexOf('SOURCE');

    if (idCol === -1 || sourceCol === -1) {
      console.warn('Colonnes ID_ELEVE ou SOURCE introuvables dans CONSOLIDATION.');
      return sourceIndex;
    }

    for (let i = 1; i < data.length; i++) {
      const id = data[i][idCol] ? data[i][idCol].toString().trim() : null;
      const source = data[i][sourceCol] ? data[i][sourceCol].toString().trim() : null;
      if (id && source) {
        sourceIndex[id] = source;
      }
    }
    console.log('Index de source créé depuis CONSOLIDATION pour ' + Object.keys(sourceIndex).length + ' élèves.');
  } catch (e) {
    console.error('Erreur lors de la création de l\'index de source depuis CONSOLIDATION:', e);
  }
  return sourceIndex;
}

/**
 * Finalise les classes en créant les onglets définitifs visibles <classe>FIN
 * @param {Object} disposition - mapping {classe: [id1, id2, ...]}
 * @param {string} mode - source ('TEST','CACHE','WIP','INT','FIN' ...)
 */
function finalizeClasses(disposition, mode) {
  try {
    if (!disposition || typeof disposition !== 'object') return { success: false, error: 'Disposition invalide' };

    const sourceIndex = buildSourceIndexFromConsolidation();
    const targetMode = (mode || 'TEST').toUpperCase();
    console.log('💾 Finalisation depuis le mode: ' + targetMode);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const header = [
      'ID_ELEVE','NOM','PRENOM','NOM & PRENOM','SEXE','LV2','OPT','COM','TRA','PART','ABS',
      'DISPO','ASSO','DISSO','SOURCE','FIXE','CLASSE_FINALE','CLASSE DEF','','MOBILITE','SCORE F','SCORE M','GROUP'
    ];

    const elevesData = getElevesDataForMode(targetMode);
    const elevesIndex = {};
    elevesData.forEach(grp => { grp.eleves.forEach(e => { elevesIndex[e.id] = e; }); });

    Object.keys(disposition).forEach(classe => {
      const eleveIds = disposition[classe] || [];
      const rowData = eleveIds.map(id => {
        const e = elevesIndex[id];
        if (!e) {
          return [ id,'','',id,'','','', '', '', '', '', '', '', '', sourceIndex[id] || '', '', classe, classe, '', 'LIBRE', '', '', '' ];
        }
        let lv2 = (e.lv2 || '').toString().trim().toUpperCase();
        const finalSource = sourceIndex[id] || e.source || '';
        return [
          e.id, e.nom || '', e.prenom || '', (e.nom || '') + ' ' + (e.prenom || ''),
          e.sexe || '', lv2, e.opt || '', e.scores?.COM ?? '', e.scores?.TRA ?? '', e.scores?.PART ?? '', e.scores?.ABS ?? '',
          e.dispo || '', e.asso || '', e.disso || '', finalSource, '',
          classe, classe, '', e.mobilite || 'LIBRE', '', '', ''
        ];
      });
      if (rowData.length === 0) rowData.push(Array(header.length).fill(''));

      const sheetName = classe + 'FIN';
      let sh = ss.getSheetByName(sheetName);
      if (sh) sh.clear(); else sh = ss.insertSheet(sheetName);

      sh.getRange(1, 1, 1, header.length).setValues([header]);
      if (rowData.length > 0) {
        sh.getRange(2, 1, rowData.length, header.length).setValues(rowData);
      }

      // ✅ FORMATAGE PROFESSIONNEL AVEC MOYENNES
      formatFinSheet(sh, rowData, header);

      // Cacher les colonnes non utilisées (A, B, C, P+)
      const hiddenCols = [1, 2, 3, 16, 17, 18, 19, 20, 21, 22, 23];
      hiddenCols.forEach(idx => {
        try {
          if (idx <= header.length) sh.hideColumns(idx, 1);
        } catch(e) {}
      });
    });

    console.log('✅ Classes finalisées en <classe>FIN');
    return { success: true, message: '✅ ' + Object.keys(disposition).length + ' classe(s) finalisée(s)' };
  } catch (e) {
    console.error('❌ Erreur dans finalizeClasses:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * 🔑 FONCTION CRITIQUE POUR LE MODULE GROUPES
 * Charge les onglets FIN COMPLETS avec toutes les colonnes (y compris SCORE F et SCORE M)
 * Appelée depuis groupsModuleComplete.html pour alimenter le module de répartition en groupes
 */
function loadFINSheetsWithScores() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets().filter(sh => {
      const name = sh.getName();
      return name.endsWith('FIN') && name !== '_STRUCTURE';
    });

    console.log('📋 Chargement des onglets FIN avec scores... Trouvés: ' + sheets.length);

    const result = {};

    sheets.forEach(sh => {
      const name = sh.getName();
      const className = name.replace('FIN', '').trim(); // "6°1FIN" → "6°1"

      const values = sh.getDataRange().getValues();
      if (values.length < 2) {
        console.warn('⚠️ Onglet ' + name + ' vide ou incomplet');
        return;
      }

      const eleves = [];
      const data = values.slice(1); // Sauter la ligne d'en-tête

      data.forEach((row, idx) => {
        if (!row[0]) return; // Sauter les lignes vides (colonne A vide)

        // Parser selon le mapping établi :
        // A(0): ID_ELEVE
        // B(1): NOM
        // C(2): PRENOM
        // D(3): NOM & PRENOM (ignoré, on recalcule)
        // E(4): SEXE
        // F(5): LV2
        // G(6): OPT
        // H(7): COM
        // I(8): TRA
        // J(9): PART
        // K(10): ABS
        // O(14): SOURCE ← classe d'origine/année précédente
        // U(20): SCORE F ← CRITIQUE
        // V(21): SCORE M ← CRITIQUE

        const scoreF = parseFloat(row[20]) || 0;
        const scoreM = parseFloat(row[21]) || 0;

        // ⚠️ Vérification : si SCORE F et SCORE M sont tous les deux à 0, c'est peut-être un problème
        if (scoreF === 0 && scoreM === 0) {
          console.warn('⚠️ ' + className + ' - Élève ' + row[0] + ': SCORE F et SCORE M à 0');
        }

        const eleve = {
          id: (row[0] || '').toString().trim(),
          nom: (row[1] || '').toString().trim(),
          prenom: (row[2] || '').toString().trim(),
          sexe: (row[4] || '').toString().trim().toUpperCase(),
          lv2: (row[5] || '').toString().trim(),
          opt: (row[6] || '').toString().trim(),
          source: (row[14] || '').toString().trim(),  // Colonne O : classe d'origine
          scores: {
            // 🔑 SCORES ACADÉMIQUES (CRITIQUES POUR L'ALGORITHME DE GROUPES)
            F: scoreF,    // Colonne U : Score Français
            M: scoreM,    // Colonne V : Score Mathématiques
            // 🔹 SCORES COMPORTEMENTAUX
            COM: parseFloat(row[7]) || 0,
            TRA: parseFloat(row[8]) || 0,
            PART: parseFloat(row[9]) || 0,
            ABS: parseFloat(row[10]) || 0
          },
          // 🔑 COLONNES CRITIQUES POUR L'ALGORITHME DE GROUPES (duplicata top-level)
          scoreF: scoreF,  // Colonne U : Score Français
          scoreM: scoreM   // Colonne V : Score Mathématiques
        };

        eleves.push(eleve);
      });

      result[className] = { eleves };
      console.log('✅ ' + className + ': ' + eleves.length + ' élève(s) chargés');
    });

    console.log('✅ loadFINSheetsWithScores terminé - ' + Object.keys(result).length + ' classe(s)');
    return { success: true, data: result };
  } catch (e) {
    console.error('❌ Erreur dans loadFINSheetsWithScores:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/******************** Logging + checksum *************************/
function generateChecksum(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return '';
  const concatenated = ids.slice().sort().join('|');
  let hash = 0;
  for (let i = 0; i < concatenated.length; i++) {
    const char = concatenated.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
function logSaveOperation(operation, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('_SAVE_LOG');
    if (!logSheet) {
      logSheet = ss.insertSheet('_SAVE_LOG');
      logSheet.appendRow(['Timestamp', 'User', 'Operation', 'Status', 'Details']);
      logSheet.hideSheet();
    }
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail();
    logSheet.appendRow([
      timestamp,
      user,
      operation,
      details.success ? 'SUCCESS' : 'FAILURE',
      JSON.stringify(details)
    ]);
  } catch (err) { /* on n'empêche pas l'opération si le log échoue */ }
}

/******************** Sécurité admin – stub ********************/
/** 
 * Vérifie un mot de passe admin
 * Accepte : 
 * 1. Le mot de passe configuré dans PropertiesService (ADMIN_PASSWORD)
 * 2. Le mot de passe par défaut 'admin123'
 */
function verifierMotDePasseAdmin(password) {
  // Nettoyer le mot de passe entré
  const inputPassword = String(password || '').trim();
  
  // Récupérer le mot de passe configuré (si existe)
  const configuredPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  
  // Mots de passe acceptés
  const validPasswords = ['admin123'];
  if (configuredPassword) {
    validPasswords.push(configuredPassword);
  }
  
  // Vérifier si le mot de passe entré correspond à l'un des mots de passe valides
  const ok = validPasswords.includes(inputPassword);
  
  // Logger pour debug (à retirer en production)
  if (!ok) {
    console.log('Tentative de connexion admin échouée avec mot de passe:', inputPassword);
  }
  
  return { success: ok };
}

/******************** MODULE GROUPES ********************/
/**
 * Compte le nombre de groupes (onglets A1, B2, etc.)
 */
function getGroupsCount() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const groupSheets = sheets.filter(sh => {
      const name = sh.getName();
      return /^[A-Z]\d+$/i.test(name); // A1, B2, C3, etc.
    });
    return { success: true, count: groupSheets.length };
  } catch (e) {
    console.error('Erreur getGroupsCount:', e);
    return { success: false, error: e.toString(), count: 0 };
  }
}

/**
 * Récupère tous les groupes avec leurs élèves
 */
function getGroups() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const groups = [];
    
    sheets.forEach(sh => {
      const name = sh.getName();
      if (!/^[A-Z]\d+$/i.test(name)) return; // Seulement A1, B2, etc.
      
      const data = sh.getDataRange().getValues();
      if (data.length < 2) return;
      
      const header = data[0].map(h => String(h).toUpperCase().trim());
      const idCol = header.indexOf('ID_ELEVE') !== -1 ? header.indexOf('ID_ELEVE') : header.indexOf('ID');
      
      if (idCol === -1) return;
      
      const eleves = [];
      for (let i = 1; i < data.length; i++) {
        const id = String(data[i][idCol] || '').trim();
        if (id) eleves.push(id);
      }
      
      if (eleves.length > 0) {
        groups.push({
          nom: name,
          eleves: eleves,
          count: eleves.length
        });
      }
    });
    
    return { success: true, groups: groups, count: groups.length };
  } catch (e) {
    console.error('Erreur getGroups:', e);
    return { success: false, error: e.toString(), groups: [] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JOURNALISATION & SNAPSHOTS DES GROUPES
// ═══════════════════════════════════════════════════════════════════════════════

const GROUPS_AUDIT_SHEET = '_AUDIT_LOG';
const GROUPS_SNAPSHOT_SHEET = '_GROUP_SNAPSHOTS';
const GROUPS_MAX_SNAPSHOTS_PER_TYPE = 5;

function ensureSheet_(name, headers, options) {
  const opts = options || {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (opts.hidden !== false) {
      sheet.hideSheet();
    }
  }

  if (headers && headers.length) {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function ensureAuditLogSheet_() {
  const headers = [
    'TIMESTAMP',
    'OPERATION',
    'TYPE',
    'PREFIX',
    'GROUP_COUNT',
    'STATUS',
    'MESSAGE',
    'METADATA_JSON',
    'SNAPSHOT_ID',
    'AUTHOR'
  ];

  return ensureSheet_(GROUPS_AUDIT_SHEET, headers, { hidden: true });
}

function ensureSnapshotSheet_() {
  const headers = [
    'SNAPSHOT_ID',
    'TIMESTAMP',
    'TYPE',
    'PREFIX',
    'GROUP_COUNT',
    'METADATA_JSON',
    'GROUPS_JSON',
    'AUTHOR'
  ];

  return ensureSheet_(GROUPS_SNAPSHOT_SHEET, headers, { hidden: true });
}

function getActiveUserEmail_() {
  try {
    const email = Session.getActiveUser()?.getEmail?.();
    return email || '';
  } catch (e) {
    console.warn('⚠️ Impossible de récupérer l\'email utilisateur:', e);
    return '';
  }
}

function logGroupOperation(entry) {
  try {
    const sheet = ensureAuditLogSheet_();
    const timestamp = new Date();
    const row = [
      timestamp,
      entry?.operation || 'UNKNOWN',
      entry?.type || '',
      entry?.prefix || '',
      entry?.groupCount || 0,
      entry?.status || 'INFO',
      entry?.message || '',
      entry?.metadata ? JSON.stringify(entry.metadata) : '',
      entry?.snapshotId || '',
      getActiveUserEmail_()
    ];

    sheet.appendRow(row);
  } catch (e) {
    console.error('❌ Erreur logGroupOperation:', e);
  }
}

function pruneSnapshotsByType_(type) {
  try {
    const sheet = ensureSnapshotSheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    const header = data[0];
    const rows = data.slice(1);
    const typeIdx = header.indexOf('TYPE');
    const timestampIdx = header.indexOf('TIMESTAMP');

    if (typeIdx === -1 || timestampIdx === -1) return;

    const entries = rows
      .map((row, idx) => ({
        rowNumber: idx + 2,
        type: row[typeIdx],
        timestamp: row[timestampIdx] instanceof Date ? row[timestampIdx] : new Date(row[timestampIdx])
      }))
      .filter(entry => !type || entry.type === type)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (entries.length <= GROUPS_MAX_SNAPSHOTS_PER_TYPE) {
      return;
    }

    const toDelete = entries.slice(0, entries.length - GROUPS_MAX_SNAPSHOTS_PER_TYPE);
    toDelete.reverse().forEach(entry => {
      try {
        sheet.deleteRow(entry.rowNumber);
      } catch (error) {
        console.error('❌ Erreur suppression snapshot obsolète:', error);
      }
    });
  } catch (e) {
    console.error('❌ Erreur pruneSnapshotsByType_:', e);
  }
}

function normalizeSnapshotStudent_(header, row) {
  const normalizedHeader = header.map(h => String(h).toUpperCase().trim());
  const getValue = key => {
    const idx = normalizedHeader.indexOf(key);
    if (idx === -1) return '';
    return row[idx] !== undefined ? row[idx] : '';
  };

  const scores = {
    F: getValue('SCORE_F') || getValue('F'),
    M: getValue('SCORE_M') || getValue('M'),
    COM: getValue('COM'),
    TRA: getValue('TRA'),
    PART: getValue('PART'),
    ABS: getValue('ABS')
  };

  return {
    id: getValue('ID_ELEVE') || getValue('ID'),
    nom: getValue('NOM'),
    prenom: getValue('PRENOM'),
    sexe: getValue('SEXE'),
    classe: getValue('CLASSE'),
    lv2: getValue('LV2'),
    opt: getValue('OPT'),
    source: getValue('SOURCE'),
    scores: scores,
    com: scores.COM,
    tra: scores.TRA,
    part: scores.PART,
    abs: scores.ABS
  };
}

function createGroupSnapshot(request) {
  try {
    if (!request || !Array.isArray(request.groups)) {
      return { success: false, error: 'Payload snapshot invalide (groups manquants)' };
    }

    const sheet = ensureSnapshotSheet_();
    const timestamp = new Date();
    const snapshotId = `${request.type || 'grp'}_${timestamp.getTime()}`;
    const metadata = request.metadata || request.config || {};
    const payload = {
      type: request.type || '',
      prefix: request.prefix || '',
      config: metadata,
      groups: request.groups.map((group, index) => ({
        name: group.name || `Groupe ${index + 1}`,
        students: Array.isArray(group.students) ? group.students : []
      }))
    };

    sheet.appendRow([
      snapshotId,
      timestamp,
      payload.type,
      payload.prefix,
      payload.groups.length,
      JSON.stringify(payload.config || {}),
      JSON.stringify(payload.groups || []),
      getActiveUserEmail_()
    ]);

    pruneSnapshotsByType_(payload.type);

    logGroupOperation({
      operation: 'CREATE_SNAPSHOT',
      type: payload.type,
      prefix: payload.prefix,
      groupCount: payload.groups.length,
      status: 'SUCCESS',
      message: 'Snapshot créé',
      metadata: payload.config,
      snapshotId: snapshotId
    });

    return {
      success: true,
      snapshotId: snapshotId,
      timestamp: timestamp.toISOString(),
      type: payload.type,
      groupCount: payload.groups.length
    };
  } catch (e) {
    console.error('❌ Erreur createGroupSnapshot:', e);
    logGroupOperation({
      operation: 'CREATE_SNAPSHOT',
      status: 'ERROR',
      message: e.toString()
    });
    return { success: false, error: e.toString() };
  }
}

function listGroupSnapshots(params) {
  try {
    const sheet = ensureSnapshotSheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, snapshots: [] };
    }

    const header = data[0];
    const rows = data.slice(1);
    const typeFilter = params?.type || null;

    const idx = {
      id: header.indexOf('SNAPSHOT_ID'),
      timestamp: header.indexOf('TIMESTAMP'),
      type: header.indexOf('TYPE'),
      prefix: header.indexOf('PREFIX'),
      count: header.indexOf('GROUP_COUNT'),
      metadata: header.indexOf('METADATA_JSON')
    };

    const snapshots = rows
      .map(row => ({
        snapshotId: row[idx.id],
        timestamp: row[idx.timestamp] instanceof Date ? row[idx.timestamp].toISOString() : new Date(row[idx.timestamp]).toISOString(),
        type: row[idx.type],
        prefix: row[idx.prefix],
        groupCount: row[idx.count],
        metadata: row[idx.metadata] ? JSON.parse(row[idx.metadata]) : {}
      }))
      .filter(snap => !typeFilter || snap.type === typeFilter)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      success: true,
      snapshots: snapshots.slice(0, GROUPS_MAX_SNAPSHOTS_PER_TYPE)
    };
  } catch (e) {
    console.error('❌ Erreur listGroupSnapshots:', e);
    return { success: false, error: e.toString(), snapshots: [] };
  }
}

function restoreFromSnapshot(params) {
  try {
    if (!params || !params.snapshotId) {
      return { success: false, error: 'snapshotId manquant' };
    }

    const sheet = ensureSnapshotSheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: false, error: 'Aucun snapshot enregistré' };
    }

    const header = data[0];
    const rows = data.slice(1);
    const idIdx = header.indexOf('SNAPSHOT_ID');
    const metadataIdx = header.indexOf('METADATA_JSON');
    const groupsIdx = header.indexOf('GROUPS_JSON');
    const typeIdx = header.indexOf('TYPE');
    const prefixIdx = header.indexOf('PREFIX');
    const timestampIdx = header.indexOf('TIMESTAMP');

    const row = rows.find(r => r[idIdx] === params.snapshotId);
    if (!row) {
      return { success: false, error: 'Snapshot introuvable' };
    }

    const metadata = row[metadataIdx] ? JSON.parse(row[metadataIdx]) : {};
    const groups = row[groupsIdx] ? JSON.parse(row[groupsIdx]) : [];

    logGroupOperation({
      operation: 'RESTORE_SNAPSHOT',
      type: row[typeIdx],
      prefix: row[prefixIdx],
      groupCount: Array.isArray(groups) ? groups.length : 0,
      status: 'SUCCESS',
      message: `Snapshot ${params.snapshotId} restauré`,
      metadata: metadata,
      snapshotId: params.snapshotId
    });

    return {
      success: true,
      snapshotId: params.snapshotId,
      type: row[typeIdx],
      prefix: row[prefixIdx],
      timestamp: row[timestampIdx] instanceof Date ? row[timestampIdx].toISOString() : new Date(row[timestampIdx]).toISOString(),
      metadata: metadata,
      groups: groups
    };
  } catch (e) {
    console.error('❌ Erreur restoreFromSnapshot:', e);
    logGroupOperation({
      operation: 'RESTORE_SNAPSHOT',
      status: 'ERROR',
      message: e.toString(),
      snapshotId: params?.snapshotId
    });
    return { success: false, error: e.toString() };
  }
}

/**
 * Sauvegarde un groupe dans un onglet
 *
 * CORRECTION V2 : Accepte soit un tableau d'IDs (legacy),
 * soit un tableau d'objets élèves complets (si options.isFullData = true).
 *
 * @param {string} groupName - Nom de l'onglet à créer (ex: "grBe1TEMP")
 * @param {Array} data - Tableau (soit des IDs, soit des objets élèves)
 * @param {Object} options - { isFullData: boolean }
 */
function saveGroup(groupName, data, options = {}) {
  try {
    const isFullData = options.isFullData || false;

    if (!groupName || !Array.isArray(data)) {
      return { success: false, error: 'Paramètres invalides' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(groupName);
    if (sh) {
      sh.clear();
    } else {
      sh = ss.insertSheet(groupName);
    }

    let header;
    let rowData;

    if (isFullData) {
      // NOUVELLE LOGIQUE : 'data' est un tableau d'objets student
      console.log(`saveGroup [isFullData=true] pour ${groupName} avec ${data.length} élèves.`);

      // Définir un en-tête standardisé pour les groupes
      header = [
        'ID_ELEVE', 'NOM', 'PRENOM', 'SEXE', 'CLASSE',
        'SCORE_F', 'SCORE_M',
        'COM', 'TRA', 'PART', 'ABS',
        'LV2', 'OPT', 'SOURCE'
      ];

      rowData = data.map(s => {
        // CORRECTIF B : Normaliser les scores F et M avec fallback robuste
        const scoreF = Number(s?.scores?.F ?? s?.scoreF ?? 0);
        const scoreM = Number(s?.scores?.M ?? s?.scoreM ?? 0);
        return [
          s.id || '',
          s.nom || '',
          s.prenom || '',
          s.sexe || '',
          s.classe || '',
          Number.isFinite(scoreF) ? scoreF : 0,
          Number.isFinite(scoreM) ? scoreM : 0,
          Number(s?.scores?.COM ?? s?.com ?? 0),
          Number(s?.scores?.TRA ?? s?.tra ?? 0),
          Number(s?.scores?.PART ?? s?.part ?? 0),
          Number(s?.scores?.ABS ?? s?.abs ?? 0),
          s.lv2 || '',
          s.opt || '',
          s.source || ''
        ];
      });

      // Vérification que les scores ne sont pas 0 (au moins un doit avoir une valeur)
      if (data.length > 0) {
        const f = rowData[0][5];
        const m = rowData[0][6];
        if ((f === 0 || f === null) && (m === 0 || m === null)) {
          console.warn(`⚠️ Données de score F/M à 0 pour ${groupName}. Vérifiez l'objet élève: ${JSON.stringify(data[0])}`);
        }
      }

    } else {
      // ANCIENNE LOGIQUE : 'data' est un tableau d'IDs
      console.log(`saveGroup [isFullData=false] pour ${groupName} avec ${data.length} IDs.`);
      const eleveIds = data;
      const idx = buildStudentIndex_();
      header = idx.header;
      const rows = idx.rows;

      if (!header) {
        return { success: false, error: 'Impossible de construire l\'index des élèves (legacy)' };
      }

      rowData = eleveIds.map(id => rows[id] || [id]);
    }

    if (!header || header.length === 0) {
       return { success: false, error: 'En-tête (header) non défini' };
    }

    // --- Suite de la fonction (écriture) ---

    rowData = rowData || [];

    const requiredCols = Math.max(header.length, 1);
    const requiredRows = Math.max(rowData.length + 1, 2); // Header + au moins 1 ligne vide

    // S'assurer que la feuille a la taille minimale nécessaire avant l'écriture
    const currentCols = sh.getMaxColumns();
    if (currentCols < requiredCols) {
      sh.insertColumnsAfter(currentCols, requiredCols - currentCols);
    }

    const currentRows = sh.getMaxRows();
    if (currentRows < requiredRows) {
      sh.insertRowsAfter(currentRows, requiredRows - currentRows);
    }

    // Écrire l'en-tête
    sh.getRange(1, 1, 1, header.length).setValues([header]);

    // Écrire les données des élèves
    if (rowData.length > 0) {
      const maxCols = header.length; // Forcer la largeur sur l'en-tête
      const normalizedRows = rowData.map(r => {
        if (r.length < maxCols) {
          return r.concat(Array(maxCols - r.length).fill(''));
        }
        return r.slice(0, maxCols); // Trancher si plus long
      });

      sh.getRange(2, 1, normalizedRows.length, maxCols).setValues(normalizedRows);
    }

    // Formatage
    const headerRange = sh.getRange(1, 1, 1, header.length);
    headerRange.setBackground('#5b21b6').setFontColor('#ffffff').setFontWeight('bold');
    sh.setFrozenRows(1);

    // Réduire la feuille au strict nécessaire pour ne pas exploser le quota de cellules
    const extraCols = sh.getMaxColumns() - requiredCols;
    if (extraCols > 0) {
      sh.deleteColumns(requiredCols + 1, extraCols);
    }

    const extraRows = sh.getMaxRows() - requiredRows;
    if (extraRows > 0) {
      sh.deleteRows(requiredRows + 1, extraRows);
    }

    console.log(`✅ Groupe ${groupName} sauvegardé avec ${data.length} lignes.`);
    return { success: true, message: `Groupe ${groupName} sauvegardé`, count: data.length };

  } catch (e) {
    console.error('Erreur saveGroup:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Supprime un groupe
 */
function deleteGroup(groupName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(groupName);
    
    if (!sh) {
      return { success: false, error: 'Groupe introuvable' };
    }
    
    ss.deleteSheet(sh);
    console.log(`✅ Groupe ${groupName} supprimé`);
    return { success: true, message: `Groupe ${groupName} supprimé` };
  } catch (e) {
    console.error('Erreur deleteGroup:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Sauvegarde TOUS les groupes générés depuis le module de répartition
 * Appelée depuis groupsModuleComplete.html lors de la finalisation
 */
function saveGroupsToSheets(payload) {
  try {
    if (!payload || !Array.isArray(payload.groups)) {
      return { success: false, error: 'Payload invalide ou groups manquants' };
    }

    console.log('📋 saveGroupsToSheets - Début de sauvegarde');
    console.log('   Type: ' + payload.type);
    console.log('   Nombre de groupes: ' + payload.groups.length);
    console.log('   Config:', JSON.stringify(payload.config));

    const results = [];
    let totalEleves = 0;

    // 1. Supprimer les groupes existants (optionnel : garder ou remplacer)
    // Pour l'instant, on écrase les groupes avec le même nom

    // 2. Sauvegarder chaque groupe
    payload.groups.forEach((group, idx) => {
      if (!group || !Array.isArray(group.students)) {
        console.warn('   ⚠️ Groupe ' + idx + ' invalide');
        return;
      }

      const groupName = group.name || ('Groupe ' + (idx + 1));
      // CORRECTIF B : Passer les objets élèves COMPLETS au lieu des IDs
      const studentsData = group.students;

      console.log('   👥 ' + groupName + ': ' + studentsData.length + ' élèves');

      // Appeler saveGroup avec isFullData: true pour écrire un en-tête complet avec SCORE_F/M
      const result = saveGroup(groupName, studentsData, { isFullData: true });
      results.push({
        groupName: groupName,
        ...result
      });

      if (result.success) {
        totalEleves += studentsData.length;
      }
    });

    console.log('✅ saveGroupsToSheets terminé - ' + totalEleves + ' élèves au total');

    return {
      success: true,
      message: 'Groupes sauvegardés avec succès',
      totalGroups: payload.groups.length,
      totalEleves: totalEleves,
      results: results,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    console.error('❌ Erreur saveGroupsToSheets:', e.toString());
    return { success: false, error: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS POUR GESTION QUOTA GOOGLE SHEETS (10M cellules)
// ═══════════════════════════════════════════════════════════════

/**
 * Supprime tous les onglets TEMP correspondant à un préfixe donné
 * Ex: deleteT empSheetsByPrefix_('grBe') → supprime grBe1TEMP, grBe2TEMP, ...
 */
function deleteTempSheetsByPrefix_(prefix) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets().slice(); // copie pour éviter les mutations pendant la boucle

    sheets.forEach(sh => {
      const name = sh.getName();
      if (name.startsWith(prefix) && name.endsWith('TEMP')) {
        console.log('   🗑️ Suppression: ' + name);
        ss.deleteSheet(sh); // libère immédiatement les cellules
      }
    });
    console.log('   ✅ Purge TEMP [' + prefix + '*] terminée');
  } catch (e) {
    console.error('   ❌ Erreur lors de la purge:', e.toString());
  }
}

/**
 * Réduit un onglet aux dimensions strictement nécessaires
 * Supprime les lignes et colonnes excédentaires après insertSheet()
 */
function shrinkSheet_(sh, rowsNeeded, colsNeeded) {
  try {
    const minRows = Math.max(2, rowsNeeded); // 1 header + au minimum 1 data
    const minCols = Math.max(1, colsNeeded);

    const maxRows = sh.getMaxRows();
    const maxCols = sh.getMaxColumns();

    // Supprimer les lignes excédentaires (au-delà de minRows)
    if (maxRows > minRows) {
      const rowsToDelete = maxRows - minRows;
      sh.deleteRows(minRows + 1, rowsToDelete);
      console.log('      [shrink] Supprimé ' + rowsToDelete + ' lignes (total: ' + maxRows + ' → ' + minRows + ')');
    }

    // Supprimer les colonnes excédentaires (au-delà de minCols)
    if (maxCols > minCols) {
      const colsToDelete = maxCols - minCols;
      sh.deleteColumns(minCols + 1, colsToDelete);
      console.log('      [shrink] Supprimé ' + colsToDelete + ' colonnes (total: ' + maxCols + ' → ' + minCols + ')');
    }
  } catch (e) {
    console.error('      ❌ Erreur shrinkSheet_:', e.toString());
  }
}

/**
 * Calcule le nombre total de cellules RÉELLEMENT UTILISÉES dans tous les onglets du classeur
 * CORRECTION : compte getLastRow() * getLastColumn() (cellules utilisées)
 * et non getMaxRows() * getMaxColumns() (cellules allouées par Google = 1000×26 par défaut)
 */
function totalCells_(ss) {
  var total = 0;
  var sheets = ss.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();

    // Ignorer les onglets système (commençant par _)
    if (name.indexOf('_') === 0) {
      continue;
    }

    // Compter seulement les cellules réellement utilisées
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();

    if (lastRow > 0 && lastCol > 0) {
      var sheetCells = lastRow * lastCol;
      total += sheetCells;
      console.log('  [totalCells_] ' + name + ': ' + lastRow + ' lignes × ' + lastCol + ' colonnes = ' + sheetCells + ' cellules');
    }
  }

  console.log('  [totalCells_] TOTAL: ' + total + ' cellules utilisées');
  return total;
}

/**
 * Vérifie si ajouter les groupes dépasserait le quota de 10M cellules
 */
function willExceedCap_(ss, groups, headerLen) {
  const current = totalCells_(ss);
  // Estimation conservative : 2 lignes (header + 1 data en moyenne) × nombre de colonnes
  const addPerGroup = 2 * Math.max(14, headerLen);
  const projected = current + (groups.length * addPerGroup);

  console.log('   📊 Capacité actuelle: ' + current.toLocaleString() + ' / 10 000 000 cellules');
  console.log('   📊 Projection après ajout: ' + projected.toLocaleString() + ' cellules');

  return projected > 9900000; // marge de sécurité
}

/**
 * Vérifie si la création de N nouvelles feuilles ferait sauter le quota 10M cellules.
 * Hypothèse : chaque insertSheet() démarre à ~1000 lignes x 26 colonnes ≈ 26 000 cellules.
 *
 * CORRECTIF D : ES5-compatible, pas d'underscores dans les nombres
 */
function willExceedCapForNewSheets_(ss, newSheetsCount) {
  var DEFAULT_NEW_SHEET_CELLS = 1000 * 26; // ~26 000 cellules par nouvelle feuille
  var current = totalCells_(ss); // totalCells_() existe déjà dans ton fichier
  var projected = current + (newSheetsCount * DEFAULT_NEW_SHEET_CELLS);

  console.log('Capacité actuelle : ' + current.toLocaleString() + ' / 10 000 000 cellules');
  console.log(
    'Projection après création (' + newSheetsCount + ' nouvelles feuilles) : ' +
    projected.toLocaleString()
  );

  // marge de sécu : on bloque si on dépasse environ 9.9M avant même insertSheet
  return projected > 9900000;
}

/**
 * Détecte le plus grand numéro existant pour un préfixe donné
 * Ex: si grBe1TEMP, grBe2TEMP, grBe4TEMP existent, retourne 4
 * Cela permet la numérotation CONTINUE d'une phase à l'autre
 */
function getMaxGroupNumber_(ss, typePrefix) {
  var sheets = ss.getSheets();
  var maxNum = 0;
  var regex = new RegExp('^' + typePrefix + '(\\d+)TEMP$');

  for (var i = 0; i < sheets.length; i++) {
    var shName = sheets[i].getName();
    var match = shName.match(regex);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  return maxNum;
}

// ═══════════════════════════════════════════════════════════════
//  🆕 SPRINT #6: MULTI-PASS ISOLATION (Sheet Naming with GroupingId)
// ═══════════════════════════════════════════════════════════════

/**
 * Génère un ID court pour un regroupement (pour isolation namespace)
 * Input: "Passe 1" ou UUID "grp_a1b2c3d4"
 * Output: "p1a2b3c" (8 chars max, alphanumeric, no underscores for sheet names)
 */
function getGroupingShortId(groupingId) {
  if (!groupingId) return 'default';

  // Si c'est déjà un format court, retourner tel quel
  if (groupingId.length <= 8) return groupingId.substring(0, 8);

  // Sinon, extraire 8 chars du hash (début + fin)
  var hash = groupingId.substring(0, 6) + groupingId.substring(groupingId.length - 2);
  return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
}

/**
 * Construit le nom de feuille TEMP avec isolation par regroupement
 * Exemple: grBe_p1a2b3c_1TEMP
 */
function getTempSheetName(typePrefix, groupingId, groupNumber) {
  var shortId = getGroupingShortId(groupingId);
  return typePrefix + '_' + shortId + '_' + groupNumber + 'TEMP';
}

/**
 * Construit le nom de feuille FINAL (sans TEMP) avec isolation par regroupement
 * Exemple: grBe_p1a2b3c_1
 */
function getFinalSheetName(typePrefix, groupingId, groupNumber) {
  var shortId = getGroupingShortId(groupingId);
  return typePrefix + '_' + shortId + '_' + groupNumber;
}

/**
 * Extrait le groupingId court d'un nom de feuille
 * Input: "grBe_p1a2b3c_1TEMP"
 * Output: "p1a2b3c"
 */
function extractGroupingIdFromSheet(sheetName) {
  var match = sheetName.match(/^[a-zA-Z]+_([a-zA-Z0-9]+)_\d+/);
  return match ? match[1] : null;
}

/**
 * Sauvegarde les groupes générés dans des onglets TEMPORAIRES (cachés)
 * Préfixes : grBe (Besoin), grLv (Langue), grOp (Options)
 *
 * SPRINT #6 : Support multi-pass avec isolation
 * Exemple : grBe_p1a2b3c_1TEMP, grBe_p1a2b3c_2TEMP, grBe_xyz9def_1TEMP
 * - Chaque regroupement a son propre namespace de feuilles
 * - Numérotation continue au sein de chaque regroupement
 * - Les passes précédentes ne sont jamais affectées
 *
 * Payload: { type, groupingId, saveMode, offsetStart, groups[], ... }
 * ES5-compatible : pas de const/let, pas d'underscores, pas d'emoji côté serveur.
 */
const CONTINUATION_METADATA_PREFIX = 'GROUPS_CONTINUATION_';

function loadContinuationMetadata_(typePrefix) {
  try {
    const props = PropertiesService.getDocumentProperties();
    const raw = props.getProperty(CONTINUATION_METADATA_PREFIX + typePrefix);
    if (!raw) {
      return {
        lastTempIndex: 0,
        lastFinalIndex: 0,
        lastTempRange: null,
        lastFinalRange: null,
        lastPersistMode: 'replace',
        lastUpdated: null
      };
    }
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch (error) {
    console.warn('⚠️ loadContinuationMetadata_ - parse error:', error);
    return {};
  }
}

function saveContinuationMetadata_(typePrefix, metadata) {
  try {
    const props = PropertiesService.getDocumentProperties();
    props.setProperty(
      CONTINUATION_METADATA_PREFIX + typePrefix,
      JSON.stringify(metadata || {})
    );
  } catch (error) {
    console.warn('⚠️ saveContinuationMetadata_ - error:', error);
  }
}

function extractGroupIndex_(sheetName, prefix) {
  const regex = new RegExp('^' + prefix + '(\\d+)(TEMP)?$');
  const match = sheetName.match(regex);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function saveTempGroups(payload) {
  try {
    if (!payload || !Array.isArray(payload.groups)) {
      return { success: false, error: 'Payload invalide ou groups manquants' };
    }

    // Déterminer le préfixe en fonction du type demandé
    var typePrefix = 'grOp'; // défaut "autre / options"
    if (payload.type === 'needs') {
      typePrefix = 'grBe'; // besoins / besoins éducatifs
    } else if (payload.type === 'language') {
      typePrefix = 'grLv'; // langues
    }

    // 🆕 SPRINT #6: Extraire groupingId (isolation par pass)
    var groupingId = payload.groupingId || 'default';
    var shortGroupingId = getGroupingShortId(groupingId);

    var saveMode = payload.saveMode || 'append';
    console.log('🆕 saveTempGroups [SPRINT #6 Multi-pass] - Début');
    console.log('Type:', payload.type);
    console.log('Prefix:', typePrefix);
    console.log('GroupingId:', groupingId + ' (short: ' + shortGroupingId + ')');
    console.log('SaveMode:', saveMode);
    console.log('Nombre de groupes:', payload.groups.length);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var results = [];
    var totalEleves = 0;

    // ÉTAPE PRÉALABLE : Déterminer le startNum (numéro de départ) POUR CE REGROUPEMENT
    var startNum = 1;

    // Si offsetStart fourni explicitement (par UI), l'utiliser
    if (payload.offsetStart && payload.offsetStart > 0) {
      startNum = payload.offsetStart;
      console.log('✅ offsetStart fourni par UI: ' + startNum);
    } else if (saveMode === 'append') {
      // Mode APPEND : CUMUL POUR CE REGROUPEMENT - Détecter le max numéro de CE regroupement uniquement
      var maxTempNum = 0;
      var maxFinalNum = 0;
      var sheets = ss.getSheets();

      for (var checkIdx = 0; checkIdx < sheets.length; checkIdx++) {
        var shName = sheets[checkIdx].getName();
        var shGroupingId = extractGroupingIdFromSheet(shName);

        // 🆕 SPRINT #6: Chercher max SEULEMENT dans les feuilles de CE regroupement
        if (shGroupingId === shortGroupingId && shName.endsWith('TEMP')) {
          var match = shName.match(/_\d+TEMP$/);
          if (match) {
            var numStr = match[0].replace(/_/,'').replace('TEMP','');
            var num = parseInt(numStr, 10);
            if (num > maxTempNum) maxTempNum = num;
          }
        }
        // Chercher max dans les groupes finalisés DE CE REGROUPEMENT (pas TEMP, pas snapshots)
        if (shGroupingId === shortGroupingId && !shName.endsWith('TEMP') && !shName.includes('_snapshot_')) {
          var matchFin = shName.match(/_(\d+)$/);
          if (matchFin) {
            var numFin = parseInt(matchFin[1], 10);
            if (numFin > maxFinalNum) maxFinalNum = numFin;
          }
        }
      }

    const persistMode = payload.persistMode === 'continue' ? 'continue' : 'replace';
    const requestedOffset = typeof payload.offsetStart === 'number' ? payload.offsetStart : parseInt(payload.offsetStart, 10);

    console.log('📋 saveTempGroups - Début de sauvegarde temporaire');
    console.log('   Type: ' + payload.type);
    console.log('   Prefix: ' + typePrefix);
    console.log('   PersistMode: ' + persistMode);
    console.log('   Nombre de groupes: ' + payload.groups.length);

      for (var d = 0; d < tempToDelete.length; d++) {
        console.log('  Suppression TEMP: ' + tempToDelete[d].getName());
        ss.deleteSheet(tempToDelete[d]);
      }

    const metadata = {
      config: payload.config || {},
      timestamp: payload.timestamp,
      persistMode: persistMode
    };

    const existingTempSheets = ss.getSheets().filter(sh => {
      const name = sh.getName();
      return name.startsWith(typePrefix) && name.endsWith('TEMP');
    });

    let offsetStart = Number.isFinite(requestedOffset) && requestedOffset > 0 ? requestedOffset : 1;

    if (persistMode === 'replace') {
      existingTempSheets.forEach(sh => {
        console.log('   🗑️ Suppression ancien TEMP: ' + sh.getName());
        ss.deleteSheet(sh);
      });
    } else {
      const conflictingSheets = existingTempSheets.filter(sh => {
        const idx = extractGroupIndex_(sh.getName(), typePrefix);
        return typeof idx === 'number' && idx >= offsetStart;
      });

      conflictingSheets.forEach(sh => {
        console.log('   🔄 Remplacement TEMP existant: ' + sh.getName());
        ss.deleteSheet(sh);
      });

      const maxExisting = existingTempSheets.reduce((max, sh) => {
        const idx = extractGroupIndex_(sh.getName(), typePrefix);
        return typeof idx === 'number' ? Math.max(max, idx) : max;
      }, 0);

      if (offsetStart <= maxExisting) {
        offsetStart = maxExisting + 1;
        console.log('   ℹ️ Offset ajusté pour éviter les collisions: ' + offsetStart);
      }
    }

    const createdSheets = [];
    const createdIndexes = [];

    // Sauvegarder chaque groupe avec suffix TEMP
    for (let idx = 0; idx < payload.groups.length; idx++) {
      const group = payload.groups[idx];

    // --- ÉTAPE 1 : sécurité quota AVANT de créer des nouvelles feuilles
    if (newSheetsNeeded > 0) {
      console.log('Nouvelles feuilles potentielles à créer:', newSheetsNeeded);
      if (willExceedCapForNewSheets_(ss, newSheetsNeeded)) {
        return {
          success: false,
          error:
            'Capacité presque pleine : création de ' + newSheetsNeeded +
            ' nouvelle(s) feuille(s) dépasserait la limite 10M cellules. ' +
            'Supprimez / archivez des feuilles avant de continuer.'
        };
      }
    }

    // --- ÉTAPE 2 : écrire chaque groupe dans sa feuille avec nouveau naming (isolation)
    // IMPORTANT :
    // saveGroup() réutilise la feuille si elle existe (clear()).
    // Il NE fait insertSheet() QUE si la feuille n'existe pas.
    for (var i = 0; i < payload.groups.length; i++) {
      var group = payload.groups[i];
      if (!group || !Array.isArray(group.students)) {
        console.warn('   ⚠️ Groupe ' + idx + ' invalide');
        logGroupOperation({
          operation: 'SAVE_TEMP_GROUPS',
          type: payload.type,
          prefix: typePrefix,
          groupCount: payload.groups.length,
          status: 'ERROR',
          message: 'Groupe invalide détecté pendant la sauvegarde',
          metadata: { index: idx }
        });
        return { success: false, error: 'Groupe ' + idx + ' invalide' };
      }

      const currentIndex = offsetStart + idx;
      const tempGroupName = typePrefix + currentIndex + 'TEMP';
      const studentsData = group.students;

      console.log(tempGroupName + ': ' + studentsData.length + ' élèves');
      if (studentsData.length > 0) {
        console.log(
          'Premier élève:',
          studentsData[0].id,
          studentsData[0].nom,
          studentsData[0].scoreF,
          studentsData[0].scoreM
        );
      }

      // Appeler saveGroup avec le nom TEMP et les données complètes
      const existing = ss.getSheetByName(tempGroupName);
      if (existing) {
        console.log('   ♻️ Suppression feuille TEMP existante avant écriture: ' + tempGroupName);
        ss.deleteSheet(existing);
      }

      const result = saveGroup(tempGroupName, studentsData, { isFullData: true, index: currentIndex });
      console.log('      📊 Résultat saveGroup:', result);

      // 🔴 BUG FIX : Si saveGroup échoue, ARRÊTER IMMÉDIATEMENT et signaler l'erreur
      if (!result.success) {
        console.error('❌ ERREUR CRITIQUE : saveGroup a échoué pour ' + tempGroupName);
        console.error('   Raison:', result.error);
        logGroupOperation({
          operation: 'SAVE_TEMP_GROUPS',
          type: payload.type,
          prefix: typePrefix,
          groupCount: payload.groups.length,
          status: 'ERROR',
          message: 'saveGroup a échoué',
          metadata: { tempGroupName: tempGroupName, error: result.error }
        });
        return {
          success: false,
          error: 'Impossible de créer ' + tempGroupName + ': ' + errMsg
        };
      }

      results.push({
        tempGroupName: tempGroupName,
        index: currentIndex,
        ...result
      });

      totalEleves += studentsData.length;
      createdSheets.push(tempGroupName);
      createdIndexes.push(currentIndex);
    }

    // Cacher uniquement les onglets TEMP créés pendant cette sauvegarde
    createdSheets.forEach(name => {
      const sh = ss.getSheetByName(name);
      if (sh) {
        sh.hideSheet();
        console.log('   👁️ Masqué: ' + name);
      }
    }

    // --- ÉTAPE 4 : supprimer les TEMP en trop (NUMÉROTATION CONTINUE)
    // Ne pas supprimer les TEMP existants qu'on n'a pas modifiés dans cette phase
    // Supprimer SEULEMENT ceux créés dans CETTE phase ET qui seraient au-delà du range
    // (en fait, avec la numérotation continue, on ne supprime rien - on accumule)
    // Supprimer uniquement les TEMP orphelins (si le dernier groupe était plus grand avant)
    var maxNewNum = startNum + payload.groups.length - 1;
    console.log('Range de groupes créés/modifiés: ' + startNum + ' à ' + maxNewNum);

    // Ne pas supprimer d'anciennes feuilles - la numérotation continue les préserve

    console.log(
      'saveTempGroups terminé - ' +
      totalEleves + ' élèves écrits dans ' +
      payload.groups.length + ' groupe(s).'
    );

    // 🆕 SPRINT #6: Journalisation avec groupingId
    var auditResult = logGroupOperation('SAVE', payload.type || 'unknown', {
      groupName: shortGroupingId + '_' + startNum + '-' + (startNum + payload.groups.length - 1),
      count: totalEleves,
      mode: saveMode,
      status: 'SUCCESS',
      details: {
        groupingId: groupingId,
        groupingIdShort: shortGroupingId,
        startNum: startNum,
        endNum: startNum + payload.groups.length - 1,
        groupsCount: payload.groups.length
      }
    });

    const offsetEnd = createdIndexes.length > 0 ? Math.max.apply(null, createdIndexes) : offsetStart + (payload.groups.length || 0) - 1;
    const nextOffset = offsetEnd + 1;
    const nowIso = new Date().toISOString();
    const response = {
      success: true,
      message: 'Groupes sauvegardés temporairement (isolation par regroupement)',
      typePrefix: typePrefix,
      groupingId: groupingId,
      groupingIdShort: shortGroupingId,
      startNum: startNum,
      endNum: startNum + payload.groups.length - 1,
      totalGroups: payload.groups.length,
      totalEleves: totalEleves,
      results: results,
      timestamp: nowIso,
      offsetStart,
      offsetEnd,
      persistMode,
      createdRange: createdIndexes.length > 0 ? { start: Math.min.apply(null, createdIndexes), end: offsetEnd } : null,
      createdSheets,
      nextOffset
    };

    const continuation = loadContinuationMetadata_(typePrefix);
    const range = response.createdRange || (payload.groups.length > 0
      ? { start: offsetStart, end: offsetEnd }
      : null);

    const updatedMetadata = {
      ...continuation,
      lastTempIndex: Math.max(continuation?.lastTempIndex || 0, offsetEnd),
      lastTempRange: range,
      lastPersistMode: persistMode,
      lastUpdated: nowIso,
      lastTempUpdated: nowIso,
      lastConfig: payload.config || {},
      lastPassId: payload.passId || '',
      lastPassName: payload.passName || ''
    };

    saveContinuationMetadata_(typePrefix, updatedMetadata);

    logGroupOperation({
      operation: 'SAVE_TEMP_GROUPS',
      type: payload.type,
      prefix: typePrefix,
      groupCount: payload.groups.length,
      status: 'SUCCESS',
      message: 'Sauvegarde temporaire effectuée',
      metadata: { ...metadata, createdSheets },
      snapshotId: payload.snapshotId || ''
    });

    return response;
  } catch (e) {
    console.error('❌ Erreur saveTempGroups:', e.toString());
    logGroupOperation({
      operation: 'SAVE_TEMP_GROUPS',
      type: payload?.type,
      prefix: payload?.type === 'needs' ? 'grBe' : payload?.type === 'language' ? 'grLv' : 'grOp',
      groupCount: Array.isArray(payload?.groups) ? payload.groups.length : 0,
      status: 'ERROR',
      message: e.toString(),
      metadata: payload?.config || {}
    });
    return { success: false, error: e.toString() };
  }
}

/**
 * Récupère les informations sur les groupes temporaires disponibles
 * Retourne { grBe: {count, date}, grLv: {count, date}, grOp: {count, date} }
 */
function getTempGroupsInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();

    const tempInfo = {
      grBe: null,
      grLv: null,
      grOp: null
    };

    // Chercher les onglets TEMP pour chaque prefix
    ['grBe', 'grLv', 'grOp'].forEach(prefix => {
      const tempSheets = sheets.filter(sh => sh.getName().startsWith(prefix) && sh.getName().endsWith('TEMP'));

      if (tempSheets.length > 0) {
        let totalEleves = 0;
        let maxDate = null;

        tempSheets.forEach(sh => {
          const data = sh.getDataRange().getValues();
          if (data.length > 1) {
            totalEleves += data.length - 1; // -1 pour la ligne d'en-tête
          }

          // Récupérer la date du dernier onglet modifié
          const meta = sh.getSheetValues(1, 1, 1, sh.getMaxColumns());
          // On peut stocker une date custom dans les propriétés...
        });

        tempInfo[prefix] = {
          count: tempSheets.length,
          totalEleves: totalEleves,
          date: new Date().toISOString() // À améliorer avec metadata
        };
      }
    });

    console.log('📊 getTempGroupsInfo:', JSON.stringify(tempInfo));
    return { success: true, tempInfo: tempInfo };
  } catch (e) {
    console.error('❌ Erreur getTempGroupsInfo:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Génère un PDF récapitulatif des groupes et renvoie le fichier encodé en base64.
 * @param {Object} payload - { groups: [...], type: string, config: Object }
 */
function exportGroupsToPDF(payload) {
  try {
    if (!payload || !Array.isArray(payload.groups) || payload.groups.length === 0) {
      return { success: false, error: 'Aucun groupe à exporter' };
    }

    const timestamp = new Date();
    const timezone = Session.getScriptTimeZone();
    const isoDate = Utilities.formatDate(timestamp, timezone, 'yyyy-MM-dd_HH-mm');
    const fileName = `Groupes_${payload.type || 'besoins'}_${isoDate}.pdf`;

    const doc = DocumentApp.create(fileName.replace('.pdf', ''));
    const body = doc.getBody();
    body.clear();

    body.appendParagraph('Répartition des groupes').setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph(`Généré le ${Utilities.formatDate(timestamp, timezone, 'dd/MM/yyyy à HH:mm')}`).setSpacingAfter(15);

    if (payload.config) {
      const metaRows = [];
      metaRows.push(['Type de groupes', payload.config.groupTypeLabel || payload.type || '—']);

      if (payload.config.selectedClasses && payload.config.selectedClasses.length) {
        metaRows.push(['Classes concernées', payload.config.selectedClasses.join(', ')]);
      }
      if (payload.config.numGroups) {
        metaRows.push(['Nombre de groupes', payload.config.numGroups]);
      }
      if (payload.config.subjectLabel) {
        metaRows.push(['Discipline', payload.config.subjectLabel]);
      }
      if (payload.config.distributionLabel) {
        metaRows.push(['Mode de répartition', payload.config.distributionLabel]);
      }
      if (payload.config.languageLabel) {
        metaRows.push(['Langue', payload.config.languageLabel]);
      }

      if (metaRows.length > 0) {
        const metaTable = body.appendTable(metaRows);
        metaTable.setBorderWidth(0);
        metaRows.forEach((_, rowIdx) => {
          const cell = metaTable.getCell(rowIdx, 0);
          cell.getChild(0).asParagraph().setBold(true);
        });
        body.appendParagraph('').setSpacingAfter(15);
      }
    }

    payload.groups.forEach((group, index) => {
      const title = `Groupe ${index + 1} - ${group.name || 'Sans nom'} (${(group.students || []).length} élèves)`;
      body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING2);

      const rows = [];
      rows.push(['Nom', 'Prénom', 'Sexe', 'Classe', 'Score F', 'Score M', 'COM', 'TRA', 'PART', 'LV2', 'Option']);

      (group.students || []).forEach(student => {
        const scores = student.scores || {};
        rows.push([
          student.nom || '',
          student.prenom || '',
          (student.sexe || '').toString(),
          student.classe || '',
          String(scores.F ?? student.scoreF ?? ''),
          String(scores.M ?? student.scoreM ?? ''),
          String(scores.COM ?? student.com ?? ''),
          String(scores.TRA ?? student.tra ?? ''),
          String(scores.PART ?? student.part ?? ''),
          student.lv2 || '',
          student.opt || ''
        ]);
      });

      const table = body.appendTable(rows);
      const headerRow = table.getRow(0);
      const headerCellCount = headerRow.getNumCells();
      for (let cellIdx = 0; cellIdx < headerCellCount; cellIdx++) {
        const cell = headerRow.getCell(cellIdx);
        cell.setBackgroundColor('#e5e7eb');
        cell.getChild(0).asParagraph().setBold(true);
      }

      body.appendParagraph('').setSpacingAfter(10);
    });

    doc.saveAndClose();

    const pdfBlob = doc.getAs('application/pdf').setName(fileName);
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    const base64Data = Utilities.base64Encode(pdfBlob.getBytes());

    return {
      success: true,
      fileName: fileName,
      mimeType: 'application/pdf',
      data: base64Data
    };
  } catch (e) {
    console.error('❌ Erreur exportGroupsToPDF:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Charge les groupes temporaires et les retourne pour recharger dans l'interface
 * Retourne les élèves de grBe1TEMP, grBe2TEMP, etc.
 */
function loadTempGroups(type) {
  try {
    if (!type || !['needs', 'language', 'options'].includes(type)) {
      return { success: false, error: 'Type invalide' };
    }

    let typePrefix = 'grOp';
    if (type === 'needs') typePrefix = 'grBe';
    else if (type === 'language') typePrefix = 'grLv';

    console.log('📥 loadTempGroups pour type: ' + type + ' (prefix: ' + typePrefix + ')');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets().filter(sh => sh.getName().startsWith(typePrefix) && sh.getName().endsWith('TEMP'));

    const groups = [];
    const indexes = [];

    sheets.sort((a, b) => {
      const idxA = extractGroupIndex_(a.getName(), typePrefix) || 0;
      const idxB = extractGroupIndex_(b.getName(), typePrefix) || 0;
      return idxA - idxB;
    });

    sheets.forEach((sh, idx) => {
      const data = sh.getDataRange().getValues();
      if (data.length < 2) return;

      const groupIndex = extractGroupIndex_(sh.getName(), typePrefix) || (idx + 1);
      const header = data[0].map(h => String(h).toUpperCase().trim());
      const idCol = header.indexOf('ID_ELEVE') !== -1 ? header.indexOf('ID_ELEVE') :
                    header.indexOf('ID') !== -1 ? header.indexOf('ID') : 0;

      const students = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;

        // Reconstruire l'élève avec tous les champs disponibles
        const student = {};
        header.forEach((col, colIdx) => {
          student[col] = row[colIdx] || '';
        });

        // Ajouter aussi en minuscules pour compatibilité
        if (!student.id && student.ID_ELEVE) student.id = student.ID_ELEVE;
        if (!student.nom && student.NOM) student.nom = student.NOM;
        if (!student.prenom && student.PRENOM) student.prenom = student.PRENOM;
        if (!student.sexe && student.SEXE) student.sexe = student.SEXE;
        if (!student.classe && student.CLASSE) student.classe = student.CLASSE;

        students.push(student);
      }

      if (students.length > 0) {
        groups.push({
          name: 'Groupe ' + groupIndex,
          index: groupIndex,
          students: students,
          count: students.length
        });
        indexes.push(groupIndex);

        console.log('   ✅ ' + sh.getName() + ': ' + students.length + ' élèves');
      }
    });

    console.log('✅ loadTempGroups - ' + groups.length + ' groupes chargés');

    const metadata = loadContinuationMetadata_(typePrefix);
    const offsetStart = indexes.length > 0 ? Math.min.apply(null, indexes) : 1;
    const offsetEnd = indexes.length > 0 ? Math.max.apply(null, indexes) : offsetStart - 1;
    const range = metadata?.lastTempRange || (indexes.length > 0 ? { start: offsetStart, end: offsetEnd } : null);

    return {
      success: true,
      groups: groups,
      totalGroups: groups.length,
      type: type,
      offsetStart,
      offsetEnd,
      persistMode: metadata?.lastPersistMode || 'replace',
      createdRange: range,
      lastTempUpdated: metadata?.lastTempUpdated || metadata?.lastUpdated || null,
      lastFinalRange: metadata?.lastFinalRange || null,
      lastFinalizedAt: metadata?.lastFinalUpdated || metadata?.lastUpdated || null
    };
  } catch (e) {
    console.error('❌ Erreur loadTempGroups:', e.toString());
    return { success: false, error: e.toString() };
  }
}

function getContinuationStatus(request) {
  try {
    const type = typeof request === 'string' ? request : request?.type;
    if (!type || !['needs', 'language', 'options'].includes(type)) {
      return { success: false, error: 'Type invalide' };
    }

    let typePrefix = 'grOp';
    if (type === 'needs') typePrefix = 'grBe';
    else if (type === 'language') typePrefix = 'grLv';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();

    const tempSheets = sheets.filter(sh => sh.getName().startsWith(typePrefix) && sh.getName().endsWith('TEMP'));
    const finalSheets = sheets.filter(sh => sh.getName().startsWith(typePrefix) && !sh.getName().endsWith('TEMP'));

    const tempIndexes = tempSheets
      .map(sh => extractGroupIndex_(sh.getName(), typePrefix))
      .filter(idx => typeof idx === 'number');
    const finalIndexes = finalSheets
      .map(sh => extractGroupIndex_(sh.getName(), typePrefix))
      .filter(idx => typeof idx === 'number');

    const metadata = loadContinuationMetadata_(typePrefix) || {};

    const lastTempIndex = metadata.lastTempIndex || (tempIndexes.length ? Math.max.apply(null, tempIndexes) : 0);
    const lastFinalIndex = metadata.lastFinalIndex || (finalIndexes.length ? Math.max.apply(null, finalIndexes) : 0);
    const lastTempRange = metadata.lastTempRange || (tempIndexes.length
      ? { start: Math.min.apply(null, tempIndexes), end: Math.max.apply(null, tempIndexes) }
      : null);
    const lastFinalRange = metadata.lastFinalRange || (finalIndexes.length
      ? { start: Math.min.apply(null, finalIndexes), end: Math.max.apply(null, finalIndexes) }
      : null);

    const nextOffsetCandidates = [];
    if (lastTempIndex) nextOffsetCandidates.push(lastTempIndex + 1);
    if (lastFinalIndex) nextOffsetCandidates.push(lastFinalIndex + 1);
    if (tempIndexes.length) nextOffsetCandidates.push(Math.max.apply(null, tempIndexes) + 1);
    if (finalIndexes.length) nextOffsetCandidates.push(Math.max.apply(null, finalIndexes) + 1);
    const nextOffset = nextOffsetCandidates.length ? Math.max.apply(null, nextOffsetCandidates) : 1;

    return {
      success: true,
      type,
      prefix: typePrefix,
      tempSheets: tempSheets.map(sh => ({
        name: sh.getName(),
        index: extractGroupIndex_(sh.getName(), typePrefix)
      })),
      finalSheets: finalSheets.map(sh => ({
        name: sh.getName(),
        index: extractGroupIndex_(sh.getName(), typePrefix)
      })),
      lastTempIndex,
      lastFinalIndex,
      lastTempRange,
      lastFinalizedRange: lastFinalRange,
      lastTempUpdated: metadata.lastTempUpdated || metadata.lastUpdated || null,
      lastFinalizedAt: metadata.lastFinalUpdated || metadata.lastUpdated || null,
      persistMode: metadata.lastPersistMode || 'replace',
      nextOffset
    };
  } catch (error) {
    console.error('❌ Erreur getContinuationStatus:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Finalise les groupes temporaires en les renommant et les rendant visibles
 * Renomme grBe1TEMP → grBe1, supprime les TEMP
 */
function finalizeTempGroups(request) {
  try {
    let type = request;
    let metadata = {};

    if (typeof request === 'object' && request !== null) {
      type = request.type;
      metadata = request.config || request.metadata || {};
    }

    if (!type || !['needs', 'language', 'options'].includes(type)) {
      return { success: false, error: 'Type invalide' };
    }

    var typePrefix = 'grOp';
    if (type === 'needs') typePrefix = 'grBe';
    else if (type === 'language') typePrefix = 'grLv';

    const persistMode = request?.persistMode === 'continue' ? 'continue' : 'replace';
    metadata = { ...metadata, persistMode };

    console.log('✅ finalizeTempGroups pour type: ' + type + ' (prefix: ' + typePrefix + ') - mode ' + persistMode);

    finalizeMode = finalizeMode || 'replace';
    console.log('🆕 finalizeTempGroups [SPRINT #6 Multi-pass] - Mode: ' + finalizeMode + ' | Type: ' + type + ' | Prefix: ' + typePrefix + ' | GroupingId: ' + (groupingId || 'ALL'));

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();

    // Trouver tous les onglets TEMP pour ce prefix (ET optionnellement ce groupingId)
    var tempSheets = [];
    for (var i = 0; i < sheets.length; i++) {
      var sh = sheets[i];
      var name = sh.getName();
      var shGroupingId = extractGroupingIdFromSheet(name);

      // 🆕 SPRINT #6: Si groupingId spécifié, filtrer SEULEMENT pour ce regroupement
      if (name.startsWith(typePrefix) && name.endsWith('TEMP')) {
        if (shortGroupingId && shGroupingId !== shortGroupingId) {
          // Ignorer les TEMP d'autres regroupements
          continue;
        }
        tempSheets.push(sh);
      }
    }

    if (tempSheets.length === 0) {
      var errorMsg = 'Aucun groupe temporaire trouvé pour ' + typePrefix;
      if (groupingId) errorMsg += ' (regroupement: ' + groupingId + ')';
      return { success: false, error: errorMsg };
    }

    console.log('   Finalisation de ' + tempSheets.length + ' groupes pour ' + (shortGroupingId || 'tous les regroupements') + '...');

    if (finalizeMode === 'replace') {
      // MODE REPLACE : Créer snapshots puis supprimer SEULEMENT les finalisés DE CE REGROUPEMENT
      console.log('   ✅ Mode REPLACE: snapshots + suppression SEULEMENT des groupes finalisés DE CE REGROUPEMENT');
      var finalSheets = [];
      for (var j = 0; j < sheets.length; j++) {
        var sh = sheets[j];
        var name = sh.getName();
        var shGroupingId = extractGroupingIdFromSheet(name);

        // 🆕 SPRINT #6: Si groupingId spécifié, filtrer SEULEMENT pour ce regroupement
        if (name.startsWith(typePrefix) && !name.endsWith('TEMP') && !name.includes('_snapshot_')) {
          if (shortGroupingId && shGroupingId !== shortGroupingId) {
            // Ignorer les groupes finalisés d'autres regroupements
            continue;
          }
          finalSheets.push(sh);
        }
      }

      // Créer snapshots avant suppression (VERSIONING)
      console.log('   📸 Création de snapshots de ' + finalSheets.length + ' groupes...');
      for (var k = 0; k < finalSheets.length; k++) {
        var groupName = finalSheets[k].getName();
        var snapshotResult = createGroupSnapshot(groupName);
        if (snapshotResult.success) {
          console.log('   ✅ Snapshot créé pour ' + groupName);
        }
      }

      // Supprimer les anciens groupes finalisés DE CE REGROUPEMENT
      for (var k = 0; k < finalSheets.length; k++) {
        console.log('   🗑️  Suppression de l\'ancien: ' + finalSheets[k].getName());
        ss.deleteSheet(finalSheets[k]);
      }

      // Renommer les TEMP en final (en utilisant nouveau naming)
      for (var m = 0; m < tempSheets.length; m++) {
        var tempName = tempSheets[m].getName();
        var finalName = tempName.replace('TEMP', ''); // grBe_p1a2b3c_1TEMP → grBe_p1a2b3c_1
        console.log('   Renommage: ' + tempName + ' → ' + finalName);
        tempSheets[m].setName(finalName);
        tempSheets[m].showSheet();
      }

    } else if (finalizeMode === 'merge') {
      // MODE MERGE : Snapshots + PRÉSERVATION des groupes finalisés DE CE REGROUPEMENT + numérotation continue
      console.log('   ✅ Mode MERGE: snapshots + PRÉSERVATION des groupes + numérotation continue POUR CE REGROUPEMENT');

      // Créer snapshots des groupes existants DE CE REGROUPEMENT avant merge
      var existingFinalSheets = [];
      for (var j = 0; j < sheets.length; j++) {
        var sh = sheets[j];
        var name = sh.getName();
        var shGroupingId = extractGroupingIdFromSheet(name);

        // 🆕 SPRINT #6: Si groupingId spécifié, filtrer SEULEMENT pour ce regroupement
        if (name.startsWith(typePrefix) && !name.endsWith('TEMP') && !name.includes('_snapshot_')) {
          if (shortGroupingId && shGroupingId !== shortGroupingId) {
            // Ignorer les groupes finalisés d'autres regroupements
            continue;
          }
          existingFinalSheets.push(sh);
        }
      }

      if (existingFinalSheets.length > 0) {
        console.log('   📸 Création de snapshots des ' + existingFinalSheets.length + ' groupes existants...');
        for (var k = 0; k < existingFinalSheets.length; k++) {
          var groupName = existingFinalSheets[k].getName();
          var snapshotResult = createGroupSnapshot(groupName);
          if (snapshotResult.success) {
            console.log('   ✅ Snapshot créé pour ' + groupName);
          }
        }
      }

      // 🆕 SPRINT #6: Déterminer le prochain numéro POUR CE REGROUPEMENT
      var maxFinalNum = 0;
      for (var n = 0; n < sheets.length; n++) {
        var sh = sheets[n];
        var name = sh.getName();
        var shGroupingId = extractGroupingIdFromSheet(name);

        // Chercher max SEULEMENT dans les groupes finalisés DE CE REGROUPEMENT
        if (name.startsWith(typePrefix) && !name.endsWith('TEMP') && !name.includes('_snapshot_')) {
          if (shortGroupingId && shGroupingId !== shortGroupingId) {
            continue;
          }
          // Extraire le numéro de "grBe_p1a2b3c_3"
          var match = name.match(/_(\d+)$/);
          if (match) {
            var num = parseInt(match[1], 10);
            if (num > maxFinalNum) maxFinalNum = num;
          }
        }
      }

      var nextNum = maxFinalNum + 1;
      console.log('   Max final number trouvé (pour ce regroupement): ' + maxFinalNum + ', nextNum: ' + nextNum);

      // Renommer les TEMP en continuant la numérotation (avec nouveau naming)
      for (var p = 0; p < tempSheets.length; p++) {
        var tempName = tempSheets[p].getName();
        var finalName = getFinalSheetName(typePrefix, groupingId, nextNum + p); // grBe_p1a2b3c_3, grBe_p1a2b3c_4...
        console.log('   Renommage: ' + tempName + ' → ' + finalName);
        tempSheets[p].setName(finalName);
        tempSheets[p].showSheet();
      }
    }

    console.log('finalizeTempGroups terminé - Groupes rendus visibles');

    tempSheets.sort((a, b) => {
      const idxA = extractGroupIndex_(a.getName(), typePrefix) || 0;
      const idxB = extractGroupIndex_(b.getName(), typePrefix) || 0;
      return idxA - idxB;
    });

    const renamedIndexes = [];

    const snapshotGroups = tempSheets.map(sh => {
      const tempName = sh.getName();
      const finalName = tempName.replace('TEMP', '');
      const values = sh.getDataRange().getValues();
      if (!values || values.length < 2) {
        return { name: finalName, students: [] };
      }

      const header = values[0];
      const students = values.slice(1)
        .filter(row => row.some(cell => cell !== '' && cell !== null))
        .map(row => normalizeSnapshotStudent_(header, row));

      return { name: finalName, students: students };
    });

    const snapshotResult = createGroupSnapshot({
      type: type,
      prefix: typePrefix,
      groups: snapshotGroups,
      metadata: metadata,
      source: 'finalizeTempGroups'
    });
    return { success: false, error: e.toString() };
  }
}

    if (persistMode === 'replace') {
      const finalSheets = sheets.filter(sh => {
        const name = sh.getName();
        return name.startsWith(typePrefix) && !name.endsWith('TEMP');
      });

      finalSheets.forEach(sh => {
        console.log('   🗑️ Suppression de l\'ancien:', sh.getName());
        ss.deleteSheet(sh);
      });
    }

    // Renommer les TEMP en final + afficher
    tempSheets.forEach(sh => {
      const tempName = sh.getName();
      const finalName = tempName.replace('TEMP', ''); // grBe1TEMP → grBe1
      const index = extractGroupIndex_(tempName, typePrefix);

      if (persistMode === 'continue') {
        const existing = ss.getSheetByName(finalName);
        if (existing) {
          console.log('   ♻️ Remplacement du groupe existant: ' + finalName);
          ss.deleteSheet(existing);
        }
      }

      console.log('   📝 Renommage: ' + tempName + ' → ' + finalName);
      sh.setName(finalName);
      sh.showSheet();
      if (typeof index === 'number') {
        renamedIndexes.push(index);
      }
    });

    console.log('✅ Continuation metadata sauvegardée pour ' + type);
    console.log('   Data: ' + JSON.stringify(enriched).substring(0, 100) + '...');

    const continuation = loadContinuationMetadata_(typePrefix);
    const finalRange = renamedIndexes.length > 0
      ? { start: Math.min.apply(null, renamedIndexes), end: Math.max.apply(null, renamedIndexes) }
      : continuation?.lastFinalRange || null;

    const finalizedAt = new Date().toISOString();

    const updatedMetadata = {
      ...continuation,
      lastFinalIndex: renamedIndexes.length > 0 ? Math.max.apply(null, renamedIndexes) : (continuation?.lastFinalIndex || 0),
      lastFinalRange: finalRange,
      lastPersistMode: persistMode,
      lastUpdated: finalizedAt,
      lastFinalUpdated: finalizedAt,
      lastPassId: request?.passId || continuation?.lastPassId || '',
      lastPassName: request?.passName || continuation?.lastPassName || ''
    };

    saveContinuationMetadata_(typePrefix, updatedMetadata);

    logGroupOperation({
      operation: 'FINALIZE_TEMP_GROUPS',
      type: type,
      prefix: typePrefix,
      groupCount: tempSheets.length,
      status: 'SUCCESS',
      message: 'Finalisation des groupes',
      metadata: { ...metadata, snapshotId: snapshotResult?.snapshotId },
      snapshotId: snapshotResult?.snapshotId || ''
    });

    return {
      success: true,
      message: 'Continuation metadata sauvegardée pour ' + type,
      type: type,
      prefix: typePrefix,
      count: tempSheets.length,
      snapshotId: snapshotResult?.snapshotId || null,
      lastFinalRange: finalRange,
      persistMode,
      finalizedAt
    };
  } catch (e) {
    console.error('❌ Erreur finalizeTempGroups:', e.toString());
    logGroupOperation({
      operation: 'FINALIZE_TEMP_GROUPS',
      type: typeof request === 'string' ? request : request?.type,
      status: 'ERROR',
      message: e.toString()
    });
    return { success: false, error: e.toString() };
  }
}

/*************************** FONCTIONS DE CACHE AUTOMATIQUE *******************************/
/**
 * Récupère les informations sur la dernière sauvegarde automatique
 */
function getLastCacheInfo() {
  try {
    const props = PropertiesService.getUserProperties();
    const cacheDate = props.getProperty('lastCacheDate');
    const cacheSize = props.getProperty('lastCacheSize');
    
    if (cacheDate) {
      console.log(`📦 Cache trouvé: ${cacheDate} (${cacheSize} octets)`);
      return { 
        exists: true, 
        date: cacheDate,
        size: parseInt(cacheSize) || 0
      };
    }
    
    return { exists: false };
  } catch (e) {
    console.error('Erreur getLastCacheInfo:', e);
    return { exists: false, error: e.toString() };
  }
}

/**
 * ⚠️ OBSOLÈTE : Cette fonction n'est plus utilisée pour l'auto-save
 * L'auto-save appelle maintenant directement saveElevesCache()
 * 
 * Sauvegarde les métadonnées du cache dans PropertiesService (limité à 9KB)
 */
function saveCacheData(cacheData) {
  try {
    const props = PropertiesService.getUserProperties();
    const jsonData = JSON.stringify(cacheData);
    const dataSize = jsonData.length;
    
    // Limite de PropertiesService: 9KB par propriété, 500KB total
    if (dataSize > 9000) {
      console.warn(`⚠️ Cache trop volumineux (${dataSize} octets), sauvegarde métadonnées uniquement`);
      const lightData = {
        timestamp: cacheData.timestamp || new Date().toISOString(),
        classCount: cacheData.classes ? Object.keys(cacheData.classes).length : 0
      };
      props.setProperty('autoSaveCache', JSON.stringify(lightData));
    } else {
      props.setProperty('autoSaveCache', jsonData);
    }
    
    // Sauvegarder les métadonnées
    props.setProperty('lastCacheDate', new Date().toISOString());
    props.setProperty('lastCacheSize', dataSize.toString());
    
    console.log(`💾 Métadonnées cache sauvegardées: ${dataSize} octets`);
    return { success: true, message: 'Métadonnées cache sauvegardées' };
  } catch (e) {
    console.error('💥 Erreur saveCacheData:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Écrit les options/LV2 configurées depuis l'UI dans la feuille _STRUCTURE
 * @param {Object} optionsByClass - { "6°1": { LV2: ["ITA", "ESP"], OPT: ["LATIN"] }, ... }
 */
function setStructureOptionsFromUI(optionsByClass) {
  try {
    console.log('📝 setStructureOptionsFromUI appelé avec:', JSON.stringify(optionsByClass));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const structureSheet = ss.getSheetByName(ELEVES_MODULE_CONFIG.STRUCTURE_SHEET);

    if (!structureSheet) {
      console.error('⚠️ Feuille _STRUCTURE introuvable');
      return { success: false, error: 'Feuille _STRUCTURE introuvable' };
    }

    // Lire la feuille _STRUCTURE
    const data = structureSheet.getDataRange().getValues();
    let headerRow = -1;

    // Trouver l'en-tête
    for (let i = 0; i < Math.min(10, data.length); i++) {
      if (data[i][0] === "CLASSE_ORIGINE" && data[i][1] === "CLASSE_DEST") {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) {
      console.error('⚠️ En-têtes non trouvés dans _STRUCTURE');
      return { success: false, error: 'En-têtes non trouvés dans _STRUCTURE' };
    }

    const headers = data[headerRow];
    const colDest = headers.indexOf("CLASSE_DEST");
    const colOptions = headers.indexOf("OPTIONS");

    if (colDest === -1 || colOptions === -1) {
      console.error('⚠️ Colonnes CLASSE_DEST ou OPTIONS non trouvées');
      return { success: false, error: 'Colonnes manquantes dans _STRUCTURE' };
    }

    // Compter les élèves par option depuis les onglets TEST
    const sourceMode = ELEVES_MODULE_CONFIG.TEST_SUFFIX;
    const optionCounts = countStudentsByOption(ss, sourceMode);
    console.log('📊 Comptage élèves par option:', JSON.stringify(optionCounts));

    // Écrire les options pour chaque classe
    let updatedCount = 0;
    for (let i = headerRow + 1; i < data.length; i++) {
      const classeDest = String(data[i][colDest] || '').trim();
      if (!classeDest) continue;

      const classConfig = optionsByClass[classeDest];
      if (!classConfig) continue;

      // Construire la chaîne OPTIONS (format: "ITA=5,LATIN=3,CHAV=2")
      const optionPairs = [];

      // Ajouter les LV2
      if (Array.isArray(classConfig.LV2)) {
        classConfig.LV2.forEach(lv2 => {
          const count = optionCounts[lv2] || 999; // Si pas de comptage, mettre un quota élevé
          optionPairs.push(`${lv2}=${count}`);
        });
      }

      // Ajouter les OPT
      if (Array.isArray(classConfig.OPT)) {
        classConfig.OPT.forEach(opt => {
          const count = optionCounts[opt] || 999;
          optionPairs.push(`${opt}=${count}`);
        });
      }

      const optionsStr = optionPairs.join(',');
      console.log(`✍️ Classe ${classeDest}: OPTIONS="${optionsStr}"`);

      // Écrire dans la cellule
      structureSheet.getRange(i + 1, colOptions + 1).setValue(optionsStr);
      updatedCount++;
    }

    SpreadsheetApp.flush();
    console.log(`✅ ${updatedCount} classes mises à jour dans _STRUCTURE`);

    return { success: true, message: `${updatedCount} classes configurées` };
  } catch (e) {
    console.error('❌ Erreur setStructureOptionsFromUI:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Compte les élèves par option/LV2 depuis les onglets d'un mode
 * @param {Spreadsheet} ss - Le spreadsheet
 * @param {string} suffix - Le suffixe des onglets (TEST, CACHE, FIN)
 * @returns {Object} - { "ITA": 15, "LATIN": 8, "CHAV": 5, ... }
 */
function countStudentsByOption(ss, suffix) {
  const counts = {};

  try {
    const sheets = ss.getSheets();
    const escapedSuffix = String(suffix).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedSuffix + '$', 'i');

    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (!pattern.test(name)) return;
      if (ELEVES_MODULE_CONFIG.SHEET_EXCLUSION_PATTERN.test(name)) return;

      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return;

      // Trouver les colonnes LV2 et OPT
      const headers = data[0].map(h => _eleves_up(h));
      const colLV2 = _eleves_idx(headers, ['LV2', 'LANGUE2', 'L2']);
      const colOPT = _eleves_idx(headers, ['OPT', 'OPTION']);

      // Compter les élèves
      for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Compter LV2
        if (colLV2 !== -1) {
          const lv2 = _eleves_up(row[colLV2]);
          if (lv2) {
            counts[lv2] = (counts[lv2] || 0) + 1;
          }
        }

        // Compter OPT
        if (colOPT !== -1) {
          const opt = _eleves_up(row[colOPT]);
          if (opt) {
            counts[opt] = (counts[opt] || 0) + 1;
          }
        }
      }
    });
  } catch (e) {
    console.error('Erreur countStudentsByOption:', e);
  }

  return counts;
}

/**
 * Récupère les paramètres UI globaux (persistés)
 * Retourne un objet, ex: { SHOW_GROUPS_BUTTON: false }
 */
function getUiSettings() {
  try {
    const props = PropertiesService.getScriptProperties();
    const raw = props.getProperty('UI_SETTINGS');
    const parsed = raw ? JSON.parse(raw) : {};
    if (typeof parsed.SHOW_GROUPS_BUTTON === 'undefined') {
      parsed.SHOW_GROUPS_BUTTON = false; // caché par défaut
    }
    return parsed;
  } catch (e) {
    console.error('❌ Erreur getUiSettings:', e);
    return { SHOW_GROUPS_BUTTON: false };
  }
}

/**
 * Met à jour les paramètres UI globaux (réservé admin)
 * @param {Object} settings - ex: { SHOW_GROUPS_BUTTON: true }
 */
function setUiSettings(settings) {
  try {
    const current = getUiSettings();
    const next = Object.assign({}, current, settings || {});
    PropertiesService.getScriptProperties().setProperty('UI_SETTINGS', JSON.stringify(next));
    return { success: true, settings: next };
  } catch (e) {
    console.error('❌ Erreur setUiSettings:', e);
    return { success: false, error: String(e) };
  }
}
