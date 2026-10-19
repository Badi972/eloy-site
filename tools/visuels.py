"""Visuels de posts Eloy avec photo, en 3 formats, à partir d'un article et d'une photo.
Usage : python3 tools/visuels.py tools/articles/2026-10-29-slug.json dist/img/photos/2026-10-29.png [dossier_sortie]
Écrit dans dist/img/posts/ (ou le dossier donné) :
  <date>.png      1080 x 1350 (4:5)  Instagram, Facebook, LinkedIn, et la vignette du Studio
  <date>-43.png   1200 x 900  (4:3)  Google Business
  <date>-916.png  1080 x 1920 (9:16) TikTok
Textes : visuel.titre, visuel.sous_titre et visuel.rubrique (sinon la rubrique « cat » de l'article).
Charte : bleu #1B66F7, bleu clair #EAF1FE, encre #0B1220, Plus Jakarta Sans, logo blanc, « y » en filigrane.
"""
import html, json, os, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = json.load(open(sys.argv[1], encoding='utf-8'))
photo = os.path.abspath(sys.argv[2])
out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, 'dist', 'img', 'posts')
os.makedirs(out, exist_ok=True)
v = a.get('visuel', {})
titre, sous = v.get('titre', a['t']), v.get('sous_titre', '')
rub = v.get('rubrique') or a.get('cat', '')
fdir = os.path.join(ROOT, 'tools', '.fonts')
if not os.path.isdir(os.path.join(fdir, 'package')):
    os.makedirs(fdir, exist_ok=True)
    subprocess.run('npm pack @fontsource/plus-jakarta-sans@5.0.20 >/dev/null 2>&1 && tar xzf fontsource-plus-jakarta-sans-5.0.20.tgz', shell=True, cwd=fdir, check=True)
F = os.path.join(fdir, 'package', 'files', 'plus-jakarta-sans-latin-%s-normal.woff2')
ff = ''.join("@font-face{font-family:J;font-weight:%s;src:url('file://%s')}" % (w, F % w) for w in (500, 700, 800))
img = os.path.join(ROOT, 'dist', 'img')
E = html.escape

# (nom, largeur, hauteur, disposition, tailles)
FORMATS = [
    ('', 1080, 1350, 'haut', dict(photo=760, h1=70, p=31, k=24, pad=72, logo=170, f=24)),
    ('-43', 1200, 900, 'cote', dict(photo=0, h1=58, p=26, k=20, pad=56, logo=130, f=18)),
    ('-916', 1080, 1920, 'haut', dict(photo=1040, h1=84, p=36, k=26, pad=80, logo=190, f=26, bas=230)),
]

def page(w, h, mode, s):
    band = f"""<div class="band"><img class="wm" src="file://{img}/y-blanc.svg">
      <div class="k">{E(rub)}</div><h1>{E(titre)}</h1>{f'<p>{E(sous)}</p>' if sous else ''}
      <div class="f"><img class="logo" src="file://{img}/logo-blanc.svg"><div class="c"><span>eloy-assurances-patrimoine.fr</span><span>06 96 33 29 09</span></div></div></div>"""
    if mode == 'haut':
        lay = f""".r{{display:flex;flex-direction:column}} .ph{{height:{s['photo']}px;flex:none}}
        .band{{flex:1;padding:{s['pad']}px {s['pad']}px {s.get('bas', s['pad'])}px}}"""
    else:
        lay = f""".r{{display:grid;grid-template-columns:52% 48%}} .ph{{height:100%}}
        .band{{padding:{s['pad']}px}}"""
    return f"""<html><head><meta charset="utf-8"><style>{ff}
    body{{margin:0}} .r{{width:{w}px;height:{h}px;overflow:hidden;background:#1B66F7;font-family:J,sans-serif;color:#fff}}
    {lay}
    .ph{{position:relative;background:url('file://{photo}') center/cover no-repeat}}
    .ph::after{{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,18,32,0) 70%,rgba(11,18,32,.18))}}
    .band{{position:relative;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box}}
    .wm{{position:absolute;height:135%;right:-30%;top:-18%;opacity:.11;filter:blur(2.5px)}}
    .k{{position:relative;font-size:{s['k']}px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#EAF1FE}}
    h1{{position:relative;margin:{int(s['k']*0.7)}px 0 0;font-size:{s['h1']}px;line-height:1.06;font-weight:800;letter-spacing:-.015em;text-wrap:balance}}
    p{{position:relative;margin:{int(s['p']*0.7)}px 0 0;font-size:{s['p']}px;line-height:1.35;font-weight:500;color:#EAF1FE;text-wrap:pretty}}
    .f{{position:relative;margin-top:auto;padding-top:{int(s['f']*1.1)}px;border-top:2px solid rgba(255,255,255,.4);display:flex;justify-content:space-between;align-items:center;gap:20px}}
    .logo{{width:{s['logo']}px}} .c{{display:flex;flex-direction:column;align-items:flex-end;font-size:{s['f']}px;font-weight:700;line-height:1.4;white-space:nowrap}}
    </style></head><body><div class="r"><div class="ph"></div>{band}</div></body></html>"""

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for suf, w, h, mode, s in FORMATS:
        tmp = os.path.join(out, '_tmp%s.html' % suf)
        open(tmp, 'w', encoding='utf-8').write(page(w, h, mode, s))
        pg = b.new_page(viewport={'width': w, 'height': h})
        pg.goto('file://' + os.path.abspath(tmp)); pg.wait_for_timeout(500)
        # sécurité : si le titre déborde, on réduit la police jusqu'à ce que tout tienne
        for _ in range(12):
            over = pg.evaluate("(()=>{const f=document.querySelector('.f').getBoundingClientRect(),t=[...document.querySelectorAll('h1,p')].pop().getBoundingClientRect(),b=document.querySelector('.band').getBoundingClientRect();return t.bottom>f.top-24||f.bottom>b.bottom+1})()")
            if not over: break
            pg.evaluate("document.querySelectorAll('h1,p').forEach(e=>e.style.fontSize=(parseFloat(getComputedStyle(e).fontSize)*0.93)+'px')")
        dest = os.path.join(out, a['date'] + suf + '.png')
        pg.screenshot(path=dest); pg.close(); os.remove(tmp)
        print(dest)
    b.close()
