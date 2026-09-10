// A damped height-field wave simulation. Pointer impulses displace the water;
// neighboring cells propagate that energy, so waves interfere and settle.
const canvas = document.querySelector('#liquid');
const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
const error = document.querySelector('#error');
if (!gl) {
  error.hidden = false;
  error.textContent = 'Water rendering needs WebGL. Please enable hardware acceleration.';
} else {
  try { start(); } catch (e) {
    error.hidden = false;
    error.textContent = 'The water preview could not start. Please reload or try another browser.';
    console.error(e);
  }
}
function start() {
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;
    varying vec2 uv; uniform sampler2D water; uniform vec2 texel;
    uniform vec2 resolution; uniform float time; uniform float dark;
    float height(vec2 q){vec2 c=texture2D(water,q).rg;return (c.r*255.*256.+c.g*255.)/65535.*4.-2.;}
    float softNoise(vec2 q){return sin(q.x*1.7+sin(q.y*1.3))*.5+sin(q.y*2.1-q.x*.8)*.25;}
    void main(){
      vec2 q=vec2(uv.x,1.-uv.y);
      float h=height(q);
      float l=height(q-vec2(texel.x,0.)),r=height(q+vec2(texel.x,0.));
      float u=height(q-vec2(0.,texel.y)),d=height(q+vec2(0.,texel.y));
      vec2 slope=vec2(r-l,d-u);
      vec3 n=normalize(vec3(-slope*5.,1.));
      vec2 plane=vec2(q.x*resolution.x/resolution.y,q.y);
      vec2 refracted=plane+slope*.13;
      float cloud=softNoise(refracted*2.3+vec2(time*.012,-time*.008));
      vec3 day=mix(vec3(.65,.57,.81),vec3(.87,.79,.86),clamp(.48+cloud*.25-q.y*.1,0.,1.));
      vec3 night=mix(vec3(.065,.045,.14),vec3(.20,.16,.31),.45+cloud*.28);
      vec3 col=mix(day,night,dark);
      // Broad reflected skylight, distorted by the actual surface normal.
      vec2 reflection=plane+slope*1.5;
      float sky=exp(-pow((reflection.x+reflection.y*.45-.55)*1.3,2.));
      col+=sky*mix(vec3(.10,.14,.13),vec3(.025,.07,.09),dark);
      float ridge=abs(h-(l+r+u+d)*.25);
      float glint=pow(max(dot(n,normalize(vec3(-.35,-.5,1.))),0.),45.);
      float disturbance=smoothstep(.003,.1,length(slope));
      float thickness=h*9.+length(slope)*13.;
      vec3 pearl=.62+.38*cos(vec3(.2,2.3,4.4)+thickness);
      col=mix(col,pearl,disturbance*.32);
      float silk=pow(.5+.5*sin(thickness*3.),10.)*disturbance;
      col+=silk*vec3(.18,.10,.20);
      // Paired dark troughs and bright crests make wave curvature readable.
      col+=pearl*(glint*.48+ridge*1.2)*disturbance;
      float curvature=(l+r+u+d-4.*h);
      col+=clamp(curvature*2.4,-.14,.14)*vec3(.7,.88,.86);
      vec2 caustic=plane*13.+slope*2.5;
      float bed=sin(caustic.x+sin(caustic.y*.8))*sin(caustic.y+sin(caustic.x*.7));
      col+=pow(abs(bed),12.)*.022*(1.-dark*.6);
      col-=max(0.,dot(slope,vec2(.7,1.)))*.45;
      col+=max(0.,-dot(slope,vec2(.7,1.)))*vec3(.26,.32,.34);
      float vignette=smoothstep(.2,.95,length((q-.5)*vec2(1.,.85)));
      col*=1.-vignette*.16;
      gl_FragColor=vec4(col,1.);
    }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const loc=Object.fromEntries(['water','texel','resolution','time','dark'].map(k=>[k,gl.getUniformLocation(program,k)]));
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  let w,h,nx,ny,current,previous,next,pixels,vx,vy,ax,ay,ac,ap,flow=1,trail=1,demo=false,paused=false,dark=false;
  let time=0,last=0,accumulator=0,pointer=null,pending=null,lastDemo=null,lastPointerTime=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');paused=reduced.matches;
  function resize(){w=innerWidth;h=innerHeight;const scale=Math.min(1.5,devicePixelRatio);canvas.width=w*scale;canvas.height=h*scale;gl.viewport(0,0,canvas.width,canvas.height);
    nx=Math.min(360,Math.max(150,Math.round(w/4)));ny=Math.max(90,Math.round(nx*h/w));current=new Float32Array(nx*ny);previous=new Float32Array(nx*ny);next=new Float32Array(nx*ny);pixels=new Uint8Array(nx*ny*4);vx=new Float32Array(nx*ny);vy=new Float32Array(nx*ny);ax=new Float32Array(nx*ny);ay=new Float32Array(nx*ny);ac=new Float32Array(nx*ny);ap=new Float32Array(nx*ny);pointer=null;pending=null;
    gl.uniform2f(loc.texel,1/nx,1/ny);gl.uniform2f(loc.resolution,w,h);upload();render();}
  function upload(){for(let i=0;i<current.length;i++){const v=Math.round((Math.max(-2,Math.min(2,current[i]))+2)*16383.75);pixels[i*4]=v>>8;pixels[i*4+1]=v&255;pixels[i*4+3]=255;}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,nx,ny,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);}
  function impulse(x,y,amount){const gx=x/w*nx,gy=y/h*ny,radius=2.8;for(let j=Math.max(1,Math.floor(gy-9));j<Math.min(ny-1,gy+9);j++)for(let i=Math.max(1,Math.floor(gx-9));i<Math.min(nx-1,gx+9);i++){const r2=((i-gx)**2+(j-gy)**2)/(radius*radius);const push=Math.exp(-r2)*amount;current[j*nx+i]-=push;previous[j*nx+i]-=push*.65;}}
  function stir(x,y,dx,dy,power){
    const gx=x/w*nx,gy=y/h*ny;
    // A moving fingertip injects momentum and counter-rotating eddies.
    for(let j=Math.max(1,Math.floor(gy-12));j<Math.min(ny-1,gy+12);j++)for(let i=Math.max(1,Math.floor(gx-12));i<Math.min(nx-1,gx+12);i++){
      const rx=i-gx,ry=j-gy,weight=Math.exp(-(rx*rx+ry*ry)/36),side=rx*(-dy)+ry*dx;
      const spin=Math.tanh(side*.5)*power*.12,index=j*nx+i;
      vx[index]=Math.max(-1.8,Math.min(1.8,vx[index]+(dx*power-ry*spin)*weight));
      vy[index]=Math.max(-1.8,Math.min(1.8,vy[index]+(dy*power+rx*spin)*weight));
    }
  }
  function move(p){
    if(!pointer){pointer=p;lastPointerTime=p.at;return;}
    const dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.hypot(dx,dy);
    const elapsed=Math.max(1/240,Math.min(.05,(p.at-lastPointerTime)/1000||1/60));
    const speed=dist/elapsed;
    if(dist>.3){
      const steps=Math.min(32,Math.ceil(dist/6)),response=Math.min(1.8,speed/650);
      const amount=(.045+response*.14)*flow/Math.sqrt(steps);
      for(let i=1;i<=steps;i++){
        const x=pointer.x+dx*i/steps,y=pointer.y+dy*i/steps;
        impulse(x,y,amount);stir(x,y,dx/dist,dy/dist,response*.55/Math.sqrt(steps));
      }
    }
    pointer=p;lastPointerTime=p.at;
  }
  canvas.addEventListener('pointermove',e=>{pending={x:e.clientX,y:e.clientY,at:e.timeStamp};if(demo){demo=false;sync();}});
  canvas.addEventListener('pointerleave',()=>{pointer=null;pending=null;});
  canvas.addEventListener('pointerdown',e=>{if(!paused)impulse(e.clientX,e.clientY,.38*flow);pending={x:e.clientX,y:e.clientY,at:e.timeStamp};});
  function sample(field,x,y){
    x=Math.max(0,Math.min(nx-1.001,x));y=Math.max(0,Math.min(ny-1.001,y));
    const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,i=iy*nx+ix;
    return (field[i]*(1-fx)+field[i+1]*fx)*(1-fy)+(field[i+nx]*(1-fx)+field[i+nx+1]*fx)*fy;
  }
  function simulate(){
    // Semi-Lagrangian transport carries the waves with the pointer's flow.
    for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){
      const i=y*nx+x,bx=x-vx[i],by=y-vy[i];
      ac[i]=sample(current,bx,by);ap[i]=sample(previous,bx,by);
      ax[i]=sample(vx,bx,by)*.973;ay[i]=sample(vy,bx,by)*.973;
    }
    [current,ac]=[ac,current];[previous,ap]=[ap,previous];[vx,ax]=[ax,vx];[vy,ay]=[ay,vy];
    const damping=1-.018/trail;
    for(let y=1;y<ny-1;y++)for(let x=1;x<nx-1;x++){
      const i=y*nx+x,lap=current[i-1]+current[i+1]+current[i-nx]+current[i+nx]-4*current[i];
      const edge=Math.min(x,y,nx-1-x,ny-1-y);
      const absorb=edge<14? .94+edge*.004:1;
      next[i]=(current[i]+(current[i]-previous[i])*damping+.28*lap)*absorb;
    }
    const old=previous;previous=current;current=next;next=old;
  }
  function render(){gl.uniform1f(loc.time,time);gl.uniform1f(loc.dark,dark?1:0);gl.drawArrays(gl.TRIANGLES,0,6);}
  function sync(){const d=document.querySelector('#demo'),p=document.querySelector('#pause');d.setAttribute('aria-pressed',demo);d.textContent=demo?'Stop demo':'Play demo';p.setAttribute('aria-pressed',paused);p.textContent=paused?'Resume':'Pause';}
  document.querySelector('#flow').oninput=e=>flow=+e.target.value;
  document.querySelector('#trail').oninput=e=>trail=+e.target.value;
  document.querySelector('#demo').onclick=()=>{demo=!demo;paused=false;pointer=null;lastDemo=null;sync();};
  document.querySelector('#pause').onclick=()=>{paused=!paused;pending=null;pointer=null;sync();};
  const theme=document.querySelector('#theme');
  function setTheme(value){dark=value;document.body.classList.toggle('dark',dark);theme.textContent=dark?'Daylight':'Moonlight';render();}
  theme.onclick=()=>setTheme(!dark);
  reduced.addEventListener('change',e=>{paused=e.matches;sync();});
  addEventListener('resize',resize);resize();setTheme(matchMedia('(prefers-color-scheme: dark)').matches);sync();
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000||0,.05);last=now;if(paused||document.hidden)return;time+=dt;accumulator+=dt;
    if(demo){const p={x:w*(.5+.23*Math.sin(time*.48)),y:h*(.5+.17*Math.sin(time*.73)),at:now};if(!lastDemo)pointer=p;pending=p;lastDemo=p;}
    if(pending){move(pending);pending=null;}
    while(accumulator>=1/60){simulate();accumulator-=1/60;}
    upload();render();
  }
  requestAnimationFrame(frame);
}
