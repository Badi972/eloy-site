"""Contrôle technique hebdomadaire du site Eloy (ajouté le 23/10/2026, à la demande de Bradley).
Usage : python3 tools/verifier_site.py            -> rapport en texte (à joindre au récapitulatif du lundi)
Vérifie, sans rien modifier :
 - titres Google : 70 caractères au plus (Bing signale une erreur au-delà), 60 conseillés (Google coupe vers 60) ;
 - descriptions Google : entre 25 et 160 caractères ;
 - liens internes des guides, des articles et des pages territoires : la page visée doit exister ;
 - un seul titre h1 dans le gabarit de chaque guide et de chaque article.
Les pages fixes ont un seul h1 grâce au script « Un seul titre h1 par page » de src/eloy.html.
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
src = open(os.path.join(ROOT, 'src', 'eloy.html'), encoding='utf-8').read()
routes = json.load(open(os.path.join(ROOT, 'tools', 'routes.json'), encoding='utf-8'))
TOK = dict(routes['tok'])
ALIAS = routes.get('alias', {})

def const_json(name):
    i = src.index('const %s=' % name) + len('const %s=' % name)
    return json.JSONDecoder().raw_decode(src[i:])[0]

G = const_json('GUIDES')
from territoires import T
for k, v in T.items():
    G[k] = v
import datetime
today = (datetime.datetime.utcnow() - datetime.timedelta(hours=4)).date().isoformat()
for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'articles', '*.json'))):
    n = os.path.basename(f)
    if n.startswith('_') or n in ('calendrier.json', 'seo_calendrier.json', 'facecam.json'):
        continue
    a = json.load(open(f, encoding='utf-8'))
    if a.get('statut') == 'annule' or a.get('date', '9999') > today:
        continue
    G['guide-' + a['slug']] = a
    TOK['guide-' + a['slug']] = '/guides/' + a['slug']
PATHS = set(TOK.values()) | set(ALIAS.keys()) | {'/contact', '/', '/a-propos', '/mentions-legales'}

err, warn = [], []
def chk_title(where, t):
    if not t:
        warn.append('%s : pas de titre Google' % where); return
    if len(t) > 70: err.append('%s : titre Google de %d caractères (70 max.) : « %s »' % (where, len(t), t))
    elif len(t) > 60: warn.append('%s : titre Google de %d caractères (60 conseillés)' % (where, len(t)))
def chk_desc(where, d):
    if not d: return
    if len(d) > 160 or len(d) < 25: err.append('%s : description Google de %d caractères (25 à 160)' % (where, len(d)))
def chk_links(where, html):
    for h in re.findall(r'href=["\']([^"\']+)["\']', html):
        if h.startswith('http') or h.startswith('mailto:') or h.startswith('tel:'): continue
        if h.startswith('#'):
            if h[1:] not in TOK and h[1:] not in G and h[1:] not in ('contact', 'rsim', 'p-demande'):
                err.append('%s : lien interne inconnu %s' % (where, h))
            continue
        p = h.split('#')[0].rstrip('/') or '/'
        if p not in PATHS: err.append('%s : lien vers une page qui n\'existe pas : %s' % (where, h))

# Valeurs réellement en ligne : le CMS Webflow peut différer du code (titres raccourcis le 22/10/2026).
# On retrouve la valeur du CMS en comparant l'empreinte (tools/cms_base.json) à plusieurs candidats.
cb = ns = None
try:
    _s = open(os.path.join(ROOT, 'tools', 'cms_base.py'), encoding='utf-8').read()
    ns = {'__file__': os.path.join(ROOT, 'tools', 'cms_base.py')}
    exec(_s.split('d = json.load(open(sys.argv[1]))')[0], ns)
    cb = json.load(open(os.path.join(ROOT, 'tools', 'cms_base.json'), encoding='utf-8'))
except Exception:
    cb = None
CSV = {}
try:
    for line in open(os.path.join(ROOT, 'tools', 'titres_google_guides.csv'), encoding='utf-8-sig').read().splitlines()[1:]:
        c = line.split(';')
        if len(c) >= 4: CSV[c[0].replace('/guides/', '')] = [c[1], c[3]]
except Exception:
    pass
inconnus = []
def live(kind, key, field, cands):
    cands = [c for c in cands if c]
    if not cb or key not in cb.get(kind, {}) or field not in cb[kind][key]:
        return cands[0] if cands else None
    target = cb[kind][key][field]
    for c in cands:
        if ns['fp'](c, False) == target: return c
    inconnus.append('%s %s' % (key, field))
    return None

# Guides, articles, pages territoires
for k, g in G.items():
    slug = k[6:]; where = 'Guide /guides/' + slug
    # Titres raccourcis dans le CMS le 22/10/2026 (tools/titres_google_guides.csv) : c'est la nouvelle valeur qui est en ligne
    t = CSV[slug][1] if slug in CSV else live('gui', slug, 'titre-google', [g.get('mt')])
    d = live('gui', slug, 'description-google', [g.get('md')])
    if t: chk_title(where, t)
    if d: chk_desc(where, d)
    body = ''.join(b for h, b in g.get('body', []))
    chk_links(where, body)
    if '<h1' in body: err.append('%s : un h1 dans le texte (le titre du guide est déjà le h1)' % where)

# Fiches produits : titre = metaT, ou « <nom> en Martinique, Guadeloupe et Guyane | Eloy »
labels = dict(re.findall(r'\n  (\w+):\{u:"[^"]*",label:"([^"]*)"', src))
ci = src.index('const CONTENT')
for k, lab in labels.items():
    m = re.search(r'\n  %s:\{menu:(.*?)\n  \w+:\{menu:' % k, src[ci:], re.S)
    blk = m.group(1) if m else ''
    mt = re.search(r'metaT:"([^"]*)"', blk); md = re.search(r'metaD:"([^"]*)"', blk)
    where = 'Fiche ' + TOK.get(k, k)
    t = live('sol', k, 'titre-google', [mt.group(1) if mt else None, lab + ' en Martinique, Guadeloupe et Guyane | Eloy'])
    if t: chk_title(where, t)
    d = live('sol', k, 'description-google', [md.group(1) if md else None])
    if d: chk_desc(where, d)

# Pages fixes (titres du script « Référencement par vue ») et accueil
m = re.search(r'var M=\{(.*?)\n  \};', src, re.S)
if m:
    for key, t in re.findall(r'\n    "?([\w-]+)"?:\["([^"]+)"', m.group(1)):
        t = t.replace('"+T', '').replace('+T', '')
        if t.endswith('"'): t = t[:-1]
        full = t + (' en Martinique, Guadeloupe et Guyane | Eloy' if '+T' in m.group(1).split(key, 1)[1].split('\n')[0] else '')
        chk_title('Page ' + key, full)
b = open(os.path.join(ROOT, 'tools', 'build.py'), encoding='utf-8').read()
nt = re.search(r'OLD_T, NEW_T = "[^"]*", "([^"]*)"', b)
if nt: chk_title('Accueil', nt.group(1))
dm = re.search(r'<meta name="description" content="([^"]*)"', src)
if dm: chk_desc('Accueil', dm.group(1))

print('CONTRÔLE TECHNIQUE DU SITE (%d guides et articles, %d fiches)' % (len(G), len(labels)))
if not err and not warn: print('Aucun problème.')
if inconnus: print('\n(%d champs modifiés directement dans le CMS, non vérifiés ici)' % len(inconnus))
if err:
    print('\nÀ corriger (%d) :' % len(err)); [print(' - ' + e) for e in err]
if warn:
    print('\nÀ surveiller (%d) :' % len(warn)); [print(' - ' + w) for w in warn[:40]]
    if len(warn) > 40: print(' … et %d autres' % (len(warn) - 40))
