#!/usr/bin/env python3
"""Questionnaire Eloy – Matériel électronique et médical (matériels électriques, électroniques et de télécommunication), 20/11/2026.
Reprend les questions du formulaire bris de machines de l'assureur (formule matériels électriques et électroniques),
sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Materiel_Electronique.pdf'))

d = Q(OUT, "Matériel électronique et médical", "Matériel électronique et médical")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()
d.row([("Chiffre d’affaires annuel (€)", .5), ("Effectif", .5)])

d.section("Votre activité", need=150)
d.choix("Activité", ["Cabinet médical, dentaire ou paramédical", "Imagerie médicale ou laboratoire", "Son, lumière et événementiel",
                     "Audiovisuel et photo", "Mesure, contrôle et topographie", "Télécommunications et sûreté", "Location de matériel"],
        autre="Autre")
d.zone("Adresse du ou des lieux où le matériel est utilisé ou entreposé", h=32)
d.oui_non("Êtes-vous propriétaire des locaux ?")
d.oui_non("Si non, le bail prévoit-il une renonciation à recours contre le propriétaire ?")

d.section("Le matériel à assurer", need=260)
d.para("Une ligne par appareil. Valeur de remplacement à neuf : prix d’un appareil neuf identique, hors taxes ou toutes taxes selon "
       "votre régime de TVA. Vous pouvez aussi joindre la liste ou les factures.", 7.6, INK)
d.choix("Valeurs indiquées", ["HT", "TTC"])
d.tableau(["N°", "Désignation", "Marque, modèle", "N° de série", "Année", "Valeur à neuf (€)", "Propriété, crédit-bail ou location",
           "Organisme ou loueur"], n=10, largeurs=[.05, .17, .16, .12, .08, .13, .16, .13])
d.oui_non("Donnez-vous du matériel en location à vos clients ?", si="Si oui, chiffre d’affaires annuel de location (€)")
d.oui_non("Les appareils ont-ils un contrat de maintenance ?", si="Si oui, lesquels (n°) et avec quel prestataire")
d.oui_non("Certains appareils sont-ils encore sous garantie du constructeur ?", si="Si oui, lesquels (n°)")
d.zone("Protection contre le vol (alarme, local fermé, gardiennage…)", h=30)

d.section("Choix des garanties en option", need=170)
d.liste_cases(["Accessoires (sondes, antennes, lasers…)", "Transport du matériel", "Location d’un appareil de remplacement",
               "Frais supplémentaires et de sous-traitance", "Pertes de recettes, d’honoraires ou d’exploitation"])
d.choix("Transport : zone", ["Martinique, Guadeloupe, Guyane", "France", "Monde entier"])
d.row([("Recettes ou honoraires annuels (€)", .5), ("Période d’indemnisation (3, 6 ou 12 mois)", .5)])

d.section("Documents à joindre", need=90)
d.puces(["factures d’achat ou liste détaillée des appareils ;", "contrats de crédit-bail ou de location, s’il y a lieu ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.oui_non("Redressement ou liquidation judiciaire au cours des 3 dernières années ?", si="Si oui, situation aujourd’hui (plan de continuation, rachat…)")
d.fin(maritime=False)
print(OUT, d.save())
