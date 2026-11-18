/* ---------- Dossiers clients du Drive (Bradley, 18/11/2026) ----------
   Dossier « PORTEFEUILLE ELOY ASSURANCES x » : un dossier par client (« NOM PRÉNOM », ou nom de la société),
   les pièces du client directement dedans (identité, permis, RIB, Kbis, pièces des enfants…),
   puis un sous-dossier par contrat : « TYPE – n° de contrat – COMPAGNIE » (+ « – immatriculation » pour l'auto).
   Les pièces sont reprises des pièces jointes Gmail échangées avec le client.
   planDossiers()      : simulation, écrit le plan dans l'onglet « Plan dossiers » sans rien créer.
   creerDossiers()     : crée ou complète les dossiers et range les pièces (reprend seul jusqu'à la fin).
   Journal : onglet « Dossiers clients » de la feuille de suivi. Rien n'est supprimé ni écrasé. */

var DC = {
  RACINE: '1evJakSIA5nGfx9EZsmws8NAuSY_tyuEd',
  PLAN: 'Plan dossiers', JOURNAL: 'Dossiers clients',
  SOCIETE: /^(ENTREPRISE|ASSOCIATION|SOCIETE|SOCIÉTÉ)$/i,
  FORMES: /^(SAS|SASU|SARL|EURL|SCI|SCM|SELARL|SNC|SA)$/i,
  IDENTITE: /(cni|carte.?d.?identit|identit[eé]|passeport|titre.?de.?s[eé]jour|permis|\brib\b|relev[eé].?d.?identit[eé].?bancaire|iban|kbis|k-?bis|extrait.?k|livret.?de.?famille|acte.?de.?(mariage|naissance)|pacs|justificatif.?de.?domicile|avis.?d.?imp)/i,
  CONTRAT: /(carte.?grise|certificat.?d.?immat|\bc\.?g\b|contr[oô]le.?technique|\bc\.?t\b|relev[eé].?d.?info|conditions.?particuli|\bc\.?p\b|contrat|avenant|attestation|\bbail\b|r[ée]siliation|devoir.?de.?conseil|questionnaire|cession|facture.?d.?achat|carte.?verte)/i,
  IGNORE: /^(image\d{3}|outlook-|logo|signature|sig_|bloc-eloy|ico-)|\.(ics|vcf|gif|htm|html)$/i,
  ELOY: /(^eloy_|^der[ _-]|document.?d.?entr[ée]e.?en.?relation|questionnaire_eloy|eloy.?assurances)/i,
  TEMPS_MAX: 4.6 * 60 * 1000,
  TEMPS_PIECES: 40 * 1000          /* au plus 40 s de reprise des pièces par client et par passage */
};

