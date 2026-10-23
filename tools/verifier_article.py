"""Controle d'un article hebdomadaire Eloy et preparation de la fiche CMS Webflow.
Usage : python3 tools/verifier_article.py tools/articles/2026-10-29-slug.json
- Refuse l'article (code 1) si une regle bloquante de la charte n'est pas respectee.
- Ecrit tools/articles/_cms/<slug>.json : le fieldData a envoyer a la collection Guides.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.eloy-assurances-patrimoine.fr'
p = sys.argv[1]
a = json.load(open(p, encoding='utf-8'))
err = []
for f in ('slug', 'date', 't', 'mt', 'md', 'ex', 'intro', 'body', 'cat', 'min', 'cta', 'rel', 'posts'):
    if f not in a:
        err.append('champ manquant : ' + f)
txt = json.dumps(a, ensure_ascii=False).lower()
INTERDITS = ['comparateur', 'nous comparons', 'comparez', 'meilleur tarif', 'moins cher', 'le moins cher', 'perte de loyer',
             'assurance auto', 'assurance automobile', 'kase', 'markel', 'cap 100', 'creatis', 'sygma', 'cofidis', 'cetelem',
             'axa', 'allianz', 'generali', 'swisslife', 'swiss life', 'april', 'groupama', 'maaf', 'macif', 'banque postale', 'my money']
for w in INTERDITS:
    if re.search(r'(?<![a-zà-ÿ])' + re.escape(w) + r'(?![a-zà-ÿ])', txt):
        err.append('mot interdit : ' + w)
if re.search(r'\bassureur conseil\b|\bnotre assurance\b', txt):
    err.append('Eloy est courtier, pas assureur')
credit = a.get('cat') in ('Rachat de crédits', 'Financement pro')
if credit and 'un crédit vous engage et doit être remboursé' not in txt:
    err.append('mention obligatoire crédit absente (champ legal)')
if len(a.get('mt', '')) > 60: err.append('titre Google > 60 caractères')
if len(a.get('md', '')) > 160: err.append('description Google > 160 caractères')
words = len(re.sub('<[^>]+>', ' ', ' '.join(h + ' ' + b for h, b in a.get('body', []))).split()) + len(a.get('intro', '').split())
if words < 700: err.append('article trop court (%d mots)' % words)
# Article SEO (type "seo") et pages « site de référence » (type "reference", 23/10/2026) : seul le post Google Business est demandé
for net in (('gmb',) if a.get('type') in ('seo', 'reference') else ('gmb', 'facebook', 'instagram', 'linkedin', 'tiktok')):
    if net not in a.get('posts', {}): err.append('post manquant : ' + net)
if a.get('posts', {}).get('gmb') and len(a['posts']['gmb']) > 1500: err.append('post Google > 1500 caractères')
if err:
    print('REFUSE'); [print(' -', e) for e in err]; sys.exit(1)

routes = json.load(open(os.path.join(ROOT, 'tools', 'routes.json')))['tok']
def lien(h):
    if h.startswith('http'): return h
    if h.startswith('#'):
        return SITE + routes.get(h[1:], '/' + h[1:])
    return SITE + h
cta = a['cta']; btn = cta.get('a', [])
fd = {
    'name': a['t'], 'slug': a['slug'], 'temps-de-lecture': int(a['min']),
    'date-de-mise-a-jour': a['date'] + 'T12:00:00.000Z', 'extrait': a['ex'], 'introduction': a['intro'],
    'contenu': ''.join('<h2>%s</h2>%s' % (h, b) for h, b in a['body']),
    'titre-google': a['mt'], 'description-google': a['md'],
    'encadre-titre': cta.get('t', ''), 'encadre-texte': cta.get('p', ''),
    'avertissement': a.get('legal', ''),
}
for i, (h, l) in enumerate(btn[:2], 1):
    fd['bouton-%d-libelle' % i] = l; fd['bouton-%d-lien' % i] = lien(h)
os.makedirs(os.path.join(ROOT, 'tools', 'articles', '_cms'), exist_ok=True)
out = os.path.join(ROOT, 'tools', 'articles', '_cms', a['slug'] + '.json')
json.dump(fd, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('OK', words, 'mots ->', out)
