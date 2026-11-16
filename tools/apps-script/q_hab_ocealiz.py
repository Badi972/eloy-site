#!/usr/bin/env python3
"""Ajoute au questionnaire en ligne « habitation » les questions demandées par Ocealiz (FDR Habitation 03/2021) :
matériaux, panneaux solaires, distance à la mer, altitude, usage mixte, zone inondable, mouvements de terrain,
terrain constructible, copropriété. Idempotent. Usage : python3 tools/apps-script/q_hab_ocealiz.py  puis  fiches.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
H = Q['habitation']
NEW = {'materiaux', 'solaire', 'solaire_valeur', 'distance_mer', 'altitude', 'usage_mixte',
       'inondable', 'mouvement_terrain', 'non_conforme', 'copro', 'copro_assuree', 'copro_type'}
for s in H['sections']:
    s['f'] = [f for f in s['f'] if f['k'] not in NEW]
ON = ['Oui', 'Non']; ONS = ['Oui', 'Non', 'Je ne sais pas']
PROPRIO = ['Propriétaire ou copropriétaire occupant', 'Propriétaire ou copropriétaire non-occupant',
           'Propriétaire non-occupant pour le compte du locataire', 'Usufruitier', 'Nu-propriétaire']
LOGEMENT = [
    {'k': 'materiaux', 'l': 'Matériaux du logement', 'type': 'radio', 'req': 1,
     'o': ['Durs (béton, parpaing, brique, pierre)', 'Légers (bois, tôle…)', 'Mixtes, avec plus de 25 % de matériaux légers'],
     'h': "Sont considérés comme légers tous les matériaux qui ne sont pas en dur, notamment le bois, les tôles fixées par clous ou tire-fonds et les tuiles non scellées."},
    {'k': 'solaire', 'l': 'Panneaux solaires sur le logement', 'type': 'radio', 'o': ON, 'req': 1},
    {'k': 'solaire_valeur', 'l': 'Valeur des panneaux solaires (€)', 'type': 'number', 'req': 1, 'w': 2, 'show': ['solaire', 'Oui']},
    {'k': 'distance_mer', 'l': 'Distance entre le logement et la mer (m)', 'type': 'number', 'req': 1, 'w': 2,
     'h': "Mesurée jusqu'au trait de côte, par exemple sur le site Géoportail. Près d'un lac, d'une rivière ou d'un étang, indiquez la distance à la berge la plus proche."},
    {'k': 'altitude', 'l': "Le logement est-il à moins de 10 m d'altitude ?", 'type': 'radio', 'o': ONS, 'req': 1, 'alerte': 1},
    {'k': 'usage_mixte', 'l': 'Le logement sert-il aussi à une activité professionnelle ?', 'type': 'radio', 'o': ON, 'req': 1,
     's': 'Usage mixte (habitation et professionnel)'},
    {'k': 'copro', 'l': "Le logement fait-il partie d'une copropriété ?", 'type': 'radio', 'o': ON, 'req': 1, 'show': ['qualite', PROPRIO]},
    {'k': 'copro_assuree', 'l': "La copropriété est-elle assurée (assurance de l'immeuble) ?", 'type': 'radio', 'o': ONS, 'req': 1, 'show': ['copro', 'Oui']},
    {'k': 'copro_type', 'l': 'Type de copropriété', 'type': 'radio', 'req': 1, 'show': ['copro', 'Oui'],
     'o': ['Verticale (immeuble)', 'Horizontale (maisons ou lots sur un même terrain)']},
]
DECL = [
    {'k': 'inondable', 'l': 'Le logement est-il en zone inondable (plan de prévention des risques, aléa moyen ou fort) ?', 'type': 'radio', 'o': ONS, 'req': 1, 'alerte': 1,
     's': 'Zone inondable'},
    {'k': 'mouvement_terrain', 'l': 'Le logement est-il en zone exposée aux mouvements de terrain (forte instabilité de pente) ?', 'type': 'radio', 'o': ONS, 'req': 1, 'alerte': 1,
     's': 'Zone de mouvements de terrain'},
    {'k': 'non_conforme', 'l': 'Le bâtiment a-t-il été construit sur un terrain non constructible ou sans respecter les règles en vigueur à sa construction ?', 'type': 'radio', 'o': ONS, 'req': 1, 'alerte': 1,
     's': 'Construction non conforme ou terrain non constructible'},
]
for s in H['sections']:
    ks = [f['k'] for f in s['f']]
    if s['t'] == 'Le logement':
        j = ks.index('install_dd') + 1; s['f'][j:j] = LOGEMENT
    if s['t'] == 'Déclarations complémentaires':
        j = ks.index('monument'); s['f'][j:j] = DECL
json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('habitation :', sum(len(s['f']) for s in H['sections']), 'questions')
