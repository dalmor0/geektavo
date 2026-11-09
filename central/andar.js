/* CÓPIA PRA CENTRAL gerada pelo CENTRAL/site/andar_da_tv.py (não editar aqui).
   Andar 47 · v6 mix (Fliperama + Formigueiro + Amanhecer) como menu da TV da sala.
   GERADO por CENTRAL/repaginada/tv-ideias-2026-11-07/andar47-variacoes/v6-mix/fonte/para_tv.py a partir do
   protótipo aprovado (index.html da mesma pasta). Mexer lá e rodar o para_tv.py de novo.
   Uso (painel.js, só na sala): const a = Andar.criar({agora: () => ms do relógio da vitrine});
   a.estado(json do /api/estado); a.voz(json do /api/voz, segundos da vitrine); a.ligar(); a.parar();
   a.lento(true) enquanto a janela de cena do cenas.js está por cima; a.fps() pro /diag.
   Canvas 480x270 ampliado 4x (pixelated), HUD em HTML, sem WebGL, 30 quadros/s no máximo. */
(function (raiz) {
"use strict";
const HTML="<div id=\"a6-stage\">\n  <canvas id=\"a6-world\" width=\"480\" height=\"270\"></canvas>\n  <div id=\"a6-hud\">\n    <div id=\"a6-top\">\n      <div class=\"score\" id=\"a6-s1\" style=\"left:32px;--k:var(--a3)\"><div class=\"who\"><b>1P</b><span id=\"a6-s1n\"></span></div><div class=\"num\"><span id=\"a6-s1v\"></span><small>YOUTUBE</small></div></div>\n      <div id=\"a6-clock\"><div class=\"h\" id=\"a6-hora\"></div><div class=\"d\"><canvas id=\"a6-astro\" width=\"7\" height=\"7\"></canvas><span id=\"a6-data\"></span></div></div>\n      <div id=\"a6-boss\"><div class=\"t\"><span id=\"a6-bn\"></span><span id=\"a6-be\"></span></div><div class=\"row\"><div class=\"bar big\" style=\"--f:var(--a2);--fl:var(--a3)\"><i id=\"a6-bb\"></i></div><div class=\"pct\" id=\"a6-bp\"></div></div></div>\n      <div class=\"score\" id=\"a6-s2\" style=\"right:32px;text-align:right;--k:var(--p3)\"><div class=\"who\" style=\"justify-content:flex-end\"><span id=\"a6-s2n\"></span><b>2P</b></div><div class=\"num\"><small style=\"margin:0 10px 0 0\">INSTAGRAM</small><span id=\"a6-s2v\"></span></div></div>\n    </div>\n    <div id=\"a6-andares\"></div>\n    <div id=\"a6-salas\"></div>\n    <div id=\"a6-tags\"></div>\n    <div id=\"a6-pend\"><div class=\"n\" id=\"a6-pn\"></div><div class=\"w\" id=\"a6-pw\"></div><div class=\"s\">esperando você</div></div>\n    <div id=\"a6-bot\">\n      <div class=\"pn\" id=\"a6-mis\"><div class=\"hd\">MISSÕES</div><ul id=\"a6-misl\"></ul></div>\n      <div class=\"pn\" id=\"a6-itens\"><div class=\"hd\">ITENS · <b id=\"a6-ino\"></b> SHORTS NO AR HOJE</div><div class=\"slots\" id=\"a6-slots\"></div></div>\n      <div class=\"pn\" id=\"a6-pc\"><div class=\"hd\">PC</div><div class=\"hd2\" id=\"a6-pcl\"></div><div class=\"en\"><span>CPU</span><div class=\"bar big\" style=\"--f:var(--g2);--fl:var(--g3)\"><i id=\"a6-pce\"></i></div><b id=\"a6-pcv\"></b></div><div class=\"rows\" id=\"a6-pcr\"></div></div>\n    </div>\n    <div id=\"a6-jtag\"></div>\n    <div id=\"a6-dlg\"><div class=\"pt\"><canvas id=\"a6-por\" width=\"40\" height=\"40\"></canvas></div><div class=\"nm\">JARVIS</div><div class=\"sb\" id=\"a6-dsb\"></div><div class=\"fr\" id=\"a6-dfr\"></div><canvas class=\"wv\" id=\"a6-wav\" width=\"395\" height=\"6\"></canvas><div class=\"ar\" id=\"a6-dar\"></div></div>\n  </div>\n</div>";
function criar(opts) {
opts = opts || {};
const host=document.createElement('div');host.id='andar';host.setAttribute('aria-hidden','true');host.hidden=true;host.innerHTML=HTML;(opts.dentro||document.body).appendChild(host);
/* ===== dados (cópia de ../../dados/estado-sala.json, modo sala) ===== */
/* dado ao vivo: o painel chama Andar.estado(e) com o /api/estado da vitrine (modo sala: dinheiro já vem oculto e
   aqui ninguém lê esse campo) */
const D={pc:{},uso_claude:{},terminais:{lista:[]},trabalhos:[],dark:{lista:[]},canais:[],alertas:[],tz:-180};
const Q=new URLSearchParams(location.search);
let PEND=0;const PEND_Q=Q.get('pend');

/* ===== paleta ===== */
const P={ink:'#0b0a14',n1:'#141327',n2:'#1d1b38',n3:'#282650',n4:'#36346a',n5:'#4a4a86',n6:'#6a6fa8',n7:'#9aa3cf',n8:'#e6e8f6',
c1:'#0f4f62',c2:'#1a9bb0',c3:'#5ff2f0',p1:'#5a1a4c',p2:'#c0307c',p3:'#ff6fb0',a1:'#6a3a12',a2:'#d0801c',a3:'#ffc85a',
r1:'#5c1420',r2:'#c8283c',r3:'#ff5a5a',g1:'#1d5a3a',g2:'#3cba5a',g3:'#9cf06a',b1:'#1a3a7a',b2:'#3a78d8',b3:'#8cc8ff',v1:'#3a1f5c',v2:'#7a3fb0',
s1:'#f2c39a',s2:'#c98a62',s3:'#8a5236',s4:'#5a3322',w1:'#6b4a3a'};
const TONE={a:[P.a1,P.a2,P.a3],p:[P.p1,P.p2,P.p3],c:[P.c1,P.c2,P.c3],b:[P.b1,P.b2,P.b3],g:[P.g1,P.g2,P.g3],r:[P.r1,P.r2,P.r3],v:[P.v1,P.v2,P.p3]};

/* ===== util ===== */
const WW=480,WH=270;
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
function lerp(a,b,k){return a+(b-a)*k}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function suave(a,b,v){const k=clamp((v-a)/(b-a),0,1);return k*k*(3-2*k);}
const semAc=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

/* ===== a torre ===== */
const ANDARES=[
 {id:'empresa', nome:'EMPRESA', topo:54, chao:84, rod:5},
 {id:'estudios',nome:'ESTÚDIOS',topo:88, chao:118,rod:5},
 {id:'mezanino',nome:'MEZANINO',topo:122,chao:150,rod:4},
 {id:'terreo',  nome:'TÉRREO',  topo:154,chao:222,rod:6}];
const AND=Object.fromEntries(ANDARES.map(a=>[a.id,a]));
const LAJES=[50,84,118,150,222];
const POCO={x0:362,x1:382,cx:372},TRONCO=359,NUCLEO={x:372,y:43};
const ESTUDIOS=[{id:'sites',nome:'Sites',x0:44,x1:122,k:'b'},{id:'estudos',nome:'Estudos',x0:124,x1:202,k:'g'},{id:'identidade',nome:'Identidade',x0:204,x1:280,k:'p'},{id:'vsl',nome:'VSL e Produtos',x0:282,x1:360,k:'a'}];

/* ===== luz do dia: 4 fases, cada uma com a paleta dela ===== */
const FASES={
 noite:{ceu:['#0b0a14','#141327','#1d1b38','#2a2050','#3a1f5c','#5a1a4c','#8a2462'],estrelas:1,nuvem:['#1d1b38','#282650'],
   longe:['#36346a','#4a4a86'],meio:['#1d1b38','#36346a'],perto:['#141327','#0f4f62'],jan:1,vidro:null,neon:1,nevoa:'#5a1a4c',nevoa2:'#3a1f5c'},
 amanhecer:{ceu:['#2c3c6c','#4c5c8c','#8c7c98','#d4a07c','#f4b860','#ffd27a','#fff0b4'],estrelas:0,nuvem:['#eab088','#fff2c4'],
   longe:['#a8909c','#dcb894'],meio:['#5c4c6e','#f6c472'],perto:['#352a48','#ffcc72'],jan:.12,vidro:'#ffe2a0',neon:0,nevoa:'#f6c482',nevoa2:'#d8a89a'},
 dia:{ceu:['#2c6cc4','#3a80d6','#529ae6','#76b4f0','#9ecdf6','#c6e2fa','#e2f0ff'],estrelas:0,nuvem:['#cfe0f4','#ffffff'],
   longe:['#a2bad6','#c8daec'],meio:['#7088ac','#b4c6de'],perto:['#485a7e','#a0b6d0'],jan:0,vidro:'#dcecff',neon:0,nevoa:'#c8dcf0',nevoa2:'#b0c8e4'},
 entardecer:{ceu:['#160f3a','#341656','#6e1e6c','#b4286a','#e85a6a','#f4784e','#ff9c50'],estrelas:0,nuvem:['#8a2a62','#ff7a6a'],
   longe:['#5e2a66','#a8486e'],meio:['#321a4c','#f0705e'],perto:['#1a1230','#ff7a62'],jan:.6,vidro:'#ff8a7a',neon:1,nevoa:'#c8406a',nevoa2:'#7a2a62'}};
const ORDEM=['noite','amanhecer','dia','entardecer'];
/* hora -> pesos das fases (só duas por vez, com passagem suave) */
function pesos(h){
 const T=[[0,'noite'],[4.8,'noite'],[5.6,'amanhecer'],[7.1,'amanhecer'],[8.6,'dia'],[16.4,'dia'],[17.4,'entardecer'],[18.5,'entardecer'],[19.6,'noite'],[24,'noite']];
 for(let i=0;i<T.length-1;i++){const [a,fa]=T[i],[b,fb]=T[i+1];if(h>=a&&h<b){const k=suave(a,b,h);const w={noite:0,amanhecer:0,dia:0,entardecer:0};w[fa]+=1-k;w[fb]+=k;return w;}}
 return {noite:1,amanhecer:0,dia:0,entardecer:0};}

/* ===== moldes dos bonecos (12 colunas) ===== */
const HEAD_R=["...HHHHH....","..HHHHHHHH..",".HHHHHHHHHH.",".hHHHHSSSSH.",".hHHHsSSSES.",".hhHsSSSSES.","..hhSSSSSSS.","...hsSSSSs.."];
const HEAD_F=["...HHHHHH...","..HHHHHHHH..",".HHHHHHHHHH.",".HHSSSHSSHH.",".HSESSSSESH.",".hSESSSSESh.","..sSSSSSSs..","...sSSSSs..."];
const HEAD_B=["...HHHHHH...","..HHHHHHHH..",".HHHHHHHHHH.",".HHHHHHHHHH.",".hHHHHHHHHh.",".shHHHHHHhs.","..hhHHHHhh..","...sSSSSs..."];
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
const HAIR=[[P.n1,P.ink],[P.s3,P.s4],[P.a3,P.a2],[P.p3,P.p2],[P.c3,P.c2],[P.v2,P.v1],[P.r2,P.r1],[P.n7,P.n5],[P.g2,P.g1],[P.s4,P.n1]];
const SKIN=[[P.s1,P.s2],[P.s2,P.s3],[P.s3,P.s4]];
const SHIRT=[[P.a2,P.a1],[P.p2,P.p1],[P.c2,P.c1],[P.b2,P.b1],[P.g2,P.g1],[P.n5,P.n4],[P.n7,P.n5],[P.r2,P.r1],[P.v2,P.v1]];
const PANTS=[[P.n3,P.n2],[P.b1,P.n2],[P.n4,P.n3],[P.s4,P.n1]];
function cmap(h,s,t,p,dim){const H=HAIR[h],S=SKIN[s],T=SHIRT[t],Pp=PANTS[p];
  if(dim)return {H:H[1],h:H[1]===P.ink?P.ink:P.n1,S:S[1],s:S[1]===P.s4?P.n1:SKIN[Math.min(2,s+1)][1],E:P.ink,T:T[1],t:P.n2,P:Pp[1],p:P.n1,B:P.n1,W:P.n6,O:P.ink};
  return {H:H[0],h:H[1],S:S[0],s:S[1],E:P.ink,T:T[0],t:T[1],P:Pp[0],p:Pp[1],B:P.n1,W:P.n7,O:P.ink};}
function walkSet(cm){const fr=[[L_A,T_BK],[L_P,T_N],[L_C,T_F],[L_P,T_N]];const o={r:[],l:[]};
  for(const [L,T] of fr){const parts=[{r:HEAD_R},{r:T,y:8},{r:L,y:13}];o.r.push(build(parts,cm,false));o.l.push(build(parts,cm,true));}
  o.sr=build([{r:HEAD_R},{r:T_N,y:8},{r:L_ST,y:13}],cm,false);o.sl=build([{r:HEAD_R},{r:T_N,y:8},{r:L_ST,y:13}],cm,true);return o;}

/* ===== céu e cidade, uma versão por fase (mesma geometria, cores da hora) ===== */
function pintaCeu(F){const [c,g]=mk(WW,WH);gradV(g,0,22,WW,206,F.ceu);
 if(F.estrelas){const rr=rng(7);for(let i=0;i<90;i++){const x=rr()*WW,y=24+rr()*70,k=rr();X(g,x,y,k<.2?P.n7:k<.5?P.n5:P.n4);}}
 return c;}
function pintaNuvem(F){const [c,g]=mk(960,WH);const rr=rng(21);
 for(let i=0;i<12;i++){const cx=rr()*960,cy=30+rr()*34,w=30+rr()*70,h=2+rr()*3;
  for(let y=-h;y<=h;y++)for(let x=-w;x<=w;x++){const e=(x/w)**2+(y/h)**2;if(e>1)continue;const xx=Math.round((cx+x+960)%960),yy=Math.round(cy+y);
   if(e>.55){if(bay(xx,yy)<.4)X(g,xx,yy,F.nuvem[0]);}else X(g,xx,yy,y<-h*.25?F.nuvem[1]:F.nuvem[0]);}}
 return c;}
function predio(g,x,top,w,body,rim,st,ant,ah,ax,antCor){R(g,x,top,w,WH-top,body);R(g,x+w-1,top,1,WH-top,rim);R(g,x,top,w,1,rim);
 if(st&&w>14){R(g,x+3,top-5,w-6,5,body);R(g,x+w-4,top-5,1,5,rim);R(g,x+3,top-5,w-6,1,rim);}
 if(ant){const yy=top-ah-(st?5:0);R(g,ax,yy,1,ah,rim);X(g,ax,yy-1,antCor);}}
const LIT=[P.a2,P.a3,P.c2,P.n6,P.b2,P.p2];
function pintaLonge(F){const [c,g]=mk(560,WH);const rr=rng(3);let x=-6;
 while(x<560){const w=12+(rr()*22|0),top=62+(rr()*58|0),st=rr()<.3,an=rr()<.35,ax=x+2+(rr()*(Math.max(1,w-4))|0),ah=5+(rr()*10|0);
  predio(g,x,top,w,F.longe[0],F.longe[1],st,an,ah,ax,F.neon?P.r2:F.longe[1]);
  for(let y=top+3;y<WH;y+=3)for(let xx=x+2;xx<x+w-2;xx+=2)if(rr()<.1){const k=rr();const col=k<F.jan?[P.n6,P.p2,P.a2,P.n5][(k*40|0)%4]:F.vidro;if(col)X(g,xx,y,col);}
  x+=w+(rr()*3|0);}
 dith(g,0,110,560,40,F.nevoa2,.25);dith(g,0,150,560,120,F.nevoa,.4);return c;}
function pintaMeio(F){const [c,g]=mk(600,WH);const rr=rng(11);let x=-8;
 while(x<600){const w=20+(rr()*24|0),top=92+(rr()*50|0),st=rr()<.35,an=rr()<.3,ax=x+2+(rr()*(w-4)|0),ah=5+(rr()*10|0);
  predio(g,x,top,w,F.meio[0],F.meio[1],st,an,ah,ax,F.neon?P.r2:F.meio[1]);
  const band=rr()<.4;
  for(let y=top+4;y<WH;y+=3){const rowLit=band&&rr()<.22;for(let xx=x+2;xx<x+w-3;xx+=3){const a=rr();if(rowLit||a<.2){const k=rr();const col=k<F.jan?(rowLit?P.a2:LIT[(k*60|0)%6]):F.vidro;if(col)R(g,xx,y,2,1,col);}}}
  if(rr()<.4){const tn=[TONE.p,TONE.c,TONE.a,TONE.g][rr()*4|0];const sx=x+(rr()<.5?1:w-5),sy=top+6,sh=14+(rr()*16|0);
   if(F.neon){dith(g,sx-2,sy-2,8,sh+4,tn[0],.5);R(g,sx,sy,4,sh,tn[2]);R(g,sx+1,sy+1,2,sh-2,tn[1]);for(let k=sy+3;k<sy+sh-2;k+=4)R(g,sx+1,k,2,1,tn[2]);}
   else{R(g,sx,sy,4,sh,F.meio[1]);R(g,sx+1,sy+1,2,sh-2,tn[0]);}}
  if(rr()<.22&&w>18){const tn=[TONE.p,TONE.c,TONE.b][rr()*3|0];const bx=x+3,by=top-10,k=rr()*3|0;R(g,bx+2,by+8,1,3,F.meio[1]);R(g,bx+w-9,by+8,1,3,F.meio[1]);R(g,bx,by,w-6,8,F.neon?P.n1:F.meio[0]);R(g,bx+1,by+1,w-8,6,F.neon?tn[0]:F.meio[1]);
   const on=F.neon?tn:[F.meio[0],F.meio[0],F.meio[0]];
   if(k===0){R(g,bx+4,by+2,3,3,on[2]);R(g,bx+9,by+3,w-20,1,on[1]);}else if(k===1){for(let i=0;i<w-10;i+=3)R(g,bx+2+i,by+2+(i%2),2,3,on[2]);}else{R(g,bx+2,by+3,w-10,1,on[2]);R(g,bx+2,by+5,(w-10)/2,1,on[1]);}}
  x+=w+(rr()*4|0);}
 R(g,0,190,600,2,F.meio[0]);R(g,0,190,600,1,F.meio[1]);for(let k=10;k<600;k+=70)R(g,k,192,3,40,F.meio[0]);
 return c;}
function pintaPerto(F){const [c,g]=mk(640,WH);const rr=rng(5);const B=[[0,152,70],[150,174,56],[300,144,80],[460,168,60],[560,158,70]];
 for(const [x,top,w] of B){R(g,x,top,w,WH-top,F.perto[0]);dith(g,x,top,w,WH-top,F.perto[0]===P.n1?P.n2:F.perto[1],.12);R(g,x,top,w,1,F.perto[1]);R(g,x+w-1,top,1,WH-top,F.perto[1]);
  for(let y=top+5;y<WH;y+=4)for(let xx=x+3;xx<x+w-3;xx+=4)if(rr()<.1){const k=rr();R(g,xx,y,2,1,k<F.jan?[P.a1,P.c1,P.p1][(k*30|0)%3]:(F.vidro||P.n2));}}
 const N=F.neon;
 // letreiro vertical rosa
 if(N){dith(g,30,160,12,54,P.p1,.5);R(g,32,162,8,50,P.p3);R(g,33,163,6,48,P.p2);for(let k=166;k<208;k+=6)R(g,34,k,4,3,P.p3);}
 else{R(g,32,162,8,50,F.perto[1]);R(g,33,163,6,48,F.perto[0]);}
 // tigela de lámen
 {const bx=322,by=154;if(N){dith(g,bx-3,by-3,40,24,P.a1,.45);}R(g,bx,by,34,18,P.n1);R(g,bx+1,by+1,32,16,N?P.a1:F.perto[0]);
  const a3=N?P.a3:F.perto[1],a2=N?P.a2:F.perto[1];R(g,bx+7,by+9,20,1,a3);R(g,bx+8,by+10,18,2,a2);R(g,bx+9,by+12,16,1,a2);R(g,bx+11,by+13,12,1,a2);R(g,bx+14,by+14,6,1,a3);
  R(g,bx+12,by+3,1,4,N?P.n8:a2);R(g,bx+16,by+2,1,5,N?P.n8:a2);R(g,bx+20,by+3,1,4,N?P.n8:a2);}
 // símbolo ciano
 {const bx=478,by=176;if(N)dith(g,bx-3,by-3,20,20,P.c1,.5);for(let y=0;y<14;y++)for(let x=0;x<14;x++){const d=Math.hypot(x-6.5,y-6.5);if(d>5&&d<6.6&&!(y<5&&x>4&&x<9))X(g,bx+x,by+y,N?P.c3:F.perto[1]);}R(g,bx+6,by,2,7,N?P.c3:F.perto[1]);}
 return c;}
const CAMADAS={};
for(const f of ORDEM){const F=FASES[f];CAMADAS[f]={ceu:pintaCeu(F),nuvem:pintaNuvem(F),longe:pintaLonge(F),meio:pintaMeio(F),perto:pintaPerto(F)};}

/* sol e lua */
function astro(r,cor,halo,halo2){const S=r+8;const [c,g]=mk(S*2,S*2);
 for(let y=-S;y<S;y++)for(let x=-S;x<S;x++){const d=Math.hypot(x+.5,y+.5);
  if(d<=r)X(g,S+x,S+y,cor);else if(d<=r+3){if(bay(S+x,S+y)<.55)X(g,S+x,S+y,halo);}else if(d<=r+7){if(bay(S+x,S+y)<.2)X(g,S+x,S+y,halo2);}}
 return c;}
const SOL={amanhecer:astro(8,'#fff0b0','#ffc870','#ff9a60'),dia:astro(6,'#fffbe6','#fff2b0','#e6f2ff'),entardecer:astro(8,'#ffd890','#ff9a50','#e0505a')};
const LUA=(()=>{const [c,g]=mk(40,40);const mx=20,my=20,r=9;
 for(let y=-r-6;y<=r+6;y++)for(let x=-r-6;x<=r+6;x++){const d=Math.hypot(x,y);
  if(d<=r){let col=P.n8;if(x+y>4&&d>r-3)col=P.n7;if((x+3)**2+(y+2)**2<4||(x-3)**2+(y-3)**2<3||(x-4)**2+(y+3)**2<2)col=P.n7;X(g,mx+x,my+y,col);}
  else if(d<=r+2){if(bay(mx+x,my+y)<.5)X(g,mx+x,my+y,P.n5);}else if(d<=r+6){if(bay(mx+x,my+y)<.22)X(g,mx+x,my+y,P.n4);}}return c;})();
/* dirigível (sem texto) */
const [blC,bl]=mk(44,18);
(function(){for(let y=0;y<12;y++)for(let x=0;x<40;x++){const e=((x-19.5)/20)**2+((y-5.5)/6)**2;if(e<1)X(bl,x+2,y,y<3?P.n6:y>8?P.n3:P.n4);}
 R(bl,0,3,4,6,P.n3);R(bl,0,2,2,8,P.n4);R(bl,16,12,10,3,P.n3);R(bl,17,13,8,1,P.a2);X(bl,42,5,P.r2);R(bl,10,3,22,6,P.ink);})();
const CARS=[];{const rr=rng(9);const lanes=[[68,3,1],[102,5,2],[134,6,2],[172,10,3]];
 lanes.forEach((L,li)=>{for(let i=0;i<3;i++)CARS.push({y:L[0]+(rr()*5|0),v:L[1]*(rr()<.5?-1:1)*(.8+rr()*.4),s:L[2],x:rr()*560,l:li});});}
const RAIN=[];{const rr=rng(31);for(let i=0;i<130;i++)RAIN.push({x:rr()*520,y:24+rr()*200,l:4+(rr()*3|0),v:34+rr()*14,c:rr()<.4?'#c4d2f2':'#9fb4e6'});}
const DROPS=[];{const rr=rng(41);for(let i=0;i<60;i++)DROPS.push([rr()*480|0,26+(rr()*196|0)]);}
const AVES=[];{const rr=rng(55);for(let i=0;i<4;i++)AVES.push({y:30+rr()*14,v:4+rr()*3,ph:rr()*300,f:rr()*3});}

/* ===== interior: duas pinturas (dia e noite), a luz da hora mistura as duas ===== */
const LN={parede:'#1d1b38',ext:'#282650',extHi:'#4a4a86',extSh:'#141327',teto:'#141327',tetoL:'#282650',tetoM:'#36346a',rodape:'#1d1b38',rodapeL:'#36346a',piso:'#4a4a86',
 mont:'#141327',montHi:'#282650',reflexo:'#282650',laje:'#141327',lajeT:'#4a4a86',lajeM:'#282650',poco:'#0f0e1e',pocoL:'#1d1b38',trilho:'#36346a',cabo:'#12303c',
 m1:'#1d1b38',m2:'#36346a',m3:'#6a6fa8',mesa:'#36346a',mesaT:'#6a6fa8',mad:'#5a3322',mad2:'#6b4a3a',domo:'#9aa3cf',tela:'#141327'};
const LDIA={parede:'#9ea4c6',ext:'#7a7fa8',extHi:'#c4c9e0',extSh:'#4e5378',teto:'#b2b8d4',tetoL:'#d4d8ea',tetoM:'#f2f4fc',rodape:'#868cb2',rodapeL:'#b4bad6',piso:'#dadeee',
 mont:'#6a7096',montHi:'#a4aac8',reflexo:'#eef6ff',laje:'#3e4364',lajeT:'#c8cce0',lajeM:'#6a7098',poco:'#3a3f60',pocoL:'#5a6080',trilho:'#9aa1c2',cabo:'#2a5060',
 m1:'#3e4364',m2:'#5e6488',m3:'#b8bed6',mesa:'#6a7098',mesaT:'#d8dcec',mad:'#7a5034',mad2:'#9a6a44',domo:'#eef6ff',tela:'#2a2e4a'};
const DESKS=[{x:76,k:'a',nm:'',who:null,hair:3,skin:0,shirt:0,pants:0},
 {x:138,k:'p',nm:'',who:null,hair:1,skin:1,shirt:1,pants:2},
 {x:200,k:'c',nm:'',who:null,hair:0,skin:2,shirt:2,pants:1},
 {x:262,k:'b',nm:'',who:null,hair:4,skin:0,shirt:3,pants:0},
 {x:324,k:'g',nm:'',who:null,hair:9,skin:1,shirt:4,pants:3}];
const DIG={'4':["##..##","##..##","##..##","######","######","....##","....##","....##"],'7':["######","######","....##","...##.","..##..","..##..",".##...",".##..."]};

function pintaInterior(L,noite){const [c,g]=mk(WW,WH);
 /* corpo da torre */
 R(g,40,50,400,176,L.parede);
 for(const A of ANDARES){const w0=A.topo+3,w1=A.chao-A.rod;
  g.clearRect(44,w0,392,w1-w0);
  R(g,44,A.topo,392,3,L.teto);R(g,44,A.topo+2,392,1,L.tetoL);for(let k=52;k<436;k+=24)R(g,k,A.topo+1,8,1,L.tetoM);
  R(g,44,w1,392,A.rod,L.rodape);R(g,44,w1,392,1,L.rodapeL);R(g,44,A.chao-1,392,1,L.piso);
  for(let mx=44;mx<=436;mx+=49){R(g,mx,w0,2,w1-w0,L.mont);R(g,mx+1,w0,1,w1-w0,L.montHi);}
  R(g,44,w0+Math.round((w1-w0)*.42),392,1,L.mont);
  for(const gx of [58,150,246,300,404]){for(let k=0;k<Math.min(18,w1-w0-2);k++){const yy=w1-2-k;X(g,gx+k,yy,L.reflexo);if(k%3)X(g,gx+k+3,yy,L.reflexo);}}
 }
 for(const y of LAJES){R(g,40,y,400,4,L.laje);R(g,40,y,400,1,L.lajeT);for(let k=44;k<436;k+=6)X(g,k,y+2,L.lajeM);}
 R(g,40,50,4,176,L.ext);R(g,436,50,4,176,L.ext);R(g,40,50,1,176,L.extHi);R(g,439,50,1,176,L.extSh);
 /* poço do elevador e o tronco de cabos */
 R(g,POCO.x0,54,20,172,L.poco);R(g,POCO.x0,54,1,172,L.trilho);R(g,POCO.x1-1,54,1,172,L.trilho);
 for(let y=56;y<222;y+=14){for(let k=0;k<12;k++){X(g,POCO.x0+4+k*1.2,y+k,L.pocoL);X(g,POCO.x1-5-k*1.2,y+k,L.pocoL);}}
 for(const A of ANDARES){R(g,POCO.x0,A.chao,20,1,L.lajeT);R(g,POCO.x0-1,A.topo,1,A.chao-A.topo,L.trilho);R(g,POCO.x1,A.topo,1,A.chao-A.topo,L.trilho);
  R(g,POCO.x0+7,A.topo+2,6,2,L.m1);}
 R(g,TRONCO,54,2,168,L.cabo);for(let y=58;y<222;y+=10)R(g,TRONCO-1,y,4,1,L.m2);
 for(const A of ANDARES){R(g,44,A.topo+3,392,1,L.cabo);for(let k=48;k<436;k+=16)X(g,k,A.topo+4,L.m2);}

 /* cobertura: parapeito, cúpula do Jarvis, caixa d'água, 47 em néon, antena, placas solares */
 R(g,40,47,400,3,L.ext);R(g,40,47,400,1,L.extHi);for(let k=44;k<436;k+=10)R(g,k,48,1,2,L.extSh);
 {const cx=NUCLEO.x,cy=48,r=13;R(g,cx-17,44,34,6,L.ext);R(g,cx-17,44,34,1,L.extHi);R(g,cx-15,49,30,1,L.extSh);
  for(let y=-r;y<=0;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d<=r){if(d>r-1.2)X(g,cx+x,cy-4+y,L.domo);else{X(g,cx+x,cy-4+y,noite?'#0c1626':'#3a5a7a');if(x<-3&&y<-4&&d>r-4)X(g,cx+x,cy-4+y,noite?'#1c3450':'#a8d0ec');}}}
  for(let x=-r;x<=r;x+=4)R(g,cx+x,cy-5,1,1,L.domo);R(g,cx-1,cy-4-r-3,2,3,L.trilho);X(g,cx,cy-4-r-4,noite?P.c3:P.c2);
  R(g,cx-9,cy-6,18,2,'#8a6a34');R(g,cx-9,cy-6,18,1,'#c8a05a');}
 {const x=60;R(g,x,30,22,12,L.m2);R(g,x,30,22,1,L.m3);for(let k=x+3;k<x+22;k+=5)R(g,k,31,1,11,L.m1);R(g,x+2,42,2,5,L.m1);R(g,x+18,42,2,5,L.m1);R(g,x+2,44,18,1,L.m1);R(g,x+8,26,6,4,L.m2);}
 {const ox=98,oy=27;R(g,ox+4,oy+18,1,3,L.m1);R(g,ox+30,oy+18,1,3,L.m1);R(g,ox,oy,36,18,P.ink);R(g,ox,oy,36,1,L.m2);
  if(noite){dith(g,ox-5,oy-4,46,26,P.p1,.25);dith(g,ox+1,oy+1,34,16,P.p1,.5);}
  const on=noite?P.p3:'#b886a0',hi=noite?P.n8:'#d8b0c4';
  const put=(Dg,x0)=>Dg.forEach((r,y)=>{for(let x=0;x<6;x++)if(r[x]==='#'){R(g,x0+x*2,oy+1+y*2,2,2,on);X(g,x0+x*2,oy+1+y*2,hi);}});put(DIG['4'],ox+4);put(DIG['7'],ox+20);}
 {const x=176;R(g,x,26,1,21,L.m2);R(g,x-3,33,7,1,L.m2);R(g,x-2,38,5,1,L.m2);R(g,x-1,26,3,1,L.m3);X(g,x,25,P.r2);}
 for(let i=0;i<5;i++){const x=206+i*28;R(g,x,38,24,1,L.m3);R(g,x-1,39,24,4,noite?'#1a2650':'#3a5a9a');for(let k=x+1;k<x+22;k+=4)R(g,k,39,1,4,noite?'#28345e':'#7aa2d8');R(g,x+10,43,2,4,L.m1);}
 for(const px of [342,402,420]){R(g,px,43,6,4,L.mad);R(g,px,43,6,1,L.mad2);X(g,px+1,40,P.g1);X(g,px+3,38,P.g2);X(g,px+4,40,P.g1);R(g,px+2,39,1,4,P.g1);}

 /* EMPRESA (cafeteira, mesa de reunião, quadro da Bússola) */
 {const A=AND.empresa,ch=A.chao;
  mesinha(g,L,72,ch);
  R(g,128,ch-10,66,1,L.mesaT);R(g,128,ch-9,66,2,L.mesa);R(g,132,ch-7,2,6,L.m1);R(g,188,ch-7,2,6,L.m1);
  for(const cx of [136,156,176]){R(g,cx,ch-15,8,1,L.m2);R(g,cx,ch-14,1,6,L.m2);R(g,cx,ch-9,8,1,L.m2);R(g,cx+1,ch-8,1,7,L.m1);}
  {const bx=212,by=ch-26;R(g,bx+3,by+18,1,8,L.m1);R(g,bx+37,by+18,1,8,L.m1);R(g,bx,by,42,18,L.mad);R(g,bx+1,by+1,40,16,'#1e3a2c');
   {R(g,bx+4,by+10,26,5,P.ink);for(let i=0;i<6;i++)R(g,bx+5+i*4,by+5,3,1,P.n7);R(g,bx+5,by+3,10,1,P.n8);}
   const cx=bx+33,cy=by+6;for(let a=0;a<16;a++){X(g,cx+Math.round(Math.cos(a/16*6.283)*3.4),cy+Math.round(Math.sin(a/16*6.283)*3.4),P.n8);}X(g,cx,cy-2,P.r3);X(g,cx,cy-1,P.r3);X(g,cx,cy+1,P.n7);X(g,cx,cy+2,P.n7);}
  {const x=316;R(g,x-6,ch-10,40,1,L.mesaT);R(g,x-6,ch-9,40,9,L.m2);R(g,x-6,ch-9,40,1,L.m3);
   R(g,x+12,ch-22,14,12,L.m1);R(g,x+12,ch-22,14,1,L.m3);R(g,x+14,ch-20,10,3,P.n1);X(g,x+15,ch-19,P.a2);R(g,x+16,ch-15,6,4,P.n1);R(g,x+17,ch-13,4,2,P.n7);
   R(g,x,ch-14,3,4,P.n7);R(g,x+4,ch-14,3,4,P.c2);}
  {const x=394;R(g,x,ch-20,10,20,L.m2);R(g,x,ch-20,10,1,L.m3);R(g,x+2,ch-28,6,8,'#5aa0d8');R(g,x+2,ch-28,6,1,P.b3);R(g,x+3,ch-12,4,2,L.m1);}
  {const px=418;R(g,px,ch-8,10,8,L.mad);R(g,px,ch-8,10,1,L.mad2);for(const [lx,ly] of [[419,-16],[422,-18],[425,-15],[421,-13],[426,-12]])R(g,lx,ch+ly,2,7,P.g1);X(g,423,ch-18,P.g2);X(g,420,ch-16,P.g2);}
 }
 /* ESTÚDIOS: Sites, Estudos, Identidade, VSL (paredes entre as salas) */
 {const A=AND.estudios,ch=A.chao;
  for(const x of [122,202,280]){R(g,x,A.topo,2,A.chao-A.topo,L.ext);X(g,x,A.topo+3,L.extHi);R(g,x,A.topo+3,1,A.chao-A.topo-3,L.extHi);}
  // Sites: tela grande com um site desenhado
  {const x=52;R(g,x,ch-26,30,18,L.m1);R(g,x+1,ch-25,28,16,noite?'#141b30':'#dfe6f2');const b=noite?'#24304e':'#3a78d8',b2=noite?'#1d2640':'#9cb8e0';
   R(g,x+3,ch-23,24,2,b);R(g,x+3,ch-19,11,6,b2);R(g,x+16,ch-19,11,2,b);R(g,x+16,ch-16,8,1,b2);R(g,x+3,ch-12,24,1,b2);R(g,x+14,ch-8,2,7,L.m1);R(g,x+9,ch-2,12,1,L.m2);}
  poltrona(g,L,102,ch);
  // Estudos: estante e mesinha
  {const x=128;R(g,x,ch-26,34,26,L.mad);for(const y of [ch-25,ch-17,ch-9]){R(g,x+1,y,32,7,'#2a1a14');const rr=rng(y*7);let k=x+2;while(k<x+31){const w=1+(rr()*2|0),h=5+(rr()*2|0);R(g,k,y+7-h,w,h,[P.r2,P.b2,P.g2,P.a2,P.v2,P.n7][rr()*6|0]);k+=w+(rr()<.2?1:0);}}}
  mesinha(g,L,176,ch);
  // Identidade: cavalete com um logo em cores
  {const x=210;R(g,x+3,ch-20,1,20,L.mad);R(g,x+19,ch-20,1,20,L.mad);R(g,x+11,ch-24,1,24,L.mad2);R(g,x,ch-26,23,16,P.n8);R(g,x,ch-26,23,1,L.m3);
   for(let y=0;y<10;y++)for(let xx=0;xx<10;xx++){const d=Math.hypot(xx-4.5,y-4.5);if(d<4.8&&d>2.2)X(g,x+6+xx,ch-23+y,xx<5?P.p2:P.a2);}R(g,x+10,ch-21,3,6,P.c2);
   R(g,x+26,ch-4,8,4,L.m2);X(g,x+27,ch-5,P.r2);X(g,x+29,ch-5,P.b2);X(g,x+31,ch-5,P.g2);}
  pufe(g,262,ch,P.v2,P.v1);
  // VSL: câmera no tripé e a luz de estúdio
  {const x=290;R(g,x+3,ch-14,1,14,L.m1);R(g,x,ch-2,8,1,L.m1);X(g,x+1,ch-3,L.m1);X(g,x+6,ch-3,L.m1);R(g,x-1,ch-20,10,6,L.m1);R(g,x+8,ch-19,3,4,L.m2);X(g,x+9,ch-18,noite?P.r1:P.r2);
   R(g,x+16,ch-24,12,9,L.m3);R(g,x+17,ch-23,10,7,noite?'#3a3a5a':'#fff6dc');R(g,x+21,ch-15,1,15,L.m1);R(g,x+18,ch-1,8,1,L.m1);}
  poltrona(g,L,324,ch);poltrona(g,L,346,ch);
  // lado direito: sofazinho de espera
  {const x=392;R(g,x,ch-10,36,6,L.m2);R(g,x,ch-10,36,1,L.m3);R(g,x-2,ch-14,4,14,L.m2);R(g,x+34,ch-14,4,14,L.m2);R(g,x,ch-4,36,2,L.m1);}
 }
 /* MEZANINO: beliches, sofá, pufes, sacos de dormir, rede */
 {const A=AND.mezanino,ch=A.chao;
  for(const x of [48,82,116]){R(g,x,ch-24,2,24,L.m2);R(g,x+28,ch-24,2,24,L.m2);X(g,x,ch-24,L.m3);X(g,x+28,ch-24,L.m3);for(const y of [ch-15,ch-2]){R(g,x,y,30,2,L.mad2);R(g,x,y,30,1,L.mad);}R(g,x+2,ch-24,26,1,L.m2);}
  {const x=150;R(g,x,ch-20,50,12,P.v1);R(g,x,ch-20,50,1,P.v2);R(g,x-2,ch-14,4,12,P.v1);R(g,x+48,ch-14,4,12,P.v1);R(g,x,ch-8,50,5,P.v1);R(g,x,ch-8,50,1,P.v2);R(g,x,ch-3,50,1,P.n1);R(g,x+1,ch-2,2,2,P.n1);R(g,x+47,ch-2,2,2,P.n1);}
  for(const bx of [206,226,246,266])pufe(g,bx+9,ch,[P.b2,P.g2,P.a2,P.p2][(bx/20|0)%4],[P.b1,P.g1,P.a1,P.p1][(bx/20|0)%4]);
  R(g,288,ch-1,72,1,P.p1);dith(g,288,ch-2,72,1,P.p1,.5);
  R(g,388,ch-24,2,24,L.m2);R(g,430,ch-24,2,24,L.m2);
 }
 /* TÉRREO: as 5 mesas (como na v1) e o canto das pendências */
 {const A=AND.terreo,ch=A.chao,o=ch-200;
  {const rr=rng(77);for(let i=0;i<50;i++){const x=44+rr()*312|0;dith(g,x,ch,1+(rr()*2|0),3,[P.p1,P.c1,P.v1][rr()*3|0],.5);}}
  for(const d of DESKS){const cx=d.x,tn=TONE[d.k];
   if(noite){dith(g,cx-16,160+o,36,30,tn[0],.25);dith(g,cx-12,165+o,28,24,tn[0],.5);dith(g,cx-26,ch-1,52,1,tn[1],.5);}
   else{dith(g,cx-12,166+o,28,22,tn[0],.12);}
   R(g,cx-24,180+o,2,14,L.m2);X(g,cx-24,180+o,L.m3);R(g,cx-24,192+o,12,2,L.m2);R(g,cx-24,192+o,12,1,L.m3);R(g,cx-19,194+o,2,4,L.m1);R(g,cx-24,198+o,12,1,L.m1);
   R(g,cx-15,189+o,37,1,L.mesaT);R(g,cx-15,190+o,37,2,L.mesa);R(g,cx-14,192+o,2,8,L.m1);R(g,cx+19,192+o,2,8,L.m1);
   R(g,cx+8,192+o,9,8,L.m1);R(g,cx+8,192+o,9,1,L.m2);X(g,cx+10,194+o,tn[2]);R(g,cx+10,197+o,5,1,L.m2);
   R(g,cx-8,170+o,21,16,P.n2);R(g,cx-8,170+o,21,1,P.n4);R(g,cx+2,186+o,2,3,L.m2);R(g,cx-1,188+o,8,1,L.m3);
   R(g,cx-15,189+o,37,1,noite?tn[1]:L.mesaT);if(noite)dith(g,cx-15,189+o,37,1,P.n6,.5);
   R(g,cx+15,185+o,3,4,P.n7);X(g,cx+18,186+o,P.n7);X(g,cx+15,185+o,P.n8);}
  {const x=46;R(g,x,ch-9,8,9,L.mad);R(g,x,ch-9,8,1,L.mad2);for(const [lx,ly] of [[47,-20],[50,-23],[53,-19],[48,-16],[52,-15]])R(g,lx,ch+ly,2,9,P.g1);X(g,51,ch-23,P.g2);X(g,47,ch-20,P.g2);X(g,54,ch-19,P.g2);}
  {const x=386;R(g,x,ch-26,4,6,L.m1);X(g,x+1,ch-25,P.g3);X(g,x+2,ch-23,P.a3);}
 }
 /* noite: os andares de quem dorme ficam mais escuros, com luar no chão */
 if(noite){g.globalCompositeOperation='source-atop';
  g.globalAlpha=.34;for(const id of ['empresa','estudios','mezanino']){const A=AND[id];R(g,44,A.topo,318,A.chao-A.topo,'#07060e');R(g,384,A.topo,52,A.chao-A.topo,'#07060e');}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  for(const id of ['empresa','estudios','mezanino']){const A=AND[id];for(const x0 of [66,180,300]){for(let k=0;k<14;k++)dith(g,x0+k*1.4,A.chao-1,6,1,P.n4,.5);}}
  for(const [x,y] of [[118,AND.mezanino.chao-6],[230,AND.estudios.chao-6]]){dith(g,x-3,y-3,7,7,P.a1,.35);X(g,x,y,P.a2);}}
 return c;}
function mesinha(g,L,dx,ch){R(g,dx,ch-11,22,1,L.m3);R(g,dx,ch-10,22,2,L.m2);R(g,dx+1,ch-8,2,8,L.m2);R(g,dx+19,ch-8,2,8,L.m2);R(g,dx+8,ch-22,13,10,L.m1);R(g,dx+9,ch-21,11,8,L.tela);X(g,dx+10,ch-20,L.m2);R(g,dx+13,ch-12,3,1,L.m2);
 R(g,dx-8,ch-14,2,14,L.m2);R(g,dx-8,ch-6,10,2,L.m2);}
function poltrona(g,L,x,ch){R(g,x-8,ch-14,16,4,P.b1);R(g,x-8,ch-14,16,1,P.b2);R(g,x-10,ch-10,4,9,P.b1);R(g,x+6,ch-10,4,9,P.b1);R(g,x-10,ch-10,4,1,P.b2);R(g,x+6,ch-10,4,1,P.b2);R(g,x-7,ch-6,14,4,P.b1);R(g,x-7,ch-6,14,1,P.b2);R(g,x-8,ch-2,2,2,P.n1);R(g,x+6,ch-2,2,2,P.n1);}
function pufe(g,cx,ch,c1,c0){for(let y=0;y<8;y++)for(let x=0;x<18;x++){const e=((x-8.5)/9)**2+((y-8)/8)**2;if(e<1)X(g,cx-9+x,ch-8+y,y<2?c1:c0);}}
const INT={noite:pintaInterior(LN,true),dia:pintaInterior(LDIA,false)};

/* raios do sol entrando pelos vidros (amanhecer pela direita, entardecer pela esquerda) */
function pintaRaios(dir,cor){const [c,g]=mk(WW,WH);const s=dir>0?1:-1;
 for(const A of ANDARES){for(let y=A.topo+3;y<A.chao;y++)for(let x=44;x<436;x++){if(x>=POCO.x0&&x<POCO.x1)continue;
   const u=(s*x*.36+y*.93);const f=((u%38)+38)%38;let d=0;if(f<10)d=Math.min(1,Math.sin(f/10*Math.PI)*1.6);
   const dist=s>0?(436-x)/392:(x-44)/392;d*=1-dist*.6;if(d>.05){g.globalAlpha=Math.round(d*4)/4*.9;X(g,x,y,cor);}}}
 g.globalAlpha=1;
 return c;}
const RAIOS={amanhecer:pintaRaios(1,'#ffd890'),entardecer:pintaRaios(-1,'#ff9e64'),dia:pintaRaios(1,'#ffffff')};
function noRaio(x,y,s){const u=(s*x*.36+y*.93);const f=((u%38)+38)%38;return f>1&&f<8;}
const POEIRA=[];{const rr=rng(61);for(let i=0;i<90;i++){const A=ANDARES[rr()*4|0];POEIRA.push({x:46+rr()*388,y:A.topo+4+rr()*(A.chao-A.topo-8),a:A,ph:rr()*20,v:.4+rr()*.6});}}

/* ===== quem dorme (pintado uma vez) ===== */
const ZS=[];const [slC,slg]=mk(WW,WH);let REDE=null;
(function(){const rr=rng(99);const pick=()=>({h:(rr()*HAIR.length)|0,s:(rr()*3)|0,t:(rr()*SHIRT.length)|0,p:(rr()*4)|0});
 const cmD=()=>{const a=pick();const cm=cmap(a.h,a.s,a.t,a.p,true);cm.W=P.n6;return cm;};
 const lie=(x,y)=>{const s=build([{r:LIE}],cmD(),false);slg.drawImage(s,x-4,y-7);ZS.push([x+3,y-8,rr()*9]);};
 const sitF=(x,y,tilt)=>{const s=build([{r:F_SIT,y:8},{r:sleepy(HEAD_F),x:tilt,y:1}],cmD(),false);slg.drawImage(s,x-10,y-17);ZS.push([x+tilt*2+2,y-17,rr()*9]);};
 const desk=(x,ch)=>{const s=build([{r:SIT_D,y:8},{r:sleepy(HEAD_R),x:2,y:3}],cmD(),false);slg.drawImage(s,x-11,ch-20);ZS.push([x+4,ch-19,rr()*9]);};
 const M=AND.mezanino.chao;
 for(const bx of [48,82,116])for(const y of [M-15,M-2])lie(bx+5,y);
 sitF(159,M-4,-1);sitF(170,M-4,1);sitF(181,M-4,-1);sitF(192,M-4,1);
 for(const bx of [206,226,246,266])sitF(bx+9,M-2,(bx/20|0)%2?1:-1);
 for(const x of [292,316,340]){const cm=cmD();cm.T=[P.g1,P.b1,P.r1][x%3];cm.t=P.n1;const s=build([{r:LIE}],cm,false);slg.drawImage(s,x-4,M-8);ZS.push([x+3,M-9,rr()*9]);}
 REDE=build([{r:LIE}],cmD(),false);ZS.push([400,M-17,rr()*9,1]);
 const E=AND.empresa.chao,S=AND.estudios.chao;
 desk(72,E);desk(176,S);
 sitF(102,S-4,1);sitF(324,S-4,-1);sitF(346,S-4,1);sitF(262,S-2,-1);
})();

/* ===== quem trabalha, quem anda, quem espera ===== */
const WORK=DESKS.map((d,i)=>{const cm=cmap(d.hair,d.skin,d.shirt,d.pants,false);
  return {d,A:build([{r:HEAD_R},{r:SIT_A,y:8}],cm,false),B:build([{r:HEAD_R},{r:SIT_B,y:8}],cm,false),L:build([{r:HEAD_R},{r:SIT_A,y:8}],cm,true),seed:i*1.7};});
const WALK=[{set:walkSet(cmap(6,0,6,1,false)),y:AND.terreo.chao,path:[['w',58,350],['i',350,3],['w',350,58],['i',58,4]],ph:6},
 {set:walkSet(cmap(2,1,8,0,false)),y:AND.empresa.chao,path:[['w',110,300],['i',300,5],['w',300,110],['i',110,3]],ph:2}];
WALK.forEach(w=>{let T=0;w.seg=w.path.map(s=>{const d=s[0]==='w'?Math.abs(s[2]-s[1])/8:s[2];const o={s,t0:T,d};T+=d;return o;});w.T=T;});
const JUMP=[{x:398,ph:0,cm:cmap(7,1,7,0,false)},{x:424,ph:.45,cm:cmap(8,0,5,3,false)}];
JUMP.forEach(j=>{j.st=build([{r:HEAD_F},{r:F_T,y:8}],j.cm,false);j.up=build([{r:HEAD_F},{r:F_UP,y:8}],j.cm,false);});
function glyph(rows,col,oc){const [c,g]=mk(rows[0].length+2,rows.length+2);rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]!=='.')X(g,x+1,y+1,r[x]==='w'?P.n8:col);});return oc?outline(c,oc):c;}
const BANG=glyph(["rrrrrrr","rrrwrrr","rrrwrrr","rrrwrrr","rrrrrrr","rrrwrrr","rrrrrrr","..rr...","..r...."],P.r2,P.ink);
const QM=glyph([".###.","#...#","....#","..##.","..#..",".....","..#.."],P.a3,P.ink);
function zGlyph(big,col){return glyph(big?["####","...#","..#.",".#..","####"]:["###","..#",".#.","###"],col,null);}
const ZC={};for(const b of [0,1])for(const c of ['n7','n6','n5'])ZC[b+c]=zGlyph(b,P[c]);

