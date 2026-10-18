#!/usr/bin/env python3
"""Donnees structurees (schema.org) ecrites en dur dans Webflow :
 - tools/site_ld.json : fiche du cabinet (code <head> du site, toutes les pages)
 - tools/services_ld.json : service decrit sur chaque page de rubrique (repris par le script SEO du site)
Usage : python3 tools/seo_ld.py dump.json"""
import json, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
U = 'https://www.eloy-assurances-patrimoine.fr'
R = json.load(open(os.path.join(ROOT, 'tools', 'routes.json')))['tok']
P = json.load(open(sys.argv[1]))['P']
EID = {'@id': U + '/#eloy'}
AREA = [{'@type': 'AdministrativeArea', 'name': n} for n in ('Martinique', 'Guadeloupe', 'Guyane')]
LOGO = 'https://cdn.jsdelivr.net/gh/Badi972/eloy-site@5879d0b29adc76b68059f8d8b564c91e8a67722a/dist/img/df26dedc632f.png'
GROUPS = [
    ('assur-pro', 'Assurances professionnelles', 'Courtage en assurance', '/assurances/professionnels',
     "Assurances des entreprises, des indépendants et des dirigeants en Martinique, Guadeloupe et Guyane : responsabilité civile professionnelle, décennale, RC des mandataires sociaux, protection juridique, cyber, maritime, transport, santé et prévoyance.",
     ['rcpro', 'decennale', 'rcms', 'pjpro', 'cyber', 'maritime', 'transporteur', 'marchandises', 'santetns', 'prevdirigeant', 'collective', 'prevcollective', 'hommecle']),
    ('assur-part', 'Assurances des particuliers', 'Courtage en assurance', '/assurances/particuliers',
     "Assurances des particuliers en Martinique, Guadeloupe et Guyane : habitation, moto, dommages-ouvrage, assurance emprunteur, mutuelle santé, assurance décès et obsèques.",
     ['habitation', 'moto', 'dommageouvrage', 'emprunteur', 'sante', 'deces', 'obseques']),
    ('credit', 'Rachat de crédits', 'Rachat et regroupement de crédits', '/credits/rachat',
     "Rachat et regroupement de crédits à la consommation et immobiliers, avec ou sans garantie hypothécaire, pour les particuliers de Martinique, Guadeloupe et Guyane : une seule mensualité adaptée au budget.",
     []),
    ('pro', 'Financement professionnel', 'Financement de matériel professionnel', '/financement-pro',
     "Financement du matériel des entreprises de Martinique, Guadeloupe et Guyane par crédit-bail et défiscalisation Girardin industriel.",
     ['creditbail', 'girardin']),
    ('patri', 'Épargne et retraite', 'Conseil en épargne et retraite', '/patrimoine',
     "Assurance vie et plan d'épargne retraite (PER) pour épargner, préparer sa retraite et transmettre, en Martinique, Guadeloupe et Guyane.",
     ['vie', 'per']),
]
SV = {}
for key, name, stype, path, desc, items in GROUPS:
    s = {'@type': 'FinancialService' if key in ('credit', 'pro', 'patri') else 'Service',
         'name': name + ' en Martinique, Guadeloupe et Guyane', 'serviceType': stype, 'url': U + path,
         'description': desc, 'provider': EID, 'areaServed': AREA}
    if key == 'credit': s['alternateName'] = 'Regroupement de crédits'
    if items:
        s['hasOfferCatalog'] = {'@type': 'OfferCatalog', 'name': name, 'itemListElement': [
            {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': P[k]['label'], 'url': U + R[k], 'description': P[k]['pitch']}} for k in items]}
    SV[key] = s
site = {'@context': 'https://schema.org', '@graph': [
    {'@type': ['InsuranceAgency', 'FinancialService'], '@id': U + '/#eloy',
     'name': 'Eloy Assurances Patrimoine', 'alternateName': 'Eloy',
     'description': "Eloy est un cabinet de courtage en assurance, en rachat de crédits et en financement professionnel, installé au Lamentin (Martinique). Il accompagne les particuliers et les professionnels de Martinique, Guadeloupe et Guyane : assurances des particuliers et des professionnels, rachat et regroupement de crédits, crédit-bail, défiscalisation Girardin, assurance vie et PER.",
     'slogan': 'Courtier en assurance, rachat de crédits et financement professionnel en Martinique, Guadeloupe et Guyane',
     'url': U + '/', 'logo': LOGO, 'image': LOGO,
     'telephone': '+596696332909', 'email': 'contact@eloy-assurances-patrimoine.fr',
     'address': {'@type': 'PostalAddress', 'streetAddress': "Immeuble Lina's, Mangot Vulcin", 'postalCode': '97232',
                 'addressLocality': 'Le Lamentin', 'addressRegion': 'Martinique', 'addressCountry': 'FR'},
     'hasMap': 'https://www.google.com/maps/search/?api=1&query=Eloy%20Assurances%20Cr%C3%A9dits%20Patrimoine&query_place_id=ChIJb2kVs6inaowRuivNgOp7qw8',
     'openingHoursSpecification': [
         {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '08:00', 'closes': '12:30'},
         {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '14:00', 'closes': '17:00'}],
     'areaServed': AREA,
     'founder': {'@type': 'Person', 'name': 'Bradley Village', 'jobTitle': "Courtier, fondateur d'Eloy"},
     'identifier': [{'@type': 'PropertyValue', 'propertyID': 'ORIAS', 'value': '23 000 527'},
                    {'@type': 'PropertyValue', 'propertyID': 'SIRET', 'value': '919 934 075 00012'}],
     'knowsAbout': ['Courtage en assurance', 'Assurance professionnelle', 'Responsabilité civile professionnelle', 'Assurance décennale',
                    'Assurance emprunteur', 'Assurance habitation', 'Mutuelle santé', 'Prévoyance', 'Rachat de crédits', 'Regroupement de crédits',
                    'Financement professionnel', 'Crédit-bail', 'Défiscalisation Girardin', 'Assurance vie', "Plan d'épargne retraite"],
     'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Solutions Eloy', 'itemListElement': [
         {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': n, 'url': U + p}} for _, n, _, p, _, _ in GROUPS]}},
    {'@type': 'WebSite', '@id': U + '/#site', 'url': U + '/', 'name': 'Eloy Assurances Patrimoine', 'inLanguage': 'fr-FR', 'publisher': EID}]}
json.dump(site, open(os.path.join(ROOT, 'tools', 'site_ld.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump(SV, open(os.path.join(ROOT, 'tools', 'services_ld.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('site', len(json.dumps(site, ensure_ascii=False)), 'services', len(json.dumps(SV, ensure_ascii=False)))
