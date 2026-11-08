#!/usr/bin/env python3
"""Questionnaire Eloy – Assurance des ports de plaisance et marinas."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, X0, X1, RH, BLUE, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Ports_Plaisance_Marinas.pdf'))


# --- aide locale : intertitre bleu suivi des cases Oui / Non sur la même ligne (absent de eloyq.py) ---
def titre_on(d, title, need=60):
    d.ensure(need); d.y -= 2
    d._label(title, X0, d.y, 'PJ-Bold', 9.5, BLUE)
    x = X1 - 92
    for o in ('Oui', 'Non'):
        d._cb(title + ' ' + o, x, d.y - 1); d._label(o, x + 12.6, d.y, 'PJ-Regular'); x += 46
    d.y -= 20


d = Q(OUT, "Assurance des ports de plaisance et marinas", "Ports de plaisance et marinas")

# 1
d.demandeur()

# 2
d.section("Profil des risques", need=200)
d.zone("Sites d’exploitation (précisez tous les sites ; plan d’exposition à fournir)", h=44)
d.choix("Type de pontons", ["Fixes", "Flottants"])
d.zone("Précisez le type, le nombre, les dimensions et la valeur", h=40)
d.oui_non("Le site est-il fermé au public en dehors des heures d’ouverture ?")
d.oui_non("Disposez-vous de moyens de clôture, de gardiennage ou de vidéosurveillance ?", si="Si oui, précisez")
d.oui_non("L’accès aux pontons est-il contrôlé (code d’accès, clés, badges, etc.) ?", si="Si oui, précisez")
d.row([("Date de début de l’exploitation du site", .55), ("En cas de reprise, date de reprise", .45)])
d.zone("Nombre de salariés et fonction du personnel (maître de port, personnel administratif, agents…)", h=40)
d.sub("Prévention du risque incendie")
d.oui_non("Existe-t-il une procédure de prévention et de lutte contre l’incendie ?")
d.champ("À quelle distance se trouve la caserne de pompiers la plus proche")

# 3
d.section("Chiffre d’affaires", need=110)
d.row([("Chiffre d’affaires de l’année N-1 (€)", .42), ("Chiffre d’affaires prévisionnel de l’année en cours (€)", .58)])
d.row([("Chiffre d’affaires de l’année N+1 (€)", .42), ("Date de clôture de l’exercice social", .58)])

# 4
d.section("Détail des services à couvrir (estimation du chiffre d’affaires correspondant)", need=150)
titre_on(d, "Location de places à flot")
d.row([("Nombre d’anneaux", .4), ("Nombre d’anneaux pour unités de plus de 20 m", .6)])
d.row([("Valeur maximale des unités (€)", .6)])

titre_on(d, "Location de places à terre", need=150)
d.row([("Nombre de places à terre", .4), ("Valeur moyenne des unités entreposées (€)", .6)])
d.row([("Estimation du cumul des valeurs (€)", .6)])
d.champ("Comment le site est-il surveillé (vidéosurveillance…) ?")
d.para("Joignez le contrat de mise à disposition d’emplacement.", 7.6, INK)
d.oui_non("Existe-t-il un projet de port à sec (ascenseur à bateaux) ?")

titre_on(d, "Gestion d’une cale de halage")
d.row([("Chiffre d’affaires (€)", .5)])

titre_on(d, "Mise à l’eau / mise à sec", need=110)
d.oui_non("Cette opération est-elle sous-traitée ?")
d.row([("Chiffre d’affaires (€)", .5)])
d.champ("Type et âge des moyens utilisés")
d.oui_non("Les équipements sont-ils contrôlés ou certifiés par un organisme indépendant ?", si="Si oui, lequel")
d.zone("Qualification des agents utilisant les moyens de levage", h=32)

d.sub("Gestion et entretien du port", need=80)
d.oui_non("Assurez-vous l’entretien des pontons et des chaînes de mouillage ?")
d.oui_non("Le port met-il des bers à disposition ?")
d.oui_non("Le port peut-il être responsable des moyens de calage ?")

titre_on(d, "Mise à disposition d’une aire de carénage", need=80)
d.oui_non("Mettez-vous à disposition des moyens de récupération des eaux usées ?")
d.oui_non("L’aire de carénage fait-elle l’objet d’une déclaration ou d’une autorisation ICPE ?")

titre_on(d, "Opérations de dragage", need=30)

titre_on(d, "Gestion d’une station de carburant", need=60)
d.row([("Chiffre d’affaires (€)", .5)])

titre_on(d, "Fourniture et vente d’électricité et d’eau potable", need=30)

d.sub("Gestion de parkings privatifs", need=90)
d.row([("Chiffre d’affaires (€)", .5)])
d.oui_non("L’activité est-elle déléguée ?")
d.row([("Chiffre d’affaires se rapportant à cette activité (€)", .7)])

titre_on(d, "Location d’espaces à usage commercial", need=100)
d.zone("Décrivez précisément l’activité", h=40)
d.oui_non("L’obligation d’assurance pèse-t-elle sur le port ?")

titre_on(d, "Utilisation d’unités de navigation", need=80)
d.zone("Précisez le nombre, le type, l’âge, les caractéristiques et la valeur", h=40)

titre_on(d, "Collecte de déchets / matières dangereuses", need=80)
d.oui_non("Les matières dangereuses sont-elles stockées dans un endroit dédié ?")
d.oui_non("Existe-t-il une zone ICPE sur le site portuaire ?")

titre_on(d, "Activités complémentaires", need=180)
d.oui_non("Plongées (carénages, entretien du port)", si="Si oui, précisez")
d.oui_non("Remorquage, pilotage", si="Si oui, précisez")
d.oui_non("Club nautique")
d.oui_non("Organisation de feux d’artifice")
d.oui_non("Autres", si="Si oui, précisez")

# 5
d.section("Montant de la garantie générale souhaitée", need=80)
d.para("Par événement et par année d’assurance :", 7.6, INK)
d.choix("", ["1 000 000 €", "2 000 000 €", "3 000 000 €", "4 000 000 €", "5 000 000 €"])

# 6
d.section("Garanties complémentaires souhaitées", need=160)
d.oui_non("Assurance de la faute inexcusable de l’employeur")
d.oui_non("Assurance dommages aux biens")
d.oui_non("Assurance bris de machines des équipements portuaires en propriété")
d.oui_non("Assurance dommages aux véhicules (hors véhicules légers)")
d.oui_non("Dommages aux biens à vocation maritime (pontons, flottants, passerelles)")
d.note("En fonction de vos choix, le questionnaire spécifique correspondant vous sera adressé.")

# 7
d.section("Antécédents du risque", need=170)
d.oui_non("Étiez-vous précédemment assuré pour un risque similaire ?")
d.row([("Auprès de quelle compagnie", .6), ("Échéance du contrat", .4)])
d.para("Avez-vous eu un contrat résilié par un autre assureur au cours des 36 derniers mois ?", 8, INK, 'PJ-Medium')
d.oui_non("Pour sinistre")
d.oui_non("Pour non-paiement des primes")
d.oui_non("L’entreprise fait-elle l’objet d’une procédure collective (sauvegarde, redressement judiciaire, liquidation judiciaire) ?")

# 8
d.section("Sinistralité du demandeur d’assurance", need=230)
d.para("Détail par événement (sinistralité des 4 dernières années et de l’année en cours) :", 8, INK, 'PJ-Medium')
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement / du sinistre", "Nature de l’événement", "Montant indemnisé (€)", "Montant en cours d’indemnisation (€)"],
          n=8, largeurs=[.22, .38, .18, .22])

d.fin()
print(OUT, d.save())
