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
 * Questionnaires : décrits dans tools/questionnaires.json du dépôt eloy-site ; lancer tools/apps-script/fiches.py pour les recopier ici.
 */

var CFG = {
  SITE: 'https://www.eloy-assurances-patrimoine.fr/',
  RELANCE_APRES_HEURES: 48,
  HEURES_RELANCE: [8, 19],
  FUSEAU: 'America/Martinique',
  BOITE: 'eloy.assurances@gmail.com',
  FEUILLE: 'Eloy – Demandes du site',
  RECHERCHE: 'from:no-reply-forms@webflow.com subject:"New form submission" newer_than:3d'
};

/* FICHES:début (généré par tools/apps-script/fiches.py depuis tools/questionnaires.json, ne pas modifier à la main) */
var FICHES = {
 "habitation": {
  "cle": "habitation",
  "demande": "Questionnaire assurance habitation",
  "court": "habitation",
  "produit": "Assurance habitation",
  "mail": "assurance habitation",
  "sujet": "Votre devis Assurance habitation",
  "declencheurs": [
   "Assurance habitation"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Nom de naissance (si différent)",
     "Date de naissance",
     "Lieu de naissance",
     "Nationalité",
     "Profession",
     "Adresse",
     "Code postal",
     "Ville"
    ]
   ],
   [
    "Votre situation et vos antécédents",
    [
     "Êtes-vous la personne à assurer ?",
     "Nom et prénom de la personne à assurer",
     "D'autres personnes sont-elles à déclarer au contrat ?",
     "Noms et prénoms des autres personnes",
     "Avez-vous des enfants scolarisés à assurer par ce contrat ?",
     "Nombre d'enfants scolarisés",
     "Un précédent assureur a-t-il résilié votre contrat ?",
     "Motif de la résiliation",
     "Avez-vous déclaré des sinistres au cours des 36 derniers mois ?",
     "Sinistre 1 : nature",
     "Année du sinistre 1",
     "Sinistre 2 : nature",
     "Année du sinistre 2"
    ]
   ],
   [
    "Le logement à assurer",
    [
     "Type de logement",
     "Niveau du logement",
     "Numéro de l'étage",
     "Usage",
     "Le logement est-il actuellement assuré ?",
     "Vous êtes",
     "Logement à l'adresse du souscripteur",
     "Adresse du logement",
     "Code postal du logement",
     "Ville du logement",
     "Nombre de pièces",
     "Superficie développée",
     "Varangue, terrasse, balcon",
     "Sous-sol, combles, garages",
     "Dépendances à la même adresse",
     "Année de construction",
     "Période de construction",
     "Nature de la construction",
     "Nature de la couverture (toit)",
     "Piscine ou spa",
     "Installations extérieures",
     "Installations développement durable"
    ]
   ],
   [
    "Déclarations complémentaires",
    [
     "Bâtiment classé ou inscrit comme monument historique",
     "Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Logement non occupé plus de 90 jours par an",
     "Location partielle ou temporaire du logement",
     "Chambre d'hôtes",
     "Table d'hôtes"
    ]
   ],
   [
    "Vos biens",
    [
     "Valeur estimée du mobilier",
     "Dont objets de valeur"
    ]
   ]
  ],
  "alertes": [
   "Un précédent assureur a-t-il résilié votre contrat ?",
   "Avez-vous déclaré des sinistres au cours des 36 derniers mois ?",
   "Piscine ou spa",
   "Bâtiment classé ou inscrit comme monument historique",
   "Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Logement non occupé plus de 90 jours par an",
   "Location partielle ou temporaire du logement",
   "Chambre d'hôtes",
   "Table d'hôtes"
  ],
  "av": {
   "Date de naissance": "birthDate",
   "Profession": "profession",
   "Adresse": "address",
   "Code postal": "postalCode",
   "Ville": "city",
   "Le logement est-il actuellement assuré ?": "currentlyInsured"
  },
  "siren": null
 },
 "rcpro": {
  "cle": "rcpro",
  "demande": "Questionnaire assurance RC Pro",
  "court": "RC Pro",
  "produit": "Responsabilité civile pro (pro)",
  "mail": "assurance Responsabilité civile professionnelle",
  "sujet": "Votre devis RC Pro",
  "declencheurs": [
   "Responsabilité civile pro",
   "Responsabilité civile pro (pro)"
  ],
  "rubriques": [
   [
    "L'entreprise",
    [
     "Raison sociale",
     "L'entreprise est-elle en cours de création ?",
     "Numéro SIREN ou SIRET",
     "Date de début d'activité prévue",
     "Forme juridique prévue",
     "Adresse prévue du siège",
     "Code postal prévu du siège",
     "Ville prévue du siège"
    ]
   ],
   [
    "Le dirigeant",
    [
     "Qualité dans l'entreprise",
     "Date de naissance",
     "Lieu de naissance",
     "Adresse personnelle",
     "Code postal",
     "Ville"
    ]
   ],
   [
    "Chiffres clés",
    [
     "Chiffre d'affaires annuel",
     "Ce chiffre d'affaires est",
     "Nombre de salariés"
    ]
   ],
   [
    "Votre activité",
    [
     "Votre métier",
     "Description précise des missions que vous exercez",
     "Autres activités exercées et part du chiffre d'affaires",
     "Votre profession est-elle réglementée ?",
     "Numéro d'inscription ou de carte professionnelle",
     "Exercez-vous via une société de portage salarial ou une coopérative ?",
     "Avez-vous un établissement ou une filiale hors de France ?",
     "Réalisez-vous du chiffre d'affaires aux États-Unis ou au Canada ?",
     "Part de ce chiffre d'affaires"
    ]
   ],
   [
    "Vos antécédents",
    [
     "Êtes-vous actuellement assuré en RC Pro ?",
     "Nom de votre assureur actuel",
     "Votre responsabilité a-t-elle été mise en cause au cours des 5 dernières années ?",
     "Nombre de mises en cause",
     "Détail des mises en cause",
     "Un assureur a-t-il résilié l'un de vos contrats ?",
     "Motif de la résiliation",
     "Procédure collective (36 derniers mois)",
     "Date de début de contrat souhaitée"
    ]
   ]
  ],
  "alertes": [
   "Avez-vous un établissement ou une filiale hors de France ?",
   "Réalisez-vous du chiffre d'affaires aux États-Unis ou au Canada ?",
   "Votre responsabilité a-t-elle été mise en cause au cours des 5 dernières années ?",
   "Un assureur a-t-il résilié l'un de vos contrats ?",
   "Procédure collective (36 derniers mois)"
  ],
  "av": {
   "Date de naissance": "birthDate",
   "Adresse personnelle": "address",
   "Code postal": "postalCode",
   "Ville": "city",
   "Votre métier": "profession",
   "Êtes-vous actuellement assuré en RC Pro ?": "currentlyInsured"
  },
  "siren": "Numéro SIREN ou SIRET"
 }
};
/* FICHES:fin */

