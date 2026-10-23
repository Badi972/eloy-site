# Pages territoires (Martinique, Guadeloupe, Guyane) : ajoutées aux GUIDES, rubrique "Nos territoires".
LEGAL = ("Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager. "
         "Le regroupement de crédits peut entraîner un allongement de la durée de remboursement et une augmentation du coût total du crédit. "
         "Aucun versement, de quelque nature que ce soit, ne peut être exigé d'un particulier avant l'obtention d'un ou plusieurs prêts d'argent.")
CTA = {"t": "Parlons de votre projet", "p": "Étude gratuite et sans engagement. Votre conseiller vous rappelle sous 24 h, par téléphone ou WhatsApp.",
       "a": [["#contact", "Être rappelé"], ["#rachat-credit", "Simuler un rachat de crédits"]]}
def L(href, txt): return f'<a href="{href}">{txt}</a>'

T = {}

T["guide-courtier-assurance-credit-martinique"] = dict(
 slug="courtier-assurance-credit-martinique",
 t="Courtier en assurance, rachat de crédits et financement pro en Martinique",
 mt="Courtier assurance et crédit en Martinique | Eloy",
 md="Eloy, courtier au Lamentin : assurances pro et particuliers, rachat de crédits, crédit-bail et Girardin en Martinique. Étude gratuite, rappel sous 24 h.",
 ex="Assurances, rachat de crédits et financement pro : un courtier installé au Lamentin, au service de toute la Martinique.",
 intro="Eloy est un cabinet de courtage installé au Lamentin. Depuis la Martinique, nous accompagnons les particuliers et les professionnels sur trois métiers : l'assurance, le rachat de crédits et le financement professionnel. Un seul interlocuteur qui connaît l'île, ses risques et ses banques, du premier appel jusqu'à la signature.",
 rel=["guide-courtier-assurance-credit-guadeloupe","guide-courtier-assurance-credit-guyane","guide-courtier-rachat-credit"],
 body=[
  ["Un courtier martiniquais, pas une plateforme",
   "<p>Le cabinet est basé à l'Immeuble Lina's, à Mangot Vulcin, au Lamentin. Nous travaillons pour des clients de toute l'île : Fort-de-France, Schœlcher, Ducos, Le Robert, Le François, Sainte-Marie, La Trinité, Rivière-Salée, Le Marin, Sainte-Luce… Tout peut se faire à distance, par téléphone, WhatsApp et e-mail, avec signature électronique.</p>"
   "<p>Notre rôle est de vous conseiller : comprendre votre situation, sélectionner les solutions adaptées auprès de nos partenaires, vous expliquer clairement les garanties ou l'offre de prêt, puis suivre votre dossier dans le temps. Eloy est immatriculé à l'ORIAS sous le n° 23 000 527, en qualité de courtier en assurance et de mandataire d'intermédiaire en opérations de banque.</p>"],
  ["Assurances des professionnels en Martinique",
   "<p>Artisans du bâtiment, commerçants, professions libérales, entreprises du port ou du transport : chaque activité a ses obligations et ses risques. Nous mettons en place notamment :</p><ul>"
   f"<li>la {L('/solutions/responsabilite-civile-pro','RC Pro en Martinique')}, pour tous les métiers, et l’{L('/solutions/rc-decennale','assurance décennale')} pour le bâtiment ;</li>"
   f"<li>la {L('/solutions/mutuelle-sante-collective','mutuelle d’entreprise')} et la {L('/solutions/prevoyance-collective','prévoyance collective')} dès le premier salarié ;</li>"
   f"<li>la {L('/solutions/prevoyance-du-dirigeant','prévoyance du dirigeant')} et la {L('/solutions/mutuelle-sante-tns','mutuelle des indépendants')} ;</li>"
   f"<li>les assurances {L('/solutions/assurance-maritime-portuaire','maritimes et portuaires')} et celles des {L('/solutions/assurance-transporteurs-logisticiens','transporteurs')}.</li></ul>"
   f"<p>Voir toutes les {L('/assurances/professionnels','assurances professionnelles en Martinique')}.</p>"],
  ["Assurances des particuliers : penser cyclone et séisme",
   "<p>En Martinique, un contrat habitation doit être lu avec attention : catastrophes naturelles, vents cycloniques, dommages électriques, biens extérieurs. Nous vérifions avec vous ce qui est réellement couvert, que vous soyez propriétaire, locataire ou bailleur, en location longue ou saisonnière.</p>"
   f"<p>Nous vous accompagnons aussi pour l’{L('/solutions/assurance-emprunteur','assurance emprunteur en Martinique')}, que vous pouvez changer à tout moment, la {L('/solutions/mutuelle-sante','mutuelle santé')}, l’{L('/solutions/assurance-obseques','assurance obsèques')} et l’{L('/solutions/assurance-moto','assurance moto en Martinique')}, pour les motos de plus de 125 cm³.</p>"],
  ["Rachat et regroupement de crédits en Martinique",
   "<p>Plusieurs crédits, une mensualité totale devenue trop lourde : le regroupement de crédits les remplace par un seul prêt, avec une mensualité adaptée à votre budget. Nous étudions votre dossier gratuitement, nous le présentons aux banques spécialisées adaptées à votre profil et nous vous expliquons l’offre avant toute signature.</p>"
   f"<p>Nous accompagnons beaucoup de fonctionnaires, de salariés, de retraités et d’indépendants martiniquais. {L('/credits/rachat','Simulez votre rachat de crédit en Martinique')} ou lisez notre guide sur le {L('/guides/courtier-rachat-credit','rôle d’un courtier en rachat de crédits')}.</p>"],
  ["Financement professionnel : crédit-bail et Girardin",
   f"<p>Pour équiper votre entreprise sans immobiliser votre trésorerie, le {L('/solutions/credit-bail','crédit-bail')} finance vos véhicules, vos engins, votre matériel informatique ou vos équipements. Pour les investissements productifs outre-mer, la {L('/solutions/defiscalisation-girardin','défiscalisation Girardin industriel')} peut réduire le coût de votre matériel.</p>"
   f"<p>Nous montons le dossier de A à Z et le présentons aux financeurs. Voir le {L('/financement-pro','financement professionnel')}.</p>"],
  ["Épargne et retraite",
   f"<p>{L('/solutions/assurance-vie','Assurance vie')} pour épargner et transmettre, {L('/solutions/plan-epargne-retraite','Plan d’épargne retraite')} pour préparer la retraite en réduisant ses impôts : nous vous aidons à choisir la solution adaptée à vos objectifs.</p>"],
  ["Questions fréquentes",
   "<h3>Faut-il se déplacer au cabinet ?</h3><p>Non. Toutes les démarches se font par téléphone, WhatsApp et e-mail, et les contrats se signent électroniquement. Votre conseiller reste le même du début à la fin.</p>"
   "<h3>L’étude est-elle payante ?</h3><p>Non, l’étude est gratuite et sans engagement. En rachat de crédits, aucune somme ne peut vous être demandée avant le déblocage des fonds.</p>"
   "<h3>Dans quelles communes intervenez-vous ?</h3><p>Dans toute la Martinique, du nord au sud, ainsi qu’en Guadeloupe et en Guyane.</p>"
   f"<h3>Comment vous contacter ?</h3><p>Au 06 96 33 29 09, par WhatsApp, ou via le {L('/contact','formulaire de contact')} : un conseiller vous rappelle sous 24 h.</p>"],
 ])

