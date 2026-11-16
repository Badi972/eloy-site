#!/usr/bin/env python3
"""Questionnaire en ligne habitation : le locataire loue-t-il un logement meublé ou vide ? (demande de Bradley du 16/11/2026)
Idempotent. Usage : python3 tools/apps-script/q_hab_meuble.py  puis  python3 tools/apps-script/fiches.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
F = [s for s in Q['habitation']['sections'] if s['t'] == 'Vous et ce bien'][0]['f']
F[:] = [f for f in F if f['k'] != 'meuble']
i = [f['k'] for f in F].index('qualite') + 1
F.insert(i, {'k': 'meuble', 'l': 'Le logement que vous louez est-il meublé ?', 'type': 'radio', 'req': 1,
             'o': ['Oui, meublé', 'Non, vide'], 'show': ['qualite', ['Locataire', 'Locataire pour le compte du propriétaire', 'Colocataire']],
             's': 'Logement loué meublé', 'h': 'Meublé : le propriétaire vous loue aussi le mobilier.'})
json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
