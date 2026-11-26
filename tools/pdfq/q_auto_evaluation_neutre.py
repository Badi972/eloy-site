#!/usr/bin/env python3
"""Auto-évaluation du bateau de plaisance – version NEUTRE (sans les couleurs ni le logo d'Eloy), 26/11/2026, demande de Bradley.
Même contenu que q_auto_evaluation_vierge.py : la rubrique « État du bateau (auto-évaluation) » du questionnaire plaisance Eloy."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reportlab.lib.colors import Color, white, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import eloyq
DJ = '/usr/share/fonts/truetype/dejavu/'
for n, f in (('Regular', 'DejaVuSans.ttf'), ('Medium', 'DejaVuSansCondensed.ttf'), ('SemiBold', 'DejaVuSansCondensed-Bold.ttf'), ('Bold', 'DejaVuSans-Bold.ttf'), ('ExtraBold', 'DejaVuSans-Bold.ttf')):
    _f = TTFont('PJ-' + n, DJ + f); pdfmetrics._fonts['PJ-' + n] = _f; pdfmetrics.registerFont(_f)
eloyq.BLUE = HexColor('#222222'); eloyq.INK = HexColor('#111111'); eloyq.GREY = HexColor('#444444')
eloyq.LIGHT = HexColor('#F5F5F5'); eloyq.FBORD = HexColor('#9A9A9A'); eloyq.SOFT = HexColor('#CCCCCC')
eloyq.RULE = HexColor('#BBBBBB'); eloyq.ROWLINE = HexColor('#DDDDDD')
TITRE = "Questionnaire d’auto-évaluation du bateau de plaisance"
class N(eloyq.Q):
    def _header1(self, intro):
        c = self.c; W, H = eloyq.W, eloyq.H
        c.setFillColor(eloyq.INK); c.setFont('PJ-Bold', 17); c.drawString(eloyq.X0, H - 70, TITRE)
        c.setStrokeColor(eloyq.INK); c.setLineWidth(1.2); c.line(eloyq.X0, H - 82, eloyq.X1, H - 82)
        self.y = H - 104
        self._infobox(intro); self.y -= 12
    def _header_n(self):
        c = self.c; H = eloyq.H
        c.setFillColor(eloyq.GREY); c.setFont('PJ-Regular', 7.5); c.drawRightString(eloyq.X1, H - 58, TITRE)
        c.setStrokeColor(eloyq.RULE); c.setLineWidth(.8); c.line(eloyq.X0, H - 66, eloyq.X1, H - 66)
        self.y = H - 88
    def _footer(self):
        c = self.c
        c.setStrokeColor(eloyq.RULE); c.setLineWidth(.8); c.line(eloyq.X0, 50, eloyq.X1, 50)
        self.pages.append(self.page)
INK = eloyq.INK
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Questionnaire_Auto_Evaluation_Bateau.pdf'))
d = N(OUT, "Auto-évaluation du bateau de plaisance", "Auto-évaluation du bateau",
      intro=[("À compléter et à signer par le propriétaire du bateau. Les cases se remplissent directement sur ordinateur ; "
              "le document peut aussi être imprimé.", 0)])
d.c.setTitle(TITRE); d.c.setAuthor("")
d.section("Le bateau")
d.row([("Nom du propriétaire", .55), ("Nom du bateau", .45)])
d.row([("Immatriculation", .5), ("Année de construction", .5)])

d.section("État du bateau (auto-évaluation)", need=260)
d.para("Pour chaque élément, cochez l’état actuel du bateau. Cette auto-évaluation permet d’étudier votre demande ; selon l’âge et la valeur du "
       "bateau, une expertise peut aussi être demandée.", 7.6, INK)
TY = ["label", "check", "check", "check", "check"]
LG = [.44, .14, .14, .14, .14]
def grille(titre, lignes):
    d.tableau([titre, "Très bon", "Moyen", "Mauvais", "Sans objet"], lignes=lignes, types=TY, largeurs=LG)

grille("État général", ["Pont", "Coque", "Surfaces", "Cale", "Quille", "Safran"])
d.oui_non("Le bateau a-t-il déjà subi un sinistre ?")
d.oui_non("Si oui, a-t-il été entièrement réparé ?")
grille("Structure", ["Rigidité des ponts", "Cloisons et liaison coque-pont"])
d.oui_non("Présence de corrosion ?")
d.oui_non("Présence d’osmose ?")
grille("Aménagements", ["Cockpit et gouvernail", "Hublots et pare-brise"])
d.sub("Gréement (voiliers uniquement)")
d.choix("Type de mât", ["Aluminium", "Bois", "Carbone"], autre="Autre")
d.choix("Âge du gréement dormant", ["moins de 10 ans", "plus de 10 ans"])
d.row([("Date du dernier contrôle du gréement dormant par un professionnel", 1)])
grille("Gréement", ["Gréement dormant", "Gréement courant"])
grille("Moteurs", ["État général des moteurs", "Capots", "Embases", "Hélices", "Étanchéité"])
d.row([("Date de la dernière révision des moteurs par un professionnel", 1)])
grille("Électricité", ["Circuit électrique", "Batteries", "Anodes"])
d.oui_non("L’installation électrique est-elle conforme à la réglementation en vigueur ?")
grille("Matériel de sécurité", ["Mouillage principal", "Pompe de cale", "Extincteur", "Gilets, bouées et annexe", "Radeau de survie"])
d.liste_cases(["Je déclare qu’à ma connaissance le bateau est en bon état de navigation et ne présente pas de risque apparent."])

d.sub("Signature", need=110)
d.para("Toute réticence ou fausse déclaration intentionnelle entraîne la nullité du contrat (article L. 113-8 du Code des assurances) ; une omission "
       "ou une déclaration inexacte peut entraîner une réduction des indemnités (article L. 113-9).", 7.6, INK)
d.row([("Fait à", .6), ("Le", .4)])
d.zone("Signature du propriétaire (précédée de « Lu et approuvé »)", h=30)
d.save()
print(OUT)
