"""Ajoute la vidéo YouTube d'un article (décision de Bradley du 23/10/2026 : une vidéo face caméra par article).
Usage : python3 tools/video_article.py <fichier article .json> <lien YouTube> <durée m:ss> [titre]
Écrit le champ "video" : {id, titre, description, date, duree}. Le site affiche alors un lecteur léger sous l'introduction
(miniature seule, le lecteur YouTube se charge au clic) et ajoute les données VideoObject pour Google.
Ensuite : build, commit, push, sha du script dans le pied de page Webflow, publication du site (comme un article).
"""
import json, re, sys, datetime

f, url, duree = sys.argv[1], sys.argv[2], sys.argv[3]
m = re.search(r'(?:v=|youtu\.be/|/shorts/|/embed/|/live/)([A-Za-z0-9_-]{11})', url) or re.fullmatch(r'([A-Za-z0-9_-]{11})', url)
if not m:
    sys.exit('Lien YouTube non reconnu : ' + url)
mm, ss = (duree.split(':') + ['0'])[:2] if ':' in duree else ('0', duree)
a = json.load(open(f, encoding='utf-8'))
a['video'] = {
    'id': m.group(1),
    'titre': sys.argv[4] if len(sys.argv) > 4 else a['t'],
    'description': a.get('md', ''),
    'date': (datetime.datetime.utcnow() - datetime.timedelta(hours=4)).date().isoformat(),
    'duree': 'PT%dM%dS' % (int(mm), int(ss)),
}
json.dump(a, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('vidéo ajoutée :', a['video'])
