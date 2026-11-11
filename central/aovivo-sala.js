/* Ao vivo · sala de operações (Jarvis 360, frente 2, 10/11/2026)

   Pedido do Gustavo: "está muito mal feito, parece uma apresentação de slide gigantesca, pode ser mais
   estilizado, animado, seguir a identidade visual do Jarvis". Ficha: EMPRESA/fichas/2026-11-10-jarvis-360.md.
   Identidade: JARVIS/IDENTIDADE.md (ciano anda, âmbar espera você, vermelho quebrou, verde fechou).

   Uma tela só. Cada trabalho andando é uma estação. Quem está trabalhando agora cresce e vem pra frente;
   parado encolhe e vai pro canto. A tela se rearruma deslizando. Terminou comemora um segundo e sai.
   Sem nada andando: relógio, o que foi entregue hoje e o reator em repouso.

   Um arquivo só (o CSS vai junto) pra servir a Central do PC, o celular e a TV:
     const sala = AovivoSala.montar(elemento, {
       modo: "tv" | "pc" | "cel" | undefined (escolhe pela largura),
       quadroUrl: q => "/aovivo/quadro/" + q.slug + "/" + q.ts + "-d.jpg",   // sem isso, estação sem imagem
       decisao: (pede, estacao) => Node | null,   // os botões de resposta (só PC e celular; a TV mostra onde responder)
       abrir: slug => {},                          // "Abrir a janela" de quem tem quadro (palpite)
       leve: true | false | undefined (mede sozinho), fonteJersey: "jersey15.woff2" });
     sala.dados(o_json_de_aovivo.sala(), {semRede: false});
     sala.ligar(); sala.parar();
   Dado: CENTRAL/aovivo.py sala() -> {em, estacoes: [{id, nome, quem, estado: andando|parado|pede|terminou,
   ocupado, pct, passos: [{nome, estado: feito|aberto|espera, prova}], linha, linha_em, mexeu, comeco, eta,
   quadro: {slug, ts} | null, pede: {id, titulo, pergunta, ...} | null}], entregues_hoje: [{nome, quem, em}]} */
