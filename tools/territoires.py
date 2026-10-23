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
 md="Courtier en Guadeloupe : RC Pro, décennale, dommages-ouvrage, habitation, moto, mutuelle, rachat de crédit, crédit-bail. Tout à distance, rappel sous 24 h.",
 ex="Assurances, rachat de crédits et financement pro en Guadeloupe, avec un courtier antillais joignable à distance.",
 intro="Vous êtes en Guadeloupe et vous cherchez un courtier qui connaît les réalités antillaises ? Eloy accompagne les particuliers et les professionnels de Grande-Terre, de Basse-Terre et des îles du Sud sur trois métiers : l'assurance, le rachat de crédits et le financement professionnel. Tout se fait à distance, avec un conseiller dédié qui connaît les risques de l'archipel, du cyclone au séisme, et suit votre dossier du premier appel à la signature.",
 rel=["guide-courtier-assurance-credit-martinique","guide-courtier-assurance-credit-guyane","guide-courtier-rachat-credit"],
 body=[
  ["Un courtier antillais, entièrement à distance",
   "<p>Eloy est un cabinet de courtage antillais, basé au Lamentin en Martinique. Pour nos clients de Guadeloupe, tout se fait par téléphone, WhatsApp et e-mail, avec signature électronique : Pointe-à-Pitre, Les Abymes, Baie-Mahault, Le Gosier, Sainte-Anne, Saint-François, Le Moule, Morne-à-l'Eau, Petit-Bourg, Capesterre-Belle-Eau, Basse-Terre, Deshaies, et jusqu'à Marie-Galante, Les Saintes et La Désirade.</p>"
   "<p>Notre rôle est de vous conseiller : comprendre votre situation, sélectionner les solutions adaptées auprès de nos partenaires, vous expliquer clairement les garanties ou l'offre de prêt, puis suivre votre dossier dans le temps. Eloy est immatriculé à l'ORIAS sous le n° 23 000 527.</p>"],
  ["Assurances des professionnels en Guadeloupe",
   "<p>Artisans du bâtiment, commerçants, professions libérales et de santé, entreprises de la zone de Jarry, du port ou du transport : chaque activité a ses obligations. Nous mettons en place notamment :</p><ul>"
   f"<li>la {L('/solutions/responsabilite-civile-pro','RC Pro en Guadeloupe')}, pour les métiers de la santé et du bien-être, de l'immobilier, du conseil, du numérique ou de la beauté ;</li>"
   f"<li>la {L('/solutions/mutuelle-sante-collective','mutuelle d’entreprise en Guadeloupe')} et la {L('/solutions/prevoyance-collective','prévoyance d’entreprise')}, obligatoires dès le premier salarié pour la mutuelle ;</li>"
   f"<li>la {L('/solutions/prevoyance-du-dirigeant','prévoyance du dirigeant')} et la {L('/solutions/mutuelle-sante-tns','mutuelle des indépendants')} ;</li>"
   f"<li>les assurances {L('/solutions/assurance-maritime-portuaire','maritimes et portuaires')}, des {L('/solutions/assurance-transporteurs-logisticiens','transporteurs')} et des {L('/solutions/assurance-marchandises-transportees','marchandises transportées')}, pour un archipel qui vit de ses liaisons.</li></ul>"
   f"<p>Voir toutes les {L('/assurances/professionnels','assurances professionnelles en Guadeloupe')}.</p>"],
  ["Construire en Guadeloupe : décennale et dommages-ouvrage",
   "<p>La Guadeloupe est classée en zone de sismicité forte et exposée aux cyclones : les règles de construction y sont exigeantes, et les assureurs regardent de près les activités déclarées. Deux assurances sont au cœur de tout chantier :</p><ul>"
   f"<li>l'{L('/solutions/rc-decennale','assurance décennale en Guadeloupe')}, obligatoire pour les entreprises du bâtiment, de la maçonnerie à l'installation de panneaux photovoltaïques ;</li>"
   f"<li>l'{L('/solutions/assurance-dommages-ouvrage','assurance dommages-ouvrage en Guadeloupe')}, obligatoire pour le particulier ou l'entreprise qui fait construire, à souscrire avant l'ouverture du chantier.</li></ul>"
   f"<p>Pour aller plus loin, lisez notre guide sur la {L('/guides/dommages-ouvrage','dommages-ouvrage')}, ou demandez une étude.</p>"],
  ["Assurances des particuliers en Guadeloupe",
   f"<p>Un contrat {L('/solutions/assurance-habitation','habitation en Guadeloupe')} doit couvrir les vents cycloniques et les catastrophes naturelles : séisme, inondation, glissement de terrain et, pour les communes proches de la Soufrière, les conséquences d'une éruption lorsqu'un arrêté est publié. Nous vérifions aussi les dommages électriques, les biens extérieurs et, si vous louez, l'assurance {L('/guides/assurance-proprietaire-non-occupant-martinique','propriétaire non occupant')} ou de {L('/guides/assurance-location-saisonniere-gite-martinique','location saisonnière')}, très courante au Gosier, à Sainte-Anne, à Saint-François ou à Deshaies.</p>"
   "<p>Nous vous accompagnons aussi pour :</p><ul>"
   f"<li>l'{L('/solutions/assurance-emprunteur','assurance emprunteur en Guadeloupe')}, que vous pouvez changer à tout moment ;</li>"
   f"<li>la {L('/solutions/mutuelle-sante','mutuelle santé en Guadeloupe')}, en complément des remboursements de la CGSS de Guadeloupe, et la {L('/solutions/prevoyance-individuelle','prévoyance individuelle')} des salariés ;</li>"
   f"<li>l'{L('/solutions/assurance-moto','assurance moto en Guadeloupe')}, pour les motos et quads de plus de 125 cm³ ;</li>"
   f"<li>l'{L('/solutions/assurance-obseques','assurance obsèques')}, avec la possibilité de prévoir le transport du corps vers une autre île ou vers l'Hexagone.</li></ul>"],
  ["Rachat et regroupement de crédits en Guadeloupe",
   "<p>Plusieurs crédits, une mensualité totale devenue trop lourde : le regroupement de crédits les remplace par un seul prêt, avec une mensualité adaptée à votre budget. Nous étudions votre dossier gratuitement, nous le présentons aux banques spécialisées adaptées à votre profil et nous vous expliquons l'offre avant toute signature.</p>"
   f"<p>Fonctionnaires, salariés, retraités ou indépendants guadeloupéens : {L('/credits/rachat','simulez votre rachat de crédit en Guadeloupe')} en quelques minutes, ou lisez notre guide sur le {L('/guides/courtier-rachat-credit','rôle d’un courtier en rachat de crédits')}.</p>"],
  ["Crédit-bail et Girardin pour les professionnels",
   f"<p>Pour équiper votre entreprise sans immobiliser votre trésorerie, le {L('/solutions/credit-bail','crédit-bail')} finance vos véhicules, vos engins, votre matériel informatique ou vos équipements. Pour les investissements productifs outre-mer, la {L('/solutions/defiscalisation-girardin','défiscalisation Girardin industriel')} peut réduire le coût de votre matériel. Nous montons le dossier de A à Z. Voir le {L('/financement-pro','financement professionnel')}.</p>"],
  ["Épargne et retraite",
   f"<p>{L('/solutions/assurance-vie','Assurance vie')} pour épargner et transmettre, {L('/solutions/plan-epargne-retraite','Plan d’épargne retraite')} pour préparer la retraite en réduisant ses impôts : nous vous aidons à choisir la solution adaptée à vos objectifs.</p>"],
  ["Questions fréquentes",
   "<h3>Faut-il se déplacer en Martinique ?</h3><p>Non. Toutes les démarches se font par téléphone, WhatsApp et e-mail, et les contrats se signent électroniquement. Votre conseiller reste le même du début à la fin.</p>"
   "<h3>Accompagnez-vous les clients de Marie-Galante, des Saintes et de La Désirade ?</h3><p>Oui, comme ceux de Grande-Terre et de Basse-Terre, entièrement à distance.</p>"
   "<h3>Mon habitation est-elle couverte en cas de séisme ou d'éruption de la Soufrière ?</h3><p>Ces événements relèvent de la garantie catastrophes naturelles, incluse dans les contrats habitation, lorsqu'un arrêté de catastrophe naturelle est publié pour votre commune. Nous vérifions avec vous les garanties et les franchises de votre contrat.</p>"
   "<h3>Quelle RC Pro proposez-vous en Guadeloupe ?</h3><p>Nous assurons notamment les métiers de la santé et du bien-être, de l'immobilier, du conseil, du numérique, de la beauté, ainsi que la décennale des entreprises du bâtiment.</p>"
   "<h3>L'étude est-elle payante ?</h3><p>Non, l'étude est gratuite et sans engagement. En rachat de crédits, aucune somme ne peut vous être demandée avant le déblocage des fonds.</p>"
   f"<h3>Comment vous contacter ?</h3><p>Au 06 96 33 29 09, par WhatsApp, ou via le {L('/contact','formulaire de contact')} : un conseiller vous rappelle sous 24 h.</p>"],
 ])

