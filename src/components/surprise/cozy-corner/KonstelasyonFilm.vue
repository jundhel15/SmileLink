<!--
  KonstelasyonFilm.vue: maikling "pelikula" ng mga bituin (WebGL) para sa 08 Cozy Corner.
  DAGDAG (inangkop sa SmileLink): nakalagay sa loob ng phone frame ng surprise preview, kaya
  ang laki, mouse at tap ay base sa container na ito (hindi sa buong window).
  Pangalan: `name` prop. Mga caption at polaroid title: SCENES at MEMORIES.
-->
<template>
  <div class="kon" ref="rootRef">

    <canvas id="gl" aria-label="Animasyon ng mga bituin"></canvas>
    <div class="vig"></div>
    <div class="grain"></div>
    <div class="flash" id="flash"></div>
    <div class="bar top"></div>
    <div class="bar bot"></div>

    <div class="ui">
      <div class="hud mono">
        <span id="skipHint">Tap para lumaktaw</span>
        <span class="hud-r">
          <span class="dots" id="dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>
          <button class="mute mono" id="muteBtn" type="button" aria-pressed="false" aria-label="Patayin ang tunog">Tunog &middot; bukas</button>
        </span>
      </div>

      <p class="cap" id="cap" aria-live="polite"></p>

      <section class="intro" id="intro">
        <div class="intro-in">
          <span class="mono late">Maikling pelikula &middot; sample</span>
          <h1><span class="w" style="--i:0">May</span> <span class="w" style="--i:1">sasabihin</span> <span class="w em" style="--i:2">ang langit</span> <span class="w" style="--i:3">ngayong</span> <span class="w" style="--i:4">gabi.</span></h1>
          <p class="late">Mga isang minuto lang. May tunog, kaya itaas ang volume.</p>
          <button class="btn late" id="startBtn" type="button">Panoorin</button>
        </div>
      </section>

      <div class="prompt" id="prompt" inert>
        <span class="mono" id="promptTxt"></span>
        <div class="meter" id="meter" hidden><i id="meterFill"></i></div>
        <div class="pips" id="pips" hidden><i></i><i></i><i></i><i></i><i></i></div>
        <button class="btn" id="actBtn" type="button" hidden>Hawakan</button>
      </div>

      <div class="ask" id="ask" inert>
        <form class="ask-form" id="askForm" autocomplete="off">
          <label class="mono" for="nameIn">Isulat ang pangalan niya</label>
          <div class="ask-row">
            <input id="nameIn" type="text" maxlength="14" placeholder="Mahal" enterkeyhint="done">
            <button class="btn" id="nameBtn" type="submit">Ipakita</button>
          </div>
        </form>
        <button class="btn" id="askNext" type="button" hidden>Susunod</button>
      </div>

      <div class="note" id="note" inert>
        <span class="mono" id="noteTitle"></span>
        <p id="noteText">Ilagay dito ang kuwento ng alaalang ito.</p>
        <span class="mono">Tap para bumalik</span>
      </div>

      <div class="final" id="final" inert>
        <span class="mono">Hawakan ang langit para magpasabog ng bituin<br>I-drag para paikutin ang puso</span>
        <div class="final-row">
          <button class="btn" id="addBtn" type="button">Magdagdag ng litrato</button>
          <button class="btn" id="againBtn" type="button">Ulitin</button>
        </div>
      </div>
    </div>
    <div class="nogl" id="nogl" hidden>Hindi masuportahan ng device na ito ang WebGL, kaya hindi lumabas ang animasyon. Subukan sa ibang browser.</div>
    <input type="file" id="photoIn" accept="image/*" multiple hidden>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props=defineProps({
  name:{type:String,default:'Maria'} /* pangalan ng taong reregaluhan */
})

const rootRef=ref(null)
let teardown=()=>{}

