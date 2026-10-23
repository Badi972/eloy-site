# Procédure hebdomadaire de contenu Eloy

Trois tâches planifiées l'exécutent : **lundi 7 h 48** (préparer et programmer), **mercredi 7 h 48** (publier sur le site) et
**« Eloy vidéo hebdo » lundi et mercredi 10 h 17** (vidéo motion design : préparation le lundi, corrections le mercredi ; c'est la seule qui a le connecteur ElevenLabs).
Mode choisi par Bradley le 19/10/2026 : **fenêtre de correction**. Tout est prêt le lundi, programmé pour le **mercredi** ;
Bradley reçoit un récapitulatif et peut corriger ou annuler jusqu'au **mardi soir**. Sans réponse, tout part le mercredi.
**Changement du 21/10/2026 (demande de Bradley, délai trop long) : l'article et ses posts passent du jeudi au mercredi 9 h.**

**Formats depuis le 20/10/2026** (décision de Bradley : validation avant publication, 3 publications par semaine) :
| Jour (America/Martinique) | Contenu | Réseaux |
|---|---|---|
| Mercredi 9 h | Article du site + visuel photo (déjà en place) | gmb, facebook, instagram, linkedin, tiktok |
| Samedi 9 h | **Carrousel conseils** tiré de l'article de la semaine (`tools/carrousel.py`) | instagram, facebook, linkedin |
| Mardi suivant 12 h | **Vidéo motion design** (file `tools/motion/file.json`, outil `tools/motion/motion.py`) | instagram (REEL), facebook (REEL), tiktok, youtube (short), linkedin |
| Au fil de l'eau | **Vidéos face caméra** de Bradley déposées dans le dossier Drive (script fourni chaque lundi) | instagram (REEL), facebook (REEL), tiktok, youtube (short), linkedin |
Tout est préparé le lundi et validé dans la même fenêtre (lundi → mardi soir) : une seule décision dans `avis/<date>` couvre l'article,
le carrousel, la vidéo et la vidéo face caméra de la semaine. Un STOP annule tous les formats de la semaine.

**Depuis le 23/10/2026 (décision de Bradley) : 3 articles par semaine, chacun avec sa vidéo face caméra.**
| Article | Préparé par | Validation de Bradley | En ligne |
|---|---|---|---|
| Guide pratique (section GUIDE DU LUNDI) | tâche du mercredi | jusqu'au jeudi soir (rappel jeudi 16 h 30) | lundi 7 h 48 (tâche du lundi) |
| Article thématique du Studio | tâche du lundi | jusqu'au mardi soir (rappel mardi 16 h 30) | mercredi 7 h 48 |
| Article SEO local | tâche du lundi | jusqu'au jeudi soir | vendredi 7 h 48 |
Objectif de Bradley : faire du site **la référence** (« une bible ») sur l'assurance et le crédit aux Antilles-Guyane. Chaque article doit
être exact, vérifié sur les textes officiels, utile, et ne jamais répéter un guide existant.

Avant toute rédaction : charger la compétence **eloy-charte-contenu** (règles bloquantes, formats par canal, liens).

## Repères
- Dépôt : `Badi972/eloy-site` (public). Source du site : `src/eloy.html`. Build : `python3 tools/build.py src/eloy.html`.
- Si le dépôt n'est pas présent dans la session : `add_repo` (owner `Badi972`, repo `eloy-site`, access `push`), puis le cloner dans `/home/claude/eloy-site`.
- Commits : auteur et message en français, se terminer par les lignes d'attribution demandées par la session.
- Webflow : site `6ac7ee656efb4461b521d118`, collection Guides `6ad4126c2c33849017db1843`,
  domaines à publier `["6ad4580e190eda6036676b19","6ad4580d190eda6036676b13"]` + `publishToWebflowSubdomain: true`.
  Premier appel MCP Webflow avec `session_id: "start"`.
- Code de pied de page du site (Site settings → Custom code → Footer) : il contient le paragraphe `<p id="eloy-dir">…</p>`
  (liens annuaires, à garder tel quel) puis le script `eloy.js` épinglé sur un commit. Pour mettre à jour : lire le code
  actuel (`get_site_freeform_code`, location footer), remplacer **uniquement** le sha du script par le nouveau commit, réécrire.
- Metricool : marque `blogId 7522889`, fuseau `America/Martinique`. Vérifier avec `getBrandSettings` les réseaux réellement
  connectés et ne programmer que ceux-là (gmb, facebook, instagram, linkedin, tiktok ; YouTube seulement s'il y a une vidéo).
  État au 19/10/2026 : gmb, facebook, instagram, linkedin (profil personnel de Bradley, pas encore la page entreprise), tiktok, youtube.
- Brevo : liste « CONTACTS PROD 2024 » (id 4, ~141 contacts), expéditeur « Eloy Assurances » (id 1). Newsletter en pause (voir étape 7 du lundi).
- E-mail de Bradley : `bradleyvillages@gmail.com` (récapitulatifs, envoyés depuis son Gmail connecté).
- Vidéos motion design : file `tools/motion/file.json` ; scripts `tools/motion/videos/<slug>.json` (format : `tools/motion/videos/girardin-industriel.json`) ;
  vidéos finales `media/motion/<date>-<slug>.mp4` + `-couverture.jpg` (servies par jsDelivr comme les visuels).
- Carrousels : JSON `tools/articles/_carrousels/<date>-<slug>.json`, images `dist/img/carrousels/<date>/01.png …`.
- Vidéos face caméra : dossier Google Drive « Eloy – Vidéos face caméra » (`1FyExyyHNLxC7_sf4eoXd9JvfNUoVndTA`, dans « 1. ELOY & ASSURANCES »).
  Suivi dans `tools/articles/facecam.json` : {"deja_programmees": [fileId, …], "scripts": [{date, sujet, script}]}.
- Calendrier : `tools/articles/calendrier.json`. Un article = `tools/articles/AAAA-MM-JJ-slug.json` (AAAA-MM-JJ = mercredi de publication).
- **Studio contenu** (tableau de bord de Bradley) : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g, base lue et écrite avec l'outil
  `ArtifactData` (charger avec ToolSearch « select:ArtifactData », toujours passer `url` ci-dessus). C'est **la référence** pour le calendrier :
  Bradley y ajoute, modifie, réordonne, met en pause ou supprime des thèmes, et y donne sa décision sur l'article de la semaine.
  Collections :
  - `themes/<id>` : {date, statut (a_faire, programme, publie, annule, pause), ordre, cat, titre, angle, page, cible, slug?}.
    La page recalcule elle-même les dates des thèmes `a_faire` (mercredis consécutifs) ; ne pas les redater soi-même.
  - `semaines/<date>` : l'article préparé (écrit le lundi, fichier produit par `tools/studio_export.py`). Champ `formats` ajouté
    le 20/10/2026, affiché par le Studio sous l'article : liste de {type: video | carrousel | facecam, quand (ex. « mardi 03/11, 12 h »),
    titre, reseaux: [..], url (vidéo ou 1re image, jsDelivr), couverture (data URI JPEG ~270 px de large), miniatures: [data URI ~200 px] (carrousel),
    legende (texte des posts), script (facecam)}. Ajouter ce champ dans le JSON exporté avant le `set` (garder les data URI petites : < 25 Ko chacune).
  - `visuels/<date>` : vignette du visuel en data URI (idem).
  - `avis/<date>` : décision de Bradley, **écrite par lui, à lire seulement** : {decision: valide | corrections | stop, note, posts: {reseau: texte modifié}, at}.
  - `idees/<id>` : idées d'articles de Bradley (case « Mes idées d'articles » du Studio, ajoutée le 23/10/2026) :
    {texte, statut (nouvelle, planifiee, publiee, ecartee), cree, par, date?, slug?, note?}. Elles passent **avant** le calendrier (voir GUIDE DU LUNDI).
    Quand une idée est prise : `update` avec `statut: "planifiee"`, `date` (date de publication) et `note` (ex. « guide du lundi 09/11 ») ;
    après publication : `statut: "publiee"`, `slug`. Une idée contraire à la charte : `statut: "ecartee"` et `note` qui explique pourquoi.
    Bradley peut aussi donner une idée par e-mail (réponse à un récapitulatif) : l'ajouter dans `idees` avec `par: "bradley (e-mail)"`.
  - `reglages/canaux` : {items: [{id, nom, etat (actif, pause, bientot), note}]} ; le mettre à jour si un réseau est déconnecté.
  - `journal/<AAAA-MM>` : {entrees: [{quand (ISO, -04:00), tache (lundi | mercredi), texte, ok}]} ; ajouter une entrée à chaque passage
    (lire le document du mois, ajouter l'entrée, `set` avec `if_version` ; le créer s'il n'existe pas).
  Les documents marqués `test: true` (thème `test-essai`, semaines d'essai) sont des essais : les ignorer totalement
  (ni publication, ni Metricool, ni recopie dans `calendrier.json`).
  Chaque écriture sur un document existant demande `if_version` (la `version` lue juste avant).
  Si `ArtifactData` est indisponible ou échoue : continuer avec `calendrier.json` et l'e-mail seuls, et le signaler dans le récapitulatif.

## Format d'un article (JSON)
```
{"slug": "assurance-habitation-fin-saison-cyclonique",   // minuscules, tirets, unique (ne pas réutiliser un guide existant)
 "date": "2026-10-28", "statut": "programme",
 "t": "Titre H1", "mt": "Titre Google ≤ 60 car. | Eloy", "md": "Description Google ≤ 155 car.",
 "ex": "Extrait d'une phrase", "intro": "Introduction qui répond tout de suite (texte simple)",
 "body": [["Intertitre en question", "<p>HTML…</p><ul><li>…</li></ul>"], …, ["Questions fréquentes", "<h3>…</h3><p>…</p>…"]],
 "cat": "Habitation et logement",   // une rubrique existante des guides
 "prod": "", "min": 6, "rel": ["guide-…", "guide-…", "guide-…"],   // 3 guides existants proches
 "cta": {"t": "Parlons de votre projet", "p": "Étude gratuite et sans engagement. Votre conseiller vous rappelle sous 24 h, par téléphone ou WhatsApp.",
         "a": [["#contact", "Être rappelé"], ["/solutions/assurance-habitation", "Voir l'assurance habitation"]]},
 "legal": "…mentions obligatoires si crédit…",
 "posts": {"gmb": "…", "facebook": "…", "instagram": "…", "linkedin": "…", "tiktok": "…"},
 "visuel": {"titre": "…", "sous_titre": "…"}}
```
Depuis le 23/10/2026 (objectif « site de référence ») : chaque nouvel article se termine, avant la FAQ, par un bloc `["Sources", "<ul><li><a href=…>…</a></li>…</ul>"]`
avec 2 à 4 liens vers les textes officiels vérifiés (Légifrance, Service-public, Ameli, ministères, préfectures). Jamais un lien vers un concurrent.
Liens internes dans le HTML : `/solutions/<slug>`, `/credits/rachat`, `/contact`, `/guides/<slug>` (voir la charte, section 6).
Les rubriques et guides existants se lisent dans `src/eloy.html` (objet `const GUIDES=`) : ne jamais traiter un sujet déjà couvert sous le même angle.

## LUNDI (préparer et programmer)
1. Charger la charte. Lire tous les `themes` du Studio (`list`, limit 100) et réécrire `calendrier.json` pour qu'il corresponde
   exactement (mêmes thèmes, dates, statuts ; garder la clé `_info` ; ajouter le champ `id` du Studio à chaque thème).
   Prendre le thème `a_faire` dont la date est le mercredi qui vient. S'il n'y en a pas : prendre le premier `a_faire` par `ordre`
   et lui donner la date du mercredi qui vient. S'il n'y en a plus aucun : ajouter 4 nouveaux thèmes `a_faire` dans le Studio
   (même format, `par: "claude"`, ordre à la suite), le dire dans le récapitulatif et s'arrêter là.
2. Rédiger l'article (900 à 1 400 mots) et les 5 posts selon la charte. Écrire le fichier `tools/articles/<date>-<slug>.json`.
3. Contrôler : `python3 tools/verifier_article.py tools/articles/<fichier>.json`. Corriger jusqu'à « OK ».
4. Visuel avec photo (validé par Bradley le 19/10/2026) :
   a. Photo : générer avec Flora (projet « Eloy – photos des posts » `prj_ns7exvb55n8a6mheh9g16t4m2d8gjghd`, modèle
      `t2i-elote-gateway`, `aspect_ratio 4:3`, `resolution 2K`, environ 0,08 $) une photo réaliste liée au thème
      (maison créole, bureau, chantier, commerce, famille de dos ou mains seulement…). Prompt en anglais, en couches, dans cet ordre :
      cadrage → sujet → action → décor antillais → lumière (Kelvin) → appareil + focale + pellicule (Kodak Ektar 100 pour les extérieurs,
      Portra 400 pour les personnes, Fujifilm Provia 100F pour un rendu reportage) → textures et micro-imperfections, « no over-smoothing »
      → « No text, no logo, no watermark anywhere in the frame, no text, no logo » (répété) → « Photographic realism ».
      Jamais de visage inventé présenté comme un client ou un témoin ; préférer décors, objets, mains, personnes de dos.
      Image valorisante (demande de Bradley, 19/10/2026) : maisons, bâtiments et lieux **modernes, en très bon état, bien entretenus**
      (peinture fraîche, toiture neuve, jardin soigné). Jamais de délabrement, de rouille, de dégâts, de débris ni de cases vétustes,
      même pour un thème cyclone : on montre le résultat rassurant, pas le sinistre. L'écrire dans le prompt (« clean, new and in
      excellent condition, no damage, no debris, no rust »).
   b. Copier la photo dans le dépôt : `gh api -X POST repos/Badi972/eloy-site/actions/workflows/photo.yml/dispatches -f ref=main
      -f "inputs[url]=<url media.flora.ai>" -f "inputs[nom]=<date>"`, attendre le commit (`git pull`), fichier `dist/img/photos/<date>.png`.
      Regarder la photo (Read) : si elle contient du texte, un logo ou un défaut visible, en générer une autre.
   c. Remplir `visuel` : `titre` (accroche courte, souvent une question), `sous_titre`, `rubrique` (ex. « Assurance habitation »).
   d. `python3 tools/visuels.py tools/articles/<fichier>.json dist/img/photos/<date>.png` → `dist/img/posts/<date>.png` (4:5),
      `<date>-43.png` (4:3), `<date>-916.png` (9:16). Les regarder (Read).
   Secours si Flora ou l'action échoue : `python3 tools/visuel.py "<titre>" "<sous_titre>" dist/img/posts/<date>.png` (visuel sans photo),
   à copier aussi en `-43` et `-916`.
5. Passer le thème à `programme` dans `calendrier.json`. Build (`python3 tools/build.py src/eloy.html` : l'article daté du mercredi
   n'apparaît pas encore sur le site), commit, push. Noter le sha.
6. Programmer dans Metricool pour **mercredi 09:00 (America/Martinique)** un post par réseau connecté, avec le texte du réseau et
   `media: ["https://cdn.jsdelivr.net/gh/Badi972/eloy-site@<sha>/dist/img/posts/<fichier>"]`, avec le bon format par réseau :
   Instagram, Facebook, LinkedIn → `<date>.png` (4:5) ; Google → `<date>-43.png` (4:3) ; TikTok → `<date>-916.jpg` (9:16, **JPG obligatoire : TikTok refuse le PNG**, incident du 21/10/2026)
   (gmb : `gmbData {type: publication}` ; facebook : POST ; instagram : POST ; linkedin : post ; tiktok : photo, `privacyOption PUBLIC_TO_EVERYONE`).
   Le lien de l'article dans les posts : `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` (il sera en ligne le mercredi matin).
6 bis. Studio : `python3 tools/studio_export.py tools/articles/<fichier>.json <sha> <metricool.json>` (metricool.json = {réseau: plannerUrl}),
   puis avec ArtifactData : `set` de `semaines/<date>` et de `visuels/<date>` (file_path des fichiers de `tools/articles/_studio/`,
   `if_version` s'ils existent déjà), `update` du thème (`statut: "programme"`, `slug`), entrée de journal
   (« Article préparé et posts programmés »). Ne jamais écrire dans `avis`.
6 ter. **Carrousel du samedi** (tiré de l'article de la semaine) : écrire `tools/articles/_carrousels/<date>-<slug>.json`
   (titre accrocheur, 4 ou 5 points de 1 à 2 phrases chacun, fin avec la page de l'article, `legal` si crédit ou défiscalisation ; charte
   bloquante), puis `python3 tools/carrousel.py <json> dist/img/carrousels/<date>/`, regarder les images (Read). Commit, push, noter le sha.
   Metricool, **samedi 09:00** : un post par réseau (instagram POST carrousel, facebook POST, linkedin post avec `publishImagesAsPDF: true`
   et `documentTitle` = titre), `media` = toutes les images `https://cdn.jsdelivr.net/gh/Badi972/eloy-site@<sha>/dist/img/carrousels/<date>/NN.png`
   dans l'ordre, texte propre à chaque réseau (formats de la charte, lien de l'article ou « lien en bio » sur Instagram).
6 quater. **Vidéo motion design du mardi suivant** — exécutée par la tâche « Eloy vidéo hebdo » (lundi 10 h 17), **pas** par la tâche de 7 h 48.
   Date = mercredi de la semaine + 6 jours (le mardi suivant) ; **si ce mardi est déjà pris par une vidéo `programme` de `file.json`, prendre le premier
   mardi libre suivant** (et ne rien préparer si ce mardi libre est à plus de 3 semaines). Prendre la première vidéo `a_faire` (ou `prepare` sans date) de `tools/motion/file.json`.
   **S'il n'y en a plus : rediffusion en boucle** (décision de Bradley, 21/10/2026) — même ordre, mêmes vidéos, rien n'est refait :
   prendre la vidéo dont la dernière diffusion (`date` ou dernier élément de `rediffusions`) est la plus ancienne, en partant du haut
   de la liste ; sauter les étapes a à d ; à l'étape e, réutiliser `fichier` et `couverture` (même sha jsDelivr que la première fois
   ou le sha courant), avec des textes réécrits (mêmes informations, autre formulation, pour que les réseaux ne les voient pas comme
   des doublons) ; à l'étape f, ajouter la date du mardi à `rediffusions` au lieu de changer `date`. Le préciser dans l'e-mail
   (« rediffusion de la vidéo … »). Après une vidéo neuve, remplir `fichier` et `couverture` dans `file.json`.
   a. Écrire le script `tools/motion/videos/<slug>.json` sur le modèle de l'exemple Girardin : structure **douleurs → « La solution ? » →
      solution → comment ça marche (3 étapes) → bénéfice → Eloy (3 points) → appel à l'action** (« Contactez Éloi par e-mail, ou par
      téléphone, au … », voir ci-dessous ; exemple à jour : `tools/motion/videos/assurance-emprunteur.json`). 110 à 125 mots au total (≈ 40 à 45 s). Le texte lu écrit **« Éloi »** (à l'écran : Eloy)
      et le téléphone en toutes lettres. Charte bloquante ; `legal` obligatoire : mentions crédit (les deux phrases si on parle de mensualité
      allégée), défiscalisation (« Réduction d'impôt soumise à conditions… L'opération comporte des risques, notamment la remise en cause de
      l'avantage fiscal »), rien d'inventé (aucun chiffre, taux, montant ni « meilleure offre » : dire « l'offre la plus adaptée »).
      **Fil conducteur (Bradley, 21/10/2026) : le client doit comprendre qu'avec Eloy il a la solution à son problème.** La phrase
      bénéfice (`r`) commence par **« Avec Éloi, … »** + verbe d'action + bénéfice concret (ex. « Avec Éloi, baissez vos mensualités et
      retrouvez du pouvoir d'achat », « Avec Éloi, économisez 40 à 60 % sur votre assurance emprunteur », « Avec Éloi, financez votre
      matériel professionnel à moindre coût ») et le titre à l'écran commence par « Avec Eloy, ». **Ne jamais laisser croire qu'Eloy
      finance, prête ou assure lui-même** : Eloy est courtier, il trouve la solution adaptée auprès de ses partenaires (verbes : trouvez,
      accédez, économisez, équipez-vous ; jamais « Eloy vous finance / vous prête »). Pas de « Avec Éloi » sur le rachat de crédits
      (Bradley, 21/10/2026) : la vidéo validée garde « Résultat : à la fin du mois, vous respirez enfin ». Un chiffre d'économie n'est autorisé que
      s'il a été donné par Bradley, toujours avec « Économies variables selon le profil, non garanties » dans `legal`.
      **Fin de vidéo : pas de simulation sur le site** (sauf rachat de crédits, page /credits/rachat) : « Contactez Éloi par e-mail, ou par
      téléphone, au … » et dans `cta` : `"titre": "Contactez Eloy", "carte": "contact@eloy-assurances-patrimoine.fr", "carte_sous": "par e-mail",
      "carte_taille": 36, "pastille": "", "ou": "ou par téléphone au"` (pas de segment `bio`). Légendes des posts : idem (e-mail + téléphone).
      **Girardin industriel : toujours s'adresser à l'exploitant** (l'entreprise qui finance son matériel neuf à moindre coût grâce à l'aide
      fiscale rétrocédée), jamais au contribuable qui veut réduire ses impôts (demande de Bradley, 20/10/2026). Même règle pour le crédit-bail.
      Icônes possibles : doc euro percent down up calendar clock shield home car card briefcase factory truck laptop tools users heart piggy
      alert umbrella key building sun check.
   b. Contrôler la mise en page sans voix : écrire des repères estimés puis `python3 tools/motion/motion.py apercu <script> <repères> /tmp/apercu.png`
      et regarder l'image (textes qui débordent, chevauchements) ; corriger le script.
   c. Voix (voir « Voix off » plus bas) : `python3 tools/motion/motion.py texte <script>` donne le texte exact à envoyer à ElevenLabs.
      Générer 2 prises, garder la plus courte, la passer à l'isolateur de voix, la transcrire (mots horodatés), télécharger avec `curl`
      la voix isolée (`voix.mp3`) et `words_download_url` (`mots.json`).
   d. `python3 tools/motion/motion.py ancres <script> mots.json --tempo 1.15 --pause 0.3 --audio voix.mp3 > ancres.json`, puis
      `python3 tools/motion/motion.py rendu <script> ancres.json voix.mp3 media/motion/<date-mardi>-<slug>.mp4` (≈ 10 min).
      Regarder `…-apercu.png`. Si la vidéo dépasse 50 s, raccourcir le script et refaire la voix.
   e. Commit, push, noter le sha. Metricool, **mardi 12:00** : un post par réseau avec `media` = la vidéo jsDelivr et `videoThumbnailUrl` =
      la couverture jsDelivr : instagram `REEL` (`isAiGenerated: true`), facebook `REEL`, tiktok (`isAigc: true`, `title`), youtube `short`
      (`title` ≤ 100 car., `madeForKids: false`, `isAiGeneratedContent: true`), linkedin `post`. Textes selon la charte, lien de la page de la solution.
   f. `tools/motion/file.json` : statut `programme`, `date` du mardi.
   g. Ajouter l'entrée `video` au champ `formats` de `semaines/<mercredi>` dans le Studio (`update` avec `if_version` ; si le document n'existe
      pas encore, le créer avec seulement `formats`), journal (« Vidéo motion design préparée »), puis e-mail court à Bradley,
      objet `[Eloy] Vidéo du mardi JJ/MM : à relire avant mardi soir`, avec le lien de la vidéo, la couverture en pièce jointe et les textes.
6 quinquies. **Vidéos face caméra** : voir la section VIDÉO DE CHAQUE ARTICLE (script de l'article du mercredi et de l'article SEO du vendredi,
   et traitement des vidéos déposées par Bradley dans le dossier Drive).
6 sexies. Studio : ajouter à `semaines/<date>` le champ `formats` (carrousel, vidéo, script face caméra, et vidéos face caméra programmées)
   avant le `set` ; entrée de journal (« Carrousel, vidéo et script préparés »).
7. Newsletter Brevo : **en pause** (décision de Bradley le 19/10/2026). Ne rien préparer dans Brevo tant qu'il ne l'a pas réactivée.
8. Envoyer le récapitulatif à Bradley (Gmail, `send_message`), objet :
   `[Eloy] Contenus du mercredi JJ/MM : à relire avant mardi soir`. Contenu : titre et lien futur de l'article, texte complet de
   l'article (version lisible), les 5 posts, le visuel en pièce jointe, le carrousel (première image en pièce jointe + texte), le lien de la
   vidéo motion design (jsDelivr) et son texte, le script de la vidéo face caméra, les liens Metricool (`plannerUrl`), et en tête le lien du
   Studio : « Relire, modifier ou valider : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g ».
   Dernière ligne : « Vous pouvez aussi répondre à cet e-mail : STOP pour annuler, ou vos modifications. Sans réponse, tout part mercredi à 9 h. »

## MERCREDI (publier sur le site)
1. Lire la décision de Bradley à deux endroits : `avis/<date>` dans le Studio, et dans Gmail sa réponse au récapitulatif
   (même objet, après le lundi). Un STOP à l'un des deux endroits l'emporte.
   - STOP (`decision: "stop"` ou « STOP » par e-mail) : passer l'article à `annule` (fichier + calendrier + thème du Studio),
     passer **tous** les posts Metricool de la semaine en brouillon (article, carrousel, vidéo, face caméra : `updateScheduledPost`, `draft: true`),
     remettre la vidéo à `a_faire` dans `tools/motion/file.json`, commit, push, journal, prévenir Bradley, s'arrêter.
   - Corrections (`note` et/ou `posts` modifiés dans le Studio, ou modifications par e-mail) : appliquer la note à l'article ;
     pour chaque réseau dans `avis.posts`, remplacer le texte du post Metricool par le texte de Bradley tel quel
     (seulement s'il respecte les règles bloquantes de la charte ; sinon garder l'original et le dire) ; mettre à jour
     `semaines/<date>` ; relancer `verifier_article.py`.
     Si la note vise le **carrousel** : corriger le JSON, régénérer les images, push, mettre à jour les posts Metricool du samedi (nouveau sha).
     Si elle vise la **vidéo** (traité par la tâche « Eloy vidéo hebdo » du mercredi 10 h 17) : corriger le script ; si le texte lu change, refaire voix + ancres + rendu ; sinon seulement le rendu ;
     push et mise à jour des posts Metricool du mardi. Si elle vise un **texte de publication** : le remplacer dans Metricool.
   - `valide` ou rien : publier tel quel.
2. Build (l'article daté d'aujourd'hui entre dans le site), commit, push, noter le sha.
3. Webflow : mettre à jour le sha du script dans le code de pied de page (voir Repères) ; créer l'élément CMS dans la collection
   Guides avec le fieldData de `tools/articles/_cms/<slug>.json`, `isDraft: false` ; publier le site sur les domaines.
4. Vérifier que `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` répond (WebFetch) et que le titre est le bon.
5. Passer l'article et le thème à `publie` (fichier, calendrier, thème du Studio), commit, push, entrée de journal
   (« Article en ligne »). Envoyer à Bradley un e-mail court : article en ligne + lien, avec la ligne « À coller dans Bing Webmaster Tools → Soumission de l'URL : <lien> » (Bing activé par Bradley le 23/10/2026 ; IndexNow impossible sur Webflow).
6. Une fois par mois (premier mercredi) : rappeler à Bradley de réimporter `llms.txt` si des articles ont été ajoutés
   (Paramètres du site → SEO → LLMs.txt) et joindre la version à jour (les articles publiés ajoutés sous « Guides »).

## ARTICLE SEO DU VENDREDI (2e article de la semaine, depuis le 23/10/2026)
Décision de Bradley (23/10/2026) : passer à **2 articles par semaine**, le second ciblé sur un mot-clé local, toujours avec sa validation.
- **Thèmes** : `tools/articles/seo_calendrier.json`, une ligne par vendredi, champs `mot_cle`, `titre_indicatif` et `page_cible`. Les mots-clés viennent de la Search Console et du plan https://claude.ai/artifact/WpmSab4KorWY5vNqKBPqW4. Prendre le premier thème `a_faire` dont la date est le vendredi qui vient ; s'il n'y en a pas, le premier `a_faire` par `ordre`, daté du vendredi qui vient.
- **Lundi (même tâche que l'article du mercredi)**, rédiger aussi l'article SEO :
  - fichier `tools/articles/<vendredi>-<slug>.json`, même format, avec `"type": "seo"` et `"date"` = le vendredi ;
  - le **mot-clé exact** dans le titre H1, le titre Google (60 caractères au plus), la description, l'introduction, au moins un intertitre et une question de la FAQ ;
  - un **lien vers `page_cible`** dans le texte et dans l'encadré ;
  - un contenu **vraiment local** : communes, réalités du territoire, démarches. Jamais une copie d'un autre article où l'on changerait seulement le nom de l'île. Si un guide existant traite déjà le sujet, prendre un angle différent et faire un lien vers lui ;
  - un seul post, `posts.gmb` (Google Business). Pas de visuel réseaux ni de carrousel. **Une vidéo face caméra** (depuis le 23/10/2026) : écrire son script (section VIDÉO DE CHAQUE ARTICLE) ;
  - le contrôler avec `verifier_article.py` (il accepte `type: seo` avec seulement le post gmb) ;
  - le **présenter dans le même e-mail récapitulatif du lundi**, dans une partie « Article SEO du vendredi » qui donne le titre, le mot-clé visé, l'introduction et le lien vers le fichier sur GitHub. Bradley peut répondre STOP ou envoyer des corrections jusqu'au **jeudi soir** ;
  - programmer le post Google Business dans Metricool pour le **vendredi à 9 h** ;
  - passer le thème à `programme` dans `seo_calendrier.json` ;
  - commit et push.
- **Vendredi 7 h 48** (tâche « Eloy article SEO – vendredi »), suivre les étapes de la section MERCREDI pour cet article :
  - lire la réponse de Bradley dans Gmail. STOP : passer l'article à `annule` et le post Google Business en brouillon. Corrections : les appliquer ;
  - build, commit et push, sha du script dans le pied de page Webflow, élément CMS dans Guides, publication du site ;
  - vérifier la page, passer le thème à `publie`, puis envoyer un e-mail court à Bradley, avec le lien de l'article à coller dans Bing Webmaster Tools → Soumission de l'URL ;
  - ajouter l'article au fichier `llms.txt` (`tools/llms.txt`) et l'envoyer à Bradley en pièce jointe pour qu'il le réimporte ;
  - tout texte publié doit être dans le CMS, donc lisible par Google et les IA.

## GUIDE DU LUNDI (3e article de la semaine, depuis le 23/10/2026)
- **Choix du sujet, dans cet ordre** :
  1. une idée de Bradley `nouvelle` dans le Studio (`idees`, la plus ancienne d'abord ; une seule par semaine) ;
  2. un sujet d'**actualité** repéré par la veille (ci-dessous), s'il est utile aux clients et sûr (texte officiel publié, pas une rumeur) ;
  3. sinon le premier thème `a_faire` de `themes_lundi` dans `tools/articles/seo_calendrier.json` (20 thèmes validés par Bradley le 23/10/2026) ;
     quand un sujet 1 ou 2 est pris, les thèmes du calendrier se décalent d'une semaine (ne pas en sauter).
  Toujours vérifier dans `const GUIDES=` de `src/eloy.html` et dans les articles que le sujet n'est pas déjà traité sous le même angle.
- **Veille d'actualité** (à chaque passage du mercredi) : WebSearch sur les nouveautés des 15 derniers jours en assurance, crédit et
  financement (lois et décrets publiés, résiliation, assurance emprunteur, catastrophes naturelles, mutuelle, prévoyance, Girardin, PER)
  et aux Antilles-Guyane (arrêtés de catastrophe naturelle, cyclones, séismes, mesures locales). Ne retenir que des faits datés et sourcés
  (Légifrance, Service-public, ministères, préfectures, Ameli, ACPR, France Assureurs). Mettre une partie « Veille » dans l'e-mail
  (2 à 4 lignes, avec les liens) ; si un sujet mérite un article, le proposer ou le prendre pour le guide du lundi (règle ci-dessus).
- **Préparation (tâche du mercredi, après la publication de l'article du mercredi)** : rédiger le guide du lundi qui vient :
  - fichier `tools/articles/<lundi>-<slug>.json`, même format, `"type": "seo"`, `"date"` = le lundi, `"source"` = idee | actualite | planning ;
  - 900 à 1 400 mots, une vraie réponse pratique (étapes, pièces, délais légaux, pièges à éviter), le mot-clé du thème dans le H1,
    le titre Google, la description, l'introduction, un intertitre et une question de FAQ ; lien vers `page_cible` ;
  - un encadré **« Sources »** en fin d'article (dernier bloc de `body`, avant la FAQ) : 2 à 4 liens vers les textes officiels utilisés ;
  - si l'idée vient d'un dossier de Bradley : un encadré « L'avis du courtier » qui raconte le cas **anonymisé** (aucun nom, aucune commune
    précise, aucun montant), au « je » de Bradley ;
  - un seul post `posts.gmb` ; le script vidéo (section VIDÉO) ; `verifier_article.py` jusqu'à « OK » ;
  - thème à `programme` (ou idée à `planifiee`) ; commit, push ; post Google Business programmé le **lundi à 9 h** ;
  - e-mail à Bradley, objet `[Eloy] Guide du lundi JJ/MM : à relire avant jeudi soir`, avec le texte complet lisible, le script vidéo,
    la partie « Veille » et la dernière ligne « Répondez STOP pour annuler, ou envoyez vos corrections. Sans réponse, il part lundi à 7 h 48. »
- **Publication (tâche du lundi, en tout premier)** : si un article daté d'aujourd'hui (lundi) existe, lire la réponse de Bradley dans Gmail
  (même objet). STOP : `annule` + post Google en brouillon. Corrections : les appliquer. Puis comme le vendredi : build, commit, push,
  sha du pied de page Webflow, élément CMS dans Guides, publication du site, vérification, thème `publie` (et idée `publiee`),
  `llms.txt` mis à jour, e-mail court avec la ligne Bing. Ensuite seulement, continuer la tâche du lundi habituelle.

## VIDÉO DE CHAQUE ARTICLE (depuis le 23/10/2026)
Décision de Bradley : chaque article a sa vidéo face caméra, publiée sur YouTube (format classique) et intégrée à l'article ;
un extrait vertical part en Shorts, Reels, TikTok et LinkedIn. Il tourne en séries (environ 8 vidéos tous les 15 jours).
- **Script** (écrit avec l'article, présenté dans le même e-mail ; l'ajouter aussi à `facecam.json`, `scripts` : {date, slug, sujet, script}) :
  - en tête, le **code de la vidéo** = la date de l'article (AAAA-MM-JJ) : Bradley nomme son fichier avec ce code ;
  - 2 à 3 minutes, au « je », ton naturel, phrases courtes, vouvoiement ;
  - **Partie 1, 30 à 45 s, qui se suffit à elle-même** (elle devient l'extrait vertical) : accroche (question ou situation vécue),
    la réponse essentielle en 2 ou 3 phrases, puis « Je vous explique tout dans cette vidéo. » ; écrire ensuite **[pause de 2 secondes]** ;
  - Partie 2 : 3 ou 4 points (étapes, pièges, ce que fait Eloy), puis la conclusion « Écrivez-moi ou appelez-moi au 06 96 33 29 09.
    Tout est détaillé dans l'article sur le site d'Eloy. » ;
  - charte bloquante (aucun chiffre, taux, montant ni promesse ; courtier, jamais assureur ; pas de nom de partenaire) ; si crédit :
    les mentions obligatoires seront dans la description YouTube et la légende des posts (ne pas les faire lire) ;
  - 3 lignes de tournage : téléphone **à l'horizontale**, visage au centre de l'image (l'extrait vertical est recadré au centre), en 4K si possible,
    lumière face à une fenêtre, micro-cravate, pause de 2 secondes après la partie 1.
- **Vidéos déposées** (à chaque passage du lundi et du mercredi) : chercher dans le dossier Drive les vidéos (`mimeType contains 'video/'`)
  absentes de `deja_programmees`. Retrouver l'article par le code dans le nom du fichier (sinon par le sujet ; si doute, demander à Bradley). Pour chacune :
  a. vérifier que le fichier est partagé « Tous les utilisateurs disposant du lien » (`get_file_permissions`) ; sinon le partager s'il en a
     le droit (`share_file`, lecture, anyone), sinon demander à Bradley de le faire et passer à la suivante ;
  b. extrait vertical : `gh api -X POST repos/Badi972/eloy-site/actions/workflows/facecam.yml/dispatches -f ref=main -f "inputs[drive_id]=<fileId>"
     -f "inputs[nom]=<date>-<slug>"`, attendre le commit (`git pull`) : `media/facecam/<date>-<slug>.mp4` et `-couverture.jpg` (regarder la couverture) ;
  c. Metricool, le **lendemain 12:00** : YouTube `type: "video"` (vidéo complète : `media` = le lien Drive `viewUrl`), `title` ≤ 100 caractères
     avec le mot-clé de l'article, texte = description de 3 à 5 lignes + lien de l'article + mentions obligatoires si crédit, `tags` (5 à 8),
     `category: "EDUCATION"`, `madeForKids: false`, `isAiGeneratedContent: false` (vraie vidéo de Bradley) ;
  d. Metricool, le **surlendemain 12:00** : l'extrait vertical (`media` = jsDelivr du `.mp4`, `videoThumbnailUrl` = la couverture) en
     instagram `REEL`, facebook `REEL`, tiktok (`title`), youtube `short`, linkedin `post`, textes selon la charte, avec le lien de l'article ;
     `isAiGenerated`/`isAigc`/`isAiGeneratedContent` à false ;
  e. ajouter le fileId à `deja_programmees` (avec la date et le slug), commit, push, le dire dans l'e-mail.
- **Intégration dans l'article** (au passage suivant, une fois la vidéo YouTube publiée) : trouver le lien YouTube (`getScheduledPosts`
  du jour de publication, post youtube publié). S'il n'apparaît pas, demander à Bradley dans l'e-mail de répondre avec le lien.
  Puis `python3 tools/video_article.py tools/articles/<fichier>.json <lien> <durée m:ss>` (durée : `ffprobe` sur l'extrait ne suffit pas,
  prendre celle de YouTube ou la demander), build, commit, push, sha du pied de page Webflow, publication du site. Le site affiche alors un
  lecteur léger sous l'introduction et ajoute les données VideoObject pour Google. Pour un guide plus ancien (objet GUIDES de `src/eloy.html`),
  ajouter le même champ `video` à l'entrée du guide.

## CONTRÔLE TECHNIQUE DU LUNDI (depuis le 23/10/2026)
- Chaque lundi, après le build, lancer `python3 tools/verifier_site.py`. Il vérifie, sans rien modifier :
  - les titres Google (70 caractères au plus, 60 conseillés) et les descriptions (25 à 160) ;
  - les liens internes des guides et des articles ;
  - un seul h1.
- Mettre une partie « Contrôle technique » dans le récapitulatif du lundi : le nombre de points « À corriger » et les 5 premiers. S'il n'y a aucun nouveau problème, une ligne « Aucun nouveau problème » suffit.
- Ne rien corriger seul. Proposer les corrections (ancien → nouveau) ; Bradley valide comme pour les articles.
- Les titres raccourcis dans le CMS le 22/10/2026 sont dans `tools/titres_google_guides.csv`. Mettre ce fichier à jour à chaque nouveau changement de titre fait dans le CMS.

## PAGES À RETRAVAILLER (à chaque export Search Console de Bradley, environ une fois par mois)
- Quand Bradley envoie l'export (Pages.csv, Requêtes.csv), repérer :
  - les pages en position moyenne 8 à 20 avec des impressions : elles sont proches de la 1re page ;
  - les pages dont les clics ou la position ont baissé depuis l'export précédent (garder les exports dans `tools/gsc/AAAA-MM/`).
- Pour les 3 à 5 pages les plus prometteuses, proposer une amélioration :
  - titre et description avec la requête exacte ;
  - introduction qui répond tout de suite ;
  - un intertitre et une question de FAQ sur la requête ;
  - liens depuis les pages proches ;
  - contenu local vérifié.
- Montrer l'aperçu à Bradley et publier seulement après sa validation : code et CMS, empreintes `cms_base.json`, llms.txt si le titre change.
- Ajuster `seo_calendrier.json` si l'export révèle de nouvelles requêtes.

## Voix off (règles de Bradley au 20/10/2026)
- Voix clonée de Bradley dans ElevenLabs (outil `creative_generate_speech`) : `voice_id 47vno0SEmiQ8SqfV0s1D` (« Bradley »),
  **modèle `eleven_v3`**, texte précédé de la consigne `[neutral French accent from France]` (évite l'accent canadien entendu en v4 ;
  `tools/motion/motion.py texte` l'ajoute). Bradley trouve ce rendu le meilleur et professionnel. Ne pas utiliser v4.
- **Choix confirmé par Bradley le 21/10/2026** : vidéos motion design (et voix off sur images) = **v3** avec toutes les règles ci-dessous.
  Futures vidéos face caméra avec son clone (synchronisation des lèvres) = **`eleven_multilingual_v2`**. Bradley prévoit de réenregistrer
  sa voix dans ElevenLabs pour un meilleur clone : si un nouveau `voice_id` apparaît (`creative_list_voices`), lui demander lequel utiliser.
- Dans le texte lu : écrire **« Éloi »** (prononciation voulue, é-l-w-a) ; à l'écran on garde « Eloy ». Téléphone en toutes lettres.
- Toujours passer la voix dans l'**isolateur de voix** ElevenLabs (`creative_generate_in_flow`, `node_type voice-isolator`,
  `model_id audio_isolation`, `generations_count 1`) : supprime le souffle de fond que Bradley a remarqué.
- Rythme : `motion.py` raccourcit les silences à 0,3 s et accélère de 15 % sans changer le timbre (`--tempo 1.15`) ; Bradley veut un ton dynamique.
- Pas de nappe musicale ni de bourdonnement continu sous la voix (jugés gênants) : seulement des effets ponctuels, que `motion.py` génère et
  baisse automatiquement quand la voix parle. Musique éventuelle : à ajouter dans Instagram au moment de publier, pas dans le fichier.
- Les fichiers ElevenLabs (`storage.googleapis.com/xi-backend/...`) se téléchargent directement avec `curl` (domaine autorisé le 20/10/2026) ;
  à défaut, l'action « Medias Flora » (`media.yml`).

## En cas de problème
Ne jamais publier un contenu refusé par `verifier_article.py`. Si une étape échoue (Webflow, Metricool, Gmail), terminer
les autres, puis écrire à Bradley ce qui a échoué et ce qu'il doit faire. Ne jamais toucher au paragraphe `eloy-dir`,
au code d'en-tête du site ni aux autres pages.
