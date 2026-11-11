/* Oráculo · a cena do telhado (frente 2, 10/11/2026)

   Pedido do Gustavo (03h40 e 03h50): a Central vira Oráculo, Gotham vista do telhado, o comissário ao lado do
   holofote olhando a cidade, a cidade é o painel, o Batman em algum lugar, tudo animado.
   Ficha: EMPRESA/fichas/2026-11-10-oraculo.md. Identidade e dicionário da cena: JARVIS/IDENTIDADE.md.
   Uso particular: desenho nosso, em código, homenagem no clima. Nada de arte ou logo oficial.

   Um arquivo só (CSS junto), pra Central do PC, celular e TV:
     const cena = OraculoCena.montar(elemento, {modo: "tv"|"pc"|"cel"|undefined, fonteJersey, parado: false,
       quadroUrl, decisao: (pede) => Node|null, tocar: estacao => {} });
     cena.dados(sala, {uso: {pct, vira}, clima: {memPct, caiu}, voz: "dormindo"|"ouvindo"|"falando"|"pensando", semRede});
   sala = CENTRAL/aovivo.py sala(): {estacoes: [{id, nome, quem, estado, ocupado, passos, linha, linha_em, mexeu, pede, erro}],
   entregues_hoje: [...]}. A cidade se desenha num quadro de 480x270 e é ampliada; o texto vai por cima. */
