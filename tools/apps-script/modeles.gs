/**
 * Eloy – modèles de mails Gmail, en 3 étapes (8 novembre 2026).
 *   1. Demande pour le devis  : « Votre devis … – questionnaire à compléter » / « – éléments à me transmettre »
 *   2. Envoi du devis          : « Votre proposition d'assurance … »
 *   3. Souscription et suivi   : « Votre assurance … – finalisation de la souscription », « – pièces en attente »
 * creerBrouillonsModeles() crée un brouillon par modèle (sans signature : Gmail l'ajoute avec « Bien à vous, »).
 * Bradley relit, puis chaque brouillon est enregistré comme modèle Gmail (le nom du modèle = l'objet).
 * Relancer la fonction remplace les brouillons qu'elle a créés la fois précédente.
 * Les zones surlignées en jaune sont à compléter avant l'envoi.
 */
var SITE_Q = 'https://www.eloy-assurances-patrimoine.fr/?questionnaire=';
var FIN = 'Dès réception, je lance l\'étude et je reviens vers vous rapidement.';
var ENSUITE = 'Je vous envoie ensuite les éléments de souscription.';

/* ---------- briques ---------- */
function e_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/* [[à compléter]] -> surligné jaune ; **gras** -> gras */
function fmt_(s) {
  return e_(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[\[(.+?)\]\]/g, '<span style="background-color:#fff2a8">$1</span>');
}
function P(s) { return { p: s }; }
function L(titre, items) { return { t: titre, l: items }; }
function B(texte, url) { return { b: texte, u: url }; }
function rendu_(blocs) {
  var h = [], t = [];
  blocs.forEach(function (x) {
    if (x.p != null) { h.push(fmt_(x.p)); t.push(x.p.replace(/\*\*|\[\[|\]\]/g, '')); }
    else if (x.l) {
      h.push((x.t ? '<b>' + e_(x.t) + '</b><br>' : '') + x.l.map(function (i) { return '- ' + fmt_(i); }).join('<br>'));
      t.push((x.t ? x.t + '\n' : '') + x.l.map(function (i) { return '- ' + i.replace(/\*\*|\[\[|\]\]/g, ''); }).join('\n'));
    } else if (x.b) {
      h.push('<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#E85D04;border-radius:8px;padding:11px 20px">' +
        '<a href="' + x.u + '" style="color:#ffffff;text-decoration:none;font-family:verdana,sans-serif;font-size:13px;font-weight:bold">' + e_(x.b) + '</a></td></tr></table>');
      t.push(x.b + ' : ' + x.u);
    }
  });
  return {
    html: '<div dir="ltr"><div style="font-family:verdana,sans-serif;font-size:small;color:#222222">Bonjour,<br><br>' + h.join('<br><br>') + '<br><br></div></div>',
    texte: 'Bonjour,\n\n' + t.join('\n\n') + '\n'
  };
}

