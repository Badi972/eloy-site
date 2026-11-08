#!/usr/bin/env python3
"""Questionnaire Eloy – Responsabilité civile des autorités portuaires."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eloyq import Q, X0, X1, CW, RH, ROWLINE, INK, sw, wrap

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dist', 'docs', 'Eloy_Questionnaire_Autorites_Portuaires.pdf')
OUT = os.path.normpath(OUT)


# --- petites aides locales (eloyq.py n'a pas de liste à cocher indentée ni de ligne case + champs) ---
def cases(d, items, ind=0):
    """Cases à cocher l'une sous l'autre, avec retrait (sous-éléments)."""
    for it in items:
        lines = wrap(it, 'PJ-Regular', 8, CW - ind - 40)
        d.ensure(17 + (len(lines) - 1) * 9.6)
        d._cb(it, X0 + 10 + ind, d.y - 1)
        for k, ln in enumerate(lines):
            d._label(ln, X0 + 24 + ind, d.y - k * 9.6, 'PJ-Regular')
        yl = d.y - 6 - (len(lines) - 1) * 9.6
        d.c.setStrokeColor(ROWLINE); d.c.setLineWidth(.6); d.c.line(X0 + ind, yl, X1, yl)
        d.y -= 17 + (len(lines) - 1) * 9.6
    d.y -= 4


def ligne(d, parts, ind=0):
    """Une ligne composée de cases ('cb', libellé, part) et de champs ('tf', libellé, part)."""
    d.ensure(RH)
    x0 = X0 + 10 + ind; avail = X1 - x0; x = x0
    for kind, lab, frac in parts:
        end = x + avail * frac
        if kind == 'cb':
            d._cb(lab, x, d.y - 1); d._label(lab, x + 12.6, d.y, 'PJ-Regular')
        else:
            t = lab + ' :'; d._label(t, x, d.y, 'PJ-Regular'); fx = x + sw(t, 'PJ-Regular') + 6
            d._tf(lab, fx, d.y - 4.1, end - fx - 10)
        x = end
    d.y -= RH - 2


d = Q(OUT, "Responsabilité civile des autorités portuaires", "Autorités portuaires")

# 1
d.demandeur()

# 2
d.section("Références financières", need=170)
d.tableau(["Exercice", "Chiffre d’affaires TTC (€)", "Masse salariale brute (€)"],
          lignes=["Année N-2", "Année N-1", "Année en cours (N) – estimation", "Année N+1 – estimation"],
          largeurs=[.36, .32, .32])
d.para("Joignez le bilan de l’année écoulée (pour les entreprises privées).", 7.6, INK)

# 3
d.section("Détail des activités exercées", need=200)
d.para("Cochez les cases correspondant à votre activité.")
cases(d, ["Gestion et aménagement du domaine immobilier à l’intérieur de la circonscription portuaire :"])
cases(d, ["mise à disposition et entretien d’appontements, quais, docks, slipways et postes de mouillage ;",
          "mise à disposition et entretien de terminaux à passagers ;",
          "mise à disposition et entretien de bâtiments, magasins et installations portuaires ;",
          "mise à disposition et entretien d’infrastructures routières et ferroviaires à l’intérieur de la zone portuaire ;",
          "mise à disposition et entretien de bassins, de cales sèches et de formes de radoub ; police et entretien des aménagements et accès au port."],
      ind=20)
cases(d, ["Réalisation de travaux portuaires et création ou aménagement de zones industrielles portuaires ou de plaisance.",
          "Gestion de l’outillage public portuaire :"])
cases(d, ["installation et exploitation par le port autonome lui-même ;",
          "concession ou autorisation d’outillage privé donnée à des utilisateurs portuaires."], ind=20)
cases(d, ["Mission de police spéciale de conservation et d’exploitation des ports.",
          "Gestion de services publics connexes :"])
cases(d, ["fourniture et entretien de dispositifs d’aide à la navigation à l’intérieur du port ou dans ses accès ;",
          "fourniture et entretien de bouées et feux de signalisation des chenaux, épaves et obstructions à la navigation ;",
          "fourniture de renseignements et d’avis pour la navigation ; fourniture de pilotes ou d’un service de pilotage ;",
          "police et surveillance des quais ; contrôle des mouvements, mouillages et ancrages du trafic maritime ;",
          "fourniture de services de sécurité, de lutte contre l’incendie, d’opérations de secours, d’ambulance et de premiers soins."],
      ind=20)
cases(d, ["Conseil :"])
cases(d, ["activité d’assistance technique ou de conseil à l’exploitation, l’organisation ou la restructuration des ports."], ind=20)
ligne(d, [('cb', "Autres", .16), ('tf', "À préciser", .84)], ind=0)

# 4
d.section("Trafic des ports de commerce", need=190)
cases(d, ["Marchandises"])
ligne(d, [('cb', "Vracs liquides", .24), ('tf', "Tonnes", .26), ('tf', "dont produits pétroliers (tonnes)", .5)], ind=20)
ligne(d, [('cb', "Vracs solides", .24), ('tf', "Tonnes", .26), ('tf', "dont produits alimentaires (tonnes)", .5)], ind=20)
ligne(d, [('cb', "Conventionnelles", .24), ('tf', "Tonnes", .26)], ind=20)
ligne(d, [('cb', "Véhicules roulants", .24), ('tf', "Nombre", .26), ('tf', "dont ferries", .5)], ind=20)
d.espace(4)
cases(d, ["Passagers"])
ligne(d, [('cb', "dont croisières", .24), ('tf', "Nombre", .26), ('tf', "dont ferries (nombre)", .5)], ind=20)

# 5
d.section("Autres activités portuaires", need=200)
ligne(d, [('cb', "Port de pêche", .24), ('tf', "Tonnes", .4), ('cb', "Criée", .36)])
ligne(d, [('cb', "Port de plaisance", .24), ('tf', "Anneaux", .4), ('cb', "Sous-traité / concédé", .36)])
ligne(d, [('cb', "Arsenal", 1)])
ligne(d, [('cb', "Réparation navale :", 1)])
ligne(d, [('cb', "Gestion de cale de halage, élévateur / ascenseur à bateaux, dock flottant", .72), ('cb', "Activité sous-traitée", .28)], ind=20)
ligne(d, [('tf', "Conditions de sous-traitance", 1)], ind=32)
ligne(d, [('cb', "Mise à disposition d’engins d’assèchement (grues)", .72), ('cb', "Activité sous-traitée", .28)], ind=20)
ligne(d, [('tf', "Conditions de sous-traitance", 1)], ind=32)
ligne(d, [('cb', "Services portuaires :", 1)])
ligne(d, [('cb', "Pilotage", .25), ('cb', "Remorquage", .25), ('cb', "Lamanage", .25), ('cb', "Dragage", .25)], ind=20)

# 6
d.section("Autres activités consulaires", need=120)
d.para("Réservé aux collectivités locales en charge d’une concession du domaine public portuaire.")
cases(d, ["Conseil et soutien à la création, à l’installation et au développement d’entreprises industrielles",
          "Formation, écoles"])
d.row([("Nombre d’élèves", .26), ("Chiffre d’affaires spécifique (€)", .46), ("Pour l’année", .28)])

# 7
d.section("Mise à disposition des installations et de l’outillage portuaire", need=110)
d.para("Joignez une copie des conditions de mise à disposition :", 7.6, INK)
d.puces(["des installations portuaires : hangars, entrepôts, silos, terre-pleins, postes à quai ;",
         "de l’outillage destiné au chargement et au déchargement des navires ;",
         "de l’outillage destiné à la réparation navale."])
d.para("Joignez également la liste des installations et outillages exploités par le port et/ou mis à disposition des usagers du port.",
       7.6, INK)

# 8
d.section("Historique et statistiques", need=180)
d.oui_non("Les risques faisant l’objet du présent questionnaire ont-ils déjà été assurés ?")
d.row([("Auprès de quelle(s) compagnie(s)", .62), ("Date d’échéance", .38)])
d.champ("Numéro(s) de police(s)")
d.champ("Limites de garantie")
d.champ("Montant des franchises")
d.champ("Motif de la résiliation, le cas échéant")
d.sub("Statistiques des 5 dernières années", need=60)
d.para("Joignez la liste des primes payées, des sinistres payés et des sinistres en prévision (provisions) des cinq dernières années, "
       "en précisant la nature de l’événement et les montants. L’assureur se réserve le droit de vous demander, le cas échéant, des "
       "informations plus détaillées sur la nature, l’origine et l’importance des sinistres par année d’assurance.", 7.6, INK)

# 9
d.section("Autres risques", need=170)
d.para("Indiquez le nom de l’assureur qui couvre vos risques d’incendie et de dégâts des eaux :", 7.6, INK)
d.tableau(["Risque", "Couvert", "Compagnie d’assurance", "Montant des capitaux couverts (€, facultatif)"],
          lignes=["Incendie", "Dégâts des eaux"], types=['label', 'check', 'text', 'text'], largeurs=[.2, .1, .38, .32])
d.sub("Statistiques des 3 dernières années", need=60)
d.para("Joignez la liste des primes payées, des sinistres payés et des sinistres en prévision (provisions) des trois dernières années, "
       "en précisant la nature de l’événement et les montants. L’assureur se réserve le droit de vous demander, le cas échéant, des "
       "informations plus détaillées sur la nature, l’origine et l’importance des sinistres par année d’assurance.", 7.6, INK)

# 10
d.section("Garanties demandées", need=200)
cases(d, ["Responsabilité civile générale du port",
          "Responsabilité civile générale des usagers du port dans le cadre de l’utilisation de l’outillage mis à leur disposition par le port",
          "Assurance des cotisations complémentaires dues au titre des accidents du travail et/ou des maladies professionnelles"])
d.row([("Date d’effet demandée", .5)])
d.zone("Observations", h=44)
d.oui_non("Vous déclarez exercer vos activités dans le strict respect du décret n° 66-1078 du 31 décembre 1966 sur les contrats "
          "d’affrètement et de transport maritimes et de la loi n° 69-8 du 3 janvier 1969 relative à l’armement et aux ventes maritimes, "
          "ainsi que de son décret d’application n° 69-679 du 19 juin 1969, à l’exclusion de tout autre régime et sans dérogation à "
          "leurs dispositions :")

d.fin()
print(OUT, d.save())
