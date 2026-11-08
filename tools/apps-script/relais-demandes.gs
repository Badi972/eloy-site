/**
 * Eloy – relais automatique des demandes du site (Google Apps Script)
 * À installer dans le compte Google eloy.assurances@gmail.com (celui qui reçoit les demandes du site).
 *
 * Toutes les 5 minutes :
 *  1. lit les nouvelles demandes envoyées par le site (mails « New form submission on Webflow ») ;
 *  2. pour un produit qui a un questionnaire en ligne, envoie au client un mail avec le lien du questionnaire ;
 *     pour un produit à questionnaire PDF (transporteurs et logisticiens), le mail avec le PDF en pièce jointe ;
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
  ],
  "metier": null,
  "mi": {},
  "lim": []
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
  ],
  "metier": "Métier(s)",
  "mi": {},
  "lim": []
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
     "Date d'effet souhaitée",
     "Profession",
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
  ],
  "metier": null,
  "mi": {},
  "lim": []
 },
 "decennale": {
  "cle": "decennale",
  "demande": "Questionnaire assurance RC Décennale",
  "court": "RC Décennale",
  "produit": "RC Décennale (pro)",
  "mail": "assurance RC Décennale",
  "sujet": "Votre devis RC Décennale",
  "declencheurs": [
   "RC Décennale",
   "RC Décennale (pro)"
  ],
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
     "Missions habituelles",
     "Vos missions touchent-elles à la structure du bâtiment (murs porteurs, planchers, charpente) ?",
     "Assurez-vous le suivi de chantier (DET) ou l'assistance à la réception des travaux (AOR) ?",
     "Réceptionnez-vous des travaux ou signez-vous des documents qui engagent le maître d'œuvre ?",
     "Intervenez-vous comme maître d'ouvrage délégué ou mandataire du maître d'ouvrage, ou réalisez-vous de la conception ou des travaux ?",
     "Signez-vous des contrats de construction de maison individuelle (CCMI) ?",
     "Réalisez-vous vous-même des travaux ?",
     "Réalisez-vous des missions de synthèse ou de maîtrise d'œuvre (conception ou suivi de travaux) ?",
     "Intervenez-vous sur du courant fort pour des ouvrages publics ou sur du génie civil ?",
     "Allez-vous au-delà de la mise en relation (suivi des travaux, facturation des travaux à la place des artisans) ?"
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
   "Un assureur a-t-il résilié votre contrat RC Décennale ?",
   "L'entreprise est-elle en redressement judiciaire ?",
   "Votre responsabilité a-t-elle été mise en cause ces 5 dernières années (RC, décennale, dommages en cours de travaux) ?"
  ],
  "exclus": {
   "Vos missions touchent-elles à la structure du bâtiment (murs porteurs, planchers, charpente) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : l'architecte d'intérieur ne doit pas intervenir sur la structure (sinon activité Architecte)",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Assurez-vous le suivi de chantier (DET) ou l'assistance à la réception des travaux (AOR) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) pour l'activité Architecte (conception seule, de l'esquisse au DCE). Suivi de chantier et réception : déclarer aussi Maître d'œuvre TCE (n° 12)",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Réceptionnez-vous des travaux ou signez-vous des documents qui engagent le maître d'œuvre ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : l'assistant maître d'œuvre ne peut ni réceptionner ni engager le maître d'œuvre",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Intervenez-vous comme maître d'ouvrage délégué ou mandataire du maître d'ouvrage, ou réalisez-vous de la conception ou des travaux ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : AMO sans maîtrise d'ouvrage déléguée, mandat, conception ni réalisation",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Signez-vous des contrats de construction de maison individuelle (CCMI) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : construction de maisons individuelles (loi du 19/12/1990) exclue",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Réalisez-vous vous-même des travaux ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : aucun travaux de bâtiment pour cette activité",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Réalisez-vous des missions de synthèse ou de maîtrise d'œuvre (conception ou suivi de travaux) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : OPC sans synthèse ni maîtrise d'œuvre",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Intervenez-vous sur du courant fort pour des ouvrages publics ou sur du génie civil ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : courant fort (ouvrage public) et génie civil exclus",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Allez-vous au-delà de la mise en relation (suivi des travaux, facturation des travaux à la place des artisans) ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : courtier en travaux limité à la mise en relation",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Nombre de salariés": [
    [
     "11 à 30",
     "Plus de 30"
    ],
    "Exclu du contrat PIB MIC Zen (Kobalt) : 10 salariés maximum",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Part de votre chiffre d'affaires sous-traitée": [
    "30 % ou plus",
    "Sous-traitance limitée à 30 % du chiffre d'affaires"
   ],
   "Montant des travaux par chantier (le plus courant)": [
    "Plus de 500 000 €",
    "Exclu du contrat PIB MIC Zen (Kobalt) : intervention limitée à 500 000 € par marché",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Êtes-vous constructeur de maisons individuelles ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : construction de maisons individuelles exclue",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Depuis combien de temps n'êtes-vous plus assuré ?": [
    "Plus de 7 ans",
    "Exclu du contrat PIB MIC Zen (Kobalt) : absence d'assurance de plus de 7 ans",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Motif de la résiliation": [
    "Sinistres",
    "Exclu du contrat PIB MIC Zen (Kobalt) : résiliation pour sinistralité",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "La dette envers l'ancien assureur est-elle soldée ?": [
    "Non",
    "Résiliation pour non-paiement non soldée : à régler avant toute souscription"
   ],
   "Nombre de sinistres": [
    "Plus de 3",
    "Exclu du contrat PIB MIC Zen (Kobalt) : plus de 3 sinistres",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ],
   "Le montant total de ces sinistres dépasse-t-il 25 000 € ?": [
    "Oui",
    "Exclu du contrat PIB MIC Zen (Kobalt) : sinistres de plus de 25 000 €",
    [
     "Architecte",
     "Architecte d'intérieur",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Contractant général",
     "Coordinateur SPS",
     "Courtier en travaux",
     "Dessinateur en bâtiment",
     "Diagnostiqueur immobilier",
     "Économiste de la construction",
     "Géotechnicien",
     "Maître d'œuvre TCE",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Paysagiste décorateur",
     "Topographe / métreur"
    ]
   ]
  },
  "av": {
   "Date de naissance": "birthDate",
   "Métier(s)": "profession"
  },
  "siren": "Numéro SIREN ou SIRET",
  "sirens": [
   "Numéro SIREN ou SIRET"
  ],
  "metier": "Métier(s)",
  "mi": {
   "Démolition sans explosifs (démolisseur)": [
    "i",
    "1.1 · RCBAT+ ou Ocealiz (classe 2), ou RCD ZEN : comparer les tarifs"
   ],
   "Démolition avec explosifs": [
    "x",
    "1.2 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Terrassement, sondages et forages (terrassier)": [
    "i",
    "1.3 · RCBAT+ ou Ocealiz (classe 5), ou RCD ZEN (sans sondages ni forages) : comparer les tarifs"
   ],
   "Enrochements": [
    "x",
    "1.3.1 · exclue chez APRIL ; seul l'enrochement non lié est couvert, dans le terrassement Ocealiz (1.3, classe 5)"
   ],
   "Amélioration des sols": [
    "x",
    "1.4 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "VRD : voiries, réseaux, assainissement, clôtures": [
    "i",
    "1.5 · RCBAT+ ou Ocealiz (classe 5,5), ou RCD ZEN : comparer les tarifs"
   ],
   "Paysagiste (espaces verts, arrosage, clôtures)": [
    "i",
    "1.5.1 · RCBAT+ ou Ocealiz (classe 8), ou RCD ZEN : comparer les tarifs"
   ],
   "Montage d'échafaudage, étaiement": [
    "i",
    "1.6 · Marché d'échafaudage seul : Ocealiz (classe 4) ou RCD ZEN. Échafaudage suivi de travaux : couvert par l'activité de ces travaux"
   ],
   "Désamiantage (traitement de l'amiante)": [
    "x",
    "1.7 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Traitement des termites, insectes xylophages et champignons": [
    "x",
    "1.8 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Assèchement des murs": [
    "i",
    "1.9 · RCBAT+ ou Ocealiz (classe 3), ou RCD ZEN : comparer les tarifs"
   ],
   "Fondations spéciales (pieux, micropieux, parois moulées)": [
    "x",
    "2.1 · exclue chez APRIL, non proposée par Ocealiz ; les fondations superficielles relèvent de la maçonnerie"
   ],
   "Maçonnerie et béton armé (maçon)": [
    "i",
    "2.2 · RCBAT+ ou Ocealiz (classe 4,5), ou RCD ZEN : comparer les tarifs"
   ],
   "Enduits de façade (façadier)": [
    "i",
    "2.2.1 · RCBAT+ ou Ocealiz (classe 5) : comparer les tarifs"
   ],
   "Taille de pierres": [
    "i",
    "2.2.2 · RCBAT+ seul (exclue chez RCD ZEN)"
   ],
   "Revêtement vertical en matériaux durs agrafés ou attachés": [
    "i",
    "4.10 · Ocealiz (classe 8) ou RCD ZEN"
   ],
   "Béton précontraint in situ": [
    "x",
    "2.3 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Charpente et structures en bois (charpentier)": [
    "i",
    "2.4 · RCBAT+ ou Ocealiz (classe 6), ou RCD ZEN : comparer les tarifs"
   ],
   "Charpente et structures métalliques": [
    "i",
    "2.5 · RCBAT+ ou Ocealiz (classe 6), ou RCD ZEN : comparer les tarifs"
   ],
   "Couverture (couvreur)": [
    "i",
    "3.1 · RCBAT+ ou Ocealiz (classe 2), ou RCD ZEN : comparer les tarifs"
   ],
   "Couverture par grands éléments": [
    "i",
    "3.1.1 · RCBAT+ seul (incluse dans la couverture chez Ocealiz)"
   ],
   "Zinguerie": [
    "i",
    "3.1.2 · RCBAT+ seul (incluse dans la couverture chez Ocealiz)"
   ],
   "Étanchéité de toiture, terrasse et plancher (étancheur)": [
    "i",
    "3.2 · Ocealiz (classe 1) ou RCD ZEN"
   ],
   "Cuvelages et réservoirs": [
    "x",
    "3.3 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Calfeutrement et étanchéité des façades": [
    "i",
    "3.4 · RCBAT+ ou Ocealiz (classe 5) : comparer les tarifs (exclue chez RCD ZEN)"
   ],
   "Menuiseries extérieures : fenêtres, portes, volets": [
    "i",
    "3.5 · RCBAT+ ou Ocealiz (classe 7,1), ou RCD ZEN : comparer les tarifs"
   ],
   "Vérandas": [
    "i",
    "3.5.1 · RCBAT+ ou Ocealiz (classe 6) : comparer les tarifs (exclue chez RCD ZEN)"
   ],
   "Bardages de façades": [
    "i",
    "3.6 · RCBAT+ ou Ocealiz (classe 7), ou RCD ZEN : comparer les tarifs"
   ],
   "Façades-rideaux": [
    "i",
    "3.7 · RCBAT+ ou Ocealiz (classe 7), ou RCD ZEN : comparer les tarifs"
   ],
   "Structures et couvertures textiles": [
    "i",
    "3.8 · Ocealiz seul (classe 7)"
   ],
   "Menuiseries intérieures (menuisier)": [
    "i",
    "4.1 · RCBAT+ ou Ocealiz (classe 9), ou RCD ZEN : comparer les tarifs"
   ],
   "Agencement de cuisines, magasins, salles de bains (cuisiniste)": [
    "i",
    "4.1.1 · RCBAT+ ; Ocealiz seulement pour les cuisines et salles de bains domestiques ; RCD ZEN (cuisines et salles de bains)"
   ],
   "Plâtrerie, plaques de plâtre, staff (plâtrier, plaquiste)": [
    "i",
    "4.2 · RCBAT+ ou Ocealiz (classe 10), ou RCD ZEN : comparer les tarifs"
   ],
   "Serrurerie, métallerie (serrurier, ferronnier)": [
    "i",
    "4.3 · RCBAT+ ou Ocealiz (classe 9), ou RCD ZEN : comparer les tarifs"
   ],
   "Vitrerie, miroiterie (vitrier)": [
    "i",
    "4.4 · RCBAT+ ou Ocealiz (classe 9), ou RCD ZEN : comparer les tarifs"
   ],
   "Peinture (peintre)": [
    "i",
    "4.5 · RCBAT+ ou Ocealiz (classe 10) : comparer les tarifs ; RCD ZEN : peinture non listée, seule la peinture décorative est exclue (à vérifier)"
   ],
   "Nettoyage de bâtiment": [
    "i",
    "4.5.1 · RCBAT+ seul (inclus dans la peinture chez Ocealiz)"
   ],
   "Revêtements de sols souples et parquets (solier, parqueteur)": [
    "i",
    "4.6 · RCBAT+ ou Ocealiz (classe 9), ou RCD ZEN : comparer les tarifs"
   ],
   "Carrelage, chapes et sols coulés (carreleur)": [
    "i",
    "4.7 · RCBAT+ ou Ocealiz (classe 7,5), ou RCD ZEN : comparer les tarifs"
   ],
   "Isolation thermique et acoustique": [
    "i",
    "4.8 · RCBAT+ ou Ocealiz (classe 7), ou RCD ZEN : comparer les tarifs"
   ],
   "Isolation thermique par l'extérieur (ITE)": [
    "i",
    "4.8.1 · RCBAT+ ou Ocealiz (classe 7), ou RCD ZEN : comparer les tarifs"
   ],
   "Isolation frigorifique": [
    "i",
    "4.12 · Ocealiz (classe 7) ou RCD ZEN"
   ],
   "Plomberie, installations sanitaires (plombier)": [
    "i",
    "5.1 · RCBAT+ ou Ocealiz (classe 6), ou RCD ZEN (chauffage compris) : comparer les tarifs"
   ],
   "Chauffage, pompes à chaleur, génie climatique (chauffagiste)": [
    "i",
    "5.2 · RCBAT+ ou Ocealiz (classe 7) : comparer les tarifs (exclue chez RCD ZEN)"
   ],
   "Chauffe-eau et capteurs solaires thermiques": [
    "i",
    "5.2.1 · RCBAT+ seul"
   ],
   "Fumisterie (conduits de fumée, cheminées)": [
    "i",
    "5.3 · RCBAT+ ou Ocealiz (classe 4), ou RCD ZEN : comparer les tarifs"
   ],
   "Ramonage": [
    "i",
    "5.3.1 · RCBAT+ seul (inclus dans la fumisterie chez Ocealiz)"
   ],
   "Climatisation, ventilation, VMC (climaticien)": [
    "i",
    "5.4 · RCBAT+ ou Ocealiz (classe 7), ou RCD ZEN : comparer les tarifs"
   ],
   "Électricité (électricien)": [
    "i",
    "5.5 · RCBAT+ ou Ocealiz (classe 10), ou RCD ZEN : comparer les tarifs"
   ],
   "Courants faibles : antennes, alarmes, câblage, interphonie": [
    "i",
    "5.5.1 · RCBAT+ seul (Ocealiz : télécoms seulement, dans l'électricité) (exclue chez RCD ZEN)"
   ],
   "Bornes de recharge pour véhicules électriques (jusqu'à 22 kW)": [
    "i",
    "5.5.2 · RCBAT+ seul"
   ],
   "Fours et cheminées industriels": [
    "x",
    "5.6 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Ascenseurs (ascensoriste)": [
    "x",
    "5.7 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Piscines (pisciniste)": [
    "x",
    "5.8 · non assurable pour le moment ; possible chez APRIL quand le cabinet aura 2 contrats RC décennale actifs chez APRIL"
   ],
   "Constructions à ossature bois": [
    "i",
    "5.9 · RCBAT+ seul (Ocealiz à confirmer) (exclue chez RCD ZEN)"
   ],
   "Géothermie": [
    "x",
    "5.10 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Photovoltaïque intégré au bâti": [
    "i",
    "5.11.1.a · RCBAT+ seul"
   ],
   "Photovoltaïque en surimposition ou intégration simplifiée": [
    "i",
    "5.11.1.b · RCBAT+ ; Ocealiz pour la surimposition seule (classe 1,5 à 4,1)"
   ],
   "Raccordement d'installations photovoltaïques": [
    "i",
    "5.11.1.c · RCBAT+ seul (inclus dans le photovoltaïque chez Ocealiz)"
   ],
   "Photovoltaïque sur ombrières, serres et hangars agricoles": [
    "i",
    "5.11.1.d · RCBAT+ seul"
   ],
   "Photovoltaïque lesté (sans fixation)": [
    "i",
    "5.11.1.e · RCBAT+ seul"
   ],
   "Photovoltaïque posé au sol": [
    "i",
    "5.11.2 · RCBAT+ seul"
   ],
   "Étanchéité photovoltaïque": [
    "x",
    "5.11.3 · Non assurable par le cabinet : exclue chez APRIL, non proposée par Ocealiz. Orienter vers un courtier spécialisé."
   ],
   "Éolien": [
    "i",
    "5.12 · RCBAT+ seul"
   ],
   "Architecte": [
    "i",
    "PIB n° 1 · MIC Zen (Kobalt)"
   ],
   "Architecte d'intérieur": [
    "i",
    "PIB n° 1.1 · MIC Zen (Kobalt)"
   ],
   "Maître d'œuvre TCE": [
    "i",
    "PIB n° 12 · MIC Zen (Kobalt)"
   ],
   "Assistant maître d'œuvre": [
    "i",
    "PIB n° 2 · MIC Zen (Kobalt)"
   ],
   "Assistant à maîtrise d'ouvrage (AMO)": [
    "i",
    "PIB n° 2.2 · MIC Zen (Kobalt)"
   ],
   "Contractant général": [
    "i",
    "PIB n° 5 · MIC Zen (Kobalt)"
   ],
   "Dessinateur en bâtiment": [
    "i",
    "PIB n° 8 · MIC Zen (Kobalt)"
   ],
   "Paysagiste décorateur": [
    "i",
    "PIB n° 14 · MIC Zen (Kobalt)"
   ],
   "BET TCE (tous corps d'état)": [
    "i",
    "PIB n° 3 · MIC Zen (Kobalt)"
   ],
   "BET acoustique": [
    "i",
    "PIB n° 3.1 · MIC Zen (Kobalt)"
   ],
   "BET assainissement / VRD": [
    "i",
    "PIB n° 3.2 · MIC Zen (Kobalt)"
   ],
   "BET charpente / couverture (bois et fer)": [
    "i",
    "PIB n° 3.3 · MIC Zen (Kobalt)"
   ],
   "BET chauffage / plomberie": [
    "i",
    "PIB n° 3.4 · MIC Zen (Kobalt)"
   ],
   "BET climatisation / ventilation": [
    "i",
    "PIB n° 3.5 · MIC Zen (Kobalt)"
   ],
   "BET construction bois": [
    "i",
    "PIB n° 3.6 · MIC Zen (Kobalt)"
   ],
   "BET électricité": [
    "i",
    "PIB n° 3.7 · MIC Zen (Kobalt)"
   ],
   "BET étanchéité": [
    "i",
    "PIB n° 3.8 · MIC Zen (Kobalt)"
   ],
   "BET fluides": [
    "i",
    "PIB n° 3.9 · MIC Zen (Kobalt)"
   ],
   "BET géotechnique": [
    "i",
    "PIB n° 3.10 · MIC Zen (Kobalt)"
   ],
   "BET infrastructure": [
    "i",
    "PIB n° 3.11 · MIC Zen (Kobalt)"
   ],
   "BET structure": [
    "i",
    "PIB n° 3.12 · MIC Zen (Kobalt)"
   ],
   "BET thermique": [
    "i",
    "PIB n° 3.14 · MIC Zen (Kobalt)"
   ],
   "Contrôleur technique": [
    "i",
    "PIB n° 4 · MIC Zen (Kobalt)"
   ],
   "Coordinateur SPS": [
    "i",
    "PIB n° 6 · MIC Zen (Kobalt)"
   ],
   "OPC TCE (ordonnancement, pilotage, coordination)": [
    "i",
    "PIB n° 13 · MIC Zen (Kobalt)"
   ],
   "Économiste de la construction": [
    "i",
    "PIB n° 10 · MIC Zen (Kobalt)"
   ],
   "Diagnostiqueur immobilier": [
    "i",
    "PIB n° 9 · MIC Zen (Kobalt)"
   ],
   "Géotechnicien": [
    "i",
    "PIB n° 11 · MIC Zen (Kobalt)"
   ],
   "Topographe / métreur": [
    "i",
    "PIB n° 15 · MIC Zen (Kobalt)"
   ],
   "Courtier en travaux": [
    "i",
    "PIB n° 7 · MIC Zen (Kobalt)"
   ],
   "Sols en résine (y compris sols sportifs et industriels)": [
    "i",
    "RCD ZEN (revêtements à base de résine) ; RCBAT+ et Ocealiz : à vérifier"
   ]
  },
  "lim": [
   {
    "m": [
     "Architecte",
     "Architecte d'intérieur",
     "Maître d'œuvre TCE",
     "Assistant maître d'œuvre",
     "Assistant à maîtrise d'ouvrage (AMO)",
     "Contractant général",
     "Dessinateur en bâtiment",
     "Paysagiste décorateur",
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique",
     "Contrôleur technique",
     "Coordinateur SPS",
     "OPC TCE (ordonnancement, pilotage, coordination)",
     "Économiste de la construction",
     "Diagnostiqueur immobilier",
     "Géotechnicien",
     "Topographe / métreur",
     "Courtier en travaux"
    ],
    "max": 2,
    "ex": [
     "BET TCE (tous corps d'état)",
     "BET acoustique",
     "BET assainissement / VRD",
     "BET charpente / couverture (bois et fer)",
     "BET chauffage / plomberie",
     "BET climatisation / ventilation",
     "BET construction bois",
     "BET électricité",
     "BET étanchéité",
     "BET fluides",
     "BET géotechnique",
     "BET infrastructure",
     "BET structure",
     "BET thermique"
    ],
    "exMax": 4,
    "t": "x",
    "txt": "Contrat PIB MIC Zen : 2 activités au maximum (4 pour un bureau d'études)"
   },
   {
    "m": [
     "Démolition sans explosifs (démolisseur)",
     "Démolition avec explosifs",
     "Terrassement, sondages et forages (terrassier)",
     "Enrochements",
     "Amélioration des sols",
     "VRD : voiries, réseaux, assainissement, clôtures",
     "Paysagiste (espaces verts, arrosage, clôtures)",
     "Montage d'échafaudage, étaiement",
     "Désamiantage (traitement de l'amiante)",
     "Traitement des termites, insectes xylophages et champignons",
     "Assèchement des murs",
     "Fondations spéciales (pieux, micropieux, parois moulées)",
     "Maçonnerie et béton armé (maçon)",
     "Enduits de façade (façadier)",
     "Taille de pierres",
     "Revêtement vertical en matériaux durs agrafés ou attachés",
     "Béton précontraint in situ",
     "Charpente et structures en bois (charpentier)",
     "Charpente et structures métalliques",
     "Couverture (couvreur)",
     "Couverture par grands éléments",
     "Zinguerie",
     "Étanchéité de toiture, terrasse et plancher (étancheur)",
     "Cuvelages et réservoirs",
     "Calfeutrement et étanchéité des façades",
     "Menuiseries extérieures : fenêtres, portes, volets",
     "Vérandas",
     "Bardages de façades",
     "Façades-rideaux",
     "Structures et couvertures textiles",
     "Menuiseries intérieures (menuisier)",
     "Agencement de cuisines, magasins, salles de bains (cuisiniste)",
     "Plâtrerie, plaques de plâtre, staff (plâtrier, plaquiste)",
     "Serrurerie, métallerie (serrurier, ferronnier)",
     "Vitrerie, miroiterie (vitrier)",
     "Peinture (peintre)",
     "Nettoyage de bâtiment",
     "Revêtements de sols souples et parquets (solier, parqueteur)",
     "Carrelage, chapes et sols coulés (carreleur)",
     "Isolation thermique et acoustique",
     "Isolation thermique par l'extérieur (ITE)",
     "Isolation frigorifique",
     "Sols en résine (y compris sols sportifs et industriels)",
     "Plomberie, installations sanitaires (plombier)",
     "Chauffage, pompes à chaleur, génie climatique (chauffagiste)",
     "Chauffe-eau et capteurs solaires thermiques",
     "Fumisterie (conduits de fumée, cheminées)",
     "Ramonage",
     "Climatisation, ventilation, VMC (climaticien)",
     "Électricité (électricien)",
     "Courants faibles : antennes, alarmes, câblage, interphonie",
     "Bornes de recharge pour véhicules électriques (jusqu'à 22 kW)",
     "Fours et cheminées industriels",
     "Ascenseurs (ascensoriste)",
     "Piscines (pisciniste)",
     "Constructions à ossature bois",
     "Géothermie",
     "Photovoltaïque intégré au bâti",
     "Photovoltaïque en surimposition ou intégration simplifiée",
     "Raccordement d'installations photovoltaïques",
     "Photovoltaïque sur ombrières, serres et hangars agricoles",
     "Photovoltaïque lesté (sans fixation)",
     "Photovoltaïque posé au sol",
     "Étanchéité photovoltaïque",
     "Éolien"
    ],
    "max": 12,
    "t": "x",
    "txt": "Plus de 12 activités d'artisan : au-delà de la limite de 12 activités en RC décennale"
   }
  ]
 },
 "mutuelle": {
  "cle": "mutuelle",
  "demande": "Questionnaire mutuelle santé",
  "court": "Mutuelle",
  "produit": "Mutuelle santé",
  "mail": "assurance santé",
  "sujet": "Votre devis Mutuelle santé",
  "declencheurs": [
   "Mutuelle santé",
   "Mutuelle santé (pro)",
   "Mutuelle santé TNS",
   "Mutuelle santé TNS (pro)"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Date de naissance",
     "Profession",
     "Adresse",
     "Complément d'adresse",
     "Code postal",
     "Ville",
     "Votre situation professionnelle",
     "Numéro SIREN",
     "Votre employeur vous propose-t-il une mutuelle d'entreprise obligatoire ?",
     "Situation familiale"
    ]
   ],
   [
    "Les personnes à assurer",
    [
     "Qui souhaitez-vous assurer ?",
     "Date de naissance de votre conjoint",
     "Profession de votre conjoint",
     "Situation professionnelle de votre conjoint",
     "Nombre d'enfants à assurer",
     "Dates de naissance des enfants",
     "Date d'effet souhaitée"
    ]
   ],
   [
    "Votre mutuelle actuelle",
    [
     "Avez-vous une mutuelle actuellement ?",
     "Cotisation actuelle (€ par mois)",
     "Pourquoi souhaitez-vous changer ?"
    ]
   ],
   [
    "Vos besoins de santé",
    [
     "Des soins dentaires importants sont-ils prévus dans les 2 prochaines années (implants, couronnes, prothèses) ?",
     "Précisez les soins prévus et, si vous l'avez, le montant du devis",
     "Un traitement d'orthodontie est-il prévu pour un enfant ?",
     "Vous ou une personne à assurer portez-vous des lunettes ou des lentilles ?",
     "Montant moyen dépensé par équipement",
     "Fréquence de renouvellement",
     "Des appareils auditifs sont-ils portés ou prévus ?",
     "Consultez-vous régulièrement des spécialistes qui pratiquent des dépassements d'honoraires ?",
     "Avez-vous recours aux médecines douces (ostéopathie, acupuncture, diététique…) ?",
     "Une naissance est-elle prévue dans les 12 prochains mois ?"
    ]
   ]
  ],
  "alertes": [
   "Votre employeur vous propose-t-il une mutuelle d'entreprise obligatoire ?",
   "Des soins dentaires importants sont-ils prévus dans les 2 prochaines années (implants, couronnes, prothèses) ?"
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
  ],
  "metier": null,
  "mi": {},
  "lim": []
 },
 "prevtns": {
  "cle": "prevtns",
  "demande": "Questionnaire prévoyance TNS",
  "court": "Prévoyance TNS",
  "produit": "Prévoyance du dirigeant (pro)",
  "mail": "assurance prévoyance du dirigeant",
  "sujet": "Votre devis Prévoyance du dirigeant",
  "declencheurs": [
   "Prévoyance du dirigeant",
   "Prévoyance du dirigeant (pro)"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Date de naissance",
     "Profession",
     "Adresse",
     "Complément d'adresse",
     "Code postal",
     "Ville",
     "Situation familiale",
     "Nombre d'enfants à charge",
     "Fumez-vous ou vapotez-vous, ou l'avez-vous fait au cours des 24 derniers mois ?",
     "Pratiquez-vous un sport à risque (plongée, sports mécaniques, sports aériens, sports de combat…) ?",
     "Lequel ?"
    ]
   ],
   [
    "Votre activité",
    [
     "Votre statut",
     "Numéro SIREN"
    ]
   ],
   [
    "Vos revenus",
    [
     "Chiffre d'affaires du dernier exercice",
     "Revenu net annuel avant impôt",
     "Dividendes perçus sur le dernier exercice"
    ]
   ],
   [
    "Votre contrat actuel",
    [
     "Avez-vous déjà un contrat de prévoyance ?",
     "Cotisation actuelle (€ par mois)"
    ]
   ]
  ],
  "alertes": [
   "Pratiquez-vous un sport à risque (plongée, sports mécaniques, sports aériens, sports de combat…) ?"
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
  ],
  "metier": null,
  "mi": {},
  "lim": []
 },
 "prevsalarie": {
  "cle": "prevsalarie",
  "demande": "Questionnaire prévoyance salarié",
  "court": "Prévoyance salarié",
  "produit": "Prévoyance individuelle",
  "mail": "assurance prévoyance",
  "sujet": "Votre devis Prévoyance",
  "declencheurs": [
   "Prévoyance",
   "Prévoyance individuelle"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Date de naissance",
     "Profession",
     "Adresse",
     "Complément d'adresse",
     "Code postal",
     "Ville",
     "Situation familiale",
     "Nombre d'enfants à charge",
     "Fumez-vous ou vapotez-vous, ou l'avez-vous fait au cours des 24 derniers mois ?",
     "Pratiquez-vous un sport à risque (plongée, sports mécaniques, sports aériens, sports de combat…) ?",
     "Lequel ?"
    ]
   ],
   [
    "Votre activité",
    [
     "Vous travaillez",
     "Type de contrat",
     "Catégorie",
     "Votre employeur a-t-il mis en place une prévoyance collective ?"
    ]
   ],
   [
    "Vos revenus",
    [
     "Salaire net annuel avant impôt"
    ]
   ],
   [
    "Votre contrat actuel",
    [
     "Avez-vous déjà un contrat de prévoyance ?",
     "Cotisation actuelle (€ par mois)"
    ]
   ]
  ],
  "alertes": [
   "Pratiquez-vous un sport à risque (plongée, sports mécaniques, sports aériens, sports de combat…) ?"
  ],
  "exclus": {
   "Vous travaillez": [
    "Dans la fonction publique",
    "Fonctionnaire : pas de solution de prévoyance individuelle chez Eloy (réservée aux salariés du privé et aux indépendants)"
   ]
  },
  "av": {
   "Date de naissance": "birthDate",
   "Profession": "profession",
   "Adresse": "address",
   "Code postal": "postalCode",
   "Ville": "city"
  },
  "siren": null,
  "sirens": [],
  "metier": null,
  "mi": {},
  "lim": []
 },
 "plaisance": {
  "cle": "plaisance",
  "demande": "Questionnaire assurance plaisance",
  "court": "Plaisance",
  "produit": "Assurance bateau de plaisance",
  "mail": "assurance bateau",
  "sujet": "Votre devis Assurance bateau",
  "declencheurs": [
   "Assurance bateau",
   "Assurance plaisance",
   "Assurance bateau de plaisance",
   "Plaisance"
  ],
  "rubriques": [
   [
    "Vous",
    [
     "Date de naissance",
     "Lieu de naissance",
     "Profession",
     "Adresse",
     "Complément d'adresse",
     "Code postal",
     "Ville",
     "Déjà propriétaire du bateau",
     "Bateau au nom de",
     "Nom et prénom du copropriétaire",
     "Raison sociale",
     "Numéro SIREN",
     "Votre qualité dans la société",
     "Personne politiquement exposée"
    ]
   ],
   [
    "Le bateau",
    [
     "Type de bateau",
     "Précisez le type de bateau",
     "Motorisation",
     "Nom du bateau",
     "Immatriculation",
     "Constructeur (chantier)",
     "Modèle",
     "Année de construction",
     "Longueur en mètres",
     "Nombre de passagers autorisés",
     "Construction",
     "Matériau de la coque",
     "Pavillon",
     "Pavillon étranger",
     "Nombre de moteurs",
     "Puissance totale en CV",
     "Marque et année des moteurs",
     "Avez-vous une annexe ?",
     "Annexe : marque, modèle, année et moteur",
     "Remorque à assurer",
     "Date du dernier rapport d'expertise"
    ]
   ],
   [
    "État du bateau (auto-évaluation)",
    [
     "État du pont",
     "État de la coque",
     "État des surfaces",
     "État de la cale",
     "État de la quille",
     "État du safran",
     "Bateau déjà sinistré",
     "Sinistre entièrement réparé",
     "Rigidité des ponts",
     "Cloisons et liaison coque-pont",
     "Présence de corrosion",
     "Présence d'osmose",
     "Cockpit et gouvernail",
     "Hublots et pare-brise",
     "Type de mât",
     "Âge du gréement dormant",
     "Dernier contrôle du gréement dormant",
     "État du gréement dormant",
     "État du gréement courant",
     "État général des moteurs",
     "État des capots",
     "État des embases",
     "État des hélices",
     "Étanchéité des moteurs",
     "Dernière révision des moteurs",
     "Circuit électrique",
     "Batteries",
     "Anodes",
     "Installation électrique conforme",
     "Mouillage principal",
     "Pompe de cale",
     "Extincteur",
     "Gilets, bouées et annexe",
     "Radeau de survie",
     "Bon état de navigation déclaré"
    ]
   ],
   [
    "Valeurs à assurer",
    [
     "Valeur de la coque",
     "Valeur des moteurs",
     "Valeur de l'annexe et de son moteur",
     "Valeur de la remorque",
     "Valeur totale à assurer",
     "Ces valeurs sont",
     "Financement du bateau",
     "Organisme de financement",
     "Bateau gagé",
     "Origine principale des fonds ayant servi à l'achat"
    ]
   ],
   [
    "Usage du bateau",
    [
     "Location ou charter",
     "École de voile, croisière ou conduite",
     "Autre usage professionnel ou commercial",
     "Usage professionnel précisé",
     "Usage par un club ou une association",
     "Régates ou compétition",
     "Habitation principale à bord",
     "Équipage professionnel permanent"
    ]
   ],
   [
    "Navigation et stationnement",
    [
     "Port d'attache",
     "Commune du port",
     "Territoire du port",
     "Stationnement habituel",
     "Zone de navigation habituelle",
     "Éloignement maximal d'un abri",
     "Lieu en saison cyclonique",
     "Mesures prises en cas d'alerte cyclonique"
    ]
   ],
   [
    "Votre expérience",
    [
     "Permis plaisance",
     "Date d'obtention du permis",
     "Propriétaire de bateaux depuis",
     "Navigations, formations ou diplômes nautiques à signaler",
     "Autres personnes qui pilotent le bateau (nom et permis)"
    ]
   ],
   [
    "Antécédents d'assurance",
    [
     "Déjà assuré pour un bateau",
     "Bateau actuellement assuré",
     "Contrat bateau résilié par un assureur",
     "Sinistres sur 36 mois",
     "Détail des sinistres",
     "Condamnation déclarée",
     "Date d'effet souhaitée"
    ]
   ]
  ],
  "alertes": [
   "Personne politiquement exposée",
   "Équipage professionnel permanent",
   "Condamnation déclarée"
  ],
  "exclus": {},
  "av": {
   "Date de naissance": "birthDate",
   "Profession": "profession",
   "Adresse": "address",
   "Code postal": "postalCode",
   "Ville": "city",
   "Bateau actuellement assuré": "currentlyInsured"
  },
  "siren": "Numéro SIREN",
  "sirens": [
   "Numéro SIREN"
  ],
  "metier": null,
  "mi": {},
  "lim": []
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

/* ---------- Questionnaires envoyés en pièce jointe (PDF à remplir), sans questionnaire en ligne ----------
   Le client reçoit le mail du modèle de Bradley avec le PDF joint, et renvoie le questionnaire et ses pièces par mail.
   Relance unique à 48 h s'il n'a pas écrit depuis l'envoi. Étiquette Gmail : « 0. ENVOYER LE QUESTIONNAIRE/<court> ». */