(function () {
  "use strict";
  if (window.OraculoCena) return;
  const BW = 480, BH = 270;
  let RUA = 212;            // a linha onde os prédios pisam; na TV sobe pra caber três fileiras de letreiro com ar            // tamanho do quadro e a linha onde os prédios pisam
  const C = {tinta: "#07070b", contorno: "#141826", contorno2: "#1d2333", longe: "#0d1018", nevoa: "#2a3346", lua: "#c9d3e6",
    giz: "#eef2f8", apoio: "#9aa6bd", janela: "#f3e2b8", ciano: "#38d6ff", sinal: "#ffe27a", ouro: "#d99a3a", roxo: "#a64dff", verde: "#5fe06a"};

  const CSS = `
.orc{--tinta:#07070b;--giz:#eef2f8;--apoio:#9aa6bd;--fio:#232a3b;--ciano:#38d6ff;--sinal:#ffe27a;--ouro:#d99a3a;--roxo:#a64dff;--verde:#5fe06a;
  --f-letreiro:"Jersey 15","Archivo",sans-serif;--f-texto:"Archivo","Segoe UI",system-ui,sans-serif;--f-mono:"Cascadia Mono",Consolas,monospace;
  --t:16px;--t-rot:14px;--t-nome:20px;--t-perg:24px;--t-marca:40px;--t-relo:36px;--t-torre:28px;
  position:relative;color:var(--giz);font:400 var(--t)/1.3 var(--f-texto);background:var(--tinta);overflow:hidden;min-width:0}
.orc *{box-sizing:border-box}
.orc:not([data-modo="tv"]){max-width:100%}
.orc[data-modo="tv"]{--t:28px;--t-rot:28px;--t-nome:28px;--t-perg:44px;--t-marca:64px;--t-relo:64px;--t-torre:40px;position:absolute;inset:0}
.orc[data-modo="cel"]{--t:16px;--t-rot:14px;--t-nome:16px;--t-perg:20px;--t-marca:32px;--t-relo:28px;--t-torre:20px}
.orc-palco{position:relative;margin:0 auto;overflow:hidden}
.orc canvas{position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;display:block}
.orc-sobre{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.orc-sobre > *{pointer-events:auto}
.orc[data-modo="cel"] .orc-rola{min-width:0;max-width:100%;width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 48px),transparent);mask-image:linear-gradient(90deg,transparent,#000 32px,#000 calc(100% - 48px),transparent)}
.orc[data-modo="cel"] .orc-rola.fim{-webkit-mask-image:linear-gradient(90deg,transparent,#000 32px);mask-image:linear-gradient(90deg,transparent,#000 32px)}
/* topo: a marca, a contagem e o relógio */
.orc-topo{position:absolute;left:0;right:0;top:0;display:flex;align-items:flex-start;gap:12px 24px;padding:16px 24px;pointer-events:none}
.orc[data-modo="tv"] .orc-topo{padding:32px 40px}
.orc-marca[hidden]{display:none}
.orc-marca{margin:0;font:400 var(--t-marca)/1 var(--f-letreiro);letter-spacing:.06em;white-space:nowrap}
.orc-conta{margin:6px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:4px 18px;font-size:var(--t-rot);color:var(--apoio)}
.orc-conta b{font:400 calc(var(--t-rot) * 1.3)/1 var(--f-letreiro);color:var(--giz);margin-right:6px}
.orc-conta .anda b{color:var(--ciano)} .orc-conta .pede b{color:var(--sinal)} .orc-conta .erro b{color:var(--verde);text-shadow:2px 0 0 var(--roxo)}
.orc-relo{margin-left:auto;text-align:right;line-height:1;white-space:nowrap}
.orc-relo b{display:block;font:400 var(--t-relo)/1 var(--f-letreiro);font-variant-numeric:tabular-nums}
.orc-relo span{display:block;margin-top:6px;font:400 var(--t-rot)/1.2 var(--f-mono);color:var(--apoio)}
.orc-clima{display:block;margin-top:6px;font:400 var(--t-rot)/1.2 var(--f-mono);color:var(--apoio)}
.orc-clima[hidden]{display:none}
/* o sinal: a pergunta no céu */
.orc-perg{position:absolute;max-width:min(52%,900px);padding:16px 20px 18px;background:rgba(7,7,11,.86);border-left:4px solid var(--sinal);opacity:0;transform:translateY(-8px);
  transition:opacity .4s cubic-bezier(.2,.7,.3,1),transform .4s cubic-bezier(.2,.7,.3,1);pointer-events:none}
.orc[data-modo="tv"] .orc-perg{padding:24px 32px 28px;border-left-width:6px}
.orc-perg.on{opacity:1;transform:none;pointer-events:auto}
.orc-perg-rot{margin:0 0 8px;font:400 calc(var(--t-rot) * 1.1)/1 var(--f-letreiro);letter-spacing:.08em;color:var(--sinal);text-transform:uppercase}
.orc-perg-q{margin:0;font:600 var(--t-perg)/1.22 var(--f-texto);color:var(--giz);overflow-wrap:anywhere;text-wrap:balance}
.orc-perg-quem{margin:10px 0 0;font-size:var(--t-rot);color:var(--apoio)}
.orc-perg-dec{margin-top:14px}
.orc-perg-dec:empty{display:none}
.orc-perg-dec .tipo,.orc-perg-dec h3,.orc-perg-dec p,.orc-perg-dec .ver,.orc-perg-dec .ed,.orc-perg-dec .lnk-ex{display:none!important}
.orc-perg-dec .card{border:0!important;padding:0!important;background:none!important;margin:0;box-shadow:none!important}
.orc-perg-dec .acoes{display:flex!important;flex-wrap:wrap;gap:8px 12px}
/* resposta é botão de verdade: caixa com borda, 44 px, nada sublinhado */
.orc-perg-dec .acoes button{flex:0 0 auto!important;width:auto!important;grid-column:auto!important;min-height:44px;min-width:96px;padding:0 18px;border:1px solid #4a5268!important;background:transparent!important;color:var(--giz)!important;
  font:600 15px/1 var(--f-texto)!important;text-decoration:none!important;cursor:pointer}
.orc-perg-dec .acoes button.sim{background:var(--sinal)!important;border-color:var(--sinal)!important;color:#07070b!important}
.orc-perg-dec .acoes button:focus-visible{outline:3px solid var(--giz);outline-offset:2px}
.orc-perg-dec .estado{margin-top:8px;font-size:var(--t-rot);color:var(--apoio)}
/* letreiros dos prédios, na rua */
.orc-nome{position:absolute;transform:translateX(-50%);text-align:center;white-space:nowrap;line-height:1.05;padding:0 4px;background:none;border:0;color:inherit;font:inherit;cursor:pointer}
.orc-nome b{display:block;font:400 var(--t-nome)/1 var(--f-letreiro);letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis}
.orc-nome span{display:block;margin-top:4px;font-size:var(--t-rot);color:var(--apoio);overflow:hidden;text-overflow:ellipsis}
.orc-nome i{position:absolute;left:50%;top:-10px;width:2px;height:8px;background:rgba(154,166,189,.35)}
.orc-nome[data-e="andando"] span{color:var(--ciano)}
.orc-nome[data-e="pede"] b{color:var(--sinal)}
.orc-nome[data-e="parado"]{opacity:.62}
.orc-nome[data-e="erro"] b{color:var(--verde);text-shadow:2px 0 0 var(--roxo)}
.orc-nome[data-e="terminou"] b{color:var(--ouro)}
.orc-nome:focus-visible{outline:3px solid var(--giz);outline-offset:2px}
.orc-mais{position:absolute;font-size:var(--t-rot);color:var(--apoio);white-space:nowrap}
.orc-haha{position:absolute;font:400 calc(var(--t-nome) * 1.1)/1 var(--f-letreiro);color:var(--verde);text-shadow:3px 0 0 var(--roxo);transform:rotate(-8deg);white-space:nowrap;pointer-events:none}
/* a torre do relógio: o limite do Claude */
.orc-torre{position:absolute;text-align:right;white-space:nowrap;pointer-events:none;line-height:1}
.orc-torre b{display:block;font:400 var(--t-torre)/1 var(--f-letreiro);font-variant-numeric:tabular-nums}
.orc-torre span{display:block;margin-top:4px;font-size:var(--t-rot);color:var(--apoio)}
.orc-rede{position:absolute;left:50%;top:0;transform:translateX(-50%);margin:0;padding:8px 16px;background:rgba(7,7,11,.9);color:var(--verde);font-weight:600;font-size:var(--t-rot)}
.orc-rede[hidden]{display:none}
.orc-limite{display:none;margin-top:6px;font:400 var(--t-rot)/1.2 var(--f-texto);color:var(--apoio)}
.orc-limite b{font:400 calc(var(--t-rot) * 1.3)/1 var(--f-letreiro);color:var(--giz);margin-right:6px}
.orc-relo .orc-limite{display:none;font-family:var(--f-texto)}
.orc:not([data-modo="tv"]) .orc-relo .orc-limite{display:block}
.orc:not([data-modo="tv"]) .orc-torre{display:none}
.orc:not([data-modo="tv"]) .orc-quieto{position:static;transform:none;white-space:normal;text-align:left;padding:0 16px 12px}
.orc-quieto{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);margin:0;text-align:center;font:400 var(--t-nome)/1.3 var(--f-letreiro);color:var(--apoio);white-space:nowrap}
.orc-quieto span{display:block;font:400 var(--t-rot)/1.3 var(--f-texto)}
.orc-quieto[hidden]{display:none}
.orc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* celular: o sinal fica no topo, fora da faixa da cidade */
.orc:not([data-modo="tv"]){display:flex;flex-direction:column}
.orc:not([data-modo="tv"]) .orc-topo{position:relative;padding:16px;flex-wrap:wrap}
.orc[data-modo="pc"] > *{width:100%;max-width:var(--col);margin-inline:auto}
.orc[data-modo="pc"] .orc-perg{max-width:calc(var(--col) - 32px)!important;margin:0 auto 16px!important}
.orc[data-modo="pc"] .orc-quieto{max-width:var(--col);margin:0 auto}
.orc-topo > div{min-width:0;flex:1 1 auto}
.orc-relo{flex:none}
.orc:not([data-modo="tv"]) .orc-perg{position:relative;left:auto!important;top:auto!important;max-width:900px;margin:0 16px 16px;display:none}
.orc:not([data-modo="tv"]) .orc-perg.on{display:block}
@media (prefers-reduced-motion: reduce){.orc-perg{transition:none}}
`;

  const h = (tag, at, ...filhos) => {
    const e = document.createElement(tag);
    for (const k in at || {}) { const v = at[k]; if (v == null || v === false) continue; if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v === true ? "" : v); }
    for (const f of filhos.flat()) if (f != null) e.append(f);
    return e;
  };
  const agoraS = () => Date.now() / 1000;
  const ve = x => String(x == null ? "" : x).replace(/\bJarvis\b/g, "Oráculo").replace(/Oráculo \(Oráculo\)/g, "Oráculo");     // por dentro segue Jarvis; na tela é Oráculo
  const hhmm = d => d.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"});
  function haQuanto(ts) { if (!ts) return ""; const s = Math.max(0, agoraS() - ts); return s < 60 ? "agora" : s < 3600 ? "há " + Math.round(s / 60) + " min" : s < 86400 ? "há " + Math.round(s / 3600) + " h" : "há " + Math.round(s / 86400) + " d"; }
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  const rnd = sem => () => { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);

  function montar(raiz, op) {
    op = op || {};
    if (!document.getElementById("orc-css")) document.head.append(h("style", {id: "orc-css"}, CSS));
    if (op.fonteJersey && !document.getElementById("orc-fonte")) document.head.append(h("style", {id: "orc-fonte"}, `@font-face{font-family:"Jersey 15";src:url("${op.fonteJersey}") format("woff2");font-display:swap}`));
    const qs = new URLSearchParams(location.search);
    let leve = op.leve === true || qs.has("leve") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const parado = !!op.parado;

    /* ---------- esqueleto ---------- */
    const cv = h("canvas", {width: BW, height: BH, role: "img", "aria-label": "Gotham vista do telhado: cada prédio é um trabalho andando"});
    const g = cv.getContext("2d");
    const marca = h("h2", {class: "orc-marca", text: "Oráculo", hidden: !!op.semMarca});      // dentro da Central a marca já está no topo
    const conta = h("ul", {class: "orc-conta"});
    const relo = h("p", {class: "orc-relo"}, h("b"), h("span"));
    const limite = h("span", {class: "orc-limite"});      // fora da TV o número do limite mora embaixo da data
    const clima = h("span", {class: "orc-clima", hidden: true});
    relo.append(limite, clima);
    const topo = h("header", {class: "orc-topo"}, h("div", {}, marca, conta), relo);
    const pergRot = h("p", {class: "orc-perg-rot", text: "Espera você"});
    const pergQ = h("p", {class: "orc-perg-q"});
    const pergQuem = h("p", {class: "orc-perg-quem"});
    const pergDec = h("div", {class: "orc-perg-dec"});
    const perg = h("section", {class: "orc-perg", role: "status", "aria-live": "polite"}, pergRot, pergQ, pergQuem, pergDec);
    const nomes = h("div", {class: "orc-nomes"});
    const torre = h("p", {class: "orc-torre"}, h("b"), h("span"));
    const haha = h("p", {class: "orc-haha", text: "HA HA", hidden: true});
    const rede = h("p", {class: "orc-rede", role: "status", hidden: true});
    const quieto = h("p", {class: "orc-quieto", hidden: true}, "Cidade quieta: nada andando, nada esperando você.", h("span"));
    const sobre = h("div", {class: "orc-sobre"}, nomes, torre, haha, quieto);
    const palco = h("div", {class: "orc-palco"}, cv, sobre);
    const rola = h("div", {class: "orc-rola"}, palco);
    const el = h("div", {class: "orc"}, rola, topo, perg, rede);
    raiz.replaceChildren(el);

    /* ---------- estado da cena ---------- */
    let S = {estacoes: [], entregues_hoje: []}, X = {}, modo = "pc", k = 4, t = 0;
    const P = new Map();            // id -> prédio {x, w, h, alvoX, ...}
    let sinal = 0, sinalAlvo = 0, pendente = null;
    const bat = {x: 300, y: 150, de: null, para: null, t0: 0, alvo: null, some: 0};
    const comi = {caneca: 0, olhaCeu: 0, relogio: 0};
    let raio = 0, ultimoRaio = 0, fpsMedido = null;
    const R = rnd(7);
    // a cidade de fundo (fixa): silhuetas longe e algumas janelas
    const LONGE = [];
    { let x = 2; const r = rnd(42); while (x < BW) { const w = 8 + Math.floor(r() * 16), hh = 30 + Math.floor(r() * 70); LONGE.push({x, w, h: hh, j: Math.floor(r() * 1000)}); x += w + 1 + Math.floor(r() * 3); } }
    const NUVENS = Array.from({length: 6}, (_, i) => ({x: i * 90 + R() * 40, y: 20 + R() * 70, w: 50 + R() * 60, v: 2 + R() * 3}));
    const CHUVA = Array.from({length: 140}, () => ({x: R() * BW, y: R() * BH, v: 120 + R() * 80}));

    /* ---------- tamanho ---------- */
    function medir() {
      const largura = raiz.clientWidth || innerWidth;
      modo = op.modo || (largura < 1024 ? "cel" : "pc");     // a TV pede modo "tv" (o PC dele também é 1920x1080)
      RUA = modo === "tv" ? 198 : 212;
      el.dataset.modo = modo;
      // celular: o sinal e a pergunta em cima, a cidade numa faixa que rola de lado embaixo
      const ordem = modo === "tv" ? [rola, topo, perg, rede] : [topo, perg, rola, rede];   // fora da TV a pergunta (com botões) fica acima da cidade
      if (ordem.some((n, i) => el.children[i] !== n)) { el.replaceChildren(...ordem); if (modo !== "tv") perg.after(quieto); else sobre.append(quieto); }
      if (modo === "tv") k = Math.min((raiz.clientWidth || 1920) / BW, (raiz.clientHeight || 1080) / BH);
      else if (modo === "cel") k = Math.max(1.6, Math.min(2.2, (innerHeight * 0.5) / BH));
      else k = Math.min(largura / BW, Math.max(1.6, (innerHeight * 0.62) / BH));     // no PC a cidade cabe na tela junto da pergunta
      palco.style.width = Math.round(BW * k) + "px";
      el.style.setProperty("--col", modo === "pc" ? Math.round(BW * k) + "px" : "none");
      // no celular a faixa corta o céu de cima (a pergunta já está no topo) e abre mostrando o telhado e a cidade
      const corte = 0;
      palco.style.height = Math.round((BH - corte) * k) + "px";
      cv.style.top = sobre.style.top = -Math.round(corte * k) + "px";
      cv.style.height = sobre.style.height = Math.round(BH * k) + "px";
      if (!rola.dataset.ouve) { rola.dataset.ouve = "1"; rola.addEventListener("scroll", () => rola.classList.toggle("fim", rola.scrollLeft + rola.clientWidth >= rola.scrollWidth - 4), {passive: true}); }
      if (modo === "cel" && !rola.dataset.rolou) { rola.dataset.rolou = "1"; requestAnimationFrame(focarFaixa); }
      el.style.height = "";
      posicionar();
      // rearrumou (a pergunta entrou, girou o celular): a faixa volta pro ponto que importa
      if (modo === "cel" && rola.dataset.alvo) setTimeout(() => { if (Math.abs(rola.scrollLeft - +rola.dataset.alvo) > 4 && rola.scrollLeft < 8) rola.scrollLeft = +rola.dataset.alvo; }, 150);
    }

    // no celular a faixa abre no prédio que importa: o do sinal, senão o do erro, senão o primeiro que anda
    function focarFaixa() {
      if (modo !== "cel") return;
      const vivos = [...P.values()].filter(p => !p.saindo);
      // com pendência, o centro é o sinal no céu (x 300 do quadro); sem ela, o prédio do erro, depois quem trabalha
      const alvo = vivos.find(p => p.d.erro) || vivos.find(p => p.d.ocupado) || vivos[0];
      const cx = sinalAlvo ? 300 : alvo ? alvo.alvoX + alvo.alvoW / 2 : 110;
      rola.dataset.alvo = Math.max(0, Math.round(cx * k - rola.clientWidth / 2));
      rola.scrollLeft = +rola.dataset.alvo;
    }
    /* ---------- dado ---------- */
    function dados(sala, extra) {
      X = extra || {};
      if (sala) S = sala;
      rede.hidden = !X.semRede; rede.textContent = "Sem sinal do PC. A cidade mostra o último estado.";
      // pendência sem trabalho andando não vira prédio: só acende o sinal
      const soltas = (S.estacoes || []).filter(d => String(d.id).startsWith("pede-"));
      const est = (S.estacoes || []).filter(d => !String(d.id).startsWith("pede-") && (d.estado !== "terminou" || agoraS() - (d.mexeu || 0) < 90));
      // quem vira prédio: até 10, quem pede e quem trabalha primeiro
      const peso = d => d.estado === "pede" ? 0 : d.erro ? 1 : d.estado === "terminou" ? 2 : d.ocupado ? 3 : d.estado === "andando" ? 4 : 5;
      const lista = est.slice().sort((a, b) => peso(a) - peso(b) || (a.comeco || 0) - (b.comeco || 0)).slice(0, modo === "cel" ? 9 : 10);
      // ordem na rua estável: pela hora em que começou
      lista.sort((a, b) => (a.comeco || 0) - (b.comeco || 0) || (a.id < b.id ? -1 : 1));
      const vistos = new Set();
      const x0 = 150, x1 = 428, n = Math.max(1, lista.length), vaoX = 3;
      const larg = Math.max(14, Math.min(40, Math.floor((x1 - x0 - (n - 1) * vaoX) / n)));
      const total = n * larg + (n - 1) * vaoX;
      let x = x0 + Math.max(0, Math.floor((x1 - x0 - total) / 2));
      lista.forEach((d, i) => {
        vistos.add(d.id);
        let p = P.get(d.id);
        const r = rnd(hash(d.id));
        const andares = Math.max(4, Math.min(14, (d.passos || []).length || 5));
        const alto = 34 + andares * 7 + (i % 2 ? 0 : 14) + Math.floor(r() * 10);
        if (!p) {
          p = {id: d.id, x: x, w: larg, h: 0, alvoH: alto, nasceu: t, telhado: Math.floor(r() * 4), sem: hash(d.id), flash: 0, ouro: 0, erroT: 0};
          P.set(d.id, p);
        }
        const antes = p.d;
        p.d = d; p.alvoX = x; p.alvoW = larg; p.alvoH = Math.min(RUA - 40, alto); p.andares = andares; p.saindo = false;
        if (antes && antes.estado !== "terminou" && d.estado === "terminou") { p.flash = 1; comi.caneca = 2.5; }
        if (antes) {
          const fa = (antes.passos || []).filter(q => q.estado === "feito").length, fn = (d.passos || []).filter(q => q.estado === "feito").length;
          if (fn > fa) p.faisca = 1;
        }
        x += larg + vaoX;
      });
      for (const [id, p] of P) if (!vistos.has(id)) p.saindo = true;
      pendente = lista.find(d => d.estado === "pede" && d.pede) || soltas.find(d => d.pede) || null;
      // a faixa abre no que importa (e reabre quando o sinal acende ou apaga); depois disso quem rola é ele
      const chaveFoco = (pendente ? "s" : "") + (lista.find(d => d.erro) || {}).id;
      if (modo === "cel" && lista.length && rola.dataset.focou !== chaveFoco) { rola.dataset.focou = chaveFoco; setTimeout(focarFaixa, 60); }
      sinalAlvo = pendente ? 1 : 0;
      // o Batman: de vigia no trabalho mais atrasado (o andando que mais tempo está sem novidade)
      const vigia = lista.filter(d => d.estado === "andando" || d.erro).sort((a, b) => (b.erro ? 1 : 0) - (a.erro ? 1 : 0) || (a.linha_em || a.mexeu || 0) - (b.linha_em || b.mexeu || 0))[0];
      const novoAlvo = vigia ? vigia.id : null;
      if (novoAlvo !== bat.alvo) { bat.de = {x: bat.x, y: bat.y}; bat.alvo = novoAlvo; bat.t0 = t; }
      pintarTexto();
    }

    /* ---------- texto por cima ---------- */
    function pintarTexto() {
      const est = S.estacoes || [];
      const nAnda = est.filter(d => d.estado === "andando").length, nPede = est.filter(d => d.estado === "pede").length, nErro = est.filter(d => d.erro).length, nPar = est.filter(d => d.estado === "parado").length;
      const it = [];
      if (nPede) it.push(h("li", {class: "pede"}, h("b", {text: nPede}), nPede > 1 ? "esperam você" : "espera você"));
      it.push(h("li", {class: "anda"}, h("b", {text: nAnda}), "andando"));
      if (nErro) it.push(h("li", {class: "erro"}, h("b", {text: nErro}), nErro > 1 ? "com erro" : "com erro"));
      if (nPar) it.push(h("li", {}, h("b", {text: nPar}), nPar > 1 ? "parados" : "parado"));
      const ent = (S.entregues_hoje || []).length;
      if (ent) it.push(h("li", {}, h("b", {text: ent}), ent > 1 ? "entregues hoje" : "entregue hoje"));
      conta.replaceChildren(...it);
      // pergunta
      if (pendente) {
        pergQ.textContent = ve(pendente.pede.pergunta || pendente.pede.titulo || pendente.nome);
        pergQuem.textContent = ve((pendente.quem ? pendente.quem + " · " : "") + (pendente.pede.titulo && pendente.pede.pergunta ? pendente.pede.titulo : pendente.nome));
        const k2 = pendente.pede.id;
        if (pergDec.dataset.k !== k2) {        // sem o cartão ainda (a fila não chegou), tenta de novo na próxima leitura
          const no = modo !== "tv" && op.decisao ? op.decisao(pendente.pede, pendente) : null;
          pergDec.replaceChildren(...(no ? [no] : []));
          if (no || modo === "tv" || !op.decisao) pergDec.dataset.k = k2;
        }
      } else { pergDec.dataset.k = ""; pergDec.replaceChildren(); }
      perg.classList.toggle("on", !!pendente);
      if (modo === "tv" && pendente) pergQuem.textContent += " · responda na Central";
      // clima
      const mem = X.clima && X.clima.memPct;
      const motivo = X.clima && X.clima.caiu ? "raio: o PC parou de mandar sinal" : mem >= 88 ? `chuva: memória do PC em ${Math.round(mem)}%` : "";
      clima.hidden = !motivo; clima.textContent = motivo;
      // torre
      const u = X.uso || {};
      torre.firstChild.textContent = u.pct != null ? Math.round(u.pct) + "%" : "";
      limite.replaceChildren(...(u.pct != null ? [h("b", {text: Math.round(u.pct) + "%"}), "do limite" + (u.vira ? " · vira " + new Date(u.vira * 1000).toLocaleString("pt-BR", {weekday: "short", hour: "2-digit", minute: "2-digit"}).replace(".", "") : "")] : []));
      torre.lastChild.textContent = u.pct != null ? "do limite" + (u.vira ? " · vira " + new Date(u.vira * 1000).toLocaleString("pt-BR", {weekday: "short", hour: "2-digit", minute: "2-digit"}).replace(".", "") : "") : "";
      posicionar();
    }
    function posicionar() {
      // letreiros na rua, em duas fileiras alternadas, embaixo de cada prédio
      const vivos = [...P.values()].filter(p => !p.saindo).sort((a, b) => a.alvoX - b.alvoX);
      const linha1 = (RUA + 6) * k;
      const filas = vivos.length >= 7 ? 3 : 2;
      const passo = modo === "tv" ? 80 : modo === "cel" ? 52 : Math.max(52, k * 13);
      const k3 = vivos.map(p => p.id + p.d.estado + (p.d.erro ? 1 : 0) + p.d.nome + etapaTxt(p.d)).join("|") + k;
      if (nomes.dataset.k !== k3) {
        nomes.dataset.k = k3;
        nomes.replaceChildren(...vivos.map((p, i) => {
          const d = p.d;
          const b = h("button", {class: "orc-nome", type: "button", "data-e": d.erro ? "erro" : d.estado, "aria-label": `${ve(d.nome)}, ${ve(d.quem)}, ${etapaTxt(d)}`},
            h("b", {text: ve(d.nome)}), h("span", {text: etapaTxt(d)}));
          const cx = (p.alvoX + p.alvoW / 2) * k, slot = Math.max(1, (vivos[1] ? (vivos[1].alvoX - vivos[0].alvoX) : p.alvoW + 3)) * k;
          b.style.left = cx + "px";
          const fila = i % filas;
          b.style.top = (linha1 + fila * passo) + "px";
          b.style.maxWidth = Math.round(slot * filas - 10) + "px";
          b.addEventListener("click", () => op.tocar && op.tocar(d));
          return b;
        }));
      }
      // o palco cresce com as fileiras de letreiros (nada some cortado embaixo)
      const corteK = 0;
      const precisa = Math.ceil(linha1 + filas * passo + 8 - corteK), base = Math.round(BH * k - corteK);
      palco.style.height = Math.max(base, vivos.length ? precisa : base) + "px";
      // a cidade sem nada: diz que está quieta, com a hora do último dado
      quieto.hidden = !!vivos.length;
      const casaQuieto = modo === "tv" ? sobre : el;
      if (quieto.parentNode !== casaQuieto) { if (modo === "tv") sobre.append(quieto); else perg.after(quieto); }
      if (!vivos.length) quieto.lastChild.textContent = S.em ? "último dado às " + hhmm(new Date(S.em * 1000)) : "";
      // a torre
      torre.style.right = (BW - 438) * k + "px";
      torre.style.top = 66 * k + "px";
      // a pergunta no céu, à esquerda do sinal
      if (modo === "tv") { perg.style.left = "40px"; perg.style.top = "160px"; }
      // o HA HA no prédio do erro
      const pe = vivos.find(p => p.d.erro);
      haha.hidden = !pe;
      if (pe) { haha.style.left = (pe.alvoX - 2) * k + "px"; haha.style.top = (RUA - pe.alvoH * 0.2) * k + "px"; }
    }
    function etapaTxt(d) {
      if (d.estado === "pede") return "espera você";
      if (d.erro) return "deu erro";
      if (d.estado === "terminou") return "entregue";
      const ps = d.passos || [];
      const f = ps.filter(q => q.estado === "feito").length;
      if (d.estado === "parado") return "parado " + haQuanto(d.mexeu);
      return ps.length ? `etapa ${Math.min(f + 1, ps.length)} de ${ps.length}` : "andando";
    }

    /* ---------- desenho ---------- */
    const px = (x, y, w, hh, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(hh)); };
    function ceu() {
      const gr = g.createLinearGradient(0, 0, 0, RUA);
      gr.addColorStop(0, "#050508"); gr.addColorStop(0.7, "#0a0c14"); gr.addColorStop(1, "#141a28");
      g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
      // grão do preto de tinta (fixo, não pisca)
      const r = rnd(99);
      g.fillStyle = "rgba(255,255,255,0.025)";
      for (let i = 0; i < 260; i++) g.fillRect(Math.floor(r() * BW), Math.floor(r() * RUA), 1, 1);
      // lua
      px(388, 24, 1, 1, C.lua);
      g.fillStyle = C.lua; g.beginPath(); g.arc(398, 34, 11, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#07070b"; g.beginPath(); g.arc(403, 31, 10, 0, Math.PI * 2); g.fill();
    }
    function nuvens(dt) {
      for (const n of NUVENS) {
        if (!parado && !leve) n.x += n.v * dt;
        if (n.x > BW + 60) { n.x = -n.w - 20; n.y = 20 + Math.random() * 70; }
        g.fillStyle = "rgba(42,51,70,0.35)";
        g.fillRect(Math.round(n.x), Math.round(n.y), Math.round(n.w), 5);
        g.fillRect(Math.round(n.x + n.w * 0.2), Math.round(n.y - 3), Math.round(n.w * 0.5), 3);
      }
    }
    function cidadeLonge() {
      const entregues = Math.min(12, (S.entregues_hoje || []).length);
      let ouro = 0;
      for (const b of LONGE) {
        px(b.x, RUA - b.h, b.w, b.h, C.longe);
        // janelas raras e frias; as entregas do dia viram janela dourada (até meia-noite)
        const r = rnd(b.j);
        for (let y = RUA - b.h + 4; y < RUA - 4; y += 6) for (let x = b.x + 2; x < b.x + b.w - 2; x += 4) {
          const v = r();
          if (ouro > 0 && v > 0.985) { px(x, y, 2, 2, C.ouro); ouro--; }
          else if (v > 0.93) px(x, y, 1, 2, "rgba(243,226,184,0.22)");
        }
      }
      // as entregas do dia: uma janela dourada por entrega, nos prédios atrás do telhado (os que aparecem acima dele)
      const atras = LONGE.filter(b => b.x + b.w < 146 && RUA - b.h < 186);
      for (let i = 0; i < entregues && atras.length; i++) {
        const b = atras[i % atras.length], col = Math.floor(i / atras.length);
        const cols = Math.max(1, Math.floor((b.w - 4) / 4));
        px(b.x + 2 + (col % cols) * 4, RUA - b.h + 5 + Math.floor(col / cols) * 6, 2, 2, C.ouro);
      }
    }
    function dirigivel() {
      if (leve && !parado) return;
      const per = 120, f = ((t % per) / per);
      const x = -60 + f * (BW + 120), y = 46 + Math.sin(t * 0.3) * 1.5;
      g.fillStyle = "#1a2030"; g.beginPath(); g.ellipse(x, y, 22, 6, 0, 0, Math.PI * 2); g.fill();
      px(x - 6, y + 6, 12, 3, "#141826");
      if (Math.floor(t * 2) % 2) px(x + 20, y, 1, 1, C.ciano);
      px(x - 10, y + 7, 3, 1, "rgba(243,226,184,0.5)");
    }
    function predio(p, dt) {
      // anda até o lugar (desliza), cresce ao nascer, encolhe ao sair
      const vel = parado ? 1 : 1 - Math.exp(-dt * 4);
      p.x = p.x == null ? p.alvoX : lerp(p.x, p.alvoX, vel);
      p.w = lerp(p.w, p.alvoW, vel);
      p.h = lerp(p.h, p.saindo ? 0 : p.alvoH, parado ? 1 : 1 - Math.exp(-dt * 3));
      if (p.saindo && p.h < 1) { P.delete(p.id); return; }
      const d = p.d, x = Math.round(p.x), w = Math.round(p.w), hh = Math.round(p.h), y = RUA - hh;
      if (hh < 2) return;
      const idade = agoraS() - (d.linha_em || d.mexeu || agoraS());
      const apaga = d.estado === "parado" ? Math.max(0.18, 1 - idade / (6 * 3600)) : 1;
      // corpo e contorno
      px(x, y, w, hh, C.contorno);
      px(x, y, 1, hh, C.contorno2);
      // telhado
      const tel = p.telhado;
      if (tel === 1) { px(x + w / 2 - 1, y - 10, 2, 10, C.contorno2); }
      else if (tel === 2) { px(x + 3, y - 6, 8, 6, C.contorno2); px(x + 4, y - 8, 6, 2, C.contorno); }
      else if (tel === 3) { for (let i = 0; i < 4; i++) px(x + w / 2 - 4 + i, y - 8 + i * 2, 8 - i * 2, 2, C.contorno); }
      // janelas: andar por andar, de baixo pra cima; acesa = etapa feita, a atual em ciano
      const ps = d.passos || [];
      const andares = p.andares, alturaAndar = Math.max(4, Math.floor((hh - 6) / andares));
      const feitas = ps.filter(q => q.estado === "feito").length;
      const atual = ps.findIndex(q => q.estado === "aberto");
      const fat = ps.length ? andares / ps.length : 1;
      const r = rnd(p.sem);
      for (let a = 0; a < andares; a++) {
        const yy = RUA - 4 - (a + 1) * alturaAndar;
        if (yy < y + 2) break;
        const etapa = Math.floor(a / fat);
        for (let xx = x + 2; xx < x + w - 2; xx += 4) {
          const v = r();
          let cor = null;
          if (p.flash > 0) cor = C.giz;
          else if (d.estado === "terminou") cor = C.ouro;
          else if (etapa < feitas) cor = v > 0.12 ? C.janela : null;
          else if (etapa === atual) cor = (d.ocupado && !parado && !leve && Math.floor(t * 2 + xx) % 3 === 0) ? "rgba(56,214,255,0.45)" : C.ciano;
          else if (v > 0.9) cor = "rgba(243,226,184,0.18)";
          if (cor) { g.globalAlpha = apaga * (cor === C.janela ? 0.9 : 1); px(xx, yy, 2, 2, cor); g.globalAlpha = 1; }
        }
      }
      // trabalhando agora: elevador subindo, antena piscando, fumaça
      if (d.ocupado && d.estado !== "parado") {
        const ey = RUA - 4 - ((t * 10 + p.sem % 50) % (hh - 8));
        px(x + w - 2, ey, 1, 2, C.ciano);
        if (parado || Math.floor(t * 1.5 + p.sem) % 2) px(x + Math.floor(w / 2), y - (tel === 1 ? 11 : 2), 1, 1, C.ciano);
        if (!leve && !parado) for (let i = 0; i < 3; i++) {
          const f = ((t * 0.4 + i / 3 + (p.sem % 7) / 7) % 1);
          g.fillStyle = `rgba(42,51,70,${0.5 * (1 - f)})`;
          g.fillRect(Math.round(x + 4 + f * 6), Math.round(y - 4 - f * 14), 3, 2);
        }
      }
      // etapa que acabou de fechar: uma faísca sobe
      if (p.faisca > 0) { const f = 1 - p.faisca; px(x + w / 2, y - 4 - f * 16, 1, 2, C.janela); p.faisca = Math.max(0, p.faisca - dt * 1.2); }
      if (p.flash > 0) p.flash = Math.max(0, p.flash - dt);
      // o Coringa passou: glitch roxo e verde e a carta na fachada
      if (d.erro) {
        const sh = parado || leve ? 1 : (Math.floor(t * 8) % 4 === 0 ? 2 : 1);
        const yg = RUA - hh * 0.55;
        g.globalAlpha = 0.6; px(x - sh, yg, w, 2, C.roxo); px(x + sh, yg + 5, w, 1, C.verde); px(x - sh * 2, yg + 11, w * 0.7, 2, C.roxo); px(x + sh, yg + 16, w * 0.5, 1, C.verde); g.globalAlpha = 1;
        const yc = Math.round(RUA - hh * 0.35);
        px(x + w / 2 - 3, yc, 6, 8, C.giz); px(x + w / 2 - 2, yc + 2, 4, 1, C.roxo); px(x + w / 2 - 1, yc + 4, 2, 2, C.verde);
      }
    }
    function torreDesenho() {
      const x = 440, w = 26, y = 62;
      px(x, y, w, RUA - y, C.contorno);
      px(x + 3, y - 10, w - 6, 10, C.contorno);
      for (let i = 0; i < 6; i++) px(x + 6 + i, y - 22 + i * 2, w - 12 - i * 2, 2, C.contorno2);
      // luz do topo: acesa quando a Oráculo fala ou ouve
      const viva = X.voz === "falando" || X.voz === "ouvindo";
      px(x + w / 2 - 1, y - 26, 2, 3, viva ? C.ciano : "#2a3346");
      if (viva && !leve) { g.fillStyle = "rgba(56,214,255,0.18)"; g.beginPath(); g.arc(x + w / 2, y - 25, 7 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2); g.fill(); }
      // o relógio: o ponteiro mostra o quanto do limite foi
      const cx = x + w / 2, cy = y + 16, r = 9;
      g.fillStyle = "#e9e1c8"; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#07070b"; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillRect(Math.round(cx + Math.sin(a) * (r - 2)), Math.round(cy - Math.cos(a) * (r - 2)), 1, 1); }
      const pct = (X.uso && X.uso.pct != null) ? X.uso.pct / 100 : 0;
      const a = pct * Math.PI * 2;
      g.strokeStyle = pct >= 0.85 ? C.sinal : "#07070b"; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * (r - 2), cy - Math.cos(a) * (r - 2)); g.stroke();
      g.strokeStyle = "#07070b"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(t * 0.05) * 4, cy - Math.cos(t * 0.05) * 4); g.stroke();
      // janelas da torre
      for (let yy = y + 32; yy < RUA - 6; yy += 10) px(x + w / 2 - 1, yy, 2, 3, viva ? "rgba(56,214,255,0.55)" : "rgba(42,51,70,0.9)");
    }
    function telhadoDelegacia() {
      // o telhado em primeiro plano, da esquerda até a rua
      px(0, 196, 150, BH - 196, "#0b0d13");
      px(0, 194, 150, 2, C.contorno2);
      px(150, RUA, BW - 150, BH - RUA, "#0b0d13");
      px(150, RUA, BW - 150, 1, C.contorno2);
      // caixa d'água e porta da escada
      px(10, 168, 18, 26, C.contorno); px(12, 162, 14, 6, C.contorno2); px(13, 194 - 2, 2, 2, C.contorno2);
      px(84, 176, 22, 18, C.contorno); px(90, 182, 6, 12, "#0b0d13"); px(92, 186, 2, 1, "rgba(243,226,184,0.35)");
    }
    const HOLO = {x: 60, y: 168};
    function holofote(dt) {
      sinal = parado ? sinalAlvo : lerp(sinal, sinalAlvo, 1 - Math.exp(-dt * 2.5));
      const {x, y} = HOLO, ESC = 1.7;
      const ang = -0.42 - (1 - sinal) * 0.5;
      const lx = x + Math.cos(ang) * 11 * ESC, ly = y + Math.sin(ang) * 11 * ESC;     // a lente, de onde sai o facho
      // o facho e o sinal no céu
      if (sinal > 0.02) {
        const sx = 300, sy = 56, rx = 40, ry = 22;
        g.globalAlpha = 0.16 * sinal;
        g.fillStyle = C.sinal;
        g.beginPath(); g.moveTo(lx - 3, ly + 3); g.lineTo(sx + 8, sy + 18); g.lineTo(sx - 8, sy - 18); g.lineTo(lx + 3, ly - 3); g.closePath(); g.fill();
        g.globalAlpha = 0.85 * sinal;
        g.beginPath(); g.ellipse(sx, sy, rx, ry, -0.12, 0, Math.PI * 2); g.fill();
        g.globalAlpha = sinal;
        // morcego de silhueta, desenho nosso (bicho, não emblema)
        g.fillStyle = "#07070b";
        g.beginPath();
        g.moveTo(sx - 26, sy - 2); g.quadraticCurveTo(sx - 16, sy - 12, sx - 6, sy - 6); g.lineTo(sx - 3, sy - 11); g.lineTo(sx - 1, sy - 6);
        g.lineTo(sx + 1, sy - 6); g.lineTo(sx + 3, sy - 11); g.lineTo(sx + 6, sy - 6); g.quadraticCurveTo(sx + 16, sy - 12, sx + 26, sy - 2);
        g.quadraticCurveTo(sx + 18, sy, sx + 16, sy + 6); g.quadraticCurveTo(sx + 10, sy + 2, sx + 6, sy + 8); g.quadraticCurveTo(sx, sy + 4, sx, sy + 12);
        g.quadraticCurveTo(sx, sy + 4, sx - 6, sy + 8); g.quadraticCurveTo(sx - 10, sy + 2, sx - 16, sy + 6); g.quadraticCurveTo(sx - 18, sy, sx - 26, sy - 2);
        g.fill();
        g.globalAlpha = 1;
      }
      // o holofote no telhado (apagado sem pendência)
      g.save(); g.translate(x, 194); g.scale(ESC, ESC); g.translate(-x, -194);
      px(x - 2, y + 6, 4, 12, C.contorno2); px(x - 8, y + 16, 16, 2, C.contorno2);
      g.restore();
      g.save(); g.translate(x, y); g.scale(ESC, ESC); g.rotate(ang);
      px(-7, -6, 16, 12, "#2a3346"); px(9, -7, 3, 14, sinal > 0.1 ? C.sinal : "#3a4358"); px(-9, -4, 2, 8, C.contorno2);
      g.restore();
    }
    function comissario(dt) {
      // de pé ao lado do holofote, de costas pra nós, olhando a cidade; respira e toma café
      const x = 134, base = 194, resp = parado ? 0 : Math.round(Math.sin(t * 1.2) * 0.6);
      g.save(); g.translate(x, base); g.scale(1.7, 1.7); g.translate(-x, -base);
      if (comi.caneca > 0) comi.caneca = Math.max(0, comi.caneca - dt);
      const olhaCeu = sinal > 0.5;
      const preto = "#030305";
      // sobretudo
      g.fillStyle = preto;
      g.beginPath(); g.moveTo(x - 6, base - 22 + resp); g.lineTo(x + 6, base - 22 + resp); g.lineTo(x + 9, base); g.lineTo(x - 9, base); g.closePath(); g.fill();
      // ombros e cabeça (vira pro céu quando o sinal acende)
      px(x - 7, base - 24 + resp, 14, 4, preto);
      px(x - 3, base - 31 + resp - (olhaCeu ? 1 : 0), 6, 7, preto);
      px(x - 3, base - 26 + resp, 6, 2, "#2a3346");               // gola
      // óculos brilhando (de perfil, virado pra cidade)
      px(x + 2, base - 28 + resp - (olhaCeu ? 1 : 0), 2, 1, olhaCeu ? C.sinal : "rgba(201,211,230,0.8)");
      // braço com a caneca: levanta quando um trabalho fecha
      const sobe = comi.caneca > 0 ? Math.min(1, comi.caneca) : (Math.sin(t * 0.25) > 0.97 ? 0.6 : 0);
      px(x + 5, base - 20 + resp - sobe * 6, 3, 8, preto);
      px(x + 7, base - 21 + resp - sobe * 7, 3, 3, "#d8d0bc");
      if (!leve && !parado && sobe > 0.3) px(x + 8, base - 25 - sobe * 7, 1, 2, "rgba(201,211,230,0.4)");
      // pernas
      px(x - 5, base - 2, 3, 2, preto); px(x + 2, base - 2, 3, 2, preto);
      g.restore();
    }
    function batman(dt) {
      // de vigia na gárgula do prédio mais atrasado; some quando o sinal acende (foi atender) e volta depois
      bat.some = parado ? (sinalAlvo ? 1 : 0) : lerp(bat.some, sinalAlvo, 1 - Math.exp(-dt * 2));
      const alvo = bat.alvo && P.get(bat.alvo);
      let ax = 300, ay = 140;
      if (alvo) { ax = alvo.x + 2; ay = RUA - alvo.h - 1; }
      const dur = 1.6, f = parado || !bat.de ? 1 : Math.min(1, (t - bat.t0) / dur);
      if (f < 1) {
        const e = ease(f);
        bat.x = lerp(bat.de.x, ax, e); bat.y = lerp(bat.de.y, ay, e) - Math.sin(e * Math.PI) * 18;
      } else { bat.x = ax; bat.y = ay; bat.de = null; }
      if (bat.some > 0.95 || !alvo) return;
      const a = 1 - bat.some, x = Math.round(bat.x), y = Math.round(bat.y), preto = "#020203";
      g.save(); g.translate(x, y); g.scale(1.5, 1.5); g.translate(-x, -y);
      g.globalAlpha = a;
      // gárgula
      if (f >= 1) { px(x - 3, y, 8, 3, C.contorno2); px(x - 4, y - 1, 2, 2, C.contorno2); }
      const planando = f < 1;
      // capa (mexe no vento) e corpo
      const vento = parado || leve ? 0 : Math.sin(t * 3) * 1.5;
      g.fillStyle = preto;
      g.beginPath();
      if (planando) { g.moveTo(x - 10, y - 4); g.lineTo(x, y - 9); g.lineTo(x + 10, y - 4); g.lineTo(x + 4, y - 2); g.lineTo(x, y - 4); g.lineTo(x - 4, y - 2); }
      else { g.moveTo(x - 1, y - 11); g.lineTo(x + 3, y - 11); g.lineTo(x + 5 + vento, y - 1); g.lineTo(x - 4 + vento * 0.6, y - 1); }
      g.closePath(); g.fill();
      if (!planando) {
        px(x - 1, y - 14, 4, 4, preto);            // cabeça
        px(x - 1, y - 16, 1, 2, preto); px(x + 2, y - 16, 1, 2, preto);   // orelhas
        px(x, y - 3, 1, 3, preto); px(x + 2, y - 3, 1, 3, preto);
      }
      g.globalAlpha = 1;
      g.restore();
    }
    function tempo(dt) {
      // chuva só com motivo (memória apertando); raio só com o PC sem sinal
      const mem = X.clima && X.clima.memPct;
      if (mem >= 88 || (X.clima && X.clima.caiu)) {
        g.fillStyle = "rgba(201,211,230,0.28)";
        for (const c of CHUVA) {
          if (!parado && !leve) { c.y += c.v * dt; c.x -= c.v * dt * 0.15; if (c.y > BH) { c.y = -4; c.x = Math.random() * BW; } }
          g.fillRect(Math.round(c.x), Math.round(c.y), 1, 3);
        }
      }
      if (X.clima && X.clima.caiu && !parado && !leve) {
        if (t - ultimoRaio > 7 + Math.random() * 5) { raio = 0.35; ultimoRaio = t; }
        if (raio > 0) { g.fillStyle = `rgba(220,230,255,${raio * 0.5})`; g.fillRect(0, 0, BW, RUA); raio -= dt; }
      }
    }

    let antes = 0, raf = 0, ligado = true;
    // modo leve sozinho: conta os quadros entre 4 e 7 s depois de ligar (a largada não entra); abaixo de 24, liga
    let med0 = 0, medN = 0, medAnt = 0, medLongo = 0, medFeito = op.leve === false || parado;
    function quadro(ag) {
      raf = ligado && !parado ? requestAnimationFrame(quadro) : 0;
      if (!medFeito) {
        if (!med0) med0 = ag;
        const dtm = ag - med0;
        if (dtm > 4000) { medN++; if (medAnt && ag - medAnt > 50) medLongo++; }
        medAnt = ag;
        if (dtm > 7000) { medFeito = true; fpsMedido = Math.round(medN / 3); el.dataset.fps = fpsMedido; el.dataset.longos = medLongo;
          if ((fpsMedido < 24 || medLongo > medN * 0.015) && !leve) { leve = true; el.classList.add("leve"); } }      // média baixa ou mais de 5% de tranco
      }
      const limite = leve ? 125 : 33;
      if (antes && ag - antes < limite) return;
      const dt = antes ? Math.min(0.2, (ag - antes) / 1000) : 0.033;
      antes = ag; t += dt;
      desenhar(dt);
      relogio();
    }
    function desenhar(dt) {
      ceu(); nuvens(dt); dirigivel(); cidadeLonge(); holofote(dt);
      for (const p of [...P.values()].sort((a, b) => a.alvoX - b.alvoX)) predio(p, dt);
      torreDesenho(); batman(dt); telhadoDelegacia(); comissario(dt); tempo(dt);
    }
    function relogio() {
      const d = new Date();
      const s = hhmm(d);
      if (relo.firstChild.textContent !== s) {
        relo.firstChild.textContent = s;
        relo.children[1].textContent = d.toLocaleDateString("pt-BR", {weekday: "short", day: "2-digit", month: "2-digit"}).replace(".", "");
      }
    }


    const ro = "ResizeObserver" in window ? new ResizeObserver(() => medir()) : null;
    if (ro) ro.observe(raiz); else addEventListener("resize", medir);
    medir();
    if (parado) { t = 40; for (let i = 0; i < 3; i++) desenhar(1); relogio(); }
    else raf = requestAnimationFrame(quadro);

    return {
      dados(sala, extra) { dados(sala, extra); if (parado) { for (let i = 0; i < 3; i++) desenhar(1); relogio(); } },
      ligar() { if (!ligado) { ligado = true; antes = 0; if (!parado) raf = requestAnimationFrame(quadro); } },
      parar() { ligado = false; cancelAnimationFrame(raf); raf = 0; },
      get fps() { return fpsMedido; }
    };
  }
  window.OraculoCena = {montar};
})();