/* ---------- étape 1 : demande pour le devis ---------- */
var QUESTIONNAIRES = [
  ['Votre devis Assurance habitation', 'd\'**assurance habitation**', 'habitation'],
  ['Votre devis RC Pro', 'd\'**assurance responsabilité civile professionnelle**', 'rcpro'],
  ['Votre devis Dommages-ouvrage', 'd\'**assurance dommages-ouvrage**', 'dommagesouvrage'],
  ['Votre devis RC Décennale', 'd\'**assurance RC Décennale**', 'decennale'],
  ['Votre devis Mutuelle santé', 'de **mutuelle santé**', 'mutuelle'],
  ['Votre devis Prévoyance du dirigeant', 'de **prévoyance du dirigeant**', 'prevtns'],
  ['Votre devis Prévoyance', 'de **prévoyance**', 'prevsalarie'],
  ['Votre devis Assurance bateau', 'd\'**assurance bateau**', 'plaisance']
];
var PDF = [
  ['Votre devis Transporteurs et logisticiens', 'd\'**assurance transporteur et/ou logisticien**'],
  ['Votre devis Marchandises transportées', 'd\'**assurance des marchandises transportées**'],
  ['Votre devis Maritime et portuaire', 'd\'**assurance maritime et portuaire**']
];
var AUTO_PIECES = [
  L(null, ['carte grise recto verso, ou pro forma de la concession, ou certificat provisoire d\'immatriculation', 'permis de conduire recto verso',
    'une pièce d\'identité en cours de validité', 'le(s) relevé(s) d\'information auto de moins de 3 mois, justifiant 36 mois d\'antécédent d\'assurance, si vous avez déjà été assuré']),
  L(null, ['votre profession exacte', 'votre portable', 'votre adresse postale', 'le lieu de stationnement la nuit : rue (voie publique), parking collectif clos non couvert, parking privé clos non couvert ou garage fermé',
    'la formule souhaitée : Tiers de base, Tiers étendu ou Tous risques'])
];
var MOTO_PIECES = [
  L(null, ['carte grise recto verso, ou pro forma de la concession, ou certificat provisoire d\'immatriculation', 'permis de conduire recto verso',
    'une pièce d\'identité en cours de validité', 'le(s) relevé(s) d\'information moto et auto de moins de 3 mois, justifiant 36 mois d\'antécédent d\'assurance, si vous avez déjà été assuré (seulement auto si vous n\'avez jamais assuré de moto)']),
  L(null, ['votre profession exacte', 'votre portable', 'votre adresse postale', 'le lieu de stationnement la nuit : rue (voie publique), parking collectif clos non couvert, parking privé clos non couvert ou garage fermé',
    'la formule souhaitée : Tiers, Tiers + vol ou Tous risques'])
];
var PIECES_DEVIS = [
  ['Votre devis Assurance auto', 'd\'**assurance auto**', AUTO_PIECES],
  ['Votre devis Assurance moto', 'd\'**assurance moto**', MOTO_PIECES],
  ['Votre devis Assurance emprunteur', 'd\'**assurance emprunteur**', [L(null, ['pièce d\'identité de chaque emprunteur', 'l\'offre de prêt complète', 'le tableau d\'amortissement définitif', 'la profession exacte de chaque emprunteur', 'fumeur ou non-fumeur au cours des 24 derniers mois, pour chaque emprunteur', 'pratique d\'un sport à risque : si oui, lequel ou lesquels'])]],
  ['Votre devis Assurance obsèques', 'd\'**assurance obsèques**', [L(null, ['pièce d\'identité de la personne à assurer', 'le capital souhaité'])]],
  ['Votre devis Assurance décès', 'd\'**assurance décès**', [L(null, ['pièce d\'identité de chaque personne à assurer', 'la profession exacte de chaque personne à assurer', 'fumeur ou non-fumeur au cours des 24 derniers mois', 'les sports ou activités à risque pratiqués, s\'il y en a', 'le capital souhaité', 'les bénéficiaires (conjoint, enfants, autre personne)'])]],
  ['Votre devis Garantie homme clé', 'd\'assurance **homme clé**', [L('Votre entreprise', ['extrait Kbis de moins de 3 mois', 'les liasses fiscales complètes des 3 derniers exercices']), L('La personne à assurer', ['sa pièce d\'identité', 'sa profession exacte, sa fonction et son rôle dans l\'entreprise', 'son salaire annuel brut (ou son bulletin de salaire de décembre)', 'fumeur ou non-fumeur au cours des 24 derniers mois', 'pratique d\'un sport à risque : si oui, lequel ou lesquels'])]],
  ['Votre devis Mutuelle santé collective', 'de **mutuelle santé collective**', [L(null, ['le tableau ci-joint, complété (onglet « Entreprise » et une ligne par salarié, y compris ceux qui demandent une dispense)', 'extrait Kbis de moins de 3 mois', 'pièce d\'identité du dirigeant']), L('Votre contrat actuel (s\'il y en a un)', ['le tableau de garanties', 'les cotisations'])]],
  ['Votre devis Prévoyance collective', 'de **prévoyance collective**', [L(null, ['le tableau ci-joint, complété (onglet « Entreprise » et une ligne par salarié à couvrir)', 'extrait Kbis de moins de 3 mois', 'pièce d\'identité du dirigeant']), L('Votre contrat actuel (s\'il y en a un)', ['les conditions générales et particulières (tableau de garanties)', 'les cotisations', 'le relevé des sinistres indemnisés sur les 3 dernières années'])]],
  ['Votre devis RC des mandataires sociaux', 'd\'assurance **responsabilité civile des mandataires sociaux**', [L('Votre entreprise', ['extrait Kbis de moins de 3 mois', 'la dernière liasse fiscale complète (bilan et compte de résultat)', 'l\'effectif', 'les filiales ou activités hors de France, s\'il y en a', 'toute procédure en cours (collective, prud\'homale, fiscale), s\'il y en a']), L('Les dirigeants', ['pièce d\'identité du dirigeant', 'le nombre de dirigeants à couvrir et leurs fonctions']), L('Votre contrat actuel (s\'il y en a un)', ['les conditions particulières (plafond et cotisation)', 'le relevé des sinistres ou réclamations des 5 dernières années'])]]
];

