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
- Brevo : liste « CONTACTS PROD 2024 » (id 4, ~141 contacts), expéditeur « Eloy Assurances » (id 1). Newsletter en brouillon uniquement, jamais envoyée sans accord.
- E-mail de Bradley : `bradleyvillages@gmail.com` (récapitulatifs, envoyés depuis son Gmail connecté).
- Calendrier : `tools/articles/calendrier.json`. Un article = `tools/articles/AAAA-MM-JJ-slug.json` (AAAA-MM-JJ = jeudi de publication).

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
1. Charger la charte. Ouvrir `calendrier.json`, prendre le premier thème `a_faire` dont la date est le jeudi qui vient.
   S'il n'y en a plus : proposer 4 nouveaux thèmes dans le récapitulatif et s'arrêter là.
2. Rédiger l'article (900 à 1 400 mots) et les 5 posts selon la charte. Écrire le fichier `tools/articles/<date>-<slug>.json`.
3. Contrôler : `python3 tools/verifier_article.py tools/articles/<fichier>.json`. Corriger jusqu'à « OK ».
4. Visuel : `python3 tools/visuel.py "<visuel.titre>" "<visuel.sous_titre>" dist/img/posts/<date>.png`, puis le regarder (Read) pour vérifier.
5. Passer le thème à `programme` dans `calendrier.json`. Build (`python3 tools/build.py src/eloy.html` : l'article daté du jeudi
   n'apparaît pas encore sur le site), commit, push. Noter le sha.
6. Programmer dans Metricool pour **jeudi 09:00 (America/Martinique)** un post par réseau connecté, avec le texte du réseau et
   `media: ["https://cdn.jsdelivr.net/gh/Badi972/eloy-site@<sha>/dist/img/posts/<date>.png"]`
   (gmb : `gmbData {type: publication}` ; facebook : POST ; instagram : POST ; linkedin : post ; tiktok : photo, `privacyOption PUBLIC_TO_EVERYONE`).
   Le lien de l'article dans les posts : `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` (il sera en ligne le jeudi matin).
7. Premier lundi du mois : préparer en plus un brouillon de newsletter dans Brevo (3 rubriques : les articles du mois précédent,
   une solution, une échéance du moment). Si aucune liste de contacts n'existe dans Brevo, le dire dans le récapitulatif.
8. Envoyer le récapitulatif à Bradley (Gmail, `send_message`), objet :
   `[Eloy] Contenus du jeudi JJ/MM : à relire avant mercredi soir`. Contenu : titre et lien futur de l'article, texte complet de
   l'article (version lisible), les 5 posts, le visuel en pièce jointe, les liens Metricool (`plannerUrl`).
   Dernière ligne : « Pour annuler, répondez STOP. Pour corriger, répondez avec vos modifications. Sans réponse, tout part jeudi à 9 h. »

## JEUDI (publier sur le site)
1. Chercher dans Gmail la réponse de Bradley au récapitulatif de la semaine (même objet, après le lundi).
   - « STOP » : passer l'article à `annule` (fichier + calendrier), passer les posts Metricool en brouillon (`updateScheduledPost`, `draft: true`),
     commit, push, prévenir Bradley, s'arrêter.
   - Des corrections : les appliquer à l'article et aux posts Metricool concernés, relancer `verifier_article.py`.
2. Build (l'article daté d'aujourd'hui entre dans le site), commit, push, noter le sha.
3. Webflow : mettre à jour le sha du script dans le code de pied de page (voir Repères) ; créer l'élément CMS dans la collection
   Guides avec le fieldData de `tools/articles/_cms/<slug>.json`, `isDraft: false` ; publier le site sur les domaines.
4. Vérifier que `https://www.eloy-assurances-patrimoine.fr/guides/<slug>` répond (WebFetch) et que le titre est le bon.
5. Passer l'article et le thème à `publie`, commit, push. Envoyer à Bradley un e-mail court : article en ligne + lien.
6. Une fois par mois (premier jeudi) : rappeler à Bradley de réimporter `llms.txt` si des articles ont été ajoutés
   (Paramètres du site → SEO → LLMs.txt) et joindre la version à jour (les articles publiés ajoutés sous « Guides »).

## En cas de problème
Ne jamais publier un contenu refusé par `verifier_article.py`. Si une étape échoue (Webflow, Metricool, Gmail), terminer
les autres, puis écrire à Bradley ce qui a échoué et ce qu'il doit faire. Ne jamais toucher au paragraphe `eloy-dir`,
au code d'en-tête du site ni aux autres pages.
