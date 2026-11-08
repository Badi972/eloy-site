/**
 * Eloy – relais automatique des demandes du site (Google Apps Script)
 * À installer dans le compte Google eloy.assurances@gmail.com (celui qui reçoit les demandes du site).
 *
 * Toutes les 5 minutes :
 *  1. lit les nouvelles demandes envoyées par le site (mails « New form submission on Webflow ») ;
 *  2. pour un produit qui a un questionnaire en ligne, envoie au client un mail avec le lien du questionnaire ;
 *  3. relance une fois le client après 48 h s'il n'a pas rempli le questionnaire (entre 8 h et 19 h) ;
 *  4. note chaque demande dans la feuille Google Sheets « Eloy – Demandes du site ».
 * Les demandes reçues avant l'installation ne sont pas traitées.
 *
 * Installation : coller ce fichier dans un projet Apps Script, puis exécuter une fois la fonction « installer ».
 * Questionnaires : décrits dans tools/questionnaires.json du dépôt eloy-site ; lancer tools/apps-script/fiches.py pour les recopier ici.
 */

var CFG = {
  SITE: 'https://www.eloy-assurances-patrimoine.fr/',
  RELANCE_APRES_HEURES: 48,
  HEURES_RELANCE: [8, 19],
  FUSEAU: 'America/Martinique',
  BOITE: 'eloy.assurances@gmail.com',
  FEUILLE: 'Eloy – Demandes du site',
  RECHERCHE: 'from:no-reply-forms@webflow.com subject:"New form submission" newer_than:3d'
};

