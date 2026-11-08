#!/usr/bin/env python3
"""Questionnaire Eloy : assurance des armateurs de navires à passagers (outre-mer)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK, BLUE, ROWLINE, X0, X1, CW, RH, FH, BOTTOM, LF, LS, wrap, sw
from reportlab.lib.colors import white

OUT = '/home/claude/eloy-site/dist/docs/Eloy_Questionnaire_Navires_Passagers.pdf'
d = Q(OUT, "Assurance des armateurs de navires à passagers (outre-mer)", "Navires à passagers")
c = d.c


# ---------- aides locales (construites sur les primitives du générateur, sans le modifier) ----------
def ligne(parts):
    """Une ligne libre. parts : ('cb', texte, x) case + libellé ; ('lab', texte, x) libellé ;
    ('tf', libellé, x, x_fin) libellé puis case texte jusqu'à x_fin ; ('on', libellé, x) paire Oui / Non."""
    d.ensure(RH)
    for p in parts:
        k, t, x = p[0], p[1], X0 + p[2]
        if k == 'cb':
            d._cb(t, x, d.y - 1); d._label(t, x + 12.6, d.y, 'PJ-Regular')
        elif k == 'lab':
            d._label(t, x, d.y)
        elif k == 'tf':
            lw = sw(t + ' :'); d._label(t + ' :', x, d.y)
            d._tf(t, x + lw + 6, d.y - 4.1, X0 + p[3] - (x + lw + 6))
        elif k == 'f':
            d._tf(t, x, d.y - 4.1, X0 + p[3] - x)
        elif k == 'on':
            for o in ('Oui', 'Non'):
                d._cb(t + ' ' + o, x, d.y - 1); d._label(o, x + 12.6, d.y, 'PJ-Regular'); x += 40
    d.y -= RH


def _choix_cell(nom, opts, x, w, ymid):
    tot = sum(8.2 + 3.5 + sw(o, 'PJ-Regular', 7.6) + 8 for o in opts) - 8
    xx = x + (w - tot) / 2
    for o in opts:
        d._cb('%s %s' % (nom, o), xx, ymid - 4.1)
        d._label(o, xx + 11.7, ymid - 2.7, 'PJ-Regular', 7.6)
        xx += 8.2 + 3.5 + sw(o, 'PJ-Regular', 7.6) + 8


def grille(entetes, largeurs, lignes):
    """Tableau à en-tête bleu (même rendu que Q.tableau) dont chaque cellule a son propre type.
    lignes : (libellé, [cellule par colonne suivante]) ; cellule = 'text' | liste d'options à cocher | None."""
    k = len(entetes)
    hh = max(len(wrap(e, 'PJ-SemiBold', 7.4, CW * largeurs[i] - 8)) for i, e in enumerate(entetes)) * 9 + 9
    d.ensure(hh + 2 * 19)

    def header():
        top = d.y + 8
        c.setFillColor(BLUE); c.roundRect(X0, top - hh, CW, hh, 4, stroke=0, fill=1)
        x = X0
        for i, e in enumerate(entetes):
            ls = wrap(e, 'PJ-SemiBold', 7.4, CW * largeurs[i] - 8)
            yy = top - (hh - len(ls) * 9) / 2 - 7
            for ln in ls:
                c.setFillColor(white); c.setFont('PJ-SemiBold', 7.4); c.drawCentredString(x + CW * largeurs[i] / 2, yy, ln); yy -= 9
            x += CW * largeurs[i]
        d.y = top - hh - 3
    header()
    for r, (lab, cells) in enumerate(lignes):
        lab_lines = wrap(lab, 'PJ-Regular', 7.6, CW * largeurs[0] - 8)
        rh = max(19, len(lab_lines) * 9 + 8)
        if d.y - rh < BOTTOM:
            d.new_page(); d.y -= 8; header()
        yy = d.y - (rh - len(lab_lines) * 9) / 2 - 6.5
        for ln in lab_lines:
            d._label(ln, X0 + 4, yy, 'PJ-Regular', 7.6); yy -= 9
        x = X0 + CW * largeurs[0]
        for i, cell in enumerate(cells):
            cw = CW * largeurs[i + 1]
            nom = '%s %s %d' % (lab, entetes[i + 1], r)
            if cell == 'text':
                d._tf(nom, x + 2, d.y - rh + 2.5, cw - 4, rh - 5)
            elif cell:
                _choix_cell(nom, cell, x, cw, d.y - rh / 2)
            x += cw
        c.setStrokeColor(ROWLINE); c.setLineWidth(.6); c.line(X0, d.y - rh, X1, d.y - rh)
        d.y -= rh
    d.y -= 14


UNITES = ["", "Première unité", "Deuxième unité", "Troisième unité"]
LU = [.28, .24, .24, .24]
ON = ["Oui", "Non"]


def par_unite(lignes):
    grille(UNITES, LU, [(lab, [cell] * 3) for lab, cell in lignes])


def question(t):
    d.para(t, 8, INK, 'PJ-Medium')


# 1
d.demandeur()

# 2
d.section("Chiffre d’affaires")
d.row([("Chiffre d’affaires de l’année précédente (€)", .6), ("Nombre de salariés", .4)])
d.zone("Votre chiffre d’affaires a-t-il varié de manière significative au cours des 4 dernières années ? Si oui, précisez", h=34)

# 3
d.section("Zones d’activité", need=70)
for opts in (["France métropolitaine", "Polynésie française", "La Réunion", "Antilles"],
             ["Nouvelle-Calédonie", "Mayotte", "Guyane"]):
    ligne([('cb', o, 128 * i) for i, o in enumerate(opts)] + ([('cb', "Autre :", 384), ('f', "Autre zone", 430, CW)] if len(opts) == 3 else []))

