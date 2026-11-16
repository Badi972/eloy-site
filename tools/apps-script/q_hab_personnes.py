#!/usr/bin/env python3
"""Questionnaire en ligne habitation : identité des autres personnes et des enfants à assurer (demande de Bradley du 16/11/2026).
Pour chaque personne : nom, prénom, date de naissance, ville de naissance.
Remplace « autres_assures_noms » (texte libre) par un nombre de personnes + 4 champs par personne,
et « nb_enfants » (nombre) par une liste 1 à 5 + 4 champs par enfant.
Idempotent. Usage : python3 tools/apps-script/q_hab_personnes.py  puis  python3 tools/apps-script/fiches.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'tools', 'questionnaires.json')
Q = json.load(open(P, encoding='utf-8'))
sec = [s for s in Q['habitation']['sections'] if s['t'] == 'Vous et ce bien'][0]
F = sec['f']

MAX_P, MAX_E = 4, 5


def bloc(base, qui, nb_key, n):
    out = []
    for i in range(1, n + 1):
        show = [nb_key, [str(k) for k in range(i, n + 1)]]
        t = '%s %d' % (qui, i)
        out += [
            {'k': '%s%d_nom' % (base, i), 'l': '%s – nom' % t, 'req': 1, 'w': 2, 'show': show},
            {'k': '%s%d_prenom' % (base, i), 'l': '%s – prénom' % t, 'req': 1, 'w': 2, 'show': show},
            {'k': '%s%d_naissance' % (base, i), 'l': '%s – date de naissance' % t, 'type': 'date', 'req': 1, 'w': 2, 'show': show},
            {'k': '%s%d_ville' % (base, i), 'l': '%s – ville de naissance' % t, 'req': 1, 'w': 2, 'show': show, 'ph': 'Ex. Fort-de-France'},
        ]
    return out


# retire une version précédente (idempotence)
F[:] = [f for f in F if not (f['k'].startswith('autre') and f['k'][5:6].isdigit()) and not (f['k'].startswith('enfant') and f['k'][6:7].isdigit())
        and f['k'] not in ('autres_assures_noms', 'nb_autres')]

ks = [f['k'] for f in F]
i = ks.index('autres_assures') + 1
F[i:i] = [{'k': 'nb_autres', 'l': 'Combien de personnes ?', 'type': 'select', 'o': [str(k) for k in range(1, MAX_P + 1)], 'req': 1,
           'show': ['autres_assures', 'Oui'], 's': 'Nombre d\'autres personnes à assurer'}] + bloc('autre', 'Personne', 'nb_autres', MAX_P)

ks = [f['k'] for f in F]
j = ks.index('nb_enfants')
F[j] = {'k': 'nb_enfants', 'l': 'Combien ?', 'type': 'select', 'o': [str(k) for k in range(1, MAX_E + 1)], 'req': 1,
        'show': ['enfants', 'Oui'], 's': "Nombre d'enfants scolarisés"}
F[j + 1:j + 1] = bloc('enfant', 'Enfant', 'nb_enfants', MAX_E)

json.dump(Q, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('Vous et ce bien :', len(F), 'questions')
