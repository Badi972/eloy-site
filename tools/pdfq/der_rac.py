#!/usr/bin/env python3
"""DER Eloy – Rachat de crédits (mandataire d'intermédiaire en opérations de banque de CAP 100 FINANCE).

Usage : python3 tools/pdfq/der_rac.py  ->  dist/docs/Eloy_DER_Rachat_de_credits.pdf
Contenu repris de l'affichage obligatoire CAP 100 FINANCE (MAJ 09/2026) + art. R519-20 CMF.
"""
import os, re
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assets')
OUT = os.path.join(HERE, '..', '..', 'dist', 'docs', 'Eloy_DER_Rachat_de_credits.pdf')
for n in ('Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'):
    pdfmetrics.registerFont(TTFont('PJ-' + n, os.path.join(A, 'PlusJakartaSans-%s.ttf' % n)))

W, H = 595.2756, 841.8898
X0, X1 = 36, W - 36
CW = X1 - X0
NAVY = HexColor('#0B1220'); BLUE = HexColor('#1B66F7'); BLUED = HexColor('#0F4ECB')
INK = HexColor('#0B1220'); GREY = HexColor('#4A556A'); MUTED = HexColor('#6B7489')
LIGHT = HexColor('#EEF3FE'); LINE = HexColor('#DCE3F0'); SOFT = HexColor('#8BB1FA')
ORANGE = HexColor('#E85D04'); CARD = HexColor('#F7F9FD'); SOFTB = HexColor('#CFE0FF')
TOP, BOTTOM = H - 74, 70
VERSION = "Version 11/2026"


def sw(t, f, s):
    return pdfmetrics.stringWidth(t, f, s)


def tokens(text, base='PJ-Regular', bold='PJ-Bold'):
    """'**gras**' -> [(mot, police)] (les espaces sont portés par le mot suivant)."""
    out, prev_space = [], True
    for i, part in enumerate(re.split(r'\*\*', text)):
        f = bold if i % 2 else base
        for j, w in enumerate(part.split(' ')):
            if w == '':
                continue
            out.append([w, f, j == 0 and not prev_space])
        if part:
            prev_space = part.endswith(' ')
    return out


def rich_lines(text, size, width, base='PJ-Regular', bold='PJ-Bold'):
    lines, cur, curw = [], [], 0
    for w, f, glue in tokens(text, base, bold):
        if w == '':
            continue
        sp = 0 if (glue or not cur) else sw(' ', f, size)
        ww = sw(w, f, size)
        if cur and curw + sp + ww > width:
            lines.append(cur); cur, curw, sp = [], 0, 0
        cur.append((w, f, sp)); curw += sp + ww
    if cur:
        lines.append(cur)
    return lines