/* FICHES:début (généré par tools/apps-script/fiches.py depuis tools/questionnaires.json, ne pas modifier à la main) */
var FICHES = {
 "habitation": {
  "cle": "habitation",
  "demande": "Questionnaire assurance habitation",
  "court": "habitation",
  "produit": "Assurance habitation",
  "mail": "assurance habitation",
  "sujet": "Votre devis Assurance habitation",
  "declencheurs": [
   "Assurance habitation"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Nom de naissance (si différent)",
     "Date de naissance",
     "Lieu de naissance",
     "Nationalité",
     "Profession",
     "Adresse",
     "Code postal",
     "Ville"
    ]
   ],
   [
    "Vos biens",
    [
     "Nombre de biens"
    ]
   ],
   [
    "Vous et ce bien",
    [
     "Pour ce bien, vous êtes",
     "Le contrat sera au nom de",
     "Société",
     "SIREN de la société",
     "Personne au nom de qui est le contrat",
     "D'autres personnes sont-elles à assurer sur ce bien ?",
     "Noms et prénoms des autres personnes à assurer",
     "Avez-vous des enfants scolarisés à assurer sur ce bien ?",
     "Nombre d'enfants scolarisés"
    ]
   ],
   [
    "Le logement",
    [
     "Type de logement",
     "Niveau du logement",
     "Numéro de l'étage",
     "Usage",
     "Logement à l'adresse du souscripteur",
     "Adresse du logement",
     "Code postal du logement",
     "Ville du logement",
     "Nombre de pièces",
     "Superficie développée",
     "Varangue, terrasse, balcon",
     "Sous-sol, combles, garages",
     "Dépendances à la même adresse",
     "Année de construction",
     "Période de construction",
     "Nature de la construction",
     "Nature de la couverture (toit)",
     "Piscine ou spa",
     "Installations extérieures",
     "Installations développement durable"
    ]
   ],
   [
    "Déclarations complémentaires",
    [
     "Bâtiment classé ou inscrit comme monument historique",
     "Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Logement non occupé plus de 90 jours par an",
     "Location partielle ou temporaire du logement",
     "Chambre d'hôtes",
     "Table d'hôtes"
    ]
   ],
   [
    "Votre mobilier",
    [
     "Valeur estimée du mobilier",
     "Dont objets de valeur"
    ]
   ],
   [
    "Antécédents de ce bien",
    [
     "Ce bien est-il actuellement assuré ?",
     "Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
     "Sinistre 1 : nature",
     "Année du sinistre 1",
     "Sinistre 2 : nature",
     "Année du sinistre 2",
     "Un précédent assureur a-t-il résilié le contrat de ce bien ?",
     "Motif de la résiliation"
    ]
   ],
   [
    "Bien 2 – Vous et ce bien",
    [
     "Bien 2 – Pour ce bien, vous êtes",
     "Bien 2 – Le contrat sera au nom de",
     "Bien 2 – Société",
     "Bien 2 – SIREN de la société",
     "Bien 2 – Personne au nom de qui est le contrat",
     "Bien 2 – D'autres personnes sont-elles à assurer sur ce bien ?",
     "Bien 2 – Noms et prénoms des autres personnes à assurer",
     "Bien 2 – Avez-vous des enfants scolarisés à assurer sur ce bien ?",
     "Bien 2 – Nombre d'enfants scolarisés"
    ]
   ],
   [
    "Bien 2 – Le logement",
    [
     "Bien 2 – Type de logement",
     "Bien 2 – Niveau du logement",
     "Bien 2 – Numéro de l'étage",
     "Bien 2 – Usage",
     "Bien 2 – Logement à l'adresse du souscripteur",
     "Bien 2 – Adresse du logement",
     "Bien 2 – Code postal du logement",
     "Bien 2 – Ville du logement",
     "Bien 2 – Nombre de pièces",
     "Bien 2 – Superficie développée",
     "Bien 2 – Varangue, terrasse, balcon",
     "Bien 2 – Sous-sol, combles, garages",
     "Bien 2 – Dépendances à la même adresse",
     "Bien 2 – Année de construction",
     "Bien 2 – Période de construction",
     "Bien 2 – Nature de la construction",
     "Bien 2 – Nature de la couverture (toit)",
     "Bien 2 – Piscine ou spa",
     "Bien 2 – Installations extérieures",
     "Bien 2 – Installations développement durable"
    ]
   ],
   [
    "Bien 2 – Déclarations complémentaires",
    [
     "Bien 2 – Bâtiment classé ou inscrit comme monument historique",
     "Bien 2 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Bien 2 – Logement non occupé plus de 90 jours par an",
     "Bien 2 – Location partielle ou temporaire du logement",
     "Bien 2 – Chambre d'hôtes",
     "Bien 2 – Table d'hôtes"
    ]
   ],
   [
    "Bien 2 – Votre mobilier",
    [
     "Bien 2 – Valeur estimée du mobilier",
     "Bien 2 – Dont objets de valeur"
    ]
   ],
   [
    "Bien 2 – Antécédents de ce bien",
    [
     "Bien 2 – Ce bien est-il actuellement assuré ?",
     "Bien 2 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
     "Bien 2 – Sinistre 1 : nature",
     "Bien 2 – Année du sinistre 1",
     "Bien 2 – Sinistre 2 : nature",
     "Bien 2 – Année du sinistre 2",
     "Bien 2 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
     "Bien 2 – Motif de la résiliation"
    ]
   ],
   [
    "Bien 3 – Vous et ce bien",
    [
     "Bien 3 – Pour ce bien, vous êtes",
     "Bien 3 – Le contrat sera au nom de",
     "Bien 3 – Société",
     "Bien 3 – SIREN de la société",
     "Bien 3 – Personne au nom de qui est le contrat",
     "Bien 3 – D'autres personnes sont-elles à assurer sur ce bien ?",
     "Bien 3 – Noms et prénoms des autres personnes à assurer",
     "Bien 3 – Avez-vous des enfants scolarisés à assurer sur ce bien ?",
     "Bien 3 – Nombre d'enfants scolarisés"
    ]
   ],
   [
    "Bien 3 – Le logement",
    [
     "Bien 3 – Type de logement",
     "Bien 3 – Niveau du logement",
     "Bien 3 – Numéro de l'étage",
     "Bien 3 – Usage",
     "Bien 3 – Logement à l'adresse du souscripteur",
     "Bien 3 – Adresse du logement",
     "Bien 3 – Code postal du logement",
     "Bien 3 – Ville du logement",
     "Bien 3 – Nombre de pièces",
     "Bien 3 – Superficie développée",
     "Bien 3 – Varangue, terrasse, balcon",
     "Bien 3 – Sous-sol, combles, garages",
     "Bien 3 – Dépendances à la même adresse",
     "Bien 3 – Année de construction",
     "Bien 3 – Période de construction",
     "Bien 3 – Nature de la construction",
     "Bien 3 – Nature de la couverture (toit)",
     "Bien 3 – Piscine ou spa",
     "Bien 3 – Installations extérieures",
     "Bien 3 – Installations développement durable"
    ]
   ],
   [
    "Bien 3 – Déclarations complémentaires",
    [
     "Bien 3 – Bâtiment classé ou inscrit comme monument historique",
     "Bien 3 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Bien 3 – Logement non occupé plus de 90 jours par an",
     "Bien 3 – Location partielle ou temporaire du logement",
     "Bien 3 – Chambre d'hôtes",
     "Bien 3 – Table d'hôtes"
    ]
   ],
   [
    "Bien 3 – Votre mobilier",
    [
     "Bien 3 – Valeur estimée du mobilier",
     "Bien 3 – Dont objets de valeur"
    ]
   ],
   [
    "Bien 3 – Antécédents de ce bien",
    [
     "Bien 3 – Ce bien est-il actuellement assuré ?",
     "Bien 3 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
     "Bien 3 – Sinistre 1 : nature",
     "Bien 3 – Année du sinistre 1",
     "Bien 3 – Sinistre 2 : nature",
     "Bien 3 – Année du sinistre 2",
     "Bien 3 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
     "Bien 3 – Motif de la résiliation"
    ]
   ],
   [
    "Bien 4 – Vous et ce bien",
    [
     "Bien 4 – Pour ce bien, vous êtes",
     "Bien 4 – Le contrat sera au nom de",
     "Bien 4 – Société",
     "Bien 4 – SIREN de la société",
     "Bien 4 – Personne au nom de qui est le contrat",
     "Bien 4 – D'autres personnes sont-elles à assurer sur ce bien ?",
     "Bien 4 – Noms et prénoms des autres personnes à assurer",
     "Bien 4 – Avez-vous des enfants scolarisés à assurer sur ce bien ?",
     "Bien 4 – Nombre d'enfants scolarisés"
    ]
   ],
   [
    "Bien 4 – Le logement",
    [
     "Bien 4 – Type de logement",
     "Bien 4 – Niveau du logement",
     "Bien 4 – Numéro de l'étage",
     "Bien 4 – Usage",
     "Bien 4 – Logement à l'adresse du souscripteur",
     "Bien 4 – Adresse du logement",
     "Bien 4 – Code postal du logement",
     "Bien 4 – Ville du logement",
     "Bien 4 – Nombre de pièces",
     "Bien 4 – Superficie développée",
     "Bien 4 – Varangue, terrasse, balcon",
     "Bien 4 – Sous-sol, combles, garages",
     "Bien 4 – Dépendances à la même adresse",
     "Bien 4 – Année de construction",
     "Bien 4 – Période de construction",
     "Bien 4 – Nature de la construction",
     "Bien 4 – Nature de la couverture (toit)",
     "Bien 4 – Piscine ou spa",
     "Bien 4 – Installations extérieures",
     "Bien 4 – Installations développement durable"
    ]
   ],
   [
    "Bien 4 – Déclarations complémentaires",
    [
     "Bien 4 – Bâtiment classé ou inscrit comme monument historique",
     "Bien 4 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Bien 4 – Logement non occupé plus de 90 jours par an",
     "Bien 4 – Location partielle ou temporaire du logement",
     "Bien 4 – Chambre d'hôtes",
     "Bien 4 – Table d'hôtes"
    ]
   ],
   [
    "Bien 4 – Votre mobilier",
    [
     "Bien 4 – Valeur estimée du mobilier",
     "Bien 4 – Dont objets de valeur"
    ]
   ],
   [
    "Bien 4 – Antécédents de ce bien",
    [
     "Bien 4 – Ce bien est-il actuellement assuré ?",
     "Bien 4 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
     "Bien 4 – Sinistre 1 : nature",
     "Bien 4 – Année du sinistre 1",
     "Bien 4 – Sinistre 2 : nature",
     "Bien 4 – Année du sinistre 2",
     "Bien 4 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
     "Bien 4 – Motif de la résiliation"
    ]
   ],
   [
    "Bien 5 – Vous et ce bien",
    [
     "Bien 5 – Pour ce bien, vous êtes",
     "Bien 5 – Le contrat sera au nom de",
     "Bien 5 – Société",
     "Bien 5 – SIREN de la société",
     "Bien 5 – Personne au nom de qui est le contrat",
     "Bien 5 – D'autres personnes sont-elles à assurer sur ce bien ?",
     "Bien 5 – Noms et prénoms des autres personnes à assurer",
     "Bien 5 – Avez-vous des enfants scolarisés à assurer sur ce bien ?",
     "Bien 5 – Nombre d'enfants scolarisés"
    ]
   ],
   [
    "Bien 5 – Le logement",
    [
     "Bien 5 – Type de logement",
     "Bien 5 – Niveau du logement",
     "Bien 5 – Numéro de l'étage",
     "Bien 5 – Usage",
     "Bien 5 – Logement à l'adresse du souscripteur",
     "Bien 5 – Adresse du logement",
     "Bien 5 – Code postal du logement",
     "Bien 5 – Ville du logement",
     "Bien 5 – Nombre de pièces",
     "Bien 5 – Superficie développée",
     "Bien 5 – Varangue, terrasse, balcon",
     "Bien 5 – Sous-sol, combles, garages",
     "Bien 5 – Dépendances à la même adresse",
     "Bien 5 – Année de construction",
     "Bien 5 – Période de construction",
     "Bien 5 – Nature de la construction",
     "Bien 5 – Nature de la couverture (toit)",
     "Bien 5 – Piscine ou spa",
     "Bien 5 – Installations extérieures",
     "Bien 5 – Installations développement durable"
    ]
   ],
   [
    "Bien 5 – Déclarations complémentaires",
    [
     "Bien 5 – Bâtiment classé ou inscrit comme monument historique",
     "Bien 5 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
     "Bien 5 – Logement non occupé plus de 90 jours par an",
     "Bien 5 – Location partielle ou temporaire du logement",
     "Bien 5 – Chambre d'hôtes",
     "Bien 5 – Table d'hôtes"
    ]
   ],
   [
    "Bien 5 – Votre mobilier",
    [
     "Bien 5 – Valeur estimée du mobilier",
     "Bien 5 – Dont objets de valeur"
    ]
   ],
   [
    "Bien 5 – Antécédents de ce bien",
    [
     "Bien 5 – Ce bien est-il actuellement assuré ?",
     "Bien 5 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
     "Bien 5 – Sinistre 1 : nature",
     "Bien 5 – Année du sinistre 1",
     "Bien 5 – Sinistre 2 : nature",
     "Bien 5 – Année du sinistre 2",
     "Bien 5 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
     "Bien 5 – Motif de la résiliation"
    ]
   ]
  ],
  "alertes": [
   "Piscine ou spa",
   "Bâtiment classé ou inscrit comme monument historique",
   "Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Logement non occupé plus de 90 jours par an",
   "Location partielle ou temporaire du logement",
   "Chambre d'hôtes",
   "Table d'hôtes",
   "Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
   "Un précédent assureur a-t-il résilié le contrat de ce bien ?",
   "Bien 2 – Piscine ou spa",
   "Bien 2 – Bâtiment classé ou inscrit comme monument historique",
   "Bien 2 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Bien 2 – Logement non occupé plus de 90 jours par an",
   "Bien 2 – Location partielle ou temporaire du logement",
   "Bien 2 – Chambre d'hôtes",
   "Bien 2 – Table d'hôtes",
   "Bien 2 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
   "Bien 2 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
   "Bien 3 – Piscine ou spa",
   "Bien 3 – Bâtiment classé ou inscrit comme monument historique",
   "Bien 3 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Bien 3 – Logement non occupé plus de 90 jours par an",
   "Bien 3 – Location partielle ou temporaire du logement",
   "Bien 3 – Chambre d'hôtes",
   "Bien 3 – Table d'hôtes",
   "Bien 3 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
   "Bien 3 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
   "Bien 4 – Piscine ou spa",
   "Bien 4 – Bâtiment classé ou inscrit comme monument historique",
   "Bien 4 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Bien 4 – Logement non occupé plus de 90 jours par an",
   "Bien 4 – Location partielle ou temporaire du logement",
   "Bien 4 – Chambre d'hôtes",
   "Bien 4 – Table d'hôtes",
   "Bien 4 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
   "Bien 4 – Un précédent assureur a-t-il résilié le contrat de ce bien ?",
   "Bien 5 – Piscine ou spa",
   "Bien 5 – Bâtiment classé ou inscrit comme monument historique",
   "Bien 5 – Bâtiment en cours ou destiné à la démolition, ou frappé d'expropriation",
   "Bien 5 – Logement non occupé plus de 90 jours par an",
   "Bien 5 – Location partielle ou temporaire du logement",
   "Bien 5 – Chambre d'hôtes",
   "Bien 5 – Table d'hôtes",
   "Bien 5 – Des sinistres ont-ils été déclarés sur ce bien au cours des 36 derniers mois ?",
   "Bien 5 – Un précédent assureur a-t-il résilié le contrat de ce bien ?"
  ],
  "exclus": {},
  "av": {
   "Date de naissance": "birthDate",
   "Profession": "profession",
   "Adresse": "address",
   "Code postal": "postalCode",
   "Ville": "city",
   "Ce bien est-il actuellement assuré ?": "currentlyInsured"
  },
  "siren": "SIREN de la société",
  "sirens": [
   "SIREN de la société",
   "Bien 2 – SIREN de la société",
   "Bien 3 – SIREN de la société",
   "Bien 4 – SIREN de la société",
   "Bien 5 – SIREN de la société"
  ]
 },
 "rcpro": {
  "cle": "rcpro",
  "demande": "Questionnaire assurance RC Pro",
  "court": "RC Pro",
  "produit": "Responsabilité civile pro (pro)",
  "mail": "assurance Responsabilité civile professionnelle",
  "sujet": "Votre devis RC Pro",
  "declencheurs": [
   "Responsabilité civile pro",
   "Responsabilité civile pro (pro)"
  ],
  "rubriques": [
   [
    "L'entreprise",
    [
     "Raison sociale",
     "L'entreprise est-elle en cours de création ?",
     "Numéro SIREN ou SIRET",
     "Date de début d'activité prévue",
     "Forme juridique prévue",
     "Adresse prévue du siège",
     "Code postal prévu du siège",
     "Ville prévue du siège"
    ]
   ],
   [
    "Le dirigeant",
    [
     "Qualité dans l'entreprise",
     "Date de naissance",
     "Lieu de naissance",
     "Adresse personnelle",
     "Code postal",
     "Ville"
    ]
   ],
   [
    "Chiffres clés",
    [
     "Chiffre d'affaires annuel ou prévisionnel",
     "Nombre de salariés"
    ]
   ],
   [
    "Votre activité",
    [
     "Métier(s)",
     "Répartition du chiffre d'affaires",
     "Métier (autre)",
     "Description des missions",
     "Faites-vous réaliser des travaux d'agrandissement ou touchant à la structure des bâtiments (murs porteurs, planchers, charpente) ?",
     "Réalisez-vous vous-même tout ou partie des travaux ?",
     "Le montant des travaux d'une opération peut-il dépasser 1 500 000 € ?",
     "Travaux pour le compte des clients (maître d'œuvre, contractant général, AMO)",
     "Contrats de construction de maison individuelle (CCMI)",
     "Construisez-vous des immeubles de logements de plus de 6 étages (au-delà de R+6) ?",
     "Intervenez-vous sur des bâtiments de plus de 3 000 m² ?",
     "Donnez-vous des conseils sur la structure (murs porteurs, planchers, charpente) ?",
     "Réalisez-vous des missions d'architecte (plans soumis à permis de construire) ?",
     "Suivez-vous ou réalisez-vous les travaux d'aménagement ?",
     "Facturez-vous vous-même les travaux à vos clients, à la place des artisans ?",
     "Réalisez-vous des études ou des prescriptions techniques (bureau d'études) ?",
     "Prenez-vous des décisions à la place du maître d'ouvrage (maître d'ouvrage délégué) ?",
     "Intervenez-vous aussi comme maître d'œuvre ou réalisez-vous des travaux ?",
     "Êtes-vous agréé Mon Accompagnateur Rénov' (Anah) ?",
     "Réalisez-vous ou suivez-vous les travaux que vous préconisez ?",
     "Déposez-vous des dossiers de demande d'aides (MaPrimeRénov'…) au nom de vos clients ?",
     "Réalisez-vous des repérages amiante avant travaux ou démolition ?",
     "Réalisez-vous des états parasitaires (termites, mérule) ?",
     "Proposez-vous des travaux ou des solutions d'amélioration à vos clients ?",
     "Vos certifications sont-elles en cours de validité ?",
     "Avez-vous un établissement ou une filiale hors de France ?",
     "Réalisez-vous du chiffre d'affaires aux États-Unis ou au Canada ?",
     "Part de ce chiffre d'affaires"
    ]
   ],
   [
    "Vos antécédents",
    [
     "Êtes-vous actuellement assuré en RC Pro ?",
     "Nom de votre assureur actuel",
     "Votre responsabilité a-t-elle été mise en cause au cours des 5 dernières années ?",
     "Nombre de mises en cause",
     "Détail des mises en cause",
     "Un assureur a-t-il résilié l'un de vos contrats ?",
     "Motif de la résiliation",
     "Procédure collective (36 derniers mois)"
    ]
   ]
  ],
  "alertes": [
   "Avez-vous un établissement ou une filiale hors de France ?",
   "Réalisez-vous du chiffre d'affaires aux États-Unis ou au Canada ?",
   "Votre responsabilité a-t-elle été mise en cause au cours des 5 dernières années ?",
   "Un assureur a-t-il résilié l'un de vos contrats ?",
   "Procédure collective (36 derniers mois)"
  ],
  "exclus": {
   "Faites-vous réaliser des travaux d'agrandissement ou touchant à la structure des bâtiments (murs porteurs, planchers, charpente) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : travaux d'agrandissement ou touchant à la structure exclus pour le marchand de biens simple (prendre l'activité « avec travaux sur la structure »)"
   ],
   "Réalisez-vous vous-même tout ou partie des travaux ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : les travaux doivent être confiés à des entreprises assurées en RC et en décennale ; le marchand de biens ne doit pas être maître d'œuvre ni entrepreneur"
   ],
   "Le montant des travaux d'une opération peut-il dépasser 1 500 000 € ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : garantie limitée à 1 500 000 € de travaux par opération"
   ],
   "Travaux pour le compte des clients (maître d'œuvre, contractant général, AMO)": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : réalisation, suivi ou réception de travaux pour le compte de tiers, maîtrise d'œuvre, contractant général et AMO exclus"
   ],
   "Contrats de construction de maison individuelle (CCMI)": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : contrats de construction de maison individuelle (CCMI) exclus"
   ],
   "Construisez-vous des immeubles de logements de plus de 6 étages (au-delà de R+6) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : logements collectifs au-delà de R+6 exclus"
   ],
   "Intervenez-vous sur des bâtiments de plus de 3 000 m² ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : bâtiments de plus de 3 000 m² exclus"
   ],
   "Donnez-vous des conseils sur la structure (murs porteurs, planchers, charpente) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : conseils ou préconisations sur les éléments structurels exclus"
   ],
   "Réalisez-vous des missions d'architecte (plans soumis à permis de construire) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : activités d'architecte exclues"
   ],
   "Suivez-vous ou réalisez-vous les travaux d'aménagement ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : activité garantie limitée au conseil en aménagement : suivi ou réalisation de travaux hors garantie"
   ],
   "Facturez-vous vous-même les travaux à vos clients, à la place des artisans ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : facturation directe des travaux entre le client et les artisans exclue"
   ],
   "Réalisez-vous des études ou des prescriptions techniques (bureau d'études) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : prescriptions techniques (ingénierie, bureau d'études) exclues"
   ],
   "Prenez-vous des décisions à la place du maître d'ouvrage (maître d'ouvrage délégué) ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : dommages résultant d'une prise de décision pour le compte du maître d'ouvrage exclus"
   ],
   "Intervenez-vous aussi comme maître d'œuvre ou réalisez-vous des travaux ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : maîtrise d'œuvre, contractant général et réalisation de travaux exclus"
   ],
   "Réalisez-vous ou suivez-vous les travaux que vous préconisez ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : mise en œuvre des solutions préconisées et suivi de travaux exclus"
   ],
   "Déposez-vous des dossiers de demande d'aides (MaPrimeRénov'…) au nom de vos clients ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : dépôt de dossiers de demande d'aides publiques pour le compte de tiers exclu"
   ],
   "Proposez-vous des travaux ou des solutions d'amélioration à vos clients ?": [
    "Oui",
    "Exclu des garanties RC Global Immo (Markel) : proposition ou prescription de travaux exclue"
   ],
   "Vos certifications sont-elles en cours de validité ?": [
    "Non",
    "Restriction RC Global Immo (Markel) : sans certification valide au jour du sinistre, la franchise est doublée"
   ]
  },
  "av": {
   "Date de naissance": "birthDate",
   "Adresse personnelle": "address",
   "Code postal": "postalCode",
   "Ville": "city",
   "Métier(s)": "profession",
   "Êtes-vous actuellement assuré en RC Pro ?": "currentlyInsured"
  },
  "siren": "Numéro SIREN ou SIRET",
  "sirens": [
   "Numéro SIREN ou SIRET"
  ]
 },
 "dommagesouvrage": {
  "cle": "dommagesouvrage",
  "demande": "Questionnaire assurance dommages-ouvrage",
  "court": "Dommages-ouvrage",
  "produit": "Assurance dommages-ouvrage",
  "mail": "assurance dommages-ouvrage",
  "sujet": "Votre devis Dommages-ouvrage",
  "declencheurs": [
   "Assurance dommages-ouvrage",
   "Assurance dommages-ouvrage (pro)",
   "Dommages-ouvrage"
  ],
  "rubriques": [
   [
    "Le souscripteur (maître d'ouvrage)",
    [
     "Vous êtes",
     "Raison sociale",
     "Numéro SIREN",
     "Date de naissance",
     "Profession",
     "Date d'effet souhaitée",
     "Adresse",
     "Complément d'adresse",
     "Code postal",
     "Ville"
    ]
   ],
   [
    "Le chantier",
    [
     "Adresse du chantier identique",
     "Adresse du chantier",
     "Complément d'adresse du chantier",
     "Code postal du chantier",
     "Ville du chantier",
     "N° de permis de construire",
     "Nom du programme"
    ]
   ],
   [
    "Le bâtiment",
    [
     "Type de travaux",
     "Type de construction",
     "Superficie totale",
     "Surface existante",
     "Valeur des existants à garantir",
     "Pente du terrain",
     "Le chantier est-il situé à moins de 300 mètres des côtes ?",
     "Distance du chantier par rapport à la mer (m)"
    ]
   ],
   [
    "Détails de la construction",
    [
     "Nombre de bâtiments",
     "Nombre d'habitations",
     "Nombre de locaux pro",
     "Nombre de piscines",
     "Niveaux de sous-sol",
     "Nombre d'étages",
     "La construction est destinée à",
     "Type de finition"
    ]
   ],
   [
    "Intervenants et situation du terrain",
    [
     "Un maître d'œuvre ou un architecte intervient-il sur le chantier ?",
     "Une étude de sol (G2) a-t-elle été réalisée ?",
     "Ouvrage déjà réceptionné",
     "L'ouvrage est-il inscrit ou classé monument historique ?"
    ]
   ],
   [
    "Coût et calendrier des travaux",
    [
     "Coût total de la construction, honoraires compris",
     "Ce montant est",
     "Date d'ouverture de chantier (DOC)",
     "Date de réception des travaux prévue",
     "Précisions éventuelles"
    ]
   ]
  ],
  "alertes": [
   "Le chantier est-il situé à moins de 300 mètres des côtes ?",
   "Ouvrage déjà réceptionné",
   "L'ouvrage est-il inscrit ou classé monument historique ?"
  ],
  "exclus": {},
  "av": {
   "Date de naissance": "birthDate",
   "Profession": "profession",
   "Adresse": "address",
   "Code postal": "postalCode",
   "Ville": "city"
  },
  "siren": "Numéro SIREN",
  "sirens": [
   "Numéro SIREN"
  ]
 },
 "decennale": {
  "cle": "decennale",
  "demande": "Questionnaire assurance RC Décennale",
  "court": "RC Décennale",
  "produit": "RC Décennale (pro)",
  "mail": "assurance RC Décennale",
  "sujet": "Votre devis RC Décennale",
  "declencheurs": [],
  "rubriques": [
   [
    "L'entreprise",
    [
     "Nom de la société (ou nom commercial)",
     "L'entreprise est-elle en cours de création ?",
     "Numéro SIREN ou SIRET",
     "Date de début d'activité prévue",
     "Forme juridique prévue",
     "Adresse prévue du siège",
     "Code postal du siège",
     "Ville du siège"
    ]
   ],
   [
    "Le dirigeant",
    [
     "Date de naissance"
    ]
   ],
   [
    "Votre activité",
    [
     "Métier(s)",
     "Répartition de votre chiffre d'affaires entre vos activités",
     "Votre métier n'est pas dans la liste : indiquez-le",
     "Décrivez précisément vos missions",
     "Vos missions touchent-elles à la structure du bâtiment (murs porteurs, planchers, charpente) ?",
     "Assurez-vous le suivi de chantier (DET) ou l'assistance à la réception des travaux (AOR) ?",
     "Réceptionnez-vous des travaux ou signez-vous des documents qui engagent le maître d'œuvre ?",
     "Intervenez-vous comme maître d'ouvrage délégué ou mandataire du maître d'ouvrage, ou réalisez-vous de la conception ou des travaux ?",
     "Signez-vous des contrats de construction de maison individuelle (CCMI) ?",
     "Réalisez-vous vous-même des travaux ?",
     "Réalisez-vous des missions de synthèse ou de maîtrise d'œuvre (conception ou suivi de travaux) ?",
     "Intervenez-vous sur du courant fort pour des ouvrages publics ou sur du génie civil ?",
     "Allez-vous au-delà de la mise en relation (suivi des travaux, facturation des travaux à la place des artisans) ?",
     "Intervenez-vous hors de France (métropole, Antilles, Guyane, Réunion, Saint-Barthélemy, Saint-Martin) ?"
    ]
   ],
   [
    "Chiffres clés",
    [
     "Chiffre d'affaires annuel ou prévisionnel",
     "Nombre de salariés",
     "Part de votre chiffre d'affaires sous-traitée",
     "Montant des travaux par chantier (le plus courant)",
     "Montant des travaux de votre plus gros chantier"
    ]
   ],
   [
    "Votre façon de travailler",
    [
     "Techniques non courantes ou matériaux non traditionnels",
     "Disposez-vous d'un service « Études » ?",
     "Réalisez-vous des études pour des tiers, en dehors de vos propres marchés ?",
     "Négoce, fabrication ou importation de matériaux",
     "Passez-vous des marchés tous corps d'état ?",
     "Avez-vous du personnel d'exécution (ouvriers sur les chantiers) ?",
     "Exercez-vous une activité de contractant général ?",
     "Exercez-vous une activité d'entreprise générale ?",
     "Êtes-vous constructeur de maisons individuelles ?",
     "Vendeur après achèvement",
     "Mandataire du propriétaire de l'ouvrage"
    ]
   ],
   [
    "Votre expérience",
    [
     "Avez-vous une expérience professionnelle dans l'activité demandée ?",
     "Nombre d'années d'expérience",
     "Diplômes et qualifications"
    ]
   ],
   [
    "Vos antécédents",
    [
     "Êtes-vous actuellement assuré en RC Décennale ?",
     "Depuis combien de temps n'êtes-vous plus assuré ?",
     "Nom de votre assureur actuel",
     "Un assureur a-t-il résilié votre contrat RC Décennale ?",
     "Motif de la résiliation",
     "La dette envers l'ancien assureur est-elle soldée ?",
     "L'entreprise est-elle en redressement judiciaire ?",
     "Votre responsabilité a-t-elle été mise en cause ces 5 dernières années (RC, décennale, dommages en cours de travaux) ?",
     "Nombre de sinistres",
     "Le montant total de ces sinistres dépasse-t-il 25 000 € ?",
     "Pour chaque sinistre : date, nature, montant et s'il est clos"
    ]
   ],
   [
    "Votre contrat",
    [
     "Date d'effet souhaitée",
     "Paiement souhaité"
    ]
   ]
  ],
  "alertes": [
   "Techniques non courantes ou matériaux non traditionnels",
   "Négoce, fabrication ou importation de matériaux",
   "Avez-vous du personnel d'exécution (ouvriers sur les chantiers) ?",
   "Vendeur après achèvement",
   "Mandataire du propriétaire de l'ouvrage",
   "L'entreprise est-elle en redressement judiciaire ?"
  ],
  "exclus": {
   "Vos missions touchent-elles à la structure du bâtiment (murs porteurs, planchers, charpente) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : l'architecte d'intérieur ne doit pas intervenir sur la structure (sinon activité Architecte)"
   ],
   "Assurez-vous le suivi de chantier (DET) ou l'assistance à la réception des travaux (AOR) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : architecte et architecte d'intérieur limités aux missions de conception (ESQ, AVP, APS, APD, permis, DCE)"
   ],
   "Réceptionnez-vous des travaux ou signez-vous des documents qui engagent le maître d'œuvre ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : l'assistant maître d'œuvre ne peut ni réceptionner ni engager le maître d'œuvre"
   ],
   "Intervenez-vous comme maître d'ouvrage délégué ou mandataire du maître d'ouvrage, ou réalisez-vous de la conception ou des travaux ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : AMO sans maîtrise d'ouvrage déléguée, mandat, conception ni réalisation"
   ],
   "Signez-vous des contrats de construction de maison individuelle (CCMI) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : construction de maisons individuelles (loi du 19/12/1990) exclue"
   ],
   "Réalisez-vous vous-même des travaux ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : aucun travaux de bâtiment pour cette activité"
   ],
   "Réalisez-vous des missions de synthèse ou de maîtrise d'œuvre (conception ou suivi de travaux) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : OPC sans synthèse ni maîtrise d'œuvre"
   ],
   "Intervenez-vous sur du courant fort pour des ouvrages publics ou sur du génie civil ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : courant fort (ouvrage public) et génie civil exclus"
   ],
   "Allez-vous au-delà de la mise en relation (suivi des travaux, facturation des travaux à la place des artisans) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : courtier en travaux limité à la mise en relation"
   ],
   "Intervenez-vous hors de France (métropole, Antilles, Guyane, Réunion, Saint-Barthélemy, Saint-Martin) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : territorialité limitée à la France métropolitaine et aux DROM cités"
   ],
   "Nombre de salariés": [
    "Plus de 10",
    "Exclu du contrat PIB MIC Zen (Kobalt) : 10 salariés maximum"
   ],
   "Part de votre chiffre d'affaires sous-traitée": [
    "30 % ou plus",
    "Exclu du contrat PIB MIC Zen (Kobalt) : sous-traitance limitée à 30 %"
   ],
   "Montant des travaux par chantier (le plus courant)": [
    "Plus de 500 000 €",
    "Exclu du contrat PIB MIC Zen (Kobalt) : intervention limitée à 500 000 € par marché"
   ],
   "Êtes-vous constructeur de maisons individuelles ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : construction de maisons individuelles exclue"
   ],
   "Depuis combien de temps n'êtes-vous plus assuré ?": [
    "Plus de 7 ans",
    "Exclu du contrat PIB MIC Zen (Kobalt) : absence d'assurance de plus de 7 ans"
   ],
   "Motif de la résiliation": [
    "Sinistres",
    "Exclu du contrat PIB MIC Zen (Kobalt) : résiliation pour sinistralité"
   ],
   "La dette envers l'ancien assureur est-elle soldée ?": [
    "Non",
    "Résiliation pour non-paiement non soldée : à régler avant toute souscription"
   ],
   "Nombre de sinistres": [
    "Plus de 3",
    "Exclu du contrat PIB MIC Zen (Kobalt) : plus de 3 sinistres"
   ],
   "Le montant total de ces sinistres dépasse-t-il 25 000 € ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : sinistres de plus de 25 000 €"
   ]
  },
  "av": {
   "Date de naissance": "birthDate",
   "Métier(s)": "profession"
  },
  "siren": "Numéro SIREN ou SIRET",
  "sirens": [
   "Numéro SIREN ou SIRET"
  ]
 }
};
/* FICHES:fin */

