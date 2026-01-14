import{S as de,P as he,W as ue,A as me,L as fe,G as Y,a as O,M as D,b as w,c as we,T as N,I as pe,d as ve,e as x,f as Me,B as q,g as ge,h as xe,i as J,j as ye,C as F,F as X,k as Pe,l as Se,m as be,n as _e,V as g}from"./three.module-Dz4CEgl0.js";const Be="/assets/planetary-mosaic-earth-1-_u7nelH2.jpg",Le="/assets/planetary-mosaic-earth-2-specular-BrwPnJHL.jpg",Ge="/assets/planetary-mosaic-earth-3-bump-B6TehQDS.jpg",Ie="/assets/planetary-mosaic-earth-4-lights-CpDOb4xs.jpg",Ce="/assets/planetary-mosaic-earth-5-clouds-dVdUTghY.jpg",Re="/assets/planetary-mosaic-earth-6-cloudstransparent-gIwjUcvY.jpg",ze="/assets/star-CvDPdGmF.png";function Fe({numStars:i=1200,radius:t=200,exclusionRadius:a=60}={}){function e(){let s;do s=Math.random()*t*1.5;while(s<a*1.25);const l=Math.random(),d=Math.random(),p=2*Math.PI*l,n=Math.acos(2*d-1);let B=s*Math.sin(n)*Math.cos(p),h=s*Math.sin(n)*Math.sin(p),v=s*Math.cos(n);return{pos:new g(B,h,v),hue:.6,minDist:s}}const r=[],m=[];for(let s=0;s<i;s++){const l=e(),d=new F().setHSL(l.hue,.2,Math.random()*.7+.3);r.push(l.pos.x,l.pos.y,l.pos.z),m.push(d.r,d.g,d.b)}const c=new q;c.setAttribute("position",new X(r,3)),c.setAttribute("color",new X(m,3));const M=new N().load(ze);M.colorSpace=Pe;const _=new Se({size:.5,vertexColors:!0,map:M,transparent:!0,alphaTest:.08,blending:x});return new be(c,_)}function V({rimHex:i=3381759,facingHex:t=0}={}){const a={color1:{value:new F(i)},color2:{value:new F(t)},fresnelBias:{value:.08},fresnelScale:{value:1.1},fresnelPower:{value:3.8}},e=`
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    varying float vReflectionFactor;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
      vec3 I = worldPosition.xyz - cameraPosition;
      vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,r=`
    uniform vec3 color1;
    uniform vec3 color2;
    varying float vReflectionFactor;
    void main() {
      float f = clamp(vReflectionFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(color2, color1, f), f * 0.85);
    }
  `;return new J({uniforms:a,vertexShader:e,fragmentShader:r,transparent:!0,blending:x})}function He(){const i=`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,t=`
    varying vec2 vUv;
    uniform float time;
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }
    void main() {
      vec2 scaledUv = vUv * 30.0;
      float n1 = noise(scaledUv + vec2(time * 0.1, 0.0));
      float n2 = noise(scaledUv + vec2(0.0, time * 0.1));
      float n = noise(scaledUv + vec2(n1, n2));
      vec3 color1 = vec3(0.0, 0.04, 0.08);
      vec3 color2 = vec3(0.004, 0.012, 0.016);
      vec3 color3 = vec3(0.009, 0.009, 0.009);
      vec3 color = mix(color1, color2, n);
      color = mix(color, color3, n * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,a=new O(1e3,16,12),e=new J({vertexShader:i,fragmentShader:t,uniforms:{time:{value:0}},side:ye,depthWrite:!1});return{mesh:new w(a,e),update:m=>{e.uniforms.time.value=m}}}function ke(i){const t=new de;t.background=null;const a=new he(60,window.innerWidth/window.innerHeight,.1,2e3),e=new ue({antialias:!0,alpha:!0});e.setSize(window.innerWidth,window.innerHeight),e.setPixelRatio(Math.min(window.devicePixelRatio,1.6)),e.toneMapping=me,e.outputColorSpace=fe,i.appendChild(e.domElement);const r=He();t.add(r.mesh);const m=Fe({numStars:3e3,radius:200,exclusionRadius:100});t.add(m);const c=new Y;c.rotation.z=-3.4*Math.PI/180,t.add(c);const M=new O(3.2,32,24),_=new D({color:16777215,transparent:!0,opacity:1}),s=new w(M,_);c.add(s);const l=V({rimHex:16777164,facingHex:16768324}),d=new w(M,l);d.scale.setScalar(1.18),c.add(d);const p=new we(16777215,2200,0);p.decay=1.5,p.position.set(0,0,0),t.add(p);const n=new Y;t.add(n);const B=22,h=new N,v=new pe(1,B),Q=new ve({map:h.load(Be),specularMap:h.load(Le),bumpMap:h.load(Ge),bumpScale:.035,shininess:12}),L=new w(v,Q);n.add(L),L.rotation.x=Math.PI/2;const K=new D({map:h.load(Ie),blending:x}),G=new w(v,K);n.add(G),G.rotation.x=Math.PI/2;const Z=new Me({map:h.load(Ce),transparent:!0,opacity:.85,alphaMap:h.load(Re),blending:x}),y=new w(v,Z);y.scale.setScalar(1.004),n.add(y),y.rotation.x=Math.PI/2;const $=V({rimHex:8965375}),P=new w(v,$);P.scale.setScalar(1.012),n.add(P),P.rotation.x=Math.PI/2,n.scale.setScalar(5.8);const H=100,j=100,U=[],k=128;for(let o=0;o<=k;o++){const u=o/k*Math.PI*2,f=H*Math.cos(u),b=j*Math.sin(u),z=0;U.push(new g(f,b,z))}const ee=new q().setFromPoints(U),te=new ge({color:16777215,transparent:!0,opacity:0,blending:x,linewidth:1.5}),oe=new xe(ee,te);t.add(oe);let I=Math.random()*Math.PI*2;const ne=6e-4;let E=0,W=0,C=0,R=0;const S=o=>{let u=o.clientX||(o.touches&&o.touches[0]?o.touches[0].clientX:window.innerWidth/2),f=o.clientY||(o.touches&&o.touches[0]?o.touches[0].clientY:window.innerHeight/2);E=u/window.innerWidth*2-1,W=-(f/window.innerHeight)*2+1};window.addEventListener("mousemove",S),window.addEventListener("touchmove",S,{passive:!0});let ae=new _e;function A(){if(requestAnimationFrame(A),document.hidden)return;const o=ae.getElapsedTime();r.update(o),m.rotation.y-=15e-5,s.rotation.y+=.002,L.rotation.y+=.0072*.15,G.rotation.y+=.0072*.15,y.rotation.y-=.0075*.075,P.rotation.y+=.0072*.15,I+=ne,n.position.set(Math.cos(I)*H,Math.sin(I)*j,0),C+=(E-C)*.02,R+=(W-R)*.02;const u=15,f=.3*Math.PI-R*Math.PI*.2,b=C*Math.PI*.5,z=new g(u*Math.sin(f)*Math.cos(b),u*Math.sin(f)*Math.sin(b),u*Math.cos(f));a.position.copy(n.position).add(z);const se=new g(0,0,1).normalize(),ie=1*5.8,re=se.multiplyScalar(ie*1.3),ce=n.position.clone().add(re);a.lookAt(ce);const le=new g(0,0,1);a.up.copy(le),e.render(t,a)}A();function T(){a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener("resize",T),()=>{window.removeEventListener("resize",T),window.removeEventListener("mousemove",S),window.removeEventListener("touchmove",S),e.dispose(),i.removeChild(e.domElement)}}export{ke as initialiseBackground};
