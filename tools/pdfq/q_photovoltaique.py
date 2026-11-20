#!/usr/bin/env python3
"""Questionnaire Eloy – Installations photovoltaïques (20/11/2026).
Reprend les questions du questionnaire risques techniques de l'assureur, sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Photovoltaique.pdf'))

d = Q(OUT, "Installations photovoltaïques", "Photovoltaïque")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()

d.section("L’installation", need=230)
d.champ("Adresse de l’installation")
d.champ("Coordonnées GPS")
d.choix("Où en est le projet", ["En projet ou en construction", "En exploitation"])
d.row([("Marque et nombre de panneaux", 1)])
d.row([("Marque et nombre d’onduleurs", 1)])
d.row([("Puissance installée (kWc)", .45), ("Date de mise en service (installation existante)", .55)])
d.choix("Nature de l’installation", ["Au sol avec tracker", "Au sol sans tracker", "Serre", "Ombrière", "Hangar agricole", "Toiture"])
d.champ("Sur toiture : activité exercée dans le bâtiment")
d.oui_non("Des marchandises sont-elles stockées dans le bâtiment ?", si="Si oui, type et quantité")
d.oui_non("Sur toiture : êtes-vous propriétaire du bâtiment ?")
d.oui_non("Si non, le bail prévoit-il une renonciation à recours ? (joindre la copie du bail)")

d.section("Montants à assurer", need=200)
d.tableau(["Élément", "Montant (€)"], lignes=["Panneaux", "Onduleurs", "Structures", "Équipements électriques", "Génie civil, bâtiment"],
          largeurs=[.7, .3], total=True)
d.row([("Recettes annuelles prévisionnelles de revente (€)", 1)])
d.row([("Économie annuelle prévisionnelle liée à l’autoconsommation (€)", 1)])

d.section("Prévention et protection", need=300)
d.oui_non("Contrat de maintenance ?", si="Si oui, prestataire et étendue du contrat")
d.oui_non("Vérification des installations électriques ? (en autoconsommation, joindre le certificat Q18)", si="Organisme vérificateur")
d.oui_non("Thermographie de l’armoire électrique (TGBT) ? (joindre le certificat Q19)", si="Organisme vérificateur")
d.oui_non("Thermographie infrarouge par drone ?", si="Si oui, périodicité")
d.oui_non("Vis antivol sur les panneaux ?")
d.oui_non("Monitoring de la production ?")
d.oui_non("Supervision à distance par le mainteneur ?")
d.oui_non("Respect du référentiel APSAD D20 ?")
d.choix("Local onduleurs", ["Intérieur", "Extérieur à 5 m ou plus", "Extérieur à moins de 5 m"])
d.oui_non("Détection automatique d’incendie dans le local onduleurs ?")
d.oui_non("Des onduleurs ont-ils plus de 8 ans ?")
d.oui_non("Batteries de stockage ? (non assurables)")
d.sub("Centrales au sol, en ombrière ou sur tracker", need=170)
d.oui_non("Surveillance vidéo ?")
d.oui_non("Site clôturé (clôture de plus de 2 m) ?")
d.oui_non("Débroussaillage régulier ?")
d.oui_non("Installation située dans une zone commerciale ?")
d.oui_non("Calcul de la charge au vent réalisé ?")
d.oui_non("Repli automatique en cas de vent violent ?")
d.oui_non("Fondations et massifs des trackers réalisés par l’exploitant ?")
d.oui_non("Centrale au sol située en zone inondable ?")

d.section("Choix des garanties", need=130)
d.liste_cases(["Pertes de recettes (vente d’électricité ou économie d’autoconsommation)",
               "Responsabilité civile exploitation", "Responsabilité civile après livraison", "Défense et recours",
               "Phase de construction (montage et essais), si l’installation n’est pas encore réceptionnée"])
d.choix("Pertes de recettes : période d’indemnisation", ["6 mois", "12 mois"])

d.section("Documents à joindre", need=150)
d.puces(["schéma d’implantation des équipements ;", "facture de l’installation ;", "détail des recettes électriques ;",
         "certificats Q18 et Q19 ;", "étude de faisabilité ;", "copie du bail, le cas échéant ;",
         "dossier des ouvrages exécutés (DOE) ;", "descriptif de la couverture et de l’isolant (centrale en toiture) ;",
         "étude de sol, le cas échéant ;", "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.fin(maritime=False)
print(OUT, d.save())
