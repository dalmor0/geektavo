/* Olho de Deus: o desenhista do globo (09/11/2026, pedido do Gustavo em cima do reel DfN-EM7zyJy).
   Um desenhista só, em Canvas 2D, pros três aparelhos: PC, celular e TV. Sem WebGL de propósito: o PC vive com pouca
   memória e a TV (Tizen), embora rode WebGL 2, fez só 20 quadros/s com 20 mil pontos na sonda de 09/11. É uma esfera de verdade em projeção
   ortográfica: gira com o dedo ou o mouse, dá zoom, e os satélites andam em volta pelos elementos orbitais.
   Não fala com site nenhum: recebe o dado pronto do CENTRAL/olho.py (dados(d)) e o contorno dos países (paises-110m.json).

   uso: const o = Olho.criar(canvas, {paises: "olho/paises-110m.json", auto: true, fps: 30, tv: false});
        o.dados(json); o.camada("queimadas", false); o.irPara(-15.8, -47.9, 2.2); o.aoEscolher(fn); o.parar(); o.ligar(); */
(function () {
  "use strict";
  const RAD = Math.PI / 180, RT = 6371, MU = 398600.4418, J2 = 1.08263e-3, RE = 6378.137;
  const CAMADAS = [
    { id: "terremotos", nome: "Terremotos 24 h", grupo: "Eventos" },
    { id: "queimadas", nome: "Queimadas 3 h", grupo: "Eventos" },
    { id: "eventos", nome: "Ciclones e vulcões", grupo: "Eventos" },
    { id: "satelites", nome: "Satélites e a ISS", grupo: "Espaço" },
    { id: "lancamentos", nome: "Próximos lançamentos", grupo: "Espaço" },
    { id: "avioes", nome: "Aviões sobre o Brasil", grupo: "Movimento" },
  ];
  const COR = { linha: "#5ff2f0", fronteira: "rgba(95,242,240,.34)", mar: "#0b1230", borda: "rgba(95,242,240,.55)", grade: "rgba(120,140,220,.12)",
    fogo: "#ff6a3c", sat: "#e6e8f6", iss: "#ffffff", foguete: "#b4f27a", aviao: "#8fb4ff", ciclone: "#ff5ad6", vulcao: "#ff5ad6", texto: "#e6e8f6", fraco: "#a3abd4" };
  /* banca (09/11): cada camada tem cor E forma própria. Terremoto é anel âmbar; queimada, quadradinho laranja; ciclone
     e vulcão, magenta (espiral e triângulo); satélite, cruzinha clara (não se confunde com estrela); lançamento, pino
     verde-limão; avião, tracinho azul no rumo do voo. A legenda da página usa as mesmas formas. */
  const corMag = (m) => (m >= 6 ? "#ff5a5a" : m >= 5 ? "#ff9a3c" : m >= 4 ? "#ffc85a" : "#ffe9a8");

  function topoParaArcos(t) {
    /* decodifica os arcos do TopoJSON (delta + transform) em vetores prontos: sen e cos de lat e lon de cada ponto */
    const [sx, sy] = t.transform.scale, [tx, ty] = t.transform.translate;
    const costa = new Set();
    const anda = (g) => { if (!g) return; if (g.type === "GeometryCollection") return g.geometries.forEach(anda);
      const pega = (a) => { if (typeof a === "number") costa.add(a < 0 ? ~a : a); else a.forEach(pega); }; pega(g.arcs || []); };
    anda(t.objects.land);
    return t.arcs.map((arco, i) => {
      const n = arco.length, sl = new Float32Array(n), cl = new Float32Array(n), sp = new Float32Array(n), cp = new Float32Array(n);
      let x = 0, y = 0;
      for (let k = 0; k < n; k++) {
        x += arco[k][0]; y += arco[k][1];
        const lon = (x * sx + tx) * RAD, lat = (y * sy + ty) * RAD;
        sl[k] = Math.sin(lon); cl[k] = Math.cos(lon); sp[k] = Math.sin(lat); cp[k] = Math.cos(lat);
      }
      return { n, sl, cl, sp, cp, costa: costa.has(i) };
    });
  }

  /* posição de um satélite agora (Kepler com a deriva J2 do nó e do perigeu): devolve lat, lon em graus e altitude em km */
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

  function criar(canvas, op) {
    op = Object.assign({ auto: true, fps: 30, tv: false, paises: "paises-110m.json" }, op || {});
    const ctx = canvas.getContext("2d");
    let arcos = null, D = {}, ligadas = {}, lat0 = -14, lon0 = -52, zoom = 1, W = 0, H = 0, dpr = 1, R = 100, cx = 0, cy = 0;
    let rodando = false, ultimo = 0, mexeuEm = 0, escolher = null, pontos = [], sats = [], satsEm = 0, alvo = null, escolhido = null, erroPaises = "";
    CAMADAS.forEach((c) => { ligadas[c.id] = true; });
    const agora = () => (op.agora ? op.agora() : Date.now());

    const carrega = typeof op.paises === "string" ? fetch(op.paises).then((r) => { if (!r.ok) throw new Error("mapa " + r.status); return r.json(); }) : Promise.resolve(op.paises);
    carrega.then((t) => { arcos = topoParaArcos(t); }).catch((e) => { erroPaises = "O contorno dos países não carregou. Os pontos aparecem mesmo assim."; });

    function medir() {
      const b = canvas.getBoundingClientRect();
      dpr = op.tv ? 1 : Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(50, Math.round(b.width * dpr)), h = Math.max(50, Math.round(b.height * dpr));
      if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
      W = w; H = h; cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.42 * zoom;
    }
    /* (lat, lon em graus) -> tela. z > 0 é o lado de cá. alt em km levanta o ponto da superfície. */
    let s0 = 0, c0 = 1, sl0 = 0, cl0 = 1;
    function proj(lat, lon, alt) {
      const f = lat * RAD, l = lon * RAD, sp = Math.sin(f), cp = Math.cos(f), dl = l - lon0 * RAD, sd = Math.sin(dl), cd = Math.cos(dl);
      const k = alt ? 1 + Math.min(0.62, alt / RT) : 1;
      const x = cp * sd * k, y = (c0 * sp - s0 * cp * cd) * k, z = (s0 * sp + c0 * cp * cd) * k;
      return { x: cx + R * x, y: cy - R * y, z, fora: x * x + y * y > 1 };
    }
    function desenharArcos() {
      if (!arcos) return;
      for (let passe = 0; passe < 2; passe++) {
        ctx.beginPath();
        for (const a of arcos) {
          if (a.costa !== (passe === 1)) continue;
          let pena = false;
          for (let k = 0; k < a.n; k++) {
            const sd = a.sl[k] * cl0 - a.cl[k] * sl0, cd = a.cl[k] * cl0 + a.sl[k] * sl0;
            const z = s0 * a.sp[k] + c0 * a.cp[k] * cd;
            if (z <= 0) { pena = false; continue; }
            const X = cx + R * a.cp[k] * sd, Y = cy - R * (c0 * a.sp[k] - s0 * a.cp[k] * cd);
            if (pena) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pena = true; }
          }
        }
        ctx.strokeStyle = passe ? COR.linha : COR.fronteira; ctx.lineWidth = (passe ? 1.3 : 0.7) * dpr * (op.tv ? 1.6 : 1); ctx.stroke();
      }
    }
    function grade() {
      ctx.beginPath();
      for (let lon = -180; lon < 180; lon += 30) { let pena = false; for (let lat = -90; lat <= 90; lat += 6) { const p = proj(lat, lon); if (p.z <= 0) { pena = false; continue; } if (pena) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); pena = true; } } }
      for (let lat = -60; lat <= 60; lat += 30) { let pena = false; for (let lon = -180; lon <= 180; lon += 6) { const p = proj(lat, lon); if (p.z <= 0) { pena = false; continue; } if (pena) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); pena = true; } } }
      ctx.strokeStyle = COR.grade; ctx.lineWidth = dpr; ctx.stroke();
    }
    const u = () => dpr * (op.tv ? 1.8 : 1);      /* unidade de traço: a TV se vê de longe */
    function marca(p, camada, item, raio) { pontos.push({ x: p.x, y: p.y, r: raio, camada, item }); }
    function desenhar(t) {
      medir();
      s0 = Math.sin(lat0 * RAD); c0 = Math.cos(lat0 * RAD); sl0 = Math.sin(lon0 * RAD); cl0 = Math.cos(lon0 * RAD);
      ctx.clearRect(0, 0, W, H);
      pontos = [];
      /* o mar e o brilho da borda */
      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, "#14204a"); g.addColorStop(1, COR.mar);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = COR.borda; ctx.lineWidth = 1.5 * u(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      grade(); desenharArcos();
      const seg = agora() / 1000, pulso = (t / 1400) % 1;
      if (ligadas.queimadas && D.queimadas) {
        ctx.fillStyle = COR.fogo; ctx.globalAlpha = 0.85; const r = 1.4 * u();
        for (const q of D.queimadas) { const p = proj(q.lat, q.lon); if (p.z > 0) ctx.fillRect(p.x - r, p.y - r, 2 * r, 2 * r); }
        ctx.globalAlpha = 1;
      }
      if (ligadas.avioes && D.avioes) {
        ctx.strokeStyle = COR.aviao; ctx.lineWidth = 1.4 * u(); ctx.beginPath();
        for (const a of D.avioes) {
          const p = proj(a.lat, a.lon); if (p.z <= 0) continue;
          const q = proj(a.lat + 0.5 * Math.cos((a.rumo || 0) * RAD), a.lon + 0.5 * Math.sin((a.rumo || 0) * RAD) / Math.max(0.3, Math.cos(a.lat * RAD)));
          const dx = q.x - p.x, dy = q.y - p.y, m = Math.hypot(dx, dy) || 1, k = 5 * u() / m;
          ctx.moveTo(p.x - dx * k, p.y - dy * k); ctx.lineTo(p.x + dx * k, p.y + dy * k); marca(p, "avioes", a, 8 * u());
        }
        ctx.stroke();
      }
      if (ligadas.terremotos && D.terremotos) {
        for (const e of D.terremotos) {
          const p = proj(e.lat, e.lon); if (p.z <= 0) continue;
          const r = (2 + Math.max(0, e.mag - 2.5) * 2.1) * u();
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.strokeStyle = corMag(e.mag); ctx.lineWidth = 1.6 * u(); ctx.stroke();
          if (e.mag >= 5 && !op.parado) { ctx.beginPath(); ctx.arc(p.x, p.y, r + pulso * 12 * u(), 0, 7); ctx.globalAlpha = 1 - pulso; ctx.stroke(); ctx.globalAlpha = 1; }
          marca(p, "terremotos", e, r + 5 * u());
        }
      }
      if (ligadas.eventos && D.eventos) {
        for (const e of D.eventos) {
          const p = proj(e.lat, e.lon); if (p.z <= 0) continue;
          const r = 6 * u(), c = COR.ciclone;
          ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1.8 * u(); ctx.beginPath();
          if (e.tipo === "vulcao" || e.tipo === "incendio") { ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y + r * 0.8); ctx.lineTo(p.x - r, p.y + r * 0.8); ctx.closePath(); ctx.stroke(); }
          else { const a0 = op.parado ? 0.6 : (t / 900) % 7;      /* com movimento reduzido a espiral fica parada */ ctx.arc(p.x, p.y, r, a0, a0 + 2.2); ctx.stroke(); ctx.beginPath(); ctx.arc(p.x, p.y, r, a0 + 3.14, a0 + 5.34); ctx.stroke(); ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * u(), 0, 7); ctx.fill(); }
          marca(p, "eventos", e, r + 5 * u());
        }
      }
      if (ligadas.lancamentos && D.lancamentos) {
        ctx.font = `${Math.round(12 * u())}px Archivo, system-ui, sans-serif`;
        for (const l of D.lancamentos) {
          const p = proj(l.lat, l.lon); if (p.z <= 0) continue;
          ctx.strokeStyle = COR.foguete; ctx.fillStyle = COR.foguete; ctx.lineWidth = 1.6 * u();
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 14 * u()); ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y - 14 * u(), 3 * u(), 0, 7); ctx.fill();
          marca({ x: p.x, y: p.y - 8 * u() }, "lancamentos", l, 12 * u());
        }
      }
      ctx.restore();
      /* satélites: andam por fora da esfera; os de trás somem atrás do disco */
      if (ligadas.satelites && D.satelites) {
        if (Math.abs(seg - satsEm) > (op.tv ? 2 : 1)) { satsEm = seg; sats = D.satelites.map((s) => Object.assign({ s }, satAgora(s, seg))); }
        ctx.fillStyle = COR.sat; ctx.strokeStyle = COR.sat; ctx.lineWidth = 1.2 * u();
        for (const o of sats) {
          const p = proj(o.lat, o.lon, o.alt);
          if (p.z <= 0 && !p.fora) continue;
          const r = (o.s.iss ? 3 : 2.6) * u();
          ctx.globalAlpha = p.z > 0 ? 1 : 0.45; ctx.beginPath();
          if (o.s.iss) { ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
          else { ctx.moveTo(p.x - r, p.y); ctx.lineTo(p.x + r, p.y); ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x, p.y + r); ctx.stroke(); }
          if (o.s.iss) {
            ctx.globalAlpha = 1; ctx.strokeStyle = COR.iss; ctx.lineWidth = 1.2 * u(); ctx.beginPath(); ctx.arc(p.x, p.y, 8 * u(), 0, 7); ctx.stroke();
            ctx.font = `600 ${Math.round(12 * u())}px Archivo, system-ui, sans-serif`; ctx.fillStyle = COR.iss; ctx.fillText("ISS", p.x + 11 * u(), p.y + 4 * u()); ctx.fillStyle = COR.sat;
          }
          marca(p, "satelites", Object.assign({ lat: o.lat, lon: o.lon, alt: o.alt }, o.s), (o.s.iss ? 12 : 7) * u());
        }
        ctx.globalAlpha = 1;
      }
      if (escolhido) {       /* o que ele tocou fica marcado */
        const e = escolhido.item, p = proj(e.lat, e.lon, escolhido.camada === "satelites" ? e.alt : 0);
        if (p.z > 0 || p.fora) { ctx.strokeStyle = COR.texto; ctx.lineWidth = 1.5 * u(); ctx.setLineDash([4 * u(), 4 * u()]); ctx.beginPath(); ctx.arc(p.x, p.y, 16 * u(), 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      }
      if (erroPaises) { ctx.fillStyle = COR.fraco; ctx.font = `${Math.round(13 * u())}px Archivo, system-ui, sans-serif`; ctx.fillText(erroPaises, 12 * dpr, H - 12 * dpr); }
    }
    let volta = 0;            /* cada ligar() abre um laço novo e mata o anterior: parar e ligar seguidos não empilham */
    function quadro(t, minha) {
      if (!rodando || minha !== volta) return;
      requestAnimationFrame((x) => quadro(x, minha));
      if (t - ultimo < 1000 / op.fps - 2) return;
      const dt = Math.min(200, t - ultimo); ultimo = t;
      if (alvo) {            /* indo pra um lugar: chega em ~1 s */
        const k = Math.min(1, dt / 350); let dl = ((alvo.lon - lon0 + 540) % 360) - 180;
        lat0 += (alvo.lat - lat0) * k; lon0 += dl * k; zoom += (alvo.zoom - zoom) * k;
        if (Math.abs(dl) < 0.05 && Math.abs(alvo.lat - lat0) < 0.05) alvo = null;
      } else if (op.auto && Date.now() - mexeuEm > 5000) lon0 = ((lon0 + dt * (op.tv ? 0.0035 : 0.0022) + 540) % 360) - 180;
      try { desenhar(t); } catch (e) { /* um dado torto não derruba o globo */ }
    }
    /* mexer: arrastar gira, roda do mouse e pinça dão zoom, toque escolhe */
    const dedos = new Map(); let pinca = 0, arrastou = false;
    if (!op.tv) {
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointerdown", (ev) => { try { canvas.setPointerCapture(ev.pointerId); } catch (e) {} dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); arrastou = false; mexeuEm = Date.now(); alvo = null; pinca = 0; });
      canvas.addEventListener("pointermove", (ev) => {
        const d = dedos.get(ev.pointerId);
        if (!d) { if (ev.pointerType === "mouse") canvas.style.cursor = perto(ev) ? "pointer" : "grab"; return; }
        const dx = ev.clientX - d.x, dy = ev.clientY - d.y; d.x = ev.clientX; d.y = ev.clientY; mexeuEm = Date.now();
        if (dedos.size === 2) {
          const [a, b] = [...dedos.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinca) zoom = Math.max(0.6, Math.min(8, zoom * dist / pinca)); pinca = dist; arrastou = true; return;
        }
        if (Math.abs(dx) + Math.abs(dy) > 2) arrastou = true;
        const k = 57.3 * dpr / R; lon0 = ((lon0 - dx * k + 540) % 360) - 180; lat0 = Math.max(-85, Math.min(85, lat0 + dy * k));
      });
      const solta = (ev) => { const tinha = dedos.delete(ev.pointerId); pinca = 0; if (tinha && !arrastou) { const p = perto(ev); escolhido = p; if (escolher) escolher(p ? { camada: p.camada, item: p.item } : null); } };
      canvas.addEventListener("pointerup", solta); canvas.addEventListener("pointercancel", (ev) => { dedos.delete(ev.pointerId); pinca = 0; });
      canvas.addEventListener("wheel", (ev) => { ev.preventDefault(); zoom = Math.max(0.6, Math.min(8, zoom * (ev.deltaY < 0 ? 1.12 : 0.89))); mexeuEm = Date.now(); }, { passive: false });
    }
    function perto(ev) {
      const b = canvas.getBoundingClientRect(), x = (ev.clientX - b.left) * dpr, y = (ev.clientY - b.top) * dpr;
      let melhor = null, md = 1e9;
      for (const p of pontos) { const d = Math.hypot(p.x - x, p.y - y); if (d < Math.max(p.r, 14 * dpr) && d < md) { md = d; melhor = p; } }
      return melhor;
    }
    function contagens() {
      const c = {}; CAMADAS.forEach((k) => { c[k.id] = (D[k.id] || []).length; });
      const m = (D.terremotos || []).reduce((a, e) => Math.max(a, e.mag || 0), 0);
      return Object.assign(c, { maior: m });
    }
    return {
      dados(d) { D = d || {}; satsEm = 0; },
      camada(id, on) { if (id in ligadas) ligadas[id] = !!on; if (escolhido && escolhido.camada === id && !on) escolhido = null; },
      ligadas: () => Object.assign({}, ligadas),
      contagens,
      irPara(lat, lon, z) { alvo = { lat: Math.max(-85, Math.min(85, lat)), lon, zoom: z || zoom }; mexeuEm = Date.now(); },
      zoom(f) { zoom = Math.max(0.6, Math.min(8, zoom * f)); mexeuEm = Date.now(); },
      centro: () => ({ lat: lat0, lon: lon0, zoom }),
      aoEscolher(f) { escolher = f; },
      ligar() { if (!rodando) { rodando = true; const minha = ++volta; requestAnimationFrame((x) => quadro(x, minha)); } },
      parar() { rodando = false; volta++; },
      umQuadro() { try { desenhar(performance.now()); } catch (e) {} },
      auto(on) { op.auto = !!on; },
    };
  }
  window.Olho = { criar, CAMADAS, corMag, satAgora };
})();
