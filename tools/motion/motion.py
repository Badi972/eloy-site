"""Vidéos motion design Eloy (1080 x 1920, 30 i/s), pilotées par un script JSON.

Étapes (voir tools/articles/PROCEDURE.md, section « Vidéo motion design ») :
  python3 tools/motion/motion.py texte  spec.json                 -> texte à envoyer à ElevenLabs (avec la consigne d'accent)
  python3 tools/motion/motion.py ancres spec.json mots.json [--tempo 1.15] > ancres.json
        mots.json = la transcription horodatée ElevenLabs (liste de mots {text,start,end} ou {"words": [...]})
  python3 tools/motion/motion.py rendu  spec.json ancres.json voix.mp3 sortie.mp4 [--tempo 1.15]
        -> sortie.mp4 (voix accélérée + nettoyée, effets sonores, volume -14 LUFS), sortie-couverture.jpg, sortie-apercu.png
  python3 tools/motion/motion.py apercu spec.json ancres.json sortie.png   -> planche d'images clés sans rendu complet

Format du script JSON : voir tools/motion/exemples/girardin-industriel.json.
"""
import base64, json, os, re, subprocess, sys, tempfile, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 30
PREFIXE = "[neutral French accent from France]"


def arg(flag, default):
    if flag in sys.argv:
        i = sys.argv.index(flag); v = sys.argv[i + 1]; del sys.argv[i:i + 2]; return type(default)(v)
    return default


def load(p): return json.load(open(p, encoding='utf-8'))


def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9]", "", w)


def texte(spec):
    return (spec.get('voix_prefixe', PREFIXE) + ' ' + ' '.join(s['texte'] for s in spec['segments'])).strip()


def ancres(spec, words, tempo, pause=0.32, audio=None):
    """Repères (en secondes, après accélération) de chaque segment, et coupes des silences trop longs (> pause)."""
    if isinstance(words, dict): words = words.get('words', [])
    ws, skip = [], False
    for w in words:
        t = w.get('text', '')
        if w.get('type', 'word') != 'word': continue
        if t.startswith('['): skip = True
        if skip:
            if t.endswith(']'): skip = False
            continue
        n = norm(t)
        if n: ws.append((n, w['start'], w['end']))
    # intervalles conservés : chaque silence (détecté dans l'audio si fourni, sinon entre deux mots) ramené à `pause` au maximum
    sil = []
    if audio:
        o = subprocess.run(['ffmpeg', '-hide_banner', '-i', audio, '-af', 'silencedetect=n=-38dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
        st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', o)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', o)]
        sil = [(a, b) for a, b in zip(st, en) if b - a > pause]
    else:
        sil = [(e1, s2) for (_, _, e1), (_, s2, _) in zip(ws, ws[1:]) if s2 - e1 > pause]
    keep, a = [], max(0.0, ws[0][1] - 0.05)
    for s1, s2 in sil:
        if s1 <= a: a = max(a, s2 - pause / 2); continue
        keep.append([round(a, 3), round(s1 + pause / 2, 3)]); a = s2 - pause / 2
    keep.append([round(a, 3), round(ws[-1][2] + 0.25, 3)])
    def remap(t):
        out = 0.0
        for k0, k1 in keep:
            if t >= k1: out += k1 - k0
            elif t >= k0: return out + t - k0
            else: return out
        return out
    T, i = {}, 0
    for k, seg in enumerate(spec['segments']):
        toks = [norm(x) for x in seg['texte'].split() if norm(x)][:2]
        j = i
        while j < len(ws) and not (ws[j][0] == toks[0] and (len(toks) < 2 or j + 1 >= len(ws) or ws[j + 1][0] == toks[1])):
            j += 1
        if j >= len(ws):
            raise SystemExit(f"Segment introuvable dans la transcription : {seg['id']} « {seg['texte'][:40]} »")
        T[seg['id']] = round(0.0 if k == 0 else remap(ws[j][1]) / tempo, 3)
        i = j + 1
    T['end'] = round(remap(ws[-1][2]) / tempo + 2.0, 2)
    T['_coupes'] = keep
    T['_tempo'] = tempo
    return T


def fonts():
    fdir = os.path.join(ROOT, 'tools', '.fonts')
    if not os.path.isdir(os.path.join(fdir, 'package')):
        os.makedirs(fdir, exist_ok=True)
        subprocess.run('npm pack @fontsource/plus-jakarta-sans@5.0.20 >/dev/null 2>&1 && tar xzf fontsource-plus-jakarta-sans-5.0.20.tgz', shell=True, cwd=fdir, check=True)
    F = os.path.join(fdir, 'package', 'files', 'plus-jakarta-sans-latin-%s-normal.woff2')
    return ''.join("@font-face{font-family:J;font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (w, base64.b64encode(open(F % w, 'rb').read()).decode()) for w in (500, 700, 800))


def page(spec, T, out_html):
    b64 = lambda f: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(HERE, 'assets', f), 'rb').read()).decode()
    h = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
    h = h.replace('__FONTS__', fonts()).replace('__SPEC__', json.dumps(spec, ensure_ascii=False)).replace('__T__', json.dumps(T))
    h = h.replace('__LOGO_BLEU__', b64('logo-bleu.png')).replace('__LOGO_BLANC__', b64('logo-blanc.png'))
    open(out_html, 'w', encoding='utf-8').write(h)