function etape1_() {
  var m = [];
  QUESTIONNAIRES.forEach(function (q) {
    m.push([q[0] + ' – questionnaire à compléter', [P('Afin de vous transmettre votre proposition ' + q[1] + ', merci de compléter ce questionnaire en ligne :'), B('Compléter mon questionnaire', SITE_Q + q[2]), P(FIN)]]);
  });
  PDF.forEach(function (q) {
    m.push([q[0] + ' – questionnaire à compléter', [P('Afin de vous transmettre votre proposition ' + q[1] + ', merci de me retourner le questionnaire ci-joint, complété.'), P('Il se remplit directement sur ordinateur.'), P(FIN)]]);
  });
  PIECES_DEVIS.forEach(function (q) {
    m.push([q[0] + ' – éléments à me transmettre', [P('Afin de vous transmettre votre proposition ' + q[1] + ', merci de me retourner les éléments suivants :')].concat(q[2]).concat([P(FIN)])]);
  });
  m.push(['Votre étude Assurance vie – éléments à me transmettre', [
    P('Afin de vous transmettre votre proposition d\'**assurance vie**, merci de me retourner les éléments suivants :'),
    L('Vous', ['pièce d\'identité', 'justificatif de domicile de moins de 3 mois', 'votre situation familiale et professionnelle', 'vos revenus et votre patrimoine, approximativement']),
    L('Votre projet', ['votre objectif : épargne de précaution, projet, transmission à vos proches, complément de revenus', 'le versement initial et les versements mensuels envisagés', 'votre rapport au risque : prudent, équilibré ou dynamique', 'l\'origine des fonds (épargne, vente d\'un bien, succession…)']), P(FIN)]]);
  m.push(['Votre étude Plan d\'épargne retraite – éléments à me transmettre', [
    P('Afin de vous transmettre votre proposition de **plan d\'épargne retraite (PER)**, merci de me retourner les éléments suivants :'),
    L('Vous', ['pièce d\'identité', 'justificatif de domicile de moins de 3 mois', 'votre situation professionnelle : salarié, fonctionnaire, travailleur non salarié', 'votre dernier avis d\'imposition']),
    L('Votre projet', ['le versement initial et les versements mensuels envisagés', 'le relevé d\'épargne de vos contrats retraite à transférer, s\'il y en a (Madelin, PERP, article 83, autre PER)']), P(FIN)]]);
  return m;
}

/* ---------- étape 2 : envoi du devis ----------
   Les pièces de souscription se demandent avec le devis (Bradley, 08/11/2026) :
   bon pour accord, pièce d'identité, RIB (+ RIB et pièce d'identité du payeur s'il n'est pas le souscripteur),
   pièces propres au produit, date d'effet souhaitée. */
function accord_(pieces) {
  return [P('S\'il vous convient, retournez-moi dans un premier temps :'),
    L(null, ['votre « bon pour accord », en réponse à ce mail', 'une pièce d\'identité en cours de validité',
      'votre RIB (si le compte n\'est pas à votre nom : le RIB et la pièce d\'identité de la personne qui paiera)']
      .concat(pieces || []).concat(['la date d\'effet souhaitée'])),
    P(ENSUITE)];
}
function etape2_() {
  return [
    ['Votre proposition d\'assurance auto – tous risques', [
      P('Je vous transmets la proposition d\'assurance auto en formule **Tous risques**, avec :'),
      L(null, ['prêt de véhicule : 10 jours en cas de panne immobilisante, 15 jours en cas d\'accident, 30 jours en cas de vol', 'remorquage sans franchise kilométrique', 'bris de glace sans franchise', 'franchise de 375 € en cas de vol, incendie, vandalisme et accident responsable']),
      P('Tarif mensuel : **[[… €]]**'),
      P('En formule Tiers étendu, le tarif est de [[… €]] par mois.')]
      .concat(accord_(['le rapport du contrôle technique « définitif et favorable »', 'le(s) relevé(s) d\'information de moins de 3 mois, justifiant 3 ans d\'antécédent d\'assurance', 'l\'attestation de non-sinistralité ci-jointe, remplie et signée', 'le contrôle visuel du véhicule, à réaliser avec ce lien : [[lien]]']))],
    ['Votre proposition d\'assurance auto – jeune conducteur', [
      P('Comme vous êtes jeune conducteur, je vous transmets la proposition d\'assurance auto en formule **Tiers étendu**, avec :'),
      L(null, ['remorquage sans franchise kilométrique', 'bris de glace : franchise de 125 € maximum', 'vol, incendie : franchise de 400 € maximum', 'sans la garantie prêt de véhicule']),
      P('Tarif mensuel : **[[… €]]**')]
      .concat(accord_(['le rapport du contrôle technique « définitif et favorable »', 'l\'attestation de non-sinistralité ci-jointe, remplie et signée', 'le contrôle visuel du véhicule, à réaliser avec ce lien : [[lien]]']))],
    ['Votre proposition d\'assurance habitation', [
      P('Je vous transmets la proposition d\'assurance habitation, avec :'),
      L(null, ['un capital mobilier couvert jusqu\'à [[… €]]', 'une franchise générale de [[… €]]', 'l\'assurance scolaire et extrascolaire des enfants']),
      P('Tarif mensuel : **[[… €]]**')].concat(accord_())],
    ['Votre proposition d\'assurance bateau', [
      P('Je vous transmets la proposition d\'assurance bateau, avec :'),
      L(null, ['[[garantie 1]]', '[[garantie 2]]', '[[franchise]]']),
      P('Tarif mensuel : **[[… €]]**')]
      .concat(accord_(['bateau à moteur : votre permis bateau', 'voilier : une attestation sur l\'honneur de votre expérience ou de vos connaissances de navigation, ou votre certificat ou carnet de stage de voile',
        'bateau immatriculé après 2022 : le certificat d\'enregistrement', 'bateau immatriculé avant 2022 : l\'acte de francisation ou la carte de circulation', 'bateau pas encore immatriculé : l\'acte de vente']))],
    ['Votre proposition d\'assurance multirisque professionnelle', [
      P('Je vous transmets la proposition d\'assurance pour couvrir [[vos locaux professionnels]], avec :'),
      L(null, ['un capital mobilier et matériel professionnel couvert jusqu\'à [[… €]]', 'une franchise générale de [[… €]]']),
      P('Tarif mensuel : **[[… €]]**')].concat(accord_(['extrait Kbis de moins de 3 mois']))],
    ['Votre proposition d\'assurance', [
      P('Je vous transmets la proposition d\'assurance [[produit]], ci-jointe, avec :'),
      L(null, ['[[garantie 1]]', '[[garantie 2]]', '[[franchise]]']),
      P('Tarif mensuel : **[[… €]]**')].concat(accord_())]
  ];
}

