#!/usr/bin/env python3
"""Questionnaire Eloy – Installations de méthanisation (20/11/2026).
Reprend les questions du questionnaire risques techniques de l'assureur, sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Methanisation.pdf'))

d = Q(OUT, "Installations de méthanisation", "Méthanisation")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()

d.section("L’installation", need=260)
d.champ("Adresse de l’installation")
d.champ("Coordonnées GPS")
d.choix("Où en est le projet", ["En projet ou en construction", "En exploitation"])
d.champ("Date de mise en service (installation existante)")
d.zone("Description de l’installation", h=40)
d.choix("Type d’installation", ["Injection", "Cogénération"])
d.row([("Cogénération : turbine (puissance et fournisseur)", 1)])
d.row([("Cogénération : moteur (puissance et fournisseur)", 1)])
d.row([("Puissance installée (kW)", .45), ("Déchets traités (tonnes par jour)", .55)])
d.row([("Intrants solides : nature et pourcentage", 1)])
d.row([("Intrants liquides : nature et pourcentage", 1)])
d.choix("Régime ICPE de l’installation", ["Déclaration", "Enregistrement", "Autorisation"])

d.section("Montants à assurer", need=230)
d.tableau(["Désignation", "Montant HT (€)"],
          lignes=["Digesteurs", "Cuves", "Bâtiments", "Génie civil", "Production électrique (turbines, moteurs)",
                  "Équipements de gestion des gaz", "Réseaux divers", "Autres (préciser dans « Informations complémentaires »)"],
          largeurs=[.7, .3], total=True)

d.section("Recettes annuelles à assurer", need=200)
d.tableau(["Recette", "Chiffre d’affaires annuel HT (€)", "Taux de marge brute (%)", "Marge brute (€)"],
          lignes=["Vente de gaz", "Vente de digestats", "Recettes électriques", "Vente de chaleur", "Épandage"],
          largeurs=[.34, .24, .18, .24], total=True)

d.section("Maintenance, prévention et protection", need=300)
d.oui_non("Contrat de maintenance ?", si="Si oui, nom du prestataire")
d.choix("Étendue du contrat", ["Préventive", "Corrective"])
d.oui_non("Vérification des installations électriques ? (joindre le certificat Q18)", si="Organisme vérificateur")
d.oui_non("Vérification des installations électriques par thermographie ? (joindre le certificat Q19)", si="Organisme vérificateur")
d.oui_non("Zonage et marquage ATEX des appareils ?")
d.oui_non("Détecteur de méthane certifié ATEX, avec seuil d’alerte et seuil d’arrêt, dans le module de cogénération ou d’épuration ?")
d.oui_non("Analyseur de gaz en continu (H2S et O2) entre le digesteur et le local de combustion ?")
d.oui_non("Arrête-flamme en amont du local de combustion ?")
d.oui_non("Détecteur d’incendie relié à une alarme dans le local de combustion ?")
d.oui_non("Télésurveillance de l’installation avec suivi de production et alertes ?")
d.oui_non("Des mesures ont-elles été prises pour éviter le retour d’un sinistre déjà survenu ?", si="Si oui, lesquelles")

d.section("Choix des garanties", need=140)
d.liste_cases(["Pertes d’exploitation", "Responsabilité civile exploitation",
               "Responsabilité civile après livraison", "Défense et recours",
               "Phase de construction (montage et essais), si l’installation n’est pas encore réceptionnée"])
d.champ("Pertes d’exploitation : marge brute annuelle (€)")
d.choix("Période d’indemnisation", ["6 mois", "12 mois", "18 mois"])

d.section("Documents à joindre", need=120)
d.puces(["schéma d’implantation des équipements ;", "facture de l’installation ;", "détail des recettes ;",
         "copie du contrat de maintenance ;", "certificats Q18 et Q19 ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.fin(maritime=False)
print(OUT, d.save())
