  /* 6 quater. Rachat de crédits : fiche découverte en ligne avec envoi des pièces (08/11/2026).
     ?rachat=etude (&nom=&prenom=&email=&tel=) : fiche complète ; ?rachat=<dossier>&t=<jeton> : ajout des pièces manquantes.
     Réponses et pièces envoyées à l'application Web du script Google (CFG.rachat) : dossier Google Drive, récapitulatif à Bradley.
     Règles bloquantes validées par Bradley le 08/11/2026 (FICP/FCC, contentieux, tutelle/curatelle, exploitant agricole,
     CDD ou contractuel sans co-emprunteur, hébergé gratuitement par un tiers, moins de 8 000 € à regrouper). */
  (function () {
    var QS = new URLSearchParams(location.search), MODE = QS.get("rachat");
    if (!MODE || !CFG.rachat) return;
    var API = CFG.rachat, DER = CFG.der || "", TEL = "06\u00a096\u00a033\u00a029\u00a009";
    var send = W.__eloyFetch || W.fetch;
    function esc(x) { return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function num(v) { var n = parseFloat(String(v || "").replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, "")); return isNaN(n) ? 0 : n; }
    function eur(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"; }
    function post(o) {
      return send.call(W, API, { method: "POST", body: JSON.stringify(o) }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.err) || "envoi"); return j; });
    }
    var LOGO = BASE + "img/df26dedc632f.png";
    var css = "html.er-on body>*:not(#er):not(#eloy-wf){display:none!important}html.er-on body{background:#F3F6FC;margin:0}" +
      "#er{font-family:\"Plus Jakarta Sans\",\"Segoe UI\",system-ui,-apple-system,sans-serif;color:#0B1220;min-height:100vh;-webkit-text-size-adjust:100%}#er *{box-sizing:border-box}" +
      "#er .er-top{background:#1B66F7;color:#fff;padding:22px 16px 26px}#er .er-in{max-width:760px;margin:0 auto}" +
      "#er .er-top img{height:34px;width:auto;filter:brightness(0) invert(1);display:block;margin-bottom:18px}" +
      "#er .er-top small{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;font-weight:600}" +
      "#er h1{font-size:26px;line-height:1.2;margin:4px 0 8px;font-weight:800}#er .er-top p{margin:0;font-size:15px;line-height:1.5;opacity:.95}" +
      "#er form,#er .er-box{max-width:760px;margin:0 auto;padding:18px 16px 40px}" +
      "#er fieldset{border:0;margin:0 0 16px;padding:20px 18px 6px;background:#fff;border-radius:14px;box-shadow:0 1px 2px rgba(11,18,32,.06),0 0 0 1px #DDE4F0}" +
      "#er legend{float:left;width:100%;padding:0;margin:0 0 14px;font-size:17px;font-weight:700;display:flex;align-items:center;gap:10px}" +
      "#er legend span{flex:none;width:26px;height:26px;border-radius:7px;background:#1B66F7;color:#fff;font-size:13px;display:inline-flex;align-items:center;justify-content:center}" +
      "#er .er-grid{clear:both;display:flex;flex-wrap:wrap;gap:0 14px}#er .er-f{flex:1 1 100%;margin-bottom:16px;min-width:0}#er .w2{flex:1 1 calc(50% - 7px)}" +
      "@media(max-width:560px){#er .w2{flex-basis:100%}}" +
      "#er .er-l{display:block;font-size:14px;font-weight:600;margin-bottom:6px;line-height:1.35}#er .er-l i{color:#B42318;font-style:normal}" +
      "#er input[type=text],#er input[type=email],#er input[type=tel],#er input[type=date],#er select,#er textarea{width:100%;font:inherit;font-size:16px;color:#0B1220;background:#F8FAFE;border:1px solid #C9D6EE;border-radius:10px;padding:11px 12px;min-height:46px;outline:0;-webkit-appearance:none;appearance:none}" +
      "#er textarea{min-height:90px;resize:vertical;line-height:1.45}#er select{background-image:linear-gradient(45deg,transparent 50%,#5B6475 50%),linear-gradient(135deg,#5B6475 50%,transparent 50%);background-position:calc(100% - 18px) 50%,calc(100% - 13px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:34px}" +
      "#er input:focus,#er select:focus,#er textarea:focus{border-color:#1B66F7;box-shadow:0 0 0 3px #EAF1FE;background:#fff}" +
      "#er .er-h{font-size:12.5px;color:#5B6475;margin-top:5px;line-height:1.45}" +
      "#er .er-o{display:flex;flex-wrap:wrap;gap:8px}#er .er-o label{position:relative;cursor:pointer}#er .er-o input{position:absolute;opacity:0;width:1px;height:1px}" +
      "#er .er-o span{display:inline-block;padding:10px 16px;border:1px solid #C9D6EE;border-radius:999px;font-size:15px;background:#F8FAFE;min-height:44px;line-height:22px}" +
      "#er .er-o input:checked+span{background:#1B66F7;border-color:#1B66F7;color:#fff;font-weight:600}#er .er-o input:focus-visible+span{box-shadow:0 0 0 3px #EAF1FE}" +
      "#er .er-o.col{flex-direction:column;align-items:stretch}#er .er-o.col span{display:block;border-radius:12px}" +
      "#er .er-err input,#er .er-err select,#er .er-err textarea,#er .er-err .er-o span{border-color:#B42318}#er .er-e{display:none;color:#B42318;font-size:12.5px;margin-top:5px}#er .er-err .er-e{display:block}" +
      "#er .er-cr{border:1px solid #DDE4F0;border-radius:12px;padding:14px 14px 0;margin-bottom:12px;background:#FBFCFF;position:relative}" +
      "#er .er-cr b.t{display:block;font-size:14px;margin-bottom:10px}#er .er-del{position:absolute;right:10px;top:8px;background:none!important;color:#5B6475!important;width:auto!important;min-height:0!important;padding:4px 8px!important;font-size:13px!important;font-weight:600!important}" +
      "#er .er-add{background:#EAF1FE!important;color:#0E47B8!important;min-height:46px!important;padding:11px!important;font-size:15px!important;margin-bottom:12px}" +
      "#er .er-tot{background:#EAF1FE;border-radius:10px;padding:10px 14px;font-size:14px;line-height:1.6;margin-bottom:16px}" +
      "#er .er-p{border:1px solid #DDE4F0;border-radius:12px;padding:12px 14px;margin-bottom:10px;background:#fff}#er .er-p.ok{border-color:#9ED5B3;background:#F3FBF6}" +
      "#er .er-p .pt{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}#er .er-p b{font-size:14.5px;line-height:1.35}#er .er-p em{display:block;font-style:normal;font-size:12.5px;color:#5B6475;line-height:1.45;margin-top:2px}" +
      "#er .er-p .opt{font-size:11px;font-weight:700;color:#5B6475;background:#EEF2F8;border-radius:999px;padding:2px 8px;margin-left:6px;white-space:nowrap}" +
      "#er .er-p label.up{flex:none;display:inline-flex;align-items:center;gap:6px;background:#1B66F7;color:#fff;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer;min-height:42px}" +
      "#er .er-p label.up input{position:absolute;opacity:0;width:1px;height:1px}#er .er-p.ok label.up{background:#EAF1FE;color:#0E47B8}" +
      "#er .er-fl{list-style:none;margin:8px 0 0;padding:0}#er .er-fl li{display:flex;align-items:center;gap:8px;font-size:13px;padding:5px 0;border-top:1px solid #EEF2F8}" +
      "#er .er-fl li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#er .er-fl li button{flex:none;width:28px!important;height:28px;min-height:0!important;padding:0!important;border-radius:50%!important;background:#EEF2F8!important;color:#0B1220!important;font-size:15px!important}" +
      "#er .er-p .rec{font-size:12.5px;color:#1E7A46;font-weight:700;margin-top:6px}" +
      "#er .er-note{background:#EAF1FE;border-radius:10px;padding:12px 14px;font-size:13.5px;line-height:1.5;margin-bottom:14px}" +
      "#er .er-consent{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;margin:4px 0 14px;cursor:pointer}#er .er-consent input{width:20px;height:20px;flex:none;margin-top:1px;accent-color:#1B66F7}" +
      "#er .er-legal{font-size:12.5px;color:#5B6475;line-height:1.5;margin:0 0 16px}#er .er-legal b{color:#0B1220}" +
      "#er button{width:100%;font:inherit;font-size:16px;font-weight:700;color:#fff;background:#1B66F7;border:0;border-radius:12px;padding:15px;cursor:pointer;min-height:52px}#er button:hover{background:#0E47B8}" +
      "#er button.go{background:#E85D04}#er button.go:hover{background:#C94F02}#er button[disabled]{opacity:.6;cursor:wait}" +
      "#er .er-msg{display:none;margin-top:12px;padding:12px 14px;border-radius:10px;font-size:14px;line-height:1.45;background:#FDECEA;color:#B42318}" +
      "#er .er-done{max-width:760px;margin:24px auto;padding:28px 20px;background:#fff;border-radius:14px;box-shadow:0 0 0 1px #DDE4F0;text-align:center}" +
      "#er .er-done b{display:block;font-size:20px;margin:12px 0 8px}#er .er-done p{margin:0 0 10px;color:#3A4356;line-height:1.55}#er .er-done ul{text-align:left;margin:6px auto 12px;max-width:460px;color:#3A4356;line-height:1.6}" +
      "#er .er-ic{width:52px;height:52px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#E7F5EC;color:#1E7A46}#er .er-ic.ko{background:#FFF1E6;color:#C94F02}" +
      "#er .er-done button{max-width:320px;margin-top:8px}" +
      "#er .er-prog{position:fixed;inset:0;background:rgba(11,18,32,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px}" +
      "#er .er-prog div{background:#fff;border-radius:14px;padding:24px 20px;max-width:420px;width:100%;text-align:center}#er .er-prog b{display:block;font-size:17px;margin-bottom:6px}" +
      "#er .er-prog i{display:block;height:8px;border-radius:99px;background:#EAF1FE;margin:14px 0 8px;overflow:hidden}#er .er-prog i s{display:block;height:100%;width:0;background:#1B66F7;transition:width .3s}" +
      "#er .er-prog small{color:#5B6475;font-size:13px}" +
      "#er .er-foot{max-width:760px;margin:0 auto;padding:0 16px 30px;font-size:12px;color:#5B6475;line-height:1.5;text-align:center}";
    var st = D.createElement("style"); st.textContent = css; D.head.appendChild(st);
    D.documentElement.classList.add("er-on");
    function setMeta() {
      D.title = "Étude de regroupement de crédits | Eloy";
      var r = D.querySelector('meta[name="robots"]'); if (!r) { r = D.createElement("meta"); r.name = "robots"; D.head.appendChild(r); }
      r.setAttribute("content", "noindex, nofollow");
    }
    setMeta(); setTimeout(setMeta, 300); setTimeout(setMeta, 1500);
    var FOOT = '<div class="er-foot">Eloy · Mandataire d\'intermédiaire en opérations de banque (MIOB) de CAP 100 FINANCE · ORIAS n° 23 000 527 (orias.fr) · Le Lamentin, Martinique · ' + TEL +
      '<br>Attention ! Un crédit coûte de l\'argent et doit être remboursé.</div>';
    function shell(titre, intro, inner) {
      return '<div id="er"><div class="er-top"><div class="er-in"><img src="' + LOGO + '" alt="Eloy"><small>Regroupement de crédits</small><h1>' + esc(titre) + "</h1><p>" + esc(intro) + "</p></div></div>" + inner + FOOT + "</div>";
    }
    var ICO_OK = '<span class="er-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>';
    var ICO_KO = '<span class="er-ic ko"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg></span>';

    /* ---------- Pièces : lecture, compression des photos, envoi un fichier après l'autre ---------- */
    var MAXF = 15 * 1024 * 1024;
    function lire(file) {
      return new Promise(function (ok, ko) { var r = new FileReader(); r.onload = function () { ok(String(r.result)); }; r.onerror = ko; r.readAsDataURL(file); });
    }
    function compresser(file) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1200000) return Promise.resolve(file);
      return lire(file).then(function (url) {
        return new Promise(function (ok) {
          var img = new Image();
          img.onload = function () {
            var m = 2200, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, m / Math.max(w, h));
            var cv = D.createElement("canvas"); cv.width = Math.round(w * s); cv.height = Math.round(h * s);
            cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
            cv.toBlob(function (b) { ok(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file); }, "image/jpeg", 0.82);
          };
          img.onerror = function () { ok(file); };
          img.src = url;
        });
      });
    }
    function envoyerPieces(id, t, liste, prog) {
      /* liste : [{k, l, file}] ; 3 envois en parallèle, 2 essais par fichier ; en cas d'échec on continue (la pièce restera « manquante ») */
      var i = 0, fait = 0, echecs = 0;
      function essai(x, n) {
        return compresser(x.file).then(function (f) { return lire(f).then(function (u) { return [f, u]; }); }).then(function (fu) {
          return post({ a: "piece", id: id, t: t, k: x.k, l: x.l, n: fu[0].name, m: fu[0].type || "application/octet-stream", d: fu[1].split(",")[1] || "" });
        }).catch(function () { if (n < 2) return essai(x, n + 1); echecs++; });
      }
      function suivant() {
        if (i >= liste.length) return Promise.resolve();
        var x = liste[i++];
        return essai(x, 1).then(function () { fait++; prog(Math.min(fait, liste.length - 1), liste.length, x.l); return suivant(); });
      }
      prog(0, liste.length, liste.length ? liste[0].l : "");
      var p = []; for (var w = 0; w < Math.min(3, liste.length); w++) p.push(suivant());
      return Promise.all(p).then(function () { return echecs; });
    }
    function progres(root) {
      var box = D.createElement("div"); box.className = "er-prog";
      box.innerHTML = '<div role="status" aria-live="polite"><b>Envoi de votre dossier…</b><small>Ne fermez pas cette page.</small><i><s></s></i><small class="pc"></small></div>';
      root.appendChild(box);
      return { set: function (i, n, l) { box.querySelector("s").style.width = Math.round(100 * i / Math.max(n, 1)) + "%"; box.querySelector(".pc").textContent = n ? "Pièce " + (i + 1) + " sur " + n + " : " + l : ""; },
        fin: function () { box.remove(); } };
    }
    /* Bloc d'une pièce (choix des fichiers, liste, retrait) */
    function blocPiece(p, recu) {
      var opt = p[3] ? '<span class="opt">si concerné</span>' : "";
      return '<div class="er-p' + (recu ? " ok" : "") + '" data-p="' + esc(p[0]) + '" data-l="' + esc(p[1]) + '"><div class="pt"><div><b>' + esc(p[1]) + "</b>" + opt + (p[2] ? "<em>" + esc(p[2]) + "</em>" : "") +
        (recu ? '<div class="rec">✓ Déjà reçu</div>' : "") + '</div><label class="up">+ Ajouter<input type="file" multiple accept="application/pdf,image/*"></label></div><ul class="er-fl"></ul></div>';
    }
    function brancherPieces(root, FILES) {
      root.addEventListener("change", function (e) {
        var inp = e.target; if (!inp.matches || !inp.matches('.er-p input[type=file]')) return;
        var bx = inp.closest(".er-p"), k = bx.getAttribute("data-p"), trop = [];
        FILES[k] = FILES[k] || [];
        [].forEach.call(inp.files, function (f) { if (f.size > MAXF * 1.6 && !/^image\//.test(f.type)) trop.push(f.name); else FILES[k].push(f); });
        inp.value = ""; dessiner(bx, FILES[k]);
        if (trop.length) alert("Fichier trop lourd (15 Mo au maximum) : " + trop.join(", "));
      });
      root.addEventListener("click", function (e) {
        var b = e.target.closest(".er-fl button"); if (!b) return;
        var bx = b.closest(".er-p"), k = bx.getAttribute("data-p");
        FILES[k].splice(+b.getAttribute("data-i"), 1); dessiner(bx, FILES[k]);
      });
      function dessiner(bx, fs) {
        bx.querySelector(".er-fl").innerHTML = fs.map(function (f, i) { return '<li><span>📎 ' + esc(f.name) + '</span><button type="button" data-i="' + i + '" aria-label="Retirer ' + esc(f.name) + '">×</button></li>'; }).join("");
        bx.classList.toggle("ok", fs.length > 0 || !!bx.querySelector(".rec"));
      }
    }
    function aEnvoyer(FILES, root) {
      var l = [];
      [].forEach.call(root.querySelectorAll(".er-p"), function (bx) {
        var k = bx.getAttribute("data-p"); (FILES[k] || []).forEach(function (f) { l.push({ k: k, l: bx.getAttribute("data-l"), file: f }); });
      });
      return l;
    }

    /* ======================= Ajout des pièces manquantes ======================= */
    if (MODE !== "etude") {
      D.body.insertAdjacentHTML("beforeend", shell("Ajouter mes pièces", "Chargement de votre dossier…", '<div class="er-box"></div>'));
      var R = D.getElementById("er"), BOX = R.querySelector(".er-box"), FILES2 = {};
      post({ a: "etat", id: MODE, t: QS.get("t") || "" }).then(function (j) {
        var manq = j.pieces.filter(function (p) { return !p[3]; }), rec = j.pieces.filter(function (p) { return p[3]; });
        R.querySelector(".er-top p").textContent = manq.length ? "Ajoutez ici les pièces qui manquent à votre dossier : en PDF, ou en photo bien à plat et lisible." : "Toutes vos pièces sont reçues. Vous pouvez en ajouter si besoin.";
        BOX.innerHTML = '<fieldset><legend><span>1</span>Pièces à ajouter</legend><div style="clear:both"></div>' +
          (manq.length ? manq.map(function (p) { return blocPiece([p[0], p[1], p[2], p[4]], false); }).join("") : '<p class="er-h" style="margin:0 0 14px">Aucune pièce manquante.</p>') + "</fieldset>" +
          (rec.length ? '<fieldset><legend><span>2</span>Pièces déjà reçues</legend><div style="clear:both"></div>' + rec.map(function (p) { return blocPiece([p[0], p[1], p[2], p[4]], true); }).join("") + "</fieldset>" : "") +
          '<button type="button" class="go">Envoyer mes pièces</button><div class="er-msg" role="alert"></div>';
        brancherPieces(BOX, FILES2);
        BOX.querySelector("button.go").addEventListener("click", function () {
          var l = aEnvoyer(FILES2, BOX), msg = BOX.querySelector(".er-msg");
          if (!l.length) { msg.textContent = "Ajoutez au moins une pièce avant d'envoyer."; msg.style.display = "block"; return; }
          msg.style.display = "none";
          var pg = progres(R);
          envoyerPieces(MODE, QS.get("t"), l, pg.set).then(function (ech) {
            return post({ a: "fin", id: MODE, t: QS.get("t") }).then(function () { return ech; });
          }).then(function (ech) {
            pg.fin();
            BOX.innerHTML = '<div class="er-done">' + ICO_OK + "<b>Pièces bien reçues</b><p>" + (ech ? ech + " fichier(s) n'ont pas pu être envoyés : vous recevrez un mail pour les renvoyer." :
              "Je les ajoute à votre dossier. Vous recevez un mail de confirmation.") + "</p></div>";
            W.scrollTo(0, 0);
          }).catch(function () {
            pg.fin(); msg.textContent = "L'envoi n'a pas abouti. Merci de réessayer dans un instant, ou d'appeler le " + TEL + "."; msg.style.display = "block";
          });
        });
      }).catch(function () {
        R.querySelector(".er-top p").textContent = "Ce lien n'est plus valable.";
        BOX.innerHTML = '<div class="er-done">' + ICO_KO + "<b>Dossier introuvable</b><p>Le lien est incomplet ou n'est plus valable. Appelez-moi au " + TEL + " ou répondez à mon dernier mail.</p></div>";
      });
      W.scrollTo(0, 0);
      return;
    }

    /* ======================= Fiche découverte complète ======================= */
    var STATUTS = ["CDI (secteur privé)", "Fonctionnaire titulaire", "Fonctionnaire contractuel (non titulaire)", "CDD", "Intérim", "Indépendant ou profession libérale",
      "Auto-entrepreneur", "Gérant ou dirigeant de société", "Retraité(e)", "Exploitant agricole", "Sans activité", "Autre"];
    var LOGTS = ["Propriétaire", "Locataire", "Hébergé(e) par mon conjoint ou concubin", "Hébergé(e) par mes parents, mes enfants, mon frère ou ma sœur",
      "Hébergé(e) gratuitement par une autre personne (oncle, tante, cousin, ami…)", "Logé(e) par mon employeur"];
    var SITU = ["Célibataire", "Marié(e)", "Pacsé(e)", "Union libre", "Divorcé(e)", "Veuf / veuve", "Séparé(e), non divorcé(e)", "Divorce en cours"];
    var TYPES = ["Prêt immobilier", "Prêt personnel", "Crédit auto ou moto", "Crédit renouvelable (réserve d'argent)", "Prêt travaux", "Location avec option d'achat (LOA)", "Dette familiale ou autre dette", "Autre"];
    var ON = ["Oui", "Non"];
    var TERR = ["Martinique", "Guadeloupe", "Guyane", "France métropolitaine"];
    var NBC = []; for (var q = 1; q <= 15; q++) NBC.push(String(q));
    var NBB = ["0", "1", "2", "3", "4", "5"];
    var USAGES = ["Résidence principale", "Résidence secondaire", "Bien loué", "Terrain ou autre"];
    var TYPESB = ["Maison", "Appartement", "Terrain", "Local professionnel", "Autre"];
    var DETS = ["En nom propre", "En indivision", "Par une SCI", "En usufruit ou en nue-propriété", "Succession non réglée"];
    var OBJ = ["Baisser mes mensualités", "Financer un nouveau projet", "Avoir de la trésorerie", "Racheter la part de mon ex-conjoint (soulte)", "Autre"];
    /* Description des rubriques : [titre, quand afficher, champs]. Champ : {k, l, t(ype), o, req, w, h, show(fonction), s(libellé court)} */
    function V(k) { return val(k); }
    function co() { return V("co") === "Oui"; }
    function proprio() { return V("logement") === "Propriétaire"; }
    var SECS = [
      ["Pour commencer", 1, [
        { k: "nom", l: "Nom", t: "text", req: 1, w: 2, p: "nom" }, { k: "prenom", l: "Prénom", t: "text", req: 1, w: 2, p: "prenom" },
        { k: "email", l: "E-mail", t: "email", req: 1, w: 2, p: "email" }, { k: "tel", l: "Téléphone portable", t: "tel", req: 1, w: 2, p: "tel" },
        { k: "territoire", l: "Vous habitez en", t: "select", o: TERR, req: 1, w: 2 },
        { k: "commune", l: "Commune", t: "text", req: 1, w: 2 },
        { k: "ficp", l: "Êtes-vous inscrit(e) au fichier de la Banque de France (FICP ou FCC) ?", t: "radio", o: ON, req: 1, s: "Fiché FICP ou FCC" },
        { k: "contentieux", l: "Avez-vous un crédit en contentieux, une dette en recouvrement ou chez un huissier ?", t: "radio", o: ON, req: 1, s: "Contentieux, recouvrement ou huissier" },
        { k: "tutelle", l: "Êtes-vous sous tutelle ou curatelle ?", t: "radio", o: ON, req: 1, s: "Tutelle ou curatelle" },
        { k: "statut", l: "Votre situation professionnelle", t: "select", o: STATUTS, req: 1 },
        { k: "co", l: "Empruntez-vous à deux (avec votre conjoint, concubin…) ?", t: "radio", o: ON, req: 1, s: "Co-emprunteur" },
        { k: "statut2", l: "Situation professionnelle de votre co-emprunteur", t: "select", o: STATUTS, req: 1, show: co },
        { k: "logement", l: "Votre logement", t: "select", o: LOGTS, req: 1 },
        { k: "montant", l: "Montant total des crédits à regrouper (€)", t: "money", req: 1, h: "Le capital qu'il vous reste à rembourser, tous crédits confondus. Une estimation suffit.", s: "Montant déclaré des crédits à regrouper" }
      ]],
      ["Vous", 2, [
        { k: "naissance", l: "Date de naissance", t: "date", req: 1, w: 2 }, { k: "situation", l: "Situation familiale", t: "select", o: SITU, req: 1, w: 2 },
        { k: "enfants", l: "Nombre d'enfants à charge", t: "money", req: 1, w: 2, s: "Enfants à charge" }, { k: "metier", l: "Profession", t: "text", req: 1, w: 2 },
        { k: "employeur", l: "Employeur", t: "text", w: 2, h: "Ou le nom de votre entreprise si vous êtes à votre compte.", show: function () { return !/Retrait|Sans activité/.test(V("statut")); } },
        { k: "depuis", l: "En poste ou en activité depuis (mois et année)", t: "text", req: 1, w: 2, h: "Exemple : 03/2018", show: function () { return !/Retrait|Sans activité/.test(V("statut")); } },
        { k: "revenus1", l: "Revenu net mensuel (€)", t: "money", req: 1, w: 2, h: "Salaire, pension ou revenu d'activité net, après prélèvement à la source." }
      ]],
      ["Votre co-emprunteur", 2, [
        { k: "nom2", l: "Nom", t: "text", req: 1, w: 2 }, { k: "prenom2", l: "Prénom", t: "text", req: 1, w: 2 },
        { k: "naissance2", l: "Date de naissance", t: "date", req: 1, w: 2 }, { k: "metier2", l: "Profession", t: "text", req: 1, w: 2 },
        { k: "depuis2", l: "En poste ou en activité depuis (mois et année)", t: "text", req: 1, w: 2, h: "Exemple : 03/2018", show: function () { return !/Retrait|Sans activité/.test(V("statut2")); } },
        { k: "revenus2", l: "Revenu net mensuel (€)", t: "money", req: 1, w: 2 }
      ], co],
      ["Votre budget", 2, [
        { k: "autresRevenus", l: "Autres revenus mensuels du foyer (€)", t: "money", req: 1, w: 2, h: "Allocations CAF, pension alimentaire perçue, revenus locatifs… 0 si aucun." },
        { k: "autresDetail", l: "Précisez ces revenus", t: "text", w: 2, req: 1, show: function () { return num(V("autresRevenus")) > 0; } },
        { k: "loyer", l: "Loyer mensuel, charges comprises (€)", t: "money", req: 1, w: 2, show: function () { return V("logement") === "Locataire"; } },
        { k: "retardsLoyer", l: "Avez-vous des retards de loyer ?", t: "radio", o: ON, req: 1, show: function () { return V("logement") === "Locataire"; } },
        { k: "moisRetard", l: "Combien de mois de retard ?", t: "money", req: 1, show: function () { return V("retardsLoyer") === "Oui" && V("logement") === "Locataire"; } },
        { k: "pension", l: "Pension alimentaire versée (€ par mois)", t: "money", req: 1, w: 2, h: "0 si aucune." },
        { k: "dettesFiscales", l: "Impôts en retard (€)", t: "money", req: 1, w: 2, h: "0 si aucun." },
        { k: "epargne", l: "Avez-vous de l'épargne (livrets, assurance vie…) ?", t: "radio", o: ON, req: 1 }
      ]],
      ["Vos biens immobiliers", 2, [{ k: "biens", t: "biens" }]],
      ["Vos crédits en cours", 2, [{ k: "credits", t: "credits" },
        { k: "dejaRachat", l: "Avez-vous déjà fait un regroupement de crédits ?", t: "radio", o: ON, req: 1 },
        { k: "dejaQuand", l: "En quelle année ?", t: "text", req: 1, show: function () { return V("dejaRachat") === "Oui"; } }
      ]],
      ["Votre projet", 2, [
        { k: "objectif", l: "Votre objectif", t: "checks", o: OBJ, req: 1, h: "Plusieurs réponses possibles." },
        { k: "tresorerie", l: "Montant souhaité (€)", t: "money", req: 1, w: 2, show: function () { return /Financer|trésorerie/.test(V("objectif")); } },
        { k: "objetTreso", l: "Pour quel projet ?", t: "text", req: 1, w: 2, show: function () { return /Financer|trésorerie/.test(V("objectif")); } },
        { k: "remarques", l: "Remarques (facultatif)", t: "textarea" }
      ]],
      ["Vos justificatifs", 2, [{ k: "pieces", t: "pieces" }]]
    ];
    var ALL = []; SECS.forEach(function (s) { s[2].forEach(function (f) { f.sec = s; ALL.push(f); }); });
    function field(f) {
      var id = "er-" + f.k, cls = "er-f" + (f.w ? " w" + f.w : ""), req = f.req ? " <i>*</i>" : "", h = f.h ? '<div class="er-h">' + esc(f.h) + "</div>" : "", inp;
      if (f.t === "credits") return '<div class="er-f" data-k="credits"><label class="er-l" for="er-nbCredits">Combien de crédits avez-vous en cours ? <i>*</i></label><div style="max-width:220px"><select id="er-nbCredits" name="nbCredits"><option value="">Choisir…</option>' +
        NBC.map(function (o) { return "<option>" + o + "</option>"; }).join("") + '</select></div><div class="er-h" style="margin-bottom:12px">Comptez <b>tous</b> vos crédits, même ceux que vous gardez. Le capital restant dû figure sur votre dernier relevé ou votre tableau d\'amortissement.</div>' +
        '<div class="er-crs"></div><div class="er-tot"></div><div class="er-e">Complétez chaque crédit (type, mensualité, capital restant dû). Le total à regrouper doit atteindre 8 000 €.</div></div>';
      if (f.t === "biens") return '<div class="er-f" data-k="biens"><label class="er-l" for="er-nbBiens">Combien de biens immobiliers possédez-vous ? <i>*</i></label><div style="max-width:220px"><select id="er-nbBiens" name="nbBiens"><option value="">Choisir…</option>' +
        NBB.map(function (o) { return "<option>" + o + "</option>"; }).join("") + '</select></div><div class="er-h" style="margin-bottom:12px">Maison, appartement, terrain, bien loué… Indiquez 0 si vous n\'en avez pas.</div>' +
        '<div class="er-bns"></div><div class="er-e">Indiquez le nombre de biens, puis l\'usage, la valeur et la détention de chacun (au moins 1 bien si vous êtes propriétaire).</div></div>';
      if (f.t === "pieces") return '<div class="er-f" data-k="pieces"><div class="er-note">Envoyez toutes vos pièces en une seule fois : votre dossier sera étudié plus vite.<br><b>Vos documents doivent être lisibles.</b> Scannez-les en PDF, ou prenez-les en photo bien à plat, en entier et avec un bon éclairage. Vérifiez qu\'ils sont lisibles avant de les envoyer.<br>' +
        'S\'il vous manque une pièce, envoyez quand même votre dossier : vous recevrez un lien pour l\'ajouter.</div><div class="er-ps"></div></div>';
      if (f.t === "radio" || f.t === "checks") {
        inp = '<div class="er-o' + (f.col ? " col" : "") + '" role="' + (f.t === "radio" ? "radiogroup" : "group") + '" aria-label="' + esc(f.l) + '">' + f.o.map(function (o) {
          return '<label><input type="' + (f.t === "radio" ? "radio" : "checkbox") + '" name="' + f.k + '" value="' + esc(o) + '"><span>' + esc(o) + "</span></label>"; }).join("") + "</div>";
        return '<div class="' + cls + '" data-k="' + f.k + '"><div class="er-l">' + esc(f.l) + req + "</div>" + inp + h + '<div class="er-e">Merci de choisir une réponse.</div></div>';
      }
      if (f.t === "select") inp = '<select id="' + id + '" name="' + f.k + '"><option value="">Choisir…</option>' + f.o.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
      else if (f.t === "textarea") inp = '<textarea id="' + id + '" name="' + f.k + '" rows="3"></textarea>';
      else {
        var ty = f.t === "email" ? "email" : f.t === "tel" ? "tel" : f.t === "date" ? "date" : "text", ex = "";
        if (f.t === "money") ex = ' inputmode="numeric"';
        if (f.t === "email") ex = ' autocomplete="email"'; if (f.t === "tel") ex = ' autocomplete="tel"';
        if (f.k === "nom") ex = ' autocomplete="family-name"'; if (f.k === "prenom") ex = ' autocomplete="given-name"';
        var v = f.p && QS.get(f.p) ? ' value="' + esc(QS.get(f.p)) + '"' : "";
        inp = '<input type="' + ty + '" id="' + id + '" name="' + f.k + '"' + ex + v + ">";
      }
      return '<div class="' + cls + '" data-k="' + f.k + '"><label class="er-l" for="' + id + '">' + esc(f.l) + req + "</label>" + inp + h + '<div class="er-e">Champ à compléter.</div></div>';
    }
    var html = '<form novalidate>' + SECS.map(function (s, i) {
      return '<fieldset data-s="' + i + '"' + (s[1] === 2 ? " hidden" : "") + '><legend><span>' + (i + 1) + "</span>" + esc(s[0]) + '</legend><div class="er-grid">' + s[2].map(field).join("") + "</div>" +
        (i === 0 ? '<button type="button" class="er-next">Continuer</button><div style="height:16px"></div>' : "") + "</fieldset>";
    }).join("") +
      '<fieldset data-s="fin" hidden><div class="er-grid" style="padding-top:2px"><div class="er-f" data-k="consent"><label class="er-consent"><input type="checkbox" name="consent"><span>J\'ai pris connaissance du ' +
      (DER ? '<a href="' + DER + '" target="_blank" rel="noopener">document d\'entrée en relation</a>' : "document d'entrée en relation") +
      ' et j\'accepte que mes informations et justificatifs soient utilisés par Eloy pour étudier ma demande, et transmis à CAP 100 FINANCE et aux banques consultées. <i style="color:#B42318;font-style:normal">*</i></span></label>' +
      '<div class="er-e">Merci de cocher cette case pour envoyer votre dossier.</div></div></div>' +
      '<p class="er-legal"><b>Attention ! Un crédit coûte de l\'argent et doit être remboursé.</b> Vérifiez vos capacités de remboursement avant de vous engager. Un regroupement de crédits peut allonger la durée de remboursement et augmenter le coût total du crédit. ' +
      'Aucun versement ne peut être exigé avant l\'obtention d\'un prêt. Vous pouvez exercer vos droits d\'accès, de rectification et d\'effacement en écrivant à contact@eloy-assurances-patrimoine.fr.</p>' +
      '<button type="submit" class="go">Envoyer mon dossier</button><div class="er-msg" role="alert"></div></fieldset></form>';
    D.body.insertAdjacentHTML("beforeend", shell("Votre étude de regroupement de crédits", "Votre dossier en une seule fois : vos informations, puis vos justificatifs.", html));
    var R = D.getElementById("er"), FM = R.querySelector("form"), FILES = {}, ETAPE = 1;
    function val(k) {
      var el = FM.elements[k]; if (!el) return "";
      if (el.length && !el.tagName) {
        var out = []; for (var i = 0; i < el.length; i++) if (el[i].checked) out.push(el[i].value);
        return out.join(" ; ");
      }
      if (el.type === "checkbox") return el.checked ? el.value : "";
      return String(el.value || "").trim();
    }
    function secVisible(s) { return s[1] === 1 || (ETAPE === 2 && (!s[3] || s[3]())); }
    function shown(f) { return secVisible(f.sec) && (!f.show || f.show()); }

    /* ---------- Crédits et biens : autant de lignes que le nombre choisi ---------- */
    var CRS = R.querySelector(".er-crs"), BNS = R.querySelector(".er-bns");
    function opts(l) { return '<option value="">Choisir…</option>' + l.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join(""); }
    function ligneCredit(i) {
      return '<div class="er-cr" data-i="' + i + '"><b class="t">Crédit ' + (i + 1) + '</b><div class="er-grid">' +
        '<div class="er-f w2"><label class="er-l">Type de crédit</label><select name="ct_' + i + '">' + opts(TYPES) + "</select></div>" +
        '<div class="er-f w2"><label class="er-l">Banque ou organisme</label><input type="text" name="co_' + i + '"></div>' +
        '<div class="er-f w2"><label class="er-l">Mensualité (€)</label><input type="text" inputmode="numeric" name="cm_' + i + '"></div>' +
        '<div class="er-f w2"><label class="er-l">Capital restant dû (€)</label><input type="text" inputmode="numeric" name="cc_' + i + '"></div>' +
        '<div class="er-f"><div class="er-o"><label><input type="radio" name="ca_' + i + '" value="À regrouper" checked><span>À regrouper</span></label><label><input type="radio" name="ca_' + i + '" value="À garder"><span>À garder</span></label></div></div>' +
        "</div></div>";
    }
    function ligneBien(i) {
      return '<div class="er-cr er-bn" data-i="' + i + '"><b class="t">Bien ' + (i + 1) + '</b><div class="er-grid">' +
        '<div class="er-f w2"><label class="er-l">Usage</label><select name="bu_' + i + '">' + opts(USAGES) + "</select></div>" +
        '<div class="er-f w2"><label class="er-l">Type de bien</label><select name="bt_' + i + '">' + opts(TYPESB) + "</select></div>" +
        '<div class="er-f w2"><label class="er-l">Valeur estimée (€)</label><input type="text" inputmode="numeric" name="bv_' + i + '"></div>' +
        '<div class="er-f w2"><label class="er-l">Vous le détenez</label><select name="bd_' + i + '">' + opts(DETS) + "</select></div>" +
        "</div></div>";
    }
    function lignes(box, n, tpl) {
      var cur = box.children.length;
      while (cur < n) box.insertAdjacentHTML("beforeend", tpl(cur++));
      while (cur > n) { box.lastElementChild.remove(); cur--; }
    }
    function biens() {
      return [].map.call(BNS.children, function (c) {
        var i = c.getAttribute("data-i");
        return { usage: val("bu_" + i), type: val("bt_" + i), valeur: val("bv_" + i), detention: val("bd_" + i) };
      });
    }
    function credits() {
      return [].map.call(CRS.querySelectorAll(".er-cr"), function (c) {
        var i = c.getAttribute("data-i");
        return { type: val("ct_" + i), org: val("co_" + i), mens: val("cm_" + i), crd: val("cc_" + i), action: val("ca_" + i) || "À regrouper" };
      });
    }
    function totaux() {
      var m = 0, c = 0, mg = 0;
      credits().forEach(function (x) { if (/garder/.test(x.action)) mg += num(x.mens); else { m += num(x.mens); c += num(x.crd); } });
      R.querySelector(".er-tot").innerHTML = "À regrouper : <b>" + eur(c) + "</b> de capital restant dû, <b>" + eur(m) + "</b> de mensualités" + (mg ? "<br>Crédits gardés : " + eur(mg) + " de mensualités" : "");
      return { mens: m, crd: c };
    }
    totaux();

    /* ---------- Pièces demandées selon la situation ---------- */
    var SAL = /CDI|Fonctionnaire|CDD|Intérim/, TNS = /Indépendant|Auto-entrepreneur|Gérant/, RET = /Retrait/;
    function age(v) { var m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return 0; var d = new Date(+m[1], +m[2] - 1, +m[3]); return Math.floor((Date.now() - d) / 31557600000); }
    function pieces() {
      var P = [], deux = co(), st = [[V("statut"), "", V("naissance")]], cr = credits();
      if (deux) st.push([V("statut2"), " – co-emprunteur", V("naissance2")]);
      var tns = st.some(function (x) { return TNS.test(x[0]); });
      P.push(["id", "Pièce d'identité" + (deux ? " des deux emprunteurs" : ""), "Carte d'identité ou passeport en cours de validité, recto et verso"]);
      P.push(["livret", "Livret de famille", "Toutes les pages renseignées", /Célibataire|Union libre/.test(V("situation")) && !num(V("enfants")) ? 1 : 0]);
      P.push(["domicile", "Justificatif de domicile de moins de 3 mois", "Facture d'électricité, d'eau, de gaz ou de téléphone fixe"]);
      if (/Marié|Pacsé|Divorcé|Séparé|Divorce/.test(V("situation"))) P.push(["matrimonial", "Contrat de mariage ou jugement de divorce", "Contrat de mariage, convention de PACS, jugement de divorce définitif ou convention de liquidation", 1]);
      P.push(["releves", "3 derniers mois de relevés de tous vos comptes", "Tous les comptes courants : principal, secondaire, joint…" + (tns ? " Y compris les virements entre vos comptes professionnels et personnels." : "")]);
      P.push(["rib", "RIB", "Compte sur lequel sera prélevée la nouvelle mensualité"]);
      P.push(["impots", (tns ? "3" : "2") + " derniers avis d'imposition", "Avis complets, tous les volets"]);
      if (cr.some(function (x) { return /immobilier|personnel|auto|travaux|LOA/.test(x.type); })) P.push(["amortissement", "Tableaux d'amortissement de vos crédits", "Prêts immobiliers et personnels en cours"]);
      if (cr.some(function (x) { return /renouvelable/.test(x.type); })) P.push(["renouvelables", "Derniers relevés de vos crédits renouvelables", "Les plus récents, même si le solde est à zéro"]);
      if (num(V("dettesFiscales")) > 0 || cr.some(function (x) { return /Dette|Autre/.test(x.type); })) P.push(["dettes", "Justificatifs de vos autres dettes", "Retards d'impôts, dettes familiales, factures impayées à intégrer"]);
      if (V("epargne") === "Oui") P.push(["epargne", "Justificatifs d'épargne", "Derniers relevés de vos livrets, assurance vie…"]);
      st.forEach(function (x, j) {
        var s = j ? "2" : "";
        if (SAL.test(x[0])) P.push(["bulletins" + s, "3 derniers bulletins de salaire et celui de décembre" + x[1], "Plus le bulletin de décembre de l'année dernière"]);
        if (TNS.test(x[0])) {
          P.push(["bilans" + s, "3 derniers bilans et liasses fiscales" + x[1], "Documents comptables complets, compte de résultat inclus"]);
          P.push(["relevesPro" + s, "3 derniers mois de relevés des comptes professionnels" + x[1], "Tous les comptes liés à l'activité"]);
        }
        if (RET.test(x[0])) P.push(["pensions" + s, "Attestation fiscale de vos pensions de retraite" + x[1], "Disponible sur info-retraite.fr, rubrique « Mes attestations fiscales »"]);
        if (!RET.test(x[0]) && age(x[2]) >= 59) P.push(["eig" + s, "Estimation indicative globale de retraite (EIG)" + x[1], "Obligatoire à partir de 59 ans, sur info-retraite.fr"]);
      });
      if (num(V("autresRevenus")) > 0) P.push(["revenus", "Justificatifs de vos autres revenus", "Attestation CAF, pension alimentaire perçue…"]);
      var bs = biens();
      if (bs.some(function (b) { return b.usage === "Bien loué"; })) P.push(["locatifs", "Bail et déclaration de revenus fonciers (2044)", "Contrat de bail en cours et dernière déclaration 2044"]);
      var lg = V("logement");
      if (lg === "Locataire") P.push(["bail", "Contrat de bail et dernière quittance de loyer", ""]);
      if (lg === "Propriétaire" || bs.length) P.push(["foncier", "Dernière taxe foncière" + (bs.length > 1 ? " de chaque bien" : ""), bs.length > 1 ? "Pour chacun de vos biens immobiliers" : "Taxe foncière de votre bien"]);
      if (/^Hébergé/.test(lg)) P.push(["hebergement", "Attestation d'hébergement", "Avec la pièce d'identité et un justificatif de domicile de la personne qui vous héberge"]);
      if (/employeur/.test(lg)) P.push(["fonction", "Attestation de logement de fonction", "Délivrée par votre employeur"]);
      return P;
    }
    var PS = R.querySelector(".er-ps"), SIGP = "";
    function majPieces() {
      var P = pieces(), sig = JSON.stringify(P);
      if (sig === SIGP) return; SIGP = sig;
      PS.innerHTML = P.map(function (p) { return blocPiece(p, false); }).join("");
      [].forEach.call(PS.querySelectorAll(".er-p"), function (bx) {
        var k = bx.getAttribute("data-p"), fs = FILES[k] || [];
        if (fs.length) { bx.querySelector(".er-fl").innerHTML = fs.map(function (f, i) { return '<li><span>📎 ' + esc(f.name) + '</span><button type="button" data-i="' + i + '" aria-label="Retirer">×</button></li>'; }).join(""); bx.classList.add("ok"); }
      });
    }
    brancherPieces(PS, FILES);

    /* ---------- Affichage et numérotation ---------- */
    function maj() {
      ALL.forEach(function (f) { var w = R.querySelector('[data-k="' + f.k + '"]'); if (w) w.style.display = shown(f) ? "" : "none"; });
      var n = 0;
      [].forEach.call(FM.querySelectorAll("fieldset[data-s]"), function (fs) {
        var i = fs.getAttribute("data-s");
        if (i === "fin") { fs.hidden = ETAPE !== 2; return; }
        var vis = secVisible(SECS[+i]); fs.hidden = !vis;
        if (vis) fs.querySelector("legend span").textContent = ++n;
      });
      if (ETAPE === 2) majPieces();
    }
    FM.addEventListener("change", function (e) {
      var w = e.target.closest(".er-f"); if (w) w.classList.remove("er-err");
      if (e.target.name === "nbCredits") lignes(CRS, +e.target.value || 0, ligneCredit);
      if (e.target.name === "nbBiens") lignes(BNS, +e.target.value || 0, ligneBien);
      if (!e.target.closest(".er-p")) { totaux(); maj(); }
    });
    FM.addEventListener("input", function (e) { var w = e.target.closest(".er-f"); if (w) w.classList.remove("er-err"); if (/^c[mc]_/.test(e.target.name || "")) totaux(); });
    maj();

    /* ---------- Contrôle des champs ---------- */
    function verifier(liste) {
      var bad = null;
      liste.forEach(function (f) {
        if (f.t === "pieces") return;
        var w = R.querySelector('[data-k="' + f.k + '"]'), v = val(f.k), ko = false;
        if (!w || !shown(f)) { if (w) w.classList.remove("er-err"); return; }
        if (f.t === "credits") { var t = totaux(), cr = credits(); ko = !cr.length || cr.some(function (x) { return !x.type || !(num(x.mens) > 0) || !(num(x.crd) > 0); }) || t.crd < 8000; }
        else if (f.t === "biens") { var bs = biens(); ko = V("nbBiens") === "" || (V("logement") === "Propriétaire" && !bs.length) || bs.some(function (x) { return !x.usage || !x.detention || !(num(x.valeur) > 0); }); }
        else {
          if (f.req && !v) ko = true;
          if (v && f.t === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ko = true;
          if (v && f.t === "tel" && String(v).replace(/\D/g, "").length < 9) ko = true;
          if (v && f.t === "date" && !(age(v) >= 18 && age(v) < 100)) ko = true;
        }
        w.classList.toggle("er-err", ko);
        if (ko && !bad) bad = w;
      });
      if (bad) {
        bad.scrollIntoView({ behavior: "smooth", block: "center" });
        var i = bad.querySelector("input,select,textarea"); if (i) setTimeout(function () { try { i.focus({ preventScroll: true }); } catch (er) {} }, 300);
      }
      return !bad;
    }
    /* ---------- Situations que les banques n'étudient pas ---------- */
    function blocage() {
      if (V("ficp") === "Oui") return ["Fiché FICP ou FCC", "Avec une inscription au fichier de la Banque de France (FICP ou FCC), mes banques partenaires n'étudient pas de regroupement de crédits.",
        "Si vous avez du mal à rembourser vos crédits, la Banque de France peut vous accompagner : banque-france.fr, rubrique « Surendettement »."];
      if (V("contentieux") === "Oui") return ["Contentieux, recouvrement ou huissier", "Avec un crédit en contentieux ou une dette en recouvrement, mes banques partenaires n'étudient pas de regroupement de crédits.",
        "Si vous avez du mal à rembourser vos crédits, la Banque de France peut vous accompagner : banque-france.fr, rubrique « Surendettement »."];
      if (V("tutelle") === "Oui") return ["Tutelle ou curatelle", "Sous tutelle ou curatelle, mes banques partenaires n'étudient pas de regroupement de crédits.", ""];
      if (/Exploitant agricole/.test(V("statut") + (co() ? V("statut2") : ""))) return ["Exploitant agricole", "Mes banques partenaires ne financent pas de regroupement de crédits pour les exploitants agricoles non salariés.", ""];
      if (/CDD|contractuel/.test(V("statut")) && !co()) return ["CDD ou contractuel sans co-emprunteur", "En CDD ou en contrat non titulaire, les banques demandent un co-emprunteur, votre conjoint par exemple, pour étudier un regroupement de crédits.",
        "Si vous empruntez à deux, modifiez votre réponse."];
      if (/autre personne/.test(V("logement"))) return ["Hébergé gratuitement par un tiers", "Les banques n'étudient pas de regroupement de crédits lorsque l'on est hébergé gratuitement par une personne hors de la famille proche (parents, enfants, frères et sœurs).", ""];
      if (num(V("montant")) < 8000) return ["Moins de 8 000 € à regrouper", "Les banques étudient un regroupement à partir de 8 000 € de crédits à regrouper.", ""];
      return null;
    }
    function coords() { return { nom: V("nom"), prenom: V("prenom"), email: V("email").toLowerCase(), tel: V("tel"), territoire: V("territoire"), statut: V("statut"), logement: V("logement"), montant: V("montant") }; }
    R.querySelector(".er-next").addEventListener("click", function () {
      if (!verifier(SECS[0][2])) return;
      var b = blocage();
      if (b) {
        try { post({ a: "ko", c: coords(), raison: b[0] }).catch(function () {}); } catch (e) {}
        FM.style.display = "none";
        var box = D.createElement("div"); box.className = "er-done";
        box.innerHTML = ICO_KO + "<b>Je ne peux pas lancer d'étude pour le moment</b><p>" + esc(b[1]) + "</p>" + (b[2] ? "<p>" + esc(b[2]) + "</p>" : "") +
          "<p>Une question ? Appelez-moi au " + TEL + ".</p><button type=\"button\">Modifier mes réponses</button>";
        FM.insertAdjacentElement("afterend", box);
        box.querySelector("button").addEventListener("click", function () { box.remove(); FM.style.display = ""; });
        W.scrollTo(0, 0);
        return;
      }
      ETAPE = 2; this.style.display = "none"; maj();
      var s2 = FM.querySelector('fieldset[data-s="1"]'); if (s2) s2.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    /* ---------- Envoi ---------- */
    FM.addEventListener("submit", function (e) {
      e.preventDefault();
      if (ETAPE !== 2) return;
      if (!verifier(ALL)) return;
      var cw = R.querySelector('[data-k="consent"]'), okc = FM.elements.consent.checked;
      cw.classList.toggle("er-err", !okc);
      if (!okc) { cw.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      var P = pieces(), l = aEnvoyer(FILES, PS), sans = P.filter(function (p) { return !p[3] && !(FILES[p[0]] || []).length; });
      if (sans.length && !W.confirm("Il manque " + sans.length + " pièce" + (sans.length > 1 ? "s" : "") + " à votre dossier. Vous pourrez les ajouter plus tard avec le lien que vous recevrez par mail.\n\nEnvoyer quand même ?")) return;
      var t = totaux(), S = [];
      SECS.forEach(function (s) {
        if (!secVisible(s)) return;
        var rows = [];
        s[2].forEach(function (f) { if (f.l && shown(f)) { var v = val(f.k); if (v) rows.push([f.s || f.l.replace(/ \(€.*\)$/, "").replace(/ \(€\)$/, ""), /money/.test(f.t) && f.l.indexOf("€") >= 0 ? eur(num(v)) : f.t === "date" ? v.split("-").reverse().join("/") : v]); } });
        if (s[2][0].t === "biens") biens().forEach(function (b, i) { rows.push(["Bien " + (i + 1), [b.usage, b.type, eur(num(b.valeur)), b.detention].filter(String).join(" · ")]); });
        if (rows.length) S.push([s[0], rows]);
      });
      var BS = biens(), RP = BS.filter(function (b) { return b.usage === "Résidence principale"; })[0] || BS[0];
      var k = { statut: V("statut"), statut2: co() ? V("statut2") : "", co: V("co"), logement: V("logement"), total: t.crd, mensTotal: t.mens, montantDeclare: num(V("montant")),
        naissance: V("naissance"), naissance2: co() ? V("naissance2") : "", revenus1: num(V("revenus1")), revenus2: co() ? num(V("revenus2")) : 0, autresRevenus: num(V("autresRevenus")),
        ficp: V("ficp"), contentieux: V("contentieux"), tutelle: V("tutelle"), retardsLoyer: V("retardsLoyer"), moisRetard: V("moisRetard"), dettesFiscales: num(V("dettesFiscales")),
        pension: num(V("pension")), situation: V("situation"), territoire: V("territoire"), commune: V("commune"), biens: BS,
        detention: BS.map(function (b) { return b.detention; }).filter(function (x, i, a) { return x && x !== "En nom propre" && a.indexOf(x) === i; }).join(", "),
        valeur: RP ? num(RP.valeur) : 0, tresorerie: /Financer|trésorerie/.test(V("objectif")) ? num(V("tresorerie")) : 0, objetTreso: V("objetTreso"),
        objectif: V("objectif"), dejaRachat: V("dejaRachat"), dejaQuand: V("dejaQuand") };
      var btn = FM.querySelector("button.go"), msg = FM.querySelector(".er-msg");
      btn.disabled = true; msg.style.display = "none";
      var pg = progres(R), ech = 0, dossier;
      pg.set(0, 0, "");
      post({ a: "init", c: coords(), k: k, s: S, credits: credits(), pieces: P, consent: true }).then(function (j) {
        dossier = j;
        return envoyerPieces(j.id, j.t, l, pg.set);
      }).then(function (n) { ech = n; return post({ a: "fin", id: dossier.id, t: dossier.t }); }).then(function () {
        pg.fin(); FM.style.display = "none";
        R.querySelector(".er-top p").textContent = "Dossier envoyé.";
        var manque = sans.length + ech;
        FM.insertAdjacentHTML("afterend", '<div class="er-done">' + ICO_OK + "<b>Votre dossier est bien reçu</b>" +
          (manque ? "<p>Il manque encore " + manque + " pièce" + (manque > 1 ? "s" : "") + ". Vous recevez un mail avec la liste et un lien pour les ajouter.</p>" :
            "<p>Votre dossier est complet. Je lance l'étude auprès de mes banques partenaires et je reviens vers vous rapidement.</p>") +
          "<p>Une question ? Appelez-moi au " + TEL + ".</p></div>");
        W.scrollTo(0, 0);
      }).catch(function () {
        pg.fin(); btn.disabled = false;
        msg.textContent = dossier ? "Une partie de l'envoi n'a pas abouti. Votre dossier est enregistré : vous recevrez un mail pour compléter vos pièces." :
          "L'envoi n'a pas abouti. Merci de réessayer dans un instant, ou de m'appeler au " + TEL + ".";
        msg.style.display = "block";
        if (dossier) post({ a: "fin", id: dossier.id, t: dossier.t }).catch(function () {});
      });
    });
    W.scrollTo(0, 0);
  })();

