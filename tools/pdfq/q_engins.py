#!/usr/bin/env python3
"""Questionnaire Eloy – Engins et matériels mobiles (20/11/2026).
Reprend les questions du questionnaire risques techniques de l'assureur (engins en propriété ou financés),
avec les deux autres formules (engins pris en location, loueurs). Sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Engins_Materiels_Mobiles.pdf'))

d = Q(OUT, "Engins et matériels mobiles", "Engins et matériels mobiles")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()
d.row([("Chiffre d’affaires annuel (€)", .5), ("Effectif", .5)])

d.section("Votre activité et la formule souhaitée", need=150)
d.choix("Activité", ["BTP et terrassement", "Levage et manutention", "Manutention portuaire", "Transport et logistique",
                     "Voirie", "Espaces verts", "Location de matériel", "Collectivité locale"], autre="Autre")
d.liste_cases(["Vos engins, en propriété ou financés (crédit-bail, location avec option d’achat)",
               "Les engins que vous prenez en location chez un loueur professionnel",
               "Vous êtes loueur : le parc que vous donnez en location"])
d.row([("Engins pris en location : coût annuel de location (€)", 1)])
d.row([("Loueurs : chiffre d’affaires annuel de location (€)", 1)])

d.section("Les engins à assurer", need=250)
d.para("Une ligne par engin (vos engins en propriété ou financés). Valeur de remplacement à neuf : prix d’un engin neuf identique, "
       "sans remise, y compris transport, montage, mise en route et droits de douane non récupérables. Vous pouvez aussi joindre la liste ou les factures.", 7.6, INK)
d.choix("Valeurs indiquées", ["HT", "TTC"])
d.tableau(["N°", "Désignation", "Marque, type, caractéristiques", "N° de série ou d’immatriculation", "Valeur à neuf (€)",
           "Mise en service (mois/année)", "Propriété, crédit-bail ou location"], n=10, largeurs=[.05, .16, .2, .17, .13, .13, .16])
d.para("Pour un grand parc, le contrat peut fonctionner sans liste détaillée, avec une régularisation une fois par an : votre conseiller vous le précise.")

d.section("Sites et utilisation", need=200)
d.row([("Site d’entreposage 1 (adresse)", .72), ("N° des engins", .28)])
d.row([("Site d’entreposage 2 (adresse)", .72), ("N° des engins", .28)])
d.oui_non("Des engins sont-ils donnés en location à des tiers ?", si="Si oui, n° des engins")
d.oui_non("Les engins ont-ils un contrat de maintenance ?", si="Si oui, n° des engins et prestataire")
d.oui_non("Certains engins ont-ils un caractère expérimental (prototype) ?", si="Si oui, n° des engins")
d.champ("Organismes de financement (nom et adresse), si des engins sont financés")
d.oui_non("Les engins sont-ils équipés d’un traceur (géolocalisation) ?", si="Si oui, n° des engins")
d.zone("Protection contre le vol (parc fermé, gardiennage, antivol, géolocalisation…)", h=32)

d.section("Formule et garanties en option", need=130)
d.choix("Formule", ["Tous risques", "Collision et renversement", "À me conseiller"])
d.liste_cases(["Frais supplémentaires et de sous-traitance (location d’un engin de remplacement)", "Vol",
               "Transport accéléré et heures supplémentaires", "Honoraires de votre expert",
               "Casse mécanique d’origine interne (selon l’âge des engins)"])

d.section("Documents à joindre", need=80)
d.puces(["factures ou liste détaillée des engins (informations du tableau) ;",
         "contrats de crédit-bail ou de location avec option d’achat, s’il y a lieu ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.oui_non("Redressement ou liquidation judiciaire au cours des 3 dernières années ?", si="Si oui, situation aujourd’hui (plan de continuation, rachat…)")
d.fin(maritime=False)
print(OUT, d.save())
