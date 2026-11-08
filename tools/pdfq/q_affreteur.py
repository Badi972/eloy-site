#!/usr/bin/env python3
"""Questionnaire Eloy : responsabilité civile de l'affréteur de navire de mer."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = '/home/claude/eloy-site/dist/docs/Eloy_Questionnaire_Affreteur_Navire.pdf'
d = Q(OUT, "Responsabilité civile de l’affréteur de navire de mer", "Affréteur de navire")

# 1
d.demandeur()

# 2
d.section("Chiffre d’affaires")
d.row([("Chiffre d’affaires de l’année précédente (€)", .6), ("Nombre de salariés", .4)])
d.zone("Votre chiffre d’affaires a-t-il varié de manière significative au cours des 4 dernières années ? Si oui, précisez", h=34)

# 3
d.section("Détail des activités", need=150)
d.champ("Depuis combien d’années votre entreprise affrète-t-elle des navires")
d.zone("Décrivez votre activité commerciale habituelle (liner, tramping…)", h=40)
d.para("Dans quels ports effectuez-vous habituellement vos chargements et déchargements ?", 8, font='PJ-Medium',
       color=INK)
d.champ("Chargements")
d.champ("Déchargements")
d.choix("Transportez-vous", ["essentiellement des marchandises de tiers", "essentiellement vos propres marchandises"])
d.zone("Quelle est la nature des marchandises que vous transportez habituellement", h=40)

# 4
d.section("Détail des navires", need=200)
d.champ("Combien de navires prévoyez-vous d’affréter par an")
d.champ("Quel est le tonnage brut (GRT) moyen des navires que vous affrétez")
d.champ("Quelle est la durée habituelle de vos affrètements")
d.para("Détails des navires affrétés au cours des douze derniers mois :", 8, font='PJ-Medium', color=INK)
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["", "Navire 1", "Navire 2", "Navire 3", "Navire 4", "Navire 5", "Navire 6"],
          lignes=["Nom", "Année de construction", "Pavillon", "GRT", "DWT", "Marchandises transportées",
                  "Port de chargement", "Port de déchargement", "Durée de l’affrètement", "Formulaire de charte-partie"],
          largeurs=[.22] + [.13] * 6)
d.zone("Estimation de vos activités d’affrètement pour les 12 prochains mois", h=40)

# 5
d.section("Documentation", need=120)
d.zone("Quel(s) formulaire(s) de charte-partie utilisez-vous habituellement", h=36)
d.note("Merci de joindre une copie des « rider clauses » utilisées avec la charte-partie type ou spécialisée.")
d.oui_non("Émettez-vous ou signez-vous des connaissements ? Si oui, merci d’en joindre une copie (recto-verso).")
d.oui_non("Vous arrive-t-il d’émettre des connaissements de transport combiné ?")
d.zone("Précisez", h=36)

# 6
d.section("Antécédents du risque", need=220)
d.oui_non("Étiez-vous précédemment assuré pour un risque similaire ?")
d.row([("Auprès de quelle compagnie", .6), ("Échéance du contrat", .4)])
d.sub("Défense")
d.row([("Limite de garantie", .5), ("Franchises", .5)])
d.sub("Responsabilité")
d.row([("Limite de garantie", .5), ("Corps", .5)])
d.row([("Marchandises", .5), ("P&I", .5)])
d.oui_non("Avez-vous eu un contrat résilié par une autre compagnie d’assurance au cours des 36 derniers mois pour sinistre ?")
d.oui_non("Avez-vous eu un contrat résilié par une autre compagnie d’assurance au cours des 36 derniers mois pour non-paiement des primes ?")
d.oui_non("L’entreprise fait-elle l’objet d’une procédure collective (plan de sauvegarde, redressement judiciaire, liquidation judiciaire) ?")

# 7
d.section("Sinistralité du demandeur d’assurance", need=200)
d.para("Détail par événement (sinistralité des 4 dernières années et de l’année en cours) :", 8, font='PJ-Medium',
       color=INK)
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement ou du sinistre", "Nature de l’événement", "Montant indemnisé (€)",
           "Montant en cours d’indemnisation (€)"], n=8, largeurs=[.2, .4, .2, .2])

d.fin()
print(d.save(), "pages")
