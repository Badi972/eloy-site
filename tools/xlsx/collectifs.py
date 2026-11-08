"""Tableaux Excel joints aux mails « mutuelle santé collective » et « prévoyance collective ».
python3 tools/xlsx/collectifs.py  ->  dist/docs/Eloy_Mutuelle_collective_liste_salaries.xlsx
                                       dist/docs/Eloy_Prevoyance_collective_liste_salaries.xlsx
Cases bleu clair = à remplir ; orange = manquante ; ligne d'exemple grisée non comptée ; 200 salariés."""
import os
from PIL import Image
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XImg
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as L

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
SORTIE = os.path.join(RACINE, 'dist', 'docs')
LOGO = os.path.join(RACINE, 'tools', 'pdfq', 'assets', 'logo-bleu.png')

ENCRE, BLEU, CASE, ORANGE, GRIS = '0B1220', '1B66F7', 'EAF1FE', 'FFD8B5', 'EEEEEE'
FONT = 'Arial'
fin = Side(style='thin', color='C9D6EE')
BORD = Border(left=fin, right=fin, top=fin, bottom=fin)
N = 200          # salariés
D1, D2 = 7, 6 + N  # lignes de données (ligne 6 = exemple)

def f(bold=False, size=10, color=ENCRE, italic=False):
    return Font(name=FONT, bold=bold, size=size, color=color, italic=italic)

def logo(ws):
    tmp = os.path.join(SORTIE, '.logo_xlsx.png')
    im = Image.open(LOGO); im.thumbnail((240, 122)); im.save(tmp)
    x = XImg(tmp); x.width, x.height = 94, 48
    ws.add_image(x, 'A1')
    return tmp

def liste(ws, cellules, choix):
    dv = DataValidation(type='list', formula1='"' + ','.join(choix) + '"', allow_blank=True)
    dv.error, dv.errorTitle = 'Choisissez une valeur dans la liste.', 'Valeur'
    ws.add_data_validation(dv); dv.add(cellules)

def impression(ws, sens):
    ws.page_setup.orientation = sens
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0

def entete(ws, titre, sous):
    ws.row_dimensions[1].height = 22; ws.row_dimensions[2].height = 22
    ws['C1'] = titre; ws['C1'].font = f(True, 15)
    ws['C2'] = sous; ws['C2'].font = f(False, 9.5, '5B6478')
    ws['C3'] = 'Cases bleu clair : à remplir.  Cases orange : information manquante.'
    ws['C3'].font = f(False, 9.5, BLEU, True)

# ---------- Onglet « 1 - Entreprise » ----------
def onglet_entreprise(wb, titre, blocs, recap):
    ws = wb.active; ws.title = '1 - Entreprise'
    ws.sheet_view.showGridLines = False
    ws.column_dimensions['A'].width = 3; ws.column_dimensions['B'].width = 54; ws.column_dimensions['C'].width = 44
    entete(ws, titre, 'Eloy · courtier en assurances · eloy.assurances@gmail.com · 06 96 33 29 09')
    r = 5; requis = []
    for nom, champs in blocs:
        ws.cell(r, 2, nom).font = f(True, 11, BLEU); r += 1
        for c in champs:
            lab, typ = c[0], c[1]
            obligatoire = len(c) < 3 or c[2]
            ws.cell(r, 2, lab + (' *' if obligatoire else '')).font = f()
            ws.cell(r, 2).alignment = Alignment(vertical='center', wrap_text=True)
            v = ws.cell(r, 3); v.fill = PatternFill('solid', fgColor=CASE); v.border = BORD; v.font = f(True)
            v.alignment = Alignment(vertical='center', wrap_text=True)
            if isinstance(typ, list): liste(ws, v.coordinate, typ)
            elif typ == 'date': v.number_format = 'DD/MM/YYYY'
            elif typ == 'euros': v.number_format = '#,##0 €'
            elif typ == 'texte': v.number_format = '@'
            if obligatoire: requis.append(v.coordinate)
            ws.row_dimensions[r].height = 20; r += 1
        r += 1
    for c in requis:
        ws.conditional_formatting.add(c, FormulaRule(formula=['ISBLANK(' + c + ')'], fill=PatternFill('solid', fgColor=ORANGE)))
    ws.cell(r, 2, 'Récapitulatif (calculé à partir de l\'onglet « 2 - Salariés »)').font = f(True, 11, BLEU); r += 1
    for lab, formule, fmt in recap:
        ws.cell(r, 2, lab).font = f()
        v = ws.cell(r, 3, formule); v.font = f(True); v.fill = PatternFill('solid', fgColor='F4F6FA'); v.border = BORD
        if fmt: v.number_format = fmt
        r += 1
    ws.cell(r, 2, 'Cases manquantes dans cet onglet').font = f()
    v = ws.cell(r, 3, '=' + '+'.join('IF(ISBLANK(%s),1,0)' % c for c in requis)); v.font = f(True); v.border = BORD
    ws.conditional_formatting.add(v.coordinate, FormulaRule(formula=[v.coordinate + '>0'], fill=PatternFill('solid', fgColor=ORANGE)))
    r += 2
    ws.cell(r, 2, 'Une fois complété, renvoyez simplement ce fichier en réponse à mon mail.').font = f(False, 9.5, '5B6478', True)
    ws.freeze_panes = 'A5'
    impression(ws, 'portrait')
    return ws

