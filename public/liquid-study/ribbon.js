// Isolated WebGL material study. No portfolio imports or global listeners outside this page.
const canvas = document.querySelector('#liquid');
const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
const error = document.querySelector('#error');
if (!gl || !gl.getExtension('OES_standard_derivatives')) {
  error.hidden = false;
  error.textContent = 'This study needs WebGL. Try a browser with hardware acceleration enabled.';
} else {
  start();
}

function start() {
  const vertex = `attribute vec3 position; attribute vec2 uv;
    uniform vec2 resolution; varying vec3 p; varying vec2 v;
    void main(){ p=position; v=uv; vec2 xy=position.xy;
      gl_Position=vec4(xy.x/resolution.x*2.-1.,1.-xy.y/resolution.y*2.,position.z/2000.,1.); }`;
  const fragment = `#extension GL_OES_standard_derivatives : enable
    precision highp float; varying vec3 p; varying vec2 v;
    uniform float time; uniform float orb; uniform float strength;
    vec3 film(float a){return .57+.43*cos(6.28318*(vec3(.02,.34,.62)+a));}
    void main(){
      if(orb>.5){
        vec2 q=v*2.-1.; float r=dot(q,q); if(r>1.)discard;
        vec3 n=vec3(q,sqrt(1.-r));
        float f=pow(1.-n.z,2.);
        float light=max(0.,dot(n,normalize(vec3(-.5,-.65,1.))));
        float spec=pow(light,36.);
        vec3 col=mix(vec3(.86,.79,.96),film(n.z*.35+q.x*.12+time*.015),.38);
        col+=spec*.85+f*vec3(.2,.3,.34);
        float ring=pow(.5+.5*sin(sqrt(r)*46.-n.z*7.),9.)*.1;
        gl_FragColor=vec4(col+ring,(.58+f*.4+spec*.2)*smoothstep(1.,.93,r));return;
      }
      vec3 n=normalize(cross(dFdx(p),dFdy(p)));
      float crease=sin(v.y*66.+v.x*30.+sin(v.x*38.-time*1.5)*2.3);
      float micro=sin(v.y*155.+v.x*78.+time)*.12;
      float facing=abs(n.z);
      vec3 col=film(facing*.6+n.x*.25+crease*.055+micro*.04+time*.015);
      col=mix(col,vec3(1.,.76,.96),.24);
      float spec=pow(abs(dot(n,normalize(vec3(-.45,-.6,1.)))),20.);
      float edge=pow(abs(v.y*2.-1.),22.);
      float threads=pow(.5+.5*crease,16.);
      float fade=pow(1.-v.x,1.15)*smoothstep(0.,.025,v.x);
      float breakup=smoothstep(-.65,.1,sin(v.x*170.+v.y*42.)+1.4-v.x*1.5);
      float alpha=(.11+threads*.21+spec*.35+edge*.58)*fade*strength*breakup;
      col+=spec*.6+edge*.3;
      gl_FragColor=vec4(col,alpha);
    }`;
  function shader(type, source) {
    const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));
    return s;
  }
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const uniforms=Object.fromEntries(['resolution','time','orb','strength'].map(k=>[k,gl.getUniformLocation(program,k)]));
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [name,size,offset] of [['position',3,0],['uv',2,12]]){
    const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,20,offset);
  }
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  const rows=160, cols=28, mesh=new Float32Array(rows*cols*6*5);
  const grid=new Float32Array((rows+1)*(cols+1)*5);
  let w=innerWidth,h=innerHeight, flow=1,trail=1,demo=false,paused=false;
  let x=w*.65,y=h*.5,tx=x,ty=y,last=0,t=0,lastInput=-100,energy=0;
  let history=[];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  paused=reduced.matches;
  function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio,1.75);canvas.width=w*dpr;canvas.height=h*dpr;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.resolution,w,h);history=[];}
  addEventListener('resize',resize);resize();
  canvas.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;lastInput=t;if(demo){demo=false;sync();}});
  canvas.addEventListener('pointerdown',e=>{tx=e.clientX;ty=e.clientY;lastInput=t;});
  document.querySelector('#flow').oninput=e=>flow=+e.target.value;
  document.querySelector('#trail').oninput=e=>trail=+e.target.value;
  document.querySelector('#demo').onclick=()=>{demo=!demo;paused=false;sync();};
  document.querySelector('#pause').onclick=()=>{paused=!paused;sync();};
  const theme=document.querySelector('#theme');
  function setTheme(dark){document.body.classList.toggle('dark',dark);theme.textContent=dark?'Light background':'Dark background';}
  setTheme(matchMedia('(prefers-color-scheme: dark)').matches);
  theme.onclick=()=>setTheme(!document.body.classList.contains('dark'));
  function sync(){document.querySelector('#demo').setAttribute('aria-pressed',demo);document.querySelector('#demo').textContent=demo?'Stop demo':'Play demo';document.querySelector('#pause').setAttribute('aria-pressed',paused);document.querySelector('#pause').textContent=paused?'Resume':'Pause';}
  reduced.addEventListener('change',e=>{paused=e.matches;sync();});sync();
  function draw(data,orb){gl.uniform1f(uniforms.orb,orb);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,data.length/5);}
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min((now-last)/1000||.016, .033);last=now;
    if(paused||document.hidden)return;t+=dt;
    if(demo){tx=w*(.5+.29*Math.sin(t*.85));ty=h*(.49+.22*Math.sin(t*1.35+.6));lastInput=t;}
    const oldX=x,oldY=y, follow=1-Math.exp(-dt*16);
    x+=(tx-x)*follow;y+=(ty-y)*follow;
    const speed=Math.hypot(x-oldX,y-oldY)/dt;
    energy+=(Math.min(speed/650,1)-energy)*(1-Math.exp(-dt*5));
    history.unshift({x,y,time:t,speed});
    const lifetime=1.65*trail;
    history=history.filter(p=>t-p.time<lifetime);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uniforms.time,t);gl.uniform1f(uniforms.strength,1.1);
    if(history.length>3){
      for(let i=0;i<=rows;i++){
        const a=i/rows, f=a*(history.length-1), k=Math.floor(f), frac=f-k;
        const A=history[k],B=history[Math.min(k+1,history.length-1)];
        const cx=A.x+(B.x-A.x)*frac,cy=A.y+(B.y-A.y)*frac;
        const prev=history[Math.max(0,k-2)],next=history[Math.min(history.length-1,k+2)];
        const dx=prev.x-next.x,dy=prev.y-next.y,len=Math.hypot(dx,dy)||1;
        const age=t-A.time;
        const width=Math.sin(Math.PI*Math.pow(a,.7))*(25+Math.min(A.speed*.105,100))*flow;
        for(let j=0;j<=cols;j++){
          const v=j/cols,b=v*2-1;
          const fold=Math.sin(a*23+b*5-t*2.2), flutter=Math.sin(a*59-b*9+t*2.8);
          const spread=b*width*(.8+.2*fold);
          const drift=Math.sin(a*10+t)*age*9;
          const offset=(i*(cols+1)+j)*5;
          grid[offset]=cx-dy/len*spread+dx/len*flutter*age*2+drift;
          grid[offset+1]=cy+dx/len*spread+age*age*13;
          grid[offset+2]=Math.sin(b*4+a*19-t*2)*width*.48+flutter*width*.1;
          grid[offset+3]=a;grid[offset+4]=v;
        }
      }
      let n=0;
      for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
        const a=i*(cols+1)+j,b=a+cols+1;
        for(const index of [a,b,a+1,a+1,b,b+1]){const k=index*5;for(let c=0;c<5;c++)mesh[n++]=grid[k+c];}
      }
      draw(mesh,0);
    }
    if(t-lastInput<5){
      const r=12+energy*3;
      const data=new Float32Array([x-r,y-r,0,0,0,x+r,y-r,0,1,0,x-r,y+r,0,0,1,x-r,y+r,0,0,1,x+r,y-r,0,1,0,x+r,y+r,0,1,1]);draw(data,1);
    }
  }
  requestAnimationFrame(frame);
}
