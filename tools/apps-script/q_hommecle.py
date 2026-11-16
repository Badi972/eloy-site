#!/usr/bin/env python3
"""Ajoute (ou refait) le questionnaire en ligne « hommecle » (garantie homme clé et protection des associés)
dans tools/questionnaires.json. Mêmes questions que le PDF tools/pdfq/q_homme_cle.py (16/11/2026).
Aucune question de santé : le questionnaire de santé se remplit directement auprès de l'assureur.
Idempotent. Usage : python3 tools/apps-script/q_hommecle.py  puis  python3 tools/apps-script/fiches.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
PDF = 'https://cdn.jsdelivr.net/gh/Badi972/eloy-site@5e116c91532dfa7a34f9e2bf3aae83f4a7ff59e2/dist/docs/Eloy_Questionnaire_Homme_Cle.pdf'

ON = ['Oui', 'Non']
HC = "Garantie homme clé (capital versé à l'entreprise)"
AS = "Protection des associés (rachat des parts d'un associé)"
DEUX, CONS = 'Les deux', 'À me conseiller'
SHOW_HC = ['formule', [HC, DEUX, CONS]]
SHOW_AS = ['formule', [AS, DEUX]]


def r(k, l, show=None, o=ON, alerte=False, s=None, h=None, req=1):
    f = {'k': k, 'l': l, 'type': 'radio', 'o': list(o), 'req': req}
    if show: f['show'] = show
    if alerte: f['alerte'] = 1
    if s: f['s'] = s
    if h: f['h'] = h
    return f


def t(k, l, show=None, typ=None, w=None, s=None, h=None, ph=None, req=1, **kw):
    f = {'k': k, 'l': l, 'req': req}
    if typ: f['type'] = typ
    if w: f['w'] = w
    if show: f['show'] = show
    if s: f['s'] = s
    if h: f['h'] = h
    if ph: f['ph'] = ph
    f.update(kw)
    return f


sections = [
    {'t': "L'entreprise", 'f': [
        t('raison_sociale', "Nom de la société (ou de l'entreprise individuelle)", s='Raison sociale'),
        t('siren', 'Numéro SIREN ou SIRET', w=2, siren=1, h='9 ou 14 chiffres. Les autres informations de la société sont récupérées automatiquement.'),
        t('activite', 'Activité exercée', w=2, ph='Ex. distribution de matériel médical'),
        t('ca', "Chiffre d'affaires du dernier exercice (€)", typ='number', w=2, s="Chiffre d'affaires du dernier exercice"),
        t('resultat', 'Résultat net du dernier exercice (€)', typ='number', w=2, req=0, s='Résultat net du dernier exercice'),
        t('salaries', 'Nombre de salariés', typ='number', w=2, h='Indiquez 0 si vous travaillez seul.'),
        t('date_effet', "Date d'effet souhaitée", typ='date', w=2),
    ]},
    {'t': 'Vous', 'f': [
        t('nom', 'Nom', w=2, p='nom'),
        t('prenom', 'Prénom', w=2),
        t('fonction', "Votre fonction dans l'entreprise", w=2, ph='Ex. gérant'),
        t('tel', 'Téléphone portable', typ='tel', w=2, p='tel'),
        t('email', 'E-mail', typ='email', w=2, p='email'),
    ]},
    {'t': 'Ce que vous souhaitez protéger', 'f': [
        r('formule', 'Formule souhaitée', o=[HC, AS, DEUX, CONS], s='Formule',
          h="Garantie homme clé : l'entreprise reçoit un capital si une personne indispensable décède ou perd toute autonomie. "
            "Protection des associés : les associés survivants reçoivent un capital pour racheter les parts de celui qui disparaît."),
    ]},
    {'t': 'La personne clé à assurer', 'f': [
        t('pc_nom', 'Nom', w=2, show=SHOW_HC, s='Personne clé – nom'),
        t('pc_prenom', 'Prénom', w=2, show=SHOW_HC, s='Personne clé – prénom'),
        t('pc_naissance', 'Date de naissance', typ='date', w=2, show=SHOW_HC, s='Personne clé – date de naissance'),
        t('pc_fonction', "Fonction et rôle dans l'entreprise", w=2, show=SHOW_HC, ph='Ex. directeur commercial', s='Personne clé – fonction'),
        t('pc_salaire', 'Salaire annuel brut (€)', typ='number', w=2, show=SHOW_HC, h='Celui de la dernière année complète.', s='Personne clé – salaire annuel brut'),
        r('pc_fumeur', 'A-t-elle fumé au cours des 24 derniers mois ?', show=SHOW_HC, s='Personne clé – fumeur (24 mois)'),
        r('pc_associe', "Est-elle associée de l'entreprise ?", show=SHOW_HC, s='Personne clé – associée'),
        t('pc_parts', 'Pourcentage des parts détenues (%)', typ='number', w=3, show=['pc_associe', 'Oui'], s='Personne clé – parts détenues'),
        t('pc_residence', 'Lieu de résidence', typ='select', o=['Martinique', 'Guadeloupe', 'Guyane', 'Autre'], w=2, show=SHOW_HC, s='Personne clé – résidence'),
        r('pc_amenagement', "Bénéficie-t-elle d'un aménagement de temps ou de poste pour raison de santé ?", show=SHOW_HC, alerte=True,
          s='Personne clé – aménagement pour raison de santé'),
        r('pc_sport', 'Pratique-t-elle un sport à risque (plongée, sports aériens, sports mécaniques, sport en compétition…) ?', show=SHOW_HC,
          alerte=True, s='Personne clé – sport à risque'),
        t('pc_sport_detail', 'Lequel ou lesquels ?', show=['pc_sport', 'Oui'], s='Personne clé – sports pratiqués'),
        r('pc_etranger', "Se déplace-t-elle souvent à l'étranger pour son travail ?", show=SHOW_HC, s="Personne clé – déplacements à l'étranger"),
        t('pc_etranger_detail', 'Pays et durée des séjours', show=['pc_etranger', 'Oui'], s='Personne clé – pays et durée des séjours'),
        t('pc_pourquoi', 'Pourquoi cette personne est-elle indispensable ?', typ='textarea', show=SHOW_HC, req=0,
          ph='Ex. elle suit les plus gros clients et négocie avec la banque', s='Personne clé – pourquoi indispensable'),
        r('autres', "Faut-il assurer d'autres personnes clés ?", show=SHOW_HC, s='Autres personnes clés'),
        t('autres_detail', 'Pour chacune : nom, date de naissance, fonction, salaire annuel brut, fumeur ou non', typ='textarea',
          show=['autres', 'Oui'], s='Autres personnes clés – détail'),
    ]},
    {'t': 'Garanties et capital', 'f': [
        r('capital_choix', 'Capital à assurer par personne', o=['Je connais le montant', 'À me conseiller'], show=SHOW_HC, s='Capital',
          h="Il s'estime à partir de ce que la personne apporte à l'entreprise et des emprunts en cours. Votre conseiller peut le calculer avec vous."),
        t('capital', 'Capital souhaité (€)', typ='number', w=2, show=['capital_choix', 'Je connais le montant'], s='Capital souhaité'),
        t('base', 'Garantie de base', typ='select', show=SHOW_HC, s='Garantie de base',
          o=["Décès et perte totale d'autonomie, toutes causes", "Décès et perte totale d'autonomie par accident seulement", 'À me conseiller']),
        r('opt_ipt', 'Option invalidité permanente totale', o=['Oui', 'Non', 'À me conseiller'], show=SHOW_HC),
        r('opt_reval', 'Option revalorisation automatique du capital chaque année', o=['Oui', 'Non', 'À me conseiller'], show=SHOW_HC,
          s='Option revalorisation automatique'),
        r('opt_famille', "Option capital pour la famille (capital versé aux proches, en plus de celui de l'entreprise)",
          o=['Oui', 'Non', 'À me conseiller'], show=SHOW_HC, s='Option capital pour la famille'),
        t('famille_capital', 'Capital souhaité pour la famille (€)', typ='number', w=2, req=0, show=['opt_famille', 'Oui'],
          h='Laissez vide si vous souhaitez un conseil.', s='Capital pour la famille'),
        t('famille_benef', 'Bénéficiaires', typ='select', w=2, show=['opt_famille', 'Oui'],
          o=['Conjoint ou partenaire de PACS', 'Enfants', 'Héritiers', 'Autre personne'], s='Bénéficiaires du capital famille'),
        r('opt_pret', "Le capital doit-il garantir un prêt professionnel de l'entreprise ?", show=SHOW_HC, s='Garantie d’un emprunt professionnel',
          h='Les découverts, facilités de caisse, crédits renouvelables et prêts participatifs ne peuvent pas être garantis.'),
        t('pret_banque', 'Banque', w=2, show=['opt_pret', 'Oui'], s='Prêt – banque'),
        t('pret_objet', 'Objet du prêt', w=2, show=['opt_pret', 'Oui'], s='Prêt – objet'),
        t('pret_montant', 'Montant emprunté (€)', typ='number', w=2, show=['opt_pret', 'Oui'], s='Prêt – montant'),
        t('pret_duree', 'Durée (mois)', typ='number', w=2, show=['opt_pret', 'Oui'], s='Prêt – durée (mois)'),
    ]},
    {'t': 'Protection des associés', 'f': [
        t('nb_associes', "Nombre d'associés à assurer", typ='number', w=3, show=SHOW_AS),
        t('associes', 'Pour chaque associé : nom, date de naissance, part du capital (%), valeur estimée des parts (€), fumeur ou non',
          typ='textarea', show=SHOW_AS, s='Associés à assurer',
          h='Valeur des parts : estimation actuelle, à voir avec votre expert-comptable.'),
        r('pacte', "Les statuts ou un pacte d'associés prévoient-ils le rachat des parts en cas de décès d'un associé ?",
          o=['Oui', 'Non', 'Je ne sais pas'], show=SHOW_AS, s="Clause de rachat (statuts ou pacte d'associés)"),
        r('ass_ipt', 'Option invalidité permanente totale', o=['Oui', 'Non', 'À me conseiller'], show=SHOW_AS,
          s='Protection des associés – option invalidité'),
    ]},
    {'t': 'Vos antécédents', 'f': [
        r('deja', "L'entreprise a-t-elle déjà une garantie homme clé ou une assurance des associés ?", s='Contrat actuel'),
        t('deja_detail', 'Compagnie, capital et échéance', show=['deja', 'Oui'], s='Contrat actuel – détail'),
        r('refus', 'Un assureur a-t-il déjà refusé, ajourné ou majoré une assurance décès pour l’une de ces personnes ?', alerte=True,
          s='Refus, ajournement ou majoration'),
        t('refus_detail', 'Précisez', typ='textarea', show=['refus', 'Oui'], s='Refus – détail'),
        r('procedure', "L'entreprise fait-elle l'objet d'une procédure de sauvegarde, de redressement ou de liquidation judiciaire ?",
          alerte=True, s='Procédure collective'),
    ]},
    {'t': 'Vos choix', 'f': [
        t('paiement', 'Paiement', typ='select', o=['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'], w=2),
        t('remarques', 'Autres informations utiles', typ='textarea', req=0, s='Autres informations'),
    ]},
]

Q['hommecle'] = {
    'titre': 'Garantie homme clé et protection des associés',
    'court': 'Homme clé',
    'demande': 'Questionnaire garantie homme clé',
    'produit': 'Garantie homme clé (pro)',
    'mail': 'assurance homme clé',
    'sujet': 'Votre devis Garantie homme clé',
    'declencheurs': ['Garantie homme clé', 'Garantie homme clé (pro)', 'Assurance homme clé', 'Assurance homme clé (pro)'],
    'intro': "Ces informations me permettent de vous proposer une garantie homme clé ou une protection des associés adaptée à votre entreprise. "
             "Aucune question de santé ici : si l'assureur le demande, la personne assurée remplit son questionnaire de santé directement auprès de lui. "
             "Comptez environ 10 minutes.",
    'sections': sections,
    'pdf': PDF,
    'pieces': [["Les pièces à joindre", ['extrait Kbis de moins de 3 mois', 'les liasses fiscales complètes des 3 derniers exercices',
                                          "la pièce d'identité de chaque personne à assurer"]],
               ['Selon votre choix', ["pour garantir un prêt professionnel : l'offre de prêt et le tableau d'amortissement",
                                      'pour la protection des associés : les statuts à jour de la société, avec la répartition des parts']]],
}
json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('hommecle :', sum(len(s['f']) for s in sections), 'questions')
