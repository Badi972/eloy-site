/**
 * Eloy – relais automatique des demandes du site (Google Apps Script)
 * À installer dans le compte Google eloy.assurances@gmail.com (celui qui reçoit les demandes du site).
 *
 * Toutes les 5 minutes :
 *  1. lit les nouvelles demandes envoyées par le site (mails « New form submission on Webflow ») ;
 *  2. pour un produit qui a un questionnaire en ligne, envoie au client un mail avec le lien du questionnaire ;
 *  3. relance une fois le client après 48 h s'il n'a pas rempli le questionnaire (entre 8 h et 19 h) ;
 *  4. note chaque demande dans la feuille Google Sheets « Eloy – Demandes du site ».
 * Les demandes reçues avant l'installation ne sont pas traitées.
 *
 * Installation : coller ce fichier dans un projet Apps Script, puis exécuter une fois la fonction « installer ».
 * Ajouter un questionnaire : une ligne dans QUESTIONNAIRES (type de demande du site → questionnaire du site).
 */

var CFG = {
  SITE: 'https://www.eloy-assurances-patrimoine.fr/',
  QUESTIONNAIRES: {
    'Assurance habitation': 'habitation'
  },
  RELANCE_APRES_HEURES: 48,
  HEURES_RELANCE: [8, 19],
  FUSEAU: 'America/Martinique',
  EXPEDITEUR: 'Bradley VILLAGE – Eloy',
  FEUILLE: 'Eloy – Demandes du site',
  RECHERCHE: 'from:no-reply-forms@webflow.com subject:"New form submission" newer_than:3d'
};

var COLS = ['Reçue le', 'ID', 'Type de demande', 'Nom', 'Téléphone', 'E-mail', 'Territoire', 'Statut',
            'Lien envoyé le', 'Relancé le', 'Questionnaire reçu le'];

/* ---------- Installation (à exécuter une seule fois) ---------- */
function installer() {
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('DEPUIS')) p.setProperty('DEPUIS', String(Date.now()));
  feuille_();
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('traiter').timeBased().everyMinutes(5).create();
  traiter();
  Logger.log('Installé. Feuille de suivi : ' + feuille_().getParent().getUrl());
}

/* ---------- Traitement périodique ---------- */
function traiter() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    nouvellesDemandes_();
    relancer_();
  } finally {
    lock.releaseLock();
  }
}

