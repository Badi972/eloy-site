/* ---------- Contacts Google automatiques (Bradley, 18/11/2026) ----------
   Chaque client qui fait une demande est enregistré dans Google Contacts du compte eloy.assurances@gmail.com
   (nom, prénom, téléphone, e-mail), donc visible sur le téléphone et dans WhatsApp.
   Sources :
   - les demandes et questionnaires du site (onglet « Demandes » de la feuille de suivi) ;
   - les demandes reçues par mail : fils rangés dans les libellés « 01. DEMANDE REÇUE », « 02. DEVIS ENVOYÉ »,
     « 03. AFN - SOUSCRIPTION » (assurance), « 2. RACHAT DE CRÉDIT/01. DEMANDE REÇUE » et
     « 2. FINANCEMENT PRO/01. DEMANDE REÇUE » (le téléphone est repris dans le mail du client s'il y figure).
   Pas de doublon : si l'e-mail ou le numéro existe déjà dans Google Contacts, la fiche existante est complétée
   (numéro ou e-mail manquant), jamais recréée.
   Deux groupes de contacts : « Eloy – Assurance » et « Eloy – Crédit ».
   Suivi : onglet « Contacts Google » de la feuille de suivi.
   Prérequis : service avancé « People API » activé dans le projet Apps Script (Services > People API).
   Appelé à chaque passage de traiter() ; import de l'existant : lancer importerContactsExistants(). */

var CT = {
  ONGLET: 'Contacts Google',
  ENT: ['Ajouté le', 'Origine', 'Nom', 'Téléphone', 'E-mail', 'Activité', 'Résultat'],
  GROUPES: { assurance: 'Eloy – Assurance', credit: 'Eloy – Crédit' },
  LIBELLES: [
    ['1. ASSURANCES/01. DEMANDE REÇUE', 'assurance'],
    ['1. ASSURANCES/02. DEVIS ENVOYÉ', 'assurance'],
    ['1. ASSURANCES/03. AFN - SOUSCRIPTION', 'assurance'],
    ['2. RACHAT DE CRÉDIT/01. DEMANDE REÇUE', 'credit'],
    ['2. FINANCEMENT PRO/01. DEMANDE REÇUE', 'credit']
  ],
  /* Adresses qui ne sont jamais des clients (partenaires, compagnies, outils) */
  EXCLUS: /afrfinancement|simply|premista|creditdom|sofidom|synaaps|webflow|ionos|qonto|brevo|google\.com|metricool|canva/i,
  TELS_CABINET: ['596696332909'],
  MAX_PAR_PASSAGE: 40
};

/* Passage automatique (dans traiter) */
function contactsAuto_(avecMails) {   /* avecMails : lit aussi les fils Gmail (2 fois par jour seulement, quota) */
  var sh = onglet_(CT.ONGLET, CT.ENT), faits = contactsFaits_(sh);
  var aFaire = contactsDesDemandes_(faits, 300).concat(avecMails ? contactsDesLibelles_(faits, 30) : []);
  if (!aFaire.length) return 0;
  var idx = indexContacts_();
  aFaire.slice(0, CT.MAX_PAR_PASSAGE).forEach(function (c) { enregistrerContact_(c, idx, sh); Utilities.sleep(300); });
  return aFaire.length;
}

/* À lancer une fois à la main : enregistre toutes les demandes et tous les fils déjà présents.
   Reprend tout seul toutes les 2 minutes jusqu'à la fin (limite de temps de Google). */
