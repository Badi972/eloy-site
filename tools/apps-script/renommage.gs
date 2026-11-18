/* ---------- Renommage des pièces des dossiers clients (Bradley, 18/11/2026) ----------
   « NOM PRÉNOM + type de pièce » : « VILLAGE BRADLEY CNI », « VILLAGE BRADLEY PERMIS »…
   Ne touche qu'aux fichiers rangés par le script (créés depuis le 18/11/2026) dans le dossier du portefeuille.
   Journal (ancien nom → nouveau nom, pour revenir en arrière) : onglet « Renommage pièces ».
   N'utilise pas Gmail. */
var RN = {
  DEPUIS: '2026-11-18T00:00:00', JOURNAL: 'Renommage pièces',
  TYPES: [
    [/titre.?de.?s[eé]jour/i, 'TITRE DE SEJOUR'],
    [/(\bcni\b|carte.?(nationale.?)?d.?identit|pi[eè]ce.?d.?identit|identit[eé]|passeport|passport|\bid\b)/i, 'CNI'],
    [/permis/i, 'PERMIS'],
    [/carte.?verte/i, 'CARTE VERTE'],
    [/avis.?de.?situation/i, 'AVIS DE SITUATION'],
    [/(\brib\b|iban|relev[eé].?d.?identit[eé].?bancaire)/i, 'RIB'],
    [/(k.?bis|extrait.?k)/i, 'KBIS'],
    [/(\bcpi\b|certificat.?provisoire)/i, 'CPI'],
    [/(carte.?grise|certificat.?d.?immat|\bcg\b)/i, 'CG'],
    [/(contr[oô]le.?technique|\bct\b|proc[eè]s.?verbal)/i, 'CT'],
    [/relev[eé].?d.?info/i, 'RELEVE INFORMATION'],
    [/(justificatif.?de.?domicile|facture.?(edf|eau|sme|orange|sfr)|quittance)/i, 'JUSTIFICATIF DOMICILE'],
    [/livret.?de.?famille/i, 'LIVRET DE FAMILLE'],
    [/acte.?de.?(mariage|naissance)/i, 'ACTE ETAT CIVIL'],
    [/pacs/i, 'PACS'],
    [/avis.?d.?imp/i, 'AVIS IMPOSITION'],
    [/\bbail\b/i, 'BAIL'],
    [/devoir.?de.?conseil/i, 'DEVOIR DE CONSEIL'],
    [/questionnaire/i, 'QUESTIONNAIRE'],
    [/avenant/i, 'AVENANT'],
    [/r[eé]siliation/i, 'RESILIATION'],
    [/attestation/i, 'ATTESTATION'],
    [/(conditions.?particuli|\bcp\b)/i, 'CONDITIONS PARTICULIERES'],
    [/(facture.?d.?achat|bon.?de.?commande)/i, 'FACTURE ACHAT'],
    [/cession/i, 'CESSION'],
    [/devis/i, 'DEVIS'],
    [/contrat/i, 'CONTRAT']
  ]
};
/* Type d'après le contenu (OCR par Google Drive) quand le nom du fichier ne dit rien */
var RN_CONTENU = [
  [/titre de s[eé]jour/i, 'TITRE DE SEJOUR'],
  [/(carte nationale d.identit|identity card|passeport|passport)/i, 'CNI'],
  [/permis de conduire|driving licen/i, 'PERMIS'],
  [/certificat d.immatriculation/i, 'CG'],
  [/(\biban\b|relev[eé] d.identit[eé] bancaire|\bbic\b)/i, 'RIB'],
  [/extrait k ?bis|registre du commerce/i, 'KBIS'],
  [/contr[oô]le technique/i, 'CT'],
  [/relev[eé] d.information/i, 'RELEVE INFORMATION'],
  [/carte (internationale d.assurance|verte)/i, 'CARTE VERTE'],
  [/attestation d.assurance/i, 'ATTESTATION'],
  [/conditions particuli[eè]res/i, 'CONDITIONS PARTICULIERES'],
  [/avenant/i, 'AVENANT'],
  [/devoir de conseil/i, 'DEVOIR DE CONSEIL'],
  [/avis d.imp[oô]t/i, 'AVIS IMPOSITION'],
  [/livret de famille/i, 'LIVRET DE FAMILLE'],
  [/bulletin de (salaire|paie)/i, 'BULLETIN DE SALAIRE'],
  [/(facture|[eé]ch[eé]ancier).{0,40}(edf|eau|électricité|electricite|orange|sfr|digicel)/i, 'JUSTIFICATIF DOMICILE']
];
function typeContenu_(f) {
  var mt = f.getMimeType();
  if (!/^(application\/pdf|image\/(jpeg|png|jpg))$/.test(mt) || f.getSize() > 8 * 1024 * 1024) return '';
  try {
    var t = textePdfType_(f.getBlob(), mt).slice(0, 4000);
    for (var i = 0; i < RN_CONTENU.length; i++) if (RN_CONTENU[i][0].test(t)) return RN_CONTENU[i][1];
  } catch (e) {}
  return '';
}
/* Comme textePdf_, pour un PDF ou une image */
function textePdfType_(blob, mime) {
  var token = ScriptApp.getOAuthToken(), sep = 'eloy' + Date.now();
  var meta = JSON.stringify({ name: 'tmp-lecture-piece', mimeType: 'application/vnd.google-apps.document' });
  var corps = Utilities.newBlob('--' + sep + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + sep + '\r\nContent-Type: ' + mime + '\r\n\r\n').getBytes()
    .concat(blob.getBytes()).concat(Utilities.newBlob('\r\n--' + sep + '--').getBytes());
  var r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'post', contentType: 'multipart/related; boundary=' + sep, payload: corps,
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
  if (r.getResponseCode() >= 300) throw new Error('Conversion : ' + r.getContentText().slice(0, 200));
  var id = JSON.parse(r.getContentText()).id;
  try {
    return UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '/export?mimeType=text/plain',
      { headers: { Authorization: 'Bearer ' + token } }).getContentText();
  } finally { DriveApp.getFileById(id).setTrashed(true); }
}
function typePiece_(nom) {
  var base = nom.replace(/\.[a-z0-9]{2,4}$/i, '').replace(/[_\-.]+/g, ' ');
  for (var i = 0; i < RN.TYPES.length; i++) if (RN.TYPES[i][0].test(base)) return RN.TYPES[i][1];
  return '';
}
/* Nom du client : « NOM PRÉNOM » du tableau de prod quand un seul client correspond au dossier,
   sinon nom du dossier (avant « / ») sans la profession ajoutée à la fin */
