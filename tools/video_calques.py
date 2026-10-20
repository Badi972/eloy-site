"""Calques transparents (1080 x 1920) et carte de fin pour une vidéo verticale Eloy.
Usage : python3 tools/video_calques.py calques.json dossier_sortie
calques.json : {"rubrique": "...", "accroche": "...", "question": "...", "liste": ["...", ...], "message": "...",
                "fin_titre": "Bilan gratuit", "fin_sous_titre": "...", "fin_mentions": "mentions obligatoires (crédit)"}
Produit : logo.png, accroche.png, question.png, liste1..N.png (cumulatifs), message.png, fin.png
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
CSS = ff + """body{margin:0;background:transparent} .r{width:1080px;height:1920px;position:relative;font-family:J,sans-serif;color:#fff;overflow:hidden}
.blk{position:absolute;left:72px;right:150px}
.k{display:inline-block;background:#1B66F7;color:#fff;font-weight:700;font-size:30px;letter-spacing:.14em;text-transform:uppercase;padding:12px 22px;border-radius:12px}
.t{margin-top:22px;font-size:92px;line-height:1.04;font-weight:800;letter-spacing:-.015em;text-shadow:0 4px 30px rgba(11,18,32,.55),0 2px 6px rgba(11,18,32,.5)}
.card{background:rgba(255,255,255,.96);color:#0B1220;border-radius:28px;padding:40px 44px;box-shadow:0 20px 60px rgba(11,18,32,.35)}
.card h3{margin:0 0 18px;font-size:44px;font-weight:800;color:#1B66F7}
.it{display:flex;gap:22px;align-items:center;font-size:46px;font-weight:700;padding:12px 0}
.ck{flex:0 0 58px;height:58px;border-radius:50%;background:#1B66F7;display:flex;align-items:center;justify-content:center}
.ck svg{width:32px;height:32px;fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.msg{background:#1B66F7;border-radius:28px;padding:44px 48px;font-size:66px;line-height:1.1;font-weight:800;box-shadow:0 20px 60px rgba(11,18,32,.35)}
.msg small{display:block;margin-top:16px;font-size:36px;font-weight:600;color:#EAF1FE}
"""
CK = '<div class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></div>'
def pagehtml(body, bg='transparent'):
    return f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="r" style="background:{bg}">{body}</div></body></html>'
pages = {
  'logo': f'<img src="file://{img}/logo-blanc.svg" style="position:absolute;left:72px;top:110px;width:190px;filter:drop-shadow(0 3px 12px rgba(11,18,32,.5))">',
  'accroche': f'<div class="blk" style="top:330px"><span class="k">{E(c["rubrique"])}</span><div class="t">{E(c["accroche"])}</div></div>',
  'question': f'<div class="blk" style="top:330px"><div class="t">{E(c["question"])}</div></div>',
  'message': f'<div class="blk" style="top:1060px"><div class="msg">{E(c["message"])}<small>{E(c.get("message_sous",""))}</small></div></div>',
}
for i in range(1, len(c['liste']) + 1):
    items = ''.join(f'<div class="it">{CK}<span>{E(x)}</span></div>' for x in c['liste'][:i])
    pages['liste%d' % i] = f'<div class="blk" style="top:300px"><div class="card"><h3>{E(c.get("liste_titre","À vérifier"))}</h3>{items}</div></div>'
fin = f"""<img src="file://{img}/y-blanc.svg" style="position:absolute;height:2300px;right:-560px;top:-200px;opacity:.11;filter:blur(3px)">
<div style="position:absolute;left:90px;right:90px;top:400px">
<img src="file://{img}/logo-blanc.svg" style="width:360px">
<div style="margin-top:90px;font-size:100px;line-height:1.02;font-weight:800;letter-spacing:-.015em">{E(c.get('fin_titre','Bilan gratuit'))}</div>
<div style="margin-top:26px;font-size:44px;line-height:1.3;font-weight:500;color:#EAF1FE">{E(c.get('fin_sous_titre',''))}</div>
<div style="margin-top:80px;display:inline-block;background:#fff;color:#1B66F7;font-size:78px;font-weight:800;padding:26px 44px;border-radius:24px">06 96 33 29 09</div>
<div style="margin-top:40px;font-size:40px;font-weight:700">eloy-assurances-patrimoine.fr</div>
<div style="margin-top:110px;padding-top:34px;border-top:2px solid rgba(255,255,255,.4);font-size:32px;font-weight:700;letter-spacing:.04em;color:#EAF1FE">Assurance · Rachat de crédits · Financement professionnel</div>
<div style="margin-top:12px;font-size:30px;font-weight:500;color:#EAF1FE">Martinique · Guadeloupe · Guyane</div>
{f'<div style="margin-top:36px;font-size:29px;line-height:1.35;font-weight:600;color:#fff;background:rgba(11,18,32,.28);padding:22px 26px;border-radius:16px">{E(c["fin_mentions"])}</div>' if c.get('fin_mentions') else ''}</div>"""
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for name, body in list(pages.items()) + [('fin', None)]:
        pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        tmp = os.path.join(out, '_tmp.html')
        open(tmp, 'w', encoding='utf-8').write(pagehtml(fin, '#1B66F7') if name == 'fin' else pagehtml(body))
        pg.goto('file://' + os.path.abspath(tmp)); pg.wait_for_timeout(500); os.remove(tmp)
        pg.screenshot(path=os.path.join(out, name + '.png'), omit_background=(name != 'fin')); pg.close()
        print(name)
    b.close()
