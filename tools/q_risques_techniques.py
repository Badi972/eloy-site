#!/usr/bin/env python3
"""Questionnaires en ligne construction et risques techniques (20/11/2026), repris des questionnaires PDF Eloy
(tools/pdfq/q_construction_pro.py, q_trc_montage.py, q_bris_machine.py, q_engins.py, q_photovoltaique.py,
q_methanisation.py, q_hydroelectricite.py). Les tableaux des PDF deviennent des zones de texte libres.
Écrit les entrées construction, trc, bdm, engins, enr dans tools/questionnaires.json.
Usage : python3 tools/q_risques_techniques.py"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
CDN = 'https://cdn.jsdelivr.net/gh/Badi972/eloy-site@%s/dist/docs/%s'
S1, S2 = 'b09190813db87ef50bb7bc7c48861bd5ba492b99', '8c1a0f699ddd59a50877267e9549776dc21e9beb'
S3 = '364aeb3'  # commit des PDF complétés (Albingia, 20/11/2026)
ON = ['Oui', 'Non']
ONC = ['Oui', 'Non', 'À me conseiller']


def F(k, l, t=None, req=1, **kw):
    f = {'k': k, 'l': l, 'req': req}
    if t: f['type'] = t
    f.update(kw)
    return f


def R(k, l, o=ON, **kw):
    return F(k, l, 'radio', o=o, **kw)


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


def ca_effectif():
    return [F('ca', 'Chiffre d\'affaires annuel (€)', 'number', w=2), F('effectif', 'Effectif', 'number', w=2)]


def antecedents(procedure=False):
    pc = [R('procedure', 'Avez-vous fait l\'objet d\'un redressement ou d\'une liquidation judiciaire au cours des 3 dernières années ?', alerte=1),
          F('procedure_detail', 'Situation aujourd\'hui (plan de continuation, rachat…)', show=oui('procedure'))] if procedure else []
    return {'t': 'Vos antécédents', 'f': pc + [
        R('deja_assure', 'Êtes-vous déjà assuré pour ces risques ?'),
        F('assureur', 'Nom de votre assureur actuel', w=2, show=oui('deja_assure')),
        F('echeance', 'Échéance du contrat actuel', 'date', req=0, w=2, show=oui('deja_assure')),
        R('resilie', 'Un assureur a-t-il résilié ou majoré votre contrat (sinistres ou non-paiement) ?', alerte=1),
        F('motif_resiliation', 'Motif', show=oui('resilie')),
        R('sinistres', 'Avez-vous eu des sinistres sur ces risques au cours des 5 dernières années ?', alerte=1),
        F('sinistres_detail', 'Pour chacun : année, nature et circonstances, coût total', 'textarea', show=oui('sinistres'),
          h='Vous pouvez aussi joindre la statistique de sinistres de votre assureur en réponse au mail.'),
        R('mesures', 'Avez-vous pris des mesures pour éviter un nouveau sinistre de même nature ?', show=oui('sinistres')),
        F('mesures_detail', 'Lesquelles ?', show=oui('mesures'))]}


def fin():
    return {'t': 'Informations complémentaires', 'f': [
        F('complement', 'Autres informations utiles à l\'étude de votre dossier', 'textarea', req=0)]}


def base(titre, court, demande, produit, mail, sujet, decl, intro, sections, pdf, pieces=None):
    q = {'titre': titre, 'court': court, 'demande': demande, 'produit': produit, 'mail': mail, 'sujet': sujet,
         'declencheurs': decl, 'intro': intro, 'sections': sections, 'pdf': pdf}
    if pieces: q['pieces'] = pieces
    return q


def decl(label):
    return [label, label + ' (pro)']


Q = {}

# ---------- Construction des maîtres d'ouvrage ----------
GC = ['Maître d\'ouvrage', 'Promoteur immobilier', 'Marchand de biens', 'SCI ou investisseur', 'Autre']
Q['construction'] = base(
    "Assurance construction des maîtres d'ouvrage professionnels", 'Construction', 'Questionnaire assurance construction',
    "Assurance construction des maîtres d'ouvrage (pro)", 'assurance construction', 'Votre devis Assurance construction',
    decl("Assurance construction des maîtres d'ouvrage"),
    "Ces informations me permettent d'étudier votre opération : dommages-ouvrage, tous risques chantier, constructeur non réalisateur "
    "et contrat collectif de responsabilité décennale. Gardez vos devis et le permis de construire à portée de main. Comptez environ 15 minutes.",
    [entreprise([F('qualite_mo', 'Vous agissez en qualité de', 'select', o=GC, w=2)]), vous(), kyc(),
     {'t': 'Garanties demandées', 'f': [
         R('g_do', 'Dommages-ouvrage', ONC, w=2), R('g_cnr', 'Constructeur non réalisateur (avec la dommages-ouvrage)', ONC, w=2),
         R('g_trc', 'Tous risques chantier et montage-essais', ONC, w=2),
         R('g_ccrd', 'Contrat collectif de responsabilité décennale (avec la dommages-ouvrage)', ONC, w=2),
         R('g_bdm', 'Étude bris de machine pour l\'exploitation des équipements, après la réception', ONC)]},
     {'t': "L'opération", 'f': [
         F('destination', 'Destination', 'select', o=['Industriel', 'Commercial', 'Bureaux', 'Logements', 'Enseignement',
                                                       'Établissement de soins, EHPAD', 'Autre'], w=2),
         F('usage', 'Usage', 'select', o=['Propre', 'Vente', 'Location'], w=2),
         F('destination_autre', 'Précisez la destination', show=['destination', 'Autre']),
         F('nature', 'Nature des travaux', 'select', o=['Neufs, sans travaux sur existants', 'Rénovation légère (sans toucher à la structure ni au clos et couvert)',
                                                         'Rénovation lourde (avec intervention sur la structure ou le clos et couvert)']),
         F('description', 'Description des travaux (nombre de bâtiments, d\'étages, surfaces…)', 'textarea'),
         F('adresse_chantier', 'Adresse du chantier'), F('cp_chantier', 'Code postal', 'cp', w=3), F('ville_chantier', 'Ville', w=23),
         R('p_mi', 'L\'opération comprend-elle des maisons individuelles ?', alerte=1, w=2),
         R('p_accession', 'Des logements en accession à la propriété, même pour une partie de l\'ouvrage ?', alerte=1, w=2),
         R('p_mh', 'Un monument historique ?', alerte=1, w=2), R('p_piscine', 'Une piscine ou un spa ?', w=2),
         R('p_sport', 'Des équipements sportifs ?', w=2), R('p_solaire', 'Des panneaux solaires ?', w=2),
         R('voisins', 'Y a-t-il des bâtiments voisins à moins de 10 m de la construction ?'),
         R('v_av', 'Mission de contrôle technique « avoisinants » (AV) ?', show=oui('voisins'), w=2),
         R('v_refere', 'Référé préventif ?', show=oui('voisins'), w=2),
         R('v_constat', "Constat de commissaire de justice (huissier) ?", show=oui('voisins'), w=2)]},
     {'t': 'Coût prévisionnel de l\'opération', 'd': 'Montants hors taxes, en euros.', 'f': [
         F('c_travaux', 'Travaux tous corps d\'état, VRD compris (€ HT)', 'number', w=2),
         F('c_honoraires', 'Honoraires (architecte, maître d\'œuvre, bureaux d\'études, étude de sols, contrôle technique) (€ HT)', 'number', w=2),
         F('c_equipements', 'Équipements industriels, transport, montage et essais compris (€ HT)', 'number', req=0, w=2, h='Indiquez 0 s\'il n\'y en a pas.'),
         F('c_ingenierie', 'Honoraires d\'ingénierie des équipements industriels (€ HT)', 'number', req=0, w=2),
         R('tva', 'Le maître d\'ouvrage récupère-t-il la TVA ?', h='S\'il ne la récupère pas, le contrat est établi sur les montants TTC.')]},
     {'t': 'Planning', 'f': [
         F('permis', 'N° du permis de construire', req=0, w=2), F('permis_date', 'Date du permis', 'date', req=0, w=2),
         F('doc', 'Date de déclaration d\'ouverture de chantier', 'date', w=2), F('debut', 'Début des travaux', 'date', w=2),
         F('reception', 'Réception prévisionnelle', 'date', w=2), F('duree', 'Durée des travaux (mois)', 'number', w=2),
         R('equip', 'L\'opération comprend-elle le montage d\'équipements industriels ?'),
         F('montage', 'Dates de montage des équipements (du … au …)', show=oui('equip'), w=2),
         F('essais', 'Dates des essais à chaud ou en charge (du … au …)', show=oui('equip'), w=2)]},
     {'t': 'Les intervenants', 'f': [
         R('mo_diff', 'Le maître d\'ouvrage est-il une autre société que la vôtre ?'),
         F('mo_detail', 'Maître d\'ouvrage : dénomination, adresse, SIREN', 'textarea', show=oui('mo_diff')),
         R('mo_moe', 'Le maître d\'ouvrage assure-t-il lui-même des missions de maîtrise d\'œuvre ?', w=2),
         R('mo_travaux', 'Réalise-t-il lui-même des travaux ?', w=2),
         F('mo_detail2', 'Lesquels, et pour quel montant ?', show=['mo_moe|mo_travaux', 'Oui']),
         R('moe', 'Un maître d\'œuvre (ou architecte) est-il missionné ?', w=2),
         R('bet', 'Un bureau d\'études techniques est-il missionné ?', w=2),
         F('concepteurs', 'Pour chacun : nom, études ou lots, mission (conception, direction, suivi), assureur et n° de contrat', 'textarea', show=['moe|bet', 'Oui']),
         R('sols', 'Un bureau d\'étude de sols est-il missionné ?'),
         F('sols_detail', 'Nom, mission (G1, G2 AVP, G2 PRO, G3, G4, G5, hydrogéologie), assureur', 'textarea', show=oui('sols')),
         F('marche', 'Type de marché', 'select', o=['Entreprise générale', 'Contractant général', 'Lots séparés', 'Pas encore choisi']),
         F('entreprises', 'Entreprises retenues : nom, nature des travaux, montant du marché, assureur décennale', 'textarea', req=0,
           h='Si elles ne sont pas encore choisies, laissez vide : la liste sera demandée avant l\'ouverture du chantier.')]},
     {'t': 'Mode d\'exécution des travaux', 'f': [
         R('e_existants', 'Travaux sur existants modifiant les reports de charges, les fondations ou des éléments porteurs ?'),
         R('e_fondations', 'Création de fondations ou d\'éléments porteurs ?'),
         R('e_bet_structure', 'Un bureau d\'études structure est-il missionné pour définir le mode constructif ?', show=['e_existants|e_fondations', 'Oui']),
         R('e_tassement', 'Le tassement maximum indiqué par l\'étude de sol est-il inférieur à 1,5 cm ?', ['Oui', 'Non', 'Je ne sais pas']),
         R('e_nphe', 'Le plancher le plus bas est-il au-dessus du niveau des plus hautes eaux ?', ['Oui', 'Non', 'Je ne sais pas']),
         R('e_parking', 'Si non, cela concerne-t-il uniquement un parking ?', show=['e_nphe', 'Non']),
         F('e_argile', 'Zone de risque argile', 'select', o=['Nul ou B1', 'B2 ou B3', 'Je ne sais pas'], w=2),
         F('e_sismique', 'Zone de sismicité', 'select', o=['5 (Antilles)', '3 ou 4', '1 ou 2', 'Je ne sais pas'], w=2),
         R('e_parasismique', 'Les mesures parasismiques réglementaires sont-elles prises ?'),
         R('e_courant', 'Les travaux sont-ils tous de technique courante (normes NF DTU ou NF EN, avis technique…) ?', ['Oui', 'Non', 'Je ne sais pas']),
         F('e_courant_detail', 'Quels travaux ne le sont pas ?', show=['e_courant', 'Non']),
         R('e_exceptionnel', 'Des travaux ont-ils un caractère exceptionnel (grande portée, hauteur, profondeur, capacité ou longueur) ?', alerte=1),
         F('e_exceptionnel_detail', 'Lesquels ?', show=oui('e_exceptionnel'))]},
     {'t': 'Options souhaitées', 'd': 'Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('o_maintenance', 'Tous risques chantier : maintenance étendue ou de 24 mois', ONC, w=2),
         R('o_existants', 'Dommages aux existants', ONC, w=2),
         R('o_engins', 'Matériels et engins de chantier', ONC, w=2),
         R('o_transport', 'Transport des matériaux et équipements', ONC, w=2),
         R('o_pertes', 'Pertes financières en cas de retard de livraison après un sinistre', ONC),
         F('o_marge', 'Pertes d\'exploitation anticipées : marge brute annuelle (€)', 'number', req=0, w=2, show=oui('o_pertes')),
         F('o_loyers', 'Pertes de loyers : montant annuel des baux (€)', 'number', req=0, w=2, show=oui('o_pertes')),
         F('o_intercalaires', 'Frais bancaires intercalaires sur 12 mois (€)', 'number', req=0, w=2, show=oui('o_pertes')),
         F('o_periode', 'Période d\'indemnisation', 'select', o=['6 mois', '12 mois', '18 mois'], w=2, show=oui('o_pertes')),
         R('o_rc', 'Responsabilité civile du maître d\'ouvrage', ONC, w=2),
         R('o_rc_tous', 'Responsabilité civile de tout intervenant', ONC, w=2),
         R('o_bon_fonct', 'Dommages-ouvrage : bon fonctionnement des équipements', ONC, w=2),
         R('o_immateriels', 'Dommages-ouvrage : dommages immatériels consécutifs', ONC, w=2),
         F('o_franchise', 'Franchise', 'select', o=['De base', 'Réduite', 'À me conseiller'], w=2)]},
     antecedents(), fin()],
    CDN % (S1, 'Eloy_Questionnaire_Construction_Maitres_Ouvrage.pdf'),
    [['Les documents pour l\'étude', ['le permis de construire', 'les plans et les devis détaillés ou le CCTP',
                                      'le rapport initial du contrôleur technique et l\'étude de sols, s\'il y en a',
                                      'avec des équipements industriels : schéma d\'implantation, planning et répartition des coûts']]])

# ---------- Tous risques chantier et montage-essais ----------
Q['trc'] = base(
    'Tous risques chantier et montage-essais', 'Tous risques chantier', 'Questionnaire tous risques chantier',
    'Tous risques chantier et montage-essais (pro)', 'assurance tous risques chantier et montage-essais', 'Votre devis Tous risques chantier',
    decl('Tous risques chantier et montage-essais'),
    "Ces informations me permettent d'étudier l'assurance de votre chantier, du montage et des essais jusqu'à la mise en service. "
    "Comptez environ 10 minutes.",
    [entreprise([F('qualite_trc', 'Vous êtes', 'select', o=['Maître d\'ouvrage', 'Entreprise générale ou de construction', 'Industriel',
                                                             'Installateur ou producteur d\'énergie', 'Autre'], w=2)] + ca_effectif()), vous(), kyc(),
     {'t': 'Le chantier', 'f': [
         R('mo_diff', 'Le maître d\'ouvrage (propriétaire de l\'ouvrage) est-il une autre société que la vôtre ?'),
         F('mo_detail', 'Maître d\'ouvrage : dénomination, adresse, SIREN', 'textarea', show=oui('mo_diff')),
         F('adresse_chantier', 'Adresse du chantier ou de l\'installation'), F('cp_chantier', 'Code postal', 'cp', w=3), F('ville_chantier', 'Ville', w=23),
         F('description', 'Description des travaux et des opérations de montage', 'textarea'),
         F('nature', 'Nature des travaux', 'select', o=['Neufs ou rénovation légère (sans toucher à la structure ni au clos et couvert)',
                                                         'Réhabilitation ou rénovation lourde (avec intervention sur la structure ou le clos et couvert)']),
         F('destination', 'Destination de l\'ouvrage', 'select', o=['Usage propre', 'Location', 'Vente ou accession à la propriété'], w=2),
         F('batiments', 'Nombre de bâtiments, d\'étages, de sous-sols et de logements', w=2, req=0),
         R('existants', 'Y a-t-il des travaux sur existants ou une reprise en sous-œuvre ?', w=2),
         R('diagnostic', 'Un diagnostic de l\'existant a-t-il été réalisé ?', show=oui('existants'), w=2),
         R('tnc', 'Les travaux font-ils appel à une technique non courante ?', alerte=1),
         F('environnement', 'Environnement du chantier', 'select', o=['Centre-ville', 'Zone d\'activité ou commerciale', 'Zone industrielle', 'Site isolé'], w=2),
         R('nappe', 'Y a-t-il de l\'eau dans le sol (nappe, remontées) ?', w=2),
         R('eau_proche', 'Le chantier est-il proche de la mer, d\'une rivière ou d\'un étang ?'),
         F('eau_distance', 'Distance et différence de hauteur entre le chantier et l\'eau', show=oui('eau_proche')),
         R('evnat', 'Le terrain est-il exposé à un risque naturel particulier (inondation, glissement de terrain) ?'),
         F('debut', 'Début des travaux', 'date', w=2), F('reception', 'Réception prévisionnelle', 'date', w=2),
         R('equip', 'Le chantier comprend-il le montage et les essais d\'équipements ?'),
         F('montage', 'Dates de montage (du … au …)', show=oui('equip'), w=2),
         F('essais', 'Dates des essais à chaud ou en charge (du … au …)', show=oui('equip'), w=2),
         R('usine', 'Le montage a-t-il lieu dans une usine en exploitation ?', show=oui('equip'), w=2),
         R('equip_neufs', 'Les équipements montés sont-ils neufs ?', show=oui('equip'), w=2),
         F('plus_gros', 'Valeur du plus gros équipement (€ HT)', 'number', req=0, show=oui('equip'), w=2)]},
     {'t': 'Coût prévisionnel des travaux', 'd': 'Montants hors taxes, en euros.', 'f': [
         F('c_travaux', 'Travaux tous corps d\'état, VRD compris (€ HT)', 'number', w=2),
         F('c_honoraires', 'Honoraires (architectes, bureaux d\'études, étude de sols, contrôle technique) (€ HT)', 'number', w=2),
         F('c_equipements', 'Équipements industriels, transport, montage et essais compris (€ HT)', 'number', req=0, w=2),
         F('c_ingenierie', 'Honoraires d\'ingénierie (€ HT)', 'number', req=0, w=2),
         R('moe', 'Un maître d\'œuvre est-il missionné ?', w=2), R('moe_complete', 'Sa mission est-elle complète (conception et suivi) ?', show=oui('moe'), w=2),
         R('ct_l', 'Contrôle technique de type L (solidité des ouvrages) ?', w=2),
         R('ct_le', 'Sur existants, contrôle technique de type LE ?', ['Oui', 'Non', 'Pas d\'existants'], w=2),
         R('sols', 'Un bureau d\'étude de sols est-il missionné ?'),
         F('sols_detail', 'Nom, mission (G1, G2 AVP, G2 PRO, G3, G4, G5, hydrogéologie), assureur', 'textarea', show=oui('sols'))]},
     {'t': 'Options souhaitées', 'd': 'La maintenance de 12 mois après la réception est comprise. Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('o_maintenance', 'Maintenance étendue, constructeur ou de 24 mois', ONC, w=2),
         R('o_existants', 'Dommages aux existants', ONC, w=2),
         F('o_existants_montant', 'Montant à garantir pour les existants (€)', 'number', req=0, show=oui('o_existants')),
         R('o_rc', 'Responsabilité civile du maître d\'ouvrage (maître d\'ouvrage uniquement)', ONC),
         R('o_pe', 'Pertes d\'exploitation anticipées (retard de mise en service après un sinistre)', ONC),
         F('o_marge', 'Marge brute annuelle prévisionnelle (€)', 'number', req=0, w=2, show=oui('o_pe')),
         F('o_periode', 'Période d\'indemnisation', 'select', o=['3 mois', '6 mois', '12 mois', '18 mois'], w=2, show=oui('o_pe')),
         R('o_tgv', 'Transport accéléré et heures supplémentaires, y compris par avion', ONC)]},
     antecedents(True), fin()],
    CDN % (S3, 'Eloy_Questionnaire_Tous_Risques_Chantier.pdf'),
    [['Les documents pour l\'étude', ['les plans et le schéma d\'implantation des équipements', 'le planning détaillé des travaux',
                                      'la répartition des coûts par lot ou par équipement',
                                      'le rapport du contrôleur technique et l\'étude de sols, s\'il y en a']]])

# ---------- Bris de machine ----------
Q['bdm'] = base(
    'Bris de machine : matériels, équipements et installations techniques', 'Bris de machine', 'Questionnaire bris de machine',
    'Assurance bris de machine (pro)', 'assurance bris de machine', 'Votre devis Bris de machine', decl('Assurance bris de machine'),
    "Ces informations me permettent d'étudier l'assurance de vos machines et, si vous le souhaitez, de votre production pendant un arrêt. "
    "Comptez environ 10 minutes.",
    [entreprise(), vous(), kyc(),
     {'t': 'Votre activité', 'f': ca_effectif() + [
         F('activite', 'Activité exercée et production réalisée sur le site', 'textarea'),
         F('sites', 'Adresse du ou des sites où sont installées les machines', 'textarea'),
         R('proprio_locaux', 'Êtes-vous propriétaire des locaux ?', w=2),
         R('renonciation', 'Le bail prévoit-il une renonciation à recours contre le propriétaire ?', show=['proprio_locaux', 'Non'], w=2),
         F('utilisation', 'Durée d\'utilisation des machines par jour et nombre d\'équipes', w=2),
         R('continu', 'Fonctionnement en continu, jour et nuit ?', w=2)]},
     {'t': 'Les machines à assurer', 'f': [
         F('nb_machines', 'Nombre de machines ou d\'installations', 'number', w=2),
         F('valeur_totale', 'Valeur totale de remplacement à neuf (€ HT)', 'number', w=2,
           h='Prix d\'achat de machines neuves identiques, transport, montage et essais compris.'),
         F('machines', 'Pour chaque machine : désignation, marque et modèle, n° de série, année de mise en service, valeur à neuf HT', 'textarea',
           h='Vous pouvez aussi envoyer la liste ou les factures en réponse au mail.'),
         R('credit_bail', 'Certaines machines sont-elles en crédit-bail ou en location-vente ?'),
         F('financeurs', 'Lesquelles, et organisme de financement', show=oui('credit_bail')),
         R('location', 'Certaines machines sont-elles prises en location ?'),
         F('loueurs', 'Lesquelles, nom du loueur et durée du contrat', show=oui('location')),
         R('maintenance', 'Les machines ont-elles un contrat de maintenance ?'),
         F('maintenance_detail', 'Lesquelles, et avec quel prestataire ?', show=oui('maintenance')),
         R('revision', 'Les machines sont-elles révisées régulièrement ?', w=2),
         F('revision_qui', 'Par qui ? (technicien interne, constructeur, prestataire)', show=oui('revision'), w=2),
         R('garantie_constructeur', 'Certaines machines sont-elles encore sous garantie du constructeur ?'),
         R('experimental', 'Certaines machines ont-elles un caractère expérimental (prototype) ?', alerte=1),
         F('experimental_detail', 'Lesquelles ?', show=oui('experimental'))]},
     {'t': 'Options souhaitées', 'd': 'Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('o_externe', 'Dommages d\'origine externe (choc, chute, incendie, dégâts des eaux…)', ONC, w=2),
         R('o_deplacement', 'Démontage, déplacement et transport des machines', ONC, w=2),
         R('o_frais', 'Frais supplémentaires (location ou sous-traitance pendant l\'arrêt)', ONC, w=2),
         R('o_fondations', 'Fondations, massifs et socles', ONC, w=2),
         R('o_transport', 'Transport accéléré et heures supplémentaires', ONC, w=2),
         R('o_reconstitution', 'Frais de reconstitution des informations', ONC, w=2),
         R('o_expert', 'Honoraires de votre expert', ONC, w=2),
         R('o_pe', 'Pertes d\'exploitation pendant l\'arrêt d\'une machine', ONC, w=2),
         F('o_marge', 'Marge brute annuelle (€)', 'number', req=0, w=2, show=oui('o_pe')),
         F('o_periode', 'Période d\'indemnisation', 'select', o=['6 mois', '12 mois'], w=2, show=oui('o_pe')),
         F('o_goulot', 'Machines dont l\'arrêt bloque la production : part de la marge qui en dépend, délai maximum de réparation ou de remplacement',
           'textarea', req=0, show=oui('o_pe'))]},
     antecedents(True), fin()],
    CDN % ('252885c', 'Eloy_Questionnaire_Bris_de_Machine.pdf'),
    [['Les documents pour l\'étude', ['la liste des machines ou les factures d\'achat', 'le schéma d\'implantation des équipements',
                                      'pour les pertes d\'exploitation : le détail de la marge brute']]])

# ---------- Engins et matériels mobiles ----------
Q['engins'] = base(
    'Engins et matériels mobiles', 'Engins', 'Questionnaire engins et matériels mobiles',
    'Assurance engins et matériels mobiles (pro)', 'assurance des engins et matériels mobiles', 'Votre devis Engins et matériels mobiles',
    decl('Assurance engins et matériels mobiles'),
    "Ces informations me permettent d'étudier l'assurance de vos engins, qu'ils vous appartiennent, soient financés ou pris en location. "
    "Comptez environ 10 minutes.",
    [entreprise(), vous(), kyc(),
     {'t': 'Votre activité et la formule', 'f': ca_effectif() + [
         F('activite', 'Activité', 'select', o=['BTP et terrassement', 'Levage et manutention', 'Manutention portuaire', 'Transport et logistique',
                                                 'Voirie', 'Espaces verts', 'Location de matériel', 'Collectivité locale', 'Autre'], w=2),
         F('activite_autre', 'Précisez', show=['activite', 'Autre'], w=2),
         R('f_propres', 'Faut-il assurer vos engins, en propriété ou financés ?', w=2),
         R('f_loues', 'Faut-il assurer des engins que vous prenez en location ?', w=2),
         F('cout_location', 'Coût annuel de location (€)', 'number', show=oui('f_loues'), w=2),
         R('f_loueur', 'Êtes-vous loueur (parc donné en location) ?', w=2),
         F('ca_location', 'Chiffre d\'affaires annuel de location (€)', 'number', show=oui('f_loueur'), w=2)]},
     {'t': 'Vos engins', 'f': [
         F('nb_engins', 'Nombre d\'engins', 'number', w=2), F('valeur_totale', 'Valeur totale à neuf (€)', 'number', w=2),
         F('ht_ttc', 'Valeurs indiquées', 'select', o=['HT', 'TTC'], w=2),
         F('engins', 'Pour chaque engin : désignation, marque et type, n° de série ou d\'immatriculation, valeur à neuf, mise en service, '
                     'propriété ou crédit-bail', 'textarea', h='Vous pouvez aussi envoyer la liste ou les factures en réponse au mail.'),
         F('sites', 'Adresse du ou des sites où les engins sont garés', 'textarea'),
         R('location_tiers', 'Des engins sont-ils donnés en location à des tiers ?', w=2),
         R('maintenance', 'Les engins ont-ils un contrat de maintenance ?', w=2),
         R('experimental', 'Certains engins ont-ils un caractère expérimental (prototype) ?', alerte=1),
         F('financeurs', 'Organismes de financement (nom et adresse), si des engins sont financés', req=0),
         R('traceur', 'Les engins sont-ils équipés d\'un traceur (géolocalisation) ?', ['Oui', 'Non', 'Certains'], w=2),
         F('vol', 'Protection contre le vol (parc fermé, gardiennage, antivol, géolocalisation…)', 'textarea')]},
     {'t': 'Formule et options souhaitées', 'd': 'Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('o_formule', 'Formule', ['Tous risques', 'Collision et renversement', 'À me conseiller']),
         R('o_frais', 'Frais supplémentaires et de sous-traitance (engin de remplacement)', ONC, w=2), R('o_vol', 'Vol', ONC, w=2),
         R('o_transport', 'Transport accéléré et heures supplémentaires', ONC, w=2), R('o_expert', 'Honoraires de votre expert', ONC, w=2),
         R('o_interne', 'Casse mécanique d\'origine interne (selon l\'âge des engins)', ONC)]},
     antecedents(True), fin()],
    CDN % (S3, 'Eloy_Questionnaire_Engins_Materiels_Mobiles.pdf'),
    [['Les documents pour l\'étude', ['la liste des engins ou les factures', 'les contrats de crédit-bail ou de location avec option d\'achat, s\'il y a lieu']]])

# ---------- Énergies renouvelables (photovoltaïque, méthanisation, hydroélectricité, biomasse, éolien) ----------
PV = ['Photovoltaïque en toiture', 'Photovoltaïque au sol', 'Ombrière photovoltaïque']
SOL = ['Photovoltaïque au sol', 'Ombrière photovoltaïque']
AUTRE = ['Biomasse', 'Éolien terrestre', 'Station d\'hydrogène']
TY = PV + ['Méthanisation', 'Hydroélectricité'] + AUTRE
Q['enr'] = base(
    'Énergies renouvelables : photovoltaïque, méthanisation, hydroélectricité', 'Énergies renouvelables', 'Questionnaire énergies renouvelables',
    'Assurance photovoltaïque et énergies renouvelables (pro)', 'assurance photovoltaïque et énergies renouvelables', 'Votre devis Énergies renouvelables',
    decl('Assurance photovoltaïque et énergies renouvelables'),
    "Ces informations me permettent d'étudier l'assurance de votre installation et de ses recettes. Les questions s'adaptent à votre "
    "installation. Comptez environ 10 minutes (un peu plus pour une centrale hydroélectrique).",
    [entreprise(ca_effectif()), vous(), kyc(),
     {'t': 'Votre installation', 'f': [
         F('installation', 'Type d\'installation', 'select', o=TY, s='Votre installation'),
         F('phase', 'Où en est le projet ?', 'select', o=['En projet ou en construction', 'En exploitation'], w=2),
         F('mise_service', 'Date de mise en service (installation existante)', 'date', req=0, w=2, show=['phase', 'En exploitation']),
         F('adresse_inst', 'Adresse de l\'installation'), F('cp_inst', 'Code postal', 'cp', w=3), F('ville_inst', 'Ville', w=23),
         F('gps', 'Coordonnées GPS', req=0),
         F('description', 'Description de l\'installation', 'textarea')]},
     {'t': 'Installation photovoltaïque', 'f': [
         F('pv_panneaux', 'Marque et nombre de panneaux', w=2, show=['installation', PV]), F('pv_onduleurs', 'Marque et nombre d\'onduleurs', w=2, show=['installation', PV]),
         F('pv_puissance', 'Puissance installée (kWc)', 'number', w=2, show=['installation', PV]),
         F('pv_installateur', 'Installateur et fabricant des panneaux (noms)', w=2, show=['installation', PV]),
         F('pv_activite', 'Activité exercée dans le bâtiment', w=2, show=['installation', 'Photovoltaïque en toiture']),
         F('pv_bat_type', 'Type de bâtiment', 'select', o=['Habitation', 'Commercial', 'Industriel', 'Agricole'], w=2, show=['installation', 'Photovoltaïque en toiture']),
         R('pv_incombustible', 'Murs et toiture : plus de 75 % de matériaux incombustibles ?', w=2, show=['installation', 'Photovoltaïque en toiture']),
         F('pv_part_toit', 'Part de la toiture couverte par l\'installation (%)', 'number', req=0, w=2, show=['installation', 'Photovoltaïque en toiture']),
         R('pv_integre', 'Panneaux intégrés à la toiture ?', w=2, show=['installation', 'Photovoltaïque en toiture']),
         R('pv_stockage', 'Des marchandises sont-elles stockées dans le bâtiment ?', show=['installation', 'Photovoltaïque en toiture']),
         F('pv_stockage_detail', 'Type et quantité', show=oui('pv_stockage')),
         R('pv_proprio', 'Êtes-vous propriétaire du bâtiment ?', show=['installation', 'Photovoltaïque en toiture'], w=2),
         R('pv_renonciation', 'Le bail prévoit-il une renonciation à recours ?', show=['pv_proprio', 'Non'], w=2),
         F('pv_m_panneaux', 'Panneaux (€)', 'number', w=2, show=['installation', PV]), F('pv_m_onduleurs', 'Onduleurs (€)', 'number', w=2, show=['installation', PV]),
         F('pv_m_structures', 'Structures (€)', 'number', w=2, show=['installation', PV]), F('pv_m_elec', 'Équipements électriques (€)', 'number', w=2, show=['installation', PV]),
         F('pv_m_gc', 'Génie civil, bâtiment (€)', 'number', req=0, w=2, show=['installation', PV]),
         F('pv_recettes', 'Recettes annuelles de revente (€)', 'number', req=0, w=2, show=['installation', PV]),
         F('pv_autoconso', 'Économie annuelle liée à l\'autoconsommation (€)', 'number', req=0, w=2, show=['installation', PV]),
         F('pv_prix', 'Prix de rachat de l\'électricité (centimes d\'€ par kWh)', 'number', req=0, w=2, show=['installation', PV]),
         F('pv_production', 'Production annuelle estimée (kWh)', 'number', req=0, w=2, show=['installation', PV]),
         R('pv_foudre', 'Protection contre la foudre ?', w=2, show=['installation', PV]),
         R('pv_stock', 'Stock de pièces de rechange ?', w=2, show=['installation', PV]),
         R('pv_alarme', 'Détection d\'intrusion reliée à une télésurveillance ?', w=2, show=['installation', PV]),
         R('pv_q18', 'Vérification des installations électriques (certificat Q18) ?', w=2, show=['installation', PV]),
         R('pv_q19', 'Thermographie de l\'armoire électrique (certificat Q19) ?', w=2, show=['installation', PV]),
         R('pv_drone', 'Thermographie infrarouge par drone ?', w=2, show=['installation', PV]),
         R('pv_antivol', 'Vis antivol sur les panneaux ?', w=2, show=['installation', PV]),
         R('pv_monitoring', 'Monitoring de la production ?', w=2, show=['installation', PV]),
         R('pv_supervision', 'Supervision à distance par le mainteneur ?', w=2, show=['installation', PV]),
         R('pv_apsad', 'Respect du référentiel APSAD D20 ?', w=2, show=['installation', PV]),
         F('pv_local', 'Local onduleurs', 'select', o=['Intérieur', 'Extérieur à 5 m ou plus', 'Extérieur à moins de 5 m'], w=2, show=['installation', PV]),
         R('pv_detection', 'Détection automatique d\'incendie dans le local onduleurs ?', w=2, show=['installation', PV]),
         R('pv_8ans', 'Des onduleurs ont-ils plus de 8 ans ?', w=2, show=['installation', PV]),
         R('pv_batteries', 'Y a-t-il des batteries de stockage ?', alerte=1, show=['installation', PV], h='Les batteries ne sont pas assurables avec ce contrat.'),
         R('pv_video', 'Surveillance vidéo ?', w=2, show=['installation', SOL]), R('pv_cloture', 'Site clôturé (plus de 2 m) ?', w=2, show=['installation', SOL]),
         R('pv_debroussaillage', 'Débroussaillage régulier ?', w=2, show=['installation', SOL]),
         R('pv_zone_co', 'Installation dans une zone commerciale ?', w=2, show=['installation', SOL]),
         R('pv_vent', 'Calcul de la charge au vent réalisé ?', w=2, show=['installation', SOL]),
         R('pv_repli', 'Tracker : repli automatique en cas de vent violent ?', ['Oui', 'Non', 'Pas de tracker'], w=2, show=['installation', SOL]),
         R('pv_inondable', 'La centrale au sol est-elle en zone inondable ?', alerte=1, show=['installation', SOL])]},
     {'t': 'Installation de méthanisation', 'f': [
         F('me_type', 'Type', 'select', o=['Injection', 'Cogénération'], w=2, show=['installation', 'Méthanisation']),
         F('me_puissance', 'Puissance installée (kW)', 'number', w=2, show=['installation', 'Méthanisation']),
         F('me_cogeneration', 'Turbine ou moteur de cogénération : puissance et fournisseur', show=['me_type', 'Cogénération']),
         F('me_intrants', 'Intrants solides et liquides : nature et pourcentage', 'textarea', show=['installation', 'Méthanisation']),
         F('me_tonnes', 'Déchets traités (tonnes par jour)', 'number', w=2, show=['installation', 'Méthanisation']),
         F('me_icpe', 'Régime ICPE', 'select', o=['Déclaration', 'Enregistrement', 'Autorisation'], w=2, show=['installation', 'Méthanisation']),
         F('me_montants', 'Valeurs à assurer (€ HT) : digesteurs, cuves, bâtiments, génie civil, production électrique, gestion des gaz, réseaux',
           'textarea', show=['installation', 'Méthanisation']),
         F('me_recettes', 'Recettes annuelles (€ HT) : vente de gaz, de digestats, d\'électricité, de chaleur, épandage', 'textarea',
           show=['installation', 'Méthanisation']),
         R('me_maintenance', 'Contrat de maintenance préventive et corrective ?', w=2, show=['installation', 'Méthanisation']),
         R('me_q18', 'Vérification électrique (Q18) et thermographie (Q19) ?', w=2, show=['installation', 'Méthanisation']),
         R('me_atex', 'Zonage et marquage ATEX des appareils ?', w=2, show=['installation', 'Méthanisation']),
         R('me_ch4', 'Détecteur de méthane ATEX avec seuils d\'alerte et d\'arrêt ?', w=2, show=['installation', 'Méthanisation']),
         R('me_analyseur', 'Analyseur de gaz en continu (H2S et O2) ?', w=2, show=['installation', 'Méthanisation']),
         R('me_arrete_flamme', 'Arrête-flamme en amont du local de combustion ?', w=2, show=['installation', 'Méthanisation']),
         R('me_incendie', 'Détecteur d\'incendie relié à une alarme dans le local de combustion ?', w=2, show=['installation', 'Méthanisation']),
         R('me_telesurveillance', 'Télésurveillance avec suivi de production et alertes ?', w=2, show=['installation', 'Méthanisation']),
         R('me_h2s', 'Traitement des siloxanes et du H2S avant le moteur de cogénération ?', ['Oui', 'Non', 'Pas de cogénération'], w=2, show=['installation', 'Méthanisation']),
         R('me_validation', 'Procédure de validation des intrants ?', w=2, show=['installation', 'Méthanisation']),
         F('me_digestats', 'Utilisation des digestats', w=2, show=['installation', 'Méthanisation']),
         F('me_protection', 'Moyens de protection incendie (extincteurs, robinets d\'incendie armés, détection automatique)', w=2, show=['installation', 'Méthanisation'])]},
     {'t': 'Centrale hydroélectrique', 'd': 'Le détail des équipements peut être donné dans le questionnaire PDF ou en réponse au mail.', 'f': [
         F('hy_nom', 'Nom de la centrale', w=2, show=['installation', 'Hydroélectricité']), F('hy_annee', 'Année de construction', 'number', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_type', 'Type de centrale', 'select', o=['Fil de l\'eau', 'Conduite forcée'], w=2, show=['installation', 'Hydroélectricité']),
         F('hy_cours', 'Cours d\'eau et rive', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_debit', 'Débit équipé', w=2, show=['installation', 'Hydroélectricité']), F('hy_chute', 'Hauteur de chute nette', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_eau', 'Qualité de l\'eau (siliceuse, calcaire, vaseuse…)', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_puissance', 'Puissance installée (kW)', 'number', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_conduite', 'Conduite forcée : aérienne ou enterrée, longueur, diamètre, matériau, année', req=0, show=['hy_type', 'Conduite forcée']),
         R('hy_degrilleur', 'Dégrilleur automatique à la prise d\'eau ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_vallee', 'Vallée encaissée ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_acces', 'Accès des véhicules lourds (grues, engins) ?', w=2, show=['installation', 'Hydroélectricité']),
         F('hy_crues', 'Risques d\'inondation : dernière crue, crue décennale, crue centennale', 'textarea', show=['installation', 'Hydroélectricité']),
         F('hy_ouvrages', 'Barrage ou retenue, canal d\'amenée, conduite forcée, bâtiment, canal de fuite, lignes : caractéristiques et années',
           'textarea', req=0, show=['installation', 'Hydroélectricité']),
         F('hy_equipements', 'Turbines, multiplicateurs, génératrices, transformateurs, armoires : type, constructeur, puissance, mise en service',
           'textarea', req=0, show=['installation', 'Hydroélectricité']),
         F('hy_valeurs', 'Valeurs à assurer (€ HT) : bâtiment, génie civil, machines et équipements, frais et pertes', 'textarea',
           show=['installation', 'Hydroélectricité']),
         F('hy_recettes', 'Recettes annuelles des 3 dernières années et prix du kWh', 'textarea', show=['installation', 'Hydroélectricité']),
         R('hy_controle', 'Contrôle régulier par un organisme indépendant (génie civil, mécanique, électrique) ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_maintenance', 'Contrat d\'entretien ou de maintenance ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_vibrations', 'Analyse vibratoire ou capteurs de vibration ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_surveillance', 'Centrale surveillée ou gardée ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_survitesse', 'Protection contre les survitesses ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_foudre', 'Protection contre la foudre ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_pieces', 'Stock de pièces détachées ?', w=2, show=['installation', 'Hydroélectricité']),
         R('hy_condensateurs', 'Condensateurs en local ou armoire coupe-feu 2 h ?', ['Oui', 'Non', 'Pas de condensateurs'], w=2, show=['installation', 'Hydroélectricité']),
         F('hy_delais', 'Délai maximum de remplacement des principaux équipements', 'textarea', req=0, show=['installation', 'Hydroélectricité']),
         R('hy_catnat', 'Sinistres d\'événements naturels sur les 10 dernières années ?', alerte=1, show=['installation', 'Hydroélectricité']),
         F('hy_catnat_detail', 'Date, événement et montant', show=oui('hy_catnat'))]},
     {'t': 'Biomasse, éolien ou hydrogène', 'f': [
         F('au_puissance', 'Puissance installée (kW)', 'number', w=2, show=['installation', AUTRE]),
         F('au_valeur', 'Valeur de l\'installation (€ HT)', 'number', w=2, show=['installation', AUTRE]),
         F('au_recettes', 'Recettes annuelles (€)', 'number', req=0, w=2, show=['installation', AUTRE]),
         R('au_maintenance', 'Contrat de maintenance ?', w=2, show=['installation', AUTRE])]},
     {'t': 'Garanties souhaitées', 'd': 'Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('g_pe', 'Pertes de recettes ou d\'exploitation', ONC, w=2),
         F('g_marge', 'Marge brute ou recettes annuelles à garantir (€)', 'number', req=0, w=2, show=oui('g_pe')),
         F('g_periode', 'Période d\'indemnisation', 'select', o=['6 mois', '12 mois', '18 mois'], w=2, show=oui('g_pe')),
         R('g_rc', 'Responsabilité civile exploitation et après livraison', ONC, w=2),
         R('g_dr', 'Défense et recours', ONC, w=2),
         R('g_rupture', 'Rupture du contrat d\'achat d\'électricité après un sinistre', ONC, w=2, show=['installation', PV]),
         R('g_construction', 'Phase de construction (montage et essais)', ONC, w=2, show=['phase', 'En projet ou en construction'])]},
     antecedents(True), fin()],
    [['installations photovoltaïques', CDN % (S3, 'Eloy_Questionnaire_Photovoltaique.pdf')],
     ['installations de méthanisation', CDN % ('252885c', 'Eloy_Questionnaire_Methanisation.pdf')],
     ['centrales hydroélectriques', CDN % ('252885c', 'Eloy_Questionnaire_Hydroelectricite.pdf')]],
    [['Les documents pour l\'étude', ['le schéma d\'implantation et la facture de l\'installation', 'le contrat de maintenance',
                                      'le détail des recettes (contrat de vente d\'énergie)', 'les certificats Q18 et Q19, s\'il y en a']]])

Q['enr']['pdfSelon'] = 'votre installation'  # liste à puces des PDF dans le mail (Bradley, 20/11/2026)

# ---------- Matériel électronique et médical (Albingia, 20/11/2026) ----------
Q['materiel'] = base(
    'Matériel électronique et médical', 'Matériel électronique', 'Questionnaire matériel électronique et médical',
    'Assurance matériel électronique et médical (pro)', 'assurance du matériel électronique et médical', 'Votre devis Matériel électronique et médical',
    decl('Assurance matériel électronique et médical'),
    "Ces informations me permettent d'étudier l'assurance de vos appareils et, si vous le souhaitez, de vos recettes pendant un arrêt. "
    "Comptez environ 10 minutes.",
    [entreprise(), vous(), kyc(),
     {'t': 'Votre activité', 'f': ca_effectif() + [
         F('activite', 'Activité', 'select', o=['Cabinet médical, dentaire ou paramédical', 'Imagerie médicale ou laboratoire',
                                                 'Son, lumière et événementiel', 'Audiovisuel et photo', 'Mesure, contrôle et topographie',
                                                 'Télécommunications et sûreté', 'Location de matériel', 'Autre'], w=2),
         F('activite_autre', 'Précisez', show=['activite', 'Autre'], w=2),
         F('sites', 'Adresse du ou des lieux où le matériel est utilisé ou entreposé', 'textarea'),
         R('proprio_locaux', 'Êtes-vous propriétaire des locaux ?', w=2),
         R('renonciation', 'Le bail prévoit-il une renonciation à recours contre le propriétaire ?', show=['proprio_locaux', 'Non'], w=2)]},
     {'t': 'Le matériel à assurer', 'f': [
         F('nb_appareils', 'Nombre d\'appareils', 'number', w=2),
         F('valeur_totale', 'Valeur totale de remplacement à neuf (€)', 'number', w=2),
         F('ht_ttc', 'Valeurs indiquées', 'select', o=['HT', 'TTC'], w=2, h='Selon votre régime de TVA.'),
         F('appareils', 'Pour chaque appareil : désignation, marque et modèle, n° de série, année, valeur à neuf', 'textarea',
           h='Vous pouvez aussi envoyer la liste ou les factures en réponse au mail.'),
         R('credit_bail', 'Certains appareils sont-ils en crédit-bail ou pris en location ?'),
         F('financeurs', 'Lesquels, et nom de l\'organisme ou du loueur', show=oui('credit_bail')),
         R('loueur', 'Donnez-vous du matériel en location à vos clients ?', w=2),
         F('ca_location', 'Chiffre d\'affaires annuel de location (€)', 'number', show=oui('loueur'), w=2),
         R('maintenance', 'Les appareils ont-ils un contrat de maintenance ?', w=2),
         R('garantie_constructeur', 'Certains appareils sont-ils encore sous garantie du constructeur ?', w=2),
         F('protection', 'Protection contre le vol (alarme, local fermé, gardiennage…)', 'textarea', req=0)]},
     {'t': 'Options souhaitées', 'd': 'Répondez « À me conseiller » si vous ne savez pas.', 'f': [
         R('o_accessoires', 'Accessoires (sondes, antennes, lasers…)', ONC, w=2),
         R('o_transport', 'Transport du matériel', ONC, w=2),
         F('o_zone', 'Zone de transport', 'select', o=['Martinique, Guadeloupe, Guyane', 'France', 'Monde entier'], w=2, show=oui('o_transport')),
         R('o_remplacement', 'Location d\'un appareil de remplacement', ONC, w=2),
         R('o_frais', 'Frais supplémentaires et de sous-traitance', ONC, w=2),
         R('o_pe', 'Pertes de recettes, d\'honoraires ou d\'exploitation', ONC, w=2),
         F('o_recettes', 'Recettes ou honoraires annuels (€)', 'number', req=0, w=2, show=oui('o_pe')),
         F('o_periode', 'Période d\'indemnisation', 'select', o=['3 mois', '6 mois', '12 mois'], w=2, show=oui('o_pe'))]},
     antecedents(True), fin()],
    CDN % (S3, 'Eloy_Questionnaire_Materiel_Electronique.pdf'),
    [['Les documents pour l\'étude', ['la liste des appareils ou les factures d\'achat',
                                      'les contrats de crédit-bail ou de location, s\'il y a lieu']]])
d = json.load(open(P, encoding='utf-8'))
for k, v in Q.items():
    d[k] = v
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: sum(len(s['f']) for s in v['sections']) for k, v in Q.items()})
