#!/usr/bin/env python3
"""Questionnaire Eloy — Armateurs portuaires (analyse de risque maritime)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs', 'Eloy_Questionnaire_Armateur_Portuaire.pdf')
OUT = os.path.normpath(sys.argv[1] if len(sys.argv) > 1 else OUT)

U = ["Première unité", "Deuxième unité", "Troisième unité"]
LG = [.31, .23, .23, .23]
TX = ["label", "text", "text", "text"]
CK = ["label", "check", "check", "check"]


def grille(titre, lignes, types=TX):
    d.tableau([titre] + U, lignes=lignes, types=types, largeurs=LG)


d = Q(OUT, "Assurance des armateurs portuaires", "Armateur portuaire")

d.demandeur()

# ---------- Navires ----------
d.section("Navires", need=220)
d.note("Renseignez les champs ci-dessous ou joignez un fichier détaillé à votre envoi.")
d.sub("Informations générales")
grille("Caractéristiques", ["Nom", "Changement de nom", "Type du navire", "Date d’acquisition", "Longueur", "Largeur", "Creux",
                            "TJB (tonneaux de jauge brute)", "TPL (tonnes de port en lourd)", "Volume (m³)", "FDWT", "CV",
                            "Valeur du navire (€)", "Pavillon", "Port d’attache"])
d.sub("Construction", need=150)
grille("Construction", ["Année de construction", "Chantier de construction", "Pays", "Équipement CO2", "Nombre de passagers"])
d.sub("Moteur", need=150)
grille("Moteur", ["Marque du moteur", "Puissance totale (CV ou kW)", "Année d’origine", "Rénové en"])
grille("Construction sous licence", ["Oui", "Non"], CK)
grille("Type de moteur", ["Lent", "Semi-rapide", "Rapide"], CK)
d.sub("Navigation", need=120)
grille("Trafic", ["Tramp", "Pro"], CK)
grille("Navigation", ["Zones de navigation"])
d.sub("Classification", need=150)
grille("Classification", ["Société de classification", "Date d’expiration de la classification",
                          "Date d’expiration de la garantie constructeur"])
grille("Dry-docking", ["Oui", "Non"], CK)
d.oui_non("Y a-t-il eu un changement de société de classification ?")
d.row([("Si oui, à quelle date", .4), ("Pour quelle raison", .6)])
d.oui_non("Y a-t-il eu une extension de la classification précédente ?", si="Si oui, pour combien de temps")
d.sub("Maintenance des navires", need=110)
d.champ("Coût moyen de maintenance du ou des navires sur 5 ans (€)")
d.champ("Coût moyen de maintenance du ou des navires pour l’année en cours (€)")
d.row([("Nom du directeur technique", .5), ("Coordonnées", .5)])

# ---------- Marchandises ----------
d.section("Marchandises transportées", need=110)
d.champ("Types de marchandises transportées")
d.oui_non("Le ou les navires sont-ils utilisés pour un trafic autre que celui pour lequel ils sont désignés ?")
d.oui_non("Le ou les navires sont-ils utilisés pour le transport de marchandises dangereuses ?")

# ---------- Affrètement ----------
d.section("Affrètement", need=130)
d.oui_non("Le ou les navires sont-ils affrétés ?")
d.row([("Si oui, depuis combien de temps", .5), ("Nom de l’affréteur", .5)])
d.choix("S’agit-il d’un affrètement", ["à temps", "au voyage"])

# ---------- Autres renseignements ----------
d.section("Autres renseignements", need=170)
d.oui_non("Selon le pavillon, l’assurance est-elle obligatoire dans le pays concerné ?")
d.oui_non("Le ou les navires ont-ils été convertis ?")
d.oui_non("Le ou les navires ont-ils été utilisés comme navires de stockage ?")
d.oui_non("Le ou les navires sont-ils restés désarmés plusieurs mois ?")
d.row([("Si oui, précisez la durée", .45), ("Lieu", .55)])
d.zone("Autres précisions", h=40)

# ---------- Chiffre d'affaires ----------
d.section("Chiffre d’affaires", need=130)
d.champ("Chiffre d’affaires de l’année précédente (€)")
d.champ("Chiffre d’affaires prévisionnel de l’année en cours (€)")
d.zone("Le chiffre d’affaires a-t-il varié de manière significative sur les 4 dernières années ?", h=32)

# ---------- Antécédents ----------
d.section("Antécédents du risque", need=150)
d.oui_non("Étiez-vous précédemment assuré pour un risque similaire ?")
d.row([("Auprès de quelle compagnie", .6), ("Échéance du contrat", .4)])
d.para("Avez-vous eu un contrat résilié par un autre assureur au cours des 36 derniers mois ?", 8, INK, 'PJ-Medium')
d.espace(4)
d.oui_non("Pour sinistre")
d.oui_non("Pour non-paiement des primes")

# ---------- Sinistralité ----------
d.section("Sinistralité du demandeur d’assurance", need=200)
d.para("Détail par événement (sinistralité des 4 dernières années et de l’année en cours) :", 8, INK, 'PJ-Medium')
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement ou du sinistre", "Nature de l’événement", "Montant indemnisé (€)",
           "Montant en cours d’indemnisation (€)"], n=8, largeurs=[.2, .4, .18, .22])

d.fin()
print(d.save(), "pages ->", OUT)
