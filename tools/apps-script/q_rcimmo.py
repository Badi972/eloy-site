#!/usr/bin/env python3
"""Ajoute (ou refait) le questionnaire en ligne « rcimmo » (RC des métiers de l'immobilier, contrat RC Global Immo)
dans tools/questionnaires.json, et aligne les questions Global Immo du questionnaire RC Pro sur l'outil de tarification
(relevé du 16/11/2026 : surfaces par activité, certifications, nombre de diagnostiqueurs).
Idempotent. Usage : python3 tools/apps-script/q_rcimmo.py [url_pdf]  puis  python3 tools/apps-script/fiches.py"""
import json, os, sys, copy
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
RC = Q['rcpro']
F = {f['k']: f for s in RC['sections'] for f in s['f']}

MB, MBS, PRO, AME = 'Marchand de biens', 'Marchand de biens (avec travaux sur la structure)', 'Promoteur immobilier', 'Aménageur lotisseur'
AUD, DIA = "Auditeur énergétique (dont Mon Accompagnateur Rénov')", 'Diagnostiqueur immobilier'
GI = 'RC Global Immo (Markel)'


def rad(k, l, show, x=None, xo=None, o=('Oui', 'Non'), s=None, alerte=None):
    f = {'k': k, 'l': l, 'type': 'radio', 'o': list(o), 'req': 1, 'show': ['metier', show]}
    if x: f['x'] = x
    if xo: f['xo'] = xo
    if s: f['s'] = s
    if alerte: f['alerte'] = 1
    return f


# Questions Global Immo alignées sur l'outil de tarification (16/11/2026)
SURF = [
    rad('gi_surf_diag', 'Intervenez-vous sur des bâtiments de plus de 5 000 m² ?', DIA,
        GI + ' : diagnostiqueur, bâtiments de plus de 5 000 m² exclus'),
    rad('gi_surf_aud', 'Intervenez-vous sur des bâtiments de plus de 1 000 m² ?', AUD,
        GI + ' : auditeur énergétique, bâtiments de plus de 1 000 m² exclus (à vérifier pour Mon Accompagnateur Rénov\')'),
    rad('gi_surf_mb', 'Intervenez-vous sur des bâtiments de plus de 1 500 m² ?', MB,
        GI + ' : marchand de biens, bâtiments de plus de 1 500 m² exclus'),
    rad('gi_3000', 'Intervenez-vous sur des bâtiments de plus de 3 000 m² ?', [MBS, PRO, AME],
        GI + ' : bâtiments de plus de 3 000 m² exclus (marchand de biens avec travaux sur la structure, promoteur, aménageur lotisseur)'),
]
AUD_Q = [
    rad('aud_certif', 'Avez-vous une qualification NF EN 16247 (OPQIBI, Qualibat, LNE ou AFNOR) ?', AUD,
        GI + ' : qualification NF EN 16247 à obtenir dans les 6 mois de la souscription ; sans elle au jour du sinistre, la franchise est doublée',
        xo='Non', o=('Oui', 'En cours (dans les 6 mois)', 'Non'), s='Qualification NF EN 16247'),
    rad('aud_anah', "Avez-vous l'agrément de l'Anah ?", AUD,
        GI + " : Mon Accompagnateur Rénov' sans agrément de l'Anah (à obtenir dans les 6 mois)",
        xo='Non', o=('Oui', 'En cours (dans les 6 mois)', 'Non'), s="Agrément de l'Anah"),
]
DIA_Q = [
    rad('diag_11', 'Votre société compte-t-elle plus de 11 diagnostiqueurs ?', DIA,
        GI + ' : plus de 11 diagnostiqueurs dans la société, hors tarification directe'),
    rad('diag_cofrac', 'Vos diagnostiqueurs sont-ils certifiés par un organisme accrédité COFRAC ?', DIA,
        GI + ' : certification par un organisme accrédité COFRAC exigée (ou démarches engagées)',
        xo='Non', o=('Oui', 'Démarches en cours', 'Non'), s='Certification COFRAC'),
]
aud_anah = AUD_Q[1]; aud_anah['show'] = ['mar', 'Oui']


def aligne(fields):
    """Remplace gi_3000 et certif par les questions de l'outil ; place les questions auditeur et diagnostiqueur."""
    out = []
    for f in fields:
        k = f['k']
        if k in ('gi_3000', 'certif', 'gi_surf_diag', 'gi_surf_aud', 'gi_surf_mb', 'aud_certif', 'aud_anah', 'diag_11', 'diag_cofrac'):
            if k == 'gi_3000': out += copy.deepcopy(SURF)
            continue
        out.append(f)
        if k == 'mar': out += copy.deepcopy(AUD_Q)
        if k == 'diag_prescription': out += copy.deepcopy(DIA_Q)
    return out


for s in RC['sections']:
    s['f'] = aligne(s['f'])
