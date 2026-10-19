#!/usr/bin/env python3
"""Construit dist/ (eloy.css, eloy.js, img/) a partir de la page Claude eloy.html.
Usage : python3 tools/build.py chemin/vers/eloy.html"""
import re, sys, json, base64, hashlib, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
MAP = json.load(open(os.path.join(ROOT, 'tools', 'routes.json')))
# Formulaire natif Webflow utilise pour envoyer les demandes (page modele Solutions)
FORM = {'name': "Demande de devis ou d'etude", 'pageId': '6ac7ef6e8fe8a48828db873b', 'elementId': 'ebd70186-5f7b-3642-ccf3-2ab44b9c3196'}
s = open(SRC, encoding='utf-8').read()
dist = os.path.join(ROOT, 'dist'); img = os.path.join(dist, 'img')
os.makedirs(img, exist_ok=True)

st = s.index('<style>'); se = s.index('</style>', st)
head, css, rest = s[:st], s[st + 7:se], s[se + 8:]
fs = rest.index('<script>')
markup, scripts_html = rest[:fs], rest[fs:]
# Hebergeur reel depuis la mise en ligne sur Webflow (18/10/2026)
assert markup.count('Hébergeur : IONOS') == 1
markup = markup.replace('Hébergeur : IONOS', 'Hébergeur : Webflow, Inc., 398 11th Street, 2nd Floor, San Francisco, CA 94103, États-Unis')

# Page Mentions legales (19/10/2026) : vraie page au lieu du simple renvoi vers le bas de page
_LG = '<li><a href="#legal">Mentions légales</a></li>'
assert markup.count(_LG) == 1
markup = markup.replace(_LG, '<li><a href="#mentions-legales">Mentions légales</a></li>')
_MENT = open(os.path.join(ROOT, 'tools', 'mentions.html'), encoding='utf-8').read()
_ci = markup.index('<main id="conf"'); _cj = markup.index('</main>', _ci) + len('</main>')
markup = markup[:_cj] + '\n' + _MENT + markup[_cj:]

# Pied de page : liens vers les pages territoires
_FT = '<li><a href="#contact">Contact</a></li>'
assert markup.count(_FT) == 1
markup = markup.replace(_FT, '<li><a href="#guide-courtier-assurance-credit-martinique">Courtier en Martinique</a></li><li><a href="#guide-courtier-assurance-credit-guadeloupe">Courtier en Guadeloupe</a></li><li><a href="#guide-courtier-assurance-credit-guyane">Courtier en Guyane</a></li>' + _FT)

# Questions frequentes locales (validees par Bradley le 18/10/2026) : remplacent ou precedent celles de chaque rubrique
import html as _h
_F = json.load(open(os.path.join(ROOT, 'tools', 'faq_local.json'), encoding='utf-8'))
for e in [x for x in _F if x.get('replace')] + [x for x in _F if not x.get('replace')][::-1]:
    attrs = ' data-space="%s"' % e['space'] + (' data-fsub="%s"' % e['fsub'] if e['fsub'] else '') + ('' if e['space'] == 'credit' else ' hidden')
    item = '<details%s><summary>%s</summary><p>%s</p></details>' % (attrs, e['q'], e['a'])
    if e.get('replace'):
        mm = re.findall(r'<details[^>]*><summary>' + re.escape(e['replace']) + r'</summary>.*?</details>', markup, re.S)
        assert len(mm) == 1, e['replace']
        markup = markup.replace(mm[0], item)
    else:
        first = re.search(r'<details data-space="%s"' % e['space'], markup)
        assert first, e['space']
        markup = markup[:first.start()] + item + '\n        ' + markup[first.start():]
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
icon = '__ELOYB__img/favicon-192.png'  # favicon carre (y du logo, blanc sur fond bleu), fichiers dans dist/img/favicon-*.png

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
# Guides : le texte complet (intro, contenu, encadre, avertissement) part dans dist/g/<guide>.json,
# charge a la demande par le runtime (E.gload). Le paquet garde titres, extraits et liens.
gi = m.index('const GUIDES={'); gj = gi + len('const GUIDES=')
G, gn = json.JSONDecoder().raw_decode(m[gj:])
HEAVY = ('intro', 'body', 'cta', 'legal')
# Pages territoires (19/10/2026) : Martinique, Guadeloupe, Guyane, rubrique "Nos territoires" en tete des guides
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from territoires import T as _T
for _k, _v in _T.items():
    G[_k] = {f: x for f, x in _v.items() if f != 'slug'}
