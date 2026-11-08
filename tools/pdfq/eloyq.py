#!/usr/bin/env python3
"""Générateur des questionnaires PDF Eloy (style du questionnaire Transporteurs et logisticiens).

Usage dans un fichier de description (tools/pdfq/q_<cle>.py) :

    from eloyq import Q
    d = Q("sortie.pdf", "Assurance des consignataires de navires et agents maritimes", "Services maritimes")
    d.demandeur()                       # bloc 1 standard : société, dirigeants, bénéficiaires, EI, PPE
    d.section("Profil de l'entreprise")
    d.row([("Nombre de salariés", .5), ("Date de création", .5)])   # libellé + case sur la même ligne
    d.choix("Âge de la société", ["moins de 5 ans", "de 5 à 10 ans", "plus de 10 ans"])
    d.oui_non("Certification")
    d.oui_non_si("Sous-traitez-vous ?", "Si oui, précisez")         # Oui/Non puis ligne « si oui »
    d.zone("Description de l'activité", h=40)                        # grande case multiligne
    d.tableau(["Activité", "Oui", "Non", "% activité", "CA (€)"], lignes=["Consignataire", "Agent maritime"],
              types=["label", "check", "check", "text", "text"], largeurs=[.4, .08, .08, .2, .24])
    d.tableau(["Date", "Nature", "Montant (€)"], n=4)                 # lignes vides
    d.liste_cases(["Option A", "Option B"])                          # cases à cocher l'une sous l'autre
    d.note("Texte d'information dans un encadré bleu.")
    d.para("Texte simple.")
    d.antecedents()                      # assureur actuel, résiliation, sinistres (tableau 3 ans)
    d.fin()                              # protection des données + déclaration et signature
    d.save()

Toutes les cases sont remplissables sur ordinateur. Aucune mention d'assureur ni rubrique « Intermédiaire ».
"""
import os, re, unicodedata
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
for n in ('Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'):
    pdfmetrics.registerFont(TTFont('PJ-' + n, os.path.join(A, 'PlusJakartaSans-%s.ttf' % n)))

W, H = 595.2756, 841.8898
X0, X1 = 42, 553.2756
CW = X1 - X0
BOTTOM = 70
BLUE = Color(.105882, .4, .968627)
INK = Color(.043137, .070588, .12549)
GREY = Color(.290196, .333333, .407843)
LIGHT = Color(.917647, .945098, .996078)
FBORD = Color(.662745, .764706, .960784)
SOFT = Color(.811765, .878431, 1)
RULE = Color(.835294, .87451, .941176)
ROWLINE = Color(.87, .9, .96)
FOOT1 = "Eloy Assurances Patrimoine · SARL · SIREN 919 934 075 · Courtier en assurance · ORIAS n° 23 000 527 (orias.fr)"
FOOT2 = "Immeuble Lina’s, 97232 Le Lamentin, Martinique · eloy.assurances@gmail.com · 06 96 33 29 09 · www.eloy-assurances-patrimoine.fr"
FH = 14.4      # hauteur d'une case
RH = 22        # hauteur d'une ligne
LF, LS = 'PJ-Medium', 8    # police des libellés


def sw(t, f=LF, s=LS):
    return pdfmetrics.stringWidth(t, f, s)


def wrap(text, font, size, width):
    out, cur = [], ''
    for word in text.split(' '):
        t = (cur + ' ' + word).strip()
        if sw(t, font, size) <= width or not cur:
            cur = t
        else:
            out.append(cur); cur = word
    if cur: out.append(cur)
    return out