function importerContactsExistants() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { suiteImport_(); return; }
  var debut = Date.now(), n = 0, reste = 0;
  try {
    ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'importerContactsExistants') ScriptApp.deleteTrigger(t); });
    var sh = onglet_(CT.ONGLET, CT.ENT), faits = contactsFaits_(sh);
    var aFaire = contactsDesDemandes_(faits, 100000).concat(contactsDesLibelles_(faits, 500));
    var idx = indexContacts_();
    for (var i = 0; i < aFaire.length; i++) {
      if (Date.now() - debut > 4.5 * 60 * 1000) { reste = aFaire.length - i; break; }
      enregistrerContact_(aFaire[i], idx, sh); n++;
      Utilities.sleep(900);
    }
  } finally { lock.releaseLock(); }
  if (reste) suiteImport_();
  Logger.log(n + ' contacts traités' + (reste ? ', ' + reste + ' restants : suite dans 2 minutes' : ', import terminé'));
}
function suiteImport_() { ScriptApp.newTrigger('importerContactsExistants').timeBased().after(2 * 60 * 1000).create(); }

/* Test : affiche ce qui serait enregistré, sans rien écrire */
function testerContacts() {
  var faits = contactsFaits_(onglet_(CT.ONGLET, CT.ENT));
  var l = contactsDesDemandes_(faits, 20).concat(contactsDesLibelles_(faits, 5));
  Logger.log(l.length + ' à enregistrer');
  l.slice(0, 30).forEach(function (c) { Logger.log(JSON.stringify(c)); });
  Logger.log('Contacts Google existants : ' + Object.keys(indexContacts_().email).length + ' adresses');
}

/* ---------- Sources ---------- */
function contactsFaits_(sh) {
  var f = {}, n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 2, n - 1, 1).getValues().forEach(function (r) { if (r[0]) f[r[0]] = 1; });
  return f;
}
function activite_(texte) {
  return /cr[ée]dit|financement|girardin|leasing|pr[êe]t|rachat/i.test(texte || '') && !/emprunteur/i.test(texte || '') ? 'credit' : 'assurance';
}
function contactsDesDemandes_(faits, max) {
  var sh = feuille_(), n = sh.getLastRow(), l = [];
  if (n < 2) return l;
  var de = Math.max(2, n - max + 1);
  sh.getRange(de, 1, n - de + 1, COLS.length).getValues().forEach(function (v) {
    var id = String(v[1] || ''), cle = 'demande:' + id;
    if (!id || faits[cle] || faits['fil:' + id.replace(/^mail:/, '')]) return;
    var email = String(v[5] || '').trim().toLowerCase(), tel = String(v[4] || '').replace(/^'/, '');
    l.push({ origine: cle, nom: String(v[3] || ''), tel: tel, email: emailValide_(email) ? email : '', activite: activite_(v[2]),
             note: 'Demande ' + (/^mail:/.test(id) ? 'par mail' : 'du site') + ' : ' + v[2] + (v[0] instanceof Date ? ' (' + Utilities.formatDate(v[0], CFG.FUSEAU, 'dd/MM/yyyy') + ')' : '') });
  });
  return l;
}
function contactsDesLibelles_(faits, max) {
  var l = [], cache = CacheService.getScriptCache();
  CT.LIBELLES.forEach(function (x) {
    var lab = GmailApp.getUserLabelByName(x[0]);
    if (!lab) return;
    for (var debut = 0; debut < max; debut += 100) {
      var fils = lab.getThreads(debut, Math.min(100, max - debut));
      fils.forEach(function (th) {
        var cle = 'fil:' + th.getId();
        if (faits[cle] || faits['demande:mail:' + th.getId()] || cache.get('ct:' + th.getId())) return;
        faits[cle] = 1;
        var c = clientCoordonnees_(th);
        if (!c) { cache.put('ct:' + th.getId(), '1', 21600); return; }
        c.origine = cle; c.activite = x[1];
        c.note = 'Demande par mail : ' + th.getFirstMessageSubject() + ' (' + Utilities.formatDate(th.getLastMessageDate(), CFG.FUSEAU, 'dd/MM/yyyy') + ')';
        l.push(c);
      });
      if (fils.length < 100) break;
    }
  });
  return l;
}
function estClient_(adr) {
  return emailValide_(adr) && !estCabinet_(adr) && !AVIS.EXCLUS.test(adr) && !CT.EXCLUS.test(adr);
}
/* Nom, e-mail et téléphone du client d'un fil (expéditeur extérieur, sinon destinataire d'un mail du cabinet) */
function clientCoordonnees_(th) {
  var msgs = th.getMessages(), email = '', nom = '', tel = '';
  function lire(champ) {
    return String(champ || '').split(',').map(function (a) {
      var m = a.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/);
      return { nom: m ? m[1].trim() : '', email: (m ? m[2] : a).trim().toLowerCase() };
    });
  }
  msgs.forEach(function (m) {
    if (email) return;
    if (!estCabinet_(m.getFrom())) lire(m.getFrom()).forEach(function (a) { if (!email && estClient_(a.email)) { email = a.email; nom = a.nom; } });
  });
  msgs.forEach(function (m) {
    if (email) return;
    if (estCabinet_(m.getFrom())) lire(m.getTo()).forEach(function (a) { if (!email && estClient_(a.email)) { email = a.email; nom = a.nom; } });
  });
  if (!email) return null;
  msgs.forEach(function (m) { if (!tel && !estCabinet_(m.getFrom()) && m.getFrom().toLowerCase().indexOf(email) >= 0) tel = telDansTexte_(m.getPlainBody()); });
  if (/@/.test(nom) || nom.toLowerCase() === email) nom = '';
  return { nom: nom, email: email, tel: tel };
}
/* Premier numéro écrit par le client (hors message cité et hors numéro du cabinet) */
function telDansTexte_(txt) {
  var propre = String(txt || '').split(/\n\s*(?:>|Le .{5,80}a écrit|On .{5,80}wrote|De ?: |From: |-----)/)[0];
  var re = /(?:(?:\+|00)\s?(?:33|59[046])[\s.\-]?(?:\(0\))?[\s.\-]?\d(?:[\s.\-]?\d){8})|(?:\b0\d(?:[\s.\-]?\d{2}){4}\b)/g, m;
  while ((m = re.exec(propre))) {
    var t = telIntl_(m[0]);
    if (t && CT.TELS_CABINET.indexOf(t.replace(/\D/g, '')) < 0) return t;
  }
  return '';
}

