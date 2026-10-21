# Procédure hebdomadaire de contenu Eloy

Trois tâches planifiées l'exécutent : **lundi 7 h 48** (préparer et programmer), **jeudi 7 h 48** (publier sur le site) et
**« Eloy vidéo hebdo » lundi et jeudi 10 h 17** (vidéo motion design : préparation le lundi, corrections le jeudi ; c'est la seule qui a le connecteur ElevenLabs).
Mode choisi par Bradley le 19/10/2026 : **fenêtre de correction**. Tout est prêt le lundi, programmé pour le jeudi ;
Bradley reçoit un récapitulatif et peut corriger ou annuler jusqu'au mercredi soir. Sans réponse, tout part le jeudi.

**Formats depuis le 20/10/2026** (décision de Bradley : validation avant publication, 3 publications par semaine) :
| Jour (America/Martinique) | Contenu | Réseaux |
|---|---|---|
| Jeudi 9 h | Article du site + visuel photo (déjà en place) | gmb, facebook, instagram, linkedin, tiktok |
| Samedi 9 h | **Carrousel conseils** tiré de l'article de la semaine (`tools/carrousel.py`) | instagram, facebook, linkedin |
| Mardi suivant 12 h | **Vidéo motion design** (file `tools/motion/file.json`, outil `tools/motion/motion.py`) | instagram (REEL), facebook (REEL), tiktok, youtube (short), linkedin |
| Au fil de l'eau | **Vidéos face caméra** de Bradley déposées dans le dossier Drive (script fourni chaque lundi) | instagram (REEL), facebook (REEL), tiktok, youtube (short), linkedin |
Tout est préparé le lundi et validé dans la même fenêtre (lundi → mercredi soir) : une seule décision dans `avis/<date>` couvre l'article,
le carrousel, la vidéo et la vidéo face caméra de la semaine. Un STOP annule tous les formats de la semaine.

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
- Calendrier : `tools/articles/calendrier.json`. Un article = `tools/articles/AAAA-MM-JJ-slug.json` (AAAA-MM-JJ = jeudi de publication).
- **Studio contenu** (tableau de bord de Bradley) : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g, base lue et écrite avec l'outil
  `ArtifactData` (charger avec ToolSearch « select:ArtifactData », toujours passer `url` ci-dessus). C'est **la référence** pour le calendrier :
  Bradley y ajoute, modifie, réordonne, met en pause ou supprime des thèmes, et y donne sa décision sur l'article de la semaine.
  Collections :
  - `themes/<id>` : {date, statut (a_faire, programme, publie, annule, pause), ordre, cat, titre, angle, page, cible, slug?}.
    La page recalcule elle-même les dates des thèmes `a_faire` (jeudis consécutifs) ; ne pas les redater soi-même.
  - `semaines/<date>` : l'article préparé (écrit le lundi, fichier produit par `tools/studio_export.py`). Champ `formats` ajouté
    le 20/10/2026, affiché par le Studio sous l'article : liste de {type: video | carrousel | facecam, quand (ex. « mardi 03/11, 12 h »),
    titre, reseaux: [..], url (vidéo ou 1re image, jsDelivr), couverture (data URI JPEG ~270 px de large), miniatures: [data URI ~200 px] (carrousel),
    legende (texte des posts), script (facecam)}. Ajouter ce champ dans le JSON exporté avant le `set` (garder les data URI petites : < 25 Ko chacune).
  - `visuels/<date>` : vignette du visuel en data URI (idem).
  - `avis/<date>` : décision de Bradley, **écrite par lui, à lire seulement** : {decision: valide | corrections | stop, note, posts: {reseau: texte modifié}, at}.
  - `reglages/canaux` : {items: [{id, nom, etat (actif, pause, bientot), note}]} ; le mettre à jour si un réseau est déconnecté.
  - `journal/<AAAA-MM>` : {entrees: [{quand (ISO, -04:00), tache (lundi | jeudi), texte, ok}]} ; ajouter une entrée à chaque passage
    (lire le document du mois, ajouter l'entrée, `set` avec `if_version` ; le créer s'il n'existe pas).
  Les documents marqués `test: true` (thème `test-essai`, semaines d'essai) sont des essais : les ignorer totalement
  (ni publication, ni Metricool, ni recopie dans `calendrier.json`).
  Chaque écriture sur un document existant demande `if_version` (la `version` lue juste avant).
  Si `ArtifactData` est indisponible ou échoue : continuer avec `calendrier.json` et l'e-mail seuls, et le signaler dans le récapitulatif.

## Format d'un article (JSON)
```
{"slug": "assurance-habitation-fin-saison-cyclonique",   // minuscules, tirets, unique (ne pas réutiliser un guide existant)
 "date": "2026-10-29", "statut": "programme",
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
Liens internes dans le HTML : `/solutions/<slug>`, `/credits/rachat`, `/contact`, `/guides/<slug>` (voir la charte, section 6).
Les rubriques et guides existants se lisent dans `src/eloy.html` (objet `const GUIDES=`) : ne jamais traiter un sujet déjà couvert sous le même angle.

## LUNDI (préparer et programmer)
1. Charger la charte. Lire tous les `themes` du Studio (`list`, limit 100) et réécrire `calendrier.json` pour qu'il corresponde
   exactement (mêmes thèmes, dates, statuts ; garder la clé `_info` ; ajouter le champ `id` du Studio à chaque thème).
   Prendre le thème `a_faire` dont la date est le jeudi qui vient. S'il n'y en a pas : prendre le premier `a_faire` par `ordre`
   et lui donner la date du jeudi qui vient. S'il n'y en a plus aucun : ajouter 4 nouveaux thèmes `a_faire` dans le Studio
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
5. Passer le thème à `programme` dans `calendrier.json`. Build (`python3 tools/build.py src/eloy.html` : l'article daté du jeudi
   n'apparaît pas encore sur le site), commit, push. Noter le sha.
6. Programmer dans Metricool pour **jeudi 09:00 (America/Martinique)** un post par réseau connecté, avec le texte du réseau et
   `media: ["https://cdn.jsdelivr.net/gh/Badi972/eloy-site@<sha>/dist/img/posts/<fichier>"]`, avec le bon format par réseau :
   Instagram, Facebook, LinkedIn → `<date>.png` (4:5) ; Google → `<date>-43.png` (4:3) ; TikTok → `<date>-916.png` (9:16)
   (gmb : `gmbData {type: publication}` ; facebook : POST ; instagram : POST ; linkedin : post ; tiktok : photo, `privacyOption PUBLIC_TO_EVERYONE`).
   Le lien de l'article dans les posts : `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` (il sera en ligne le jeudi matin).
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
   Date = jeudi de la semaine + 5 jours. Prendre la première vidéo `a_faire` (ou `prepare` sans date) de `tools/motion/file.json`.
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
      matériel professionnel à moindre coût ») et le titre à l'écran commence par « Avec Eloy, ». Un chiffre d'économie n'est autorisé que
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
   g. Ajouter l'entrée `video` au champ `formats` de `semaines/<jeudi>` dans le Studio (`update` avec `if_version` ; si le document n'existe
      pas encore, le créer avec seulement `formats`), journal (« Vidéo motion design préparée »), puis e-mail court à Bradley,
      objet `[Eloy] Vidéo du mardi JJ/MM : à relire avant mercredi soir`, avec le lien de la vidéo, la couverture en pièce jointe et les textes.
6 quinquies. **Vidéo face caméra** :
   a. Écrire un script court pour Bradley (30 à 45 s, face caméra, ton naturel) sur un problème client lié à l'article ou à la vidéo de la semaine :
      accroche en une phrase (question ou situation vécue), 3 idées maximum, conclusion « Écrivez-moi en message privé ou appelez le 06 96 33 29 09 ».
      Conseils de tournage en 3 lignes (téléphone vertical, lumière face à une fenêtre, micro-cravate si possible). L'ajouter à `facecam.json`.
   b. Chercher dans le dossier Drive les vidéos (`mimeType contains 'video/'`) absentes de `deja_programmees`. Pour chacune (une seule par jour) :
      la regarder n'est pas possible, donc se fier à son nom de fichier et au script le plus récent pour écrire les textes ; programmer pour le
      **vendredi 12:00** suivant (puis les jours suivants à 12 h s'il y en a plusieurs) sur instagram REEL, facebook REEL, tiktok, youtube short,
      linkedin, avec `media` = le lien Drive (`viewUrl`) du fichier (Metricool l'importe si Google Drive est relié à son compte Metricool ;
      en cas d'erreur, le dire dans le récapitulatif et demander à Bradley de relier Google Drive dans Metricool ou de partager le fichier
      « Tous les utilisateurs disposant du lien »). Ajouter le fileId à `deja_programmees`.
6 sexies. Studio : ajouter à `semaines/<date>` le champ `formats` (carrousel, vidéo, script face caméra, et vidéos face caméra programmées)
   avant le `set` ; entrée de journal (« Carrousel, vidéo et script préparés »).
7. Newsletter Brevo : **en pause** (décision de Bradley le 19/10/2026). Ne rien préparer dans Brevo tant qu'il ne l'a pas réactivée.
8. Envoyer le récapitulatif à Bradley (Gmail, `send_message`), objet :
   `[Eloy] Contenus du jeudi JJ/MM : à relire avant mercredi soir`. Contenu : titre et lien futur de l'article, texte complet de
   l'article (version lisible), les 5 posts, le visuel en pièce jointe, le carrousel (première image en pièce jointe + texte), le lien de la
   vidéo motion design (jsDelivr) et son texte, le script de la vidéo face caméra, les liens Metricool (`plannerUrl`), et en tête le lien du
   Studio : « Relire, modifier ou valider : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g ».
   Dernière ligne : « Vous pouvez aussi répondre à cet e-mail : STOP pour annuler, ou vos modifications. Sans réponse, tout part jeudi à 9 h. »

## JEUDI (publier sur le site)
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
     Si elle vise la **vidéo** (traité par la tâche « Eloy vidéo hebdo » du jeudi 10 h 17) : corriger le script ; si le texte lu change, refaire voix + ancres + rendu ; sinon seulement le rendu ;
     push et mise à jour des posts Metricool du mardi. Si elle vise un **texte de publication** : le remplacer dans Metricool.
   - `valide` ou rien : publier tel quel.
2. Build (l'article daté d'aujourd'hui entre dans le site), commit, push, noter le sha.
3. Webflow : mettre à jour le sha du script dans le code de pied de page (voir Repères) ; créer l'élément CMS dans la collection
   Guides avec le fieldData de `tools/articles/_cms/<slug>.json`, `isDraft: false` ; publier le site sur les domaines.
4. Vérifier que `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` répond (WebFetch) et que le titre est le bon.
5. Passer l'article et le thème à `publie` (fichier, calendrier, thème du Studio), commit, push, entrée de journal
   (« Article en ligne »). Envoyer à Bradley un e-mail court : article en ligne + lien.
6. Une fois par mois (premier jeudi) : rappeler à Bradley de réimporter `llms.txt` si des articles ont été ajoutés
   (Paramètres du site → SEO → LLMs.txt) et joindre la version à jour (les articles publiés ajoutés sous « Guides »).

## Voix off (règles de Bradley au 20/10/2026)
- Voix clonée de Bradley dans ElevenLabs (outil `creative_generate_speech`) : `voice_id 47vno0SEmiQ8SqfV0s1D` (« Bradley »),
  **modèle `eleven_v3`**, texte précédé de la consigne `[neutral French accent from France]` (évite l'accent canadien entendu en v4 ;
  `tools/motion/motion.py texte` l'ajoute). Bradley trouve ce rendu le meilleur et professionnel. Ne pas utiliser v4.
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
