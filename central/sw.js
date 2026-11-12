/* Central como app (06/11/2026): a página abre mesmo sem rede.
   Página: rede primeiro, cópia guardada se cair. Ícones e manifesto: guardados.
   Dados (Supabase, /estado.json, Jarvis, Edição) nunca passam por aqui: a página guarda o último
   estado no próprio navegador e mostra com o aviso de dado velho. */
const CAIXA = "central-v5-5f5a441d66";   // 09/11: a torre do Andar 47 (andar.js, andar.css, fonte) também abre sem rede; 11/11: layout novo (cena da Cidade e sala do Ao vivo). O publicar.py põe a marca da versão no fim do nome
const FORA = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];   // biblioteca do banco e fontes: guardadas pra abrir sem rede
const CASCA = ["./", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-180.png", "andar.js", "andar.css", "jersey15.woff2", "oraculo-cena.js", "aovivo-sala.js"];
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
self.addEventListener("install", e => { e.waitUntil(caches.open(CAIXA).then(c => c.addAll(CASCA).then(() => c.add(LIB).catch(() => {}))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CAIXA).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.origin !== location.origin) {
    if (!FORA.includes(u.hostname)) return;
    e.respondWith(caches.open(CAIXA).then(c => c.match(e.request).then(guardada => {
      const rede = fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }).catch(() => guardada || Response.error());
      return guardada || rede;
    })));
    return;
  }
  const raiz = new URL("./", self.registration.scope).pathname;
  const pagina = e.request.mode === "navigate" && (u.pathname === raiz || u.pathname === raiz + "index.html");
  const casca = pagina || CASCA.slice(1).some(c => u.pathname === raiz + c);
  if (!casca) return;          // /estado.json, /jarvis/api, /edicao e o resto passam direto
  e.respondWith((pagina ? fetch(u.href, {cache: "no-cache", credentials: "same-origin"}) : fetch(e.request)).then(r => {   // 11/11: a página pergunta pro servidor se mudou (o cache do github.io segurava a velha por 10 min)
    const html = (r.headers.get("content-type") || "").includes("text/html");
    if (r.ok && (!pagina || html)) { const cp = r.clone(); caches.open(CAIXA).then(c => c.put(pagina ? "./" : e.request, cp)); }
    return r;
  }).catch(() => caches.match(pagina ? "./" : e.request).then(r => r || (pagina ? caches.match("./") : Response.error()))));
});

/* avisos (09/11): tocar na notificação abre a Central (ou traz pra frente a que já está aberta) */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const ir = (e.notification.data && e.notification.data.ir) || "andar";
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(cs => {
    for (const c of cs) { c.postMessage({central: "ir", ir}); if ("focus" in c) return c.focus(); }
    return self.clients.openWindow("./?ir=" + encodeURIComponent(ir));
  }));
});
