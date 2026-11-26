#!/usr/bin/env python3
"""Questionnaire Eloy – Auto-évaluation du bateau de plaisance (26/11/2026, demande de Bradley).
Sur le modèle du questionnaire plaisance du partenaire (proposant, identification du bateau, valeurs, déclaration,
signatures du proposant et du courtier) + la grille d'auto-évaluation du questionnaire plaisance Eloy
+ les justificatifs d'entretien (bateaux de 11 à 15 ans : auto-évaluation et justificatifs d'entretien, sans expertise).
Aucun nom d'assureur sur le document client."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Auto_Evaluation_Plaisance.pdf'))

d = Q(OUT, "Auto-évaluation du bateau de plaisance", "Auto-évaluation plaisance",
      intro=[("À compléter par le propriétaire et à retourner ", 0), ("signé", 1), (", avec les ", 0), ("justificatifs d’entretien", 1),
             (", à ", 0), ("eloy.assurances@gmail.com", 1),
             (". Les cases bleues se remplissent directement sur ordinateur ; le document peut aussi être imprimé. "
              "Répondez avec soin : cette auto-évaluation remplace l’expertise pour les bateaux concernés.", 0)])

# 1. Proposant
d.section("Le propriétaire (proposant)")
d.champ("Nom et prénom, ou raison sociale")
d.champ("Bénéficiaire effectif (si le bateau appartient à une société)")
d.champ("Adresse")
d.row([("Code postal", .27), ("Ville", .73)])
d.row([("Téléphone portable", .45), ("E-mail", .55)])
d.note("Joignez une pièce d’identité (particulier) ou un extrait Kbis de moins de 3 mois (société).")

# 2. Le bateau
d.section("Identification du bateau", need=200)
d.row([("Nom du bateau", .5), ("Immatriculation", .5)])
d.row([("Constructeur (chantier)", .5), ("Modèle", .5)])
d.choix("Type", ["Voilier monocoque", "Voilier multicoque", "Bateau à moteur"], autre="Autre")
d.row([("Année de construction", .34), ("Longueur (m)", .3), ("Matériau de la coque", .36)])
d.choix("Pavillon", ["Français"], autre="Autre")
d.champ("Port d’attache et lieu de stationnement habituel")
d.choix("Stationnement", ["À flot", "À sec sur terrain privé", "À sec sous abri", "À sec en zone professionnelle"])
d.sub("Moteur(s)")
d.tableau(["In-bord / hors-bord", "Marque", "Nombre", "Année", "Puissance (CV)"], n=2, largeurs=[.22, .26, .14, .16, .22])
d.sub("Valeurs à assurer (€)")
d.row([("Corps et moteurs du bateau", .5), ("Annexe (avec son moteur)", .5)])
d.row([("Moteurs hors-bord", .5), ("Accessoires de navigation et effets personnels", .5)])

# 3. Auto-évaluation
d.section("État du bateau (auto-évaluation)", need=260)
d.para("Cochez une case par ligne. « Sans objet » si l’élément n’existe pas sur votre bateau.", 7.6, INK)
ETAT = ["Élément", "Très bon", "Moyen", "Mauvais", "Sans objet"]
TY = ["label", "check", "check", "check", "check"]
LG = [.44, .14, .14, .14, .14]
d.sub("Coque et structure")
d.tableau(ETAT, lignes=["Coque (fissures, chocs, réparations)", "Pont et rigidité des ponts", "Peintures et surfaces (dont antifouling)",
                        "Cale (propreté, absence d’eau)", "Cloisons et liaison coque-pont", "Quille et fixations de quille", "Safran et gouvernail",
                        "Cockpit", "Hublots, pare-brise et capots de pont"], types=TY, largeurs=LG)
d.oui_non("Présence de corrosion ?", si="Si oui, où ?")
d.oui_non("Présence d’osmose ?")
d.oui_non("Voie d’eau ou infiltration constatée ces 12 derniers mois ?", si="Si oui, précisez et indiquez la réparation")
d.oui_non("Le bateau a-t-il déjà subi un sinistre ?", si="Si oui, a-t-il été entièrement réparé ? Par qui et quand ?")
d.oui_non("La structure du bateau a-t-elle été modifiée (rallongement, remotorisation, transformation) ?", si="Si oui, précisez")
d.sub("Gréement (voiliers)")
d.tableau(ETAT, lignes=["Mât et bôme", "Gréement dormant (haubans, étais, ridoirs)", "Gréement courant (drisses, écoutes, poulies)",
                        "Voiles", "Winchs et accastillage"], types=TY, largeurs=LG)
d.choix("Âge du gréement dormant", ["Moins de 10 ans", "Plus de 10 ans", "Sans objet"])
d.row([("Date du dernier contrôle du gréement par un professionnel", 1)])
d.sub("Moteurs")
d.tableau(ETAT, lignes=["État général des moteurs", "Embases, arbres et presse-étoupe", "Hélices", "Circuit de refroidissement",
                        "Circuit de carburant et réservoirs", "Étanchéité (pas de fuite d’huile ou de carburant)"], types=TY, largeurs=LG)
d.row([("Date de la dernière révision des moteurs par un professionnel", 1)])
d.row([("Nombre d’heures moteur (si connu)", 1)])
d.sub("Électricité")
d.tableau(ETAT, lignes=["Circuit électrique", "Batteries et chargeur", "Anodes", "Tableau électrique et protections"], types=TY, largeurs=LG)
d.oui_non("L’installation électrique est-elle conforme à la réglementation en vigueur ?")
d.sub("Sécurité et mouillage")
d.tableau(ETAT, lignes=["Mouillage principal (ancre, chaîne, guindeau)", "Pompes de cale", "Extincteurs", "Gilets, bouées et annexe",
                        "Radeau de survie", "Feux de navigation et électronique"], types=TY, largeurs=LG)

# 4. Entretien
d.section("Entretien du bateau et justificatifs", need=230)
d.para("Indiquez les dernières opérations d’entretien et joignez les justificatifs (factures ou attestations des professionnels).", 7.6, INK)
d.tableau(["Opération", "Date", "Professionnel (nom)", "Justificatif joint"],
          lignes=["Carénage et antifouling", "Révision des moteurs", "Contrôle ou remplacement du gréement dormant", "Contrôle de l’installation électrique",
                  "Remplacement des anodes", "Révision du radeau de survie", "Autre opération"],
          types=["label", "text", "text", "check"], largeurs=[.4, .16, .32, .12])
d.row([("Date du dernier rapport d’expertise, s’il y en a un", 1)])
d.puces(["les justificatifs d’entretien cochés ci-dessus ;",
         "une pièce d’identité (ou un extrait Kbis de moins de 3 mois) ;",
         "l’acte de francisation (ou la carte de circulation) ;",
         "si possible, des photos récentes du bateau : coque, pont, moteurs et gréement."])

# 5. Historique et expérience
d.section("Historique et expérience", need=170)
d.sub("Avaries des 5 dernières années")
d.tableau(["Date", "Nature de l’avarie ou du sinistre", "Montant des réparations (€)"], n=3, largeurs=[.18, .56, .26])
d.choix("Expérience du navigateur principal (10 dernières années)", ["En solitaire", "Avec équipage", "Croisières de moins de 250 milles",
                                                                       "Croisières de plus de 250 milles", "Transocéanique"])

# 6. Déclaration et signatures
d.section("Déclaration de bon état", need=80)
d.liste_cases(["Je déclare qu’à ma connaissance le bateau est en bon état de navigation, qu’il est entretenu régulièrement "
               "et qu’il ne présente pas de risque apparent."])
d.ensure(170)
d.fin()
d.section("Signatures", need=150)
d.row([("Fait à", .6), ("Le", .4)])
d.c.setFillColor(INK)
d.row([("Nom du signataire", 1)])
d.zone("Signature du propriétaire (précédée de « Lu et approuvé »)", h=32)
d.zone("Signature et cachet du courtier (Eloy)", h=32)
d.save()
print(OUT)
