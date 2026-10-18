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

  /* 5. Envoi des demandes par le formulaire natif Webflow (e-mail de notification du site).
        Les adresses d'envoi « eloy-webflow:… » sont reglees dans tools/build.py. */
  var FW = CFG.form;
  D.body.insertAdjacentHTML("beforeend",
    '<div class="w-form" id="eloy-wf" style="display:none" aria-hidden="true">' +
    '<form id="eloy-wf-f" name="wf-form-' + FW.name.replace(/\W+/g, "-") + '" data-name="' + FW.name + '" method="get" data-wf-page-id="' + FW.pageId + '" data-wf-element-id="' + FW.elementId + '">' +
    '<input type="submit" value="Envoyer" data-wait="Envoi…"></form>' +
    '<div class="w-form-done"></div><div class="w-form-fail"></div></div>');
  var LBL = { "Type de demande": "Type de demande", fullName: "Nom", nomComplet: "Nom", "Nom et prénom": "Nom", nom: "Nom", prenom: "Prénom",
    phone: "Téléphone", telephone: "Téléphone", "Téléphone": "Téléphone", email: "Email", "E-mail": "Email",
    product: "Demande", Demande: "Demande", societe: "Société", activite: "Activité", besoin: "Besoin", mainNeed: "Besoin principal",
    socialRegime: "Régime social", creneau: "Créneau de rappel", revenus: "Revenus mensuels", nbCredits: "Nombre de crédits",
    montantCredits: "Montant des crédits", mensualitesCredits: "Mensualités actuelles", domicile: "Logement",
    situationPro: "Situation professionnelle", segment: "Segment", Segment: "Segment", territoire: "Territoire", Territoire: "Territoire",
    message: "Message", Message: "Message", texte: "Récapitulatif", observations: "Récapitulatif", formulaire: "Formulaire",
    page: "Page", Page: "Page", suivi: "Source publicitaire", "Source publicitaire": "Source publicitaire",
    "Accord de recontact": "Accord de recontact", consentementDate: "Accord de recontact", source: "Origine" };
  var SKIP = { _subject: 1, _template: 1, Destinataire: 1, type: 1, consentement: 1, author: 1, at: 1, site: 1, mainNeed: 1 };
  function str(v) {
    if (v == null) return "";
    if (Array.isArray(v)) return v.map(function (x) { return x && typeof x === "object" ? (x.text || JSON.stringify(x)) : String(x); }).join("\n");
    if (typeof v === "object") return Object.keys(v).map(function (k) { return k + "=" + v[k]; }).join(", ");
    return String(v);
  }
  function flat(kind, body) {
    var out = [], seen = {};
    function put(label, val) { val = str(val).trim(); if (!val || seen[label]) return; seen[label] = 1; out.push([label, val]); }
    var type = kind === "partenaire" ? "Partenariat" : kind === "rachat" ? (body.revenus != null ? "Simulation regroupement de crédits" : "Regroupement de crédits") :
      (body.product || body.Demande || (body._subject || "").replace(/^Site Eloy – /, "") || "Contact");
    put("Type de demande", type);
    if (body.source === "site") delete body.source;
    if (body.product === type) delete body.product;
    if (body.Demande === type) delete body.Demande;
    if (body.meta && body.meta.besoin === type) delete body.meta.besoin;
    if (body.consentementDate) body.consentementDate = "oui, le " + new Date(body.consentementDate).toLocaleString("fr-FR");
    if (body.meta && body.meta.consentementDate) body.meta.consentementDate = "oui, le " + new Date(body.meta.consentementDate).toLocaleString("fr-FR");
    if (body.nomComplet) { delete body.nom; delete body.prenom; }
    var meta = body.meta || {}; delete body.meta;
    [body, meta].forEach(function (o) {
      Object.keys(o).forEach(function (k) { if (!SKIP[k]) put(LBL[k] || k, o[k]); });
    });
    put("Page", location.href);
    return out;
  }
  var queue = Promise.resolve();
  function sendWebflow(kind, body) {
    return new Promise(function (resolve) {
      var wrap = D.getElementById("eloy-wf"), f = D.getElementById("eloy-wf-f");
      if (!W.jQuery || !W.Webflow || !f) return resolve(false);
      var done = wrap.querySelector(".w-form-done"), fail = wrap.querySelector(".w-form-fail");
      [].slice.call(f.querySelectorAll('input[type="hidden"]')).forEach(function (i) { f.removeChild(i); });
      flat(kind, body).forEach(function (p) {
        var i = D.createElement("input"); i.type = "hidden"; i.name = p[0]; i.setAttribute("data-name", p[0]); i.value = p[1];
        f.insertBefore(i, f.lastChild);
      });
      f.style.display = "block"; done.style.display = "none"; fail.style.display = "none";
      var t, mo = new MutationObserver(check);
      function end(ok) { clearTimeout(t); mo.disconnect(); resolve(ok); }
      function check() {
        if (done.style.display === "block") end(true);
        else if (fail.style.display === "block") end(false);
      }
      mo.observe(done, { attributes: true, attributeFilter: ["style"] });
      mo.observe(fail, { attributes: true, attributeFilter: ["style"] });
      t = setTimeout(function () { end(false); }, 15000);
      var btn = f.querySelector('input[type="submit"]');
      if (f.requestSubmit) f.requestSubmit(btn); else W.jQuery(f).trigger("submit");
    });
  }
  var nativeFetch = W.fetch;
  W.fetch = function (url, opt) {
    if (typeof url === "string" && url.indexOf("eloy-webflow:") === 0) {
      var kind = url.slice(13), body = {};
      try { body = JSON.parse((opt && opt.body) || "{}"); } catch (e) {}
      var p = queue.then(function () { return sendWebflow(kind, body); });
      queue = p.catch(function () {});
      return p.then(function (ok) {
        return { ok: ok, status: ok ? 200 : 502, json: function () { return Promise.resolve({}); }, text: function () { return Promise.resolve(""); } };
      });
    }
    return nativeFetch.apply(this, arguments);
  };

  /* 6. Contenu du site Eloy, puis ses scripts, dans l'ordre d'origine */
  D.body.insertAdjacentHTML("afterbegin", CFG.markup.split("__ELOYB__").join(BASE));
  CFG.scripts.forEach(function (code) {
    var s = D.createElement("script"); s.text = code; D.body.appendChild(s);
  });

  /* 7. Afficher */
  var boot = D.getElementById("eloy-boot"); if (boot) boot.parentNode.removeChild(boot);
})();
