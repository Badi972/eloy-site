#!/usr/bin/env python3
"""Questionnaire Eloy – Assurance construction des maîtres d'ouvrage professionnels (20/11/2026).
Reprend les questions du questionnaire construction de l'assureur (DO, CNR, TRC/montage-essais, CCRD),
sans nom d'assureur ni rubrique « Intermédiaire ». Pas de « dommages aux biens » (non placé par Eloy)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Construction_Maitres_Ouvrage.pdf'))

d = Q(OUT, "Assurance construction des maîtres d’ouvrage professionnels", "Construction")

d.section("Garanties demandées", need=150)
d.liste_cases(["Dommages-ouvrage", "Constructeur non réalisateur (avec la dommages-ouvrage)",
               "Tous risques chantier et montage-essais", "Contrat collectif de responsabilité décennale (avec la dommages-ouvrage)",
               "Étude bris de machine pour l’exploitation des équipements, après la réception", "À me conseiller"])
d.row([("Date d’effet souhaitée", .5), ("Date de la demande", .5)])

d.demandeur()
d.choix("Le demandeur agit en qualité de", ["Maître d’ouvrage", "Promoteur immobilier"], autre="Autre (précisez)")

d.section("L’opération de construction", need=200)
d.choix("Destination", ["Industriel", "Commercial", "Bureaux", "Logements", "Enseignement", "Établissement de soins, EHPAD"],
        autre="Autre")
d.choix("Usage", ["Propre", "Vente", "Location"])
d.sub("Particularités de l’ouvrage")
d.liste_cases(["Maison individuelle", "Logements en accession à la propriété, même pour une partie seulement de l’ouvrage",
               "Monument historique", "Équipements sportifs", "Piscine, spa", "Panneaux solaires",
               "Bâtiments voisins à moins de 10 m de la construction", "Aucune de ces particularités"])
d.champ("Autre particularité (précisez)")
d.zone("Description des travaux (nombre de bâtiments, d’étages, surfaces…)", h=48)
d.champ("Adresse du chantier")
d.champ("Autres lieux (zones de stockage…)")
d.oui_non("Y a-t-il des bâtiments voisins à moins de 10 m de toute nouvelle construction ?")
d.para("Si oui, précisez ce qui est prévu :", 8, INK, 'PJ-Medium')
d.oui_non("Mission de contrôle technique « avoisinants » (AV)")
d.oui_non("Référé préventif")
d.oui_non("Constat d’huissier (commissaire de justice)")
d.choix("Nature des travaux", ["Neufs, sans travaux sur existants", "Rénovation légère*", "Rénovation lourde**"])
d.para("* Rénovation légère : travaux sur existants sans intervention sur la structure ni sur le clos et le couvert. "
       "** Rénovation lourde : travaux sur existants avec intervention sur la structure ou sur le clos et le couvert.")

d.section("Coût prévisionnel de l’opération", need=230)
d.tableau(["Nature", "Montant HT (€)", "Montant TTC (€)"],
          lignes=["Travaux tous corps d’état (y compris VRD)",
                  "Honoraires liés au bâtiment (architecte, maître d’œuvre, bureaux d’études dont étude de sols, contrôle technique…)",
                  "Sous-total bâtiment", "Équipements industriels (y compris transport, montage et essais)",
                  "Honoraires d’ingénierie liés aux équipements industriels", "Sous-total équipements industriels"],
          largeurs=[.6, .2, .2], total=True)
d.oui_non("Le maître d’ouvrage récupère-t-il la TVA ?")
d.para("S’il ne la récupère pas, le contrat est établi sur les montants TTC.")

d.section("Planning", need=170)
d.row([("Permis de construire n°", .4), ("Délivré par", .35), ("Le", .25)])
d.row([("Date de déclaration d’ouverture de chantier", .55), ("Début des travaux", .45)])
d.row([("Réception prévisionnelle", .5), ("Durée des travaux (mois)", .5)])
d.sub("Le cas échéant, équipements industriels")
d.row([("Montage : du", .5), ("au", .5)])
d.row([("Essais à chaud ou en charge : du", .5), ("au", .5)])

d.section("Les intervenants", need=180)
d.sub("Maître d’ouvrage, s’il est différent du demandeur")
d.champ("Dénomination sociale")
d.champ("Adresse du siège")
d.row([("Code postal et ville", .6), ("N° SIREN", .4)])
d.oui_non("Le maître d’ouvrage assure-t-il lui-même certaines missions de maîtrise d’œuvre ?", si="Si oui, lesquelles")
d.oui_non("Le maître d’ouvrage réalise-t-il lui-même des travaux ?", si="Si oui, lesquels et pour quel montant")
d.sub("Conception et maîtrise d’œuvre (architectes, maîtres d’œuvre, bureaux d’études hors étude de sols)", need=150)
d.oui_non("Un maître d’œuvre (y compris architecte) est-il missionné ?")
d.oui_non("Un bureau d’études techniques est-il missionné ?")
d.tableau(["Nom", "Nature des études (lots concernés)", "Mission : conception, direction, suivi", "Assureur RC et décennale",
           "N° de contrat"], n=4, largeurs=[.2, .24, .2, .2, .16])
d.sub("Bureau d’étude de sols", need=120)
d.tableau(["Nom", "Mission (G1, G2 AVP, G2 PRO, G3, G4, G5, hydrogéologie)", "Assureur RC et décennale", "N° de contrat"],
          n=2, largeurs=[.24, .36, .22, .18])
d.sub("Entreprises (traitants directs)", need=150)
d.choix("Type de marché", ["Entreprise générale", "Contractant général", "Lots séparés"])
d.tableau(["Nom", "Nature des travaux", "Montant du marché (€)", "Assureur RC et décennale", "N° de contrat"], n=6,
          largeurs=[.22, .26, .16, .2, .16])

d.section("Mode d’exécution des travaux", need=260)
d.oui_non("Travaux sur existants modifiant les reports de charges, les fondations ou des éléments porteurs ?")
d.oui_non("Si oui, un bureau d’études structure est-il missionné pour définir le mode constructif ?")
d.oui_non("Création de fondations ou d’éléments porteurs ?")
d.oui_non("Si oui, un bureau d’études structure est-il missionné pour définir le mode constructif ?")
d.oui_non("Le tassement maximum indiqué par la dernière étude de sol est-il inférieur à 1,5 cm ?")
d.oui_non("Le plancher le plus bas est-il au-dessus du niveau des plus hautes eaux ?", si="Si non, cela concerne-t-il uniquement un parking ?")
d.choix("Zone de risque argile (si fondations créées ou modifiées)", ["Nul ou B1", "B2 ou B3", "Je ne sais pas"])
d.oui_non("En zone B2 ou B3, les mesures de la circulaire du 11/10/2010 sont-elles respectées ?")
d.choix("Zone de sismicité", ["1 ou 2", "3 ou 4", "5 (Antilles)"])
d.oui_non("Les mesures parasismiques réglementaires sont-elles prises ?")
d.oui_non("Les travaux sont-ils tous de technique courante ? (définition en fin de questionnaire)", si="Si non, lesquels")
d.oui_non("Des travaux ont-ils un caractère exceptionnel ? (définition en fin de questionnaire)", si="Si oui, lesquels")
d.oui_non("Panneaux solaires (photovoltaïques ou thermiques) ?")
d.choix("Si oui", ["Intégrés à la construction", "Surimposés ou intégration simplifiée", "En autoconsommation"])
d.oui_non("Piscine, bassin de rééducation, balnéothérapie ?")
d.choix("Bureaux d’études missionnés", ["Fluides", "Thermique", "Aucun"])

d.section("Choix des garanties", need=230)
d.sub("Tous risques chantier")
d.para("La maintenance visite de 12 mois après la réception est comprise. Options souhaitées :", 7.6, INK)
d.liste_cases(["Maintenance étendue", "Maintenance de 24 mois", "Dommages aux existants",
               "Matériels et engins de chantier", "Transport des matériaux et équipements (étude spécifique)",
               "Bonne tenue de la peinture sur acier (étude spécifique)"])
d.sub("Pertes financières en cas de retard de livraison après un sinistre", need=120)
d.row([("Pertes d’exploitation anticipées : marge brute annuelle (€)", 1)])
d.row([("Pertes de loyers : montant annuel des baux signés ou estimés (€)", 1)])
d.row([("Frais bancaires intercalaires : montant sur 12 mois (€)", 1)])
d.choix("Période d’indemnisation", ["6 mois", "12 mois", "18 mois"])
d.sub("Responsabilité civile", need=90)
d.liste_cases(["Responsabilité civile du maître d’ouvrage", "Responsabilité civile du maître d’ouvrage et du terrain à bâtir",
               "Responsabilité civile de tout intervenant (hors maître d’ouvrage)"])
d.champ("Date d’acquisition du terrain (option terrain à bâtir)")
d.sub("Dommages-ouvrage et constructeur non réalisateur", need=90)
d.liste_cases(["Bon fonctionnement des éléments d’équipement dissociables",
               "Dommages aux existants non soumis à l’assurance obligatoire", "Dommages immatériels consécutifs"])
d.choix("Franchise", ["De base", "Réduite", "À me conseiller"])

d.section("Documents à joindre", need=200)
d.para("Pour l’étude :", 8, INK, 'PJ-Medium')
d.puces(["jeu de plans ;", "devis détaillés ou CCTP ;", "rapport initial du contrôleur technique ;",
         "rapport d’étude de sols, s’il y en a un ;", "statistique de sinistres des 5 dernières années, si vous êtes déjà assuré ;",
         "avec des équipements industriels : schéma d’implantation, planning détaillé, répartition des coûts par lot ou par équipement, "
         "calcul de la marge brute."])
d.para("Pour l’établissement du contrat :", 8, INK, 'PJ-Medium')
d.puces(["attestations d’assurance décennale de tous les intervenants, valables à la date d’ouverture du chantier ;",
         "marchés de travaux et conventions de tous les intervenants (concepteurs et entreprises) ;",
         "déclaration d’ouverture de chantier (Cerfa), ou premier ordre de service s’il n’y a pas de permis ;",
         "arrêté de permis de construire, le cas échéant."])

d.antecedents(annees=5)
d.fin(maritime=False)

d.section("Définitions", need=200)
d.sub("Travaux de technique courante")
d.puces(["travaux conformes à une norme homologuée (NF DTU ou NF EN), à des règles ou recommandations professionnelles acceptées "
         "par la C2P (Agence Qualité Construction) ;",
         "procédés ou produits bénéficiant, au jour du marché, d’une évaluation technique européenne avec document technique "
         "d’application, ou d’un avis technique, valides et non mis en observation par la C2P ;",
         "procédés ou produits bénéficiant, au plus tard à la réception, d’une appréciation technique d’expérimentation (Atex) favorable."])
d.sub("Travaux à caractère exceptionnel", need=150)
d.puces(["grande portée : poutres de plus de 15 m (bois), 20 m (béton), 25 m (acier) ; porte-à-faux de plus de 30, 40 ou 50 m ; "
         "arcs de plus de 60 m (bois) ou 70 m (béton, acier) ;",
         "grande hauteur : hall sans plancher intermédiaire de plus de 35 m ; bâtiment à étages, réfrigérant ou réservoir de plus de 60 m ; "
         "cheminée de plus de 100 m ;",
         "grande profondeur : parties enterrées de plus de 15 m ; pieux ou puits de fondation de plus de 30 m après recépage ;",
         "grande capacité : cuves, réservoirs, châteaux d’eau, piscines de plus de 2 000 m³ ; silos de plus de 2 000 m³ par cellule "
         "en batterie, ou 5 000 m³ pour un silo à une cellule ;",
         "grande longueur : tunnels et galeries de plus de 1 000 m (section de plus de 80 m²) ; ouvrages de franchissement routier "
         "ou ferroviaire de plus de 100 m, ou travées de plus de 50 m."])

print(OUT, d.save())
