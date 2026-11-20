#!/usr/bin/env python3
"""Questionnaire Eloy – Tous risques chantier et montage-essais (20/11/2026).
Reprend les questions du questionnaire risques techniques de l'assureur, sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Tous_Risques_Chantier.pdf'))

d = Q(OUT, "Tous risques chantier et montage-essais", "Tous risques chantier")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()
d.row([("Chiffre d’affaires annuel (€)", .5), ("Effectif", .5)])
d.choix("Vous êtes", ["Maître d’ouvrage", "Entreprise générale ou de construction", "Industriel", "Installateur ou producteur d’énergie"],
        autre="Autre")

d.section("Maître d’ouvrage, s’il est différent du demandeur", need=120)
d.para("Propriétaire de l’ouvrage ou de l’installation.")
d.champ("Dénomination sociale")
d.champ("Adresse")
d.row([("Forme juridique", .35), ("N° SIREN", .3), ("Code NAF", .35)])
d.champ("Site internet")

d.section("Le chantier ou l’installation", need=230)
d.champ("Adresse du chantier ou de l’installation")
d.row([("Coordonnées GPS", 1)])
d.champ("Autres lieux (zones de stockage…)")
d.zone("Description des travaux et des opérations de montage", h=56)
d.choix("Nature des travaux", ["Neufs ou rénovation légère*", "Réhabilitation ou rénovation lourde**"])
d.para("* Rénovation légère : travaux sur existants sans intervention sur la structure ni sur le clos et le couvert. "
       "** Rénovation lourde : travaux sur existants avec intervention sur la structure ou sur le clos et le couvert.")
d.choix("Destination de l’ouvrage", ["Usage propre", "Location", "Vente ou accession à la propriété"])
d.row([("Nombre de bâtiments", .25), ("Étages (sur rez-de-chaussée)", .25), ("Sous-sols", .25), ("Logements", .25)])
d.oui_non("Travaux sur existants ou reprise en sous-œuvre ?", si="Si oui, un diagnostic de l’existant a-t-il été réalisé ?")
d.oui_non("Les travaux font-ils appel à une technique non courante ?", si="Si oui, laquelle")
d.choix("Environnement du chantier", ["Centre-ville", "Zone d’activité ou commerciale", "Zone industrielle", "Site isolé"])
d.oui_non("Y a-t-il de l’eau dans le sol (nappe, remontées) ?")
d.oui_non("Le chantier est-il proche de la mer, d’une rivière ou d’un étang ?", si="Si oui, distance et différence de hauteur entre le chantier et l’eau")
d.oui_non("Le terrain est-il exposé à un risque naturel particulier (inondation, glissement de terrain) ?", si="Si oui, lequel")
d.row([("Début des travaux", .5), ("Réception prévisionnelle", .5)])
d.row([("Montage des équipements : du", .5), ("au", .5)])
d.row([("Essais à chaud ou en charge : du", .5), ("au", .5)])
d.oui_non("Le montage a-t-il lieu dans une usine en exploitation ?")
d.oui_non("Les équipements montés sont-ils neufs ?", si="Si non, comment sont-ils valorisés ?")
d.row([("Valeur du plus gros équipement (€ HT)", 1)])

d.section("Coût prévisionnel des travaux", need=200)
d.tableau(["Nature", "Montant HT (€)"],
          lignes=["Travaux tous corps d’état (y compris VRD)", "Honoraires d’architectes, bureaux d’études, étude de sols, contrôle technique",
                  "Équipements industriels (y compris transport, montage et essais)", "Honoraires d’ingénierie"],
          largeurs=[.72, .28], total=True)
d.oui_non("Un maître d’œuvre est-il missionné ?")
d.oui_non("Si oui, sa mission est-elle complète (conception et suivi) ?")
d.oui_non("Mission de contrôle technique de type L (solidité des ouvrages) ?")
d.oui_non("Sur existants, mission de contrôle technique de type LE (solidité des existants) ?")

d.section("Bureau d’étude de sols", need=110)
d.tableau(["Nom", "Mission (G1, G2 AVP, G2 PRO, G3, G4, G5, hydrogéologie)", "Assureur RC et décennale", "N° de contrat"],
          n=2, largeurs=[.24, .36, .22, .18])

d.section("Choix des garanties", need=230)
d.para("La maintenance visite de 12 mois après la réception est comprise. Options souhaitées :", 7.6, INK)
d.liste_cases(["Maintenance étendue", "Maintenance constructeur", "Maintenance de 24 mois", "Dommages aux existants",
               "Responsabilité civile du maître d’ouvrage (maître d’ouvrage uniquement)", "Transport accéléré et heures supplémentaires, y compris par avion"])
d.champ("Dommages aux existants : montant à garantir (€)")
d.sub("Pertes d’exploitation anticipées", need=70)
d.champ("Marge brute annuelle prévisionnelle (€)")
d.choix("Période d’indemnisation", ["3 mois", "6 mois", "12 mois", "18 mois"])

d.section("Documents à joindre", need=130)
d.puces(["jeu de plans et schéma d’implantation des équipements ;", "rapport initial du contrôleur technique ;",
         "rapport d’étude de sols, s’il y en a un ;", "planning détaillé des travaux ;",
         "répartition des coûts par lot ou par équipement ;", "calcul de la marge brute prévisionnelle, s’il y a lieu ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.oui_non("Redressement ou liquidation judiciaire au cours des 3 dernières années ?", si="Si oui, situation aujourd’hui (plan de continuation, rachat…)")
d.fin(maritime=False)
print(OUT, d.save())