/* ---------- Numéros au format international (indispensable pour WhatsApp) ---------- */
function telIntl_(t) {
  var s = String(t || '').replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  if (!s) return '';
  if (s.indexOf('00') === 0) s = '+' + s.slice(2);
  if (s.charAt(0) !== '+') {
    if (s.length === 9) s = '0' + s;
    if (s.length !== 10 || s.charAt(0) !== '0') return '';
    var p4 = s.slice(0, 4), ind = '33';
    if (/^(0690|0691|0590)/.test(p4)) ind = '590';
    else if (/^(0694|0594)/.test(p4)) ind = '594';
    else if (/^(0696|0697|0596)/.test(p4)) ind = '596';
    s = '+' + ind + s.slice(1);
  }
  var d = s.slice(1), m = d.match(/^(59[046])(\d{9})$/);
  if (m) return '+' + m[1] + ' ' + m[2].slice(0, 3) + ' ' + m[2].slice(3, 5) + ' ' + m[2].slice(5, 7) + ' ' + m[2].slice(7);
  m = d.match(/^33(\d{9})$/);
  if (m) return '+33 ' + m[1].charAt(0) + ' ' + m[1].slice(1).replace(/(\d{2})(?=\d)/g, '$1 ');
  return d.length >= 8 && d.length <= 15 ? s : '';
}
function cleTel_(t) { var x = telIntl_(t); return x ? x.replace(/\D/g, '') : ''; }