# 4
d.section("Types d’activité", need=130)
ligne([('cb', "Promenades", 0), ('tf', "Nombre maximal de rotations par jour", 112, 330), ('tf', "Durée de la rotation", 340, CW)])
ligne([('cb', "Pêche en mer", 0), ('lab', "Matériel de pêche mis à disposition :", 112), ('on', "Matériel de pêche mis à disposition", 262),
       ('tf', "Valeur du matériel (€)", 340, CW)])
ligne([('cb', "Support de plongée", 0), ('lab', "Matériel de plongée mis à disposition :", 112),
       ('on', "Matériel de plongée mis à disposition", 262), ('tf', "Valeur du matériel (€)", 340, CW)])
ligne([('cb', "Location avec skipper", 0)])
ligne([('cb', "Autre (précisez) :", 0), ('f', "Autre activité", 112, CW)])

# 5
d.section("Expérience de l’armateur dans ce type d’activité", need=60)
ligne([('tf', "Ancienneté dans l’activité", 0, 270), ('cb', "Inscrit maritime", 290), ('cb', "Non inscrit maritime", 390)])

# 6
d.section("Navires", need=200)
d.para("Renseignez le tableau ci-dessous ou joignez un fichier détaillé à votre e-mail de retour.")
par_unite([("Nom", 'text'), ("Immatriculation (affaires maritimes / IMO)", 'text'), ("Type de navire *", 'text'),
           ("Port d’attache", 'text'), ("Année de construction", 'text'), ("Matériau de construction", 'text'),
           ("Chantier de construction", 'text'), ("Longueur", 'text'), ("Largeur", 'text'), ("TJB", 'text'),
           ("Tonnage (GT)", 'text'), ("Catégorie de navigation", ["1", "2", "3", "4", "5"]), ("Zones de navigation", 'text'),
           ("Période de navigation", 'text'), ("Lieu et conditions de séjour", 'text')])
d.y += 6
d.para("* À fournir : copie du « certificat de sécurité pour navires à passagers » délivré aux armateurs par les centres de sécurité "
       "des navires (CSN).")

# 7
d.section("Passagers et personnel d’équipage", need=170)
par_unite([("Nombre maximal de passagers embarqués selon le permis de navigation", 'text'),
           ("Nombre de membres d’équipage", 'text'), ("Inscrits maritimes", ON), ("Qualification", 'text'),
           ("Expérience du skipper", 'text'), ("Type de brevet ou permis du skipper et date de délivrance", 'text')])

# 8
d.section("Moteurs et entretien", need=200)
par_unite([("Nombre", 'text'), ("Marque", 'text'), ("Puissance individuelle", 'text'), ("Année d’origine", 'text'),
           ("Rénové en", 'text'), ("Type", ["Hors-bord", "Inboard"]), ("Dernière mise en carénage", 'text'),
           ("Nom du chantier", 'text'), ("Nature et montant des travaux", 'text'), ("Le navire a-t-il été expertisé ?", ON),
           ("Date et lieu de l’expertise", 'text'), ("Nom de l’expert", 'text')])

# 9
d.section("Cas particulier des vedettes, semi-rigides et navires pneumatiques à vitesse rapide *", need=200)
d.para("Cf. arrêté du 2 juillet 2014 relatif au nombre de passagers admissibles sur les navires de plaisance à utilisation commerciale "
       "(JORF n° 0162 du 16 juillet 2014, page 11838, texte n° 14).")
grille(["Question", "Réponse", "Commentaires"], [.42, .2, .38], [
    ("Vitesse maximale (en nœuds)", ['text', 'text']),
    ("Déplacement du navire (en tonnes) – préciser lège ou maxi", ['text', 'text']),
    ("Chaque passager a-t-il une assise individuelle ? Si non, précisez le type d’assise en commentaire (exemple : banquette, "
     "chambre de flottabilité de navire pneumatique…)", [ON, 'text']),
    ("Chaque assise est-elle orientée vers l’avant du bateau ?", [ON, 'text']),
    ("Les assises sont-elles pourvues de dispositifs permettant au passager de se tenir en cas de pilonnement, d’embardée et de "
     "cavalement du navire ? Si oui, précisez le dispositif installé en commentaire", [ON, 'text']),
    ("Des équipements individuels de flottabilité sont-ils prévus pour les passagers ?", [ON, 'text']),
])
d.y += 6
d.para("* Joindre une photo ou une brochure commerciale de l’embarcation.")

# 10
d.section("Hypothèque", need=110)
par_unite([("Navire faisant l’objet d’une hypothèque", ON), ("Montant de la créance", 'text'), ("Organisme hypothécaire", 'text')])

# 11
d.section("Capital à couvrir", need=130)
par_unite([("Valeur d’assurance", 'text')])
d.sub("Garantie optionnelle")
d.oui_non("Option de garantie « décès – invalidité permanente » (capital par marin : 358 000 CFP)")

# 12
d.section("Antécédents du risque", need=110)
d.row([("Compagnie d’assurance actuelle", .6), ("Échéance du contrat", .4)])
question("Si le précédent contrat a été résilié ou non renouvelé, précisez le motif :")
d.choix("", ["Non-paiement de la prime", "Sinistres"], autre="Autre")

# 13
d.section("Sinistralité du demandeur d’assurance", need=200)
question("Détail par événement (sinistralité des 3 dernières années et de l’année en cours) :")
d.liste_cases(["Première installation", "Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement ou du sinistre", "Nature de l’événement", "Montant indemnisé (€)",
           "Montant en cours d’indemnisation (€)"], n=8, largeurs=[.2, .4, .2, .2])

d.fin()
print(d.save(), "pages")