T["guide-courtier-assurance-credit-guyane"] = dict(
 slug="courtier-assurance-credit-guyane",
 t="Courtier en assurance, rachat de crédits et financement pro en Guyane",
 mt="Courtier assurance et crédit en Guyane | Eloy",
 md="Courtier en Guyane : prévoyance et mutuelle d'entreprise, RC Pro, décennale, habitation, rachat de crédit à Cayenne, crédit-bail, Girardin, à distance.",
 ex="Assurances, rachat de crédits et financement pro en Guyane, avec un courtier de l'outre-mer joignable à distance.",
 intro="En Guyane, trouver le bon interlocuteur pour s'assurer, regrouper ses crédits ou financer du matériel n'est pas toujours simple, surtout loin de Cayenne. Eloy, cabinet de courtage antillais, accompagne les particuliers et les entreprises guyanaises sur trois métiers, l'assurance, le rachat de crédits et le financement professionnel, entièrement à distance, avec un conseiller dédié qui connaît les réalités du territoire.",
 rel=["guide-courtier-assurance-credit-martinique","guide-courtier-assurance-credit-guadeloupe","guide-girardin-eligibilite"],
 body=[
  ["Un courtier de l'outre-mer, joignable partout en Guyane",
   "<p>Cayenne, Matoury, Rémire-Montjoly, Kourou, Macouria, Saint-Laurent-du-Maroni, Mana, Sinnamary, Saint-Georges, et les communes de l'intérieur comme Maripasoula : nos clients guyanais sont accompagnés par téléphone, WhatsApp et e-mail, et signent leurs contrats électroniquement. Les distances ne sont plus un obstacle.</p>"
   "<p>Eloy est basé au Lamentin, en Martinique, et immatriculé à l'ORIAS sous le n° 23 000 527. Notre rôle : vous conseiller, sélectionner les solutions adaptées auprès de nos partenaires et suivre votre dossier dans le temps.</p>"],
  ["Assurances des entreprises en Guyane",
   "<p>BTP, transport et logistique, commerce, services, sous-traitants de l'activité spatiale à Kourou, professions de santé : nous accompagnons les entreprises et les indépendants guyanais.</p><ul>"
   f"<li>la {L('/solutions/prevoyance-collective','prévoyance d’entreprise en Guyane')} et la {L('/solutions/mutuelle-sante-collective','mutuelle d’entreprise')}, pour protéger vos salariés et respecter vos obligations ;</li>"
   f"<li>la {L('/solutions/responsabilite-civile-pro','RC Pro en Guyane')}, pour les métiers de la santé et du bien-être, de l'immobilier, du conseil ou du numérique ;</li>"
   f"<li>l'{L('/solutions/rc-decennale','assurance décennale en Guyane')} et la {L('/solutions/assurance-dommages-ouvrage','dommages-ouvrage')}, pour les chantiers d'un territoire en pleine construction ;</li>"
   f"<li>les assurances des {L('/solutions/assurance-transporteurs-logisticiens','transporteurs')} et des {L('/solutions/assurance-marchandises-transportees','marchandises transportées')}, essentielles pour un territoire qui importe beaucoup ;</li>"
   f"<li>la {L('/solutions/prevoyance-du-dirigeant','prévoyance du dirigeant')} et la {L('/solutions/mutuelle-sante-tns','mutuelle des indépendants')}.</li></ul>"
   f"<p>Voir toutes les {L('/assurances/professionnels','assurances professionnelles en Guyane')}.</p>"],
  ["Les risques à assurer en Guyane",
   "<p>La Guyane n'a pas les mêmes risques que les Antilles. Elle est classée en zone de sismicité très faible et se trouve à l'écart de la trajectoire habituelle des cyclones. En revanche, d'autres risques naturels sont bien présents :</p><ul>"
   "<li>les inondations, par ruissellement des fortes pluies ou débordement des cours d'eau ;</li>"
   "<li>les mouvements de terrain, notamment sur les reliefs de l'île de Cayenne ;</li>"
   "<li>l'érosion du littoral et la submersion marine sur certaines côtes.</li></ul>"
   f"<p>Ces événements relèvent de la garantie catastrophes naturelles lorsqu'un arrêté est publié. Votre {L('/solutions/assurance-habitation','assurance habitation en Guyane')} doit aussi couvrir le dégât des eaux, le vol, les dommages électriques et les biens extérieurs.</p>"],
  ["Assurances des particuliers en Guyane",
   "<ul>"
   f"<li>l'{L('/solutions/assurance-emprunteur','assurance de prêt immobilier')}, que vous pouvez changer à tout moment ;</li>"
   f"<li>la {L('/solutions/mutuelle-sante','mutuelle santé en Guyane')}, en complément des remboursements de la CGSS de Guyane, en pensant aux soins spécialisés qui demandent parfois un déplacement aux Antilles ou dans l'Hexagone ;</li>"
   f"<li>la {L('/solutions/prevoyance-individuelle','prévoyance individuelle')} des salariés, pour garder votre salaire en cas d'arrêt ;</li>"
   f"<li>l'{L('/solutions/assurance-moto','assurance moto en Guyane')}, pour les motos et quads de plus de 125 cm³ ;</li>"
   f"<li>l'{L('/solutions/assurance-obseques','assurance obsèques')}, avec la possibilité de prévoir le transport du corps vers les Antilles ou l'Hexagone.</li></ul>"
   "<p>Nous vous aidons à choisir les bonnes garanties et nous vous accompagnons en cas de sinistre.</p>"],
  ["Rachat de crédits en Guyane",
   "<p>Le regroupement de crédits remplace vos prêts par un seul, avec une mensualité adaptée à votre budget. Fonctionnaires, salariés, retraités ou indépendants : votre conseiller étudie votre dossier gratuitement, vous dit franchement ce qui est possible et vous explique l'offre avant toute signature.</p>"
   f"<p>Que vous soyez à Cayenne, à Kourou ou à Saint-Laurent-du-Maroni, {L('/credits/rachat','simulez votre rachat de crédit en Guyane')} en quelques minutes.</p>"],
  ["Crédit-bail et Girardin industriel",
   f"<p>Pour équiper une entreprise en Guyane, les besoins sont souvent lourds : engins, véhicules, matériel de chantier, d'exploitation forestière ou agricole. Le {L('/solutions/credit-bail','crédit-bail')} préserve votre trésorerie, et la {L('/solutions/defiscalisation-girardin','défiscalisation Girardin industriel')} peut réduire le coût de votre investissement. Nous vérifions votre éligibilité et montons le dossier complet. Voir le {L('/financement-pro','financement professionnel')}.</p>"],
  ["Questions fréquentes",
   "<h3>Pouvez-vous m'accompagner depuis la Martinique ?</h3><p>Oui. Tout le parcours se fait à distance, avec un seul conseiller du premier échange à la signature, puis pour le suivi de vos contrats.</p>"
   "<h3>Intervenez-vous dans les communes de l'intérieur ?</h3><p>Oui. Maripasoula, Grand-Santi, Papaïchton ou Camopi : tant que vous avez un téléphone ou une connexion, nous pouvons étudier votre dossier.</p>"
   "<h3>Proposez-vous la prévoyance d'entreprise en Guyane ?</h3><p>Oui. Nous vérifions les obligations de votre convention collective et nous mettons en place la mutuelle et la prévoyance de vos salariés, cadres et non-cadres.</p>"
   "<h3>Le Girardin est-il possible en Guyane ?</h3><p>Oui, la Guyane fait partie des territoires où le dispositif s'applique, sous conditions d'activité et d'investissement. Nous vérifions votre éligibilité gratuitement.</p>"
   "<h3>L'étude est-elle payante ?</h3><p>Non, l'étude est gratuite et sans engagement. En rachat de crédits, aucune somme ne peut vous être demandée avant le déblocage des fonds.</p>"
   f"<h3>Comment vous joindre ?</h3><p>Au 06 96 33 29 09, par WhatsApp ou via le {L('/contact','formulaire de contact')} : un conseiller vous rappelle sous 24 h.</p>"],
 ])

for k, v in T.items():
    v.update(cat="Nos territoires", prod="", min=6, cta=CTA, legal=LEGAL)
