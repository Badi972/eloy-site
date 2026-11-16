#!/usr/bin/env python3
"""Questionnaire Eloy – Garantie homme clé et protection des associés (16/11/2026).
Reprend ce que demandent les partenaires (fiches produit, notices et CG homme clé / associés et personne clé).
Aucune question de santé : la personne assurée remplit son questionnaire de santé directement auprès de l'assureur."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Homme_Cle.pdf'))

d = Q(OUT, "Garantie homme clé et protection des associés", "Garantie homme clé")

# 1. L'entreprise
d.section("L’entreprise")
d.champ("Dénomination sociale (ou nom de l’entreprise individuelle)")
d.row([("N° SIRET", .4), ("Forme juridique", .3), ("Date de création", .3)])
d.champ("Adresse du siège")
d.row([("Code postal", .27), ("Ville", .73)])
d.champ("Activité exercée")
d.row([("Chiffre d’affaires du dernier exercice (€)", .5), ("Résultat net du dernier exercice (€)", .5)])
d.row([("Nombre de salariés", .4), ("Date d’effet souhaitée", .6)])
d.row([("Interlocuteur", .5), ("Fonction", .5)])
d.row([("Téléphone portable", .45), ("E-mail", .55)])

# 2. La formule
d.section("Ce que vous souhaitez protéger", need=150)
d.choix("Formule souhaitée", ["Garantie homme clé (capital versé à l’entreprise)",
                               "Protection des associés (rachat des parts d’un associé)",
                               "Les deux", "À me conseiller"])
d.note("Garantie homme clé : l’entreprise reçoit un capital si une personne indispensable décède ou perd toute autonomie. "
       "Protection des associés : les associés survivants reçoivent un capital pour racheter les parts de celui qui disparaît.")

# 3. Les personnes clés
d.section("La ou les personnes clés à assurer", need=230)
d.para("Une ligne par personne. Salaire annuel brut : celui de la dernière année complète. Les questions qui suivent valent pour chaque personne : "
       "si les réponses diffèrent, précisez-le dans « Informations complémentaires ».", 7.6, INK)
d.tableau(["Nom et prénom", "Date de naissance", "Fonction et rôle dans l’entreprise", "Salaire annuel brut (€)", "Fumeur (24 derniers mois)"],
          n=3, largeurs=[.24, .14, .3, .16, .16])
d.oui_non("La personne est-elle associée de l’entreprise ?", si="Si oui, pourcentage des parts détenues")
d.choix("Lieu de résidence de la personne", ["Martinique", "Guadeloupe", "Guyane"], autre="Autre")
d.oui_non("Exerce-t-elle son activité à temps plein, sans aménagement de temps ou de poste pour raison de santé ?")
d.oui_non("Pratique-t-elle un sport à risque (plongée, sports aériens, sports mécaniques, sport en compétition…) ?", si="Si oui, lequel ou lesquels")
d.oui_non("Se déplace-t-elle souvent à l’étranger pour son travail ?", si="Si oui, pays et durée des séjours")
d.zone("Pourquoi cette personne est-elle indispensable ? (clients, savoir-faire, relation avec la banque…)", h=40)

# 4. Garanties et capital
d.section("Garanties et capital", need=200)
d.champ("Capital souhaité par personne (€)")
d.liste_cases(["Je souhaite que mon conseiller m’aide à calculer le capital"])
d.choix("Garantie de base", ["Décès et perte totale d’autonomie, toutes causes", "Décès et perte totale d’autonomie par accident seulement",
                             "À me conseiller"])
d.sub("Options souhaitées", need=110)
d.liste_cases(["Invalidité permanente totale", "Revalorisation automatique du capital chaque année",
               "Capital pour la famille (capital versé aux proches, en plus de celui de l’entreprise)",
               "Garantie d’un emprunt professionnel (le capital garantit un prêt de l’entreprise)"])

# 5. Emprunt professionnel
d.section("Si le capital doit garantir un prêt professionnel", need=150)
d.row([("Banque", .5), ("Objet du prêt", .5)])
d.row([("Montant emprunté (€)", .35), ("Durée (mois)", .3), ("Date de début", .35)])
d.note("Joignez l’offre de prêt et le tableau d’amortissement. Les découverts, facilités de caisse, crédits renouvelables et prêts "
       "participatifs ne peuvent pas être garantis.")

# 6. Capital pour la famille
d.section("Si vous choisissez le capital pour la famille", need=120)
d.champ("Capital souhaité pour la famille (€)")
d.liste_cases(["À me conseiller"])
d.choix("Bénéficiaires", ["Conjoint ou partenaire de PACS", "Enfants", "Héritiers"], autre="Autre personne (nom, lien)")

# 7. Protection des associés
d.section("Si vous choisissez la protection des associés", need=200)
d.para("Une ligne par associé à assurer. Valeur des parts : estimation actuelle, à voir avec votre expert-comptable.", 7.6, INK)
d.tableau(["Nom et prénom", "Date de naissance", "Part du capital (%)", "Valeur des parts (€)", "Fumeur (24 derniers mois)"],
          n=4, largeurs=[.3, .16, .16, .2, .18])
d.oui_non("Les statuts ou un pacte d’associés prévoient-ils le rachat des parts en cas de décès d’un associé ?")
d.note("Joignez les statuts à jour de la société, avec la répartition des parts.")

# 8. Antécédents
d.section("Antécédents", need=150)
d.oui_non("L’entreprise a-t-elle déjà une garantie homme clé ou une assurance des associés ?", si="Si oui, compagnie, capital et échéance")
d.oui_non("Un assureur a-t-il déjà refusé, ajourné ou majoré une assurance décès pour l’une de ces personnes ?", si="Si oui, précisez")
d.oui_non("L’entreprise est-elle en redressement judiciaire, en procédure collective ou de sauvegarde ?")

# 9. Paiement et pièces
d.section("Paiement et documents à joindre", need=200)
d.choix("Paiement", ["Mensuel", "Trimestriel", "Semestriel", "Annuel"])
d.puces(["extrait Kbis de moins de 3 mois ;",
         "les liasses fiscales complètes des 3 derniers exercices ;",
         "la pièce d’identité de chaque personne à assurer ;",
         "pour la protection des associés : les statuts à jour ;",
         "pour un prêt garanti : l’offre de prêt et le tableau d’amortissement."])
d.note("Santé : ne joignez aucun document médical. Si l’assureur le demande, la personne assurée remplit son questionnaire de santé "
       "directement auprès de lui, en toute confidentialité.")

d.fin(maritime=False)
d.save()
print(OUT)