/* ---------- Google Contacts (People API) ---------- */
function indexContacts_() {
  var idx = { email: {}, tel: {}, groupes: groupesContacts_() }, token;
  do {
    var r = People.People.Connections.list('people/me', { pageSize: 1000, pageToken: token, personFields: 'names,emailAddresses,phoneNumbers,memberships' });
    (r.connections || []).forEach(function (p) {
      (p.emailAddresses || []).forEach(function (e) { idx.email[String(e.value).toLowerCase()] = p; });
      (p.phoneNumbers || []).forEach(function (t) { var k = cleTel_(t.value); if (k) idx.tel[k] = p; });
    });
    token = r.nextPageToken;
  } while (token);
  return idx;
}
function groupesContacts_() {
  var g = {}, r = People.ContactGroups.list({ pageSize: 200 });
  (r.contactGroups || []).forEach(function (x) { g[x.name] = x.resourceName; });
  Object.keys(CT.GROUPES).forEach(function (k) {
    var nom = CT.GROUPES[k];
    if (!g[nom]) g[nom] = People.ContactGroups.create({ contactGroup: { name: nom } }).resourceName;
    g[k] = g[nom];
  });
  return g;
}
/* Nom tout en majuscules (« ARETO SANDRINE ») : NOM puis prénom, comme sur les formulaires ; sinon règle habituelle */
function nomContact_(full) {
  var w = String(full || '').replace(/[<>"]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (w.length > 1 && w.every(function (x) { return x === x.toUpperCase(); })) return { nom: w[0], prenom: w.slice(1).join(' ') };
  return decouperNom_(full);
}
function enregistrerContact_(c, idx, sh) {
  var tel = telIntl_(c.tel), kt = cleTel_(c.tel), email = c.email || '', res = '';
  var nm = nomContact_(c.nom), prenom = prenomPropre_(nm.prenom), nom = String(nm.nom || '').toUpperCase();
  var groupe = idx.groupes[c.activite] || idx.groupes.assurance;
  try {
    if (!email && !tel) res = 'Sans coordonnées';
    else {
      var p = (email && idx.email[email]) || (kt && idx.tel[kt]);
      if (p) {
        var champs = [], maj = { etag: p.etag };
        if (email && !(p.emailAddresses || []).some(function (e) { return String(e.value).toLowerCase() === email; })) {
          maj.emailAddresses = (p.emailAddresses || []).concat([{ value: email }]); champs.push('emailAddresses');
        }
        if (kt && !(p.phoneNumbers || []).some(function (t) { return cleTel_(t.value) === kt; })) {
          maj.phoneNumbers = (p.phoneNumbers || []).concat([{ value: tel, type: 'mobile' }]); champs.push('phoneNumbers');
        }
        if (champs.length) p = People.People.updateContact(maj, p.resourceName, { updatePersonFields: champs.join(','), personFields: 'names,emailAddresses,phoneNumbers,memberships' });
        if (!(p.memberships || []).some(function (m) { return m.contactGroupMembership && m.contactGroupMembership.contactGroupResourceName === groupe; })) {
          People.ContactGroups.Members.modify({ resourceNamesToAdd: [p.resourceName] }, groupe);
        }
        res = champs.length ? 'Fiche existante complétée' : 'Déjà dans Google Contacts';
      } else {
        var fiche = { memberships: [{ contactGroupMembership: { contactGroupResourceName: groupe } }] };
        if (prenom || nom) fiche.names = [{ givenName: prenom, familyName: nom }];
        if (email) fiche.emailAddresses = [{ value: email }];
        if (tel) fiche.phoneNumbers = [{ value: tel, type: 'mobile' }];
        if (c.note) fiche.biographies = [{ value: c.note, contentType: 'TEXT_PLAIN' }];
        p = People.People.createContact(fiche, { personFields: 'names,emailAddresses,phoneNumbers,memberships' });
        res = 'Créé';
      }
      if (email) idx.email[email] = p;
      if (kt) idx.tel[kt] = p;
    }
  } catch (e) { res = 'Erreur : ' + e.message; Logger.log('Contact ' + email + ' : ' + e); }
  sh.appendRow([new Date(), c.origine, [prenom, nom].join(' ').trim(), tel ? "'" + tel : '', email, c.activite === 'credit' ? 'Crédit' : 'Assurance', res]);
}
