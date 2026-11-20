#!/usr/bin/env python3
"""Questionnaire Eloy – Bris de machine (matériels, équipements et installations techniques), 20/11/2026.
Reprend les questions du questionnaire risques techniques de l'assureur, sans nom d'assureur ni rubrique « Intermédiaire »."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Bris_de_Machine.pdf'))

d = Q(OUT, "Bris de machine : matériels, équipements et installations techniques", "Bris de machine")

d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()
d.row([("Chiffre d’affaires annuel (€)", .5), ("Effectif", .5)])
d.section("Votre activité", need=90)
d.zone("Activité exercée et production réalisée sur le site", h=36)
d.champ("Adresse du ou des sites où sont installées les machines")
d.oui_non("Êtes-vous propriétaire des locaux ?")
d.oui_non("Si non, le bail prévoit-il une renonciation à recours contre le propriétaire ?")
d.row([("Durée d’utilisation des machines par jour", .5), ("Nombre d’équipes", .5)])
d.oui_non("Fonctionnement en continu, jour et nuit ?")

d.section("Les machines et installations à assurer", need=260)
d.para("Une ligne par machine ou installation. Valeur de remplacement à neuf : prix d’achat d’une machine neuve identique, "
       "y compris transport, montage, essais et droits de douane non récupérables. Vous pouvez aussi joindre la liste ou les factures.", 7.6, INK)
d.tableau(["N°", "Désignation", "Marque, modèle, caractéristiques", "N° de série", "Mise en service (mois/année)",
           "Valeur à neuf HT (€)", "Propriété, crédit-bail, location-vente ou location", "Organisme de financement ou loueur"],
          n=10, largeurs=[.05, .15, .17, .11, .11, .12, .15, .14])
d.oui_non("Les machines ont-elles un contrat de maintenance ?", si="Si oui, lesquelles (n°) et avec quel prestataire")
d.oui_non("Les machines sont-elles révisées régulièrement ?", si="Si oui, par qui (technicien interne, constructeur, prestataire)")
d.oui_non("Certaines machines sont-elles encore sous garantie du constructeur ?", si="Si oui, lesquelles (n°)")
d.oui_non("Certaines machines ont-elles un caractère expérimental (prototype) ?", si="Si oui, lesquelles (n°)")

d.section("Choix des garanties en option", need=200)
d.liste_cases(["Dommages d’origine externe (choc, chute, incendie, dégâts des eaux…)", "Démontage, déplacement et transport des machines", "Frais supplémentaires",
               "Fondations, massifs et socles", "Périls imminents et mesures conservatoires",
               "Transport accéléré et heures supplémentaires", "Frais de reconstitution des informations",
               "Honoraires de votre expert", "Bâtiments abritant les machines"])
d.champ("Fondations, massifs et socles : montant souhaité (€)")
d.sub("Pertes d’exploitation", need=170)
d.champ("Marge brute annuelle (€)")
d.choix("Période d’indemnisation", ["6 mois", "12 mois"])
d.liste_cases(["Extensions : carence de fournisseurs (y compris d’énergie) ou de clients, impossibilité d’accès, contrainte administrative"])
d.para("Pour chaque machine dont l’arrêt bloque la production :", 8, INK, 'PJ-Medium')
d.tableau(["N° de la machine", "Part de la marge brute qui en dépend (%)", "Délai maximum de réparation ou de remplacement",
           "Machine « goulot d’étranglement » (oui / non)"], n=5, largeurs=[.16, .28, .3, .26])

d.section("Documents à joindre", need=110)
d.puces(["schéma d’implantation des équipements ;", "factures d’achat ou liste détaillée des machines ;",
         "pour les pertes d’exploitation : détail de la marge brute, pièces critiques et délais de remplacement ;",
         "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré."])

d.antecedents(annees=5)
d.oui_non("Redressement ou liquidation judiciaire au cours des 3 dernières années ?", si="Si oui, situation aujourd’hui (plan de continuation, rachat…)")
d.fin(maritime=False)
print(OUT, d.save())
