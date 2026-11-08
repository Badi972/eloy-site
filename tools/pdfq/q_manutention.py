#!/usr/bin/env python3
"""Questionnaire d'étude de risque – Entreprises de manutention portuaire et opérateurs de terminaux portuaires."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs', 'Eloy_Questionnaire_Manutention_Portuaire.pdf')
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else OUT)

INTRO = [("Questionnaire à retourner ", 0), ("complété", 1), (" à ", 0), ("eloy.assurances@gmail.com", 1),
         (". Il concerne les ", 0), ("risques situés sur le territoire français", 1),
         (". Les cases bleues se remplissent directement sur ordinateur ; le document peut aussi être imprimé. "
          "Des réponses complètes et exactes permettent d’obtenir une proposition adaptée plus rapidement.", 0)]
d = Q(OUT, "Assurance des entreprises de manutention portuaire et opérateurs de terminaux", "Manutention portuaire", intro=INTRO)


def q(t):
    """Libellé de question en encre foncée."""
    d.para(t, 8, INK, 'PJ-Medium')


# 1
d.demandeur()

# 2
d.section("Profil des risques")
d.row([("Date de création du chantier", .5), ("Date d’échéance de l’exercice social", .5)])
d.zone("Sites d’exploitation (précisez tous les sites et les adresses des localisations)", h=40)
d.choix("Localisation des travaux effectués", ["À terre", "À flot", "Hors chantier"])
d.choix("Âge de la société", ["moins de 5 ans", "de 5 à 10 ans", "plus de 10 ans"])
d.choix("Type de clientèle", ["Lignes régulières", "Tramping"])
d.espace(2)
q("Le terrain sur lequel vous exercez votre activité est-il sous (fournir une copie de la convention de délégation) :")
d.espace(3)
d.oui_non("Concession avec les autorités portuaires")
d.oui_non("Occupation temporaire avec les autorités portuaires")
d.champ("Autres (propriétaire du site…)")
d.espace(2)
d.oui_non("Disposez-vous d’un embranchement ferroviaire sur votre site ?")
d.oui_non("Le terminal est-il ISPS ?")
d.oui_non("Dans la négative, les zones d’accès aux terre-pleins et hangars sont-elles contrôlées, surveillées ?")
d.oui_non("Effectuez-vous des rondes ?")
d.oui_non("Le terminal est-il une installation classée (ICPE) ?",
          si="Si oui, quel régime (enregistrement, déclaration, autorisation)")

# 3
d.section("Équipements et main-d’œuvre", need=150)
d.sub("Équipements de manutention")
d.oui_non("Certification par un organisme tiers", si="Si oui, lequel")
d.oui_non("Utilisez-vous vos propres matériels de manutention ?")
d.para("Si non, communiquez le contrat de mise à disposition conclu entre le propriétaire et vous. Joignez la liste des équipements "
       "en propriété et en location.")
d.espace(4)
d.oui_non("Existe-t-il une garantie bris de machines sur le matériel de manutention ?", si="Si oui, auprès de quel assureur")
d.oui_non("La conduite est-elle réalisée par vos propres grutiers / portiqueurs ?")
d.sub("Main-d’œuvre", need=120)
d.oui_non("Salariés de l’assuré")
d.row([("Nombre de salariés", .3), ("dont personnel administratif", .35), ("dont opérationnels terrain", .35)])
d.oui_non("Employés du port ou sous-traitants", si="Si oui, nombre")
d.oui_non("Intérimaires / vacataires", si="Si oui, nombre")
d.oui_non("Cycle de formation organisé")

# 4
d.section("Chiffre d’affaires")
d.champ("Chiffre d’affaires de l’année N-1 (€)")
d.champ("Chiffre d’affaires prévisionnel de l’année en cours (€)")
d.champ("Chiffre d’affaires de l’année N+1 (€)")

# 5
d.section("Détail des activités", need=200)
q("Indiquez les métiers que vous exercez et au titre desquels vous souhaitez être assuré.")
ENT = ["Activité", "Oui", "Non", "% de l’activité", "CA estimé de l’activité, année N (€)"]
TY = ["label", "check", "check", "text", "text"]
LG = [.4, .08, .08, .18, .26]
d.sub("Activités principales")
d.tableau(ENT, lignes=["Entrepreneur de manutention portuaire", "Entrepreneur de manutention ferroviaire",
                       "Garde à quai des marchandises", "Opérateur de terminaux"], types=TY, largeurs=LG)
d.para("Opérateur de terminaux : toute entreprise titulaire d’une autorisation d’occupation temporaire, d’un contrat de gestion ou d’un "
       "contrat de concession signé avec une autorité ou un organisme portuaire, lui permettant d’exploiter un terminal et/ou des "
       "entrepôts portuaires.")
d.espace(4)
d.sub("Activités complémentaires", need=150)
d.tableau(ENT, lignes=["Entrepositaire", "Transitaire", "Commissionnaire en douane *", "Commissionnaire de transport **",
                       "Consignataire de navires", "Agent maritime", "Consignataire de la cargaison", "Empoteur / dépoteur",
                       "Réparateur / laveur de conteneurs", "NVOCC", "Transporteur routier **"], types=TY, largeurs=LG)
d.oui_non("* Au titre de l’activité de commissionnaire en douane, avez-vous une personne dédiée et diplômée (formation de déclarant en douane) ?")
d.zone("** Pour les activités de commissionnaire de transport et de transporteur routier, précisez le type de trafics opérés", h=36)
d.espace(2)
d.oui_non("Réalisez-vous des opérations ne relevant pas de la loi du 18 juin 1966 sur les contrats d’affrètement et de transport maritimes ?",
          si="Si oui, lesquelles")
d.oui_non("Utilisez-vous des conditions générales de vente ? Si oui, joignez-en une copie complète (recto verso).")

# 6
d.section("Détail par type de trafic (année N)", need=150)
d.sub("Trafic de conteneurs")
d.oui_non("Trafic de conteneurs")
d.row([("Conteneurs vides et pleins – nombre d’EVP", .5), ("Estimation du nombre de mouvements par an", .5)])
d.row([("Conteneurs frigorifiques – nombre d’EVP", .5), ("Nombre de prises reefer disponibles", .5)])
d.row([("Conteneurs avec marchandises dangereuses – nombre d’EVP", 1)])
d.champ("Type de marchandises dangereuses")
d.sub("Trafic de vrac", need=80)
d.oui_non("Trafic de vrac")
d.row([("Vrac sec – tonnage", .5), ("Vrac liquide – tonnage", .5)])
d.sub("Trafic roulier (RoRo)", need=70)
d.oui_non("Trafic RoRo")
d.champ("Nombre de véhicules RoRo")
d.sub("Autre trafic", need=70)
d.oui_non("Trafic autre")
d.row([("Type de marchandises (animaux, etc.)", .62), ("Tonnage", .38)])
d.sub("Trafic de colis lourds", need=120)
d.oui_non("Trafic de colis lourds")
d.row([("Colis lourds hors gabarit * – nombre de colis par an", .62), ("Tonnage", .38)])
d.oui_non("Êtes-vous spécialiste des colis lourds ?")
d.para("* Colis lourds et/ou encombrants : charge (caisse, grue, générateur… liste non exhaustive) hors normes ISO standard, qui nécessite "
       "une manutention spécifique par des moyens de levage adaptés.")

# 7
d.section("Activités de manutention portuaire")
d.choix("Taille des navires chargés et/ou déchargés", ["moins de 5 000 TJB", "de 5 000 à 50 000 TJB", "plus de 50 000 TJB"])
d.champ("Nombre de navires par an")

# 8
d.section("Montant de la garantie générale souhaitée")
q("Montant par événement et par année d’assurance (à préciser) :")
d.espace(2)
d.choix("", ["2 500 000 €", "5 000 000 €", "7 500 000 €", "10 000 000 €"])

# 9
d.section("Garanties complémentaires souhaitées", need=150)
d.oui_non("Assurance de la faute inexcusable de l’employeur")
d.oui_non("Assurance dommages aux biens")
d.oui_non("Assurance bris de machines des équipements portuaires en propriété")
d.oui_non("Assurance dommages aux véhicules (hors véhicules légers)")
d.note("En fonction de vos choix, le questionnaire spécifique correspondant vous sera adressé.")

# 10
d.section("Antécédents du risque", need=170)
d.oui_non("Étiez-vous précédemment assuré pour un risque similaire ?")
d.row([("Auprès de quel assureur", .58), ("Échéance du contrat", .42)])
q("Avez-vous eu un contrat résilié par un autre assureur au cours des 36 derniers mois ?")
d.espace(3)
d.oui_non("Pour sinistre")
d.oui_non("Pour non-paiement des primes")
d.oui_non("L’entreprise fait-elle l’objet d’une procédure collective (plan de sauvegarde, redressement judiciaire, liquidation judiciaire) ?")

# 11
d.section("Sinistralité du demandeur d’assurance", need=200)
q("Détail par événement (sinistralité sur 4 ans et année en cours) :")
d.liste_cases(["Fichier Excel ou PDF joint à la présente demande", "Détails dans le tableau ci-dessous"])
d.tableau(["Date de l’événement ou du sinistre", "Nature de l’événement", "Montant indemnisé (€)", "Montant en cours d’indemnisation (€)"],
          n=8, largeurs=[.2, .4, .2, .2])

d.fin()
print(d.save(), "pages ->", OUT)
