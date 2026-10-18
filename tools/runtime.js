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
  if (!D.getElementById("ld-site")) { var ld = D.createElement("script"); ld.type = "application/ld+json"; ld.id = "ld-site"; ld.text = CFG.ld; D.head.appendChild(ld); }

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
    if (deep && tok === p) E.sync(tok, true);
    route();
    if (!(deep && tok === p)) E.sync(tok, false);
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
  /* 4 bis. Texte complet des guides charge a la demande (dist/g/<guide>.json) */
  var GC = {}, GW = {};
  function getG(tok) {
    if (!GC[tok]) GC[tok] = (W.__eloyFetch || W.fetch)(BASE + "g/" + tok + ".json")
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return GC[tok];
  }
  E.gload = function (tok, cb) {
    var g = (typeof GUIDES !== "undefined") && GUIDES[tok];
    if (!g || g.__full) { if (cb) cb(); return; }
    var l = GW[tok] = GW[tok] || []; l.push(cb);
    if (l.length > 1) return;
    getG(tok).then(function (d) {
      d = d || {};
      Object.keys(d).forEach(function (f) { if (!(f in g)) g[f] = d[f]; });
      if (!g.body) g.body = [];
      if (!g.cta) g.cta = { t: "", p: "", a: [] };
      if (!("intro" in g)) g.intro = "";
      g.__full = 1;
      var q = GW[tok]; delete GW[tok];
      q.forEach(function (f) { try { if (f) f(); } catch (e) {} });
    });
  };
  E.gwait = function (cb) { if (GW[E.tok]) E.gload(E.tok, cb); else cb(); };
  if (/^guide-/.test(pathTok())) getG(pathTok());
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
  var WF_WRAP = D.getElementById("eloy-wf"), WF_FORM = D.getElementById("eloy-wf-f");
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
      var wrap = WF_WRAP, f = WF_FORM;
      if (!W.jQuery || !f) { diag({ why: "jQuery Webflow absent", wf: typeof W.Webflow }); return resolve(false); }
      var done = wrap.querySelector(".w-form-done"), fail = wrap.querySelector(".w-form-fail");
      [].slice.call(f.querySelectorAll('input[type="hidden"]')).forEach(function (i) { f.removeChild(i); });
      /* Champs du formulaire Webflow : Nom, Telephone, Email, Territoire, Message (le reste va dans Message) */
      /* Pas de champ Territoire : la liste deroulante Webflow n'a pas d'options, Webflow refuserait la valeur (erreur 422) */
      var F = { Nom: "", Telephone: "", Email: "", Message: "", Consentement: "true" }, lines = [], prenom = "";
      flat(kind, body).forEach(function (p) {
        var k = p[0], v = p[1];
        if (k === "Nom" && !F.Nom) F.Nom = v;
        else if (k === "Prénom") prenom = v;
        else if (k === "Téléphone" && !F.Telephone) F.Telephone = v;
        else if (k === "Email" && !F.Email) F.Email = v;
        else lines.push(k + " : " + v);
      });
      if (prenom && F.Nom.indexOf(prenom) < 0) F.Nom = prenom + " " + F.Nom;
      F.Message = lines.join("\n");
      Object.keys(F).forEach(function (k) {
        var i = D.createElement("input"); i.type = "hidden"; i.name = k; i.setAttribute("data-name", k); i.value = F[k];
        f.insertBefore(i, f.lastChild);
      });
      f.style.display = "block"; done.style.display = "none"; fail.style.display = "none";
      var $ = W.jQuery, bd = $.data(f, ".w-form") || null, ev = ($._data && $._data(D, "events")) || {};
      var rec = { at: new Date().toISOString(), kind: kind, wf: typeof W.Webflow, site: D.documentElement.getAttribute("data-wf-site"),
        bound: !!bd, handler: bd && bd.handler ? (bd.handler.name || "fn") : null, submitListeners: (ev.submit || []).length }, fin = false;
      (W.ELOY_LEAD_DEBUG = W.ELOY_LEAD_DEBUG || []).push(rec);
      var t, mo = new MutationObserver(check);
      function end(ok, why) {
        if (fin) return; fin = true;
        clearTimeout(t); mo.disconnect(); $(D).off(".eloylead");
        rec.ok = ok; rec.why = why;
        if (!f.isConnected) wrap.insertBefore(f, wrap.firstChild);
        f.style.display = "block";
        try { console.log("[Eloy] envoi demande", rec); } catch (e) {}
        if (!ok || DEBUG) diag(rec);
        resolve(ok);
      }
      function check() {
        if (done.style.display !== "none") end(true, "message succes");
        else if (fail.style.display !== "none") end(false, "message erreur");
      }
      $(D).on("ajaxComplete.eloylead", function (e, xhr, st) {
        if (!st || !/\/api\/v1\/form\//.test(st.url || "")) return;
        rec.url = st.url; rec.status = xhr.status; rec.resp = String(xhr.responseText || "").slice(0, 300);
        var ok = xhr.status >= 200 && xhr.status < 300;
        try { var j = JSON.parse(xhr.responseText); if (j && j.code && j.code !== 200) ok = false; } catch (er) {}
        setTimeout(function () { end(ok, "reponse serveur"); }, 50);
      });
      mo.observe(done, { attributes: true, attributeFilter: ["style"] });
      mo.observe(fail, { attributes: true, attributeFilter: ["style"] });
      t = setTimeout(function () { end(false, "delai depasse"); }, 15000);
      var btn = f.querySelector('input[type="submit"]');
      try { if (f.requestSubmit) f.requestSubmit(btn); else $(f).trigger("submit"); } catch (er) { rec.submitError = String(er); }
      /* Si Webflow n'a rien envoye, envoi direct au service de formulaires Webflow */
      setTimeout(function () {
        if (fin || rec.url) return;
        rec.mode = "direct";
        if (!rec.site) return end(false, "data-wf-site absent");
        var fields = {}; Object.keys(F).forEach(function (k) { fields[k] = F[k]; });
        $.ajax({ url: "https://webflow.com/api/v1/form/" + rec.site, type: "POST", dataType: "json", crossDomain: true,
          data: { name: FW.name, pageId: FW.pageId, elementId: FW.elementId, source: location.href, test: false, fields: fields, dolphin: false } });
      }, 1500);
    });
  }
  var DEBUG = /[?&]eloydebug=1/.test(location.search);
  if (DEBUG) D.addEventListener("submit", function (e) {
    var f = e.target, hp = f && f.querySelector && f.querySelector('[name="website"],#rsWebsite');
    diag({ submit: f.id || f.className, honeypot: hp ? hp.value : "(aucun)", jquery: !!W.jQuery, webflow: typeof W.Webflow, site: D.documentElement.getAttribute("data-wf-site") });
  }, true);
  function diag(rec) {
    if (!DEBUG && !/\.webflow\.io$|^127\.0\.0\.1$|^localhost$/.test(location.hostname)) return;
    var b = D.getElementById("eloy-diag");
    if (!b) { b = D.createElement("pre"); b.id = "eloy-diag"; b.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;max-width:92vw;max-height:40vh;overflow:auto;white-space:pre-wrap;background:#fff;color:#000;border:2px solid #c00;padding:8px;font:12px/1.4 monospace"; D.body.appendChild(b); }
    b.textContent = "Diagnostic envoi (visible seulement sur l'adresse de test) :\n" + JSON.stringify(rec, null, 1);
  }
  /* Diagnostic de defilement (uniquement avec ?eloydebug=1 dans l'adresse) */
  if (DEBUG) W.addEventListener("load", function () {
    var box = D.createElement("pre");
    box.style.cssText = "position:fixed;left:6px;right:6px;top:70px;z-index:99999;margin:0;white-space:pre-wrap;background:#fff;color:#000;border:2px solid #c00;padding:6px;font:11px/1.35 monospace;pointer-events:none;opacity:.92";
    D.body.appendChild(box);
    function cs(e) { var c = getComputedStyle(e); return [c.overflowX, c.overflowY, c.height, c.position, c.minHeight].join("/"); }
    function upd() {
      var se = D.scrollingElement || D.documentElement, f = D.querySelector("footer"), r = f && f.getBoundingClientRect(), vv = W.visualViewport;
      var fx = [].slice.call(D.querySelectorAll("body *")).filter(function (e) { var c = getComputedStyle(e); return (c.position === "fixed" || c.position === "sticky") && e !== box && e.getBoundingClientRect().height > 0; }).map(function (e) { var q = e.getBoundingClientRect(); return (e.id || e.className || e.tagName).toString().slice(0, 18) + "@" + Math.round(q.top) + "+" + Math.round(q.height); });
      var kids = [].slice.call(D.body.children).filter(function (e) { return e.tagName !== "SCRIPT" && e !== box; }).map(function (e) { return e.tagName + (e.id ? "#" + e.id : "") + ":" + e.offsetHeight; });
      box.textContent = "y=" + Math.round(W.scrollY) + " max=" + (se.scrollHeight - W.innerHeight) + " iH=" + W.innerHeight + " vv=" + (vv ? Math.round(vv.height) + "/" + Math.round(vv.offsetTop) : "-") +
        "\nse=" + (se === D.documentElement ? "html" : se.tagName) + " seSH=" + se.scrollHeight + " htmlCH=" + D.documentElement.clientHeight + " bodySH=" + D.body.scrollHeight + " bodyOH=" + D.body.offsetHeight +
        "\nfoot bas=" + (r ? Math.round(r.bottom) + " (doc " + Math.round(r.bottom + W.scrollY) + ")" : "-") +
        "\nhtml " + cs(D.documentElement) + " cls=" + D.documentElement.className.slice(0, 40) + " st=" + (D.documentElement.getAttribute("style") || "") +
        "\nbody " + cs(D.body) + " cls=" + D.body.className.slice(0, 30) + " st=" + (D.body.getAttribute("style") || "") +
        "\nfixes " + fx.join(" ") + "\nenfants " + kids.join(" ") + "\n" + navigator.userAgent.slice(0, 90);
    }
    var tm = 0, tp = 0, tpt = "", ymax = 0, back = 0, calls = [], touching = false, lastY = W.scrollY, jumps = [];
    if (/[?&]noanchor=1/.test(location.search)) { var na = D.createElement("style"); na.textContent = "html,body,body *{overflow-anchor:none!important}"; D.head.appendChild(na); }
    function who() { var st = (new Error().stack || "").split("\n").slice(2, 5).map(function (l) { return l.replace(/^\s*at\s*/, "").replace(/https?:\/\/[^ )]*\//g, "").slice(0, 60); }).join(" < "); return st; }
    function wrap(o, k, lbl) { var f = o[k]; if (typeof f !== "function") return; o[k] = function () { calls.push(lbl + "(" + [].slice.call(arguments, 0, 2).map(function (a) { return typeof a === "object" ? JSON.stringify(a) : a; }).join(",").slice(0, 40) + ") " + who()); if (calls.length > 6) calls.shift(); return f.apply(this, arguments); }; }
    wrap(W, "scrollTo", "scrollTo"); wrap(W, "scroll", "scroll"); wrap(W, "scrollBy", "scrollBy"); wrap(Element.prototype, "scrollIntoView", "intoView"); wrap(HTMLElement.prototype, "focus", "focus");
    if (W.jQuery && W.jQuery.fn && W.jQuery.fn.animate) wrap(W.jQuery.fn, "animate", "jq.animate");
    W.addEventListener("touchstart", function () { touching = true; }, { passive: true });
    W.addEventListener("touchend", function () { setTimeout(function () { touching = false; }, 1200); }, { passive: true });
    W.addEventListener("scroll", function () { var y = W.scrollY; if (y < lastY - 120) { jumps.push(Math.round(lastY) + ">" + Math.round(y) + (touching ? "t" : "")); if (jumps.length > 6) jumps.shift(); } lastY = y; }, { passive: true });
    W.addEventListener("touchmove", function (e) { tm++; if (e.defaultPrevented) { tp++; } }, { passive: true });
    D.addEventListener("touchmove", function (e) { if (e.defaultPrevented && !tpt) { var t = e.target; tpt = (t.tagName + "." + (t.className || "")).slice(0, 30); } }, { passive: true });
    W.addEventListener("scroll", function () { if (W.scrollY > ymax) ymax = W.scrollY; else if (ymax - W.scrollY > 40) back++; }, { passive: true });
    var upd0 = upd; upd = function () {
      upd0();
      var g = W.gsap, ST = W.ScrollTrigger || (g && g.core && g.core.globals && g.core.globals().ScrollTrigger), ns = "";
      try { ns = ST && ST.normalizeScroll ? String(!!ST.normalizeScroll()) : "-"; } catch (e) { ns = "err"; }
      var lib = ["gsap", "ScrollTrigger", "ScrollSmoother", "Lenis", "lenis", "LocomotiveScroll", "Swiper", "Splide", "lottie"].filter(function (k) { return W[k]; }).join(",");
      box.textContent += "\nlibs=" + (lib || "aucune") + " normScroll=" + ns + (ST && ST.maxScroll ? " stMax=" + Math.round(ST.maxScroll(W)) : "") +
        "\ntouchmove=" + tm + " bloques=" + tp + " " + tpt + " ymax=" + Math.round(ymax) + " retours=" + back +
        "\nsauts=" + jumps.join(" ") + "\nappels=" + (calls.join(" | ") || "aucun") +
        " wf=" + (W.Webflow && W.Webflow.require ? ["ix2", "ix3", "scroll", "touch"].filter(function (m) { try { return !!W.Webflow.require(m); } catch (e) { return false; } }).join(",") : "-");
    };
    var jsres = "";
    if (/[?&]bas=1/.test(location.search)) setTimeout(function () {
      D.documentElement.style.scrollBehavior = "auto"; W.scrollTo(0, 1e7);
      setTimeout(function () { jsres = "scrollTo->" + Math.round(W.scrollY); (D.scrollingElement || D.documentElement).scrollTop = 1e7;
        setTimeout(function () { jsres += " scrollTop->" + Math.round(W.scrollY) + " zoom=" + (W.visualViewport ? W.visualViewport.scale.toFixed(2) : "-") + " dpr=" + W.devicePixelRatio; upd(); }, 300); }, 300);
    }, 2500);
    if (/[?&]noix=1/.test(location.search)) { var kill = function () { try { var ix = W.Webflow && W.Webflow.require && W.Webflow.require("ix2"); ix && ix.destroy && ix.destroy(); } catch (e) {} }; kill(); setTimeout(kill, 0); setTimeout(kill, 500); setTimeout(kill, 1500); }
    var smut = {}, svals = [], hts = [], lastH = 0;
    setInterval(function () { var h = D.documentElement.scrollHeight; if (h !== lastH) { hts.push(Math.round(performance.now() / 100) / 10 + "s:" + h); if (hts.length > 8) hts.shift(); lastH = h; } }, 50);
    if (W.MutationObserver) new MutationObserver(function (ms) { ms.forEach(function (m) { var t = m.target; if (t === box) return; var k = (t.tagName + (t.id ? "#" + t.id : "") + "." + String(t.className || "").split(" ")[0]).slice(0, 26); smut[k] = (smut[k] || 0) + 1; if (svals.length < 4 && svals.indexOf(k + "{" + (t.getAttribute("style") || "").slice(0, 50) + "}") < 0) svals.push(Math.round(performance.now()) + "ms " + k + "{" + (t.getAttribute("style") || "").slice(0, 50) + "}"); }); }).observe(D.body, { attributes: true, attributeFilter: ["style"], subtree: true });
    var upd1 = upd; upd = function () { upd1(); if (jsres) box.textContent += "\nJS " + jsres;
      var st = [].slice.call(D.querySelectorAll("body [style]")).filter(function (e) { return e !== box && !box.contains(e) && /transform|opacity|height|display|width|translate/.test(e.getAttribute("style")); });
      box.textContent += "\nstyles(" + st.length + ") " + st.slice(0, 5).map(function (e) { return (e.tagName + "." + String(e.className || "").split(" ")[0]).slice(0, 22) + "{" + e.getAttribute("style").slice(0, 38) + "}"; }).join(" ") +
        "\nmodifs " + Object.keys(smut).slice(0, 6).map(function (k) { return k + "x" + smut[k]; }).join(" ") + "\nvaleurs " + svals.join(" | ") + "\nhauteurs " + hts.join(" ");
    };
    upd(); W.addEventListener("scroll", upd, { passive: true }); W.addEventListener("resize", upd); W.addEventListener("touchend", upd, { passive: true });
  });
  var nativeFetch = W.__eloyFetch = W.fetch;
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

  /* 5 bis. Contenus modifies dans le CMS Webflow : remplacent les textes d'origine, champ par champ.
     Seuls les champs differents de l'import d'origine (empreintes CFG.cmsBase) sont repris. */
  var CB = CFG.cmsBase || { sol: {}, gui: {} }, SYNCED = {};
  function N(x) { return String(x || "").replace(/[\s  ​-‍﻿]/g, ""); }
  function fnv(x) { var h = 0x811c9dc5; for (var i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }
  function fp(el, rich) {
    var t = N(el.textContent);
    if (rich) t += "#" + [].map.call(el.querySelectorAll("a"), function (a) { return a.getAttribute("href") || ""; }).join("|");
    return fnv(t);
  }
  function hrefTok(h) {
    if (!h || h.charAt(0) === "#" || /^(mailto|tel):/.test(h)) return h;
    var m = h.replace(/^https?:\/\/[^\/]+/, "").split("#"), path = cleanPath(m[0]), hash = m[1] || "";
    if (/^https?:/.test(h) && h.indexOf(location.host) < 0) return h;
    if (path === "/credits/rachat" && hash === "simulateur") return "#rsim";
    if (path === "/contact") return "#contact";
    if (!Object.prototype.hasOwnProperty.call(P2T, path)) return h;
    if (hash) return "#" + hash;
    return "#" + (P2T[path] || "accueil");
  }
  function conv(el, guide) {
    var c = el.cloneNode(true);
    [].forEach.call(c.querySelectorAll("a[href]"), function (a) { a.setAttribute("href", hrefTok(a.getAttribute("href"))); });
    [].forEach.call(c.querySelectorAll(".w-embed"), function (w) { while (w.firstChild) w.parentNode.insertBefore(w.firstChild, w); w.parentNode.removeChild(w); });
    [].forEach.call(c.querySelectorAll("p"), function (p) {
      if (p.children.length === 1 && p.children[0].tagName === "EM" && N(p.textContent) === N(p.children[0].textContent)) { p.className = "g-note"; p.innerHTML = p.children[0].innerHTML; }
    });
    [].forEach.call(c.querySelectorAll("blockquote"), function (b) { var p = D.createElement("p"); p.className = "g-formula"; p.innerHTML = b.innerHTML; b.parentNode.replaceChild(p, b); });
    [].forEach.call(c.querySelectorAll("strong"), function (x) { var b = D.createElement("b"); b.innerHTML = x.innerHTML; x.parentNode.replaceChild(b, x); });
    if (guide) {
      [].forEach.call(c.querySelectorAll("ul"), function (u) {
        if (u.className) return; u.className = "g-list";
        [].forEach.call(u.children, function (li) { li.innerHTML = TICK + "<span>" + li.innerHTML + "</span>"; });
      });
      [].forEach.call(c.querySelectorAll("ol"), function (o) { if (!o.className) o.className = "g-steps"; });
    }
    if (guide) typo(c);
    return c;
  }
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';
  /* Webflow remplace les espaces insecables par des espaces : on les remet (typographie francaise) */
  function fr(x) { return String(x).replace(/ ([:;?!\u00bb%€])/g, "\u00a0$1").replace(/\u00ab /g, "\u00ab\u00a0").replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0"); }
  function typo(node) {
    var w = D.createTreeWalker(node, 4, null), n;
    while ((n = w.nextNode())) n.nodeValue = fr(n.nodeValue);
  }
  function txt(el) { return el.textContent.replace(/\s+/g, " ").trim(); }
  function gtxt(el) { return fr(txt(el)); }
  function put(o, k, v) { if (v == null || v === "" || (Array.isArray(v) && !v.length)) return; o[k] = v; }
  function pairs(el) {
    var out = [], cur = null;
    [].forEach.call(conv(el).children, function (k) {
      if (/^H[1-6]$/.test(k.tagName)) { cur = [txt(k), ""]; out.push(cur); }
      else if (cur) cur[1] = (cur[1] ? cur[1] + " " : "") + k.innerHTML.trim();
    });
    return out;
  }
  function items(el, sel) { return [].map.call(conv(el).querySelectorAll(sel), function (x) { return x.innerHTML.trim(); }).filter(Boolean); }
  function sections(el) {
    var out = [], cur = null, c = conv(el, true);
    [].forEach.call(c.childNodes, function (k) {
      if (k.nodeType === 1 && k.tagName === "H2") { cur = [gtxt(k), ""]; out.push(cur); }
      else if (cur) cur[1] += k.nodeType === 1 ? k.outerHTML : (k.textContent || "");
    });
    return out;
  }
  function syncTok(tok, root) {
    if (!root || !root.querySelector) return false;
    var kind = (typeof GUIDES !== "undefined" && GUIDES[tok]) ? "gui" : (typeof CONTENT !== "undefined" && CONTENT[tok] && PRODUCTS[tok]) ? "sol" : null;
    if (!kind) return false;
    var id = kind === "gui" ? tok.slice(6) : tok, base = CB[kind][id];
    if (!base || !root.querySelector("#cms-name")) return false;
    var ch = 0;
    function get(f, rich) {
      var el = root.querySelector("#cms-" + f);
      if (!el || !(f in base) || fp(el, rich) === base[f]) return null;
      ch++; (W.ELOY_CMS = W.ELOY_CMS || []).push(tok + ":" + f); return el;
    }
    var e;
    if (kind === "sol") {
      var P0 = PRODUCTS[tok], C0 = CONTENT[tok];
      if ((e = get("name"))) put(P0, "label", txt(e));
      if ((e = get("accroche"))) put(P0, "pitch", txt(e));
      if ((e = get("resume-menu"))) put(C0, "menu", txt(e));
      if ((e = get("titre-h1"))) put(C0, "h1", txt(e));
      if ((e = get("chapo"))) put(C0, "lede", txt(e));
      [1, 2, 3].forEach(function (i) { if ((e = get("point-cle-" + i))) { C0.bref = (C0.bref || []).slice(); C0.bref[i - 1] = txt(e); } });
      if ((e = get("garanties", 1))) put(C0, "garanties", pairs(e));
      if ((e = get("pour-qui", 1))) put(C0, "pourqui", items(e, "li"));
      if ((e = get("a-savoir"))) put(C0, "savoir", txt(e));
      if ((e = get("faq", 1))) put(C0, "faq", pairs(e));
      var pd = get("pieces-pour-le-devis", 1), ps = get("pieces-pour-la-souscription", 1), pn = get("note-pieces");
      if ((pd && items(pd, "li").length) || (ps && items(ps, "li").length) || (pn && txt(pn))) {
        C0.pieces = C0.pieces || { devis: [], souscription: [] };
        if (pd) put(C0.pieces, "devis", items(pd, "li"));
        if (ps) put(C0.pieces, "souscription", items(ps, "li"));
        if (pn) put(C0.pieces, "note", txt(pn));
      }
      if ((e = get("titre-google"))) put(C0, "metaT", txt(e));
      if ((e = get("description-google"))) put(C0, "metaD", txt(e));
      if ((e = get("titre-garanties"))) put(C0, "gTitle", txt(e));
      if ((e = get("surtitre-garanties"))) put(C0, "gEyebrow", txt(e));
      var mt = get("titre-metiers"), mg = get("metiers", 1), mn = get("note-metiers");
      if (C0.metiers) { if (mt) put(C0.metiers, "t", txt(mt)); if (mg) put(C0.metiers, "g", pairs(mg)); if (mn) put(C0.metiers, "n", txt(mn)); }
      else if (C0.profils) { if (mt) put(C0, "profilsT", txt(mt)); if (mg) put(C0, "profils", pairs(mg)); }
      if ((e = get("exemples-de-sinistres", 1))) put(C0, "sinistres", items(e, "p"));
      if ((e = get("texte-du-bouton")) && C0.whoCta != null) put(C0, "whoCta", txt(e));
    } else {
      var G0 = GUIDES[tok];
      if ((e = get("name"))) G0.t = gtxt(e);
      if ((e = get("extrait"))) G0.ex = gtxt(e);
      if ((e = get("introduction"))) G0.intro = gtxt(e);
      if ((e = get("titre-google"))) G0.mt = gtxt(e);
      if ((e = get("description-google"))) G0.md = gtxt(e);
      if ((e = get("temps-de-lecture"))) G0.min = parseInt(gtxt(e), 10) || G0.min;
      if ((e = get("avertissement"))) G0.legal = gtxt(e);
      if ((e = get("contenu", 1))) G0.body = sections(e);
      G0.cta = G0.cta || { t: "", p: "", a: [] };
      if ((e = get("encadre-titre"))) G0.cta.t = gtxt(e);
      if ((e = get("encadre-texte"))) G0.cta.p = gtxt(e);
      var a = (G0.cta.a || []).map(function (x) { return x.slice(); });
      [1, 2].forEach(function (i) {
        var l = get("bouton-" + i + "-libelle"), u = get("bouton-" + i + "-lien");
        if (!l && !u) return;
        var lab = l ? gtxt(l) : (a[i - 1] || [])[1], url = u ? hrefTok(txt(u)) : (a[i - 1] || [])[0];
        if (lab && url) a[i - 1] = [url, lab]; else if (i === 2) a.length = Math.min(a.length, 1);
      });
      G0.cta.a = a.filter(Boolean);
    }
    return ch > 0;
  }
  function fetchSync(tok) {
    var item = (typeof GUIDES !== "undefined" && GUIDES[tok]) || (typeof CONTENT !== "undefined" && CONTENT[tok] && PRODUCTS[tok]);
    if (!item || SYNCED[tok]) return; SYNCED[tok] = 1;
    var u = tokPath(tok); if (!u || !W.DOMParser) return;
    nativeFetch(u, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (h) {
      if (!h) return;
      var doc = new DOMParser().parseFromString(h, "text/html");
      if (syncTok(tok, doc) && E.tok === tok) route();
    }).catch(function () {});
  }
  E.sync = function (tok, deep) {
    try {
      if (typeof GUIDES !== "undefined" && GUIDES[tok] && !GUIDES[tok].__full) { E.gload(tok, function () { E.sync(tok, deep); }); return; }
      if (deep && !SYNCED[tok] && tok && tok === pathTok()) { SYNCED[tok] = 1; syncTok(tok, WF); return; }
      fetchSync(tok);
    } catch (e) {}
  };

  /* 6. Contenu du site Eloy, puis ses scripts, dans l'ordre d'origine */
  D.body.insertAdjacentHTML("afterbegin", CFG.markup.split("__ELOYB__").join(BASE));
  CFG.scripts.forEach(function (code) {
    var s = D.createElement("script"); s.text = code; D.body.appendChild(s);
  });

  /* 7. Afficher */
  E.gwait(function () { var boot = D.getElementById("eloy-boot"); if (boot) boot.parentNode.removeChild(boot); });
})();