function nouvellesDemandes_() {
  var depuis = Number(PropertiesService.getScriptProperties().getProperty('DEPUIS') || Date.now());
  var sh = feuille_(), vus = {};
  lignes_(sh).forEach(function (r) { vus[r.v[1]] = 1; });
  var msgs = [];
  GmailApp.search(CFG.RECHERCHE, 0, 50).forEach(function (th) {
    th.getMessages().forEach(function (m) {
      if (m.getDate().getTime() >= depuis && !vus[m.getId()]) msgs.push(m);
    });
  });
  msgs.sort(function (a, b) { return a.getDate() - b.getDate(); });
  msgs.forEach(function (m) {
    var d = analyser(m.getPlainBody() || m.getBody().replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
    var ligne = [m.getDate(), m.getId(), d.type, d.nom, d.tel, d.email, d.territoire, '', '', '', ''];
    var statut;
    if (/^Questionnaire /i.test(d.type)) {
      statut = 'Questionnaire reçu';
      ligne[10] = m.getDate();
      marquerQuestionnaireRecu_(sh, d.email, m.getDate());
    } else if (CFG.QUESTIONNAIRES[d.type]) {
      if (!emailValide_(d.email)) statut = 'E-mail invalide';
      else if (dejaEnvoye_(sh, d.email, d.type)) statut = 'Doublon';
      else {
        envoyerLien_(d, false);
        statut = 'Lien envoyé';
        ligne[8] = new Date();
      }
    } else {
      statut = 'Sans questionnaire';
    }
    ligne[7] = statut;
    sh.appendRow(ligne);
    vus[m.getId()] = 1;
    envoyerAssurevo_(d, m.getPlainBody());
  });
}

function relancer_() {
  var h = Number(Utilities.formatDate(new Date(), CFG.FUSEAU, 'H'));
  if (h < CFG.HEURES_RELANCE[0] || h >= CFG.HEURES_RELANCE[1]) return;
  var sh = feuille_(), limite = Date.now() - CFG.RELANCE_APRES_HEURES * 3600 * 1000;
  lignes_(sh).forEach(function (r) {
    var v = r.v;
    if (v[7] !== 'Lien envoyé' || !(v[8] instanceof Date) || v[8].getTime() > limite) return;
    envoyerLien_({ type: v[2], nom: v[3], tel: String(v[4] || ''), email: v[5] }, true);
    sh.getRange(r.n, 8, 1, 3).setValues([['Relancé', v[8], new Date()]]);
  });
}

/* ---------- Lecture du mail de notification du site ---------- */
function analyser(txt) {
  txt = String(txt || '').replace(/\r/g, '');
  function champ(re) { var m = txt.match(re); return m ? m[1].trim() : ''; }
  var STOP = '(?=\\s+(?:Message|Page|Formulaire|Segment|Territoire|Accord de recontact|Source publicitaire|Vous êtes)\\s*:|\\n|$)';
  return {
    nom: champ(/^\s*Nom:\s*(.+)$/m),
    tel: champ(/^\s*Telephone:\s*(.+)$/m),
    email: champ(/^\s*Email:\s*(\S+)/m).toLowerCase(),
    type: champ(new RegExp('Type de demande\\s*:\\s*(.+?)' + STOP)),
    territoire: champ(new RegExp('Territoire\\s*:\\s*([^\\n]+?)' + STOP))
  };
}

/* ---------- Mails au client ---------- */
function lien_(d) {
  var q = CFG.QUESTIONNAIRES[d.type];
  return CFG.SITE + '?questionnaire=' + q + '&nom=' + encodeURIComponent(d.nom || '') +
    '&email=' + encodeURIComponent(d.email || '') + '&tel=' + encodeURIComponent(d.tel || '');
}

function envoyerLien_(d, relance) {
  var produit = d.type.charAt(0).toLowerCase() + d.type.slice(1), url = lien_(d);
  var sujet, lignes;
  if (!relance) {
    sujet = 'Votre devis ' + produit + ' – questionnaire à compléter';
    lignes = ['Pour vous transmettre votre devis d\'' + produit + ', merci de compléter ce questionnaire en ligne (environ 5 minutes) :',
              '[BOUTON]', 'Dès réception, je lance l\'étude et je reviens vers vous rapidement.'];
  } else {
    sujet = 'Rappel – votre questionnaire ' + produit;
    lignes = ['Je n\'ai pas encore reçu votre questionnaire pour votre devis d\'' + produit + '.',
              'Il ne prend que 5 minutes :', '[BOUTON]', 'Dès réception, je lance l\'étude.'];
  }
  var signature = ['Bradley VILLAGE', 'Eloy Assurances Patrimoine', '06 96 33 29 09', 'www.eloy-assurances-patrimoine.fr'];
  var texte = 'Bonjour,\n\n' + lignes.map(function (l) { return l === '[BOUTON]' ? url : l; }).join('\n\n') +
    '\n\nBien à vous,\n\n' + signature.join('\n');
  var bouton = '<a href="' + url + '" style="display:inline-block;background:#1B66F7;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">Compléter mon questionnaire</a>';
  var html = '<div style="font-family:Verdana,Arial,sans-serif;font-size:13px;color:#0B1220;line-height:1.5">' +
    '<p>Bonjour,</p>' + lignes.map(function (l) { return '<p>' + (l === '[BOUTON]' ? bouton : esc_(l)) + '</p>'; }).join('') +
    '<p>Bien à vous,</p><p style="color:#5B6475">' + signature.map(esc_).join('<br>') + '</p></div>';
  GmailApp.sendEmail(d.email, sujet, texte, { htmlBody: html, name: CFG.EXPEDITEUR });
}

/* ---------- Assurevo (actif dès que la propriété ASSUREVO_URL est renseignée) ---------- */
function envoyerAssurevo_(d, corps) {
  var url = PropertiesService.getScriptProperties().getProperty('ASSUREVO_URL');
  if (!url) return;
  try {
    UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ fullName: d.nom, phone: d.tel, email: d.email, source: 'site', product: d.type,
        message: String(corps || '').split('----------')[0].replace(/^[\s\S]*?Submitted content\*?\s*/i, '').trim() })
    });
  } catch (e) { Logger.log('Assurevo : ' + e); }
}

/* ---------- Feuille de suivi ---------- */
function feuille_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FEUILLE_ID'), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(CFG.FEUILLE);
    p.setProperty('FEUILLE_ID', ss.getId());
    var sh0 = ss.getSheets()[0];
    sh0.setName('Demandes');
    sh0.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#EAF1FE');
    sh0.setFrozenRows(1);
    sh0.hideColumns(2);
    ss.setSpreadsheetTimeZone(CFG.FUSEAU);
  }
  return ss.getSheetByName('Demandes');
}

function lignes_(sh) {
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getValues().map(function (v, i) { return { n: i + 2, v: v }; });
}

function dejaEnvoye_(sh, email, type) {
  var limite = Date.now() - 30 * 24 * 3600 * 1000;
  return lignes_(sh).some(function (r) {
    var v = r.v;
    return String(v[5]).toLowerCase() === email && v[2] === type && v[0] instanceof Date && v[0].getTime() > limite &&
      /^(Lien envoyé|Relancé|Questionnaire reçu)$/.test(v[7]);
  });
}

function marquerQuestionnaireRecu_(sh, email, date) {
  if (!email) return;
  lignes_(sh).forEach(function (r) {
    var v = r.v;
    if (String(v[5]).toLowerCase() === email && /^(Lien envoyé|Relancé)$/.test(v[7])) {
      sh.getRange(r.n, 8).setValue('Questionnaire reçu');
      sh.getRange(r.n, 11).setValue(date);
    }
  });
}

function emailValide_(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }
function esc_(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------- Test : envoie le mail du questionnaire habitation à votre propre adresse ---------- */
function testerMail() {
  envoyerLien_({ type: 'Assurance habitation', nom: 'Test Eloy', tel: '0696000000', email: Session.getActiveUser().getEmail() }, false);
}
