/* Central como app (06/11/2026): a página abre mesmo sem rede.
   Página: rede primeiro, cópia guardada se cair. Ícones e manifesto: guardados.
   Dados (Supabase, /estado.json, Jarvis, Edição) nunca passam por aqui: a página guarda o último
   estado no próprio navegador e mostra com o aviso de dado velho. */
const CAIXA = "central-v1";
const CASCA = ["./", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CAIXA).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CAIXA).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const casca = e.request.mode === "navigate" || CASCA.some(c => u.pathname.endsWith("/" + c.replace("./", "")));
  if (!casca) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CAIXA).then(c => c.put(e.request.mode === "navigate" ? "./" : e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request.mode === "navigate" ? "./" : e.request).then(r => r || caches.match("./"))));
});
