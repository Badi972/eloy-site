#!/usr/bin/env python3
"""Questionnaire d'étude de risque – Consignataires de navires et agents maritimes (services maritimes)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs', 'Eloy_Questionnaire_Services_Maritimes.pdf')
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else OUT)

d = Q(OUT, "Assurance des consignataires de navires et agents maritimes", "Services maritimes")

# 1
d.demandeur()

# 2
d.section("Profil des risques")
d.zone("Sites d’exploitation (précisez tous les sites ; plan d’exposition à fournir)", h=40)
d.row([("Date d’échéance de l’exercice social", .55), ("Nombre de salariés", .45)])
d.choix("Âge de la société", ["moins de 5 ans", "de 5 à 10 ans", "plus de 10 ans"])
d.choix("Ancienneté du personnel", ["moins de 5 ans", "de 5 à 10 ans", "plus de 10 ans"])
d.para("Ancienneté moyenne sur l’ensemble du personnel opérationnel de l’entreprise.")
d.espace(4)
d.oui_non("Certification")
d.oui_non("Cycle de formation organisé")
d.choix("Type de clientèle", ["Lignes régulières", "Tramping"])

# 3
d.section("Chiffre d’affaires")
d.champ("Chiffre d’affaires de l’année N-1 (€)")
d.champ("Chiffre d’affaires prévisionnel de l’année en cours (€)")
d.champ("Chiffre d’affaires de l’année N+1 (€)")

# 4
d.section("Détail des activités", need=200)
d.para("Indiquez les métiers que vous exercez et au titre desquels vous souhaitez être assuré.", 8, INK, 'PJ-Medium')
ENT = ["Activité", "Oui", "Non", "% de l’activité", "CA estimé de l’activité, année N (€)"]
TY = ["label", "check", "check", "text", "text"]
LG = [.4, .08, .08, .18, .26]
d.sub("Activités principales")
d.tableau(ENT, lignes=["Consignataire de navires", "Agent maritime", "Consignataire de la cargaison"], types=TY, largeurs=LG)
d.sub("Activités complémentaires", need=120)
d.tableau(ENT, lignes=["Commissionnaire de transport *", "Transitaire", "Commissionnaire en douane **", "Transporteur routier *",
                       "Courtier d’affrètement", "Entrepositaire", "NVOCC"], types=TY, largeurs=LG)
d.zone("* Pour les activités de commissionnaire de transport et de transporteur routier, précisez le type de trafics opérés", h=36)
d.oui_non("** Au titre de l’activité de commissionnaire en douane, avez-vous une personne dédiée et diplômée (formation de déclarant en douane) ?")

d.sub("Consignataire de navires", need=200)
d.para("Selon les dispositions des articles 11 à 13 de la loi n° 69-8 du 3 janvier 1969 et des articles L. 134-1 et suivants du Code de commerce.")
d.para("Principaux clients armateurs (et leur nationalité) :", 8, INK, 'PJ-Medium')
d.espace(6)
d.tableau(["En ligne régulière – nom", "En ligne régulière – nationalité", "En tramping – nom", "En tramping – nationalité"], n=8,
          largeurs=[.3, .2, .3, .2])

d.sub("Agent maritime")
d.oui_non("Avez-vous mis en place un contrat d’agence ? Si oui, joignez-en une copie (recto verso).")

d.sub("Consignataire de la cargaison")
d.oui_non("Exercez-vous cette activité selon les dispositions de l’article 14 de la loi n° 69-8 du 3 janvier 1969 ?")
d.oui_non("Avez-vous mis en place des conditions générales de vente ? Si oui, joignez-en une copie (recto verso).")

d.sub("Courtier d’affrètement", need=130)
d.oui_non("Confirmez-vous intervenir uniquement en tant que mandataire ?")
d.zone("Sur quel type de prestation repose votre activité de courtier de fret ?", h=34)
d.zone("Quelle est la nature des contrats que vous signez ?", h=34)

d.sub("NVOCC")
d.oui_non("Disposez-vous de conditions générales ? Si oui, joignez-en une copie (recto verso).")

# 5
d.section("Montant de la garantie générale souhaitée")
d.para("Montant par événement et par année d’assurance (à préciser) :", 8, INK, 'PJ-Medium')
d.espace(2)
d.choix("", ["1 000 000 €", "2 000 000 €", "3 000 000 €", "4 000 000 €", "5 000 000 €"])

# 6
d.section("Détail des services à couvrir (estimation du CA correspondant)", need=150)
d.sub("Location d’espace à usage commercial")
d.oui_non("Louez-vous des espaces à usage commercial ?")
d.zone("Décrivez précisément l’activité", h=36)
d.oui_non("L’obligation d’assurance pèse-t-elle sur le port ?")
d.sub("Utilisation d’unités de navigation", need=90)
d.oui_non("Utilisez-vous des unités de navigation ?")
d.zone("Précisez le nombre, le type, l’âge, les caractéristiques et la valeur", h=36)
d.sub("Collecte de déchets / matières dangereuses", need=90)
d.oui_non("Collectez-vous des déchets ou des matières dangereuses ?")
d.oui_non("Les matières dangereuses sont-elles stockées dans un endroit dédié ?")
d.oui_non("Existe-t-il une zone ICPE sur le site portuaire ?")
d.sub("Activités complémentaires", need=150)
d.oui_non("Exercez-vous des activités complémentaires ?")
d.oui_non("Plongées (carénages, entretien du port)", si="Si oui, précisez")
d.oui_non("Remorquage, pilotage", si="Si oui, précisez")
d.oui_non("Club nautique")
d.oui_non("Organisation de feux d’artifice")
d.oui_non("Autres", si="Si oui, précisez")

# 7
d.section("Garanties complémentaires souhaitées", need=130)
d.oui_non("Responsabilité vis-à-vis des autorités (article 2.2.1 des conditions générales)")
d.oui_non("Assurance de la faute inexcusable de l’employeur")
d.oui_non("Assurance dommages aux biens")
d.note("En fonction de vos choix, le questionnaire spécifique correspondant vous sera adressé.")

# 8
d.section("Antécédents du risque", need=170)
d.oui_non("Étiez-vous précédemment assuré pour un risque similaire ?")
d.row([("Auprès de quel assureur", .58), ("Échéance du contrat", .42)])
d.para("Avez-vous eu un contrat résilié par un autre assureur au cours des 36 derniers mois ?", 8, INK, 'PJ-Medium')
d.espace(3)
d.oui_non("Pour sinistre")
d.oui_non("Pour non-paiement des primes")
d.oui_non("L’entreprise fait-elle l’objet d’une procédure collective (plan de sauvegarde, redressement judiciaire, liquidation judiciaire) ?")

# 9
d.section("Sinistralité du demandeur d’assurance", need=200)
d.para("Détail par événement (sinistralité sur 4 ans et année en cours) :", 8, INK, 'PJ-Medium')
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement ou du sinistre", "Nature de l’événement", "Montant indemnisé (€)", "Montant en cours d’indemnisation (€)"],
          n=8, largeurs=[.2, .4, .2, .2])

d.fin()
print(d.save(), "pages ->", OUT)
