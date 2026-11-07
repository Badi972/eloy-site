  /* 6 ter. Questionnaires en ligne (envoyés aux clients par mail) : https://www.eloy-assurances-patrimoine.fr/?questionnaire=habitation
     Pré-remplissage possible : &nom=…&email=…&tel=…  Les réponses partent par le formulaire natif Webflow (partie 5),
     avec « Type de demande : Questionnaire assurance habitation ». Ajouté le 07/11/2026. Questions : tools/questionnaires.json (?questionnaire=habitation, ?questionnaire=rcpro). */
  (function () {
    var QS = new URLSearchParams(location.search), QK = (QS.get("questionnaire") || "").toLowerCase();
    var Q = CFG.questionnaires || {};
    var C = Q[QK];
    if (!C) return;
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
      "#eq .eq-h{font-size:12.5px;color:#5B6475;margin-top:5px;line-height:1.45}" +
      "#eq .eq-o{display:flex;flex-wrap:wrap;gap:8px}#eq .eq-o label{position:relative;cursor:pointer}" +
      "#eq .eq-o input{position:absolute;opacity:0;width:1px;height:1px}" +
      "#eq .eq-o span{display:inline-block;padding:10px 16px;border:1px solid #C9D6EE;border-radius:999px;font-size:15px;background:#F8FAFE;min-height:44px;line-height:22px}" +
      "#eq .eq-o input:checked+span{background:#1B66F7;border-color:#1B66F7;color:#fff;font-weight:600}" +
      "#eq .eq-o input:focus-visible+span{box-shadow:0 0 0 3px #EAF1FE}" +
      "#eq .eq-err input,#eq .eq-err select,#eq .eq-err textarea,#eq .eq-err .eq-o span{border-color:#B42318}#eq .eq-e{display:none;color:#B42318;font-size:12.5px;margin-top:5px}#eq .eq-err .eq-e{display:block}" +
      "#eq .eq-consent{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;margin:4px 0 14px;cursor:pointer}" +
      "#eq .eq-consent input{width:20px;height:20px;flex:none;margin-top:1px;accent-color:#1B66F7}" +
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
      if (f.type === "textarea") inp = '<textarea id="' + id + '" name="' + f.k + '" rows="4"></textarea>';
      else if (f.type === "select") inp = '<select id="' + id + '" name="' + f.k + '"><option value="">Choisir…</option>' + f.o.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
      else {
        var t = f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.type === "date" ? "date" : "text", extra = "";
        if (f.type === "number") extra = ' inputmode="numeric"';
        if (f.type === "cp") extra = ' inputmode="numeric" maxlength="5"';
        if (f.type === "email") extra = ' autocomplete="email"';
        if (f.type === "tel") extra = ' autocomplete="tel"';
        if (f.k === "nom") extra = ' autocomplete="family-name"';
        if (f.k === "prenom") extra = ' autocomplete="given-name"';
        var v = f.p && QS.get(f.p) ? ' value="' + esc(QS.get(f.p)) + '"' : "";
        inp = '<input type="' + t + '" id="' + id + '" name="' + f.k + '"' + extra + v + ">";
      }
      return '<div class="' + cls + '" data-k="' + f.k + '"><label class="eq-l" for="' + id + '">' + esc(f.l) + req + "</label>" + inp + h + '<div class="eq-e">Champ à compléter.</div></div>';
    }
    var html = '<div id="eq"><div class="eq-top"><div class="eq-in"><img src="' + LOGO + '" alt="Eloy"><small>Questionnaire</small><h1>' + esc(C.titre) + "</h1><p>" + esc(C.intro) + "</p></div></div>" +
      '<form novalidate>' + C.sections.map(function (s, i) {
        return '<fieldset><legend><span>' + (i + 1) + "</span>" + esc(s.t) + '</legend><div class="eq-grid">' + s.f.map(field).join("") + "</div></fieldset>";
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
    function shown(f) { if (!f.show) return true; var p = ALL.filter(function (x) { return x.k === f.show[0]; })[0]; return shown(p) && val(f.show[0]) === f.show[1]; }
    function refresh() { ALL.forEach(function (f) { var w = EQ.querySelector('[data-k="' + f.k + '"]'); if (w) w.style.display = shown(f) ? "" : "none"; }); }
    FM.addEventListener("change", function (e) { refresh(); var w = e.target.closest(".eq-f"); if (w) w.classList.remove("eq-err"); });
    FM.addEventListener("input", function (e) { var w = e.target.closest(".eq-f"); if (w) w.classList.remove("eq-err"); });
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