# ---------- Onglet « 2 - Salariés » ----------
def onglet_salaries(wb, titre, cols, manquantes_extra=()):
    """cols : (titre, largeur, type, obligatoire, exemple). type : list | 'date' | 'euros' | 'nombre' | 'texte' | ('formule', modele)"""
    ws = wb.create_sheet('2 - Salariés')
    ws.sheet_view.showGridLines = False
    entete(ws, titre, 'Une ligne par salarié, à partir de la ligne 7. La ligne grisée est un exemple : elle n\'est pas comptée.')
    for j, (t, w, typ, obl, ex) in enumerate(cols, 1):
        col = L(j); ws.column_dimensions[col].width = w
        h = ws.cell(5, j, t + (' *' if obl else '')); h.font = f(True, 9.5, 'FFFFFF')
        h.fill = PatternFill('solid', fgColor=BLEU); h.alignment = Alignment(wrap_text=True, vertical='center', horizontal='center'); h.border = BORD
        e = ws.cell(6, j, ex); e.font = f(False, 9, '888888', True); e.fill = PatternFill('solid', fgColor=GRIS); e.border = BORD
        rng = '%s%d:%s%d' % (col, D1, col, D2)
        if isinstance(typ, tuple):
            for i in range(D1, D2 + 1):
                c = ws.cell(i, j, typ[1].format(r=i)); c.font = f(); c.border = BORD; c.fill = PatternFill('solid', fgColor='F4F6FA')
            ws.cell(6, j, typ[1].format(r=6))
            continue
        for i in range(D1, D2 + 1):
            c = ws.cell(i, j); c.fill = PatternFill('solid', fgColor=CASE); c.border = BORD; c.font = f()
            if typ == 'date': c.number_format = 'DD/MM/YYYY'
            elif typ == 'euros': c.number_format = '#,##0 €'
            elif typ == 'texte': c.number_format = '@'
        if typ == 'date': ws.cell(6, j).number_format = 'DD/MM/YYYY'
        if typ == 'euros': ws.cell(6, j).number_format = '#,##0 €'
        if isinstance(typ, list): liste(ws, rng, typ)
        if obl:
            ws.conditional_formatting.add(rng, FormulaRule(formula=['AND($A%d<>"",ISBLANK(%s%d))' % (D1, col, D1)], fill=PatternFill('solid', fgColor=ORANGE)))
    for col, cond in manquantes_extra:
        rng = '%s%d:%s%d' % (col, D1, col, D2)
        ws.conditional_formatting.add(rng, FormulaRule(formula=['AND($A%d<>"",%s,ISBLANK(%s%d))' % (D1, cond.format(r=D1), col, D1)], fill=PatternFill('solid', fgColor=ORANGE)))
    ws.row_dimensions[5].height = 42
    ws.freeze_panes = 'C7'
    impression(ws, 'landscape')
    return ws

def manquantes(cols, extra=()):
    """Formule : nombre de cases obligatoires vides sur les lignes remplies (colonne A = nom)."""
    parts = []
    for j, (t, w, typ, obl, ex) in enumerate(cols, 1):
        if obl and j > 1 and not isinstance(typ, tuple):
            parts.append("SUMPRODUCT(('2 - Salariés'!$A${a}:$A${b}<>\"\")*('2 - Salariés'!{c}${a}:{c}${b}=\"\"))".format(a=D1, b=D2, c=L(j)))
    for col, cond in extra:
        parts.append("SUMPRODUCT(('2 - Salariés'!$A${a}:$A${b}<>\"\")*({k})*('2 - Salariés'!{c}${a}:{c}${b}=\"\"))".format(
            a=D1, b=D2, c=col, k=cond))
    return '=' + '+'.join(parts)

