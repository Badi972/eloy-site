#!/usr/bin/env python3
"""Questionnaire Eloy – Protection juridique professionnelle (16/11/2026).
Reprend les questions du questionnaire du partenaire (preneur, véhicules, intermédiation, devis récent,
contrat actuel, sinistres 36 mois, modalités, procédure collective), sans nom d'assureur."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_Protection_Juridique.pdf'))

d = Q(OUT, "Protection juridique professionnelle", "Protection juridique pro")

# 1. L'entreprise
d.section("L’entreprise")
d.row([("Nom du dirigeant", .5), ("Prénom", .5)])
d.champ("Nom de la société (ou nom commercial)")
d.row([("Forme juridique", .3), ("N° SIRET ou SIREN", .42), ("Code NAF (APE)", .28)])
d.champ("Activité exercée (précisez)")
d.row([("Chiffre d’affaires N-1, ou prévisionnel en cas de création (€)", .62), ("Nombre de salariés", .38)])
d.champ("Adresse")
d.row([("Code postal", .27), ("Ville", .73)])
d.row([("Téléphone portable", .45), ("E-mail", .55)])

# 2. Votre besoin
d.section("Votre protection juridique", need=230)
d.row([("Nombre de véhicules de société", .5)])
d.choix("Formule souhaitée", ["Essentielle", "Étendue", "À me conseiller"])
d.note("Essentielle : défense pénale de l’entreprise et de ses dirigeants, litiges commerciaux (clients, fournisseurs, sous-traitants, "
       "concurrents), conflits avec un salarié, difficultés avec les organismes sociaux, complément de vos autres assurances. "
       "Étendue : en plus, accompagnement lors d’un contrôle fiscal, recouvrement des factures impayées, transmission de l’entreprise, "
       "communication et e-réputation.")
d.oui_non("Votre activité est-elle une activité d’intermédiation (courtier, agent général, mandataire) ?")
d.oui_non("Si oui, avez-vous un seul numéro ORIAS pour vos activités de courtier et d’agent général ?")
d.oui_non("Avez-vous connaissance d’un litige en cours, ou d’un différend qui pourrait en devenir un ?", si="Si oui, précisez")

# 3. Devis récent et contrat actuel
d.section("Devis récent et contrat actuel", need=200)
d.oui_non("Avez-vous obtenu un devis de protection juridique au cours des 3 derniers mois ?")
d.row([("Si oui, nom de l’assureur", .6), ("Prime annuelle HT (€)", .4)])
d.oui_non("L’entreprise a-t-elle déjà une protection juridique professionnelle ?")
d.row([("Si oui, compagnie", .4), ("Échéance", .3), ("Prime annuelle (€)", .3)])
d.oui_non("Un assureur de protection juridique a-t-il déjà résilié l’entreprise ?", si="Si oui, pour quelles raisons")
d.oui_non("L’entreprise a-t-elle déjà été en redressement judiciaire ?")
d.oui_non("L’entreprise est-elle aujourd’hui en procédure collective (liquidation, redressement judiciaire, plan de sauvegarde) ?")

# 4. Sinistres
d.section("Sinistres des 36 derniers mois", need=200)
d.choix("Nombre de sinistres déclarés", ["0", "1", "2", "3", "4", "5", "Plus de 5"])
d.tableau(["Nature du sinistre", "Année", "Coût (€)"], n=5, largeurs=[.6, .15, .25])

# 5. Le nouveau contrat
d.section("Le nouveau contrat", need=130)
d.row([("Date d’effet souhaitée", .5), ("Échéance principale souhaitée", .5)])
d.choix("Paiement", ["Annuel", "Semestriel", "Trimestriel", "Mensuel"])
d.note("Paiement semestriel, trimestriel ou mensuel : selon le contrat, par prélèvement.")

# 6. Documents
d.section("Documents à joindre", need=110)
d.puces(["extrait Kbis de moins de 3 mois ;",
         "si vous êtes déjà assuré : la copie du contrat actuel et le tableau des garanties ;",
         "le relevé de sinistralité des 36 derniers mois."])

d.fin(maritime=False)
d.save()
print(OUT)
