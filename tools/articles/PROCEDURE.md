# Procédure hebdomadaire de contenu Eloy

Deux tâches planifiées l'exécutent : **lundi** (préparer et programmer) et **jeudi** (publier sur le site).
Mode choisi par Bradley le 19/10/2026 : **fenêtre de correction**. Tout est prêt le lundi, programmé pour le jeudi ;
Bradley reçoit un récapitulatif et peut corriger ou annuler jusqu'au mercredi soir. Sans réponse, tout part le jeudi.

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
- Calendrier : `tools/articles/calendrier.json`. Un article = `tools/articles/AAAA-MM-JJ-slug.json` (AAAA-MM-JJ = jeudi de publication).
- **Studio contenu** (tableau de bord de Bradley) : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g, base lue et écrite avec l'outil
  `ArtifactData` (charger avec ToolSearch « select:ArtifactData », toujours passer `url` ci-dessus). C'est **la référence** pour le calendrier :
  Bradley y ajoute, modifie, réordonne, met en pause ou supprime des thèmes, et y donne sa décision sur l'article de la semaine.
  Collections :
  - `themes/<id>` : {date, statut (a_faire, programme, publie, annule, pause), ordre, cat, titre, angle, page, cible, slug?}.
    La page recalcule elle-même les dates des thèmes `a_faire` (jeudis consécutifs) ; ne pas les redater soi-même.
  - `semaines/<date>` : l'article préparé (écrit le lundi, fichier produit par `tools/studio_export.py`).
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
7. Newsletter Brevo : **en pause** (décision de Bradley le 19/10/2026). Ne rien préparer dans Brevo tant qu'il ne l'a pas réactivée.
8. Envoyer le récapitulatif à Bradley (Gmail, `send_message`), objet :
   `[Eloy] Contenus du jeudi JJ/MM : à relire avant mercredi soir`. Contenu : titre et lien futur de l'article, texte complet de
   l'article (version lisible), les 5 posts, le visuel en pièce jointe, les liens Metricool (`plannerUrl`), et en tête le lien du
   Studio : « Relire, modifier ou valider : https://claude.ai/artifact/4G3NSjEbxs8Ea2QQkDdR8g ».
   Dernière ligne : « Vous pouvez aussi répondre à cet e-mail : STOP pour annuler, ou vos modifications. Sans réponse, tout part jeudi à 9 h. »

## JEUDI (publier sur le site)
1. Lire la décision de Bradley à deux endroits : `avis/<date>` dans le Studio, et dans Gmail sa réponse au récapitulatif
   (même objet, après le lundi). Un STOP à l'un des deux endroits l'emporte.
   - STOP (`decision: "stop"` ou « STOP » par e-mail) : passer l'article à `annule` (fichier + calendrier + thème du Studio),
     passer les posts Metricool en brouillon (`updateScheduledPost`, `draft: true`), commit, push, journal, prévenir Bradley, s'arrêter.
   - Corrections (`note` et/ou `posts` modifiés dans le Studio, ou modifications par e-mail) : appliquer la note à l'article ;
     pour chaque réseau dans `avis.posts`, remplacer le texte du post Metricool par le texte de Bradley tel quel
     (seulement s'il respecte les règles bloquantes de la charte ; sinon garder l'original et le dire) ; mettre à jour
     `semaines/<date>` ; relancer `verifier_article.py`.
   - `valide` ou rien : publier tel quel.
2. Build (l'article daté d'aujourd'hui entre dans le site), commit, push, noter le sha.
3. Webflow : mettre à jour le sha du script dans le code de pied de page (voir Repères) ; créer l'élément CMS dans la collection
   Guides avec le fieldData de `tools/articles/_cms/<slug>.json`, `isDraft: false` ; publier le site sur les domaines.
4. Vérifier que `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` répond (WebFetch) et que le titre est le bon.
5. Passer l'article et le thème à `publie` (fichier, calendrier, thème du Studio), commit, push, entrée de journal
   (« Article en ligne »). Envoyer à Bradley un e-mail court : article en ligne + lien.
6. Une fois par mois (premier jeudi) : rappeler à Bradley de réimporter `llms.txt` si des articles ont été ajoutés
   (Paramètres du site → SEO → LLMs.txt) et joindre la version à jour (les articles publiés ajoutés sous « Guides »).

## Voix off et vidéos (essai validé en cours, 20/10/2026)
- Voix : la voix clonée de Bradley dans ElevenLabs (connecteur ElevenLabs, outil `creative_generate_speech`) :
  `voice_id 47vno0SEmiQ8SqfV0s1D` (« Bradley »), **modèle `eleven_multilingual_v2` obligatoire** (c'est celui qui ressemble le plus
  à sa voix ; ne pas utiliser v3 ni v4). Dans le texte lu, écrire le nom du cabinet **« Eloi »** (E-L-O-I, sans accent) (prononciation voulue par Bradley ; à l'écran on garde « Eloy »).
  Accélérer la voix de 15 à 18 % au montage (`ffmpeg -af atempo=1.18`) : ton entraînant voulu par Bradley. Musique discrète sous la voix (`volume_musique` 0.07). Écrire le téléphone en toutes lettres : « zéro six, quatre-vingt-seize, trente-trois, vingt-neuf, zéro neuf ».
- Récupérer le MP3 (URL `storage.googleapis.com/xi-backend/...`) avec l'action « Medias Flora » (`media.yml`), comme les fichiers Flora.
- Montage : `tools/video_calques.py` (calques aux couleurs Eloy) puis `tools/video_montage.py` (plans Flora + voix + musique), caler les
  textes sur les pauses de la voix (`ffmpeg -af silencedetect`). Vidéo verticale 1080 × 1920, 20 à 30 s, fin sur la carte Eloy.

## En cas de problème
Ne jamais publier un contenu refusé par `verifier_article.py`. Si une étape échoue (Webflow, Metricool, Gmail), terminer
les autres, puis écrire à Bradley ce qui a échoué et ce qu'il doit faire. Ne jamais toucher au paragraphe `eloy-dir`,
au code d'en-tête du site ni aux autres pages.