S = "'2 - Salariés'!"
def plage(c): return "%s$%s$%d:$%s$%d" % (S, c, D1, c, D2)
NB = '=COUNTA(%s)' % plage('A')
TERR = ['Martinique', 'Guadeloupe', 'Guyane']
CAT = ['Cadre', 'Non-cadre']
CONTRAT = ['CDI', 'CDD', 'Apprentissage', 'Contrat de professionnalisation', 'Autre']
TEMPS = ['Temps plein', 'Temps partiel']
FAM = ['Célibataire', 'Marié ou pacsé', 'Concubinage', 'Divorcé ou séparé', 'Veuf']
OUINON = ['Oui', 'Non']

IDENTITE = ('Votre entreprise', [
    ('Raison sociale', 'texte'), ('SIREN', 'texte'), ('Code NAF', 'texte', False),
    ('Adresse', 'texte'), ('Code postal et ville', 'texte'), ('Territoire', TERR),
    ('Dirigeant (nom et prénom)', 'texte'), ('Téléphone', 'texte'), ('E-mail', 'texte'),
    ('Convention collective (intitulé)', 'texte'), ('Code IDCC (sur la fiche de paie)', 'texte'),
])

def mutuelle():
    wb = Workbook()
    cols = [
        ('Nom', 18, 'texte', True, 'DUPONT'), ('Prénom', 14, 'texte', True, 'Marie'),
        ('Date de naissance', 13, 'date', True, '12/04/1985'), ('Catégorie', 12, CAT, True, 'Non-cadre'),
        ('Contrat', 15, CONTRAT, True, 'CDI'), ('Date d\'entrée', 13, 'date', True, '01/09/2021'),
        ('Temps de travail', 13, TEMPS, True, 'Temps plein'), ('Adhésion ou dispense', 14, ['Adhère', 'Dispense'], True, 'Adhère'),
        ('Motif de la dispense', 30, ['Déjà couvert par ailleurs (conjoint, autre employeur)', 'CDD ou contrat court', 'Apprenti',
                                      'Temps partiel', 'Bénéficiaire de la C2S', 'Contrat individuel en cours', 'Autre'], False, ''),
        ('Situation familiale', 15, FAM, True, 'Marié ou pacsé'),
        ('Couverture souhaitée', 17, ['Salarié seul', 'Salarié + conjoint', 'Salarié + enfants', 'Famille'], True, 'Famille'),
        ('Date de naissance du conjoint couvert', 15, 'date', False, '03/02/1984'),
        ('Nombre d\'enfants à couvrir', 11, 'nombre', False, 2),
    ]
    extra_f = [('I', "('2 - Salariés'!$H$%d:$H$%d=\"Dispense\")" % (D1, D2))]
    onglet_entreprise(wb, 'Mutuelle santé collective', [
        IDENTITE,
        ('Votre projet', [
            ('Date d\'effet souhaitée', 'date'),
            ('Salariés à couvrir', ['Tous les salariés', 'Cadres uniquement', 'Non-cadres uniquement', 'Cadres et non-cadres, chacun leur contrat']),
            ('Couverture de la famille', ['Salarié seul', 'Famille obligatoire', 'Salarié seul, famille en option']),
            ('Part payée par l\'employeur', ['50 %', '60 %', '70 %', '80 %', '100 %', 'Autre']),
        ]),
        ('Votre contrat actuel', [
            ('Avez-vous déjà une mutuelle d\'entreprise ?', OUINON),
            ('Assureur actuel', 'texte', False),
            ('Cotisation mensuelle actuelle (total)', 'euros', False),
        ]),
    ], [
        ('Nombre de salariés listés', NB, None),
        ('dont cadres', '=COUNTIF(%s,"Cadre")' % plage('D'), None),
        ('dont non-cadres', '=COUNTIF(%s,"Non-cadre")' % plage('D'), None),
        ('Salariés qui adhèrent', '=COUNTIF(%s,"Adhère")' % plage('H'), None),
        ('Salariés en dispense', '=COUNTIF(%s,"Dispense")' % plage('H'), None),
        ('Conjoints à couvrir', '=COUNTIF(%s,"Salarié + conjoint")+COUNTIF(%s,"Famille")' % (plage('K'), plage('K')), None),
        ('Enfants à couvrir', '=SUM(%s)' % plage('M'), None),
        ('Âge moyen des salariés', '=IFERROR(SUMPRODUCT((%s<>"")*(TODAY()-%s))/365.25/COUNT(%s),"")' % (plage('C'), plage('C'), plage('C')), '0.0'),
        ('Cases manquantes dans l\'onglet « 2 - Salariés »', manquantes(cols, extra_f), None),
    ])
    onglet_salaries(wb, 'Mutuelle santé collective : liste des salariés', cols, [('I', '$H{r}="Dispense"')])
    wb.active = 0
    return wb, 'Eloy_Mutuelle_collective_liste_salaries.xlsx'