onMounted(()=>{
  const rootEl=rootRef.value
  let dead=false,rafId=0,ro=null
  const timers=new Set(),offs=[]
  /* lahat ng timer at window listener ay naka-track para malinis sa unmount */
  const setTimeout=(fn,ms)=>{const id=window.setTimeout(()=>{timers.delete(id);fn()},ms);timers.add(id);return id}
  const setInterval=(fn,ms)=>{const id=window.setInterval(fn,ms);timers.add(id);return id}
  const addW=(type,fn,opt)=>{window.addEventListener(type,fn,opt);offs.push(()=>window.removeEventListener(type,fn,opt))}
  teardown=()=>{dead=true;cancelAnimationFrame(rafId);ro?.disconnect();timers.forEach(id=>{window.clearTimeout(id);window.clearInterval(id)});timers.clear();offs.forEach(f=>f());offs.length=0}
  /* DAGDAG: posisyon ng pointer relative sa loob ng container (hindi sa buong window).
     Hinahati sa scale kasi pinaliliit ng SurpriseShell ang device preview. */
  const local=e=>{const r=rootEl.getBoundingClientRect(),s=r.width/rootEl.offsetWidth||1;return[(e.clientX-r.left)/s,(e.clientY-r.top)/s]}

  /* ---------- Sample content: palitan ng totoong kuwento ---------- */
  let NAME=props.name;
  const SCENES=[
    {cap:'Bago ka dumating, tahimik ang langit.',        form:'galaxy',tr:0,   hold:8000, cam:[0,5,34],look:0},
    {cap:'Tapos may isang bituin.',                      form:'star',  tr:4200,hold:7000, cam:[0,0,19],look:0},
    {cap:'Maligayang kaarawan, {n}.',                    form:'t2',    tr:3000,hold:7500, cam:[0,0,26],look:0},
    {cap:'{n}, ikaw ang paborito kong konstelasyon.',    form:'heart', tr:3800,hold:8000, cam:[0,0,26],look:0},
    {cap:'',                                             form:'heart', tr:0,   hold:0,    cam:[0,0,27],look:0, final:true}
  ];
  const MEMORIES=[
    {g:'α',title:'Unang pagkikita'},{g:'β',title:'Unang tawa'},{g:'γ',title:'Unang date'},
    {g:'δ',title:'Inside joke'},{g:'ε',title:'Ang kanta natin'},{g:'ζ',title:'Mahirap na araw'},{g:'η',title:'Ngayong gabi'}
  ];
  const NP=MEMORIES.length;
  const TAU=Math.PI*2;
  const $=id=>rootEl.querySelector('#'+id);
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SPEED=reduce?.45:1;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const easeBack=p=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)};
  function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  const canvas=$('gl');
  let gl=null;
  try{gl=canvas.getContext('webgl',{antialias:false,alpha:false,premultipliedAlpha:false,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl')}catch{/* walang WebGL */}
  if(!gl){$('nogl').hidden=false;return}

  /* ---------- tiny matrix library (column-major) ---------- */
  const M4=()=>new Float32Array(16);
  function perspective(o,fovy,asp,n,f){const t=1/Math.tan(fovy/2);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f)}
  function lookAt(o,ex,ey,ez,cx,cy,cz){
    let zx=ex-cx,zy=ey-cy,zz=ez-cz,l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
    let xx=zz,xy=0,xz=-zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;
    const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
    o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
    o[12]=-(xx*ex+xy*ey+xz*ez);o[13]=-(yx*ex+yy*ey+yz*ez);o[14]=-(zx*ex+zy*ey+zz*ez);o[15]=1;
  }
  function mul(o,a,b){
    for(let c=0;c<4;c++)for(let r=0;r<4;r++){
      o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    }
  }
  function rotYX(o,yaw,pitch){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    // R = Rx(pitch) * Ry(yaw)
    o[0]=cy;o[1]=sx*sy;o[2]=-cx*sy;o[3]=0;
    o[4]=0;o[5]=cx;o[6]=sx;o[7]=0;
    o[8]=sy;o[9]=-sx*cy;o[10]=cx*cy;o[11]=0;
    o[12]=0;o[13]=0;o[14]=0;o[15]=1;
  }

  /* ---------- shaders ---------- */
  function makeProg(vs,fs,attribs){
    const p=gl.createProgram();
    [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(a=>{
      const s=gl.createShader(a[0]);gl.shaderSource(s,a[1]);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p,s);
    });
    attribs.forEach((n,i)=>gl.bindAttribLocation(p,i,n));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function locs(p,names){const o={};names.forEach(n=>o[n]=gl.getUniformLocation(p,n));return o}
  function enableAttribs(n){for(let i=0;i<6;i++){if(i<n)gl.enableVertexAttribArray(i);else gl.disableVertexAttribArray(i)}}

  let pP,pS,pQ,uP,uS,uQ;
  try{
    pP=makeProg(
    'precision highp float;attribute vec3 aFrom;attribute vec3 aTo;attribute vec4 aRand;attribute vec3 aColor;'+
    'uniform mat4 uMV;uniform mat4 uProj;uniform float uMix,uTime,uScale,uSize,uAlpha,uScatter,uJit,uPulse,uTintMix;uniform vec3 uTint;uniform vec2 uPtr;uniform float uForce,uRad,uAsp;'+
    'varying vec3 vCol;varying float vA;'+
    'void main(){'+
    'float d=aRand.x*0.45;float m=clamp((uMix-d)/0.55,0.0,1.0);m=m*m*(3.0-2.0*m);'+
    'vec3 p=mix(aFrom,aTo,m);float sw=sin(m*3.14159265);'+
    'float ang=sw*(aRand.y-0.5)*5.0;float c=cos(ang);float s=sin(ang);'+
    'p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);'+
    'p+=(vec3(aRand.z,aRand.w,aRand.y)-0.5)*2.0*sw*uScatter;'+
    'p+=vec3(sin(uTime*0.6+aRand.y*40.0),cos(uTime*0.5+aRand.z*40.0),sin(uTime*0.4+aRand.w*40.0))*0.07*uJit;'+
    'p*=1.0+uPulse;'+
    'vec4 mv=uMV*vec4(p,1.0);gl_Position=uProj*mv;'+
    'vec2 nd=gl_Position.xy/gl_Position.w;vec2 dl=uPtr-nd;vec2 da=dl*vec2(uAsp,1.0);float fo=uForce*exp(-dot(da,da)*uRad);gl_Position.xy+=dl*fo*gl_Position.w;'+
    'float tw=0.78+0.22*sin(uTime*2.0+aRand.z*30.0);'+
    'gl_PointSize=max(1.0,uSize*(0.55+aRand.w*0.95)*tw*uScale/(-mv.z));'+
    'vCol=mix(aColor,uTint*(0.65+aRand.w*0.7),uTintMix);vA=uAlpha;}',
    'precision mediump float;varying vec3 vCol;varying float vA;'+
    'void main(){vec2 c=gl_PointCoord-0.5;float d=length(c);float a=smoothstep(0.5,0.0,d);a*=a;gl_FragColor=vec4(vCol,a*vA);}',
    ['aFrom','aTo','aRand','aColor']);
    uP=locs(pP,['uMV','uProj','uMix','uTime','uScale','uSize','uAlpha','uScatter','uJit','uPulse','uTint','uTintMix','uPtr','uForce','uRad','uAsp']);

    pS=makeProg(
    'precision highp float;attribute vec3 aPos;attribute vec2 aRand;uniform mat4 uVP;uniform float uTime,uDpr;varying float vA;varying float vW;'+
    'void main(){gl_Position=uVP*vec4(aPos,1.0);gl_PointSize=(1.0+aRand.x*aRand.x*2.6)*uDpr;'+
    'vA=0.3+0.7*(0.5+0.5*sin(uTime*(0.5+aRand.y*2.0)+aRand.y*60.0));vW=step(0.72,aRand.y);}',
    'precision mediump float;varying float vA;varying float vW;'+
    'void main(){vec2 c=gl_PointCoord-0.5;float a=smoothstep(0.5,0.0,length(c));vec3 col=mix(vec3(0.82,0.88,1.0),vec3(1.0,0.9,0.7),vW);gl_FragColor=vec4(col,a*vA);}',
    ['aPos','aRand']);
    uS=locs(pS,['uVP','uTime','uDpr']);

    pQ=makeProg(
    'precision highp float;attribute vec2 aQ;uniform mat4 uVP;uniform vec3 uCenter,uRight,uUp;uniform vec2 uSz;uniform float uRoll;varying vec2 vUv;'+
    'void main(){float c=cos(uRoll);float s=sin(uRoll);vec2 q=aQ*uSz;vec2 r=vec2(c*q.x-s*q.y,s*q.x+c*q.y);'+
    'vec3 w=uCenter+uRight*r.x+uUp*r.y;gl_Position=uVP*vec4(w,1.0);vUv=vec2(aQ.x+0.5,0.5-aQ.y);}',
    'precision mediump float;varying vec2 vUv;uniform sampler2D uTex;uniform vec4 uColor;'+
    'void main(){vec4 t=texture2D(uTex,vUv);gl_FragColor=vec4(t.rgb*uColor.rgb,t.a*uColor.a);}',
    ['aQ']);
    uQ=locs(pQ,['uVP','uCenter','uRight','uUp','uSz','uRoll','uTex','uColor']);
  }catch(err){
    console.error(err);$('nogl').hidden=false;return;
  }

  /* ---------- particles ---------- */
  /* DAGDAG: bilang ng particles base sa laki ng container */
  const C=(rootEl.clientWidth*rootEl.clientHeight>700000)?15000:9000;
  const aFrom=new Float32Array(C*3),aTo=new Float32Array(C*3),aRand=new Float32Array(C*4),aCol=new Float32Array(C*3);
  const bFrom=gl.createBuffer(),bTo=gl.createBuffer(),bRand=gl.createBuffer(),bCol=gl.createBuffer();
  const FOV=50*Math.PI/180;
  let W=0,H=0,DPR=1,ASP=1,SCALE=1;
  const proj=M4(),view=M4(),model=M4(),mv=M4(),vp=M4(),viewRot=M4(),svp=M4();

  function visAt(z){const h=2*Math.tan(FOV/2)*z;return{h:h,w:h*ASP}}
  function rnd(){return Math.random()}
  function randn(){return (rnd()+rnd()+rnd()-1.5)*.8}

  function formGalaxy(out){
    const v=visAt(34),R=clamp(v.w*.62,8,15);
    for(let i=0;i<C;i++){
      if(rnd()<.2){const rr=Math.abs(randn())*R*.2;const aa=rnd()*TAU;out[i*3]=Math.cos(aa)*rr;out[i*3+1]=randn()*R*.05;out[i*3+2]=Math.sin(aa)*rr;continue}
      const r=Math.pow(rnd(),.62)*R,arm=Math.floor(rnd()*3);
      const ang=r*.42+arm*TAU/3+(rnd()-.5)*(.9*(1-r/R)+.15);
      out[i*3]=Math.cos(ang)*r;out[i*3+1]=(rnd()-.5)*(.9+2.4*(1-r/R));out[i*3+2]=Math.sin(ang)*r;
    }
    return R;
  }
  function formStar(out){
    for(let i=0;i<C;i++){
      const a=rnd()*TAU,b=Math.acos(2*rnd()-1),r=.04+Math.pow(rnd(),2.2)*2.4;
      out[i*3]=Math.sin(b)*Math.cos(a)*r;out[i*3+1]=Math.cos(b)*r*.9;out[i*3+2]=Math.sin(b)*Math.sin(a)*r;
    }
  }
  function formScatter(out){
    for(let i=0;i<C;i++){
      let x=rnd()-.5,y=rnd()-.5,z=rnd()-.5;const l=Math.hypot(x,y,z)||1,r=Math.cbrt(rnd())*17;
      out[i*3]=x/l*r;out[i*3+1]=y/l*r;out[i*3+2]=z/l*r;
    }
  }
  function formHeart(out){
    const v=visAt(26),wT=Math.min(v.w*.6,v.h*.44*32/29),kx=wT/2.28,yOff=v.h*.03,nEdge=Math.floor(C*.22);
    const f=(x,y)=>{const a=x*x+y*y-1;return a*a*a-x*x*y*y*y};
    const e=.002;
    for(let i=0;i<C;i++){
      let x,y,tries=0,ok=false;
      do{
        x=(rnd()-.5)*2.6;y=(rnd()-.5)*2.6+.05;const q=f(x,y);tries++;
        if(q>0)continue;
        const gx=(f(x+e,y)-f(x-e,y))/(2*e),gy=(f(x,y+e)-f(x,y-e))/(2*e),d=-q/Math.max(.05,Math.hypot(gx,gy));
        ok=i<nEdge?d<.03:rnd()<.2+.8*Math.exp(-d*6);
      }while(!ok&&tries<1500);
      out[i*3]=x*kx;out[i*3+1]=(y-.125)*kx+yOff;out[i*3+2]=(rnd()-.5)*kx*(i<nEdge?.45:.9);
    }
  }
  function formText(out,lines,fontPx){
    const cw=1500,lh=fontPx*1.18,ch=Math.ceil(lines.length*lh+fontPx*.6);
    const c=document.createElement('canvas');c.width=cw;c.height=ch;
    const g=c.getContext('2d');
    g.font='italic '+fontPx+'px "Instrument Serif",Georgia,serif';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle='#fff';g.strokeStyle='#fff';g.lineWidth=fontPx*.035;g.lineJoin='round';
    let maxW=1;
    lines.forEach((ln,i)=>{const y=fontPx*.3+lh*(i+.5);g.strokeText(ln,cw/2,y);g.fillText(ln,cw/2,y);maxW=Math.max(maxW,g.measureText(ln).width)});
    const data=g.getImageData(0,0,cw,ch).data,pts=[],step=2;
    for(let y=0;y<ch;y+=step)for(let x=0;x<cw;x+=step)if(data[(y*cw+x)*4+3]>140)pts.push(x,y);
    if(!pts.length)pts.push(cw/2,ch/2);
    const v=visAt(26),s=Math.min(v.w*.84/maxW,v.h*.42/(lines.length*lh)),yOff=v.h*.05,cyp=fontPx*.3+lh*lines.length/2,n=pts.length/2;
    for(let i=0;i<C;i++){
      const k=Math.floor(rnd()*n)*2;
      out[i*3]=(pts[k]-cw/2+(rnd()-.5)*step)*s;
      out[i*3+1]=-(pts[k+1]-cyp+(rnd()-.5)*step)*s+yOff;
      out[i*3+2]=(rnd()-.5)*.5;
    }
  }
  function makeForm(name,out){
    if(name==='galaxy')formGalaxy(out);
    else if(name==='star')formStar(out);
    else if(name==='scatter')formScatter(out);
    else if(name==='heart')formHeart(out);
    else if(name==='t1'){const nm=NAME||'Mahal';formText(out,[nm],Math.floor(Math.min(300,1380/(Math.max(3,nm.length)*.6))*(ASP<1?.33:1)))}
    else if(name==='t2')formText(out,['Maligayang','kaarawan'],210);
  }
  const PARAMS={
    galaxy: {a:.85,size:1,tint:0,  rx:-1.0,jit:1},
    star:   {a:.7, size:1,tint:.6,rx:-.2,jit:.4},
    t1:     {a:.85,size:1,tint:.5, rx:0,jit:1},
    t2:     {a:.85,size:1,tint:.5, rx:0,jit:1},
    heart:  {a:.7, size:1,tint:.68,rx:0,jit:1},
    scatter:{a:.85,size:1,tint:.2, rx:0,jit:2}
  };
  const TINTS={galaxy:[1,1,1],star:[1,.94,.8],t1:[1,.93,.78],t2:[1,.93,.78],heart:[1,.55,.7],scatter:[1,.9,.8]};

  ASP=(rootEl.clientWidth||1)/(rootEl.clientHeight||1);
  const R0=formGalaxy(aTo);aFrom.set(aTo);
  (function initAttrs(){
    const r=mulberry(99);
    for(let i=0;i<C;i++){
      aRand[i*4]=r();aRand[i*4+1]=r();aRand[i*4+2]=r();aRand[i*4+3]=r();
      const t=clamp(Math.hypot(aTo[i*3],aTo[i*3+2])/R0,0,1),br=.6+r()*.4;
      let cr,cg,cb;
      if(t<.4){const k=t/.4;cr=1;cg=.86-.31*k;cb=.55+.17*k}
      else{const k=(t-.4)/.6;cr=1-.5*k;cg=.55+.07*k;cb=.72+.28*k}
      aCol[i*3]=cr*br;aCol[i*3+1]=cg*br;aCol[i*3+2]=cb*br;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,bRand);gl.bufferData(gl.ARRAY_BUFFER,aRand,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,bCol);gl.bufferData(gl.ARRAY_BUFFER,aCol,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,bFrom);gl.bufferData(gl.ARRAY_BUFFER,aFrom,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,bTo);gl.bufferData(gl.ARRAY_BUFFER,aTo,gl.DYNAMIC_DRAW);
  })();
  function upload(buf,arr){gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.DYNAMIC_DRAW)}

  /* ---------- far stars + nebula + quads ---------- */
  const NS=1800,starArr=new Float32Array(NS*3),starR=new Float32Array(NS*2);
  (function(){
    const r=mulberry(5);
    for(let i=0;i<NS;i++){
      const a=r()*TAU,b=Math.acos(2*r()-1),d=220;
      starArr[i*3]=Math.sin(b)*Math.cos(a)*d;starArr[i*3+1]=Math.cos(b)*d;starArr[i*3+2]=Math.sin(b)*Math.sin(a)*d;
      starR[i*2]=r();starR[i*2+1]=r();
    }
  })();
  const bStar=gl.createBuffer(),bStarR=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,bStar);gl.bufferData(gl.ARRAY_BUFFER,starArr,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,bStarR);gl.bufferData(gl.ARRAY_BUFFER,starR,gl.STATIC_DRAW);
  const bQuad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),gl.STATIC_DRAW);

  function makeTex(cnv){
    const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cnv);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return t;
  }
  function updTex(t,cnv){gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cnv)}
  function radialCanvas(sz,stops){
    const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');
    const gr=g.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);stops.forEach(s=>gr.addColorStop(s[0],s[1]));
    g.fillStyle=gr;g.fillRect(0,0,sz,sz);return c;
  }
  const texNeb=makeTex(radialCanvas(256,[[0,'rgba(255,255,255,.9)'],[.35,'rgba(255,255,255,.35)'],[1,'rgba(255,255,255,0)']]));
  const texGlow=makeTex(radialCanvas(128,[[0,'rgba(255,255,255,.95)'],[.4,'rgba(255,255,255,.3)'],[1,'rgba(255,255,255,0)']]));
  function needleCanvas(){
    const c=document.createElement('canvas');c.width=1024;c.height=16;const g=c.getContext('2d');
    const gr=g.createLinearGradient(0,0,1024,0);
    gr.addColorStop(0,'rgba(255,240,210,0)');gr.addColorStop(.5,'rgba(255,252,240,1)');gr.addColorStop(1,'rgba(255,240,210,0)');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,8);g.quadraticCurveTo(512,-2,1024,8);g.quadraticCurveTo(512,18,0,8);g.closePath();g.fill();
    return c;
  }
  const texNeedle=makeTex(needleCanvas());
  const texCore=makeTex(radialCanvas(256,[[0,'rgba(255,255,255,1)'],[.07,'rgba(255,252,238,.95)'],[.18,'rgba(255,230,180,.4)'],[.4,'rgba(255,210,150,.07)'],[1,'rgba(255,210,150,0)']]));
  const texRing=makeTex(radialCanvas(256,[[0,'rgba(255,255,255,0)'],[.78,'rgba(255,235,200,0)'],[.83,'rgba(255,235,200,.55)'],[.88,'rgba(255,235,200,0)'],[1,'rgba(255,235,200,0)']]));
  const NEBS=[
    {x:-34,y:14,z:-110,s:150,c:[.42,.34,.9,.22],sp:.008,p:0},
    {x:40,y:-10,z:-120,s:170,c:[.16,.5,.8,.17],sp:-.006,p:2},
    {x:6,y:-34,z:-100,s:130,c:[1,.5,.65,.14],sp:.01,p:4},
    {x:-20,y:30,z:-130,s:120,c:[.55,.4,1,.12],sp:-.009,p:1}
  ];

  /* ---------- photos (polaroid textures) ---------- */
  const photoCv=[],photoTex=[],photoCustom=[];
  function drawPolaroid(i,img){
    const c=photoCv[i]||(photoCv[i]=document.createElement('canvas'));c.width=256;c.height=300;
    const x=c.getContext('2d');
    x.fillStyle='#f4f1ff';x.fillRect(0,0,256,300);
    if(img){
      const s=Math.min(img.width,img.height);
      x.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,12,12,232,232);
    }else{
      const hue=[265,215,330,190,300,235,350][i%7],g=x.createLinearGradient(12,12,244,244);
      g.addColorStop(0,'hsl('+hue+',55%,26%)');g.addColorStop(1,'hsl('+((hue+50)%360)+',62%,50%)');
      x.fillStyle=g;x.fillRect(12,12,232,232);
      const r=mulberry(i+3);x.fillStyle='rgba(255,255,255,.75)';
      for(let k=0;k<26;k++){x.beginPath();x.arc(12+r()*232,12+r()*232,r()*1.6+.3,0,TAU);x.fill()}
      x.fillStyle='rgba(255,246,222,.94)';x.textAlign='center';x.textBaseline='middle';
      x.font='italic 110px "Instrument Serif",Georgia,serif';x.fillText(MEMORIES[i].g,128,120);
      x.font='500 14px "DM Mono",monospace';x.fillStyle='rgba(255,255,255,.8)';x.fillText('SAMPLE',128,214);
    }
    x.fillStyle='#2b2d5e';x.textAlign='center';x.textBaseline='middle';
    x.font='italic 24px "Instrument Serif",Georgia,serif';x.fillText(MEMORIES[i].title,128,272);
    if(photoTex[i])updTex(photoTex[i],c);
  }
  for(let i=0;i<NP;i++){drawPolaroid(i,null);photoTex[i]=makeTex(photoCv[i])}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(dead)return;for(let i=0;i<NP;i++)if(!photoCustom[i])drawPolaroid(i,null)});

  const photoIn=$('photoIn');
  $('addBtn').addEventListener('click',()=>photoIn.click());
  photoIn.addEventListener('change',()=>{
    const files=Array.prototype.slice.call(photoIn.files||[],0,NP);
    files.forEach(f=>{
      let slot=-1;for(let i=0;i<NP;i++)if(!photoCustom[i]){slot=i;break}
      if(slot<0)slot=Math.floor(Math.random()*NP);
      photoCustom[slot]=true;
      const url=URL.createObjectURL(f),im=new Image(),idx=slot;
      im.onload=()=>{if(!dead)drawPolaroid(idx,im);URL.revokeObjectURL(url)};
      im.onerror=()=>{photoCustom[idx]=false;URL.revokeObjectURL(url)};
      im.src=url;
    });
    photoIn.value='';
  });

  /* ---------- audio (starts only after the Panoorin tap) ---------- */
  let AC=null,master=null,bus=null,muted=false,plinkTimer=0;
  const PENTA=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
  function initAudio(){
    if(AC)return;
    try{
      AC=new(window.AudioContext||window.webkitAudioContext)();
      master=AC.createGain();master.gain.value=muted?0:.8;master.connect(AC.destination);
      bus=AC.createGain();bus.connect(master);
      const conv=AC.createConvolver(),len=Math.floor(AC.sampleRate*2.8),ib=AC.createBuffer(2,len,AC.sampleRate);
      for(let ch=0;ch<2;ch++){const d=ib.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
      conv.buffer=ib;const wet=AC.createGain();wet.gain.value=.5;bus.connect(conv);conv.connect(wet);wet.connect(master);
      const pad=AC.createGain();pad.gain.value=0;pad.connect(bus);pad.gain.linearRampToValueAtTime(.06,AC.currentTime+6);
      [110,164.81,220.5,329.63].forEach((f,i)=>{
        const o=AC.createOscillator();o.type='sine';o.frequency.value=f;o.detune.value=(i-1.5)*5;
        const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=.06+i*.025;lg.gain.value=4;
        l.connect(lg);lg.connect(o.detune);o.connect(pad);o.start();l.start();
      });
    }catch{AC=null}
  }
  function chime(freq,delay,vol,dur){
    if(!AC||muted)return;
    const t=AC.currentTime+(delay||0),g=AC.createGain(),o=AC.createOscillator(),o2=AC.createOscillator(),g2=AC.createGain();
    o.type='sine';o.frequency.value=freq;o2.type='triangle';o2.frequency.value=freq*2;g2.gain.value=.22;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.16,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+(dur||2.4));
    o.connect(g);o2.connect(g2);g2.connect(g);g.connect(bus);
    o.start(t);o2.start(t);o.stop(t+(dur||2.4)+.1);o2.stop(t+(dur||2.4)+.1);
  }
  function thump(){
    if(!AC||muted)return;
    [0,.19].forEach((dl,k)=>{
      const t=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(78,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(k?.32:.5,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.24);
      o.connect(g);g.connect(master);o.start(t);o.stop(t+.3);
    });
  }
  function riser(dur){
    if(!AC||muted)return;
    const t=AC.currentTime,o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(700,t+dur);
    f.type='lowpass';f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(3200,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+dur*.9);g.gain.linearRampToValueAtTime(0,t+dur+.05);
    o.connect(f);f.connect(g);g.connect(bus);o.start(t);o.stop(t+dur+.1);
  }
  function plinkOn(){
    clearInterval(plinkTimer);
    plinkTimer=setInterval(()=>{if(Math.random()<.8)chime(PENTA[Math.floor(Math.random()*PENTA.length)],0,.04,2.8)},1700);
  }
  $('muteBtn').addEventListener('click',()=>{
    muted=!muted;const b=$('muteBtn');
    b.setAttribute('aria-pressed',String(muted));b.setAttribute('aria-label',muted?'Buksan ang tunog':'Patayin ang tunog');
    b.textContent=muted?'Tunog · sarado':'Tunog · bukas';
    if(master)master.gain.setTargetAtTime(muted?0:.8,AC.currentTime,.05);
  });

  /* ---------- state ---------- */
  let now=0,last=0;
  let started=false,sceneIdx=-1,sceneTimer=0,locked=true,finalReady=false;
  let tr={active:false,t0:0,dur:1,cb:null,name:'galaxy'},curForm='galaxy';
  let uMix=0,alphaC=.85,sizeC=1,tintMixC=0,jitC=1,pitchC=-1.0,scatterC=2.4,scatterT=2.4;
  let tintC=[1,1,1],alphaT=.85,sizeT=1,tintMixT=0,pitchT=-1.0,jitT=1,tintT=[1,1,1];
  let yawAuto=0,yawC=0,userYaw=0,userPitch=0;
  let camP=[0,5,40],camT=[0,5,34];
  const lookYC=0;
  let parX=0,parY=0,tX=0,tY=0;
  let beatOn=false,beatT0=0,lastBeat=-1,beatPulseT=-9999;
  let photosOn=false,photoT0=0,ringRx=4,ringRz=4,ringAy=3.4,photoW=2.4,photoYoff=0,sizeBoostT=0;
  let down=null;
  let curGate=null,holding=false,charge=0,holdDone=false,starK=1,beatCount=0,beatDone=false;
  let ptrTX=0,ptrTY=0,ptrCx=0,ptrCy=0,forceC=0;
  let zoomIdx=-1,zoomClosing=false,zoomVal=0,zoomScale=2.2,hits=[],promptTimer=0;

  const promptEl=$('prompt'),promptTxt=$('promptTxt'),meter=$('meter'),meterFill=$('meterFill'),pips=$('pips'),actBtn=$('actBtn');
  const ask=$('ask'),askForm=$('askForm'),askNext=$('askNext'),nameIn=$('nameIn'),noteEl=$('note');
  const capEl=$('cap'),dots=$('dots').children,finalEl=$('final'),introEl=$('intro'),flashEl=$('flash');

  /* DAGDAG: laki ay base sa container (phone), hindi sa window */
  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,2);W=rootEl.clientWidth||1;H=rootEl.clientHeight||1;
    canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ASP=W/H;
    perspective(proj,FOV,ASP,.1,600);SCALE=canvas.height/(2*Math.tan(FOV/2));
    const v=visAt(26);photoW=clamp(v.w*.165,1.8,ASP>1?3.4:4.1);
  }
  addW('resize',resize);
  ro=new ResizeObserver(resize);ro.observe(rootEl);

  function goTo(name,dur,cb){
    if(tr.active)finishTr();
    aFrom.set(aTo);makeForm(name,aTo);upload(bFrom,aFrom);upload(bTo,aTo);
    tr={active:true,t0:now,dur:Math.max(1,dur),cb:cb||null,name:name};
    const p=PARAMS[name];alphaT=p.a;sizeT=p.size;tintMixT=p.tint;pitchT=p.rx;jitT=p.jit;tintT=TINTS[name];
  }
  function finishTr(){
    const t=tr;tr.active=false;uMix=0;aFrom.set(aTo);upload(bFrom,aFrom);curForm=t.name;
    if(t.cb)t.cb();
  }

  function setCaption(text){
    capEl.className='cap';capEl.textContent='';
    text.split(' ').filter(Boolean).forEach((w,i)=>{
      const s=document.createElement('span');s.className='cw';s.style.setProperty('--i',i);s.textContent=w;
      capEl.appendChild(s);capEl.appendChild(document.createTextNode(' '));
    });
  }
  function setDots(i){for(let k=0;k<dots.length;k++)dots[k].className=k===i?'on':''}
  function flash(){flashEl.classList.remove('go');void flashEl.offsetWidth;flashEl.classList.add('go')}

  const capText=t=>t.replace('{n}',NAME||'Mahal');
  function showPrompt(txt,g){
    clearTimeout(promptTimer);
    promptTxt.textContent=txt;meter.hidden=g!=='hold';pips.hidden=g!=='beat';actBtn.hidden=!(g==='hold'||g==='beat');
    actBtn.textContent=g==='hold'?'Hawakan':'Tumibok';
    meterFill.style.transform='scaleX(0)';Array.prototype.forEach.call(pips.children,i=>{i.className=''});
    promptEl.classList.add('on');promptEl.inert=false;
    if(!g)promptTimer=setTimeout(hidePrompt,7000*SPEED);
  }
  function hidePrompt(){promptEl.classList.remove('on');promptEl.inert=true;clearTimeout(promptTimer)}
  function showAsk(){ask.classList.add('on');ask.inert=false;askForm.hidden=false;askNext.hidden=true;nameIn.value=NAME}
  function hideAsk(){ask.classList.remove('on');ask.inert=true}

  function playScene(i){
    clearTimeout(sceneTimer);sceneIdx=i;
    const sc=SCENES[i];curGate=sc.gate||null;
    hidePrompt();hideAsk();holding=false;
    if(curGate==='hold'){charge=0;holdDone=false;starK=.28}else starK=1;
    if(curGate==='beat'){beatCount=0;beatDone=false}
    $('skipHint').textContent=(sc.gate||sc.final)?'':'Tap para lumaktaw';
    setCaption(capText(sc.cap));setDots(i);
    camT=sc.cam.slice();
    const trMs=sc.tr*SPEED;
    locked=trMs>0;
    const done=()=>{
      locked=false;
      if(sc.form==='heart'){beatOn=true;beatT0=now;lastBeat=-1}
      if(sc.prompt)showPrompt(sc.prompt,curGate);
      if(curGate==='name')showAsk();
    };
    if(sc.form!==curForm&&i>0){
      goTo(sc.form,trMs,done);
      if(sc.form==='star')riser(trMs/1000);
      else chime(PENTA[(i*2)%PENTA.length]*2,0,.12,3);
    }else{done();if(i===0)chime(196,0,.1,4)}
    if(sc.final){showFinal();return}
    if(!sc.gate)sceneTimer=setTimeout(nextScene,trMs+sc.hold*SPEED);
  }
  function nextScene(){
    if(sceneIdx>=SCENES.length-1)return;
    capEl.classList.add('out');
    setTimeout(()=>playScene(sceneIdx+1),700*Math.min(1,SPEED+.3));
  }
  function skip(){
    if(locked||finalReady||!started||curGate||sceneIdx>=SCENES.length-1)return;
    clearTimeout(sceneTimer);nextScene();
  }

  /* interaction 2: hold to ignite the star */
  function igniteDone(){
    hidePrompt();starK=1;flash();sizeBoostT=now;
    [523.25,659.25,783.99,1046.5].forEach((f,k)=>chime(f,k*.1,.16,3.4));
    try{if(navigator.vibrate)navigator.vibrate(40)}catch{/* walang vibrate */}
    capEl.classList.add('out');
    setTimeout(()=>setCaption('Tapos, lumiwanag ito.'),700);
    sceneTimer=setTimeout(nextScene,3000*SPEED);
  }
  /* interaction 3: write the name, the stars become the name */
  function submitName(){
    if(curGate!=='name'||locked)return;
    NAME=(nameIn.value||'').trim().slice(0,14);
    askForm.hidden=true;locked=true;capEl.classList.add('out');camT=[0,0,26];
    [659.25,783.99,987.77].forEach((f,k)=>chime(f,k*.12,.14,3));
    goTo('t1',2600*SPEED,()=>{locked=false;setCaption(capText('{n}.'));askNext.hidden=false});
  }
  askForm.addEventListener('submit',e=>{e.preventDefault();submitName()});
  askNext.addEventListener('click',()=>{if(curGate==='name'&&!locked){hideAsk();nextScene()}});
  /* interaction 5: tap the rhythm of the heart */
  function beatTap(){
    if(curGate!=='beat'||locked||beatDone)return;
    beatCount++;beatPulseT=now;thump();
    chime(PENTA[2+beatCount],0,.13,2);
    Array.prototype.forEach.call(pips.children,(el,k)=>{el.className=k<beatCount?'on':''});
    if(beatCount>=5){
      beatDone=true;hidePrompt();beatOn=true;beatT0=now;lastBeat=-1;
      [392,493.88,587.33,783.99].forEach((f,k)=>chime(f,k*.12,.13,3.6));
      sceneTimer=setTimeout(nextScene,1800*SPEED);
    }
  }
  /* interaction 6: tap a polaroid to open the memory */
  function openZoom(i){
    const v=visAt(16);
    zoomScale=Math.max(1.3,Math.min(2.8,v.h*(ASP>1?.4:.6)/(photoW*1.17),v.w*.8/photoW));
    zoomIdx=i;zoomClosing=false;
    $('noteTitle').textContent=MEMORIES[i].g+' · '+MEMORIES[i].title;
    noteEl.classList.add('on');noteEl.inert=false;finalEl.classList.remove('on');finalEl.inert=true;
    chime(PENTA[(i+3)%PENTA.length]*2,0,.12,2.4);
  }
  function closeZoom(){
    zoomClosing=true;noteEl.classList.remove('on');noteEl.inert=true;finalEl.classList.add('on');finalEl.inert=false;
  }
  function finalTap(x,y){
    if(zoomIdx>=0){if(!zoomClosing)closeZoom();return}
    for(let k=hits.length-1;k>=0;k--){
      const h=hits[k];
      if(Math.abs(x-h.sx)<h.hw*1.05&&Math.abs(y-h.sy)<h.hh*1.05){openZoom(h.i);return}
    }
    scatter();
  }

  function showFinal(){
    const v=visAt(26),hw=Math.min(v.w*.6,v.h*.44*32/29);
    ringRx=Math.min(hw*.74,v.w*.5-photoW*.7);ringRz=ringRx*(ASP>1?.6:.95);ringAy=Math.min(ringRx*.85,v.h*(ASP>1?.08:.15));photoYoff=v.h*.03;
    photosOn=true;photoT0=now;
    [523.25,659.25,783.99,1046.5,1318.5,1568].forEach((f,k)=>chime(f,k*.16,.12,3.8));
    setTimeout(()=>{finalReady=true;finalEl.classList.add('on');finalEl.inert=false;$('skipHint').textContent='Hawakan ang langit'},1800*SPEED);
  }
  function scatter(){
    if(!finalReady||tr.active)return;
    finalReady=false;scatterT=7;
    goTo('scatter',1500*SPEED,()=>{
      setTimeout(()=>{scatterT=2.4;goTo('heart',3000*SPEED,()=>{finalReady=true})},700*SPEED);
    });
    [783.99,987.77,1174.66,1567.98].forEach((f,k)=>chime(f,k*.07,.1,2.4));
  }
  function begin(){
    started=true;initAudio();if(AC&&AC.state==='suspended')AC.resume();
    plinkOn();
    introEl.classList.add('gone');introEl.inert=true;rootEl.classList.add('film');
    setTimeout(()=>playScene(0),1400*Math.min(1,SPEED+.3));
  }
  function replay(){
    clearTimeout(sceneTimer);
    finalReady=false;finalEl.classList.remove('on');finalEl.inert=true;photosOn=false;beatOn=false;
    capEl.classList.add('out');$('skipHint').textContent='Tap para lumaktaw';
    scatterT=2.4;locked=true;
    zoomIdx=-1;zoomClosing=false;zoomVal=0;noteEl.classList.remove('on');noteEl.inert=true;hidePrompt();hideAsk();
    goTo('galaxy',2800*SPEED,()=>{curForm='galaxy';playScene(0)});
  }
  $('startBtn').addEventListener('click',begin);
  $('againBtn').addEventListener('click',replay);

  /* ---------- input (DAGDAG: lahat ng coordinates ay relative sa container) ---------- */
  function setPtr(e){const[x,y]=local(e);ptrTX=(x/W)*2-1;ptrTY=1-(y/H)*2}
  function tapAction(x,y){
    if(!started)return;
    if(finalReady){finalTap(x,y);return}
    if(curGate==='beat'){beatTap();return}
    if(curGate)return;
    skip();
  }
  addW('pointermove',e=>{const[x,y]=local(e);tX=clamp((x/W-.5)*2,-1,1);tY=clamp((y/H-.5)*2,-1,1);setPtr(e)},{passive:true});
  canvas.addEventListener('pointerdown',e=>{
    down={lx:e.clientX,ly:e.clientY,moved:0};setPtr(e);
    if(curGate==='hold'&&!locked&&!holdDone)holding=true;
    try{canvas.setPointerCapture(e.pointerId)}catch{/* ok lang */}
  });
  canvas.addEventListener('pointermove',e=>{
    if(!down)return;
    const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);
    if(finalReady&&zoomIdx<0){userYaw+=dx*.006;userPitch=clamp(userPitch+dy*.004,-.7,.7)}
  });
  canvas.addEventListener('pointerup',e=>{
    holding=false;
    if(!down)return;const moved=down.moved;down=null;
    if(moved<10){const[x,y]=local(e);tapAction(x,y)}
  });
  canvas.addEventListener('pointercancel',()=>{down=null;holding=false});
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  actBtn.addEventListener('pointerdown',e=>{if(curGate==='hold'&&!locked&&!holdDone){holding=true;try{actBtn.setPointerCapture(e.pointerId)}catch{/* ok lang */}}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>actBtn.addEventListener(ev,()=>{holding=false}));
  actBtn.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&curGate==='hold'&&!locked&&!holdDone){holding=true;e.preventDefault()}});
  actBtn.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')holding=false});
  actBtn.addEventListener('click',()=>{if(curGate==='beat')beatTap()});
  actBtn.addEventListener('contextmenu',e=>e.preventDefault());

  /* ---------- render ---------- */
  const eye=[0,0,40];
  function drawQuad(tex,c,sx,sy,roll,rgba){
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.uniform3f(uQ.uCenter,c[0],c[1],c[2]);gl.uniform2f(uQ.uSz,sx,sy);gl.uniform1f(uQ.uRoll,roll);
    gl.uniform4f(uQ.uColor,rgba[0],rgba[1],rgba[2],rgba[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function photoList(t){
    const out=[];hits=[];
    if(!photosOn)return out;
    const el=(now-photoT0)/1000;
    for(let i=0;i<NP;i++){
      const p=clamp((now-photoT0-i*240*SPEED)/1400,0,1);if(p<=0)continue;
      const e=easeBack(p),a=i*TAU/NP+el*.14;
      let pos=[Math.cos(a)*ringRx*e,photoYoff-Math.sin(a)*ringAy*e+Math.sin(a*2+i)*.25*e,Math.sin(a)*ringRz*e];
      let roll=((i*53)%17-8)*Math.PI/180*1.2+Math.sin(t*.8+i)*.04,al=p,sz=1;
      if(zoomVal>.001){
        if(i===zoomIdx){const z=zoomVal;pos=[pos[0]*(1-z),pos[1]+(photoYoff-pos[1])*z,pos[2]+(11-pos[2])*z];sz=1+(zoomScale-1)*z;roll*=1-z;al=1}
        else al=p*(1-.72*zoomVal);
      }
      const ee=Math.max(.01,e)*sz,dx=pos[0]-eye[0],dy=pos[1]-eye[1],dz=pos[2]-eye[2];
      out.push({i:i,pos:pos,a:al,e:ee,d:dx*dx+dy*dy+dz*dz,roll:roll});
    }
    out.sort((m,n)=>n.d-m.d);
    out.forEach(o=>{
      const x_=vp[0]*o.pos[0]+vp[4]*o.pos[1]+vp[8]*o.pos[2]+vp[12],y_=vp[1]*o.pos[0]+vp[5]*o.pos[1]+vp[9]*o.pos[2]+vp[13],w_=vp[3]*o.pos[0]+vp[7]*o.pos[1]+vp[11]*o.pos[2]+vp[15];
      if(w_<=0)return;
      const half=(photoW*o.e*.5)*SCALE/w_/DPR;
      hits.push({i:o.i,sx:(x_/w_*.5+.5)*W,sy:(1-(y_/w_*.5+.5))*H,hw:half,hh:half*1.17});
    });
    return out;
  }
  function drawPhotos(list,right,up){
    gl.useProgram(pQ);enableAttribs(1);
    gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(uQ.uVP,false,vp);gl.uniform3f(uQ.uRight,right[0],right[1],right[2]);gl.uniform3f(uQ.uUp,up[0],up[1],up[2]);gl.uniform1i(uQ.uTex,0);
    list.forEach(o=>{
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      drawQuad(texGlow,o.pos,photoW*2.3*o.e,photoW*2.3*o.e,0,[1,.85,.55,.4*o.a]);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      drawQuad(photoTex[o.i],o.pos,photoW*o.e,photoW*1.17*o.e,o.roll,[1,1,1,o.a]);
    });
  }

  function ss(x){x=clamp(x,0,1);return x*x*(3-2*x)}
  function formAmt(name){
    if(tr.active){
      if(tr.name===name)return ss(uMix);
      if(curForm===name)return 1-ss(uMix);
      return 0;
    }
    return curForm===name?1:0;
  }
  function quadSetup(m,right,up){
    gl.useProgram(pQ);enableAttribs(1);
    gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(uQ.uVP,false,m);gl.uniform3f(uQ.uRight,right[0],right[1],right[2]);gl.uniform3f(uQ.uUp,up[0],up[1],up[2]);gl.uniform1i(uQ.uTex,0);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  }

  function frame(ts){
    now=ts;const dt=Math.min(.05,Math.max(0,(ts-last)/1000));last=ts;const t=ts/1000;

    if(tr.active){
      const p=clamp((now-tr.t0)/tr.dur,0,1);uMix=p;
      if(p>=1)finishTr();
    }
    const k=Math.min(1,dt*1.6);
    alphaC+=(alphaT-alphaC)*k;tintMixC+=(tintMixT-tintMixC)*k;jitC+=(jitT-jitC)*k;scatterC+=(scatterT-scatterC)*Math.min(1,dt*3);
    const boost=sizeBoostT?Math.max(0,1-(now-sizeBoostT)/2600):0;
    sizeC+=(sizeT*(1+boost*.2+charge*.5)-sizeC)*k;
    pitchC+=(pitchT-pitchC)*Math.min(1,dt*1.2);
    for(let c=0;c<3;c++)tintC[c]+=(tintT[c]-tintC[c])*k;

    const gate=curGate;
    if(gate==='hold'&&!locked&&!holdDone){
      if(holding)charge=Math.min(1,charge+dt/2.4);else charge=Math.max(0,charge-dt*.6);
      meterFill.style.transform='scaleX('+charge+')';
      starK=.28+.72*charge;
      if(charge>=1){holdDone=true;igniteDone()}
    }
    const fT=0;
    forceC+=(fT-forceC)*Math.min(1,dt*6);ptrCx+=(ptrTX-ptrCx)*Math.min(1,dt*12);ptrCy+=(ptrTY-ptrCy)*Math.min(1,dt*12);
    const zt=(zoomIdx>=0&&!zoomClosing)?1:0;
    zoomVal+=(zt-zoomVal)*Math.min(1,dt*5);
    if(zoomIdx>=0&&zoomClosing&&zoomVal<.02){zoomIdx=-1;zoomClosing=false;zoomVal=0}
    yawAuto+=dt*.05;
    const heartish=(curForm==='heart'||tr.name==='heart')&&!(tr.active&&tr.name==='galaxy');
    const swayAmp=(curForm==='t1'||curForm==='t2')?.07:(heartish?.42:0);
    const yawT=(curForm==='galaxy'&&!tr.active)||tr.name==='galaxy'?yawAuto:Math.sin(t*.45)*swayAmp;
    yawC+=(yawT-yawC)*Math.min(1,dt*1.5);
    if(!down&&!finalReady&&!photosOn){userYaw*=1-Math.min(1,dt*.8);userPitch*=1-Math.min(1,dt*.8)}

    camP[0]+=(camT[0]-camP[0])*Math.min(1,dt*.7);camP[1]+=(camT[1]-camP[1])*Math.min(1,dt*.7);camP[2]+=(camT[2]-camP[2])*Math.min(1,dt*.55);
    parX+=(tX-parX)*Math.min(1,dt*2.5);parY+=(tY-parY)*Math.min(1,dt*2.5);
    const shake=(!reduce&&boost>.05)?boost*.35:0;
    eye[0]=camP[0]+parX*.9+(shake?(Math.random()-.5)*shake:0);
    eye[1]=camP[1]+parY*.6+(shake?(Math.random()-.5)*shake:0)+(reduce?0:Math.sin(t*.3)*.15);
    if(!started)camP[2]=40-Math.min(5,t*.4);
    eye[2]=camP[2];
    lookAt(view,eye[0],eye[1],eye[2],0,lookYC,0);
    rotYX(model,yawC+userYaw,pitchC+userPitch);
    mul(mv,view,model);mul(vp,proj,view);
    viewRot.set(view);viewRot[12]=0;viewRot[13]=0;viewRot[14]=0;mul(svp,proj,viewRot);
    const right=[view[0],view[4],view[8]],up=[view[1],view[5],view[9]];

    if(beatOn){
      const b=Math.floor((now-beatT0)/860);
      if(b>lastBeat){lastBeat=b;beatPulseT=now;thump()}
    }
    const ph=(now-beatPulseT)/1000;
    const pulse=beatOn&&!reduce?(Math.exp(-ph*9)*.05+(ph>.19?Math.exp(-(ph-.19)*9)*.035:0)):0;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(.016,.016,.055,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);

    /* nebula */
    gl.useProgram(pQ);enableAttribs(1);
    gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(uQ.uVP,false,svp);gl.uniform3f(uQ.uRight,right[0],right[1],right[2]);gl.uniform3f(uQ.uUp,up[0],up[1],up[2]);gl.uniform1i(uQ.uTex,0);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    NEBS.forEach(n=>{
      const dr=reduce?0:Math.sin(t*.05+n.p)*6;
      drawQuad(texNeb,[n.x+dr-parX*3,n.y+Math.cos(t*.04+n.p)*4-parY*2,n.z],n.s,n.s,t*n.sp,[n.c[0],n.c[1],n.c[2],n.c[3]]);
    });
    /* far stars (use view rotation only) */
    gl.useProgram(pS);enableAttribs(2);
    gl.bindBuffer(gl.ARRAY_BUFFER,bStar);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bStarR);gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(uS.uVP,false,svp);gl.uniform1f(uS.uTime,t);gl.uniform1f(uS.uDpr,DPR);
    gl.drawArrays(gl.POINTS,0,NS);

    const plist=photoList(t);
    const back=plist.filter(o=>o.pos[2]<0),front=plist.filter(o=>o.pos[2]>=0);
    if(back.length)drawPhotos(back,right,up);

    /* particles: halo then core */
    gl.useProgram(pP);enableAttribs(4);
    gl.bindBuffer(gl.ARRAY_BUFFER,bFrom);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bTo);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bRand);gl.vertexAttribPointer(2,4,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,bCol);gl.vertexAttribPointer(3,3,gl.FLOAT,false,0,0);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.uniformMatrix4fv(uP.uMV,false,mv);gl.uniformMatrix4fv(uP.uProj,false,proj);
    gl.uniform1f(uP.uMix,uMix);gl.uniform1f(uP.uTime,t);gl.uniform1f(uP.uScale,SCALE);
    gl.uniform1f(uP.uScatter,scatterC);gl.uniform1f(uP.uJit,jitC+(gate==='hold'&&!holdDone?charge*2.5:0));gl.uniform2f(uP.uPtr,ptrCx,ptrCy);gl.uniform1f(uP.uForce,forceC);gl.uniform1f(uP.uRad,curForm==='galaxy'?5:14);gl.uniform1f(uP.uAsp,ASP);gl.uniform1f(uP.uPulse,pulse);
    gl.uniform3f(uP.uTint,tintC[0],tintC[1],tintC[2]);gl.uniform1f(uP.uTintMix,tintMixC);
    gl.uniform1f(uP.uSize,.62*sizeC);gl.uniform1f(uP.uAlpha,.05*alphaC);
    gl.drawArrays(gl.POINTS,0,C);
    gl.uniform1f(uP.uSize,.12*sizeC);gl.uniform1f(uP.uAlpha,.8*alphaC);
    gl.drawArrays(gl.POINTS,0,C);

    const sA=formAmt('star')*starK;
    if(sA>.01){
      quadSetup(vp,right,up);
      const v=visAt(Math.max(10,eye[2])),u=Math.min(v.w,v.h),fl=.94+.06*Math.sin(t*3.1),rp=(t*.45)%1,len=v.w*.9*sA,vl=v.h*.42*sA,dl=v.w*.38*sA;
      drawQuad(texRing,[0,0,0],u*(.3+.9*rp)*sA,u*(.3+.9*rp)*sA,0,[1,.92,.75,.6*(1-rp)*sA]);
      drawQuad(texNeedle,[0,0,0],len,len/42,0,[1,.97,.88,fl*sA]);
      drawQuad(texNeedle,[0,0,0],vl,vl/42,Math.PI/2,[1,.95,.85,.9*fl*sA]);
      drawQuad(texNeedle,[0,0,0],dl,dl/42,Math.PI/4,[1,.93,.8,.5*sA]);
      drawQuad(texNeedle,[0,0,0],dl,dl/42,-Math.PI/4,[1,.93,.8,.5*sA]);
      drawQuad(texCore,[0,0,0],u*.2*sA,u*.2*sA,0,[1,1,1,sA]);
    }
    if(front.length)drawPhotos(front,right,up);
    if(!dead)rafId=requestAnimationFrame(frame);
  }

  resize();
  rafId=requestAnimationFrame(frame);

  const base=teardown
  teardown=()=>{
    base()
    try{window.clearInterval(plinkTimer)}catch{/* ok lang */}
    try{if(AC&&AC.state!=='closed')AC.close()}catch{/* ok lang */}
    try{const x=gl&&gl.getExtension('WEBGL_lose_context');if(x)x.loseContext()}catch{/* ok lang */}
  }
})