var RN_PROFESSIONS = /\b(FONCTIONNAIRE|SALARIEE?|ETUDIANTE?|RETRAITEE?|CHEF|ENTREPRISE|ENTREPRENEUR|INDIVIDUEL|MEDECIN|INFIRMIERE?|LIBERALE?|ENSEIGNANTE?|AIDE|SOIGNANTE|MILITAIRE|INVALIDE|ARTISAN|AGENT|HOSPITALIER|DENTISTE|ARCHITECTE?|GENERALISTE|PERSO|ASSISTANTE?|DIRECTION|ADMINISTRATIF|SANS|EMPLOI|SYMPA|DIFFICILE|DIFFICULTE|COMPREHENSION|INGENIEUR|PROFESSEUR|THERAPEUTHE|ESTHETICIENNE|ANCIEN|SOCIALE|ASSISTANCE)\b.*$/;
function titresDossiers_() {
  var existants = dossiersExistants_(), map = {};
  clientsPortefeuille_().forEach(function (c) {
    var e = trouverDossier_(c, existants); if (!e) return;
    var id = e.f.getId(); map[id] = map[id] || []; if (map[id].indexOf(c.titre) < 0) map[id].push(c.titre);
  });
  return map;
}
function nomClientDossier_(f, map) {
  var t = map && map[f.getId()];
  if (t && t.length === 1) return t[0];
  var n = sansAccentMaj_(f.getName().split('/')[0]).replace(RN_PROFESSIONS, '').trim();
  return n || sansAccentMaj_(f.getName());
}

