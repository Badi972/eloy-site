#!/usr/bin/env python3
"""Questionnaire Eloy – RC des métiers de l'immobilier (16/11/2026).
Reprend ce que demande la tarification du contrat (voir le doc projet claude/rc-global-immo-tarification.md)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs',
                                    'Eloy_Questionnaire_RC_Metiers_Immobilier.pdf'))

d = Q(OUT, "RC des métiers de l’immobilier", "RC des métiers de l’immobilier")

# 1. L'entreprise
d.section("L’entreprise")
d.champ("Nom de la société (ou nom commercial)")
d.choix("L’entreprise est-elle en cours de création ?", ["Oui", "Non"])
d.row([("N° SIRET", .4), ("Forme juridique", .3), ("Date de création", .3)])
d.champ("Adresse du siège")
d.row([("Code postal", .27), ("Ville", .73)])
d.row([("Chiffre d’affaires annuel ou prévisionnel (€)", .55), ("Nombre de salariés", .45)])
d.row([("Date d’effet souhaitée", .5)])

# 2. Le dirigeant
d.section("Le dirigeant", need=110)
d.row([("Nom", .5), ("Prénom", .5)])
d.row([("Qualité (gérant, président…)", .5), ("Téléphone portable", .5)])
d.champ("E-mail (différent de celui du cabinet)")

# 3. Vos activités
d.section("Vos activités", need=260)
d.para("Cochez vos activités (4 au maximum dans un même contrat) et indiquez le chiffre d’affaires HT de chacune.", 7.6, INK)
d.tableau(["Activité", "Oui", "CA HT (€)"],
          lignes=["Marchand de biens", "Marchand de biens avec travaux sur la structure", "Promoteur immobilier", "Aménageur lotisseur",
                  "Diagnostiqueur immobilier", "Auditeur énergétique", "Auditeur énergétique Mon Accompagnateur Rénov’",
                  "Assistant à maîtrise d’ouvrage (AMO)", "Courtier en travaux", "Concepteur d’espaces intérieurs"],
          types=["label", "check", "text"], largeurs=[.62, .1, .28])
d.note("Marchand de biens : la rénovation légère (embellissement, mise aux normes, sans toucher à la structure) relève du marchand de biens. "
       "Dès que les travaux touchent à la structure ou aux fondations, cochez « avec travaux sur la structure ».")

d.sub("Pour tous", need=150)
d.oui_non("Réalisez-vous, suivez-vous ou réceptionnez-vous des travaux pour le compte de vos clients (maître d’œuvre, contractant général) ?")
d.oui_non("Avez-vous une activité soumise à la responsabilité décennale (conception ou réalisation d’ouvrages) ?")
d.oui_non("Avez-vous un établissement ou une filiale hors de Martinique, Guadeloupe, Guyane ou de l’Hexagone ?")
d.oui_non("Réalisez-vous du chiffre d’affaires aux États-Unis ou au Canada ?")

d.sub("Marchand de biens", need=110)
d.oui_non("Réalisez-vous vous-même tout ou partie des travaux ?")
d.oui_non("Les travaux sont-ils tous confiés à des entreprises assurées en responsabilité civile et en décennale ?")
d.oui_non("Le montant des travaux d’une opération peut-il dépasser 1 500 000 € ?")
d.champ("Surface du plus grand bâtiment sur lequel vous intervenez (m²)")

d.sub("Promoteur et aménageur lotisseur", need=110)
d.oui_non("Signez-vous des contrats de construction de maison individuelle (CCMI) ?")
d.oui_non("Construisez-vous des immeubles de logements de plus de 6 étages (au-delà de R+6) ?")
d.champ("Surface du plus grand bâtiment ou de la plus grande opération (m²)")

d.sub("Diagnostiqueur immobilier", need=170)
d.champ("Nombre de diagnostiqueurs dans votre société")
d.choix("Vos diagnostiqueurs sont-ils certifiés par un organisme accrédité COFRAC ?", ["Oui", "Démarches en cours", "Non"])
d.oui_non("Proposez-vous des travaux ou des solutions d’amélioration à vos clients ?")
d.oui_non("Souhaitez-vous l’option amiante avant travaux (repérages avant travaux ou démolition, DTA, plomb avant travaux…) ?")
d.oui_non("Souhaitez-vous l’option termites et état parasitaire (dont mérule) ?")
d.champ("Surface du plus grand bâtiment diagnostiqué (m²)")

d.sub("Auditeur énergétique", need=150)
d.choix("Qualification NF EN 16247 (OPQIBI, Qualibat, LNE ou AFNOR)", ["Oui", "En cours (sous 6 mois)", "Non"])
d.choix("Agrément Mon Accompagnateur Rénov’ (Anah)", ["Oui", "En cours (sous 6 mois)", "Non"])
d.oui_non("Réalisez-vous ou suivez-vous les travaux que vous préconisez ?")
d.oui_non("Déposez-vous des dossiers de demande d’aides au nom de vos clients (hors Mon Accompagnateur Rénov’) ?")
d.champ("Surface du plus grand bâtiment audité (m²)")

d.sub("AMO, courtier en travaux, concepteur d’espaces intérieurs", need=150)
d.oui_non("AMO : prenez-vous des décisions à la place du maître d’ouvrage, ou réalisez-vous des études techniques ?")
d.oui_non("Courtier en travaux : facturez-vous vous-même les travaux à vos clients, à la place des artisans ?")
d.oui_non("Concepteur : donnez-vous des conseils sur la structure ou réalisez-vous des missions d’architecte ?")

# 4. Antécédents
d.section("Vos antécédents", need=200)
d.oui_non("Êtes-vous actuellement assuré pour ces activités ?", si="Si oui, compagnie et échéance")
d.oui_non("Votre responsabilité a-t-elle été mise en cause au cours des 5 dernières années ?", si="Si oui, précisez")
d.oui_non("Avez-vous connaissance d’un fait ou d’une erreur qui pourrait donner lieu à une réclamation ?", si="Si oui, précisez")
d.oui_non("Un assureur a-t-il résilié l’un de vos contrats ?", si="Si oui, motif")
d.oui_non("L’entreprise est-elle en redressement judiciaire, en procédure collective ou de sauvegarde ?")

# 5. Vos choix
d.section("Vos choix", need=130)
d.choix("Niveau de garantie", ["Le plus économique", "Intermédiaire", "Le plus élevé", "À me conseiller"])
d.choix("Paiement", ["Mensuel", "Trimestriel", "Semestriel", "Annuel"])
d.choix("Protection juridique professionnelle", ["Oui", "Non", "À me conseiller"])

d.fin(maritime=False)
d.save()
print(OUT)