/* ===== voz ===== */
const SIM=Q.get('falando')==='1'?'falando':Q.get('estado');
const voz={estado:'dormindo',nivel:0,frase:'',sobre:null,id:null,sint:false};let nivS=0;const HIST=new Array(100).fill(0);
/* tipos de cena que o próprio andar conta (o facho na sala e a caixa de diálogo); os outros (clima, notícias,
   música, agenda...) abrem a janela de pixel art do cenas.js por cima, como na tv5 */
const NO_ANDAR={trabalho:1,pronto:1,erro:1,saudacao:1,hora:1,generico:1};
function primeiraFrase(s){s=String(s||'').replace(/\s+/g,' ').trim();const m=/^(.{12,80}?[.!?])(\s|$)/.exec(s);return m?m[1]:s.slice(0,80);}
function ouvir(v,agoraS){if(SIM)return;v=v||{};const c=v.cena&&v.cena.id!=null?v.cena:null;
 const noPrazo=!!(c&&c.ate&&agoraS<c.ate),pcFala=v.estado==='falando';
 const mundo=!!(c&&NO_ANDAR[c.tipo]!==1);  /* cena do mundo: quem conta é a janela do cenas.js; o andar fica quieto atrás */
 voz.estado=(pcFala||noPrazo)&&!mundo?'falando':(v.estado==='ouvindo'||v.estado==='pensando'?v.estado:'dormindo');
 voz.sint=!pcFala&&noPrazo;if(!voz.sint)voz.nivel=+v.nivel||0;
 if(c){voz.id='c'+c.id;voz.sobre=String(c.termo||'');let f=String(c.texto_pt||c.frase_pt||'').trim();
   if(!f&&v.legenda)f=primeiraFrase(v.legenda);if(!f&&window.Cenas&&Cenas.falaPT)try{f=Cenas.falaPT(c)||'';}catch(e){}voz.frase=f.slice(0,600);}
 else if(voz.estado==='falando'){if(voz.id===null||voz.id[0]==='c'){voz.id='v'+Date.now();voz.sobre='';}if(v.legenda)voz.frase=primeiraFrase(v.legenda);}
 else{voz.id=null;}}