function ficheParDemande(type) {
  type = String(type || '').trim();
  for (var k in FICHES) if (FICHES[k].declencheurs.indexOf(type) >= 0) return FICHES[k];
  return null;
}
function ficheParQuestionnaire(type) {
  type = String(type || '').trim();
  for (var k in FICHES) if (FICHES[k].demande === type) return FICHES[k];
  return null;
}

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
    var ligne = [m.getDate(), m.getId(), d.type, d.nom, d.tel ? "'" + d.tel : '', d.email, d.territoire, '', '', '', ''];
    var statut;
    if (/^Questionnaire /i.test(d.type) && doublonRecent_(sh, d.email, d.type, m.getDate())) {
      statut = 'Doublon';
    } else if (/^Questionnaire /i.test(d.type)) {
      statut = 'Questionnaire reçu';
      ligne[10] = m.getDate();
      marquerQuestionnaireRecu_(sh, d.email, m.getDate());
      try { envoyerRecap_(d, m.getBody() || m.getPlainBody()); m.markRead(); } catch (e) { Logger.log('Récapitulatif : ' + e); }
    } else if (ficheParDemande(d.type)) {
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
    if (statut !== 'Doublon') envoyerAssurevo_(d, /^Questionnaire /i.test(d.type) ? (m.getBody() || m.getPlainBody()) : m.getPlainBody());
  });
  if (msgs.length) sh.autoResizeColumns(1, COLS.length);
}

