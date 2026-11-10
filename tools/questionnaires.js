  /* 6 ter. Questionnaires en ligne (envoyés aux clients par mail) : https://www.eloy-assurances-patrimoine.fr/?questionnaire=habitation
     Pré-remplissage possible : &nom=…&email=…&tel=…  Les réponses partent par le formulaire natif Webflow (partie 5),
     avec « Type de demande : Questionnaire assurance habitation ». Ajouté le 07/11/2026. Questions : tools/questionnaires.json (?questionnaire=habitation, ?questionnaire=rcpro). */
  (function () {
    var QS = new URLSearchParams(location.search), QK = (QS.get("questionnaire") || "").toLowerCase();
    var Q = CFG.questionnaires || {};
    /* Téléchargement du questionnaire PDF depuis le domaine du cabinet (?pdf=evenementiel, ?pdf=decennale&n=2) : les mails ne contiennent
       que des liens vers eloy-assurances-patrimoine.fr, meilleur pour la délivrabilité (10/11/2026). */
    var PK = (QS.get("pdf") || "").toLowerCase();
    if (PK && Q[PK] && Q[PK].pdf) {
      var PL = typeof Q[PK].pdf === "string" ? [[null, Q[PK].pdf]] : Q[PK].pdf, PN = Math.max(1, Math.min(PL.length, parseInt(QS.get("n") || "1", 10) || 1));
      location.replace(PL[PN - 1][1]); return;
    }
    var C = Q[QK];
    if (!C) return;
    /* Plusieurs biens dans un même questionnaire : les rubriques marquées « rep » sont répétées (logement 2, 3…)
       et affichées selon la réponse à « nb_logements ». Clés : k__2, k__3… ; libellés envoyés : « Bien 2 – … ». */
    var NB_MAX = 5;
    if (C.sections.some(function (s) { return s.rep; })) {
      var repK = {}, avant = [], reps = [], apres = [];
      C.sections.forEach(function (s) {
        if (s.rep) { reps.push(s); s.f.forEach(function (f) { repK[f.k] = 1; }); }
        else (reps.length ? apres : avant).push(s);
      });
      var secs = avant.slice();
      for (var li = 1; li <= NB_MAX; li++) reps.forEach(function (s) {
        secs.push({ t: s.t, rep: 1, log: li, f: s.f.map(function (f) {
          var g = {}; for (var x in f) g[x] = f[x];
          g.log = li;
          if (li > 1) {
            g.k = f.k + "__" + li; delete g.p; delete g.av;
            g.s = "Bien " + li + " – " + (f.s || f.l.replace(/ \((m²|€|%)\)$/, ""));
            if (f.show && repK[f.show[0]]) g.show = [f.show[0] + "__" + li, f.show[1]];
          }
          return g;
        }) });
      });
      var C2 = {}; for (var y in C) C2[y] = C[y]; C2.sections = secs.concat(apres); C = C2;
    }
    function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var LOGO = BASE + "img/df26dedc632f.png";
    var css = "html.eq-on body>*:not(#eq):not(#eloy-wf){display:none!important}html.eq-on body{background:#F3F6FC;margin:0}" +
      "#eq{font-family:\"Plus Jakarta Sans\",\"Segoe UI\",system-ui,-apple-system,sans-serif;color:#0B1220;min-height:100vh;-webkit-text-size-adjust:100%}" +
      "#eq *{box-sizing:border-box}#eq .eq-top{background:#1B66F7;color:#fff;padding:22px 16px 26px}" +
      "#eq .eq-in{max-width:760px;margin:0 auto}#eq .eq-top img{height:34px;width:auto;filter:brightness(0) invert(1);display:block;margin-bottom:18px}" +
      "#eq .eq-top small{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;font-weight:600}" +
      "#eq h1{font-size:26px;line-height:1.2;margin:4px 0 8px;font-weight:800}#eq .eq-top p{margin:0;font-size:15px;line-height:1.5;opacity:.95}" +
      "#eq form{max-width:760px;margin:0 auto;padding:18px 16px 40px}" +
      "#eq fieldset{border:0;margin:0 0 16px;padding:20px 18px 6px;background:#fff;border-radius:14px;box-shadow:0 1px 2px rgba(11,18,32,.06),0 0 0 1px #DDE4F0}" +
      "#eq legend{float:left;width:100%;padding:0;margin:0 0 14px;font-size:17px;font-weight:700;display:flex;align-items:center;gap:10px}" +
      "#eq legend span{flex:none;width:26px;height:26px;border-radius:7px;background:#1B66F7;color:#fff;font-size:13px;display:inline-flex;align-items:center;justify-content:center}" +
      "#eq .eq-grid{clear:both;display:flex;flex-wrap:wrap;gap:0 14px}#eq .eq-f{flex:1 1 100%;margin-bottom:16px;min-width:0}" +
      "#eq .w2{flex:1 1 calc(50% - 7px)}#eq .w3{flex:0 1 calc(33.3% - 10px)}#eq .w23{flex:1 1 calc(66.6% - 4px)}" +
      "@media(max-width:560px){#eq .w2,#eq .w23{flex-basis:100%}#eq .w3{flex-basis:calc(50% - 7px)}}" +
      "#eq label.eq-l,#eq .eq-l{display:block;font-size:14px;font-weight:600;margin-bottom:6px;line-height:1.35}#eq .eq-l i{color:#B42318;font-style:normal}" +
      "#eq input[type=text],#eq input[type=email],#eq input[type=tel],#eq input[type=number],#eq input[type=date],#eq select,#eq textarea{width:100%;font:inherit;font-size:16px;color:#0B1220;background:#F8FAFE;border:1px solid #C9D6EE;border-radius:10px;padding:11px 12px;min-height:46px;outline:0;-webkit-appearance:none;appearance:none}" +
      "#eq textarea{min-height:96px;resize:vertical;line-height:1.45}#eq select{background-image:linear-gradient(45deg,transparent 50%,#5B6475 50%),linear-gradient(135deg,#5B6475 50%,transparent 50%);background-position:calc(100% - 18px) 50%,calc(100% - 13px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:34px}" +
      "#eq input:focus,#eq select:focus,#eq textarea:focus{border-color:#1B66F7;box-shadow:0 0 0 3px #EAF1FE;background:#fff}" +
      "#eq .eq-ac{position:relative}#eq .eq-acl{position:absolute;z-index:20;left:0;right:0;top:100%;margin:4px 0 0;padding:4px;list-style:none;background:#fff;border:1px solid #C9D6EE;border-radius:10px;box-shadow:0 8px 24px rgba(11,18,32,.14);max-height:320px;overflow-y:auto}" +
      "#eq .eq-acl li{padding:9px 12px;border-radius:8px;font-size:15px;line-height:1.35;cursor:pointer}#eq .eq-acl li small{display:block;font-size:12px;color:#5B6475;margin-top:1px}#eq .eq-acl li[aria-selected=true],#eq .eq-acl li[role=option]:hover{background:#EAF1FE}" +
      "#eq .eq-acl li.eq-aco{color:#0E47B8;font-weight:600;border-top:1px solid #EEF2F8;margin-top:2px}#eq .eq-acl li.eq-acn{color:#5B6475;cursor:default;font-size:14px}" +
      "#eq .eq-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}#eq .eq-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:#EAF1FE;color:#0E47B8;border-radius:999px;padding:7px 6px 7px 14px;font-size:14px;font-weight:600;line-height:1.3}" +
      "#eq .eq-chip button{flex:none;width:26px;height:26px;min-height:0;padding:0;border-radius:50%;background:#fff;color:#0E47B8;font-size:16px;line-height:1;font-weight:700}#eq .eq-chip button:hover{background:#D6E4FD}" +
      "#eq .eq-rep .eq-rl{display:flex;align-items:center;gap:10px;margin-bottom:8px}#eq .eq-rep .eq-rl span{flex:1;font-size:14px;line-height:1.35}#eq .eq-rep .eq-rl input{width:96px;flex:none;text-align:right}#eq .eq-rep .eq-rl b{flex:none;font-size:14px;color:#5B6475}#eq .eq-rep .eq-tot{font-size:13px;font-weight:700;color:#5B6475;text-align:right;margin-top:2px}#eq .eq-rep .eq-tot.ok{color:#1E7A46}" +
      "#eq .eq-h{font-size:12.5px;color:#5B6475;margin-top:5px;line-height:1.45}" +
      "#eq .eq-o{display:flex;flex-wrap:wrap;gap:8px}#eq .eq-o label{position:relative;cursor:pointer}" +
      "#eq .eq-o input{position:absolute;opacity:0;width:1px;height:1px}" +
      "#eq .eq-o span{display:inline-block;padding:10px 16px;border:1px solid #C9D6EE;border-radius:999px;font-size:15px;background:#F8FAFE;min-height:44px;line-height:22px}" +
      "#eq .eq-o input:checked+span{background:#1B66F7;border-color:#1B66F7;color:#fff;font-weight:600}" +
      "#eq .eq-o input:focus-visible+span{box-shadow:0 0 0 3px #EAF1FE}" +
      "#eq .eq-err input,#eq .eq-err select,#eq .eq-err textarea,#eq .eq-err .eq-o span{border-color:#B42318}#eq .eq-e{display:none;color:#B42318;font-size:12.5px;margin-top:5px}#eq .eq-err .eq-e{display:block}" +
      "#eq .eq-consent{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;margin:4px 0 14px;cursor:pointer}" +
      "#eq .eq-consent input{width:20px;height:20px;flex:none;margin-top:1px;accent-color:#1B66F7}" +
      "#eq .eq-sd{margin:0 0 14px;padding:12px 14px;background:#EAF1FE;border-radius:10px;font-size:14px;line-height:1.5;color:#0B1220}" +
      "#eq .eq-legal{font-size:12.5px;color:#5B6475;line-height:1.5;margin:0 0 16px}" +
      "#eq button{width:100%;font:inherit;font-size:16px;font-weight:700;color:#fff;background:#1B66F7;border:0;border-radius:12px;padding:15px;cursor:pointer;min-height:52px}" +
      "#eq button:hover{background:#0E47B8}#eq button[disabled]{opacity:.6;cursor:wait}" +
      "#eq .eq-msg{display:none;margin-top:12px;padding:12px 14px;border-radius:10px;font-size:14px;line-height:1.45;background:#FDECEA;color:#B42318}" +
      "#eq .eq-done{max-width:760px;margin:24px auto;padding:28px 20px;background:#fff;border-radius:14px;box-shadow:0 0 0 1px #DDE4F0;text-align:center}" +
      "#eq .eq-done b{display:block;font-size:20px;margin:12px 0 8px}#eq .eq-done p{margin:0;color:#5B6475;line-height:1.5}" +
      "#eq .eq-ok{width:52px;height:52px;border-radius:50%;background:#E7F5EC;color:#1E7A46;display:inline-flex;align-items:center;justify-content:center}" +
      "#eq .eq-foot{max-width:760px;margin:0 auto;padding:0 16px 30px;font-size:12px;color:#5B6475;line-height:1.5;text-align:center}";
    function field(f) {
      var id = "eq-" + f.k, cls = "eq-f" + (f.w ? " w" + f.w : ""), req = f.req ? " <i>*</i>" : "", h = f.h ? '<div class="eq-h">' + esc(f.h) + "</div>" : "", inp;
      if (f.type === "radio") {
        inp = '<div class="eq-o" role="radiogroup" aria-label="' + esc(f.l) + '">' + f.o.map(function (o) {
          return '<label><input type="radio" name="' + f.k + '" value="' + esc(o) + '"><span>' + esc(o) + "</span></label>"; }).join("") + "</div>";
        return '<div class="' + cls + '" data-k="' + f.k + '"><div class="eq-l">' + esc(f.l) + req + "</div>" + inp + h + '<div class="eq-e">Merci de choisir une réponse.</div></div>';
      }
      if (f.type === "repartition") {
        inp = '<div class="eq-rep"></div><input type="hidden" name="' + f.k + '">';
        return '<div class="' + cls + '" data-k="' + f.k + '"><div class="eq-l">' + esc(f.l) + req + "</div>" + inp + h + '<div class="eq-e">Indiquez la part de chaque activité : le total doit faire 100 %.</div></div>';
      }
      if (f.type === "metier") {
        inp = '<div class="eq-ac"><div class="eq-chips" hidden></div><input type="text" id="' + id + '" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + id + '-l" autocomplete="off" spellcheck="false" enterkeyhint="search">' +
          '<input type="hidden" name="' + f.k + '"><ul class="eq-acl" id="' + id + '-l" role="listbox" hidden></ul></div>';
        return '<div class="' + cls + '" data-k="' + f.k + '"><label class="eq-l" for="' + id + '">' + esc(f.l) + req + "</label>" + inp + h + '<div class="eq-e">Tapez votre métier puis choisissez-le dans la liste.</div></div>';
      }
      else if (f.type === "textarea") inp = '<textarea id="' + id + '" name="' + f.k + '" rows="4"></textarea>';
      else if (f.type === "select") {
        var def = (f.p && QS.get(f.p)) || f.d || "";
        inp = '<select id="' + id + '" name="' + f.k + '">' + (f.d ? "" : '<option value="">Choisir…</option>') + f.o.map(function (o) { return "<option" + (o === def ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
      }
      else {
        var t = f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.type === "date" ? "date" : "text", extra = "";
        if (f.type === "number") extra = ' inputmode="numeric"';
        if (f.type === "cp") extra = ' inputmode="numeric" maxlength="5"';
        if (f.type === "email") extra = ' autocomplete="email"';
        if (f.type === "tel") extra = ' autocomplete="tel"';
        if (f.k === "nom") extra = ' autocomplete="family-name"';
        if (f.k === "prenom") extra = ' autocomplete="given-name"';
        var v = f.p && QS.get(f.p) ? ' value="' + esc(QS.get(f.p)) + '"' : "";
        if (f.ph) extra += ' placeholder="' + esc(f.ph) + '"';
        inp = '<input type="' + t + '" id="' + id + '" name="' + f.k + '"' + extra + v + ">";
      }
      return '<div class="' + cls + '" data-k="' + f.k + '"><label class="eq-l" for="' + id + '">' + esc(f.l) + req + "</label>" + inp + h + '<div class="eq-e">Champ à compléter.</div></div>';
    }
    var html = '<div id="eq"><div class="eq-top"><div class="eq-in"><img src="' + LOGO + '" alt="Eloy"><small>Questionnaire</small><h1>' + esc(C.titre) + "</h1><p>" + esc(C.intro) + "</p></div></div>" +
      '<form novalidate>' + C.sections.map(function (s, i) {
        return '<fieldset' + (s.log ? ' data-log="' + s.log + '"' : "") + '><legend><span>' + (i + 1) + "</span><b data-t=\"" + esc(s.t) + '" style="font-weight:inherit">' + esc(s.t) + '</b></legend>' + (s.d ? '<p class="eq-sd">' + esc(s.d) + '</p>' : '') + '<div class="eq-grid">' + s.f.map(field).join("") + "</div></fieldset>";
      }).join("") +
      '<fieldset><div class="eq-grid" style="padding-top:2px"><div class="eq-f" data-k="consent"><label class="eq-consent"><input type="checkbox" name="consent"><span>J\'accepte que ces informations soient utilisées par Eloy pour étudier ma demande et transmises aux assureurs consultés. <i style="color:#B42318;font-style:normal">*</i></span></label><div class="eq-e">Merci de cocher cette case pour envoyer le questionnaire.</div></div></div>' +
      '<p class="eq-legal">Toute réticence ou fausse déclaration intentionnelle entraîne la nullité du contrat (article L113-8 du Code des assurances) ; toute omission ou déclaration inexacte peut entraîner une réduction des indemnités (article L113-9). Ce questionnaire ne vaut pas contrat : la garantie ne prend effet qu\'après acceptation de l\'assureur. Vous pouvez exercer vos droits d\'accès, de rectification et d\'effacement en écrivant à eloy.assurances@gmail.com.</p>' +
      '<button type="submit">Envoyer mon questionnaire</button><div class="eq-msg" role="alert"></div></fieldset></form>' +
      '<div class="eq-foot">Eloy Assurances Patrimoine · Courtier en assurance, ORIAS n° 23 000 527 · Le Lamentin, Martinique · eloy.assurances@gmail.com</div></div>';
    var st = D.createElement("style"); st.id = "eq-css"; st.textContent = css; D.head.appendChild(st);
    D.documentElement.classList.add("eq-on");
    D.body.insertAdjacentHTML("beforeend", html);
    var EQ = D.getElementById("eq"), FM = EQ.querySelector("form"), ALL = [];
    C.sections.forEach(function (s) { s.f.forEach(function (f) { ALL.push(f); }); });
    function val(k) {
      var el = FM.elements[k]; if (!el) return "";
      if (el.length && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ""; }
      return String(el.value || "").trim();
    }
    /* Champ « métier » : le client tape, les métiers correspondants s'affichent (avec leur famille), il clique.
       Plusieurs activités possibles (ajoutées une par une). « Mon métier n'est pas dans la liste » = Autre métier.
       Valeur envoyée : les métiers séparés par « ; ». */
    var METIERS = [], FAM = [], PRIO = [];
    (C.metiers || []).forEach(function (g) { g[1].forEach(function (m) { METIERS.push(m[0]); FAM.push(g[0]); PRIO.push(m[2] ? 1 : 0); }); });
    function nrm(x) { return String(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]+/g, " ").trim(); }
    var NM = METIERS.map(nrm);
    function liste(v) { return v ? v.split(" ; ") : []; }
    ALL.filter(function (f) { return f.type === "metier"; }).forEach(function (f) {
      var box = EQ.querySelector('[data-k="' + f.k + '"] .eq-ac'), inp = box.querySelector("input[type=text]"), hid = box.querySelector("input[type=hidden]"),
        ul = box.querySelector("ul"), chips = box.querySelector(".eq-chips"), items = [], cur = -1;
      var autre = ALL.filter(function (x) { return x.show && x.show[0] === f.k && x.show[1] === "Autre métier"; })[0];
      function close() { ul.hidden = true; inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant"); cur = -1; }
      function draw() {
        var vs = liste(hid.value);
        chips.innerHTML = vs.map(function (v, i) {
          return '<span class="eq-chip">' + esc(v === "Autre métier" ? "Autre métier (à préciser ci-dessous)" : v) + '<button type="button" data-i="' + i + '" aria-label="Retirer ' + esc(v) + '">×</button></span>'; }).join("");
        chips.hidden = !vs.length;
        inp.placeholder = vs.length ? "Ajouter une autre activité (facultatif)" : (f.ph || "Tapez votre métier : infirmier, graphiste, consultant…");
        box.closest(".eq-f").classList.remove("eq-err"); refresh();
      }
      function pick(v) {
        var vs = liste(hid.value), typed = inp.value.trim();
        if (vs.indexOf(v) < 0) vs.push(v);
        hid.value = vs.join(" ; "); inp.value = ""; close(); draw();
        if (v === "Autre métier" && autre) { var a = FM.elements[autre.k]; if (a) { if (!a.value) a.value = typed; setTimeout(function () { a.focus(); }, 50); } }
        else inp.focus();
      }
      chips.addEventListener("click", function (e) {
        var bt = e.target.closest("button[data-i]"); if (!bt) return;
        var vs = liste(hid.value); vs.splice(+bt.getAttribute("data-i"), 1); hid.value = vs.join(" ; "); draw(); inp.focus();
      });
      function search() {
        var q = nrm(inp.value), words = q.split(" ").filter(Boolean), deja = liste(hid.value);
        items = [];
        if (words.length) {
          var sc = [];
          NM.forEach(function (n, i) {
            if (deja.indexOf(METIERS[i]) >= 0) return;
            if (!words.every(function (w) { return (" " + n).indexOf(" " + w) >= 0 || (w.length > 3 && n.indexOf(w) >= 0); })) return;
            sc.push([(n.indexOf(q) === 0 ? 0 : (" " + n).indexOf(" " + q) >= 0 ? 2 : 4) - PRIO[i], n.length, i]);
          });
          sc.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
          items = sc.slice(0, 50).map(function (x) { return x[2]; });
        }
        var html = items.map(function (i, j) { return '<li role="option" id="' + inp.id + "-o" + j + '" data-v="' + esc(METIERS[i]) + '">' + esc(METIERS[i]) + "<small>" + esc(FAM[i]) + "</small></li>"; }).join("");
        if (words.length && !items.length) html += '<li class="eq-acn" aria-disabled="true">Aucun métier trouvé. Essayez un autre mot, ou :</li>';
        if (words.length) html += '<li role="option" class="eq-aco" id="' + inp.id + '-oa" data-v="Autre métier">Mon métier n\'est pas dans la liste</li>';
        ul.innerHTML = html; ul.hidden = !words.length; inp.setAttribute("aria-expanded", words.length ? "true" : "false"); cur = -1;
      }
      function mark(li) {
        [].forEach.call(ul.children, function (x) { x.setAttribute("aria-selected", x === li ? "true" : "false"); });
        cur = [].indexOf.call(ul.children, li);
        if (li) { inp.setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
      }
      inp.addEventListener("input", search);
      inp.addEventListener("focus", function () { if (inp.value) search(); });
      inp.addEventListener("keydown", function (e) {
        var opts = [].filter.call(ul.children, function (li) { return li.getAttribute("role") === "option"; });
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          if (ul.hidden) { if (inp.value) search(); return; }
          e.preventDefault(); var pos = opts.indexOf(ul.children[cur]);
          pos = e.key === "ArrowDown" ? Math.min(opts.length - 1, pos + 1) : Math.max(0, pos - 1); mark(opts[pos]);
        } else if (e.key === "Enter") {
          if (!ul.hidden) { e.preventDefault(); var li = opts.indexOf(ul.children[cur]) >= 0 ? ul.children[cur] : (items.length === 1 ? opts[0] : null); if (li) pick(li.getAttribute("data-v")); }
          else e.preventDefault();
        } else if (e.key === "Escape") close();
        else if (e.key === "Backspace" && !inp.value && hid.value) { var vs = liste(hid.value); vs.pop(); hid.value = vs.join(" ; "); draw(); }
      });
      ul.addEventListener("mousedown", function (e) { e.preventDefault(); });
      ul.addEventListener("click", function (e) { var li = e.target.closest("li[role=option]"); if (li) pick(li.getAttribute("data-v")); });
      inp.addEventListener("blur", function () {
        setTimeout(function () {
          if (D.activeElement === inp) return;
          if (inp.value) { var i = NM.indexOf(nrm(inp.value)); if (i >= 0) pick(METIERS[i]); }
          close();
        }, 150);
      });
      draw();
    });
    var FAMDE = {}; METIERS.forEach(function (m, i) { FAMDE[m] = FAM[i]; });
    var DECRIRE = { "Autre métier": 1 };
    (C.metiers || []).forEach(function (g) { g[1].forEach(function (m) { if (m[1]) DECRIRE[m[0]] = 1; }); });
    function nbLog() { var n = parseInt(val("nb_logements"), 10); return n > 0 ? n : 1; }
    function shown(f) {
      if (f.log && f.log > nbLog()) return false;
      if (!f.show) return true;
      var want = f.show[1];
      return f.show[0].split("|").some(function (k) {
        var p = ALL.filter(function (x) { return x.k === k; })[0], v = val(k);
        if (!p || !shown(p)) return false;
        var vs = p.type === "metier" ? liste(v) : [v];
        if (want === "@plusieurs") return vs.length > 1;
        if (want === "@decrire") {
          /* Description demandée dès qu'une activité n'est pas réglementée (ou hors liste). Métiers réglementés seuls (ex. kiné + ostéopathe) : rien à décrire. */
          return vs.some(function (x) { return !!DECRIRE[x]; });
        }
        return vs.some(function (x) { return Array.isArray(want) ? want.indexOf(x) >= 0 : x === want; });
      });
    }
    /* Répartition du chiffre d'affaires : une ligne en % par activité choisie (quand il y en a plusieurs) */
    function repartition() {
      ALL.filter(function (f) { return f.type === "repartition"; }).forEach(function (f) {
        var src = f.show[0], box = EQ.querySelector('[data-k="' + f.k + '"] .eq-rep'), hid = FM.elements[f.k];
        var autre = FM.elements[src + "_autre"], vs = liste(val(src)).map(function (x) { return x === "Autre métier" && autre && autre.value.trim() ? autre.value.trim() : x; });
        var old = {}, oldi = []; [].forEach.call(box.querySelectorAll("input"), function (i) { old[i.getAttribute("data-a")] = i.value; oldi.push(i.value); });
        var memeNombre = oldi.length === vs.length;
        if (box.getAttribute("data-vs") !== vs.join("|")) {
          box.setAttribute("data-vs", vs.join("|"));
          box.innerHTML = vs.map(function (a, k) {
            return '<label class="eq-rl"><span>' + esc(a) + '</span><input type="text" inputmode="numeric" maxlength="3" data-a="' + esc(a) + '" value="' + esc(old[a] || (memeNombre ? oldi[k] : "") || "") + '" aria-label="Part de ' + esc(a) + ' en %"><b>%</b></label>'; }).join("") + '<div class="eq-tot"></div>';
        }
        var tot = 0, parts = [];
        [].forEach.call(box.querySelectorAll("input"), function (i) { var n = parseInt(i.value, 10); if (!isNaN(n)) tot += n; parts.push(i.getAttribute("data-a") + " : " + (i.value.trim() || "?") + " %"); });
        var t = box.querySelector(".eq-tot"); if (t) { t.textContent = "Total : " + tot + " %"; t.classList.toggle("ok", tot === 100); }
        var complet = [].every.call(box.querySelectorAll("input"), function (i) { return /^\d{1,3}$/.test(i.value.trim()); });
        hid.value = vs.length > 1 && complet && tot === 100 ? parts.join(" ; ") : "";
      });
    }
    function rubriques() {
      var n = nbLog(), num = 0;
      [].forEach.call(FM.querySelectorAll("fieldset"), function (fs) {
        var lg = +fs.getAttribute("data-log") || 0, vis = (!lg || lg <= n) && (!fs.querySelector("[data-k]") || [].some.call(fs.querySelectorAll(".eq-f[data-k]"), function (w) { return w.style.display !== "none"; })), sp = fs.querySelector("legend span"), b = fs.querySelector("legend b");
        fs.style.display = vis ? "" : "none";
        if (vis && sp) sp.textContent = ++num;
        if (b && lg) b.textContent = b.getAttribute("data-t") + (n > 1 ? " – bien " + lg : "");
      });
    }
    function refresh() { repartition(); ALL.forEach(function (f) { var w = EQ.querySelector('[data-k="' + f.k + '"]'); if (w) w.style.display = shown(f) ? "" : "none"; }); rubriques(); }
    FM.addEventListener("change", function (e) { refresh(); var w = e.target.closest(".eq-f"); if (w) w.classList.remove("eq-err"); });
    FM.addEventListener("input", function (e) { var w = e.target.closest(".eq-f"); if (w) w.classList.remove("eq-err"); if (e.target.closest(".eq-rep") || /_autre$/.test(e.target.name || "")) repartition(); });
    refresh();
    function setMeta() {
      D.title = "Questionnaire " + C.titre.toLowerCase() + " | Eloy";
      var r = D.querySelector('meta[name="robots"]'); if (!r) { r = D.createElement("meta"); r.name = "robots"; D.head.appendChild(r); }
      r.setAttribute("content", "noindex, nofollow");
    }
    setMeta(); setTimeout(setMeta, 300); setTimeout(setMeta, 1500);
    W.scrollTo(0, 0);
    function fmt(f, v) {
      if (f.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v.split("-").reverse().join("/");
      return v;
    }
    FM.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      ALL.forEach(function (f) {
        var w = EQ.querySelector('[data-k="' + f.k + '"]'), v = val(f.k), ko = false;
        if (!shown(f)) { w.classList.remove("eq-err"); return; }
        if (f.req && !v) ko = true;
        if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ko = true;
        if (v && f.type === "cp" && !/^\d{5}$/.test(v)) ko = true;
        if (v && (f.k === "siren" || f.siren) && !/^(\d{9}|\d{14})$/.test(v.replace(/\s/g, ""))) ko = true;
        w.classList.toggle("eq-err", ko);
        if (ko && !bad) bad = w;
      });
      var cw = EQ.querySelector('[data-k="consent"]'), ok = FM.elements.consent.checked;
      cw.classList.toggle("eq-err", !ok); if (!ok && !bad) bad = cw;
      if (bad) { bad.scrollIntoView({ behavior: "smooth", block: "center" }); var i = bad.querySelector("input,select,textarea"); if (i) setTimeout(function () { try { i.focus({ preventScroll: true }); } catch (er) {} }, 300); return; }
      var body = { product: C.demande, "Nom": val("nom"), "Prénom": val("prenom"), "Téléphone": val("tel"), "E-mail": val("email") };
      ALL.forEach(function (f) {
        if (/^(nom|prenom|tel|email)$/.test(f.k) || !shown(f)) return;
        var v = val(f.k); if (!v) return;
        var l = f.s || f.l.replace(/ \(m²\)$/, "").replace(/ \(€\)$/, "").replace(/ \(%\)$/, "");
        if (/\(m²\)$/.test(f.l)) v += " m²";
        if (/\(€\)$/.test(f.l)) v += " €";
        if (/\(%\)$/.test(f.l)) v += " %";
        body[l] = fmt(f, v);
      });
      body["Accord de recontact"] = "oui, le " + new Date().toLocaleString("fr-FR");
      var btn = FM.querySelector("button"), msg = FM.querySelector(".eq-msg");
      btn.disabled = true; btn.textContent = "Envoi en cours…"; msg.style.display = "none";
      W.fetch("eloy-webflow:questionnaire", { method: "POST", body: JSON.stringify(body) }).then(function (r) {
        if (!r.ok) throw new Error("envoi");
        FM.style.display = "none";
        EQ.querySelector(".eq-top p").textContent = "Questionnaire envoyé.";
        FM.insertAdjacentHTML("afterend", '<div class="eq-done"><span class="eq-ok"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><b>Votre questionnaire est bien reçu</b><p>Je lance l\'étude auprès des assureurs et je reviens vers vous rapidement avec votre devis.</p></div>');
        W.scrollTo(0, 0);
      }).catch(function () {
        btn.disabled = false; btn.textContent = "Envoyer mon questionnaire";
        msg.textContent = "L'envoi n'a pas abouti. Merci de réessayer dans un instant, ou d'écrire à eloy.assurances@gmail.com.";
        msg.style.display = "block";
      });
    });
  })();