/* ---------- étape 3 : souscription et suivi ----------
   Plusieurs partenaires de signature électronique : pas de nom d'outil. L'attestation est dans le contrat signé
   ou envoyée par la compagnie : pas de phrase sur l'attestation (Bradley, 08/11/2026). */
function signer_(produit) {
  return [P('Pour finaliser la souscription de votre **' + produit + '**, il reste à signer votre contrat.'),
    P('Vous avez reçu par mail les conditions particulières ou le contrat à signer électroniquement (pensez à vérifier vos spams).')];
}
function enAttente_(produit) {
  return [P('Pour la bonne conformité de votre dossier d\'**' + produit + '**, il reste à me transmettre :'),
    L(null, ['la carte grise définitive à votre nom, dès que possible', 'le contrôle technique définitif et favorable']),
    P('Si ces éléments ne sont pas transmis dans les 30 jours, il n\'y aura pas de prise en charge en cas de demande d\'avenant ou de sinistre, et la compagnie résiliera automatiquement le contrat.')];
}
/* Proposition de financement à la finalisation (Bradley, 08/11/2026) : le client vient de dire oui.
   La mention crédit obligatoire figure dans la signature Gmail. */
var UPSELL_PART = 'Pour information, je m\'occupe aussi du **regroupement de crédits**, pour baisser vos mensualités ou financer un projet personnel. Si vous avez un besoin, répondez simplement à ce mail.';
var UPSELL_PRO = 'Pour information, je m\'occupe aussi du **financement de vos projets professionnels** (matériel, véhicules, crédit-bail) et du **regroupement de crédits**, pour baisser vos mensualités ou financer un projet personnel. Si vous avez un besoin, répondez simplement à ce mail.';
function etape3_() {
  return [
    ['Votre assurance auto – finalisation de la souscription', signer_('assurance auto').concat([P(UPSELL_PART)])],
    ['Votre assurance habitation – finalisation de la souscription', signer_('assurance habitation').concat([P(UPSELL_PART)])],
    ['Votre assurance – finalisation de la souscription', signer_('assurance [[produit]]').concat([P(UPSELL_PART)])],
    ['Votre assurance professionnelle – finalisation de la souscription', signer_('assurance [[produit]]').concat([P(UPSELL_PRO)])],
    ['Votre assurance auto – pièces en attente', enAttente_('assurance auto')],
    ['Votre assurance moto – pièces en attente', enAttente_('assurance moto')]
  ];
}

function modeles() { return etape1_().concat(etape2_()).concat(etape3_()); }

function creerBrouillonsModeles() {
  var p = PropertiesService.getScriptProperties();
  JSON.parse(p.getProperty('BROUILLONS_MODELES') || '[]').forEach(function (id) {
    try { GmailApp.getDraft(id).deleteDraft(); } catch (e) {}
  });
  var ids = [];
  modeles().forEach(function (m) {
    var r = rendu_(m[1]);
    ids.push(GmailApp.createDraft('', m[0], r.texte, { htmlBody: r.html }).getId());
  });
  p.setProperty('BROUILLONS_MODELES', JSON.stringify(ids));
  Logger.log(ids.length + ' brouillons créés');
}
