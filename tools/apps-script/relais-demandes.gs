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
  var sujet, html, texte;
  var F = 'font-family:verdana,sans-serif;font-size:small;color:#222222';
  var bouton = '<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1B66F7;border-radius:8px;padding:11px 20px">' +
    '<a href="' + url + '" style="color:#ffffff;text-decoration:none;font-family:verdana,sans-serif;font-size:13px;font-weight:bold">Compléter mon questionnaire</a></td></tr></table>';
  if (!relance) {
    sujet = 'Votre devis ' + d.type + ' – questionnaire à compléter';
    html = 'Bonjour,<br><br>Afin de vous transmettre votre proposition d\'<b>' + esc_(produit) + '</b>, merci de compléter ce questionnaire en ligne (environ 5 minutes) :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nAfin de vous transmettre votre proposition d\'' + produit + ', merci de compléter ce questionnaire en ligne (environ 5 minutes) :\n\n' +
      url + '\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  } else {
    sujet = 'Rappel – votre devis ' + d.type;
    html = 'Bonjour,<br><br>Je n\'ai pas encore reçu votre questionnaire pour votre proposition d\'<b>' + esc_(produit) + '</b>.<br><br>Il ne prend que 5 minutes :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nJe n\'ai pas encore reçu votre questionnaire pour votre proposition d\'' + produit + '.\n\nIl ne prend que 5 minutes :\n\n' +
      url + '\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  }
  html = '<div dir="ltr"><div style="' + F + '">' + html + '</div><br><div style="' + F + '">Bien à vous,</div><br>' + SIGNATURE + '</div>';
  texte += '\nBien à vous,\n\nBradley Village\nCourtier en assurances et crédits\n06 96 33 29 09\ncontact@eloy-assurances-patrimoine.fr\neloy-assurances-patrimoine.fr\n' +
    'Immeuble Lina\'s, Mangot Vulcin, 97232 Le Lamentin\n\nEloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (www.orias.fr).';
  GmailApp.sendEmail(d.email, sujet, texte, { htmlBody: html });
}

/* Signature Gmail de Bradley (copie de celle de eloy.assurances@gmail.com, 07/11/2026).
   Si la signature Gmail change, la recopier ici (Gmail : Paramètres → Signature). */
var SIGNATURE = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;max-width:460px;border-collapse:collapse;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0B1220\">\n<tr><td style=\"padding:0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\"><tr>\n  <td valign=\"middle\" style=\"padding:0 14px 0 0;width:64px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"text-decoration:none\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/bloc-eloy-carre.png\" width=\"64\" height=\"64\" alt=\"Eloy\" style=\"display:block;width:64px;height:64px;border:0\"></a></td>\n  <td valign=\"middle\" style=\"padding:0\">\n   <div style=\"font-size:19px;line-height:24px;font-weight:800\">Bradley Village</div>\n   <div style=\"font-size:13px;line-height:18px;font-weight:600;color:#1B66F7\">Courtier en assurances et crédits</div>\n  </td>\n </tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-size:13px;line-height:18px\">\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-tel.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"tel:+596696332909\" style=\"color:#0B1220;font-weight:700;text-decoration:none\">06 96 33 29 09</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-mail.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"mailto:contact@eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">contact@eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-web.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 0 0;vertical-align:top;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-lieu.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0;margin-top:2px\"></td><td style=\"padding:0;color:#3A4356\">Immeuble Lina's, Mangot Vulcin, 97232 Le Lamentin</td></tr>\n </table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"background:#1B66F7;border-radius:999px;padding:8px 16px\"><a href=\"https://www.eloy-assurances-patrimoine.fr/contact\" style=\"color:#FFFFFF;font-size:12.5px;line-height:16px;font-weight:700;text-decoration:none\">Être rappelé sous 24 h</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;background:#EAF1FE;border-radius:10px\"><tr><td style=\"padding:8px 12px;font-size:12px;line-height:18px;font-weight:700;color:#0B1220\"><a href=\"https://www.eloy-assurances-patrimoine.fr/assurances/professionnels\" style=\"color:#0B1220;text-decoration:none\">Assurance</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/credits/rachat\" style=\"color:#0B1220;text-decoration:none\">Rachat&nbsp;de&nbsp;crédit</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/financement-pro\" style=\"color:#0B1220;text-decoration:none\">Financement&nbsp;pro</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:10px 0 0;font-size:10px;line-height:15px;color:#5B6478\">Eloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (<a href=\"https://www.orias.fr\" style=\"color:#5B6478\">www.orias.fr</a>). Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.</td></tr>\n</table>";

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
