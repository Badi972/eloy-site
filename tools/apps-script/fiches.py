#!/usr/bin/env python3
"""Recopie dans relais-demandes.gs (entre les marqueurs FICHES) la description des questionnaires
tirée de tools/questionnaires.json, pour que le site et le script utilisent exactement les mêmes questions.
Usage : python3 tools/apps-script/fiches.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
Q = json.load(open(os.path.join(ROOT, 'tools', 'questionnaires.json'), encoding='utf-8'))
def envoye(f):
    return f.get('s') or re.sub(r' \((m²|€|%)\)$', '', f['l'])
fiches = {}
for cle, q in Q.items():
    rub, alertes, av, siren = [], [], {}, None
    for sec in q['sections']:
        labels = [envoye(f) for f in sec['f'] if f['k'] not in ('nom', 'prenom', 'tel', 'email')]
        if labels: rub.append([sec['t'], labels])
        for f in sec['f']:
            if f.get('alerte'): alertes.append(envoye(f))
            if f.get('av'): av[envoye(f)] = f['av']
            if f['k'] == 'siren': siren = envoye(f)
    fiches[cle] = {'cle': cle, 'demande': q['demande'], 'court': q['court'], 'produit': q['produit'], 'mail': q['mail'],
                   'sujet': q['sujet'], 'declencheurs': q['declencheurs'], 'rubriques': rub, 'alertes': alertes, 'av': av, 'siren': siren}
js = '/* FICHES:début (généré par tools/apps-script/fiches.py depuis tools/questionnaires.json, ne pas modifier à la main) */\nvar FICHES = ' + \
     json.dumps(fiches, ensure_ascii=False, indent=1) + ';\n/* FICHES:fin */'
p = os.path.join(ROOT, 'tools', 'apps-script', 'relais-demandes.gs')
s = open(p, encoding='utf-8').read()
a, b = s.index('/* FICHES:début'), s.index('/* FICHES:fin */') + len('/* FICHES:fin */')
open(p, 'w', encoding='utf-8').write(s[:a] + js + s[b:])
print('fiches :', ', '.join('%s (%d questions)' % (k, sum(len(r[1]) for r in v['rubriques'])) for k, v in fiches.items()))