/* ---------- Clients des deux tableaux ---------- */
function sansAccentMaj_(s) { return sansAccent_(s).toUpperCase().replace(/[^A-Z0-9&]+/g, ' ').trim(); }
function typeContrat_(t) {
  var x = sansAccentMaj_(t);
  if (/^AUTO|TAXI|TPM|FLOTTE|W GARAGE|MRAUTO/.test(x)) return x.indexOf('AUTO') === 0 ? 'AUTO' : x;
  if (/^MOTO/.test(x)) return 'MOTO';
  if (/^SANTE/.test(x)) return 'SANTE';
  if (/^PREV/.test(x)) return 'PREVOYANCE';
  if (/^RC ?D|DECENNALE/.test(x)) return 'RCD';
  return x || 'CONTRAT';
}
function clientsPortefeuille_() {
  var map = {}, ordre = [];
  function ajoute(f, ligne, nom, prenom, prof, mail, tel, contrat, cie, type, date) {
    nom = String(nom || '').trim(); prenom = String(prenom || '').trim();
    if (!nom && !prenom) return;
    var societe = DC.SOCIETE.test(String(prof || '').trim()) || DC.FORMES.test(nom);
    var titre;
    if (societe) titre = DC.FORMES.test(nom) && prenom ? nom + ' ' + prenom : nom;
    else titre = (nom + ' ' + prenom).trim();
    titre = sansAccentMaj_(titre).replace(/ & /g, '&');
    var cle = titre.replace(/[^A-Z0-9]/g, '');
    if (!map[cle]) { map[cle] = { titre: titre, cle: cle, societe: societe, extra: '', mails: [], contrats: [], lignes: [] }; ordre.push(cle); }
    var c = map[cle];
    if (societe && prenom && c.extra.indexOf(prenom) < 0) c.extra += ' ' + prenom;
    String(mail || '').split(/[\/;, ]+/).forEach(function (m) { m = m.trim().toLowerCase(); if (emailValide_(m) && c.mails.indexOf(m) < 0) c.mails.push(m); });
    c.lignes.push(f + ':' + ligne);
    var n = String(contrat || '').replace(/\s+/g, ' ').trim();
    if (n && !/ATTENTE/i.test(n)) c.contrats.push({ numero: n, cle: cleContrat_(n), cie: sansAccentMaj_(cie), type: typeContrat_(type), date: date });
  }
  var a = SpreadsheetApp.openById(PF.PROD25).getSheetByName(PF.ONGLET25).getDataRange().getDisplayValues();
  for (var i = 1; i < a.length; i++) ajoute('2025', i + 1, a[i][1], a[i][2], a[i][3], a[i][4], a[i][5], a[i][6], a[i][7], a[i][11], a[i][0]);
  var b = SpreadsheetApp.openById(PF.PROD24).getSheetByName(PF.ONGLET24).getDataRange().getDisplayValues();
  for (var j = 1; j < b.length; j++) if (!/FORMATION/i.test(b[j][8])) ajoute('2024', j + 1, b[j][1], b[j][2], b[j][5], b[j][4], b[j][3], b[j][9], b[j][10], b[j][8], b[j][0]);
  /* même n° de contrat sous deux noms (IBRO / IBRO MADOUGOU …) : un seul client */
  var proprio = {};
  ordre = ordre.filter(function (k) {
    var c = map[k], autre = null;
    c.contrats.forEach(function (x) { if (!autre && x.cle.length >= 6 && proprio[x.cle] && proprio[x.cle] !== k) autre = proprio[x.cle]; });
    if (autre) {
      var a = map[autre];
      c.mails.forEach(function (m) { if (a.mails.indexOf(m) < 0) a.mails.push(m); });
      a.contrats = a.contrats.concat(c.contrats); a.lignes = a.lignes.concat(c.lignes);
      c.contrats.forEach(function (x) { proprio[x.cle] = autre; });
      return false;
    }
    c.contrats.forEach(function (x) { proprio[x.cle] = k; });
    return true;
  });
  return ordre.map(function (k) {
    var c = map[k], vus = {};
    c.contrats = c.contrats.filter(function (x) { if (vus[x.cle]) return false; vus[x.cle] = 1; return true; });
    return c;
  });
}