function cenaNoAndar(c){return !c||NO_ANDAR[c.tipo]===1;}

/* ===== do que ele fala: cada assunto tem uma sala ===== */
const SALAS=[];
DESKS.forEach((d,i)=>SALAS.push({chave:[],andar:'terreo',x0:d.x-31,x1:d.x+31,tag:i,alvo:d.x}));
/* sem assunto que caiba numa sala: o facho desce na cobertura, no núcleo dele */
const COBERTURA={chave:[],andar:'cobertura',x0:338,x1:406,alvo:372,topo:22,chao:50};
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
 const s=salaDe(txt);if(s&&s.el==='pend')return `${PEND} pendências esperando você, senhor.`;return 'Tudo em ordem no Andar 47, senhor.';}

/* ===== Jarvis: o robô-mordomo ===== */
const ROTA=[['ir',353],['servir',2.6],['ir',291],['servir',2.6],['ir',229],['servir',2.6],['ir',167],['servir',2.6],['ir',105],['servir',3],
 ['ir',POCO.cx],['subir','mezanino'],['ir',236],['olhar',3.4],['ir',POCO.cx],['subir','estudios'],['ir',242],['olhar',3],['ir',POCO.cx],
 ['subir','empresa'],['ir',340],['cafe',3.6],['ir',POCO.cx],['subir','terreo']];
