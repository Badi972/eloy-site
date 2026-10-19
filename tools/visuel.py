"""Visuel de post Eloy (1080 x 1350, PNG) a partir d'un titre.
Usage : python3 tools/visuel.py "Titre du post" "Sous-titre court" dist/img/posts/2026-10-29.png
Rendu par Playwright (Chromium deja installe). Police : Plus Jakarta Sans (installee par npm si absente).
"""
import os, sys, subprocess, html
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
titre, sous, out = sys.argv[1], sys.argv[2], sys.argv[3]
fdir = os.path.join(ROOT, 'tools', '.fonts')
if not os.path.isdir(os.path.join(fdir, 'package')):
    os.makedirs(fdir, exist_ok=True)
    subprocess.run('npm pack @fontsource/plus-jakarta-sans@5.0.20 >/dev/null 2>&1 && tar xzf fontsource-plus-jakarta-sans-5.0.20.tgz', shell=True, cwd=fdir, check=True)
F = os.path.join(fdir, 'package', 'files', 'plus-jakarta-sans-latin-%s-normal.woff2')
ff = ''.join("@font-face{font-family:J;font-weight:%s;src:url('file://%s')}" % (w, F % w) for w in (500, 700, 800))
img = os.path.join(ROOT, 'dist', 'img')
page = f"""<html><head><meta charset="utf-8"><style>{ff}
body{{margin:0}} .r{{width:1080px;height:1350px;position:relative;overflow:hidden;background:#1B66F7;color:#fff;font-family:J,sans-serif;box-sizing:border-box;padding:96px 88px;display:flex;flex-direction:column}}
.w{{position:absolute;height:1500px;right:-330px;top:120px;opacity:.12;filter:blur(2.5px)}}
.logo{{width:250px}} .k{{margin-top:auto;font-size:30px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#EAF1FE}}
h1{{margin:22px 0 0;font-size:86px;line-height:1.06;font-weight:800;letter-spacing:-.01em}}
p{{margin:30px 0 0;font-size:38px;line-height:1.35;font-weight:500;color:#EAF1FE}}
.f{{margin-top:70px;padding-top:30px;border-top:2px solid rgba(255,255,255,.45);display:flex;justify-content:space-between;font-size:30px;font-weight:700}}
</style></head><body><div class="r">
<img class="w" src="file://{img}/y-blanc.svg"><img class="logo" src="file://{img}/logo-blanc.svg">
<div class="k">Conseil Eloy</div><h1>{html.escape(titre)}</h1><p>{html.escape(sous)}</p>
<div class="f"><span>eloy-assurances-patrimoine.fr</span><span>06 96 33 29 09</span></div>
</div></body></html>"""
tmp = out + '.html'
open(tmp, 'w', encoding='utf-8').write(page)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350})
    pg.goto('file://' + os.path.abspath(tmp)); pg.wait_for_timeout(500)
    pg.screenshot(path=out); b.close()
os.remove(tmp)
print(out)
