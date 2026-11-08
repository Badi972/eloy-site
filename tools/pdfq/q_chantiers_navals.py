#!/usr/bin/env python3
"""Questionnaire Eloy — Chantiers navals (construction et réparation)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs', 'Eloy_Questionnaire_Chantiers_Navals.pdf')
OUT = os.path.normpath(sys.argv[1] if len(sys.argv) > 1 else OUT)

ANS5 = ["N-5", "N-4", "N-3", "N-2", "N-1"]
ANS3 = ["N-3", "N-2", "N-1"]
d = Q(OUT, "Assurance des chantiers navals (construction et réparation)", "Chantiers navals")

d.demandeur()

# ---------- Construction / réparation ----------
d.section("Activités de construction et de réparation", need=200)
d.sub("Chiffre d’affaires TTC par activité sur les 5 dernières années")
d.tableau(["Activité"] + ["Année " + a + " (€)" for a in ANS5],
          lignes=["Construction", "Réparation / entretien", "CA sous-traité", "Achats fournisseurs", "CA total", "Masse salariale brute"],
          largeurs=[.25] + [.15] * 5)
d.para("N désigne l’année en cours : N-1 correspond au dernier exercice clos.")
d.espace(4)
d.champ("Prévisions pour les 12 mois à venir")
d.oui_non("La construction des unités est-elle suivie par une société de classification ?", si="Si oui, laquelle")
d.sub("Sous-traitants", need=140)
d.tableau(["Sous-traitant (représentant au moins 5 % de la sous-traitance)", "Date de début de la sous-traitance",
           "Capital RC garanti par le sous-traitant (€)"], n=5, largeurs=[.5, .22, .28])
d.para("Joignez une copie des contrats de sous-traitance.")
d.sub("Principaux fournisseurs", need=90)
d.zone("Liste des principaux fournisseurs", h=48)
d.para("Joignez une copie des contrats d’achat.")

# ---------- Négoce ----------
d.section("Activités de négoce", need=200)
d.sub("Chiffre d’affaires TTC par activité sur les 5 dernières années")
d.tableau(["Activité"] + ["Année " + a + " (€)" for a in ANS5],
          lignes=["Vente de bateaux neufs pour compte propre", "Vente de bateaux neufs pour compte de tiers",
                  "Vente de bateaux d’occasion pour compte propre", "Magasin", "Entretien"],
          largeurs=[.3] + [.14] * 5)

# ---------- Unités ----------
d.section("Unités", need=200)
d.sub("Construction")
d.row([("Type d’unités", .5), ("Durée de construction par type d’unité", .5)])
d.row([("Cadence de production", .5), ("Valeur finale par type (€)", .5)])
d.row([("Nombre de navires construits en même temps", .5), ("Valeur cumulée en risque sur un même site (€)", .5)])
d.sub("Réparations", need=110)
d.zone("Réparations effectuées (coque, moteur, révisions complètes, changements de moteur, d’hélices…)", h=40)
d.champ("Valeur maximale des unités réparées (€)")
d.sub("Vente en concession, gardiennage et navires en attente de vente", need=150)
d.champ("Marques vendues en concession (joignez une copie des contrats de vente)")
d.tableau(["", "Nombre d’unités à flot", "Nombre d’unités sous hangar", "Capital total en risque (€)"],
          lignes=["Vente en concession", "Gardiennage", "Navires construits en attente de vente"],
          largeurs=[.34, .2, .22, .24])

# ---------- Statistiques et historique ----------
d.section("Statistiques et historique", need=200)
d.oui_non("Les risques faisant l’objet du présent questionnaire ont-ils déjà été assurés ?")
d.champ("Auprès de quelle(s) compagnie(s)")
d.champ("Motif de résiliation")
d.sub("Statistiques des 5 dernières années", need=170)
d.tableau(["Année", "Primes brutes (€)", "Sinistres payés (€)", "Sinistres en prévision (€)", "Total des sinistres (€)", "S/P (%)"],
          lignes=["Année " + a for a in ANS5], total=True, largeurs=[.16, .18, .17, .18, .18, .13])
d.sub("Détail des sinistres", need=150)
d.tableau(["Type de sinistre", "Date", "Montant réglé (€)", "Franchise (€)", "Montant en prévision (€)"], n=6,
          largeurs=[.32, .14, .18, .16, .2])

# ---------- Autres risques ----------
d.section("Autres risques", need=200)
d.para("Êtes-vous couvert par une autre police d’assurance ?", 8, INK, 'PJ-Medium')
d.tableau(["Risque", "Couvert", "Précisez éventuellement les capitaux couverts (€)"], lignes=["Incendie", "Dégâts des eaux"],
          types=["label", "check", "text"], largeurs=[.3, .12, .58])
d.sub("Statistiques sur 3 ans", need=110)
d.tableau(["Année", "Primes nettes (€)", "Sinistres payés (€)", "Sinistres en prévision (€)", "Total (€)", "S/P (%)"],
          lignes=["Année " + a for a in ANS3], largeurs=[.16, .18, .17, .18, .18, .13])

# ---------- Engins ----------
ENGINS = ["Type et marque", "Année de construction", "Périodicité d’entretien", "Puissance de levage", "Valeur (€)"]
LG = [.32, .16, .18, .16, .18]
d.section("Engins de levage et engins navals", need=150)
d.sub("Engins de levage", need=130)
d.para("Si vous utilisez des engins de levage, précisez :", 8, INK, 'PJ-Medium')
d.tableau(ENGINS, n=4, largeurs=LG)
d.sub("Engins navals", need=130)
d.para("Engins appartenant au chantier et utilisés pour ses besoins :", 8, INK, 'PJ-Medium')
d.tableau(ENGINS, n=4, largeurs=LG)

# ---------- Garanties ----------
d.section("Garanties demandées", need=170)
d.liste_cases(["Dommages aux bateaux en cours de construction",
               "Responsabilité civile bateaux à flot, séjours, essais ou démonstrations",
               "Responsabilité civile du chef d’entreprise, exploitation à terre",
               "Responsabilité civile après livraison",
               "Assurance des cotisations complémentaires dues au titre des accidents du travail et des maladies professionnelles "
               "(garantie « dommages »)"])
d.champ("Date d’effet souhaitée")

d.fin()
print(d.save(), "pages ->", OUT)