function ficheParDemande(type) {
  type = String(type || '').trim();
  for (var k in FICHES) if (FICHES[k].declencheurs.indexOf(type) >= 0) return FICHES[k];
  return null;
}
function ficheParQuestionnaire(type) {
  type = String(type || '').trim();
  for (var k in FICHES) if (FICHES[k].demande === type) return FICHES[k];
  return null;
}

var COLS = ['Reçue le', 'ID', 'Type de demande', 'Nom', 'Téléphone', 'E-mail', 'Territoire', 'Statut',
            'Lien envoyé le', 'Relancé le', 'Questionnaire reçu le'];

/* ---------- Installation (à exécuter une seule fois) ---------- */
function installer() {
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('DEPUIS')) p.setProperty('DEPUIS', String(Date.now()));
  feuille_();
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('traiter').timeBased().everyMinutes(5).create();
  traiter();
  Logger.log('Installé. Feuille de suivi : ' + feuille_().getParent().getUrl());
}

/* ---------- Traitement périodique ---------- */
function traiter() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return -1;
  try {
    var n = nouvellesDemandes_();
    try { n += etiquettes_(); } catch (e) { Logger.log('Étiquettes : ' + e); }
    relancer_();
    return n;
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Traitement immédiat (application Web) ----------
   Le site appelle cette adresse juste après l'envoi d'une demande : le script lit tout de suite la boîte
   au lieu d'attendre le passage des 5 minutes. L'appel ne transmet aucune donnée : il déclenche seulement
   la lecture des notifications Webflow (le passage toutes les 5 minutes reste en secours). */
function doGet() {
  var c = CacheService.getScriptCache();
  if (!c.get('appel')) {
    c.put('appel', '1', 20);
    for (var i = 0; i < 6; i++) {
      Utilities.sleep(i ? 6000 : 3000);
      if (traiter() > 0) break;
    }
  }
  return ContentService.createTextOutput('ok');
}

function nouvellesDemandes_() {
  var depuis = Number(PropertiesService.getScriptProperties().getProperty('DEPUIS') || Date.now());
  var sh = feuille_(), vus = {};
  lignes_(sh).forEach(function (r) { vus[r.v[1]] = 1; });
  var msgs = [];
  GmailApp.search(CFG.RECHERCHE, 0, 50).forEach(function (th) {
    th.getMessages().forEach(function (m) {
      if (m.getDate().getTime() >= depuis && !vus[m.getId()]) msgs.push(m);
    });
  });
  msgs.sort(function (a, b) { return a.getDate() - b.getDate(); });
  msgs.forEach(function (m) {
    var d = analyser(m.getPlainBody() || m.getBody().replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
    var ligne = [m.getDate(), m.getId(), d.type, d.nom, d.tel ? "'" + d.tel : '', d.email, d.territoire, '', '', '', ''];
    var statut;
    if (/^Questionnaire /i.test(d.type) && doublonContenu_(m)) {
      statut = 'Doublon';
    } else if (/^Questionnaire /i.test(d.type)) {
      statut = 'Questionnaire reçu';
      ligne[10] = m.getDate();
      marquerQuestionnaireRecu_(sh, d.email, m.getDate());
      try { envoyerRecap_(d, m.getBody() || m.getPlainBody()); m.markRead(); } catch (e) { Logger.log('Récapitulatif : ' + e); }
    } else if (ficheParDemande(d.type)) {
      if (!emailValide_(d.email)) statut = 'E-mail invalide';
      else if (dejaEnvoye_(sh, d.email, d.type)) statut = 'Doublon';
      else {
        envoyerLien_(d, false);
        statut = 'Lien envoyé';
        ligne[8] = new Date();
      }
    } else {
      statut = 'Sans questionnaire';
    }
    ligne[7] = statut;
    sh.appendRow(ligne);
    vus[m.getId()] = 1;
    if (statut !== 'Doublon') envoyerAssurevo_(d, /^Questionnaire /i.test(d.type) ? (m.getBody() || m.getPlainBody()) : m.getPlainBody());
  });
  if (msgs.length) sh.autoResizeColumns(1, COLS.length);
  return msgs.length;
}

/* ---------- Demandes reçues par mail : une étiquette Gmail posée par Bradley = envoi du questionnaire ----------
   Étiquettes « 0. ENVOYER LE QUESTIONNAIRE/RC Pro », « …/Habitation »… (une par questionnaire).
   Le script répond dans le fil du client avec le mail habituel et le lien, note la demande (feuille, Assurevo,
   relance à 48 h), puis remplace l'étiquette par « 0. ENVOYER LE QUESTIONNAIRE/Déjà envoyé ». */
var AUTO = { PREFIXE: '0. ENVOYER LE QUESTIONNAIRE/', FAIT: '0. ENVOYER LE QUESTIONNAIRE/Déjà envoyé', ERREUR: '0. ENVOYER LE QUESTIONNAIRE/Adresse introuvable' };
function etiquetteDe_(fiche) { return AUTO.PREFIXE + fiche.court.charAt(0).toUpperCase() + fiche.court.slice(1); }
function etiquette_(nom) { return GmailApp.getUserLabelByName(nom) || GmailApp.createLabel(nom); }
function estCabinet_(adr) { return /eloy\.assurances@gmail\.com|@eloy-assurances-patrimoine\.fr|no-reply-forms@webflow\.com/i.test(adr); }
function etiquettes_() {
  var n = 0, sh = null;
  etiquette_(AUTO.FAIT);
  Object.keys(FICHES).forEach(function (k) {
    var fiche = FICHES[k], lab = GmailApp.getUserLabelByName(etiquetteDe_(fiche));
    if (!lab) { etiquette_(etiquetteDe_(fiche)); return; }
    lab.getThreads(0, 20).forEach(function (th) {
      sh = sh || feuille_();
      var msgs = th.getMessages(), client = null;
      for (var i = msgs.length - 1; i >= 0 && !client; i--) if (!estCabinet_(msgs[i].getFrom())) client = msgs[i];
      th.removeLabel(lab);
      if (!client) { th.addLabel(etiquette_(AUTO.ERREUR)); return; }
      var from = client.getFrom(), m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/);
      var d = { type: fiche.declencheurs[0], nom: (m ? m[1] : '').trim(), email: (m ? m[2] : from).trim().toLowerCase(), tel: '', territoire: '', source: 'mail' };
      if (!emailValide_(d.email)) { th.addLabel(etiquette_(AUTO.ERREUR)); return; }
      if (!d.nom) d.nom = d.email.split('@')[0];
      if (!dejaEnvoye_(sh, d.email, d.type)) {
        envoyerLien_(d, false, client);
        sh.appendRow([new Date(), 'mail:' + th.getId(), d.type, d.nom, '', d.email, '', 'Lien envoyé', new Date(), '', '']);
        envoyerAssurevo_(d, 'Demande reçue par mail : ' + th.getFirstMessageSubject());
        n++;
      }
      th.addLabel(etiquette_(AUTO.FAIT));
    });
  });
  return n;
}

/* Le site envoie parfois deux fois la même demande à quelques secondes d'écart */
/* Doublon = même questionnaire reçu deux fois à l'identique (ancien envoi en double du site).
   Un client qui remplit plusieurs questionnaires (ex. trois logements) n'est plus considéré comme un doublon. */
function doublonContenu_(m) {
  var corps = String(m.getPlainBody() || m.getBody()).replace(/\s+/g, ' ');
  var h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, corps, Utilities.Charset.UTF_8));
  var c = CacheService.getScriptCache(), cle = 'q:' + h;
  if (c.get(cle)) return true;
  c.put(cle, '1', 21600);
  return false;
}
function doublonRecent_(sh, email, type, date) {
  return lignes_(sh).some(function (r) {
    var v = r.v;
    return String(v[5]).toLowerCase() === email && v[2] === type && v[0] instanceof Date && Math.abs(date - v[0]) < 10 * 60 * 1000;
  });
}

