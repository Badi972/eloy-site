#!/usr/bin/env python3
"""Questionnaires en ligne transport, maritime et protection juridique pro (20/11/2026), repris des questionnaires PDF Eloy
(dist/docs/Eloy_Questionnaire_Transporteurs_Logisticiens.pdf, Eloy_Questionnaire_Marchandises_Transportees.pdf,
tools/pdfq/q_services_maritimes.py, q_manutention.py, q_autorites_portuaires.py, q_marinas.py, q_chantiers_navals.py,
q_armateur_portuaire.py, q_affreteur.py, q_navires_passagers.py, q_protection_juridique.py).
Les tableaux des PDF deviennent des champs courts ou des zones de texte libres.
Le questionnaire maritime est unique : les rubriques s'adaptent au métier choisi (pré-rempli par ?metier=).
Écrit les entrées transport, marchandises, maritime, pjpro dans tools/questionnaires.json.
Usage : python3 tools/q_transport_maritime.py"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
CDN = 'https://cdn.jsdelivr.net/gh/Badi972/eloy-site@%s/dist/docs/%s'
S0, SPJ = '2edead2eb6eafe55d1b7b1c5adc88ea16178249f', '97bc45129138f3f22cc0f48b06c0c766b104f9af'
ON = ['Oui', 'Non']
ONC = ['Oui', 'Non', 'À me conseiller']


def F(k, l, t=None, req=1, **kw):
    f = {'k': k, 'l': l, 'req': req}
    if t: f['type'] = t
    f.update(kw)
    return f


def O(k, l, t=None, **kw):
    """Champ facultatif."""
    return F(k, l, t, req=0, **kw)


def R(k, l, o=ON, **kw):
    return F(k, l, 'radio', o=o, **kw)


def RO(k, l, o=ON, **kw):
    return F(k, l, 'radio', req=0, o=o, **kw)


def oui(k):
    return [k, 'Oui']


def entreprise(extra=()):
    return {'t': "L'entreprise", 'f': [
        F('raison_sociale', 'Nom de la société (ou de l\'entreprise individuelle)', s='Raison sociale'),
        F('siren', 'Numéro SIREN ou SIRET', w=2, siren=1, h='9 ou 14 chiffres. Les autres informations de la société sont récupérées automatiquement.'),
        F('date_effet', "Date d'effet souhaitée", 'date', w=2)] + list(extra)}


def vous():
    return {'t': 'Vous', 'f': [
        F('nom', 'Nom', w=2, p='nom'), F('prenom', 'Prénom', w=2),
        F('fonction', "Votre fonction dans l'entreprise", w=2, ph='Ex. gérant'),
        F('tel', 'Téléphone portable', 'tel', w=2, p='tel'), F('email', 'E-mail', 'email', w=2, p='email')]}


def kyc():
    return {'t': 'Identification de la société',
            'd': "Informations demandées par les compagnies d'assurance pour toute étude (connaissance du client).",
            'f': [F('dirigeants', 'Dirigeants : nom, prénom et fonction de chacun', 'textarea'),
                  F('beneficiaires', 'Bénéficiaires effectifs : nom, prénom, date et lieu de naissance, pays du domicile', 'textarea',
                    h="Toute personne qui détient plus de 25 % du capital ou des droits de vote, ou qui contrôle la société. "
                      "À défaut, le représentant légal."),
                  R('ppe', "Un dirigeant ou un bénéficiaire effectif est-il une personne politiquement exposée (élu national, membre du gouvernement, "
                           "haut magistrat, dirigeant d'entreprise publique…), ou proche d'une telle personne ?", alerte=1,
                    s='Personne politiquement exposée'),
                  F('ppe_detail', 'Nom et fonction exercée', show=oui('ppe'), s='Personne politiquement exposée – détail')]}


def antecedents(annees=5, procedure=True):
    f = [R('deja_assure', 'Êtes-vous déjà assuré pour ces risques ?'),
         F('assureur', 'Nom de votre assureur actuel', w=2, show=oui('deja_assure')),
         O('echeance', 'Échéance du contrat actuel', 'date', w=2, show=oui('deja_assure')),
         R('resilie', 'Un assureur a-t-il résilié ou majoré votre contrat au cours des 3 dernières années (sinistres ou non-paiement) ?', alerte=1),
         F('motif_resiliation', 'Motif', show=oui('resilie'))]
    if procedure:
        f.append(R('procedure', "L'entreprise fait-elle l'objet d'une procédure collective (sauvegarde, redressement ou liquidation judiciaire) ?", alerte=1))
    f += [R('sinistres', 'Avez-vous eu des sinistres sur ces risques au cours des %d dernières années ?' % annees, alerte=1),
          F('sinistres_detail', 'Pour chacun : date, nature, montant indemnisé et montant en cours', 'textarea', show=oui('sinistres'),
            h='Vous pouvez aussi joindre la statistique de sinistres de votre assureur en réponse au mail.'),
          R('mesures', 'Avez-vous pris des mesures pour éviter un nouveau sinistre de même nature ?', show=oui('sinistres')),
          F('mesures_detail', 'Lesquelles ?', show=oui('mesures'))]
    return {'t': 'Vos antécédents', 'f': f}


def fin():
    return {'t': 'Informations complémentaires', 'f': [
        O('complement', 'Autres informations utiles à l\'étude de votre dossier', 'textarea')]}


def base(titre, court, demande, produit, mail, sujet, decl, intro, sections, pdf, pieces=None, **kw):
    q = {'titre': titre, 'court': court, 'demande': demande, 'produit': produit, 'mail': mail, 'sujet': sujet,
         'declencheurs': decl, 'intro': intro, 'sections': sections, 'pdf': pdf}
    if pieces: q['pieces'] = pieces
    q.update(kw)
    return q


def lignes(prefixe, items, quoi, show=None, ph=None, s=None):
    """Une ligne de tableau PDF = un champ court facultatif (laissé vide si non concerné)."""
    out = []
    for i, it in enumerate(items):
        kw = {'w': 2}
        if show: kw['show'] = show
        if ph and i == 0: kw['ph'] = ph
        if s: kw['s'] = s % it
        out.append(O('%s%d' % (prefixe, i + 1), '%s : %s' % (it, quoi), **kw))
    return out


def sec(t, f, d=None):
    s = {'t': t, 'f': f}
    if d: s['d'] = d
    return s


Q = {}

# ---------- Transporteurs et logisticiens ----------
ACT = 'capital à garantir et part du CA'
PHA = 'Ex. 150 000 € – 30 %'
FAM = [
    ('voiturier', 'Êtes-vous voiturier ou loueur de véhicules avec chauffeur ?', ['Transport en frigo', 'Transport en benne', 'Transport en bétaillère', 'Transport exceptionnel',
                                           'Transport de véhicules', 'Transport de messagerie', 'Transport de lots et demi-lots industriels',
                                           'Transport sous LTA', 'Cabotage']),
    ('demenageur', 'Êtes-vous déménageur ?', ['Déménagement administratif ou industriel', 'Déménagement d\'entreprise', 'Déménagement interne',
                                  'Déménagement de particuliers', 'Déménagement de mobilier en garde-meuble']),
    ('organisateur', 'Êtes-vous organisateur ou opérateur de transport ?', ['Commissionnaire de transport maritime', 'Commissionnaire de transport aérien',
                                                                 'Commissionnaire agréé en douane', 'Transitaire', 'NVOCC', 'Cabotage (organisateur)']),
    ('levage', 'Faites-vous de la manutention ou du levage ?', ['Manutention terrestre', 'Manutention aérienne (handling)', 'Manutention portuaire']),
    ('logistique', 'Êtes-vous logisticien ?', ['Entrepositaire', 'Gestionnaire de stock', 'Préparateur de commandes', 'Étiquetage', 'Emballeur']),
    ('autres', 'Avez-vous d\'autres activités (atelier, lavage…) ?', ['Atelier ou garage intégré (pour compte propre)', 'Station de lavage (pour compte propre)',
                                    'Lavage interne de citernes (pour compte propre)']),
]
act_f = []
for k, t, items in FAM:
    act_f.append(R('fam_' + k, t, w=2))
for k, t, items in FAM:
    act_f += lignes('a_%s_' % k, items, ACT, show=oui('fam_' + k), ph=PHA)
act_f.append(O('a_autres_autre', 'Autre activité : nature, capital à garantir et part du CA', show=oui('fam_autres')))

MARCH = ['Denrées périssables (hors température dirigée)', 'Marchandises sous température dirigée', 'Marchandises sensibles au vol',
         'Marchandises dangereuses', 'Produits chimiques et pétroliers', 'Animaux vivants',
         'Masses indivisibles, hors gabarit, convois exceptionnels', 'Véhicules et engins, caravanes, maisons mobiles', 'Messagerie']
ZONES = ['Zone 1 : France métropolitaine et outre-mer',
         'Zone 2 : zone 1 + pays d\'outre-mer et Europe de l\'Ouest (Union européenne, Royaume-Uni, Suisse, Norvège, Islande…)',
         'Zone 3 : zone 2 + Balkans, pays baltes, Chypre du Nord et Turquie',
         'Zone 4 : zone 3 + Maghreb, Ukraine, Biélorussie, Moldavie, Russie à l\'ouest du 40e méridien Est',
         'Zone 5 : autres pays']

Q['transport'] = base(
    'Assurance des transporteurs et logisticiens', 'Transporteurs', 'Questionnaire transporteurs et logisticiens',
    'Assurance transporteurs et logisticiens (pro)', 'assurance transporteur et/ou logisticien', 'Votre devis Transporteurs et logisticiens',
    ['Assurance transporteurs et logisticiens', 'Assurance transporteurs et logisticiens (pro)', 'Transporteurs et logisticiens'],
    "Ces informations me permettent d'étudier l'assurance de vos responsabilités de transporteur ou de logisticien et des marchandises "
    "qui vous sont confiées. Gardez à portée de main votre chiffre d'affaires et le nombre de vos véhicules. Comptez environ 10 minutes.",
    [entreprise(), vous(), kyc(),
     sec("Chiffre d'affaires et moyens", [
         F('ca', "Chiffre d'affaires de l'année précédente (€)", 'number', w=2),
         R('ca_variation', "Le chiffre d'affaires a-t-il beaucoup varié sur les 4 dernières années ?", w=2),
         F('ca_variation_detail', 'Précisez', show=oui('ca_variation'), s="Variation du chiffre d'affaires"),
         F('salaries', 'Nombre total de salariés', 'number', w=3), O('chauffeurs', 'dont chauffeurs', 'number', w=3),
         O('administratifs', 'dont administratifs', 'number', w=3),
         F('cartes_grises', 'Nombre total de cartes grises', 'number', w=2), O('remorques', 'dont remorques', 'number', w=2),
         O('semi', 'dont semi-remorques', 'number', w=2), O('tracteurs', 'dont tracteurs', 'number', w=2),
         R('filiales', 'Avez-vous des filiales ?', w=2),
         F('filiales_detail', 'Où sont-elles domiciliées (France, étranger : quel pays) ?', show=oui('filiales'), w=2),
         R('internet', 'Accès internet sur chaque site ?', w=2),
         R('certif', 'Êtes-vous certifié (ISO, OEA…) ?', w=2),
         F('certif_detail', 'Organisme certificateur et date', show=oui('certif')),
         O('licence', 'N° de licence de transport (inscription au registre des transporteurs)')]),
     sec('Garanties souhaitées', [
         R('g_rcc', 'Responsabilité civile contractuelle à l\'égard de vos clients', ONC, w=2),
         R('g_rct', 'Responsabilité civile à l\'égard des tiers et de vos salariés', ONC, w=2),
         R('g_marchandise', 'Dommages à la marchandise transportée', ONC, w=2),
         R('g_biens', 'Dommages aux biens (locaux, matériel)', ONC, w=2),
         R('g_vehicules', 'Dommages aux véhicules', ONC, w=2),
         R('g_assist_sal', 'Assistance aux salariés', ONC, w=2),
         R('g_assist_veh', 'Assistance aux véhicules', ONC, w=2),
         R('g_ia', 'Individuelle accidents', ONC, w=2),
         R('g_effets', 'Effets personnels', ONC, w=2),
         O('g_specifiques', 'Activités ou marchandises nécessitant des garanties ou des capitaux spécifiques, accords litiges', 'textarea')],
         "Répondez « À me conseiller » si vous ne savez pas. La responsabilité civile circulation de vos véhicules relève de l'assurance "
         "de vos véhicules, pas de ce contrat. Pour les dommages aux biens, aux véhicules et l'assistance, un questionnaire complémentaire "
         "vous sera adressé."),
     sec('Activités à couvrir', act_f,
         "Répondez pour chaque famille d'activités. Pour chaque activité exercée, indiquez le capital à garantir et sa part dans votre "
         "chiffre d'affaires ; laissez vide si vous ne l'exercez pas. Seules les activités déclarées sont couvertes."),
     sec('Marchandises transportées ou confiées',
         [R('m%d' % (i + 1), it, w=2, **({'h': "Textiles, chaussures, hi-fi, électroménager, informatique, téléphonie, parfums, "
                                                 "médicaments, tabac et alcools, pneumatiques, outillage, épicerie fine…"} if 'vol' in it else {}))
          for i, it in enumerate(MARCH)] +
         [O('m_autres', 'Autres marchandises (précisez)')]),
     sec('Territorialité', [F('zone', 'Zone géographique à couvrir', 'select', o=ZONES)]),
     antecedents(3, procedure=False), fin()],
    CDN % (S0, 'Eloy_Questionnaire_Transporteurs_Logisticiens.pdf'),
    [['Les documents pour l\'étude', ['extrait Kbis de moins de 3 mois',
                                      'la statistique de sinistres de votre assureur actuel, si vous êtes déjà assuré']]],
    aussi=[['Assurance maritime et portuaire', 'Auxiliaire de transport maritime ou fluvial'],
           ['Assurance maritime et portuaire (pro)', 'Auxiliaire de transport maritime ou fluvial']])

# ---------- Marchandises transportées ----------
FLUX = ['France', 'Union européenne', 'Reste de l\'Europe', 'USA – Canada', 'Amérique du Sud', 'Proche et Moyen-Orient', 'Afrique',
        'Asie du Sud-Est – Japon', 'Autres']
EXP = ['Distribution', 'Ventes', 'Achats', 'Intersites', 'Sous-traitants', 'Colis postaux', 'Imports', 'Exports']
exp_f = []
for i, e in enumerate(EXP):
    exp_f.append(R('e%d' % (i + 1), e, w=2))
    exp_f.append(F('e%d_val' % (i + 1), '%s : valeur maximale par expédition (€)' % e, 'number', w=2, show=oui('e%d' % (i + 1))))

Q['marchandises'] = base(
    'Assurance des marchandises transportées', 'Marchandises', 'Questionnaire marchandises transportées',
    'Assurance marchandises transportées (pro)', 'assurance des marchandises transportées', 'Votre devis Marchandises transportées',
    ['Assurance marchandises transportées', 'Assurance marchandises transportées (pro)', 'Marchandises transportées'],
    "Ces informations me permettent d'étudier l'assurance de vos marchandises pendant leur transport (import, export, envois entre "
    "vos sites). Gardez à portée de main vos volumes annuels et la valeur de vos plus gros envois. Comptez environ 10 minutes.",
    [entreprise(), vous(), kyc(),
     sec("Activité et chiffre d'affaires", [
         F('activite', 'Description de votre activité', 'textarea'),
         F('ca', "Chiffre d'affaires annuel HT de l'exercice précédent, ventes hors prestations de services (€)", 'number'),
         O('ca_france', "dont CA France (€)", 'number', w=3), O('ca_export', 'dont CA export (€)', 'number', w=3),
         O('ca_import', 'dont CA import (€)', 'number', w=3),
         R('ca_variation', "Le chiffre d'affaires a-t-il beaucoup varié sur les 4 dernières années ?"),
         F('ca_variation_detail', 'Précisez', show=oui('ca_variation'), s="Variation du chiffre d'affaires")]),
     sec('Les marchandises', [
         F('nature', 'Nature des marchandises transportées', 'textarea'),
         R('neuves', 'Marchandises neuves', w=2), R('usagees', 'Marchandises usagées', w=2),
         O('poids', 'Poids moyen par expédition', w=2), O('dimensions', 'Dimensions', w=2),
         O('emballage', 'Emballage', w=2), O('conditionnement', 'Conditionnement', w=2)]),
     sec('Zones et flux à assurer', [
         F('provenances', 'Provenances et destinations, en %', 'textarea', ph='Ex. Métropole vers Martinique 60 %, Chine vers Guadeloupe 40 %'),
     ] + lignes('flux', FLUX, 'type de trafic, mode de transport, Incoterms, montant annuel HT', ph='Ex. import, maritime, CIF, 400 000 €'),
         "Pour chaque zone concernée, indiquez le type de trafic (import, export…), le mode de transport, les Incoterms et le montant "
         "annuel HT. Laissez vide les zones non concernées."),
     sec('Valeur maximale assurée par expédition', [
         O('v_aerien', 'Aérien (€)', 'number', w=2), O('v_terrestre', 'Terrestre (€)', 'number', w=2),
         O('v_maritime', 'Maritime (€)', 'number', w=2), O('v_fluvial', 'Fluvial (€)', 'number', w=2),
         R('affretement', 'Affrétez-vous des navires ?', w=2),
         F('charte', 'Type de charte-partie', show=oui('affretement'), w=2)]),
     sec('Expéditions à assurer', exp_f),
     sec('Options de garantie', [
         R('o_prives', 'Transports privés (avec vos propres véhicules)', ONC),
         F('o_prives_detail', 'Nombre de véhicules, zone et capital (€)', show=oui('o_prives')),
         R('o_bagages', 'Bagages des collaborateurs', ONC),
         F('o_bagages_detail', 'Nombre de collaborateurs, zone et capital (€)', show=oui('o_bagages')),
         R('o_salons', 'Expositions et salons', ONC),
         F('o_salons_detail', 'Nombre, durée moyenne, zone et capital (€)', show=oui('o_salons')),
         R('o_confiees', 'Marchandises confiées', ONC, w=2), R('o_contre', 'Contre-assurance', ONC, w=2),
         R('o_greve', 'Risques de grève', ONC, w=2), R('o_guerre', 'Risques de guerre', ONC, w=2),
         R('o_immateriels', 'Dommages immatériels', ONC, w=2)], 'Répondez « À me conseiller » si vous ne savez pas.'),
     antecedents(4, procedure=False), fin()],
    CDN % (S0, 'Eloy_Questionnaire_Marchandises_Transportees.pdf'),
    [['Les documents pour l\'étude', ['extrait Kbis de moins de 3 mois',
                                      'la statistique de sinistres de votre assureur actuel, si vous êtes déjà assuré']]])

# ---------- Protection juridique professionnelle ----------
Q['pjpro'] = base(
    'Protection juridique professionnelle', 'Protection juridique', 'Questionnaire protection juridique pro',
    'Protection juridique pro (pro)', 'assurance protection juridique professionnelle', 'Votre devis Protection juridique pro',
    ['Protection juridique pro', 'Protection juridique pro (pro)', 'Protection juridique professionnelle', 'Protection juridique professionnelle (pro)'],
    "Ces informations me permettent d'étudier la protection juridique de votre entreprise : litiges avec vos clients, fournisseurs "
    "ou salariés, défense pénale, recouvrement. Comptez environ 5 minutes.",
    [entreprise([F('activite', 'Activité exercée (précisez)'),
                  F('ca', "Chiffre d'affaires de l'année précédente, ou prévisionnel en cas de création (€)", 'number', w=2),
                  F('salaries', 'Nombre de salariés', 'number', w=2)]), vous(),
     sec('Votre protection juridique', [
         F('vehicules', 'Nombre de véhicules de société', 'number', w=2),
         R('formule', 'Formule souhaitée', ['Essentielle', 'Étendue', 'À me conseiller'], w=2,
           h="Essentielle : défense pénale de l'entreprise et de ses dirigeants, litiges commerciaux (clients, fournisseurs, sous-traitants, "
             "concurrents), conflits avec un salarié, organismes sociaux, complément de vos autres assurances. Étendue : en plus, "
             "contrôle fiscal, recouvrement des factures impayées, transmission de l'entreprise, e-réputation."),
         R('intermediation', "Votre activité est-elle une activité d'intermédiation (courtier, agent général, mandataire) ?"),
         R('orias_unique', "Avez-vous un seul numéro ORIAS pour vos activités de courtier et d'agent général ?", show=oui('intermediation')),
         R('litige', "Avez-vous connaissance d'un litige en cours, ou d'un différend qui pourrait en devenir un ?", alerte=1),
         F('litige_detail', 'Précisez', show=oui('litige'), s='Litige en cours – détail')]),
     sec('Devis récent et contrat actuel', [
         R('devis', 'Avez-vous obtenu un devis de protection juridique au cours des 3 derniers mois ?'),
         F('devis_assureur', "Nom de l'assureur", w=2, show=oui('devis')),
         O('devis_prime', 'Prime annuelle HT (€)', 'number', w=2, show=oui('devis')),
         R('deja_pj', "L'entreprise a-t-elle déjà une protection juridique professionnelle ?"),
         F('pj_compagnie', 'Compagnie', w=3, show=oui('deja_pj')), O('pj_echeance', 'Échéance', 'date', w=3, show=oui('deja_pj')),
         O('pj_prime', 'Prime annuelle (€)', 'number', w=3, show=oui('deja_pj')),
         R('resilie', "Un assureur de protection juridique a-t-il déjà résilié l'entreprise ?", alerte=1),
         F('motif_resiliation', 'Pour quelles raisons ?', show=oui('resilie')),
         R('redressement', "L'entreprise a-t-elle déjà été en redressement judiciaire ?", alerte=1),
         R('procedure', "L'entreprise est-elle aujourd'hui en procédure collective (liquidation, redressement, sauvegarde) ?", alerte=1)]),
     sec('Sinistres des 36 derniers mois', [
         F('nb_sinistres', 'Nombre de sinistres déclarés', 'select', o=['0', '1', '2', '3', '4', '5', 'Plus de 5'], w=2),
         F('sinistres_detail', 'Pour chacun : nature, année et coût', 'textarea', show=['nb_sinistres', ['1', '2', '3', '4', '5', 'Plus de 5']])]),
     sec('Le nouveau contrat', [
         O('echeance_souhaitee', 'Échéance principale souhaitée', w=2, ph='Ex. 1er janvier'),
         R('paiement', 'Paiement', ['Annuel', 'Semestriel', 'Trimestriel', 'Mensuel'], w=2,
           h='Semestriel, trimestriel ou mensuel : selon le contrat, par prélèvement.')]),
     fin()],
    CDN % (SPJ, 'Eloy_Questionnaire_Protection_Juridique.pdf'),
    [['Les documents pour l\'étude', ['extrait Kbis de moins de 3 mois',
                                      'si vous êtes déjà assuré : la copie du contrat actuel et le tableau des garanties',
                                      'le relevé de sinistralité des 36 derniers mois']]])

# ---------- Maritime et portuaire (un questionnaire, rubriques selon le métier) ----------
SRV = ['Consignataire', 'Agent maritime', "Courtier d'affrètement"]
MAN = ['Manutention portuaire ou opérateur de terminal']
AUT = ['Autorité portuaire ou gestionnaire de port']
MAR = ['Port de plaisance ou marina']
CHA = ['Chantier naval (construction ou réparation)']
ARM = ['Armateur portuaire (remorquage, lamanage, vedettes…)']
AFF = ['Affréteur de navire']
PAS = ['Armateur de navire à passagers']
AUTRE = ['Autre métier de la mer']
METIERS = SRV + MAN + AUT + MAR + CHA + ARM + AFF + PAS + AUTRE
K = 'metier_mar'


def M(*groupes):
    v = [x for g in groupes for x in g]
    return [K, v]


def S(groupes, t, f, d=None):
    """Rubrique réservée à certains métiers : chaque champ sans condition reçoit celle du métier."""
    cond = M(*groupes)
    for x in f:
        if 'show' not in x: x['show'] = cond
    return sec(t, f, d)


AGE = ['Moins de 5 ans', 'De 5 à 10 ans', 'Plus de 10 ans']
PCT = 'part de l\'activité et CA estimé de l\'année'
PHP = 'Ex. 40 % – 300 000 €'

mar = [
    entreprise([F(K, 'Votre métier', 'select', o=METIERS, p='metier', s='Votre métier',
                  h="Le questionnaire s'adapte à votre métier. Auxiliaire de transport maritime ou fluvial : demandez-moi le questionnaire transporteurs."),
                F('metier_autre', 'Décrivez votre activité', 'textarea', show=[K, AUTRE])]),
    vous(), kyc(),
    sec("Chiffre d'affaires", [
        F('ca_n1', "Chiffre d'affaires de l'année précédente (€)", 'number', w=2),
        O('ca_n', "Chiffre d'affaires prévisionnel de l'année en cours (€)", 'number', w=2),
        O('ca_n2', "Chiffre d'affaires prévisionnel de l'année suivante (€)", 'number', w=2, show=M(SRV, MAN, MAR, AUT)),
        O('masse_salariale', 'Masse salariale brute annuelle (€)', 'number', w=2, show=M(AUT, CHA)),
        F('salaries', 'Nombre de salariés', 'number', w=2),
        O('cloture', "Date de clôture de l'exercice social", w=2, ph='Ex. 31 décembre', show=M(SRV, MAN, MAR)),
        R('ca_variation', "Le chiffre d'affaires a-t-il beaucoup varié sur les 4 dernières années ?"),
        F('ca_variation_detail', 'Précisez', show=oui('ca_variation'), s="Variation du chiffre d'affaires")]),
    S([SRV, MAN, MAR], "Profil de l'entreprise", [
        F('sites', "Sites d'exploitation : adresse de chaque site", 'textarea', h='Joignez le plan des sites en réponse au mail.'),
        O('date_creation', 'Date de création du chantier ou de début de l\'exploitation du site', w=2, show=M(MAN, MAR)),
        O('date_reprise', 'En cas de reprise, date de reprise', w=2, show=M(MAR)),
        F('age', 'Âge de la société', 'select', o=AGE, w=2, show=M(SRV, MAN)),
        F('anciennete', 'Ancienneté moyenne du personnel opérationnel', 'select', o=AGE, w=2, show=M(SRV)),
        F('clientele', 'Type de clientèle', 'radio', o=['Lignes régulières', 'Tramping', 'Les deux'], w=2, show=M(SRV, MAN)),
        RO('certification', 'Certification', w=2, show=M(SRV)),
        RO('formation', 'Cycle de formation organisé pour le personnel', w=2, show=M(SRV, MAN))]),
    # Consignataires, agents maritimes, courtiers d'affrètement
    S([SRV], 'Vos activités maritimes',
      lignes('sa', ['Consignataire de navires', 'Agent maritime', 'Consignataire de la cargaison'], PCT, ph=PHP) +
      lignes('sc', ['Commissionnaire de transport', 'Transitaire', 'Commissionnaire en douane', 'Transporteur routier',
                    "Courtier d'affrètement", 'Entrepositaire', 'NVOCC'], PCT) +
      [O('s_trafics', 'Commissionnaire de transport ou transporteur routier : type de trafics opérés', 'textarea'),
       RO('s_douane', 'Commissionnaire en douane : avez-vous une personne dédiée et diplômée (déclarant en douane) ?'),
       O('s_armateurs', 'Consignataire de navires : principaux clients armateurs et leur nationalité (lignes régulières et tramping)', 'textarea'),
       RO('s_agence', "Agent maritime : avez-vous mis en place un contrat d'agence ?", h='Si oui, joignez-en une copie en réponse au mail.'),
       RO('s_art14', "Consignataire de la cargaison : exercez-vous selon l'article 14 de la loi n° 69-8 du 3 janvier 1969 ?"),
       RO('s_cgv', 'Consignataire de la cargaison : avez-vous des conditions générales de vente ?'),
       RO('s_mandataire', "Courtier d'affrètement : intervenez-vous uniquement en tant que mandataire ?"),
       O('s_prestation', "Courtier d'affrètement : sur quel type de prestation repose votre activité, et quels contrats signez-vous ?", 'textarea'),
       RO('s_nvocc', 'NVOCC : disposez-vous de conditions générales ?')],
      "Pour chaque activité exercée, indiquez sa part dans votre activité et le chiffre d'affaires estimé de l'année. Laissez vide si vous ne l'exercez pas."),
    # Manutention portuaire
    S([MAN], 'Le terminal', [
        F('m_localisation', 'Localisation des travaux', 'radio', o=['À terre', 'À flot', 'Hors chantier'], w=2),
        F('m_terrain', 'Le terrain est occupé sous', 'select', o=['Concession avec les autorités portuaires',
                                                                   'Autorisation d\'occupation temporaire', 'Propriété', 'Autre'], w=2,
          h='Joignez la convention de délégation.'),
        RO('m_fer', 'Embranchement ferroviaire sur le site ?', w=2), RO('m_isps', 'Le terminal est-il ISPS ?', w=2),
        RO('m_acces', 'Les accès aux terre-pleins et hangars sont-ils contrôlés ?', w=2), RO('m_rondes', 'Effectuez-vous des rondes ?', w=2),
        RO('m_icpe', 'Le terminal est-il une installation classée (ICPE) ?'),
        O('m_icpe_regime', 'Quel régime (enregistrement, déclaration, autorisation) ?', show=oui('m_icpe'))]),
    S([MAN], 'Équipements et main-d\'œuvre', [
        RO('m_certif', 'Équipements de manutention certifiés par un organisme tiers ?', w=2),
        O('m_certif_org', 'Lequel ?', w=2, show=oui('m_certif')),
        RO('m_propres', 'Utilisez-vous vos propres matériels de manutention ?', w=2,
           h='Joignez la liste des équipements (en propriété et en location) et, si non, le contrat de mise à disposition.'),
        RO('m_bdm', 'Le matériel de manutention est-il assuré en bris de machines ?', w=2),
        RO('m_grutiers', 'La conduite est-elle assurée par vos propres grutiers ou portiqueurs ?'),
        O('m_operationnels', 'dont personnel opérationnel', 'number', w=2), O('m_soustraitants', 'Employés du port ou sous-traitants (nombre)', 'number', w=2),
        O('m_interim', 'Intérimaires ou vacataires (nombre)', 'number', w=2)]),
    S([MAN], 'Activités de manutention',
      lignes('ma', ['Entrepreneur de manutention portuaire', 'Entrepreneur de manutention ferroviaire', 'Garde à quai des marchandises',
                    'Opérateur de terminaux'], PCT, ph=PHP) +
      lignes('mc', ['Entrepositaire', 'Transitaire', 'Commissionnaire en douane', 'Commissionnaire de transport', 'Consignataire de navires',
                    'Agent maritime', 'Consignataire de la cargaison', 'Empoteur / dépoteur', 'Réparateur / laveur de conteneurs', 'NVOCC',
                    'Transporteur routier'], PCT, s='%s (activité complémentaire du manutentionnaire)') +
      [O('m_trafics', 'Commissionnaire de transport ou transporteur routier : type de trafics opérés', 'textarea', s='Manutentionnaire : type de trafics opérés'),
       RO('m_hors66', 'Réalisez-vous des opérations ne relevant pas de la loi du 18 juin 1966 (affrètement et transport maritimes) ?'),
       O('m_hors66_detail', 'Lesquelles ?', show=oui('m_hors66'), s='Opérations hors loi de 1966 – détail'),
       RO('m_cgv', 'Utilisez-vous des conditions générales de vente ?', h='Si oui, joignez-en une copie en réponse au mail.')],
      "Pour chaque activité exercée, indiquez sa part dans votre activité et le chiffre d'affaires estimé de l'année. Laissez vide si vous ne l'exercez pas."),
    S([MAN], 'Trafics (année en cours)', [
        O('m_evp', 'Conteneurs vides et pleins : nombre d\'EVP et de mouvements par an', w=2),
        O('m_reefer', 'Conteneurs frigorifiques : nombre d\'EVP et de prises reefer', w=2),
        O('m_dang', 'Conteneurs de marchandises dangereuses : nombre d\'EVP et type de marchandises', w=2),
        O('m_vrac', 'Vrac sec et vrac liquide : tonnages', w=2),
        O('m_roro', 'Trafic roulier (RoRo) : nombre de véhicules', w=2),
        O('m_autre_trafic', 'Autre trafic (animaux…) : type et tonnage', w=2),
        O('m_colis', 'Colis lourds hors gabarit : nombre par an et tonnage', w=2),
        RO('m_colis_spe', 'Êtes-vous spécialiste des colis lourds ?', w=2),
        F('m_navires', 'Taille des navires chargés ou déchargés', 'select', o=['Moins de 5 000 TJB', 'De 5 000 à 50 000 TJB', 'Plus de 50 000 TJB'], w=2),
        O('m_nb_navires', 'Nombre de navires par an', 'number', w=2)]),
    # Autorités portuaires
    S([AUT], 'Vos activités portuaires', [
        RO('a_domaine', 'Gestion et aménagement du domaine portuaire (quais, terminaux, bâtiments, infrastructures, bassins, formes de radoub)'),
        RO('a_travaux', 'Réalisation de travaux portuaires, création ou aménagement de zones industrielles ou de plaisance'),
        F('a_outillage', "Gestion de l'outillage public portuaire", 'select', o=['Non', 'Exploité par le port lui-même',
                                                                                  'Concédé ou autorisé à des utilisateurs portuaires', 'Les deux'], req=0),
        RO('a_police', 'Mission de police de conservation et d\'exploitation des ports'),
        RO('a_services', "Services publics connexes (aides à la navigation, balisage, pilotage, surveillance des quais, sécurité et secours)"),
        RO('a_conseil', "Conseil ou assistance technique à l'exploitation des ports"),
        O('a_autres', 'Autres activités (précisez)'),
        O('a_trafic', 'Trafic des ports de commerce : vracs liquides et solides (tonnes), marchandises conventionnelles, véhicules, passagers (croisières, ferries)', 'textarea'),
        O('a_peche', 'Port de pêche : tonnage, criée', w=2), O('a_plaisance', 'Port de plaisance : nombre d\'anneaux, sous-traité ou concédé', w=2),
        RO('a_arsenal', 'Arsenal', w=2), RO('a_reparation', 'Réparation navale (cale de halage, élévateur, dock flottant, engins d\'assèchement)', w=2),
        O('a_reparation_detail', 'Réparation navale : activités sous-traitées et conditions de sous-traitance', show=oui('a_reparation')),
        O('a_services_portuaires', 'Services portuaires exercés : pilotage, remorquage, lamanage, dragage'),
        O('a_consulaires', 'Collectivités concessionnaires : soutien aux entreprises, formation (nombre d\'élèves, CA spécifique)')],
      "Joignez en réponse au mail les conditions de mise à disposition des installations et de l'outillage portuaire, et la liste des "
      "installations et outillages exploités ou mis à disposition."),
    S([AUT], 'Garanties demandées', [
        RO('a_g_rc', 'Responsabilité civile générale du port', ONC),
        RO('a_g_usagers', "Responsabilité civile des usagers du port pour l'outillage mis à leur disposition", ONC),
        RO('a_g_atmp', 'Cotisations complémentaires dues au titre des accidents du travail et maladies professionnelles', ONC),
        O('a_incendie', 'Incendie et dégâts des eaux : assureur actuel et capitaux couverts'),
        RO('a_regime', "Exercez-vous vos activités dans le strict respect du décret n° 66-1078 du 31 décembre 1966 et de la loi n° 69-8 du 3 janvier 1969 ?")]),
    # Ports de plaisance et marinas
    S([MAR], 'Le port', [
        F('p_pontons', 'Type de pontons', 'radio', o=['Fixes', 'Flottants', 'Les deux'], w=2),
        O('p_pontons_detail', 'Type, nombre, dimensions et valeur des pontons', w=2),
        RO('p_ferme', 'Le site est-il fermé au public en dehors des heures d\'ouverture ?'),
        RO('p_surveillance', 'Clôture, gardiennage ou vidéosurveillance ?', w=2), O('p_surveillance_detail', 'Précisez', w=2, show=oui('p_surveillance'), s='Clôture, gardiennage – détail'),
        RO('p_acces', 'Accès aux pontons contrôlé (code, clés, badges) ?', w=2), O('p_acces_detail', 'Précisez', w=2, show=oui('p_acces'), s='Accès aux pontons – détail'),
        O('p_personnel', 'Fonction du personnel (maître de port, administratif, agents…)'),
        RO('p_incendie', 'Procédure de prévention et de lutte contre l\'incendie ?', w=2),
        O('p_pompiers', 'Distance de la caserne de pompiers la plus proche', w=2)]),
    S([MAR], 'Services à couvrir', [
        RO('p_flot', 'Location de places à flot', w=2),
        O('p_flot_detail', "Nombre d'anneaux (dont plus de 20 m) et valeur maximale des unités (€)", w=2, show=oui('p_flot')),
        RO('p_terre', 'Location de places à terre', w=2),
        O('p_terre_detail', 'Nombre de places, valeur moyenne et cumulée des unités (€), surveillance', w=2, show=oui('p_terre')),
        RO('p_port_sec', 'Projet de port à sec (ascenseur à bateaux) ?', show=oui('p_terre')),
        RO('p_cale', 'Gestion d\'une cale de halage', w=2), O('p_cale_ca', 'Cale de halage : CA (€)', 'number', w=2, show=oui('p_cale')),
        RO('p_manutention', 'Mise à l\'eau, mise à sec', w=2),
        O('p_manutention_detail', 'Sous-traitée ? CA (€), type et âge des moyens, contrôle des équipements, qualification des agents',
          'textarea', show=oui('p_manutention')),
        RO('p_entretien', 'Entretien des pontons et des chaînes de mouillage', w=2), RO('p_bers', 'Mise à disposition de bers', w=2),
        RO('p_calage', 'Le port peut-il être responsable des moyens de calage ?'),
        RO('p_carenage', 'Aire de carénage', w=2),
        O('p_carenage_detail', 'Récupération des eaux usées ? Déclaration ou autorisation ICPE ?', w=2, show=oui('p_carenage')),
        RO('p_dragage', 'Opérations de dragage', w=2), RO('p_carburant', 'Station de carburant', w=2),
        O('p_carburant_ca', 'Station de carburant : CA (€)', 'number', w=2, show=oui('p_carburant')),
        RO('p_fluides', "Fourniture et vente d'électricité et d'eau potable", w=2),
        RO('p_parkings', 'Gestion de parkings privatifs', w=2),
        O('p_parkings_detail', 'Parkings : CA (€), activité déléguée ?', w=2, show=oui('p_parkings'))]),
    S([SRV, MAR], 'Autres services', [
        RO('o_commercial', 'Location d\'espaces à usage commercial', w=2),
        O('o_commercial_detail', 'Décrivez l\'activité ; l\'obligation d\'assurance pèse-t-elle sur le port ?', 'textarea', show=oui('o_commercial')),
        RO('o_unites', 'Utilisation d\'unités de navigation', w=2),
        O('o_unites_detail', 'Nombre, type, âge, caractéristiques et valeur des unités', 'textarea', show=oui('o_unites')),
        RO('o_dechets', 'Collecte de déchets ou de matières dangereuses', w=2),
        O('o_dechets_detail', 'Stockage dédié des matières dangereuses ? Zone ICPE sur le site ?', show=oui('o_dechets')),
        RO('o_plongee', 'Plongées (carénages, entretien du port)', w=2), RO('o_remorquage', 'Remorquage, pilotage', w=2),
        RO('o_club', 'Club nautique', w=2), RO('o_feux', 'Organisation de feux d\'artifice', w=2),
        O('o_complementaires', 'Précisions sur ces activités et autres activités complémentaires')]),
    # Chantiers navals
    S([CHA], 'Construction et réparation', [
        O('c_ca', "CA TTC des 5 dernières années : construction, réparation et entretien, CA sous-traité, achats fournisseurs",
          'textarea', ph='Ex. N-1 : construction 800 000 €, réparation 400 000 €…'),
        O('c_previsions', 'Prévisions pour les 12 mois à venir'),
        RO('c_classification', 'La construction est-elle suivie par une société de classification ?', w=2),
        O('c_classification_nom', 'Laquelle ?', w=2, show=oui('c_classification')),
        O('c_soustraitants', 'Sous-traitants (au moins 5 % de la sous-traitance) : nom, date de début, capital RC garanti (€)', 'textarea'),
        O('c_fournisseurs', 'Principaux fournisseurs', 'textarea'),
        O('c_negoce', 'Négoce, CA des 5 dernières années : bateaux neufs (compte propre ou de tiers), occasion, magasin, entretien', 'textarea'),
        O('c_types', "Type d'unités construites et durée de construction", w=2), O('c_cadence', 'Cadence de production', w=2),
        O('c_valeur', 'Valeur finale par type d\'unité (€)', w=2), O('c_simultanes', 'Nombre de navires construits en même temps', w=2),
        O('c_cumul', 'Valeur cumulée en risque sur un même site (€)', 'number', w=2),
        O('c_reparations', 'Réparations effectuées (coque, moteur, révisions, changements de moteur ou d\'hélices…)', 'textarea'),
        O('c_valeur_reparees', 'Valeur maximale des unités réparées (€)', 'number', w=2),
        O('c_concession', 'Marques vendues en concession', w=2, h='Joignez les contrats de concession.'),
        O('c_garde', 'Concession, gardiennage, navires en attente de vente : nombre d\'unités à flot et sous hangar, capital en risque (€)', 'textarea'),
        O('c_levage', 'Engins de levage : type et marque, année, entretien, puissance de levage, valeur (€)', 'textarea'),
        O('c_engins', 'Engins navals du chantier : type et marque, année, entretien, valeur (€)', 'textarea'),
        O('c_incendie', 'Incendie et dégâts des eaux : déjà couverts ? capitaux (€)')]),
    S([CHA], 'Garanties demandées', [
        RO('c_g_bateaux', 'Dommages aux bateaux en cours de construction', ONC),
        RO('c_g_flot', 'RC bateaux à flot, séjours, essais ou démonstrations', ONC),
        RO('c_g_exploitation', 'RC du chef d\'entreprise, exploitation à terre', ONC),
        RO('c_g_livraison', 'RC après livraison', ONC),
        RO('c_g_atmp', 'Cotisations complémentaires accidents du travail et maladies professionnelles', ONC)]),
    # Armateurs portuaires
    S([ARM], 'Vos navires', [
        O('r_navires', 'Pour chaque navire : nom, type, date d\'acquisition, dimensions (longueur, largeur, creux), TJB, TPL, puissance, valeur (€), pavillon, port d\'attache',
          'textarea', h='Vous pouvez aussi joindre un fichier détaillé en réponse au mail.'),
        O('r_construction', 'Construction : année, chantier, pays, équipement CO2, nombre de passagers', 'textarea'),
        O('r_moteur', 'Moteur : marque, puissance totale, année d\'origine, rénovation, type (lent, semi-rapide, rapide), construit sous licence', 'textarea'),
        O('r_navigation', 'Trafic (tramp ou pro) et zones de navigation', 'textarea'),
        O('r_classification', 'Classification : société, date d\'expiration, garantie constructeur, dry-docking', 'textarea'),
        RO('r_changement_classif', 'Changement de société de classification ?', w=2),
        O('r_changement_detail', 'Date et raison', w=2, show=oui('r_changement_classif')),
        RO('r_extension', 'Extension de la classification précédente ?', w=2),
        O('r_extension_duree', 'Pour combien de temps ?', w=2, show=oui('r_extension')),
        O('r_maintenance', 'Coût moyen de maintenance sur 5 ans et pour l\'année en cours (€)', w=2),
        O('r_directeur', 'Directeur technique : nom et coordonnées', w=2)]),
    S([ARM], 'Exploitation', [
        O('r_marchandises', 'Types de marchandises transportées'),
        RO('r_autre_trafic', 'Navires utilisés pour un autre trafic que celui prévu ?', w=2),
        RO('r_dangereuses', 'Transport de marchandises dangereuses ?', w=2, alerte=1),
        RO('r_affretes', 'Les navires sont-ils affrétés ?', w=2),
        O('r_affretes_detail', 'Depuis quand, par qui, à temps ou au voyage ?', w=2, show=oui('r_affretes')),
        RO('r_obligatoire', 'Selon le pavillon, l\'assurance est-elle obligatoire ?', w=2), RO('r_convertis', 'Navires convertis ?', w=2),
        RO('r_stockage', 'Navires utilisés comme navires de stockage ?', w=2), RO('r_desarmes', 'Navires désarmés plusieurs mois ?', w=2),
        O('r_desarmes_detail', 'Durée et lieu', show=oui('r_desarmes')),
        O('r_precisions', 'Autres précisions', 'textarea')]),
    # Affréteurs
    S([AFF], 'Vos affrètements', [
        O('f_annees', 'Depuis combien d\'années affrétez-vous des navires ?', w=2),
        F('f_marchandises_de', 'Vous transportez', 'radio', o=['Surtout des marchandises de tiers', 'Surtout vos propres marchandises'], w=2, req=0),
        O('f_activite', 'Activité commerciale habituelle (liner, tramping…)', 'textarea'),
        O('f_chargement', 'Ports de chargement habituels', w=2), O('f_dechargement', 'Ports de déchargement habituels', w=2),
        O('f_nature', 'Nature des marchandises transportées', 'textarea'),
        O('f_nb', 'Nombre de navires affrétés par an', 'number', w=3), O('f_grt', 'Tonnage brut (GRT) moyen', w=3),
        O('f_duree', 'Durée habituelle des affrètements', w=3),
        O('f_navires', 'Navires affrétés sur les 12 derniers mois : nom, année, pavillon, GRT, DWT, marchandises, ports, durée, charte-partie',
          'textarea', h='Vous pouvez aussi joindre un fichier détaillé en réponse au mail.'),
        O('f_previsions', 'Activités d\'affrètement prévues sur les 12 prochains mois', 'textarea'),
        O('f_chartes', 'Formulaires de charte-partie utilisés', h='Joignez les « rider clauses » utilisées.'),
        RO('f_connaissements', 'Émettez-vous ou signez-vous des connaissements ?', w=2),
        RO('f_combine', 'Connaissements de transport combiné ?', w=2),
        O('f_combine_detail', 'Précisez', show=oui('f_combine'), s='Transport combiné – détail'),
        O('f_garanties_actuelles', 'Contrat actuel : limites de garantie et franchises (défense, responsabilité, corps, marchandises, P&I)', 'textarea')]),
    # Navires à passagers
    S([PAS], 'Votre activité', [
        O('n_zones', 'Zones d\'activité', ph='Ex. Martinique, Guadeloupe'),
        RO('n_promenades', 'Promenades', w=2), O('n_promenades_detail', 'Rotations par jour (maximum) et durée', w=2, show=oui('n_promenades')),
        RO('n_peche', 'Pêche en mer', w=2), O('n_peche_detail', 'Matériel de pêche mis à disposition ? Valeur (€)', w=2, show=oui('n_peche')),
        RO('n_plongee', 'Support de plongée', w=2), O('n_plongee_detail', 'Matériel de plongée mis à disposition ? Valeur (€)', w=2, show=oui('n_plongee')),
        RO('n_skipper', 'Location avec skipper', w=2), O('n_autre', 'Autre activité', w=2),
        O('n_anciennete', 'Ancienneté dans l\'activité', w=2),
        F('n_inscrit', 'Armateur inscrit maritime ?', 'radio', o=ON, w=2, req=0)]),
    S([PAS], 'Navires et équipage', [
        O('n_navires', "Pour chaque navire : nom, immatriculation, type, port d'attache, année et chantier de construction, matériau, longueur, "
                       "largeur, TJB, GT, catégorie de navigation (1 à 5), zones et période de navigation, lieu de séjour", 'textarea',
          h='Joignez le certificat de sécurité pour navires à passagers. Vous pouvez aussi joindre un fichier détaillé.'),
        O('n_equipage', "Par navire : passagers maximum (permis de navigation), membres d'équipage, inscrits maritimes, qualification, "
                        "expérience et brevet du skipper", 'textarea'),
        O('n_moteurs', 'Moteurs : nombre, marque, puissance, année, rénovation, hors-bord ou inboard', 'textarea'),
        O('n_entretien', 'Entretien : dernier carénage, chantier, nature et montant des travaux, expertise (date, lieu, expert)', 'textarea'),
        RO('n_rapides', 'Exploitez-vous des vedettes, semi-rigides ou pneumatiques à vitesse rapide ?'),
        O('n_rapides_detail', "Vitesse maximale, déplacement, assises individuelles orientées vers l'avant avec maintien, équipements "
                              "individuels de flottabilité", 'textarea', show=oui('n_rapides'), h="Joignez une photo ou une brochure de l'embarcation."),
        RO('n_hypotheque', 'Un navire fait-il l\'objet d\'une hypothèque ?', w=2),
        O('n_hypotheque_detail', 'Montant de la créance et organisme', w=2, show=oui('n_hypotheque')),
        O('n_valeur', 'Valeur d\'assurance de chaque navire (€)'),
        RO('n_deces', 'Option décès et invalidité permanente des marins', ONC)]),
    # Garanties communes
    S([SRV, MAN, MAR], 'Montant et garanties complémentaires', [
        F('plafond_a', 'Montant de garantie souhaité par événement et par année', 'select',
          o=['1 000 000 €', '2 000 000 €', '3 000 000 €', '4 000 000 €', '5 000 000 €', 'À me conseiller'], w=2, show=M(SRV, MAR)),
        F('plafond_b', 'Montant de garantie souhaité par événement et par année', 'select',
          o=['2 500 000 €', '5 000 000 €', '7 500 000 €', '10 000 000 €', 'À me conseiller'], w=2, show=M(MAN), s='Montant de garantie souhaité'),
        RO('g_autorites', 'Responsabilité vis-à-vis des autorités', ONC, w=2, show=M(SRV)),
        RO('g_fie', "Faute inexcusable de l'employeur", ONC, w=2),
        RO('g_biens', 'Dommages aux biens', ONC, w=2),
        RO('g_bdm', 'Bris de machines des équipements portuaires en propriété', ONC, w=2, show=M(MAN, MAR)),
        RO('g_vehicules', 'Dommages aux véhicules (hors véhicules légers)', ONC, w=2, show=M(MAN, MAR)),
        RO('g_maritimes', 'Dommages aux biens à vocation maritime (pontons, flottants, passerelles)', ONC, w=2, show=M(MAR))],
      'Selon vos choix, un questionnaire complémentaire vous sera adressé.'),
    antecedents(5), fin()]
# Libellé envoyé du montant : identique pour les deux listes
mar[-3]['f'][0]['s'] = 'Montant de garantie souhaité'

PDF_MAR = [
    ["consignataires, agents maritimes et courtiers d'affrètement", CDN % (S0, 'Eloy_Questionnaire_Services_Maritimes.pdf'), SRV],
    ['entreprises de manutention portuaire et opérateurs de terminaux', CDN % (S0, 'Eloy_Questionnaire_Manutention_Portuaire.pdf'), MAN],
    ['autorités portuaires et gestionnaires de ports', CDN % (S0, 'Eloy_Questionnaire_Autorites_Portuaires.pdf'), AUT],
    ['ports de plaisance et marinas', CDN % (S0, 'Eloy_Questionnaire_Ports_Plaisance_Marinas.pdf'), MAR],
    ['chantiers navals', CDN % (S0, 'Eloy_Questionnaire_Chantiers_Navals.pdf'), CHA],
    ['armateurs portuaires', CDN % (S0, 'Eloy_Questionnaire_Armateur_Portuaire.pdf'), ARM],
    ['affréteurs de navires', CDN % (S0, 'Eloy_Questionnaire_Affreteur_Navire.pdf'), AFF],
    ['armateurs de navires à passagers', CDN % (S0, 'Eloy_Questionnaire_Navires_Passagers.pdf'), PAS]]

Q['maritime'] = base(
    'Assurance maritime et portuaire', 'Maritime', 'Questionnaire maritime et portuaire',
    'Assurance maritime et portuaire (pro)', 'assurance maritime et portuaire', 'Votre devis Assurance maritime et portuaire',
    ['Assurance maritime et portuaire', 'Assurance maritime et portuaire (pro)'],
    "Ces informations me permettent d'étudier l'assurance de votre activité maritime ou portuaire. Les questions s'adaptent à votre "
    "métier ; les détails techniques sont facultatifs, vous pouvez aussi les joindre en fichier. Comptez environ 15 minutes.",
    mar, PDF_MAR,
    [['Les documents pour l\'étude', ['extrait Kbis de moins de 3 mois', 'le plan des sites, s\'il y a lieu',
                                      'la statistique de sinistres de votre assureur actuel, si vous êtes déjà assuré']],
     ['Selon votre métier', ["vos conditions générales de vente, contrats d'agence ou chartes-parties",
                             "la convention d'occupation du domaine portuaire et la liste de vos équipements",
                             'la liste de vos navires et leurs certificats (sécurité, classification)']]],
    pdfSelon='votre métier')


# ---------- Contrôles ----------
BAD = 0
def eff(f):
    return f.get('s') or re.sub(r' \((m²|€|%)\)$', '', f['l'])


for cle, q in Q.items():
    keys, labs = {}, {}
    for s in q['sections']:
        for f in s['f']:
            assert f['k'] not in keys, (cle, f['k'])
            keys[f['k']] = f
            labs.setdefault(eff(f), []).append(f)
    for k, f in keys.items():
        if f.get('show'):
            for x in f['show'][0].split('|'):
                assert x in keys, (cle, k, x)
            vals = f['show'][1] if isinstance(f['show'][1], list) else [f['show'][1]]
            for x in f['show'][0].split('|'):
                src = keys[x]
                if src.get('o'):
                    for v in vals: assert v in src['o'], (cle, k, v)
    # Libellés envoyés : uniques, sauf champs exclusifs (même libellé volontaire)
    for l, fs in labs.items():
        if len(fs) > 1 and not (cle == 'maritime' and l == 'Montant de garantie souhaité'):
            print('DOUBLON', cle, l, [f['k'] for f in fs]); BAD = 1

if BAD: raise SystemExit('libellés en double')
d = json.load(open(P, encoding='utf-8'))
for k, v in Q.items():
    d[k] = v
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: sum(len(s['f']) for s in v['sections']) for k, v in Q.items()})