# Articles hebdomadaires (19/10/2026) : un fichier JSON par article dans tools/articles/ (voir PROCEDURE.md).
# Un article n'entre dans le site qu'a partir de sa date de publication ("date", AAAA-MM-JJ, heure de Martinique).
import datetime as _dt
_today = (_dt.datetime.utcnow() - _dt.timedelta(hours=4)).date().isoformat()
_today = os.environ.get('ELOY_TODAY', _today)
_adir = os.path.join(ROOT, 'tools', 'articles')
for _fn in sorted(os.listdir(_adir)) if os.path.isdir(_adir) else []:
    if not _fn.endswith('.json') or _fn.startswith('_') or _fn == 'calendrier.json':
        continue
    _a = json.load(open(os.path.join(_adir, _fn), encoding='utf-8'))
    if _a.get('date', '9999') > _today or _a.get('statut') == 'annule':
        continue
    _k = 'guide-' + _a['slug']
    G[_k] = {f: x for f, x in _a.items() if f not in ('slug', 'date', 'statut', 'posts', 'visuel')}
    MAP['tok'][_k] = '/guides/' + _a['slug']
    print('article', _a['date'], _a['slug'])
gdir = os.path.join(dist, 'g'); os.makedirs(gdir, exist_ok=True)
for f in os.listdir(gdir): os.remove(os.path.join(gdir, f))
for k, v in G.items():
    json.dump({f: v[f] for f in HEAVY if f in v}, open(os.path.join(gdir, k + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
m = m[:gj] + json.dumps({k: {f: x for f, x in v.items() if f not in HEAVY} for k, v in G.items()}, ensure_ascii=False, separators=(',', ':')) + m[gj + gn:]
m = rep(m, '  const g=GUIDES[k];\n  const toc=',
        '  const g=GUIDES[k];\n  if(!g.__full){M.innerHTML="";__ELOY.gload(k,function(){if(__ELOY.tok===k)renderGuides(k);});return;}\n  const toc=')
m = rep(m, 'const ORDER=["Rachat de crédits",', 'const ORDER=["Nos territoires","Rachat de crédits","Habitation et logement",')
m = rep(m, 'const CONF=document.getElementById("conf");', 'const CONF=document.getElementById("conf");const MENT=document.getElementById("mentions");')
m = rep(m, 'CONF.hidden=v!=="conf";', 'CONF.hidden=v!=="conf";if(MENT)MENT.hidden=v!=="mentions";')
m = rep(m, '  if(h==="confidentialite"){showStatic("conf");window.scrollTo(0,0);return;}',
        '  if(h==="mentions-legales"||h==="legal"){showStatic("mentions");setMeta("Mentions légales | Eloy","Mentions légales du site Eloy : éditeur, hébergement, immatriculation ORIAS, réclamations et médiation.");window.scrollTo(0,0);return;}\n  if(h==="confidentialite"){showStatic("conf");window.scrollTo(0,0);return;}')
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
# Donnees structurees : fiche du cabinet (aussi ecrite en dur dans le <head> du site) et services par rubrique
SITE_LD = open(os.path.join(ROOT, 'tools', 'site_ld.json'), encoding='utf-8').read()
SV_LD = open(os.path.join(ROOT, 'tools', 'services_ld.json'), encoding='utf-8').read()
seo = [i for i, x in enumerate(scripts) if 'var g=[];if(k==="credit")g.push(' in x]
assert len(seo) == 1
x = scripts[seo[0]]; a = x.index('var g=[];if(k==="credit")g.push('); b = x.index('if(faqLd)g.push(faqLd);', a)
scripts[seo[0]] = x[:a] + 'var g=[];var SV=' + SV_LD + ';if(SV[k])g.push(SV[k]);\n    ' + x[b:]
for i in range(1, len(scripts)):
    scripts[i] = scripts[i].replace('history.pushState(null,"","#accueil")', 'history.pushState(null,"","/"+location.search)')

# Titre Google de l'accueil (valide par Bradley le 18/10/2026) : les trois metiers
OLD_T, NEW_T = "Courtier assurance et crédit en Martinique, Guadeloupe, Guyane | Eloy", "Courtier assurance, rachat de crédit et financement pro | Martinique, Guadeloupe, Guyane"
assert title == OLD_T and sum(x.count(OLD_T) for x in scripts) >= 1
title = NEW_T; scripts = [x.replace(OLD_T, NEW_T) for x in scripts]
runtime = open(os.path.join(ROOT, 'tools', 'runtime.js'), encoding='utf-8').read()
cfg = {'markup': markup, 'scripts': scripts, 'ld': SITE_LD, 'title': title, 'desc': desc, 'icon': icon,
       'routes': MAP, 'form': FORM,
       'cmsBase': json.load(open(os.path.join(ROOT, 'tools', 'cms_base.json')))}
js = runtime.replace('/*__CFG__*/null', json.dumps(cfg, ensure_ascii=False))
open(os.path.join(dist, 'eloy.js'), 'w', encoding='utf-8').write(js)
print('css', len(css), 'js', len(js), 'img', len(os.listdir(img)))
