/* ---------- Lecture des PDF de contrats (Bradley, 18/11/2026) ----------
   Le PDF est converti en texte par Google Drive (conversion en Google Docs, OCR compris),
   puis le fichier temporaire est mis à la corbeille. */
function textePdf_(blob) {
  var token = ScriptApp.getOAuthToken(), sep = 'eloy' + Date.now();
  var meta = JSON.stringify({ name: 'tmp-lecture-contrat', mimeType: 'application/vnd.google-apps.document' });
  var corps = Utilities.newBlob('--' + sep + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + sep + '\r\nContent-Type: application/pdf\r\n\r\n').getBytes()
    .concat(blob.getBytes()).concat(Utilities.newBlob('\r\n--' + sep + '--').getBytes());
  var r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'post', contentType: 'multipart/related; boundary=' + sep, payload: corps,
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
  if (r.getResponseCode() >= 300) throw new Error('Conversion PDF : ' + r.getContentText().slice(0, 200));
  var id = JSON.parse(r.getContentText()).id;
  try {
    return UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + id + '/export?mimeType=text/plain',
      { headers: { Authorization: 'Bearer ' + token } }).getContentText();
  } finally { DriveApp.getFileById(id).setTrashed(true); }
}

/* Échantillons : lignes utiles de contrats reçus ou envoyés par mail (pour régler la lecture par compagnie) */
function echantillonsContrats() {
  var fils = GmailApp.search('has:attachment after:2026/05/01 (filename:signe OR filename:"conditions particulieres" OR filename:conditions-particulieres OR filename:cpi)', 0, 30);
  var cle = /(contrat|police|n°|numéro|prime|cotisation|ttc|total|effet|immatricul|compagnie|assureur|formule|échéance|annuel|souscripteur|assuré)/i, n = 0;
  fils.forEach(function (th) {
    if (n >= 5) return;
    th.getMessages().forEach(function (m) { m.getAttachments().forEach(function (pdf) {
      if (n >= 5 || !/pdf$/i.test(pdf.getName()) || !/(signe|conditions.?particuli)/i.test(pdf.getName())) return; n++;
      console.log('=== ' + pdf.getName().slice(0, 60));
      var t = textePdf_(pdf), lignes = t.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l && cle.test(l); });
      console.log(lignes.slice(0, 25).map(function (l) { return l.slice(0, 100); }).join('\n'));
    }); });
  });
}