/* Le site envoie parfois deux fois la même demande à quelques secondes d'écart */
function doublonRecent_(sh, email, type, date) {
  return lignes_(sh).some(function (r) {
    var v = r.v;
    return String(v[5]).toLowerCase() === email && v[2] === type && v[0] instanceof Date && Math.abs(date - v[0]) < 10 * 60 * 1000;
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
    type: questionnaireDans_(txt) || champ(new RegExp('Type de demande\\s*:\\s*(.+?)' + STOP)),
    territoire: champ(/Territoire\s*:\s*(Martinique|Guadeloupe|Guyane)/i)
  };
}

function questionnaireDans_(txt) {
  for (var k in FICHES) if (new RegExp('Type de demande\\s*:\\s*' + FICHES[k].demande.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'i').test(txt)) return FICHES[k].demande;
  return '';
}

/* ---------- Mails au client ---------- */
function lien_(d) {
  return CFG.SITE + '?questionnaire=' + ficheParDemande(d.type).cle + '&nom=' + encodeURIComponent(d.nom || '') +
    '&email=' + encodeURIComponent(d.email || '') + '&tel=' + encodeURIComponent(d.tel || '');
}

function envoyerLien_(d, relance) {
  var fiche = ficheParDemande(d.type), produit = fiche.mail, url = lien_(d);
  var sujet, html, texte;
  var F = 'font-family:verdana,sans-serif;font-size:small;color:#222222';
  var bouton = '<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1B66F7;border-radius:8px;padding:11px 20px">' +
    '<a href="' + url + '" style="color:#ffffff;text-decoration:none;font-family:verdana,sans-serif;font-size:13px;font-weight:bold">Compléter mon questionnaire</a></td></tr></table>';
  if (!relance) {
    sujet = fiche.sujet + ' – questionnaire à compléter';
    html = 'Bonjour,<br><br>Afin de vous transmettre votre proposition d\'<b>' + esc_(produit) + '</b>, merci de compléter ce questionnaire en ligne :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nAfin de vous transmettre votre proposition d\'' + produit + ', merci de compléter ce questionnaire en ligne :\n\n' +
      url + '\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  } else {
    sujet = 'Rappel – ' + fiche.sujet.replace(/^Votre/, 'votre');
    html = 'Bonjour,<br><br>Je n\'ai pas encore reçu votre questionnaire pour votre proposition d\'<b>' + esc_(produit) + '</b>.<br><br>Vous pouvez le compléter ici :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nJe n\'ai pas encore reçu votre questionnaire pour votre proposition d\'' + produit + '.\n\nVous pouvez le compléter ici :\n\n' +
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

/* ---------- Récapitulatif lisible d'un questionnaire reçu (envoyé à la boîte du cabinet) ---------- */
function reponses(txt, labels) {
  txt = String(txt || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, '\'').replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\r/g, '');
  var i = txt.indexOf('Type de demande'); if (i >= 0) txt = txt.slice(i);
  var j = txt.search(/\n\s*Consentement:/); if (j >= 0) txt = txt.slice(0, j);
  var all = labels.concat(['Type de demande', 'Accord de recontact', 'Page']).sort(function (a, b) { return b.length - a.length; });
  var re = new RegExp('(?:^|\\s)(' + all.map(function (l) { return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ') : ', 'g');
  var out = {}, m, last = null, pos = 0;
  while ((m = re.exec(txt))) {
    if (last) out[last] = txt.slice(pos, m.index).trim();
    last = m[1]; pos = re.lastIndex;
  }
  if (last) out[last] = txt.slice(pos).trim();
  return out;
}

/* ---------- Registre des entreprises (recherche-entreprises.api.gouv.fr, gratuit, sans clé) ---------- */
var FORMES = { '1000': 'Entrepreneur individuel', '5498': 'EURL', '5499': 'SARL', '5710': 'SAS', '5720': 'SASU', '5485': 'SELARL',
  '5785': 'SELAS', '5385': 'SELAFA', '6540': 'SCI', '9220': 'Association déclarée', '5599': 'SA', '5306': 'SNC', '6585': 'Société civile' };
function registre_(siren) {
  var n = String(siren || '').replace(/\D/g, '').slice(0, 9);
  if (n.length !== 9) return null;
  try {
    var r = UrlFetchApp.fetch('https://recherche-entreprises.api.gouv.fr/search?q=' + n, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    var e = (JSON.parse(r.getContentText()).results || []).filter(function (x) { return x.siren === n; })[0];
    if (!e) return { trouve: false, siren: n };
    var sg = e.siege || {};
    return { trouve: true, siren: n, nom: e.nom_complet, creation: (e.date_creation || '').split('-').reverse().join('/'),
      forme: FORMES[e.nature_juridique] || ('code ' + e.nature_juridique), naf: e.activite_principale, adresse: sg.adresse,
      actif: e.etat_administratif === 'A',
      dirigeants: (e.dirigeants || []).map(function (x) { return x.type_dirigeant === 'personne physique' ? (x.prenoms + ' ' + x.nom + (x.qualite ? ' (' + x.qualite + ')' : '')) : (x.denomination || ''); }).filter(String).join(', ') };
  } catch (err) { Logger.log('Registre : ' + err); return null; }
}
function lignesRegistre_(g) {
  if (!g) return [];
  if (!g.trouve) return [['Registre', 'SIREN ' + g.siren + ' introuvable : à vérifier']];
  return [['Nom au registre', g.nom], ['État', g.actif ? 'Active' : 'Fermée'], ['Date de création', g.creation], ['Forme juridique', g.forme],
    ['Code NAF', g.naf], ['Adresse du siège', g.adresse], ['Dirigeant(s)', g.dirigeants]].filter(function (x) { return x[1]; });
}

function recapHtml(d, corps) {
  var fiche = ficheParQuestionnaire(d.type) || FICHES.habitation, R = fiche.rubriques, labels = [];
  R.forEach(function (r) { labels = labels.concat(r[1]); });
  var rep = reponses(corps, labels), alertes = [];
  var reg = fiche.siren && rep[fiche.siren] ? registre_(rep[fiche.siren]) : null;
  if (reg && (!reg.trouve || !reg.actif)) alertes.push(!reg.trouve ? 'SIREN introuvable au registre' : 'Entreprise fermée au registre');
  var tel = String(d.tel || '').replace(/\s/g, '');
  var T = 'font-family:verdana,sans-serif;color:#0B1220';
  var h = '<div style="' + T + ';max-width:640px">' +
    '<div style="background:#1B66F7;color:#ffffff;border-radius:10px 10px 0 0;padding:16px 20px">' +
    '<div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.85">' + esc_(d.type) + '</div>' +
    '<div style="font-size:20px;font-weight:bold;margin-top:4px">' + esc_(d.nom) + '</div>' +
    '<div style="font-size:13px;margin-top:6px">' + esc_(d.tel) + ' · ' + esc_(d.email) + '</div></div>' +
    '<div style="border:1px solid #DDE4F0;border-top:0;border-radius:0 0 10px 10px;padding:6px 20px 18px">';
  R.forEach(function (r, i) {
    if (i === 1 && reg) {
      h += '<div style="font-size:14px;font-weight:bold;color:#1B66F7;margin:18px 0 6px">Registre des entreprises</div>' +
        '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px">';
      lignesRegistre_(reg).forEach(function (x) {
        h += '<tr><td style="padding:6px 10px 6px 0;border-bottom:1px solid #EEF2F8;color:#5B6475;width:58%;vertical-align:top">' + esc_(x[0]) + '</td>' +
          '<td style="padding:6px 0;border-bottom:1px solid #EEF2F8;font-weight:bold;vertical-align:top">' + esc_(x[1]) + '</td></tr>';
      });
      h += '</table>';
    }
    var lignes = r[1].filter(function (l) { return rep[l]; });
    if (!lignes.length) return;
    h += '<div style="font-size:14px;font-weight:bold;color:#1B66F7;margin:18px 0 6px">' + esc_(r[0]) + '</div>' +
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px">';
    lignes.forEach(function (l) {
      var v = / €$/.test(rep[l]) ? rep[l].replace(/\d+/g, function (n) { return n.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }) : rep[l], alerte = fiche.alertes.indexOf(l) >= 0 && /^Oui/i.test(v);
      if (alerte) alertes.push(l.replace(/ \?$/, ''));
      h += '<tr><td style="padding:6px 10px 6px 0;border-bottom:1px solid #EEF2F8;color:#5B6475;width:58%;vertical-align:top">' + esc_(l) + '</td>' +
        '<td style="padding:6px 0;border-bottom:1px solid #EEF2F8;font-weight:bold;vertical-align:top;color:' + (alerte ? '#C2410C' : '#0B1220') + '">' + esc_(v) + '</td></tr>';
    });
    h += '</table>';
  });
  if (alertes.length) h = h.replace('<div style="border:1px solid #DDE4F0;border-top:0;border-radius:0 0 10px 10px;padding:6px 20px 18px">',
    '<div style="border:1px solid #DDE4F0;border-top:0;border-radius:0 0 10px 10px;padding:6px 20px 18px"><div style="margin-top:14px;background:#FFF1E6;color:#9A3412;border-radius:8px;padding:10px 12px;font-size:13px"><b>À vérifier :</b> ' +
      alertes.map(esc_).join(' · ') + '</div>');
  h += '<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px"><tr>' +
    '<td style="background:#1B66F7;border-radius:8px;padding:10px 18px"><a href="mailto:' + esc_(d.email) + '?subject=' + encodeURIComponent(fiche.sujet) +
    '" style="color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold">Répondre au client</a></td><td style="width:10px"></td>' +
    (tel ? '<td style="border:1px solid #1B66F7;border-radius:8px;padding:9px 18px"><a href="tel:' + esc_(tel) + '" style="color:#1B66F7;text-decoration:none;font-size:13px;font-weight:bold">Appeler</a></td>' : '') +
    '</tr></table>';
  if (rep['Accord de recontact']) h += '<div style="font-size:11px;color:#5B6475;margin-top:14px">Accord de recontact : ' + esc_(rep['Accord de recontact']) + '</div>';
  return h + '</div></div>';
}

function envoyerRecap_(d, corps) {
  var fiche = ficheParQuestionnaire(d.type) || FICHES.habitation;
  GmailApp.sendEmail(CFG.BOITE, 'Questionnaire ' + fiche.court + ' reçu – ' + d.nom,
    'Questionnaire reçu de ' + d.nom + ' (' + d.tel + ', ' + d.email + ').', { htmlBody: recapHtml(d, corps), replyTo: d.email });
}

/* ---------- Assurevo (actif dès que la propriété du script ASSUREVO_URL est renseignée) ----------
   Doc : https://docs.assurevo.fr (Réception de leads). Le jeton de l'URL est un secret : il reste dans les
   propriétés du script, jamais dans ce fichier. Succès = 201. Rapprochement des contacts par e-mail. */
var BESOIN = { 'mutuelle': 'mutuelle', 'santé': 'sante', 'prévoyance': 'prevoyance', 'retraite': 'retraite', 'per': 'retraite',
  'assurance vie': 'assurance_vie', 'protection juridique': 'protection_juridique' };

function assurevoPayload(d, corps) {
  var fiche = ficheParQuestionnaire(d.type);
  var produit = fiche ? fiche.produit : d.type;
  var p = { email: d.email || undefined, phone: d.tel || undefined, fullName: d.nom || undefined, source: 'site', product: produit,
    meta: { origine: 'Site Eloy', territoire: d.territoire || undefined } };
  var low = produit.toLowerCase();
  Object.keys(BESOIN).some(function (k) { if (low.indexOf(k) >= 0) { p.mainNeed = BESOIN[k]; return true; } return false; });
  if (fiche) {
    var labels = [];
    fiche.rubriques.forEach(function (r) { labels = labels.concat(r[1]); });
    var rep = reponses(corps, labels);
    Object.keys(fiche.av).forEach(function (l) {
      if (!rep[l]) return;
      var cleAv = fiche.av[l];
      p[cleAv] = cleAv === 'currentlyInsured' ? /^oui/i.test(rep[l]) : rep[l];
    });
    var alertes = labels.filter(function (l) { return fiche.alertes.indexOf(l) >= 0 && /^Oui/i.test(rep[l] || ''); });
    p.message = 'Questionnaire ' + fiche.court + ' rempli en ligne.' + (alertes.length ? ' À vérifier : ' + alertes.join(' · ') : '');
    /* Chaque réponse en champ séparé : Assurevo l'affiche question par question dans « Lead reçu » */
    labels.forEach(function (l) { if (rep[l] && !p.hasOwnProperty(l)) p[l] = rep[l]; });
    if (fiche.siren && rep[fiche.siren]) lignesRegistre_(registre_(rep[fiche.siren])).forEach(function (x) { p['Registre – ' + x[0]] = x[1]; });
  } else {
    var txt = String(corps || '').replace(/\r/g, ''), m = txt.match(/Message:\s*([\s\S]*?)\n\s*Consentement:/);
    p.message = (m ? m[1] : '').replace(/^Type de demande\s*:[^\n]*?(?=\s+Message\s*:|\n|$)/, '').replace(/\s+/g, ' ').trim().replace(/^Message\s*:\s*/, '').slice(0, 2000);
  }
  Object.keys(p).forEach(function (k) { if (p[k] === undefined || p[k] === '') delete p[k]; });
  return p;
}

/* Seules les demandes d'ASSURANCE et de PATRIMOINE vont dans Assurevo (décision de Bradley, 07/11/2026).
   Rachat de crédits, crédit immobilier, financement pro (crédit-bail, Girardin), partenariats et autres : jamais. */
function pourAssurevo(type) {
  type = String(type || '').trim();
  if (/cr[ée]dit|girardin|financement|d[ée]fiscalisation|partenari|autre question|^contact$/i.test(type)) return false;
  return /^(Questionnaire assurance|Assurance|Mutuelle|Prévoyance|RC |Responsabilité civile|Garantie homme|Protection juridique|Cyber|Flotte|Plan d'épargne|Épargne)/i.test(type);
}

function envoyerAssurevo_(d, corps) {
  var url = PropertiesService.getScriptProperties().getProperty('ASSUREVO_URL');
  if (!url || (!d.email && !d.tel) || !pourAssurevo(d.type)) return;
  try {
    var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify(assurevoPayload(d, corps)) });
    if (r.getResponseCode() !== 201 && r.getResponseCode() !== 200) Logger.log('Assurevo ' + r.getResponseCode() + ' : ' + r.getContentText().slice(0, 300));
  } catch (e) { Logger.log('Assurevo : ' + e); }
}

/* Test : envoie le dernier questionnaire reçu à Assurevo (après avoir renseigné ASSUREVO_URL) */
function testerAssurevo() {
  var url = PropertiesService.getScriptProperties().getProperty('ASSUREVO_URL');
  if (!url) { Logger.log('Renseigner d\'abord ASSUREVO_URL dans les propriétés du script.'); return; }
  var m = null;
  GmailApp.search('from:no-reply-forms@webflow.com newer_than:7d', 0, 20).forEach(function (th) {
    th.getMessages().forEach(function (x) {
      if (/Type de demande\s*:\s*Questionnaire assurance/i.test(x.getPlainBody()) && (!m || x.getDate() > m.getDate())) m = x;
    });
  });
  if (!m) { Logger.log('Aucun questionnaire reçu ces 7 derniers jours.'); return; }
  var d = analyser(m.getPlainBody());
  Logger.log('Envoi du questionnaire de ' + d.nom + ' (' + d.email + ')');
  var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify(assurevoPayload(d, m.getBody() || m.getPlainBody())) });
  Logger.log('Assurevo ' + r.getResponseCode() + ' : ' + r.getContentText());
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
