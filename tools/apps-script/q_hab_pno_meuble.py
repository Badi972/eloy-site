#!/usr/bin/env python3
"""Questionnaire en ligne habitation : le propriétaire non occupant loue-t-il meublé ? Si oui, on demande son capital mobilier
(demande de Bradley du 17/11/2026). Idempotent. Usage : python3 tools/apps-script/q_hab_pno_meuble.py  puis  python3 tools/apps-script/fiches.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
S = Q['habitation']['sections']
PNO = ['Propriétaire ou copropriétaire non-occupant', 'Propriétaire non-occupant pour le compte du locataire']
OCC = ['Propriétaire ou copropriétaire occupant', 'Locataire', 'Locataire pour le compte du propriétaire', 'Colocataire', 'Usufruitier']
F = [s for s in S if s['t'] == 'Vous et ce bien'][0]['f']
F[:] = [f for f in F if f['k'] != 'pno_meuble']
i = [f['k'] for f in F].index('meuble') + 1
F.insert(i, {'k': 'pno_meuble', 'l': 'Louez-vous ce logement meublé ?', 'type': 'radio', 'req': 1,
             'o': ['Oui, meublé', 'Non, vide'], 'show': ['qualite', PNO],
             's': 'Bien loué meublé par le propriétaire', 'h': 'Meublé : le mobilier vous appartient, il peut être assuré avec le logement.'})
M = [s for s in S if s['t'] == 'Votre mobilier'][0]['f']
for f in M:
    if f['k'] in ('mobilier', 'objets_valeur'):
        f['show'] = ['qualite|pno_meuble', OCC + ['Oui, meublé']]
json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
