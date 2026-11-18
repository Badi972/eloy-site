/* ---------- Import du tableau de prod 2024 dans le tableau 2025 (Bradley, 18/11/2026) ----------
   Un seul tableau de production : les lignes de « PRODUCTION » (2024) sont ajoutées à la fin de
   « TABLEAU PRODUCTION IARD » (2025), colonnes remises dans l'ordre du tableau 2025, valeurs mises au format des listes.
   Lignes FORMATION et contrats déjà présents dans le tableau 2025 (même n°) : non importés.
   Le tableau 2024 n'est pas modifié. simulerImport2024() : contrôle sans rien écrire. */
var IMP = {
  CIES: { 'GENERALI': 'GENERALI', 'EDIIFICE': 'SPVIE EDIFICE', 'EDIFICE': 'SPVIE EDIFICE', 'SWISS LIFE': 'SWISSLIFE' },
  TYPES: { 'AUTO': 'AUTO', 'ADE': 'ADE', 'SANTE': 'SANTE IND', 'MRH': 'MRH', 'MOTO': 'MOTO', 'MRPRO': 'MRPRO', 'MPRO': 'MRPRO',
           'PNO': 'PNO', 'BATEAU': 'BATEAU', 'RCP': 'RCP', 'RCP PJ': 'RCP', 'PREV': 'PREV IND', 'RC DECENNALE': 'RC DECENNALE',
           'RCD': 'RC DECENNALE', 'TPM': 'TPM' },
  PIECES: { 'CG': 'CG.', 'CT': 'CT.', 'CG CT': 'CG.', 'DEVOIR CONSEIL': 'DEVOIR CONSEIL.' }
};
function txt_(v) { return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function maj_(v) { return sansAccent_(txt_(v)).toUpperCase(); }
function prime_(v) { var s = txt_(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, ''); if (!s) return ''; var n = parseFloat(s.replace(',', '.')); return isNaN(n) ? '' : Math.floor(n); }
function importer2024_(appliquer) {
  var s25 = SpreadsheetApp.openById(PF.PROD25).getSheetByName(PF.ONGLET25), s24 = SpreadsheetApp.openById(PF.PROD24).getSheetByName(PF.ONGLET24);
  var v25 = s25.getDataRange().getDisplayValues(), v24 = s24.getDataRange().getDisplayValues();
  var deja = {}; v25.slice(1).forEach(function (r) { var k = cleContrat_(txt_(r[6])); if (k.length >= 5) deja[k] = 1; });
  var lignes = [], ignores = [], alertes = [], vus = {};
  for (var i = 1; i < v24.length; i++) {
    var r = v24[i], nom = txt_(r[1]), prenom = txt_(r[2]);
    if (!nom && !prenom) continue;
    if (!nom) { nom = prenom; prenom = ''; }
    var type0 = maj_(r[8]);
    if (/FORMATION/.test(type0)) { ignores.push('ligne ' + (i + 1) + ' ' + nom + ' : formation'); continue; }
    var numero = txt_(r[9]), k = cleContrat_(numero);
    if (k.length >= 5 && deja[k]) { ignores.push('ligne ' + (i + 1) + ' ' + nom + ' ' + prenom + ' ' + numero + ' : déjà dans le tableau 2025'); continue; }
    if (k.length >= 5 && vus[k]) { ignores.push('ligne ' + (i + 1) + ' ' + nom + ' ' + prenom + ' ' + numero + ' : doublon dans le tableau 2024'); continue; }
    if (k.length >= 5) vus[k] = 1;
    var cie0 = maj_(r[10]), cie = IMP.CIES[cie0] || cie0;
    var type = IMP.TYPES[type0] || type0;
    if (!IMP.TYPES[type0]) alertes.push('ligne ' + (i + 1) + ' ' + nom + ' : type « ' + type0 + ' » gardé tel quel');
    var resilie = /RESILI/.test(maj_(r[16])), conf = maj_(r[6]), statut = resilie ? 'RESILIE' : conf === 'OUI' ? 'CONFORMITE OK' : conf === 'NON' ? 'INCOMPLET' : '';
    var p0 = maj_(r[7]), piece = IMP.PIECES[p0] || '';
    if (p0 && !piece) alertes.push('ligne ' + (i + 1) + ' ' + nom + ' : « ' + p0 + ' » non repris (hors liste)');
    if (p0 === 'CG CT') alertes.push('ligne ' + (i + 1) + ' ' + nom + ' : CG et CT manquants, seul « CG. » possible dans la liste');
    lignes.push([txt_(r[0]), nom.toUpperCase(), prenom.toUpperCase(), maj_(r[5]), txt_(r[4]).split(/[;\/ ]+/).filter(String).join(' / '), txt_(r[3]),
                 numero, cie, statut, piece, prime_(r[12]), type, resilie ? txt_(r[17]) : '']);
  }
  console.log(lignes.length + ' lignes à importer ; ' + ignores.length + ' non importées ; ' + alertes.length + ' alertes');
  ignores.forEach(function (x) { console.log('Non importé : ' + x); });
  alertes.forEach(function (x) { console.log('Alerte : ' + x); });
  lignes.slice(0, 5).concat(lignes.slice(-3)).forEach(function (l) { console.log(l.join(' ¦ ')); });
  if (appliquer && lignes.length) {
    var debut = s25.getLastRow() + 1;
    s25.getRange(debut, 1, lignes.length, 13).setValues(lignes);
    console.log('Importé en lignes ' + debut + ' à ' + (debut + lignes.length - 1));
  }
}
function simulerImport2024() { importer2024_(false); }
function importer2024() { throw new Error('Import déjà fait le 18/11/2026 (lignes 199 à 420) : ne pas relancer.'); }

/* Téléphones et n° de contrat des lignes importées remis en texte (zéro de tête gardé) ; mêmes règles de sélection que l'import */
function corrigerTexte2024() {
  var s25 = SpreadsheetApp.openById(PF.PROD25).getSheetByName(PF.ONGLET25), debut = 199;
  var v25 = s25.getRange(1, 1, debut - 1, 13).getDisplayValues(), v24 = SpreadsheetApp.openById(PF.PROD24).getSheetByName(PF.ONGLET24).getDataRange().getDisplayValues();
  var deja = {}; v25.slice(1).forEach(function (r) { var k = cleContrat_(txt_(r[6])); if (k.length >= 5) deja[k] = 1; });
  var src = [], vus = {};
  for (var i = 1; i < v24.length; i++) {
    var r = v24[i]; if (!txt_(r[1]) && !txt_(r[2])) continue;
    if (/FORMATION/.test(maj_(r[8]))) continue;
    var k = cleContrat_(txt_(r[9]));
    if (k.length >= 5 && (deja[k] || vus[k])) continue;
    if (k.length >= 5) vus[k] = 1;
    src.push(r);
  }
  var g = s25.getRange(debut, 1, src.length, 7).getDisplayValues(), n = 0, ecarts = 0;
  src.forEach(function (r, j) {
    var nom = (txt_(r[1]) || txt_(r[2])).toUpperCase();
    if (g[j][1] !== nom) { ecarts++; return; }
    if (/^0\d/.test(txt_(r[3])) || /^0\d/.test(txt_(r[9]))) { var c = s25.getRange(debut + j, 6, 1, 2); c.setNumberFormat('@'); c.setValues([[txt_(r[3]), txt_(r[9])]]); n++; }
  });
  console.log(n + ' ligne(s) corrigée(s) ; ' + ecarts + ' écart(s) de correspondance');
}

/* Nettoyage demandé par Bradley le 18/11/2026, puis tri chronologique du tableau unique */
function nettoyerEtTrier_(appliquer) {
  var s25 = SpreadsheetApp.openById(PF.PROD25).getSheetByName(PF.ONGLET25), v = s25.getDataRange().getDisplayValues();
  var supp = [];
  for (var i = 1; i < v.length; i++) {
    var nom = maj_(v[i][1]), prenom = maj_(v[i][2]), num = txt_(v[i][6]), type = maj_(v[i][11]), cie = maj_(v[i][7]);
    var raison = '';
    if (nom === 'SMRCC ANTILLES' && cleContrat_(num) === '5687658') raison = 'SMRCC ANTILLES';
    else if (nom === 'NORMENIUS' && cleContrat_(num) === '1882239') raison = 'NORMENIUS';
    else if (nom === 'BONOSE') raison = 'BONOSE';
    else if (nom === 'VILLAGE' && prenom === 'BRADLEY' && type === 'ADE' && cie === 'GENERALI') raison = 'VILLAGE BRADLEY ADE';
    else if (/PARACHUT/.test(nom) || /FORMATION/.test(type)) raison = 'PARACHUT / FORMATION';
    if (raison) supp.push([i + 1, raison + ' ¦ ' + v[i].slice(0, 12).join(' ¦ ')]);
  }
  var s24 = SpreadsheetApp.openById(PF.PROD24).getSheetByName(PF.ONGLET24), w = s24.getDataRange().getDisplayValues(), supp24 = [];
  for (var j = 1; j < w.length; j++) if (/FORMATION/.test(maj_(w[j][8])) && /PARACHUT/.test(maj_(w[j][1]) + maj_(w[j][10]))) supp24.push([j + 1, w[j].slice(0, 11).join(' ¦ ')]);
  supp.forEach(function (x) { console.log('2025 ligne ' + x[0] + ' : ' + x[1]); });
  supp24.forEach(function (x) { console.log('2024 ligne ' + x[0] + ' : ' + x[1]); });
  var vides = v.slice(1).filter(function (r) { return r[1] && !r[0]; }).map(function (r) { return r[1] + ' ' + r[2]; });
  console.log(supp.length + ' ligne(s) à supprimer en 2025, ' + supp24.length + ' en 2024 ; lignes sans date restantes : ' + vides.join(', '));
  if (!appliquer) return;
  supp.slice().reverse().forEach(function (x) { s25.deleteRow(x[0]); });
  supp24.slice().reverse().forEach(function (x) { s24.deleteRow(x[0]); });
  var der = s25.getLastRow(), col = s25.getLastColumn();
  s25.getRange(2, 1, der - 1, col).sort({ column: 1, ascending: true });
  console.log('Supprimé et trié : lignes 2 à ' + der);
}
function simulerNettoyage() { nettoyerEtTrier_(false); }
function nettoyerEtTrier() { nettoyerEtTrier_(true); }