const JV={andar:'terreo',x:POCO.cx,y:AND.terreo.chao,i:0,esp:0,dir:-1,face:-1,front:0,spin:0,carry:1,carro:AND.terreo.chao,ocupado:''};
const [jvC,jvg]=mk(28,28,1);
function drawJarvis(t,e,lv){const g=jvg;g.clearRect(0,0,28,28);const f=JV.front>.5?0:JV.face;
 const wx=13;R(g,wx-2,23,6,1,P.n5);R(g,wx-3,24,8,2,P.n4);R(g,wx-2,26,6,1,P.n3);const sp=((JV.spin|0)%4+4)%4;X(g,wx-2+[1,3,4,2][sp],24+[0,0,1,1][sp],P.n7);
 R(g,wx,21,2,2,P.n5);
 R(g,9,15,10,6,P.n2);R(g,9,15,10,1,P.n3);R(g,13,15,2,5,P.n8);X(g,13,17,P.n5);X(g,13,19,P.n5);
 R(g,11,15,6,1,P.r2);X(g,13,15,P.r3);X(g,14,15,P.r3);X(g,11,16,P.r2);X(g,16,16,P.r2);
 if(f===1){R(g,8,18,1,4,P.n2);}else if(f===-1){R(g,19,18,1,4,P.n2);}
 if(f===0){R(g,8,16,1,4,P.n2);X(g,8,20,P.n8);R(g,19,16,1,3,P.n2);R(g,19,18,4,1,P.n2);R(g,21,17,5,1,P.n7);if(JV.carry){R(g,22,14,3,3,P.n8);X(g,22,14,P.a2);X(g,23,14,P.a2);}}
 else{R(g,f===1?18:9,17,1,2,P.n2);R(g,f===1?19:5,18,4,1,P.n2);X(g,f===1?23:4,18,P.n8);
   const tx=f===1?19:3;R(g,tx,17,6,1,P.n7);if(JV.carry){R(g,tx+1,14,3,3,P.n8);R(g,tx+1,14,3,1,P.a2);X(g,f===1?tx+4:tx,15,P.n8);
   const st=(t*1.2)%3;if(e==='dormindo')X(g,tx+2+((st|0)%2),12-(st|0),P.n5);}}
 R(g,13,14,2,1,P.n5);
 R(g,6,4,16,10,P.n5);R(g,6,4,16,1,P.n6);R(g,6,13,16,1,P.n4);R(g,21,4,1,10,P.n4);R(g,6,4,1,10,P.n6);
 R(g,8,6,11,6,P.n1);for(let y=6;y<12;y+=2)R(g,8,y,11,1,'#101a2c');X(g,8,6,P.n4);
 X(g,20,6,P.n7);R(g,20,9,1,3,P.n3);
 R(g,13,2,1,2,P.n6);R(g,12,1,3,1,P.c2);X(g,13,0,P.c3);
 const sx=8,sy=6;
 if(e==='falando'){R(g,sx+2,sy,2,2,P.c3);R(g,sx+7,sy,2,2,P.c3);const amp=.5+lv*1.6;let py=null;for(let i=0;i<11;i++){const y=Math.round(sy+4+Math.sin(i*1.1-t*9)*amp*Math.sin(i/10*Math.PI+.2));
   if(py!==null){for(let k=Math.min(py,y);k<=Math.max(py,y);k++)X(g,sx+i,k,P.c2);}X(g,sx+i,y,P.c3);py=y;}}
 else if(e==='ouvindo'){R(g,sx+2,sy+1,2,3,P.c3);R(g,sx+7,sy+1,2,3,P.c3);R(g,sx+4,sy+5,3,1,P.c2);}
 else if(e==='pensando'){X(g,sx+6,sy+1,P.c3);X(g,sx+9,sy+1,P.c3);X(g,sx+7,sy,P.c2);R(g,sx+3,sy+4,4,1,P.c2);}
 else{const o=f===-1?-2:f===1?2:0;R(g,sx+2+o,sy+2,2,2,P.c3);R(g,sx+7+o,sy+2,2,2,P.c3);R(g,sx+3+o,sy+5,5,1,P.c2);X(g,sx+2+o,sy+4,P.c2);X(g,sx+8+o,sy+4,P.c2);}
 outline(jvC,P.ink);}
