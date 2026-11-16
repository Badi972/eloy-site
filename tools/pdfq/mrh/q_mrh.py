"""Questionnaire PDF multirisque habitation (Eloy_Questionnaire_MRH.pdf). Usage : python3 tools/pdfq/mrh/q_mrh.py"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit, ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth

BLUE = HexColor("#1B66F7"); LIGHT = HexColor("#EAF1FE"); INK = HexColor("#0B1220")
GREY = HexColor("#5B6475"); LINE = HexColor("#C9D9FB"); FBORD = HexColor("#9DBDF9")
for w in ["Regular", "Medium", "SemiBold", "Bold", "ExtraBold"]:
    pdfmetrics.registerFont(TTFont("PJ-" + w, os.path.join(ASSETS, f"PlusJakartaSans-{w}.ttf")))

W, H = 595.27, 841.89
M = 34; CW = W - 2 * M; BOTTOM = 62
LOGO_W = ImageReader(os.path.join(HERE, "logo-blanc.png")); LOGO_B = ImageReader(os.path.join(HERE, "logoB.png"))
FOOT1 = "Eloy Assurances Patrimoine · SARL · SIREN 919 934 075 · Courtier en assurance, ORIAS n° 23 000 527 (orias.fr)"
FOOT2 = "Immeuble Lina's, Le Lamentin, Martinique · 06 96 33 29 09 · eloy.assurances@gmail.com"


class Doc:
    def __init__(self, path, total=None):
        self.c = canvas.Canvas(path, pagesize=(W, H))
        self.c.setTitle("Questionnaire multirisque habitation – Eloy")
        self.c.setAuthor("Eloy Assurances Patrimoine")
        self.f = self.c.acroForm
        self.page = 1; self.total = total; self.n = 0
        self.first_header()

    # ---------- page furniture ----------
    def first_header(self):
        c = self.c
        c.setFillColor(BLUE); c.rect(0, H - 108, W, 108, stroke=0, fill=1)
        c.drawImage(LOGO_W, M, H - 70, width=82, height=82 * 459 / 900, mask="auto")
        c.setFillColor(white)
        c.setFont("PJ-Medium", 9); c.drawRightString(W - M, H - 38, "QUESTIONNAIRE D'ÉTUDE")
        c.setFont("PJ-ExtraBold", 20); c.drawRightString(W - M, H - 62, "Multirisque habitation")
        c.setFont("PJ-Regular", 9); c.drawRightString(W - M, H - 80, "Martinique · Guadeloupe · Guyane")
        self.y = H - 128
        self.para("À compléter directement sur ordinateur ou téléphone, puis à retourner par e-mail "
                  "à eloy.assurances@gmail.com.", 8.5, GREY)
        self.y -= 4

    def small_header(self):
        c = self.c
        c.setFont("PJ-SemiBold", 9); c.setFillColor(GREY)
        c.drawString(M, H - 40, "Questionnaire multirisque habitation")
        c.drawImage(LOGO_B, W - M - 52, H - 46, width=52, height=52 * 952 / 1501, mask="auto")
        c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(M, H - 54, W - M, H - 54)
        self.y = H - 72

    def footer(self):
        c = self.c
        c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(M, 46, W - M, 46)
        c.setFont("PJ-Regular", 7); c.setFillColor(GREY)
        c.drawString(M, 34, FOOT1); c.drawString(M, 24, FOOT2)
        t = f"{self.page}/{self.total}" if self.total else str(self.page)
        c.setFont("PJ-SemiBold", 7.5); c.drawRightString(W - M, 24, t)

    def new_page(self):
        self.footer(); self.c.showPage(); self.page += 1; self.small_header()

    def ensure(self, h):
        if self.y - h < BOTTOM:
            self.new_page()

    def name(self, base):
        self.n += 1; return f"{base}_{self.n}"

    # ---------- blocks ----------
    def para(self, text, size=8.5, color=INK, font="PJ-Regular", lead=None, width=None):
        lead = lead or size * 1.38
        lines = simpleSplit(text, font, size, width or CW)
        self.ensure(lead * len(lines))
        self.c.setFont(font, size); self.c.setFillColor(color)
        for ln in lines:
            self.y -= lead; self.c.drawString(M, self.y + 2, ln)

    def section(self, num, title, need=70):
        self.ensure(30 + need)
        self.y -= 14
        c = self.c
        c.setFillColor(BLUE); c.roundRect(M, self.y - 18, 20, 20, 5, stroke=0, fill=1)
        c.setFillColor(white); c.setFont("PJ-Bold", 10.5); c.drawCentredString(M + 10, self.y - 12, str(num))
        c.setFillColor(INK); c.setFont("PJ-Bold", 12.5); c.drawString(M + 30, self.y - 12.5, title)
        self.y -= 28

    def tf(self, name, x, y, w, h=17, multiline=False, tip=""):
        self.f.textfield(name=name, tooltip=tip, x=x, y=y, width=w, height=h,
                         fontName="Helvetica", fontSize=0 if multiline else 9,
                         borderColor=FBORD, fillColor=LIGHT, textColor=INK, borderWidth=0.8,
                         forceBorder=True, fieldFlags="multiline" if multiline else "")

    def fields(self, items):
        """items: (label, fraction, name[, suffix])"""
        self.ensure(36)
        gap = 10; avail = CW - gap * (len(items) - 1); x = M
        for it in items:
            label, frac, nm = it[:3]; suf = it[3] if len(it) > 3 else ""
            w = avail * frac
            self.c.setFont("PJ-SemiBold", 7.8); self.c.setFillColor(GREY)
            self.c.drawString(x, self.y - 8, label)
            fw = w - (stringWidth(suf, "PJ-Medium", 8.5) + 5 if suf else 0)
            self.tf(nm, x, self.y - 29, fw, tip=label)
            if suf:
                self.c.setFont("PJ-Medium", 8.5); self.c.setFillColor(GREY)
                self.c.drawString(x + fw + 4, self.y - 24, suf)
            x += w + gap
        self.y -= 35

    def _box(self, kind, group, value, x, y):
        s = 10
        if kind == "radio":
            self.f.radio(name=group, value=value, selected=False, x=x, y=y, size=s,
                         buttonStyle="check", shape="square", borderColor=BLUE, fillColor=white,
                         textColor=BLUE, borderWidth=1, forceBorder=True, tooltip=value)
        else:
            self.f.checkbox(name=group, x=x, y=y, size=s, buttonStyle="check", borderColor=BLUE,
                            fillColor=white, textColor=BLUE, borderWidth=1, forceBorder=True,
                            tooltip=value)

    def choice(self, label, group, options, kind="radio", label_w=None, after=None, cols=None):
        """Label on the left, options flowing on the right. after=(label, name, width) adds a text field."""
        c = self.c; size = 8.8
        lw = label_w if label_w is not None else 250
        lab_lines = simpleSplit(label, "PJ-Medium", size, lw - 8) if label else []
        x0 = M + lw; x = x0; rows = 1
        # pre-measure
        pos = []
        if cols:
            cw = (CW - lw) / cols
            for i, o in enumerate(options):
                pos.append((x0 + (i % cols) * cw, i // cols))
            rows = (len(options) - 1) // cols + 1
        else:
            r = 0
            for o in options:
                ow = 15 + stringWidth(o, "PJ-Regular", size) + 16
                if x + ow > M + CW and x > x0:
                    r += 1; x = x0
                pos.append((x, r)); x += ow
            rows = r + 1
        h = max(rows * 16, len(lab_lines) * 12) + 6
        extra = 0
        if after:
            extra = 0  # inline after options on last row
        self.ensure(h + 4)
        c.setFont("PJ-Medium", size); c.setFillColor(INK)
        for i, ln in enumerate(lab_lines):
            c.drawString(M, self.y - 11 - i * 12, ln)
        endx = x0
        for o, (px, r) in zip(options, pos):
            yy = self.y - 13 - r * 16
            val = o if kind == "radio" else o
            gname = group if kind == "radio" else self.name(group)
            self._box(kind, gname, self.slug(o), px, yy - 1.5)
            c.setFont("PJ-Regular", size); c.setFillColor(INK)
            c.drawString(px + 15, yy, o)
            endx = px + 15 + stringWidth(o, "PJ-Regular", size) + 16
        if after:
            al, an, aw = after
            r = pos[-1][1]; yy = self.y - 13 - r * 16
            c.setFont("PJ-Medium", size); c.setFillColor(INK)
            c.drawString(endx + 4, yy, al)
            fx = endx + 8 + stringWidth(al, "PJ-Medium", size)
            self.tf(an, fx, yy - 4.5, min(aw, M + CW - fx), h=15, tip=al)
        self.y -= h

    @staticmethod
    def slug(s):
        import unicodedata, re
        s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
        return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_") or "x"

    def oui_non(self, label, group, label_w=330, after=None):
        self.choice(label, group, ["Oui", "Non"], label_w=label_w, after=after)

    def rule(self, pad=6):
        self.y -= pad; self.c.setStrokeColor(LINE); self.c.setLineWidth(0.6)
        self.c.line(M, self.y, M + CW, self.y); self.y -= pad

    def sub(self, text):
        self.ensure(34); self.y -= 4
        self.c.setFont("PJ-Bold", 9.5); self.c.setFillColor(BLUE)
        self.c.drawString(M, self.y - 10, text); self.y -= 16

    def note(self, text):
        self.para(text, 7.4, GREY, lead=10.2)

    def finish(self):
        self.footer(); self.c.save(); return self.page



def personnes(d, titre, base, n):
    """Tableau nom / prénom / date de naissance / ville de naissance (16/11/2026, demande de Bradley)."""
    d.ensure(26 + 21 * n)
    d.c.setFont("PJ-Medium", 7.8); d.c.setFillColor(INK); d.c.drawString(M, d.y - 8, titre)
    d.y -= 14
    cols = [("Nom", .28), ("Prénom", .24), ("Date de naissance", .2), ("Ville de naissance", .28)]
    gap = 8; avail = CW - gap * (len(cols) - 1)
    x = M
    d.c.setFont("PJ-SemiBold", 7.8); d.c.setFillColor(GREY)
    for lab, fr in cols:
        d.c.drawString(x, d.y - 8, lab); x += avail * fr + gap
    d.y -= 12
    for i in range(1, n + 1):
        x = M
        for (lab, fr), k in zip(cols, ("nom", "prenom", "naissance", "ville")):
            d.tf(f"{base}{i}_{k}", x, d.y - 17, avail * fr, tip=f"{lab} ({base} {i})"); x += avail * fr + gap
        d.y -= 21
    d.y -= 4

def build(path, total=None):
    d = Doc(path, total)

    # 1 ---------------------------------------------------------------
    d.section(1, "Vos coordonnées")
    d.fields([("Nom(s)", .5, "nom"), ("Prénom(s)", .5, "prenom")])
    d.fields([("Nom(s) de naissance", .5, "nom_naissance"), ("Nationalité", .5, "nationalite")])
    d.fields([("Date de naissance (jj/mm/aaaa)", .35, "date_naissance"), ("Lieu de naissance", .65, "lieu_naissance")])
    d.fields([("Adresse", 1, "adresse")])
    d.fields([("Code postal", .25, "cp"), ("Ville", .75, "ville")])
    d.fields([("Profession", 1, "profession")])
    d.fields([("Téléphone", .4, "telephone"), ("E-mail", .6, "email")])

    # 2 ---------------------------------------------------------------
    d.section(2, "Vous et ce bien", need=190)
    d.fields([("Ce questionnaire concerne le bien n°", .5, "bien_numero"), ("sur un total de (nombre de biens à assurer)", .5, "nb_biens")])
    d.note("Plusieurs biens à assurer : remplissez un questionnaire par bien (vos coordonnées peuvent n'être indiquées que sur le premier), "
           "ou utilisez le questionnaire en ligne, qui regroupe tous vos biens.")
    d.y -= 6
    d.sub("Pour ce bien, vous êtes")
    d.choice("", "qualite", [
        "Propriétaire ou copropriétaire occupant",
        "Propriétaire ou copropriétaire non-occupant",
        "Propriétaire non-occupant pour le compte du locataire",
        "Locataire pour le compte du propriétaire",
        "Locataire", "Colocataire", "Usufruitier", "Nu-propriétaire"], label_w=0, cols=2)
    d.y -= 8
    d.choice("Si vous êtes locataire, le logement est loué", "locataire_meuble", ["Meublé", "Vide (non meublé)"], label_w=230)
    d.y -= 4
    d.choice("Le contrat sera au nom de", "titulaire", ["Moi-même", "Une société (SCI, SARL…)", "Une autre personne"], label_w=150)
    d.y -= 4
    d.fields([("Si société : nom de la société", .62, "societe"), ("N° SIREN de la société", .38, "siren")])
    d.fields([("Si autre personne : nom, prénom et lien avec vous", 1, "autre_personne")])
    d.ensure(120)
    d.sub("Si vous occupez le logement")
    d.oui_non("D'autres personnes sont-elles à assurer sur ce bien ?", "autres_assures")
    personnes(d, "Si oui, pour chaque personne :", "autre", 4)
    d.oui_non("Avez-vous des enfants scolarisés à assurer sur ce bien ?", "enfants_scolarises")
    personnes(d, "Si oui, pour chaque enfant :", "enfant", 5)

    # 3 ---------------------------------------------------------------
    d.section(3, "Description du bien", need=160)
    d.sub("Adresse du bien à assurer")
    d.fields([("Adresse", 1, "risque_adresse")])
    d.fields([("Code postal", .25, "risque_cp"), ("Ville", .75, "risque_ville")])
    d.y -= 4
    d.choice("Type de logement", "type_logement", ["Maison", "Appartement"], label_w=150)
    d.y -= 4
    d.choice("Niveau du logement", "niveau", ["Rez-de-chaussée", "Étage"], label_w=150,
             after=("N° de l'étage :", "numero_etage", 45))
    d.y -= 4
    d.choice("Usage", "usage", ["Résidence principale", "Résidence secondaire", "Loué à l'année",
                                 "Location saisonnière", "Vacant"], label_w=150)
    d.y -= 4

    d.y -= 10
    d.sub("Surfaces")
    d.fields([("Nombre de pièces", .3, "nb_pieces"), ("Superficie développée", .35, "superficie", "m²"),
              ("Varangue / terrasse / balcon", .35, "surface_varangue", "m²")])
    d.fields([("Sous-sol / combles / garages", .5, "surface_soussol", "m²"),
              ("Dépendances (à la même adresse)", .5, "surface_dependances", "m²")])

    d.y -= 10
    d.ensure(160)
    d.sub("Construction")
    d.fields([("Année de construction", .35, "annee_construction")])
    d.choice("ou période de construction", "periode", ["Avant 1971", "1971 à 1989", "1990 et après"], label_w=150)
    d.y -= 4
    d.fields([("Nature de la construction (béton, bois, mixte…)", .5, "nature_construction"),
              ("Nature de la couverture (dalle béton, tôle…)", .5, "nature_couverture")])
    d.choice("Matériaux du logement **", "materiaux", ["Durs (béton, parpaing, brique, pierre)", "Légers (bois, tôle…)",
             "Mixtes, avec plus de 25 % de matériaux légers"], label_w=150, cols=1)
    d.y -= 4
    d.oui_non("Panneaux solaires sur le logement", "solaire", label_w=250, after=("Si oui, valeur (€) :", "solaire_valeur", 70))
    d.y -= 4
    d.fields([("Distance entre le logement et la mer, ou la berge la plus proche (m) ***", .6, "distance_mer")])
    d.choice("Le logement est-il à moins de 10 m d'altitude ?", "altitude", ["Oui", "Non", "Je ne sais pas"], label_w=250)
    d.y -= 4
    d.oui_non("Le logement sert-il aussi à une activité professionnelle ?", "usage_mixte", label_w=250)
    d.y -= 4
    d.ensure(90)
    d.sub("Si vous êtes propriétaire")
    d.oui_non("Le logement fait-il partie d'une copropriété ?", "copro", label_w=250)
    d.y -= 4
    d.choice("Si oui, la copropriété est-elle assurée ?", "copro_assuree", ["Oui", "Non", "Je ne sais pas"], label_w=250)
    d.y -= 4
    d.choice("Type de copropriété", "copro_type", ["Verticale (immeuble)", "Horizontale (maisons ou lots sur un même terrain)"], label_w=150)
    d.y -= 6
    d.oui_non("Piscine / spa *", "piscine", label_w=250)
    d.y -= 4
    d.oui_non("Installations extérieures *", "install_ext", label_w=250)
    d.y -= 4
    d.oui_non("Installations développement durable *", "install_dd", label_w=250)
    d.y -= 10
    d.note("* Piscine / spa : piscines enterrées ou semi-enterrées, spas et jacuzzis rigides. Ne peuvent pas être assurés "
           "les piscines hors-sol à membrane souple ou démontables, ni les spas et jacuzzis gonflables.")
    d.y -= 2
    d.note("* Installations extérieures : installations fixées au sol et situées à l'extérieur (fontaines, barbecues ancrés, "
           "pergolas, stores non fixés au bâtiment, tables et chaises de jardin, tondeuses…).")
    d.y -= 2
    d.note("* Installations développement durable : panneaux photovoltaïques, composteurs, bacs ou silos à compost, "
           "captage, récupération et traitement des eaux, chauffe-eau solaires individuels non fixés à la toiture.")
    d.y -= 2
    d.note("** Matériaux légers : tous les matériaux qui ne sont pas en dur, notamment le bois, les tôles fixées par clous ou "
           "tire-fonds et les tuiles non scellées.")
    d.y -= 2
    d.note("*** Distance mesurée jusqu'au trait de côte, par exemple sur le site Géoportail. Près d'un lac, d'une rivière ou "
           "d'un étang, indiquez la distance à la berge la plus proche.")

    # 4 ---------------------------------------------------------------
    d.section(4, "Déclarations complémentaires", need=110)
    d.choice("Logement en zone inondable (plan de prévention des risques, aléa moyen ou fort)", "inondable",
             ["Oui", "Non", "Je ne sais pas"], label_w=330)
    d.y -= 4
    d.choice("Logement en zone exposée aux mouvements de terrain (forte instabilité de pente)", "mouvement_terrain",
             ["Oui", "Non", "Je ne sais pas"], label_w=330)
    d.y -= 4
    d.choice("Bâtiment construit sur un terrain non constructible ou sans respecter les règles en vigueur", "non_conforme",
             ["Oui", "Non", "Je ne sais pas"], label_w=330)
    d.y -= 4
    d.oui_non("Bâtiment classé ou inscrit comme monument historique", "monument", label_w=400)
    d.oui_non("Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation", "demolition", label_w=400)
    d.oui_non("Logement non occupé plus de 90 jours par an", "inoccupation", label_w=400)
    d.oui_non("Location partielle ou temporaire du bien", "location_partielle", label_w=400)
    d.oui_non("Chambre d'hôtes", "chambre_hotes", label_w=400)
    d.oui_non("Si oui, table d'hôtes", "table_hotes", label_w=400)

    # 5 ---------------------------------------------------------------
    d.section(5, "Capital mobilier (si vous occupez le logement)", need=60)
    d.fields([("Valeur du mobilier", .5, "valeur_mobilier", "€"), ("Dont objets de valeur", .5, "objets_valeur", "€")])

    # 6 ---------------------------------------------------------------
    d.section(6, "Antécédents de ce bien", need=150)
    d.oui_non("Ce bien est-il actuellement assuré ?", "deja_assure")
    d.ensure(77)
    d.para("Sinistres déclarés sur ce bien au cours des 36 derniers mois", 8.8, INK, "PJ-Medium")
    d.y -= 3
    nw = CW * .78 - 5
    d.c.setFont("PJ-SemiBold", 7.8); d.c.setFillColor(GREY)
    d.c.drawString(M, d.y - 8, "Nature du sinistre"); d.c.drawString(M + nw + 10, d.y - 8, "Année")
    d.y -= 12
    for i in range(1, 3):
        d.tf(f"sinistre{i}_nature", M, d.y - 17, nw, tip=f"Nature du sinistre {i}")
        d.tf(f"sinistre{i}_annee", M + nw + 10, d.y - 17, CW - nw - 10, tip=f"Année du sinistre {i}")
        d.y -= 21
    d.y -= 4
    d.oui_non("Un précédent assureur a-t-il résilié le contrat de ce bien ?", "resilie")
    d.fields([("Motif de la résiliation", 1, "motif_resiliation")])

    # 6 ---------------------------------------------------------------
    d.ensure(80); d.y -= 16
    d.para("Les informations déclarées servent à établir la proposition d'assurance. Toute réticence ou fausse "
           "déclaration intentionnelle entraîne la nullité du contrat (article L113-8 du Code des assurances) ; toute "
           "omission ou déclaration inexacte peut entraîner une réduction des indemnités (article L113-9). Ce questionnaire "
           "ne vaut pas contrat : la garantie ne prend effet qu'après acceptation de l'assureur.", 8, INK)
    d.y -= 3
    d.para("Les informations recueillies sont utilisées par Eloy pour étudier votre demande et sont transmises aux assureurs "
           "consultés. Vous pouvez exercer vos droits d'accès, de rectification et d'effacement en écrivant à "
           "eloy.assurances@gmail.com.", 7.4, GREY, lead=10.2)
    return d.finish()


if __name__ == "__main__":
    import tempfile
    OUT = os.path.normpath(os.path.join(HERE, "..", "..", "..", "dist", "docs", "Eloy_Questionnaire_MRH.pdf"))
    n = build(os.path.join(tempfile.gettempdir(), "mrh_essai.pdf"))
    build(OUT, total=n)
    print(OUT, "pages", n)
