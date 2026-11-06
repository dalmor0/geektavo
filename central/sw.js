/* Central como app (06/11/2026): a página abre mesmo sem rede.
   Página: rede primeiro, cópia guardada se cair. Ícones e manifesto: guardados.
   Dados (Supabase, /estado.json, Jarvis, Edição) nunca passam por aqui: a página guarda o último
   estado no próprio navegador e mostra com o aviso de dado velho. */
const CAIXA = "central-v2";
const FORA = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];   // biblioteca do banco e fontes: guardadas pra abrir sem rede
const CASCA = ["./", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-180.png"];
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
  const casca = e.request.mode === "navigate" || CASCA.some(c => u.pathname.endsWith("/" + c.replace("./", "")));
  if (!casca) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CAIXA).then(c => c.put(e.request.mode === "navigate" ? "./" : e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request.mode === "navigate" ? "./" : e.request).then(r => r || caches.match("./"))));
});