function hourglass(t){const per=5,ph=(t%per)/per,flip=Math.floor(t/per)%2;const [c,g]=mk(9,11);
 R(g,0,0,9,1,P.n7);R(g,0,10,9,1,P.n7);for(let y=1;y<10;y++){const w=y<5?4-y+1:y-5+1;X(g,4-w,y,P.n6);X(g,4+w,y,P.n6);}
 const top=Math.round((1-ph)*3),bot=Math.round(ph*3);
 for(let k=0;k<top;k++){const y=4-k;const w=4-y;R(g,4-w+1,y,2*w-1,1,P.a3);}
 for(let k=0;k<bot;k++){const y=9-k;const w=y-5;R(g,4-w+1,y,2*w-1,1,P.a2);}
 if(ph<.95)X(g,4,5+((t*6|0)%4),P.a3);
 outline(c,P.ink);const [c2,g2]=mk(11,13);if(flip){g2.translate(0,13);g2.scale(1,-1);}g2.drawImage(c,0,0);return c2;}
function passoJarvis(dt,e){
 if(e!=='dormindo'){JV.front=lerp(JV.front,1,.15);return;}
 JV.front=lerp(JV.front,0,.2);
 const [tipo,arg]=ROTA[JV.i];const prox=()=>{JV.i=(JV.i+1)%ROTA.length;JV.esp=0;};
 if(tipo==='ir'){const dx=arg-JV.x;const st=Math.sign(dx)*Math.min(Math.abs(dx),13*dt);JV.x+=st;JV.spin+=st*.5;if(Math.abs(dx)>.3)JV.face=dx>0?1:-1;else{JV.x=arg;prox();}JV.ocupado=JV.x>POCO.x0-2&&JV.x<POCO.x1+2?'elevador':'';}
 else if(tipo==='subir'){const alvo=AND[arg].chao;const dy=alvo-JV.y;const st=Math.sign(dy)*Math.min(Math.abs(dy),15*dt);JV.y+=st;JV.carro=JV.y;JV.ocupado='subindo';if(Math.abs(dy)<.3){JV.y=alvo;JV.carro=alvo;JV.andar=arg;prox();}}
 else{JV.esp+=dt;JV.face=tipo==='cafe'?1:-1;JV.ocupado=tipo;if(tipo==='cafe'&&JV.esp>1.5)JV.carry=1;if(tipo==='servir'&&JV.i===8&&JV.esp>2)JV.carry=0;if(JV.esp>=arg)prox();}}

/* ===== cabos: a luz dele corre do núcleo até onde ele está (ou até a sala de que ele fala) ===== */
function caminho(andarId,x){const A=AND[andarId];const yc=A.topo+3;const pts=[[NUCLEO.x,NUCLEO.y+2],[NUCLEO.x,50],[TRONCO,50],[TRONCO,yc]];
 if(Math.abs(x-TRONCO)>2)pts.push([x,yc]);
 let L=0;const seg=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const l=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);seg.push({a,b,l,L0:L});L+=l;}return {seg,L};}
function ponto(cm,s){for(const q of cm.seg){if(s<=q.L0+q.l){const k=(s-q.L0)/q.l;return [Math.round(lerp(q.a[0],q.b[0],k)),Math.round(lerp(q.a[1],q.b[1],k))];}}const u=cm.seg[cm.seg.length-1];return u.b;}
const PULSOS=[];let proxPulso=1;
function desenhaCabo(cm,cor){for(const q of cm.seg){const x0=Math.min(q.a[0],q.b[0]),y0=Math.min(q.a[1],q.b[1]);R(G,x0,y0,Math.abs(q.b[0]-q.a[0])+1,Math.abs(q.b[1]-q.a[1])+1,cor);}}
function desenhaPulsos(dt){for(let i=PULSOS.length-1;i>=0;i--){const p=PULSOS[i];p.s+=p.v*dt*(p.rev?-1:1);
  if((!p.rev&&p.s>p.cm.L+p.cauda)||(p.rev&&p.s<-p.cauda)){PULSOS.splice(i,1);continue;}
  for(let k=p.cauda;k>=0;k--){const ss=p.rev?p.s+k:p.s-k;if(ss<0||ss>p.cm.L)continue;const [x,y]=ponto(p.cm,ss);const f=k/p.cauda;X(G,x,y,f<.15?P.n8:f<.45?P.c3:f<.75?P.c2:P.c1);if(p.grosso&&f<.5){X(G,x+1,y,P.c2);X(G,x,y+1,P.c2);}}}}

/* ===== retrato e onda do diálogo ===== */
const por=document.getElementById('a6-por'),pg=por.getContext('2d');pg.imageSmoothingEnabled=false;
function drawPortrait(t,lv){const g=pg;R(g,0,0,40,40,P.ink);dith(g,0,0,40,40,P.n2,.25);
 R(g,19,1,2,4,P.n6);R(g,17,0,6,1,P.c2);R(g,19,0,2,1,P.c3);
 R(g,3,5,34,26,P.n5);R(g,3,5,34,2,P.n6);R(g,3,29,34,2,P.n4);R(g,35,5,2,26,P.n4);R(g,3,5,2,26,P.n6);
 R(g,6,8,26,19,P.n1);for(let y=8;y<27;y+=2)R(g,6,y,26,1,'#101a2c');R(g,6,8,3,1,P.n4);R(g,6,8,1,3,P.n4);
 X(g,34,9,P.n7);X(g,34,10,P.n7);R(g,34,15,1,8,P.n3);
 R(g,11,11,4,4,P.c3);R(g,25,11,4,4,P.c3);X(g,11,11,P.n8);X(g,25,11,P.n8);
 const amp=.8+lv*4.2;let py=null;for(let i=0;i<24;i++){const y=Math.round(21+Math.sin(i*.55-t*9)*amp*Math.sin(i/23*Math.PI));
   if(py!==null)for(let k=Math.min(py,y);k<=Math.max(py,y);k++)R(g,7+i,k,1,1,P.c2);R(g,7+i,y,1,1,P.c3);py=y;}
 R(g,6,33,28,7,P.n2);R(g,6,33,28,1,P.n3);for(let y=0;y<7;y++){const w=Math.max(1,3-Math.floor(y/2));R(g,20-w,33+y,w*2,1,P.n8);}
 R(g,14,32,5,3,P.r2);R(g,21,32,5,3,P.r2);R(g,19,32,2,3,P.r3);X(g,14,32,P.r3);X(g,25,32,P.r3);R(g,17,31,6,1,P.n4);}
const wav=document.getElementById('a6-wav'),wg=wav.getContext('2d');wg.imageSmoothingEnabled=false;
function drawWave(){wg.clearRect(0,0,395,6);for(let i=0;i<132;i++){const v=HIST[Math.floor(i*100/132)];const h=Math.max(1,Math.round(v*3));R(wg,i*3,3-h,2,h*2,i>112?P.c3:P.c2);}}

/* ===== HUD ===== */
const $=id=>document.getElementById('a6-'+id);
const fmtK=n=>typeof n!=='number'||!isFinite(n)?'–':n>=1000?(n>=10000?Math.round(n/1000)+' MIL':(Math.round(n/100)/10).toString().replace('.',',')+' MIL'):String(n);
ANDARES.forEach(A=>{const el=document.createElement('div');el.className='andar o';const cy=(A.topo+A.chao)/2*4;el.style.top=(cy-20)+'px';el.textContent=A.nome;$('andares').appendChild(el);});
const salaEls={};
function placa(id,x,y,html,k){const el=document.createElement('div');el.className='sala';el.style.left=x+'px';el.style.top=y+'px';if(k)el.style.setProperty('--k',`var(--${k}2)`);el.innerHTML='<div class="pin"></div>'+html;$('salas').appendChild(el);salaEls[id]=el;return el;}
const BC={a:['--a2','--a3'],p:['--p2','--p3'],c:['--c2','--c3'],b:['--b2','--b3'],g:['--g2','--g3']};
function icon(rows,map,sc){const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const g=c.getContext('2d');rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(map[r[x]])X(g,x,y,map[r[x]]);});c.style.width=c.width*sc+'px';c.style.height=c.height*sc+'px';return c;}
const CART=["..kkkkkkkkkk..",".kccccccccccck","kcwwwwwwwwwwck","kcwppppppppwck","kcwpwwwwwwpwck","kcwpwwkwwwpwck","kcwpwwkkwwpwck","kcwpwwkwwwpwck","kcwpwwwwwwpwck","kcwppppppppwck","kcwwwwwwwwwwck","kcccccccccccck","kcckkkkkkkkcck","kcck.k.k.k.cck","kkkk.k.k.k.kkk"];
/* placas dos andares de cima: montadas uma vez, o texto muda com o dado */
placa('empresa',(44+6)*4,(AND.empresa.topo+5)*4,'','a');
ESTUDIOS.forEach(s=>placa(s.id,(s.x0+4)*4,(AND.estudios.topo+5)*4,s.nome,s.k));
placa('mezanino',(44+6)*4,(AND.mezanino.topo+5)*4,'','n');
const tagEls=[];
DESKS.forEach((d,i)=>{const el=document.createElement('div');el.className='tag';el.hidden=true;const c=BC[d.k];el.style.left=(d.x*4-118)+'px';el.style.setProperty('--k',`var(${c[1]})`);$('tags').appendChild(el);tagEls.push(el);});
const escH=s=>String(s==null?'':s).replace(/TERMMINAL/g,'TERMINAL').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>typeof v==='number'&&isFinite(v);
const TRAB_ATIVO=t=>t&&t.estado!=='parado';
/* nome curto de trabalho pra placa (o resto corta com reticências) */
function curtoT(n){n=String(n||'').replace(/\s*\([^)]*\)/g,'').replace(/Bussola/g,'Bússola').trim();if(n.length>17&&n.includes(' · ')){const p=n.split(' · ');n=p[p.length-1].length>=4?p[p.length-1]:p[0];}return n.replace(/^\S/,m=>m.toUpperCase());}
function nomeMesa(n){return String(n||'').replace(/TERMMINAL/g,'TERMINAL').replace(/^DAL MORO /i,'').toUpperCase();}
/* quem senta nas 5 mesas: terminais trabalhando (ou esperando) e, sobrando mesa, quem toca um trabalho rodando
   fora do Maestri (agente, Prumo...). Quem já está sentado fica na mesma mesa. */
