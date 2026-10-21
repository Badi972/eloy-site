"""Carrousel Eloy (diapositives 1080 x 1350, PNG) à partir d'un JSON.
Usage : python3 tools/carrousel.py tools/articles/_carrousels/<date>-<slug>.json dist/img/carrousels/<date>/
JSON : {"rubrique": "Assurance habitation", "titre": "5 points à vérifier…", "sous_titre": "…",
        "points": [{"t": "Titre court du point", "p": "Une ou deux phrases."}, …]  (3 à 6 points),
        "fin": {"t": "Besoin d'un avis ?", "p": "Bilan gratuit, à distance.", "page": "/solutions/assurance-habitation"},
        "legal": "mentions obligatoires si crédit ou défiscalisation (sinon vide)"}
Produit 01.png (couverture), 02.png … (un point par diapositive), puis la diapositive de fin.
"""
import html, json, os, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
fdir = os.path.join(ROOT, 'tools', '.fonts')
if not os.path.isdir(os.path.join(fdir, 'package')):
    os.makedirs(fdir, exist_ok=True)
    subprocess.run('npm pack @fontsource/plus-jakarta-sans@5.0.20 >/dev/null 2>&1 && tar xzf fontsource-plus-jakarta-sans-5.0.20.tgz', shell=True, cwd=fdir, check=True)
F = os.path.join(fdir, 'package', 'files', 'plus-jakarta-sans-latin-%s-normal.woff2')
ff = ''.join("@font-face{font-family:J;font-weight:%s;src:url('file://%s')}" % (w, F % w) for w in (500, 700, 800))
img = os.path.join(ROOT, 'dist', 'img'); E = html.escape
n = len(c['points']); total = n + 2
CSS = ff + """body{margin:0}.r{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:J,sans-serif;box-sizing:border-box;padding:92px 88px;display:flex;flex-direction:column}
.b{background:#1B66F7;color:#fff}.l{background:#EAF1FE;color:#0B1220}
.w{position:absolute;height:1500px;right:-330px;top:120px;opacity:.12;filter:blur(2.5px)}
.top{display:flex;justify-content:space-between;align-items:center}.logo{width:210px}
.k{font-size:28px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.b .k{color:#EAF1FE}.l .k{color:#1B66F7}
.pg{font-size:28px;font-weight:700;opacity:.7}
h1{margin:auto 0 0;font-size:92px;line-height:1.04;font-weight:800;letter-spacing:-.015em}
h2{margin:0;font-size:74px;line-height:1.08;font-weight:800;letter-spacing:-.01em}
.sub{margin:30px 0 0;font-size:40px;line-height:1.35;font-weight:500;color:#EAF1FE}
.num{width:132px;height:132px;border-radius:36px;background:#1B66F7;color:#fff;font-size:68px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:auto 0 44px}
.txt{margin-top:34px;font-size:42px;line-height:1.42;font-weight:500;color:#4A5672}
.sw{margin-top:auto;display:flex;align-items:center;gap:14px;font-size:30px;font-weight:700}
.b .sw{color:#EAF1FE}.l .sw{color:#1B66F7}
.f{margin-top:60px;padding-top:28px;border-top:2px solid rgba(255,255,255,.45);display:flex;justify-content:space-between;font-size:30px;font-weight:700}
.l .f{border-top-color:#C9D8F6;color:#0B1220}
.btn{margin-top:44px;display:inline-block;background:#fff;color:#1B66F7;font-size:40px;font-weight:800;padding:26px 40px;border-radius:24px;align-self:flex-start}
.legal{margin-top:26px;font-size:24px;line-height:1.4;font-weight:500;opacity:.85}
"""
logo_b = f'<img class="logo" src="file://{img}/logo-blanc.svg">'
logo_l = f'<img class="logo" src="file://{ROOT}/tools/motion/assets/logo-bleu.png">'
foot = '<div class="f"><span>eloy-assurances-patrimoine.fr</span><span>06 96 33 29 09</span></div>'
slides = []
slides.append(f'<div class="r b"><img class="w" src="file://{img}/y-blanc.svg"><div class="top">{logo_b}<span class="pg">1/{total}</span></div>'
              f'<h1>{E(c["titre"])}</h1><p class="sub">{E(c.get("sous_titre", ""))}</p><div class="sw" style="margin-top:56px">Faites glisser →</div>{foot}</div>')
for i, pt in enumerate(c['points']):
    slides.append(f'<div class="r l"><div class="top"><span class="k">{E(c["rubrique"])}</span><span class="pg">{i + 2}/{total}</span></div>'
                  f'<div class="num">{i + 1}</div><h2>{E(pt["t"])}</h2><p class="txt">{E(pt["p"])}</p>'
                  f'<div class="f" style="margin-top:auto">{logo_l}<span style="align-self:center;color:#1B66F7">Faites glisser →</span></div></div>')
fin = c.get('fin', {})
lg = f'<p class="legal">{E(c["legal"])}</p>' if c.get('legal') else ''
slides.append(f'<div class="r b"><img class="w" src="file://{img}/y-blanc.svg"><div class="top">{logo_b}<span class="pg">{total}/{total}</span></div>'
              f'<h1>{E(fin.get("t", "Besoin d’un avis ?"))}</h1><p class="sub">{E(fin.get("p", "Bilan gratuit, à distance, par téléphone ou WhatsApp."))}</p>'
              f'<span class="btn">Lien en bio</span>{lg}{foot}</div>')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350})
    for k, s in enumerate(slides):
        tmp = os.path.join(out, f'_{k}.html')
        open(tmp, 'w', encoding='utf-8').write(f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{s}</body></html>')
        pg.goto('file://' + os.path.abspath(tmp)); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(out, f'{k + 1:02d}.png')); os.remove(tmp)
    b.close()
print(out, total, 'diapositives')
