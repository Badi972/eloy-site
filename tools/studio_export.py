"""Prépare les documents du Studio contenu (tableau de bord de Bradley) pour un article de la semaine.
Usage : python3 tools/studio_export.py tools/articles/2026-10-29-slug.json <sha> [metricool.json]
  <sha>           commit qui contient le visuel (lien jsdelivr)
  metricool.json  facultatif : {"gmb": "<plannerUrl>", ...} renvoyé par Metricool à la programmation
Écrit dans tools/articles/_studio/ :
  semaines__<date>.json  -> ArtifactData set, collection "semaines", doc_id <date>
  visuels__<date>.json   -> ArtifactData set, collection "visuels",  doc_id <date> (vignette JPEG en data URI)
"""
import base64, io, json, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.eloy-assurances-patrimoine.fr'
a = json.load(open(sys.argv[1], encoding='utf-8'))
sha = sys.argv[2]
mc = json.load(open(sys.argv[3], encoding='utf-8')) if len(sys.argv) > 3 else {}
d = a['date']
mots = len(re.sub('<[^>]+>', ' ', ' '.join(h + ' ' + b for h, b in a['body'])).split()) + len(a.get('intro', '').split())
png = os.path.join(ROOT, 'dist', 'img', 'posts', d + '.png')
out = os.path.join(ROOT, 'tools', 'articles', '_studio')
os.makedirs(out, exist_ok=True)
sem = {
    'date': d, 'slug': a['slug'], 'url': SITE + '/guides/' + a['slug'], 't': a['t'], 'intro': a['intro'],
    'body': a['body'], 'mots': mots, 'posts': a['posts'], 'metricool': mc,
    'visuel': {**a.get('visuel', {}), 'url': 'https://cdn.jsdelivr.net/gh/Badi972/eloy-site@%s/dist/img/posts/%s.png' % (sha, d)},
}
json.dump(sem, open(os.path.join(out, 'semaines__%s.json' % d), 'w', encoding='utf-8'), ensure_ascii=False)
if os.path.exists(png):
    im = Image.open(png).convert('RGB'); im.thumbnail((432, 540))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=78)
    uri = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    json.dump({'date': d, 'data': uri}, open(os.path.join(out, 'visuels__%s.json' % d), 'w'))
print('OK', out, mots, 'mots')
