# eloy-site

Fichiers du site Eloy chargés par Webflow (site « Eloy V2 ») via jsDelivr.

- `dist/eloy.css` : la feuille de style du site Eloy.
- `dist/eloy.js` : le contenu et les scripts du site Eloy, avec de vraies adresses de pages (/solutions/…, /guides/…).
- `dist/img/` : logos et images.

Ne pas modifier `dist/` à la main : régénérer avec `python3 tools/build.py eloy.html`.
Les adresses des pages sont dans `tools/routes.json`.