function relancer_() {
  var h = Number(Utilities.formatDate(new Date(), CFG.FUSEAU, 'H'));
  if (h < CFG.HEURES_RELANCE[0] || h >= CFG.HEURES_RELANCE[1]) return;
  var sh = feuille_(), limite = Date.now() - CFG.RELANCE_APRES_HEURES * 3600 * 1000;
  lignes_(sh).forEach(function (r) {
    var v = r.v;
    if (v[7] !== 'Lien envoyé' || !(v[8] instanceof Date) || v[8].getTime() > limite) return;
    envoyerLien_({ type: v[2], nom: v[3], tel: String(v[4] || ''), email: v[5] }, true);
    sh.getRange(r.n, 8, 1, 3).setValues([['Relancé', v[8], new Date()]]);
  });
}

/* ---------- Lecture du mail de notification du site ---------- */
function analyser(txt) {
  txt = String(txt || '').replace(/\r/g, '');
  function champ(re) { var m = txt.match(re); return m ? m[1].trim() : ''; }
  var STOP = '(?=\\s+(?:Message|Page|Formulaire|Segment|Territoire|Profession|Accord de recontact|Source publicitaire|Vous êtes)\\s*:|\\n|$)';
  return {
    nom: champ(/^\s*Nom:\s*(.+)$/m),
    tel: champ(/^\s*Telephone:\s*(.+)$/m),
    email: champ(/^\s*Email:\s*(\S+)/m).toLowerCase(),
    type: questionnaireDans_(txt) || champ(new RegExp('Type de demande\\s*:\\s*(.+?)' + STOP)),
    territoire: champ(/Territoire\s*:\s*(Martinique|Guadeloupe|Guyane)/i),
    profession: champ(new RegExp('Profession\\s*:\\s*(.+?)' + STOP))
  };
}

