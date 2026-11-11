/* Olho de Deus: o desenhista do globo (09/11/2026; Jarvis 360, frente 1, 10/11/2026).
   Um desenhista só, em Canvas 2D, pros três aparelhos: PC, celular e TV. Sem WebGL de propósito: o PC vive com pouca
   memória e a TV (Tizen) fez só 20 quadros/s com WebGL na sonda de 09/11. Esfera em projeção ortográfica.
   Três níveis: mundo, país, cidade. O voo é contínuo (afasta, anda e chega, como câmera de cinema), o país escolhido
   acende com a fronteira de Natural Earth 1:50m, e na cidade entra o mapa escuro de ruas (CARTO, dado do
   OpenStreetMap) que o servidor do PC busca e guarda. Mede os próprios quadros por segundo e avisa abaixo de 24.

   uso: const o = Olho.criar(canvas, {paises: "paises-110m.json", paises50: "paises-50m.json", tiles: "../olho/tile/",
                                      auto: true, fps: 30, tv: false, livre: () => ({x, y, w, h})});
        o.dados(json); o.camada("queimadas", false); o.voar(lat, lon, zoom); o.destacar(numIso); o.cameras(lista);
        o.aoEscolher(fn); o.aoPais(fn); o.medida() -> {fps, leve}; o.leve(true); o.parar(); o.ligar(); */
