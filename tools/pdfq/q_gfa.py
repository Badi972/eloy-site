#!/usr/bin/env python3
"""Questionnaire Eloy – Garantie financière d'achèvement (pré-étude courte), 20/11/2026.
Reprend l'essentiel des questionnaires des garants (Groupe Leader / Great American, UBI via Ocealiz), sans nom de garant.
Le questionnaire détaillé du garant est envoyé ensuite si le dossier peut être présenté."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Garantie_Achevement.pdf'))

d = Q(OUT, "Garantie financière d’achèvement", "Garantie financière d’achèvement")

d.row([("Date de mise en place souhaitée", .5), ("Date de la demande", .5)])
d.demandeur()

d.section("Votre société et son expérience", need=170)
d.choix("Vous êtes", ["Promoteur immobilier", "Société dédiée à l’opération (SCCV…)", "Marchand de biens", "Maître d’ouvrage délégué"], autre="Autre")
d.row([("Nombre d’opérations déjà livrées par les dirigeants", 1)])
d.oui_non("Avez-vous déjà obtenu une garantie financière d’achèvement ?", si="Si oui, auprès de quel(s) organisme(s) et pour quel encours")
d.oui_non("Une garantie d’achèvement a-t-elle été mise en jeu sur l’une de vos opérations au cours des 10 dernières années ?", si="Si oui, programme concerné et raison")
d.oui_non("Un dirigeant ou un associé a-t-il dirigé une entreprise qui a fait l’objet d’un redressement ou d’une liquidation judiciaire ?", si="Si oui, entreprise et situation aujourd’hui")

d.section("Le programme", need=260)
d.row([("Nom du programme", .5), ("Commune du chantier", .5)])
d.choix("Type de vente", ["Vente en l’état futur d’achèvement (VEFA)", "Vente d’immeuble à rénover (VIR)"])
d.choix("Destination", ["Logements", "Logements et commerces ou bureaux"], autre="Autre")
d.row([("Nombre de bâtiments", .25), ("Nombre de logements", .25), ("Commerces, bureaux, parkings", .25), ("Hauteur (R+) et sous-sols", .25)])
d.choix("Permis de construire", ["Obtenu", "Déposé", "À déposer"])
d.row([("N° et date de délivrance du permis", .6), ("Purgé de tout recours (oui / non / en cours)", .4)])
d.row([("Date prévue d’ouverture du chantier", .5), ("Date prévue d’achèvement", .5)])
d.choix("Les marchés de travaux sont passés", ["Par corps d’état séparés", "Avec une entreprise générale", "Pas encore passés"])
d.oui_non("Le maître d’œuvre a-t-il une mission complète (jusqu’à la réception) ?")

d.section("Le terrain", need=110)
d.choix("Le terrain est", ["Acquis", "Sous promesse de vente", "À acquérir"])
d.row([("Prix du terrain (€)", 1)])
d.oui_non("Une partie du prix du terrain est-elle payée en lots du programme (dation) ?", si="Si oui, lots concernés et valeur (€)")

d.section("Budget et financement (montants TTC)", need=130)
d.row([("Prix de revient total de l’opération (€)", .5), ("Chiffre d’affaires total des ventes (€)", .5)])
d.row([("Apports des associés en fonds propres (€)", .5), ("Marge prévisionnelle (€)", .5)])
d.choix("Crédit d’accompagnement", ["Obtenu", "Demandé", "Pas de crédit prévu"])
d.row([("Banque et montant du crédit", 1)])

d.section("Commercialisation", need=100)
d.row([("Nombre total de lots à vendre", .5), ("Lots déjà réservés (dation comprise)", .5)])
d.row([("Montant des réservations (€ TTC)", .5), ("Nom du commercialisateur", .5)])
d.choix("Mode de vente", ["Vente à l’unité", "Vente en bloc", "Les deux"])

d.section("Assurances de l’opération", need=70)
d.para("Le garant exige que l’opération soit assurée.", 7.6, INK)
d.choix("Souhaitez-vous aussi une étude dommages-ouvrage, tous risques chantier et constructeur non réalisateur ?",
        ["Oui", "Non, déjà assuré", "À me conseiller"])

d.section("Documents à joindre", need=110)
d.puces(["le bilan financier de l’opération (prix de revient et prix de vente) ;", "le permis de construire ;",
         "le plan de financement (apports et crédit) ;", "l’état des réservations ou l’attestation notariée de pré-commercialisation ;",
         "les statuts, le Kbis et les deux derniers bilans de la société."])
d.fin(maritime=False)
print(OUT, d.save())