function questionnaireDans_(txt) {
  for (var k in FICHES) if (new RegExp('Type de demande\\s*:\\s*' + FICHES[k].demande.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'i').test(txt)) return FICHES[k].demande;
  return '';
}

/* ---------- Mails au client ---------- */
function lien_(d) {
  return CFG.SITE + '?questionnaire=' + ficheParDemande(d.type).cle + '&nom=' + encodeURIComponent(d.nom || '') +
    '&email=' + encodeURIComponent(d.email || '') + '&tel=' + encodeURIComponent(d.tel || '');
}

function envoyerLien_(d, relance, msgClient) {
  var fiche = ficheParDemande(d.type), produit = fiche.mail, url = lien_(d);
  var sujet, html, texte;
  var F = 'font-family:verdana,sans-serif;font-size:small;color:#222222';
  var bouton = '<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#1B66F7;border-radius:8px;padding:11px 20px">' +
    '<a href="' + url + '" style="color:#ffffff;text-decoration:none;font-family:verdana,sans-serif;font-size:13px;font-weight:bold">Compléter mon questionnaire</a></td></tr></table>';
  if (!relance) {
    sujet = fiche.sujet + ' – questionnaire à compléter';
    html = 'Bonjour,<br><br>Afin de vous transmettre votre proposition d\'<b>' + esc_(produit) + '</b>, merci de compléter ce questionnaire en ligne :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nAfin de vous transmettre votre proposition d\'' + produit + ', merci de compléter ce questionnaire en ligne :\n\n' +
      url + '\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  } else {
    sujet = 'Rappel – ' + fiche.sujet.replace(/^Votre/, 'votre');
    html = 'Bonjour,<br><br>Je n\'ai pas encore reçu votre questionnaire pour votre proposition d\'<b>' + esc_(produit) + '</b>.<br><br>Vous pouvez le compléter ici :<br><br>' +
      bouton + '<br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nJe n\'ai pas encore reçu votre questionnaire pour votre proposition d\'' + produit + '.\n\nVous pouvez le compléter ici :\n\n' +
      url + '\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  }
  html = '<div dir="ltr"><div style="' + F + '">' + html + '</div><br><div style="' + F + '">Bien à vous,</div><br>' + SIGNATURE + '</div>';
  texte += '\nBien à vous,\n\nBradley Village\nCourtier en assurances et crédits\n06 96 33 29 09\ncontact@eloy-assurances-patrimoine.fr\neloy-assurances-patrimoine.fr\n' +
    'Immeuble Lina\'s, Mangot Vulcin, 97232 Le Lamentin\n\nEloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (www.orias.fr).';
  if (msgClient) msgClient.reply(texte, { htmlBody: html });
  else GmailApp.sendEmail(d.email, sujet, texte, { htmlBody: html });
}

/* Signature Gmail de Bradley (copie de celle de eloy.assurances@gmail.com, 07/11/2026).
   Si la signature Gmail change, la recopier ici (Gmail : Paramètres → Signature). */
var SIGNATURE = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;max-width:460px;border-collapse:collapse;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0B1220\">\n<tr><td style=\"padding:0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\"><tr>\n  <td valign=\"middle\" style=\"padding:0 14px 0 0;width:64px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"text-decoration:none\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/bloc-eloy-carre.png\" width=\"64\" height=\"64\" alt=\"Eloy\" style=\"display:block;width:64px;height:64px;border:0\"></a></td>\n  <td valign=\"middle\" style=\"padding:0\">\n   <div style=\"font-size:19px;line-height:24px;font-weight:800\">Bradley Village</div>\n   <div style=\"font-size:13px;line-height:18px;font-weight:600;color:#1B66F7\">Courtier en assurances et crédits</div>\n  </td>\n </tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-size:13px;line-height:18px\">\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-tel.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"tel:+596696332909\" style=\"color:#0B1220;font-weight:700;text-decoration:none\">06 96 33 29 09</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-mail.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"mailto:contact@eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">contact@eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-web.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 0 0;vertical-align:top;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-lieu.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0;margin-top:2px\"></td><td style=\"padding:0;color:#3A4356\">Immeuble Lina's, Mangot Vulcin, 97232 Le Lamentin</td></tr>\n </table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"background:#1B66F7;border-radius:999px;padding:8px 16px\"><a href=\"https://www.eloy-assurances-patrimoine.fr/contact\" style=\"color:#FFFFFF;font-size:12.5px;line-height:16px;font-weight:700;text-decoration:none\">Être rappelé sous 24 h</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;background:#EAF1FE;border-radius:10px\"><tr><td style=\"padding:8px 12px;font-size:12px;line-height:18px;font-weight:700;color:#0B1220\"><a href=\"https://www.eloy-assurances-patrimoine.fr/assurances/professionnels\" style=\"color:#0B1220;text-decoration:none\">Assurance</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/credits/rachat\" style=\"color:#0B1220;text-decoration:none\">Rachat&nbsp;de&nbsp;crédit</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/financement-pro\" style=\"color:#0B1220;text-decoration:none\">Financement&nbsp;pro</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:10px 0 0;font-size:10px;line-height:15px;color:#5B6478\">Eloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (<a href=\"https://www.orias.fr\" style=\"color:#5B6478\">www.orias.fr</a>). Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.</td></tr>\n</table>";

/* ---------- Récapitulatif lisible d'un questionnaire reçu (envoyé à la boîte du cabinet) ---------- */
function reponses(txt, labels) {
  txt = String(txt || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, '\'').replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\r/g, '');
  var i = txt.indexOf('Type de demande'); if (i >= 0) txt = txt.slice(i);
  var j = txt.search(/\n\s*Consentement:/); if (j >= 0) txt = txt.slice(0, j);
  var all = labels.concat(['Type de demande', 'Accord de recontact', 'Page']).sort(function (a, b) { return b.length - a.length; });
  var re = new RegExp('(?:^|\\s)(' + all.map(function (l) { return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ') : ', 'g');
  var out = {}, m, last = null, pos = 0;
  while ((m = re.exec(txt))) {
    if (last) out[last] = txt.slice(pos, m.index).trim();
    last = m[1]; pos = re.lastIndex;
  }
  if (last) out[last] = txt.slice(pos).trim();
  return out;
}

/* ---------- Registre des entreprises (recherche-entreprises.api.gouv.fr, gratuit, sans clé) ---------- */
var FORMES = { '1000': 'Entrepreneur individuel', '5498': 'EURL', '5499': 'SARL', '5710': 'SAS', '5720': 'SASU', '5485': 'SELARL',
  '5785': 'SELAS', '5385': 'SELAFA', '6540': 'SCI', '9220': 'Association déclarée', '5599': 'SA', '5306': 'SNC', '6585': 'Société civile' };
function registre_(siren) {
  var n = String(siren || '').replace(/\D/g, '').slice(0, 9);
  if (n.length !== 9) return null;
  /* 1. API Recherche d'entreprises (avec les dirigeants) ; elle refuse parfois les serveurs Google (erreur 502) */
  try {
    var r = UrlFetchApp.fetch('https://recherche-entreprises.api.gouv.fr/search?q=' + n, { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
    if (r.getResponseCode() === 200) {
      var e = (JSON.parse(r.getContentText()).results || []).filter(function (x) { return x.siren === n; })[0];
      if (!e) return { trouve: false, siren: n };
      var sg = e.siege || {};
      return { trouve: true, siren: n, nom: e.nom_complet, creation: (e.date_creation || '').split('-').reverse().join('/'),
        forme: FORMES[e.nature_juridique] || ('code ' + e.nature_juridique), naf: e.activite_principale, adresse: sg.adresse,
        actif: e.etat_administratif === 'A',
        dirigeants: (e.dirigeants || []).map(function (x) { return x.type_dirigeant === 'personne physique' ? (x.prenoms + ' ' + x.nom + (x.qualite ? ' (' + x.qualite + ')' : '')) : (x.denomination || ''); }).filter(String).join(', ') };
    }
    Logger.log('Registre (api.gouv) ' + r.getResponseCode() + ', bascule sur la base Sirene OpenDataSoft');
  } catch (err) { Logger.log('Registre (api.gouv) : ' + err); }
  /* 2. Base Sirene publiée par OpenDataSoft (gratuite, sans clé, mise à jour mensuelle, sans les dirigeants) */
  try {
    var u = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/economicref-france-sirene-v3/records?limit=5&where=' +
      encodeURIComponent('siren="' + n + '"');
    var r2 = UrlFetchApp.fetch(u, { muteHttpExceptions: true, headers: { Accept: 'application/json' } });
    if (r2.getResponseCode() !== 200) { Logger.log('Registre (Sirene) ' + r2.getResponseCode() + ' : ' + r2.getContentText().slice(0, 200)); return null; }
    var L = JSON.parse(r2.getContentText()).results || [];
    if (!L.length) return { trouve: false, siren: n };
    var x = L.filter(function (y) { return y.etablissementsiege === 'oui'; })[0] || L[0];
    var nom = x.denominationunitelegale || [x.prenom1unitelegale, x.nomunitelegale].filter(Boolean).join(' ');
    if (x.denominationusuelleetablissement && x.denominationusuelleetablissement !== nom) nom += ' (' + x.denominationusuelleetablissement + ')';
    var adr = [x.complementadresseetablissement, [x.numerovoieetablissement, x.typevoieetablissement, x.libellevoieetablissement].filter(Boolean).join(' '),
      [x.codepostaletablissement, x.libellecommuneetablissement].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    return { trouve: true, siren: n, nom: nom, creation: String(x.datecreationunitelegale || '').split('-').reverse().join('/'),
      forme: FORMES[x.categoriejuridiqueunitelegale] || (x.categoriejuridiqueunitelegale ? 'code ' + x.categoriejuridiqueunitelegale : ''),
      naf: [x.activiteprincipaleunitelegale, x.groupeunitelegale].filter(Boolean).join(' – '), adresse: adr,
      actif: /^Acti/i.test(x.etatadministratifunitelegale || ''), dirigeants: '' };
  } catch (err2) { Logger.log('Registre (Sirene) : ' + err2); return null; }
}
/* Test : exécuter testerRegistre dans l'éditeur, puis lire le journal */
function testerRegistre() { Logger.log(JSON.stringify(registre_('919934075'))); }
function lignesRegistre_(g) {
  if (!g) return [];
  if (!g.trouve) return [['Registre', 'SIREN ' + g.siren + ' introuvable : à vérifier']];
  return [['Nom au registre', g.nom], ['État', g.actif ? 'Active' : 'Fermée'], ['Date de création', g.creation], ['Forme juridique', g.forme],
    ['Code NAF', g.naf], ['Adresse du siège', g.adresse], ['Dirigeant(s)', g.dirigeants]].filter(function (x) { return x[1]; });
}

/* Réponse qui déclenche une exclusion ou une restriction d'assureur (champ « x » de questionnaires.json) : renvoie le texte, sinon '' */
function exclusion_(fiche, l, v) {
  var e = (fiche.exclus || {})[l];
  return e && String(v || '').indexOf(e[0]) === 0 ? e[1] : '';
}
function exclusions_(fiche, rep) {
  return Object.keys(fiche.exclus || {}).filter(function (l) { return exclusion_(fiche, l, rep[l]); }).map(function (l) { return l.replace(/ \?$/, '') + ' : ' + rep[l] + ' → ' + fiche.exclus[l][1]; });
}

function recapHtml(d, corps) {
  var fiche = ficheParQuestionnaire(d.type) || FICHES.habitation, R = fiche.rubriques, labels = [];
  R.forEach(function (r) { labels = labels.concat(r[1]); });
  var rep = reponses(corps, labels), alertes = [], exclus = [];
  /* Registre des entreprises : un bloc par SIREN saisi (RC Pro, ou société propriétaire de chaque bien) */
  var regs = (fiche.sirens || (fiche.siren ? [fiche.siren] : [])).filter(function (l) { return rep[l]; }).map(function (l) {
    var g = registre_(rep[l]), pre = (l.match(/^Bien \d+ – /) || [''])[0];
    if (g && (!g.trouve || !g.actif)) alertes.push(pre + (!g.trouve ? 'SIREN introuvable au registre' : 'Entreprise fermée au registre'));
    return { l: l, g: g, titre: pre + 'Registre des entreprises' };
  });
  var tel = String(d.tel || '').replace(/\s/g, '');
  var T = 'font-family:verdana,sans-serif;color:#0B1220';
  var h = '<div style="' + T + ';max-width:640px">' +
    '<div style="background:#1B66F7;color:#ffffff;border-radius:10px 10px 0 0;padding:16px 20px">' +
    '<div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.85">' + esc_(d.type) + '</div>' +
    '<div style="font-size:20px;font-weight:bold;margin-top:4px">' + esc_(d.nom) + '</div>' +
    '<div style="font-size:13px;margin-top:6px">' + esc_(d.tel) + ' · ' + esc_(d.email) + '</div></div>' +
    '<div style="border:1px solid #DDE4F0;border-top:0;border-radius:0 0 10px 10px;padding:6px 20px 18px">';
  function blocRegistre(x) {
    if (!x.g) return;
    h += '<div style="font-size:14px;font-weight:bold;color:#1B66F7;margin:18px 0 6px">' + esc_(x.titre) + '</div>' +
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px">';
    lignesRegistre_(x.g).forEach(function (y) {
      h += '<tr><td style="padding:6px 10px 6px 0;border-bottom:1px solid #EEF2F8;color:#5B6475;width:58%;vertical-align:top">' + esc_(y[0]) + '</td>' +
        '<td style="padding:6px 0;border-bottom:1px solid #EEF2F8;font-weight:bold;vertical-align:top">' + esc_(y[1]) + '</td></tr>';
    });
    h += '</table>';
  }
  R.forEach(function (r, i) {
    if (i > 0) regs.forEach(function (x) { if (R[i - 1][1].indexOf(x.l) >= 0) blocRegistre(x); });
    var lignes = r[1].filter(function (l) { return rep[l]; });
    if (!lignes.length) return;
    h += '<div style="font-size:14px;font-weight:bold;color:#1B66F7;margin:18px 0 6px">' + esc_(r[0]) + '</div>' +
      '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px">';
    lignes.forEach(function (l) {
      var v = / €$/.test(rep[l]) ? rep[l].replace(/\d+/g, function (n) { return n.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }) : rep[l], alerte = fiche.alertes.indexOf(l) >= 0 && /^Oui/i.test(v);
      var ex = exclusion_(fiche, l, v);
      if (alerte) alertes.push(l.replace(/ \?$/, ''));
      if (ex) exclus.push([l, v, ex]);
      h += '<tr><td style="padding:6px 10px 6px 0;border-bottom:1px solid #EEF2F8;color:#5B6475;width:58%;vertical-align:top">' + esc_(l) + '</td>' +
        '<td style="padding:6px 0;border-bottom:1px solid #EEF2F8;font-weight:bold;vertical-align:top;color:' + (ex ? '#B42318' : alerte ? '#C2410C' : '#0B1220') + '">' + esc_(v) +
        (ex ? '<div style="font-weight:normal;font-size:12px;margin-top:3px">' + esc_(ex) + '</div>' : '') + '</td></tr>';
    });
    h += '</table>';
  });
  regs.forEach(function (x) { if (R[R.length - 1][1].indexOf(x.l) >= 0) blocRegistre(x); });
  var CORPS = '<div style="border:1px solid #DDE4F0;border-top:0;border-radius:0 0 10px 10px;padding:6px 20px 18px">', haut = '';
  if (exclus.length) haut += '<div style="margin-top:14px;background:#FDECEA;color:#B42318;border:1px solid #F5C2BC;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5">' +
    '<b>ACTIVITÉS EXCLUES OU RESTREINTES</b>' + exclus.map(function (x) { return '<div style="margin-top:6px">• ' + esc_(x[0]) + ' <b>' + esc_(x[1]) + '</b><br>' + esc_(x[2]) + '</div>'; }).join('') + '</div>';
  if (alertes.length) haut += '<div style="margin-top:14px;background:#FFF1E6;color:#9A3412;border-radius:8px;padding:10px 12px;font-size:13px"><b>À vérifier :</b> ' +
      alertes.map(esc_).join(' · ') + '</div>';
  if (haut) h = h.replace(CORPS, CORPS + haut);
  h += '<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px"><tr>' +
    '<td style="background:#1B66F7;border-radius:8px;padding:10px 18px"><a href="mailto:' + esc_(d.email) + '?subject=' + encodeURIComponent(fiche.sujet) +
    '" style="color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold">Répondre au client</a></td><td style="width:10px"></td>' +
    (tel ? '<td style="border:1px solid #1B66F7;border-radius:8px;padding:9px 18px"><a href="tel:' + esc_(tel) + '" style="color:#1B66F7;text-decoration:none;font-size:13px;font-weight:bold">Appeler</a></td>' : '') +
    '</tr></table>';
  if (rep['Accord de recontact']) h += '<div style="font-size:11px;color:#5B6475;margin-top:14px">Accord de recontact : ' + esc_(rep['Accord de recontact']) + '</div>';
  return h + '</div></div>';
}

function envoyerRecap_(d, corps) {
  var fiche = ficheParQuestionnaire(d.type) || FICHES.habitation;
  var labels = []; fiche.rubriques.forEach(function (r) { labels = labels.concat(r[1]); });
  var ex = exclusions_(fiche, reponses(corps, labels));
  GmailApp.sendEmail(CFG.BOITE, (ex.length ? '⚠ EXCLUSION – ' : '') + 'Questionnaire ' + fiche.court + ' reçu – ' + d.nom,
    'Questionnaire reçu de ' + d.nom + ' (' + d.tel + ', ' + d.email + ').', { htmlBody: recapHtml(d, corps), replyTo: d.email });
}

/* ---------- Assurevo (actif dès que la propriété du script ASSUREVO_URL est renseignée) ----------
   Doc : https://docs.assurevo.fr (Réception de leads). Le jeton de l'URL est un secret : il reste dans les
   propriétés du script, jamais dans ce fichier. Succès = 201. Rapprochement des contacts par e-mail. */
var BESOIN = { 'mutuelle': 'mutuelle', 'santé': 'sante', 'prévoyance': 'prevoyance', 'retraite': 'retraite', 'per': 'retraite',
  'assurance vie': 'assurance_vie', 'protection juridique': 'protection_juridique' };

function assurevoPayload(d, corps) {
  var fiche = ficheParQuestionnaire(d.type);
  var produit = fiche ? fiche.produit : d.type;
  var p = { email: d.email || undefined, phone: d.tel || undefined, fullName: d.nom || undefined, source: d.source || 'site', product: produit,
    meta: { origine: 'Site Eloy', territoire: d.territoire || undefined } };
  if (d.profession) p.profession = d.profession;
  var low = produit.toLowerCase();
  Object.keys(BESOIN).some(function (k) { if (low.indexOf(k) >= 0) { p.mainNeed = BESOIN[k]; return true; } return false; });
  if (fiche) {
    var labels = [];
    fiche.rubriques.forEach(function (r) { labels = labels.concat(r[1]); });
    var rep = reponses(corps, labels);
    Object.keys(fiche.av).forEach(function (l) {
      if (!rep[l]) return;
      var cleAv = fiche.av[l];
      p[cleAv] = cleAv === 'currentlyInsured' ? /^oui/i.test(rep[l]) : rep[l];
    });
    var alertes = labels.filter(function (l) { return fiche.alertes.indexOf(l) >= 0 && /^Oui/i.test(rep[l] || ''); });
    var ex = exclusions_(fiche, rep);
    p.message = 'Questionnaire ' + fiche.court + ' rempli en ligne.' + (ex.length ? ' ⚠ EXCLUSIONS : ' + ex.join(' | ') + '.' : '') + (alertes.length ? ' À vérifier : ' + alertes.join(' · ') : '');
    if (ex.length) p['⚠ Exclusions'] = ex.join(' | ');
    /* Chaque réponse en champ séparé : Assurevo l'affiche question par question dans « Lead reçu » */
    labels.forEach(function (l) { if (rep[l] && !p.hasOwnProperty(l)) p[l] = rep[l]; });
    (fiche.sirens || (fiche.siren ? [fiche.siren] : [])).forEach(function (l) {
      if (!rep[l]) return;
      var pre = (l.match(/^Bien \d+ – /) || [''])[0];
      lignesRegistre_(registre_(rep[l])).forEach(function (x) { p[pre + 'Registre – ' + x[0]] = x[1]; });
    });
  } else {
    var txt = String(corps || '').replace(/\r/g, ''), m = txt.match(/Message:\s*([\s\S]*?)\n\s*Consentement:/);
    p.message = (m ? m[1] : (d.source === 'mail' ? txt : '')).replace(/^Type de demande\s*:[^\n]*?(?=\s+Message\s*:|\n|$)/, '').replace(/\s+/g, ' ').trim().replace(/^Message\s*:\s*/, '').slice(0, 2000);
  }
  Object.keys(p).forEach(function (k) { if (p[k] === undefined || p[k] === '') delete p[k]; });
  return p;
}

/* Seules les demandes d'ASSURANCE et de PATRIMOINE vont dans Assurevo (décision de Bradley, 07/11/2026).
   Rachat de crédits, crédit immobilier, financement pro (crédit-bail, Girardin), partenariats et autres : jamais. */
function pourAssurevo(type) {
  type = String(type || '').trim();
  if (/cr[ée]dit|girardin|financement|d[ée]fiscalisation|partenari|autre question|^contact$/i.test(type)) return false;
  return /^(Questionnaire assurance|Assurance|Mutuelle|Prévoyance|RC |Responsabilité civile|Garantie homme|Protection juridique|Cyber|Flotte|Plan d'épargne|Épargne)/i.test(type);
}

function envoyerAssurevo_(d, corps) {
  var url = PropertiesService.getScriptProperties().getProperty('ASSUREVO_URL');
  if (!url || (!d.email && !d.tel) || !pourAssurevo(d.type)) return;
  try {
    var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify(assurevoPayload(d, corps)) });
    if (r.getResponseCode() !== 201 && r.getResponseCode() !== 200) Logger.log('Assurevo ' + r.getResponseCode() + ' : ' + r.getContentText().slice(0, 300));
  } catch (e) { Logger.log('Assurevo : ' + e); }
}

/* Test : envoie le dernier questionnaire reçu à Assurevo (après avoir renseigné ASSUREVO_URL) */
function testerAssurevo() {
  var url = PropertiesService.getScriptProperties().getProperty('ASSUREVO_URL');
  if (!url) { Logger.log('Renseigner d\'abord ASSUREVO_URL dans les propriétés du script.'); return; }
  var m = null;
  GmailApp.search('from:no-reply-forms@webflow.com newer_than:7d', 0, 20).forEach(function (th) {
    th.getMessages().forEach(function (x) {
      if (/Type de demande\s*:\s*Questionnaire assurance/i.test(x.getPlainBody()) && (!m || x.getDate() > m.getDate())) m = x;
    });
  });
  if (!m) { Logger.log('Aucun questionnaire reçu ces 7 derniers jours.'); return; }
  var d = analyser(m.getPlainBody());
  Logger.log('Envoi du questionnaire de ' + d.nom + ' (' + d.email + ')');
  var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify(assurevoPayload(d, m.getBody() || m.getPlainBody())) });
  Logger.log('Assurevo ' + r.getResponseCode() + ' : ' + r.getContentText());
}

/* ---------- Feuille de suivi ---------- */
function feuille_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FEUILLE_ID'), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(CFG.FEUILLE);
    p.setProperty('FEUILLE_ID', ss.getId());
    var sh0 = ss.getSheets()[0];
    sh0.setName('Demandes');
    sh0.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#EAF1FE');
    sh0.setFrozenRows(1);
    sh0.hideColumns(2);
    ss.setSpreadsheetTimeZone(CFG.FUSEAU);
  }
  return ss.getSheetByName('Demandes');
}

