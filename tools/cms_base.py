#!/usr/bin/env python3
"""Empreintes des contenus CMS Webflow tels qu'importes (sert a reperer les fiches modifiees ensuite).
Usage : python3 tools/cms_base.py export_cms.json  -> tools/cms_base.json
export_cms.json = {"sol": [{"f": fieldData}...], "gui": [{"f": fieldData}...]}"""
import json, re, sys, os
from html.parser import HTMLParser
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOL_PLAIN = ["name", "accroche", "resume-menu", "titre-h1", "chapo", "point-cle-1", "point-cle-2", "point-cle-3", "a-savoir",
             "note-pieces", "titre-google", "description-google", "titre-garanties", "surtitre-garanties", "titre-metiers",
             "note-metiers", "texte-du-bouton"]
SOL_RICH = ["garanties", "pour-qui", "faq", "pieces-pour-le-devis", "pieces-pour-la-souscription", "metiers", "exemples-de-sinistres"]
GUI_PLAIN = ["name", "extrait", "introduction", "titre-google", "description-google", "encadre-titre", "encadre-texte",
             "bouton-1-libelle", "bouton-2-libelle", "avertissement", "temps-de-lecture", "bouton-1-lien", "bouton-2-lien"]
GUI_RICH = ["contenu"]
WS = re.compile(r'[\s  ​‌‍﻿]')

class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.t = []; s.h = []
    def handle_starttag(s, tag, attrs):
        if tag == 'a': s.h.append(dict(attrs).get('href') or '')
    def handle_data(s, d): s.t.append(d)

def fnv(s):
    h = 0x811c9dc5
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xffffffff
    return base36(h)

def base36(n):
    a = '0123456789abcdefghijklmnopqrstuvwxyz'; o = ''
    while True:
        n, r = divmod(n, 36); o = a[r] + o
        if not n: return o

def fp(v, rich):
    if v is None: v = ''
    if not rich: return fnv(WS.sub('', str(v)))
    p = P(); p.feed(v); p.close()
    return fnv(WS.sub('', ''.join(p.t)) + '#' + '|'.join(p.h))

d = json.load(open(sys.argv[1]))
out = {'sol': {}, 'gui': {}}
for it in d['sol']:
    f = it['f']; k = f.get('cle-formulaire')
    if not k or it.get('isArchived'): continue
    out['sol'][k] = {x: fp(f.get(x), False) for x in SOL_PLAIN}
    out['sol'][k].update({x: fp(f.get(x), True) for x in SOL_RICH})
for it in d['gui']:
    f = it['f']
    out['gui'][f['slug']] = {x: fp(f.get(x), False) for x in GUI_PLAIN}
    out['gui'][f['slug']].update({x: fp(f.get(x), True) for x in GUI_RICH})
json.dump(out, open(os.path.join(ROOT, 'tools', 'cms_base.json'), 'w'), separators=(',', ':'))
print(len(out['sol']), len(out['gui']))