var PJ = {
 "transport": {
  "cle": "transport",
  "court": "Transporteurs",
  "declencheurs": ["Assurance transporteurs et logisticiens", "Assurance transporteurs et logisticiens (pro)", "Transporteurs et logisticiens"],
  "aussi": [["Assurance maritime et portuaire", "Auxiliaire de transport maritime ou fluvial"], ["Assurance maritime et portuaire (pro)", "Auxiliaire de transport maritime ou fluvial"]],
  "sujet": "Votre devis Transporteurs et logisticiens",
  "mail": "assurance transporteur et/ou logisticien",
  "fichier": "Eloy_Questionnaire_Transporteurs_Logisticiens.pdf",
  "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Transporteurs_Logisticiens.pdf"
 },
 "marchandises": {
  "cle": "marchandises",
  "court": "Marchandises",
  "declencheurs": ["Assurance marchandises transportées", "Assurance marchandises transportées (pro)", "Marchandises transportées"],
  "sujet": "Votre devis Marchandises transportées",
  "mail": "assurance des marchandises transportées",
  "fichier": "Eloy_Questionnaire_Marchandises_Transportees.pdf",
  "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Marchandises_Transportees.pdf"
 },
 "srvmar": {"cle": "srvmar", "court": "Services maritimes", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Consignataire", "Agent maritime", "Courtier d'affrètement"], "sujet": "Votre devis Services maritimes", "mail": "assurance des services maritimes", "fichier": "Eloy_Questionnaire_Services_Maritimes.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Services_Maritimes.pdf"},
 "manut": {"cle": "manut", "court": "Manutention portuaire", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Manutention portuaire ou opérateur de terminal"], "sujet": "Votre devis Manutention portuaire", "mail": "assurance manutention portuaire", "fichier": "Eloy_Questionnaire_Manutention_Portuaire.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Manutention_Portuaire.pdf"},
 "autport": {"cle": "autport", "court": "Autorités portuaires", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Autorité portuaire ou gestionnaire de port"], "sujet": "Votre devis Autorités portuaires", "mail": "assurance responsabilité civile d'autorité portuaire", "fichier": "Eloy_Questionnaire_Autorites_Portuaires.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Autorites_Portuaires.pdf"},
 "marina": {"cle": "marina", "court": "Marinas", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Port de plaisance ou marina"], "sujet": "Votre devis Port de plaisance", "mail": "assurance port de plaisance", "fichier": "Eloy_Questionnaire_Ports_Plaisance_Marinas.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Ports_Plaisance_Marinas.pdf"},
 "chantier": {"cle": "chantier", "court": "Chantiers navals", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Chantier naval (construction ou réparation)"], "sujet": "Votre devis Chantier naval", "mail": "assurance chantier naval", "fichier": "Eloy_Questionnaire_Chantiers_Navals.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Chantiers_Navals.pdf"},
 "armport": {"cle": "armport", "court": "Armateur portuaire", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Armateur portuaire (remorquage, lamanage, vedettes…)"], "sujet": "Votre devis Armateur portuaire", "mail": "assurance armateur portuaire", "fichier": "Eloy_Questionnaire_Armateur_Portuaire.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Armateur_Portuaire.pdf"},
 "affreteur": {"cle": "affreteur", "court": "Affréteur", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Affréteur de navire"], "sujet": "Votre devis Affréteur de navire", "mail": "assurance responsabilité civile de l'affréteur", "fichier": "Eloy_Questionnaire_Affreteur_Navire.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Affreteur_Navire.pdf"},
 "passagers": {"cle": "passagers", "court": "Navires à passagers", "declencheurs": ["Assurance maritime et portuaire", "Assurance maritime et portuaire (pro)"], "metiers": ["Armateur de navire à passagers"], "sujet": "Votre devis Navire à passagers", "mail": "assurance des navires à passagers", "fichier": "Eloy_Questionnaire_Navires_Passagers.pdf", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@2edead2eb6eafe55d1b7b1c5adc88ea16178249f/dist/docs/Eloy_Questionnaire_Navires_Passagers.pdf"}
};

/* ---------- Mails « éléments à me transmettre » (liste des pièces, repris des modèles Gmail de Bradley du 22/10/2026) ----------
   Même circuit que les questionnaires PDF : envoi à la demande du site ou à la pose de l'étiquette
   « 0. ENVOYER LE QUESTIONNAIRE/<court> », relance unique à 48 h si le client n'a pas écrit depuis l'envoi.
   « fichier » : tableau Excel joint (contrats collectifs). */
var PIECES = {
 "emprunteur": {"cle": "emprunteur", "court": "Emprunteur", "declencheurs": ["Assurance emprunteur", "Assurance emprunteur (pro)"],
  "sujet": "Votre devis Assurance emprunteur", "prop": "d'<b>assurance emprunteur</b>",
  "pieces": [[null, ["pièce d'identité de chaque emprunteur", "l'offre de prêt complète", "le tableau d'amortissement définitif", "la profession de chaque emprunteur", "fumeur ou non-fumeur au cours des 24 derniers mois, pour chaque emprunteur"]]]},
 "auto": {"cle": "auto", "court": "Auto", "declencheurs": ["Assurance auto", "Assurance auto (pro)", "Assurance automobile"],
  "sujet": "Votre devis Assurance auto", "prop": "d'<b>assurance auto</b>",
  "pieces": [[null, ["carte grise recto verso, ou pro forma de la concession, ou certificat provisoire d'immatriculation", "permis de conduire recto verso", "une pièce d'identité en cours de validité", "le(s) relevé(s) d'information de moins de 3 mois, justifiant 36 mois d'antécédent d'assurance"]],
             [null, ["votre profession", "votre portable", "votre adresse postale", "le lieu de stationnement la nuit (garage fermé, parking, rue)", "l'usage : loisirs ou trajets domicile-travail", "la formule souhaitée : Tiers, Tiers + vol ou Tous risques"]]]},
 "moto": {"cle": "moto", "court": "Moto", "declencheurs": ["Assurance moto", "Assurance moto (pro)"],
  "sujet": "Votre devis Assurance moto", "prop": "d'<b>assurance moto</b>",
  "pieces": [[null, ["carte grise recto verso, ou pro forma de la concession, ou certificat provisoire d'immatriculation", "permis de conduire recto verso", "une pièce d'identité en cours de validité", "le(s) relevé(s) d'information de moins de 3 mois, justifiant 36 mois d'antécédent d'assurance"]],
             [null, ["votre profession", "votre portable", "votre adresse postale", "le lieu de stationnement la nuit (garage fermé, parking, rue)", "l'usage : loisirs ou trajets domicile-travail", "la formule souhaitée : Tiers, Tiers + vol ou Tous risques"]]]},
 "obseques": {"cle": "obseques", "court": "Obsèques", "declencheurs": ["Assurance obsèques", "Assurance obsèques (pro)"],
  "sujet": "Votre devis Assurance obsèques", "prop": "d'<b>assurance obsèques</b>",
  "pieces": [[null, ["pièce d'identité de la personne à assurer", "le capital souhaité"]]]},
 "deces": {"cle": "deces", "court": "Décès", "declencheurs": ["Assurance décès", "Assurance décès (pro)"],
  "sujet": "Votre devis Assurance décès", "prop": "d'<b>assurance décès</b>",
  "pieces": [[null, ["pièce d'identité de chaque personne à assurer", "la profession de chaque personne à assurer", "fumeur ou non-fumeur au cours des 24 derniers mois", "les sports ou activités à risque pratiqués, s'il y en a", "le capital souhaité", "les bénéficiaires (conjoint, enfants, autre personne)"]]]},
 "hommecle": {"cle": "hommecle", "court": "Homme clé", "declencheurs": ["Garantie homme clé", "Garantie homme clé (pro)", "Assurance homme clé", "Assurance homme clé (pro)"],
  "sujet": "Votre devis Garantie homme clé", "prop": "d'assurance <b>homme clé</b>",
  "pieces": [["Votre entreprise", ["extrait Kbis de moins de 3 mois", "les derniers comptes annuels (bilan et compte de résultat)"]],
             ["La personne à assurer", ["sa pièce d'identité", "sa fonction et son rôle dans l'activité de l'entreprise", "fumeur ou non-fumeur au cours des 24 derniers mois"]]]},
 "santecoll": {"cle": "santecoll", "court": "Santé collective", "declencheurs": ["Mutuelle santé collective", "Mutuelle santé collective (pro)"],
  "sujet": "Votre devis Mutuelle santé collective", "prop": "de <b>mutuelle santé collective</b>",
  "pieces": [[null, ["le tableau ci-joint, complété (onglet « Entreprise » et une ligne par salarié, y compris ceux qui demandent une dispense)", "extrait Kbis de moins de 3 mois", "pièce d'identité du dirigeant"]],
             ["Votre contrat actuel (s'il y en a un)", ["le tableau de garanties", "les cotisations"]]],
  "fichier": "Eloy_Mutuelle_collective_liste_salaries.xlsx", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@6847c37f2a1f2bc00fbee02a15c57794d6afd073/dist/docs/Eloy_Mutuelle_collective_liste_salaries.xlsx"},
 "prevcoll": {"cle": "prevcoll", "court": "Prévoyance collective", "declencheurs": ["Prévoyance collective", "Prévoyance collective (pro)"],
  "sujet": "Votre devis Prévoyance collective", "prop": "de <b>prévoyance collective</b>",
  "pieces": [[null, ["le tableau ci-joint, complété (onglet « Entreprise » et une ligne par salarié à couvrir)", "extrait Kbis de moins de 3 mois", "pièce d'identité du dirigeant"]],
             ["Votre contrat actuel (s'il y en a un)", ["les conditions générales et particulières (tableau de garanties)", "les cotisations", "le relevé des sinistres indemnisés sur les 3 dernières années"]]],
  "fichier": "Eloy_Prevoyance_collective_liste_salaries.xlsx", "url": "https://cdn.jsdelivr.net/gh/Badi972/eloy-site@6847c37f2a1f2bc00fbee02a15c57794d6afd073/dist/docs/Eloy_Prevoyance_collective_liste_salaries.xlsx"}
};
for (var k_ in PIECES) PJ[k_] = PIECES[k_];
/* type peut contenir le métier après « | » (ligne de la feuille de suivi d'une demande maritime) */
function pjParDemande(type, metier) {
  type = String(type || '').trim();
  if (metier == null && type.indexOf(' | ') > 0) { metier = type.split(' | ')[1]; type = type.split(' | ')[0]; }
  metier = String(metier || '').trim();
  for (var k in PJ) {
    var e = PJ[k];
    if (e.declencheurs.indexOf(type) >= 0 && (!e.metiers || e.metiers.indexOf(metier) >= 0)) return e;
    if ((e.aussi || []).some(function (a) { return a[0] === type && a[1] === metier; })) return e;
  }
  return null;
}
function pdf_(pj) {
  var r = UrlFetchApp.fetch(pj.url, { muteHttpExceptions: true });
  /* Secours si le CDN refuse ponctuellement (403) : même fichier sur GitHub */
  if (r.getResponseCode() !== 200) r = UrlFetchApp.fetch(pj.url.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([0-9a-f]+)\//, 'https://raw.githubusercontent.com/$1/$2/$3/'), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('Fichier introuvable (' + r.getResponseCode() + ') : ' + pj.url);
  var type = /\.xlsx$/i.test(pj.fichier) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
  return Utilities.newBlob(r.getContent(), type, pj.fichier);
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
    } else if (pjParDemande(d.type, d.metier)) {
      if (pjParDemande(d.type, d.metier).metiers) { d.type = d.type + ' | ' + d.metier; ligne[2] = d.type; }
      if (!emailValide_(d.email)) statut = 'E-mail invalide';
      else if (dejaEnvoye_(sh, d.email, d.type)) statut = 'Doublon';
      else {
        try { envoyerPJ_(d, false); statut = 'Lien envoyé'; ligne[8] = new Date(); }
        catch (e) { Logger.log('Envoi PDF : ' + e); statut = 'Erreur envoi PDF'; }
      }
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
  var liste = Object.keys(FICHES).map(function (k) { return FICHES[k]; }).concat(Object.keys(PJ).map(function (k) { return PJ[k]; }));
  liste.forEach(function (fiche) {
    var lab = GmailApp.getUserLabelByName(etiquetteDe_(fiche));
    if (!lab) { etiquette_(etiquetteDe_(fiche)); return; }
    lab.getThreads(0, 20).forEach(function (th) {
      sh = sh || feuille_();
      var msgs = th.getMessages(), client = null;
      for (var i = msgs.length - 1; i >= 0 && !client; i--) if (!estCabinet_(msgs[i].getFrom())) client = msgs[i];
      th.removeLabel(lab);
      if (!client) { th.addLabel(etiquette_(AUTO.ERREUR)); return; }
      var from = client.getFrom(), m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/);
      var d = { type: fiche.declencheurs[0] + (fiche.metiers ? ' | ' + fiche.metiers[0] : ''), nom: (m ? m[1] : '').trim(), email: (m ? m[2] : from).trim().toLowerCase(), tel: '', territoire: '', source: 'mail' };
      if (!emailValide_(d.email)) { th.addLabel(etiquette_(AUTO.ERREUR)); return; }
      if (!d.nom) d.nom = d.email.split('@')[0];
      if (!dejaEnvoye_(sh, d.email, d.type)) {
        if (PJ[fiche.cle]) envoyerPJ_(d, false, client); else envoyerLien_(d, false, client);
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
    var d = { type: v[2], nom: v[3], tel: String(v[4] || ''), email: String(v[5] || '').toLowerCase() };
    if (pjParDemande(d.type)) {
      /* Questionnaire en pièce jointe : pas de relance si le client a écrit depuis l'envoi */
      var apres = Utilities.formatDate(new Date(v[8].getTime() - 86400000), CFG.FUSEAU, 'yyyy/MM/dd');
      var reponses = GmailApp.search('from:' + d.email + ' after:' + apres, 0, 5).filter(function (th) {
        return th.getMessages().some(function (m) { return m.getDate() > v[8] && m.getFrom().toLowerCase().indexOf(d.email) >= 0; });
      });
      if (reponses.length) { sh.getRange(r.n, 8).setValue('Réponse reçue'); return; }
      envoyerPJ_(d, true);
    } else envoyerLien_(d, true);
    sh.getRange(r.n, 8, 1, 3).setValues([['Relancé', v[8], new Date()]]);
  });
}

/* ---------- Lecture du mail de notification du site ---------- */
function analyser(txt) {
  txt = String(txt || '').replace(/\r/g, '');
  function champ(re) { var m = txt.match(re); return m ? m[1].trim() : ''; }
  var STOP = '(?=\\s+(?:Message|Page|Formulaire|Segment|Territoire|Profession|Situation|Accord de recontact|Source publicitaire|Vous êtes|Votre métier|Votre activité)\\s*:|\\n|$)';
  return {
    nom: champ(/^\s*Nom:\s*(.+)$/m),
    tel: champ(/^\s*Telephone:\s*(.+)$/m),
    email: champ(/^\s*Email:\s*(\S+)/m).toLowerCase(),
    type: questionnaireDans_(txt) || champ(new RegExp('Type de demande\\s*:\\s*(.+?)' + STOP)),
    territoire: champ(/Territoire\s*:\s*(Martinique|Guadeloupe|Guyane)/i),
    profession: champ(new RegExp('Profession\\s*:\\s*(.+?)' + STOP)),
    situation: champ(new RegExp('Situation\\s*:\\s*(.+?)' + STOP)),
    metier: champ(new RegExp('Votre (?:métier|activité)\\s*:\\s*(.+?)' + STOP))
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
  var bouton = '<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#E85D04;border-radius:8px;padding:11px 20px">' +
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

/* Mail avec le questionnaire PDF en pièce jointe (sans pièces justificatives : demandées après l'accord du client, décision de Bradley du 08/11/2026) */
function envoyerPJ_(d, relance, msgClient) {
  var pj = pjParDemande(d.type), F = 'font-family:verdana,sans-serif;font-size:small;color:#222222';
  var sujet, html, texte;
  if (pj.pieces) {
    var liste = listePieces_(pj), prop = pj.prop, propT = prop.replace(/<[^>]+>/g, '');
    if (!relance) {
      sujet = pj.sujet + ' – éléments à me transmettre';
      html = 'Bonjour,<br><br>Afin de vous transmettre votre proposition ' + prop + ', merci de me retourner les éléments suivants :<br><br>' + liste.html +
        'Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
      texte = 'Bonjour,\n\nAfin de vous transmettre votre proposition ' + propT + ', merci de me retourner les éléments suivants :\n\n' + liste.texte +
        'Dès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
    } else {
      sujet = 'Rappel – ' + pj.sujet.replace(/^Votre/, 'votre') + ' – éléments à me transmettre';
      var renvoi = pj.fichier ? 'Je vous renvoie le tableau ci-joint.<br><br>' : '';
      html = 'Bonjour,<br><br>Je n\'ai pas encore reçu les éléments pour votre proposition ' + prop + '.<br><br>' + renvoi + 'Pour rappel, merci de me retourner :<br><br>' + liste.html +
        'Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
      texte = 'Bonjour,\n\nJe n\'ai pas encore reçu les éléments pour votre proposition ' + propT + '.\n\n' + renvoi.replace(/<br>/g, '\n') + 'Pour rappel, merci de me retourner :\n\n' + liste.texte +
        'Dès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
    }
  } else if (!relance) {
    sujet = pj.sujet + ' – questionnaire à compléter';
    html = 'Bonjour,<br><br>Afin de vous transmettre votre proposition d\'<b>' + esc_(pj.mail) + '</b>, merci de me retourner le questionnaire ci-joint, complété.<br><br>' +
      'Il se remplit directement sur ordinateur.<br><br>Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nAfin de vous transmettre votre proposition d\'' + pj.mail + ', merci de me retourner le questionnaire ci-joint, complété.\n\n' +
      'Il se remplit directement sur ordinateur.\n\nDès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  } else {
    sujet = 'Rappel – ' + pj.sujet.replace(/^Votre/, 'votre');
    html = 'Bonjour,<br><br>Je n\'ai pas encore reçu votre questionnaire pour votre proposition d\'<b>' + esc_(pj.mail) + '</b>.<br><br>Je vous le renvoie ci-joint : merci de me le retourner complété.<br><br>' +
      'Dès réception, je lance l\'étude et je reviens vers vous rapidement.<br>';
    texte = 'Bonjour,\n\nJe n\'ai pas encore reçu votre questionnaire pour votre proposition d\'' + pj.mail + '.\n\nJe vous le renvoie ci-joint : merci de me le retourner complété.\n\n' +
      'Dès réception, je lance l\'étude et je reviens vers vous rapidement.\n';
  }
  html = '<div dir="ltr"><div style="' + F + '">' + html + '</div><br><div style="' + F + '">Bien à vous,</div><br>' + SIGNATURE + '</div>';
  texte += '\nBien à vous,\n\nBradley Village\nCourtier en assurances et crédits\n06 96 33 29 09\ncontact@eloy-assurances-patrimoine.fr\neloy-assurances-patrimoine.fr\n' +
    'Immeuble Lina\'s, Mangot Vulcin, 97232 Le Lamentin\n\nEloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (www.orias.fr).';
  var opts = { htmlBody: html };
  if (pj.fichier) opts.attachments = [pdf_(pj)];
  if (msgClient) msgClient.reply(texte, opts);
  else GmailApp.sendEmail(d.email, sujet, texte, opts);
}

function listePieces_(pj) {
  var h = '', t = '';
  pj.pieces.forEach(function (b) {
    if (b[0]) { h += '<b>' + esc_(b[0]) + '</b><br>'; t += b[0] + '\n'; }
    b[1].forEach(function (x) { h += '- ' + esc_(x) + '<br>'; t += '- ' + x + '\n'; });
    h += '<br>'; t += '\n';
  });
  return { html: h, texte: t };
}

/* Test : envoie à votre propre adresse les mails « éléments à me transmettre » (premier envoi) et la relance emprunteur */
function testerMailsPieces() {
  var moi = Session.getActiveUser().getEmail();
  Object.keys(PIECES).forEach(function (k) { envoyerPJ_({ type: PIECES[k].declencheurs[0], nom: 'Test Eloy', tel: '', email: moi }, false); });
  envoyerPJ_({ type: 'Assurance emprunteur', nom: 'Test Eloy', tel: '', email: moi }, true);
}

/* Test : envoie le mail transporteurs (avec le PDF) à votre propre adresse */
function testerMailTransport() {
  envoyerPJ_({ type: 'Assurance transporteurs et logisticiens (pro)', nom: 'Test Eloy', tel: '', email: Session.getActiveUser().getEmail() }, false);
}

/* Signature Gmail de Bradley (copie de celle de eloy.assurances@gmail.com, 07/11/2026).
   Si la signature Gmail change, la recopier ici (Gmail : Paramètres → Signature). */
var SIGNATURE = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;max-width:460px;border-collapse:collapse;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;color:#0B1220\">\n<tr><td style=\"padding:0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\"><tr>\n  <td valign=\"middle\" style=\"padding:0 14px 0 0;width:64px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"text-decoration:none\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/bloc-eloy-carre.png\" width=\"64\" height=\"64\" alt=\"Eloy\" style=\"display:block;width:64px;height:64px;border:0\"></a></td>\n  <td valign=\"middle\" style=\"padding:0\">\n   <div style=\"font-size:19px;line-height:24px;font-weight:800\">Bradley Village</div>\n   <div style=\"font-size:13px;line-height:18px;font-weight:600;color:#1B66F7\">Courtier en assurances et crédits</div>\n  </td>\n </tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-size:13px;line-height:18px\">\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-tel.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"tel:+596696332909\" style=\"color:#0B1220;font-weight:700;text-decoration:none\">06 96 33 29 09</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-mail.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"mailto:contact@eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">contact@eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 6px 0;vertical-align:middle;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-web.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0\"></td><td style=\"padding:0 0 6px\"><a href=\"https://www.eloy-assurances-patrimoine.fr\" style=\"color:#0B1220;text-decoration:none\">eloy-assurances-patrimoine.fr</a></td></tr>\n  <tr><td style=\"padding:0 9px 0 0;vertical-align:top;width:15px\"><img src=\"https://cdn.jsdelivr.net/gh/Badi972/eloy-site@df1721780ba0d52661c6404a62a3a10558820761/dist/img/signature/ico-lieu.png\" width=\"15\" height=\"15\" alt=\"\" style=\"display:block;border:0;margin-top:2px\"></td><td style=\"padding:0;color:#3A4356\">Immeuble Lina's, Mangot Vulcin, 97232 Le Lamentin</td></tr>\n </table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"background:#E85D04;border-radius:999px;padding:8px 16px\"><a href=\"https://www.eloy-assurances-patrimoine.fr/contact\" style=\"color:#FFFFFF;font-size:12.5px;line-height:16px;font-weight:700;text-decoration:none\">Être rappelé sous 24 h</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:12px 0 0\">\n <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;background:#EAF1FE;border-radius:10px\"><tr><td style=\"padding:8px 12px;font-size:12px;line-height:18px;font-weight:700;color:#0B1220\"><a href=\"https://www.eloy-assurances-patrimoine.fr/assurances/professionnels\" style=\"color:#0B1220;text-decoration:none\">Assurance</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/credits/rachat\" style=\"color:#0B1220;text-decoration:none\">Rachat&nbsp;de&nbsp;crédit</a> <span style=\"color:#1B66F7\">•</span> <a href=\"https://www.eloy-assurances-patrimoine.fr/financement-pro\" style=\"color:#0B1220;text-decoration:none\">Financement&nbsp;pro</a></td></tr></table>\n</td></tr>\n<tr><td style=\"padding:10px 0 0;font-size:10px;line-height:15px;color:#5B6478\">Eloy, SARL · Intermédiaire en assurance et en opérations de banque · ORIAS n° 23 000 527 (<a href=\"https://www.orias.fr\" style=\"color:#5B6478\">www.orias.fr</a>). Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.</td></tr>\n</table>";

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
function exclusion_(fiche, l, v, rep) {
  var e = (fiche.exclus || {})[l];
  if (!e) return '';
  var vals = [].concat(e[0]), s = String(v || '');
  if (!vals.some(function (x) { return s.indexOf(x) === 0; })) return '';
  /* Exclusion propre à certains métiers (ex. limites du contrat PIB) : seulement si l'un d'eux est choisi */
  if (e[2] && rep) { var ms = metiers_(fiche, rep); if (!e[2].some(function (m) { return ms.indexOf(m) >= 0; })) return ''; }
  return e[1];
}
function metiers_(fiche, rep) {
  return fiche.metier && rep[fiche.metier] ? rep[fiche.metier].split(' ; ').map(function (x) { return x.trim(); }) : [];
}
/* Activités choisies non assurables (mi[activité] = ['x', texte]) et orientation assureur (['i', texte]) */
function metiersInfo_(fiche, rep, type) {
  return metiers_(fiche, rep).filter(function (m) { return fiche.mi && fiche.mi[m] && fiche.mi[m][0] === type; })
    .map(function (m) { return [m, fiche.mi[m][1]]; });
}
/* Nombre d'activités au-delà de la limite du contrat : t = 'x' (rouge) ou 'a' (à vérifier) */
function limites_(fiche, rep, type) {
  var ms = metiers_(fiche, rep);
  return (fiche.lim || []).filter(function (r) {
    if (r.t !== type) return false;
    var sel = ms.filter(function (m) { return r.m.indexOf(m) >= 0; });
    var max = r.ex && sel.length && sel.every(function (m) { return r.ex.indexOf(m) >= 0; }) ? r.exMax : r.max;
    return sel.length > max;
  }).map(function (r) { return r.txt; });
}
function exclusions_(fiche, rep) {
  return Object.keys(fiche.exclus || {}).filter(function (l) { return exclusion_(fiche, l, rep[l], rep); }).map(function (l) { return l.replace(/ \?$/, '') + ' : ' + rep[l] + ' → ' + fiche.exclus[l][1]; })
    .concat(metiersInfo_(fiche, rep, 'x').map(function (x) { return x[0] + ' → ' + x[1]; }))
    .concat(limites_(fiche, rep, 'x'))
    .concat(regles_(fiche, rep).x.map(function (x) { return x[0] + ' : ' + x[1] + ' → ' + x[2]; }));
}

/* ---------- Réponses déduites (mutuelle : régime d'assurance maladie, demande de Bradley du 08/11/2026) ----------
   Le régime n'est plus demandé au client : il se déduit de sa situation professionnelle et de sa profession. */
function sansAccent_(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function regime_(statut, profession) {
  var p = sansAccent_(profession), st = sansAccent_(statut);
  if (/marin|peche|matelot|navigant/.test(p)) return 'Marins (ENIM)';
  if (/agricult|exploitant agricole|eleveur|maraich|viticult|arboricult|horticult|planteur|salarie agricole|ouvrier agricole/.test(p)) return 'Agricole (MSA)';
  var sante = /infirmi|kine|masseur|medecin|chirurgien|dentiste|sage.femme|orthophon|orthopt|podolog|pedicure/.test(p);
  if (/independant|tns/.test(st)) return sante ? 'Régime général – praticiens et auxiliaires médicaux conventionnés (PAMC)' : 'Indépendants (TNS)';
  if (st) return 'Régime général';
  return sante ? 'Régime général (PAMC si libéral) – à confirmer' : 'Régime général – à confirmer';
}
function caisse_(statut, profession) {
  var p = sansAccent_(profession), st = sansAccent_(statut);
  if (/president|sasu?\b/.test(st)) return 'Régime général (assimilé salarié) : pas de caisse TNS';
  if (/dentiste|sage.femme/.test(p)) return 'CARCDSF';
  if (/infirmi|kine|masseur|orthophon|orthopt|podolog|pedicure/.test(p)) return 'CARPIMKO';
  if (/veterinaire/.test(p)) return 'CARPV';
  if (/medecin/.test(p)) return 'CARMF';
  if (/pharmacien/.test(p)) return 'CAVP';
  if (/avocat/.test(p)) return 'CNBF';
  if (/notaire/.test(p)) return 'CPRN';
  if (/expert.comptable|commissaire aux comptes/.test(p)) return 'CAVEC';
  if (/agent general/.test(p)) return 'CAVAMAC';
  if (/huissier|commissaire de justice/.test(p)) return 'CAVOM';
  if (/architecte|geometre|ingenieur.conseil/.test(p)) return 'CIPAV';
  if (/psycholog|psychotherap|osteopath|ergotherap|dieteticien|chiropract/.test(p)) return 'CIPAV ou SSI selon la date d\'affiliation – à confirmer';
  return 'Sécurité sociale des indépendants (SSI)';
}
function deduits_(fiche, rep) {
  var out = [];
  if (fiche.cle === 'prevtns') {
    out.push(['Caisse de retraite (déduite)', caisse_(rep['Votre statut'], rep['Profession']), 1]);
    return out;
  }
  if (fiche.cle !== 'mutuelle') return out;
  out.push(['Régime d\'assurance maladie (déduit)', regime_(rep['Votre situation professionnelle'], rep['Profession']), 0]);
  if (rep['Profession de votre conjoint']) out.push(['Régime du conjoint (déduit)', regime_(rep['Situation professionnelle de votre conjoint'], rep['Profession de votre conjoint']), 1]);
  return out;
}
/* ---------- Questionnaire plaisance : points de vigilance du récap (08/11/2026) ----------
   La note « Règles de souscription plaisance » (30/04/2021) est celle de GFA Caraïbes UNIQUEMENT (précision de Bradley, 08/11/2026) :
   ce que GFA exclut peut être accepté ailleurs (ex. location et charter acceptés chez Helvetia, April et Cooper Gay).
   Retour : gfa = hors règle GFA (bloc rouge « GFA Caraïbes »), a = à vérifier (toutes compagnies, ou accord du service souscription GFA,
   préfixé « GFA : »), i = orientation, expertise et pièces (bloc bleu). Aucune exclusion générale (x) : rien n'est exclu chez toutes les compagnies. */
var PLAISANCE = {
  /* Monotypes et voiliers de compétition cités par la note GFA */
  MONOTYPES: [/beneteau ?25\b/, /brenta ?24/, /bull ?7000/, /\bcoco\b/, /figaro/, /first ?class ?8/, /helium/, /\bj ?(105|22|24|90)\b/, /\bjod ?(24|25)\b/,
    /melges ?(24|30)/, /mini ?transat|\b6 ?50\b/, /mumm ?(30|36)/, /\bpogo\b/, /sprinto/, /[rf]eflex ?28/, /\bselection\b/, /\bsurprise\b/],
  /* Engins non assurés par Eloy (jet-skis : décision de Bradley, 08/11/2026) */
  EXCLUS_TYPE: /pedalo|kayak|canoe|barque|rame|planche|paddle|house.?boat|engin de plage|jet|scooter/
};
function nombre_(v) { var s = String(v || '').replace(/\s/g, '').replace(',', '.').match(/\d+(\.\d+)?/); return s ? parseFloat(s[0]) : null; }
function euros_(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'; }
function dateFr_(v) { var m = String(v || '').match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }
function reglesPlaisance_(rep, auj) {
  var gfa = [], gfaAccord = [], a = [], i = [], n = sansAccent_, auj = auj || new Date();
  var oui = function (l) { return /^Oui/.test(rep[l] || ''); };
  var type = rep['Type de bateau'] || '', voilier = /^Voilier/.test(type), moteur = rep['Motorisation'] && !/^Sans/.test(rep['Motorisation']);
  var annee = nombre_(rep['Année de construction']), age = annee ? auj.getFullYear() - annee : null;
  var lg = nombre_(rep['Longueur en mètres']), cv = nombre_(rep['Puissance totale en CV']), pax = nombre_(rep['Nombre de passagers autorisés']);
  var valeur = nombre_(rep['Valeur totale à assurer']);
  if (valeur === null) {
    valeur = ['Valeur de la coque', 'Valeur des moteurs', 'Valeur de l\'annexe et de son moteur', 'Valeur de la remorque']
      .reduce(function (s, l) { return s + (nombre_(rep[l]) || 0); }, 0) || null;
  }
  var autre = n(rep['Précisez le type de bateau']), engin = /^Autre/.test(type) && autre && PLAISANCE.EXCLUS_TYPE.test(autre);
  var mod = n((rep['Constructeur (chantier)'] || '') + ' ' + (rep['Modèle'] || '')).replace(/[^a-z0-9]+/g, ' ');
  var monotype = voilier && PLAISANCE.MONOTYPES.some(function (re) { return re.test(mod); });
  var res = rep['Contrat bateau résilié par un assureur'] || '', sin = rep['Sinistres sur 36 mois'] || '';
  var dist = rep['Éloignement maximal d\'un abri'] || '', hauturier = /hauturi/.test(n(rep['Permis plaisance']));
  var port = n((rep['Port d\'attache'] || '') + ' ' + (rep['Commune du port'] || ''));

  /* 1. À vérifier, quelle que soit la compagnie */
  if (engin) a.push('Type « ' + rep['Précisez le type de bateau'] + ' » : engin non assuré par le cabinet (jet-ski, kayak, paddle, pédalo, barque, planche, house-boat…)');
  else if (/^Autre/.test(type)) a.push('Type de bateau « ' + (rep['Précisez le type de bateau'] || 'autre') + ' » à vérifier');
  if (rep['Bateau au nom de'] === 'Une autre personne') a.push('Bateau au nom d\'une autre personne : le contrat doit être souscrit par le propriétaire');
  if (/sinistres/.test(res)) a.push('Contrat bateau résilié pour sinistres par un précédent assureur');
  if (/non-paiement/.test(res)) a.push('Contrat bateau résilié pour non-paiement');
  if (/autre motif/.test(res)) a.push('Contrat bateau résilié par un assureur (autre motif) : motif à demander');
  if (sin === '2' || sin === '3 ou plus') a.push(sin + ' sinistre(s) sur 36 mois : ' + (rep['Détail des sinistres'] || 'détail à demander'));
  if (moteur && /^Aucun/.test(rep['Permis plaisance'] || '') && (cv === null || cv > 6)) a.push('Aucun permis plaisance déclaré pour un bateau de ' + (cv === null ? '?' : cv) + ' CV : permis obligatoire au-delà de 6 CV');
  if (oui('Autre usage professionnel ou commercial')) a.push('Usage professionnel ou commercial : ' + (rep['Usage professionnel précisé'] || 'à préciser'));
  if (oui('Habitation principale à bord')) a.push('Bateau utilisé comme habitation principale');
  var mauvais = Object.keys(rep).filter(function (l) { return rep[l] === 'Mauvais'; }), moyens = Object.keys(rep).filter(function (l) { return rep[l] === 'Moyen'; });
  if (mauvais.length) a.push('Auto-évaluation, état « mauvais » : ' + mauvais.join(', ') + ' → à examiner (expertise ou travaux avant souscription)');
  if (/^Non/.test(rep['Sinistre entièrement réparé'] || '')) a.push('Le bateau a subi un sinistre qui n\'a pas été entièrement réparé');
  if (oui('Présence de corrosion')) a.push('Présence de corrosion déclarée');
  if (oui('Présence d\'osmose')) a.push('Présence d\'osmose déclarée');
  if (/^Non/.test(rep['Installation électrique conforme'] || '')) a.push('Installation électrique déclarée non conforme');
  if (/^Plus/.test(rep['Âge du gréement dormant'] || '')) a.push('Gréement dormant de plus de 10 ans : dernier contrôle par un professionnel ' + (rep['Dernier contrôle du gréement dormant'] ? 'le ' + rep['Dernier contrôle du gréement dormant'] : 'non indiqué'));
  if (/^Non/.test(rep['Bon état de navigation déclaré'] || '')) a.push('Le client ne déclare pas le bateau en bon état de navigation');

  /* 2. GFA Caraïbes : hors règle de souscription (exclusions formelles et usages sans dérogation prévue) */
  if (engin) gfa.push('Engin exclu (pédalos, engins de plage, barques à rames, canoës, kayaks, jet-skis, planches, house-boats)');
  if (monotype) gfa.push('Monotype ou voilier de compétition de la liste GFA (' + (rep['Constructeur (chantier)'] || '') + ' ' + (rep['Modèle'] || '') + ')');
  if (oui('Location ou charter')) gfa.push('Location ou charter (usage exclusivement personnel exigé)');
  if (oui('École de voile, croisière ou conduite')) gfa.push('École de voile, de croisière ou de conduite');
  if (/sinistres/.test(res)) gfa.push('Contrat plaisance résilié pour sinistre par un précédent assureur');
  if (sin === '3 ou plus') gfa.push('Plus de 2 sinistres dans les 36 derniers mois');
  if (rep['Bateau au nom de'] === 'Une autre personne') gfa.push('Seul le propriétaire (personne physique ou morale) peut souscrire');

  /* 3. GFA Caraïbes : hors conditions standard → accord ou dérogation du service souscription GFA */
  if (/^Autre/.test(type) && !engin) gfaAccord.push('type de bateau hors catégories (voilier monocoque, catamaran, bateau à moteur)');
  if (rep['Bateau au nom de'] === 'Une société') gfaAccord.push('personne morale (toute tarification soumise au service souscription)');
  if (rep['Pavillon'] && rep['Pavillon'] !== 'Français') gfaAccord.push('pavillon ' + (rep['Pavillon étranger'] || 'étranger') + ' (pavillon français exigé)');
  if (valeur !== null && valeur > 80000) gfaAccord.push('valeur ' + euros_(valeur) + ' (80 000 € maximum ; expertise préalable possible)');
  if (lg !== null && lg >= 15) gfaAccord.push('longueur ' + lg + ' m (moins de 15 m)');
  if (cv !== null && cv >= 650) gfaAccord.push('puissance ' + cv + ' CV (moins de 650 CV)');
  if (pax !== null && pax > 12) gfaAccord.push(pax + ' passagers (12 maximum)');
  if (age !== null && age >= 30) gfaAccord.push('bateau de ' + age + ' ans (moins de 30 ans ; au-delà, RC seule sur dérogation)');
  if (/^Amateur/.test(rep['Construction'] || '')) gfaAccord.push('construction ou finition amateur (dérogation)');
  if (oui('Autre usage professionnel ou commercial')) gfaAccord.push('usage professionnel ou commercial (dérogation)');
  if (oui('Usage par un club ou une association')) gfaAccord.push('club, association ou comité d\'entreprise (dérogation)');
  if (oui('Régates ou compétition')) gfaAccord.push('régates, compétition ou course au large (dérogation)');
  if (oui('Habitation principale à bord')) gfaAccord.push('habitation à bord (house-boats exclus : vérifier que le bateau navigue)');
  /* Port : tout port en territoire français convient pour GFA (précision de Bradley, 08/11/2026) ; Saint-Martin hollandais cité par la note */
  if (rep['Territoire du port'] === 'Autre pays' && !/sint.?maarten|simpson/.test(port)) gfaAccord.push('port d\'attache hors territoire français (« ' + (rep['Port d\'attache'] || '') + ' »)');
  if (/^Plus de 20/.test(dist)) gfaAccord.push('navigation à plus de 20 milles d\'un abri');
  else if (/^De 5/.test(dist) && !voilier && !hauturier) gfaAccord.push('bateau à moteur à plus de 5 milles sans permis hauturier');
  if (/non-paiement/.test(res)) gfaAccord.push('résiliation pour non-paiement (libre appréciation)');
  if (gfaAccord.length && !gfa.length) a.push('GFA : accord du service souscription nécessaire – ' + gfaAccord.join(' ; '));

  /* 4. Orientation, expertise et pièces (bloc bleu) */
  if (!gfa.length && !gfaAccord.length) i.push('GFA Caraïbes : dans la règle de souscription plaisance');
  else if (gfa.length) i.push('GFA Caraïbes hors règle : consulter Helvetia, April, Cooper Gay ou Ocealiz');
  if (oui('Location ou charter')) i.push('Location ou charter : Helvetia, April et Cooper Gay ne l\'excluent pas ; Ocealiz : charter non garanti');
  if (/P.che|Plong/i.test(rep['Usage professionnel précisé'] || '')) i.push('Ocealiz : pêche et plongée professionnelles refusées');
  if (oui('Habitation principale à bord')) i.push('Helvetia : habitation principale à bord possible si le client souscrit une RC vie privée ailleurs');
  if (age !== null) {
    if (age <= 6) i.push('GFA : bateau de ' + age + ' an' + (age > 1 ? 's' : '') + ', pas de rapport d\'expertise exigé (questionnaire et auto-évaluation)');
    else if (age < 30) {
      i.push('GFA : bateau de ' + age + ' ans, rapport d\'expertise de moins de 6 mois pour le tous risques');
      var de = dateFr_(rep['Date du dernier rapport d\'expertise']);
      if (de) {
        var mois = (auj.getFullYear() - de.getFullYear()) * 12 + auj.getMonth() - de.getMonth() - (auj.getDate() < de.getDate() ? 1 : 0);
        i.push('Expertise du ' + rep['Date du dernier rapport d\'expertise'] + ' : ' + mois + ' mois' + (mois < 6 ? ' (valable pour GFA)' : ' (plus de 6 mois : à refaire pour GFA)'));
      }
    } else i.push('GFA : bateau de ' + age + ' ans, tous risques hors règle (30 ans maximum)');
    if (age > 10) i.push('Cooper Gay : expertise de moins de 12 mois demandée pour les bateaux de plus de 10 ans');
    if (age > 6) i.push('Rapport d\'expertise : en cas de réserve (organe de sécurité, installation électrique, fissure de coque…), souscription GFA sous réserve des travaux dans les 3 mois');
  }
  if (moyens.length) i.push('Auto-évaluation, état « moyen » : ' + moyens.join(', '));
  var pieces = ['pièce d\'identité', lg !== null && lg < 7 ? 'carte de circulation (moins de 7 m)' : 'acte de francisation', 'permis plaisance'];
  if (/^Non/.test(rep['Déjà propriétaire du bateau'] || '') || !rep['Immatriculation']) pieces.push('acte de vente si le bateau n\'est pas encore immatriculé');
  pieces.push('facture d\'achat ou rapport d\'expertise');
  i.push('Pièces à demander après l\'accord du client : ' + pieces.join(', '));
  return { x: [], gfa: gfa, a: a, i: i };
}
function regles_(fiche, rep) { return fiche.cle === 'plaisance' ? reglesPlaisance_(rep) : { x: [], gfa: [], a: [], i: [] }; }
function recapHtml(d, corps) {
  var fiche = ficheParQuestionnaire(d.type) || FICHES.habitation, R = fiche.rubriques.map(function (r) { return [r[0], r[1].slice()]; }), labels = [];
  R.forEach(function (r) { labels = labels.concat(r[1]); });
  var rep = reponses(corps, labels), alertes = [], exclus = [];
  deduits_(fiche, rep).forEach(function (x) { rep[x[0]] = x[1]; R[x[2]][1].push(x[0]); });
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
      var ex = exclusion_(fiche, l, v, rep);
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
  metiersInfo_(fiche, rep, 'x').forEach(function (x) { exclus.push(['Activité', x[0], x[1]]); });
  limites_(fiche, rep, 'x').forEach(function (t) { exclus.push(['Nombre d\'activités', rep[fiche.metier] || '', t]); });
  limites_(fiche, rep, 'a').forEach(function (t) { alertes.push(t); });
  var rg = regles_(fiche, rep), liste = fiche.cle === 'plaisance';
  rg.x.forEach(function (x) { exclus.push(x); });
  rg.a.forEach(function (t) { alertes.push(t); });
  var orient = metiersInfo_(fiche, rep, 'i');
  if (exclus.length) haut += '<div style="margin-top:14px;background:#FDECEA;color:#B42318;border:1px solid #F5C2BC;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5">' +
    '<b>' + (liste ? 'HORS RÈGLE DE SOUSCRIPTION' : 'ACTIVITÉS EXCLUES OU RESTREINTES') + '</b>' + exclus.map(function (x) { return '<div style="margin-top:6px">• ' + esc_(x[0]) + ' <b>' + esc_(x[1]) + '</b><br>' + esc_(x[2]) + '</div>'; }).join('') + '</div>';
  if (orient.length) haut += '<div style="margin-top:14px;background:#EAF1FE;color:#0B3B8C;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5"><b>Orientation assureur</b>' +
    orient.map(function (x) { return '<div style="margin-top:4px">• ' + esc_(x[0]) + ' : ' + esc_(x[1]) + '</div>'; }).join('') + '</div>';
  if (alertes.length) haut += '<div style="margin-top:14px;background:#FFF1E6;color:#9A3412;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5"><b>À vérifier :</b> ' +
      (liste ? alertes.map(function (t) { return '<div style="margin-top:4px">• ' + esc_(t) + '</div>'; }).join('') : alertes.map(esc_).join(' · ')) + '</div>';
  if (rg.gfa.length) haut += '<div style="margin-top:14px;background:#FDECEA;color:#B42318;border:1px solid #F5C2BC;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5">' +
    '<b>GFA CARAÏBES : HORS RÈGLE DE SOUSCRIPTION</b><div style="font-size:12px;margin-top:2px">Règle propre à GFA : d\'autres compagnies peuvent accepter.</div>' +
    rg.gfa.map(function (t) { return '<div style="margin-top:4px">• ' + esc_(t) + '</div>'; }).join('') + '</div>';
  if (rg.i.length) haut += '<div style="margin-top:14px;background:#EAF1FE;color:#0B3B8C;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5"><b>Orientation assureur, expertise et pièces</b>' +
    rg.i.map(function (t) { return '<div style="margin-top:4px">• ' + esc_(t) + '</div>'; }).join('') + '</div>';
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
  if (d.situation) p['Situation'] = d.situation;
  var low = produit.toLowerCase();
  Object.keys(BESOIN).some(function (k) { if (low.indexOf(k) >= 0) { p.mainNeed = BESOIN[k]; return true; } return false; });
  if (fiche) {
    var labels = [];
    fiche.rubriques.forEach(function (r) { labels = labels.concat(r[1]); });
    var rep = reponses(corps, labels);
    deduits_(fiche, rep).forEach(function (x) { rep[x[0]] = x[1]; labels.push(x[0]); });
    Object.keys(fiche.av).forEach(function (l) {
      if (!rep[l]) return;
      var cleAv = fiche.av[l];
      p[cleAv] = cleAv === 'currentlyInsured' ? /^oui/i.test(rep[l]) : rep[l];
    });
    var rg = regles_(fiche, rep);
    var alertes = labels.filter(function (l) { return fiche.alertes.indexOf(l) >= 0 && /^Oui/i.test(rep[l] || ''); }).concat(limites_(fiche, rep, 'a')).concat(rg.a);
    var ex = exclusions_(fiche, rep);
    p.message = 'Questionnaire ' + fiche.court + ' rempli en ligne.' + (ex.length ? ' ⚠ EXCLUSIONS : ' + ex.join(' | ') + '.' : '') + (alertes.length ? ' À vérifier : ' + alertes.join(' · ') : '');
    if (ex.length) p['⚠ Exclusions'] = ex.join(' | ');
    if (rg.gfa.length) p['GFA hors règle'] = rg.gfa.join(' | ');
    if (rg.i.length) p['Orientation et pièces'] = rg.i.join(' | ');
    var ori = metiersInfo_(fiche, rep, 'i'); if (ori.length) p['Orientation assureur'] = ori.map(function (x) { return x[0] + ' : ' + x[1]; }).join(' | ');
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
      /^(Lien envoyé|Relancé|Questionnaire reçu|Réponse reçue)$/.test(v[7]);
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