F = {f['k']: f for s in RC['sections'] for f in s['f']}

ACT = ['metier', 'repartition', 'gi_structure', 'ms_travaux_soi', 'ms_montant', 'gi_tiers', 'ccmi', 'pr_r6',
       'gi_surf_diag', 'gi_surf_aud', 'gi_surf_mb', 'gi_3000', 'co_structure', 'co_archi', 'co_travaux', 'ct_facture',
       'amo_tech', 'amo_decision', 'amo_moe', 'mar', 'aud_certif', 'aud_anah', 'au_travaux', 'au_aides',
       'diag_amiante', 'diag_parasitaire', 'diag_prescription', 'diag_11', 'diag_cofrac', 'hors_france', 'usa', 'usa_part']


def g(k, **mod):
    f = copy.deepcopy(F[k]); f.update(mod); return f


metier = g('metier', h="Tapez quelques lettres puis choisissez dans la liste. Vous pouvez ajouter jusqu'à 4 activités, une par une.")
acts = [metier] + [g(k) for k in ACT[1:]]
acts[[f['k'] for f in acts].index('diag_amiante')]['l'] = "Souhaitez-vous l'option amiante avant travaux (repérages avant travaux ou démolition, DTA, plomb avant travaux) ?"
acts[[f['k'] for f in acts].index('diag_parasitaire')]['l'] = "Souhaitez-vous l'option termites et état parasitaire (dont mérule) ?"

sections = [
    {'t': "L'entreprise", 'f': [g(k) for k in ('raison_sociale', 'en_creation', 'siren', 'date_debut', 'forme', 'adresse_siege', 'cp_siege', 'ville_siege')] +
        [{'k': 'date_effet', 'l': "Date d'effet souhaitée", 'type': 'date', 'req': 1, 'w': 2}]},
    {'t': 'Le dirigeant', 'f': [g(k) for k in ('nom', 'prenom', 'date_naissance', 'lieu_naissance')] + [g('adresse_perso', l='Adresse postale', s='Adresse postale')] + [g(k) for k in ('cp_perso', 'ville_perso', 'qualite', 'tel', 'email')]},
    {'t': 'Chiffres clés', 'f': [g('ca'), g('salaries')]},
    {'t': 'Vos activités', 'f': acts},
    {'t': 'Vos antécédents', 'f': [
        g('deja_assure', l='Êtes-vous actuellement assuré pour ces activités ?'), g('assureur'),
        g('mises_en_cause'), g('nb_mises_en_cause'), g('detail_mises_en_cause'),
        {'k': 'faits_connus', 'l': "Avez-vous connaissance d'un fait ou d'une erreur qui pourrait donner lieu à une réclamation ?",
         'type': 'radio', 'o': ['Oui', 'Non'], 'req': 1, 'alerte': 1, 's': 'Faits connus pouvant donner lieu à une réclamation'},
        {'k': 'detail_faits', 'l': 'Précisez', 'type': 'textarea', 'req': 1, 'show': ['faits_connus', 'Oui'], 's': 'Détail des faits connus'},
        g('resilie'), g('motif_resiliation'), g('procedure')]},
    {'t': 'Vos choix', 'f': [
        {'k': 'niveau', 'l': 'Niveau de garantie', 'type': 'select', 'req': 1,
         'o': ['Le plus économique', 'Intermédiaire', 'Le plus élevé', 'À me conseiller'], 'h': 'Votre conseiller vous aide à choisir.'},
        {'k': 'paiement', 'l': 'Paiement', 'type': 'select', 'req': 1, 'o': ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel']},
        {'k': 'pj', 'l': 'Souhaitez-vous la protection juridique professionnelle en plus ?', 'type': 'radio',
         'o': ['Oui', 'Non', 'À me conseiller'], 'req': 1, 's': 'Protection juridique professionnelle'}]},
]

fam = [m for m in RC['metiers'] if m[0].startswith('Promotion')][0]
pdf = sys.argv[1] if len(sys.argv) > 1 else (Q.get('rcimmo') or {}).get('pdf', '')
Q['rcimmo'] = {
    'titre': "RC des métiers de l'immobilier", 'court': 'RC immobilier', 'demande': "Questionnaire RC des métiers de l'immobilier",
    'produit': "RC des métiers de l'immobilier (pro)", 'mail': "assurance RC des métiers de l'immobilier",
    'sujet': "Votre devis RC des métiers de l'immobilier",
    'declencheurs': ["RC des métiers de l'immobilier", "RC des métiers de l'immobilier (pro)"],
    'intro': "Ces informations me permettent de vous transmettre votre devis RC des métiers de l'immobilier.",
    'sections': sections, 'metiers': [["Métiers de l'immobilier", fam[1]]], 'pdf': pdf}
json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('rcimmo :', sum(len(s['f']) for s in sections), 'questions ; pdf =', pdf or '(aucun)')