(function () {
  "use strict";
  if (window.AovivoSala) return;

  const CSS = `
/* paleta do Oráculo (JARVIS/IDENTIDADE.md, 10/11): ciano anda, amarelo do holofote espera você, dourado entregue */
.avs{--tinta:#07070b;--parede:#11131c;--parede-2:#161a26;--fio:#232a3b;--borda:#3a4358;--giz:#eef2f8;--lav:#9aa6bd;
  --ciano:#38d6ff;--ciano-f:rgba(56,214,255,.14);--ambar:#ffe27a;--ambar-f:rgba(255,226,122,.12);--verm:#5fe06a;--verde:#d99a3a;--verde-f:rgba(217,154,58,.16);
  --reator:#3db8ff;--curva:cubic-bezier(.2,.7,.3,1);
  --f-letreiro:"Jersey 15","Archivo",sans-serif;--f-texto:"Archivo","Segoe UI",system-ui,sans-serif;--f-mono:"JetBrains Mono","Cascadia Mono",Consolas,monospace;
  --gap:16px;--pad:16px;--t:16px;--t-rot:14px;--t-nome-g:48px;--t-nome-m:32px;--t-nome-s:28px;--t-perg:28px;--t-letreiro:44px;--t-relo:40px;--t-relo-g:120px;
  --pt:12px;--ln:2px;--topo:64px;
  position:relative;display:flex;flex-direction:column;gap:var(--gap);color:var(--giz);font:400 var(--t)/1.35 var(--f-texto);min-width:0}
.avs *{box-sizing:border-box}
.avs:not([data-modo="cel"]){height:100%}
.avs[data-modo="tv"]{--gap:24px;--pad:24px;--t:28px;--t-rot:28px;--t-nome-g:80px;--t-nome-m:52px;--t-nome-s:44px;--t-perg:44px;--t-letreiro:64px;--t-relo:64px;--t-relo-g:200px;--pt:18px;--ln:3px;--topo:88px;
  position:absolute;inset:0;padding:32px 40px;background:var(--tinta)}
.avs[data-modo="cel"]{--gap:12px;--pad:16px;--t:16px;--t-rot:14px;--t-nome-g:40px;--t-nome-m:28px;--t-nome-s:28px;--t-perg:22px;--t-letreiro:40px;--t-relo:32px;--t-relo-g:88px;--pt:12px;--topo:auto}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]) .avs:not([data-modo="tv"]){--tinta:#eceef8;--parede:#ffffff;--parede-2:#f4f5fb;--fio:#b4bad6;--borda:#868cb2;--giz:#141327;--lav:#4a4f72;
  --ciano:#0b6a7c;--ciano-f:rgba(15,127,146,.1);--ambar:#7a5a00;--ambar-f:rgba(255,226,122,.25);--verm:#2f7a35;--verde:#8a5a12;--verde-f:rgba(60,186,90,.14);--reator:#1a78c2}}
:root[data-theme="light"] .avs:not([data-modo="tv"]){--tinta:#eceef8;--parede:#ffffff;--parede-2:#f4f5fb;--fio:#b4bad6;--borda:#868cb2;--giz:#141327;--lav:#4a4f72;
  --ciano:#0b6a7c;--ciano-f:rgba(15,127,146,.1);--ambar:#7a5a00;--ambar-f:rgba(255,226,122,.25);--verm:#2f7a35;--verde:#8a5a12;--verde-f:rgba(60,186,90,.14);--reator:#1a78c2}

/* topo: letreiro, contagem e relógio */
.avs-topo[hidden]{display:none}
.avs-topo{display:flex;align-items:center;gap:12px var(--gap);flex-wrap:wrap;min-height:var(--topo);border-bottom:1px solid var(--fio);padding-bottom:12px}
.avs[data-modo="tv"] .avs-topo{border-bottom-width:2px;padding-bottom:16px;flex-wrap:nowrap}
.avs-letreiro{margin:0;font:400 var(--t-letreiro)/1 var(--f-letreiro);letter-spacing:.04em;display:flex;align-items:center;gap:.35em;white-space:nowrap}
.avs-letreiro i{display:block;width:.36em;height:.36em;background:var(--ciano);flex:none}
.avs-letreiro.quieto i{background:var(--lav)}
.avs-conta{display:flex;flex-wrap:wrap;gap:4px 20px;margin:0;padding:0;list-style:none;font-size:var(--t-rot);color:var(--lav)}
.avs-conta b{font:400 calc(var(--t-rot) * 1.3)/1 var(--f-letreiro);margin-right:6px;color:var(--giz)}
.avs-conta .anda b{color:var(--ciano)} .avs-conta .pede b{color:var(--ambar)}
.avs-rede{margin:0;font-size:var(--t-rot);color:var(--verm);font-weight:600}
.avs-rede[hidden]{display:none}
.avs-relo{margin-left:auto;text-align:right;white-space:nowrap;line-height:1}
.avs-relo b{display:block;font:400 var(--t-relo)/1 var(--f-letreiro);font-variant-numeric:tabular-nums}
.avs-relo span{display:block;margin-top:4px;font:400 calc(var(--t-rot) * .9)/1 var(--f-mono);color:var(--lav)}
.avs[data-modo="tv"] .avs-relo span{font-size:28px}
.avs[data-modo="cel"] .avs-relo{display:none}

/* palco: as estações ficam soltas (posição pelo JS) e deslizam quando a sala se rearruma */
.avs-palco{position:relative;flex:1 1 auto;min-height:0}
.avs[data-modo="cel"] .avs-palco{display:flex;flex-direction:column;gap:var(--gap)}
.avs-est{position:absolute;left:0;top:0;display:flex;min-width:0;overflow:hidden;background:var(--parede);border:1px solid var(--fio);
  transition:transform .6s var(--curva),opacity .28s var(--curva),border-color .28s var(--curva);
  will-change:transform}
/* no PC a caixa também cresce deslizando; na TV (navegador fraco) só desliza e o tamanho troca de uma vez */
.avs[data-modo="pc"]:not(.leve) .avs-est{transition:transform .6s var(--curva),width .6s var(--curva),height .6s var(--curva),opacity .28s var(--curva),border-color .28s var(--curva)}
.avs-est[hidden]{display:none!important}
.avs[data-modo="tv"] .avs-est{border-width:2px}
.avs[data-modo="cel"] .avs-est{position:relative;transition:opacity .28s var(--curva),border-color .28s var(--curva)}
.avs-est.novo{opacity:0}
.avs-est.saindo{opacity:0;pointer-events:none}
/* canto marcado só na estação em foco (por cima do quadro) */
.avs-cantos{display:none;position:absolute;inset:0;z-index:2;pointer-events:none;--c:var(--ciano);
  background:linear-gradient(var(--c),var(--c)) left top/16px 3px no-repeat,linear-gradient(var(--c),var(--c)) left top/3px 16px no-repeat,
  linear-gradient(var(--c),var(--c)) right top/16px 3px no-repeat,linear-gradient(var(--c),var(--c)) right top/3px 16px no-repeat,
  linear-gradient(var(--c),var(--c)) left bottom/16px 3px no-repeat,linear-gradient(var(--c),var(--c)) left bottom/3px 16px no-repeat,
  linear-gradient(var(--c),var(--c)) right bottom/16px 3px no-repeat,linear-gradient(var(--c),var(--c)) right bottom/3px 16px no-repeat}
[data-tam="g"] > .avs-cantos{display:block}
[data-estado="pede"] > .avs-cantos{--c:var(--ambar)}
.festa > .avs-cantos{--c:var(--verde)}
.avs-est[data-estado="parado"]{background:transparent;border-color:var(--fio)}
.avs-est[data-estado="pede"]{border-color:var(--ambar)}
.avs-est[data-estado="pede"][data-tam="g"]{box-shadow:0 0 0 1px var(--ambar),0 0 24px rgba(255,226,122,.18)}
.avs-est.festa{border-color:var(--verde)}

/* a batida do "espera você": uma faixa âmbar que acende e apaga (só opacidade, barato na TV) */
.avs-est[data-estado="pede"]::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--ambar)}
.avs-est[data-estado="pede"]::after{content:"";position:absolute;inset:0;border:3px solid var(--ambar);opacity:0;pointer-events:none;animation:avs-batida 2.4s var(--curva) infinite}
@keyframes avs-batida{0%,55%,100%{opacity:0}12%{opacity:.9}30%{opacity:.25}}

.avs-q{position:relative;flex:none;background:var(--tinta);overflow:hidden;border-left:1px solid var(--fio)}
.avs-q img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.avs-q[hidden]{display:none}
.avs-tx{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px;padding:var(--pad);padding-left:calc(var(--pad) + 4px)}
.avs[data-modo="tv"] .avs-tx{gap:12px}
.avs-tx > *{flex-shrink:0}
[data-tam="s"] .avs-tx{padding:calc(var(--pad) * .66) var(--pad) calc(var(--pad) * .66) calc(var(--pad) + 4px);gap:6px}
[data-tam="s"] .avs-trilha{height:calc(var(--pt) + 4px)}
[data-estado="pede"] .avs-pede{order:-1;margin-top:0;padding-top:0;border-top:0}
[data-estado="pede"] .avs-sobre{order:-3}
[data-estado="pede"] .avs-nome{order:-2}

.avs-sobre{margin:0;display:flex;flex-wrap:nowrap;align-items:baseline;gap:14px;font-size:var(--t-rot);color:var(--lav);min-width:0}
.avs-quem{font-weight:400;color:var(--lav);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:0 1 auto}
.avs-selo{flex:none}
.avs-selo{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.avs-selo::before{content:"";width:.5em;height:.5em;background:currentColor;flex:none}
[data-estado="andando"] .avs-selo{color:var(--ciano)}
[data-estado="pede"] .avs-selo{color:var(--ambar);font-weight:600}
[data-estado="parado"] .avs-selo{color:var(--lav)}
[data-estado="parado"] .avs-selo::before{background:transparent;box-shadow:inset 0 0 0 2px currentColor}
.festa .avs-selo{color:var(--verde)}
.avs-nome{margin:0;font:400 var(--t-nome-m)/1.05 var(--f-letreiro);letter-spacing:.02em;overflow-wrap:anywhere;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
[data-tam="g"] .avs-nome{font-size:var(--t-nome-g)}
[data-tam="s"] .avs-nome,[data-tam="p"] .avs-nome{font-size:var(--t-nome-s);-webkit-line-clamp:1}

/* trilha: pontos ligados, o atual pulsando; etapa que fecha acende verde e a linha anda */
.avs-trilha{display:flex;align-items:center;min-width:0;height:calc(var(--pt) + 8px);overflow:hidden;padding:0 calc(var(--pt) * .6)}
.avs-trilha[hidden]{display:none}
.avs-pt{position:relative;flex:none;width:var(--pt);height:var(--pt);border:var(--ln) solid var(--fio);background:var(--tinta);transition:background-color .3s var(--curva),border-color .3s var(--curva)}
.avs-pt[data-e="feito"]{background:var(--giz);border-color:var(--giz)}
.avs-pt[data-e="aberto"]{border-color:var(--ciano);background:var(--ciano-f)}
.avs-pt[data-e="aberto"]::after{content:"";position:absolute;inset:calc(var(--ln) * -1);border:var(--ln) solid var(--ciano);animation:avs-pulso 1.6s var(--curva) infinite}
@keyframes avs-pulso{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.1);opacity:0}}
.avs-pt.fechou{animation:avs-acende 1.2s var(--curva)}
@keyframes avs-acende{0%,35%{background-color:var(--verde);border-color:var(--verde);transform:scale(1.5)}100%{transform:scale(1)}}
.avs-pt.reticencia{border:0;background:transparent;width:auto;color:var(--lav);font:400 var(--t-rot)/1 var(--f-mono);padding:0 4px}
.avs-ln{position:relative;flex:1 1 4px;min-width:4px;height:var(--ln);background:var(--fio);overflow:hidden}
.avs-ln u{position:absolute;inset:0;background:var(--giz);transform:scaleX(0);transform-origin:left center;transition:transform .6s var(--curva) .2s;text-decoration:none}
.avs-ln.cheia u{transform:scaleX(1)}
.festa .avs-pt{background:var(--verde)!important;border-color:var(--verde)!important}
.festa .avs-pt::after{display:none}
.festa .avs-ln u{background:var(--verde);transform:scaleX(1)}
.avs-etapa{margin:0;font-size:var(--t-rot);color:var(--lav);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avs-etapa b{font-weight:600;color:var(--giz)}
.avs-prova{margin:0;font-size:var(--t-rot);color:var(--lav);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avs-prova::before{content:"";display:inline-block;width:.5em;height:.5em;margin-right:8px;background:var(--giz);vertical-align:.08em}
.avs-linha{margin:0;font-size:var(--t);color:var(--giz);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
[data-tam="g"] .avs-linha{-webkit-line-clamp:3}
.avs-linha small{color:var(--lav);font-size:var(--t-rot);margin-left:10px;white-space:nowrap}
[data-estado="parado"] .avs-linha{color:var(--lav)}
.avs-prova[hidden],.avs-linha[hidden],.avs-etapa[hidden]{display:none}

/* trilha e etapa: uma embaixo da outra; na estação pequena, lado a lado */
.avs-caminho{display:flex;flex-direction:column;gap:8px;min-width:0}
.avs[data-modo="tv"] .avs-caminho{gap:12px}
[data-tam="s"] .avs-caminho{flex-direction:row;align-items:center;gap:16px}
[data-tam="s"] .avs-caminho .avs-trilha{flex:1 1 55%;min-width:0}
[data-tam="s"] .avs-caminho .avs-etapa{flex:0 1 45%;min-width:0}
/* estação pequena: o selo vira só o ponto, pra caber o nome de quem faz */
[data-tam="s"] .avs-selo{font-size:0;gap:0}
[data-tam="s"] .avs-pt.reticencia{display:none}
[data-tam="s"] .avs-selo::before{width:10px;height:10px}
[data-estado="pede"] .avs-caminho{margin-top:auto}
/* foco sem quadro: as etapas por nome, a atual em ciano */
.avs-etapas{display:none;margin:4px 0 0;padding:0;list-style:none;border-top:1px solid var(--fio)}
[data-tam="g"].sem-quadro .avs-etapas{display:block}
.avs-etapas li{display:flex;align-items:baseline;gap:12px;padding:8px 0;border-bottom:1px solid var(--fio);font-size:var(--t);color:var(--lav);min-width:0}
.avs-etapas li::before{content:"";flex:none;width:.55em;height:.55em;border:2px solid var(--fio);transform:translateY(-.05em)}
.avs-etapas li[data-e="feito"]{color:var(--giz)}
.avs-etapas li[data-e="feito"]::before{background:var(--giz);border-color:var(--giz)}
.avs-etapas li[data-e="aberto"]{color:var(--ciano);font-weight:600}
.avs-etapas li[data-e="aberto"]::before{border-color:var(--ciano);background:var(--ciano-f)}
.avs-etapas li span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.avs-etapas li small{margin-left:auto;flex:none;color:var(--lav);font-size:var(--t-rot);font-weight:400}
.f0 .avs-etapas{display:none!important}
.avs-mais-nomes{margin:0;font-size:var(--t-rot);color:var(--lav);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
/* o pedido de decisão */
.avs-pede{display:flex;flex-direction:column;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid var(--fio)}
.avs-pede[hidden]{display:none}
.avs-pede-rot{margin:0;font:400 calc(var(--t-rot) * 1.15)/1 var(--f-letreiro);letter-spacing:.06em;color:var(--ambar);text-transform:uppercase}
.avs-perg{margin:0;font:600 var(--t-perg)/1.25 var(--f-texto);color:var(--giz);overflow-wrap:anywhere}
[data-tam="m"] .avs-perg,[data-tam="s"] .avs-perg{font-size:var(--t);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.avs-onde{margin:0;font-size:var(--t-rot);color:var(--lav)}
.avs-dec .tipo,.avs-dec h3,.avs-dec p:not(.perg-off),.avs-dec .ver,.avs-dec .ed{display:none}
.avs-dec .card{border:0!important;padding:0!important;background:none!important;margin:0}
.avs-dec .perg{display:none}

/* terminou: um segundo de festa */
.avs-fim{position:absolute;inset:0;z-index:3;margin:0;display:none;align-items:center;justify-content:center;gap:.3em;
  font:400 calc(var(--t-nome-m) * 1.1)/1 var(--f-letreiro);color:var(--verde);background:rgba(11,10,20,.72);letter-spacing:.04em}
.festa .avs-fim{display:flex;animation:avs-pop .5s var(--curva)}
.avs-fim svg{width:1.1em;height:1.1em}
@keyframes avs-pop{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}
.festa{animation:avs-festa 1s var(--curva)}
@keyframes avs-festa{0%,60%{box-shadow:0 0 0 3px var(--verde),0 0 32px rgba(217,154,58,.35)}100%{box-shadow:0 0 0 1px var(--verde)}}
/* botões: caixa de verdade */
.avs-bt{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border:1px solid var(--borda);background:transparent;color:var(--giz);
  font:600 15px/1.2 var(--f-texto);cursor:pointer;align-self:flex-start;white-space:nowrap}
.avs-bt:focus-visible{outline:3px solid var(--giz);outline-offset:2px}
@media (hover:hover){.avs-bt:hover{border-color:var(--giz)}}
.avs-bt[hidden]{display:none}
.avs-acoes{display:flex;flex-wrap:wrap;gap:8px 12px;margin-top:8px}
[data-tam="s"] .avs-acoes,[data-tam="p"] .avs-acoes{display:none}
.avs[data-modo="tv"] .avs-acoes{display:none}

/* canto dos parados */
.avs-canto{display:flex;align-items:stretch;gap:12px;min-height:0;overflow:hidden;padding-top:12px;border-top:1px dashed var(--fio)}
.avs-canto[hidden]{display:none}
.avs-canto-rot{flex:none;align-self:center;margin:0;font:400 calc(var(--t-rot) * 1.1)/1 var(--f-letreiro);color:var(--giz);letter-spacing:.04em;white-space:nowrap}
.avs-canto ul{display:flex;gap:12px;margin:0;padding:0;list-style:none;min-width:0;flex:1 1 auto;overflow:hidden}
.avs[data-modo="cel"] .avs-canto ul{flex-wrap:wrap}
.avs-chip{flex:0 1 auto;min-width:0;max-width:22em;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:8px 14px;border:1px solid var(--fio);color:var(--lav);font-size:var(--t-rot);line-height:1.2;
  transition:opacity .28s var(--curva)}
.avs-chip b{font-weight:600;color:var(--giz);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avs-chip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avs-chip.mais{flex:none;justify-content:center;color:var(--lav)}

/* vazio: relógio, entregue hoje e o reator em repouso */
.avs-vazio{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);align-items:center;gap:var(--gap);transition:opacity .4s var(--curva)}
.avs-vazio[hidden]{display:none}
.avs[data-modo="cel"] .avs-vazio{position:relative;grid-template-columns:minmax(0,1fr);text-align:center}
.avs-reator{position:relative;width:100%;max-width:min(560px,100%);aspect-ratio:1;justify-self:center}
.avs[data-modo="cel"] .avs-reator{max-width:220px}
.avs-reator canvas{position:absolute;inset:0;width:100%;height:100%}
.avs-vazio-tx{display:flex;flex-direction:column;gap:12px;min-width:0}
.avs-vazio-relo{margin:0;font:400 var(--t-relo-g)/.9 var(--f-letreiro);font-variant-numeric:tabular-nums}
.avs-vazio-dia{margin:0;font-size:var(--t);color:var(--lav)}
.avs-vazio-quieto{margin:8px 0 0;font:400 calc(var(--t-nome-s))/1.1 var(--f-letreiro);color:var(--lav)}
.avs-entregue{margin:12px 0 0;padding:0;list-style:none;border-top:1px solid var(--fio)}
.avs-entregue li{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--fio);font-size:var(--t)}
.avs[data-modo="cel"] .avs-entregue li{text-align:left}
.avs-entregue li b{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.avs-entregue li span{flex:none;color:var(--lav);font-family:var(--f-mono);font-size:var(--t-rot)}
.avs-entregue-tit{margin:16px 0 0;font:400 calc(var(--t-rot) * 1.2)/1 var(--f-letreiro);color:var(--verde);letter-spacing:.04em}

/* sem rede: tudo fica, mas apagado e parado */
.avs.sem-rede .avs-est,.avs.sem-rede .avs-chip{opacity:.5}
.avs.sem-rede .avs-pt::after,.avs.sem-rede .avs-est::after{animation:none;opacity:0}
.avs.sem-rede .avs-letreiro i{background:var(--verm)}

/* modo leve: só posição e opacidade; nada pulsa */
.avs.leve .avs-est{transition:transform .45s var(--curva),opacity .28s linear}
.avs.leve .avs-pt[data-e="aberto"]::after{animation:none;opacity:0}
.avs.leve .avs-est[data-estado="pede"]::after{animation:none;opacity:.7}
.avs.leve .avs-pt.fechou,.avs.leve .festa{animation:none}
.avs.leve .avs-ln u{transition:none}
@media (prefers-reduced-motion: reduce){.avs-est{transition:opacity .2s linear!important}.avs-pt[data-e="aberto"]::after,.avs-est::after,.avs-pt.fechou,.festa{animation:none!important}.avs-est[data-estado="pede"]::after{opacity:.7}}
/* o que não cabe sai em ordem (o JS mede no tamanho de destino) */
.f1 .avs-linha,.f1 .avs-prova{display:none!important}
.f2 .avs-etapa{display:none!important}
.f3 .avs-nome{-webkit-line-clamp:1}
.f4 .avs-trilha{display:none!important}
.f1[data-estado="pede"] .avs-perg{-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.avs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

  const h = (tag, at, ...filhos) => {
    const e = document.createElement(tag);
    for (const k in at || {}) {
      const v = at[k];
      if (v == null || v === false) continue;
      if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v === true ? "" : v);
    }
    for (const f of filhos.flat()) if (f != null) e.append(f);
    return e;
  };
  const agoraS = () => Date.now() / 1000;
  const ve = x => String(x == null ? "" : x).replace(/\bJarvis\b/g, "Oráculo").replace(/Oráculo \(Oráculo\)/g, "Oráculo");     // por dentro segue Jarvis; na tela é Oráculo
  function haQuanto(ts, agora) {
    if (!ts) return "";
    const s = Math.max(0, (agora || agoraS()) - ts);
    if (s < 60) return "agora";
    if (s < 3600) return "há " + Math.round(s / 60) + " min";
    if (s < 86400) return "há " + Math.round(s / 3600) + " h";
    return "há " + Math.round(s / 86400) + " d";
  }
  const hhmm = d => d.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"});
  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/></svg>';

  function montar(raiz, op) {
    op = op || {};
    if (!document.getElementById("avs-css")) document.head.append(h("style", {id: "avs-css"}, CSS));
    if (op.fonteJersey && !document.getElementById("avs-fonte")) {
      document.head.append(h("style", {id: "avs-fonte"}, `@font-face{font-family:"Jersey 15";src:url("${op.fonteJersey}") format("woff2");font-display:swap}`));
    }
    const qs = new URLSearchParams(location.search);
    const menos = matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- esqueleto ---------- */
    const letreiro = h("h2", {class: "avs-letreiro"}, h("i"), "Ao vivo");
    const conta = h("ul", {class: "avs-conta", "aria-label": "Resumo"});
    const rede = h("p", {class: "avs-rede", role: "status", hidden: true});
    const relo = h("p", {class: "avs-relo", "aria-hidden": "true"}, h("b"), h("span"));
    const topo = h("header", {class: "avs-topo", hidden: !!op.semTopo}, letreiro, conta, rede, relo);   // embaixo da cena da Central a contagem já está em cima
    const palco = h("div", {class: "avs-palco", role: "list", "aria-label": "Trabalhos andando"});
    const reatorCv = h("canvas", {"aria-hidden": "true"});
    const vazioRelo = h("p", {class: "avs-vazio-relo"});
    const vazioDia = h("p", {class: "avs-vazio-dia"});
    const vazioQuieto = h("p", {class: "avs-vazio-quieto", text: "Nada andando agora."});
    const entregueTit = h("p", {class: "avs-entregue-tit", text: "Entregue hoje"});
    const entregue = h("ul", {class: "avs-entregue"});
    const vazio = h("div", {class: "avs-vazio", hidden: true},
      h("div", {class: "avs-reator"}, reatorCv),
      h("div", {class: "avs-vazio-tx"}, vazioRelo, vazioDia, vazioQuieto, entregueTit, entregue));
    palco.append(vazio);
    const cantoLista = h("ul");
    const canto = h("section", {class: "avs-canto", hidden: true, "aria-label": "Trabalhos parados"}, h("p", {class: "avs-canto-rot", text: "Parados"}), cantoLista);
    const aviso = h("p", {class: "avs-sr", role: "status", "aria-live": "polite"});
    const raizEl = h("div", {class: "avs"}, topo, palco, canto, aviso);
    raiz.replaceChildren(raizEl);

    /* ---------- estado ---------- */
    const E = new Map();            // id -> {no, partes, d (dado), tam, rect, passosK, saindo, festaAte}
    let S = null, semRede = false, primeira = true, foco = null, focoDesde = 0, ligado = true;
    let modo = "pc", leve = op.leve === true || qs.has("leve") || menos.matches;

    function escolherModo() {
      const w = raiz.clientWidth || innerWidth;
      const m = op.modo || (w < 700 ? "cel" : "pc");
      if (m !== modo || raizEl.dataset.modo !== m) { modo = m; raizEl.dataset.modo = m; return true; }
      return false;
    }

    /* ---------- uma estação ---------- */
    function criar(d) {
      const p = {};
      p.quem = h("span", {class: "avs-quem"});
      p.selo = h("span", {class: "avs-selo"});
      p.nome = h("h3", {class: "avs-nome"});
      p.trilha = h("div", {class: "avs-trilha", role: "img"});
      p.etapa = h("p", {class: "avs-etapa"});
      p.prova = h("p", {class: "avs-prova", hidden: true});
      p.linha = h("p", {class: "avs-linha"});
      p.etapas = h("ol", {class: "avs-etapas", "aria-hidden": "true"});
      p.perg = h("p", {class: "avs-perg"});
      p.dec = h("div", {class: "avs-dec"});
      p.onde = h("p", {class: "avs-onde", hidden: true, text: "Responda na Central, no celular ou no PC."});
      p.pede = h("div", {class: "avs-pede", hidden: true}, h("p", {class: "avs-pede-rot", text: "Espera você"}), p.perg, p.dec, p.onde);
      p.abrir = h("button", {class: "avs-bt", type: "button", text: "Abrir a janela e palpitar", hidden: true});
      p.abrir.addEventListener("click", () => { const e = E.get(d.id); if (e && e.d.quadro && op.abrir) op.abrir(e.d.quadro.slug, e.d); });
      p.acoes = h("div", {class: "avs-acoes"}, p.abrir);
      p.fim = h("p", {class: "avs-fim"}); p.fim.innerHTML = CHECK + "<span>Entregue</span>";
      p.img = h("img", {alt: "", decoding: "async", loading: "lazy"});
      p.q = h("div", {class: "avs-q", hidden: true}, p.img);
      p.tx = h("div", {class: "avs-tx"}, h("p", {class: "avs-sobre"}, p.quem, p.selo), p.nome, h("div", {class: "avs-caminho"}, p.trilha, p.etapa), p.prova, p.linha, p.etapas, p.pede, p.acoes);
      const no = h("article", {class: "avs-est novo", role: "listitem", "data-id": d.id}, p.tx, p.q, h("span", {class: "avs-cantos", "aria-hidden": "true"}), p.fim);
      return {no, p, d, tam: null, rect: null, passosK: "", saindo: false, festaAte: 0, decK: ""};
    }

    function pintarTrilha(e) {
      const ps = e.d.passos || [];
      const p = e.p;
      if (!ps.length) { p.trilha.hidden = true; p.etapa.hidden = true; return; }
      p.trilha.hidden = false; p.etapa.hidden = false;
      const total = ps.length;
      let atual = ps.findIndex(x => x.estado === "aberto");
      if (atual < 0) atual = ps.every(x => x.estado === "feito") ? total - 1 : 0;
      // janela de no máximo 14 pontos em volta da etapa atual
      const MAX = e.tam === "g" ? 16 : 12;
      let ini = 0, fim = total;
      if (total > MAX) { ini = Math.max(0, Math.min(total - MAX, atual - Math.floor(MAX / 2))); fim = ini + MAX; }
      const k = [ini, fim].join("-");
      if (p.trilha.dataset.k !== k || p.trilha.childElementCount === 0) {
        p.trilha.dataset.k = k;
        const nos = [];
        if (ini > 0) nos.push(h("span", {class: "avs-pt reticencia", text: "…"}));
        for (let i = ini; i < fim; i++) {
          if (i > ini || ini > 0) nos.push(h("b", {class: "avs-ln"}, h("u")));
          nos.push(h("i", {class: "avs-pt", "data-n": i}));
        }
        if (fim < total) nos.push(h("b", {class: "avs-ln"}, h("u")), h("span", {class: "avs-pt reticencia", text: "…"}));
        p.trilha.replaceChildren(...nos);
        e.antes = null;
      }
      const antes = e.antes || {};
      const novo = {};
      for (const pt of p.trilha.querySelectorAll(".avs-pt[data-n]")) {
        const i = +pt.dataset.n, est = ps[i].estado;
        novo[i] = est;
        if (pt.dataset.e !== est) {
          // a etapa fechou agora (e não na primeira pintura): o ponto acende verde e a linha anda
          if (est === "feito" && antes[i] && antes[i] !== "feito" && !primeira) { pt.classList.remove("fechou"); void pt.offsetWidth; pt.classList.add("fechou"); }
          pt.dataset.e = est;
        }
        const ln = pt.nextElementSibling;
        if (ln && ln.classList.contains("avs-ln")) ln.classList.toggle("cheia", est === "feito");
      }
      e.antes = novo;
      const feitas = ps.filter(x => x.estado === "feito").length;
      p.trilha.setAttribute("aria-label", `Etapa ${Math.min(atual + 1, total)} de ${total}, ${feitas} feitas`);
      const nomeAtual = ps[atual] ? ps[atual].nome : "";
      p.etapa.replaceChildren(h("b", {text: `${Math.min(atual + 1, total)}/${total}`}), " · " + nomeAtual);
      // a prova da última etapa fechada, só na estação grande
      let ult = null;
      for (let i = total - 1; i >= 0; i--) if (ps[i].estado === "feito") { ult = ps[i]; break; }
      const prova = e.tam === "g" && ult ? ult.nome + (ult.prova ? " · " + ult.prova : "") : "";
      p.prova.hidden = !prova; p.prova.textContent = prova ? "Fechou: " + prova : "";
      if (e.tam === "g") {        // a lista por nome (só aparece no foco sem quadro): até 9 em volta da atual
        const ini2 = Math.max(0, Math.min(total - 9, atual - 3)), fim2 = Math.min(total, ini2 + 9);
        const ke = ps.slice(ini2, fim2).map(x => x.nome + x.estado + (x.prova || "")).join("|");
        if (p.etapas.dataset.k !== ke) {
          p.etapas.dataset.k = ke;
          p.etapas.replaceChildren(...ps.slice(ini2, fim2).map((x, j) => h("li", {"data-e": x.estado},
            h("span", {text: (ini2 + j + 1) + ". " + x.nome}), x.prova && x.estado === "feito" ? h("small", {text: x.prova}) : x.estado === "aberto" ? h("small", {text: "agora"}) : null)));
        }
      }
    }

    function seloTexto(d, agora) {
      if (d.estado === "pede") return "espera você";
      if (d.estado === "terminou") return "entregue";
      if (d.estado === "parado") return "parado " + haQuanto(d.mexeu, agora);
      return d.ocupado ? "trabalhando" : "andando";
    }

    function pintar(e) {
      const d = e.d, p = e.p, agora = agoraS();
      e.no.dataset.estado = e.festaAte ? "terminou" : d.estado;
      e.no.dataset.tam = e.tam || "m";
      p.quem.textContent = ve(d.quem);
      p.selo.textContent = seloTexto(d, agora);
      p.nome.textContent = ve(d.nome);
      e.no.setAttribute("aria-label", `${ve(d.nome)}, ${ve(d.quem)}, ${seloTexto(d, agora)}`);
      if (d.linha) e.no.title = d.linha; else e.no.removeAttribute("title");     // na estação pequena a última linha some; passando o mouse, aparece
      pintarTrilha(e);
      const linha = d.linha || (d.estado === "pede" ? "" : "");
      p.linha.hidden = !linha;
      if (linha) p.linha.replaceChildren(ve(linha), d.linha_em ? h("small", {text: haQuanto(d.linha_em, agora)}) : null);
      // pedido de decisão
      const pd = d.pede;
      p.pede.hidden = !pd;
      if (pd) {
        p.perg.textContent = ve(pd.pergunta || pd.titulo || "");
        const k = pd.id + "|" + (e.tam || "");
        if (e.decK !== k) {
          e.decK = k;
          const no = modo !== "tv" && op.decisao ? op.decisao(pd, d) : null;
          p.dec.replaceChildren(...(no ? [no] : []));
          p.onde.hidden = !!no;
        }
      } else if (e.decK) { e.decK = ""; p.dec.replaceChildren(); }
      // quadro
      const url = d.quadro && op.quadroUrl ? op.quadroUrl(d.quadro) : "";
      const mostraQ = !!url && (e.tam === "g" || e.tam === "m") && modo !== "cel" || (!!url && modo === "cel" && e.tam === "g");
      p.q.hidden = !mostraQ;
      e.no.classList.toggle("sem-quadro", !mostraQ);
      if (mostraQ && p.img.getAttribute("src") !== url) p.img.setAttribute("src", url);
      p.abrir.hidden = !(d.quadro && op.abrir);
    }

    /* ---------- ordem e lugar ---------- */
    function ordenar(lista, agora) {
      const peso = d => d.estado === "pede" ? 0 : d.estado === "terminou" ? 1 : d.ocupado ? 2 : 3;
      const balde = d => { const s = agora - (d.linha_em || d.mexeu || 0); return s < 120 ? 0 : s < 600 ? 1 : 2; };
      return lista.slice().sort((a, b) => peso(a) - peso(b) || balde(a) - balde(b) || (a.comeco || 0) - (b.comeco || 0));
    }
    function escolherFoco(ativos, agora) {
      if (!ativos.length) return null;
      const pede = ativos.find(d => d.estado === "pede");
      if (pede) return pede.id;
      const atual = foco && ativos.find(d => d.id === foco);
      // o foco só troca a cada 20 s (sem pular de um pro outro a cada leitura)
      if (atual && agora - focoDesde < 20) return foco;
      const maisNovo = ativos.slice().sort((a, b) => (b.linha_em || b.mexeu || 0) - (a.linha_em || a.mexeu || 0))[0];
      if (atual && (maisNovo.linha_em || 0) - (atual.linha_em || 0) < 60 && atual.estado !== "parado") return foco;
      return maisNovo.id;
    }

    function desenharCanto(parados, agora) {
      cantoLista.replaceChildren(...parados.map(d => h("li", {class: "avs-chip", title: d.nome}, h("b", {text: d.nome}), h("span", {text: (d.quem || "") + " · " + haQuanto(d.mexeu, agora)}))));
      if (!parados.length || modo === "cel") return;
      requestAnimationFrame(() => {          // o que não cabe vira "+N"
        const lim = cantoLista.clientWidth, filhos = [...cantoLista.children];
        let soma = 0, k = 0;
        for (; k < filhos.length; k++) { soma += filhos[k].offsetWidth + 12; if (soma > lim - 90) break; }
        if (k < filhos.length) { filhos.slice(k).forEach(c => c.remove()); cantoLista.append(h("li", {class: "avs-chip mais", text: "+" + (filhos.length - k)})); }
      });
    }
    function arrumar() {
      if (!S) return;
      escolherModo();
      const agora = agoraS();
      const todos = [...E.values()].filter(e => !e.saindo);
      const ativos = ordenar(todos.filter(e => e.d.estado !== "parado").map(e => e.d), agora);
      const parados = todos.filter(e => e.d.estado === "parado").map(e => e.d).sort((a, b) => (b.mexeu || 0) - (a.mexeu || 0));
      const f = escolherFoco(ativos, agora);
      if (f !== foco) { foco = f; focoDesde = agora; }
      const ordem = f ? [ativos.find(d => d.id === f), ...ativos.filter(d => d.id !== f)] : [];

      // contagem e letreiro
      const nAnda = ativos.filter(d => d.estado === "andando").length, nPede = ativos.filter(d => d.estado === "pede").length;
      const itens = [];
      if (nPede) itens.push(h("li", {class: "pede"}, h("b", {text: String(nPede)}), nPede > 1 ? "esperam você" : "espera você"));
      itens.push(h("li", {class: "anda"}, h("b", {text: String(nAnda)}), nAnda === 1 ? "andando" : "andando"));
      if (parados.length) itens.push(h("li", {}, h("b", {text: String(parados.length)}), parados.length === 1 ? "parado" : "parados"));
      conta.replaceChildren(...itens);
      letreiro.classList.toggle("quieto", !ordem.length);

      // canto dos parados (as estações paradas viram ficha pequena)
      for (const d of parados) { const e = E.get(d.id); if (e) { e.no.hidden = true; } }
      const kc = JSON.stringify(parados.map(d => [d.id, d.nome, d.quem, Math.round((agora - (d.mexeu || 0)) / 600)])) + modo;
      if (kc !== canto.dataset.k) { canto.dataset.k = kc; desenharCanto(parados, agora); }
      canto.hidden = !parados.length;

      // vazio
      vazio.hidden = !!ordem.length;
      relo.style.visibility = ordem.length ? "" : "hidden";
      reator.ligado(!ordem.length && ligado);
      if (!ordem.length) pintarVazio();

      if (modo === "cel") return arrumarCelular(ordem);
      // posições: foco à esquerda, o resto em coluna (até 4) ou em grade de 2 colunas (até 8)
      const W = palco.clientWidth, H = palco.clientHeight, g = modo === "tv" ? 24 : 16;
      const rects = new Map();
      const n = ordem.length;
      if (n === 1) rects.set(ordem[0].id, {x: 0, y: 0, w: W, h: H, tam: "g"});
      else if (n > 1) {
        const outros = ordem.slice(1);
        const colunas = outros.length <= 4 ? 1 : 2;
        const fw = Math.round(W * (colunas === 1 ? 0.6 : 0.46));
        rects.set(ordem[0].id, {x: 0, y: 0, w: fw, h: H, tam: "g"});
        const maxN = colunas === 1 ? 4 : 8;
        const mostra = outros.length > maxN ? outros.slice(0, maxN - 1) : outros;
        const linhas = Math.ceil((mostra.length + (outros.length > maxN ? 1 : 0)) / colunas);
        const cw = Math.floor((W - fw - g - (colunas - 1) * g) / colunas);
        const ch = Math.floor((H - (linhas - 1) * g) / linhas);
        mostra.forEach((d, i) => {
          const c = i % colunas, l = Math.floor(i / colunas);
          rects.set(d.id, {x: fw + g + c * (cw + g), y: l * (ch + g), w: cw, h: ch, tam: ch >= (modo === "tv" ? 230 : 170) ? "m" : "s"});
        });
        for (const d of outros.slice(mostra.length)) rects.set(d.id, null);      // fica fora, entra no "+N"
        maisTile(outros.length > maxN ? {x: fw + g + ((mostra.length) % colunas) * (cw + g), y: Math.floor(mostra.length / colunas) * (ch + g), w: cw, h: ch, n: outros.length - mostra.length, nomes: outros.slice(mostra.length).map(d => d.nome)} : null);
      } else maisTile(null);
      if (n <= 1) maisTile(null);
      for (const [id, r] of rects) {
        const e = E.get(id);
        if (!e) continue;
        if (!r) { e.no.hidden = true; continue; }
        e.no.hidden = false;
        if (!e.no.parentNode) palco.append(e.no);
        const mudouTam = e.tam !== r.tam;
        e.tam = r.tam;
        // quadro ao lado na estação larga, em cima na estreita
        const lado = r.tam !== "g" || r.w >= (modo === "tv" ? 1000 : 720);
        e.no.style.flexDirection = lado ? "row" : "column-reverse";
        if (e.p.q) {
          if (r.tam === "g") { if (lado) { e.p.q.style.width = Math.round(r.w * 0.55) + "px"; e.p.q.style.height = ""; } else { e.p.q.style.width = ""; e.p.q.style.height = Math.round(r.h * 0.42) + "px"; } }
          else { e.p.q.style.width = Math.round(r.w * 0.3) + "px"; e.p.q.style.height = ""; }
        }
        const primeiraVez = !e.rect;
        e.rect = r;
        if (primeiraVez) {
          e.no.style.transition = "none";
          e.no.style.transform = `translate(${r.x}px,${r.y + 16}px)`;
          e.no.style.width = r.w + "px"; e.no.style.height = r.h + "px";
          void e.no.offsetWidth;
          e.no.style.transition = "";
          e.no.classList.remove("novo");
        }
        e.no.style.transform = `translate(${r.x}px,${r.y}px)`;
        e.no.style.width = r.w + "px"; e.no.style.height = r.h + "px";
        if (mudouTam || primeiraVez) pintar(e);
        caber(e, r);
      }
    }
    // mede um clone no tamanho de destino e tira o que não cabe, na ordem: linha, etapa, nome em uma linha, trilha
    const FITS = ["f0", "f1", "f2", "f3", "f4"];
    function caber(e, r) {
      const d = e.d, ch = [e.p.etapa.textContent, r.w, r.h, r.tam, modo, d.nome, d.linha, d.estado, d.pede && d.pede.id, (d.passos || []).map(x => x.estado[0]).join(""), !!d.quadro, e.no.style.flexDirection].join("|");
      if (e.caberK === ch) return;                // mesma caixa e mesmo texto: o encaixe de antes vale
      e.caberK = ch;
      const sonda = e.no.cloneNode(true);
      sonda.classList.remove(...FITS, "novo", "saindo");
      Object.assign(sonda.style, {transition: "none", transform: "none", width: r.w + "px", height: r.h + "px", visibility: "hidden", left: "0", top: "0", position: "absolute"});
      sonda.removeAttribute("role"); sonda.setAttribute("aria-hidden", "true");
      palco.append(sonda);
      const tx = sonda.querySelector(".avs-tx");
      let k = 0;
      while (k < FITS.length && tx.scrollHeight > tx.clientHeight + 1) sonda.classList.add(FITS[k++]);
      sonda.remove();
      e.no.classList.remove(...FITS);
      if (k) e.no.classList.add(...FITS.slice(0, k));
    }
    let mais = null;
    function maisTile(r) {
      if (!r) { if (mais) { mais.remove(); mais = null; } return; }
      if (!mais) { mais = h("div", {class: "avs-est avs-mais", "data-estado": "parado", "data-tam": "s"}, h("div", {class: "avs-tx"}, h("h3", {class: "avs-nome"}), h("p", {class: "avs-mais-nomes"}))); palco.append(mais); }
      mais.querySelector(".avs-nome").textContent = "+" + r.n + (r.n === 1 ? " andando" : " andando");
      mais.querySelector(".avs-mais-nomes").textContent = (r.nomes || []).join(" · ");
      mais.style.transform = `translate(${r.x}px,${r.y}px)`; mais.style.width = r.w + "px"; mais.style.height = r.h + "px";
    }
    function arrumarCelular(ordem) {
      // celular: a lista corre na vertical; a troca de lugar desliza (FLIP, só translação)
      maisTile(null);
      const antes = new Map();
      for (const d of ordem) { const e = E.get(d.id); if (e && e.no.parentNode && !e.no.hidden) antes.set(d.id, e.no.getBoundingClientRect().top); }
      ordem.forEach((d, i) => {
        const e = E.get(d.id);
        if (!e) return;
        e.no.hidden = false;
        e.no.style.transform = ""; e.no.style.width = ""; e.no.style.height = "";
        e.no.style.flexDirection = "column-reverse";
        if (e.p.q) { e.p.q.style.width = ""; e.p.q.style.height = "180px"; }
        const tam = i === 0 ? "g" : "s";
        const mudou = e.tam !== tam;
        e.tam = tam;
        const alvo = palco.children[i + 1];      // o vazio é o primeiro filho
        if (alvo !== e.no) palco.insertBefore(e.no, alvo || null);
        if (mudou || !e.rect) pintar(e);
        e.rect = {cel: true};
        e.no.classList.remove("novo");
      });
      if (leve) return;
      for (const d of ordem) {
        const e = E.get(d.id), t0 = antes.get(d.id);
        if (!e || t0 == null) continue;
        const dy = t0 - e.no.getBoundingClientRect().top;
        if (Math.abs(dy) < 2) continue;
        e.no.style.transition = "none"; e.no.style.transform = `translateY(${dy}px)`;
        void e.no.offsetWidth;
        e.no.style.transition = "transform .5s cubic-bezier(.2,.7,.3,1)"; e.no.style.transform = "";
      }
    }

    /* ---------- dado novo ---------- */
    function dados(sala, extra) {
      extra = extra || {};
      semRede = !!extra.semRede;
      raizEl.classList.toggle("sem-rede", semRede);
      rede.hidden = !semRede;
      if (semRede) rede.textContent = extra.desde ? `Sem sinal do PC ${haQuanto(extra.desde)}. Mostrando o último estado.` : "Sem sinal do PC. Mostrando o último estado.";
      if (!sala) { if (!S) S = {estacoes: [], entregues_hoje: []}; arrumar(); return; }
      S = sala;
      const agora = agoraS();
      const vistos = new Set();
      for (const d of sala.estacoes || []) {
        vistos.add(d.id);
        let e = E.get(d.id);
        if (!e) {
          // terminado que já chegou terminado na primeira leitura não comemora: só não aparece
          if (d.estado === "terminou" && (primeira || agora - (d.mexeu || 0) > 30)) continue;
          e = criar(d); E.set(d.id, e);
          if (modo !== "cel") palco.append(e.no);
        }
        const era = e.d.estado, k = JSON.stringify(d);
        if (e.k === k && !primeira) continue;    // nada mudou nessa estação: não repinta
        e.k = k;
        e.d = d;
        if (d.estado === "terminou" && era !== "terminou" && !e.festaAte) festa(e);
        if (d.estado === "pede" && era !== "pede" && !primeira) aviso.textContent = `${d.quem} espera você: ${(d.pede || {}).titulo || d.nome}`;
        if (!e.festaAte) pintar(e);
      }
      for (const [id, e] of E) if (!vistos.has(id) && !e.saindo && !e.festaAte) sair(e);
      arrumar();
      primeira = false;
    }
    function festa(e) {
      e.festaAte = Date.now() + 1000;
      pintar(e);
      e.no.classList.add("festa");
      aviso.textContent = `${e.d.nome} entregue.`;
      setTimeout(() => sair(e), leve ? 900 : 1300);
    }
    function sair(e) {
      e.saindo = true;
      e.no.classList.add("saindo");
      e.no.style.transform = (e.no.style.transform || "") + " scale(.94)";
      setTimeout(() => { e.no.remove(); E.delete(e.d.id); }, 320);
      if (e.d.estado === "terminou") fora.add(e.d.id);
      arrumar();
    }
    // quem já saiu (festa feita) continua no dado por 75 s como "terminou": não volta pra tela
    const fora = new Set();
    function dadosFiltrado(sala, extra) {
      if (sala && sala.estacoes) {
        for (const id of [...fora]) if (!sala.estacoes.some(d => d.id === id && d.estado === "terminou")) fora.delete(id);
        sala = Object.assign({}, sala, {estacoes: sala.estacoes.filter(d => !(fora.has(d.id) && d.estado === "terminou"))});
      }
      return dados(sala, extra);
    }

    /* ---------- vazio ---------- */
    function pintarVazio() {
      const d = new Date();
      vazioRelo.textContent = hhmm(d);
      vazioDia.textContent = d.toLocaleDateString("pt-BR", {weekday: "long", day: "numeric", month: "long"});
      const ls = (S && S.entregues_hoje) || [];
      entregueTit.hidden = !ls.length;
      entregue.hidden = !ls.length;
      entregue.replaceChildren(...ls.slice(0, modo === "tv" ? 5 : 6).map(x => h("li", {}, h("b", {text: x.nome}), h("span", {text: hhmm(new Date(x.em * 1000))}))));
      vazioQuieto.textContent = ls.length ? "Nada andando agora." : "Nada andando agora. Nada entregue ainda hoje.";
    }

    /* ---------- relógio e "há X min" ---------- */
    function tique() {
      const d = new Date();
      relo.firstChild.textContent = hhmm(d);
      relo.lastChild.textContent = d.toLocaleDateString("pt-BR", {weekday: "short", day: "2-digit", month: "2-digit"}).replace(".", "");
      if (!vazio.hidden) pintarVazio();
    }
    let tReal = setInterval(tique, 1000), tTexto = setInterval(() => { for (const e of E.values()) if (!e.saindo && !e.festaAte && !e.no.hidden) pintar(e); }, 15000);
    tique();

    /* ---------- reator em repouso (canvas leve: 420 partículas, 30 quadros; no modo leve, uma pintura só) ---------- */
    const reator = (function () {
      const cx = reatorCv.getContext("2d");
      const N = 420, P = [];
      const ouro = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), th = ouro * i, k = Math.random() < 0.65 ? 0.92 + Math.random() * 0.08 : Math.cbrt(Math.random()) * 0.85;
        P.push([Math.cos(th) * r * k, y * k, Math.sin(th) * r * k, 0.8 + Math.random() * 1.1, Math.random() < 0.2]);
      }
      let raf = 0, antes = 0, ang = 0, t = 0, W = 0, on = false;
      function medir() {
        const w = Math.round(reatorCv.clientWidth * Math.min(devicePixelRatio || 1, 1.5));
        if (w && w !== W) { W = w; reatorCv.width = reatorCv.height = w; }
      }
      function quadro(ag) {
        raf = on && !leve ? requestAnimationFrame(quadro) : 0;
        if (antes && ag - antes < 33) return;
        const dt = antes ? Math.min(0.05, (ag - antes) / 1000) : 0.016;
        antes = ag; t += dt; ang += dt * 0.14;
        medir();
        if (!W) return;
        const c = W / 2, R = W * 0.36, resp = 1 + 0.035 * Math.sin(t * Math.PI / 3);
        cx.clearRect(0, 0, W, W);
        const g = cx.createRadialGradient(c, c, 0, c, c, R * 1.2);
        g.addColorStop(0, "rgba(61,184,255,.30)"); g.addColorStop(0.35, "rgba(61,184,255,.12)"); g.addColorStop(1, "rgba(61,184,255,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, W, W);
        cx.strokeStyle = "rgba(61,184,255,.22)"; cx.lineWidth = Math.max(1, W / 300);
        cx.beginPath();
        for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 + t * 0.03; cx.moveTo(c + Math.cos(a) * R * 1.32, c + Math.sin(a) * R * 1.32); cx.lineTo(c + Math.cos(a) * R * 1.39, c + Math.sin(a) * R * 1.39); }
        cx.stroke();
        const ca = Math.cos(ang), sa = Math.sin(ang), ci = Math.cos(0.32), si = Math.sin(0.32);
        for (const [x0, y0, z0, s0, claro] of P) {
          const x = x0 * resp, y = y0 * resp, z = z0 * resp;
          const x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * ci - z1 * si, z2 = y * si + z1 * ci;
          const p = 3 / (3 + z2), s = s0 * p * W / 260;
          cx.globalAlpha = Math.min(1, 0.25 + 0.6 * (1 - z2) * 0.5);
          cx.fillStyle = claro ? "#9bdcff" : "#3db8ff";
          cx.fillRect(c + x1 * R * p - s / 2, c + y1 * R * p - s / 2, s, s);
        }
        cx.globalAlpha = 1;
      }
      return {
        ligado(v) {
          if (v === on) return;
          on = v;
          cancelAnimationFrame(raf); raf = 0; antes = 0;
          if (on) { if (leve) setTimeout(() => quadro(performance.now()), 30); else raf = requestAnimationFrame(quadro); }
        },
        repintar() { if (on) { antes = 0; quadro(performance.now()); } }
      };
    })();

    /* ---------- modo leve sozinho: mede os quadros; abaixo de 24 por segundo, liga ---------- */
    function medirQuadros(ms) {
      if (op.leve === false || leve) return;
      let n = 0, t0 = 0;
      const passo = ag => { if (!t0) t0 = ag; n++; if (ag - t0 < ms) requestAnimationFrame(passo); else { const fps = n * 1000 / (ag - t0); raizEl.dataset.fps = Math.round(fps); if (fps < 24) ligarLeve(true); } };
      requestAnimationFrame(passo);
    }
    function ligarLeve(v) { leve = v; raizEl.classList.toggle("leve", v); reator.repintar(); }
    ligarLeve(leve);
    setTimeout(() => medirQuadros(2000), 1500);
    const tMedir = setInterval(() => { if (!document.hidden && ligado) medirQuadros(1500); }, 60000);

    let tArr = 0;
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => { cancelAnimationFrame(tArr); tArr = requestAnimationFrame(() => { escolherModo(); for (const e of E.values()) e.rect = e.rect && null; arrumar(); }); }) : null;
    if (ro) ro.observe(raiz); else addEventListener("resize", arrumar);
    escolherModo();

    return {
      dados: dadosFiltrado,
      ligar() { ligado = true; if (vazio && !vazio.hidden) reator.ligado(true); },
      parar() { ligado = false; reator.ligado(false); },
      destruir() { clearInterval(tReal); clearInterval(tTexto); clearInterval(tMedir); if (ro) ro.disconnect(); reator.ligado(false); raiz.replaceChildren(); },
      leve: ligarLeve,
      get modo() { return modo; }
    };
  }

  window.AovivoSala = {montar};
})();
