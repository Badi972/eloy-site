"""Bande d'effets sonores synthétisée, calée sur les mêmes repères que l'animation (pas de nappe continue).
Utilisé par motion.py : sfx.build(spec, T, out_wav)."""
import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi
from scipy.io import wavfile

SR = 48000


def build(spec, T, out):
    rng = np.random.default_rng(7)
    D = T['end']; N = int(D * SR) + SR
    L = np.zeros(N); R = np.zeros(N)

    def place(sig, t, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= N: return
        if i < 0: sig = sig[-i:]; i = 0
        sig = sig[:N - i] * gain
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        L[i:i + len(sig)] += sig * l * 1.414; R[i:i + len(sig)] += sig * r * 1.414

    tt = lambda d: np.arange(int(d * SR)) / SR

    def sweep(x, f0, f1, chunk=480):
        out = np.zeros_like(x); fr = np.geomspace(f0, f1, max(1, len(x) // chunk + 1))
        zi = sosfilt_zi(butter(2, fr[0], fs=SR, output='sos')) * 0
        for k in range(0, len(x), chunk):
            sos = butter(2, min(fr[min(k // chunk, len(fr) - 1)], SR / 2 - 100), fs=SR, output='sos')
            out[k:k + chunk], zi = sosfilt(sos, x[k:k + chunk], zi=zi)
        return out

    def whoosh(d=0.7, f0=300, f1=4000):
        n = int(d * SR); return sweep(rng.standard_normal(n), f0, f1) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 0.5

    def pop(f0=900, d=0.14):
        t = tt(d); f = f0 * np.exp(-t * 18) + f0 * 0.45
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) + rng.standard_normal(len(t)) * np.exp(-t / 0.003) * 0.25) * 0.6

    def bell(f, d=1.6, b=1.0):
        t = tt(d); s = np.zeros_like(t)
        for m, a, dec in [(1, 1, .9), (2.0, .5 * b, .5), (2.76, .35 * b, .35), (5.4, .2 * b, .18)]:
            s += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / dec)
        return s * np.minimum(1, t / 0.004) * 0.28

    def thud(d=0.6):
        t = tt(d); f = 70 * np.exp(-t * 6) + 38
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22) + sweep(rng.standard_normal(len(t)), 900, 200) * np.exp(-t / 0.05) * 0.4) * 0.9

    def tick():
        t = tt(0.05); return (np.sin(2 * np.pi * 2600 * t) * 0.5 + rng.standard_normal(len(t)) * 0.2) * np.exp(-t / 0.008) * 0.6

    def glide(f0, f1, d, amp=0.25):
        t = tt(d); f = np.geomspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
        return (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 0.8 * amp

    def riser(d=0.9):
        n = int(d * SR); x = np.linspace(0, 1, n)
        return sweep(rng.standard_normal(n), 400, 9000) * x ** 2 * 0.6 + glide(220, 880, d, 0.12)[:n] * x

    P, X, B, E, C = spec['douleur'], spec['explication'], spec['benefice'], spec['eloy'], spec['cta']
    s0, sol, rc, r = T[spec['question']['de']], T[spec['solution']['de']], T[X['de']], T[B['de']]
    br, e, cta = T[B['phrase']['de']], T[E['de']], T[C['de']]
    painT = [T[x['de']] for x in P['titres']]
    # douleur
    place(whoosh(0.6, 200, 2500), painT[0] - 0.1, 0.45)
    for t0 in painT[1:]: place(whoosh(0.45, 300, 2200), t0 - 0.05, 0.3)
    if P.get('carte'):
        for k, c in enumerate(P['carte']['puces']):
            place(pop(520 - 25 * k, 0.16), T[c['de']] + c.get('decal', 0.15) + 0.08, 0.75, pan=[-.4, .3, -.1, .5, -.5, .2][k % 6])
    if P.get('jauge'):
        g = T[P['jauge']['de']]; place(whoosh(0.5, 300, 2000), g - 0.05, 0.35); place(glide(520, 130, 2.2, 0.22), g + 0.5, 1.0)
    t = painT[-1] + 0.3
    while t < s0 - 0.3:
        place(thud(0.45), t, 0.55); place(thud(0.35), t + 0.22, 0.32); t += 1.047
    place(thud(0.8), s0, 0.7); place(riser(max(0.4, sol - s0)), s0 + 0.05, 0.8)
    place(whoosh(0.9, 6000, 400), sol - 0.1, 0.7)
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        place(bell(f, 1.2, 0.6), sol + 0.25 + i * 0.07, 0.35, pan=-.3 + .2 * i)
    # explication
    place(whoosh(0.5, 600, 3000), rc - 0.1, 0.3)
    for i, s in enumerate(X['etapes']):
        at = (T.get(s.get('de'), rc + 0.4 + i * 0.9)) + (0.35 if i == 0 else 0)
        place(pop(820 + 110 * i, 0.14), at + 0.1, 0.55, pan=-.3 + .3 * i); place(bell([659.3, 784.0, 987.8, 1174.7][i % 4], 1.0, 0.4), at + 0.12, 0.3)
    # bénéfice
    place(whoosh(0.6, 400, 4000), r - 0.05, 0.35); place(glide(260, 1040, 1.3, 0.11), r + 0.4, 1.0)
    for i, _ in enumerate(B.get('puces', [])):
        place(pop(1000 + 90 * i, 0.1), r + 0.7 + i * 0.22 + 0.08, 0.4, pan=-.45 + .3 * i)
    n = int(1.8 * SR); x = np.linspace(0, 1, n)
    place(sweep(rng.standard_normal(n), 1800, 500) * np.sin(np.pi * x) ** 1.5 * 0.35, br - 0.2, 0.8)
    for f in [392.0, 523.3, 659.3, 784.0, 1046.5]: place(bell(f, 3.0, 0.7), br + 0.1, 0.3)
    # eloy
    place(whoosh(0.5, 400, 3000), e - 0.05, 0.3)
    for i, c in enumerate(E['checks']):
        at = T.get(c.get('de'), e + 0.6 + i * 1.2) + (0.5 if i == 0 else -0.1)
        place(tick(), at + 0.1, 0.8); place(bell(1318.5 + 200 * i, 0.6, 0.3), at + 0.12, 0.3)
    lastK = T.get(E['checks'][-1].get('de'), e + 3)
    for i, _ in enumerate(E.get('territoires', [])):
        place(pop(1200 + 80 * i, 0.1), lastK + 0.9 + i * 0.3 + 0.1, 0.45, pan=[-.4, 0, .4][i % 3])
    # fin
    place(whoosh(0.8, 300, 6000), cta - 0.3, 0.6)
    for f in [523.3, 659.3, 784.0, 1046.5]: place(bell(f, 2.5, 0.8), cta + 0.25, 0.32)
    place(pop(1000, 0.14), cta + 0.85, 0.55)
    place(pop(1250, 0.12), T.get(C.get('bio'), cta + 1.5) + 0.05, 0.5)
    place(pop(1100, 0.14), T.get(C.get('tel'), cta + 2.5) + 0.3, 0.6)
    mix = np.stack([L, R], 1)[:int(D * SR)]
    fade = int(1.2 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mix /= max(1e-9, np.max(np.abs(mix))) / 0.5
    wavfile.write(out, SR, (mix * 32767).astype(np.int16))