function distribuir(){
 const L=D.terminais.lista,agoraS=(opts.agora?opts.agora():Date.now())/1000;
 const quer=[];L.forEach(t=>{if(t&&t.nome&&(t.status==='trabalhando'||t.status==='esperando')&&!quer.includes(t.nome))quer.push(t.nome);});
 const nomes=new Set(L.map(t=>t&&t.nome));
 D.trabalhos.forEach(t=>{if(TRAB_ATIVO(t)&&t.quem&&t.quem!=='Bussola'&&!/bussola/i.test(t.nome||'')&&!nomes.has(t.quem)&&t.passo_desde&&agoraS-t.passo_desde<12*3600&&!quer.includes(t.quem))quer.push(t.quem);});
 const fica=new Set(quer.slice(0,8));
 DESKS.forEach(d=>{if(d.who&&!fica.has(d.who))d.who=null;});
 for(const q of quer){if(DESKS.some(d=>d.who===q))continue;const livre=DESKS.find(d=>!d.who);if(!livre)break;livre.who=q;}
 DESKS.forEach(d=>{d.nm=d.who?nomeMesa(d.who):'';});
 D.foraMesa=Math.max(0,quer.length-DESKS.filter(d=>d.who).length);}
function trabalhosDe(q){return D.trabalhos.filter(t=>t&&t.quem===q&&TRAB_ATIVO(t)).sort((a,b)=>(b.passo_desde||0)-(a.passo_desde||0));}
/* missões: os alertas, curtos; nada de dinheiro nem e-mail */
const PROIBIDO=/R\$|dinheiro|pagamento|fatura|\bpix\b|saldo|cobran|boleto|reais|@[\w-]+\.\w/i;
function curtoA(s){return String(s||'').replace(/\([^)]*\)/g,'').replace(/ALARME:\s*/gi,'').replace(/^Studio\s+/i,'').replace(/^Token vencido:\s*/i,'')
 .replace(/o hor[aá]rio (.+?) passou e n[aã]o subiu/i,'post de $1 não subiu').replace(/a autoriza[cç][aã]o venceu/i,'login venceu').replace(/\s+/g,' ').trim();}
const ultimo={};
function mudou(k,v){const s=JSON.stringify(v);if(ultimo[k]===s)return false;ultimo[k]=s;return true;}
function hudDados(){
 const cs=D.canais.filter(c=>c&&c.nome);
 const c1=cs.find(c=>/youtube/i.test(c.rede||'')&&num(c.numero)&&c.numero>0)||cs[0],c2=cs.find(c=>/instagram/i.test(c.rede||''));
 if(mudou('c1',c1||0)){$('s1').hidden=!c1;if(c1){$('s1n').textContent=c1.nome;$('s1v').textContent=fmtK(c1.numero);}}
 if(mudou('c2',c2||0)){$('s2').hidden=!c2;if(c2){$('s2n').textContent=c2.nome;$('s2v').textContent=fmtK(c2.numero);}}
 const b=D.trabalhos.find(t=>t&&/bussola/i.test(t.nome||''));D.bus=b||null;
 if(mudou('boss',b||0)){$('boss').hidden=!b;if(b){$('bn').innerHTML='<em>MISSÃO LONGA</em>'+escH(String(b.nome).replace(/Bussola/g,'Bússola'));$('be').textContent=String(b.etapa||'').replace(/pregao/g,'pregão');
  const p=num(b.pct)?b.pct:0;$('bb').style.width=`calc((100% - 8px) * ${p/100})`;$('bp').textContent=p+'%';}}
 if(mudou('pend',PEND)){$('pend').hidden=PEND<=0;$('pn').textContent=PEND;$('pw').textContent=PEND===1?'PENDÊNCIA':'PENDÊNCIAS';}
 /* andares de cima: quem está em cada um (o dado diz o andar de cada terminal) */
 const L=D.terminais.lista.filter(t=>t&&t.nome);
 const noAndar=nm=>L.filter(t=>semAc(t.andar)===semAc(nm));
 const emp=noAndar('Empresa');
 const hEmp=emp.length===1?`${escH(emp[0].nome)} <span>· ${emp[0].status==='parado'?'dormindo':'trabalhando'}</span>`:emp.length?`${emp.length} <span>na empresa</span>`:'';
 if(mudou('emp',hEmp)){salaEls.empresa.hidden=!hEmp;salaEls.empresa.innerHTML='<div class="pin"></div>'+hEmp;}
 ESTUDIOS.forEach(s=>{const n=noAndar(s.nome).length;const h=s.nome+(n?` <span>· ${n}</span>`:'');if(mudou('es'+s.id,h))salaEls[s.id].innerHTML='<div class="pin"></div>'+h;});
 const dorm=L.filter(t=>(t.status==='parado'||t.status==='shell')&&(!t.andar||semAc(t.andar)==='terreo'||semAc(t.andar)==='mezanino')).length;
 const hMez=dorm?`<b style="font-weight:400">${dorm}</b> <span>dormindo no mezanino</span>`:'<span>mezanino vazio</span>';
 if(mudou('mez',hMez))salaEls.mezanino.innerHTML='<div class="pin"></div>'+hMez;
 /* placas das 5 mesas: nome, trabalho, barra e %, linha cinza (etapa ou o 2º trabalho) */
 DESKS.forEach((d,i)=>{const el=tagEls[i],c=BC[d.k];let h='';
  if(d.who){const tr=trabalhosDe(d.who);const term=L.find(t=>t.nome===d.who);
   const barra=(t,k)=>`<div class="hp${k?' sm':''}">${k?`<span>${escH(curtoT(t.nome))}</span>`:''}<div class="bar" style="--f:var(${c[0]});--fl:var(${c[1]})"><i style="width:calc((100% - 8px) * ${(num(t.pct)?t.pct:0)/100})"></i></div><b>${num(t.pct)?t.pct:0}%</b></div>`;
   h=`<div class="pin"></div><div class="nm">${escH(d.nm)}</div>`;
   if(!tr.length){const tt=term&&term.titulo?String(term.titulo):'trabalhando';h+=`<div class="tt">${escH(tt)}</div><div class="hp" style="font-size:31px;line-height:30px;color:var(${c[1]})">rodando, sem %</div>`;}
   else{const t0=tr[0],t1=tr.find((t,k)=>k>0&&t.passo_desde&&num(t.pct)&&t.pct>0);h+=`<div class="tt">${escH(curtoT(t0.nome))}</div>`+barra(t0,0);
    h+=t1?barra(t1,1):`<div class="sub">${escH(t0.etapa||'trabalhando')}</div>`;}}
  if(mudou('tag'+i,h)){el.hidden=!h;el.innerHTML=h;el.classList.remove('on');}});
 if(mudou('salaRef',DESKS.map(d=>d.who)))lastSala=undefined;
 /* rodapé */
 const ms=[];if(num(D.pc.quedas_24h)&&D.pc.quedas_24h>0)ms.push([`PC caiu sozinho ${D.pc.quedas_24h}x em 24 h`,'a']);
 D.alertas.forEach(a=>{if(!a||a.visto)return;const t=curtoA(a.titulo);if(!t||PROIBIDO.test(t)||PROIBIDO.test(a.titulo||''))return;if(!ms.some(m=>m[0]===t))ms.push([t,a.nivel==='urgente'?'r':'a']);});
 const mv=ms.length?ms.slice(0,4):[['Nada urgente agora','g']];
 if(mudou('mis',mv)){const ul=$('misl');ul.innerHTML='';$('mis').classList.toggle('um',mv.length===1);
  mv.forEach(([t,k])=>{const li=document.createElement('li');li.appendChild(icon(["kkkkk","kcwck","kcwck","kcckk","kcwck","kkkkk"],{k:P.ink,c:k==='r'?P.r2:k==='g'?P.g2:P.a2,w:P.n8},4));const s=document.createElement('span');s.textContent=t;li.appendChild(s);ul.appendChild(li);});}
 const dk=D.dark||{},it=(Array.isArray(dk.lista)?dk.lista:[]).filter(x=>x&&x.estado==='no ar').slice(0,5);const noAr=num(dk.no_ar_hoje)?dk.no_ar_hoje:it.length;
 if(mudou('itens',[noAr,it])){$('ino').textContent=noAr;const sl=$('slots');sl.innerHTML='';
  if(!it.length){const v=document.createElement('div');v.className='vazio';v.textContent='nenhum no ar ainda';sl.appendChild(v);}
  it.forEach(x=>{const d=document.createElement('div');d.className='slot';const qc=String(x.canal||'').includes('QC');
   d.appendChild(icon(CART,{k:P.ink,c:qc?P.c2:P.p2,w:P.n8,p:qc?P.c1:P.p1},3.5));const sm=document.createElement('small');sm.textContent=String(x.titulo||'').slice(0,6);d.appendChild(sm);sl.appendChild(d);});}
 const p=D.pc||{},disco=(Array.isArray(p.discos)?p.discos:[]).find(x=>x&&x.letra==='C:');
 const pcv=[p.cpu,p.ram_total_gb,p.ram_livre_gb,p.gpu_uso,(D.uso_claude||{}).semana_pct,p.ligado_h,disco&&disco.livre_gb];
 if(mudou('pc',pcv)){const cpu=num(p.cpu)?Math.round(p.cpu):null;$('pce').style.width=`calc((100% - 8px) * ${(cpu||0)/100})`;$('pcv').textContent=cpu==null?'–':cpu+'%';
  const ram=num(p.ram_total_gb)&&num(p.ram_livre_gb)?Math.round(p.ram_total_gb-p.ram_livre_gb)+'/'+Math.round(p.ram_total_gb):'–';
  $('pcl').textContent=(num(p.ligado_h)?'ligado há '+Math.floor(p.ligado_h)+' h':'')+(disco&&num(disco.livre_gb)?' · C: '+Math.round(disco.livre_gb)+' GB':'');
  const cl=(D.uso_claude||{}).semana_pct;
  $('pcr').innerHTML=`<div><span>RAM</span>${ram}</div><div><span>GPU</span>${num(p.gpu_uso)?Math.round(p.gpu_uso)+'%':'–'}</div><div><span>Claude</span>${num(cl)?Math.round(cl)+'%':'–'}</div>`;}}
function aplicarEstado(e){e=e&&typeof e==='object'?e:{};const arr=v=>Array.isArray(v)?v:[];const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 D.pc=ob(e.pc);D.uso_claude=ob(e.uso_claude);D.terminais={lista:arr(ob(e.terminais).lista)};D.trabalhos=arr(e.trabalhos).filter(t=>t&&typeof t==='object');
 D.dark=ob(e.dark);D.canais=arr(e.canais);D.alertas=arr(e.alertas);
 PEND=PEND_Q!=null?+PEND_Q:(num(e.esperando_ele)?e.esperando_ele:0);
 const m=/([+-])(\d\d):?(\d\d)$/.exec(String(e.agora||''));if(m)D.tz=(m[1]==='-'?-1:1)*(+m[2]*60+ +m[3]);
 distribuir();hudDados();}
/* relógio: o de verdade, ou ?hora=HH:MM pra testar (?vel=N acelera) */
const VEL=+(Q.get('vel')||1);const T00=Date.now();
const HQ=Q.get('hora');let BASE=null;if(HQ){const m=HQ.match(/^(\d{1,2})(?::?(\d{2}))?$/);if(m){const d=new Date(Date.now()-180*60000);d.setUTCHours(+m[1],+(m[2]||0),0,0);BASE=d.getTime()+180*60000;}}
/* devolve a hora de parede do PC em campos UTC (getUTCHours...), sem depender do fuso da TV */
function agora(){const ms=BASE!==null?BASE+(Date.now()-T00)*VEL:(VEL!==1?T00+(Date.now()-T00)*VEL:(opts.agora?opts.agora():Date.now()));return new Date(ms+(BASE!==null?-180:D.tz)*60000);}
const DIAS=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],MES=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const astroC=$('astro'),ag=astroC.getContext('2d');let ultMin=-1;
function relogio(d,w){const m=d.getUTCHours()*60+d.getUTCMinutes();if(m===ultMin)return;ultMin=m;
 $('hora').textContent=String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');
 const fase=ORDEM.reduce((a,b)=>w[b]>w[a]?b:a);
 $('data').textContent=DIAS[d.getUTCDay()]+' '+d.getUTCDate()+' '+MES[d.getUTCMonth()]+' · '+{noite:'NOITE',amanhecer:'AMANHECER',dia:'DIA',entardecer:'ENTARDECER'}[fase];
 $('stage').classList.toggle('noite',w.noite>.6);ag.clearRect(0,0,7,7);if(fase==='noite'){for(const [x,y] of [[2,0],[3,0],[1,1],[2,1],[0,2],[1,2],[0,3],[1,3],[0,4],[1,4],[1,5],[2,5],[2,6],[3,6],[4,6],[5,5]])X(ag,x,y,P.n8);}
 else{const c=fase==='dia'?P.a3:'#ff9a50';R(ag,2,1,3,5,c);R(ag,1,2,5,3,c);X(ag,3,3,P.n8);}}