def frames(html, times, outs):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.path.abspath(html) + '?capture'); pg.evaluate('document.fonts.ready')
        if errs: raise SystemExit('Erreur dans la page : ' + errs[0])
        for t, o in zip(times, outs):
            pg.evaluate(f'render({t})'); pg.screenshot(path=o)
        b.close()


def planche(spec, T, html, out):
    from PIL import Image
    ks = [T[spec['douleur']['titres'][-1]['de']] + 1.2, T[spec['question']['de']] + 0.5, T[spec['solution']['de']] + 0.9,
          T[spec['explication']['de']] + 3.0, T[spec['benefice']['phrase']['de']] + 1.0, T[spec['cta']['de']] - 0.6, T['end'] - 0.6]
    tmp = tempfile.mkdtemp(); outs = [os.path.join(tmp, f'{i}.png') for i in range(len(ks))]
    frames(html, ks, outs)
    ims = [Image.open(o).resize((270, 480)) for o in outs]
    s = Image.new('RGB', (270 * len(ims), 480)); [s.paste(im, (i * 270, 0)) for i, im in enumerate(ims)]; s.save(out)
    return out


def rendu(spec, T, voix, out, tempo):
    work = tempfile.mkdtemp(); html = os.path.join(work, 'page.html'); page(spec, T, html)
    D = T['end']
    # 1. voix : accélération sans changer le timbre, débruitage léger, présence, compression
    vw = os.path.join(work, 'voix.wav')
    sel = '+'.join(f'between(t,{a},{b})' for a, b in T.get('_coupes', [])) or '1'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', voix, '-af',
                    f"aselect='{sel}',asetpts=N/SR/TB,atempo={tempo},highpass=f=90,afftdn=nr=12:nf=-50:tn=1,agate=threshold=0.012:ratio=3:attack=5:release=120,"
                    'equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2',
                    '-ar', '48000', vw], check=True)
    # 2. images
    from playwright.sync_api import sync_playwright
    vid = os.path.join(work, 'video.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', vid], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto('file://' + html + '?capture'); pg.evaluate('document.fonts.ready')
        for i in range(int(D * FPS)):
            pg.evaluate(f'render({i / FPS})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=94))
        b.close()
    ff.stdin.close(); ff.wait()
    # 3. effets sonores + mixage (les effets baissent quand la voix parle)
    sys.path.insert(0, HERE); import sfx
    sw = os.path.join(work, 'sfx.wav'); sfx.build(spec, T, sw)
    fc = (f"[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={D},asplit=2[vk][vm];"
          f"[2:a]aresample=48000,volume=0.5[s];[s][vk]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350[sd];"
          f"[vm][sd]amix=inputs=2:duration=longest:normalize=0,atrim=0:{D},loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vid, '-i', vw, '-i', sw, '-filter_complex', fc, '-map', '0:v', '-map', '[a]',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    # 4. couverture + planche de contrôle
    base = os.path.splitext(out)[0]
    cov = os.path.join(work, 'cov.png'); frames(html, [T[spec['solution']['de']] + 0.9], [cov])
    from PIL import Image
    Image.open(cov).convert('RGB').save(base + '-couverture.jpg', quality=90)
    planche(spec, T, html, base + '-apercu.png')
    print(out, round(D, 1), 's')


if __name__ == '__main__':
    tempo = arg('--tempo', 1.15); pause = arg('--pause', 0.32); audio = arg('--audio', '')
    cmd = sys.argv[1]
    if cmd == 'texte':
        print(texte(load(sys.argv[2])))
    elif cmd == 'ancres':
        print(json.dumps(ancres(load(sys.argv[2]), load(sys.argv[3]), tempo, pause, audio or None), indent=1))
    elif cmd == 'apercu':
        spec, T = load(sys.argv[2]), load(sys.argv[3]); h = tempfile.mktemp(suffix='.html'); page(spec, T, h); print(planche(spec, T, h, sys.argv[4]))
    elif cmd == 'rendu':
        T = load(sys.argv[3]); rendu(load(sys.argv[2]), T, sys.argv[4], sys.argv[5], T.get('_tempo', tempo))
    else:
        print(__doc__)
