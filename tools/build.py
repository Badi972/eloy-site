#!/usr/bin/env python3
"""Construit dist/ (eloy.css, eloy.js, img/) a partir de la page Claude eloy.html.
Usage : python3 tools/build.py chemin/vers/eloy.html"""
import re, sys, json, base64, hashlib, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
MAP = json.load(open(os.path.join(ROOT, 'tools', 'routes.json')))
# Formulaire natif Webflow utilise pour envoyer les demandes (page modele Solutions)
FORM = {'name': 'Demande site Eloy', 'pageId': '6ac7ef6e8fe8a48828db873b', 'elementId': 'ebd70186-5f7b-3642-ccf3-2ab44b9c3196'}
s = open(SRC, encoding='utf-8').read()
dist = os.path.join(ROOT, 'dist'); img = os.path.join(dist, 'img')
os.makedirs(img, exist_ok=True)

st = s.index('<style>'); se = s.index('</style>', st)
head, css, rest = s[:st], s[st + 7:se], s[se + 8:]
fs = rest.index('<script>')
markup, scripts_html = rest[:fs], rest[fs:]

def save_img(m):
    mime, data = m.group(1), m.group(2)
    raw = base64.b64decode(data)
    ext = {'png': 'png', 'jpeg': 'jpg', 'jpg': 'jpg', 'webp': 'webp', 'svg+xml': 'svg', 'gif': 'gif'}[mime]
    name = hashlib.sha1(raw).hexdigest()[:12] + '.' + ext
    open(os.path.join(img, name), 'wb').write(raw)
    return '__ELOYB__img/' + name
B64 = r'data:image/([a-z+]+);base64,([A-Za-z0-9+/=]{800,})'
markup = re.sub(B64, save_img, markup)
css = re.sub(B64, lambda m: save_img(m).replace('__ELOYB__', ''), css)
open(os.path.join(dist, 'eloy.css'), 'w', encoding='utf-8').write(css)

ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', head, re.S).group(1)
title = re.search(r'<title>(.*?)</title>', head, re.S).group(1)
desc = re.search(r'<meta name="description" content="([^"]*)"', head).group(1)
icon = save_img(re.search(B64, re.search(r'<link rel="icon" href="([^"]+)"', head).group(1)))

scripts = re.findall(r'<script>(.*?)</script>', scripts_html, re.S)
assert sum(len(x) for x in scripts) > 1_000_000, 'scripts introuvables'

def rep(code, old, new, n=1):
    c = code.count(old)
    assert c == n, (old, c)
    return code.replace(old, new)
m = scripts[0]
m = rep(m, 'function navigate(tok){ if(location.hash.slice(1)===tok) route(); else location.hash=tok; }',
        'function navigate(tok){ __ELOY.nav(tok); }')
m = rep(m, 'const h=location.hash.slice(1).split("?")[0];', 'const h=__ELOY.tok;')
m = rep(m, 'window.addEventListener("hashchange",route);', 'window.addEventListener("hashchange",function(){__ELOY.onHash();});')
m = rep(m, '\nroute();\n', '\n__ELOY.route(true);\n')
m = rep(m, 'history.pushState(null,"","#accueil")', 'history.pushState(null,"","/"+location.search)')
scripts[0] = m
# Demandes : envoyees par le formulaire natif Webflow (voir runtime.js, partie 5)
LEADS = {'var LEAD_ENDPOINT_ASSUREVO = null;': 'var LEAD_ENDPOINT_ASSUREVO = "eloy-webflow:assurance";',
         'var LEAD_ENDPOINT_CRM_RAC  = null;': 'var LEAD_ENDPOINT_CRM_RAC  = "eloy-webflow:rachat";',
         'var LEAD_ENDPOINT_EMAIL    = null;': 'var LEAD_ENDPOINT_EMAIL    = "eloy-webflow:contact";',
         'var PARTNER_ENDPOINT       = null;': 'var PARTNER_ENDPOINT       = "eloy-webflow:partenaire";'}
for old, new in LEADS.items():
    hits = [i for i, x in enumerate(scripts) if old in x]
    assert len(hits) == 1 and scripts[hits[0]].count(old) == 1, old
    scripts[hits[0]] = scripts[hits[0]].replace(old, new)
for i in range(1, len(scripts)):
    scripts[i] = scripts[i].replace('history.pushState(null,"","#accueil")', 'history.pushState(null,"","/"+location.search)')

runtime = open(os.path.join(ROOT, 'tools', 'runtime.js'), encoding='utf-8').read()
cfg = {'markup': markup, 'scripts': scripts, 'ld': ld, 'title': title, 'desc': desc, 'icon': icon,
       'routes': MAP, 'form': FORM}
js = runtime.replace('/*__CFG__*/null', json.dumps(cfg, ensure_ascii=False))
open(os.path.join(dist, 'eloy.js'), 'w', encoding='utf-8').write(js)
print('css', len(css), 'js', len(js), 'img', len(os.listdir(img)))