/* ===== palco ===== */
function fit(){const cw=opts.dentro?host.clientWidth:innerWidth,ch=opts.dentro?host.clientHeight:innerHeight;if(!cw||!ch)return;const r=opts.recorte||[0,0,1920,1080];const s=Math.min(cw/r[2],ch/r[3]);$('stage').style.transform=`scale(${s})`;$('stage').style.left=((cw-r[2]*s)/2-r[0]*s)+'px';$('stage').style.top=((ch-r[3]*s)/2-r[1]*s)+'px';}
addEventListener('resize',fit);if(opts.dentro&&window.ResizeObserver)new ResizeObserver(fit).observe(host);fit();

/* ===== máscara do "falando": o prédio escurece, menos a sala do assunto ===== */
const [fxC,fx]=mk(WW,WH);let talkW=0,falaT0=0,falaTxt='',salaAtual=null,falaId=null;
const [fachoC,fachoG]=mk(80,80);
function pintaFacho(w,h){const [c,g]=mk(w,h);for(let y=0;y<h;y++){const k=y/h;const half=Math.round(lerp(5,w/2,k));const cx=w/2;
  g.fillStyle='rgba(150,240,255,'+(.16+k*.1).toFixed(3)+')';g.fillRect(Math.round(cx-half),y,half*2,1);
  g.fillStyle='rgba(190,250,255,'+(.14+k*.1).toFixed(3)+')';g.fillRect(Math.round(cx-half*.66),y,Math.round(half*1.32),1);
  g.fillStyle='rgba(230,255,255,'+(.12+k*.12).toFixed(3)+')';g.fillRect(Math.round(cx-half*.33),y,Math.round(half*.66),1);}
 g.fillStyle='rgba(230,255,255,.5)';g.fillRect(4,h-2,w-8,2);g.fillStyle='rgba(190,250,255,.35)';g.fillRect(1,h-3,w-2,1);return c;}
const FACHOS={};

/* ===== quadro ===== */
let last=0;const T0=performance.now()/1000-(+Q.get('t')||37);
function pathPos(w,t){const tt=((t+w.ph)%w.T+w.T)%w.T;let sg=w.seg[w.seg.length-1];for(const s of w.seg){if(tt<s.t0+s.d){sg=s;break;}}
 const k=(tt-sg.t0)/sg.d,s=sg.s;
 if(s[0]==='w')return {x:lerp(s[1],s[2],k),m:'w',dir:s[2]>s[1]?1:-1,fr:Math.floor(tt*7)%4};
 const prev=w.seg[(w.seg.indexOf(sg)+w.seg.length-1)%w.seg.length].s;return {x:s[1],m:'i',dir:prev[2]>prev[1]?1:-1};}
function camada(nome,x,y,w){for(const f of ORDEM){const a=w[f];if(a<.004)continue;G.globalAlpha=a;G.drawImage(CAMADAS[f][nome],x,y);}G.globalAlpha=1;}
/* desenha em ordem de peso: a fase maior por baixo, a menor por cima com alfa */
function camadaMix(nome,x,y,w){const fs=ORDEM.filter(f=>w[f]>.004).sort((a,b)=>w[b]-w[a]);G.globalAlpha=1;G.drawImage(CAMADAS[fs[0]][nome],x,y);if(fs[1]){G.globalAlpha=w[fs[1]];G.drawImage(CAMADAS[fs[1]][nome],x,y);}G.globalAlpha=1;}

let ativo=false,lentoF=false,raf=0,nQ=0,fpsV=0,fpsT=0;
function frame(now){raf=0;if(!ativo)return;raf=requestAnimationFrame(frame);if(window.__manual||now-last<(lentoF?100:32))return;const dt=Math.min(.1,(now-last)/1000);last=now;
 try{quadro(now/1000-T0,dt);}catch(e){erros++;if(erros<4&&window.console)console.error('andar',e);}
 nQ++;if(!fpsT)fpsT=now;else if(now-fpsT>=5000){fpsV=Math.round(nQ*1000/(now-fpsT));nQ=0;fpsT=now;}}
