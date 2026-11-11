/* CÓPIA PRA CENTRAL gerada pelo CENTRAL/site/andar_da_tv.py (não editar aqui).
   Andar 47 · Gotham (v7, 10/11/2026). A torre do Andar 47 vestida de Gotham pra Oráculo, a Central pessoal do Gustavo.
   Ficha: EMPRESA/fichas/2026-11-10-andar-gotham.md (com o acréscimo das 11h55) e as melhorias do maestro em
   EMPRESA/fichas/2026-11-10-andar-gotham-melhorias.md (partes 1, 2 e 3). Dicionário da cena: JARVIS/IDENTIDADE.md.
   Uso particular: desenho nosso, em código. Batman, Coringa, comissário, Oráculo, morcego e sinal são desenhados aqui;
   nada de arte, logo ou quadro oficial. A v6 mix (de onde isto parte) está em JARVIS/_arquivo/2026-11-10/.
   Uso (painel.js, só na sala): const a = Andar.criar({agora: () => ms do relógio da vitrine});
   a.estado(json do /api/estado); a.voz(json do /api/voz, segundos da vitrine); a.ligar(); a.parar();
   a.lento(true) enquanto a janela de cena do cenas.js está por cima; a.fps() pro /diag; a.medida() com p95.
   Canvas 480x270 ampliado 4x (pixelated), HUD em HTML, sem WebGL. 60 quadros/s, cai pra 30 abaixo de 50 e pro modo
   leve abaixo de 24. A câmera (close 2x com barra de cinema) só liga na TV.
   O que cada coisa quer dizer:
   - Coringa = erro de verdade num terminal, em 4 atos pelo tempo real do erro (chega e prega a carta; luta uma vez;
     passou de 2 min, senta na cadeira com o Batman amarrado; o trabalho voltou, revanche e fuga pelo telhado).
     Sem erro, o Coringa só aparece no cartaz de PROCURADO, com quantas vezes atacou hoje.
   - Holofote e sinal = alguma coisa espera o Gustavo. O comissário vira pro céu, encosta aos 10 min, cochila aos 30.
     Ele respondeu: o facho apaga, o Batman some e leva o café do comissário.
   - Torre do relógio = limite do Claude; chuva = memória do PC apertando; raio = terminal caído.
   - Entrega do dia acumula: janela dourada, comissário levanta a caneca; na 3ª pro Batman, na 5ª ele acena, na 10ª o
     relógio fica dourado.
   Testes (só na página de teste, opts.teste): ?ensaio=luta|sinal|entrega, ?erro=1|nome, ?vence=S, ?chuva=1|2, ?raio=1,
   ?pend=N, ?espera=MIN, ?camera=1, ?acelera=1. Os antigos seguem: ?falando=1, ?hora=HH:MM, ?vel=N, ?t=S. */
(function (raiz) {
"use strict";
const HTML=`<div id="a6-stage">
  <div id="a6-cam">
    <canvas id="a6-world" width="640" height="360"></canvas>
    <div id="a6-wl">
      <div id="a6-andares"></div>
      <div id="a6-salas"></div>
      <div id="a6-tags"></div>
      <div id="a6-jtag"></div>
      <div id="a6-proc"><b>PROCURADO</b><div class="ln"><canvas id="a6-procc" width="18" height="14"></canvas><span id="a6-procn"></span></div></div>
      <div id="a6-ceu" hidden></div>
      <div id="a6-ceuq" hidden><b id="a6-ceuqt"></b><span id="a6-ceuqd"></span></div>
      <div id="a6-picho" hidden>HA HA</div>
      <div id="a6-carta" hidden><b>HA HA</b><small id="a6-cartaq"></small><span id="a6-cartat"></span></div>
    </div>
  </div>
  <canvas id="a6-palco" width="480" height="270" hidden></canvas>
  <div id="a6-hud">
    <div id="a6-barras"><i></i><i></i></div>
    <div id="a6-top">
      <div class="score" id="a6-s1" style="left:32px;--k:var(--a3)"><div class="who"><b>1P</b><span id="a6-s1n"></span></div><div class="num"><span id="a6-s1v"></span><small>YOUTUBE</small></div></div>
      <div id="a6-clock"><div class="h" id="a6-hora"></div><div class="d"><canvas id="a6-astro" width="7" height="7"></canvas><span id="a6-data"></span></div></div>
      <div id="a6-boss"><div class="t"><span id="a6-bn"></span><span id="a6-be"></span></div><div class="row"><div class="bar big" style="--f:var(--a2);--fl:var(--a3)"><i id="a6-bb"></i></div><div class="pct" id="a6-bp"></div></div></div>
      <div class="score" id="a6-s2" style="right:32px;text-align:right;--k:var(--n8)"><div class="who" style="justify-content:flex-end"><span id="a6-s2n"></span><b>2P</b></div><div class="num"><small style="margin:0 10px 0 0">INSTAGRAM</small><span id="a6-s2v"></span></div></div>
    </div>
    <div id="a6-pend"><div class="n" id="a6-pn"></div><div class="w" id="a6-pw"></div><div class="s">esperando você</div></div>
    <div id="a6-aviso" hidden></div>
    <div id="a6-bot">
      <div class="pn" id="a6-mis"><div class="hd">MISSÕES</div><ul id="a6-misl"></ul></div>
      <div class="pn" id="a6-itens"><div class="hd">ITENS · <b id="a6-ino"></b> SHORTS NO AR HOJE</div><div class="slots" id="a6-slots"></div></div>
      <div class="pn" id="a6-pc"><div class="hd">PC</div><div class="hd2" id="a6-pcl"></div><div class="en"><span>CPU</span><div class="bar big" style="--f:var(--b2);--fl:var(--b3)"><i id="a6-pce"></i></div><b id="a6-pcv"></b></div><div class="rows" id="a6-pcr"></div></div>
    </div>
    <div id="a6-dlg"><div class="pt"><canvas id="a6-por" width="40" height="40"></canvas></div><div class="nm">ORÁCULO</div><div class="sb" id="a6-dsb"></div><div class="fr" id="a6-dfr"></div><canvas class="wv" id="a6-wav" width="395" height="6"></canvas><div class="ar" id="a6-dar"></div></div>
    <div id="a6-pcarta" hidden><b>HA HA</b><small id="a6-pcartaq"></small><span id="a6-pcartat"></span></div>
    <div id="a6-veu" hidden></div>
    <div id="a6-ficha" hidden role="dialog" aria-label="Detalhe"></div>
    <div id="a6-ensaio" hidden>ENSAIO</div>
  </div>
</div>`;
function criar(opts) {
opts = opts || {};
const host=document.createElement('div');host.id='andar';host.setAttribute('aria-hidden','true');host.hidden=true;host.innerHTML=HTML;(opts.dentro||document.body).appendChild(host);
if(opts.dentro||opts.teste)host.removeAttribute('aria-hidden');
if(opts.dentro){const ab=document.createElement('button');ab.id='a6-abre';ab.type='button';ab.textContent='Abrir a cena';host.appendChild(ab);}
/* ===== dados: o mesmo /api/estado da v6 (modo sala: dinheiro já vem oculto e aqui ninguém lê esse campo) ===== */
const D={pc:{},uso_claude:{},uso_tv:{},terminais:{lista:[],caidos:0},trabalhos:[],ativos:[],dark:{lista:[]},canais:[],alertas:[],tz:-180,agoraDado:0};
const Q=new URLSearchParams(location.search);
const TESTE=!!opts.teste;const TQ=k=>TESTE?Q.get(k):null;
const NA_TV=!opts.dentro;                       /* a câmera diretora é coisa da TV */
const CAMERA=TESTE?(Q.get('camera')!=='0'&&(NA_TV||Q.get('camera')==='1')):NA_TV;
const ENSAIO=TQ('ensaio');const ACEL=TQ('acelera')==='1'||!!ENSAIO;
let PEND=0;const PEND_Q=Q.get('pend');

/* ===== paleta (JARVIS/IDENTIDADE.md: preto de tinta, osso na janela, ciano anda, amarelo só espera você,
   dourado entregue hoje, roxo e verde só juntos e só no erro) ===== */
const P={ink:'#07070b',n1:'#0d1018',n2:'#141826',n3:'#1d2333',n4:'#2a3346',n5:'#3a4560',n6:'#5a6680',n7:'#9aa6bd',n8:'#eef2f8',
c1:'#0c3446',c2:'#1f8fb8',c3:'#38d6ff',a1:'#4a3c26',a2:'#a8926a',a3:'#f3e2b8',y1:'#4a3c10',y2:'#b89a3a',y3:'#ffe27a',
d1:'#5a3c14',d2:'#a8742a',d3:'#d99a3a',v1:'#2e1450',v2:'#6a2fb0',v3:'#a64dff',g1:'#14401e',g2:'#36a046',g3:'#5fe06a',
r1:'#3a0e14',r2:'#9a2030',r3:'#e04848',b1:'#16244a',b2:'#3a62a8',b3:'#8cb0e8',p1:'#1e1a2a',p2:'#3a3348',p3:'#6a6078',
s1:'#e2b896',s2:'#b8875f',s3:'#7a5236',s4:'#4a3020',w1:'#3a2a20',w2:'#5a4030',cab1:'#4a1c14',cab2:'#7a321f',cab3:'#a84a30',pl1:'#16302c',pl2:'#24443e'};
const TONE={c:[P.c1,P.c2,P.c3],y:[P.y1,P.y2,P.y3],v:[P.v1,P.v2,P.g3],d:[P.d1,P.d2,P.d3]};

/* ===== util ===== */
const WW=480,WH=270;          /* a torre (coordenadas de sempre) */
const CW=640,CH=360,OX=20,OY=75;   /* a cidade inteira; a torre fica em (OX,OY) e tudo sai em 3x na tela */
const TX=x=>(x+OX)*3,TY=y=>(y+OY)*3;
const cv=document.getElementById('a6-world'),G=cv.getContext('2d');G.imageSmoothingEnabled=false;
function mk(w,h,wr){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',wr?{willReadFrequently:true}:undefined);g.imageSmoothingEnabled=false;return [c,g];}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);}
function X(g,x,y,c){g.fillStyle=c;g.fillRect(x|0,y|0,1,1);}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function bay(x,y){return (BAY[(y&3)*4+(x&3)]+.5)/16;}
function gradV(g,x0,y0,w,h,cols){for(let y=0;y<h;y++){const f=y/(h-1)*(cols.length-1);const i=Math.min(cols.length-2,Math.floor(f));const fr=f-i;for(let x=0;x<w;x++)X(g,x0+x,y0+y,bay(x0+x,y0+y)<fr?cols[i+1]:cols[i]);}}
function dith(g,x0,y0,w,h,c,d){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(bay(x,y)<d)X(g,x,y,c);}
function outline(c,col){const g=c.getContext('2d');const W=c.width,H=c.height;const d=g.getImageData(0,0,W,H);const a=d.data;const op=i=>a[i*4+3]>0;const o=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(op(i))continue;if((x>0&&op(i-1))||(x<W-1&&op(i+1))||(y>0&&op(i-W))||(y<H-1&&op(i+W)))o.push(i);}
  g.fillStyle=col;for(const i of o)g.fillRect(i%W,(i/W)|0,1,1);return c;}
function espelho(c){const [c2,g2]=mk(c.width,c.height);g2.translate(c.width,0);g2.scale(-1,1);g2.drawImage(c,0,0);return c2;}
function lerp(a,b,k){return a+(b-a)*k}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function suave(a,b,v){const k=clamp((v-a)/(b-a),0,1);return k*k*(3-2*k);}
const semAc=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function hash(s){let h=2166136261;s=String(s||'');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function guarda(k,v){try{localStorage.setItem('andar-gotham-'+k,JSON.stringify(v));}catch(e){}}
function le(k,pad){try{const s=localStorage.getItem('andar-gotham-'+k);return s?JSON.parse(s):pad;}catch(e){return pad;}}

/* ===== a torre (mesma geometria da v6) ===== */
const ANDARES=[
 {id:'empresa', nome:'EMPRESA', topo:54, chao:84, rod:5},
 {id:'estudios',nome:'ESTÚDIOS',topo:88, chao:118,rod:5},
 {id:'mezanino',nome:'MEZANINO',topo:122,chao:150,rod:4},
 {id:'terreo',  nome:'TÉRREO',  topo:154,chao:222,rod:6}];
const AND=Object.fromEntries(ANDARES.map(a=>[a.id,a]));
const LAJES=[50,84,118,150,222];
const POCO={x0:362,x1:382,cx:372},TRONCO=359,NUCLEO={x:118,y:30};
const ESTUDIOS=[{id:'sites',nome:'Sites',x0:44,x1:122,k:'b'},{id:'estudos',nome:'Estudos',x0:124,x1:202,k:'g'},{id:'identidade',nome:'Identidade',x0:204,x1:280,k:'p'},{id:'vsl',nome:'VSL e Produtos',x0:282,x1:360,k:'a'}];
/* o telhado: gárgula do Batman, caixa d'água, torre do relógio, respiros, comissário, holofote, antena */
const RECUO=[62,418];             /* r4: o andar de cima e o telhado, recuados */
const CASA={x:50,y:51};               /* a gárgula do canto esquerdo: onde o Batman vigia */
const GORD={x:268,y:47};              /* o comissário, ao lado do holofote */
const HOLO={x:289,y:31};              /* a lente do holofote */
const SIN={x:390,y:-7};              /* o sinal no céu: à direita da torre do relógio do fundo (r3) */
const RELO={x:118,y:30};              /* mostrador da torre do relógio */

/* ===== luz do dia: Gotham não vê sol; 4 fases escuras com passagem suave ===== */
const FASES={
 noite:{ceu:['#07070b','#0a0d15','#0f131e','#151b29','#1d2536','#28324a','#36425c'],estrelas:1,nuvem:['#161c2a','#262e42'],
   longe:['#10141f','#1e2636'],meio:['#0a0d15','#182030'],perto:['#06080d','#121826'],jan:1,vidro:null,nevoa:'#2a3346',nevoa2:'#1d2333'},
 amanhecer:{ceu:['#0b0d14','#121624','#1a1f30','#262a3c','#3a3644','#584a4c','#7a6050'],estrelas:0,nuvem:['#2a2a38','#4a4048'],
   longe:['#262a38','#3a3a46'],meio:['#161a26','#2a2e3c'],perto:['#0e1018','#22242e'],jan:.5,vidro:'#4a4650',nevoa:'#4a4650',nevoa2:'#3a3a46'},
 dia:{ceu:['#1a1f2a','#212734','#29303e','#323a48','#3c4452','#464e5c','#505866'],estrelas:0,nuvem:['#3a414e','#4e5664'],
   longe:['#343b48','#444c5a'],meio:['#232934','#363e4c'],perto:['#161a22','#2c323e'],jan:.25,vidro:'#5a6270',nevoa:'#505866',nevoa2:'#444c5a'},
 entardecer:{ceu:['#08080e','#100f1a','#1a1624','#28192a','#3a1e2a','#58282a','#7a3a2a'],estrelas:0,nuvem:['#2a1a26','#4a2a2e'],
   longe:['#22182a','#3a2430'],meio:['#140f1a','#2a1c24'],perto:['#0c0a10','#221820'],jan:.8,vidro:'#5a3434',nevoa:'#3a2430',nevoa2:'#2a1c28'}};
const ORDEM=['noite','amanhecer','dia','entardecer'];
function pesos(h){
 const T=[[0,'noite'],[4.8,'noite'],[5.6,'amanhecer'],[7.1,'amanhecer'],[8.6,'dia'],[16.4,'dia'],[17.4,'entardecer'],[18.5,'entardecer'],[19.6,'noite'],[24,'noite']];
 for(let i=0;i<T.length-1;i++){const [a,fa]=T[i],[b,fb]=T[i+1];if(h>=a&&h<b){const k=suave(a,b,h);const w={noite:0,amanhecer:0,dia:0,entardecer:0};w[fa]+=1-k;w[fb]+=k;return w;}}
 return {noite:1,amanhecer:0,dia:0,entardecer:0};}

/* ===== moldes dos bonecos que trabalham e dormem (12 colunas, como na v6) ===== */
const HEAD_R=["...HHHHH....","..HHHHHHHH..",".HHHHHHHHHH.",".hHHHHSSSSH.",".hHHHsSSSES.",".hhHsSSSSES.","..hhSSSSSSS.","...hsSSSSs.."];
const HEAD_F=["...HHHHHH...","..HHHHHHHH..",".HHHHHHHHHH.",".HHSSSHSSHH.",".HSESSSSESH.",".hSESSSSESh.","..sSSSSSSs..","...sSSSSs..."];
const HEAD_U=["...HHHHH....","..HHHHHHHH..",".HHHHHHHSSH.",".hHHHHSSSES.",".hHHHsSSSSS.",".hhHsSSSSSS.","..hhSSSSSs..","...hsSSSs..."];
const sleepy=h=>h.map((r,i)=>r.replace(/E/g,i===5?'s':'S'));
const T_N=["....TTTT....","...TTTTTT...","...TTttTT...","...TTttTT...","...PPSSPP..."];
const T_F=["....TTTT....","...TTTTTT...","...TTTttT...","...TTTTttS..","...PPPPPP..."];
const T_BK=["....TTTT....","...TTTTTT...","...TttTTT...","..SttTTTT...","...PPPPPP..."];
const L_ST=["....pPPP....","....pp.PP...","....pp.PP...","....BB.BBB.."];
const L_A=["....pPPP....","...pp..PP...","..pp....PP..","..BB....BBB."];
const L_P=["....pPPP....","....pPPP....","....pPP.....","....BBBB...."];
const L_C=["....pPPP....","...PP..pp...","..PP....pp..",".BBB....BB.."];
const SIT_A=["....TTTT....","...TTTTTT...","...TTttTTT..","...TTTtttSS.","...PPPPPPP..","...pPPPPPPP.","........PP..","........PP..","........BBB."];
const SIT_B=["....TTTT....","...TTTTTT...","...TTttttSS.","...TTTTTT...","...PPPPPPP..","...pPPPPPPP.","........PP..","........PP..","........BBB."];
const SIT_D=["....TTTT....","...TTTTTT...","...TTTTTTT..","...TTTtttttS","...PPPPPPP..","...pPPPPPPP.","........PP..","........PP..","........BBB."];
const F_T=["...TTTTTT...","..TTTTTTTT..","..tTTTTTTt..","..tTTTTTTt..","..SPPPPPPS..","...PPPPPP...","...PP..PP...","...PP..PP...","..BBB..BBB.."];
const F_UP=[".S.TTTTTT.S.",".tTTTTTTTTt.","..TTTTTTTT..","..TTTTTTTT..","...PPPPPP...","...PPPPPP...","..PP....PP..","..BB....BB.."];
const F_SIT=["...TTTTTT...","..TTTTTTTT..","..tTTTTTTt..","..SPPPPPPS..","..PPPPPPPP..","...PP..PP...","...BB..BB..."];
const LIE=["..HHHH..............",".HHSSSS.............",".HSSSsS.TTTTTTTTT...",".HSSSSSTTTTTTTTTTTT.","WWWWWWWtTTTTTTTTTTTT","WWWWWWWttttttttttttt"];
function mir(rows){return rows.map(r=>r.split('').reverse().join(''));}
function build(parts,cm,flip){const [c,g]=mk(24,26);
  for(const p of parts){const rows=flip?mir(p.r):p.r;const dx=flip?(12-rows[0].length)-(p.x||0):(p.x||0);
    rows.forEach((row,yy)=>{for(let xx=0;xx<row.length;xx++){const ch=row[xx];if(ch==='.')continue;const col=cm[ch];if(!col)continue;X(g,4+xx+dx,1+(p.y||0)+yy,col);}});}
  return outline(c,cm.O||P.ink);}
function blit(s,x,y){G.drawImage(s,Math.round(x)-10,Math.round(y)-18);}
/* gente de Gotham: cabelo, pele e roupa em tons de sobretudo; nada de roxo, verde ou ciano na roupa (são estado) */
const HAIR=[[P.n1,P.ink],[P.s3,P.s4],['#8a6a3a','#5a4426'],['#6a3a26','#45241a'],[P.n7,P.n5],['#3a2a20','#221810'],[P.n5,P.n3],['#a88a5a','#6a5434'],['#2a1e1a',P.ink],[P.s4,P.n1]];
const SKIN=[[P.s1,P.s2],[P.s2,P.s3],[P.s3,P.s4]];
const SHIRT=[['#5a4a34','#3a3022'],['#3a4560','#232b3e'],['#6a5440','#463626'],['#34405a','#1e263a'],['#5a5a62','#3a3a42'],[P.n5,P.n4],[P.n6,P.n5],['#6a3a34','#42221e'],['#46505e','#2c343e']];
const PANTS=[[P.n3,P.n2],['#1a2236',P.n2],[P.n4,P.n3],[P.s4,P.n1]];
function cmap(h,s,t,p,dim){const H=HAIR[h],S=SKIN[s],T=SHIRT[t],Pp=PANTS[p];
  if(dim)return {H:H[1],h:H[1]===P.ink?P.ink:P.n1,S:S[1],s:S[1]===P.s4?P.n1:SKIN[Math.min(2,s+1)][1],E:P.ink,T:T[1],t:P.n2,P:Pp[1],p:P.n1,B:P.n1,W:P.n5,O:P.ink};
  return {H:H[0],h:H[1],S:S[0],s:S[1],E:P.ink,T:T[0],t:T[1],P:Pp[0],p:Pp[1],B:P.n1,W:P.n6,O:P.ink};}
function walkSet(cm){const fr=[[L_A,T_BK],[L_P,T_N],[L_C,T_F],[L_P,T_N]];const o={r:[],l:[]};
  for(const [L,T] of fr){const parts=[{r:HEAD_R},{r:T,y:8},{r:L,y:13}];o.r.push(build(parts,cm,false));o.l.push(build(parts,cm,true));}
  o.sr=build([{r:HEAD_R},{r:T_N,y:8},{r:L_ST,y:13}],cm,false);o.sl=build([{r:HEAD_R},{r:T_N,y:8},{r:L_ST,y:13}],cm,true);return o;}
/* ===== céu e cidade gótica, uma versão por fase (mesma geometria, cores da hora) ===== */
function pintaCeu(F){const [c,g]=mk(WW,WH);gradV(g,0,22,WW,206,F.ceu);
 if(F.estrelas){const rr=rng(7);for(let i=0;i<60;i++){const x=rr()*WW,y=24+rr()*60,k=rr();X(g,x,y,k<.15?P.n6:k<.5?P.n4:P.n3);}}
 return c;}
function pintaNuvem(F){const [c,g]=mk(960,WH);const rr=rng(21);
 for(let i=0;i<17;i++){const cx=rr()*960,cy=26+rr()*44,w=30+rr()*80,h=2+rr()*4;
  for(let y=-h;y<=h;y++)for(let x=-w;x<=w;x++){const e=(x/w)**2+(y/h)**2;if(e>1)continue;const xx=Math.round((cx+x+960)%960),yy=Math.round(cy+y);
   if(e>.55){if(bay(xx,yy)<.4)X(g,xx,yy,F.nuvem[0]);}else X(g,xx,yy,y<-h*.25?F.nuvem[1]:F.nuvem[0]);}}
 return c;}
/* prédio gótico: 0 ameias, 1 pináculo, 2 degraus art déco, 3 torrinhas nos cantos */
function gotico(g,x,top,w,body,rim,tipo){R(g,x,top,w,WH-top,body);R(g,x+w-1,top,1,WH-top,rim);R(g,x,top,w,1,rim);
 if(tipo===0){for(let k=x;k<x+w-1;k+=3)R(g,k,top-2,2,2,body);}
 else if(tipo===1){const h=Math.round(w*1.2);for(let k=0;k<h;k++){const hw=Math.max(0,Math.round((w/2-1)*(1-k/h)));R(g,x+(w>>1)-hw,top-k-1,hw*2,1,body);if(hw>0)X(g,x+(w>>1)+hw-1,top-k-1,rim);}R(g,x+(w>>1),top-h-5,1,5,rim);}
 else if(tipo===2){R(g,x+2,top-4,w-4,4,body);R(g,x+4,top-8,w-8,4,body);R(g,x+2,top-4,w-4,1,rim);R(g,x+4,top-8,w-8,1,rim);R(g,x+(w>>1),top-13,1,5,rim);}
 else {R(g,x,top-5,3,5,body);R(g,x+w-3,top-5,3,5,body);X(g,x+1,top-6,rim);X(g,x+w-2,top-6,rim);}}
function pintaLonge(F){const [c,g]=mk(560,WH);const rr=rng(3);let x=-6;const N=F===FASES.noite;
 while(x<560){const w=10+(rr()*20|0),top=70+(rr()*60|0),tipo=rr()*4|0;
  gotico(g,x,top,w,F.longe[0],F.longe[1],tipo);
  if(rr()<.25&&tipo!==1){const ax=x+(w>>1);R(g,ax,top-12,1,8,F.longe[1]);X(g,ax,top-13,N?P.r2:F.longe[1]);}
  for(let y=top+3;y<WH;y+=3)for(let xx=x+2;xx<x+w-2;xx+=2)if(rr()<.11){const k=rr();const col=k<F.jan*.7?(k<.12?P.a2:k<.3?'#7a6a4a':'#4a4232'):F.vidro;if(col)X(g,xx,y,col);}
  x+=w+(rr()*3|0);}
 /* os marcos de Gotham que passam do telhado: torres art déco, agulhas com antena, a torre do relógio ao longe, agulhas góticas */
 for(const [mx,mw,mt,tp] of [[128,10,25,'agulha'],[210,16,30,'deco'],[245,22,33,'relogio'],[280,12,27,'gotico'],[340,8,24,'agulha'],[400,15,30,'deco'],[470,12,34,'gotico']]){const body=N?'#171e2d':F.longe[0],rim=N?'#2c3650':F.longe[1];
  if(tp==='deco'){R(g,mx,mt+14,mw,WH,body);R(g,mx+2,mt+8,mw-4,6,body);R(g,mx+4,mt+3,mw-8,5,body);R(g,mx+(mw>>1),mt-5,1,8,rim);for(let k=0;k<3;k++)R(g,mx+2+k*2,mt+8-k*2,mw-4-k*4,1,rim);for(let y=mt+4;y<mt+14;y+=2){X(g,mx+3,y,rim);X(g,mx+mw-4,y,rim);}}
  else if(tp==='agulha'){R(g,mx,mt+10,mw,WH,body);for(let k=0;k<10;k++){const hw=Math.max(0,Math.round(mw/2*(k/10)));R(g,mx+(mw>>1)-hw,mt+k,hw*2+1,1,body);}R(g,mx+(mw>>1),mt-8,1,8,rim);X(g,mx+(mw>>1),mt-9,N?P.r2:rim);}
  else if(tp==='relogio'){R(g,mx,mt+12,mw,WH,body);R(g,mx+3,mt,mw-6,12,body);for(let k=0;k<6;k++)R(g,mx+3+k,mt-k,mw-6-k*2,1,body);const cx=mx+(mw>>1),cy=mt+6;for(let y=-3;y<=3;y++)for(let x2=-3;x2<=3;x2++)if(x2*x2+y*y<=10)X(g,cx+x2,cy+y,N?'#8a7a5a':rim);X(g,cx,cy-2,body);X(g,cx,cy-1,body);X(g,cx+1,cy,body);}
  else{R(g,mx,mt+12,mw,WH,body);for(const ox of [1,mw-4]){for(let k=0;k<12;k++){const hw=Math.round(1.5*(k/12));R(g,mx+ox+1-hw,mt+k,hw*2+1,1,body);}}}
  R(g,mx+mw-1,mt+12,1,WH,rim);
  for(let y=mt+16;y<WH;y+=3)for(let xx=mx+2;xx<mx+mw-2;xx+=2)if(rr()<.12)X(g,xx,y,rr()<.3?P.a2:'#5a4e38');}
 /* ponte pênsil ao longe, com as luzes do tabuleiro */
 {const y0=150,x0=330,x1=556,cd=F.longe[0],col=F.longe[1];
  for(const tx of [372,498]){R(g,tx,y0-36,7,42,cd);R(g,tx,y0-36,7,1,col);R(g,tx+2,y0-31,3,7,F.ceu[1]);X(g,tx+3,y0-32,F.ceu[1]);R(g,tx+3,y0-41,1,5,col);}
  R(g,x0,y0,x1-x0,3,cd);R(g,x0,y0,x1-x0,1,col);
  const cab=(a,b,ha,hb,sag)=>{for(let xx=a;xx<=b;xx++){const k=(xx-a)/(b-a);const y=Math.round(lerp(ha,hb,k)+Math.sin(k*Math.PI)*sag);X(g,xx,y,col);if(xx%5===0&&y<y0)R(g,xx,y+1,1,y0-y-1,cd);}};
  cab(x0,375,y0-1,y0-35,6);cab(376,501,y0-35,y0-35,24);cab(502,x1,y0-35,y0-6,6);
  for(let k=x0+4;k<x1;k+=8)X(g,k,y0+1,N?P.a2:col);}
 dith(g,0,110,560,40,F.nevoa2,.2);dith(g,0,150,560,120,F.nevoa,.32);return c;}
function pintaMeio(F){const [c,g]=mk(600,WH);const rr=rng(11);let x=-8;const N=F===FASES.noite;
 while(x<600){const w=20+(rr()*24|0),top=96+(rr()*46|0),tipo=rr()*4|0;
  gotico(g,x,top,w,F.meio[0],F.meio[1],tipo);
  if(rr()<.5){R(g,x-2,top+2,3,2,F.meio[0]);X(g,x-2,top+2,F.meio[1]);R(g,x+w-1,top+2,3,2,F.meio[0]);X(g,x+w+1,top+2,F.meio[1]);}
  if(tipo===0&&w>22&&rr()<.7){const wx=x+4+(rr()*(w-14)|0);R(g,wx+1,top-4,1,4,F.meio[1]);R(g,wx+6,top-4,1,4,F.meio[1]);R(g,wx,top-10,8,6,F.meio[0]);R(g,wx,top-10,8,1,F.meio[1]);for(let k=0;k<4;k++)R(g,wx+k,top-11-k,8-k*2,1,F.meio[0]);}
  const band=rr()<.35;
  for(let y=top+5;y<WH;y+=5){const rowLit=band&&rr()<.25;for(let xx=x+3;xx<x+w-5;xx+=5){const a=rr();if(rowLit||a<.2){const k=rr();const col=k<F.jan?(rowLit?P.a2:(k<.18*F.jan?P.a3:k<.6?P.a2:'#5a4e38')):F.vidro;if(col){R(g,xx,y,3,2,col);X(g,xx+1,y-1,col);}}}}
  if(rr()<.3){const sx=x+(rr()<.5?1:w-5),sy=top+6,sh=14+(rr()*14|0);R(g,sx,sy,4,sh,P.n1);R(g,sx+1,sy+1,2,sh-2,N?P.a1:F.meio[1]);for(let k=sy+3;k<sy+sh-2;k+=4)R(g,sx+1,k,2,1,N?P.a2:F.meio[1]);}
  x+=w+(rr()*4|0);}
 R(g,0,190,600,2,F.meio[0]);R(g,0,190,600,1,F.meio[1]);for(let k=10;k<600;k+=70){R(g,k,192,3,40,F.meio[0]);R(g,k-2,192,7,1,F.meio[1]);}
 return c;}
function pintaPerto(F){const [c,g]=mk(640,WH);const rr=rng(5);const B=[[0,152,70],[150,174,56],[300,144,80],[460,168,60],[560,158,70]];const N=F===FASES.noite;
 for(const [x,top,w] of B){R(g,x,top,w,WH-top,F.perto[0]);dith(g,x,top,w,WH-top,F.perto[1],.05);R(g,x,top,w,1,F.perto[1]);R(g,x+w-1,top,1,WH-top,F.perto[1]);
  for(let k=x;k<x+w-1;k+=4)R(g,k,top-2,2,2,F.perto[0]);
  for(let y=top+6;y<WH;y+=5)for(let xx=x+3;xx<x+w-4;xx+=5)if(rr()<.1){const k=rr();R(g,xx,y,3,2,k<F.jan?[P.a1,'#3a3224',P.a2][(k*30|0)%3]:(F.vidro||P.n2));}}
 /* letreiro de hotel apagado, sem texto */
 R(g,32,162,8,50,P.n1);R(g,33,163,6,48,N?P.a1:F.perto[1]);for(let k=166;k<208;k+=6)R(g,34,k,4,3,N?P.a2:F.perto[1]);if(N)dith(g,28,160,16,54,P.a1,.14);
 /* rosácea da catedral */
 {const cx=340,cy=168,r=10;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d>r)continue;let col;if(d>r-1.5)col=F.perto[1];else{const a=Math.atan2(y,x);const raio=Math.abs(Math.sin(a*4))<.22;col=raio||d<2.5?F.perto[1]:(N?(((x+y)&3)?P.p2:P.a1):F.perto[0]);}X(g,cx+x,cy+y,col);}
  for(let k=0;k<7;k++){X(g,cx-r-1+k,cy-r-1-k,F.perto[1]);X(g,cx+r+1-k,cy-r-1-k,F.perto[1]);}}
 /* torre de igreja */
 {const x=478,top=168;for(let k=0;k<24;k++){const hw=Math.max(0,Math.round(7*(1-k/24)));R(g,x+8-hw,top-k,hw*2,1,F.perto[0]);}R(g,x+8,top-30,1,6,F.perto[1]);R(g,x+6,top-28,5,1,F.perto[1]);}
 return c;}
/* a cidade de Gotham inteira, em 3 camadas com paralaxe; a torre é um prédio na frente dela */
function marco(g,mx,mw,mt,tp,body,rim,N){
 if(tp==='deco'){R(g,mx,mt+16,mw,CH,body);R(g,mx+2,mt+9,mw-4,7,body);R(g,mx+4,mt+3,mw-8,6,body);R(g,mx+(mw>>1),mt-7,1,10,rim);for(let k=0;k<3;k++)R(g,mx+2+k*2,mt+9-k*3,mw-4-k*4,1,rim);for(let y=mt+4;y<mt+16;y+=2){X(g,mx+3,y,rim);X(g,mx+mw-4,y,rim);}}
 else if(tp==='agulha'){R(g,mx,mt+12,mw,CH,body);for(let k=0;k<12;k++){const hw=Math.max(0,Math.round(mw/2*(k/12)));R(g,mx+(mw>>1)-hw,mt+k,hw*2+1,1,body);}R(g,mx+(mw>>1),mt-10,1,10,rim);X(g,mx+(mw>>1),mt-11,N?P.r2:rim);}
 else if(tp==='relogio'){R(g,mx,mt+16,mw,CH,body);R(g,mx+3,mt,mw-6,16,body);for(let k=0;k<8;k++)R(g,mx+3+k,mt-k,mw-6-k*2,1,body);const cx=mx+(mw>>1),cy=mt+7;for(let y=-4;y<=4;y++)for(let x2=-4;x2<=4;x2++)if(x2*x2+y*y<=17)X(g,cx+x2,cy+y,N?'#a8926a':rim);R(g,cx,cy-3,1,3,body);R(g,cx,cy,3,1,body);}
 else{R(g,mx,mt+14,mw,CH,body);for(const ox of [1,mw-4]){for(let k=0;k<14;k++){const hw=Math.round(1.5*(k/14));R(g,mx+ox+1-hw,mt+k,hw*2+1,1,body);}}R(g,mx+3,mt+14,mw-6,6,body);}
 R(g,mx+mw-1,mt+14,1,CH,rim);}
function janelas(g,x,top,w,rr,F,dens,brilho){for(let y=top+5;y<CH;y+=4)for(let xx=x+2;xx<x+w-3;xx+=4)if(rr()<dens){const k=rr();const col=k<F.jan?(k<brilho*F.jan?P.a3:k<.55?P.a2:'#5a4e38'):F.vidro;if(col){R(g,xx,y,2,2,col);X(g,xx,y-1,col===F.vidro?col:'#3a3224');}}}
function pintaCeuC(F){const [c,g]=mk(CW,CH);gradV(g,0,0,CW,300,F.ceu);R(g,0,300,CW,60,F.ceu[6]);
 if(F.estrelas){const rr=rng(7);for(let i=0;i<110;i++){const x=rr()*CW,y=4+rr()*130,k=rr();X(g,x,y,k<.15?P.n6:k<.5?P.n4:P.n3);}}return c;}
function pintaNuvemC(F){const [c,g]=mk(1280,CH);const rr=rng(21);
 for(let i=0;i<30;i++){const cx=rr()*1280,cy=16+rr()*150,w=40+rr()*110,h=3+rr()*6;
  for(let y=-h;y<=h;y++)for(let x=-w;x<=w;x++){const e=(x/w)**2+(y/h)**2;if(e>1)continue;const xx=Math.round((cx+x+1280)%1280),yy=Math.round(cy+y);
   if(e>.55){if(bay(xx,yy)<.4)X(g,xx,yy,F.nuvem[0]);}else X(g,xx,yy,y<-h*.25?F.nuvem[1]:F.nuvem[0]);}}return c;}
function pintaLongeC(F){const [c,g]=mk(760,CH);const rr=rng(3);let x=-6;const N=F===FASES.noite;
 while(x<760){const w=12+(rr()*24|0),top=70+(rr()*120|0),tipo=rr()*4|0;gotico(g,x,top,w,F.longe[0],F.longe[1],tipo);
  if(rr()<.25&&tipo!==1){const ax=x+(w>>1);R(g,ax,top-14,1,9,F.longe[1]);X(g,ax,top-15,N?P.r2:F.longe[1]);}
  janelas(g,x,top,w,rr,F,.06,.08);x+=w+(rr()*3|0);}
 const body=N?'#151c2b':F.longe[0],rim=N?'#2a3450':F.longe[1];
 for(const [mx,mw,mt,tp] of [[90,12,52,'gotico'],[150,10,34,'agulha'],[215,18,44,'deco'],[268,30,36,'relogio'],[330,14,50,'gotico'],[392,10,40,'agulha'],[450,18,46,'deco'],[520,14,56,'gotico'],[590,22,48,'deco'],[660,10,42,'agulha'],[715,26,50,'relogio']]){marco(g,mx,mw,mt,tp,body,rim,N);janelas(g,mx,mt+14,mw,rr,F,.09,.15);}
 dith(g,0,150,760,60,F.nevoa2,.18);dith(g,0,210,760,150,F.nevoa,.3);return c;}
function pintaMeioC(F){const [c,g]=mk(780,CH);const rr=rng(11);let x=-8;const N=F===FASES.noite;
 while(x<780){if(x>548&&x<760){x+=4;continue;}   /* aqui fica o rio com a ponte */
  const w=22+(rr()*26|0),top=150+(rr()*90|0),tipo=rr()*4|0;gotico(g,x,top,w,F.meio[0],F.meio[1],tipo);
  if(rr()<.5){R(g,x-2,top+2,3,2,F.meio[0]);X(g,x-2,top+2,F.meio[1]);R(g,x+w-1,top+2,3,2,F.meio[0]);X(g,x+w+1,top+2,F.meio[1]);}
  if(tipo===0&&w>22&&rr()<.7){const wx=x+4+(rr()*(w-14)|0);R(g,wx+1,top-4,1,4,F.meio[1]);R(g,wx+6,top-4,1,4,F.meio[1]);R(g,wx,top-10,8,6,F.meio[0]);R(g,wx,top-10,8,1,F.meio[1]);for(let k=0;k<4;k++)R(g,wx+k,top-11-k,8-k*2,1,F.meio[0]);}
  janelas(g,x,top,w,rr,F,.11,.14);
  if(rr()<.3){const sx=x+(rr()<.5?1:w-5),sy=top+6,sh=14+(rr()*14|0);R(g,sx,sy,4,sh,P.n1);R(g,sx+1,sy+1,2,sh-2,N?P.a1:F.meio[1]);for(let k=sy+3;k<sy+sh-2;k+=4)R(g,sx+1,k,2,1,N?P.a2:F.meio[1]);}
  x+=w+(rr()*4|0);}
 /* o rio e a ponte pênsil */
 {const x0=548,x1=772,yd=238;R(g,x0,yd+6,x1-x0,CH,N?'#0a0f18':F.meio[0]);for(let k=0;k<70;k++){const xx=x0+(rr()*(x1-x0)|0),yy=yd+10+(rr()*50|0);R(g,xx,yy,2+(rr()*4|0),1,N?(rr()<.5?'#3a3224':'#1d2536'):F.meio[1]);}
  const cd=F.meio[0],col=F.meio[1];for(const tx of [590,724]){R(g,tx,yd-62,8,70,cd);R(g,tx,yd-62,8,1,col);R(g,tx+2,yd-54,4,10,F.ceu[3]);X(g,tx+3,yd-55,F.ceu[3]);X(g,tx+4,yd-55,F.ceu[3]);R(g,tx+3,yd-68,2,6,col);X(g,tx+3,yd-69,N?P.r2:col);}
  R(g,x0,yd,x1-x0,4,cd);R(g,x0,yd,x1-x0,1,col);
  const cab=(a,b,ha,hb,sag)=>{for(let xx=a;xx<=b;xx++){const k=(xx-a)/(b-a);const y=Math.round(lerp(ha,hb,k)+Math.sin(k*Math.PI)*sag);X(g,xx,y,col);if(xx%5===0&&y<yd)R(g,xx,y+1,1,yd-y-1,cd);}};
  cab(x0,594,yd-1,yd-60,8);cab(594,728,yd-60,yd-60,40);cab(728,x1,yd-60,yd-8,8);for(let k=x0+4;k<x1;k+=7)X(g,k,yd+1,N?P.a2:col);}
 R(g,0,262,548,2,F.meio[0]);R(g,0,262,548,1,F.meio[1]);for(let k=10;k<548;k+=60){R(g,k,264,3,40,F.meio[0]);R(g,k-2,264,7,1,F.meio[1]);}
 return c;}
function pintaPertoC(F){const [c,g]=mk(800,CH);const rr=rng(5);const N=F===FASES.noite;
 const B=[[0,188,46],[40,214,60],[96,236,40],[700,236,46],[742,214,58]];
 for(const [x,top,w] of B){R(g,x,top,w,CH-top,F.perto[0]);dith(g,x,top,w,CH-top,F.perto[1],.05);R(g,x,top,w,1,F.perto[1]);R(g,x+w-1,top,1,CH-top,F.perto[1]);for(let k=x;k<x+w-1;k+=4)R(g,k,top-2,2,2,F.perto[0]);janelas(g,x,top,w,rr,F,.08,.1);}
 /* letreiro de hotel apagado, a rosácea da catedral, postes */
 R(g,52,224,8,50,P.n1);R(g,53,225,6,48,N?P.a1:F.perto[1]);for(let k=228;k<270;k+=6)R(g,54,k,4,3,N?P.a2:F.perto[1]);if(N)dith(g,48,222,16,54,P.a1,.14);
 if(0){const cx=650,cy=232,r=11;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d>r)continue;let col;if(d>r-1.5)col=F.perto[1];else{const a=Math.atan2(y,x);col=Math.abs(Math.sin(a*4))<.22||d<2.5?F.perto[1]:(N?(((x+y)&3)?P.p2:P.a1):F.perto[0]);}X(g,cx+x,cy+y,col);}}
 for(const lx of [20,120,600,700,780]){R(g,lx,262,1,40,F.perto[1]);R(g,lx-2,261,5,1,F.perto[1]);X(g,lx-1,262,N?P.a3:F.perto[1]);if(N)dith(g,lx-5,263,11,6,P.a1,.25);}
 return c;}
const CAMADAS={};
for(const f of ORDEM){const F=FASES[f];CAMADAS[f]={ceu:pintaCeuC(F),nuvem:pintaNuvemC(F),longe:pintaLongeC(F),meio:pintaMeioC(F),perto:pintaPertoC(F)};}
/* lua de Gotham e um sol que nunca passa da névoa */
function astro(r,cor,halo,halo2){const S=r+8;const [c,g]=mk(S*2,S*2);
 for(let y=-S;y<S;y++)for(let x=-S;x<S;x++){const d=Math.hypot(x+.5,y+.5);
  if(d<=r)X(g,S+x,S+y,cor);else if(d<=r+3){if(bay(S+x,S+y)<.45)X(g,S+x,S+y,halo);}else if(d<=r+7){if(bay(S+x,S+y)<.14)X(g,S+x,S+y,halo2);}}
 return c;}
const SOL={amanhecer:astro(7,'#c8a088','#6a5450','#3a3440'),dia:astro(6,'#8a909c','#5a606c','#3a404c'),entardecer:astro(7,'#b8604a','#6a3430','#3a2028')};
const LUA=(()=>{const [c,g]=mk(80,80);const m=40,r=22;
 for(let y=-r-12;y<=r+12;y++)for(let x=-r-12;x<=r+12;x++){const d=Math.hypot(x,y);
  if(d<=r){let col='#c9d3e6';if(x+y>5&&d>r-3)col='#9aa6bd';if((x+6)**2+(y+4)**2<20||(x-6)**2+(y-8)**2<16||(x-10)**2+(y+6)**2<8||(x+10)**2+(y-10)**2<8||(x-2)**2+(y+12)**2<6)col='#9aa6bd';X(g,m+x,m+y,col);}
  else if(d<=r+3){if(bay(m+x,m+y)<.45)X(g,m+x,m+y,'#3a4560');}else if(d<=r+11){if(bay(m+x,m+y)<.16)X(g,m+x,m+y,'#2a3346');}}return c;})();
/* dirigível (sem texto), com a faixa de luz em osso */
const [blC,bl]=mk(44,18);
(function(){for(let y=0;y<12;y++)for(let x=0;x<40;x++){const e=((x-19.5)/20)**2+((y-5.5)/6)**2;if(e<1)X(bl,x+2,y,y<3?P.n5:y>8?P.n2:P.n3);}
 R(bl,0,3,4,6,P.n2);R(bl,0,2,2,8,P.n3);R(bl,16,12,10,3,P.n2);R(bl,17,13,8,1,P.a1);X(bl,42,5,P.r2);R(bl,10,3,22,6,P.ink);})();
const CARS=[];{const rr=rng(9);const lanes=[[150,3,1],[210,5,2],[240,6,2],[293,10,3]];
 lanes.forEach((L,li)=>{for(let i=0;i<3;i++)CARS.push({y:L[0]+(rr()*5|0),v:L[1]*(rr()<.5?-1:1)*(.8+rr()*.4),s:L[2],x:rr()*560,l:li});});}
/* chuva: duas folhas pré-desenhadas que rolam (nada de partícula por gota) */
function folhaChuva(seed,n,cor,len){const [c,g]=mk(CW,CH);const rr=rng(seed);for(let i=0;i<n;i++){const x=rr()*CW|0,y=rr()*CH|0;for(let j=0;j<len;j++)X(g,(x+Math.round(j*.25))%CW,(y-j+CH)%CH,cor);}return c;}
const CHUVA=[folhaChuva(31,210,'#9fb0d0',4),folhaChuva(37,280,'#6a7a98',3)];
const GOTAS=[];{const rr=rng(41);for(let i=0;i<50;i++)GOTAS.push([rr()*480|0,58+(rr()*164|0)]);}
/* névoa que passa atrás da torre */
const [nvC,nv]=mk(960,110);{const rr=rng(81);for(let i=0;i<26;i++){const cx=rr()*960,cy=20+rr()*80,w=40+rr()*90,h=4+rr()*8;for(let y=-h;y<=h;y++)for(let x=-w;x<=w;x++){const e=(x/w)**2+(y/h)**2;if(e>1)continue;const xx=Math.round((cx+x+960)%960),yy=Math.round(cy+y);if(bay(xx,yy)<(1-e)*.45)X(nv,xx,yy,'#2a3346');}}}
/* morcegos: bando que sai da torre do relógio de vez em quando, e dois que rodam o relógio */
const MORC=[];{const rr=rng(55);for(let i=0;i<7;i++)MORC.push({ox:rr()*24,oy:rr()*10,a:rr()*6.28,v:.8+rr()*.4});}
function morcego(x,y,fr,c){x=Math.round(x);y=Math.round(y);X(G,x,y,c);X(G,x,y+1,c);if(fr){X(G,x-1,y-1,c);X(G,x+1,y-1,c);X(G,x-2,y-2,c);X(G,x+2,y-2,c);}else{X(G,x-1,y,c);X(G,x+1,y,c);X(G,x-2,y+1,c);X(G,x+2,y+1,c);X(G,x-3,y,c);X(G,x+3,y,c);}}

/* ===== interior gótico: duas pinturas (noite e dia nublado), a luz da hora mistura as duas ===== */
const LN={parede:'#0d1018',ext:'#1d2333',extHi:'#3a4560',extSh:'#07070b',teto:'#0b0e15',tetoL:'#1d2333',tetoM:'#2a3346',rodape:'#141826',rodapeL:'#2a3346',piso:'#3a4560',
 mont:'#0b0e15',montHi:'#1d2333',reflexo:'#1a2030',laje:'#0b0e15',lajeT:'#3a4560',lajeM:'#1d2333',poco:'#07070b',pocoL:'#141826',trilho:'#2a3346',cabo:'#0c2a36',
 m1:'#141826',m2:'#2a3346',m3:'#5a6680',mesa:'#2a3346',mesaT:'#5a6680',mad:'#3a2a20',mad2:'#5a4030',tela:'#0b0e15',pedra:'#1a2030',pedraHi:'#3a4560',pedraSh:'#0b0e15',arco:'#262e40',arcoHi:'#4e5a76',lousa:'#121a22',sofa:'#3a1e22',sofaHi:'#5a2e30',polt:'#262a3a',poltHi:'#3a4052'};
const LDIA={parede:'#2a303c',ext:'#3a4250',extHi:'#5a6474',extSh:'#1a1e26',teto:'#303644',tetoL:'#444c5a',tetoM:'#5a6270',rodape:'#363c4a',rodapeL:'#4a5262',piso:'#6a7282',
 mont:'#262c38',montHi:'#3e4654',reflexo:'#6a7282',laje:'#1e2430',lajeT:'#5a6474',lajeM:'#363e4c',poco:'#1a1e26',pocoL:'#2a303c',trilho:'#4a5262',cabo:'#1c3a46',
 m1:'#262c38',m2:'#3e4654',m3:'#7a8494',mesa:'#3e4654',mesaT:'#7a8494',mad:'#4a3a2c',mad2:'#6a5440',tela:'#1a1e26',pedra:'#3a4250',pedraHi:'#5a6474',pedraSh:'#1e2430',arco:'#4a5262',arcoHi:'#6a7488',lousa:'#1e2830',sofa:'#4a2a2c',sofaHi:'#6a3e3e',polt:'#3a3e4e',poltHi:'#525868'};
const DESKS=[{x:76,nm:'',who:null,hair:3,skin:0,shirt:0,pants:0},
 {x:138,nm:'',who:null,hair:1,skin:1,shirt:1,pants:2},
 {x:200,nm:'',who:null,hair:0,skin:2,shirt:2,pants:1},
 {x:262,nm:'',who:null,hair:4,skin:0,shirt:3,pants:0},
 {x:324,nm:'',who:null,hair:9,skin:1,shirt:4,pants:3}];
const DIG={'4':["##..##","##..##","##..##","######","######","....##","....##","....##"],'7':["######","######","....##","...##.","..##..","..##..",".##...",".##..."]};
const GARG=["..##........",".####..#....","#####.###...",".#########..","..#########.","...########.","....######..","....#....#.."];
function gargula(g,x,y,lado,L){GARG.forEach((row,yy)=>{for(let xx=0;xx<row.length;xx++){if(row[xx]!=='#')continue;const px=lado<0?x+xx:x+11-xx;const top=yy===0||GARG[yy-1][xx]!=='#';X(g,px,y+yy,top?L.pedraHi:yy>=6?L.pedraSh:L.pedra);}});}
const GARG2=["..##..................","..###...##............",".#####.####...........","######.#####..........","#.######.######.......",".########.#######.....","..#################...","...#################..","....################..","....##.############...","....##..##.....###....","...###..##.....####..."];
function gargulaG(g,x,y,lado,L){GARG2.forEach((row,yy)=>{for(let xx=0;xx<row.length;xx++){if(row[xx]!=='#')continue;const px=lado<0?x+xx:x+21-xx;const top=yy===0||GARG2[yy-1][xx]!=='#';X(g,px,y+yy,top?'#6a7690':yy>=9?'#262e3e':(xx+yy)%5===0?'#2e3648':'#424c62');}});
 X(g,lado<0?x+1:x+20,y+4,'#07070b');X(g,lado<0?x:x+21,y+5,'#262e3e');}
function pinaculo(g,x,yt,yb,L){R(g,x,yt+3,3,yb-yt-3,'#3a4458');R(g,x,yt+3,1,yb-yt-3,'#5e6a84');X(g,x+1,yt,'#6a7690');R(g,x+1,yt+1,1,2,L.pedra);for(let y=yt+4;y<yb-2;y+=3){X(g,x-1,y,L.pedra);X(g,x+3,y,L.pedraSh);}}
function pintaInterior(L,noite){const [c,g]=mk(WW,WH);
 R(g,40,50,400,176,L.parede);
 for(const A of ANDARES){const w0=A.topo+3,w1=A.chao-A.rod;
  g.clearRect(44,w0,392,w1-w0);g.fillStyle=noite?'rgba(10,12,20,.58)':'rgba(30,34,44,.4)';g.fillRect(44,w0,392,w1-w0);
  R(g,44,A.topo,392,3,L.teto);R(g,44,A.topo+2,392,1,L.tetoL);for(let k=52;k<436;k+=24)R(g,k,A.topo+1,8,1,L.tetoM);
  R(g,44,w1,392,A.rod,L.rodape);R(g,44,w1,392,1,L.rodapeL);R(g,44,A.chao-1,392,1,L.piso);
  /* vidraças ogivais: o alto de cada vão vira arco de pedra (arco quebrado de verdade, achatado) */
  const H=A.id==='terreo'?16:8;
  for(let mx=44;mx<436;mx+=49){const a0=mx+2,a1=Math.min(436,mx+49),half=(a1-a0)/2,cx=(a0+a1)/2;
   for(let r=0;r<H;r++){const yy=H-r-.5;const op=-half+Math.sqrt(Math.max(0,4*half*half-(yy*half*1.732/H)**2));
    for(let x=a0;x<a1;x++){const dx=Math.abs(x+.5-cx);if(dx>op)X(g,x,w0+r,L.arco);else if(dx>op-1.2)X(g,x,w0+r,L.arcoHi);}}
   R(g,Math.round(cx),w0+H-3,1,w1-w0-H+3,L.mont);X(g,Math.round(cx),w0+H-3,L.arcoHi);
   if(A.id==='terreo'){for(let q=0;q<14;q++){const an=q/14*6.283;X(g,Math.round(cx+Math.cos(an)*3.2),Math.round(w0+10+Math.sin(an)*3.2),L.arcoHi);}}}
  for(let mx=44;mx<=436;mx+=49){R(g,mx,w0,2,w1-w0,L.mont);R(g,mx+1,w0,1,w1-w0,L.montHi);}
  R(g,44,w0+Math.round((w1-w0)*.6),392,1,L.mont);
  for(const gx of [58,150,246,300,404]){for(let k=0;k<Math.min(12,w1-w0-H-2);k++){X(g,gx+k,w1-2-k,L.reflexo);}}
 }
 for(const y of LAJES){R(g,40,y,400,4,L.laje);R(g,40,y,400,1,L.lajeT);for(let k=44;k<436;k+=6)X(g,k,y+2,L.lajeM);for(let k=42;k<438;k+=4)X(g,k,y+3,L.extSh);}
 R(g,40,50,4,176,L.ext);R(g,436,50,4,176,L.ext);R(g,40,50,1,176,L.extHi);R(g,439,50,1,176,L.extSh);
 /* contrafortes de pedra por fora, com degrau em cada laje, e gárgulas nas lajes */
 for(const [x,lado] of [[35,-1],[440,1]]){R(g,x,120,5,106,L.pedra);R(g,lado<0?x:x+4,120,1,106,lado<0?L.pedraHi:L.pedraSh);
  for(const y of LAJES.slice(3)){R(g,x-1,y-1,7,3,L.pedra);R(g,x-1,y-1,7,1,L.pedraHi);}
  for(let y=124;y<224;y+=7)R(g,x+1,y,3,1,L.pedraSh);}
 /* r3: base larga no mezanino e no térreo, com capa inclinada: os 2 andares de cima ficam recuados e a torre deixa de ser caixa */
 for(const [x,lado] of [[27,-1],[445,1]]){R(g,x,124,8,102,'#262e40');R(g,lado<0?x:x+7,124,1,102,lado<0?'#4e5a76':L.pedraSh);R(g,x,150,8,2,'#4e5a76');R(g,x,151,8,1,L.pedraSh);
  for(let i=0;i<8;i++){const xx=lado<0?x+i:x+7-i;R(g,xx,123-i,1,i+2,'#262e40');X(g,xx,123-i,'#4e5a76');}
  for(let y=128;y<224;y+=6)R(g,x+2,y,4,1,L.pedraSh);}
 for(const y of [84,118,150]){gargula(g,24,y-7,-1,L);gargula(g,445,y-7,1,L);}
 /* poço do elevador e o tronco de cabos */
 R(g,POCO.x0,54,20,172,L.poco);R(g,POCO.x0,54,1,172,L.trilho);R(g,POCO.x1-1,54,1,172,L.trilho);
 for(let y=56;y<222;y+=14){for(let k=0;k<12;k++){X(g,POCO.x0+4+k*1.2,y+k,L.pocoL);X(g,POCO.x1-5-k*1.2,y+k,L.pocoL);}}
 for(const A of ANDARES){R(g,POCO.x0,A.chao,20,1,L.lajeT);R(g,POCO.x0-1,A.topo,1,A.chao-A.topo,L.trilho);R(g,POCO.x1,A.topo,1,A.chao-A.topo,L.trilho);R(g,POCO.x0+7,A.topo+2,6,2,L.m1);}
 R(g,TRONCO,54,2,168,L.cabo);for(let y=58;y<222;y+=10)R(g,TRONCO-1,y,4,1,L.m2);
 for(const A of ANDARES){R(g,44,A.topo+3,392,1,L.cabo);for(let k=48;k<436;k+=16)X(g,k,A.topo+4,L.m2);}
 R(g,134,40,1,10,L.cabo);R(g,134,50,225,1,L.cabo);
 /* telhado: parapeito com ameias, gárgulas nos cantos, caixa d'água, torre do relógio, respiros, holofote, antena, parabólica */
 R(g,40,47,400,3,L.ext);R(g,40,47,400,1,L.extHi);for(let k=42;k<438;k+=8){R(g,k,43,5,4,L.ext);R(g,k,43,5,1,L.extHi);R(g,k+4,44,1,3,L.extSh);}
 R(g,34,50,412,2,L.pedra);R(g,34,50,412,1,L.pedraHi);for(let k=36;k<444;k+=4)X(g,k,52,L.pedraSh);
 gargulaG(g,13,46,-1,L);gargulaG(g,446,46,1,L);
 for(const [px,yt] of [[36,29],[441,29],[196,33],[232,33]])pinaculo(g,px,yt,47,L);
 {g.save();g.translate(8,0);for(const lx of [60,66,72,78])R(g,lx,38,1,9,L.m2);R(g,59,41,21,1,L.m1);R(g,58,28,22,11,L.mad);R(g,58,28,22,1,L.mad2);for(let k=60;k<80;k+=4)R(g,k,29,1,10,L.mad2);R(g,58,31,22,1,'#2a1e16');R(g,58,36,22,1,'#2a1e16');
  for(let k=0;k<6;k++)R(g,58+k*2,27-k,22-k*4,1,k%2?L.m2:L.m1);g.restore();}
 {const cx=RELO.x,cy=RELO.y;R(g,104,36,29,11,L.pedra);R(g,104,36,29,1,L.pedraHi);R(g,104,36,1,11,L.pedraHi);R(g,132,36,1,11,L.pedraSh);
  for(const px of [102,131]){R(g,px,31,3,5,L.pedra);X(g,px+1,29,L.pedraHi);X(g,px+1,30,L.pedra);}
  R(g,109,22,19,14,L.pedra);R(g,109,22,1,14,L.pedraHi);R(g,127,22,1,14,L.pedraSh);
  for(let k=0;k<40;k++){const hw=Math.round(9*(1-k/40));R(g,118-hw,21-k,hw*2+1,1,'#232a3c');X(g,118-hw,21-k,'#5e6a84');if(hw>0)X(g,118+hw,21-k,L.pedraSh);if(k%6===3&&hw>1){X(g,118-hw-1,21-k,'#3a4560');X(g,118+hw+1,21-k,L.pedraSh);}}
  for(const [y,h] of [[12,4],[3,3],[-5,2]]){R(g,118,y,1,h,noite?'#a8926a':'#5a6270');}   /* r3: frestas acesas na agulha: ela é da torre, não do fundo */R(g,118,-24,1,5,L.pedraHi);R(g,116,-22,5,1,L.pedraHi);X(g,118,-25,P.c3);
  for(let y=-7;y<=7;y++)for(let x=-7;x<=7;x++){const d=Math.hypot(x,y);if(d<=7.2)X(g,cx+x,cy+y,d>6.2?L.mad2:noite?'#141a22':'#3a4250');}
  for(let i=0;i<12;i++){const a=i/12*6.283;X(g,Math.round(cx+Math.cos(a)*5.3),Math.round(cy+Math.sin(a)*5.3),noite?'#8a7a5a':'#9aa6bd');}
  const put=(Dg,x0)=>Dg.forEach((r,y)=>{for(let x=0;x<6;x++)if(r[x]==='#')X(g,x0+x,39+y,noite?'#a8926a':'#7a8494');});put(DIG['4'],110);put(DIG['7'],121);}
 for(const vx of [148,156]){R(g,vx,38,4,9,L.m2);R(g,vx-1,37,6,2,L.m3);R(g,vx+1,39,1,7,L.m1);}
 {const x=HOLO.x;R(g,x-5,46,11,1,L.m1);R(g,x-4,41,1,5,L.m2);R(g,x+4,41,1,5,L.m2);R(g,x,41,1,5,L.m2);R(g,x-3,40,7,1,L.m3);
  R(g,x-4,32,9,8,L.m2);R(g,x-4,32,9,1,L.m3);R(g,x-4,32,1,8,L.m3);R(g,x+4,32,1,8,L.m1);R(g,x-5,34,1,4,L.m1);for(let k=0;k<3;k++)X(g,x-3+k*3,39,L.m1);}
 {R(g,352,28,1,19,L.m2);R(g,349,34,7,1,L.m2);R(g,350,39,5,1,L.m2);}
 {const x=398;R(g,x,38,2,9,L.m2);for(let k=0;k<8;k++)R(g,x-6+k*1.5,36-Math.round(Math.sqrt(k)*1.4),2,1,L.m3);R(g,x-6,37,13,1,L.m2);R(g,x+1,32,1,4,L.m2);}
 /* EMPRESA: cafeteira, mesa de reunião, lousa da Bússola, filtro, planta */
 {const A=AND.empresa,ch=A.chao;
  mesinha(g,L,72,ch);
  R(g,128,ch-10,66,1,L.mesaT);R(g,128,ch-9,66,2,L.mesa);R(g,132,ch-7,2,6,L.m1);R(g,188,ch-7,2,6,L.m1);
  for(const cx of [136,156,176]){R(g,cx,ch-15,8,1,L.m2);R(g,cx,ch-14,1,6,L.m2);R(g,cx,ch-9,8,1,L.m2);R(g,cx+1,ch-8,1,7,L.m1);}
  {const bx=212,by=ch-26;R(g,bx+3,by+18,1,8,L.m1);R(g,bx+37,by+18,1,8,L.m1);R(g,bx,by,42,18,L.mad);R(g,bx+1,by+1,40,16,L.lousa);
   R(g,bx+4,by+10,26,5,P.ink);for(let i=0;i<6;i++)R(g,bx+5+i*4,by+5,3,1,P.n6);R(g,bx+5,by+3,10,1,P.a2);
   const cx=bx+33,cy=by+6;for(let a=0;a<16;a++)X(g,cx+Math.round(Math.cos(a/16*6.283)*3.4),cy+Math.round(Math.sin(a/16*6.283)*3.4),P.a2);X(g,cx,cy-2,P.a3);X(g,cx,cy-1,P.a3);X(g,cx,cy+1,P.n6);X(g,cx,cy+2,P.n6);}
  {const x=316;R(g,x-6,ch-10,40,1,L.mesaT);R(g,x-6,ch-9,40,9,L.m2);R(g,x-6,ch-9,40,1,L.m3);
   R(g,x+12,ch-22,14,12,L.m1);R(g,x+12,ch-22,14,1,L.m3);R(g,x+14,ch-20,10,3,P.n1);X(g,x+15,ch-19,P.a2);R(g,x+16,ch-15,6,4,P.n1);R(g,x+17,ch-13,4,2,P.n6);
   R(g,x,ch-14,3,4,P.a2);R(g,x+4,ch-14,3,4,P.n6);}
  {const x=394;R(g,x,ch-20,10,20,L.m2);R(g,x,ch-20,10,1,L.m3);R(g,x+2,ch-28,6,8,'#34506a');R(g,x+2,ch-28,6,1,'#5a7a9a');R(g,x+3,ch-12,4,2,L.m1);}
  {const px=418;R(g,px,ch-8,10,8,L.mad);R(g,px,ch-8,10,1,L.mad2);for(const [lx,ly] of [[419,-16],[422,-18],[425,-15],[421,-13],[426,-12]])R(g,lx,ch+ly,2,7,P.pl1);X(g,423,ch-18,P.pl2);X(g,420,ch-16,P.pl2);}
 }
 /* ESTÚDIOS: Sites, Estudos, Identidade, VSL */
 {const A=AND.estudios,ch=A.chao;
  for(const x of [122,202,280]){R(g,x,A.topo,2,A.chao-A.topo,L.ext);X(g,x,A.topo+3,L.extHi);R(g,x,A.topo+3,1,A.chao-A.topo-3,L.extHi);}
  {const x=52;R(g,x,ch-26,30,18,L.m1);R(g,x+1,ch-25,28,16,noite?'#0f141c':'#3a4452');const b=noite?'#1d2838':'#4a5a70',b2=noite?'#161e2c':'#5a6a80';
   R(g,x+3,ch-23,24,2,b);R(g,x+3,ch-19,11,6,b2);R(g,x+16,ch-19,11,2,b);R(g,x+16,ch-16,8,1,b2);R(g,x+3,ch-12,24,1,b2);R(g,x+14,ch-8,2,7,L.m1);R(g,x+9,ch-2,12,1,L.m2);}
  poltrona(g,L,102,ch);
  {const x=128;R(g,x,ch-26,34,26,L.mad);for(const y of [ch-25,ch-17,ch-9]){R(g,x+1,y,32,7,'#1e140e');const rr=rng(y*7);let k=x+2;while(k<x+31){const w=1+(rr()*2|0),h=5+(rr()*2|0);R(g,k,y+7-h,w,h,[P.r1,P.b1,'#4a3a2a',P.a1,P.p2,P.n5][rr()*6|0]);k+=w+(rr()<.2?1:0);}}}
  mesinha(g,L,176,ch);
  {const x=210;R(g,x+3,ch-20,1,20,L.mad);R(g,x+19,ch-20,1,20,L.mad);R(g,x+11,ch-24,1,24,L.mad2);R(g,x,ch-26,23,16,noite?'#a8a294':'#c8c2b4');R(g,x,ch-26,23,1,L.m3);
   for(let y=0;y<10;y++)for(let xx=0;xx<10;xx++){const d=Math.hypot(xx-4.5,y-4.5);if(d<4.8&&d>2.2)X(g,x+6+xx,ch-23+y,xx<5?P.n4:P.a1);}R(g,x+10,ch-21,3,6,P.n5);
   R(g,x+26,ch-4,8,4,L.m2);X(g,x+27,ch-5,P.r2);X(g,x+29,ch-5,P.b2);X(g,x+31,ch-5,P.a2);}
  pufe(g,262,ch,P.n5,P.n4);
  {const x=290;R(g,x+3,ch-14,1,14,L.m1);R(g,x,ch-2,8,1,L.m1);X(g,x+1,ch-3,L.m1);X(g,x+6,ch-3,L.m1);R(g,x-1,ch-20,10,6,L.m1);R(g,x+8,ch-19,3,4,L.m2);X(g,x+9,ch-18,noite?P.r1:P.r2);
   R(g,x+16,ch-24,12,9,L.m3);R(g,x+17,ch-23,10,7,noite?'#2a2a3a':'#8a8a7a');R(g,x+21,ch-15,1,15,L.m1);R(g,x+18,ch-1,8,1,L.m1);}
  poltrona(g,L,324,ch);poltrona(g,L,346,ch);
  {const x=392;R(g,x,ch-10,36,6,L.m2);R(g,x,ch-10,36,1,L.m3);R(g,x-2,ch-14,4,14,L.m2);R(g,x+34,ch-14,4,14,L.m2);R(g,x,ch-4,36,2,L.m1);}
 }
 /* MEZANINO: beliches, sofá de couro, pufes, colchonetes, rede */
 {const A=AND.mezanino,ch=A.chao;
  for(const x of [48,82,116]){R(g,x,ch-24,2,24,L.m2);R(g,x+28,ch-24,2,24,L.m2);X(g,x,ch-24,L.m3);X(g,x+28,ch-24,L.m3);for(const y of [ch-15,ch-2]){R(g,x,y,30,2,L.mad2);R(g,x,y,30,1,L.mad);}R(g,x+2,ch-24,26,1,L.m2);}
  {const x=150;R(g,x,ch-20,50,12,L.sofa);R(g,x,ch-20,50,1,L.sofaHi);R(g,x-2,ch-14,4,12,L.sofa);R(g,x+48,ch-14,4,12,L.sofa);R(g,x,ch-8,50,5,L.sofa);R(g,x,ch-8,50,1,L.sofaHi);R(g,x,ch-3,50,1,P.n1);R(g,x+1,ch-2,2,2,P.n1);R(g,x+47,ch-2,2,2,P.n1);}
  for(const bx of [206,226,246,266]){const i=(bx/20|0)%4;pufe(g,bx+9,ch,[P.n5,'#4a3a30',P.a1,P.p2][i],[P.n4,'#3a2a20','#3a3020',P.p1][i]);}
  R(g,288,ch-1,72,1,'#2a1c20');dith(g,288,ch-2,72,1,'#2a1c20',.5);
  R(g,388,ch-24,2,24,L.m2);R(g,430,ch-24,2,24,L.m2);
 }
 /* TÉRREO: as 5 mesas (a cadeira é desenhada viva, pra poder girar) e o canto das pendências */
 {const A=AND.terreo,ch=A.chao,o=ch-200;
  {const rr=rng(77);for(let i=0;i<50;i++){const x=44+rr()*312|0;dith(g,x,ch,1+(rr()*2|0),3,[P.n2,P.n3,P.p1][rr()*3|0],.5);}}
  for(const d of DESKS){const cx=d.x;
   R(g,cx-15,189+o,37,1,L.mesaT);R(g,cx-15,190+o,37,2,L.mesa);R(g,cx-14,192+o,2,8,L.m1);R(g,cx+19,192+o,2,8,L.m1);
   R(g,cx+8,192+o,9,8,L.m1);R(g,cx+8,192+o,9,1,L.m2);X(g,cx+10,194+o,P.n6);R(g,cx+10,197+o,5,1,L.m2);
   R(g,cx-8,170+o,21,16,P.n2);R(g,cx-8,170+o,21,1,P.n4);R(g,cx+2,186+o,2,3,L.m2);R(g,cx-1,188+o,8,1,L.m3);
   R(g,cx+15,185+o,3,4,P.n6);X(g,cx+18,186+o,P.n6);X(g,cx+15,185+o,P.n7);}
  {const x=46;R(g,x,ch-9,8,9,L.mad);R(g,x,ch-9,8,1,L.mad2);for(const [lx,ly] of [[47,-20],[50,-23],[53,-19],[48,-16],[52,-15]])R(g,lx,ch+ly,2,9,P.pl1);X(g,51,ch-23,P.pl2);X(g,47,ch-20,P.pl2);X(g,54,ch-19,P.pl2);}
  {const x=386;R(g,x,ch-26,4,6,L.m1);X(g,x+1,ch-25,P.c2);X(g,x+2,ch-23,P.a3);}
 }
 /* poste da rua, do lado de fora (a Gazeta de Gotham gruda aqui na segunda rodada) */
 {R(g,14,150,2,76,L.m2);R(g,14,150,1,76,L.m3);R(g,10,148,9,2,L.m2);R(g,8,150,4,3,L.m1);R(g,9,153,2,1,noite?P.a3:P.n6);R(g,12,222,6,4,L.m1);}
 /* luminárias: à noite, cada andar tem poça de luz osso no chão */
 if(noite){for(const A of ANDARES){const n=A.id==='terreo'?[107,231,293]:[96,170,250,330];for(const lx of n){R(g,lx,A.topo+3,1,3,L.m2);R(g,lx-2,A.topo+6,5,2,P.a1);R(g,lx-1,A.topo+8,3,1,P.a3);
   for(let x=-13;x<=13;x++){const f=1-Math.abs(x)/13;if(bay(lx+x,A.chao-2)<.8*f)X(g,lx+x,A.chao-2,f>.6?P.a2:P.a1);if(bay(lx+x,A.chao-3)<.35*f)X(g,lx+x,A.chao-3,P.a1);}}}}
 /* noite: os andares de quem dorme ficam mais escuros, com luar no chão */
 if(noite){g.globalCompositeOperation='source-atop';
  g.globalAlpha=.3;for(const id of ['empresa','estudios','mezanino']){const A=AND[id];R(g,44,A.topo,318,A.chao-A.topo,'#050508');R(g,384,A.topo,52,A.chao-A.topo,'#050508');}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  for(const id of ['empresa','estudios','mezanino']){const A=AND[id];for(const x0 of [66,180,300]){for(let k=0;k<14;k++)dith(g,x0+k*1.4,A.chao-1,6,1,P.n4,.5);}}}
 /* r4: o andar de cima recua 22 px de cada lado (a cidade aparece nos cantos) e o telhado vira 2 degraus: a torre deixa de ser caixa */
 {const A0=RECUO[0],A1=RECUO[1];g.clearRect(0,0,A0,86);g.clearRect(A1,0,WW-A1,86);
  for(const [x,w] of [[34,A0-34],[A1,446-A1]]){R(g,x,82,w,4,L.pedra);R(g,x,82,w,1,L.pedraHi);for(let k=x+2;k<x+w-4;k+=8){R(g,k,78,5,4,L.ext);R(g,k,78,5,1,L.extHi);}}
  R(g,A0,43,4,43,L.ext);R(g,A0,43,1,43,L.extHi);R(g,A1-4,43,4,43,L.ext);R(g,A1-1,43,1,43,L.extSh);
  R(g,A0-2,50,A1-A0+4,2,L.pedra);R(g,A0-2,50,A1-A0+4,1,L.pedraHi);
  gargula(g,24,77,-1,L);gargula(g,445,77,1,L);gargulaG(g,A0-17,46,-1,L);gargulaG(g,A1-4,46,1,L);pinaculo(g,A0-1,29,47,L);pinaculo(g,A1-2,29,47,L);}
 return c;}
function mesinha(g,L,dx,ch){R(g,dx,ch-11,22,1,L.m3);R(g,dx,ch-10,22,2,L.m2);R(g,dx+1,ch-8,2,8,L.m2);R(g,dx+19,ch-8,2,8,L.m2);R(g,dx+8,ch-22,13,10,L.m1);R(g,dx+9,ch-21,11,8,L.tela);X(g,dx+10,ch-20,L.m2);R(g,dx+13,ch-12,3,1,L.m2);
 R(g,dx-8,ch-14,2,14,L.m2);R(g,dx-8,ch-6,10,2,L.m2);}
function poltrona(g,L,x,ch){R(g,x-8,ch-14,16,4,L.polt);R(g,x-8,ch-14,16,1,L.poltHi);R(g,x-10,ch-10,4,9,L.polt);R(g,x+6,ch-10,4,9,L.polt);R(g,x-10,ch-10,4,1,L.poltHi);R(g,x+6,ch-10,4,1,L.poltHi);R(g,x-7,ch-6,14,4,L.polt);R(g,x-7,ch-6,14,1,L.poltHi);R(g,x-8,ch-2,2,2,P.n1);R(g,x+6,ch-2,2,2,P.n1);}
function pufe(g,cx,ch,c1,c0){for(let y=0;y<8;y++)for(let x=0;x<18;x++){const e=((x-8.5)/9)**2+((y-8)/8)**2;if(e<1)X(g,cx-9+x,ch-8+y,y<2?c1:c0);}}
const INT={noite:pintaInterior(LN,true),dia:pintaInterior(LDIA,false)};
/* brilho de cada mesa no vidro de trás, pelo estado: ciano anda, amarelo espera, Coringa erro, dourado entregou */
const BRILHO={};for(const k of ['c','y','v','d']){const [c,g]=mk(40,34);dith(g,0,0,40,34,TONE[k][0],.22);dith(g,4,5,32,26,TONE[k][0],.45);BRILHO[k]=c;}

/* ===== quem dorme (pintado uma vez) ===== */
const ZS=[];const [slC,slg]=mk(WW,WH);let REDE=null;
(function(){const rr=rng(99);const pick=()=>({h:(rr()*HAIR.length)|0,s:(rr()*3)|0,t:(rr()*SHIRT.length)|0,p:(rr()*4)|0});
 const cmD=()=>{const a=pick();const cm=cmap(a.h,a.s,a.t,a.p,true);cm.W=P.n5;return cm;};
 const lie=(x,y)=>{const s=build([{r:LIE}],cmD(),false);slg.drawImage(s,x-4,y-7);ZS.push([x+3,y-8,rr()*9]);};
 const sitF=(x,y,tilt)=>{const s=build([{r:F_SIT,y:8},{r:sleepy(HEAD_F),x:tilt,y:1}],cmD(),false);slg.drawImage(s,x-10,y-17);ZS.push([x+tilt*2+2,y-17,rr()*9]);};
 const desk=(x,ch)=>{const s=build([{r:SIT_D,y:8},{r:sleepy(HEAD_R),x:2,y:3}],cmD(),false);slg.drawImage(s,x-11,ch-20);ZS.push([x+4,ch-19,rr()*9]);};
 const M=AND.mezanino.chao;
 for(const bx of [48,82,116])for(const y of [M-15,M-2])lie(bx+5,y);
 sitF(159,M-4,-1);sitF(170,M-4,1);sitF(181,M-4,-1);sitF(192,M-4,1);
 for(const bx of [206,226,246,266])sitF(bx+9,M-2,(bx/20|0)%2?1:-1);
 for(const x of [292,316,340]){const cm=cmD();cm.T=['#2a2420',P.b1,P.r1][x%3];cm.t=P.n1;const s=build([{r:LIE}],cm,false);slg.drawImage(s,x-4,M-8);ZS.push([x+3,M-9,rr()*9]);}
 REDE=build([{r:LIE}],cmD(),false);ZS.push([400,M-17,rr()*9,1]);
 const E=AND.empresa.chao,S=AND.estudios.chao;
 desk(72,E);desk(176,S);
 sitF(102,S-4,1);sitF(324,S-4,-1);sitF(346,S-4,1);sitF(262,S-2,-1);
})();
/* ===== quem trabalha, quem anda, quem espera ===== */
const WORK=DESKS.map((d,i)=>{const cm=cmap(d.hair,d.skin,d.shirt,d.pants,false);
  return {d,A:build([{r:HEAD_R},{r:SIT_A,y:8}],cm,false),B:build([{r:HEAD_R},{r:SIT_B,y:8}],cm,false),L:build([{r:HEAD_R},{r:SIT_A,y:8}],cm,true),U:build([{r:HEAD_U,y:-1},{r:SIT_A,y:8}],cm,false),seed:i*1.7};});
const WALK=[{set:walkSet(cmap(6,0,6,1,false)),y:AND.terreo.chao,path:[['w',58,350],['i',350,3],['w',350,58],['i',58,4]],ph:6},
 {set:walkSet(cmap(2,1,8,0,false)),y:AND.empresa.chao,path:[['w',110,300],['i',300,5],['w',300,110],['i',110,3]],ph:2}];
WALK.forEach(w=>{let T=0;w.seg=w.path.map(s=>{const d=s[0]==='w'?Math.abs(s[2]-s[1])/8:s[2];const o={s,t0:T,d};T+=d;return o;});w.T=T;});
const JUMP=[{x:398,ph:0,cm:cmap(7,1,7,0,false)},{x:424,ph:.45,cm:cmap(8,0,5,3,false)}];
JUMP.forEach(j=>{j.st=build([{r:HEAD_F},{r:F_T,y:8}],j.cm,false);j.up=build([{r:HEAD_F},{r:F_UP,y:8}],j.cm,false);});
function glyph(rows,col,oc,wc){const [c,g]=mk(rows[0].length+2,rows.length+2);rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]!=='.')X(g,x+1,y+1,r[x]==='w'?(wc||P.n8):col);});return oc?outline(c,oc):c;}
const BANG=glyph(["rrrrrrr","rrrwrrr","rrrwrrr","rrrwrrr","rrrrrrr","rrrwrrr","rrrrrrr","..rr...","..r...."],P.y3,P.ink,P.ink);
const QM=glyph([".###.","#...#","....#","..##.","..#..",".....","..#.."],P.c3,P.ink);
function zGlyph(big,col){return glyph(big?["####","...#","..#.",".#..","####"]:["###","..#",".#.","###"],col,null);}
const ZC={};for(const b of [0,1])for(const c of ['n7','n6','n5'])ZC[b+c]=zGlyph(b,P[c]);
/* letras de pixel pro HA HA pichado e o he do Coringa */
const LET={H:["#.#","#.#","###","#.#","#.#"],A:[".#.","#.#","###","#.#","#.#"],E:["###","#..","##.","#..","###"],' ':["...","...","...","...","..."]};
function texto(s,col,oc){const [c,g]=mk(s.length*4+1,7);let x=1;for(const ch of s){(LET[ch]||LET[' ']).forEach((r,y)=>{for(let i=0;i<3;i++)if(r[i]==='#')X(g,x+i,y+1,col);});x+=4;}return outline(c,oc);}
const HA1=texto('HA',P.g3,P.v2),HA2=texto('HA HA',P.g3,P.v2);

/* ===== voz ===== */
const SIM=Q.get('falando')==='1'?'falando':Q.get('estado');
const voz={estado:'dormindo',nivel:0,frase:'',sobre:null,id:null,sint:false};let nivS=0;const HIST=new Array(100).fill(0);
const NO_ANDAR={trabalho:1,pronto:1,erro:1,saudacao:1,hora:1,generico:1};
function primeiraFrase(s){s=String(s||'').replace(/\s+/g,' ').trim();const m=/^(.{12,80}?[.!?])(\s|$)/.exec(s);return m?m[1]:s.slice(0,80);}
function ouvir(v,agoraS){if(SIM)return;v=v||{};const c=v.cena&&v.cena.id!=null?v.cena:null;
 const noPrazo=!!(c&&c.ate&&agoraS<c.ate),pcFala=v.estado==='falando';
 const mundo=!!(c&&NO_ANDAR[c.tipo]!==1);
 voz.estado=(pcFala||noPrazo)&&!mundo?'falando':(v.estado==='ouvindo'||v.estado==='pensando'?v.estado:'dormindo');
 voz.sint=!pcFala&&noPrazo;if(!voz.sint)voz.nivel=+v.nivel||0;
 if(c){voz.id='c'+c.id;voz.sobre=String(c.termo||'');let f=String(c.texto_pt||c.frase_pt||'').trim();
   if(!f&&v.legenda)f=primeiraFrase(v.legenda);if(!f&&window.Cenas&&Cenas.falaPT)try{f=Cenas.falaPT(c)||'';}catch(e){}voz.frase=f.slice(0,600);}
 else if(voz.estado==='falando'){if(voz.id===null||voz.id[0]==='c'){voz.id='v'+Date.now();voz.sobre='';}if(v.legenda)voz.frase=primeiraFrase(v.legenda);}
 else{voz.id=null;}}
function cenaNoAndar(c){return !c||NO_ANDAR[c.tipo]===1;}

/* ===== do que ela fala: cada assunto tem uma sala ===== */
const SALAS=[];
DESKS.forEach((d,i)=>SALAS.push({chave:[],andar:'terreo',x0:d.x-31,x1:d.x+31,tag:i,alvo:d.x}));
const COBERTURA={chave:[],andar:'cobertura',x0:100,x1:136,alvo:118,topo:22,chao:50};
SALAS.push({chave:['pendencia','pendencias','esperando'],andar:'terreo',x0:384,x1:436,el:'pend',alvo:410});
SALAS.push({chave:['empresa','bussola','alicerce'],andar:'empresa',x0:44,x1:360,sala:'empresa',alvo:233});
ESTUDIOS.forEach(s=>SALAS.push({chave:[s.id,s.nome,'shell '+s.id],andar:'estudios',x0:s.x0,x1:s.x1,sala:s.id,alvo:(s.x0+s.x1)/2}));
SALAS.push({chave:['mezanino','parados','dormindo'],andar:'mezanino',x0:44,x1:360,sala:'mezanino',alvo:200});
function salaDe(txt){const t=semAc(txt);if(!t)return null;
 for(const s of SALAS){const ks=s.tag!=null?(DESKS[s.tag].who?[DESKS[s.tag].who,DESKS[s.tag].nm]:[]):s.chave;if(ks.some(k=>{const kk=semAc(k);return kk.length>2&&t.includes(kk);}))return s;}
 const tr=D.trabalhos.find(x=>x&&x.nome&&(semAc(x.nome).includes(t)||t.includes(semAc(x.nome))));if(tr){const i=DESKS.findIndex(d=>d.who===tr.quem);if(i>=0)return SALAS.find(s=>s.tag===i);if(/bussola/.test(semAc(tr.nome)))return SALAS.find(s=>s.sala==='empresa');}
 return null;}
function ultimoTrabalho(){const u=D.trabalhos.filter(t=>t&&t.passo_desde&&t.quem!=='Bussola'&&DESKS.some(d=>d.who===t.quem)).sort((a,b)=>b.passo_desde-a.passo_desde)[0];return u?u.nome:'';}
function fraseDe(txt){const tr=D.trabalhos.find(x=>x.nome===txt)||D.trabalhos.find(x=>semAc(x.nome).includes(semAc(txt)));
 if(tr)return `${tr.nome} em ${tr.pct}%. Agora: ${(tr.etapa||'trabalhando').replace(/^\S/,m=>m.toLowerCase())}.`;
 const s=salaDe(txt);if(s&&s.el==='pend')return `${PEND} pendências esperando você, chefe.`;return 'Tudo em ordem no Andar 47, chefe.';}

/* ===== a Oráculo: cadeira de rodas, cabelo ruivo escuro, óculos e fone com luz ciano (desenho nosso) ===== */
const ROTA=[['ir',353],['servir',2.6],['ir',291],['servir',2.6],['ir',229],['servir',2.6],['ir',167],['servir',2.6],['ir',105],['servir',3],
 ['ir',POCO.cx],['subir','mezanino'],['ir',236],['olhar',3.4],['ir',POCO.cx],['subir','estudios'],['ir',242],['olhar',3],['ir',POCO.cx],
 ['subir','empresa'],['ir',340],['cafe',3.6],['ir',POCO.cx],['subir','terreo']];
const JV={andar:'terreo',x:POCO.cx,y:AND.terreo.chao,i:0,esp:0,dir:-1,face:-1,front:0,spin:0,carry:1,carro:AND.terreo.chao,ocupado:'',para:0};
const OR={top:'#24323e',topH:'#36485a',ca:P.n5,caH:P.n6,caS:P.n3,perna:'#1d2333'};
function fazOraculo(frente,sp,push,carry,mic){const [c,g]=mk(28,28);const r=(x,y,w,h,col)=>R(g,x,y,w,h,col);
 if(frente){for(const wx of [6,20]){r(wx,14,2,11,OR.caS);r(wx,14,2,1,OR.caH);X(g,wx,15+((sp*2)%9),OR.caH);}
  r(8,18,12,2,OR.ca);r(8,18,12,1,OR.caH);r(10,20,3,4,OR.perna);r(15,20,3,4,OR.perna);r(9,24,4,1,P.ink);r(15,24,4,1,P.ink);
  r(9,11,10,8,OR.top);r(9,11,10,1,OR.topH);r(8,12,1,6,OR.top);r(19,12,1,6,OR.top);
  if(carry){r(10,16,8,3,P.n1);r(11,16,6,1,P.c2);X(g,12,17,P.c3);}
  r(9,3,10,9,P.cab2);r(9,3,10,1,P.cab3);r(11,5,6,6,P.s2);r(11,9,6,2,P.s3);r(8,6,1,6,P.cab1);r(19,6,1,6,P.cab1);r(10,4,8,2,P.cab2);
  r(11,6,2,1,P.c3);r(15,6,2,1,P.c3);X(g,13,6,P.n6);X(g,14,6,P.n6);
  r(8,2,12,1,P.n6);r(8,3,1,4,P.n6);r(19,3,1,4,P.n6);r(19,7,1,2,P.n6);r(17,9,2,1,P.n6);X(g,16,9,mic?P.c3:P.c2);
  return outline(c,P.ink);}
 /* de lado, pra direita (o lado esquerdo sai espelhado) */
 r(8,8,2,11,OR.ca);r(8,8,2,1,OR.caH);r(9,17,12,2,OR.ca);r(9,17,12,1,OR.caH);r(20,19,1,5,OR.caS);r(19,24,3,2,OR.caS);
 for(let a=0;a<20;a++){const an=a/20*6.283;X(g,Math.round(12+Math.cos(an)*5),Math.round(21+Math.sin(an)*5),a%5?OR.ca:OR.caH);}
 for(let k=0;k<2;k++){const an=sp*.785+k*1.571;for(let s=1;s<=4;s++)X(g,Math.round(12+Math.cos(an)*s),Math.round(21+Math.sin(an)*s),OR.caS);}
 X(g,12,21,OR.caH);
 r(13,15,7,2,OR.perna);r(18,17,2,6,OR.perna);r(18,23,3,1,P.ink);
 r(11,9,5,7,OR.top);r(11,9,5,1,OR.topH);r(15,10,1,5,OR.topH);
 if(carry){r(14,13,5,2,P.n1);r(15,13,3,1,P.c2);}
 r(11,2,6,7,P.cab2);r(11,2,6,1,P.cab3);r(10,4,2,8,P.cab2);r(10,8,2,3,P.cab1);r(15,4,2,4,P.s2);r(15,7,2,1,P.s3);X(g,16,5,P.c3);X(g,15,5,P.n6);
 r(11,1,6,1,P.n6);r(11,2,1,4,P.n6);r(11,5,2,2,P.n5);X(g,13,7,P.n6);X(g,14,8,P.n6);X(g,15,8,P.n6);X(g,16,8,mic?P.c3:P.c2);
 if(push){r(12,10,2,3,OR.top);r(11,13,2,2,OR.top);X(g,11,15,P.s2);}else{r(13,10,2,4,OR.top);r(14,14,2,1,OR.top);X(g,15,14,P.s2);}
 return outline(c,P.ink);}
const OSPR={};for(const sp of [0,1,2,3])for(const pu of [0,1])for(const ca of [0,1])for(const mi of [0,1]){const s=fazOraculo(false,sp,pu,ca,mi);OSPR['d'+sp+pu+ca+mi]=s;OSPR['e'+sp+pu+ca+mi]=espelho(s);OSPR['f'+sp+ca+mi]=fazOraculo(true,sp,0,ca,mi);}
function sprOraculo(t,e){const sp=((Math.round(JV.spin)%4)+4)%4,pu=(Math.floor(JV.spin/3)&1),ca=JV.carry?1:0,mi=e==='falando'&&((t*6|0)%2)?1:0;
 if(JV.front>.5)return OSPR['f'+sp+ca+mi];return OSPR[(JV.face>=0?'d':'e')+sp+pu+ca+mi];}
function hourglass(t){const per=5,ph=(t%per)/per,flip=Math.floor(t/per)%2;const [c,g]=mk(9,11);
 R(g,0,0,9,1,P.n7);R(g,0,10,9,1,P.n7);for(let y=1;y<10;y++){const w=y<5?4-y+1:y-5+1;X(g,4-w,y,P.n6);X(g,4+w,y,P.n6);}
 const top=Math.round((1-ph)*3),bot=Math.round(ph*3);
 for(let k=0;k<top;k++){const y=4-k;const w=4-y;R(g,4-w+1,y,2*w-1,1,P.a3);}
 for(let k=0;k<bot;k++){const y=9-k;const w=y-5;R(g,4-w+1,y,2*w-1,1,P.a2);}
 if(ph<.95)X(g,4,5+((t*6|0)%4),P.a3);
 outline(c,P.ink);const [c2,g2]=mk(11,13);if(flip){g2.translate(0,13);g2.scale(1,-1);}g2.drawImage(c,0,0);return c2;}
const AMPULHETA=[];for(let i=0;i<20;i++)AMPULHETA.push(hourglass(i*.5));
function passoOraculo(dt,e){
 if(e!=='dormindo'||JV.para>0){JV.para=Math.max(0,JV.para-dt);JV.front=lerp(JV.front,1,.15);return;}
 JV.front=lerp(JV.front,0,.2);
 const [tipo,arg]=ROTA[JV.i];const prox=()=>{JV.i=(JV.i+1)%ROTA.length;JV.esp=0;};
 if(tipo==='ir'){const dx=arg-JV.x;const st=Math.sign(dx)*Math.min(Math.abs(dx),13*dt);JV.x+=st;JV.spin+=Math.abs(st)*.5;if(Math.abs(dx)>.3)JV.face=dx>0?1:-1;else{JV.x=arg;prox();}JV.ocupado=JV.x>POCO.x0-2&&JV.x<POCO.x1+2?'elevador':'';}
 else if(tipo==='subir'){const alvo=AND[arg].chao;const dy=alvo-JV.y;const st=Math.sign(dy)*Math.min(Math.abs(dy),15*dt);JV.y+=st;JV.carro=JV.y;JV.ocupado='subindo';if(Math.abs(dy)<.3){JV.y=alvo;JV.carro=alvo;JV.andar=arg;prox();}}
 else{JV.esp+=dt;JV.face=tipo==='cafe'?1:-1;JV.ocupado=tipo;if(tipo==='cafe'&&JV.esp>1.5)JV.carry=1;if(JV.esp>=arg)prox();}}

/* ===== cabos: a luz dela corre da torre do relógio até onde ela está (ou até a sala de que ela fala) ===== */
function caminho(andarId,x){const A=AND[andarId];const yc=A.topo+3;const pts=[[134,40],[134,50],[TRONCO,50],[TRONCO,yc]];
 if(Math.abs(x-TRONCO)>2)pts.push([x,yc]);
 let L=0;const seg=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const l=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);seg.push({a,b,l,L0:L});L+=l;}return {seg,L};}
function ponto(cm,s){for(const q of cm.seg){if(s<=q.L0+q.l){const k=(s-q.L0)/q.l;return [Math.round(lerp(q.a[0],q.b[0],k)),Math.round(lerp(q.a[1],q.b[1],k))];}}const u=cm.seg[cm.seg.length-1];return u.b;}
const PULSOS=[];let proxPulso=1;const CAMS={};
function caminhoC(a,x){const k=a+'|'+x;return CAMS[k]||(CAMS[k]=caminho(a,x));}
function desenhaCabo(cm,cor){for(const q of cm.seg){const x0=Math.min(q.a[0],q.b[0]),y0=Math.min(q.a[1],q.b[1]);R(G,x0,y0,Math.abs(q.b[0]-q.a[0])+1,Math.abs(q.b[1]-q.a[1])+1,cor);}}
function desenhaPulsos(dt){for(let i=PULSOS.length-1;i>=0;i--){const p=PULSOS[i];p.s+=p.v*dt*(p.rev?-1:1);
  if((!p.rev&&p.s>p.cm.L+p.cauda)||(p.rev&&p.s<-p.cauda)){PULSOS.splice(i,1);continue;}
  for(let k=p.cauda;k>=0;k--){const ss=p.rev?p.s+k:p.s-k;if(ss<0||ss>p.cm.L)continue;const [x,y]=ponto(p.cm,ss);const f=k/p.cauda;X(G,x,y,f<.15?P.n8:f<.45?P.c3:f<.75?P.c2:P.c1);if(p.grosso&&f<.5){X(G,x+1,y,P.c2);X(G,x,y+1,P.c2);}}}}

/* ===== retrato e onda do diálogo: a Oráculo de frente, rosto na luz fria da tela ===== */
const por=document.getElementById('a6-por'),pg=por.getContext('2d');pg.imageSmoothingEnabled=false;
function drawPortrait(t,lv){const g=pg;R(g,0,0,40,40,P.ink);dith(g,0,0,40,40,P.n2,.25);
 R(g,8,5,24,30,P.cab2);R(g,8,5,24,2,P.cab3);R(g,7,9,2,24,P.cab1);R(g,31,9,2,24,P.cab1);
 R(g,12,9,16,18,P.s3);R(g,12,9,16,2,P.s2);R(g,12,24,16,3,P.s4);R(g,11,7,18,4,P.cab2);R(g,13,10,6,1,P.cab3);
 R(g,12,14,7,4,P.n1);R(g,21,14,7,4,P.n1);R(g,19,15,2,1,P.n6);R(g,13,15,5,1,P.c2);R(g,22,15,5,1,P.c2);X(g,13,14,P.c3);X(g,22,14,P.c3);
 const ab=Math.round(clamp(lv*3+Math.max(0,Math.sin(t*9))*lv*1.5,0,3));R(g,17,22,6,1,P.s4);if(ab)R(g,18,22,4,ab,P.ink);
 R(g,7,4,26,2,P.n6);R(g,5,12,4,8,P.n5);R(g,5,12,4,1,P.n6);R(g,8,19,2,1,P.n6);for(let k=0;k<6;k++)X(g,9+k,20+(k>>1),P.n6);R(g,15,23,2,2,lv>.08?P.c3:P.c2);
 R(g,4,33,32,7,OR.top);R(g,4,33,32,1,OR.topH);R(g,16,31,8,3,P.s3);}
const wav=document.getElementById('a6-wav'),wg=wav.getContext('2d');wg.imageSmoothingEnabled=false;
function drawWave(){wg.clearRect(0,0,395,6);for(let i=0;i<132;i++){const v=HIST[Math.floor(i*100/132)];const h=Math.max(1,Math.round(v*3));R(wg,i*3,3-h,2,h*2,i>112?P.c3:P.c2);}}

/* ===== HUD ===== */
const $=id=>document.getElementById('a6-'+id);
const fmtK=n=>typeof n!=='number'||!isFinite(n)?'–':n>=1000?(n>=10000?Math.round(n/1000)+' MIL':(Math.round(n/100)/10).toString().replace('.',',')+' MIL'):String(n);
ANDARES.forEach(A=>{const el=document.createElement('div');el.className='andar o';const cy=TY((A.topo+A.chao)/2);el.style.top=(cy-20)+'px';el.textContent=A.nome;$('andares').appendChild(el);});
const salaEls={};
function placa(id,x,y,html,k){const el=document.createElement('div');el.className='sala';el.style.left=x+'px';el.style.top=y+'px';if(k)el.style.setProperty('--k',`var(--${k}2)`);el.innerHTML='<div class="pin"></div>'+html;el.dataset.sala=id;$('salas').appendChild(el);salaEls[id]=el;return el;}
const BC={c:['--c2','--c3'],y:['--y2','--y3'],v:['--v2','--g3'],d:['--d2','--d3']};
function icon(rows,map,sc){const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const g=c.getContext('2d');rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(map[r[x]])X(g,x,y,map[r[x]]);});c.style.width=c.width*sc+'px';c.style.height=c.height*sc+'px';return c;}
const CART=["..kkkkkkkkkk..",".kccccccccccck","kcwwwwwwwwwwck","kcwppppppppwck","kcwpwwwwwwpwck","kcwpwwkwwwpwck","kcwpwwkkwwpwck","kcwpwwkwwwpwck","kcwpwwwwwwpwck","kcwppppppppwck","kcwwwwwwwwwwck","kcccccccccccck","kcckkkkkkkkcck","kcck.k.k.k.cck","kkkk.k.k.k.kkk"];
placa('empresa',TX(50),TY(AND.empresa.topo+5),'','a');
ESTUDIOS.forEach(s=>placa(s.id,TX(s.x0+4),TY(AND.estudios.topo+5),s.nome,'n'));
placa('mezanino',TX(50),TY(AND.mezanino.topo+5),'','n');
const tagEls=[];
DESKS.forEach((d,i)=>{const el=document.createElement('div');el.className='tag';el.hidden=true;el.dataset.mesa=i;el.style.left=(TX(d.x)-88)+'px';el.style.setProperty('--k','var(--c3)');$('tags').appendChild(el);tagEls.push(el);});
const escH=s=>String(s==null?'':s).replace(/TERMMINAL/g,'TERMINAL').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>typeof v==='number'&&isFinite(v);
const TRAB_ATIVO=t=>t&&t.estado!=='parado';
function curtoT(n){n=String(n||'').replace(/\s*\([^)]*\)/g,'').replace(/Bussola/g,'Bússola').trim();if(n.length>17&&n.includes(' · ')){const p=n.split(' · ');n=p[p.length-1].length>=4?p[p.length-1]:p[0];}return n.replace(/^\S/,m=>m.toUpperCase());}
function nomeMesa(n){return String(n||'').replace(/TERMMINAL/g,'TERMINAL').replace(/^DAL MORO /i,'').toUpperCase();}
function agoraMs(){return opts.agora?opts.agora():Date.now();}
/* erro de verdade: a última linha do progresso começando com erro, falhou, caiu (a mesma regra do CENTRAL/aovivo.py),
   terminal caído ou trabalho em erro */
const RE_ERRO=/^\s*(erro|falhou|falha|caiu|quebrou|travou)\b/i;
let ERROS_D=[];
function errosDoDado(){const out=[],vis=new Set();
 for(const a of D.ativos){if(a&&a.nome&&RE_ERRO.test(String(a.agora||''))&&!vis.has(a.nome)){vis.add(a.nome);out.push({quem:a.nome,linha:String(a.agora),trab:String(a.titulo||a.trabalho||'')});}}
 for(const t of D.terminais.lista){if(t&&t.nome&&/caid|erro/i.test(t.status||'')&&!vis.has(t.nome)){vis.add(t.nome);out.push({quem:t.nome,linha:'o terminal caiu',trab:String(t.titulo||'')});}}
 for(const t of D.trabalhos){if(t&&t.quem&&/erro|falh/i.test(t.estado||'')&&!vis.has(t.quem)){vis.add(t.quem);out.push({quem:t.quem,linha:String(t.agora||t.etapa||'deu erro'),trab:String(t.nome||'')});}}
 return out;}
/* ensaio e teste: um erro de mentira com hora pra acabar (só na página de teste) */
const ERRO_Q=TQ('erro');const VENCE=+(TQ('vence')||(ENSAIO==='luta'?(ACEL?62:150):0));
const ENSAIO_NOME='Legendas';
function errosTeste(t){if(ENSAIO==='luta'){if(t<2||(VENCE&&t>VENCE))return [];return [{quem:ENSAIO_NOME,linha:'falhou: o render travou no quadro 312 (sem memória de vídeo)',trab:'Legendas do longo do Chucky',t0:2}];}
 if(ERRO_Q==null||ERRO_Q==='0')return null;if(VENCE&&t>VENCE)return [];
 const d=DESKS.find(x=>x.who);return [{quem:ERRO_Q==='1'?(d?d.who:ENSAIO_NOME):ERRO_Q,linha:'falhou: o render travou no quadro 312',trab:''}];}
let ERROS=[];  /* os de agora: os do dado, ou os do ensaio */
function distribuir(){
 const L=D.terminais.lista,agoraS=agoraMs()/1000;
 const quer=[];
 if(ENSAIO==='luta'&&!quer.includes(ENSAIO_NOME))quer.push(ENSAIO_NOME);
 ERROS_D.forEach(e=>{if(!quer.includes(e.quem))quer.push(e.quem);});
 L.forEach(t=>{if(t&&t.nome&&(t.status==='trabalhando'||t.status==='esperando')&&!quer.includes(t.nome))quer.push(t.nome);});
 const nomes=new Set(L.map(t=>t&&t.nome));
 D.trabalhos.forEach(t=>{if(TRAB_ATIVO(t)&&t.quem&&t.quem!=='Bussola'&&!/bussola/i.test(t.nome||'')&&!nomes.has(t.quem)&&t.passo_desde&&agoraS-t.passo_desde<12*3600&&!quer.includes(t.quem))quer.push(t.quem);});
 const fica=new Set(quer.slice(0,8));
 DESKS.forEach(d=>{if(d.who&&!fica.has(d.who))d.who=null;});
 for(const q of quer){if(DESKS.some(d=>d.who===q))continue;const livre=DESKS.find(d=>!d.who);if(!livre)break;livre.who=q;}
 DESKS.forEach(d=>{d.nm=d.who?nomeMesa(d.who):'';});
 D.foraMesa=Math.max(0,quer.length-DESKS.filter(d=>d.who).length);}
function trabalhosDe(q){return D.trabalhos.filter(t=>t&&t.quem===q&&TRAB_ATIVO(t)).sort((a,b)=>(b.passo_desde||0)-(a.passo_desde||0));}
/* a lista de quem está trabalhando com a última linha: na TV vem no estado (ativos); na Central, do J.estado dela */
function ativos(){if(D.ativos.length)return D.ativos;try{if(typeof J!=='undefined'&&J&&J.estado&&Array.isArray(J.estado.ativos))return J.estado.ativos;}catch(e){}return [];}
function estadoMesa(d){if(!d.who)return '';if(ERROS.some(e=>e.quem===d.who))return 'v';const L=D.terminais.lista;const t=L.find(x=>x&&x.nome===d.who);const a=ativos().find(x=>x&&x.nome===d.who);
 if((t&&t.status==='esperando')||(a&&a.estado==='esperando'))return 'y';return 'c';}
function curtoErro(s){s=String(s||'').replace(/\([^)]*\)/g,'').replace(/^\s*(erro|falhou|falha)\s*[:·-]?\s*/i,'').replace(/\s+/g,' ').trim();return s.replace(/^\S/,m=>m.toUpperCase());}
const PROIBIDO=/R\$|dinheiro|pagamento|fatura|\bpix\b|saldo|cobran|boleto|reais|@[\w-]+\.\w/i;
function curtoA(s){return String(s||'').replace(/^Rotina com falha:\s*/i,'Rotina falhou: ').replace(/DAL MORO\s+/g,'').replace(/\([^)]*\)/g,'').replace(/ALARME:\s*/gi,'').replace(/^Studio\s+/i,'').replace(/^Token vencido:\s*/i,'')
 .replace(/o hor[aá]rio (.+?) passou e n[aã]o subiu/i,'post de $1 não subiu').replace(/a autoriza[cç][aã]o venceu/i,'login venceu').replace(/\s+/g,' ').trim();}
const ultimo={};
function mudou(k,v){const s=JSON.stringify(v);if(ultimo[k]===s)return false;ultimo[k]=s;return true;}
function clima(){const p=D.pc||{};const mem=num(p.ram_total_gb)&&num(p.ram_livre_gb)&&p.ram_total_gb>0?(1-p.ram_livre_gb/p.ram_total_gb)*100:null;
 const cq=TQ('chuva'),rq=TQ('raio');const caidos=num(D.terminais.caidos)?D.terminais.caidos:0;
 const forte=cq==='2'||(cq==null&&mem!=null&&mem>=94);const chuva=cq==='1'||forte||(cq==null&&mem!=null&&mem>=88);
 const noiteC=noiteDoCoringa();const raio=rq==='1'||(rq==null&&caidos>0)||noiteC;
 let motivo='';if(raio)motivo=noiteC?'Raio: o Coringa está em metade das mesas':'Raio: um terminal caiu';else if(chuva&&mem!=null)motivo='Chuva: memória do PC em '+Math.round(mem)+'%';else if(chuva)motivo='Chuva de teste';
 return {chuva:chuva||raio,forte:forte||raio,raio,mem,motivo};}
function noiteDoCoringa(){const oc=DESKS.filter(d=>d.who).length;return ERROS.length>=2&&oc>0&&ERROS.length>=oc/2;}
function hudDados(){
 const cs=D.canais.filter(c=>c&&c.nome);
 const c1=cs.find(c=>/youtube/i.test(c.rede||'')&&num(c.numero)&&c.numero>0)||cs[0],c2=cs.find(c=>/instagram/i.test(c.rede||''));
 if(mudou('c1',c1||0)){$('s1').hidden=!c1;if(c1){$('s1n').textContent=c1.nome;$('s1v').textContent=fmtK(c1.numero);}}
 if(mudou('c2',c2||0)){$('s2').hidden=!c2;if(c2){$('s2n').textContent=c2.nome;$('s2v').textContent=fmtK(c2.numero);}}
 const b=D.trabalhos.find(t=>t&&/bussola/i.test(t.nome||''));D.bus=b||null;
 if(mudou('boss',b||0)){$('boss').hidden=!b;if(b){$('bn').innerHTML='<em>MISSÃO LONGA</em>'+escH(String(b.nome).replace(/Bussola/g,'Bússola'));$('be').textContent=String(b.etapa||'').replace(/pregao/g,'pregão');
  const p=num(b.pct)?b.pct:0;$('bb').style.width=`calc((100% - 8px) * ${p/100})`;$('bp').textContent=p+'%';}}
 if(mudou('pend',PEND)){$('pend').hidden=PEND<=0;$('pn').textContent=PEND;$('pw').textContent=PEND===1?'PENDÊNCIA':'PENDÊNCIAS';}
 const L=D.terminais.lista.filter(t=>t&&t.nome);
 const noAndar=nm=>L.filter(t=>semAc(t.andar)===semAc(nm));
 const emp=noAndar('Empresa');
 const hEmp=emp.length===1?`${escH(emp[0].nome)} <span>· ${emp[0].status==='parado'?'dormindo':'trabalhando'}</span>`:emp.length?`${emp.length} <span>na empresa</span>`:'';
 if(mudou('emp',hEmp)){salaEls.empresa.hidden=!hEmp;salaEls.empresa.innerHTML='<div class="pin"></div>'+hEmp;}
 ESTUDIOS.forEach(s=>{const n=noAndar(s.nome).length;const h=s.nome+(n?` <span>· ${n}</span>`:'');if(mudou('es'+s.id,h))salaEls[s.id].innerHTML='<div class="pin"></div>'+h;});
 const dorm=L.filter(t=>(t.status==='parado'||t.status==='shell')&&(!t.andar||semAc(t.andar)==='terreo'||semAc(t.andar)==='mezanino')).length;
 const hMez=dorm?`<b style="font-weight:400">${dorm}</b> <span>dormindo no mezanino</span>`:'<span>mezanino vazio</span>';
 if(mudou('mez',hMez))salaEls.mezanino.innerHTML='<div class="pin"></div>'+hMez;
 /* placas das 5 mesas: nome, trabalho, barra e %, linha cinza. Mesa com erro vira a carta do Coringa. */
 DESKS.forEach((d,i)=>{const el=tagEls[i];let h='';const k=estadoMesa(d)||'c';const c=BC[k];const er=ERROS.find(e=>e.quem===d.who);const carta=!!(er&&cartaPregada(d.who));
  const volta=!!(d.who&&VOLTOU.quem===d.who&&TEMPO-VOLTOU.t<14&&!er);
  if(d.who&&carta){h=`<div class="pin"></div><div class="l1"><span class="nm">${escH(d.nm)}</span></div><div class="tt">${escH(curtoErro(er.linha))}</div>`;}
  else if(d.who&&volta){h=`<div class="pin"></div><div class="l1"><span class="nm">${escH(d.nm)}</span></div><div class="tt">voltou a andar</div>`;}
  else if(d.who){const tr=trabalhosDe(d.who);const term=L.find(t=>t.nome===d.who);const t0=tr[0];
   /* r3: trabalho e etapa em linhas separadas; 0% sem etapa contada não aparece (lia como travado), vira "1/7" quando há etapas */
   const tem=t0&&num(t0.pct)&&t0.pct>0;const pct=tem?Math.round(t0.pct)+'%':t0&&num(t0.n)&&t0.n>1?(Math.min(num(t0.k)?t0.k:0,t0.n-1)+1)+'/'+t0.n:'';
   const et=k==='y'?'espera o seu ok':t0?String(t0.etapa||'trabalhando').replace(/^agente\s+/i,''):'rodando';
   const tt=t0?curtoT(t0.nome):term&&term.titulo?String(term.titulo):'trabalhando';
   h=`<div class="pin"></div><div class="l1"><span class="nm">${escH(d.nm)}</span></div><div class="tt">${escH(tt)}</div><div class="l2"><span class="et">${escH(et)}</span>${pct?`<b>${escH(pct)}</b>`:''}</div>`+(tem?`<div class="bar fina" style="--f:var(${c[0]});--fl:var(${c[1]})"><i style="width:calc((100% - 4px) * ${t0.pct/100})"></i></div>`:'');}
  if(mudou('tag'+i,[h,k,carta,volta])){el.hidden=!h;el.innerHTML=h;el.classList.remove('on');el.classList.toggle('carta',carta);el.classList.toggle('volta',volta);el.classList.toggle('esp',k==='y');el.style.setProperty('--k',`var(${volta?'--c3':c[1]})`);}});
 if(mudou('salaRef',DESKS.map(d=>d.who)))lastSala=undefined;
 /* rodapé: missões com o motivo do clima em primeiro */
 const ms=[];const cl=clima();if(cl.motivo)ms.push([cl.motivo,cl.raio?'r':'a']);
 if(num(D.pc.quedas_24h)&&D.pc.quedas_24h>0)ms.push([`PC caiu sozinho ${D.pc.quedas_24h}x em 24 h`,'a']);
 D.alertas.forEach(a=>{if(!a||a.visto)return;if(a.id==='esperando-ele'||(a.id==='queda'&&num(D.pc.quedas_24h)&&D.pc.quedas_24h>0))return;const t=curtoA(a.titulo);if(!t||PROIBIDO.test(t)||PROIBIDO.test(a.titulo||''))return;if(!ms.some(m=>m[0]===t))ms.push([t,a.nivel==='urgente'?'r':'a']);});
 const mv=ms.length?ms.slice(0,3):[['Nada urgente agora','g']];
 if(mudou('mis',mv)){const ul=$('misl');ul.innerHTML='';$('mis').classList.toggle('um',mv.length===1);
  mv.forEach(([t,k])=>{const li=document.createElement('li');li.appendChild(icon(["kkkkk","kcwck","kcwck","kcckk","kcwck","kkkkk"],{k:P.ink,c:k==='r'?P.r2:k==='g'?P.n5:P.a2,w:P.n8},4));const s=document.createElement('span');s.textContent=t;li.appendChild(s);ul.appendChild(li);});}
 const dk=D.dark||{},it=(Array.isArray(dk.lista)?dk.lista:[]).filter(x=>x&&x.estado==='no ar').slice(0,5);const noAr=num(dk.no_ar_hoje)?dk.no_ar_hoje:it.length;
 if(mudou('itens',[noAr,it])){$('ino').textContent=noAr;const sl=$('slots');sl.innerHTML='';
  if(!it.length){const v=document.createElement('div');v.className='vazio';v.textContent='nenhum no ar ainda';sl.appendChild(v);}
  it.forEach(x=>{const d=document.createElement('div');d.className='slot';const qc=String(x.canal||'').includes('QC');
   d.appendChild(icon(CART,{k:P.ink,c:qc?P.n6:P.a2,w:P.n8,p:qc?P.n3:P.a1},3.5));const sm=document.createElement('small');sm.textContent=String(x.titulo||'').slice(0,6);d.appendChild(sm);sl.appendChild(d);});}
 const p=D.pc||{},disco=(Array.isArray(p.discos)?p.discos:[]).find(x=>x&&x.letra==='C:');
 const pcv=[p.cpu,p.ram_total_gb,p.ram_livre_gb,p.gpu_uso,(D.uso_claude||{}).semana_pct,p.ligado_h,disco&&disco.livre_gb];
 if(mudou('pc',pcv)){const cpu=num(p.cpu)?Math.round(p.cpu):null;$('pce').style.width=`calc((100% - 8px) * ${(cpu||0)/100})`;$('pcv').textContent=cpu==null?'–':cpu+'%';
  const ram=num(p.ram_total_gb)&&num(p.ram_livre_gb)?Math.round(p.ram_total_gb-p.ram_livre_gb)+'/'+Math.round(p.ram_total_gb):'–';
  $('pcl').textContent=(num(p.ligado_h)?'ligado há '+Math.floor(p.ligado_h)+' h':'')+(disco&&num(disco.livre_gb)?' · C: '+Math.round(disco.livre_gb)+' GB':'');
  const clp=(D.uso_claude||{}).semana_pct;
  $('pcr').innerHTML=`<div><span>RAM</span>${ram}</div><div><span>GPU</span>${num(p.gpu_uso)?Math.round(p.gpu_uso)+'%':'–'}</div><div><span>Claude</span>${num(clp)?Math.round(clp)+'%':'–'}</div>`;}
 /* cartaz de PROCURADO: quantas vezes o Coringa atacou hoje */
 const ataques=ataquesHoje();if(mudou('proc',ataques))$('procn').textContent='HOJE: '+ataques;
 if(FICHA)refazFicha();}
/* pendência: desde quando o Gustavo está sendo esperado (o alerta "esperando-ele" tem a hora, no fuso do PC) */
let PEND_DESDE=0,PEND_ANT=-1;
function horaDoPC(s){const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):?(\d\d)?/.exec(String(s||''));if(!m)return 0;return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-D.tz*60000;}
/* entregas do dia: contadas aqui e guardadas no navegador até meia-noite */
function hojeChave(){const d=new Date(agoraMs()+D.tz*60000);return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();}
let DIA=le('dia',{dia:'',entregas:0,ataques:0,curativos:[],ultimas:[]});
function dia(){const h=hojeChave();if(DIA.dia!==h){DIA={dia:h,entregas:0,ataques:0,curativos:[],ultimas:DIA.ultimas||[]};guarda('dia',DIA);}return DIA;}
function ataquesHoje(){return dia().ataques;}
const PCT_ANT=new Map();const ENTREGAS=[];const ETAPAS=[];
function verMudancas(lista){const agora=new Map();lista.forEach(t=>{if(t&&t.nome)agora.set(t.nome,t);});
 const fimDe=t=>t.fim===true||/termin|pronto|entreg|conclu/i.test(t.estado||'');
 if(PCT_ANT.size){for(const [n,t] of agora){const a=PCT_ANT.get(n);if(!a)continue;
   if(!a.fim&&((num(t.pct)&&t.pct>=100&&(!num(a.pct)||a.pct<100))||fimDe(t)))ENTREGAS.push({quem:t.quem,nome:n});
   else if(num(t.pct)&&num(a.pct)&&t.pct>a.pct||((t.k|0)>(a.k|0)))ETAPAS.push({quem:t.quem});}
  for(const [n,a] of PCT_ANT){if(!agora.has(n)&&num(a.pct)&&a.pct>=90&&!a.fim)ENTREGAS.push({quem:a.quem,nome:n});}}
 PCT_ANT.clear();for(const [n,t] of agora)PCT_ANT.set(n,{pct:t.pct,k:t.k,quem:t.quem,fim:fimDe(t)});}
function aplicarEstado(e){e=e&&typeof e==='object'?e:{};const arr=v=>Array.isArray(v)?v:[];const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 D.pc=ob(e.pc);D.uso_claude=ob(e.uso_claude);D.uso_tv=ob(e.uso_tv);const te=ob(e.terminais);D.terminais={lista:arr(te.lista),caidos:te.caidos};D.trabalhos=arr(e.trabalhos).filter(t=>t&&typeof t==='object');
 D.ativos=arr(e.ativos).filter(a=>a&&typeof a==='object');D.dark=ob(e.dark);D.canais=arr(e.canais);D.alertas=arr(e.alertas);D.foco=ob(e.foco);D.gazeta=e.gazeta||null;
 PEND=PEND_Q!=null?+PEND_Q:(num(e.esperando_ele)?e.esperando_ele:0);
 const m=/([+-])(\d\d):?(\d\d)$/.exec(String(e.agora||''));if(m)D.tz=(m[1]==='-'?-1:1)*(+m[2]*60+ +m[3]);
 D.agoraDado=Date.parse(e.agora||'')||0;
 const al=D.alertas.find(a=>a&&a.id==='esperando-ele');const desde=al?horaDoPC(al.em):0;
 if(PEND>0){if(PEND_ANT<=0||PEND>PEND_ANT)PEND_DESDE=desde&&PEND_ANT<0?desde:agoraMs();if(desde&&desde<PEND_DESDE)PEND_DESDE=desde;}
 ERROS_D=errosDoDado();D.carregou=true;
 verMudancas(D.trabalhos);
 distribuir();const et=errosTeste(TEMPO);ERROS=et!=null?et:ERROS_D;hudDados();
 /* o quadro Trabalhando da direita fica do tamanho do que tem dentro; o resto é cidade */
 {const pn=host.querySelector('#a6-ativos');if(pn){const n=Math.max(1,Math.min(4,D.ativos.length));const hh=76+150*n;if(pn._h!==hh){pn._h=hh;pn.style.height=hh+'px';}}}}
/* relógio: o de verdade, ou ?hora=HH:MM pra testar (?vel=N acelera) */
const VEL=+(Q.get('vel')||1);const T00=Date.now();
const HQ=Q.get('hora');let BASE=null;if(HQ){const m=HQ.match(/^(\d{1,2})(?::?(\d{2}))?$/);if(m){const d=new Date(Date.now()-180*60000);d.setUTCHours(+m[1],+(m[2]||0),0,0);BASE=d.getTime()+180*60000;}}
function agora(){const ms=BASE!==null?BASE+(Date.now()-T00)*VEL:(VEL!==1?T00+(Date.now()-T00)*VEL:agoraMs());return new Date(ms+(BASE!==null?-180:D.tz)*60000);}
const DIAS=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],MES=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const astroC=$('astro'),ag=astroC.getContext('2d');let ultMin=-1,ultHora=-1,BADALADA=-99;
function relogio(d,w,t){const m=d.getUTCHours()*60+d.getUTCMinutes();if(m===ultMin)return;ultMin=m;
 if(ultHora>=0&&d.getUTCHours()!==ultHora)BADALADA=t;ultHora=d.getUTCHours();
 $('hora').textContent=String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');
 const fase=ORDEM.reduce((a,b)=>w[b]>w[a]?b:a);
 $('data').textContent=DIAS[d.getUTCDay()]+' '+d.getUTCDate()+' '+MES[d.getUTCMonth()]+' · '+{noite:'NOITE',amanhecer:'AMANHECER',dia:'DIA',entardecer:'ENTARDECER'}[fase];
 $('stage').classList.toggle('noite',w.noite>.6);ag.clearRect(0,0,7,7);if(fase==='noite'){for(const [x,y] of [[2,0],[3,0],[1,1],[2,1],[0,2],[1,2],[0,3],[1,3],[0,4],[1,4],[1,5],[2,5],[2,6],[3,6],[4,6],[5,5]])X(ag,x,y,P.n8);}
 else{const c=fase==='dia'?P.n7:'#c8a088';R(ag,2,1,3,5,c);R(ag,1,2,5,3,c);X(ag,3,3,P.n8);}}

/* ===== palco ===== */
function fit(){const cw=opts.dentro?host.clientWidth:innerWidth,ch=opts.dentro?host.clientHeight:innerHeight;if(!cw||!ch)return;const r=opts.recorte||[0,0,1920,1080];const s=Math.min(cw/r[2],ch/r[3]);$('stage').style.transform=`scale(${s})`;$('stage').style.left=((cw-r[2]*s)/2-r[0]*s)+'px';$('stage').style.top=((ch-r[3]*s)/2-r[1]*s)+'px';}
addEventListener('resize',fit);if(opts.dentro&&window.ResizeObserver)new ResizeObserver(fit).observe(host);fit();
/* ===== Batman, Coringa, capanga e comissário: boneco de pose montado uma vez numa folha (outline só aqui, nunca no
   laço). Quadro de 32x28, pé no ponto (16,27), olhando pra direita; o lado esquerdo sai espelhado. A capa do Batman
   é separada do corpo: corrente de 6 pontos com gravidade e vento, preenchida linha a linha (pixel limpo). ===== */
const BT={c:'#1d2436',h:'#3e4a68',s:'#0b0e16',ey:P.n8,bl:'#8a7a4a',sk:P.s2};
const CR={c:'#6a2fb0',h:'#a64dff',s:'#3a1a6a',vt:'#36a046',vth:'#5fe06a',hr:'#5fe06a',hrs:'#36a046',sk:'#ece4d4',sks:'#bdb2a0',bo:'#c02838',pa:'#3a1a5c',sa:'#2a1e16'};
const GD={c:'#3a352c',h:'#55503f',s:'#24211b',cab:P.n7,pele:'#5a4636',ocu:P.a3,ca:'#22252c',sa:P.ink,can:P.a2};
const CORDA='#c8b48a';
function braco(g,tipo,sx,sy,cor,luva){const q=(x,y,w,h,c)=>R(g,sx+x,sy+y,w,h,c||cor);
 switch(tipo){
  case 'baixo':q(0,0,1,6);q(0,6,1,1,luva);break;
  case 'guarda':q(0,0,1,2);q(1,-3,1,4);q(1,-4,2,1,luva);break;
  case 'peito':q(0,0,1,3);q(1,2,2,1);q(3,2,1,1,luva);break;
  case 'carrega':q(-1,0,1,2);q(-3,1,3,1);q(-5,0,2,2,luva);break;
  case 'estica':q(0,0,7,2);q(7,-1,2,3,luva);break;
  case 'estica2':q(0,0,9,2);q(9,-1,2,3,luva);break;
  case 'recolhe':q(0,0,4,2);q(4,-1,2,2,luva);break;
  case 'cotovelo':q(0,-1,2,2);q(2,-2,2,2);q(1,-4,1,2,luva);break;
  case 'cima':q(0,-9,1,10);q(0,-11,2,2,luva);break;
  case 'abre':q(0,-1,6,1);q(6,-2,1,2,luva);break;
  case 'tras':q(-2,0,2,1);q(-3,1,1,4);q(-3,5,1,1,luva);break;
  case 'aponta':q(0,0,4,1);q(4,1,3,1);q(7,2,1,1,luva);break;
  case 'xicara':q(0,0,1,2);q(1,-3,1,3);q(1,-5,3,2,P.a2);X(g,sx+3,sy-4,P.a3);break;
  case 'aceno0':q(0,-6,1,7);q(0,-8,2,2,luva);break;
  case 'aceno1':q(1,-6,1,7);q(2,-8,2,2,luva);break;
  case 'barriga':q(0,0,1,3);q(-2,3,3,1,luva);break;
  case 'joga':q(0,-1,3,1);q(3,-3,2,2);q(5,-5,1,2,luva);break;
  case 'flor':q(0,0,1,3);q(-1,3,1,1,luva);break;
  case 'spray':q(0,-1,5,2);q(5,-1,1,1,luva);break;
  case 'debaixo':q(0,0,2,1);q(2,1,2,1);q(4,1,1,1,luva);break;
  case 'digita':q(0,0,1,3);q(1,3,4,1);q(5,3,1,1,luva);break;
  case 'digita2':q(0,0,1,3);q(1,3,4,1);q(5,2,1,1,luva);break;
  case 'carta':q(0,-5,1,6);q(0,-7,2,2,luva);R(g,sx-1,sy-12,4,5,P.n8);X(g,sx,sy-10,P.v3);X(g,sx+1,sy-11,P.v3);break;
 }}
function pernas(g,tipo,C,dx){const q=(x,y,w,h,c)=>R(g,x+dx,y,w,h,c||C.c);
 switch(tipo){
  case 'pe':q(13,18,2,8);q(17,18,2,8);q(13,26,3,2,C.s);q(17,26,3,2,C.s);break;
  case 'guarda':q(12,18,2,4);q(11,22,2,4);q(18,18,2,4);q(19,22,2,4);q(10,26,3,2,C.s);q(19,26,3,2,C.s);break;
  case 'passo0':q(13,18,2,4);q(11,22,2,4);q(17,18,2,4);q(19,22,2,4);q(10,26,3,2,C.s);q(19,26,3,2,C.s);break;
  case 'passo1':q(14,18,2,8);q(16,18,2,7);q(14,26,3,2,C.s);q(16,25,3,1,C.s);break;
  case 'agacha':q(12,22,9,2);q(12,24,2,2);q(19,24,2,2);q(11,26,3,2,C.s);q(19,26,3,2,C.s);break;
  case 'pula':q(13,18,3,3);q(17,18,3,2);q(14,21,2,2,C.s);q(18,20,2,2,C.s);break;
  case 'sentado':q(13,18,7,2);q(19,20,2,6);q(19,26,3,2,C.s);break;
  case 'sentado2':q(13,18,7,2);q(20,20,2,5);q(21,25,3,2,C.s);break;
  case 'pesmesa':q(13,17,9,2);q(21,15,2,3);q(22,13,3,2,C.s);break;
  case 'magro':q(14,19,2,7);q(17,19,2,7);q(14,26,3,1,C.s);q(17,26,3,1,C.s);break;
  case 'magro0':q(13,19,2,4);q(12,23,2,3);q(17,19,2,4);q(18,23,2,3);q(11,26,3,1,C.s);q(18,26,3,1,C.s);break;
  case 'magro1':q(15,19,2,7);q(16,19,2,6);q(15,26,3,1,C.s);q(16,25,3,1,C.s);break;
 }}
/* Batman: corpo sem capa. Cada quadro guarda onde a capa prende (ombro). */
const PB={
 guarda0:{L:'guarda',A:'guarda',B:'peito'},guarda1:{L:'guarda',A:'guarda',B:'peito',dy:1},
 passo0:{L:'passo0',A:'peito',B:'tras',dx:1},passo1:{L:'passo1',A:'peito',B:'tras',dx:1},
 socoC:{L:'guarda',A:'carrega',B:'guarda',dx:-1},socoE:{L:'guarda',A:'estica',B:'peito',dx:2},socoE2:{L:'guarda',A:'estica2',B:'peito',dx:3},socoR:{L:'guarda',A:'recolhe',B:'peito',dx:1},
 cotC:{L:'guarda',A:'carrega',B:'peito',dx:-1},cotA:{L:'guarda',A:'cotovelo',B:'peito',dx:3},cotR:{L:'guarda',A:'peito',B:'peito',dx:1},
 esq0:{L:'guarda',A:'guarda',B:'peito',dx:-2,dy:1,hx:-1},esq1:{L:'guarda',A:'guarda',B:'peito',dx:-3,dy:2,hx:-1},
 bloq:{L:'guarda',A:'guarda',B:'guarda',dx:-1},apanha0:{L:'guarda',A:'tras',B:'tras',dx:-2,hx:-1},apanha1:{L:'guarda',A:'tras',B:'baixo',dx:-3,hx:-2,dy:1},
 gancho0:{L:'pe',A:'cima',B:'baixo'},gancho1:{L:'pula',A:'cima',B:'baixo'},pousa:{L:'agacha',A:'peito',B:'baixo',dy:4},
 vence0:{L:'pe',A:'baixo',B:'baixo'},vence1:{L:'pe',A:'baixo',B:'baixo',dy:1},plana0:{L:'pula',A:'abre',B:'abre'},plana1:{L:'pula',A:'abre',B:'abre',dy:1},
 vigia:{L:'agacha',A:'baixo',B:'baixo',dy:4},cafe0:{L:'agacha',A:'xicara',B:'baixo',dy:4},cafe1:{L:'agacha',A:'peito',B:'baixo',dy:4},
 aponta:{L:'agacha',A:'aponta',B:'baixo',dy:4},aceno0:{L:'agacha',A:'aceno0',B:'baixo',dy:4},aceno1:{L:'agacha',A:'aceno1',B:'baixo',dy:4},
 amarrado0:{L:'sentado',A:null,B:null,dy:2,amarra:1},amarrado1:{L:'sentado2',A:null,B:null,dy:2,amarra:1},rompe:{L:'pe',A:'abre',B:'abre',amarra:2},
 tosse0:{L:'agacha',A:'cotovelo',B:'baixo',dy:4,hx:1},tosse1:{L:'agacha',A:'cotovelo',B:'baixo',dy:5,hx:1}};
function bonecoB(pn){const p=PB[pn];const [c,g]=mk(32,28);const C=BT;const dx=p.dx||0,dy=p.dy||0,hx=p.hx||0;
 if(p.B)braco(g,p.B,12+dx,11+dy,C.s,C.s);
 pernas(g,p.L,C,dx);
 R(g,13+dx,10+dy,7,8-dy,C.c);R(g,19+dx,10+dy,1,7-dy,C.h);R(g,13+dx,17,7,1,C.bl);
 if(p.amarra===1){R(g,12+dx,12+dy,9,1,CORDA);R(g,12+dx,15+dy,9,1,CORDA);X(g,20+dx,13+dy,CORDA);}
 if(p.amarra===2){X(g,10+dx,12,CORDA);X(g,22+dx,14,CORDA);X(g,9+dx,16,CORDA);}
 const x0=14+dx+hx,y0=5+dy;R(g,x0,y0,5,5,C.c);R(g,x0+4,y0,1,4,C.h);R(g,x0,y0-2,1,2,C.c);R(g,x0+4,y0-2,1,2,C.c);
 X(g,x0+2,y0+2,C.ey);X(g,x0+3,y0+2,C.ey);R(g,x0+2,y0+4,2,1,C.sk);
 if(p.A)braco(g,p.A,19+dx,11+dy,C.c,C.s);
 outline(c,P.ink);return {c,ax:15+dx,ay:11+dy};}
/* Coringa (14 de largura): paletó roxo, colete verde, cabelo verde arrepiado, rosto pálido e o sorriso */
const PCo={
 ri0:{L:'magro',A:'barriga',B:'barriga',hx:-1},ri1:{L:'magro',A:'barriga',B:'barriga',hx:-1,dy:1},ri2:{L:'magro',A:'barriga',B:'barriga'},
 anda0:{L:'magro0',A:'tras',B:'peito',hx:-1},anda1:{L:'magro1',A:'baixo',B:'baixo',hx:-1,dy:1},anda2:{L:'magro0',A:'peito',B:'tras',hx:-1},anda3:{L:'magro1',A:'baixo',B:'baixo',hx:-1,dy:1},
 joga0:{L:'magro0',A:'carrega',B:'peito',dx:-1},joga1:{L:'magro0',A:'joga',B:'peito',dx:1},joga2:{L:'magro0',A:'recolhe',B:'peito'},
 spray0:{L:'magro0',A:'flor',B:'baixo'},spray1:{L:'magro0',A:'spray',B:'baixo',dx:1},spray2:{L:'magro0',A:'spray',B:'tras',dx:2},
 esq0:{L:'magro0',A:'tras',B:'peito',dx:-2,dy:2,hx:-2},esq1:{L:'magro0',A:'tras',B:'peito',dx:-1,dy:1,hx:-1},
 apanha0:{L:'magro0',A:'tras',B:'tras',dx:-2,hx:-2},apanha1:{L:'magro0',A:'tras',B:'baixo',dx:-3,hx:-3,dy:1},
 cai0:{L:'magro0',A:'tras',B:'tras',dx:-3,hx:-3,dy:3},cai1:{deitado:1,meio:1},cai2:{deitado:1},
 foge0:{L:'magro0',A:'tras',B:'peito',dx:1,hx:1},foge1:{L:'magro1',A:'peito',B:'tras',dx:1,hx:1},foge2:{L:'magro0',A:'peito',B:'tras',dx:1,hx:1},foge3:{L:'magro1',A:'tras',B:'peito',dx:1,hx:1},
 pendura:{L:'magro',A:'baixo',B:'baixo',vira:1},prega:{L:'magro',A:'estica',B:'baixo',vira:1},
 senta0:{L:'pesmesa',A:'digita',B:'tras',dy:3,hx:-1},senta1:{L:'pesmesa',A:'digita2',B:'tras',dy:3,hx:-1},
 mostra:{L:'magro',A:'carta',B:'barriga'},balao:{L:'magro',A:'cima',B:'baixo'}};
function bonecoC(pn){const p=PCo[pn];const [c,g]=mk(32,28);const C=CR;
 if(p.deitado){const y=p.meio?22:24;R(g,4,y,5,4,C.sk);R(g,3,y-1,3,3,C.hr);X(g,2,y-2,C.hr);X(g,4,y-2,C.hr);R(g,9,y,10,3,C.c);R(g,12,y,3,2,C.vt);R(g,19,y+1,8,2,C.pa);R(g,27,y,2,3,C.sa);R(g,6,y+3,3,1,C.bo);if(p.meio){R(g,14,y-3,2,3,C.c);}return outline(c,P.ink);}
 const dx=p.dx||0,dy=p.dy||0,hx=p.hx||0;const Cp={c:C.pa,s:C.sa};
 const tf=(pn.charCodeAt(pn.length-1)&1);R(g,13+dx,18,2,3+tf,C.s);R(g,18+dx,18,2,4-tf,C.s);
 if(p.B)braco(g,p.B,12+dx,11+dy,C.s,C.sk);
 pernas(g,p.L,Cp,dx);
 R(g,13+dx,10+dy,7,9-Math.min(dy,2),C.c);R(g,15+dx,10+dy,3,6,C.vt);X(g,16+dx,10+dy,C.vth);R(g,19+dx,10+dy,1,8,C.h);
 const x0=14+dx+hx,y0=5+dy;R(g,x0,y0,5,5,C.sk);R(g,x0,y0+3,5,2,C.sks);R(g,x0-1,y0-1,6,2,C.hr);X(g,x0-1,y0-2,C.hr);X(g,x0+1,y0-2,C.hr);X(g,x0+3,y0-2,C.hr);R(g,x0-1,y0+1,1,3,C.hrs);
 X(g,x0+3,y0+1,P.ink);R(g,x0+1,y0+3,4,1,C.bo);X(g,x0+4,y0+2,C.bo);
 if(p.A)braco(g,p.A,19+dx,11+dy,C.c,C.sk);
 if(p.A==='flor')R(g,16+dx,11+dy,2,2,C.vth);
 outline(c,P.ink);
 if(p.vira){const [c2,g2]=mk(32,28);g2.translate(0,28);g2.scale(1,-1);g2.drawImage(c,0,0);return c2;}
 return c;}
/* capanga de máscara de palhaço (um por erro a mais, até 3) */
function bonecoK(fr){const [c,g]=mk(32,28);const C={c:'#2a2e3a',s:'#161a22'};pernas(g,'pe',C,0);R(g,13,10+fr,7,8-fr,C.c);R(g,19,10+fr,1,7,'#3a4052');
 braco(g,'baixo',12,11+fr,C.s,C.s);braco(g,'peito',19,11+fr,C.c,'#8a7a6a');
 R(g,14,4+fr,5,6,'#e8e2d4');X(g,15,6+fr,P.ink);X(g,17,6+fr,P.ink);R(g,15,8+fr,3,1,P.r2);R(g,14,3+fr,5,1,C.s);return outline(c,P.ink);}
/* comissário: sobretudo, cabelo grisalho, óculos que brilham; o rosto fica na sombra */
function bonecoG(pose){const [c,g]=mk(32,28);const C=GD;const r=(x,y,w,h,col)=>R(g,x,y,w,h,col);const b=pose.endsWith('1')?1:0;const cx=15;
 if(pose==='cochila0'||pose==='cochila1'){r(cx-2,19,7,2,C.ca);r(cx+3,21,2,5,C.ca);r(cx+3,26,3,1,C.sa);r(cx-3,11,7,9,C.c);r(cx+3,11,1,8,C.h);r(cx-3,19,8,2,C.c);
   const hy=9+b;r(cx-1,hy,5,5,C.pele);r(cx-1,hy,5,2,C.cab);r(cx+3,hy+3,1,1,'#2a2018');r(cx+4,15,2,3,C.c);return outline(c,P.ink);}
 r(cx-2,19,2,7,C.ca);r(cx+1,19,2,7,C.ca);r(cx-3,26,3,1,C.sa);r(cx+1,26,3,1,C.sa);
 const lean=pose==='encosta'?1:0;
 r(cx-3+lean,10+b,7,11-b,C.c);r(cx-3+lean,10+b,1,11-b,C.s);r(cx+3+lean,10+b,1,11-b,C.h);r(cx-1+lean,10+b,3,3,C.s);r(cx-4+lean,19,9,2,C.c);X(g,cx+lean,15,C.s);
 const up=pose.startsWith('ceu'),down=pose==='relogio'||pose==='mao';
 const hy=4+b+(down?1:0)+lean;const hx=cx-2+lean;r(hx,hy,5,6,C.pele);r(hx,hy,5,2,C.cab);r(hx,hy+2,1,2,C.cab);
 if(up){r(hx+2,hy+1,3,1,C.ocu);}else{r(hx+2,hy+3,3,1,C.ocu);X(g,hx+3,hy+5,'#2a2018');}
 if(pose==='gole'){r(cx+3,11+b,2,4,C.c);r(cx+3,hy+4,2,2,C.can);}
 else if(pose==='brinde'){r(cx+3,5+b,2,7,C.c);r(cx+3,2+b,3,3,C.can);}
 else if(pose==='relogio'){r(cx+3,11+b,2,2,C.c);r(cx+4,9+b,2,2,C.c);r(cx+5,8+b,2,2,P.n7);X(g,cx+6,8+b,P.c3);}
 else if(pose==='encosta'){r(cx-2,13,7,2,C.h);}
 else if(pose==='vira'){r(cx+3,9+b,2,4,C.c);r(cx+4,7+b,2,2,C.pele);}
 else if(pose==='mao'){r(cx+3,12,4,2,C.c);r(cx+7,12,2,2,C.pele);}
 else if(pose==='semcaneca0'||pose==='semcaneca1'){r(cx+4,11+b,1,7,C.c);r(cx+4,17+b,1,2,C.pele);}
 else{r(cx+4,11+b,1,7,C.c);r(cx+4,17+b,2,2,C.can);}
 r(cx-4+lean,11+b,1,7,C.s);
 return outline(c,P.ink);}
/* r3: depois de 30 min de espera o comissário senta no parapeito, de lado, joelhos pra cima, cabeça baixa nos braços.
   Silhueta deitada (larga e baixa) no lugar da em pé, e desenhada em 2x pra ler do sofá. */
const GSENTA=[
 "......rrr.........",
 ".....rrrrk........",
 ".....rrkkkk.......",
 "......kkkko.......",
 "....cc.kkk........",
 "...ccccc..........",
 "...cccccch........",
 "...ccccchhh.......",
 "...cccccchhh......",
 "...ccccccchhk.....",
 "...cccccpppppp....",
 ".sssssssppppppp...",
 "...........ppp....",
 "...........ppp....",
 "...........ppp....",
 "...........ppp....",
 "...........pppb...",
 "...........bbbbb.."];
function bonecoGS(b){const [c,g]=mk(18,18);const C=GD;const M={c:'#4a4436',s:C.s,h:'#6a6450',r:'#c9d0dc',k:'#9a7a60',o:C.ocu,p:'#4a5064',b:C.sa};
 GSENTA.forEach((row,y)=>{for(let x=0;x<row.length;x++){const k=row[x];if(M[k])X(g,x,y+(b&&y<10?1:0),M[k]);}});return outline(c,P.ink);}
/* a folha: tudo montado uma vez, com o espelho pronto */
const FB={},FC={},FG={},FK=[];
function tinge(c,cor){const [c2,g2]=mk(c.width,c.height);g2.drawImage(c,0,0);g2.globalCompositeOperation='source-in';g2.fillStyle=cor;g2.fillRect(0,0,c.width,c.height);return c2;}
for(const k in PB){const o=bonecoB(k);const e=espelho(o.c);FB[k]={d:o.c,e,ax:o.ax,ay:o.ay,rd:tinge(o.c,'#6a7ca4'),re:tinge(e,'#6a7ca4')};}
for(const k in PCo){const c=bonecoC(k);FC[k]={d:c,e:espelho(c)};}
for(const k of ['idle0','idle1','gole','ceu0','ceu1','encosta','cochila0','cochila1','vira','mao','brinde','relogio','semcaneca0','semcaneca1']){const c=bonecoG(k);FG[k]={d:c,e:espelho(c)};}
for(const b of [0,1]){const c=bonecoGS(b);FG['cochila'+b]={d:c,e:espelho(c),big:2};}
for(const f of [0,1]){const c=bonecoK(f);FK.push({d:c,e:espelho(c)});}
function escala(y){return clamp(1+(y-70)/80,1,2);}   /* os heróis: 1x no telhado, 2x no térreo (são os maiores da cena) */
function poe(F,pose,face,x,y,k){const s=F[pose];if(!s)return;k=k||1;G.drawImage(face>=0?s.d:s.e,Math.round(x-16*k),Math.round(y-27*k),Math.round(32*k),Math.round(28*k));}
/* capa: corrente de 6 pontos presa no ombro */
const CAPA={p:[],ok:false};for(let i=0;i<7;i++)CAPA.p.push({x:0,y:0,px:0,py:0});
function capaPasso(ax,ay,face,dt,modo,t,k){k=k||1;const pts=CAPA.p;dt=Math.min(dt,.05);
 if(!CAPA.ok){pts.forEach((q,i)=>{q.x=q.px=ax-face*i*k;q.y=q.py=ay+i*2.6*k;});CAPA.ok=true;}
 pts[0].x=ax;pts[0].y=ay;pts[0].px=ax;pts[0].py=ay;
 const vento=-face*(modo==='asa'?120:modo==='voa'?70:18+Math.sin(t*1.7)*10+Math.sin(t*4.3)*5);const grav=modo==='asa'?-10:modo==='enrola'?40:60;
 for(let i=1;i<pts.length;i++){const q=pts[i];const vx=(q.x-q.px)*.9,vy=(q.y-q.py)*.9;q.px=q.x;q.py=q.y;q.x+=vx+vento*dt*dt*i*.6;q.y+=vy+grav*dt*dt;}
 const seg=(modo==='enrola'?2.2:2.7)*k;
 for(let it=0;it<3;it++)for(let i=1;i<pts.length;i++){const a=pts[i-1],q=pts[i];const dx=q.x-a.x,dy=q.y-a.y,d=Math.hypot(dx,dy)||1;const k=(d-seg)/d;if(i>1){a.x+=dx*k*.5;a.y+=dy*k*.5;q.x-=dx*k*.5;q.y-=dy*k*.5;}else{q.x-=dx*k;q.y-=dy*k;}}
 if(modo==='asa'){for(let i=1;i<pts.length;i++){pts[i].y=Math.min(pts[i].y,ay+(1+i*.6)*k);}}}
function capaEmpurra(face,f){for(let i=2;i<CAPA.p.length;i++){CAPA.p[i].px-=face*f*i*.3;CAPA.p[i].py+=f*.2;}}
const POLY=[];for(let i=0;i<16;i++)POLY.push([0,0]);const CRUZ=new Float32Array(32);
function capaDesenha(modo,k){k=k||1;const pts=CAPA.p,n=pts.length;let m=0;
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const hw=((modo==='asa'?2.2:1.6)+i*(modo==='enrola'?.95:.75))*k;POLY[m][0]=pts[i].x-dy*hw;POLY[m][1]=pts[i].y+dx*hw;m++;}
 for(let i=n-1;i>=0;i--){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const hw=((modo==='asa'?2.2:1.6)+i*(modo==='enrola'?.95:.75))*k;POLY[m][0]=pts[i].x+dy*hw;POLY[m][1]=pts[i].y-dx*hw;m++;}
 let y0=1e9,y1=-1e9;for(let i=0;i<m;i++){y0=Math.min(y0,POLY[i][1]);y1=Math.max(y1,POLY[i][1]);}
 for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yy=y+.5;let k=0;for(let i=0;i<m;i++){const a=POLY[i],b=POLY[(i+1)%m];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy)){CRUZ[k++]=a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]);}}
  if(k<2)continue;for(let i=1;i<k;i++){const v=CRUZ[i];let j=i-1;while(j>=0&&CRUZ[j]>v){CRUZ[j+1]=CRUZ[j];j--;}CRUZ[j+1]=v;}
  for(let i=0;i+1<k;i+=2){const xa=Math.round(CRUZ[i]),xb=Math.round(CRUZ[i+1]);if(xb<=xa)continue;R(G,xa,y,xb-xa,1,'#151b28');X(G,xa,y,'#34405a');X(G,xb-1,y,'#34405a');}}
 const u=pts[n-1];for(let k2=-2;k2<=2;k2+=2)X(G,Math.round(u.x+k2),Math.round(u.y)+1,'#151b28');}

/* ===== partículas: um poço fixo de 64, nada de alocação no laço ===== */
const FX=[];for(let i=0;i<64;i++)FX.push({on:0,tipo:'',x:0,y:0,vx:0,vy:0,g:0,t0:0,vida:0,c:'',c2:'',r:0,a:0,f:0});
function fx(tipo,x,y,t0,vida,o){let p=FX.find(q=>!q.on);if(!p){p=FX[0];for(const q of FX)if(q.t0<p.t0)p=q;}
 p.on=1;p.tipo=tipo;p.x=x;p.y=y;p.t0=t0;p.vida=vida;p.vx=0;p.vy=0;p.g=0;p.c=P.n8;p.c2=P.n6;p.r=6;p.a=0;p.f=0;p.ang=0;if(o)for(const k in o)p[k]=o[k];return p;}
function fxAvanca(t,dt){for(const f of FX){if(!f.on)continue;const a=t-f.t0;if(a<0)continue;if(a>f.vida){f.on=0;continue;}
 if(f.tipo==='carta'&&!f.f){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=f.g*dt;}else if(f.tipo==='meia'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=90*dt;}else if(f.tipo==='gas'){f.x+=f.vx*dt;f.vx*=Math.pow(.5,dt);}else if(f.tipo==='faisca'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=f.g*dt;}else if(f.tipo==='morcego'){f.x+=f.vx*dt;f.y+=f.vy*dt;}}}
function desenhaFX(t,dt){for(const f of FX){if(!f.on)continue;const a=t-f.t0;if(a<0)continue;if(a>f.vida){f.on=0;continue;}const k=a/f.vida;
 switch(f.tipo){
  case 'carta':{if(!f.f){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=f.g*dt;}const r=f.f?0:((a*16)|0)%4;const cx=Math.round(f.x),cy=Math.round(f.y);
    if(r===0||r===2){R(G,cx-1,cy-2,3,4,P.n8);X(G,cx,cy-1,P.v3);X(G,cx,cy,P.v2);}else if(r===1){R(G,cx-2,cy-1,4,3,P.n8);X(G,cx-1,cy,P.v3);}else{R(G,cx,cy-2,1,4,P.n7);}
    if(!f.f){X(G,cx-Math.sign(f.vx||1)*3,cy,P.n6);}break;}
  case 'meia':{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=90*dt;R(G,f.x,f.y,2,2,P.n8);X(G,f.x,f.y,P.v3);break;}
  case 'estrela':{const s=k<.34?2:k<.67?3:1;const col=k<.5?P.n8:P.a3;const x=Math.round(f.x),y=Math.round(f.y);X(G,x,y,col);for(let j=1;j<=s;j++){X(G,x+j,y,col);X(G,x-j,y,col);X(G,x,y+j,col);X(G,x,y-j,col);}
    if(k<.5){X(G,x+2,y+2,P.a2);X(G,x-2,y-2,P.a2);X(G,x+2,y-2,P.a2);X(G,x-2,y+2,P.a2);}break;}
  case 'gas':{f.x+=f.vx*dt;f.vx*=Math.pow(.5,dt);const r=Math.round(2+Math.min(1,k*2)*f.r);const d=(1-k)*.6;const x0=Math.round(f.x),y0=Math.round(f.y-k*3);const sh=(t*7)|0;
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;const xx=x0+x,yy=y0+y;const b=bay(xx+sh,yy);if(b<d)X(G,xx,yy,(xx+yy)&1?P.g2:P.g3);else if(b<d*1.25)X(G,xx,yy,P.v2);}break;}
  case 'fumaca':{const r=Math.round(2+k*f.r);const d=(1-k)*.65;const x0=Math.round(f.x),y0=Math.round(f.y-k*5);for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;const xx=x0+x,yy=y0+y;if(bay(xx,yy)<d)X(G,xx,yy,(xx^yy)&2?P.n6:P.n5);}break;}
  case 'ha':{if(k>.75&&((a*12)|0)%2)break;G.drawImage(f.f?HA2:HA1,Math.round(f.x+Math.sin(a*9)),Math.round(f.y-k*10));break;}
  case 'poeira':{for(let j=0;j<5;j++)X(G,Math.round(f.x+(j-2)*(2+k*6)),Math.round(f.y-k*2-(j&1)),k<.5?P.n6:P.n4);break;}
  case 'faisca':{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=f.g*dt;X(G,Math.round(f.x),Math.round(f.y),k<.5?f.c:f.c2);break;}
  case 'anel':{const r=1+k*f.r;const n=Math.max(8,r*5|0);for(let j=0;j<n;j++){if((j+(a*20|0))%2)continue;const an=j/n*6.283;X(G,Math.round(f.x+Math.cos(an)*r),Math.round(f.y+Math.sin(an)*r*.8),k<.5?f.c:f.c2);}break;}
  case 'sobe':{const y=Math.round(lerp(f.y,f.vy,k));X(G,Math.round(f.x),y,P.a3);X(G,Math.round(f.x),y+1,P.a2);X(G,Math.round(f.x),y+2,P.a1);break;}
  case 'morcego':{f.x+=f.vx*dt;f.y+=f.vy*dt;morcego(f.x,f.y,((a*9+f.a)|0)%2,P.n5);break;}
 }}}
/* ===== quem está em cena agora (cada quadro o dono do momento escreve aqui) ===== */
const BAT={x:CASA.x,y:CASA.y,f:1,pose:'vigia',vis:true,capa:'enrola',linha:null,caneca:false};
const CJ={x:0,y:222,f:-1,pose:'ri0',vis:false,corda:null,baloes:false};
let STOP=-1;            /* pausa no impacto (hitstop): a luta não anda até aqui */
const REACT={};          /* toque: quando cada coisa foi tocada */
function reagiu(k,t,dur){return REACT[k]!=null&&t-REACT[k]<dur;}

/* ===== o Coringa em 4 atos, pelo tempo real do erro ===== */
const T_ATO2=ACEL?12:20,T_ATO3=ACEL?36:120;
const ARCO={on:false,quem:'',linha:'',trab:'',t0:0,tl:0,tf:-1,tl4:0,ent:0,seq:0,fin:0,carta:false,fl:{},antes:'',cS:0,bS:0,ladoB:-1,fim:9};
const VISTO=new Map();
const SEQS=[['soco','cartas','gas'],['cartas','cotovelada','soco','gas'],['soco','cotovelada','cartas','gas'],['cotovelada','cartas','soco','gas']];
const DUR={soco:3,cartas:3.2,cotovelada:3,gas:4.6};
function sorteia(quem,t){const h=new Date(agoraMs()).getUTCHours();let s=hash(quem+'|'+h+'|'+dia().ataques);const ult=dia().ultimas||[];
 for(let k=0;k<12;k++){const ent=s%3,seq=(s>>>3)%4,fin=(s>>>6)%3;const c=ent+''+seq+fin;if(!ult.includes(c)||k===11){ult.unshift(c);DIA.ultimas=ult.slice(0,3);guarda('dia',DIA);return [ent,seq,fin];}s=hash(String(s)+k);}return [0,0,0];}
function dispara(i,c){if(!c||ARCO.fl[i])return false;ARCO.fl[i]=1;return true;}
function cartaPregada(quem){if(ARCO.on&&ARCO.quem===quem)return ARCO.carta;const v=VISTO.get(quem);return ERROS.some(e=>e.quem===quem)&&v!=null&&TEMPO-v>3;}
let TEMPO=0;
function mesaDe(quem){return DESKS.findIndex(d=>d.who===quem);}
function xMesa(quem){const i=mesaDe(quem);return i>=0?DESKS[i].x:200;}
const IMP={t:-99,wx:0,wy:0,gap:null,px:0,py:0};
function impacto(t,x,y){IMP.t=t;IMP.wx=x;IMP.wy=y;IMP.gap=null;STOP=t+.067;CAM.treme=t+.1;fx('estrela',x,y,t,.2);for(let i=0;i<4;i++)fx('faisca',x,y,t,.25,{vx:(i-1.5)*40,vy:-30-i*8,g:120,c:P.n8,c2:P.a2});}
function passoArco(t,dt){
 /* quem é o Coringa da vez: o erro mais velho; os outros viram capanga */
 for(const e of ERROS)if(!VISTO.has(e.quem))VISTO.set(e.quem,t);
 for(const k of [...VISTO.keys()])if(!ERROS.some(e=>e.quem===k)&&!(ARCO.on&&ARCO.quem===k))VISTO.delete(k);
 if(!ARCO.on&&ERROS.length){const e=ERROS.slice().sort((a,b)=>VISTO.get(a.quem)-VISTO.get(b.quem))[0];
  const [ent,seq,fin]=sorteia(e.quem,t);Object.assign(ARCO,{on:true,quem:e.quem,linha:e.linha,trab:e.trab,t0:t,tl:0,tf:-1,tl4:0,ent,seq,fin,carta:false,fl:{},antes:'',fim:9});
  const D0=dia();D0.ataques++;guarda('dia',DIA);hudDados();CAM.evento(t,'erro',{x:xMesa(e.quem),y:222});GLITCH=t;}
 if(!ARCO.on){CJ.vis=false;return;}
 const er=ERROS.find(e=>e.quem===ARCO.quem);if(er)ARCO.linha=er.linha;
 if(!er&&ARCO.tf<0){VOLTOU.quem=ARCO.quem;VOLTOU.t=t;VOLTOU.fim=0;ARCO.tf=t;ARCO.tl4=0;ARCO.fl={};const a=ARCO.tl;ARCO.antes=a>=T_ATO3?'ato3':a<6.7?'ato1':(a>=T_ATO2+tempoLuta()?'sozinho':'luta');ARCO.cS=CJ.x;ARCO.bS=BAT.x;CAM.evento(t,'fim',{x:xMesa(ARCO.quem),y:222});}
 const parado=t<STOP;
 if(ARCO.tf<0){if(!parado)ARCO.tl+=dt;atoUmDoisTres(t,ARCO.tl);}else{if(!parado)ARCO.tl4+=dt;atoQuatro(t,ARCO.tl4);}}
function a3x(dx){return dx<220?dx+120:dx-120;}   /* r4: o ato 3 acontece no meio do térreo */
function tempoLuta(){return SEQS[ARCO.seq].reduce((s,k)=>s+DUR[k],0);}
function atoUmDoisTres(t,a){const dx=xMesa(ARCO.quem),fX=clamp(dx,104,300),cH=fX+16,bL=fX-34;   /* a luta fica longe da borda da torre */
 CJ.vis=false;CJ.corda=null;CJ.baloes=false;CJ.clip=false;
 /* ato 1: o Coringa chega e prega a carta */
 const ent=ARCO.ent;let cartaEm=ent===0?3:ent===1?2.6:2.2,chao=ent===0?3.9:ent===1?1.6:1.8;
 if(a>=.9){CJ.vis=true;CJ.f=-1;
  if(ent===0){if(a<2.6){const yf=lerp(104,148,suave(.9,2.6,a));CJ.x=dx+18;CJ.y=yf+54;CJ.pose='pendura';CJ.corda=[dx+18,157,dx+18,yf];CJ.clip=true;}
   else if(a<3.4){CJ.x=dx+18;CJ.y=148+54;CJ.pose='prega';CJ.corda=[dx+18,157,dx+18,148];CJ.clip=true;}
   else if(a<3.9){CJ.x=dx+16;CJ.y=lerp(206,222,suave(3.4,3.8,a));CJ.pose='esq1';if(dispara(1,a>3.8))fx('poeira',CJ.x,221,t,.5);}}
  else if(ent===1){if(dispara(1,true))fx('gas',dx+4,196,t,.8,{r:10});if(a<1.6){CJ.x=dx+4;CJ.y=222;CJ.pose='anda0';}else if(a<2.3){CJ.x=lerp(dx+4,cH,suave(1.6,2.3,a));CJ.y=222;CJ.pose='anda'+((a*8|0)%4);}else if(a<2.9){CJ.x=cH;CJ.y=222;CJ.pose='joga1';}}
  else{if(a<1.3){CJ.x=cH;CJ.y=lerp(160,222,suave(.9,1.3,a));CJ.pose='esq1';CJ.clip=true;}else if(a<1.8){CJ.x=cH;CJ.y=222;CJ.pose='apanha1';if(dispara(1,true))fx('poeira',cH,221,t,.5);}else if(a<2.6){CJ.x=cH;CJ.y=222;CJ.pose='joga1';}}
  if(a>=chao&&a<T_ATO2){CJ.y=222;const sw=Math.sin((a-chao)*.9);CJ.x=lerp(ent===0?dx+16:cH,cH-4+sw*6,suave(chao,chao+.9,a));CJ.pose=((a-chao)%5<1.6)?'ri'+((a*8|0)%3):'anda'+((a*5|0)%4);
   if(dispara(2,a>chao+.2))fx('ha',CJ.x-12,164,t,1.4,{f:1});if(dispara(3,a>chao+7))fx('ha',CJ.x-6,164,t,1.2);}}
 if(dispara(4,a>=cartaEm)){ARCO.carta=true;hudDados();}
 /* o Batman salta da gárgula de gancho, a capa abre em 3 quadros, plana até a mesa */
 BAT.vis=true;BAT.linha=null;
 if(a<4){BAT.x=CASA.x;BAT.y=CASA.y;BAT.f=1;BAT.pose=a<1.5?'vigia':'gancho0';BAT.capa=a<1.5?'enrola':'normal';}
 else if(a<4.3){BAT.x=CASA.x+2;BAT.y=CASA.y-1;BAT.pose='gancho1';BAT.capa=a<4.1?'voa':'asa';}
 else if(a<6.3){const k=suave(4.3,6.3,a);BAT.x=lerp(CASA.x+2,bL,k);BAT.y=lerp(CASA.y,222,k*k);BAT.pose='plana'+((a*5|0)%2);BAT.capa='asa';}
 else if(a<6.7){BAT.x=bL;BAT.y=222;BAT.pose='pousa';BAT.capa='normal';if(dispara(5,true))fx('poeira',bL,221,t,.5);}
 else if(a<T_ATO2){BAT.x=bL;BAT.y=222;BAT.pose='guarda'+((a*2|0)%2);BAT.capa='normal';}
 if(a<T_ATO2)return;
 if(dispara('luta',true))CAM.evento(t,'luta',tempoLuta()+1.6);
 /* ato 2: a luta roda uma vez */
 const L=tempoLuta();
 if(a<T_ATO2+L){let u=a-T_ATO2,i=0;const seq=SEQS[ARCO.seq];while(i<seq.length&&u>=DUR[seq[i]]){u-=DUR[seq[i]];i++;}
  troca(seq[Math.min(i,seq.length-1)],u,t,fX,i);return;}
 /* depois do gás: o Coringa ri sozinho; o Batman segue de joelho, tossindo (não some: decisão de 11/11) */
 BAT.vis=true;BAT.x=fX-32;BAT.y=222;BAT.f=1;BAT.pose='tosse'+((a/.8|0)%2);BAT.capa='enrola';BAT.linha=null;
 if(a<T_ATO3){CJ.vis=true;CJ.x=fX+14;CJ.y=222;CJ.f=-1;const ph=(a-T_ATO2-L)%7;CJ.pose=ph<2?'ri'+((a*9|0)%3):'ri'+((a*3|0)%2?0:2);if(ph<.05)fx('ha',CJ.x-12,164,t,1.2,{f:ph<.03?1:0});return;}
 /* ato 3: passou de 2 min. Senta na cadeira do terminal, pé na mesa; o Batman amarrado do lado */
 const ax=a3x(dx);CJ.vis=true;CJ.x=ax-22;CJ.y=234;CJ.f=1;CJ.pose='senta'+((a/.7|0)%2);
 if(dispara('a3',true)){fx('fumaca',fX-32,204,t,1.2,{r:14});fx('fumaca',ax+27,204,t,1.2,{r:14});fx('fumaca',ax-22,204,t,1.2,{r:14});}   /* a troca de lugar some na fumaça */
 BAT.vis=true;BAT.x=ax+27;BAT.y=222;BAT.f=-1;BAT.pose='amarrado'+((a/.9|0)%2);BAT.capa='enrola';}
function troca(tipo,u,t,dx,i){const bX=dx-28,cX=dx+14;BAT.vis=true;CJ.vis=true;BAT.y=222;CJ.y=222;BAT.f=1;CJ.f=-1;BAT.capa='normal';const b=10+i*8;
 if(tipo==='soco'){
  BAT.x=bX+14*suave(0,.5,u)-14*suave(1.8,2.8,u);BAT.pose=u<.5?'passo'+((u*8|0)%2):u<.633?'socoC':u<.66?'socoE':u<.8?'socoE2':u<1?'socoR':u<1.35?'guarda0':u<1.55?'esq0':u<1.75?'esq1':u<1.8?'guarda1':'passo'+((u*6|0)%2);
  if(u>=1.35&&u<1.75)BAT.x-=5;
  if(dispara(b,u>=.683))impacto(t,cX-10,190);
  CJ.x=cX+10*suave(.683,1,u)-10*suave(1.8,2.8,u);CJ.pose=u<.683?'anda'+((u*6|0)%4):u<.9?'apanha0':u<1.1?'apanha1':u<1.3?'ri0':u<1.433?'joga0':u<1.6?'joga1':u<1.8?'ri'+((u*9|0)%3):'anda'+((u*6|0)%4);}
 else if(tipo==='cartas'){
  BAT.x=bX+14*suave(1.2,1.6,u)-14*suave(2.2,3.1,u);BAT.pose=u<.2?'guarda0':u<.75?'bloq':u<1.2?'guarda1':u<1.6?'passo'+((u*8|0)%2):u<1.733?'cotC':u<1.9?'cotA':u<2.1?'cotR':'passo'+((u*6|0)%2);
  if(dispara(b,u>=.36))capaEmpurra(1,3.2);
  CJ.x=cX+9*suave(1.8,2.1,u)-9*suave(2.2,3.1,u);CJ.pose=u<.3?'joga0':u<.55?'joga1':u<.7?'joga2':u<1.6?'ri'+((u*9|0)%3):u<1.8?'anda1':u<2.1?'apanha0':'anda'+((u*6|0)%4);
  if(dispara(b+1,u>=.32))[[-120,-58,0,188,-20],[-136,-10,.03,192,0],[-110,30,.06,196,15]].forEach(([vx,vy,d,y,ang])=>fx('carta',cX-10,y,t+d,.9,{vx,vy,g:20,a:bX+12,ang}));
  if(dispara(b+2,u>=1.8))impacto(t,cX-8,188);}
 else if(tipo==='cotovelada'){
  BAT.x=bX+14*suave(.7,1.1,u)-14*suave(2,2.9,u);BAT.pose=u<.15?'guarda0':u<.3?'esq0':u<.55?'esq1':u<.7?'guarda1':u<1.1?'passo'+((u*8|0)%2):u<1.233?'cotC':u<1.4?'cotA':u<1.6?'cotR':u<2?'guarda0':'passo'+((u*6|0)%2);
  if(u>=.15&&u<.6)BAT.x-=5;
  CJ.x=cX-6*suave(0,.15,u)+6*suave(.4,.6,u)+9*suave(1.3,1.6,u)-9*suave(2,2.9,u);CJ.pose=u<.133?'joga0':u<.3?'joga1':u<.6?'joga2':u<1.3?'ri'+((u*9|0)%3):u<1.5?'apanha0':u<1.8?'apanha1':'anda'+((u*6|0)%4);
  if(dispara(b,u>=1.3))impacto(t,cX-8,186);}
 else{ /* gás: o Batman se cobre com a capa e some na nuvem */
  BAT.x=bX;CJ.x=cX;CJ.pose=u<.3?'spray0':u<1.6?'spray'+(1+((u*6|0)%2)):'ri'+((u*9|0)%3);
  BAT.pose=u<.3?'guarda0':u<1.25?'bloq':'tosse'+((u*3|0)%2);BAT.capa=u<.3?'normal':'enrola';BAT.vis=true;if(u>=1.25)BAT.x=bX-4*suave(1.25,1.6,u);
  for(let k=0;k<5;k++)if(dispara(b+k,u>=.35+k*.15))fx('gas',cX-16-k*3,194-(k%2)*6,t,2.8,{vx:-9-k*4,r:14+(k%3)*2});   /* r3: a nuvem chega no Batman e fica nele */
  if(dispara(b+6,u>=2.1))fx('ha',cX-16,164,t,1.6,{f:1});}}
function atoQuatro(t,b){const dx=xMesa(ARCO.quem),fX=clamp(dx,104,300);const antes=ARCO.antes;CJ.corda=null;
 /* revanche: o Batman se solta (ou chega), um soco só, o Coringa cai, levanta e foge rindo */
 let cX,bX,fb;
 if(antes==='ato3'){cX=a3x(dx)-22;bX=a3x(dx)+27;fb=-1;}else{cX=antes==='ato1'?fX+16:ARCO.cS||fX+14;bX=cX-36;fb=1;}
 const pX=cX-fb*24;  /* onde o Batman para pra bater */
 BAT.vis=true;BAT.capa='normal';BAT.f=fb;BAT.y=222;CJ.vis=true;CJ.y=222;CJ.f=-fb;
 if(b<1.3){CJ.x=cX;if(antes==='ato3'&&b<.7)CJ.y=234;CJ.pose=antes==='ato3'&&b<.7?'senta0':b<.7?'ri'+((b*9|0)%3):'apanha0';
  if(antes==='ato3'){BAT.x=bX;BAT.pose=b<.7?'amarrado'+((b*12|0)%2):'rompe';BAT.capa=b<.7?'enrola':'normal';if(dispara(1,b>=.7))for(let k=0;k<6;k++)fx('faisca',bX,200,t,.5,{vx:(k-2.5)*30,vy:-40,g:150,c:CORDA,c2:P.a1});
   if(b>=.9)BAT.x=lerp(bX,pX,suave(.9,1.3,b));}
  else if(antes==='sozinho'){const b0=fX-32;BAT.x=lerp(b0,pX,suave(.6,1.2,b));BAT.pose=b<.35?'tosse0':b<.6?'pousa':b<1.2?'passo'+((b*8|0)%2):'guarda0';if(dispara(1,b>=.35))fx('poeira',b0,221,t,.5);}
  else{BAT.x=lerp(bX,pX,suave(0,1.2,b));BAT.pose=b<1.2?'passo'+((b*8|0)%2):'guarda0';}
  if(antes!=='ato3'&&b>=1.2)BAT.x=pX;}
 else if(b<3.4){BAT.x=pX;
  BAT.pose=b<1.4?'socoC':b<1.44?'socoE':b<1.65?'socoE2':b<1.85?'socoR':'vence'+((b*2|0)%2);
  if(dispara(2,b>=1.483)){impacto(t,cX-fb*6,190);ARCO.carta=false;hudDados();fx('carta',dx+10,196,t,.8,{vx:24,vy:-30,g:360});}
  const rec=suave(1.483,1.9,b)*22;CJ.x=cX+fb*rec;CJ.pose=b<1.483?'apanha0':b<1.9?'apanha1':b<2.1?'cai0':b<2.3?'cai1':b<2.8?'cai2':b<3.1?'apanha1':'ri'+((b*9|0)%3);
  if(dispara(3,b>=2.3))fx('poeira',CJ.x,221,t,.5);}
 else{BAT.x=pX;BAT.pose='vence'+((b*2|0)%2);
  const c0=cX+fb*14;const fin=ARCO.fin;CJ.f=-1;
  if(dispara(4,true)){const dd=dia();if(!dd.curativos.includes(ARCO.quem)){dd.curativos.push(ARCO.quem);guarda('dia',DIA);}CADEIRA.i=mesaDe(ARCO.quem);CADEIRA.t0=t;}
  const u=b-3.4;
  if(fin===0||fin===2){
   if(fin===0){if(u<1.4){CJ.x=lerp(c0,36,suave(0,1.4,u));CJ.pose='foge'+((u*10|0)%4);if(CJ.x<40)CJ.vis=false;}else CJ.vis=false;}
   else{if(u<.3){CJ.x=c0;CJ.pose='joga1';}else{CJ.vis=false;if(dispara(5,true))fx('fumaca',c0,204,t,1.4,{r:16});}}
   const r0=fin===0?1.8:1.1;
   if(u>=r0&&u<r0+3){const k=(u-r0)/3;CJ.vis=true;CJ.f=1;CJ.x=lerp(fin===0?52:200,446,k);CJ.y=47;CJ.pose='foge'+((u*10|0)%4);if(dispara(6,true))fx('ha',CJ.x,30,t,1.4,{f:1});}
   else if(u>=r0+3&&u<r0+3.7){const k=(u-r0-3)/.7;CJ.vis=true;CJ.f=1;CJ.x=446+k*24;CJ.y=47-Math.sin(k*Math.PI*.6)*8+k*k*60;CJ.pose='foge1';}
   else if(u>=r0+3.7)CJ.vis=false;
   ARCO.fim=3.4+r0+4;}
  else{ /* balão: corre pra janela e sobe por fora, rindo */
   if(u<.6){CJ.x=c0;CJ.pose='balao';CJ.baloes=true;}
   else if(u<1.5){CJ.x=lerp(c0,40,suave(.6,1.5,u));CJ.pose='foge'+((u*10|0)%4);CJ.baloes=true;}
   else{const k=(u-1.5)/4.5;CJ.x=40-Math.sin(u*1.3)*3;CJ.y=222-k*240;CJ.pose='balao';CJ.baloes=true;CJ.vis=CJ.y>-10;if(dispara(6,u>2))fx('ha',CJ.x+6,CJ.y-40,t,1.4,{f:1});}
   ARCO.fim=3.4+6.2;}
  if(b>5.2){const k=suave(5.2,6.8,b);const x0=pX;BAT.x=lerp(x0,CASA.x,k);BAT.y=lerp(222,CASA.y,k);BAT.f=-1;BAT.pose=b<6.8?'gancho1':b<7.2?'pousa':'vigia';BAT.capa=b<6.8?'voa':'enrola';
   if(b<6.8)BAT.linha=[Math.round(BAT.x+(BAT.f>0?3:-3)*escala(BAT.y)),Math.round(BAT.y-22*escala(BAT.y)),Math.round(lerp(BAT.x,CASA.x,.4)),12];if(b>=6.8){BAT.x=CASA.x;BAT.y=CASA.y;}}}
 if(b>Math.max(7.6,ARCO.fim)){ARCO.on=false;CJ.vis=false;BAT.linha=null;}}
const CADEIRA={i:-1,t0:-99};const VOLTOU={quem:'',t:-99,fim:1};

/* ===== o sinal, o comissário e a caneca ===== */
const SINAL={k:0,liga:-99,gag:-99,nada:-99,tranco:-99,ultGag:-99,festa:-99};
let PEND_VIS=-1,ESPERA_MIN=0;
function pendAgora(t){if(ENSAIO==='sinal')return t<3?0:t<34?2:0;return PEND;}
function esperaMin(t){if(TQ('espera')!=null)return +TQ('espera');if(ENSAIO==='sinal')return t<3?0:(t-3)*(t-3<8?1.25:1.67);return PEND_DESDE?(agoraMs()-PEND_DESDE)/60000:0;}
function passoSinal(t){const p=pendAgora(t);
 if(PEND_VIS<0&&(D.carregou||ENSAIO))PEND_VIS=p;
 if(PEND_VIS<0){SINAL.k=p>0?1:0;return p;}
 if(p>PEND_VIS){if(PEND_VIS<=0)SINAL.liga=t;else SINAL.tranco=t;CAM.evento(t,'pend',{x:300,y:36});}
 else if(p<PEND_VIS&&t-SINAL.ultGag>15&&!ARCO.on){SINAL.gag=t;SINAL.ultGag=t;if(p===0)CAM.evento(t,'resp',{x:40,y:40},3.4);}
 PEND_VIS=p;ESPERA_MIN=esperaMin(t);
 const g=t-SINAL.gag;
 /* o facho: sobe quando liga, tremula quando ele responde, apaga se não sobrou nada */
 let on=p>0||t-SINAL.nada<1.6||(g<.8&&g>=0);
 if(g>=0&&g<.8&&((g*22|0)%3===0))on=false;
 SINAL.k=on?clamp((t-SINAL.liga)/1.2,0,1):0;if(on&&SINAL.liga<0&&p>0)SINAL.k=1;
 if(on&&t-SINAL.nada<1.6&&p===0)SINAL.k=1;
 return p;}
function poseComissario(t,p){const g=t-SINAL.gag;
 if(reagiu('comissario',t,1.6))return ['relogio',1,GORD.x];
 if(g>=.8&&g<2.2)return ['vira',-1,GORD.x];
 if(g>=2.2&&g<5)return ['mao',1,GORD.x];
 if(t-SINAL.festa<2.5){const n=dia().entregas;return ['brinde',n>=3?-1:1,GORD.x];}
 const semCaneca=g>=0&&g<20;
 if(p>0){const m=ESPERA_MIN;if(m>=30)return ['cochila'+((t/2.2|0)%2),1,GORD.x-6];if(m>=10)return ['encosta',1,GORD.x+9];return ['ceu'+((t/2|0)%2),1,GORD.x];}
 if(!semCaneca&&(t%40)<1.6)return ['gole',1,GORD.x];
 return [(semCaneca?'semcaneca':'idle')+((t/2|0)%2),1,GORD.x];}
/* o Batman quando não está lutando: vigia na gárgula, some e leva o café, aponta a mesa, acena na 5ª entrega */
let VIGIA=-1,VIGIA_T=-99;
function mesaVigiada(){let best=-1,bt=1e18;DESKS.forEach((d,i)=>{if(!d.who||ERROS.some(e=>e.quem===d.who))return;const tr=trabalhosDe(d.who)[0];const v=tr&&tr.passo_desde?tr.passo_desde:1e17+i;if(v<bt){bt=v;best=i;}});return best;}
function passoBatman(t){if(ARCO.on)return;
 const g=t-SINAL.gag;BAT.linha=null;BAT.x=CASA.x;BAT.y=CASA.y;BAT.vis=true;BAT.f=1;BAT.capa='enrola';BAT.caneca=false;
 const nv=mesaVigiada();if(nv!==VIGIA){if(VIGIA>=0&&nv>=0)VIGIA_T=t;VIGIA=nv;}
 if(g>=0&&g<3.4){BAT.vis=false;return;}
 if(pendAgora(t)>0&&!(g>=3.4&&g<12)&&!reagiu('batman',t,1.4)){BAT.vis=false;return;}   /* sinal aceso: foi atender */
 if(g>=3.4&&g<12){BAT.pose='cafe'+(((g-3.4)/1.3|0)%2);return;}
 if(reagiu('batman',t,1.4)){BAT.pose='aponta';return;}
 if(t-SINAL.festa<2.2&&dia().entregas>=5&&t-SINAL.festa>.6){BAT.pose='aceno'+((t*4|0)%2);return;}
 const v=t-VIGIA_T;if(v>=0&&v<2.4){const k=v/2.4;BAT.x=CASA.x+Math.sin(k*Math.PI)*70;BAT.y=CASA.y+Math.sin(k*Math.PI)*20;BAT.pose='gancho1';BAT.f=k<.5?1:-1;BAT.capa='voa';BAT.linha=[Math.round(BAT.x+BAT.f*3),BAT.y-22,70,10];return;}
 BAT.pose='vigia';}

/* ===== câmera da TV: aberto é a casa; close 2x só no começo e no fim de evento, 6 s no máximo, com barra de cinema ===== */
const CAM={z:1,tx:0,ty:0,css:'',modo:'aberto',ate:0,folga:-99,prio:0,wipe:-99,prox:null,treme:-99,ultEv:0,ultClose:-99,passeio:-1,ultPedido:-99,
 evento(t,tipo,alvo,atraso){CAM.ultEv=t;if(!CAMERA)return;
  if(tipo==='erro')return palcoPede(t,'mesa',6.5,true);
  if(tipo==='luta')return palcoPede(t,'luta',alvo,true);
  if(tipo==='fim')return palcoPede(t,'revanche',6,true);
  if(tipo==='pend'){CAM.folga=t+20;return palcoPede(t,'holofote',6,false);}
  if(tipo==='resp'){if(pendAgora(t)>0||t<CAM.folga)return;CAM.folga=t+20;CAM.respEm=t+(atraso||0);}},
 pede(t,o){CAM.prox=o;CAM.wipe=t;},
 sai(t){CAM.pede(t,{z:1,tx:0,ty:0,modo:'aberto',ate:0});CAM.folga=t+20;CAM.prio=0;},
 passo(t){CAM.z=1;CAM.tx=0;CAM.ty=0;if(!CAMERA)return;if(CAM.respEm&&t>=CAM.respEm){CAM.respEm=0;palcoPede(t,'gargula',4.5,false);}palcoPasso(t);}};
function aplicaCamera(t){const tm=t<CAM.treme?(((t*60)|0)%2?1:-1)*4*CAM.z:0;{const pt=PALCO.on&&t<CAM.treme?'translate('+(((t*60)|0)%2?8:-8)+'px,0)':'';if(pt!==aplicaCamera.pt){aplicaCamera.pt=pt;PCV.style.transform=pt;}}const queima=CAM.modo==='aberto'&&NA_TV?((t/300|0)%2)*4:0;
 const css=`translate(${CAM.tx+tm+queima}px,${CAM.ty}px) scale(${CAM.z})`;if(css!==CAM.css){CAM.css=css;$('cam').style.transform=css;host.classList.toggle('perto',CAM.z>1);}
 const w=t-CAM.wipe;const h=w<0||w>.134?0:w<.067?w/.067:1-(w-.067)/.067;const hh=Math.round(h*540);if(hh!==CAM.barra){CAM.barra=hh;const [a,b]=$('barras').children;a.style.height=hh+'px';b.style.height=hh+'px';}}

/* ===== interação (PC e celular; na TV tudo acontece sozinho pelo estado) ===== */
let FICHA=null,lastSala=null;const HOV={tipo:'',i:-1,x0:0,x1:0,y0:0,y1:0};
function embutidoEstreito(){const p=host.parentElement;return !!(p&&p.id==='a47-torre'&&innerWidth<=700);}
function pontoMundo(ev){const r=$('stage').getBoundingClientRect();const s=r.width/1920;const sx=(ev.clientX-r.left)/s,sy=(ev.clientY-r.top)/s;return {sx,sy,s,wx:(sx-CAM.tx)/CAM.z/3-OX,wy:(sy-CAM.ty)/CAM.z/3-OY};}
function alvos(){const L=[];
 if(CJ.vis){const k=escala(CJ.y);L.push(['coringa',-1,CJ.x-7*k,CJ.y-22*k,CJ.x+7*k,CJ.y]);}
 ERROS.slice(1,4).forEach(e=>{const i=mesaDe(e.quem);if(i>=0&&!(ARCO.on&&ARCO.quem===e.quem))L.push(['capanga',i,DESKS[i].x+4,180,DESKS[i].x+28,222]);});
 if(BAT.vis){const k=escala(BAT.y);L.push(['batman',-1,BAT.x-7*k,BAT.y-21*k,BAT.x+7*k,BAT.y]);}
 L.push(['comissario',-1,GORD.x-6,26,GORD.x+8,47]);
 L.push(['holofote',-1,HOLO.x-6,30,HOLO.x+6,47]);
 if(SINAL.k>.5)L.push(['holofote',-1,SIN.x-50,SIN.y-26,SIN.x+50,SIN.y+26]);
 L.push(['relogio',-1,103,22,133,47]);
 L.push(['oraculo',-1,JV.x-10,JV.y-26,JV.x+10,JV.y]);
 DESKS.forEach((d,i)=>{if(d.who)L.push(['mesa',i,d.x-27,190,d.x+23,222]);});
 L.push(['mezanino',-1,44,122,360,150]);L.push(['empresa',-1,44,54,360,84]);
 ESTUDIOS.forEach(s=>L.push(['estudio',s.id,s.x0,88,s.x1,118]));
 return L;}
function acha(wx,wy,s){const pw=3*s*CAM.z;const min=44/pw,perto=24/pw;let best=null,bd=1e9;
 for(const a of alvos()){let [tp,i,x0,y0,x1,y1]=a;const w=x1-x0,h=y1-y0;if(w<min){x0-=(min-w)/2;x1+=(min-w)/2;}if(h<min){y0-=(min-h)/2;y1+=(min-h)/2;}
  const dx=Math.max(x0-wx,0,wx-x1),dy=Math.max(y0-wy,0,wy-y1);const d=Math.hypot(dx,dy);const area=(x1-x0)*(y1-y0);const dd=d===0?-1/area:d;if(dd<bd&&(d===0||d<=perto)){bd=dd;best=a;}}
 return best;}
let TOQUE_PEND=null;
function toque(ev){if(ev.target&&ev.target.id==='a6-veu'){fechaFicha();ev.preventDefault();ev.stopPropagation();return;}
 if(embutidoEstreito()){if(ev.target&&ev.target.id==='a6-abre')return;const p0=pontoMundo(ev);const h0=acha(p0.wx,p0.wy,p0.s);fx('anel',p0.wx,p0.wy,TEMPO,.45,{r:9,c:P.c3,c2:P.c2});if(h0){REACT[h0[0]]=TEMPO;if(h0[0]==='mesa'){REACT.mesa=TEMPO;REACT.mesaI=h0[1];}TOQUE_PEND={tp:h0[0],i:h0[1],t:performance.now()};}return;}
 if(ev.target.closest&&ev.target.closest('#a6-ficha'))return;
 const p=pontoMundo(ev);const t=TEMPO;let hit=null;const el=ev.target.closest?ev.target:null;
 const tg=el&&el.closest('.tag');if(tg)hit=['mesa',+tg.dataset.mesa];
 else if(el&&el.closest('#a6-pend,#a6-ceuq'))hit=['holofote',-1];
 else if(el&&el.closest('#a6-proc'))hit=['procurado',-1];
 else if(el&&el.closest('.sala')){const s=el.closest('.sala').dataset.sala;hit=s==='mezanino'?['mezanino',-1]:s==='empresa'?['empresa',-1]:['estudio',s];}
 else if(el&&el.closest('#a6-bot,#a6-top,#a6-dlg'))return;
 else hit=acha(p.wx,p.wy,p.s);
 fx('anel',p.wx,p.wy,t,.45,{r:7,c:P.c3,c2:P.c2});
 if(FICHA)fechaFicha();
 if(!hit){if(p.wy<47||p.wx<40||p.wx>440){for(let k=0;k<6;k++)fx('morcego',p.wx,p.wy,t,2.2,{vx:(k-2.5)*28,vy:-20-(k%3)*12,a:k});}return;}
 const [tp,i]=hit;REACT[tp]=t;ev.preventDefault&&ev.preventDefault();ev.stopPropagation&&ev.stopPropagation();
 if(tp==='mesa'){REACT.mesa=t;REACT.mesaI=i;}
 if(tp==='batman'){REACT.mesa=t;REACT.mesaI=VIGIA;}
 if(tp==='oraculo')JV.para=2;
 if(tp==='holofote'&&pendAgora(t)===0){SINAL.nada=t;$('ceu').hidden=false;$('ceu').textContent='Nada pra você, chefe.';setTimeout(()=>{$('ceu').hidden=true;},1600);return;}
 if(tp==='holofote')SINAL.tranco=t;
 if(tp==='coringa'||tp==='capanga')fx('ha',p.wx-4,p.wy-14,t,1.2,{f:1});
 if(tp==='mezanino'||tp==='empresa'||tp==='estudio'){const A=AND[tp==='estudio'?'estudios':tp];const bx=44+Math.floor((p.wx-44)/49)*49;HOV.luz={x0:bx+2,x1:bx+49,y0:A.topo+3,y1:A.chao-A.rod,t};}
 setTimeout(()=>abreFicha(tp,i,p.sx,p.sy),150);}
function passar(ev){if(ev.pointerType&&ev.pointerType!=='mouse')return;if(embutidoEstreito())return;const p=pontoMundo(ev);let hit=null;const el=ev.target;
 if(el.closest&&el.closest('.tag'))hit=['mesa',+el.closest('.tag').dataset.mesa];else if(!(el.closest&&el.closest('#a6-ficha,#a6-bot,#a6-top')))hit=acha(p.wx,p.wy,p.s);
 HOV.tipo=hit?hit[0]:'';HOV.i=hit?hit[1]:-1;host.style.cursor=hit?'pointer':'';
 if(!hit&&p.wy>54&&p.wy<218&&p.wx>44&&p.wx<436){const A=ANDARES.find(a=>p.wy>=a.topo&&p.wy<a.chao);if(A&&A.id!=='terreo'){const bx=44+Math.floor((p.wx-44)/49)*49;HOV.bay={x0:bx+2,x1:Math.min(436,bx+49),y0:A.topo+3,y1:A.chao-A.rod};}else HOV.bay=null;}else HOV.bay=null;
 tagEls.forEach((e,k)=>e.classList.toggle('hover',HOV.tipo==='mesa'&&HOV.i===k));}
host.addEventListener('pointerdown',toque);
host.addEventListener('pointermove',passar);
host.addEventListener('pointerleave',()=>{HOV.tipo='';HOV.bay=null;tagEls.forEach(e=>e.classList.remove('hover'));});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&FICHA)fechaFicha();});
/* os cartões: o que cada um responde */
function dur(s){s=Math.max(0,Math.round(s));if(s<60)return s+' s';const m=Math.floor(s/60);if(m<60)return m+' min';const h=Math.floor(m/60);if(h<24)return h+' h'+(m%60?' '+String(m%60).padStart(2,'0'):'');return Math.floor(h/24)+' d'+(h%24?' '+(h%24)+' h':'');}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function velho(){return D.agoraDado&&agoraMs()-D.agoraDado>120000?Math.round((agoraMs()-D.agoraDado)/60000):0;}
function irCentral(aba,btn){try{const f=document.getElementById('a47-tela');if(f&&!f.hidden){const b=document.getElementById('a47-tela-fechar');if(b)b.click();}
  if(typeof raiz.irPara==='function'){raiz.irPara(aba);fechaFicha();return;}}catch(e){}
 if(btn){btn.textContent='Não abriu daqui';btn.disabled=true;}}
function botoes(lista){const b=el('div','fc-ac');const pode=typeof raiz.irPara==='function';const vel=velho();
 if(pode)for(const [txt,aba] of lista){const x=el('button',null,txt);x.type='button';if(vel)x.disabled=true;x.addEventListener('click',()=>irCentral(aba,x));b.appendChild(x);}
 const f=el('button','fc-x','Fechar');f.type='button';f.addEventListener('click',fechaFicha);b.appendChild(f);return b;}
function linhas(pares){const dl=el('dl');for(const [k,v] of pares){if(v==null||v==='')continue;dl.appendChild(el('dt',null,k));dl.appendChild(el('dd',null,v));}return dl;}
function conteudo(tp,i){const c=document.createDocumentFragment();const ag=agoraMs()/1000;const vel=velho();let est='',e='';
 const topo=(nm,txt)=>{const d=el('div','fc-top');d.appendChild(el('b','fc-nm',nm));d.appendChild(el('span','fc-est',txt));c.appendChild(d);};
 if(tp==='mesa'||tp==='capanga'){const d=DESKS[i];if(!d||!d.who)return null;const nome=d.who;const k=estadoMesa(d);const er=ERROS.find(x=>x.quem===nome);
  e=er?'erro':k==='y'?'espera':'anda';topo(nomeMesa(nome),er?'Com erro':k==='y'?'Espera você':'Trabalhando');
  const tr=trabalhosDe(nome)[0];const at=ativos().find(a=>a&&a.nome===nome);
  const desde=at&&num(at.etapa_desde)?at.etapa_desde:tr&&num(tr.passo_desde)?tr.passo_desde:at&&num(at.desde)?at.desde:null;
  const tit=tr?curtoT(tr.nome)+(num(tr.pct)&&tr.pct>0?' · '+Math.round(tr.pct)+'%':num(tr.n)&&tr.n>1?' · etapa '+(Math.min(num(tr.k)?tr.k:0,tr.n-1)+1)+' de '+tr.n:''):at&&(at.titulo||at.trabalho)?String(at.titulo||at.trabalho):'';
  const ult=er?er.linha:at&&at.agora?String(at.agora):'';
  c.appendChild(linhas([['Trabalho',tit],['Etapa',tr&&tr.etapa?String(tr.etapa):at&&at.etapa?String(at.etapa):''],['Há quanto tempo',desde?dur(ag-desde):''],['Última linha',ult||(desde?'Sem saída ainda. Abriu há '+dur(ag-desde)+'.':'Sem saída ainda.')]]));
  if(er)c.appendChild(el('p','fc-dica','O Coringa pregou a carta nessa mesa. Veja a última linha no Ao vivo e, se travou, peça pro terminal tentar de novo no Maestri.'));
  if(vel)c.appendChild(el('p','fc-velho','Dado de há '+vel+' min.'));
  c.appendChild(botoes([['Ver ao vivo','aovivo'],['Olho de Deus','olho']]));}
 else if(tp==='coringa'){const er=ERROS.find(x=>x.quem===ARCO.quem)||{quem:ARCO.quem,linha:ARCO.linha};e='erro';topo('O CORINGA PASSOU',nomeMesa(er.quem));
  c.appendChild(linhas([['Terminal',String(er.quem||'')],['A carta diz',String(er.linha||'')],['Há quanto tempo',dur(TEMPO-ARCO.t0)]]));
  c.appendChild(el('p','fc-dica','O que fazer: abra o Ao vivo e leia a última linha. Se o terminal travou, peça pra ele tentar de novo no Maestri. Quando o trabalho voltar a andar, o Batman resolve o resto.'));
  c.appendChild(botoes([['Ver ao vivo','aovivo']]));}
 else if(tp==='holofote'){e='espera';const p=pendAgora(TEMPO);topo(p+(p===1?' PENDÊNCIA':' PENDÊNCIAS'),'esperando você');
  const its=[];try{if(typeof E!=='undefined'&&E&&E.fila&&Array.isArray(E.fila.lista)){const pv=typeof precisaDeVoce==='function'?precisaDeVoce:(()=>true);E.fila.lista.filter(x=>x&&pv(x)).slice(0,3).forEach(x=>its.push(String(x.titulo||x.oque||'')));}}catch(er){}
  if(its.length){const ul=el('ul','fc-lista');its.forEach(s=>ul.appendChild(el('li',null,s)));c.appendChild(ul);}
  c.appendChild(linhas([['Esperando há',ESPERA_MIN>=1?dur(ESPERA_MIN*60):'agora mesmo']]));
  c.appendChild(botoes([['Abrir as pendências','fila']]));}
 else if(tp==='comissario'){const p=pendAgora(TEMPO);topo('O COMISSÁRIO',p?'de olho no céu':'tomando café');
  let velha='';try{if(typeof E!=='undefined'&&E&&E.fila&&Array.isArray(E.fila.lista)){const l=E.fila.lista.filter(x=>x&&x.criado_ts).sort((a,b)=>a.criado_ts-b.criado_ts)[0];if(l)velha=String(l.titulo||l.oque||'')+' · há '+dur(ag-(l.criado_ts>1e11?l.criado_ts/1000:l.criado_ts));}}catch(er){}
  c.appendChild(linhas([['A pendência mais velha',velha||(p?'esperando há '+dur(ESPERA_MIN*60):'nada esperando você')],['Entregues hoje',String(dia().entregas)],['Trabalhando',String(DESKS.filter(d=>d.who).length)]]));
  c.appendChild(botoes(p?[['Abrir as pendências','fila']]:[]));}
 else if(tp==='batman'){const d=DESKS[VIGIA];topo('DE VIGIA',d&&d.who?nomeMesa(d.who):'a cidade');const tr=d&&d.who?trabalhosDe(d.who)[0]:null;
  c.appendChild(linhas([['Por quê',d&&d.who?'é o trabalho há mais tempo na mesma etapa':'ninguém trabalhando agora'],['Trabalho',tr?curtoT(tr.nome):''],['Na etapa há',tr&&tr.passo_desde?dur(ag-tr.passo_desde):'']]));
  c.appendChild(botoes(d&&d.who?[['Ver ao vivo','aovivo']]:[]));}
 else if(tp==='oraculo'||tp==='relogio'){topo(tp==='oraculo'?'O CADERNO DA ORÁCULO':'LIMITE DO CLAUDE',tp==='oraculo'?({dormindo:'fazendo a ronda',ouvindo:'ouvindo você',pensando:'pensando',falando:'falando'}[voz.estado]||''):'');
  const u=usoCl();const p=D.pc||{};const mem=num(p.ram_total_gb)&&num(p.ram_livre_gb)?Math.round((1-p.ram_livre_gb/p.ram_total_gb)*100):null;
  const vira=v=>v?new Date((v+D.tz*60)*1000).toISOString().slice(11,16).replace(':','h'):'';
  c.appendChild(linhas([['Sessão de 5 h',u.s!=null?u.s+'%'+(u.sv?' · vira às '+vira(u.sv):''):'sem janela aberta'],['Semana',u.w!=null?u.w+'%'+(u.wv?' · vira '+['dom','seg','ter','qua','qui','sex','sáb'][new Date((u.wv+D.tz*60)*1000).getUTCDay()]+' às '+vira(u.wv):''):''],
   ['Memória do PC',mem!=null?mem+'% em uso'+(mem>=88?', por isso chove':''):''],['CPU',num(p.cpu)?Math.round(p.cpu)+'%':'']]));
  c.appendChild(botoes([]));}
 else if(tp==='mezanino'||tp==='empresa'||tp==='estudio'){const L=D.terminais.lista.filter(x=>x&&x.nome);let ls,nm;
  if(tp==='mezanino'){ls=L.filter(x=>x.status==='parado'||x.status==='shell');nm='MEZANINO';}else if(tp==='empresa'){ls=L.filter(x=>semAc(x.andar)==='empresa');nm='EMPRESA';}else{const s=ESTUDIOS.find(x=>x.id===i);ls=L.filter(x=>s&&semAc(x.andar)===semAc(s.nome));nm=(s?s.nome:'').toUpperCase();}
  topo(nm,ls.length?ls.length+(tp==='mezanino'?' dormindo':' aqui'):'vazio');
  if(ls.length){const ul=el('ul','fc-lista');ls.slice(0,6).forEach(x=>ul.appendChild(el('li',null,String(x.nome).replace(/TERMMINAL/g,'TERMINAL')+(x.titulo?' · '+x.titulo:''))));c.appendChild(ul);}
  else c.appendChild(el('p','fc-dica',tp==='mezanino'?'Ninguém dormindo. Quem para de trabalhar sobe pra cá.':'Ninguém neste andar agora.'));
  c.appendChild(botoes([]));}
 else if(tp==='procurado'){topo('PROCURADO','o Coringa');c.appendChild(linhas([['Ataques hoje',String(dia().ataques)],['Agora',ERROS.length?'em cena, na mesa de '+nomeMesa(ARCO.quem||ERROS[0].quem):'longe daqui']]));c.appendChild(botoes([]));}
 else return null;
 return {c,e};}
function usoCl(){const ut=D.uso_tv||{},uc=D.uso_claude||{};const s=ut.sessao&&num(ut.sessao.pct)?Math.round(ut.sessao.pct):num(uc.sessao_pct)?Math.round(uc.sessao_pct):null;const w=ut.semana&&num(ut.semana.pct)?Math.round(ut.semana.pct):num(uc.semana_pct)?Math.round(uc.semana_pct):null;
 return {s,w,sv:ut.sessao&&ut.sessao.vira,wv:ut.semana&&ut.semana.vira,p:s!=null?s:w};}
function abreFicha(tp,i,sx,sy){if($('stage').getBoundingClientRect().width/1920<.4){const b=document.getElementById('a47-cheia');if(b&&!TOQUE_PEND){TOQUE_PEND={tp,i,t:performance.now()};b.click();}return;}   /* r5: tela pequena (768) abre a tela cheia e o cartão depois */  /* pequeno demais pra ler: no celular a Central abre a tela cheia antes */
 const r=conteudo(tp,i);if(!r)return;const f=$('ficha');f.replaceChildren(r.c);f.dataset.e=r.e||'';f.hidden=false;$('veu').hidden=false;host.classList.add('ficha-aberta');FICHA={tp,i,sx,sy};posFicha();
 const b=f.querySelector('button');if(b&&!opts.semFoco)try{b.focus({preventScroll:true});}catch(e){}}
function refazFicha(){if(!FICHA)return;const f=$('ficha');if(f.contains(document.activeElement)&&document.activeElement.tagName==='BUTTON'&&document.activeElement.disabled===false){}const r=conteudo(FICHA.tp,FICHA.i);if(!r){fechaFicha();return;}f.replaceChildren(r.c);f.dataset.e=r.e||'';posFicha();}
function posFicha(){if(!FICHA)return;const f=$('ficha');const st=$('stage').getBoundingClientRect(),hr=host.getBoundingClientRect();const s=st.width/1920;
 const x0=(Math.max(hr.left,0,st.left)-st.left)/s,y0=(Math.max(hr.top,0,st.top)-st.top)/s,x1=(Math.min(hr.right,innerWidth,st.right)-st.left)/s,y1=Math.min(896,(Math.min(hr.bottom,innerHeight,st.bottom)-st.top)/s);
 const W=Math.max(360,Math.min(700,x1-x0-48));f.style.width=W+'px';const h=f.offsetHeight;
 const left=clamp(FICHA.sx-W/2,x0+24,Math.max(x0+24,x1-24-W));const meio=(y0+y1)/2;const y0b=host.classList.contains('recortado')?y0+16:Math.max(y0+16,112);   /* r4: o cartão não cobre o placar de cima */
 let top=FICHA.sy-48-h>=y0b?FICHA.sy-48-h:FICHA.sy+48;top=clamp(top,y0b,Math.max(y0b,y1-16-h));
 f.style.left=Math.round(left)+'px';f.style.top=Math.round(top)+'px';}
function fechaFicha(){FICHA=null;$('ficha').hidden=true;$('veu').hidden=true;host.classList.remove('ficha-aberta');}
/* a legenda da Central falava do robô do café; a ronda agora é da Oráculo */
(function(){const lg=document.getElementById('a47-legenda');if(!lg||!raiz.MutationObserver)return;const fix=()=>{if(/Jarvis faz a ronda servindo café/.test(lg.textContent))lg.textContent=lg.textContent.replace('O Jarvis faz a ronda servindo café.','A Oráculo faz a ronda pela torre. Toque num boneco ou numa mesa.');};fix();new MutationObserver(fix).observe(lg,{childList:true,characterData:true,subtree:true});})();
/* ===== o palco: os closes com desenho próprio, no tamanho deles (holofote, gárgula, mesa, luta, revanche).
   Tela de 480x270 em 4x, com bonecos articulados de uns 120 px (Batman, Coringa, comissário) desenhados por osso,
   sombra e luz, e cenário pintado pra cada close. A coreografia é a mesma da torre: o palco lê as poses dela. ===== */
const PCV=document.getElementById('a6-palco'),PG0=PCV.getContext('2d');let PG=PG0;PG.imageSmoothingEnabled=false;
const [RIMC,RIMG]=mk(480,270),[RIMT,RIMTG]=mk(480,270);   /* r4: luz de recorte do Batman (lado da lua) */
const PW=480,PH=270,CHAO=222;
function pR(x,y,w,h,c){PG.fillStyle=c;PG.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function pX(x,y,c){PG.fillStyle=c;PG.fillRect(Math.round(x),Math.round(y),1,1);}
function pDisco(cx,cy,r,c,g){g=g||PG;if(r<.5)return;const r2=r*r;g.fillStyle=c;for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++){const dy=y+.5-cy;if(dy*dy>r2)continue;const hw=Math.sqrt(r2-dy*dy);const xa=Math.round(cx-hw),xb=Math.round(cx+hw);if(xb>xa)g.fillRect(xa,y,xb-xa,1);}}
const PCRUZ=new Float32Array(64);
function pPoly(pts,c,g){g=g||PG;const n=pts.length>>1;let y0=1e9,y1=-1e9;for(let i=0;i<n;i++){const y=pts[i*2+1];if(y<y0)y0=y;if(y>y1)y1=y;}g.fillStyle=c;
 for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yy=y+.5;let k=0;for(let i=0;i<n;i++){const ax=pts[i*2],ay=pts[i*2+1],bx=pts[((i+1)%n)*2],by=pts[((i+1)%n)*2+1];if((ay<=yy&&by>yy)||(by<=yy&&ay>yy))PCRUZ[k++]=ax+(yy-ay)/(by-ay)*(bx-ax);}
  for(let i=1;i<k;i++){const v=PCRUZ[i];let j=i-1;while(j>=0&&PCRUZ[j]>v){PCRUZ[j+1]=PCRUZ[j];j--;}PCRUZ[j+1]=v;}
  for(let i=0;i+1<k;i+=2){const xa=Math.round(PCRUZ[i]),xb=Math.round(PCRUZ[i+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1);}}}
function pCap(x1,y1,r1,x2,y2,r2,c,g){pDisco(x1,y1,r1,c,g);pDisco(x2,y2,r2,c,g);const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;pPoly([x1+nx*r1,y1+ny*r1,x2+nx*r2,y2+ny*r2,x2-nx*r2,y2-ny*r2,x1-nx*r1,y1-ny*r1],c,g);}
const LZ={x:-.9,y:-.7};   /* a luz vem de cima e da esquerda (a lua) */
function pMembro(a,b,r1,r2,cor){pCap(a.x,a.y,r1,b.x,b.y,r2,cor.s);pCap(a.x+LZ.x,a.y+LZ.y,r1-1.1,b.x+LZ.x,b.y+LZ.y,r2-1.1,cor.c);pCap(a.x+LZ.x*2.2,a.y+LZ.y*2.2,Math.max(.8,r1*.32),b.x+LZ.x*2.2,b.y+LZ.y*2.2,Math.max(.8,r2*.32),cor.h);}
const RAD=Math.PI/180;
/* esqueleto: ângulo 0 = pra baixo, 90 = pra frente (pro lado que ele olha), 180 = pra cima */
function ossos(Dm,po,x,ch,f){const v=(u,L)=>({x:Math.sin(u*RAD)*L*f,y:Math.cos(u*RAD)*L});
 const kB=v(po.hB||0,Dm.coxa),pB={x:kB.x+v(po.kB||0,Dm.can).x,y:kB.y+v(po.kB||0,Dm.can).y},kF=v(po.hF||0,Dm.coxa),pF={x:kF.x+v(po.kF||0,Dm.can).x,y:kF.y+v(po.kF||0,Dm.can).y};
 const sent=po.sentado?Dm.coxa*.15:0;const baixo=po.sentado?Dm.can+2:Math.max(pB.y,pF.y);
 const hip={x:x+(po.dx||0)*f,y:ch-baixo-(po.alto||0)-sent};const ad=(o,p)=>({x:o.x+p.x,y:o.y+p.y});
 const J={hip,kB:ad(hip,kB),pB:ad(hip,pB),kF:ad(hip,kF),pF:ad(hip,pF)};
 const le=(po.lean||0)*RAD;J.sh={x:hip.x+Math.sin(le)*Dm.tronco*f,y:hip.y-Math.cos(le)*Dm.tronco};
 const hl=le+(po.head||0)*RAD;J.hd={x:J.sh.x+Math.sin(hl)*(Dm.pesc+Dm.cab)*f,y:J.sh.y-Math.cos(hl)*(Dm.pesc+Dm.cab)};
 J.sB={x:J.sh.x-f*3,y:J.sh.y+2};J.sF={x:J.sh.x+f*2,y:J.sh.y+2};
 J.eB=ad(J.sB,v(po.uB||0,Dm.braco));J.wB=ad(J.eB,v(po.lB||0,Dm.ante));J.eF=ad(J.sF,v(po.uF||0,Dm.braco));J.wF=ad(J.eF,v(po.lF||0,Dm.ante));
 if(po.rot){const a=po.rot*RAD*f,c=Math.cos(a),s2=Math.sin(a);for(const k in J){const q=J[k];const dx=q.x-hip.x,dy=q.y-hip.y;q.x=hip.x+dx*c-dy*s2;q.y=hip.y+dx*s2+dy*c;}
  let m=-1e9;for(const k in J)m=Math.max(m,J[k].y);const sh=(po.topo!=null?0:ch-m-2);for(const k in J)J[k].y+=sh;
  if(po.topo!=null){let mn=1e9;for(const k in J)mn=Math.min(mn,J[k].y);for(const k in J)J[k].y+=po.topo-mn;}}
 J.le=le;J.hl=hl;return J;}
function torso(J,w1,w2,cor,f){const ax=J.sh.x-J.hip.x,ay=J.sh.y-J.hip.y,L=Math.hypot(ax,ay)||1,nx=-ay/L,ny=ax/L;
 const p=(o,w)=>[o.x+nx*w,o.y+ny*w,o.x-nx*w,o.y-ny*w];const a=p(J.hip,w1),b=p(J.sh,w2);
 pPoly([a[0],a[1],b[0],b[1],b[2],b[3],a[2],a[3]],cor.s);pPoly([a[0]+LZ.x,a[1]+LZ.y,b[0]+LZ.x,b[1]+LZ.y,b[2]+LZ.x*.2,b[3],a[2]+LZ.x*.2,a[3]],cor.c);
 return {nx,ny,ax:ax/L,ay:ay/L};}
/* cores dos três */
const PB_={s:'#0b0e16',c:'#1f2638',h:'#47557a'},PBC={s:'#080a10',c:'#141a26',h:'#323e58'},PJ={s:'#2e1450',c:'#6a2fb0',h:'#a64dff'},PJp={s:'#1e0c38',c:'#3a1a5c',h:'#5a3080'},PJv={s:'#1a5a24',c:'#36a046',h:'#5fe06a'},
 PGc={s:'#1e1c16',c:'#3a352c',h:'#5a5444'},PGp={s:'#101216',c:'#22252c',h:'#3a3e48'},PELE={s:'#5a3a26',c:'#b8875f',h:'#e2b896'};
const DB={coxa:24,can:24,tronco:34,pesc:3,cab:10,braco:20,ante:18},DJ={coxa:23,can:24,tronco:33,pesc:4,cab:10,braco:20,ante:19},DG={coxa:22,can:22,tronco:32,pesc:3,cab:10,braco:19,ante:17};
/* as poses do palco, com os mesmos nomes das poses da torre */
const QB={
 guarda0:{lean:6,hB:-22,kB:-10,hF:24,kF:8,uB:35,lB:150,uF:55,lF:160},guarda1:{lean:9,hB:-20,kB:-8,hF:26,kF:10,uB:38,lB:152,uF:58,lF:162,alto:-1},
 passo0:{lean:10,hB:-30,kB:-55,hF:30,kF:15,uB:-20,lB:10,uF:40,lF:100},passo1:{lean:8,hB:10,kB:-10,hF:-5,kF:-45,uB:30,lB:60,uF:-10,lF:20},
 socoC:{lean:-6,hB:-25,kB:-5,hF:25,kF:10,uB:60,lB:140,uF:-45,lF:60},socoE:{lean:14,hB:-35,kB:-20,hF:32,kF:15,uB:40,lB:120,uF:102,lF:100},
 socoE2:{lean:20,hB:-38,kB:-22,hF:34,kF:16,uB:40,lB:120,uF:110,lF:106,dx:4},socoR:{lean:8,hB:-25,kB:-10,hF:26,kF:10,uB:40,lB:140,uF:70,lF:130},
 cotC:{lean:-4,hB:-25,kB:-8,hF:25,kF:10,uB:40,lB:140,uF:20,lF:170},cotA:{lean:18,hB:-35,kB:-20,hF:32,kF:14,uB:30,lB:120,uF:100,lF:230,dx:3},cotR:{lean:8,hB:-25,kB:-10,hF:25,kF:10,uB:40,lB:140,uF:60,lF:150},
 esq0:{lean:-18,head:-8,hB:-40,kB:-30,hF:15,kF:0,uB:50,lB:150,uF:70,lF:160,dx:-4},esq1:{lean:-28,head:-12,hB:-45,kB:-40,hF:10,kF:-5,uB:55,lB:150,uF:75,lF:160,dx:-8},
 bloq:{lean:4,hB:-24,kB:-8,hF:24,kF:8,uB:100,lB:170,uF:115,lF:175},apanha0:{lean:-22,head:-18,hB:-15,kB:-5,hF:28,kF:12,uB:-30,lB:-10,uF:-20,lF:10},
 apanha1:{lean:-32,head:-25,hB:-5,kB:10,hF:35,kF:20,uB:-45,lB:-20,uF:-35,lF:-5,dx:-6},gancho0:{lean:0,hB:-4,kB:0,hF:4,kF:0,uB:10,lB:20,uF:178,lF:180},
 gancho1:{lean:5,hB:30,kB:-20,hF:50,kF:-10,uB:10,lB:20,uF:175,lF:180},pousa:{lean:35,hB:88,kB:-15,hF:78,kF:-20,uB:40,lB:60,uF:60,lF:80},
 vence0:{lean:0,hB:-6,kB:-2,hF:8,kF:3,uB:8,lB:12,uF:12,lF:16},vence1:{lean:1,hB:-6,kB:-2,hF:8,kF:3,uB:9,lB:14,uF:13,lF:18,alto:-1},
 plana0:{lean:40,hB:-10,kB:-20,hF:10,kF:-10,uB:120,lB:130,uF:130,lF:140},plana1:{lean:42,hB:-12,kB:-24,hF:12,kF:-12,uB:118,lB:126,uF:128,lF:136},
 vigia:{lean:40,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:40,lF:60},cafe0:{lean:38,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:40,lF:176},cafe1:{lean:40,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:60,lF:120},
 aponta:{lean:40,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:110,lF:130},aceno0:{lean:30,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:165,lF:200},aceno1:{lean:30,hB:100,kB:-10,hF:92,kF:-15,uB:30,lB:50,uF:170,lF:150},
 amarrado0:{lean:-2,hB:92,kB:0,hF:88,kF:5,uB:-15,lB:15,uF:-10,lF:20,sentado:1},amarrado1:{lean:-2,hB:92,kB:0,hF:88,kF:28,uB:-15,lB:15,uF:-10,lF:20,sentado:1},
 rompe:{lean:0,hB:-8,kB:-2,hF:10,kF:4,uB:130,lB:150,uF:130,lF:150},
 tosse0:{lean:30,head:24,hB:88,kB:-15,hF:78,kF:-20,uB:25,lB:35,uF:55,lF:168},tosse1:{lean:36,head:30,hB:88,kB:-15,hF:78,kF:-20,uB:28,lB:38,uF:58,lF:172,alto:-1}};
const QJ={
 ri0:{lean:-14,head:-25,hB:-8,kB:0,hF:10,kF:5,uB:25,lB:110,uF:28,lF:115},ri1:{lean:-18,head:-30,hB:-8,kB:0,hF:10,kF:5,uB:28,lB:112,uF:30,lF:118,alto:-1},ri2:{lean:-10,head:-18,hB:-8,kB:0,hF:10,kF:5,uB:24,lB:108,uF:26,lF:112},
 anda0:{lean:-8,head:8,hB:-22,kB:-35,hF:25,kF:10,uB:30,lB:40,uF:-20,lF:0},anda1:{lean:-10,head:10,hB:0,kB:-5,hF:0,kF:-10,uB:5,lB:20,uF:5,lF:20,alto:-1},
 anda2:{lean:-8,head:8,hB:25,kB:10,hF:-22,kF:-35,uB:-20,lB:0,uF:30,lF:40},anda3:{lean:-10,head:10,hB:0,kB:-10,hF:0,kF:-5,uB:5,lB:20,uF:5,lF:20,alto:-1},
 joga0:{lean:-8,hB:-20,kB:-5,hF:20,kF:5,uB:30,lB:60,uF:-50,lF:40},joga1:{lean:12,hB:-28,kB:-15,hF:28,kF:10,uB:20,lB:40,uF:110,lF:120},joga2:{lean:6,hB:-24,kB:-10,hF:24,kF:8,uB:20,lB:40,uF:80,lF:80},
 spray0:{lean:0,hB:-18,kB:-5,hF:20,kF:6,uB:10,lB:30,uF:40,lF:172},spray1:{lean:6,hB:-22,kB:-8,hF:24,kF:8,uB:10,lB:30,uF:85,lF:85},spray2:{lean:9,hB:-24,kB:-10,hF:26,kF:9,uB:-10,lB:10,uF:88,lF:95},
 esq0:{lean:-25,head:-15,hB:-30,kB:-20,hF:15,kF:5,uB:-30,lB:0,uF:60,lF:120,dx:-4},esq1:{lean:-15,head:-8,hB:-25,kB:-15,hF:15,kF:5,uB:-20,lB:10,uF:50,lF:110,dx:-2},
 apanha0:{lean:-22,head:-20,hB:-15,kB:-5,hF:28,kF:12,uB:-30,lB:-10,uF:-25,lF:5},apanha1:{lean:-34,head:-28,hB:-5,kB:10,hF:35,kF:20,uB:-45,lB:-20,uF:-40,lF:-10,dx:-6},
 cai0:{lean:-48,head:-30,hB:10,kB:20,hF:40,kF:30,uB:-60,lB:-40,uF:-50,lF:-30},cai1:{lean:-10,head:-10,hB:20,kB:10,hF:30,kF:20,uB:-120,lB:-100,uF:-110,lF:-90,rot:-60},cai2:{lean:0,head:-5,hB:10,kB:5,hF:20,kF:10,uB:-150,lB:-140,uF:-140,lF:-120,rot:-88},
 foge0:{lean:25,hB:-35,kB:-70,hF:45,kF:20,uB:60,lB:100,uF:-40,lF:-10},foge1:{lean:22,hB:5,kB:-20,hF:0,kF:-50,uB:10,lB:40,uF:20,lF:60,alto:-2},foge2:{lean:25,hB:45,kB:20,hF:-35,kF:-70,uB:-40,lB:-10,uF:60,lF:100},foge3:{lean:22,hB:0,kB:-50,hF:5,kF:-20,uB:20,lB:60,uF:10,lF:40,alto:-2},
 pendura:{lean:0,hB:-6,kB:-4,hF:6,kF:4,uB:-170,lB:-175,uF:-172,lF:-178,rot:180,topo:0},prega:{lean:0,hB:-6,kB:-4,hF:6,kF:4,uB:-170,lB:-175,uF:-110,lF:-100,rot:180,topo:0},
 senta0:{lean:-25,head:-5,hB:80,kB:62,hF:85,kF:68,uB:20,lB:60,uF:70,lF:100,sentado:1},senta1:{lean:-25,head:-5,hB:80,kB:62,hF:85,kF:68,uB:20,lB:60,uF:70,lF:92,sentado:1},
 mostra:{lean:-6,head:-6,hB:-8,kB:0,hF:10,kF:5,uB:25,lB:110,uF:150,lF:172},balao:{lean:-4,head:-14,hB:-6,kB:-20,hF:8,kF:-10,uB:20,lB:60,uF:175,lF:180},
 choque:{lean:14,hB:-28,kB:-15,hF:28,kF:10,uB:20,lB:40,uF:92,lF:92}};
const QG={idle0:{uF:12,lF:70,uB:6,lB:10},idle1:{uF:12,lF:72,uB:6,lB:10,alto:-1},semcaneca0:{uF:8,lF:12,uB:6,lB:10},semcaneca1:{uF:8,lF:14,uB:6,lB:10,alto:-1},gole:{uF:25,lF:170,uB:6,lB:10,head:-8},
 ceu0:{head:-38,lean:-6,uF:14,lF:70,uB:6,lB:10},ceu1:{head:-40,lean:-7,uF:14,lF:72,uB:6,lB:10,alto:-1},encosta:{lean:-10,head:-25,uB:-30,lB:60,uF:40,lF:140,hB:-6,hF:14,kF:-10},
 cochila0:{lean:20,head:30,hB:90,kB:0,hF:88,kF:4,uF:40,lF:70,uB:20,lB:40,sentado:1},cochila1:{lean:22,head:34,hB:90,kB:0,hF:88,kF:4,uF:40,lF:70,uB:20,lB:40,sentado:1},
 vira:{lean:4,uF:70,lF:130,uB:6,lB:10},mao:{lean:6,head:22,uF:70,lF:75,uB:6,lB:10},brinde:{lean:-4,uF:170,lF:178,uB:6,lB:10},relogio:{lean:4,head:20,uF:75,lF:150,uB:6,lB:10}};
/* a capa do palco: mesma física, corrente própria */
const CAPA2={p:[],ok:false};for(let i=0;i<8;i++)CAPA2.p.push({x:0,y:0,px:0,py:0});
function capaPalco(ax,ay,f,dt,t,modo){const pts=CAPA2.p;dt=Math.min(dt,.05);if(!CAPA2.ok){pts.forEach((q,i)=>{q.x=q.px=ax-f*i*2;q.y=q.py=ay+i*8;});CAPA2.ok=true;}
 pts[0].x=pts[0].px=ax;pts[0].y=pts[0].py=ay;const vento=-f*(modo==='asa'?320:modo==='voa'?180:modo==='enrola'?10+Math.sin(t*1.7)*6:50+Math.sin(t*1.7)*30+Math.sin(t*4.3)*14);const grav=modo==='asa'?-30:modo==='enrola'?120:170;
 for(let i=1;i<pts.length;i++){const q=pts[i];const vx=(q.x-q.px)*.9,vy=(q.y-q.py)*.9;q.px=q.x;q.py=q.y;q.x+=vx+vento*dt*dt*i*.6;q.y+=vy+grav*dt*dt;}
 const seg=modo==='enrola'?7.5:9;for(let it=0;it<3;it++)for(let i=1;i<pts.length;i++){const a=pts[i-1],q=pts[i];const dx=q.x-a.x,dy=q.y-a.y,d=Math.hypot(dx,dy)||1;const k=(d-seg)/d;if(i>1){a.x+=dx*k*.5;a.y+=dy*k*.5;q.x-=dx*k*.5;q.y-=dy*k*.5;}else{q.x-=dx*k;q.y-=dy*k;}}
 if(modo==='asa')for(let i=1;i<pts.length;i++)pts[i].y=Math.min(pts[i].y,ay+4+i*2);
 if(pts.some(q=>q.y>CHAO+1))for(const q of pts)if(q.y>CHAO+1)q.y=CHAO+1;
 const n=pts.length,L=[],Rr=[];for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const hw=(modo==='asa'?7:5)+i*(modo==='enrola'?2.6:2.1);L.push(pts[i].x-dy*hw,pts[i].y+dx*hw);Rr.unshift(pts[i].x+dy*hw,pts[i].y-dx*hw);}
 const poly=L.concat(Rr);for(let i=0;i<Rr.length;i+=2){}pPoly(poly,PBC.s);const p2=poly.map((v,i)=>v+(i%2?LZ.y:LZ.x)*1.5);pPoly(p2,PBC.c);
 /* barra recortada em leque */
 {const ax=L[L.length-2],ay=L[L.length-1],bx=Rr[0],by=Rr[1];for(let k=0;k<=4;k++){const u=k/4;pDisco(lerp(ax,bx,u),lerp(ay,by,u),2,PBC.s);}}}
function pintaBatman(x,ch,f,pose,t,dt,capa,caneca){if(PG===PG0){const bx=Math.max(0,Math.round(x-110)),by=Math.max(0,Math.round(ch-200)),bw=Math.min(480-bx,220),bh=Math.min(270-by,206);
  RIMG.clearRect(bx,by,bw,bh);PG=RIMG;let J;try{J=pintaBatman(x,ch,f,pose,t,dt,capa,caneca);}finally{PG=PG0;}
  RIMTG.clearRect(bx,by,bw,bh);RIMTG.globalCompositeOperation='source-over';RIMTG.drawImage(RIMC,bx,by,bw,bh,bx,by,bw,bh);RIMTG.globalCompositeOperation='source-in';RIMTG.fillStyle='#5d6f96';RIMTG.fillRect(bx,by,bw,bh);RIMTG.globalCompositeOperation='source-over';
  PG0.drawImage(RIMT,bx,by,bw,bh,bx+1,by-1,bw,bh);PG0.drawImage(RIMT,bx,by,bw,bh,bx+1,by,bw,bh);PG0.drawImage(RIMC,bx,by,bw,bh,bx,by,bw,bh);return J;}
 const po=QB[pose]||QB.vigia;const J=ossos(DB,po,x,ch,f);
 const dark={s:'#06080c',c:'#121722',h:'#2a3348'};
 capaPalco(J.sh.x-f*2,J.sh.y+1,f,dt,t,capa);
 pMembro(J.sB,J.eB,4.6,4,dark);pMembro(J.eB,J.wB,4,3.6,dark);pDisco(J.wB.x,J.wB.y,4.2,'#090b10');
 pMembro(J.hip,J.kB,6,5,dark);pMembro(J.kB,J.pB,5,4.6,dark);pCap(J.pB.x,J.pB.y-1,4.6,J.pB.x+f*5,J.pB.y,3.6,'#06080c');
 const T=torso(J,9,15,PB_,f);
 /* cinto e o peito */
 pCap(J.hip.x+T.ax*3-T.nx*9,J.hip.y+T.ay*3-T.ny*9,1.8,J.hip.x+T.ax*3+T.nx*9,J.hip.y+T.ay*3+T.ny*9,1.8,'#8a7a4a');
 pMembro(J.hip,J.kF,6.4,5.4,PB_);pMembro(J.kF,J.pF,5.4,4.8,PB_);pCap(J.pF.x,J.pF.y-1,5,J.pF.x+f*6,J.pF.y,3.8,'#0b0e16');
 /* cabeça: capuz com orelhas pontudas, os olhos em fenda, o queixo à mostra */
 const H=J.hd,hl=J.hl;const up={x:Math.sin(hl)*f,y:-Math.cos(hl)};const fr={x:Math.cos(hl)*f,y:Math.sin(hl)};
 pDisco(H.x,H.y,9.5,PB_.s);pDisco(H.x+LZ.x,H.y+LZ.y,8.4,PB_.c);
 for(const o of [-4.5,3.5]){const bx=H.x+fr.x*o+up.x*6,by=H.y+fr.y*o+up.y*6;pPoly([bx-fr.x*2.6,by-fr.y*2.6,bx+fr.x*2.6,by+fr.y*2.6,bx+up.x*10+fr.x*.5,by+up.y*10+fr.y*.5],PB_.s);pPoly([bx-fr.x*1.4,by-fr.y*1.4,bx+fr.x*1.2,by+fr.y*1.2,bx+up.x*8,by+up.y*8],PB_.c);}
 pDisco(H.x+fr.x*4.2-up.x*5.4,H.y+fr.y*4.2-up.y*5.4,3.4,'#141a26');pDisco(H.x+fr.x*4.6-up.x*5,H.y+fr.y*4.6-up.y*5,2.4,'#1d2333');
  pCap(H.x+fr.x*1.2+up.x*1.2,H.y+fr.y*1.2+up.y*1.2,.9,H.x+fr.x*6+up.x*.2,H.y+fr.y*6+up.y*.2,.7,'#eef2f8');
 pMembro(J.sF,J.eF,5,4.4,PB_);pMembro(J.eF,J.wF,4.4,4,PB_);pDisco(J.wF.x,J.wF.y,4.8,'#0b0e16');pDisco(J.wF.x+LZ.x,J.wF.y+LZ.y,3.4,'#1f2638');
 if(caneca){pR(J.wF.x+f*2-3,J.wF.y-7,7,8,'#a8926a');pR(J.wF.x+f*2-3,J.wF.y-7,7,2,'#f3e2b8');vaporP(J.wF.x+f*2,J.wF.y-9,t);}
 return J;}
function pintaCoringa(x,ch,f,pose,t,extra){const po=extra?Object.assign({},QJ[pose]||QJ.ri0,extra):(QJ[pose]||QJ.ri0);const J=ossos(DJ,po,x,ch,f);
 /* cauda do paletó */
 const tl=Math.sin(t*6)*2;pPoly([J.hip.x-f*6,J.hip.y-4,J.hip.x-f*2,J.hip.y-2,J.hip.x-f*9+tl,J.hip.y+24,J.hip.x-f*14+tl,J.hip.y+20],PJ.s);
 pMembro(J.sB,J.eB,3.8,3.4,PJp);pMembro(J.eB,J.wB,3.4,3,PJp);pDisco(J.wB.x,J.wB.y,3.4,'#bdb2a0');
 pMembro(J.hip,J.kB,5,4.2,PJp);pMembro(J.kB,J.pB,4.2,3.8,PJp);pCap(J.pB.x,J.pB.y-1,3.6,J.pB.x+f*7,J.pB.y,3,'#2a1e16');
 const T=torso(J,8,13,PJ,f);
 /* colete verde, a gravata e a flor da lapela */
 const mid=(k)=>({x:lerp(J.hip.x,J.sh.x,k),y:lerp(J.hip.y,J.sh.y,k)});const m1=mid(.12),m2=mid(.92);pCap(m1.x+T.nx*2*f,m1.y+T.ny*2*f,3.2,m2.x+T.nx*2*f,m2.y+T.ny*2*f,4.2,PJv.c);pCap(m1.x+T.nx*1*f,m1.y,1.2,m2.x+T.nx*1*f,m2.y,1.6,PJv.h);
 pDisco(m2.x+T.nx*4*f,m2.y-2,2.2,'#5fe06a');pX(m2.x+T.nx*4*f,m2.y-2,'#eef2f8');
 pMembro(J.hip,J.kF,5.4,4.6,PJp);pMembro(J.kF,J.pF,4.6,4.2,PJp);pCap(J.pF.x,J.pF.y-1,3.8,J.pF.x+f*8,J.pF.y,3.2,'#3a2a20');
 /* cabeça pálida, cabelo verde arrepiado, o sorriso enorme */
 const H=J.hd,hl=J.hl;const up={x:Math.sin(hl)*f,y:-Math.cos(hl)};const fr={x:Math.cos(hl)*f,y:Math.sin(hl)};
 pDisco(H.x,H.y,9.2,'#bdb2a0');pDisco(H.x+LZ.x*.8,H.y+LZ.y*.8,8.3,'#ece4d4');
 for(let k=0;k<7;k++){const a=(-1.2+k*.42);const bx=H.x+up.x*6+fr.x*(k*2.4-9),by=H.y+up.y*6+fr.y*(k*2.4-9);const tipx=bx+up.x*(7+(k%2)*4)-fr.x*(3+k*.8),tipy=by+up.y*(7+(k%2)*4)-fr.y*(3+k*.8);pPoly([bx-fr.x*3,by-fr.y*3,bx+fr.x*3,by+fr.y*3,tipx,tipy],k%2?'#36a046':'#5fe06a');}
 pPoly([H.x-fr.x*9+up.x*4,H.y-fr.y*9+up.y*4,H.x-fr.x*5+up.x*7,H.y-fr.y*5+up.y*7,H.x-fr.x*8-up.x*4,H.y-fr.y*8-up.y*4],'#36a046');
 pDisco(H.x+fr.x*3.6+up.x*1.8,H.y+fr.y*3.6+up.y*1.8,2.4,'#5a3080');pDisco(H.x+fr.x*3.8+up.x*1.8,H.y+fr.y*3.8+up.y*1.8,1.2,'#07070b');
 pDisco(H.x+fr.x*8.4,H.y+fr.y*8.4,1.8,'#d8cfc0');
 const riso=pose.startsWith('ri')||pose==='mostra'?1.6:1;for(let k=0;k<=8;k++){const u=k/8;const ox=lerp(-1,8.4,u),oy=-4.2-Math.sin(u*Math.PI)*2.6*riso+(u>.8?1.4:0);pDisco(H.x+fr.x*ox+up.x*oy,H.y+fr.y*ox+up.y*oy,1.3*riso,'#c02838');}
 for(let k=1;k<8;k+=2){const u=k/8;const ox=lerp(-1,8.4,u),oy=-4.2-Math.sin(u*Math.PI)*2.6*riso+.6;pX(H.x+fr.x*ox+up.x*oy,H.y+fr.y*ox+up.y*oy,'#eef2f8');}
 pMembro(J.sF,J.eF,4.2,3.8,PJ);pMembro(J.eF,J.wF,3.8,3.4,PJ);pDisco(J.wF.x,J.wF.y,3.6,'#ece4d4');
 if(pose==='mostra'||pose==='prega'){pR(J.wF.x-5,J.wF.y-16,11,15,'#eef2f8');pR(J.wF.x-5,J.wF.y-16,11,1,'#9aa6bd');pDisco(J.wF.x,J.wF.y-9,2.6,'#a64dff');pX(J.wF.x-3,J.wF.y-14,'#5fe06a');}
 return J;}
function pintaComissario(x,ch,f,pose,t){const po=QG[pose]||QG.idle0;const J=ossos(DG,po,x,ch,f);
 pMembro(J.sB,J.eB,4.2,3.8,PGc);pMembro(J.eB,J.wB,3.8,3.4,PGc);pDisco(J.wB.x,J.wB.y,3.2,PELE.c);
 pMembro(J.hip,J.kB,5,4.2,PGp);pMembro(J.kB,J.pB,4.2,3.8,PGp);pCap(J.pB.x,J.pB.y-1,3.8,J.pB.x+f*6,J.pB.y,3,'#07070b');
 pMembro(J.hip,J.kF,5.2,4.4,PGp);pMembro(J.kF,J.pF,4.4,4,PGp);pCap(J.pF.x,J.pF.y-1,4,J.pF.x+f*6,J.pF.y,3.2,'#07070b');
 /* o sobretudo até o joelho */
 const T=torso(J,13,15,PGc,f);const k1=J.kB,k2=J.kF;pPoly([J.hip.x-T.nx*13,J.hip.y-T.ny*13,J.hip.x+T.nx*13,J.hip.y+T.ny*13,k2.x+f*6,k2.y+2,k1.x-f*6,k1.y+2],PGc.s);pPoly([J.hip.x-T.nx*11+LZ.x,J.hip.y-T.ny*11,J.hip.x+T.nx*10,J.hip.y+T.ny*10,k2.x+f*4,k2.y,k1.x-f*3,k1.y],PGc.c);
 const gola={x:lerp(J.hip.x,J.sh.x,.85),y:lerp(J.hip.y,J.sh.y,.85)};pPoly([J.sh.x-T.nx*12,J.sh.y-T.ny*12,J.sh.x+T.nx*6,J.sh.y+T.ny*6,gola.x+f*2,gola.y+6],PGc.h);
 const H=J.hd,hl=J.hl;const up={x:Math.sin(hl)*f,y:-Math.cos(hl)};const fr={x:Math.cos(hl)*f,y:Math.sin(hl)};
 pDisco(H.x,H.y,8.6,PELE.s);pDisco(H.x+LZ.x*.7,H.y+LZ.y*.7,7.8,PELE.c);
 pPoly([H.x-fr.x*8+up.x*2,H.y-fr.y*8+up.y*2,H.x-fr.x*2+up.x*9,H.y-fr.y*2+up.y*9,H.x+fr.x*6+up.x*7,H.y+fr.y*6+up.y*7,H.x+fr.x*3+up.x*4,H.y+fr.y*3+up.y*4,H.x-fr.x*7-up.x*5,H.y-fr.y*7-up.y*5],'#9aa6bd');
 pCap(H.x+fr.x*1.5+up.x*1.5,H.y+fr.y*1.5+up.y*1.5,1.8,H.x+fr.x*7.5+up.x*1.2,H.y+fr.y*7.5+up.y*1.2,1.8,'#2a2a30');pX(H.x+fr.x*5+up.x*2,H.y+fr.y*5+up.y*2,'#f3e2b8');pX(H.x+fr.x*6+up.x*2,H.y+fr.y*6+up.y*2,'#eef2f8');
 pCap(H.x+fr.x*3-up.x*3.2,H.y+fr.y*3-up.y*3.2,1.3,H.x+fr.x*8-up.x*3,H.y+fr.y*8-up.y*3,1.1,'#7a7a80');
 pMembro(J.sF,J.eF,4.6,4,PGc);pMembro(J.eF,J.wF,4,3.6,PGc);pDisco(J.wF.x,J.wF.y,3.4,PELE.c);
 const temCaneca=!/semcaneca|mao|vira/.test(pose);if(temCaneca){pR(J.wF.x+f*1-3,J.wF.y-6,7,8,'#a8926a');pR(J.wF.x+f*1-3,J.wF.y-6,7,2,'#f3e2b8');pR(J.wF.x+f*5,J.wF.y-4,2,4,'#a8926a');vaporP(J.wF.x+f,J.wF.y-8,t);}
 return J;}
function vaporP(x,y,t){for(let i=0;i<3;i++){const k=((t*.6+i/3)%1);pDisco(x+Math.sin(t*2+i*2)*2+k*2,y-k*16,1+k*2.4,k<.5?'#5a6680':'#3a4560');}}
/* cenários pintados uma vez */
function cidadeAoLonge(g,y0,y1,seed,dens){const rr=rng(seed);let x=-4;while(x<PW){const w=14+(rr()*26|0),top=y0+(rr()*(y1-y0-30)|0),tipo=rr()*4|0;gotico(g,x,top,w,'#121826','#232c40',tipo);
  for(let y=top+5;y<PH;y+=5)for(let xx=x+3;xx<x+w-3;xx+=4)if(rr()<dens){const k=rr();R(g,xx,y,2,3,k<.12?P.a3:k<.5?P.a2:'#5a4e38');}x+=w+(rr()*4|0);}}
function nuvensP(g,seed,y0,y1,c1,c2){const rr=rng(seed);for(let i=0;i<14;i++){const cx=rr()*PW,cy=y0+rr()*(y1-y0),w=40+rr()*90,h=4+rr()*8;for(let y=-h;y<=h;y++)for(let x=-w;x<=w;x++){const e=(x/w)**2+(y/h)**2;if(e>1)continue;const xx=Math.round(cx+x),yy=Math.round(cy+y);if(xx<0||xx>=PW)continue;if(e>.55){if(bay(xx,yy)<.4)X(g,xx,yy,c1);}else X(g,xx,yy,y<-h*.25?c2:c1);}}}
const BGP={};
(function(){ /* o térreo de perto: a parede de pedra, a vidraça ogival grande com a cidade, a mesa e o monitor */
 const [c,g]=mk(PW,PH);R(g,0,0,PW,PH,'#0b0e15');
 for(let y=0;y<CHAO;y+=12)for(let x=((y/12)%2)*16-16;x<PW;x+=32){R(g,x,y,31,11,(x*7+y*3)%5?'#11151f':'#0f131c');R(g,x,y,31,1,'#171c28');}
 /* a vidraça */
 const wx0=96,wx1=304,wy0=26,wy1=206,cx=(wx0+wx1)/2,half=(wx1-wx0)/2,H=70;
 const [v,vg]=mk(PW,PH);gradV(vg,wx0,wy0,wx1-wx0,wy1-wy0,['#07070b','#0c1020','#141a2c','#1d2536','#28324a','#2a3346']);
 nuvensP(vg,5,40,110,'#1a2030','#262e42');
 {const L=LUA;vg.drawImage(L,250-40,62-40);}
 cidadeAoLonge(vg,110,190,8,.16);dith(vg,wx0,170,wx1-wx0,40,'#2a3346',.3);
 g.drawImage(v,wx0,wy0,wx1-wx0,wy1-wy0,wx0,wy0,wx1-wx0,wy1-wy0);
 for(let y=wy0;y<wy0+H;y++){const yy=H-(y-wy0)-.5;const op=-half+Math.sqrt(Math.max(0,4*half*half-(yy*half*1.732/H)**2));R(g,wx0,y,Math.max(0,Math.round(cx-op)-wx0),1,'#0f131c');R(g,Math.round(cx+op),y,Math.max(0,wx1-Math.round(cx+op)),1,'#0f131c');}
 /* moldura, mainéis, travessa e a rosácea */
 const pedra='#2a3346',hi='#4e5a76';
 for(let y=wy0;y<wy1;y++){const r=y-wy0;if(r>=H)continue;const yy=H-r-.5;const op=-half+Math.sqrt(Math.max(0,4*half*half-(yy*half*1.732/H)**2));R(g,cx-op-5,y,5,1,pedra);R(g,cx+op,y,5,1,pedra);X(g,cx-op-5,y,hi);}
 R(g,wx0-5,wy0+H,5,wy1-wy0-H,pedra);R(g,wx1,wy0+H,5,wy1-wy0-H,pedra);R(g,wx0-5,wy0+H,1,wy1-wy0-H,hi);
 for(const mx of [148,200,252])R(g,mx-1,wy0+40,3,wy1-wy0-40,pedra);R(g,wx0,128,wx1-wx0,3,pedra);R(g,wx0,128,wx1-wx0,1,hi);
 for(let a=0;a<48;a++){const an=a/48*6.283;for(const rr2 of [19,20])X(g,Math.round(cx+Math.cos(an)*rr2),Math.round(64+Math.sin(an)*rr2),pedra);}
 for(let a=0;a<8;a++){const an=a/8*6.283;for(let r=4;r<19;r++)X(g,Math.round(cx+Math.cos(an)*r),Math.round(64+Math.sin(an)*r),pedra);}
 pDisco(cx,64,4,pedra,g);R(g,wx0-8,wy1,wx1-wx0+16,6,pedra);R(g,wx0-8,wy1,wx1-wx0+16,1,hi);
 /* coluna e capitel à esquerda; luminária pendurada */
 R(g,28,0,18,CHAO,'#161b27');R(g,28,0,2,CHAO,'#2a3346');R(g,22,150,30,6,'#1d2333');R(g,22,150,30,1,'#3a4560');
 R(g,60,0,1,60,'#2a3346');R(g,54,60,13,6,'#4a3c26');R(g,57,66,7,3,'#f3e2b8');for(let y=0;y<150;y++){const hw=4+y*.42;for(let x=-hw;x<=hw;x++){const xx=Math.round(60+x),yy=70+y;if(bay(xx,yy)<.06*(1-y/150))X(g,xx,yy,'#4a3c26');}}
 /* a mesa do terminal, o monitor, a cadeira */
 R(g,318,192,150,6,'#3a2a20');R(g,318,192,150,2,'#5a4030');R(g,324,198,6,24,'#2a1e16');R(g,458,198,6,24,'#2a1e16');R(g,400,198,52,22,'#2e2219');R(g,400,198,52,2,'#4a3828');R(g,422,206,8,3,'#8a7a5a');R(g,422,213,8,3,'#8a7a5a');
 R(g,348,134,80,54,'#141826');R(g,348,134,80,2,'#3a4560');R(g,384,188,8,4,'#1d2333');R(g,370,190,36,2,'#2a3346');
 R(g,332,186,22,5,'#1d2333');for(let k=0;k<5;k++)R(g,334+k*4,187,3,1,'#3a4560');R(g,440,182,8,10,'#a8926a');R(g,440,182,8,2,'#f3e2b8');
 R(g,455,186,12,6,'#c8bfa8');R(g,456,187,10,1,'#8a7e66');
 /* o chão de pedra com a poça de luz */
 for(let y=CHAO;y<PH;y+=8)for(let x=((y/8)%2)*12-12;x<PW;x+=24){R(g,x,y,23,7,'#141826');R(g,x,y,23,1,'#1d2333');}
 for(let x=-40;x<=40;x++){const f2=1-Math.abs(x)/40;for(let y=0;y<6;y++)if(bay(60+x,CHAO+y)<.55*f2*(1-y/6))X(g,60+x,CHAO+y,'#4a3c26');}
 R(g,0,CHAO,PW,1,'#2a3346');BGP.terreo=c;
})();
(function(){ /* o telhado de perto: céu, nuvens, a lua, a cidade lá embaixo, o parapeito */
 const [c,g]=mk(PW,PH);gradV(g,0,0,PW,215,['#07070b','#0a0d15','#0f131e','#151b29','#1d2536','#28324a']);
 const rr=rng(4);for(let i=0;i<70;i++)X(g,rr()*PW,rr()*120,rr()<.2?P.n6:P.n4);
 nuvensP(g,9,30,150,'#161c2a','#242c40');g.drawImage(LUA,410-40,52-40);
 cidadeAoLonge(g,150,205,12,.18);dith(g,0,186,PW,30,'#2a3346',.35);
 R(g,0,206,PW,PH-206,'#161b27');R(g,0,206,PW,2,'#3a4560');for(let x=0;x<PW;x+=26){R(g,x,192,16,14,'#1d2333');R(g,x,192,16,2,'#4e5a76');R(g,x+15,194,1,12,'#0b0e15');}
 for(let y=210;y<PH;y+=6)for(let x=((y/6)%2)*10;x<PW;x+=20)R(g,x,y,19,5,'#1a2030');
 BGP.telhado=c;})();
(function(){ /* a gárgula de perto: a lua enorme, a cidade lá embaixo e a gárgula de pedra (desenho nosso, cantos cortados) */
 const [c,g]=mk(PW,PH);gradV(g,0,0,PW,PH,['#07070b','#0a0d15','#10141f','#161c2b','#1d2536','#28324a']);
 const rr=rng(6);for(let i=0;i<60;i++)X(g,rr()*PW,rr()*110,rr()<.2?P.n6:P.n4);
 const mx=196,my=92,mr=62;for(let y=-mr-22;y<=mr+22;y++)for(let x=-mr-22;x<=mr+22;x++){const d=Math.hypot(x,y);const xx=mx+x,yy=my+y;if(xx<0||xx>=PW||yy<0||yy>=PH)continue;
  if(d<=mr){let col='#c9d3e6';if(x+y>20&&d>mr-14)col='#aab6cc';if((x+18)**2+(y+12)**2<120||(x-20)**2+(y-22)**2<90||(x-30)**2+(y+24)**2<50||(x+4)**2+(y-36)**2<40)col='#9aa6bd';X(g,xx,yy,col);}
  else if(d<=mr+6){if(bay(xx,yy)<.45)X(g,xx,yy,'#3a4560');}else if(d<=mr+22){if(bay(xx,yy)<.14)X(g,xx,yy,'#2a3346');}}
 const P2=(pts,cc)=>pPoly(pts,cc,g);
 const nuv=(x,y,w,h)=>{P2([x,y+h,x+w*.1,y+h*.35,x+w*.3,y,x+w*.55,y+h*.25,x+w*.75,y+h*.05,x+w,y+h],'#2a3346');R(g,x,y+h,w,2,'#1d2333');};
 /* r3: a nuvem da lua com 3 lóbulos de alturas diferentes (base reta, topo redondo), não mais uma prancha */
 const lobos=(x,y0,w,hs)=>{const n=hs.length;for(let i=0;i<n;i++){const cx=x+w*(i+.5)/n,rx=w/n*.72,ry=hs[i];const pts=[];for(let k=0;k<=16;k++){const a=Math.PI+k/16*Math.PI;pts.push(cx+Math.cos(a)*rx,y0+Math.sin(a)*ry);}P2(pts,'#2a3346');}R(g,x,y0-3,w,3,'#2a3346');R(g,x,y0,w,2,'#1d2333');};
 lobos(66,75,150,[12,20,16]);nuv(238,110,116,11);nuv(122,142,90,9);
 cidadeAoLonge(g,168,215,21,.12);dith(g,0,190,PW,40,'#2a3346',.35);
 R(g,118,198,362,PH-198,'#262e3e');R(g,118,198,362,3,'#5e6a84');for(let x=122;x<PW;x+=8)R(g,x,205,4,5,'#1a2030');
 R(g,150,186,186,12,'#2e3648');R(g,150,186,186,2,'#5e6a84');R(g,150,196,186,2,'#1a2030');
 const S='#262e3e',B='#3a4458',L='#5e6a84',H2='#6a7690';
 /* asa de morcego dobrada nas costas: borda reta, 3 pontas pra cima, costelas */
 P2([206,156,228,96,244,118,258,90,272,116,290,98,306,152],S);P2([210,152,229,104,243,124,258,98,271,122,289,106,300,150],B);
 for(const [x0,y0] of [[229,104],[258,98],[289,106]])for(let k=0;k<34;k++)X(g,Math.round(x0+(254-x0)*k/34),Math.round(y0+(152-y0)*k/34),S);
 /* corpo agachado, anca e pernas de pedra */
 P2([168,186,176,150,200,138,262,144,302,152,318,186],S);P2([172,184,180,152,202,142,260,148,298,156,312,184],B);P2([180,152,202,142,240,145,238,150,202,148],L);
 P2([286,186,292,158,320,156,330,186],S);P2([290,184,295,160,318,160,326,184],B);
 for(const x of [174,196]){P2([x,186,x+2,164,x+14,164,x+12,186],S);P2([x+2,184,x+4,166,x+12,166,x+10,184],B);for(let k=0;k<3;k++)P2([x+1+k*4,186,x+4+k*4,186,x+2.5+k*4,192],H2);}
 /* cabeça virada pra cidade: chifres, sobrancelha pesada, boca aberta com presas */
 P2([128,140,146,124,174,126,186,140,180,160,156,166,134,160],S);P2([132,140,148,128,172,130,182,142,176,158,156,162,136,158],B);P2([136,138,148,129,170,131,160,136,140,141],L);
 P2([104,148,132,142,136,160,108,162],S);P2([108,149,130,145,132,158,110,159],B);P2([100,156,126,154,128,164,104,166],'#07070b');
 for(let k=0;k<4;k++){P2([106+k*5,155,110+k*5,155,108+k*5,160],'#c9d3e6');P2([108+k*5,166,112+k*5,166,110+k*5,161],'#9aa6bd');}
 P2([150,126,140,96,160,122],S);P2([150,124,143,102,157,121],L);P2([168,128,174,98,178,130],S);P2([169,127,174,104,176,128],L);
 P2([136,138,152,136,150,141,138,142],'#07070b');X(g,142,139,'#5a2a1a');
 for(const [x0,y0,x1,y1] of [[214,160,236,172],[250,150,268,170],[184,168,190,182],[296,166,306,178]])for(let k=0;k<12;k++)X(g,Math.round(lerp(x0,x1,k/12)),Math.round(lerp(y0,y1,k/12)),S);
 BGP.gargula=c;})();
/* o holofote grande, com a lente acesa ou apagada */
function nuvemPassa(t,al){const nx=((t*5)%1280)|0;PG.globalAlpha=al;PG.drawImage(CAMADAS.noite.nuvem,nx,0,Math.min(PW,1280-nx),150,0,10,Math.min(PW,1280-nx),150);if(1280-nx<PW)PG.drawImage(CAMADAS.noite.nuvem,0,0,PW-(1280-nx),150,1280-nx,10,PW-(1280-nx),150);PG.globalAlpha=1;}
function holofoteP(x,y,k,t,so){const a=Math.PI+.62,c=Math.cos(a),s2=Math.sin(a);const Q=(px,py)=>[x+px*c-py*s2,y+px*s2+py*c];if(so)return Q(30,0);
 pR(x-26,y+34,52,4,'#0b0e15');for(const lx of [-18,0,18])pCap(x,y+10,2.2,x+lx,y+36,2,'#2a3346');pCap(x-10,y+4,3,x+10,y+4,3,'#3a4560');
 const box=(x0,y0,x1,y1,col)=>pPoly([...Q(x0,y0),...Q(x1,y0),...Q(x1,y1),...Q(x0,y1)],col);
 box(-24,-18,22,16,'#1d2333');box(-24,-18,22,-15,'#5a6680');box(-24,13,22,16,'#0b0e15');for(let i=0;i<4;i++)box(-18+i*10,-15,-16+i*10,13,'#141826');
 box(22,-21,30,19,k>0?'#ffe27a':'#141826');if(k>0)box(24,-18,28,16,'#fff3c0');return Q(30,0);}
/* o sinal: disco de luz com borda quase lisa, o morcego nosso recortado em negativo e uma nuvem baixa que só atravessa.
   Morcego (r3): corpo em pé no centro com cabeça e 2 orelhas, asas retas abertas em 70% da largura do disco,
   a borda de baixo em 3 arcos de cada lado (arco, nunca dente). Unidade: metade da largura do disco = 34. */
const MORC_SINAL=(()=>{const R0=[];const arco=(a,b,bojo,n)=>{for(let k=1;k<=n;k++){const u=k/n;R0.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u)-bojo*Math.sin(Math.PI*u)]);}};
 R0.push([0,-6.5],[1.6,-6.5],[3.2,-12.5],[4.4,-6],[6.5,-5]);
 R0.push([12,-6.4],[18,-8.2],[22,-9.6],[24,-8.6]);       /* a borda de cima da asa, subindo até a ponta */
 const P1=[24,-8.6],P2=[18.5,-2.2],P3=[12.5,.2],P4=[6.4,2.6];
 arco(P1,P2,2.6,6);arco(P2,P3,2.2,6);arco(P3,P4,1.8,6);   /* 3 arcos rasos: a membrana entre os dedos */
 R0.push([4.6,6.5],[2.2,10],[0,11.5]);
 const o=[];for(const q of R0)o.push(q[0],q[1]);for(let i=R0.length-2;i>0;i--)o.push(-R0[i][0],R0[i][1]);return o;})();
function sinalArte(g,cx,cy,rx,ry,k,t,bat){if(k<=.02)return;rx*=k;ry*=k;const pts=[],core=[];
 /* borda: no máximo uns 3 px de ruído no aberto */
 for(let i=0;i<48;i++){const a=i/48*6.283;const m=1+.032*Math.sin(5*a+t*.6)+.018*Math.sin(9*a+1.3);pts.push(cx+Math.cos(a)*rx*m,cy+Math.sin(a)*ry*m);core.push(cx+Math.cos(a)*rx*m*.66,cy+Math.sin(a)*ry*m*.66);}
 const old=g.globalAlpha;g.globalAlpha=old*.85;pPoly(pts,'#ffe27a',g);g.globalAlpha=old;pPoly(core,'#fff3c0',g);
 if(bat&&k>.6){const s=rx/34;const b=[];for(let i=0;i<MORC_SINAL.length;i+=2)b.push(cx+MORC_SINAL[i]*s,cy+MORC_SINAL[i+1]*s*1.02-ry*.04);pPoly(b,'#2a2410',g);}
 /* a nuvem: passa baixa (abaixo das asas), atravessa em 6 s e some; cobre no máximo uns 25% e nunca a cabeça */
 const per=16,u=(t%per)/6;if(u<1){const w=rx*.9,h=ry*.2,nx=cx-rx*1.5+u*(rx*3),ny=cy+ry*.62;
  const al=g.globalAlpha;g.globalAlpha=al*.9;pPoly([nx-w,ny+h,nx-w*.7,ny+h*.1,nx-w*.25,ny-h*.4,nx+w*.15,ny-h*.1,nx+w*.55,ny-h*.45,nx+w,ny+h],'#1d2536',g);g.globalAlpha=al;}}
function sinalP0(cx,cy,k,t){if(k<=.05)return;const rx=62*k,ry=30*k;for(let y=-ry-6;y<=ry+6;y++)for(let x=-rx-6;x<=rx+6;x++){const e=(x/rx)**2+(y/ry)**2;if(e>1.25)continue;const xx=Math.round(cx+x),yy=Math.round(cy+y);if(e>1){if(bay(xx,yy)<.35)pX(xx,yy,'#b89a3a');}else if(e>.82||bay(xx+((t*3)|0),yy)<.06)pX(xx,yy,'#d8b84a');else pX(xx,yy,'#ffe27a');}
 if(k<.7)return;const s=k*1.6;const b=[-30,-6,-22,-12,-12,-10,-6,-6,-4,-12,-2,-7,2,-7,4,-12,6,-6,12,-10,22,-12,30,-6,26,2,20,-1,16,6,10,2,6,9,2,5,0,10,-2,5,-6,9,-10,2,-16,6,-20,-1,-26,2];
 const pts=[];for(let i=0;i<b.length;i+=2)pts.push(cx+b[i]*s*.95,cy+b[i+1]*s*.9+2);pPoly(pts,'#2a2410');}
function facho(x0,y0,x1,y1,k,w1){if(k<=0)return;const xe=lerp(x0,x1,k),ye=lerp(y0,y1,k);const dx=xe-x0,dy=ye-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;const w=w1*k;
 PG.globalCompositeOperation='screen';PG.globalAlpha=.22;pPoly([x0+nx*4,y0+ny*4,xe+nx*w,ye+ny*w,xe-nx*w,ye-ny*w,x0-nx*4,y0-ny*4],'#ffe27a');PG.globalAlpha=.16;pPoly([x0+nx*2,y0+ny*2,xe+nx*w*.5,ye+ny*w*.5,xe-nx*w*.5,ye-ny*w*.5,x0-nx*2,y0-ny*2],'#fff3c0');PG.globalAlpha=1;PG.globalCompositeOperation='source-over';}
/* as partículas da torre, redesenhadas no tamanho do palco */
function fxPalco(t,M,esc){for(const f of FX){if(!f.on)continue;const a=t-f.t0;if(a<0||a>f.vida)continue;const k=a/f.vida;let q=M(f.x,f.y);
 if(f.tipo==='carta'&&PALCO.cena==='revanche')continue;   /* r4: a carta que cai da mesa não aparece no close da revanche */
 if(IMP.on&&IMP.q&&f.t0===IMP.t&&(f.tipo==='estrela'||f.tipo==='faisca'))q={x:q.x+IMP.px-IMP.q.x,y:q.y+IMP.py-IMP.q.y};
 switch(f.tipo){
  case 'carta':{ /* r4: carta girada de verdade (quadrilátero), sem bloco preto; o leque guarda o ângulo de cada uma */
   const an=((f.ang||0)+(f.f?0:a*300))*RAD,c=Math.cos(an),s2=Math.sin(an);const Q=(w,h)=>{const o=[];for(const [x,y] of [[-w,-h],[w,-h],[w,h],[-w,h]])o.push(q.x+x*c-y*s2,q.y+x*s2+y*c);return o;};
   pPoly(Q(7.5,9.5),'#07070b');pPoly(Q(6,8),'#eef2f8');if(Math.abs(Math.cos(an))>.35){pDisco(q.x,q.y,3,'#a64dff');}break;}
  case 'meia':pR(q.x,q.y,5,5,'#eef2f8');break;
  case 'estrela':{const s=(k<.34?6:k<.67?9:4)*esc;const c=k<.5?'#eef2f8':'#f3e2b8';pCap(q.x-s,q.y,1.4,q.x+s,q.y,1.4,c);pCap(q.x,q.y-s,1.4,q.x,q.y+s,1.4,c);if(k<.5){pCap(q.x-s*.6,q.y-s*.6,1,q.x+s*.6,q.y+s*.6,1,'#a8926a');pCap(q.x-s*.6,q.y+s*.6,1,q.x+s*.6,q.y-s*.6,1,'#a8926a');}break;}
  case 'gas':{const r=(2+Math.min(1,k*2)*f.r)*esc;const d=(1-k)*.6;for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2){if(x*x+y*y>r*r)continue;const xx=Math.round(q.x+x),yy=Math.round(q.y+y-k*8);const b=bay(xx>>1,yy>>1);if(b<d)pR(xx,yy,2,2,(xx+yy)&2?'#36a046':'#5fe06a');else if(b<d*1.25)pR(xx,yy,2,2,'#6a2fb0');}break;}
  case 'fumaca':{const r=(2+k*f.r)*esc;const d=(1-k)*.65;for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2){if(x*x+y*y>r*r)continue;const xx=Math.round(q.x+x),yy=Math.round(q.y+y-k*12);if(bay(xx>>1,yy>>1)<d)pR(xx,yy,2,2,(xx^yy)&4?'#5a6680':'#3a4560');}break;}
  case 'ha':{if(k>.75&&((a*12)|0)%2)break;const img=f.f?HA2:HA1;PG.drawImage(img,Math.round(q.x+Math.sin(a*9)*3),Math.round(q.y-k*30),img.width*3,img.height*3);break;}
  case 'poeira':for(let j=0;j<6;j++)pDisco(q.x+(j-2.5)*(5+k*16),q.y-k*5-(j&1)*2,2.4-k,k<.5?'#5a6680':'#3a4560');break;
  case 'faisca':pR(q.x,q.y,3,3,k<.5?f.c:f.c2);break;
 }}}
/* o palco liga e desliga com corte e barra de cinema */
const PALCO={on:false,cena:'',t0:0,ate:0,prox:null,ult:{}};
function palcoPede(t,cena,dur,forca){if(!CAMERA)return false;if(PALCO.on&&PALCO.cena===cena){PALCO.ate=Math.max(PALCO.ate,t+dur);return true;}
 if(PALCO.on&&!forca&&/mesa|luta|revanche/.test(PALCO.cena))return false;
 PALCO.prox={cena,t0:t,ate:t+dur};CAM.wipe=t;return true;}
function palcoPasso(t){if(PALCO.prox&&!PALCO.prox.fecha&&t>=CAM.wipe+.067){const o=PALCO.prox;PALCO.prox=null;PALCO.on=true;PALCO.cena=o.cena;PALCO.t0=o.t0;PALCO.ate=o.ate;CAPA2.ok=false;host.classList.add('palco');host.classList.toggle('palco-luta',o.cena==='luta');PCV.hidden=false;}
 if(PALCO.on&&t>PALCO.ate&&!PALCO.prox){PALCO.prox={cena:'',fecha:1};CAM.wipe=t;}
 if(PALCO.prox&&PALCO.prox.fecha&&t>=CAM.wipe+.067){PALCO.prox=null;PALCO.on=false;PALCO.cena='';host.classList.remove('palco','palco-luta');PCV.hidden=true;const c=$('pcarta');c.hidden=true;palcoQuadro.k='';}}
function palcoQuadro(t,dt,p,e){const cena=PALCO.cena;const a=t-PALCO.t0;
 if(cena==='holofote'){PG.drawImage(BGP.telhado,0,0);nuvemPassa(t,.55);
  const k=clamp(a/1.4,0,1);const lx=330,ly=162;const L0=holofoteP(lx,ly,0,t,true);facho(L0[0],L0[1],128,62,k,46);if(k>.7)sinalArte(PG,128,62,46,40,clamp((k-.7)/.3,0,1)*(.96+.04*Math.sin(t*2.2)),t,true);holofoteP(lx,ly,k,t);
  const [pose,face]=poseComissario(t,p);pintaComissario(236,CHAO,face,a<.9?'idle0':pose,t);}
 else if(cena==='gargula'){PG.drawImage(BGP.gargula,0,0);
  const bp=BAT.pose&&QB[BAT.pose]?BAT.pose:'cafe0';pintaBatman(252,146,1,bp,t,dt,'enrola',bp.startsWith('cafe'));}
 else{PG.drawImage(BGP.terreo,0,0);
  /* o monitor do terminal: o Coringa pinta de roxo e verde */
  {let s2=(Math.floor(t*14)*977)>>>0;pR(352,138,72,46,'#2e1450');for(let r=0;r<11;r++){s2=(s2*1103515245+12345)>>>0;const x0=s2%60,l=6+(s2>>>8)%26;pR(354+x0,140+r*4,Math.min(l,68-x0),2,(s2>>>4)&1?'#5fe06a':'#a64dff');}
   if(ARCO.carta){pR(404,128,18,24,'#eef2f8');pR(404,128,18,2,'#9aa6bd');pDisco(413,140,4,'#a64dff');pX(408,132,'#5fe06a');pX(418,148,'#5fe06a');}}
  const dx=xMesa(ARCO.quem),fX=clamp(dx,104,300);let cxw,esc=4.2;
  if(cena==='mesa')cxw=dx-2;else if(cena==='luta')cxw=fX-7;else cxw=((ARCO.cS||fX)+(ARCO.bS||fX))/2;
  const ex=cena==='mesa'?esc:1.9,ey=cena==='mesa'?esc:3.3;const M=(x,y)=>({x:240+(x-cxw)*ex,y:CHAO-(222-y)*ey});
  if(cena==='mesa'){ /* a chegada: o Coringa desce de ponta-cabeça e prega a carta */
   const aa=ARCO.tl;const ent=ARCO.ent;
   if(CJ.vis){if(CJ.pose==='pendura'||CJ.pose==='prega'){const yf=CJ.corda?CJ.corda[3]:148;const topo=lerp(-30,52,clamp((yf-104)/44,0,1));const xx=372;pR(xx,24,1,topo-24+4,'#5a6680');pintaCoringa(xx,CHAO,-1,CJ.pose,t,{topo});}
    else{const q=M(CJ.x,CJ.y);pintaCoringa(clamp(q.x,40,470),Math.min(CHAO,q.y),CJ.f,CJ.pose,t);}}
   if(BAT.vis&&aa>=4.3){const kk=clamp((aa-4.3)/2,0,1);const bx=lerp(-30,150,kk),by=aa<6.3?lerp(40,CHAO,kk*kk):CHAO;pintaBatman(bx,by,1,aa<6.3?'plana0':aa<6.7?'pousa':BAT.pose,t,dt,aa<6.3?'asa':'normal');}}
  else{ /* a luta e a revanche: as mesmas poses da torre, no tamanho do palco */
   const cq=CJ.vis&&CJ.y>150?M(CJ.x,CJ.y):null,bq=BAT.vis&&BAT.y>150?M(BAT.x,BAT.y):null;const cpose=reagiu('coringa',t,1.6)?'mostra':CJ.pose;
   /* r3: no impacto, o golpe encosta de verdade. O punho (ou o cotovelo) do Batman é o ponto de contato: a cabeça do
      Coringa vem até ele no quadro do impacto e volta suave; a estrela e as faíscas saem dali. */
   IMP.on=false;const ia=t-IMP.t;
   if(cq&&bq&&ia>=0&&ia<.5){const Jb=ossos(DB,QB[BAT.pose]||QB.guarda0,bq.x,Math.min(CHAO,bq.y),BAT.f);const ct=/^cot/.test(BAT.pose)?Jb.eF:Jb.wF;
    if(IMP.gap==null){const Jc=ossos(DJ,QJ[cpose]||QJ.ri0,cq.x,Math.min(CHAO,cq.y),CJ.f);let gap=(ct.x+BAT.f*9)-Jc.hd.x;
     const sep=(Jc.hip.x+gap-Jb.hip.x)*BAT.f;if(sep<30)gap+=(30-sep)*BAT.f;   /* corpo não entra no corpo: os quadris ficam a 30 px */
     IMP.gap=gap;const hx=Jc.hd.x+gap;IMP.px=Math.abs(hx-ct.x)>10?(hx+ct.x)/2:ct.x+BAT.f*4;IMP.py=Math.abs(hx-ct.x)>10?(Jc.hd.y+ct.y)/2:ct.y;IMP.q=M(IMP.wx,IMP.wy);}
    cq.x+=IMP.gap*(1-suave(.12,.5,ia));IMP.on=true;}
   if(cq&&cq.x>-60&&cq.x<PW+60)pintaCoringa(cq.x,Math.min(CHAO,cq.y),CJ.f,cpose,t);
   if(bq){pintaBatman(bq.x,Math.min(CHAO,bq.y),BAT.f,BAT.pose,t,dt,BAT.capa==='enrola'?'enrola':BAT.capa==='asa'?'asa':BAT.capa==='voa'?'voa':'normal');}
   else CAPA2.ok=false;}
  fxPalco(t,M,1.6);}
 /* a carta grande, legível do sofá */
 {const ok=cena==='revanche'&&ARCO.tf>=0&&ARCO.tl4>1.6;const on=ok||((cena==='mesa'||cena==='luta')&&ARCO.on&&ARCO.carta);const k=on?(ok?'ok|':'')+ARCO.quem+'|'+ARCO.linha:'';
  if(k!==palcoQuadro.k){palcoQuadro.k=k;const c=$('pcarta');c.hidden=!on;c.classList.toggle('ok',ok);if(on){c.querySelector('b').textContent=ok?'RESOLVIDO':'HA HA';$('pcartat').textContent=ok?nomeMesa(ARCO.quem)+' voltou a andar':curtoErro(ARCO.linha);$('pcartaq').textContent=ok?'':nomeMesa(ARCO.quem);}}}}

/* ===== o sinal no céu e o facho (desenhados uma vez; o laço só recorta) ===== */
const SINAL_C=(()=>{const [c,g]=mk(34,18);const cx=17,cy=9,rx=16,ry=7.5;for(let y=0;y<18;y++)for(let x=0;x<34;x++){const e=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(e>1.18)continue;if(e>1){if(bay(x,y)<.4)X(g,x,y,P.y2);}else X(g,x,y,e>.78?P.y2:P.y3);}
 const MB=["#.............#","##....#.#....##","###...###...###","###############",".#############.","..####.#.####..","...##.....##..."];
 MB.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(row[x]==='#')X(g,10+x,6+y,'#2a2410');});return c;})();
const FACHO_X0=HOLO.x+3,FACHO_Y0=HOLO.y+2;
const FACHO_C=(()=>{const w=SIN.x-FACHO_X0,[c,g]=mk(w+1,24);const yA=SIN.y-7-(FACHO_Y0-12),yB=SIN.y+7-(FACHO_Y0-12);
 for(let x=0;x<=w;x++){const k=x/w;const y0=lerp(12,yA,k),y1=lerp(12,yB,k);for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){if(y<0||y>=24)continue;const borda=Math.min(y-y0,y1-y)<1;if(bay(x,y)<(borda?.25:.12+k*.16))X(g,x,y,borda?P.y2:P.y3);}}return c;})();
/* cartaz de PROCURADO: o rosto do palhaço em pixel */
(function(){const g=$('procc').getContext('2d');g.imageSmoothingEnabled=false;R(g,0,0,18,14,'#c8bfa8');R(g,6,3,6,7,CR.sk);R(g,5,1,8,3,CR.hr);X(g,5,4,CR.hr);X(g,12,4,CR.hr);X(g,7,5,P.ink);X(g,10,5,P.ink);R(g,7,8,4,1,CR.bo);X(g,11,7,CR.bo);R(g,4,10,10,4,CR.c);R(g,8,10,2,3,CR.vt);})();

/* ===== quadro ===== */
let GLITCH=-99,MT0=50,RELO_OURO=-99,FOCO_ULT=null,PROX_ENT=4,AVISO_ATE=0;
const RAIO={t0:-99,prox:6,pts:new Float32Array(18)};const FESTA={i:-1,t:-99};const ETAPA_T=[-99,-99,-99,-99,-99];
const LEVE_Q=TQ('leve')==='1'||(raiz.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
let LEVE=LEVE_Q,MEIO=true;   /* r5: cravada em 30 quadros (pedido do Gustavo, 11/11: "se tiver 30 fps tá suave") */
const T0=performance.now()/1000-(Q.get('t')!=null?+Q.get('t'):(ENSAIO?0:37));
function pathPos(w,t){const tt=((t+w.ph)%w.T+w.T)%w.T;let sg=w.seg[w.seg.length-1];for(const s of w.seg){if(tt<s.t0+s.d){sg=s;break;}}
 const k=(tt-sg.t0)/sg.d,s=sg.s;
 if(s[0]==='w')return {x:lerp(s[1],s[2],k),m:'w',dir:s[2]>s[1]?1:-1,fr:Math.floor(tt*7)%4};
 const prev=w.seg[(w.seg.indexOf(sg)+w.seg.length-1)%w.seg.length].s;return {x:s[1],m:'i',dir:prev[2]>prev[1]?1:-1};}
function camadaMix(nome,x,y,w){const fs=ORDEM.filter(f=>w[f]>.004).sort((a,b)=>w[b]-w[a]);G.globalAlpha=1;G.drawImage(CAMADAS[fs[0]][nome],x,y);if(fs[1]){G.globalAlpha=w[fs[1]];G.drawImage(CAMADAS[fs[1]][nome],x,y);}G.globalAlpha=1;}
const [fxC,fxg]=mk(WW,WH);let talkW=0,falaT0=0,falaTxt='',salaAtual=null,falaId=null;
function pintaFacho(w,h){const [c,g]=mk(w,h);for(let y=0;y<h;y++){const k=y/h;const half=Math.round(lerp(5,w/2,k));const cx=w/2;
  g.fillStyle='rgba(120,220,255,'+(.14+k*.1).toFixed(3)+')';g.fillRect(Math.round(cx-half),y,half*2,1);
  g.fillStyle='rgba(170,235,255,'+(.12+k*.1).toFixed(3)+')';g.fillRect(Math.round(cx-half*.66),y,Math.round(half*1.32),1);}
 g.fillStyle='rgba(210,245,255,.45)';g.fillRect(4,h-2,w-8,2);return c;}
const FACHOS={};
function vapor(x,y,t,ph,alto){for(let i=0;i<4;i++){const k=((t*.25+ph+i*.25)%1);const yy=Math.round(y-k*alto),xx=Math.round(x+Math.sin(t*1.3+i*2+ph)*2+k*3);const r=1+Math.round(k*2);if(k>.92)continue;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(a*a+b*b>r*r)continue;if(bay(xx+a,yy+b)<(1-k)*.5)X(G,xx+a,yy+b,k<.4?P.n6:P.n5);}}}
function caneca(x,y,t){R(G,x,y,2,2,P.a2);const k=(t*.8)%1;X(G,x+Math.round(Math.sin(t*3)),y-1-Math.round(k*3),k<.5?P.n6:P.n4);}
function cadeira(x,fr,L){const c2=L.m2,c3=L.m3;const bx=[x,x+5,x+10,x+5][fr];R(G,bx,202,2,14,c2);X(G,bx,202,c3);R(G,x,214,12,2,c2);R(G,x,214,12,1,c3);R(G,x+5,216,2,4,L.m1);R(G,x,220,12,1,L.m1);}
let ligadoEm=0,erros=0,ativo=false,lentoF=false,raf=0,nQ=0,fpsV=0,fpsT=0,last=0,segT=0,segN=0,rafN=0,segMax=0,lento8=0,baixo24=0,bom=0;const segS=[];
const ST=new Float32Array(600),IV=new Float32Array(600);let stN=0;let ultRaf=0;
function frame(now){raf=0;if(!ativo)return;raf=requestAnimationFrame(frame);const iv=ultRaf?now-ultRaf:16.7;ultRaf=now;rafN++;
 if(window.__manual)return;
 /* 60 por padrão; 30 cravados se o script passar de 8 ms; modo leve (fundo parado) se a tela não der 24 */
 if(now-last<(lentoF?100:(MEIO||LEVE)?30:4))return;
 const dt=last?Math.min(.1,(now-last)/1000):1/60;last=now;
 const a=performance.now();
 try{quadro(now/1000-T0,dt);}catch(e){erros++;if(erros<4&&raiz.console)console.error('andar',e);}
 const st=performance.now()-a;ST[stN%600]=st;IV[stN%600]=iv;stN++;if(st>segMax)segMax=st;segS.push(st);
 nQ++;segN++;if(!fpsT){fpsT=now;segT=now;}
 if(now-segT>=1000){const fr=rafN*1000/(now-segT);segS.sort((x,y)=>x-y);const p95=segS[Math.floor(segS.length*.95)]||0;rafN=0;segN=0;segT=now;segS.length=0;segMax=0;
  if(!lentoF&&!LEVE_Q&&now-ligadoEm>6000){
   lento8=p95>8?lento8+1:0;baixo24=fr<24?baixo24+1:0;bom=(p95<6&&fr>=24)?bom+1:0;
   if(!MEIO&&lento8>=3)MEIO=true;
   if(!LEVE&&baixo24>=3)LEVE=true;
   if(LEVE&&bom>=20){LEVE=false;bom=0;}}}
 if(now-fpsT>=5000){fpsV=Math.round(nQ*1000/(now-fpsT));nQ=0;fpsT=now;}}
function medida(){const n=Math.min(stN,600);if(!n)return null;const s=Array.from(ST.slice(0,n)).sort((a,b)=>a-b),v=Array.from(IV.slice(0,n));const p95=s[Math.floor(n*.95)];
 return {quadros:n,script_p95_ms:+p95.toFixed(2),script_medio_ms:+(s.reduce((a,b)=>a+b,0)/n).toFixed(2),acima_20ms:v.filter(x=>x>20).length,modo:LEVE?'leve':MEIO?'30':'60',fps:fpsV};}
function quadro(t,dt){TEMPO=t;
 const d=agora(),h=d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600,w=pesos(h);relogio(d,w,t);
 const noite=w.noite,diaP=w.dia,tb=LEVE?0:t;
 if(SIM==='falando'||(voz.sint&&voz.estado==='falando')){voz.estado='falando';voz.nivel=clamp(.48+.3*Math.sin(t*6.1)*Math.sin(t*1.7+.6)+.16*Math.sin(t*10.7),0,1);}
 else if(SIM){voz.estado=SIM;voz.nivel=SIM==='ouvindo'?.2:0;}
 const e=voz.estado;nivS=lerp(nivS,voz.nivel,1-Math.pow(.02,dt));HIST.push(e==='falando'?nivS:0);HIST.shift();
 /* estado do momento: erros, entregas, etapas, sinal, Coringa, Batman, câmera */
 const et=errosTeste(t);if(et!=null){ERROS=et;if(mudou('errosT',et.map(x=>x.quem)))hudDados();}else ERROS=ERROS_D;
 if(ENSAIO==='entrega'&&t>=PROX_ENT){const dd=DESKS.find(x=>x.who);ENTREGAS.push({quem:dd?dd.who:'',nome:'ensaio'});PROX_ENT+=7;}
 while(ENTREGAS.length){const en=ENTREGAS.shift();const dd=dia();dd.entregas++;guarda('dia',DIA);SINAL.festa=t;FESTA.i=mesaDe(en.quem);FESTA.t=t;if(dd.entregas===10)RELO_OURO=t;if(FESTA.i>=0)hudDados();}
 while(ETAPAS.length){const ep=ETAPAS.shift();const i=mesaDe(ep.quem);if(i>=0){ETAPA_T[i]=t;fx('sobe',DESKS[i].x+2,200,t,1.2,{vy:156});}}
 if(D.foco&&D.foco.alvo&&D.foco.id!=null&&D.foco.id!==FOCO_ULT&&(+D.foco.ate||0)>agoraMs()){FOCO_ULT=D.foco.id;const nm=String(D.foco.alvo).replace(/^mesa:/,'');const i=DESKS.findIndex(x=>x.who===nm||semAc(x.who)===semAc(nm));
  if(i>=0){CAM.evento(t,'foco',{x:DESKS[i].x,y:222});$('aviso').textContent='Chefe olhando: '+nomeMesa(DESKS[i].who);$('aviso').hidden=false;AVISO_ATE=t+2;}}
 const p=passoSinal(t);passoArco(t,dt);passoBatman(t);CAM.passo(t);
 const cl=clima();
 /* com o palco aberto, a torre só anda (não pinta): o quadro inteiro é do close */
 if(PALCO.on&&!PALCO.prox&&t-CAM.wipe>.14){passoOraculo(dt,e);fxAvanca(t,dt);G.setTransform(1,0,0,1,0,0);palcoQuadro(t,dt,p,e);hud(t,e);aplicaCamera(t);return;}
 /* a cidade: céu, lua, nuvens, raio, dirigível, prédios em paralaxe, carros, trem, ponte, névoa, chuva */
 G.setTransform(1,0,0,1,0,0);
 camadaMix('ceu',0,0,w);
 {const nasce=5.75,poe=18.6;if(h>nasce-.4&&h<poe+.4){const q=(h-nasce)/(poe-nasce);const x=Math.round(620-q*600),y=Math.round(40+110*(1-Math.pow(Math.max(0,Math.sin(clamp(q,0,1)*Math.PI)),.25)));
   const spr=q<.25?SOL.amanhecer:q>.75?SOL.entardecer:SOL.dia;G.globalAlpha=clamp(1-noite*1.4,0,1)*.7;G.drawImage(spr,x-spr.width/2,y-spr.height/2);G.globalAlpha=1;}
  if(noite>.05){G.globalAlpha=noite;G.drawImage(LUA,50-40,104-40);G.globalAlpha=1;}   /* a lua fica atrás da gárgula: o Batman vira silhueta nela */}
 {const cx0=-((tb/2.6)%1280);camadaMix('nuvem',Math.round(cx0),0,w);camadaMix('nuvem',Math.round(cx0)+1280,0,w);}
 if(cl.raio&&t>RAIO.prox){RAIO.t0=t;RAIO.prox=t+15+((hash(String(t|0))%1000)/1000)*25;let x=80+(hash('r'+(t|0))%480);for(let i=0;i<9;i++){RAIO.pts[i*2]=x;RAIO.pts[i*2+1]=8+i*16;x+=((hash('q'+i+(t|0))%11)-5);}}
 const ra=t-RAIO.t0,flash=(ra>=0&&ra<.12)||(ra>=.2&&ra<.28);
 if(flash){G.globalAlpha=.28;R(G,0,0,CW,300,'#c9d3e6');G.globalAlpha=1;for(let i=0;i<8;i++){const x0=RAIO.pts[i*2],y0=RAIO.pts[i*2+1],x1=RAIO.pts[i*2+2],y1=RAIO.pts[i*2+3];for(let s2=0;s2<=16;s2++)X(G,Math.round(lerp(x0,x1,s2/16)),Math.round(lerp(y0,y1,s2/16)),P.n8);}}
 {const k=((tb+60)%400)/400;const bx=Math.round(700-k*800);G.drawImage(blC,bx,58);if(noite>.3){const sc=Math.floor(tb*1.2);for(let i=0;i<11;i++){const on=((i+sc)%11)<6;R(G,bx+11+i*2,62,1,4,on?P.a2:P.a1);}}}
 const sway=Math.sin(tb*2*Math.PI/150);
 camadaMix('longe',Math.round(-60+sway*2),0,w);
 for(const c of CARS){if(c.l>0)continue;if(!LEVE)c.x=((c.x+c.v*dt)%760+760)%760;R(G,c.x-60,c.y,c.s+1,1,P.n4);X(G,c.x-60+(c.v>0?c.s:0),c.y,P.a2);}
 camadaMix('meio',Math.round(-80+sway*5),0,w);
 for(const c of CARS){if(c.l===0||c.l===3)continue;if(!LEVE)c.x=((c.x+c.v*dt)%760+760)%760;const x=c.x-60;R(G,x,c.y,c.s+2,2,P.n4);R(G,x+1,c.y-1,c.s,1,P.n5);X(G,c.v>0?x:x+c.s+1,c.y+1,P.r2);X(G,c.v>0?x+c.s+1:x,c.y,P.a3);}
 {const per=60,k=(tb%per)/per;const tx=Math.round(-140+k*920+sway*5);for(let i=0;i<5;i++){const x=tx+i*22;R(G,x,255,20,7,P.n4);R(G,x,255,20,1,P.n5);for(let wx=x+2;wx<x+18;wx+=4)R(G,wx,257,2,2,noite>.4?P.a2:'#6a7484');R(G,x,261,20,1,P.n2);}}
 camadaMix('perto',Math.round(-80+sway*10),0,w);
 for(const c of CARS){if(c.l!==3)continue;if(!LEVE)c.x=((c.x+c.v*dt)%760+760)%760;const x=c.x-60;R(G,x,c.y,8,3,P.n4);R(G,x+2,c.y-1,4,1,P.n5);X(G,c.v>0?x:x+7,c.y+1,P.r2);X(G,c.v>0?x+7:x,c.y+1,P.a3);if(noite>.4){G.globalAlpha=.35;R(G,c.v>0?x+8:x-6,c.y+1,6,1,P.a2);G.globalAlpha=1;}}
 {const ox=-((tb*3)%960);G.globalAlpha=.5;G.drawImage(nvC,Math.round(ox),178);G.drawImage(nvC,Math.round(ox)+960,178);G.globalAlpha=.35;G.drawImage(nvC,Math.round(ox*1.6)%960,236);G.drawImage(nvC,Math.round(ox*1.6)%960+960,236);G.globalAlpha=1;}
 if(cl.chuva){const ys=(tb*170)%CH,xs=-((tb*40)%CW);G.globalAlpha=.55;G.drawImage(CHUVA[0],Math.round(xs),Math.round(ys)-CH);G.drawImage(CHUVA[0],Math.round(xs),Math.round(ys));G.drawImage(CHUVA[0],Math.round(xs)+CW,Math.round(ys)-CH);G.drawImage(CHUVA[0],Math.round(xs)+CW,Math.round(ys));
  if(cl.forte){const y2=(tb*230)%CH,x2=Math.round(xs*1.3)%CW;G.drawImage(CHUVA[1],x2,Math.round(y2)-CH);G.drawImage(CHUVA[1],x2,Math.round(y2));G.drawImage(CHUVA[1],x2+CW,Math.round(y2)-CH);G.drawImage(CHUVA[1],x2+CW,Math.round(y2));}G.globalAlpha=1;}
 /* daqui pra frente, a torre (coordenadas de sempre) */
 G.setTransform(1,0,0,1,OX,OY);
 if(!LEVE){vapor(108,214,tb,0,22);vapor(268,214,tb,.5,22);}
 /* brilho de cada mesa no vidro de trás */
 DESKS.forEach((dk,i)=>{if(!dk.who)return;let k=estadoMesa(dk)||'c';if(t-FESTA.t<2.5&&FESTA.i===i)k='d';G.drawImage(BRILHO[k],dk.x-18,180);});
 /* interior: pintura da noite, a do dia por cima com o peso da luz */
 const luzDia=clamp(diaP+w.amanhecer*.75+w.entardecer*.55,0,1)*.4;   /* Gotham de dia continua escura por dentro */
 G.drawImage(INT.noite,0,0);if(luzDia>.004){G.globalAlpha=luzDia;G.drawImage(INT.dia,0,0);G.globalAlpha=1;}
 if(D.bus){const k=num(D.bus.pct)?clamp(D.bus.pct/100,0,1):0,bx=212,by=AND.empresa.chao-26;for(let i=0;i<Math.round(12*k);i++)R(G,bx+5+i*2,by+11,1,3,P.c2);}
 /* janelas douradas: uma por entrega do dia, acumulando até meia-noite */
 {const n=Math.min(24,dia().entregas);for(let i=0;i<n;i++){const A=ANDARES[i%3];const bay0=(i*5)%8;const x=44+bay0*49+8+((i*13)%30),y=A.topo+12+((i>>1)%2)*4;R(G,x,y,3,2,P.d3);X(G,x+1,y-1,P.d3);}}
 /* telas dos monitores: ciano anda, amarelo espera, o Coringa pinta de roxo e verde, a entrega acende dourado */
 DESKS.forEach((dk,i)=>{const sx=dk.x-6,sy=194,sw=19,sh=12;if(!dk.who){R(G,sx,sy,sw,sh,P.n1);X(G,sx+sw-3,sy+sh-3,P.n3);return;}
  const k=estadoMesa(dk)||'c';const tn=TONE[k];
  if(k==='v'){R(G,sx,sy,sw,sh,P.v1);let s=(Math.floor(t*14)*977+i*131)>>>0;for(let r=0;r<6;r++){s=(s*1103515245+12345)>>>0;const x0=s%sw,l=2+(s>>>8)%9;R(G,sx+x0,sy+r*2,Math.min(l,sw-x0),1,(s>>>4)&1?P.g3:P.v3);}}
  else{R(G,sx,sy,sw,sh,tn[0]);const sp=.9+i*.13;const ln=Math.floor(t/sp);const fr=(t/sp)%1;
   for(let k2=0;k2<5;k2++){const n=ln+k2;let s=(n*31+i*977)>>>0;s=(s*1103515245+12345)>>>0;const ind=s%4,len=3+((s>>>5)%11);const yy=sy+1+k2*2;const L=k2===4?Math.round(len*fr):len;R(G,sx+1+ind,yy,Math.min(L,sw-2-ind),1,((s>>>9)%10)<3?tn[2]:tn[1]);if(k2===4)X(G,Math.min(sx+sw-2,sx+1+ind+L),yy,P.n8);}
   if(t-FESTA.t<2.5&&FESTA.i===i){G.globalAlpha=.7*(1-(t-FESTA.t)/2.5);R(G,sx,sy,sw,sh,P.d3);G.globalAlpha=1;}
   if(t-ETAPA_T[i]<1.2){G.globalAlpha=.6*(1-(t-ETAPA_T[i])/1.2);R(G,sx,sy,sw,sh,P.a3);G.globalAlpha=1;}}
  const tr=trabalhosDe(dk.who)[0];R(G,sx,sy+sh-1,sw,1,P.n1);if(tr&&num(tr.pct))R(G,sx,sy+sh-1,Math.max(1,Math.round(sw*clamp(tr.pct,0,100)/100)),1,tn[2]);X(G,sx,sy,P.n8);
  if(cartaPregada(dk.who)){R(G,sx+sw-4,sy-3,4,5,P.n8);X(G,sx+sw-3,sy-2,P.v3);X(G,sx+sw-2,sy-1,P.g3);}
  if(dia().curativos.includes(dk.who)&&!ERROS.some(x=>x.quem===dk.who)){R(G,dk.x+12,207,6,2,'#d8c0a0');X(G,dk.x+14,207,'#a08060');X(G,dk.x+15,208,'#a08060');}});
 /* quem dorme, a rede, os z */
 G.drawImage(slC,0,0);
 {const M=AND.mezanino.chao,sw=Math.round(Math.sin(t*.7)*1.2);
  for(let x=390;x<430;x++){const y=Math.round(M-20+Math.sin((x-390)/40*Math.PI)*9)+(x>394&&x<426?sw:0);X(G,x,y,P.n4);X(G,x,y+1,P.n5);}
  G.drawImage(REDE,397,M-17+sw);}
 ZS.forEach((z,i)=>{if(i%2&&!z[3])return;const per=8,k=((t+z[2])%per)/per;if(k>.5)return;const yy=z[1]-Math.floor(k*12),xx=z[0]+Math.round(Math.sin(k*6+i)*1.5+k*4);
   const col=k<.3?'n7':k<.46?'n6':'n5';G.drawImage(ZC[(k>.25?1:0)+col],xx,yy-4);});
 /* cadeiras (vivas: a do Coringa gira quando ele foge) */
 const Lc=luzDia>.5?LDIA:LN;
 DESKS.forEach((dk,i)=>{const gira=CADEIRA.i===i&&t-CADEIRA.t0<3;cadeira(dk.x-24,gira?((t*10|0)%4):0,Lc);});
 const arcoMesa=ARCO.on?mesaDe(ARCO.quem):-1,a3=ARCO.on&&ARCO.tf<0&&ARCO.tl>=T_ATO3;
 if(a3&&arcoMesa>=0){const ax=a3x(DESKS[arcoMesa].x);cadeira(ax-24,0,Lc);const x=ax+16;R(G,x+19,190,3,26,Lc.m2);X(G,x+19,190,Lc.m3);R(G,x,204,22,3,Lc.m2);R(G,x,204,22,1,Lc.m3);R(G,x+10,207,3,12,Lc.m1);R(G,x,219,22,2,Lc.m1);}   /* a cadeira do Batman amarrado, do tamanho dele */
 /* trabalhando, andando, esperando */
 const talk0=e==='falando';const talk=talk0||(!SIM&&!!salaAtual&&t<ROLO.lidoEm);FALA_ON=talk;
 WORK.forEach((wk,i)=>{const dd=wk.d;if(!dd.who)return;if(i===arcoMesa)return;const typ=Math.sin(t*.37+wk.seed*3)>-.6;const f=typ&&(Math.floor(t*7+wk.seed*5)%2===0);
   const olha=(HOV.tipo==='mesa'&&HOV.i===i)||(REACT.mesaI===i&&t-REACT.mesa<1.2);
   const look=talk&&JV.andar==='terreo'&&JV.x<dd.x-20;G.drawImage(olha?wk.U:look?wk.L:(f?wk.B:wk.A),dd.x-25-(look?-1:0),199);});
 WALK.forEach(wk=>{const q=pathPos(wk,t);const s=q.m==='w'?(q.dir>0?wk.set.r:wk.set.l)[q.fr]:(q.dir>0?wk.set.sr:wk.set.sl);blit(s,q.x,wk.y);});
 /* capangas: um por erro a mais ao mesmo tempo, até 3 */
 ERROS.forEach(er=>{if(ARCO.on&&ARCO.quem===er.quem)return;const i=mesaDe(er.quem);if(i<0)return;if(ERROS.indexOf(er)>3)return;const s=FK[((t*1.25)|0)%2];G.drawImage(s.e,DESKS[i].x+16-32,222-54,64,56);});
 /* elevador e a Oráculo */
 passoOraculo(dt,talk&&e==='dormindo'?'falando':e);
 const cy=Math.round(JV.carro),ch=26;
 {const x=POCO.x0+1;R(G,x,cy-ch,18,ch,P.ink);R(G,x+1,cy-ch+1,16,ch-2,noite>.5?'#14161f':'#3a4252');dith(G,x+1,cy-ch+1,16,6,noite>.5?P.a1:'#6a7282',.35);R(G,x+5,cy-ch+1,8,1,noite>.5?P.a2:P.n8);}
 const jx=Math.round(JV.x)-14,jy=Math.round(JV.y)-27;G.drawImage(sprOraculo(t,e),jx,jy);
 {const x=POCO.x0+1;R(G,x,cy-ch,18,1,P.n5);R(G,x,cy-1,18,1,P.n5);R(G,x,cy-ch,1,ch,P.n5);R(G,x+17,cy-ch,1,ch,P.n5);if(JV.ocupado==='subindo')for(let k=x+3;k<x+17;k+=4)R(G,k,cy-ch+1,1,ch-2,P.n4);}
 if(e==='ouvindo')G.drawImage(QM,jx+11,jy-9+Math.round(Math.sin(t*2)));
 if(e==='pensando')G.drawImage(AMPULHETA[Math.floor(t*2)%20],jx+9,jy-12);
 if(reagiu('oraculo',t,2))fx('anel',JV.x,JV.y-12,t,.6,{r:9,c:P.c3,c2:P.c2});
 /* tom da hora */
 if(diaP>.02){G.globalCompositeOperation='soft-light';G.globalAlpha=diaP*.18;R(G,44,54,392,168,'#9aa6bd');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 if(w.amanhecer>.02){G.globalCompositeOperation='soft-light';G.globalAlpha=w.amanhecer*.35;R(G,0,24,WW,202,'#c8a088');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 if(w.entardecer>.02){G.globalCompositeOperation='soft-light';G.globalAlpha=w.entardecer*.35;R(G,0,24,WW,202,'#b8604a');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 /* telhado vivo: relógio, antena, respiros, holofote, sinal, comissário, morcegos */
 {const cx=RELO.x,cy=RELO.y;const u=usoCl().p;const ouro=t-RELO_OURO<2;
  if(ouro){for(let a=0;a<24;a++){const an=a/24*6.283;X(G,Math.round(cx+Math.cos(an)*6.6),Math.round(cy+Math.sin(an)*6.6),P.d3);}}
  if(u!=null){const an=clamp(u,0,100)/100*6.283-1.571;const tq=reagiu('relogio',t,.4)?Math.sin(t*60)*.15:0;for(let s=1;s<=5;s++)X(G,Math.round(cx+Math.cos(an+tq)*s),Math.round(cy+Math.sin(an+tq)*s),u>=95?P.r3:u>=80?P.n8:P.a3);}
  const mh=d.getUTCMinutes()/60*6.283-1.571;for(let s=1;s<=3;s++)X(G,Math.round(cx+Math.cos(mh)*s),Math.round(cy+Math.sin(mh)*s),P.n6);X(G,cx,cy,P.a3);
  if(u!=null&&u>=80){G.globalAlpha=.35+.35*Math.sin(t*1.5);R(G,cx-1,23,3,2,P.n8);G.globalAlpha=1;}
  if(e!=='dormindo'){for(let i=0;i<24;i++){const an=i/24*6.283;if(((i+(t*8|0))%3))X(G,Math.round(cx+Math.cos(an)*7.6),Math.round(cy+Math.sin(an)*7.6),P.c3);}}
  if(e==='falando'){for(let k=0;k<2;k++){const ph=((t*.7+k*.5)%1);const rr=9+ph*12;if(ph>.9)continue;for(let a=0;a<40;a++){const x=Math.round(cx+Math.cos(a/40*6.283)*rr),y=Math.round(cy+Math.sin(a/40*6.283)*rr*.6);if(y>=48||y<23)continue;if(bay(x,y)<(1-ph)*.7)X(G,x,y,P.c3);}}}
  if(e==='pensando'){for(let k=0;k<3;k++){const an=t*2.2+k*2.094;X(G,Math.round(cx+Math.cos(an)*10),Math.round(cy+Math.sin(an)*4),P.a3);}}
  if(e==='ouvindo'){for(let x=-6;x<=6;x++)X(G,cx+x,cy+9,x%2?P.c2:P.c3);}
  if(t-BADALADA<2)fx('anel',cx,cy,t,2,{r:22,c:P.a3,c2:P.a2}),BADALADA=-99;}
 if(((t/1.5)|0)%2)X(G,352,27,P.n6);
 if(!LEVE){vapor(150,36,t,.2,14);vapor(158,36,t,.7,12);}
 {const k=SINAL.k;const tranco=t-SINAL.tranco<.3?Math.round(Math.sin(t*80)):0;
  R(G,HOLO.x+1,HOLO.y+1,4,1,k>0?P.y3:P.n2);R(G,HOLO.x+4,HOLO.y+1,1,3,k>0?P.y2:P.n2);
  if(k>0){const nada=t-SINAL.nada<1.6&&p===0;const dx2=SIN.x,dy2=SIN.y;const lx=HOLO.x+3,ly=HOLO.y;G.globalCompositeOperation='screen';G.globalAlpha=.3*k;
   pPoly([lx,ly-1,lx+1,ly+2,lerp(lx,dx2-26,k),lerp(ly,dy2+34,k),lerp(lx,dx2-42,k),lerp(ly,dy2+22,k)],'#ffe27a',G);G.globalAlpha=1;G.globalCompositeOperation='source-over';
   if(k>.6)sinalArte(G,dx2,dy2+tranco,52,29,clamp((k-.6)/.4,0,1),t,!nada);}}
 {const [pose,face,gx]=poseComissario(t,p);const pf=FG[pose]||FG.idle0;if(pf.big)G.drawImage(face>=0?pf.d:pf.e,gx-14,GORD.y-27,36,36);else G.drawImage(face>=0?pf.d:pf.e,gx-16,GORD.y-27);
  if(pose==='idle0'||pose==='idle1'||pose.startsWith('ceu'))caneca(gx+4,GORD.y-9+(pose.endsWith('1')?1:0),t);
  if(pose.startsWith('cochila')){R(G,gx-24,41,3,3,P.a2);X(G,gx-24,41,P.a3);const zk=((t*.5)%1);if(zk<.7)G.drawImage(ZC['1n7'],gx+12+Math.round(zk*4),18-Math.round(zk*2));}}
 if(!LEVE){for(let i=0;i<2;i++){const an=t*.9+i*3.14;morcego(RELO.x+Math.cos(an)*15,27+Math.sin(an)*3,((t*8)|0)%2,P.n5);}}
 {const mt=t-MT0;if(mt>9){MT0=t+60+(hash('m'+(t|0))%60);}else if(mt>=0&&!LEVE){const k=mt/9;MORC.forEach((m,i)=>{const lado=i%2?1:-1;morcego(RELO.x+lado*(k*300*m.v)+m.ox-12,26+Math.sin(t*3+m.a)*2-k*2+m.oy*k*.4,((t*9+m.a)|0)%2,P.n5);});}}
 if(!LEVE){const ox=-((tb*5)%960);G.globalAlpha=.32;G.drawImage(nvC,0,40,960,30,Math.round(ox),198,960,30);G.drawImage(nvC,0,40,960,30,Math.round(ox)+960,198,960,30);G.globalAlpha=1;}
 /* as placas das mesas perto da luta recuam, pra luta ler inteira */
 {const zx=a3&&arcoMesa>=0?a3x(DESKS[arcoMesa].x):ARCO.on&&arcoMesa>=0&&(CJ.vis&&CJ.y>150||BAT.vis&&BAT.y>150)?DESKS[arcoMesa].x:-999;tagEls.forEach((el2,i)=>{const r=zx>-999&&i!==arcoMesa&&Math.abs(DESKS[i].x-zx)<70;if(el2._r!==r){el2._r=r;el2.classList.toggle('recua',r);}});}
 /* o Coringa, a corda, os balões, o Batman com a capa e o gancho */
 if(CJ.corda){const [x0,y0,x1,y1]=CJ.corda;for(let y=Math.max(157,y0);y<=y1;y++)X(G,x0,y,P.n6);}
 if(CJ.vis){if(CJ.baloes){const kb=escala(CJ.y);const hx=Math.round(CJ.x+(CJ.f>0?3:-3)*kb),hy=Math.round(CJ.y-24*kb);for(let y=hy-8;y<hy;y++)X(G,hx,y,P.n7);
   [[-3,-11,P.v3],[0,-14,P.g3],[3,-11,P.v2]].forEach(([ox,oy,c])=>{for(let a=-2;a<=2;a++)for(let b=-3;b<=3;b++)if(a*a/5+b*b/10<=1)X(G,hx+ox+a,hy+oy+b,c);X(G,hx+ox-1,hy+oy-2,P.n8);});}
  const pose=reagiu('coringa',t,1.6)&&CJ.y>=200?'mostra':CJ.pose;const kc=CJ.pose==='pendura'||CJ.pose==='prega'?2:escala(CJ.y);
  if(CJ.clip){G.save();G.beginPath();G.rect(44,157,392,66);G.clip();}poe(FC,pose,CJ.f,CJ.x,CJ.y,kc);if(CJ.clip)G.restore();}
 BAT.al=clamp((BAT.al==null?1:BAT.al)+(BAT.vis?1:-1)*dt/.4,0,1);if(BAT.vis||BAT.al>.02){if(!BAT.vis)BAT.vis=true,BAT.fant=1;G.globalAlpha=BAT.al;const fb=FB[BAT.pose]||FB.vigia;const kb=escala(BAT.y);const sx=Math.round(BAT.x-16*kb),sy=Math.round(BAT.y-27*kb);const ax=sx+(BAT.f>=0?fb.ax:31-fb.ax)*kb,ay=sy+fb.ay*kb;
  capaPasso(ax,ay,BAT.f,dt,BAT.capa==='asa'?'asa':BAT.capa==='voa'?'voa':BAT.capa==='enrola'?'enrola':'normal',t,kb);
  if(reagiu('batman',t,.25))capaEmpurra(BAT.f,1.5);
  capaDesenha(BAT.capa,kb);G.drawImage(BAT.f>=0?fb.rd:fb.re,sx+Math.round(kb),sy-Math.round(kb),Math.round(32*kb),Math.round(28*kb));G.drawImage(BAT.f>=0?fb.d:fb.e,sx,sy,Math.round(32*kb),Math.round(28*kb));
  if(BAT.linha){const [x0,y0,x1,y1]=BAT.linha;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let s=0;s<=n;s++){const y=Math.round(lerp(y0,y1,s/n));if(y<24)break;X(G,Math.round(lerp(x0,x1,s/n)),y,P.n6);}}
  if(BAT.pose.startsWith('cafe')&&BAT.pose==='cafe1')caneca(Math.round(BAT.x+3*kb),Math.round(BAT.y-15*kb),t);G.globalAlpha=1;if(BAT.fant){BAT.vis=false;BAT.fant=0;}}
 else CAPA.ok=false;
 desenhaFX(t,dt);
 /* chuva por cima do telhado: respingo no parapeito e gárgula pingando */
 if(cl.chuva){for(let i=0;i<5;i++){const x=40+((Math.random()*400)|0);X(G,x,46,P.n6);}
  for(const y of [84,118,150]){const k=((t*3)%1);X(G,24,y-4+Math.round(k*8),P.n6);X(G,456,y-4+Math.round(k*8),P.n6);}
  if(noite>.6)for(const [x,y] of GOTAS){X(G,x,y,P.n5);X(G,x,y-1,P.n6);}}
 if(flash){G.globalCompositeOperation='screen';G.globalAlpha=.1;R(G,40,47,400,180,'#9aa6bd');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 /* glitch do Coringa: na mesa quando ele chega; na torre inteira na noite do Coringa */
 {const gl=t-GLITCH;const noiteC=noiteDoCoringa();const geral=noiteC&&((t%6)<.3);
  if((gl>=0&&gl<1.2&&arcoMesa>=0)||geral){const x0=geral?40:DESKS[arcoMesa].x-34,x1=geral?440:DESKS[arcoMesa].x+28,y0=geral?54:178,y1=geral?222:222;let s=((t*30)|0)*2654435761>>>0;
   for(let i=0;i<(geral?7:4);i++){s=(s*1103515245+12345)>>>0;const y=y0+s%(y1-y0-4),hh=1+(s>>>8)%4,off=((s>>>12)%9)-4;G.drawImage(cv,x0+OX,y+OY,x1-x0,hh,x0+off,y,x1-x0,hh);G.globalAlpha=.35;R(G,x0+((s>>>3)%((x1-x0)>>1)),y,6+(s>>>16)%20,hh,(s>>>2)&1?P.v3:P.g3);G.globalAlpha=1;}}}
 /* fala: escurece o prédio, a sala do assunto acende no facho */
 talkW=lerp(talkW,talk?1:0,1-Math.pow(.05,dt));
 if(talk0&&(!salaAtual||(!SIM&&voz.id!==falaId))){falaId=voz.id;const txt=SIM?(Q.get('sobre')||ultimoTrabalho()):(voz.sobre||'');salaAtual=salaDe(txt)||COBERTURA;falaT0=t;falaTxt=(SIM?(Q.get('fala')||fraseDe(txt)):voz.frase||'').slice(0,600);
   $('dsb').innerHTML=salaAtual===COBERTURA?'':'sobre: <b>'+(salaAtual.tag!=null?escH(DESKS[salaAtual.tag].nm.toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase())):(salaAtual.el==='pend'?'pendências':(salaEls[salaAtual.sala]?(/bussola/.test(semAc(txt))?'Bússola':salaEls[salaAtual.sala].textContent.replace(/·.*/,'').trim()||{empresa:'Empresa',mezanino:'Mezanino'}[salaAtual.sala]||''):'')))+'</b>';}
 if(talk0&&!SIM&&voz.frase&&voz.frase!==falaTxt){falaTxt=voz.frase.slice(0,600);}
 if(!talk&&talkW<.05&&salaAtual){salaAtual=null;falaId=null;ROLO.txt='';}
 const S=salaAtual;
 if(talkW>.02&&S){const A=S.topo!=null?S:AND[S.andar];
  fxg.clearRect(0,0,WW,WH);fxg.globalAlpha=1;fxg.fillStyle='rgba(4,4,8,'+(.62*talkW).toFixed(3)+')';fxg.fillRect(0,24,WW,202);
  fxg.globalCompositeOperation='destination-out';fxg.fillStyle='#fff';fxg.fillRect(S.x0,A.topo,S.x1-S.x0,A.chao-A.topo+1);
  for(let k=1;k<=4;k++){fxg.globalAlpha=1-k/5;fxg.fillRect(S.x0-k,A.topo-k,S.x1-S.x0+k*2,1);fxg.fillRect(S.x0-k,A.chao+k,S.x1-S.x0+k*2,1);fxg.fillRect(S.x0-k,A.topo-k,1,A.chao-A.topo+k*2);fxg.fillRect(S.x1+k-1,A.topo-k,1,A.chao-A.topo+k*2);}
  fxg.globalAlpha=1;fxg.globalCompositeOperation='source-over';G.drawImage(fxC,0,0);
  if(talkW>.3){G.globalAlpha=talkW;G.drawImage(sprOraculo(t,e),jx,jy);G.globalAlpha=talkW*.6;R(G,jx+6,jy+27,16,1,P.c2);G.globalAlpha=1;}
  const cm=S.topo!=null?null:caminhoC(S.andar,S.alvo);if(cm)desenhaCabo(cm,talkW>.5?P.c2:P.c1);
  const fw=Math.min(64,S.x1-S.x0),fh=A.chao-A.topo-4,key=fw+'x'+fh;if(!FACHOS[key])FACHOS[key]=pintaFacho(fw,fh);
  G.globalAlpha=talkW*(.75+nivS*.25);G.globalCompositeOperation='screen';G.drawImage(FACHOS[key],Math.round(S.alvo-fw/2),A.topo+4);G.globalCompositeOperation='source-over';G.globalAlpha=1;
  if(talk&&cm){proxPulso-=dt*(1.2+nivS*5);if(proxPulso<=0){proxPulso=1;if(PULSOS.length<12)PULSOS.push({cm,s:0,v:70+nivS*90,cauda:10+Math.round(nivS*8),grosso:nivS>.45});}}}
 else if(e==='ouvindo'){proxPulso-=dt*1.4;if(proxPulso<=0){proxPulso=1;const cm=caminhoC('terreo',TRONCO);if(PULSOS.length<12)PULSOS.push({cm,s:cm.L,v:60,cauda:12,rev:true});}}
 else if(e==='dormindo'){proxPulso-=dt/6.5;if(proxPulso<=0){proxPulso=1;const cm=caminhoC(JV.ocupado==='subindo'?'terreo':JV.andar,Math.round(JV.x));if(PULSOS.length<12)PULSOS.push({cm,s:0,v:48,cauda:9});}}
 desenhaPulsos(dt);
 /* passou o mouse ou tocou: a mesa ganha contorno ciano, a janela acende */
 {const mi=HOV.tipo==='mesa'?HOV.i:(t-(REACT.mesa||-99)<1.2?REACT.mesaI:-1);if(mi>=0&&DESKS[mi]&&DESKS[mi].who){const x=DESKS[mi].x;R(G,x-27,189,51,1,P.c3);R(G,x-27,222,51,1,P.c3);R(G,x-27,189,1,34,P.c3);R(G,x+23,189,1,34,P.c3);}
  if(HOV.bay){G.globalAlpha=.22;R(G,HOV.bay.x0,HOV.bay.y0,HOV.bay.x1-HOV.bay.x0,HOV.bay.y1-HOV.bay.y0,P.a3);G.globalAlpha=1;}
  if(HOV.luz&&t-HOV.luz.t<1.2){G.globalAlpha=.35*(1-(t-HOV.luz.t)/1.2);R(G,HOV.luz.x0,HOV.luz.y0,HOV.luz.x1-HOV.luz.x0,HOV.luz.y1-HOV.luz.y0,P.a3);G.globalAlpha=1;}
  if(HOV.tipo&&HOV.tipo!=='mesa'){const pos={batman:[BAT.x,BAT.y-24*escala(BAT.y)],coringa:[CJ.x,CJ.y-24*escala(CJ.y)],comissario:[GORD.x+1,24],oraculo:[JV.x,JV.y-28],holofote:[HOLO.x,28],relogio:[RELO.x,22]}[HOV.tipo];
   if(pos){const bob=Math.round(Math.sin(t*6));const x=Math.round(pos[0]),y=Math.round(pos[1])+bob;R(G,x-2,y,5,1,P.c3);R(G,x-1,y+1,3,1,P.c3);X(G,x,y+2,P.c3);}}}
 G.setTransform(1,0,0,1,0,0);
 if(PALCO.on)palcoQuadro(t,dt,p,e);
 hud(t,e);aplicaCamera(t);
 /* a carta no close: a última linha do erro, legível */
 {const on=CAM.z>1&&ARCO.on&&ARCO.carta&&arcoMesa>=0;const k=on?ARCO.quem+'|'+ARCO.linha:'';if(k!==hud.carta){hud.carta=k;const c=$('carta');c.hidden=!on;if(on){$('cartat').textContent=curtoErro(ARCO.linha);$('cartaq').textContent=nomeMesa(ARCO.quem);c.style.left=Math.max(184,(DESKS[arcoMesa].x-38)*4)+'px';}}}
 {const vel=velho();const k=t<AVISO_ATE?'f':vel>=3?'v'+vel:'';if(k!==hud.aviso){hud.aviso=k;const a=$('aviso');if(k==='')a.hidden=true;else if(k[0]==='v'){a.textContent='Sem notícia há '+vel+' min';a.hidden=false;}}}
 if(ENSAIO&&$('ensaio').hidden)$('ensaio').hidden=false;}

let lastE='',FALA_ON=false;
const ROLO={txt:'',n:0,por:4,t0:0,lidoEm:-1,lh:44};
function rolar(txt,t){let r=$('drolo');if(!r){$('dfr').innerHTML='<div class="rolo" id="a6-drolo"></div>';r=$('drolo');}
 if(txt!==ROLO.txt){const cresceu=!!ROLO.txt&&txt.startsWith(ROLO.txt);ROLO.txt=txt;r.textContent=txt;const n=Math.max(1,Math.round(r.offsetHeight/ROLO.lh));
  if(n>2){r.textContent='';const a=document.createElement('div');a.textContent=txt;const s=document.createElement('div');s.className='sep';s.textContent='·  ·  ·';const b=document.createElement('div');b.textContent=txt;r.append(a,s,b);}
  ROLO.n=n;ROLO.por=clamp(txt.length/n/13,3.2,6);if(!cresceu)ROLO.t0=t;ROLO.lidoEm=ROLO.t0+(n>2?ROLO.por*n:Math.max(3,txt.length/13));}
 let pos=0;if(ROLO.n>2){const u=(t-ROLO.t0-2*ROLO.por)/ROLO.por;if(u>0){const i=Math.floor(u),f=Math.min(1,(u-i)*ROLO.por/.7);pos=(i+f*f*(3-2*f))%(ROLO.n+1);}}
 r.style.transform='translateY('+(-Math.round(pos*ROLO.lh))+'px)';}
function hud(t,e){$('dlg').classList.toggle('on',FALA_ON);
 {const es=embutidoEstreito();if(hud.es!==es){hud.es=es;host.classList.toggle('estreito',es);}if(TOQUE_PEND){if(performance.now()-TOQUE_PEND.t>3000)TOQUE_PEND=null;else if(!es){const q=TOQUE_PEND;TOQUE_PEND=null;setTimeout(()=>abreFicha(q.tp,q.i,700,700),250);}}}
 {const cj=CJ.vis&&!PALCO.on;if(hud.cj!==cj){hud.cj=cj;host.classList.toggle('coringa',cj);}}
 {const am=ARCO.on&&ARCO.carta?mesaDe(ARCO.quem):-1;const k=am>=0?am+'':'';if(hud.pi!==k){hud.pi=k;const pc=$('picho');pc.hidden=am<0;host.classList.toggle('pichado',am>=0);if(am>=0){pc.style.left=(TX(DESKS[am].x-44))+'px';pc.style.top=(TY(122)-40)+'px';}}}
 {const pnow=pendAgora(t);const on=pnow>0&&!PALCO.on&&SINAL.k>.6;
  /* r3: com o sinal aceso, a frase do céu é a única contagem (o quadro de pendências sai). O dado da TV ainda não traz a
     pergunta de cada pendência; a frase diz o que é ("só você resolve") e a idade da mais antiga. */
  const tit=pnow+(pnow===1?' coisa':' coisas'),tit2='só você resolve';const dd=ESPERA_MIN>=1?'a mais antiga há '+dur(ESPERA_MIN*60):'chegou agora';const k=on?tit+'|'+dd:'';
  if(hud.q!==k){hud.q=k;$('ceuq').hidden=!on;$('pend').classList.toggle('sinal',on);if(on){$('ceuqt').innerHTML='<i>'+escH(tit)+'</i><i>'+tit2+'</i>';$('ceuqd').textContent=dd;}}
  if(ENSAIO==='sinal'&&hud.pn!==pnow){hud.pn=pnow;$('pend').hidden=pnow<=0;if(pnow>0){$('pn').textContent=pnow;$('pw').textContent=pnow===1?'PENDÊNCIA':'PENDÊNCIAS';}}}
 {const rc=!!(opts.recorte&&(opts.recorte[1]>0||opts.recorte[3]<1080));if(hud.rc!==rc){hud.rc=rc;host.classList.toggle('recortado',rc);}}   /* recortado (Central no celular): placar e faixas ficam fora do quadro */
 const jt=$('jtag');const jx=TX(Math.round(JV.x)),jy=TY(Math.round(JV.y))-14;let cobre=false;if(jy>600&&jy<820)tagEls.forEach((e2,i)=>{if(!e2.hidden&&Math.abs(TX(DESKS[i].x)-jx)<88+150)cobre=true;});   /* r3: o rótulo da Oráculo não passa por cima da placa da mesa */
 jt.style.opacity=talkW>.1||cobre?0:1;jt.style.left=jx+'px';jt.style.top=jy+'px';
 const lbl={dormindo:{servir:'conferindo as mesas',olhar:'passando nos andares',cafe:'pegando café',elevador:'no elevador',subindo:'no elevador','':'fazendo a ronda'}[JV.ocupado]||'fazendo a ronda',ouvindo:'ouvindo você',pensando:'pensando',falando:'falando'}[e]||e;
 const key=e+lbl;if(key!==lastE){lastE=key;jt.innerHTML=`<i style="background:${e==='dormindo'?P.n6:e==='pensando'?P.a3:P.c3}"></i>ORÁCULO <span>· ${lbl}</span>`;}
 if(salaAtual!==lastSala){lastSala=salaAtual;tagEls.forEach((el2,i)=>el2.classList.toggle('on',!!salaAtual&&salaAtual.tag===i));Object.entries(salaEls).forEach(([k,el2])=>el2.classList.toggle('on',!!salaAtual&&salaAtual.sala===k));$('pend').style.outline=salaAtual&&salaAtual.el==='pend'?'4px solid var(--c3)':'none';$('pend').classList.toggle('calado',!!salaAtual&&salaAtual.el!=='pend');}
 if(e==='falando'||talkW>.05){drawPortrait(t,nivS);drawWave();rolar(falaTxt,t);$('dar').style.transform=`translateY(${Math.round(Math.sin(t*1.8)*1.5)*4}px)`;$('dar').style.opacity=ROLO.n>2?1:0;}}
window.avancar=function(t,dt){window.__manual=true;window.__t=t;quadro(t,dt||1/30);};
function ligar(){if(ativo)return;ativo=true;ligadoEm=performance.now();host.hidden=false;nQ=0;fpsT=0;if(!raf)raf=requestAnimationFrame(frame);}
function parar(){ativo=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
const api={mesas:()=>DESKS.map(d=>d.who),encaixar:(r)=>{if(r)opts.recorte=r;fit();},elemento:id=>$(id),estado:aplicarEstado,voz:ouvir,cenaNoAndar,ligar,parar,lento:on=>{lentoF=!!on;},fps:()=>ativo?fpsV:0,erros:()=>erros,host,medida,
 tocar:(tp,i)=>{REACT[tp]=TEMPO;abreFicha(tp,i==null?-1:i,960,540);},teste:()=>({imp:IMP.t,palco:PALCO.cena,arco:Object.assign({},ARCO),bat:Object.assign({},BAT),cj:Object.assign({},CJ),cam:{z:CAM.z,tx:CAM.tx,ty:CAM.ty,modo:CAM.modo},pend:pendAgora(TEMPO),espera:ESPERA_MIN,sinal:SINAL.k,erros:ERROS.map(e=>e.quem),leve:LEVE,meio:MEIO})};
if(raiz.Andar)raiz.Andar.atual=api;  /* pro teste do Chromium ler o quadros/s */
return api;
}
raiz.Andar = { criar };
})(window);
