#!/usr/bin/env python3
"""Questionnaire Eloy – Assurance dommages-ouvrage, pré-étude (mêmes questions que le questionnaire en ligne
?questionnaire=dommagesouvrage de tools/questionnaires.json, avec la rubrique « Garanties souhaitées »)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, INK

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, 'dist', 'docs', 'Eloy_Questionnaire_Dommages_Ouvrage_Pre-etude.pdf')
QJ = json.load(open(os.path.join(ROOT, 'tools', 'questionnaires.json'), encoding='utf-8'))['dommagesouvrage']
GAR = [s for s in QJ['sections'] if s['t'] == 'Garanties souhaitées'][0]

d = Q(OUT, "Assurance dommages-ouvrage – pré-étude", "Dommages-ouvrage – pré-étude", intro=[
    ("Ce questionnaire permet de réaliser une ", 0), ("pré-étude", 1),
    (" : le tarif est confirmé après l’étude complète du dossier dommages-ouvrage. À retourner complété à ", 0),
    ("eloy.assurances@gmail.com", 1), (". Les cases bleues se remplissent directement sur ordinateur.", 0)])

# 1
d.section("Le souscripteur (maître d’ouvrage)", need=230)
d.choix("Vous êtes", ["Un particulier", "Une société (SCI, entreprise, promoteur…)"])
d.row([("Raison sociale (société)", .6), ("N° SIREN", .4)])
d.row([("Nom", .5), ("Prénom", .5)])
d.row([("Date de naissance", .32), ("Ville de naissance", .36), ("Pays de naissance", .32)])
d.champ("Date d’effet souhaitée")
d.champ("Profession")
d.champ("Adresse")
d.champ("Complément d’adresse")
d.row([("Code postal", .3), ("Ville", .7)])
d.row([("Téléphone", .4), ("E-mail", .6)])

# 2
d.section("Le chantier", need=150)
d.oui_non("L’adresse du chantier est-elle la même que la vôtre ?")
d.champ("Si non, adresse du chantier")
d.row([("Code postal du chantier", .35), ("Ville du chantier", .65)])
d.row([("N° de permis de construire (si vous l’avez)", .55), ("Nom du programme", .45)])

# 3
d.section("Le bâtiment", need=200)
d.choix("Type de travaux", ["Construction neuve", "Extension", "Rénovation", "Extension et rénovation"])
d.para("Type de construction :", 8, INK, 'PJ-Medium')
d.choix("", ["Maison individuelle", "Maison jumelée", "Maison en bande accolée", "Maison individuelle en ossature bois"])
d.choix("", ["Immeuble d’habitation", "Immeuble professionnel", "Immeuble mixte", "Commerces", "Bâtiment industriel", "Bâtiment public"])
d.row([("Superficie totale (m²)", .5), ("Surface existante (m²)", .5)])
d.row([("Valeur des existants à garantir (€) – extension ou rénovation", 1)])
d.choix("Pente du terrain", ["Inférieure à 15 %", "Entre 15 % et 30 %", "Entre 30 % et 40 %", "Supérieure à 40 %"])
d.oui_non("Le chantier est-il situé à moins de 300 mètres des côtes ?")
d.row([("Distance du chantier par rapport à la mer, jusqu’au rivage le plus proche (m)", 1)])

# 4
d.section("Détails de la construction", need=170)
d.row([("Nombre de bâtiments", .34), ("Nombre d’habitations", .33), ("Nombre de locaux pro", .33)])
d.row([("Nombre de piscines", .34), ("Niveaux de sous-sol", .33), ("Nombre d’étages", .33)])
d.choix("La construction est destinée à", ["Vente", "Location", "Habitation principale / secondaire", "Exploitation directe"])
d.choix("Type de finition", ["Fini habitable", "Clos et couvert"])

# 5
d.section("Intervenants et situation du terrain", need=130)
d.oui_non("Un maître d’œuvre ou un architecte intervient-il sur le chantier ?")
d.oui_non("Une étude de sol (G2) a-t-elle été réalisée ?")
d.oui_non("Les travaux ont-ils déjà été réceptionnés ?")
d.oui_non("L’ouvrage est-il inscrit ou classé monument historique ?")

# 6
d.section("Coût et calendrier des travaux", need=110)
d.row([("Coût total de la construction, honoraires compris (€)", .7)])
d.choix("Ce montant est", ["TTC", "HT"])
d.row([("Date d’ouverture de chantier (DOC)", .5), ("Date de réception prévue", .5)])

# 7 – garanties : mêmes textes que le questionnaire en ligne
d.section("Garanties souhaitées", need=200)
d.note(GAR['d'])
d.espace(4)
for f in GAR['f']:
    d.ensure(70)
    d.sub(f['l'] + (" (extension ou rénovation)" if f.get('show') else ""), need=70)
    d.para(f['h'], 7.6)
    d.choix("", f['o'])

# 8
d.section("Précisions éventuelles", need=140)
d.zone("Informations utiles à l’étude de votre dossier", h=60)

# Protection des données et déclaration (sans signature : décision de Bradley du 08/11/2026)
d.section("Protection des données personnelles", need=150)
d.para("Les informations de ce questionnaire sont recueillies par Eloy Assurances Patrimoine, courtier en assurance, pour étudier votre besoin, "
       "consulter les compagnies d’assurance, vous transmettre une proposition puis gérer votre contrat. Elles sont communiquées aux seules "
       "compagnies d’assurance consultées pour votre dossier. Elles sont conservées le temps de la relation commerciale, puis pendant les délais "
       "de prescription légaux. Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité : "
       "eloy.assurances@gmail.com, avec un justificatif d’identité. Vous pouvez aussi saisir la CNIL (www.cnil.fr).", 7.6, INK)
d.section("Déclaration", need=110)
d.para("Ce questionnaire sert à réaliser une pré-étude. Il n’engage ni l’assureur ni le demandeur : la garantie ne prend effet qu’après acceptation "
       "de l’assureur, sur la base du dossier complet. Toute réticence ou fausse déclaration intentionnelle entraîne la nullité du contrat "
       "(article L. 113-8 du Code des assurances) ; une omission ou une déclaration inexacte peut entraîner une réduction des indemnités "
       "(article L. 113-9).", 7.6, INK)
print(OUT, d.save(), 'pages')