let erros=0;
function quadro(t,dt){
 const d=agora(),h=d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600,w=pesos(h);relogio(d,w);
 const noite=w.noite,dia=w.dia;
 if(SIM==='falando'||(voz.sint&&voz.estado==='falando')){voz.estado='falando';voz.nivel=clamp(.48+.3*Math.sin(t*6.1)*Math.sin(t*1.7+.6)+.16*Math.sin(t*10.7),0,1);}
 else if(SIM){voz.estado=SIM;voz.nivel=SIM==='ouvindo'?.2:0;}
 const e=voz.estado;nivS=lerp(nivS,voz.nivel,1-Math.pow(.02,dt));HIST.push(e==='falando'?nivS:0);HIST.shift();
 const sway=Math.sin(t*2*Math.PI/150);
 /* céu, astro, nuvens */
 camadaMix('ceu',0,0,w);
 {const nasce=5.75,poe=18.6;if(h>nasce-.4&&h<poe+.4){const p=(h-nasce)/(poe-nasce);const x=Math.round(468-p*456),y=Math.round(32+108*(1-Math.pow(Math.max(0,Math.sin(clamp(p,0,1)*Math.PI)),.25)));
   const spr=p<.25?SOL.amanhecer:p>.75?SOL.entardecer:SOL.dia;G.globalAlpha=clamp(1-noite*1.4,0,1);G.drawImage(spr,x-spr.width/2,y-spr.height/2);G.globalAlpha=1;}
  if(noite>.05){const hn=h<12?h+24:h;const p=(hn-19)/10.5;const x=Math.round(440-p*400),y=Math.round(150-Math.sin(clamp(p,0,1)*Math.PI)*118);G.globalAlpha=noite;G.drawImage(LUA,x-20,y-20);G.globalAlpha=1;}}
 {const cx0=-((t/2.6)%960);camadaMix('nuvem',Math.round(cx0),0,w);camadaMix('nuvem',Math.round(cx0)+960,0,w);}
 if(dia+w.amanhecer>.3){G.globalAlpha=clamp(dia+w.amanhecer*.6,0,1);for(const a of AVES){const x=((t*a.v+a.ph)%560)-40,y=Math.round(a.y+Math.sin(t*.4+a.f)*2);const up=Math.floor(t*2.2+a.f)%2;const c='#2a3050';X(G,x,y,c);X(G,x-1,y-(up?1:0),c);X(G,x+1,y-(up?1:0),c);X(G,x-2,y-(up?2:0)+(up?0:1),c);X(G,x+2,y-(up?2:0)+(up?0:1),c);}G.globalAlpha=1;}
 {const k=((t+60)%240)/240;const bx=Math.round(520-k*620);G.drawImage(blC,bx,30);if(noite>.3){const sc=Math.floor(t*1.2);for(let i=0;i<11;i++){const on=((i+sc)%11)<6;R(G,bx+11+i*2,34,1,4,on?(i%2?P.c3:P.c2):P.c1);}}}
 /* cidade em três camadas de paralaxe */
 camadaMix('longe',Math.round(-40+sway*2),0,w);
 for(const c of CARS){if(c.l>0)continue;c.x=((c.x+c.v*dt)%560+560)%560;R(G,c.x-40,c.y,c.s+1,1,dia>.5?'#5a6a8a':P.n4);X(G,c.x-40+(c.v>0?0:c.s),c.y,P.r2);}
 camadaMix('meio',Math.round(-60+sway*5),0,w);
 for(const c of CARS){if(c.l===0||c.l===3)continue;c.x=((c.x+c.v*dt)%560+560)%560;const x=c.x-40;R(G,x,c.y,c.s+2,2,P.n5);R(G,x+1,c.y-1,c.s,1,P.n6);X(G,c.v>0?x:x+c.s+1,c.y+1,P.r3);X(G,c.v>0?x+c.s+1:x,c.y,P.a3);}
 {const per=48,k=(t%per)/per;const tx=Math.round(-120+k*760+sway*5-60);for(let i=0;i<4;i++){const x=tx+i*22;R(G,x,183,20,7,P.n4);R(G,x,183,20,1,P.n6);for(let wx=x+2;wx<x+18;wx+=4)R(G,wx,185,2,2,noite>.4?P.a3:'#8aa0c0');R(G,x,189,20,1,P.n2);}}
 camadaMix('perto',Math.round(-80+sway*10),0,w);
 for(const c of CARS){if(c.l!==3)continue;c.x=((c.x+c.v*dt)%560+560)%560;const x=c.x-40;R(G,x,c.y,8,3,P.n4);R(G,x+2,c.y-1,4,1,P.n6);R(G,x+1,c.y+3,6,1,P.c1);X(G,c.v>0?x:x+7,c.y+1,P.r3);X(G,c.v>0?x+7:x,c.y+1,P.a3);}
 /* chuva de noite */
 if(noite>.35){const n=Math.round(RAIN.length*clamp((noite-.35)/.5,0,1));for(let i=0;i<RAIN.length;i++){const r=RAIN[i];r.y+=r.v*dt;r.x-=r.v*dt*.22;if(r.y>226){r.y=24+Math.random()*8;r.x=Math.random()*520;}if(r.x<-10)r.x+=520;
   if(i<n){G.globalAlpha=.55;for(let j=0;j<r.l;j++)X(G,Math.round(r.x+j*.22),Math.round(r.y-j),r.c);G.globalAlpha=1;}}
  if(noite>.6)for(const [x,y] of DROPS){X(G,x,y,P.n5);X(G,x,y-1,P.n6);}}
 /* interior: pintura da noite, a do dia por cima com o peso da luz */
 const luzDia=clamp(dia+w.amanhecer*.75+w.entardecer*.55,0,1);
 G.drawImage(INT.noite,0,0);if(luzDia>.004){G.globalAlpha=luzDia;G.drawImage(INT.dia,0,0);G.globalAlpha=1;}
 if(D.bus){const k=num(D.bus.pct)?clamp(D.bus.pct/100,0,1):0,bx=212,by=AND.empresa.chao-26;for(let i=0;i<Math.round(12*k);i++)R(G,bx+5+i*2,by+11,1,3,P.g3);}
 if(w.amanhecer>.02){G.globalCompositeOperation='screen';G.globalAlpha=w.amanhecer*.5;G.drawImage(RAIOS.amanhecer,0,0);G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 if(w.entardecer>.02){G.globalCompositeOperation='screen';G.globalAlpha=w.entardecer*.42;G.drawImage(RAIOS.entardecer,0,0);G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 /* telas dos monitores */
 const o=AND.terreo.chao-200;
 DESKS.forEach((d,i)=>{const tn=TONE[d.k],sx=d.x-6,sy=172+o,sw=19,sh=12;if(!d.who){R(G,sx,sy,sw,sh,P.n1);X(G,sx+sw-3,sy+sh-3,P.n3);return;}R(G,sx,sy,sw,sh,tn[0]);
   const sp=.9+i*.13;const ln=Math.floor(t/sp);const fr=(t/sp)%1;
   for(let k=0;k<5;k++){const n=ln+k;const r2=rng(n*31+i*977);const ind=(r2()*4|0),len=3+(r2()*11|0);const yy=sy+1+k*2;
     const L=k===4?Math.round(len*fr):len;R(G,sx+1+ind,yy,Math.min(L,sw-2-ind),1,r2()<.3?tn[2]:tn[1]);if(r2()<.4&&L>4)R(G,sx+1+ind,yy,2,1,tn[2]);
     if(k===4)X(G,Math.min(sx+sw-2,sx+1+ind+L),yy,P.n8);}
   const tr=trabalhosDe(d.who)[0];
   R(G,sx,sy+sh-1,sw,1,P.n1);if(tr&&num(tr.pct))R(G,sx,sy+sh-1,Math.max(1,Math.round(sw*clamp(tr.pct,0,100)/100)),1,tn[2]);X(G,sx,sy,P.n8);});
 /* quem dorme, a rede, os z */
 G.drawImage(slC,0,0);
 {const M=AND.mezanino.chao,sw=Math.round(Math.sin(t*.7)*1.2);
  for(let x=390;x<430;x++){const y=Math.round(M-20+Math.sin((x-390)/40*Math.PI)*9)+(x>394&&x<426?sw:0);X(G,x,y,P.c1);X(G,x,y+1,P.c2);}
  G.drawImage(REDE,397,M-17+sw);}
 ZS.forEach((z,i)=>{if(i%2&&!z[3])return;const per=8,k=((t+z[2])%per)/per;if(k>.5)return;const yy=z[1]-Math.floor(k*12),xx=z[0]+Math.round(Math.sin(k*6+i)*1.5+k*4);
   const col=k<.3?'n7':k<.46?'n6':'n5';G.drawImage(ZC[(k>.25?1:0)+col],xx,yy-4);});
 /* trabalhando, andando, esperando */
 const talk0=e==='falando';const talk=talk0||(!SIM&&!!salaAtual&&t<ROLO.lidoEm);FALA_ON=talk;
 WORK.forEach(wk=>{const dd=wk.d;if(!dd.who)return;const typ=Math.sin(t*.37+wk.seed*3)>-.6;const f=typ&&(Math.floor(t*7+wk.seed*5)%2===0);
   const look=talk&&JV.andar==='terreo'&&JV.x<dd.x-20;G.drawImage(look?wk.L:(f?wk.B:wk.A),dd.x-25-(look?-1:0),177+o);});
 WALK.forEach(wk=>{const p=pathPos(wk,t);const s=p.m==='w'?(p.dir>0?wk.set.r:wk.set.l)[p.fr]:(p.dir>0?wk.set.sr:wk.set.sl);blit(s,p.x,wk.y);});
 if(PEND>0)JUMP.forEach((j,ji)=>{if(ji>=PEND)return;const per=2.4,k=((t/per)+j.ph)%1;const air=k<.4;const hh=air?Math.round(Math.sin(k/.4*Math.PI)*6):0;blit(air&&k>.06&&k<.34?j.up:j.st,j.x,AND.terreo.chao-hh);G.drawImage(BANG,j.x-5,AND.terreo.chao-31);});
 if(PEND>0){const bx=405,by=AND.terreo.chao-10;R(G,bx,by,14,10,P.ink);R(G,bx+1,by+1,12,8,P.r2);R(G,bx+1,by+1,12,1,P.r3);R(G,bx+1,by+4,12,1,P.a2);R(G,bx+6,by+3,2,3,P.a3);R(G,bx+1,by+8,12,1,P.r1);}
 /* elevador e Jarvis */
 passoJarvis(dt,talk&&e==='dormindo'?'falando':e);
 const cy=Math.round(JV.carro),ch=26;
 {const x=POCO.x0+1;R(G,x,cy-ch,18,ch,P.ink);R(G,x+1,cy-ch+1,16,ch-2,noite>.5?'#1a1830':'#4a5274');dith(G,x+1,cy-ch+1,16,6,noite>.5?P.a1:'#8a90b0',.35);R(G,x+5,cy-ch+1,8,1,noite>.5?P.a3:P.n8);}
 drawJarvis(t,e,nivS);const jx=Math.round(JV.x)-14,jy=Math.round(JV.y)-27;
 G.drawImage(jvC,jx,jy);
 {const x=POCO.x0+1;R(G,x,cy-ch,18,1,P.n6);R(G,x,cy-1,18,1,P.n6);R(G,x,cy-ch,1,ch,P.n6);R(G,x+17,cy-ch,1,ch,P.n6);if(JV.ocupado==='subindo')for(let k=x+3;k<x+17;k+=4)R(G,k,cy-ch+1,1,ch-2,P.n5);}
 if(e==='ouvindo')G.drawImage(QM,jx+11,jy-9+Math.round(Math.sin(t*2)));
 if(e==='pensando')G.drawImage(hourglass(t),jx+9,jy-12);
 /* tom da hora: dourado de manhã, laranja no fim da tarde */
 if(dia>.02){G.globalCompositeOperation='screen';G.globalAlpha=dia*.16;G.drawImage(RAIOS.dia,0,0);G.globalCompositeOperation='soft-light';G.globalAlpha=dia*.3;R(G,44,54,392,168,'#fffaeb');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 if(w.amanhecer>.02){G.globalCompositeOperation='soft-light';G.globalAlpha=w.amanhecer*.55;R(G,0,24,WW,202,'#f4b860');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 if(w.entardecer>.02){G.globalCompositeOperation='soft-light';G.globalAlpha=w.entardecer*.5;R(G,0,24,WW,202,'#e85a6a');G.globalCompositeOperation='source-over';G.globalAlpha=1;}
 /* poeira nos raios */
 const pw=w.amanhecer*.95+w.entardecer*.5;if(pw>.05){const s=w.amanhecer>=w.entardecer?1:-1;G.globalAlpha=clamp(pw,0,1);
  for(const q of POEIRA){const x=Math.round(q.x+Math.sin(t*.13*q.v+q.ph)*6),y=Math.round(q.y+Math.sin(t*.09*q.v+q.ph*1.7)*3);if(y<q.a.topo+3||y>=q.a.chao-1)continue;if(noRaio(x,y,s))X(G,x,y,s>0?'#fff2c8':'#ffd0a0');}G.globalAlpha=1;}
 /* fala: escurece o prédio, a sala do assunto acende no facho */
 talkW=lerp(talkW,talk?1:0,1-Math.pow(.05,dt));
 if(talk0&&(!salaAtual||(!SIM&&voz.id!==falaId))){falaId=voz.id;const txt=SIM?(Q.get('sobre')||ultimoTrabalho()):(voz.sobre||'');salaAtual=salaDe(txt)||COBERTURA;falaT0=t;falaTxt=(SIM?(Q.get('fala')||fraseDe(txt)):voz.frase||'').slice(0,600);
   $('dsb').innerHTML=salaAtual===COBERTURA?'':'sobre: <b>'+(salaAtual.tag!=null?DESKS[salaAtual.tag].nm.toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase()):(salaAtual.el==='pend'?'pendências':(salaEls[salaAtual.sala]?(/bussola/.test(semAc(txt))?'Bússola':salaEls[salaAtual.sala].textContent.replace(/·.*/,'').trim()||{empresa:'Empresa',mezanino:'Mezanino'}[salaAtual.sala]||''):'')))+'</b>';}
 if(talk0&&!SIM&&voz.frase&&voz.frase!==falaTxt){falaTxt=voz.frase.slice(0,600);}
 if(!talk&&talkW<.05&&salaAtual){salaAtual=null;falaId=null;ROLO.txt='';}
 const S=salaAtual;
 if(talkW>.02&&S){const A=S.topo!=null?S:AND[S.andar];
  fx.clearRect(0,0,WW,WH);fx.globalAlpha=1;fx.fillStyle='rgba(6,5,14,'+(.66*talkW).toFixed(3)+')';fx.fillRect(0,24,WW,202);
  fx.globalCompositeOperation='destination-out';fx.fillStyle='#fff';fx.fillRect(S.x0,A.topo,S.x1-S.x0,A.chao-A.topo+1);
  for(let k=1;k<=4;k++){fx.globalAlpha=1-k/5;fx.fillRect(S.x0-k,A.topo-k,S.x1-S.x0+k*2,1);fx.fillRect(S.x0-k,A.chao+k,S.x1-S.x0+k*2,1);fx.fillRect(S.x0-k,A.topo-k,1,A.chao-A.topo+k*2);fx.fillRect(S.x1+k-1,A.topo-k,1,A.chao-A.topo+k*2);}
  fx.globalAlpha=1;fx.globalCompositeOperation='source-over';G.drawImage(fxC,0,0);
  if(talkW>.3){const jx2=Math.round(JV.x)-14,jy2=Math.round(JV.y)-27;G.globalAlpha=talkW;G.drawImage(jvC,jx2,jy2);G.globalAlpha=talkW*.6;R(G,jx2+6,jy2+27,16,1,P.c2);G.globalAlpha=1;}
  const cm=S.topo!=null?null:caminho(S.andar,S.alvo);if(cm)desenhaCabo(cm,talkW>.5?P.c2:P.c1);
  const fw=Math.min(64,S.x1-S.x0),fh=A.chao-A.topo-4,key=fw+'x'+fh;if(!FACHOS[key])FACHOS[key]=pintaFacho(fw,fh);
  G.globalAlpha=talkW*(.75+nivS*.25);G.globalCompositeOperation='screen';G.drawImage(FACHOS[key],Math.round(S.alvo-fw/2),A.topo+4);G.globalCompositeOperation='source-over';G.globalAlpha=1;
  if(talk&&cm){proxPulso-=dt*(1.2+nivS*5);if(proxPulso<=0){proxPulso=1;PULSOS.push({cm,s:0,v:70+nivS*90,cauda:10+Math.round(nivS*8),grosso:nivS>.45});}}}
 else if(e==='ouvindo'){proxPulso-=dt*1.4;if(proxPulso<=0){proxPulso=1;const cm=caminho('terreo',TRONCO);PULSOS.push({cm,s:cm.L,v:60,cauda:12,rev:true});}}
 else if(e==='dormindo'){proxPulso-=dt/6.5;if(proxPulso<=0){proxPulso=1;const cm=caminho(JV.ocupado==='subindo'?'terreo':JV.andar,Math.round(JV.x));PULSOS.push({cm,s:0,v:48,cauda:9});}}
 desenhaPulsos(dt);
 /* núcleo na cúpula */
 {const cx=NUCLEO.x,cy=NUCLEO.y;const resp=.5+.5*Math.sin(t*2*Math.PI/7);const lv=e==='falando'?nivS:0;
  const r=4+Math.round(resp*.6+lv*1.4);for(let y=-r-3;y<=r+3;y++)for(let x=-r-3;x<=r+3;x++){const dd=Math.hypot(x,y);
   if(dd<=r)X(G,cx+x,cy+y,dd<r*.45?P.n8:dd<r*.8?P.c3:P.c2);else if(dd<=r+3&&bay(cx+x,cy+y)<(1-(dd-r)/3)*(.35+resp*.25+lv*.4))X(G,cx+x,cy+y,P.c2);}
  R(G,cx-r-2,cy,2*r+5,1,'#c8a05a');
  if(e==='pensando'){for(let k=0;k<2;k++){const a=t*1.05+k*Math.PI;for(let s=7;s<40;s++){const x=Math.round(cx+Math.cos(a)*s),y=Math.round(cy+Math.sin(a)*s*.45);if(y>48||y<24)continue;if(bay(x,y)<.6*(1-s/40))X(G,x,y,P.c3);}}
   for(let k=0;k<3;k++){const a=t*2.2+k*2.094;X(G,Math.round(cx+Math.cos(a)*8),Math.round(cy+Math.sin(a)*4),P.a3);}}
  if(e==='ouvindo'){for(let x=-6;x<=6;x++)X(G,cx+x,cy+7,x%2?P.c2:P.c3);}
  if(e==='falando'){for(let k=0;k<2;k++){const ph=((t*.7+k*.5)%1);const rr=7+ph*12;if(ph>.9)continue;for(let a=0;a<40;a++){const x=Math.round(cx+Math.cos(a/40*6.283)*rr),y=Math.round(cy+Math.sin(a/40*6.283)*rr*.6);if(y>=48||y<24)continue;if(bay(x,y)<(1-ph)*.8)X(G,x,y,P.c3);}}}}
 hud(t,e);}

let lastE='',lastSala=null,FALA_ON=false;
const ROLO={txt:'',n:0,por:4,t0:0,lidoEm:-1,lh:44};
function rolar(txt,t){let r=$('drolo');if(!r){$('dfr').innerHTML='<div class="rolo" id="a6-drolo"></div>';r=$('drolo');}
 if(txt!==ROLO.txt){const cresceu=!!ROLO.txt&&txt.startsWith(ROLO.txt);ROLO.txt=txt;r.textContent=txt;const n=Math.max(1,Math.round(r.offsetHeight/ROLO.lh));
  if(n>2){r.textContent='';const a=document.createElement('div');a.textContent=txt;const s=document.createElement('div');s.className='sep';s.textContent='·  ·  ·';const b=document.createElement('div');b.textContent=txt;r.append(a,s,b);}
  ROLO.n=n;ROLO.por=clamp(txt.length/n/13,3.2,6);if(!cresceu)ROLO.t0=t;ROLO.lidoEm=ROLO.t0+(n>2?ROLO.por*n:Math.max(3,txt.length/13));}
 let pos=0;if(ROLO.n>2){const u=(t-ROLO.t0-2*ROLO.por)/ROLO.por;if(u>0){const i=Math.floor(u),f=Math.min(1,(u-i)*ROLO.por/.7);pos=(i+f*f*(3-2*f))%(ROLO.n+1);}}
 r.style.transform='translateY('+(-Math.round(pos*ROLO.lh))+'px)';}
function hud(t,e){$('dlg').classList.toggle('on',FALA_ON);
 const jt=$('jtag');jt.style.opacity=talkW>.1?0:1;jt.style.left=(Math.round(JV.x)*4)+'px';jt.style.top=(Math.round(JV.y)*4-18)+'px';
 const lbl={dormindo:{servir:'servindo café',olhar:'passando nos andares',cafe:'pegando café',elevador:'no elevador',subindo:'no elevador','':'andando'}[JV.ocupado]||'andando',ouvindo:'ouvindo você',pensando:'pensando',falando:'falando'}[e]||e;
 const key=e+lbl;if(key!==lastE){lastE=key;jt.innerHTML=`<i style="background:${e==='dormindo'?P.n6:e==='pensando'?P.a3:P.c3}"></i>JARVIS <span>· ${lbl}</span>`;}
 if(salaAtual!==lastSala){lastSala=salaAtual;tagEls.forEach((el,i)=>el.classList.toggle('on',!!salaAtual&&salaAtual.tag===i));Object.entries(salaEls).forEach(([k,el])=>el.classList.toggle('on',!!salaAtual&&salaAtual.sala===k));$('pend').style.outline=salaAtual&&salaAtual.el==='pend'?'4px solid var(--c3)':'none';$('pend').classList.toggle('calado',!!salaAtual&&salaAtual.el!=='pend');}
 if(e==='falando'||talkW>.05){drawPortrait(t,nivS);drawWave();rolar(falaTxt,t);$('dar').style.transform=`translateY(${Math.round(Math.sin(t*1.8)*1.5)*4}px)`;$('dar').style.opacity=ROLO.n>2?1:0;}}
window.avancar=function(t){window.__manual=true;window.__t=t;quadro(t,1/30);};
function ligar(){if(ativo)return;ativo=true;host.hidden=false;nQ=0;fpsT=0;if(!raf)raf=requestAnimationFrame(frame);}
function parar(){ativo=false;if(raf){cancelAnimationFrame(raf);raf=0;}}
const api={mesas:()=>DESKS.map(d=>d.who),encaixar:(r)=>{if(r)opts.recorte=r;fit();},elemento:id=>$(id),estado:aplicarEstado,voz:ouvir,cenaNoAndar,ligar,parar,lento:on=>{lentoF=!!on;},fps:()=>ativo?fpsV:0,erros:()=>erros,host};
if(raiz.Andar)raiz.Andar.atual=api;  /* pro teste do Chromium ler o quadros/s */
return api;
}
raiz.Andar = { criar };
})(window);