(function () {
  "use strict";
  const RAD = Math.PI / 180, RT = 6371, MU = 398600.4418, J2 = 1.08263e-3, RE = 6378.137;
  const ZMIN = 0.6, ZMAX = 600;
  const CAMADAS = [
    { id: "terremotos", nome: "Terremotos 24 h", grupo: "Eventos" },
    { id: "queimadas", nome: "Queimadas 3 h", grupo: "Eventos" },
    { id: "eventos", nome: "Ciclones e vulcões", grupo: "Eventos" },
    { id: "satelites", nome: "Satélites e a ISS", grupo: "Espaço" },
    { id: "lancamentos", nome: "Próximos lançamentos", grupo: "Espaço" },
    { id: "avioes", nome: "Aviões sobre o Brasil", grupo: "Movimento" },
    { id: "cameras", nome: "Câmeras ao vivo", grupo: "Movimento" },
  ];
  /* Oráculo (JARVIS/IDENTIDADE.md, 10/11): o Olho é a sala de monitores dela. Preto de tinta, o mundo desenhado pela
     luz: a costa no ciano da Oráculo, o país escolhido acende em giz com um véu de janela acesa (osso). O amarelo do
     holofote é só do sinal da Central e o roxo com verde é só de erro: nenhuma camada usa essas cores. Cada camada se
     separa pela FORMA (anel, quadrado, espiral, cruz, alfinete, traço, moldura) e por pouca cor. */
  const COR = { linha: "#38d6ff", fronteira: "rgba(56,214,255,.22)", mar: "#0d111c", mar2: "#141a2a", borda: "rgba(56,214,255,.45)",
    grade: "rgba(154,166,189,.08)", destaque: "#eef2f8", destaqueFundo: "rgba(243,226,184,.07)",
    fogo: "#d99a3a", sat: "#c9d3e6", iss: "#eef2f8", foguete: "#38d6ff", aviao: "#9aa6bd", ciclone: "#eef2f8", camera: "#38d6ff",
    texto: "#eef2f8", fraco: "#9aa6bd", noite: "#07070b" };
  /* magnitude pela luz: quanto mais forte, mais acesa a janela (do apagado ao osso cheio); 6 ou mais ainda pulsa */
  const corMag = (m) => (m >= 6 ? "#fff4d6" : m >= 5 ? "#f3e2b8" : m >= 4 ? "#bfb08c" : "#857c68");

  /* ---- TopoJSON: arcos em vetores prontos (sen e cos de lat e lon) e países como anéis de índices de arco ---- */
  function decodificar(t) {
    const [sx, sy] = t.transform.scale, [tx, ty] = t.transform.translate;
    const costa = new Set();
    const pega = (a) => { if (typeof a === "number") costa.add(a < 0 ? ~a : a); else a.forEach(pega); };
    const anda = (g) => { if (!g) return; if (g.type === "GeometryCollection") return g.geometries.forEach(anda); pega(g.arcs || []); };
    if (t.objects.land) anda(t.objects.land);
    const arcos = t.arcs.map((arco, i) => {
      const n = arco.length, sl = new Float32Array(n), cl = new Float32Array(n), sp = new Float32Array(n), cp = new Float32Array(n),
        lo = new Float32Array(n), la = new Float32Array(n);
      let x = 0, y = 0, vx = 0, vy = 0, vz = 0;
      for (let k = 0; k < n; k++) {
        x += arco[k][0]; y += arco[k][1];
        const lon = x * sx + tx, lat = y * sy + ty; lo[k] = lon; la[k] = lat;
        sl[k] = Math.sin(lon * RAD); cl[k] = Math.cos(lon * RAD); sp[k] = Math.sin(lat * RAD); cp[k] = Math.cos(lat * RAD);
        vx += cp[k] * cl[k]; vy += cp[k] * sl[k]; vz += sp[k];
      }
      /* calota que contém o arco: centro e raio angular, pra pular o arco que está fora da tela sem projetar ponto nenhum */
      const m = Math.hypot(vx, vy, vz) || 1; vx /= m; vy /= m; vz /= m;
      let cmin = 1; for (let k = 0; k < n; k++) cmin = Math.min(cmin, vx * cp[k] * cl[k] + vy * cp[k] * sl[k] + vz * sp[k]);
      return { n, sl, cl, sp, cp, lo, la, costa: costa.has(i) || !t.objects.land, vx, vy, vz, raio: Math.acos(Math.max(-1, Math.min(1, cmin))) };
    });
    const paises = {};
    for (const g of (t.objects.countries ? t.objects.countries.geometries : [])) {
      const id = String(g.id || ""); if (!id) continue;
      const polis = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : [];
      paises[id] = { nome: (g.properties || {}).name, polis };
    }
    return { arcos, paises };
  }
  function anelPontos(mapa, anel) {          /* anel de índices -> [lon, lat] corridos, pro teste de "dentro" */
    const out = [];
    for (const i of anel) { const a = mapa.arcos[i < 0 ? ~i : i]; if (i >= 0) for (let k = 0; k < a.n; k++) out.push(a.lo[k], a.la[k]); else for (let k = a.n - 1; k >= 0; k--) out.push(a.lo[k], a.la[k]); }
    return out;
  }
  function dentroAnel(pts, x, y) {
    let d = false;
    for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
      const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi) d = !d;
    }
    return d;
  }

  /* posição de um satélite agora (Kepler com a deriva J2 do nó e do perigeu): lat, lon em graus e altitude em km */
  function satAgora(s, tSeg) {
    const n = s.n * 2 * Math.PI / 86400, a = Math.cbrt(MU / (n * n)), e = s.e || 0, i = s.i * RAD, dt = tSeg - s.epoca;
    const p = a * (1 - e * e), k = 1.5 * J2 * (RE / p) * (RE / p) * n;
    const raan = s.raan * RAD - k * Math.cos(i) * dt, argp = s.argp * RAD + 0.5 * k * (5 * Math.cos(i) * Math.cos(i) - 1) * dt;
    const M = s.ma * RAD + n * dt;
    let E = M; for (let j = 0; j < 5; j++) E = M + e * Math.sin(E);
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)), r = a * (1 - e * Math.cos(E)), u = argp + nu;
    const x = r * (Math.cos(raan) * Math.cos(u) - Math.sin(raan) * Math.sin(u) * Math.cos(i));
    const y = r * (Math.sin(raan) * Math.cos(u) + Math.cos(raan) * Math.sin(u) * Math.cos(i));
    const z = r * Math.sin(u) * Math.sin(i);
    const jd = tSeg / 86400 + 2440587.5, gmst = ((280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360) * RAD;
    let lon = Math.atan2(y, x) - gmst; lon = ((lon + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    return { lat: Math.asin(z / r) / RAD, lon: lon / RAD, alt: r - RT };
  }
  const vetor = (lat, lon) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
  const curva = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);      /* sai devagar, chega devagar */

  function criar(canvas, op) {
    op = Object.assign({ auto: true, fps: 30, tv: false, paises: "paises-110m.json", paises50: null, tiles: null, parado: false }, op || {});
    const ctx = canvas.getContext("2d");
    let mapa = null, mapa50 = null, carregando50 = false, D = {}, CAMS = [], ligadas = {}, lat0 = -14, lon0 = -52, zoom = 1, W = 0, H = 0, dpr = 1, R = 100, cx = 0, cy = 0;
    let rodando = false, ultimo = 0, mexeuEm = 0, escolher = null, aoPais = null, aoNivel = null, pontos = [], sats = [], satsEm = 0, voo = null, escolhido = null, erroPaises = "";
    let destaque = null, destaqueAneis = null, destaqueMapa = null, leve = !!op.leve, nivelAntes = "";
    const medida = { quadros: [], fps: 0, desenho: 0 };
    CAMADAS.forEach((c) => { ligadas[c.id] = true; });
    const agora = () => (op.agora ? op.agora() : Date.now());

    const carregar = (url) => (typeof url === "string" ? fetch(url).then((r) => { if (!r.ok) throw new Error("mapa " + r.status); return r.json(); }) : Promise.resolve(url));
    carregar(op.paises).then((t) => { mapa = decodificar(t); refazDestaque(); }).catch(() => { erroPaises = "O contorno dos países não carregou. Os pontos aparecem mesmo assim."; });
    function pedir50() {
      if (mapa50 || carregando50 || !op.paises50) return;
      carregando50 = true;
      carregar(op.paises50).then((t) => { mapa50 = decodificar(t); refazDestaque(); }).catch(() => { carregando50 = false; });
    }
    function refazDestaque() {
      const m = mapa50 || mapa;
      destaqueAneis = null; destaqueMapa = null;
      if (!m || !destaque || !m.paises[destaque]) return;
      /* 10/11: os índices do anel só valem no mapa de onde vieram (o 1:50m e o 1:110m numeram os arcos diferente) */
      destaqueAneis = m.paises[destaque].polis.map((p) => p.map((anel) => anel)); destaqueMapa = m;
    }

    function medir() {
      const b = canvas.getBoundingClientRect();
      dpr = op.tv || leve ? 1 : Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(50, Math.round(b.width * dpr)), h = Math.max(50, Math.round(b.height * dpr));
      if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
      W = w; H = h;
      /* o globo se centra no espaço livre (fora do painel e da ficha), que a página informa em px de tela */
      const L = op.livre ? op.livre() : null;
      if (L && L.w > 50 && L.h > 50) { cx = (L.x + L.w / 2) * dpr; cy = (L.y + L.h / 2) * dpr; R = Math.min(L.w, L.h) * dpr * 0.42 * zoom; }
      else { cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.42 * zoom; }
    }
    let s0 = 0, c0 = 1, sl0 = 0, cl0 = 1;
    function proj(lat, lon, alt) {
      const f = lat * RAD, l = lon * RAD, sp = Math.sin(f), cp = Math.cos(f), dl = l - lon0 * RAD, sd = Math.sin(dl), cd = Math.cos(dl);
      const k = alt ? 1 + Math.min(0.62, alt / RT) : 1;
      const x = cp * sd * k, y = (c0 * sp - s0 * cp * cd) * k, z = (s0 * sp + c0 * cp * cd) * k;
      return { x: cx + R * x, y: cy - R * y, z, fora: x * x + y * y > 1 };
    }
    function inverso(px, py) {          /* tela -> lat, lon (ou null fora do globo) */
      const x = (px - cx) / R, y = (cy - py) / R, r2 = x * x + y * y;
      if (r2 > 1) return null;
      const z = Math.sqrt(1 - r2);
      const sp = y * c0 + z * s0, lat = Math.asin(Math.max(-1, Math.min(1, sp))) / RAD;
      const lon = lon0 + Math.atan2(x, z * c0 - y * s0) / RAD;
      return { lat, lon: ((lon + 540) % 360) - 180 };
    }
    /* quanto do globo cabe na tela agora: o raio angular da vista, pra pular arco e ponto que estão fora */
    function vista() {
      const meia = Math.hypot(W, H) / 2 / R;
      return meia >= 1 ? Math.PI / 2 : Math.asin(meia);
    }
    function desenharArcos(m) {
      if (!m) return;
      const v = vista(), cv = vetor(lat0, lon0), lim = v + 0.02;
      for (let passe = 0; passe < 2; passe++) {
        ctx.beginPath();
        for (const a of m.arcos) {
          if (a.costa !== (passe === 1)) continue;
          if (Math.acos(Math.max(-1, Math.min(1, a.vx * cv[0] + a.vy * cv[1] + a.vz * cv[2]))) - a.raio > lim) continue;
          let pena = false;
          for (let k = 0; k < a.n; k++) {
            const sd = a.sl[k] * cl0 - a.cl[k] * sl0, cd = a.cl[k] * cl0 + a.sl[k] * sl0;
            const z = s0 * a.sp[k] + c0 * a.cp[k] * cd;
            if (z <= 0) { pena = false; continue; }
            const X = cx + R * a.cp[k] * sd, Y = cy - R * (c0 * a.sp[k] - s0 * a.cp[k] * cd);
            if (X < -W || X > 2 * W || Y < -H || Y > 2 * H) { pena = false; continue; }      /* traço longe da tela custa e não aparece */
            if (pena) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pena = true; }
          }
        }
        const fino = zoom > 40 ? 1.6 : 1;
        ctx.strokeStyle = passe ? COR.linha : COR.fronteira; ctx.lineWidth = (passe ? 1.3 : 0.8) * fino * dpr * (op.tv ? 1.6 : 1); ctx.stroke();
      }
    }
    function caminhoAneis(m, polis) {      /* o país escolhido como caminho fechado; devolve se ele está inteiro do lado de cá */
      ctx.beginPath(); let inteiro = true;
      for (const p of polis) for (const anel of p) {
        let pena = false;
        for (const i of anel) {
          const a = m.arcos[i < 0 ? ~i : i], ini = i < 0 ? a.n - 1 : 0, fim = i < 0 ? -1 : a.n, passo = i < 0 ? -1 : 1;
          for (let k = ini; k !== fim; k += passo) {
            const sd = a.sl[k] * cl0 - a.cl[k] * sl0, cd = a.cl[k] * cl0 + a.sl[k] * sl0, z = s0 * a.sp[k] + c0 * a.cp[k] * cd;
            if (z <= 0) { pena = false; inteiro = false; continue; }
            const X = cx + R * a.cp[k] * sd, Y = cy - R * (c0 * a.sp[k] - s0 * a.cp[k] * cd);
            if (X < -W || X > 2 * W || Y < -H || Y > 2 * H) { pena = false; inteiro = false; continue; }
            if (pena) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pena = true; }
          }
        }
      }
      return inteiro;
    }
    function grade() {
      if (zoom > 12 || leve) return;
      ctx.beginPath();
      for (let lon = -180; lon < 180; lon += 30) { let pena = false; for (let lat = -90; lat <= 90; lat += 6) { const p = proj(lat, lon); if (p.z <= 0) { pena = false; continue; } if (pena) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); pena = true; } } }
      for (let lat = -60; lat <= 60; lat += 30) { let pena = false; for (let lon = -180; lon <= 180; lon += 6) { const p = proj(lat, lon); if (p.z <= 0) { pena = false; continue; } if (pena) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); pena = true; } } }
      ctx.strokeStyle = COR.grade; ctx.lineWidth = dpr; ctx.stroke();
    }

    /* ---- o mapa da cidade: quadrinhos de 256 px em Mercator, encaixados no globo por três cantos (na escala da
       cidade a esfera é plana o bastante; a fronteira vetorial por cima confirma o encaixe) ---- */
    const imgs = new Map();
    function quadrinho(z, x, y) {
      const k = z + "/" + x + "/" + y; let e = imgs.get(k);
      if (!e) {
        e = { img: new Image(), ok: false, em: 0 };
        e.img.onload = () => { e.ok = true; }; e.img.onerror = () => { imgs.delete(k); };      /* falhou: some do cache e pede de novo no próximo quadro parado */
        e.img.src = op.tiles + k + ".png"; imgs.set(k, e);
        if (imgs.size > 260) { for (const [kk, v] of imgs) { if (imgs.size <= 200) break; if (Date.now() - v.em > 4000) imgs.delete(kk); } }
      }
      e.em = Date.now(); return e;
    }
    const lonDe = (x, z) => x / Math.pow(2, z) * 360 - 180;
    const latDe = (y, z) => { const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z); return Math.atan(Math.sinh(n)) / RAD; };
    function desenharRuas() {
      if (!op.tiles || zoom < 60) return 0;
      /* 10/11 (leitura do dono): o mapa no máximo pela metade sobre o preto; a 100% a rua tomava a tela e o nome
         dos bairros brigava com tudo. 85% preto, como manda a identidade */
      const a = Math.min(0.6, (zoom - 60) / 100);
      const z = Math.max(3, Math.min(16, Math.floor(Math.log2(R * 2 * Math.PI * Math.cos(lat0 * RAD) / 256 / dpr) + (op.tv ? 0.6 : 1))));
      const n = Math.pow(2, z);
      /* que quadrinhos cobrem a tela: os cantos da tela de volta pra lat e lon */
      let la0 = 90, la1 = -90, lo0 = 999, lo1 = -999;
      for (const [px, py] of [[0, 0], [W, 0], [0, H], [W, H], [cx, 0], [cx, H], [0, cy], [W, cy]]) {
        const g = inverso(px, py); if (!g) continue;
        la0 = Math.min(la0, g.lat); la1 = Math.max(la1, g.lat);
        let lo = g.lon; if (lo - lon0 > 180) lo -= 360; if (lon0 - lo > 180) lo += 360; lo0 = Math.min(lo0, lo); lo1 = Math.max(lo1, lo);
      }
      medida.ruas = { z, la0, la1, lo0, lo1 };
      if (lo0 > lo1) return 0;
      const xa = Math.floor((lo0 + 180) / 360 * n), xb = Math.floor((lo1 + 180) / 360 * n);
      const ty = (lat) => { const s = Math.sin(Math.max(-85, Math.min(85, lat)) * RAD); return Math.floor((0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n); };
      const ya = Math.max(0, ty(la1)), yb = Math.min(n - 1, ty(la0));
      medida.ruas.n = (xb - xa + 1) * (yb - ya + 1);
      if ((xb - xa + 1) * (yb - ya + 1) > 160) return 0;           /* nunca pede mapa demais de uma vez (10/11: um nível a mais de detalhe, o nome da rua sai nítido) */
      ctx.save(); ctx.globalAlpha = a;
      let feitos = 0;
      for (let x = xa; x <= xb; x++) for (let y = ya; y <= yb; y++) {
        const xx = ((x % n) + n) % n, k = z + "/" + xx + "/" + y;
        /* durante o voo só desenha o que já chegou: pedir quadrinho de passagem entope a fila e atrasa o da chegada */
        const e = voo ? imgs.get(k) : quadrinho(z, xx, y);
        if (!e || !e.ok) continue;
        const p0 = proj(latDe(y, z), lonDe(x, z)), p1 = proj(latDe(y, z), lonDe(x + 1, z)), p2 = proj(latDe(y + 1, z), lonDe(x, z));
        if (p0.z <= 0) continue;
        ctx.setTransform((p1.x - p0.x) / 256, (p1.y - p0.y) / 256, (p2.x - p0.x) / 256, (p2.y - p0.y) / 256, p0.x, p0.y);
        ctx.drawImage(e.img, 0, 0, 256.6, 256.6); feitos++;          /* 0,6 px a mais cobre a costura entre quadrinhos */
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.restore();
      if (feitos) {          /* 10/11: tira o marrom do mapa recolorido (a rua vira fio de luz neutro) sem mexer no preto do chão */
        ctx.save(); ctx.globalCompositeOperation = "saturation"; ctx.globalAlpha = 0.8; ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
      return feitos;
    }

    const u = () => dpr * (op.tv ? 1.8 : 1);      /* unidade de traço: a TV se vê de longe */
    function marca(p, camada, item, raio) { pontos.push({ x: p.x, y: p.y, r: raio, camada, item }); }
    function desenhar(t) {
      medir();
      s0 = Math.sin(lat0 * RAD); c0 = Math.cos(lat0 * RAD); sl0 = Math.sin(lon0 * RAD); cl0 = Math.cos(lon0 * RAD);
      ctx.clearRect(0, 0, W, H);
      pontos = [];
      const m = (zoom > 2.4 && mapa50) ? mapa50 : mapa;
      if (zoom > 2.4) pedir50();
      /* o mar: no modo leve, cor chapada */
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7);
      if (leve || R > Math.min(W, H) * 0.7) ctx.fillStyle = COR.mar;      /* degradê só com o globo inteiro na tela */
      else { const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R); g.addColorStop(0, COR.mar2); g.addColorStop(1, COR.mar); ctx.fillStyle = g; }
      ctx.fill();
      if (R < 20000) { ctx.strokeStyle = COR.borda; ctx.lineWidth = 1.5 * u(); ctx.stroke(); }
      ctx.save(); if (R < 20000) { ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); }
      const T = performance.now();
      const ruas = desenharRuas();
      grade();
      const T1 = performance.now();
      if (destaqueAneis && destaqueMapa) {          /* o país escolhido: fundo leve e contorno em giz */
        const inteiro = caminhoAneis(destaqueMapa, destaqueAneis);
        if (!ruas && zoom < 20 && inteiro) { ctx.fillStyle = COR.destaqueFundo; ctx.fill("evenodd"); }      /* de perto o anel sai da tela e o preenchimento inverteria */
      }
      const T2 = performance.now();
      if (!ruas) desenharArcos(m);       /* com o mapa da cidade na tela, a costa de 1:50m só atrapalharia */
      const T3 = performance.now();
      if (destaqueAneis && destaqueMapa && !ruas) { caminhoAneis(destaqueMapa, destaqueAneis); ctx.strokeStyle = COR.destaque; ctx.lineWidth = 2.2 * u(); ctx.stroke(); }
      const T4 = performance.now();
      const seg = agora() / 1000, pulso = (t / 1400) % 1, calmo = op.parado || leve;
      if (ligadas.queimadas && D.queimadas) {
        ctx.fillStyle = COR.fogo; ctx.globalAlpha = 0.85; const r = 1.4 * u() * (zoom > 20 ? 2 : 1), passo = leve && zoom < 3 ? 3 : 1;
        ctx.beginPath();          /* um caminho só pra todos os focos: um preenchimento por quadro, não 1500 */
        for (let i = 0; i < D.queimadas.length; i += passo) { const q = D.queimadas[i], p = proj(q.lat, q.lon); if (p.z > 0 && p.x > -9 && p.y > -9 && p.x < W + 9 && p.y < H + 9) ctx.rect(p.x - r, p.y - r, 2 * r, 2 * r); }
        ctx.fill(); ctx.globalAlpha = 1;
      }
      if (ligadas.avioes && D.avioes) {
        ctx.strokeStyle = COR.aviao; ctx.lineWidth = 1.4 * u(); ctx.beginPath();
        for (const a of D.avioes) {
          const p = proj(a.lat, a.lon); if (p.z <= 0) continue;
          const dx = Math.sin((a.rumo || 0) * RAD), dy = -Math.cos((a.rumo || 0) * RAD), k = 5 * u();
          ctx.moveTo(p.x - dx * k, p.y - dy * k); ctx.lineTo(p.x + dx * k, p.y + dy * k); marca(p, "avioes", a, 8 * u());
        }
        ctx.stroke();
      }
      if (ligadas.terremotos && D.terremotos) {
        ctx.lineWidth = 1.6 * u();
        for (const faixa of [3, 4, 5, 6]) {          /* um traço por cor de magnitude */
          const cor = corMag(faixa); ctx.strokeStyle = cor; ctx.beginPath(); const fortes = [];
          for (const e of D.terremotos) {
            const m = e.mag >= 6 ? 6 : e.mag >= 5 ? 5 : e.mag >= 4 ? 4 : 3; if (m !== faixa) continue;
            const p = proj(e.lat, e.lon); if (p.z <= 0) continue;
            const r = (2 + Math.max(0, e.mag - 2.5) * 2.1) * u();
            ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 6.2832);
            if (e.mag >= 5 && !calmo) fortes.push([p, r]);
            marca(p, "terremotos", e, r + 5 * u());
          }
          ctx.stroke();
          if (fortes.length) { ctx.globalAlpha = 1 - pulso; ctx.beginPath(); for (const [p, r] of fortes) { const rr = r + pulso * 12 * u(); ctx.moveTo(p.x + rr, p.y); ctx.arc(p.x, p.y, rr, 0, 6.2832); } ctx.stroke(); ctx.globalAlpha = 1; }
        }
      }
      if (ligadas.eventos && D.eventos) {
        for (const e of D.eventos) {
          const p = proj(e.lat, e.lon); if (p.z <= 0) continue;
          const r = 6 * u();
          ctx.strokeStyle = COR.ciclone; ctx.fillStyle = COR.ciclone; ctx.lineWidth = 1.8 * u(); ctx.beginPath();
          if (e.tipo === "vulcao" || e.tipo === "incendio") { ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y + r * 0.8); ctx.lineTo(p.x - r, p.y + r * 0.8); ctx.closePath(); ctx.stroke(); }
          else { const a0 = calmo ? 0.6 : (t / 900) % 7; ctx.arc(p.x, p.y, r, a0, a0 + 2.2); ctx.stroke(); ctx.beginPath(); ctx.arc(p.x, p.y, r, a0 + 3.14, a0 + 5.34); ctx.stroke(); ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * u(), 0, 7); ctx.fill(); }
          marca(p, "eventos", e, r + 5 * u());
        }
      }
      if (ligadas.lancamentos && D.lancamentos) {
        for (const l of D.lancamentos) {
          const p = proj(l.lat, l.lon); if (p.z <= 0) continue;
          ctx.strokeStyle = COR.foguete; ctx.fillStyle = COR.foguete; ctx.lineWidth = 1.6 * u();
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 14 * u()); ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y - 14 * u(), 3 * u(), 0, 7); ctx.fill();
          marca({ x: p.x, y: p.y - 8 * u() }, "lancamentos", l, 12 * u());
        }
      }
      if (ligadas.cameras && CAMS.length) {          /* câmera: quadrado vazado ciano com a lente no meio */
        ctx.strokeStyle = COR.camera; ctx.fillStyle = COR.camera; ctx.lineWidth = 2 * u();
        const r = (zoom > 20 ? 7 : 4.5) * u();
        /* 10/11 (leitura do dono): seis câmeras de Londres viravam um nó de quadrados. Quem se encosta na tela vira um
           quadrado só, com o número dentro */
        const grupos = [];
        for (const c of CAMS) {
          if (c.lat == null) continue;
          const p = proj(c.lat, c.lon); if (p.z <= 0) continue;
          const g = grupos.find((q) => Math.abs(q.p.x - p.x) < 2.6 * r && Math.abs(q.p.y - p.y) < 2.6 * r);
          if (g) g.cams.push(c); else grupos.push({ p, cams: [c] });
        }
        for (const { p, cams } of grupos) {
          if (cams.length === 1) { ctx.strokeRect(p.x - r, p.y - r, 2 * r, 2 * r); ctx.fillRect(p.x - r * 0.35, p.y - r * 0.35, r * 0.7, r * 0.7); }
          else {
            const rr = r * 1.7; ctx.fillStyle = "rgba(7,7,11,.85)"; ctx.fillRect(p.x - rr, p.y - rr, 2 * rr, 2 * rr);
            ctx.strokeRect(p.x - rr, p.y - rr, 2 * rr, 2 * rr); ctx.fillStyle = COR.camera;
            ctx.font = `700 ${Math.round(rr * 1.1)}px Archivo, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(String(cams.length), p.x, p.y + rr * 0.05); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
          }
          for (const c of cams) marca(p, "cameras", c, r * (cams.length > 1 ? 1.7 : 1) + 6 * u());
        }
      }
      ctx.restore();
      if (ligadas.satelites && D.satelites && zoom < 30) {
        if (Math.abs(seg - satsEm) > (op.tv || leve ? 2 : 1)) { satsEm = seg; sats = D.satelites.map((s) => Object.assign({ s }, satAgora(s, seg))); }
        ctx.fillStyle = COR.sat; ctx.strokeStyle = COR.sat; ctx.lineWidth = 1.2 * u();
        const frente = new Path2D(), atras = new Path2D(), iss = [];
        for (const o of sats) {
          const p = proj(o.lat, o.lon, o.alt);
          if (p.z <= 0 && !p.fora) continue;
          if (p.x < -50 || p.y < -50 || p.x > W + 50 || p.y > H + 50) continue;
          const r = (o.s.iss ? 3 : 2.6) * u();
          if (o.s.iss) iss.push([o, p, r]);
          else { const c = p.z > 0 ? frente : atras; c.moveTo(p.x - r, p.y); c.lineTo(p.x + r, p.y); c.moveTo(p.x, p.y - r); c.lineTo(p.x, p.y + r); }
          marca(p, "satelites", Object.assign({ lat: o.lat, lon: o.lon, alt: o.alt }, o.s), (o.s.iss ? 12 : 7) * u());
        }
        ctx.stroke(frente); ctx.globalAlpha = 0.45; ctx.stroke(atras); ctx.globalAlpha = 1;
        for (const [o, p, r] of iss) {
          ctx.globalAlpha = p.z > 0 ? 1 : 0.45; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
          {
            ctx.globalAlpha = 1; ctx.strokeStyle = COR.iss; ctx.beginPath(); ctx.arc(p.x, p.y, 8 * u(), 0, 7); ctx.stroke();
            ctx.font = `600 ${Math.round(12 * u())}px Archivo, system-ui, sans-serif`; ctx.fillStyle = COR.iss; ctx.fillText("ISS", p.x + 11 * u(), p.y + 4 * u()); ctx.fillStyle = COR.sat; ctx.strokeStyle = COR.sat;
          }
        }
        ctx.globalAlpha = 1;
      }
      if (escolhido) {
        const e = escolhido.item, p = proj(e.lat, e.lon, escolhido.camada === "satelites" ? e.alt : 0);
        if (p.z > 0 || p.fora) { ctx.strokeStyle = COR.texto; ctx.lineWidth = 1.5 * u(); ctx.setLineDash([4 * u(), 4 * u()]); ctx.beginPath(); ctx.arc(p.x, p.y, 16 * u(), 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      }
      if (ruas) {          /* crédito do mapa da cidade, sempre que ele aparece (licença ODbL do OpenStreetMap) */
        const L = op.livre ? op.livre() : { x: 0, y: 0, w: W / dpr, h: H / dpr }, tx = "© colaboradores do OpenStreetMap";
        ctx.font = `${Math.round((op.tv ? 28 : 12) * dpr)}px Archivo, system-ui, sans-serif`; const lw = ctx.measureText(tx).width;
        const x = L.credito === "esquerda" ? (L.x + 16) * dpr : (L.x + L.w) * dpr - lw - 16 * dpr, y = (L.y + L.h) * dpr - (op.tv ? 20 : 10) * dpr;
        ctx.fillStyle = "rgba(7,7,11,.82)"; ctx.fillRect(x - 6 * dpr, y - (op.tv ? 30 : 13) * dpr, lw + 12 * dpr, (op.tv ? 38 : 18) * dpr);
        ctx.fillStyle = COR.fraco; ctx.fillText(tx, x, y);
      }
      if (erroPaises) { ctx.fillStyle = COR.fraco; ctx.font = `${Math.round(13 * u())}px Archivo, system-ui, sans-serif`; ctx.fillText(erroPaises, 12 * dpr, H - 12 * dpr); }
      const T5 = performance.now();
      medida.partes = { ruas_grade: +(T1 - T).toFixed(1), destaque: +(T2 - T1 + T4 - T3).toFixed(1), arcos: +(T3 - T2).toFixed(1), pontos: +(T5 - T4).toFixed(1) };
      const nv = nivel(); if (nv !== nivelAntes) { nivelAntes = nv; if (aoNivel) aoNivel(nv); }
    }
    function nivel() { return zoom < 3 ? "mundo" : zoom < 70 ? "pais" : "cidade"; }

    let volta = 0;
    function quadro(t, minha) {
      if (!rodando || minha !== volta) return;
      requestAnimationFrame((x) => quadro(x, minha));
      /* parado (sem voo, sem dedo, sem giro), o quadro cai pra 12 por segundo: o pulso do terremoto segue, a CPU da TV descansa */
      const mexendo = !!voo || Date.now() - mexeuEm < 400 || (op.auto && zoom < 3 && Date.now() - mexeuEm > 5000);
      const alvoFps = mexendo ? (leve ? Math.min(op.fps, 24) : op.fps) : 12;
      if (t - ultimo < 1000 / alvoFps - 2) return;
      const dt = Math.min(200, t - ultimo); ultimo = t;
      if (mexendo) { medida.quadros.push(t); while (medida.quadros.length && t - medida.quadros[0] > 3000) medida.quadros.shift(); }
      if (voo) {
        const k = Math.min(1, (t - voo.t0) / voo.dur), e = curva(k);
        /* a câmera anda pela esfera (slerp) e o zoom faz a curva: afasta no meio do caminho quando o salto é longo */
        const w = voo.ang < 1e-6 ? 0 : Math.sin(e * voo.ang) / Math.sin(voo.ang), w0 = voo.ang < 1e-6 ? 1 : Math.sin((1 - e) * voo.ang) / Math.sin(voo.ang);
        const v = [voo.a[0] * w0 + voo.b[0] * w, voo.a[1] * w0 + voo.b[1] * w, voo.a[2] * w0 + voo.b[2] * w], mv = Math.hypot(v[0], v[1], v[2]) || 1;
        lat0 = Math.asin(v[2] / mv) / RAD; lon0 = Math.atan2(v[1], v[0]) / RAD;
        zoom = Math.exp(Math.log(voo.z0) + (Math.log(voo.z1) - Math.log(voo.z0)) * e + voo.dip * 4 * e * (1 - e));
        if (k >= 1) { const fim = voo.fim; voo = null; lat0 = Math.max(-85, Math.min(85, lat0)); if (fim) fim(); }
      } else if (op.auto && zoom < 3 && Date.now() - mexeuEm > 5000) lon0 = ((lon0 + dt * (op.tv ? 0.0035 : 0.0022) + 540) % 360) - 180;
      const t0 = performance.now();
      try { desenhar(t); } catch (e) {
        /* um dado torto não derruba o globo. 10/11: o erro no meio do quadro pulava o ctx.restore() e o recorte do globo
           ficava preso no contexto, cortando o mapa nos quadros seguintes (visto na ronda da TV). Zerar a largura
           zera o estado inteiro do contexto em qualquer navegador, inclusive o da TV */
        medida.erro = String(e && e.message || e).slice(0, 160); canvas.width = canvas.width;
      }
      medida.desenho = medida.desenho * 0.9 + (performance.now() - t0) * 0.1;
    }
    function voar(lat, lon, z, fim) {
      z = Math.max(ZMIN, Math.min(ZMAX, z || zoom));
      lat = Math.max(-85, Math.min(85, lat));
      const a = vetor(lat0, lon0), b = vetor(lat, lon), ang = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      /* quanto afastar no meio: o suficiente pra ver a partida e a chegada juntas, nunca menos que o mundo inteiro se o salto é grande */
      const zMeio = Math.max(ZMIN, Math.min(zoom, z, 1.4 / Math.max(0.05, ang)));
      const dip = Math.min(0, Math.log(zMeio) - Math.min(Math.log(zoom), Math.log(z)));
      const dur = (op.parado ? 500 : Math.max(900, Math.min(3200, 700 + ang / RAD * 9 + Math.abs(Math.log(z / zoom)) * 260)));
      voo = { a, b, ang, z0: zoom, z1: z, dip, dur, t0: performance.now(), fim };
      mexeuEm = Date.now();
    }
    /* mexer: arrastar gira, roda do mouse e pinça dão zoom, toque escolhe ponto ou país */
    const dedos = new Map(); let pinca = 0, arrastou = false;
    const zoomPor = (f) => { zoom = Math.max(ZMIN, Math.min(ZMAX, zoom * f)); mexeuEm = Date.now(); voo = null; };
    if (!op.tv) {
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointerdown", (ev) => { try { canvas.setPointerCapture(ev.pointerId); } catch (e) {} dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); arrastou = false; mexeuEm = Date.now(); voo = null; pinca = 0; if (op.aoMexer) op.aoMexer(); });
      canvas.addEventListener("pointermove", (ev) => {
        const d = dedos.get(ev.pointerId);
        if (!d) { if (ev.pointerType === "mouse") canvas.style.cursor = perto(ev) ? "pointer" : "grab"; return; }
        const dx = ev.clientX - d.x, dy = ev.clientY - d.y; d.x = ev.clientX; d.y = ev.clientY; mexeuEm = Date.now();
        if (dedos.size === 2) {
          const [a, b] = [...dedos.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinca) zoomPor(dist / pinca); pinca = dist; arrastou = true; return;
        }
        if (Math.abs(dx) + Math.abs(dy) > 2) arrastou = true;
        /* perto do chão, um px de arrasto anda um px de mapa (a longitude encolhe com o cosseno da latitude) */
        const k = 57.3 * dpr / R, ck = zoom > 3 ? Math.max(0.2, Math.cos(lat0 * RAD)) : 1;
        lon0 = ((lon0 - dx * k / ck + 540) % 360) - 180; lat0 = Math.max(-85, Math.min(85, lat0 + dy * k));
      });
      const solta = (ev) => {
        const tinha = dedos.delete(ev.pointerId); pinca = 0;
        if (!tinha || arrastou) return;
        const p = perto(ev); escolhido = p;
        if (p) { if (escolher) escolher({ camada: p.camada, item: p.item }); return; }
        if (escolher) escolher(null);
        const b = canvas.getBoundingClientRect(), g = inverso((ev.clientX - b.left) * dpr, (ev.clientY - b.top) * dpr);
        if (g && aoPais) aoPais(paisEm(g.lat, g.lon), g);
      };
      canvas.addEventListener("pointerup", solta); canvas.addEventListener("pointercancel", (ev) => { dedos.delete(ev.pointerId); pinca = 0; });
      canvas.addEventListener("wheel", (ev) => { ev.preventDefault(); zoomPor(ev.deltaY < 0 ? 1.18 : 0.85); if (op.aoMexer) op.aoMexer(); }, { passive: false });
    }
    function paisEm(lat, lon) {
      const m = mapa50 || mapa; if (!m) return null;
      for (const [id, p] of Object.entries(m.paises)) {
        for (const poli of p.polis) { const fora = anelPontos(m, poli[0]); if (dentroAnel(fora, lon, lat)) return id; }
      }
      return null;
    }
    function perto(ev) {
      const b = canvas.getBoundingClientRect(), x = (ev.clientX - b.left) * dpr, y = (ev.clientY - b.top) * dpr;
      let melhor = null, md = 1e9;
      for (const p of pontos) { const d = Math.hypot(p.x - x, p.y - y); if (d < Math.max(p.r, 14 * dpr) && d < md) { md = d; melhor = p; } }
      return melhor;
    }
    function contagens() {
      const c = {}; CAMADAS.forEach((k) => { c[k.id] = k.id === "cameras" ? CAMS.length : (D.n && D.n[k.id] != null ? D.n[k.id] : (D[k.id] || []).length); });
      const m = (D.terremotos || []).reduce((a, e) => Math.max(a, e.mag || 0), 0);
      return Object.assign(c, { maior: m });
    }
    return {
      dados(d) { D = d || {}; satsEm = 0; },
      cameras(l) { CAMS = l || []; },
      camada(id, on) { if (id in ligadas) ligadas[id] = !!on; if (escolhido && escolhido.camada === id && !on) escolhido = null; },
      ligadas: () => Object.assign({}, ligadas),
      contagens,
      voar,
      irPara(lat, lon, z) { voar(lat, lon, z); },
      /* zoom que faz caber um lugar de "ext" graus em uns 70% da vista */
      zoomPara: (ext) => Math.max(1.2, Math.min(ZMAX, 95 / Math.max(0.15, ext))),
      destacar(id) { destaque = id ? String(id) : null; refazDestaque(); },
      zoom(f) { zoomPor(f); },
      centro: () => ({ lat: lat0, lon: lon0, zoom }),
      nivel,
      voando: () => !!voo,
      aoEscolher(f) { escolher = f; },
      aoPais(f) { aoPais = f; },
      aoNivel(f) { aoNivel = f; },
      soltar() { escolhido = null; },
      medida() { const q = medida.quadros, fps = q.length > 1 ? Math.round((q.length - 1) * 1000 / (q[q.length - 1] - q[0])) : 0; return { fps, desenho_ms: Math.round(medida.desenho * 10) / 10, leve, zoom: Math.round(zoom * 10) / 10, R: Math.round(R), erro: medida.erro || null, ruas: medida.ruas || null, partes: medida.partes || null }; },
      leve(on) { leve = !!on; },
      ligar() { if (!rodando) { rodando = true; const minha = ++volta; requestAnimationFrame((x) => quadro(x, minha)); } },
      parar() { rodando = false; volta++; },
      umQuadro() { try { desenhar(performance.now()); } catch (e) {} },
      auto(on) { op.auto = !!on; },
      mexeu() { mexeuEm = Date.now(); },
    };
  }
  window.Olho = { criar, CAMADAS, corMag, satAgora };
})();