onBeforeUnmount(()=>teardown())
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap");

/* Layout: maikling pelikula. WebGL na langit sa ilalim ng letterbox bars; caption sa ibaba na parang subtitle.
   DAGDAG: position absolute (hindi fixed) para manatili sa loob ng phone frame. */
.kon{
  --bg:#04040e;
  --ink:#eceeff;
  --muted:#a9aedb;
  --gold:#ffd98a;
  --rose:#ff9fb8;
  --edge:rgba(255,217,138,.3);
  --bar:44px;
  --font-display:'Instrument Serif','Iowan Old Style',Georgia,serif;
  --font-body:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-mono:'DM Mono',ui-monospace,Menlo,monospace;
  color-scheme:dark;
}
.kon{position:absolute;inset:0;overflow:hidden}
.kon{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);-webkit-font-smoothing:antialiased}
.kon [hidden]{display:none !important}
#gl{position:absolute;inset:0;width:100%;height:100%;display:block;background:var(--bg);touch-action:none}
.mono{font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}

.vig{position:absolute;inset:0;pointer-events:none;z-index:3;background:radial-gradient(ellipse at 50% 46%,transparent 48%,rgba(0,0,0,.72) 100%)}
.grain{position:absolute;inset:-50%;pointer-events:none;z-index:3;opacity:.10;animation:grain .9s steps(6) infinite;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
@keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-5%)}60%{transform:translate(-2%,-2%)}80%{transform:translate(5%,4%)}100%{transform:translate(0,0)}}
.flash{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(circle at 50% 46%,rgba(255,248,230,.85),rgba(255,226,170,.25) 16%,transparent 40%)}
.flash.go{animation:flash .9s ease-out}
@keyframes flash{0%{opacity:0}16%{opacity:1}100%{opacity:0}}
.bar{position:absolute;left:0;right:0;height:0;background:#000;z-index:5;transition:height 1.8s cubic-bezier(.2,.8,.2,1)}
.bar.top{top:0}
.bar.bot{bottom:0}
.kon.film .bar.top{height:var(--bar)}
.kon.film .bar.bot{height:var(--bar)}

.ui{position:absolute;inset:0;z-index:6;pointer-events:none}
.hud{position:absolute;left:0;right:0;top:calc(var(--bar) + 4px);padding:0 16px;
  display:flex;justify-content:space-between;align-items:center;gap:12px;color:var(--muted);opacity:0;transition:opacity 1.5s ease .8s}
.kon.film .hud{opacity:1}
.hud-r{display:flex;align-items:center;gap:12px}
.dots{display:flex;gap:6px}
.dots i{width:5px;height:5px;border-radius:50%;background:rgba(169,174,219,.35);transition:background .6s ease,transform .6s ease}
.dots i.on{background:var(--gold);transform:scale(1.5)}
.mute{pointer-events:auto;min-height:44px;min-width:44px;padding:0 4px;background:none;border:0;color:var(--muted);cursor:pointer}
.mute:hover{color:var(--gold)}
.mute:focus-visible,.btn:focus-visible{outline:2px solid var(--gold);outline-offset:3px}

.cap{position:absolute;left:0;right:0;margin:0;text-align:center;bottom:calc(var(--bar) + 26px);padding:0 18px;
  font:italic 400 28px/1.15 var(--font-display);font-size:clamp(22px,7.4cqi,40px);text-wrap:balance;text-shadow:0 0 30px rgba(255,217,138,.35),0 2px 14px rgba(0,0,0,.8)}
:deep(.cw){display:inline-block;opacity:0;animation:cw 1.2s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i) * .17s)}
.cap.out :deep(.cw){animation:cwout .65s ease forwards;animation-delay:0s}
@keyframes cw{from{opacity:0;transform:translateY(.5em);filter:blur(12px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes cwout{from{opacity:1}to{opacity:0;filter:blur(8px)}}

.btn{font:600 15px/1 var(--font-body);min-height:48px;padding:0 24px;border-radius:999px;border:1px solid var(--gold);background:rgba(255,217,138,.08);color:var(--gold);cursor:pointer;transition:background .2s ease,box-shadow .2s ease;pointer-events:auto}
.btn:hover{background:rgba(255,217,138,.18);box-shadow:0 0 24px rgba(255,217,138,.25)}

/* ===== DAGDAG: natitirang styles (naputol sa orihinal na code) ===== */
.intro{position:absolute;inset:0;display:flex;align-items:flex-end;padding:24px 22px 40px;
  background:linear-gradient(180deg,transparent 40%,rgba(4,4,14,.55) 100%);
  transition:opacity 1.2s ease,transform 1.4s ease}
.intro.gone{opacity:0;transform:scale(1.05);pointer-events:none}
.intro-in{display:flex;flex-direction:column;align-items:flex-start;gap:16px;max-width:34em}
.intro-in > .mono{color:var(--gold)}
.intro h1{margin:0;font:400 40px/1.04 var(--font-display);font-size:clamp(34px,11cqi,58px);letter-spacing:-.01em;text-wrap:balance;text-shadow:0 2px 20px rgba(0,0,0,.6)}
.intro .w{display:inline-block;opacity:0;animation:cw 1.4s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(.4s + var(--i) * .22s)}
.intro .em{font-style:italic;color:var(--gold)}
.intro p{margin:0;color:var(--muted);font-size:15px;line-height:1.5}
.late{opacity:0;animation:fadein 1.2s ease 1.9s forwards}
@keyframes fadein{to{opacity:1}}

.prompt,.ask,.final{position:absolute;left:50%;bottom:calc(var(--bar) + 110px);transform:translate(-50%,8px);
  display:flex;flex-direction:column;align-items:center;gap:12px;width:calc(100% - 32px);text-align:center;
  color:var(--gold);opacity:0;transition:opacity .8s ease,transform .8s ease}
.prompt.on,.ask.on,.final.on{opacity:1;transform:translate(-50%,0)}
.meter{width:180px;height:3px;border-radius:3px;background:rgba(255,217,138,.2);overflow:hidden}
.meter i{display:block;height:100%;background:var(--gold);transform:scaleX(0);transform-origin:left}
.pips{display:flex;gap:8px}
.pips i{width:8px;height:8px;border-radius:50%;border:1px solid var(--gold);transition:background .3s ease}
.pips i.on{background:var(--gold)}

.ask-form{display:flex;flex-direction:column;align-items:center;gap:10px}
.ask-row{display:flex;gap:8px}
.ask input{min-height:48px;width:150px;padding:0 16px;border:1px solid var(--edge);border-radius:999px;
  background:rgba(4,4,14,.6);color:var(--ink);font:400 16px var(--font-body);pointer-events:auto}
.ask input:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

.final{bottom:calc(var(--bar) + 20px)}
.final > .mono{color:var(--muted);line-height:1.7}
.final-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.final .btn{min-height:44px;padding:0 18px;font-size:14px}

.note{position:absolute;left:50%;bottom:calc(var(--bar) + 20px);transform:translate(-50%,8px);
  display:flex;flex-direction:column;gap:8px;width:calc(100% - 32px);max-width:420px;padding:16px 18px;
  border:1px solid var(--edge);border-radius:16px;background:rgba(4,4,14,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  color:var(--muted);opacity:0;pointer-events:none;transition:opacity .6s ease,transform .6s ease}
.note.on{opacity:1;transform:translate(-50%,0)}
.note #noteTitle{color:var(--gold)}
.note p{margin:0;color:var(--ink);font:italic 400 20px/1.3 var(--font-display)}

.nogl{position:absolute;inset:0;z-index:10;display:grid;place-items:center;padding:32px;text-align:center;
  color:var(--muted);background:var(--bg);line-height:1.5}

/* DAGDAG: landscape na phone / maikling screen: mas manipis ang bars, mas siksik ang text */
@container (max-height:620px){
  .kon{--bar:22px}
  .intro{padding:16px 22px 20px}
  .intro-in{gap:10px}
  .intro h1{font-size:clamp(28px,5cqi,40px)}
  .intro p{font-size:13px}
  .cap{bottom:calc(var(--bar) + 14px);font-size:clamp(20px,3.6cqi,30px)}
  .prompt,.ask{bottom:calc(var(--bar) + 70px)}
  .final{bottom:calc(var(--bar) + 10px);gap:8px}
  .note{bottom:calc(var(--bar) + 10px)}
}

@media (prefers-reduced-motion: reduce){
  .grain{animation:none}
  .intro .w,.late{animation-duration:.6s;animation-delay:0s}
}
</style>