def prevoyance():
    wb = Workbook()
    age = ('formule', '=IF(C{r}="","",DATEDIF(C{r},TODAY(),"Y"))')
    cols = [
        ('Nom', 18, 'texte', True, 'DUPONT'), ('Prénom', 14, 'texte', True, 'Marie'),
        ('Date de naissance', 13, 'date', True, '12/04/1985'), ('Âge', 7, age, False, ''),
        ('Catégorie', 12, CAT, True, 'Non-cadre'), ('Sexe', 8, ['F', 'H'], True, 'F'),
        ('Contrat', 15, CONTRAT, True, 'CDI'), ('Date d\'entrée', 13, 'date', True, '01/09/2021'),
        ('Salaire brut annuel', 14, 'euros', True, 28000),
        ('Arrêt de travail ou invalidité en cours', 18, ['Non', 'Arrêt de travail', 'Invalidité'], True, 'Non'),
        ('Depuis le', 13, 'date', False, ''),
        ('Temps de travail', 13, TEMPS, True, 'Temps plein'), ('Situation familiale', 15, FAM, True, 'Marié ou pacsé'),
        ('Enfants à charge', 10, 'nombre', True, 2),
    ]
    extra_f = [('K', "('2 - Salariés'!$J$%d:$J$%d<>\"Non\")*('2 - Salariés'!$J$%d:$J$%d<>\"\")" % (D1, D2, D1, D2))]
    onglet_entreprise(wb, 'Prévoyance collective', [
        IDENTITE,
        ('Votre projet', [
            ('Date d\'effet souhaitée', 'date'),
            ('Salariés à couvrir', ['Tous les salariés', 'Cadres uniquement', 'Non-cadres uniquement', 'Cadres et non-cadres, chacun leur contrat']),
            ('Votre convention collective impose-t-elle une prévoyance ?', ['Oui', 'Non', 'Je ne sais pas']),
            ('Part payée par l\'employeur', ['50 %', '60 %', '70 %', '80 %', '100 %', 'Autre']),
        ]),
        ('Votre contrat actuel', [
            ('Avez-vous déjà une prévoyance d\'entreprise ?', OUINON),
            ('Assureur actuel', 'texte', False),
            ('Cotisation annuelle actuelle (total)', 'euros', False),
            ('Nombre de sinistres indemnisés sur les 3 dernières années', 'nombre', False),
        ]),
    ], [
        ('Nombre de salariés listés', NB, None),
        ('dont cadres', '=COUNTIF(%s,"Cadre")' % plage('E'), None),
        ('dont non-cadres', '=COUNTIF(%s,"Non-cadre")' % plage('E'), None),
        ('Masse salariale brute annuelle des cadres', '=SUMIF(%s,"Cadre",%s)' % (plage('E'), plage('I')), '#,##0 €'),
        ('Masse salariale brute annuelle des non-cadres', '=SUMIF(%s,"Non-cadre",%s)' % (plage('E'), plage('I')), '#,##0 €'),
        ('Âge moyen des salariés', '=IFERROR(AVERAGE(%s),"")' % plage('D'), '0.0'),
        ('Salariés en arrêt de travail ou en invalidité', '=COUNTIF(%s,"Arrêt de travail")+COUNTIF(%s,"Invalidité")' % (plage('J'), plage('J')), None),
        ('Cases manquantes dans l\'onglet « 2 - Salariés »', manquantes(cols, extra_f), None),
    ])
    onglet_salaries(wb, 'Prévoyance collective : liste des salariés', cols, [('K', 'OR($J{r}="Arrêt de travail",$J{r}="Invalidité")')])
    wb.active = 0
    return wb, 'Eloy_Prevoyance_collective_liste_salaries.xlsx'

if __name__ == '__main__':
    os.makedirs(SORTIE, exist_ok=True)
    tmp = None
    for fn in (mutuelle, prevoyance):
        wb, nom = fn()
        for ws in wb.worksheets: tmp = logo(ws)
        wb.save(os.path.join(SORTIE, nom)); print(nom)
    if tmp and os.path.exists(tmp): os.remove(tmp)