/* ocr = false : renommage d'après le nom du fichier (rapide) ; ocr = true : pièces restantes, d'après leur contenu */
function renommerPieces_(appliquer, ocr) {
  var debut = Date.now(), p = PropertiesService.getScriptProperties(), depuis = new Date(RN.DEPUIS);
  var fn = ocr ? 'renommerPiecesContenu' : 'renommerPieces', cle = ocr ? 'RN_INDEX_OCR' : 'RN_INDEX';
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === fn) ScriptApp.deleteTrigger(t); });
  var clients = [], it = DriveApp.getFolderById(DC.RACINE).getFolders(), titres = titresDossiers_();
  while (it.hasNext()) clients.push(it.next());
  clients.sort(function (a, b) { return a.getName() < b.getName() ? -1 : 1; });
  var ss = feuille_().getParent(), sh = ss.getSheetByName(RN.JOURNAL) || ss.insertSheet(RN.JOURNAL);
  if (sh.getLastRow() === 0) sh.appendRow(['Dossier client', 'Ancien nom', 'Nouveau nom', 'Id du fichier / remarque']);
  var i = Number(p.getProperty(cle) || 0), lignes = [], n = 0, inconnus = 0;
  for (; i < clients.length; i++) {
    if (Date.now() - debut > 4.3 * 60 * 1000) break;
    var client = clients[i], titre = nomClientDossier_(client, titres), dossiers = [client], sd = client.getFolders();
    while (sd.hasNext()) dossiers.push(sd.next());
    dossiers.forEach(function (dossier) {
      var fichiers = [], pris = {}, fi = dossier.getFiles();
      while (fi.hasNext()) { var x = fi.next(); fichiers.push(x); pris[x.getName().toUpperCase()] = 1; }
      fichiers.forEach(function (f) {
        if (f.getDateCreated() < depuis) return;                         /* seulement les pièces rangées par le script */
        var nom = f.getName();
        if (nom.toUpperCase().indexOf(titre + ' ') === 0) return;         /* déjà au bon nom */
        var type = typePiece_(nom);
        if (!type && ocr) type = typeContenu_(f);
        if (!type) { inconnus++; if (ocr) lignes.push([titre, nom, '', 'type non reconnu, nom gardé']); return; }
        var ext = (nom.match(/\.[a-z0-9]{2,4}$/i) || [''])[0].toLowerCase();
        var plaque = (nom.toUpperCase().replace(/_/g, ' ').match(/\b[A-Z]{2}[ -]?\d{3}([ -]?[A-Z]{2})?\b/) || [''])[0].replace(/ /g, '-');
        if (/^(CNI|PERMIS|RIB|KBIS|TITRE DE SEJOUR|LIVRET DE FAMILLE|AVIS IMPOSITION|BULLETIN DE SALAIRE|JUSTIFICATIF DOMICILE|AVIS DE SITUATION|ACTE ETAT CIVIL|PACS)$/.test(type)) plaque = '';
        var base = titre + ' ' + type + (plaque ? ' ' + plaque : ''), nouveau = base + ext, k = 1;
        while (pris[nouveau.toUpperCase()]) { k++; nouveau = base + ' ' + k + ext; }
        pris[nouveau.toUpperCase()] = 1;
        if (appliquer) f.setName(nouveau);
        n++; lignes.push([titre, nom, nouveau, f.getId()]);
      });
    });
    if (appliquer) p.setProperty(cle, String(i + 1));
  }
  if (appliquer && lignes.length) sh.getRange(sh.getLastRow() + 1, 1, lignes.length, 4).setValues(lignes);
  console.log((appliquer ? 'Renommés : ' : 'À renommer : ') + n + ' ; type non reconnu : ' + inconnus + ' ; dossiers ' + i + '/' + clients.length);
  if (appliquer) {
    if (i < clients.length) ScriptApp.newTrigger(fn).timeBased().after(60 * 1000).create();
    else { p.deleteProperty(cle); if (!ocr) ScriptApp.newTrigger('renommerPiecesContenu').timeBased().after(60 * 1000).create(); }
  }
  lignes.slice(0, 40).forEach(function (l) { console.log(l[0] + ' ¦ ' + String(l[1]).slice(0, 45) + ' → ' + (l[2] || l[3])); });
}
function simulerRenommage() { renommerPieces_(false, false); }
function renommerPieces() { renommerPieces_(true, false); }
function renommerPiecesContenu() { renommerPieces_(true, true); }
function reinitialiserRenommage() { var p = PropertiesService.getScriptProperties(); p.deleteProperty('RN_INDEX'); p.deleteProperty('RN_INDEX_OCR'); }