class Doc:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=(W, H))
        self.c.setTitle("Document d’entrée en relation – Rachat de crédits – Eloy")
        self.c.setAuthor("Eloy Assurances Patrimoine")
        self.c.setSubject("Informations réglementaires : statut, mandant, rémunération, partenaires, réclamations")
        self.page = 1
        self._chrome()
        self.y = self.top

    # ---------- habillage ----------
    def _chrome(self):
        c = self.c
        if self.page == 1:
            hb = 150
            c.setFillColor(BLUE); c.rect(0, H - hb, W, hb, stroke=0, fill=1)
            c.saveState(); pth = c.beginPath(); pth.rect(0, H - hb, W, hb); c.clipPath(pth, stroke=0, fill=0)
            c.drawImage(ImageReader(os.path.join(A, 'deco.png')), W - 80, H - hb - 20, 98, 184, mask='auto'); c.restoreState()
            c.drawImage(ImageReader(os.path.join(A, 'logo-blanc.png')), X0, H - 56, 58.8, 30, mask='auto')
            c.setStrokeColor(SOFTB); c.setLineWidth(.8); c.line(X0 + 72, H - 30, X0 + 72, H - 52)
            c.setFillColor(SOFTB); c.setFont('PJ-Medium', 8.5)
            c.drawString(X0 + 84, H - 44, "Assurance  ·  Rachat de crédits  ·  Financement professionnel")
            c.setFont('PJ-Bold', 7.4); c.drawString(X0, H - 88, "DOCUMENT D’ENTRÉE EN RELATION · RACHAT DE CRÉDITS")
            c.setFillColor(white); c.setFont('PJ-ExtraBold', 21); c.drawString(X0, H - 113, "Qui suis-je et comment je travaille")
            c.setFillColor(SOFTB); c.setFont('PJ-Medium', 10.5); c.drawString(X0, H - 131, "Statut, rémunération, banques partenaires, réclamations")
            self.top = H - hb - 20
        else:
            c.drawImage(ImageReader(os.path.join(A, 'logo-bleu.png')), X0, H - 58, 45.1, 23, mask='auto')
            c.setFillColor(GREY); c.setFont('PJ-Regular', 7.5)
            c.drawRightString(X1, H - 50, "Document d’entrée en relation · Rachat de crédits")
            c.setStrokeColor(LINE); c.setLineWidth(.8); c.line(X0, H - 66, X1, H - 66)
            self.top = H - 86
        # pied : bandeau bleu clair
        c.setFillColor(LIGHT); c.rect(0, 0, W, 48, stroke=0, fill=1)
        c.setFillColor(BLUE); c.rect(0, 48, W, 2, stroke=0, fill=1)
        c.drawImage(ImageReader(os.path.join(A, 'logo-bleu.png')), X0, 15, 35.3, 18, mask='auto')
        c.setFillColor(INK); c.setFont('PJ-Bold', 7); c.drawRightString(X1, 33, "Eloy · Courtier en assurances & crédits · ORIAS n° 23 000 527")
        c.setFillColor(GREY); c.setFont('PJ-Regular', 6.8)
        c.drawRightString(X1, 23, "Immeuble Lina’s · Mangot Vulcin · 97232 Le Lamentin")
        c.setFillColor(BLUE)
        c.drawRightString(X1, 13, "06 96 33 29 09 · contact@eloy-assurances-patrimoine.fr · www.eloy-assurances-patrimoine.fr")
        c.setFillColor(MUTED); c.setFont('PJ-Regular', 6.5)
        c.drawString(X0, 55, VERSION)
        c.drawRightString(X1, 55, "Page %d" % self.page)

    def need(self, h):
        if self.y - h < BOTTOM:
            self.c.showPage(); self.page += 1; self._chrome(); self.y = self.top

    # ---------- blocs ----------
    def titre(self, intro):
        self.para(intro, size=9, color=GREY, lead=13.5)
        self.y -= 2

    def para(self, text, size=8.2, color=GREY, lead=None, x=X0, width=CW, base='PJ-Regular', bold='PJ-Bold', gap=4):
        lead = lead or size * 1.5
        c = self.c
        for ln in rich_lines(text, size, width, base, bold):
            self.need(lead)
            xx = x
            for w, f, sp in ln:
                xx += sp
                c.setFont(f, size); c.setFillColor(INK if f == bold else color)
                c.drawString(xx, self.y - size, w); xx += sw(w, f, size)
            self.y -= lead
        self.y -= gap

    def section(self, n, titre, badge=None, keep=60):
        self.need(keep)
        self.y -= 5
        c = self.c
        c.setFillColor(BLUE); c.roundRect(X0, self.y - 17, 17, 17, 4, stroke=0, fill=1)
        c.setFillColor(white); c.setFont('PJ-ExtraBold', 8.5); c.drawCentredString(X0 + 8.5, self.y - 11.6, str(n))
        c.setFillColor(INK); c.setFont('PJ-ExtraBold', 9.6); c.drawString(X0 + 26, self.y - 12, titre.upper())
        if badge:
            bw = sw(badge, 'PJ-Bold', 6.4) + 16
            c.setFillColor(LIGHT); c.roundRect(X1 - bw, self.y - 14.5, bw, 12, 6, stroke=0, fill=1)
            c.setFillColor(BLUED); c.setFont('PJ-Bold', 6.4); c.drawCentredString(X1 - bw / 2, self.y - 10.6, badge)
        self.y -= 25

    def fiche(self, rows, lw=150):
        """Carte libellé / valeur."""
        size, lead = 8.2, 12
        hs = [max(1, len(rich_lines(v, size, CW - lw - 24))) * lead + 7 for _, v in rows]
        tot = sum(hs) + 6
        self.need(min(tot, 300))
        c = self.c
        top = self.y
        c.setFillColor(CARD); c.setStrokeColor(LINE); c.setLineWidth(.7)
        c.roundRect(X0, top - tot, CW, tot, 7, stroke=1, fill=1)
        y = top - 3
        for i, ((k, v), h) in enumerate(zip(rows, hs)):
            if i:
                c.setStrokeColor(LINE); c.line(X0 + 12, y, X1 - 12, y)
            c.setFillColor(MUTED); c.setFont('PJ-SemiBold', 7.4); c.drawString(X0 + 12, y - 12, k)
            yy = y - 3.5
            for ln in rich_lines(v, size, CW - lw - 24):
                xx = X0 + lw
                for w, f, sp in ln:
                    xx += sp; c.setFont(f, size); c.setFillColor(INK)
                    c.drawString(xx, yy - size, w); xx += sw(w, f, size)
                yy -= lead
            y -= h
        self.y = top - tot - 10

    def note(self, text, color=BLUE, bg=LIGHT, size=8.2):
        ls = rich_lines(text, size, CW - 30)
        h = len(ls) * size * 1.5 + 16
        self.need(h)
        c = self.c
        c.setFillColor(bg); c.roundRect(X0, self.y - h, CW, h, 6, stroke=0, fill=1)
        c.setFillColor(color); c.rect(X0, self.y - h, 3, h, stroke=0, fill=1)
        y = self.y - 8
        for ln in ls:
            xx = X0 + 16
            for w, f, sp in ln:
                xx += sp; c.setFont(f, size); c.setFillColor(INK)
                c.drawString(xx, y - size, w); xx += sw(w, f, size)
            y -= size * 1.5
        self.y -= h + 10

    def tableau(self, entetes, lignes, largeurs, size=7.6, bold_first=True):
        c = self.c
        ws = [CW * l for l in largeurs]
        hh = 18
        self.need(hh + 20)

        def head():
            c.setFillColor(BLUE); c.roundRect(X0, self.y - hh, CW, hh, 4, stroke=0, fill=1)
            x = X0
            for t, w in zip(entetes, ws):
                c.setFillColor(white); c.setFont('PJ-Bold', 7); c.drawString(x + 8, self.y - 12, t.upper()); x += w
            self.y -= hh
        head()
        for i, row in enumerate(lignes):
            cells = [rich_lines(t, size, w - 16, 'PJ-Bold' if (j == 0 and bold_first) else 'PJ-Regular')
                     for j, (t, w) in enumerate(zip(row, ws))]
            h = max(len(x) for x in cells) * size * 1.42 + 7
            if self.y - h < BOTTOM:
                self.need(10 ** 4); head()
            if i % 2:
                c.setFillColor(CARD); c.rect(X0, self.y - h, CW, h, stroke=0, fill=1)
            c.setStrokeColor(LINE); c.setLineWidth(.6); c.line(X0, self.y - h, X1, self.y - h)
            x = X0
            for j, (ls, w) in enumerate(zip(cells, ws)):
                y = self.y - 4
                for ln in ls:
                    xx = x + 8
                    for t, f, sp in ln:
                        xx += sp; c.setFont(f, size); c.setFillColor(INK if j == 0 else GREY)
                        c.drawString(xx, y - size, t); xx += sw(t, f, size)
                    y -= size * 1.42
                x += w
            self.y -= h
        self.y -= 10

    def signature(self):
        h = 92
        self.need(h + 30)
        c = self.c
        self.para("Je reconnais avoir reçu ce document d’entrée en relation et en avoir pris connaissance, avant toute étude de ma demande.", size=8.4, color=INK)
        top = self.y
        c.setStrokeColor(LINE); c.setFillColor(white); c.setLineWidth(.8)
        c.roundRect(X0, top - h, CW, h, 8, stroke=1, fill=1)
        cols = [("NOM ET PRÉNOM DE L’EMPRUNTEUR", .36), ("CO-EMPRUNTEUR", .36), ("DATE", .28)]
        x = X0
        form = c.acroForm
        for i, (t, f) in enumerate(cols):
            w = CW * f
            if i:
                c.line(x, top - 8, x, top - h + 8)
            c.setFillColor(MUTED); c.setFont('PJ-Bold', 6.6); c.drawString(x + 12, top - 17, t)
            form.textfield(name='der_%d' % i, x=x + 10, y=top - 40, width=w - 20, height=16, borderWidth=0,
                           fillColor=HexColor('#F2F6FE'), fontName='Helvetica', fontSize=9, tooltip=t.capitalize())
            c.setFillColor(MUTED); c.setFont('PJ-Bold', 6.6)
            if i < 2:
                c.drawString(x + 12, top - 56, "SIGNATURE")
            x += w
        self.y = top - h - 8


