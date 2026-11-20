#!/usr/bin/env python3
"""Questionnaire Eloy – Centrales hydroélectriques (20/11/2026).
Reprend les questions du questionnaire risques techniques de l'assureur, sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Hydroelectricite.pdf'))

d = Q(OUT, "Centrales hydroélectriques", "Hydroélectricité")
G = ["Groupe 1", "Groupe 2", "Groupe 3", "Groupe 4"]
LG = [.32, .17, .17, .17, .17]
TY = ['label', 'text', 'text', 'text', 'text']


def groupes(titre, lignes):
    d.tableau([titre] + G, lignes=["Valeur à neuf HT (€)"] + lignes, types=TY, largeurs=LG)


d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()
d.row([("Chiffre d’affaires annuel (€)", .5), ("Effectif", .5)])

d.section("La centrale", need=280)
d.row([("Nom de la centrale", .55), ("Année de construction", .45)])
d.champ("Adresse de la centrale")
d.champ("Coordonnées GPS")
d.zone("Description de la centrale", h=36)
d.choix("Type de centrale", ["Fil de l’eau", "Conduite forcée"])
d.champ("Nom du cours d’eau")
d.choix("Rive", ["Gauche", "Droite"])
d.row([("Débit équipé", .5), ("Hauteur de chute nette", .5)])
d.row([("Qualité et degré de propreté de l’eau", 1)])
d.choix("Nature de l’eau", ["Siliceuse", "Calcaire", "Vaseuse"])

d.section("L’environnement du site", need=230)
d.oui_non("Vallée encaissée ?")
d.oui_non("Installations accessibles aux véhicules légers en toute saison ?")
d.oui_non("Installations accessibles aux véhicules lourds ou spéciaux (grues, engins) ?")
d.champ("Voisinage (habitations, ville, usine, route…)")
d.zone("Risques d’inondation", h=30)
d.row([("Altitude de la dernière crue (m NGF)", .5), ("Crue décennale", .25), ("Crue centennale", .25)])

d.section("Retenue d’eau et ouvrage de retenue", need=280)
d.row([("Superficie maximum de la réserve", .5), ("Capacité maximum", .5)])
d.row([("Mise en service de l’ouvrage", .5), ("Nature (terre, enrochements, béton…)", .5)])
d.row([("Hauteur (m)", .25), ("Longueur (m)", .25), ("Épaisseur à la base (m)", .25), ("Au sommet (m)", .25)])
d.champ("Altitude au sommet du barrage (m NGF)")
d.oui_non("Réfections ou modifications depuis la première mise en eau ?", si="Si oui, détails")
d.row([("Crue de calcul des évacuateurs (période)", .55), ("Fréquence des vidanges", .45)])
d.oui_non("Appareils de mesure et d’enregistrement ?", si="Si oui, lesquels")

d.section("Génie civil et bâtiment", need=300)
d.oui_non("Canal d’amenée ?")
d.row([("Longueur", .3), ("Année de construction", .3), ("Matériaux", .4)])
d.oui_non("Conduite forcée ?")
d.row([("Longueur totale", .34), ("Dont enterrée", .33), ("Année de construction", .33)])
d.row([("Diamètre", .4), ("Matériaux (acier, polyéthylène…)", .6)])
d.oui_non("Cheminée d’équilibre, réservoir d’air ou clapets de décharge ?", si="Si oui, nature, nombre, distance de la prise d’eau")
d.champ("Fréquence d’inspection de la conduite et des massifs d’ancrage")
d.sub("Bâtiment de la centrale")
d.row([("Année de construction", .5), ("Surface totale", .5)])
d.zone("Description (ossature, murs, couverture, planchers, niveaux…)", h=30)
d.champ("Altitude du plancher des matériels électriques (m NGF)")
d.oui_non("Modifications depuis l’origine ?", si="Si oui, lesquelles et quand")
d.oui_non("Canal de fuite ?")
d.row([("Longueur", .4), ("Matériaux", .6)])
d.oui_non("Lignes électriques aériennes ou enterrées ?")
d.row([("Longueur (m)", .34), ("Nombre de pylônes", .33), ("Matériaux", .33)])

d.section("Montants à assurer : bâtiment et génie civil", need=280)
d.tableau(["Désignation", "Bâtiment : valeur à neuf HT (€)", "Génie civil : valeur à neuf HT (€)"],
          lignes=["Barrage", "Passe à poissons", "Ouvrage de prise d’eau", "Canal d’amenée", "Chambre de mise en charge",
                  "Conduite forcée (supports et plots d’arrêt compris)", "Infrastructure de la centrale", "Superstructure de la centrale",
                  "Canal de fuite", "Lignes électriques aériennes : pylônes", "Lignes électriques aériennes : câbles"],
          largeurs=[.46, .27, .27], total=True)

d.section("Montants à assurer : partie mécanique", need=260)
groupes("Turbines", ["Type", "Constructeur", "Débit", "Puissance", "Vitesse de rotation", "Axe", "Régulation", "Mise en service"])
groupes("Multiplicateurs", ["Type", "Constructeur", "Puissance", "Refroidissement", "Mise en service"])
d.tableau(["Autres équipements mécaniques", "Mise en service", "Valeur à neuf HT (€)"],
          lignes=["Vannes (prise d’eau, isolement, aval…) et clapets mobiles", "Grilles et dégrilleurs (armoires électriques dédiées comprises)",
                  "Drôme", "Autres matériels (palans, pompes à vide, by-pass, groupes hydrauliques…)"], largeurs=[.56, .2, .24])

d.section("Montants à assurer : partie électrique", need=260)
groupes("Génératrices ou alternateurs", ["Type", "Constructeur", "Puissance", "Vitesse de rotation", "Tension", "Axe", "Mise en service"])
groupes("Transformateurs", ["Type", "Constructeur", "Puissance", "Tension au secondaire", "Refroidissement", "Mise en service"])
groupes("Armoires moyenne tension", ["Type", "Constructeur", "Mise en service"])
groupes("Armoires de puissance", ["Type", "Constructeur", "Mise en service"])
groupes("Armoires d’automatisme", ["Type", "Constructeur", "Mise en service"])
d.tableau(["Autres équipements électriques", "Mise en service", "Valeur à neuf HT (€)"],
          lignes=["Condensateurs (marque)", "Asservissement de niveau", "Protection contre la foudre", "Télégestion et bureautique",
                  "Autres matériels"], largeurs=[.56, .2, .24])
d.champ("Total partie électrique HT (€)")

d.section("Recettes et pénalités", need=200)
d.champ("Année de la déclaration (N)")
d.tableau(["", "Année N-1", "Année N-2", "Année N-3"], lignes=["Prix du kWh (majoration de qualité comprise)", "Recettes annuelles (€)"],
          types=['label', 'text', 'text', 'text'], largeurs=[.4, .2, .2, .2])
d.para("Joindre la copie du contrat de vente d’énergie.")
d.row([("Pénalités énergie réactive : prix du kVAR défaillant", .6), ("Montant annuel maximum (€)", .4)])
d.sub("Récapitulatif des valeurs à assurer", need=140)
d.tableau(["Élément", "Valeur à assurer HT (€)"],
          lignes=["Bâtiment", "Ouvrages de génie civil", "Machines et équipements (informatique comprise)", "Frais et pertes",
                  "Responsabilités liées à l’occupation des bâtiments"], largeurs=[.7, .3])

d.section("Prévention et protection", need=300)
d.para("Vérification régulière par un organisme de contrôle indépendant :", 8, INK, 'PJ-Medium')
d.row([("Génie civil : oui ou non, périodicité", 1)])
d.row([("Partie mécanique : oui ou non, périodicité", 1)])
d.oui_non("Partie électrique vérifiée chaque année ? (joindre le certificat Q18)")
d.oui_non("Avec contrôle par thermographie infrarouge ? (joindre le certificat Q19)")
d.sub("Batteries de condensateurs")
d.oui_non("Dans un local séparé coupe-feu 2 h (porte comprise) ?")
d.oui_non("Sinon, dans une armoire coupe-feu 2 h ?")
d.oui_non("Détection d’incendie avec report d’alarme vers un local gardé en permanence ?", si="Si oui, délai d’intervention")
d.oui_non("Extinction automatique ?")
d.sub("Entretien et surveillance", need=200)
d.champ("Qualification du personnel chargé de l’entretien courant")
d.oui_non("Contrat d’entretien ou de maintenance avec un prestataire ?", si="Si oui, nom et adresse du prestataire")
d.oui_non("Contrat d’analyse vibratoire avec une entreprise extérieure ?", si="Si oui, fréquence des analyses")
d.oui_non("Capteurs de vibration permanents ?")
d.oui_non("Sondes et capteurs (température, pression, niveaux d’huile et d’eau) ?")
d.oui_non("Analyses d’huile ?", si="Si oui, équipements, fréquence et nature")
d.oui_non("Centrale sous surveillance ?", si="Si oui, informations reportées, mode de report, délai d’intervention")
d.oui_non("Centrale gardée ?", si="Si oui, intervenants, localisation, délai d’intervention")
d.oui_non("Peut-on isoler la turbine de l’eau ?", si="Si oui, moyen et durée")
d.oui_non("Peut-on découpler et surélever la génératrice ?", si="Si oui, en combien de temps")
d.oui_non("Protection contre les survitesses ?", si="Si oui, description")
d.oui_non("Extincteurs vérifiés chaque année ?", si="Si oui, nombre")
d.oui_non("Protections spécifiques contre la foudre ?", si="Si oui, lesquelles")
d.oui_non("Ont-elles déjà fonctionné ?", si="Si oui, quand et combien de fois")
d.oui_non("Stock de pièces détachées ?", si="Si oui, nature des pièces")
d.oui_non("Plusieurs groupes utilisés en même temps ?", si="Si oui, combien de fois par an et nombre de jours")
d.oui_non("Moyens de levage sur place ?", si="Si oui, lesquels")
d.oui_non("Relevés d’hydraulicité sur le cours d’eau ?", si="Si oui, lieu, distance de la centrale et fréquence")
d.tableau(["Équipement", "Délai maximum de remplacement (approvisionnement compris)"],
          lignes=["Turbines", "Multiplicateurs", "Génératrices ou alternateurs", "Transformateurs", "Autres équipements"], largeurs=[.45, .55])
d.oui_non("Sinistres d’événements naturels ou de catastrophes naturelles sur les 10 dernières années ?", si="Si oui, date, événement et montant")
d.oui_non("Des mesures ont-elles été prises pour éviter le retour d’un sinistre déjà survenu ?", si="Si oui, lesquelles")

d.section("Choix des garanties", need=130)
d.liste_cases(["Pertes d’exploitation", "Dommages aux bâtiments", "Responsabilité civile exploitation",
               "Responsabilité civile après livraison", "Défense et recours"])
d.champ("Pertes d’exploitation : marge brute annuelle (€)")
d.choix("Période d’indemnisation", ["6 mois", "12 mois"])

d.section("Documents à joindre", need=110)
d.puces(["schéma d’implantation des équipements ;", "facture de l’installation ;", "contrat de vente d’énergie et détail des recettes ;",
         "certificats Q18 et Q19 ;", "copie du contrat de maintenance ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.oui_non("Redressement ou liquidation judiciaire au cours des 3 dernières années ?", si="Si oui, situation aujourd’hui (plan de continuation, rachat…)")
d.fin(maritime=False)
print(OUT, d.save())
