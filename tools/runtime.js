/* Eloy sur Webflow : affiche le site Eloy a l'identique a la place du contenu Webflow.
   Genere par tools/build.py, ne pas modifier dist/eloy.js a la main. */
(function () {
  "use strict";
  var CFG = /*__CFG__*/null;
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/[^\/]*$/, "") : "";
  var D = document, W = window;

  /* 1. Couper la feuille de style Webflow et les gestionnaires de liens de Webflow */
  [].slice.call(D.querySelectorAll('link[rel="stylesheet"]')).forEach(function (l) {
    if (/website-files\.com|webflow/i.test(l.href)) l.parentNode.removeChild(l);
  });
  [].slice.call(D.querySelectorAll("head style")).forEach(function (s) {
    if (s.id !== "eloy-boot") s.parentNode.removeChild(s);
  });
  function offWebflow() {
    try { if (W.jQuery) W.jQuery(D).off("click.wf-scroll click.wf-empty-link"); } catch (e) {}
  }
  offWebflow();
  D.addEventListener("DOMContentLoaded", function () { setTimeout(offWebflow, 0); });
  W.addEventListener("load", function () { setTimeout(offWebflow, 0); });

  /* 2. Mettre de cote le contenu Webflow (garde en memoire pour la suite) */
  var WF = D.createDocumentFragment();
  [].slice.call(D.body.childNodes).forEach(function (n) {
    if (n.nodeType === 1 && /^(SCRIPT|NOSCRIPT)$/.test(n.tagName)) return;
    WF.appendChild(n);
  });
  W.ELOY_WF = WF;

  /* 3. En-tete : titre, description, favicon, donnees structurees */
  W.ELOY_WF_TITLE = D.title;
  D.title = CFG.title;
  var md = D.querySelector('meta[name="description"]');
  if (!md) { md = D.createElement("meta"); md.name = "description"; D.head.appendChild(md); }
  md.setAttribute("content", CFG.desc);
  [].slice.call(D.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')).forEach(function (l) { l.parentNode.removeChild(l); });
  var ic = D.createElement("link"); ic.rel = "icon"; ic.href = CFG.icon.replace("__ELOYB__", BASE); D.head.appendChild(ic);
  var ld = D.createElement("script"); ld.type = "application/ld+json"; ld.text = CFG.ld; D.head.appendChild(ld);

  /* 4. Adresses : chaque vue du site a une vraie adresse */
  var TOK = CFG.routes.tok, ALIAS = CFG.routes.alias, P2T = {};
  Object.keys(TOK).forEach(function (k) { P2T[TOK[k]] = k; });
  Object.keys(ALIAS).forEach(function (p) { P2T[p] = ALIAS[p]; });
  P2T["/"] = "";
  function cleanPath(p) { p = (p || "/").replace(/\/+$/, ""); return p || "/"; }
  function hashTok() { return decodeURIComponent((location.hash || "").slice(1).split("?")[0]); }
  function pathTok() { var p = cleanPath(location.pathname); return Object.prototype.hasOwnProperty.call(P2T, p) ? P2T[p] : ""; }
  function isView(t) {
    if (t === "" || t === "accueil" || t === "guides" || t === "confidentialite" || t === "espace-client" || t === "devenir-partenaire" || t === "patrimoine") return true;
    try {
      if (typeof GUIDES !== "undefined" && GUIDES[t]) return true;
      if (typeof CONTENT !== "undefined" && CONTENT[t] && PRODUCTS[t]) return true;
      if (typeof SPACES !== "undefined" && SPACES[t]) return true;
    } catch (e) {}
    return false;
  }
  function tokPath(t) { return TOK[t] || (t === "" ? "/" : null); }
  function viewPath() {
    var v = typeof VIEW !== "undefined" ? VIEW : "acc";
    if (v === "acc") return "/";
    if (v === "conf") return "/confidentialite";
    if (v === "client") return "/espace-client";
    if (v === "partner") return "/devenir-partenaire";
    if (v === "patri") return "/patrimoine";
    if (v === "page") return tokPath(state.product) || "/";
    if (v === "guides") { var p = cleanPath(location.pathname); return (p.indexOf("/guides/") === 0 || p === "/nos-guides") ? p : "/nos-guides"; }
    if (v === "space") {
      if (state.aud === "assur") return state.sub === "pro" ? "/assurances/professionnels" : "/assurances/particuliers";
      if (state.aud === "credit") return "/credits/rachat";
      if (state.aud === "pro") return "/financement-pro";
    }
    return "/";
  }
  function visible(id) { var e = id && D.getElementById(id); return !!(e && !e.closest("[hidden]")); }
  function here() { return location.pathname + location.search + location.hash; }

  var E = W.__ELOY = { tok: "", last: null, path: null };
  E.route = function (deep) {
    var h = hashTok(), p = pathTok(), tok, anchor = "";
    if (h && isView(h)) tok = h;
    else if (h && !deep && visible(h)) tok = h;
    else if (deep && p && isView(p)) { tok = p; anchor = h; }
    else tok = h || p || "";
    E.tok = tok;
    route();
    var url;
    if (isView(tok)) url = (tokPath(tok) || "/") + location.search + (anchor ? "#" + anchor : "");
    else url = viewPath() + location.search + (tok ? "#" + tok : "");
    if (url !== here()) history.replaceState(history.state, "", url);
    E.last = here(); E.path = location.pathname;
    if (anchor) setTimeout(function () { var x = D.getElementById(anchor); if (x && !x.closest("[hidden]")) x.scrollIntoView({ block: "start" }); }, 60);
  };
  E.onHash = function () {
    if (E.force) { E.force = false; E.route(false); return; }
    if (here() === E.last) return;
    E.route(location.pathname !== E.path);
  };
  E.nav = function (tok) {
    var u = isView(tok) ? (tokPath(tok) || "/") + location.search : null;
    if (u === null) { location.hash = tok; return; }
    if (u !== here()) history.pushState(null, "", u);
    E.force = true;
    W.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  W.addEventListener("popstate", function () {
    if (location.pathname !== E.path) W.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  /* 5. Contenu du site Eloy, puis ses scripts, dans l'ordre d'origine */
  D.body.insertAdjacentHTML("afterbegin", CFG.markup.split("__ELOYB__").join(BASE));
  CFG.scripts.forEach(function (code) {
    var s = D.createElement("script"); s.text = code; D.body.appendChild(s);
  });

  /* 6. Afficher */
  var boot = D.getElementById("eloy-boot"); if (boot) boot.parentNode.removeChild(boot);
})();
