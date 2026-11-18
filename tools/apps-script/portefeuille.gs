/* ---------- Portefeuille : repérage des résiliations dans Gmail (Bradley, 18/11/2026) ----------
   Lit les contrats des tableaux « PROD ELOY ASSURANCE DEPUIS 2025 » et « PROD ELOY ASSURANCE 2024 - BON »,
   cherche dans Gmail les fils qui parlent de résiliation et note, pour chaque n° de contrat retrouvé dans un fil,
   la date de résiliation lue dans le texte. Résultat : onglet « Résiliations détectées » de la feuille de suivi.
   Ne modifie pas les tableaux de production : Claude relit le rapport avant toute mise à jour. */

var PF = {
  PROD25: '1Qb2ealh3Zc_pL7gwLPwmqNUeyhF3dGe-IQVjMb8Kgpo', ONGLET25: 'TABLEAU PRODUCTION IARD',
  PROD24: '1fp1DkU-5fCUxRJXhS-VMV0qXPZcvwN5rBpsKByiLHvI', ONGLET24: 'PRODUCTION',
  RAPPORT: 'Résiliations détectées',
  RECHERCHE: '(résiliation OR résilié OR résiliée OR "avenant de résiliation" OR "avis de résiliation" OR "mise en demeure") after:2023/01/01'
};

function contratsPortefeuille_() {
  var l = [];
  var a = SpreadsheetApp.openById(PF.PROD25).getSheetByName(PF.ONGLET25).getDataRange().getDisplayValues();
  for (var i = 1; i < a.length; i++) if (a[i][6]) l.push({ fichier: '2025', ligne: i + 1, nom: (a[i][1] + ' ' + a[i][2]).trim(), contrat: a[i][6], cie: a[i][7].trim(), type: a[i][11], statut: a[i][8].trim() });
  var b = SpreadsheetApp.openById(PF.PROD24).getSheetByName(PF.ONGLET24).getDataRange().getDisplayValues();
  for (var j = 1; j < b.length; j++) if (b[j][9]) l.push({ fichier: '2024', ligne: j + 1, nom: (b[j][1] + ' ' + b[j][2]).trim(), contrat: b[j][9], cie: b[j][10].trim(), type: b[j][8].trim(), statut: (b[j][16] || '').trim() });
  l.forEach(function (c) { c.cle = cleContrat_(c.contrat); });
  return l.filter(function (c) { return c.cle.length >= 6; });
}
/* « A 5702457 », « A-5646297 », « 4299000000011 - 0 » → « 5702457 », « 5646297 », « 4299000000011 » */
function cleContrat_(n) {
  return String(n || '').toUpperCase().replace(/\s+-\s*0$/, '').replace(/-0$/, '').replace(/^[AG]\s*-?\s*(?=\d)/, '').replace(/[\s.\-\/]/g, '');
}
function dateResiliation_(txt) {
  var re = /(résili\w*|resili\w*|cession|vente|à la date du|en date du|à compter du|au)\D{0,60}?(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})/gi, m, out = [];
  while ((m = re.exec(txt)) && out.length < 3) {
    var y = m[4].length === 2 ? '20' + m[4] : m[4];
    if (+m[3] >= 1 && +m[3] <= 12 && +m[2] >= 1 && +m[2] <= 31 && +y >= 2022 && +y <= 2027) out.push(('0' + m[2]).slice(-2) + '/' + ('0' + m[3]).slice(-2) + '/' + y);
  }
  return out;
}
function rapportResiliations() {
  var contrats = contratsPortefeuille_(), lignes = [], vus = {};
  for (var debut = 0; debut < 600; debut += 100) {
    var fils = GmailApp.search(PF.RECHERCHE, debut, 100);
    fils.forEach(function (th) {
      var msgs = th.getMessages(), texte = msgs.map(function (m) { return m.getSubject() + '\n' + m.getPlainBody(); }).join('\n');
      var compact = texte.toUpperCase().replace(/[\s.\-\/]/g, '');
      if (!/RÉSILI|RESILI|MISEENDEMEURE/.test(compact)) return;
      contrats.forEach(function (c) {
        if (compact.indexOf(c.cle) < 0) return;
        var k = c.fichier + c.ligne + th.getId(); if (vus[k]) return; vus[k] = 1;
        var i = texte.toUpperCase().indexOf('RÉSILI'); if (i < 0) i = texte.toUpperCase().indexOf('RESILI');
        var extrait = texte.substr(Math.max(0, i - 80), 260).replace(/\s+/g, ' ');
        lignes.push([c.fichier, c.ligne, c.nom, "'" + c.contrat, c.type, c.cie, c.statut, dateResiliation_(texte).join(' ; '),
          Utilities.formatDate(th.getLastMessageDate(), CFG.FUSEAU, 'dd/MM/yyyy'), th.getFirstMessageSubject(),
          th.getLabels().map(function (l) { return l.getName(); }).join(' | '), extrait, 'https://mail.google.com/mail/u/0/#all/' + th.getId()]);
      });
    });
    if (fils.length < 100) break;
  }
  var ss = feuille_().getParent(), sh = ss.getSheetByName(PF.RAPPORT) || ss.insertSheet(PF.RAPPORT);
  sh.clear();
  var ent = ['Tableau', 'Ligne', 'Client', 'N° contrat', 'Type', 'Compagnie', 'Statut actuel', 'Dates lues', 'Date du fil', 'Objet du fil', 'Libellés', 'Extrait', 'Lien'];
  sh.getRange(1, 1, 1, ent.length).setValues([ent]).setFontWeight('bold');
  if (lignes.length) sh.getRange(2, 1, lignes.length, ent.length).setValues(lignes);
  Logger.log(lignes.length + ' correspondances ; rapport : ' + ss.getUrl() + '#gid=' + sh.getSheetId());
}
