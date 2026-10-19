"""Montage d'une vidéo verticale Eloy (1080 x 1920, 30 i/s, H.264 + AAC) avec ffmpeg.
Usage : python3 tools/video_montage.py montage.json sortie.mp4
montage.json : {"clips": ["clip1.mp4", ...], "duree_clip": 6.5, "fin": "calques/fin.png", "duree_fin": 6,
  "voix": "voix.mp3", "voix_debut": 2.4, "musique": "musique.mp3", "volume_musique": 0.16,
  "calques": [{"png": "calques/logo.png", "de": 0, "a": 19.5}, ...]}   (chemins relatifs au fichier json)
"""
import json, os, subprocess, sys
m = json.load(open(sys.argv[1], encoding='utf-8')); base = os.path.dirname(os.path.abspath(sys.argv[1]))
P = lambda f: os.path.join(base, f)
X = 0.4  # fondu entre les plans
d, n = m['duree_clip'], len(m['clips'])
total = d * n + m['duree_fin']
args = ['ffmpeg', '-y', '-v', 'error']
for c in m['clips']: args += ['-i', P(c)]
args += ['-loop', '1', '-t', str(m['duree_fin'] + X), '-i', P(m['fin'])]
args += ['-i', P(m['voix']), '-i', P(m['musique'])]
first_ov = n + 3
for c in m['calques']: args += ['-loop', '1', '-t', str(total), '-i', P(c['png'])]
f = []
for i in range(n):
    f.append(f"[{i}:v]trim=start=0.2:duration={d + X},setpts=PTS-STARTPTS,scale=-2:1920,crop=1080:1920,fps=30,format=yuv420p,setsar=1[v{i}]")
f.append(f"[{n}:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[vf]")
cur, off = 'v0', d
for i in list(range(1, n)) + ['f']:
    src = f'v{i}' if i != 'f' else 'vf'
    f.append(f"[{cur}][{src}]xfade=transition=fade:duration={X}:offset={off:.2f}[x{i}]"); cur = f'x{i}'; off += d
for k, c in enumerate(m['calques']):
    s, e = c['de'], c['a']
    f.append(f"[{first_ov + k}:v]format=rgba,fade=t=in:st={s}:d=0.25:alpha=1,fade=t=out:st={e - 0.25:.2f}:d=0.25:alpha=1[o{k}]")
    f.append(f"[{cur}][o{k}]overlay=0:0:enable='between(t,{s},{e})'[c{k}]"); cur = f'c{k}'
f.append(f"[{cur}]trim=duration={total},format=yuv420p[vout]")
vi, mi = n + 1, n + 2
f.append(f"[{vi}:a]atrim=start={m.get('voix_debut', 0)},asetpts=PTS-STARTPTS,apad,atrim=duration={total}[va]")
f.append(f"[{mi}:a]atrim=duration={total},volume={m.get('volume_musique', 0.16)},afade=t=in:st=0:d=1,afade=t=out:st={total - 2}:d=2[ma]")
f.append("[va][ma]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]")
args += ['-filter_complex', ';'.join(f), '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
         '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-t', str(total), sys.argv[2]]
subprocess.run(args, check=True)
print(sys.argv[2], round(total, 1), 's')
