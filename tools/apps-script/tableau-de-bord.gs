/* ---------- Tableau de bord de production (Bradley, 18/11/2026) ----------
   Onglets créés dans « PROD ELOY ASSURANCE DEPUIS 2025 » :
   - « TABLEAU DE BORD » : année au choix, suivi mensuel N / N-1, familles, ventilation Pro / Particuliers × IARD / Santé-prévoyance /
     Emprunteur / Vie-épargne (demandée par les compagnies), compagnies, portefeuille en cours, pièces manquantes, graphiques.
   - « PARAMÈTRES STATS » : famille et branche de chaque type de contrat, taux de commission par compagnie (à remplir), objectif mensuel.
   - « _CALC » (masqué) : une ligne par contrat, colonnes calculées par formules (tout se met à jour seul).
   L'ancien onglet « STATS PRODUCTION IARD » n'est pas modifié. */
var TB = {
  PROD: "'TABLEAU PRODUCTION IARD'", CALC: '_CALC', PARAM: 'PARAMÈTRES STATS', TDB: 'TABLEAU DE BORD',
  TYPES: [  /* type, famille, branche, pro */
    ['AUTO', 'AUTO / 2 ROUES', 'IARD', ''], ['MOTO', 'AUTO / 2 ROUES', 'IARD', ''],
    ['BATEAU', 'BATEAU / JET SKI', 'IARD', ''], ['JET SKI', 'BATEAU / JET SKI', 'IARD', ''],
    ['TAXI MINIBUS', 'FLOTTE / AUTO PRO', 'IARD', 'PRO'], ['TPM', 'FLOTTE / AUTO PRO', 'IARD', 'PRO'], ['TPPC', 'FLOTTE / AUTO PRO', 'IARD', 'PRO'],
    ['MRAUTO', 'FLOTTE / AUTO PRO', 'IARD', 'PRO'], ['W GARAGE', 'FLOTTE / AUTO PRO', 'IARD', 'PRO'],
    ['MRH', 'HABITATION', 'IARD', ''], ['PNO', 'HABITATION', 'IARD', ''], ['GLI', 'HABITATION', 'IARD', ''], ['MRI', 'HABITATION', 'IARD', ''],
    ['RCP', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'], ['RC DECENNALE', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'], ['DO', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'],
    ['TRC', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'], ['MRPRO', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'], ['BRIS DE MACHINE', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'],
    ['RCMS', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'], ['GFA', 'PRO (RC / MULTIRISQUE)', 'IARD', 'PRO'],
    ['SANTE IND', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', ''], ['SANTE COLL', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', 'PRO'],
    ['PREV IND', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', ''], ['PREV COLL', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', 'PRO'],
    ['GAV', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', ''], ['DECES', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', ''], ['OBSEQUES', 'SANTE / PREVOYANCE', 'SANTE / PREVOYANCE', ''],
    ['ADE', 'EMPRUNTEUR', 'EMPRUNTEUR', ''],
    ['PER', 'VIE / EPARGNE', 'VIE / EPARGNE', ''], ['ASSURANCE VIE', 'VIE / EPARGNE', 'VIE / EPARGNE', '']
  ],
  BRANCHES: ['IARD', 'SANTE / PREVOYANCE', 'EMPRUNTEUR', 'VIE / EPARGNE'],
  MOIS: ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'],
  BLEU: '#1B4F9C', CLAIR: '#E8EEF8', GRIS: '#F3F3F3'
};
/* Le classeur est réglé en français : les formules doivent utiliser « ; » comme séparateur (les virgules entre guillemets restent) */
function frF_(f) { var o = '', q = false; for (var i = 0; i < f.length; i++) { var ch = f[i]; if (ch === '"') q = !q; o += (!q && ch === ',') ? ';' : ch; } return o; }
function frFs_(m) { return m.map(function (r) { return r.map(frF_); }); }
function feuilleTB_(ss, nom) { var s = ss.getSheetByName(nom); if (!s) s = ss.insertSheet(nom); return s; }

function construireTableauDeBord() {
  var ss = SpreadsheetApp.openById(PF.PROD25), P = TB.PROD;
  /* ----- Paramètres ----- */
  var pa = feuilleTB_(ss, TB.PARAM);
  if (pa.getLastRow() < 2) {
    pa.getRange('A1:D1').setValues([['TYPE DE CONTRAT', 'FAMILLE', 'BRANCHE', 'PRO ?']]);
    pa.getRange(2, 1, TB.TYPES.length, 4).setValues(TB.TYPES);
    pa.getRange('F1:G1').setValues([['COMPAGNIE', 'TAUX DE COMMISSION (%) – à remplir']]);
    var cies = ['GFA', 'APRIL', 'OCEALIZ', 'GROUPAMA', 'MDM', 'ALPTIS', 'KASE', 'EURODOMMAGES', 'UTWIN', 'KEREIS', 'HELVETIA OCELAIZ', 'SWISSLIFE', 'ADD VALUE', 'SPVIE EDIFICE', 'GENERALI', 'MILTIS', 'PARACHUT'];
    pa.getRange(2, 6, cies.length, 1).setValues(cies.map(function (c) { return [c]; }));
    pa.getRange('I1:J1').setValues([['OBJECTIF', 'VALEUR']]);
    pa.getRange('I2:J4').setValues([['Objectif mensuel de primes (€)', ''], ['Objectif mensuel de contrats', ''], ['Taux de commission moyen (%) – utilisé si la compagnie n\'a pas de taux en colonne G', 12]]);
    pa.getRange('A1:J1').setFontWeight('bold').setBackground(TB.BLEU).setFontColor('#FFFFFF');
    pa.getRange('G2:G60').setNumberFormat('0.0');
    pa.setColumnWidths(1, 10, 150); pa.setColumnWidth(7, 260); pa.setColumnWidth(9, 230); pa.setFrozenRows(1);
    pa.getRange('A' + (TB.TYPES.length + 3)).setValue('Un type absent de cette liste est classé « AUTRES » (IARD) : ajoute-le ici avec sa famille et sa branche.').setFontStyle('italic');
  }
  /* ----- Calculs (une ligne par contrat) ----- */
  var c = feuilleTB_(ss, TB.CALC);
  c.clear();
  c.getRange('A1:P1').setValues([['DATE', 'ANNEE', 'MOIS', 'TYPE', 'FAMILLE', 'BRANCHE', 'SEGMENT', 'COMPAGNIE', 'PRIME', 'STATUT', 'DATE RESIL', 'ANNEE RESIL', 'MOIS RESIL', 'PIECE', 'COMMISSION', 'ACTIF']]);
  var f = {
    A2: '=ARRAYFORMULA(IF(' + P + '!B2:B="",,' + P + '!A2:A))',
    B2: '=ARRAYFORMULA(IF(ISNUMBER(A2:A),YEAR(A2:A),))',
    C2: '=ARRAYFORMULA(IF(ISNUMBER(A2:A),MONTH(A2:A),))',
    D2: '=ARRAYFORMULA(IF(' + P + '!B2:B="",,UPPER(TRIM(' + P + '!L2:L))))',
    E2: "=ARRAYFORMULA(IF(D2:D=\"\",,IFERROR(VLOOKUP(D2:D,'" + TB.PARAM + "'!A:D,2,FALSE),\"AUTRES\")))",
    F2: "=ARRAYFORMULA(IF(D2:D=\"\",,IFERROR(VLOOKUP(D2:D,'" + TB.PARAM + "'!A:D,3,FALSE),\"IARD\")))",
    G2: "=ARRAYFORMULA(IF(D2:D=\"\",,IF((IFERROR(VLOOKUP(D2:D,'" + TB.PARAM + "'!A:D,4,FALSE),\"\")=\"PRO\")+REGEXMATCH(UPPER(" + P + "!D2:D),\"ENTREPRISE|ASSOCIATION|SOCIETE\")+REGEXMATCH(UPPER(" + P + "!B2:B),\"^(SAS|SASU|SARL|EURL|SCI|SCM|SELARL|SNC|SA|CABINET) |\\b(SAS|SASU|SARL|EURL|SCI)$\")>0,\"PRO\",\"PARTICULIER\")))",
    H2: '=ARRAYFORMULA(IF(' + P + '!B2:B="",,UPPER(TRIM(' + P + '!H2:H))))',
    I2: '=ARRAYFORMULA(IF(' + P + '!B2:B="",,IF(ISNUMBER(' + P + '!K2:K),' + P + '!K2:K,0)))',
    J2: '=ARRAYFORMULA(IF(' + P + '!B2:B="",,UPPER(TRIM(' + P + '!I2:I))))',
    K2: '=ARRAYFORMULA(IF(ISNUMBER(' + P + '!M2:M),' + P + '!M2:M,))',
    L2: '=ARRAYFORMULA(IF(ISNUMBER(K2:K),YEAR(K2:K),))',
    M2: '=ARRAYFORMULA(IF(ISNUMBER(K2:K),MONTH(K2:K),))',
    N2: '=ARRAYFORMULA(IF(J2:J="INCOMPLET",IF(TRIM(' + P + '!J2:J)="","(non précisée)",UPPER(TRIM(' + P + '!J2:J))),))',
    O2: "=ARRAYFORMULA(IF(D2:D=\"\",,I2:I*IFERROR(1/(1/VLOOKUP(H2:H,'" + TB.PARAM + "'!F:G,2,FALSE)),'" + TB.PARAM + "'!$J$4)/100))",
    P2: '=ARRAYFORMULA(IF(D2:D="",,IF(J2:J="RESILIE",0,1)))'
  };
  Object.keys(f).forEach(function (k) { c.getRange(k).setFormula(frF_(f[k])); });
  c.hideSheet();

  /* ----- Tableau de bord ----- */
  var t = ss.getSheetByName(TB.TDB);
  if (t) { t.getCharts().forEach(function (ch) { t.removeChart(ch); }); t.clear(); t.getRange('A1:Z200').clearDataValidations(); }
  else t = ss.insertSheet(TB.TDB, 0);
  t.setHiddenGridlines(true);
  var K = "'" + TB.CALC + "'!", AN = '$C$3';
  function titre(cell, txt) { t.getRange(cell).setValue(txt).setFontWeight('bold').setFontSize(12).setFontColor(TB.BLEU); }
  function entete(row, col, vals) { t.getRange(row, col, 1, vals.length).setValues([vals]).setFontWeight('bold').setBackground(TB.BLEU).setFontColor('#FFFFFF').setWrap(true).setVerticalAlignment('middle'); }

  t.getRange('B1').setValue('TABLEAU DE BORD – PRODUCTION ELOY').setFontSize(16).setFontWeight('bold').setFontColor(TB.BLEU);
  t.getRange('B3').setValue('Année :').setFontWeight('bold');
  t.getRange('C3').setValue(new Date().getFullYear()).setFontWeight('bold').setFontSize(13).setBackground('#FFF2CC').setHorizontalAlignment('center')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'], true).build());
  t.getRange('D3').setValue('← change l\'année ici : tout se recalcule').setFontStyle('italic').setFontColor('#666666');

  /* Indicateurs clés */
  titre('B5', 'INDICATEURS CLÉS');
  var kpi = [
    ['Affaires nouvelles (nb)', '=COUNTIFS(' + K + 'B:B,' + AN + ')'],
    ['Primes affaires nouvelles (€ TTC)', '=SUMIFS(' + K + 'I:I,' + K + 'B:B,' + AN + ')'],
    ['Résiliations dans l\'année (nb)', '=COUNTIFS(' + K + 'L:L,' + AN + ')'],
    ['Solde net (nb)', '=C6-C8'],
    ['Taux de résiliation de l\'année', '=IFERROR(C8/(COUNTIFS(' + K + 'B:B,"<="&' + AN + ',' + K + 'D:D,"<>")-COUNTIFS(' + K + 'L:L,"<"&' + AN + ')),0)'],
    ['Contrats en cours aujourd\'hui (nb)', '=SUM(' + K + 'P:P)'],
    ['Primes du portefeuille en cours (€ TTC)', '=SUMIFS(' + K + 'I:I,' + K + 'P:P,1)'],
    ['Contrats INCOMPLETS (nb)', '=COUNTIFS(' + K + 'J:J,"INCOMPLET")'],
    ['Commissions estimées de l\'année (€)', '=SUMIFS(' + K + 'O:O,' + K + 'B:B,' + AN + ')']
  ];
  t.getRange(6, 2, kpi.length, 1).setValues(kpi.map(function (x) { return [x[0]]; }));
  t.getRange(6, 3, kpi.length, 1).setFormulas(frFs_(kpi.map(function (x) { return [x[1]]; })));
  t.getRange('C6:C14').setNumberFormat('#,##0').setFontWeight('bold').setHorizontalAlignment('right');
  t.getRange('C7').setNumberFormat('#,##0 €'); t.getRange('C12').setNumberFormat('#,##0 €'); t.getRange('C14').setNumberFormat('#,##0 €'); t.getRange('C10').setNumberFormat('0.0%');
  t.getRange('B6:C14').setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
  t.getRange('D14').setValue('(si les taux sont remplis dans « PARAMÈTRES STATS »)').setFontStyle('italic').setFontColor('#666666');

  /* Suivi mensuel */
  titre('B17', 'SUIVI MENSUEL');
  entete(18, 2, ['MOIS', 'AFN (nb)', 'PRIMES AFN (€)', 'AFN N-1 (nb)', 'PRIMES N-1 (€)', 'ÉVOLUTION PRIMES', 'RÉSILIATIONS (nb)', 'SOLDE NET (nb)', 'CUMUL PRIMES (€)', 'OBJECTIF PRIMES (€)', '% OBJECTIF']);
  var lignes = TB.MOIS.map(function (m, i) {
    var r = 19 + i, mois = i + 1;
    return [m,
      '=COUNTIFS(' + K + 'B:B,' + AN + ',' + K + 'C:C,' + mois + ')',
      '=SUMIFS(' + K + 'I:I,' + K + 'B:B,' + AN + ',' + K + 'C:C,' + mois + ')',
      '=COUNTIFS(' + K + 'B:B,' + AN + '-1,' + K + 'C:C,' + mois + ')',
      '=SUMIFS(' + K + 'I:I,' + K + 'B:B,' + AN + '-1,' + K + 'C:C,' + mois + ')',
      '=IF(F' + r + '=0,"",D' + r + '/F' + r + '-1)',
      '=COUNTIFS(' + K + 'L:L,' + AN + ',' + K + 'M:M,' + mois + ')',
      '=C' + r + '-H' + r,
      '=SUM($D$19:D' + r + ')',
      "='" + TB.PARAM + "'!$J$2",
      '=IF(K' + r + '="","",IF(K' + r + '=0,"",D' + r + '/K' + r + '))'];
  });
  t.getRange(19, 2, 12, 1).setValues(lignes.map(function (l) { return [l[0]]; }));
  t.getRange(19, 3, 12, 10).setFormulas(frFs_(lignes.map(function (l) { return l.slice(1); })));
  t.getRange('B31').setValue('TOTAL').setFontWeight('bold');
  t.getRange('C31:L31').setFormulas(frFs_([['=SUM(C19:C30)', '=SUM(D19:D30)', '=SUM(E19:E30)', '=SUM(F19:F30)', '=IF(F31=0,"",D31/F31-1)', '=SUM(H19:H30)', '=SUM(I19:I30)', '=D31', '=SUM(K19:K30)', '=IF(K31=0,"",D31/K31)']])).setFontWeight('bold');
  t.getRange('B31:L31').setBackground(TB.CLAIR);
  t.getRange('D19:D31').setNumberFormat('#,##0 €'); t.getRange('F19:F31').setNumberFormat('#,##0 €'); t.getRange('J19:K31').setNumberFormat('#,##0 €');
  t.getRange('G19:G31').setNumberFormat('+0%;-0%;0%'); t.getRange('L19:L31').setNumberFormat('0%');
  t.getRange('B18:L31').setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
  for (var z = 19; z <= 30; z += 2) t.getRange(z, 2, 1, 11).setBackground(TB.GRIS);

  /* Ventilation demandée par les compagnies */
  titre('B34', 'VENTILATION PRO / PARTICULIERS × BRANCHE (année choisie, affaires nouvelles)');
  function ventilation(row0, colonneValeur, filtreAnnee, format, libelle) {
    entete(row0, 2, [libelle].concat(TB.BRANCHES).concat(['TOTAL', '% DU TOTAL']));
    ['PRO', 'PARTICULIER'].forEach(function (seg, j) {
      var r = row0 + 1 + j, cells = TB.BRANCHES.map(function (b) {
        var crit = K + 'G:G,"' + seg + '",' + K + 'F:F,"' + b + '"' + filtreAnnee;
        return colonneValeur ? '=SUMIFS(' + K + colonneValeur + ':' + colonneValeur + ',' + crit + ')' : '=COUNTIFS(' + crit + ')';
      });
      t.getRange(r, 2).setValue(seg === 'PRO' ? 'CLIENTS PRO' : 'PARTICULIERS');
      t.getRange(r, 3, 1, 6).setFormulas(frFs_([cells.concat(['=SUM(C' + r + ':F' + r + ')', '=IFERROR(G' + r + '/$G$' + (row0 + 3) + ',0)'])]));
    });
    var rt = row0 + 3;
    t.getRange(rt, 2).setValue('TOTAL').setFontWeight('bold');
    t.getRange(rt, 3, 1, 6).setFormulas(frFs_([['C', 'D', 'E', 'F', 'G'].map(function (L) { return '=' + L + (row0 + 1) + '+' + L + (row0 + 2); }).concat(['=IFERROR(G' + rt + '/G' + rt + ',0)'])])).setFontWeight('bold');
    t.getRange(row0 + 4, 2).setValue('% DU TOTAL').setFontStyle('italic');
    t.getRange(row0 + 4, 3, 1, 5).setFormulas(frFs_([['C', 'D', 'E', 'F', 'G'].map(function (L) { return '=IFERROR(' + L + rt + '/$G$' + rt + ',0)'; })])).setNumberFormat('0%').setFontStyle('italic');
    t.getRange(row0 + 1, 3, 3, 5).setNumberFormat(format); t.getRange(row0 + 1, 8, 3, 1).setNumberFormat('0%');
    t.getRange(rt, 2, 1, 7).setBackground(TB.CLAIR);
    t.getRange(row0, 2, 5, 7).setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
  }
  var fa = ',' + K + 'B:B,' + AN;
  ventilation(35, 'I', fa, '#,##0 €', 'PRIMES (€ TTC)');
  ventilation(41, '', fa, '#,##0', 'NOMBRE DE CONTRATS');
  ventilation(47, 'O', fa, '#,##0 €', 'COMMISSIONS ESTIMÉES (€)');
  titre('B53', 'VENTILATION DU PORTEFEUILLE EN COURS (contrats non résiliés, toutes années)');
  ventilation(54, 'I', ',' + K + 'P:P,1', '#,##0 €', 'PRIMES EN COURS (€ TTC)');
  ventilation(60, 'O', ',' + K + 'P:P,1', '#,##0 €', 'COMMISSIONS ANNUELLES ESTIMÉES (€)');
  t.getRange('B66').setValue('IARD = auto, 2 roues, bateau, flotte, habitation, RC et multirisques pro. Les commissions s\'affichent dès que les taux sont remplis dans « PARAMÈTRES STATS ».').setFontStyle('italic').setFontColor('#666666');

  /* Familles et compagnies (listes dynamiques) */
  titre('N17', 'PAR FAMILLE (année choisie)');
  t.getRange('N18').setFormula(frF_('=QUERY(' + K + 'A2:P,"select E, count(D), sum(I) where B = "&' + AN + '&" group by E order by sum(I) desc label E \'FAMILLE\', count(D) \'NB\', sum(I) \'PRIMES (€)\'",0)'));
  titre('N34', 'PAR COMPAGNIE (année choisie)');
  t.getRange('N35').setFormula(frF_('=QUERY(' + K + 'A2:P,"select H, count(D), sum(I) where B = "&' + AN + '&" group by H order by sum(I) desc label H \'COMPAGNIE\', count(D) \'NB\', sum(I) \'PRIMES (€)\'",0)'));
  titre('S17', 'PIÈCES MANQUANTES (contrats INCOMPLETS)');
  t.getRange('S18').setFormula(frF_('=QUERY(' + K + 'A2:P,"select N, count(D), sum(I) where J = \'INCOMPLET\' group by N order by count(D) desc label N \'PIÈCE\', count(D) \'NB\', sum(I) \'PRIMES (€)\'",0)'));
  ['P19:P32', 'P36:P60', 'U19:U32'].forEach(function (r) { t.getRange(r).setNumberFormat('#,##0 €'); });
  ['N18:P18', 'N35:P35', 'S18:U18'].forEach(function (r) { t.getRange(r).setFontWeight('bold').setBackground(TB.BLEU).setFontColor('#FFFFFF'); });

  /* Mise en page */
  t.setColumnWidth(1, 20); t.setColumnWidth(2, 250); t.setColumnWidths(3, 10, 105); t.setColumnWidth(13, 30);
  t.setColumnWidth(14, 200); t.setColumnWidths(15, 2, 90); t.setColumnWidth(18, 30); t.setColumnWidth(19, 200); t.setColumnWidths(20, 2, 90);
  t.setRowHeight(18, 36); t.setFrozenRows(3);

  /* Graphiques */
  t.insertChart(t.newChart().asColumnChart().addRange(t.getRange('B18:B30')).addRange(t.getRange('D18:D30')).addRange(t.getRange('F18:F30'))
    .setOption('title', 'Primes affaires nouvelles : année choisie et année précédente').setOption('legend', { position: 'bottom' })
    .setOption('colors', [TB.BLEU, '#9FB7DD']).setNumHeaders(1).setPosition(68, 2, 0, 0).setOption('width', 760).setOption('height', 340).build());
  t.insertChart(t.newChart().asPieChart().addRange(t.getRange('N19:N32')).addRange(t.getRange('P19:P32'))
    .setOption('title', 'Répartition des primes par famille').setOption('pieHole', 0.4).setPosition(68, 9, 0, 0).setOption('width', 560).setOption('height', 340).build());
  SpreadsheetApp.flush();
  console.log('Tableau de bord construit');
}