function lignes_(sh) {
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getValues().map(function (v, i) { return { n: i + 2, v: v }; });
}

function dejaEnvoye_(sh, email, type) {
  var limite = Date.now() - 30 * 24 * 3600 * 1000;
  return lignes_(sh).some(function (r) {
    var v = r.v;
    return String(v[5]).toLowerCase() === email && v[2] === type && v[0] instanceof Date && v[0].getTime() > limite &&
      /^(Lien envoyé|Relancé|Questionnaire reçu)$/.test(v[7]);
  });
}

function marquerQuestionnaireRecu_(sh, email, date) {
  if (!email) return;
  lignes_(sh).forEach(function (r) {
    var v = r.v;
    if (String(v[5]).toLowerCase() === email && /^(Lien envoyé|Relancé)$/.test(v[7])) {
      sh.getRange(r.n, 8).setValue('Questionnaire reçu');
      sh.getRange(r.n, 11).setValue(date);
    }
  });
}

function emailValide_(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || ''); }
function esc_(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------- Test : envoie le mail du questionnaire habitation à votre propre adresse ---------- */
function testerMail() {
  envoyerLien_({ type: 'Assurance habitation', nom: 'Test Eloy', tel: '0696000000', email: Session.getActiveUser().getEmail() }, false);
}