class Q:
    def __init__(self, path, sous_titre, court, intro=None):
        self.path, self.sous_titre, self.court = path, sous_titre, court
        self.c = canvas.Canvas(path, pagesize=(W, H))
        self.c.setTitle("Questionnaire d’étude de risque – %s – Eloy" % court)
        self.c.setAuthor("Eloy Assurances Patrimoine")
        self.c.setSubject(sous_titre)
        self.page, self.num, self.names = 1, 0, {}
        self.pages = []
        self._header1(intro)

    # ---------- pages ----------
    def _header1(self, intro):
        c = self.c
        c.setFillColor(BLUE); c.rect(0, H - 132, W, 132, stroke=0, fill=1)
        c.saveState(); p = c.beginPath(); p.rect(0, H - 132, W, 132); c.clipPath(p, stroke=0, fill=0)
        c.drawImage(ImageReader(os.path.join(A, 'deco.png')), 526.647, 680.1898, 87.98537, 165, mask='auto'); c.restoreState()
        c.drawImage(ImageReader(os.path.join(A, 'logo-blanc.png')), 42, 785.8898, 58.84309, 30, mask='auto')
        c.setStrokeColor(SOFT); c.setLineWidth(.8); c.line(114.8431, 811.8898, 114.8431, 789.8898)
        c.setFillColor(SOFT); c.setFont('PJ-Medium', 8.5)
        c.drawString(126.8431, 797.8898, "Assurance  ·  Rachat de crédits  ·  Financement professionnel")
        c.setFillColor(white); c.setFont('PJ-ExtraBold', 23); c.drawString(42, 749.8898, "Questionnaire d’étude de risque")
        c.setFillColor(SOFT); c.setFont('PJ-Medium', 13); c.drawString(42, 728.8898, self.sous_titre)
        self.y = 693.8898
        intro = intro or [("Questionnaire à retourner ", 0), ("complété et signé", 1), (" à ", 0), ("eloy.assurances@gmail.com", 1),
                          (". Les cases bleues se remplissent directement sur ordinateur ; le document peut aussi être imprimé. "
                           "Des réponses complètes et exactes permettent d’obtenir une proposition adaptée plus rapidement.", 0)]
        self._infobox(intro)
        self.y -= 16

    def _header_n(self):
        c = self.c
        c.drawImage(ImageReader(os.path.join(A, 'logo-bleu.png')), 42, H - 66, 45.1, 23, mask='auto')
        c.setFillColor(GREY); c.setFont('PJ-Regular', 7.5)
        c.drawRightString(X1, H - 58, "Questionnaire d’étude de risque · " + self.court)
        c.setStrokeColor(RULE); c.setLineWidth(.8); c.line(X0, H - 72, X1, H - 72)
        self.y = H - 92

    def _footer(self):
        c = self.c
        c.setStrokeColor(RULE); c.setLineWidth(.8); c.line(X0, 50, X1, 50)
        c.setFillColor(GREY); c.setFont('PJ-Regular', 6.8)
        c.drawString(X0, 38, FOOT1); c.drawString(X0, 28, FOOT2)
        self.pages.append(self.page)

    def new_page(self):
        self._footer(); self.c.showPage(); self.page += 1; self._header_n()

    def ensure(self, h):
        if self.y - h < BOTTOM: self.new_page()

    def name(self, base):
        s = unicodedata.normalize('NFKD', base).encode('ascii', 'ignore').decode()
        s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')[:40] or 'champ'
        self.names[s] = self.names.get(s, 0) + 1
        return '%s_%d' % (s, len(self.names) + sum(self.names.values()))

    # ---------- éléments de base ----------
    def _tf(self, label, x, y, w, h=FH, multiline=False):
        c = self.c
        c.setLineWidth(.6); c.setStrokeColor(FBORD); c.setFillColor(LIGHT); c.rect(x, y, w, h, stroke=1, fill=1)
        c.acroForm.textfield(name=self.name(label), tooltip=label[:120], x=x, y=y, width=w, height=h, borderWidth=0,
                             fillColor=LIGHT, borderColor=FBORD, textColor=INK, fontName='Helvetica', fontSize=0 if multiline else 8,
                             fieldFlags='multiline' if multiline else '', maxlen=0 if multiline else 200, forceBorder=False)

    def _cb(self, label, x, y):
        c = self.c
        c.setLineWidth(.8); c.setStrokeColor(BLUE); c.setFillColor(white); c.rect(x, y, 8.2, 8.2, stroke=1, fill=1)
        c.acroForm.checkbox(name=self.name(label), tooltip=label[:120], x=x, y=y, size=8.2, buttonStyle='check',
                            borderWidth=0, borderColor=BLUE, fillColor=white, textColor=BLUE, forceBorder=False)

    def _label(self, t, x, y, font=LF, size=LS, color=INK):
        self.c.setFillColor(color); self.c.setFont(font, size); self.c.drawString(x, y, t)

    def _infobox(self, parts, size=8.2):
        """parts : liste (texte, gras 0/1). Encadré bleu clair avec barre à gauche."""
        c = self.c
        words = []
        for t, b in parts:
            for i, w in enumerate(re.split(r'(\s+)', t)):
                if w: words.append((w, b))
        lines, cur, curw, maxw = [], [], 0, CW - 30
        for w, b in words:
            f = 'PJ-Bold' if b else 'PJ-Regular'; ww = sw(w, f, size)
            if curw + ww > maxw and cur and not w.isspace():
                lines.append(cur); cur, curw = [], 0
                if w.isspace(): continue
            cur.append((w, f)); curw += ww
        if cur: lines.append(cur)
        h = 16 + len(lines) * 11.644
        self.ensure(h + 6)
        top = self.y; bot = top - h
        c.setFillColor(LIGHT); c.roundRect(X0, bot, CW, h, 6, stroke=0, fill=1)
        c.setFillColor(BLUE); c.rect(X0, bot, 3.2, h, stroke=0, fill=1)
        y = top - 8 - 8.2
        for ln in lines:
            x = 57
            for w, f in ln:
                c.setFillColor(INK); c.setFont(f, size); c.drawString(x, y, w); x += sw(w, f, size)
            y -= 11.644
        self.y = bot - 10

    # ---------- API ----------
    def section(self, title, need=90):
        self.ensure(need); self.y -= 4
        c = self.c; self.num += 1; top = self.y
        c.setFillColor(BLUE); c.roundRect(X0, top - 20, 20, 20, 5, stroke=0, fill=1)
        c.setFillColor(white); c.setFont('PJ-Bold', 10); c.drawCentredString(X0 + 10, top - 13.7, str(self.num))
        c.setFillColor(INK); c.setFont('PJ-Bold', 13); c.drawString(71, top - 14.5, title)
        c.setStrokeColor(BLUE); c.setLineWidth(1.2); c.line(X0, top - 26, X1, top - 26)
        self.y = top - 26 - 22

    def sub(self, text, need=50):
        self.ensure(need); self.y -= 2
        self._label(text, X0, self.y, 'PJ-Bold', 9.5, BLUE); self.y -= 18

    def para(self, text, size=7.6, color=GREY, font='PJ-Regular', need=None):
        lines = wrap(text, font, size, CW)
        self.ensure(need or len(lines) * (size + 2.2) + 4)
        for ln in lines:
            self._label(ln, X0, self.y, font, size, color); self.y -= size + 2.2
        self.y -= 4

    def puces(self, items, size=7.6):
        for it in items:
            lines = wrap(it, 'PJ-Regular', size, CW - 12)
            self.ensure(len(lines) * (size + 2.2))
            self.c.setFillColor(BLUE); self.c.circle(X0 + 3, self.y + 2.6, 1.5, stroke=0, fill=1)
            for ln in lines:
                self._label(ln, X0 + 10, self.y, 'PJ-Regular', size, INK); self.y -= size + 2.2
        self.y -= 4

    def note(self, text, gras=None):
        parts = [(gras, 1), (' ' + text, 0)] if gras else [(text, 0)]
        self._infobox(parts, 8)

    def row(self, items):
        """items : liste de (libellé, part de la largeur) ; libellé suivi de la case sur la même ligne.
        Un libellé trop long pour la ligne passe au-dessus de la case."""
        self.ensure(RH)
        x = X0; gap = 12
        for i, it in enumerate(items):
            lab, frac = it[0], it[1]
            seg = CW * frac - (gap if i < len(items) - 1 else 0)
            lw = sw(lab + ' :') if lab else 0
            if lab and lw > seg - 40:
                lines = wrap(lab + ' :', LF, LS, seg)
                for k, ln in enumerate(lines): self._label(ln, x, self.y - k * 9.6)
                extra = (len(lines)) * 9.6
                self._tf(lab, x, self.y - extra - FH + 7, seg)
                self._extra = max(getattr(self, '_extra', 0), extra)
            else:
                if lab: self._label(lab + ' :', x, self.y)
                fx = x + (lw + 6 if lab else 0)
                self._tf(lab or 'champ', fx, self.y - 4.1, seg - (fx - x))
            x += CW * frac
        self.y -= RH + getattr(self, '_extra', 0); self._extra = 0

    def champ(self, label):
        self.row([(label, 1)])

    def choix(self, label, options, autre=None):
        """Libellé puis cases à cocher sur la même ligne (passe à la ligne si besoin). autre = libellé d'une case texte finale."""
        self.ensure(RH)
        x = X0
        if label:
            self._label(label + ' :', x, self.y); x += sw(label + ' :') + 10
        for o in options:
            w = 8.2 + 4 + sw(o, 'PJ-Regular') + 14
            if x + w > X1:
                self.y -= RH - 6; self.ensure(RH); x = X0 + 20
            self._cb((label + ' ' + o) if label else o, x, self.y - 1); self._label(o, x + 12.6, self.y, 'PJ-Regular')
            x += w
        if autre:
            lw = sw(autre + ' :', 'PJ-Regular')
            if x + lw + 80 > X1: self.y -= RH - 6; x = X0 + 20
            self._label(autre + ' :', x, self.y, 'PJ-Regular'); fx = x + lw + 6
            self._tf((label or '') + ' ' + autre, fx, self.y - 4.1, X1 - fx)
        self.y -= RH

    def oui_non(self, label, si=None):
        """Question Oui / Non. si = libellé d'une ligne « Si oui, … » ajoutée dessous."""
        lines = wrap(label + ' ', LF, LS, CW - 110)
        self.ensure(RH + (len(lines) - 1) * 9.6 + (RH if si else 0))
        for k, ln in enumerate(lines[:-1]):
            self._label(ln, X0, self.y); self.y -= 9.6
        self._label(lines[-1], X0, self.y)
        x = max(X0 + sw(lines[-1]) + 10, X1 - 92)
        for o in ('Oui', 'Non'):
            self._cb(label + ' ' + o, x, self.y - 1); self._label(o, x + 12.6, self.y, 'PJ-Regular'); x += 46
        self.y -= RH
        if si: self.row([(si, 1)])

    def zone(self, label, h=40):
        lines = wrap(label + ' :', LF, LS, CW) if label else []
        self.ensure(h + 12 + len(lines) * 9.6)
        for ln in lines:
            self._label(ln, X0, self.y); self.y -= 9.6
        self._tf(label or 'zone', X0, self.y - h + 4, CW, h, multiline=True)
        self.y -= h + 12

    def liste_cases(self, items, droite=None):
        """Cases à cocher l'une sous l'autre, séparées par un filet. droite : texte gris aligné à droite (liste ou None)."""
        c = self.c
        for i, it in enumerate(items):
            self.ensure(RH)
            self._cb(it, X0 + 10, self.y - 1)
            for k, ln in enumerate(wrap(it, 'PJ-Regular', 8, CW - 150)):
                self._label(ln, X0 + 24, self.y - k * 9.6, 'PJ-Regular')
            if droite and droite[i]:
                c.setFillColor(GREY); c.setFont('PJ-Regular', 7.4); c.drawRightString(X1, self.y, droite[i])
            n = len(wrap(it, 'PJ-Regular', 8, CW - 150))
            c.setStrokeColor(ROWLINE); c.setLineWidth(.6); c.line(X0, self.y - 6 - (n - 1) * 9.6, X1, self.y - 6 - (n - 1) * 9.6)
            self.y -= 17 + (n - 1) * 9.6
        self.y -= 6

    def tableau(self, entetes, lignes=None, n=3, types=None, largeurs=None, total=False):
        """Tableau à en-tête bleu. lignes : libellés de 1re colonne (sinon n lignes vides).
        types : par colonne 'label' | 'text' | 'check' (défaut : 1re colonne label si lignes, sinon text)."""
        c = self.c
        k = len(entetes)
        largeurs = largeurs or [1.0 / k] * k
        if types is None: types = (['label'] if lignes else ['text']) + ['text'] * (k - 1)
        rows = lignes or [''] * n
        if total: rows = list(rows) + ['Total']
        hh = max(len(wrap(e, 'PJ-SemiBold', 7.4, CW * largeurs[i] - 8)) for i, e in enumerate(entetes)) * 9 + 9
        self.ensure(hh + 2 * 19)
        def header():
            top = self.y + 8
            c.setFillColor(BLUE); c.roundRect(X0, top - hh, CW, hh, 4, stroke=0, fill=1)
            x = X0
            for i, e in enumerate(entetes):
                ls = wrap(e, 'PJ-SemiBold', 7.4, CW * largeurs[i] - 8)
                yy = top - (hh - len(ls) * 9) / 2 - 7
                for ln in ls:
                    c.setFillColor(white); c.setFont('PJ-SemiBold', 7.4); c.drawCentredString(x + CW * largeurs[i] / 2, yy, ln); yy -= 9
                x += CW * largeurs[i]
            self.y = top - hh - 3
        header()
        for r, lab in enumerate(rows):
            lab_lines = wrap(lab, 'PJ-Regular', 7.6, CW * largeurs[0] - 8) if lab else ['']
            rh = max(19, len(lab_lines) * 9 + 8)
            if self.y - rh < BOTTOM:
                self.new_page(); self.y -= 8; header()
            x = X0
            for i in range(k):
                cw = CW * largeurs[i]; t = types[i]
                if lab == 'Total' and i > 0 and t == 'check': t = 'none'
                if t == 'label' or (lab == 'Total' and i == 0):
                    yy = self.y - (rh - len(lab_lines) * 9) / 2 - 6.5
                    for ln in lab_lines:
                        self._label(ln, x + 4, yy, 'PJ-SemiBold' if lab == 'Total' else 'PJ-Regular', 7.6); yy -= 9
                elif t == 'text':
                    self._tf('%s %s %d' % (entetes[i], lab, r), x + 2, self.y - rh + 2.5, cw - 4, rh - 5)
                elif t == 'check':
                    self._cb('%s %s %d' % (entetes[i], lab, r), x + cw / 2 - 4.1, self.y - rh / 2 - 4.1)
                x += cw
            c.setStrokeColor(ROWLINE); c.setLineWidth(.6); c.line(X0, self.y - rh, X1, self.y - rh)
            self.y -= rh
        self.y -= 14

    def espace(self, h=6):
        self.y -= h

    # ---------- blocs standard ----------
    def demandeur(self):
        self.section("Demandeur d’assurance")
        self.choix("Vous êtes", ["une société", "une entreprise individuelle"])
        self.sub("Société (personne morale)")
        self.champ("Dénomination sociale")
        self.champ("Adresse du siège")
        self.row([("Code postal", .27), ("Ville", .48), ("Pays", .25)])
        self.row([("Téléphone", .5), ("Site internet", .5)])
        self.row([("Interlocuteur", .55), ("Fonction", .45)])
        self.row([("E-mail", .55), ("Ligne directe", .45)])
        self.row([("N° SIREN", .36), ("Code APE (NAF)", .3), ("Forme juridique", .34)])
        self.choix("Société cotée", ["Oui", "Non"], autre="Si oui, sur quel marché")
        self.sub("Dirigeants sociaux", need=110)
        self.para("Président du conseil d’administration, président du directoire, directeurs généraux, gérant.")
        self.tableau(["Nom", "Prénoms", "Fonction"], n=3)
        self.sub("Bénéficiaires effectifs", need=120)
        self.tableau(["Nom et prénoms", "Date de naissance", "Ville de naissance", "Pays de naissance", "Pays du domicile"], n=3,
                     largeurs=[.28, .17, .19, .18, .18])
        self.para("Bénéficiaire effectif : toute personne physique qui détient, directement ou indirectement, plus de 25 % du capital ou des "
                  "droits de vote de la société, ou qui exerce par tout autre moyen un pouvoir de contrôle sur ses organes de gestion, "
                  "d’administration ou de direction, ou sur l’assemblée générale des associés. Si aucune personne ne remplit ces critères, "
                  "indiquer le représentant légal de la société.")
        self.sub("Entreprise individuelle (personne physique)", need=150)
        self.row([("Nom", .5), ("Prénoms", .5)])
        self.champ("Adresse du siège")
        self.row([("Code postal", .27), ("Ville", .48), ("Pays", .25)])
        self.row([("Date de naissance", .32), ("Ville de naissance", .36), ("Pays de naissance", .32)])
        self.row([("Téléphone", .45), ("E-mail", .55)])
        self.row([("Interlocuteur", .55), ("Fonction", .45)])
        self.row([("N° SIREN", .5), ("Code APE (NAF)", .5)])
        self.sub("Personne politiquement exposée", need=170)
        self.para("Une personne politiquement exposée exerce, ou a cessé d’exercer depuis moins d’un an, l’une des fonctions suivantes :", 7.6, INK)
        self.puces(["chef d’État, chef de gouvernement, membre d’un gouvernement national ou de la Commission européenne ;",
                    "membre d’une assemblée parlementaire nationale ou du Parlement européen, membre de l’organe dirigeant d’un parti ou groupement "
                    "politique (loi n° 88-227 du 11 mars 1988) ou d’un parti politique étranger ;",
                    "membre d’une cour suprême, d’une cour constitutionnelle ou d’une haute juridiction dont les décisions ne sont pas, sauf "
                    "circonstances exceptionnelles, susceptibles de recours ;",
                    "membre d’une cour des comptes ; dirigeant ou membre de l’organe de direction d’une banque centrale ;",
                    "ambassadeur ou chargé d’affaires ; officier général ou officier supérieur assurant le commandement d’une armée ;",
                    "membre d’un organe d’administration, de direction ou de surveillance d’une entreprise publique ;",
                    "directeur, directeur adjoint ou membre du conseil d’une organisation internationale créée par un traité, ou fonction équivalente."])
        self.oui_non("Un dirigeant ou un bénéficiaire effectif est-il une personne politiquement exposée, ou proche d’une telle personne ?",
                     si="Si oui, nom et fonction exercée")

    def antecedents(self, annees=3, garanties=None):
        """Assureur actuel, résiliation, sinistres. garanties : libellés de lignes du tableau (sinon tableau par date)."""
        self.section("Antécédents et sinistralité", need=160)
        self.row([("Compagnie d’assurance actuelle", .55), ("Échéance du contrat actuel", .45)])
        self.row([("N° de contrat", .5), ("Cotisation annuelle actuelle (€)", .5)])
        self.para("Si le précédent contrat a été résilié ou non renouvelé, motif :", 8, INK, LF)
        self.choix("", ["Non-paiement de la prime", "Sinistres"], autre="Autre")
        self.sub("Sinistres des %d dernières années" % annees, need=110)
        if garanties:
            ent = ["Garantie"]; ty = ['label']; lg = [.28]
            for k in range(annees):
                yr = 'Année N' + ('' if k == 0 else '-%d' % k)
                ent += [yr + " – nombre", yr + " – coût total (€)"]; ty += ['text', 'text']; lg += [.72 / annees * .4, .72 / annees * .6]
            self.tableau(ent, lignes=garanties, types=ty, largeurs=lg)
        else:
            self.tableau(["Date de l’événement", "Nature de l’événement", "Montant indemnisé (€)", "Montant en cours (€)"], n=4,
                         largeurs=[.18, .42, .2, .2])
        self.liste_cases(["Statistique de sinistres jointe (Excel ou PDF) à la place du tableau", "Aucun sinistre sur la période"])

    def fin(self):
        self.section("Informations complémentaires", need=90)
        self.zone("Autres informations utiles à l’étude de votre dossier", h=48)
        self.section("Protection des données personnelles", need=150)
        self.para("Les informations de ce questionnaire sont recueillies par Eloy Assurances Patrimoine, courtier en assurance, pour étudier votre besoin, "
                  "consulter les compagnies d’assurance, vous transmettre une proposition puis gérer votre contrat. Ce traitement repose sur les mesures "
                  "précontractuelles prises à votre demande et sur l’exécution du contrat.", 7.6, INK)
        self.para("Elles sont communiquées aux seules compagnies d’assurance consultées pour votre dossier. Celles-ci les traitent pour l’étude, la "
                  "tarification et la gestion du risque, et pour leurs obligations légales (identification des clients, lutte contre le blanchiment des "
                  "capitaux et le financement du terrorisme, sanctions financières, lutte contre la fraude). Leurs propres mentions d’information vous sont "
                  "remises avec la proposition.", 7.6, INK)
        self.para("Les données sont conservées le temps de la relation commerciale, puis pendant les délais de prescription légaux. Vous disposez d’un "
                  "droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, ainsi que du droit de définir des "
                  "directives sur le sort de vos données après votre décès. Pour les exercer : eloy.assurances@gmail.com, avec un justificatif "
                  "d’identité. Vous pouvez aussi saisir la CNIL (www.cnil.fr).", 7.6, INK)
        self.liste_cases(["Je ne souhaite pas recevoir d’offres commerciales d’Eloy par e-mail."])
        self.section("Déclaration et signature", need=230)
        self.para("Cette demande d’assurance, destinée à l’étude du risque, n’engage ni l’assureur ni le demandeur. Le contrat étant établi sur la base "
                  "des réponses données, toute réticence ou fausse déclaration intentionnelle entraîne la nullité du contrat (article L. 113-8 du Code "
                  "des assurances) ; une omission ou une déclaration inexacte peut entraîner une réduction des indemnités (article L. 113-9). Pour les "
                  "assurances maritimes, lacustres et fluviales, l’assuré doit en outre déclarer toutes les circonstances connues de lui qui permettent "
                  "à l’assureur d’apprécier les risques qu’il prend en charge.", 7.6, INK)
        self.para("En signant ce questionnaire, je confirme :", 7.6, INK)
        self.puces(["être autorisé à le compléter pour l’ensemble des personnes physiques ou morales souhaitant souscrire l’assurance ;",
                    "avoir répondu de bonne foi et loyalement aux questions posées ;",
                    "l’exactitude des informations et des documents fournis."])
        self.row([("Nom et prénoms", .58), ("Fonction", .42)])
        self.row([("Société", .5), ("Fait à", .28), ("le", .22)])
        self._label("Signature (et cachet de l’entreprise)", X0, self.y, 'PJ-SemiBold', 8)
        self.y -= 8
        self._tf("Signature", X0, self.y - 60, 260, 60, multiline=True)
        self.y -= 70

    def save(self):
        self._footer()
        self.c.save()
        # numérotation « Page x / n » ajoutée après coup
        import pikepdf, io
        total = self.page
        pdf = pikepdf.open(self.path, allow_overwriting_input=True)
        for i, pg in enumerate(pdf.pages):
            buf = io.BytesIO(); cv = canvas.Canvas(buf, pagesize=(W, H))
            cv.setFillColor(BLUE); cv.setFont('PJ-SemiBold', 7.5); cv.drawRightString(X1, 33, "Page %d / %d" % (i + 1, total)); cv.save()
            ov = pikepdf.open(io.BytesIO(buf.getvalue()))
            pg.add_overlay(ov.pages[0])
        pdf.save(self.path)
        return total