def build():
    d = Doc(OUT)
    d.titre("Ce document vous est remis **avant l’étude de votre dossier**. Il présente mon statut, l’organisme pour lequel j’interviens, "
            "ma rémunération, les banques avec lesquelles je travaille et vos recours en cas de désaccord. Conservez-le.")

    d.section(1, "Votre intermédiaire")
    d.fiche([
        ("Dénomination", "**ELOY** (Eloy Assurances Patrimoine), SARL au capital de 1 000 €"),
        ("Immatriculation", "RCS Fort-de-France n° 919 934 075"),
        ("Siège social", "N2 Immeuble Grandu, boulevard Nelson Mandela, 97200 Fort-de-France"),
        ("Bureau", "Immeuble Lina’s, Mangot Vulcin, 97232 Le Lamentin"),
        ("Votre interlocuteur", "Bradley Village · 06 96 33 29 09 · contact@eloy-assurances-patrimoine.fr"),
        ("Inscription ORIAS", "n° **23 000 527**, vérifiable sur **www.orias.fr**"),
        ("Catégories", "Mandataire d’intermédiaire en opérations de banque (mandant : CAP 100 FINANCE) · Courtier d’assurance"),
        ("Autorité de contrôle", "ACPR, 4 place de Budapest, CS 92459, 75436 Paris Cedex 09 · www.acpr.banque-france.fr"),
    ])

    d.section(2, "Mon mandant")
    d.para("Pour le rachat de crédits, j’interviens **au nom et pour le compte de CAP 100 FINANCE**, qui me donne mandat de vous présenter "
           "les solutions de ses établissements partenaires (liste en partie 5).")
    d.fiche([
        ("Dénomination", "**CAP 100 FINANCE**, SAS au capital de 8 000 €"),
        ("Immatriculation", "RCS Nancy n° 503 643 231"),
        ("Siège social", "3 route de Nancy, Espace P, 54840 Gondreville"),
        ("Inscription ORIAS", "n° **12 066 041**, vérifiable sur **www.orias.fr**"),
        ("Statut", "Intermédiaire en opérations de banque, mandataire non exclusif · Courtier et mandataire d’intermédiaire d’assurance"),
    ])

    d.section(3, "Comment se déroule votre dossier")
    d.para("**1. Étude de votre situation** : revenus, charges, crédits en cours, projet. Je vérifie que le regroupement est utile pour vous.")
    d.para("**2. Recherche du financement** : je présente votre dossier aux établissements partenaires adaptés à votre profil.")
    d.para("**3. Proposition** : je vous transmets l’offre retenue avec son coût total, sa durée et sa nouvelle mensualité, pour que vous décidiez en connaissance de cause.")
    d.para("**4. Accompagnement jusqu’au déblocage des fonds** et au remboursement de vos anciens crédits.")
    d.note("La décision d’accorder le crédit appartient à l’établissement prêteur. Vous disposez du délai de réflexion ou de rétractation prévu par la loi pour l’offre que vous recevez.")

    d.section(4, "Rémunération", "TRANSPARENCE")
    d.para("Honoraires d’intermédiation bancaire, payables uniquement après le versement effectif des fonds :", color=INK)
    d.tableau(["Type de prêt", "Montant du prêt", "Honoraires (1)"],
              [["Regroupement de crédits sans garantie hypothécaire", "À partir de 1 500 €", "Jusqu’à 10 %"],
               ["Regroupement de crédits avec garantie hypothécaire", "À partir de 15 000 €", "Jusqu’à 10 %"]],
              [.5, .25, .25])
    d.para("(1) Dans la limite du taux d’usure en vigueur lors de l’octroi du prêt. Tarification en vigueur actuellement, susceptible d’évolution.", size=7.2, color=MUTED)
    d.note("**Aucun versement, de quelque nature que ce soit, ne peut être exigé d’un particulier avant l’obtention d’un ou plusieurs prêts d’argent.**", color=ORANGE, bg=HexColor('#FFF3EA'))
    d.para("Conformément à l’article L. 519-6 du Code monétaire et financier, il est interdit à toute personne physique ou morale qui apporte son concours, "
           "à quelque titre que ce soit et de quelque manière que ce soit, directement ou indirectement, à l’obtention ou à l’octroi d’un prêt d’argent, "
           "de percevoir une somme représentative de provision, de commissions, de frais de recherche, de démarches, de constitution de dossier ou d’entremise "
           "quelconque, avant le versement effectif des fonds prêtés. Il lui est également interdit, avant la remise des fonds et de la copie de l’acte, de présenter "
           "à l’acceptation de l’emprunteur des lettres de change, ou de lui faire souscrire des billets à ordre, en recouvrement des frais d’entremise ou des "
           "commissions mentionnées à l’alinéa précédent.", size=7.2)
    d.para("L’intermédiaire est susceptible de recevoir également une rémunération de l’établissement prêteur, sous certaines conditions, et sans que celle-ci "
           "ne puisse influer sur la qualité de ses propositions. Son montant est déterminé en fonction notamment de la nature du crédit, du volume et de la qualité "
           "de la production réalisée. **Cette rémunération varie entre 0,5 et 9,5 % du montant du financement.** La commission versée par l’établissement de crédit "
           "rémunère les coûts de distribution supportés par l’intermédiaire. Les modalités ou le niveau de la rémunération perçue par l’intermédiaire et la manière "
           "dont il rémunère son personnel ne vont pas à l’encontre de son obligation d’agir au mieux des intérêts des clients.", size=7.2)
    d.para("CAP 100 FINANCE n’a pas enregistré, au titre de son activité d’intermédiaire en opérations de banque, au cours de l’année précédente, "
           "une part supérieure au tiers de son chiffre d’affaires avec un partenaire.", size=7.2)

    d.section(5, "Établissements bancaires partenaires")
    d.tableau(["Établissement", "Adresse"],
              [["CA Consumer Finance", "1 rue Victor Basch, 91068 Massy"],
               ["BNP Paribas Personal Finance", "1 boulevard Haussmann, 75318 Paris Cedex 09"],
               ["CFCAL", "1 rue du Dôme, BP 102, 67003 Strasbourg Cedex"],
               ["CGI", "69 avenue de Flandre, 59708 Marcq-en-Barœul Cedex"],
               ["Creatis", "61 avenue Halley, Parc de la Haute Borne, 59650 Villeneuve-d’Ascq"],
               ["My Money Bank", "Tour Europlaza, 20 avenue André Prothin, 92063 Paris La Défense Cedex"],
               ["Crédit Municipal de Toulon", "Place Besagne, bâtiment A, 83000 Toulon"],
               ["La Banque Postale Consumer Finance", "1-3 avenue François Mitterrand, 93212 La Plaine Saint-Denis"],
               ["Younited", "21 rue de Châteaudun, 75009 Paris"]],
              [.4, .6])

    d.section(6, "Partenaires assurance de prêt")
    d.tableau(["Assureur", "Adresse"],
              [["CACI Life & Non-Life", "BP 30136, 59564 La Madeleine Cedex"],
               ["Assurances du Crédit Mutuel Vie SA", "4 rue Frédéric-Guillaume Raiffeisen, 67000 Strasbourg"],
               ["Serenis Assurances SA", "22-28 rue Henri Barbusse, 92110 Clichy"],
               ["Kereis", "3 rue Victor Schoelcher, bâtiments E et F, 44800 Saint-Herblain"],
               ["AXA France Vie", "8/10 rue Paul Vaillant Couturier, 92240 Malakoff"],
               ["Sogecap", "17 bis place des Reflets, 92919 Paris La Défense Cedex"],
               ["Cardif", "1 boulevard Haussmann, TSA 93000, 75318 Paris Cedex 09"],
               ["Mutlog", "75 quai de la Seine, 75940 Paris Cedex 19"],
               ["MetLife", "Tour Ariane, 5 place de la Pyramide, 92800 Puteaux"]],
              [.4, .6])
    d.para("Vous restez libre de choisir une autre assurance de prêt présentant un niveau de garanties équivalent.", size=7.6)

    d.section(7, "Réclamations et médiation")
    d.para("En cas d’insatisfaction ou de difficulté concernant les services proposés, vous pouvez saisir le Service Réclamations :")
    d.fiche([
        ("Par courrier", "Cap 100 Finance, Service Réclamations, 3 route de Nancy, Espace P, 54840 Gondreville"),
        ("Par e-mail", "**reclamations@simply-miob.fr**"),
        ("Délais", "Accusé de réception sous **10 jours ouvrables**, réponse sous **2 mois** à compter de l’envoi de votre réclamation, sauf circonstances particulières dont vous serez informé."),
    ], lw=110)
    d.para("Si vous n’avez pas reçu de réponse dans un délai de 2 mois, ou si la réponse ne vous satisfait pas et qu’un litige demeure après épuisement "
           "des recours internes, vous pouvez saisir **gratuitement** un médiateur de la consommation indépendant :")
    d.fiche([
        ("Regroupement de crédits", "**IEAM, Médiation AFIB** (CAP 100 FINANCE est membre de l’AFIB) · www.ieam.eu, rubrique Médiation AFIB · 31 bis / 33 rue Daru, 75008 Paris. Le règlement de la médiation est disponible sur le site de l’IEAM."),
        ("Assurance", "**La Médiation de l’Assurance** (CAP 100 FINANCE est membre de VOTRASSO) · www.mediation-assurance.org, rubrique « Saisir le médiateur » · Pôle CSCA, TSA 50110, 75441 Paris Cedex 09"),
    ], lw=110)

    d.section(8, "Vos données personnelles")
    d.para("Les informations et pièces que vous me transmettez servent **uniquement à étudier et mettre en place votre financement**. Elles sont transmises "
           "à CAP 100 FINANCE et aux établissements sollicités pour votre dossier, et ne sont jamais vendues. Elles sont conservées pendant la durée "
           "nécessaire à votre dossier et aux obligations légales.")
    d.para("Vous pouvez à tout moment demander l’accès, la rectification ou l’effacement de vos données, ou vous opposer à leur utilisation, en écrivant à "
           "**contact@eloy-assurances-patrimoine.fr**. Vous pouvez aussi adresser une réclamation à la CNIL (www.cnil.fr).")

    d.note("**Attention ! Un crédit coûte de l’argent et doit être remboursé.** Vérifiez vos capacités de remboursement avant de vous engager. "
           "Un regroupement de crédits peut allonger la durée de remboursement et augmenter le coût total du crédit.", color=ORANGE, bg=HexColor('#FFF3EA'))

    d.section(9, "Accusé de réception", keep=150)
    d.signature()
    d.c.showPage(); d.c.save()
    return d.page


if __name__ == '__main__':
    print(build(), 'pages ->', os.path.abspath(OUT))