T["guide-courtier-assurance-credit-guadeloupe"] = dict(
 slug="courtier-assurance-credit-guadeloupe",
 t="Courtier en assurance, rachat de crédits et financement pro en Guadeloupe",
 mt="Courtier assurance et crédit en Guadeloupe | Eloy",
 md="Assurances pro et particuliers, rachat de crédits, crédit-bail et Girardin en Guadeloupe, avec un courtier antillais. Tout à distance, rappel sous 24 h.",
 ex="Assurances, rachat de crédits et financement pro en Guadeloupe, avec un courtier antillais joignable à distance.",
 intro="Vous êtes en Guadeloupe et vous cherchez un courtier qui connaît les réalités antillaises ? Eloy accompagne les particuliers et les professionnels guadeloupéens en assurance, en rachat de crédits et en financement professionnel. Tout se fait à distance, avec un conseiller dédié qui suit votre dossier du début à la fin.",
 rel=["guide-courtier-assurance-credit-martinique","guide-courtier-assurance-credit-guyane","guide-courtier-rachat-credit"],
 body=[
  ["Un courtier antillais, entièrement à distance",
   "<p>Eloy est un cabinet de courtage antillais, basé au Lamentin en Martinique. Pour nos clients de Guadeloupe, tout se fait par téléphone, WhatsApp et e-mail, avec signature électronique : Pointe-à-Pitre, Les Abymes, Baie-Mahault, Le Gosier, Sainte-Anne, Le Moule, Petit-Bourg, Capesterre-Belle-Eau, Basse-Terre, mais aussi Marie-Galante et Les Saintes.</p>"
   "<p>Vous n’avez qu’un interlocuteur, qui connaît les contraintes des îles : risques cycloniques et sismiques, délais d’acheminement, organisation des banques locales. Eloy est immatriculé à l’ORIAS sous le n° 23 000 527.</p>"],
  ["Assurances des entreprises guadeloupéennes",
   "<p>De la zone de Jarry aux artisans indépendants, nous assurons les professionnels de Guadeloupe :</p><ul>"
   f"<li>{L('/solutions/responsabilite-civile-pro','RC Pro')} et {L('/solutions/rc-decennale','assurance décennale')} pour le bâtiment ;</li>"
   f"<li>{L('/solutions/assurance-transporteurs-logisticiens','transporteurs, logisticiens')} et {L('/solutions/assurance-marchandises-transportees','marchandises transportées')} ;</li>"
   f"<li>{L('/solutions/mutuelle-sante-collective','mutuelle d’entreprise')}, {L('/solutions/prevoyance-collective','prévoyance collective')} et {L('/solutions/garantie-homme-cle','garantie homme clé')} ;</li>"
   f"<li>{L('/solutions/assurance-cyber','assurance cyber')} et {L('/solutions/rc-des-mandataires-sociaux','RC des dirigeants')}.</li></ul>"
   f"<p>Voir toutes les {L('/assurances/professionnels','assurances des professionnels')}.</p>"],
  ["Assurances des particuliers en Guadeloupe",
   f"<p>{L('/solutions/assurance-habitation','Habitation')} adaptée aux risques naturels de l’archipel, {L('/solutions/assurance-emprunteur','assurance de prêt immobilier')}, {L('/solutions/mutuelle-sante','mutuelle santé')}, {L('/solutions/assurance-deces','assurance décès')} et {L('/solutions/assurance-obseques','obsèques')} : nous vous conseillons les garanties utiles, sans superflu.</p>"],
  ["Regroupement de crédits en Guadeloupe",
   "<p>Crédits à la consommation, crédit auto, réserve renouvelable, prêt immobilier : le regroupement de crédits réunit vos prêts en un seul, avec une mensualité adaptée à vos revenus. Votre conseiller étudie votre situation gratuitement, vous indique franchement si l’opération est intéressante et présente votre dossier aux banques spécialisées.</p>"
   f"<p>Vos pièces s’envoient depuis votre téléphone : pas besoin de vous déplacer. {L('/credits/rachat','Faites votre simulation')} en quelques minutes.</p>"],
  ["Crédit-bail et Girardin pour les professionnels",
   f"<p>Véhicules utilitaires, engins de chantier, matériel agricole ou de pêche, équipements de restauration : le {L('/solutions/credit-bail','crédit-bail')} et la {L('/solutions/defiscalisation-girardin','défiscalisation Girardin industriel')} permettent aux entreprises guadeloupéennes d’investir en préservant leur trésorerie. Nous montons le dossier et le présentons aux financeurs. Voir le {L('/financement-pro','financement professionnel')}.</p>"],
  ["Questions fréquentes",
   "<h3>Le cabinet est en Martinique : est-ce un problème ?</h3><p>Non. Nos clients de Guadeloupe sont accompagnés entièrement à distance, avec les mêmes délais et le même conseiller du début à la fin.</p>"
   "<h3>Les contrats sont-ils adaptés à la Guadeloupe ?</h3><p>Oui. Nous sélectionnons des contrats qui tiennent compte des risques et de la réglementation propres aux départements d’outre-mer.</p>"
   "<h3>L’étude est-elle gratuite ?</h3><p>Oui, l’étude est gratuite et sans engagement.</p>"
   f"<h3>Comment être rappelé ?</h3><p>Appelez le 06 96 33 29 09, écrivez-nous sur WhatsApp ou remplissez le {L('/contact','formulaire de contact')}.</p>"],
 ])