/* ---------- Dossiers existants ---------- */
function dossiersExistants_() {
  var l = [], it = DriveApp.getFolderById(DC.RACINE).getFolders();
  while (it.hasNext()) { var f = it.next(); l.push({ f: f, nom: f.getName(), cle: sansAccentMaj_(f.getName().split('/')[0]).replace(/[^A-Z0-9]/g, '') }); }
  return l;
}
var DC_VIDES = /^(ET|LES|DES|DE|DU|LA|LE|SAS|SASU|SARL|EURL|SCI|SCM|SELARL|SNC|SA|SALARIE|ENTREPRISE|CABINET|MR|MME|DR|DRE)$/;
function jetons_(s) { return sansAccentMaj_(s).split(' ').filter(function (w) { return w.length > 1 && !DC_VIDES.test(w); }); }
function memeMot_(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)) return true;
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  var i = 0, j = 0, diff = 0;                       /* une seule lettre de différence (KURTENEY / KURTNEY) */
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else { diff++; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } }
  return diff + (a.length - i) + (b.length - j) <= 1;
}
/* Dossier existant le plus proche : le nom du client doit y figurer (dans n'importe quel ordre, avec ou sans profession) */
function trouverDossier_(client, existants) {
  var t = jetons_(client.titre), bonus = jetons_(client.extra || ''), best = null, bs = -1, be = 99;
  if (!t.length) return null;
  for (var k = 0; k < existants.length; k++) if (existants[k].cle === client.cle) return existants[k];   /* D.G ELEC 972 = DG ELEC 972 */
  existants.forEach(function (e) {
    var w = jetons_(e.nom);
    function a(x) { return w.some(function (y) { return memeMot_(x, y); }); }
    if (!a(t[0])) return;
    var score = t.filter(a).length, extra = w.filter(function (y) { return !t.concat(bonus).some(function (x) { return memeMot_(x, y); }); }).length;
    if (score < Math.min(2, t.length)) return;
    score += bonus.filter(a).length * 0.5;
    if (memeMot_(w[0], t[0])) score += 0.75;           /* le dossier commence par le nom du client */
    if (score > bs || (score === bs && extra < be)) { best = e; bs = score; be = extra; }
  });
  if (best) return best;
  /* un seul dossier qui commence par le même nom de famille (PARDON KATHARIAN → PARDON KATARINA …) */
  var memes = existants.filter(function (e) {
    var w = jetons_(e.nom);
    return w.length && t[0].length >= 4 && memeMot_(w[0], t[0]) && (t.length < 2 || w.some(function (y) { return y.slice(0, 3) === t[1].slice(0, 3); }));
  });
  return memes.length === 1 && !client.societe ? memes[0] : null;
}
function nomSousDossier_(c, immat) {
  return [c.type, c.numero, c.cie].concat(immat ? [immat] : []).join(' – ');
}
/* Immatriculation citée au plus près du n° de contrat (à moins de 250 caractères) dans les mails qui le mentionnent */
function immatriculation_(contrat) {
  if (!contrat.cle || contrat.cle.length < 6) return '';
  var compte = {}, num = contrat.numero.replace(/"/g, ''), fils = GmailApp.search('"' + num + '"', 0, 6);
  var reNum = new RegExp(num.replace(/[^A-Z0-9]/gi, '').split('').join('[\\s.\\-\\/]?'), 'gi');
  fils.forEach(function (th) {
    th.getMessages().slice(0, 4).forEach(function (m) {
      var t = (m.getSubject() + ' \n ' + m.getPlainBody()).toUpperCase(), y;
      reNum.lastIndex = 0;
      while ((y = reNum.exec(t))) {
        var zone = t.slice(Math.max(0, y.index - 250), y.index + 250), re = /\b([A-HJ-NP-TV-Z]{2})[ -]?(\d{3})[ -]?([A-HJ-NP-TV-Z]{2})\b/g, x;
        while ((x = re.exec(zone))) {
          var k = x[1] + '-' + x[2] + '-' + x[3];
          if (/^(FR|EU|SA|RC|TV)-/.test(k)) continue;
          compte[k] = (compte[k] || 0) + 1 / (1 + Math.abs(x.index - Math.min(250, y.index)) / 50);
        }
      }
    });
  });
  var best = '', n = 0; Object.keys(compte).forEach(function (k) { if (compte[k] > n) { best = k; n = compte[k]; } });
  return best;
}
/* Recalcule l'immatriculation des sous-dossiers auto créés par le script (journal) et les renomme si besoin */
function corrigerImmatriculations() {
  var jr = feuille_().getParent().getSheetByName(DC.JOURNAL), v = jr.getDataRange().getDisplayValues(), n = 0;
  var racine = DriveApp.getFolderById(DC.RACINE);
  v.slice(1).forEach(function (r) {
    if (r[2] !== 'Sous-dossier créé') return;
    var p = r[3].split(' – ');
    if (p.length !== 4 || !/^(AUTO|TAXI|MOTO)/.test(p[0])) return;
    var juste = immatriculation_({ numero: p[1], cle: cleContrat_(p[1]) });
    if (juste === p[3]) return;
    var nouveau = [p[0], p[1], p[2]].concat(juste ? [juste] : []).join(' – ');
    var it = DriveApp.searchFolders('title = "' + r[3].replace(/"/g, '') + '" and trashed = false');
    while (it.hasNext()) { it.next().setName(nouveau); n++; }
    console.log(r[3] + ' → ' + nouveau);
  });
  console.log(n + ' sous-dossier(s) renommé(s)');
}

/* ---------- Plan (simulation) ---------- */
function planDossiers() {
  var clients = clientsPortefeuille_(), existants = dossiersExistants_(), lignes = [];
  clients.forEach(function (c) {
    var e = trouverDossier_(c, existants);
    lignes.push([c.titre, e ? 'existant : ' + e.nom : (c.contrats.length ? 'à créer' : 'à vérifier (sans contrat)'), c.societe ? 'société' : 'personne', c.mails.join(' '), c.contrats.map(function (x) { return nomSousDossier_(x, ''); }).join('\n'), c.lignes.join(' ')]);
  });
  var ss = feuille_().getParent(), sh = ss.getSheetByName(DC.PLAN) || ss.insertSheet(DC.PLAN);
  sh.clear();
  sh.getRange(1, 1, 1, 6).setValues([['Dossier client', 'Drive', 'Type', 'E-mails', 'Sous-dossiers contrats (sans immatriculation)', 'Lignes des tableaux']]).setFontWeight('bold');
  if (lignes.length) sh.getRange(2, 1, lignes.length, 6).setValues(lignes);
  Logger.log(clients.length + ' clients, ' + lignes.filter(function (l) { return l[1] === 'à créer'; }).length + ' dossiers à créer, ' + existants.length + ' dossiers déjà sur le Drive');
  lignes.forEach(function (l, i) { console.log((i + 1) + ' ¦ ' + l[0] + ' ¦ ' + l[1] + ' ¦ ' + l[4].replace(/\n/g, ' / ')); });
}

/* ---------- Création et rangement ---------- */
function creerDossiers() {
  var debut = Date.now(), p = PropertiesService.getScriptProperties();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'creerDossiers') ScriptApp.deleteTrigger(t); });
  var clients = clientsPortefeuille_(), existants = dossiersExistants_(), racine = DriveApp.getFolderById(DC.RACINE);
  mailsPropres_(clients, existants);
  var jr = onglet_(DC.JOURNAL, ['Le', 'Client', 'Action', 'Détail']);
  var i = Number(p.getProperty('DC_INDEX') || 0);
  for (; i < clients.length; i++) {
    if (Date.now() - debut > DC.TEMPS_MAX - 70 * 1000) break;
    var fin = p.getProperty('DC_INDEX_FIN');
    if (fin !== null && i >= Number(fin)) { Logger.log('Rejoint le second passage (' + i + ')'); return; }
    try { traiterClient_(clients[i], existants, racine, jr); }
    catch (e) { jr.appendRow([new Date(), clients[i].titre, 'Erreur', String(e)]); }
    p.setProperty('DC_INDEX', String(i + 1));
  }
  if (i < clients.length) { ScriptApp.newTrigger('creerDossiers').timeBased().after(60 * 1000).create(); Logger.log(i + '/' + clients.length + ' clients traités, suite dans 1 minute'); }
  else { p.deleteProperty('DC_INDEX'); Logger.log('Terminé : ' + clients.length + ' clients'); }
}
/* Une adresse utilisée par des clients rangés dans des dossiers différents (famille, société) ne sert pas à reprendre les pièces */
function mailsPropres_(clients, existants) {
  var dossiers = {};
  clients.forEach(function (c) {
    var e = trouverDossier_(c, existants), d = e ? e.nom : c.titre;
    c.mails.forEach(function (m) { (dossiers[m] = dossiers[m] || {})[d] = 1; });
  });
  clients.forEach(function (c) { c.mailsPropres = c.mails.filter(function (m) { return Object.keys(dossiers[m]).length === 1; }); });
}
/* Second passage en parallèle, de la fin du portefeuille vers le début ; s'arrête en rejoignant creerDossiers */
function creerDossiersFin() {
  var debut = Date.now(), p = PropertiesService.getScriptProperties();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'creerDossiersFin') ScriptApp.deleteTrigger(t); });
  var clients = clientsPortefeuille_(), existants = dossiersExistants_(), racine = DriveApp.getFolderById(DC.RACINE);
  mailsPropres_(clients, existants);
  var jr = onglet_(DC.JOURNAL, ['Le', 'Client', 'Action', 'Détail']);
  var j = p.getProperty('DC_INDEX_FIN'); j = j === null ? clients.length - 1 : Number(j);
  for (; j >= 0; j--) {
    if (Date.now() - debut > DC.TEMPS_MAX - 70 * 1000) break;
    if (j < Number(p.getProperty('DC_INDEX') || 0)) { Logger.log('Rejoint le premier passage (' + j + ')'); return; }
    try { traiterClient_(clients[j], existants, racine, jr); }
    catch (e) { jr.appendRow([new Date(), clients[j].titre, 'Erreur', String(e)]); }
    p.setProperty('DC_INDEX_FIN', String(j - 1));
  }
  if (j >= 0) { ScriptApp.newTrigger('creerDossiersFin').timeBased().after(60 * 1000).create(); Logger.log('Reste ' + (j + 1) + ' clients, suite dans 1 minute'); }
}
/* Remet les deux passages à zéro (pour un nouveau passage complet, par ex. pour compléter les pièces) */
function reinitialiserDossiers() { var p = PropertiesService.getScriptProperties(); p.deleteProperty('DC_INDEX'); p.deleteProperty('DC_INDEX_FIN'); }
function traiterClient_(c, existants, racine, jr) {
  var e = trouverDossier_(c, existants), dossier;
  if (e) dossier = e.f;
  else if (!c.contrats.length) { jr.appendRow([new Date(), c.titre, 'À vérifier', 'aucun n° de contrat dans le tableau, dossier non créé']); return; }
  else { dossier = racine.createFolder(c.titre); existants.push({ f: dossier, nom: c.titre, cle: c.cle }); jr.appendRow([new Date(), c.titre, 'Dossier créé', '']); }
  /* sous-dossiers contrats */
  var sous = [], it = dossier.getFolders();
  while (it.hasNext()) { var f = it.next(); sous.push({ f: f, nom: f.getName(), compact: f.getName().toUpperCase().replace(/[\s.\-\/]/g, '') }); }
  c.contrats.forEach(function (k) {
    var trouve = null;
    sous.forEach(function (s) { if (!trouve && k.cle.length >= 5 && s.compact.indexOf(k.cle) >= 0) trouve = s; });
    if (!trouve) {
      var immat = /^(AUTO|TAXI|MOTO)/.test(k.type) ? immatriculation_(k) : '';
      var nom = nomSousDossier_(k, immat);
      trouve = { f: dossier.createFolder(nom), nom: nom, compact: nom.toUpperCase().replace(/[\s.\-\/]/g, '') };
      sous.push(trouve);
      jr.appendRow([new Date(), c.titre, 'Sous-dossier créé', nom]);
    }
    k.dossier = trouve.f; k.compact = trouve.compact;
  });
  rangerPieces_(c, dossier, jr);
}
function nomsPresents_(f) { var s = {}, it = f.getFiles(); while (it.hasNext()) { var x = it.next(); s[x.getName() + '|' + x.getSize()] = 1; } return s; }
function rangerPieces_(c, dossier, jr) {
  var mails = c.mailsPropres || c.mails;
  if (!mails.length) { if (c.mails.length) jr.appendRow([new Date(), c.titre, 'Pièces non reprises', 'e-mail partagé avec un autre client : ' + c.mails.join(' ')]); return; }
  var q = '(' + mails.map(function (m) { return 'from:' + m + ' OR to:' + m; }).join(' OR ') + ') has:attachment';
  var fils = GmailApp.search(q, 0, 25), presents = {}, n = 0, fin = Date.now() + DC.TEMPS_PIECES, partiel = false;
  function cible(nomPj, sujet) {
    var t = (nomPj + ' ' + sujet).toUpperCase().replace(/[\s.\-\/]/g, '');
    var parNumero = c.contrats.filter(function (k) { return k.cle.length >= 5 && t.indexOf(k.cle) >= 0; });
    if (DC.IDENTITE.test(nomPj)) return dossier;
    if (parNumero.length) return parNumero[0].dossier;
    if (DC.CONTRAT.test(nomPj)) return c.contrats.length === 1 ? c.contrats[0].dossier : dossier;
    return dossier;
  }
  fils.forEach(function (th) {
    th.getMessages().forEach(function (m) {
      if (Date.now() > fin) { partiel = true; return; }
      var duClient = mails.some(function (x) { return m.getFrom().toLowerCase().indexOf(x) >= 0; });
      m.getAttachments({ includeInlineImages: false }).forEach(function (pj) {
        var nom = pj.getName() || 'piece', taille = pj.getSize();
        if (DC.IGNORE.test(nom) || DC.ELOY.test(nom) || taille < 15000) return;
        if (/^image\//.test(pj.getContentType()) && taille < 40000) return;
        /* pièce non reconnue : gardée seulement si c'est le client qui l'a envoyée */
        if (!duClient && !DC.IDENTITE.test(nom) && !DC.CONTRAT.test(nom)) return;
        var f = cible(nom, m.getSubject()), id = f.getId();
        presents[id] = presents[id] || nomsPresents_(f);
        if (presents[id][nom + '|' + taille]) return;
        f.createFile(pj.copyBlob().setName(nom));
        presents[id][nom + '|' + taille] = 1; n++;
      });
    });
  });
  if (n || partiel) jr.appendRow([new Date(), c.titre, 'Pièces rangées', n + ' fichier(s)' + (partiel ? ' (à compléter : relancer creerDossiers)' : '')]);
}

function logDossiers() { var n = dossiersExistants_().map(function (e) { return e.nom.trim(); }).sort(); for (var i = 0; i < n.length; i += 40) console.log(n.slice(i, i + 40).join(' | ')); }

/* ---------- Contrats souscrits absents du tableau 2025 (contrôle) ---------- */
function contratsManquants() {
  var mails = {}, noms = [];
  clientsPortefeuille_().forEach(function (c) { c.mails.forEach(function (m) { mails[m] = 1; }); noms.push(jetons_(c.titre)); });
  var vus = {}, n = 0, nb = 0;
  var fils = (GmailApp.getUserLabelByName('1. ASSURANCES/03. AFN - SOUSCRIPTION') || { getThreads: function () { return []; } }).getThreads(0, 300).filter(function (th) { return th.getLastMessageDate() > new Date(2025, 11, 1); })
    .concat(GmailApp.search('(from:yousign OR from:docuseal) after:2025/12/01 (signé OR signed OR completed OR terminé)', 0, 200));
  fils.forEach(function (th) {
    if (vus[th.getId()]) return; vus[th.getId()] = 1;
    var ext = [], texte = th.getFirstMessageSubject();
    th.getMessages().forEach(function (m) {
      (m.getFrom() + ',' + m.getTo() + ',' + m.getCc()).toLowerCase().split(',').forEach(function (a) {
        var x = (a.match(/[\w.+'-]+@[\w-]+\.[\w.-]+/) || [''])[0];
        if (x && !/eloy|bradleyvillages|yousign|docuseal|gfa|groupama|april|alptis|oceliaz|ocealiz|kase|helvetia|mdm|utwin|kereis|noreply|no-reply/.test(x) && ext.indexOf(x) < 0) ext.push(x);
      });
    });
    var connu = ext.some(function (x) { return mails[x]; });
    if (!connu) {
      var sujet = jetons_(texte);
      connu = noms.some(function (t) { return t.length && t[0].length >= 4 && sujet.indexOf(t[0]) >= 0 && (t.length < 2 || t[0].length >= 5 || sujet.indexOf(t[1]) >= 0); });
    }
    if (!connu) { n++; console.log(Utilities.formatDate(th.getLastMessageDate(), 'America/Martinique', 'dd/MM/yyyy') + ' ¦ ' + texte + ' ¦ ' + ext.join(' ')); }
  });
  console.log(n + ' fil(s) sans client correspondant dans les tableaux, sur ' + Object.keys(vus).length);
}

function logJournal() {
  var sh = feuille_().getParent().getSheetByName(DC.JOURNAL), v = sh ? sh.getDataRange().getDisplayValues() : [];
  console.log('Index : ' + PropertiesService.getScriptProperties().getProperty('DC_INDEX') + ' / fin : ' + PropertiesService.getScriptProperties().getProperty('DC_INDEX_FIN') + ' ; lignes du journal : ' + v.length);
  var c = {}; v.slice(1).forEach(function (r) { c[r[2]] = (c[r[2]] || 0) + 1; }); console.log(JSON.stringify(c));
  v.slice(-30).forEach(function (r) { console.log(r[1] + ' ¦ ' + r[2] + ' ¦ ' + r[3]); });
}