T["guide-courtier-assurance-credit-guyane"] = dict(
 slug="courtier-assurance-credit-guyane",
 t="Courtier en assurance, rachat de crédits et financement pro en Guyane",
 mt="Courtier assurance et crédit en Guyane | Eloy",
 md="Assurances pro et particuliers, rachat de crédits, crédit-bail et Girardin en Guyane, avec un courtier de l'outre-mer. Tout à distance, rappel sous 24 h.",
 ex="Assurances, rachat de crédits et financement pro en Guyane, avec un courtier qui connaît l'outre-mer.",
 intro="En Guyane, trouver le bon interlocuteur pour s’assurer, regrouper ses crédits ou financer du matériel n’est pas toujours simple. Eloy, cabinet de courtage antillais, accompagne les particuliers et les entreprises guyanaises entièrement à distance, avec un conseiller dédié et des solutions pensées pour l’outre-mer.",
 rel=["guide-courtier-assurance-credit-martinique","guide-courtier-assurance-credit-guadeloupe","guide-girardin-eligibilite"],
 body=[
  ["Un courtier de l’outre-mer, joignable partout en Guyane",
   "<p>Cayenne, Matoury, Rémire-Montjoly, Kourou, Saint-Laurent-du-Maroni, Macouria, Mana ou les communes de l’intérieur : nos clients guyanais sont accompagnés par téléphone, WhatsApp et e-mail, et signent leurs contrats électroniquement. Les distances ne sont plus un obstacle.</p>"
   "<p>Eloy est basé au Lamentin, en Martinique, et immatriculé à l’ORIAS sous le n° 23 000 527. Notre rôle : vous conseiller, sélectionner les solutions adaptées auprès de nos partenaires et suivre votre dossier dans le temps.</p>"],
  ["Assurances des professionnels en Guyane",
   "<p>BTP, transport et logistique, commerce, services, professions de santé : nous assurons les entreprises et les indépendants guyanais.</p><ul>"
   f"<li>{L('/solutions/rc-decennale','assurance décennale')} et {L('/solutions/assurance-dommages-ouvrage','dommages-ouvrage')} pour les chantiers ;</li>"
   f"<li>{L('/solutions/responsabilite-civile-pro','responsabilité civile professionnelle')}, y compris pour les paramédicaux ;</li>"
   f"<li>{L('/solutions/assurance-transporteurs-logisticiens','transporteurs')} et {L('/solutions/assurance-marchandises-transportees','marchandises transportées')}, essentiels pour un territoire qui importe beaucoup ;</li>"
   f"<li>{L('/solutions/prevoyance-du-dirigeant','prévoyance du dirigeant')} et {L('/solutions/mutuelle-sante-tns','mutuelle des indépendants')}.</li></ul>"
   f"<p>Voir toutes les {L('/assurances/professionnels','assurances des professionnels')}.</p>"],
  ["Assurances des particuliers",
   f"<p>{L('/solutions/assurance-habitation','Assurance habitation')}, {L('/solutions/assurance-emprunteur','assurance de prêt immobilier')}, {L('/solutions/mutuelle-sante','mutuelle santé')}, {L('/solutions/assurance-obseques','assurance obsèques')} : nous vous aidons à choisir les bonnes garanties et nous vous accompagnons en cas de sinistre.</p>"],
  ["Rachat de crédits en Guyane",
   "<p>Le regroupement de crédits remplace vos prêts par un seul, avec une mensualité adaptée à votre budget. Fonctionnaires, salariés, retraités ou indépendants : votre conseiller étudie votre dossier gratuitement, vous dit franchement ce qui est possible et vous explique l’offre avant toute signature.</p>"
   f"<p>{L('/credits/rachat','Simulez votre regroupement de crédits')} en quelques minutes.</p>"],
  ["Crédit-bail et Girardin industriel",
   f"<p>Pour équiper une entreprise en Guyane, les besoins sont souvent lourds : engins, véhicules, matériel de chantier ou d’exploitation. Le {L('/solutions/credit-bail','crédit-bail')} préserve votre trésorerie, et la {L('/solutions/defiscalisation-girardin','défiscalisation Girardin industriel')} peut réduire le coût de votre investissement. Nous vérifions votre éligibilité et montons le dossier complet. Voir le {L('/financement-pro','financement professionnel')}.</p>"],
  ["Questions fréquentes",
   "<h3>Pouvez-vous m’accompagner depuis la Martinique ?</h3><p>Oui. Tout le parcours se fait à distance, avec un seul conseiller du premier échange à la signature, puis pour le suivi de vos contrats.</p>"
   "<h3>Le Girardin est-il possible en Guyane ?</h3><p>Oui, la Guyane fait partie des territoires où le dispositif s’applique, sous conditions d’activité et d’investissement. Nous vérifions votre éligibilité gratuitement.</p>"
   "<h3>L’étude est-elle payante ?</h3><p>Non, l’étude est gratuite et sans engagement.</p>"
   f"<h3>Comment vous joindre ?</h3><p>Au 06 96 33 29 09, par WhatsApp ou via le {L('/contact','formulaire de contact')}.</p>"],
 ])

for k, v in T.items():
    v.update(cat="Nos territoires", prod="", min=6, cta=CTA, legal=LEGAL)
