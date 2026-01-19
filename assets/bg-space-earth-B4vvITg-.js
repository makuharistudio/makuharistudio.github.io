import{S as ye,P as Se,W as be,A as Pe,L as _e,G as F,a as ee,M as Q,b as r,c as Be,T as oe,I as Z,d as K,e as x,f as Ge,B as te,g as Le,h as Re,i as ne,j as Ie,C as k,F as $,k as Ce,l as ze,m as He,n as je,V as g}from"./three.module-Dz4CEgl0.js";const Fe="/assets/planetary-mosaic-earth-1-_u7nelH2.jpg",Ue="/assets/planetary-mosaic-earth-2-specular-BrwPnJHL.jpg",ke="/assets/planetary-mosaic-earth-3-bump-B6TehQDS.jpg",Ae="/assets/planetary-mosaic-earth-4-lights-CpDOb4xs.jpg",Ee="/assets/planetary-mosaic-earth-5-clouds-dVdUTghY.jpg",We="/assets/planetary-mosaic-earth-6-cloudstransparent-gIwjUcvY.jpg",Te="/assets/moon-mosaic-luna-1-DZdU1icd.jpg",Ye="/assets/moon-mosaic-luna-1-bump-BROJ1aBL.jpg",De="/assets/star-CvDPdGmF.png";function Oe({numStars:c=1200,radius:o=200,exclusionRadius:a=60}={}){function e(){let s;do s=Math.random()*o*1.5;while(s<a*1.25);const m=Math.random(),u=Math.random(),f=2*Math.PI*m,t=Math.acos(2*u-1);let G=s*Math.sin(t)*Math.cos(f),i=s*Math.sin(t)*Math.sin(f),v=s*Math.cos(t);return{pos:new g(G,i,v),hue:.6,minDist:s}}const l=[],p=[];for(let s=0;s<c;s++){const m=e(),u=new k().setHSL(m.hue,.2,Math.random()*.7+.3);l.push(m.pos.x,m.pos.y,m.pos.z),p.push(u.r,u.g,u.b)}const d=new te;d.setAttribute("position",new $(l,3)),d.setAttribute("color",new $(p,3));const M=new oe().load(De);M.colorSpace=Ce;const B=new ze({size:.5,vertexColors:!0,map:M,transparent:!0,alphaTest:.08,blending:x});return new He(d,B)}function U({rimHex:c=3381759,facingHex:o=0}={}){const a={color1:{value:new k(c)},color2:{value:new k(o)},fresnelBias:{value:.08},fresnelScale:{value:1.1},fresnelPower:{value:3.8}},e=`
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
  `,l=`
    uniform vec3 color1;
    uniform vec3 color2;
    varying float vReflectionFactor;
    void main() {
      float f = clamp(vReflectionFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(color2, color1, f), f * 0.85);
    }
  `;return new ne({uniforms:a,vertexShader:e,fragmentShader:l,transparent:!0,blending:x})}function Xe(){const c=`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,o=`
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
  `,a=new ee(1e3,16,12),e=new ne({vertexShader:c,fragmentShader:o,uniforms:{time:{value:0}},side:Ie,depthWrite:!1});return{mesh:new r(a,e),update:p=>{e.uniforms.time.value=p}}}function Ne(c){const o=new ye;o.background=null;const a=new Se(60,window.innerWidth/window.innerHeight,.1,2e3),e=new be({antialias:!0,alpha:!0});e.setSize(window.innerWidth,window.innerHeight),e.setPixelRatio(Math.min(window.devicePixelRatio,1.6)),e.toneMapping=Pe,e.outputColorSpace=_e,c.appendChild(e.domElement);const l=Xe();o.add(l.mesh);const p=Oe({numStars:3e3,radius:200,exclusionRadius:100});o.add(p);const d=new F;d.rotation.z=-3.4*Math.PI/180,o.add(d);const M=new ee(3.2,32,24),B=new Q({color:16777215,transparent:!0,opacity:1}),s=new r(M,B);d.add(s);const m=U({rimHex:16777164,facingHex:16768324}),u=new r(M,m);u.scale.setScalar(1.18),d.add(u);const f=new Be(16777215,2200,0);f.decay=1.5,f.position.set(0,0,0),o.add(f);const t=new F;o.add(t);const G=22,i=new oe,v=new Z(1,G),ae=new K({map:i.load(Fe),specularMap:i.load(Ue),bumpMap:i.load(ke),bumpScale:.035,shininess:12}),L=new r(v,ae);t.add(L),L.rotation.x=Math.PI/2;const se=new Q({map:i.load(Ae),blending:x}),R=new r(v,se);t.add(R),R.rotation.x=Math.PI/2;const ie=new Ge({map:i.load(Ee),transparent:!0,opacity:.85,alphaMap:i.load(We),blending:x}),y=new r(v,ie);y.scale.setScalar(1.004),t.add(y),y.rotation.x=Math.PI/2;const re=U({rimHex:8965375}),S=new r(v,re);S.scale.setScalar(1.012),t.add(S),S.rotation.x=Math.PI/2,t.scale.setScalar(5.8);const b=new F;t.add(b);const ce=1/3.67,A=new Z(ce,12),le=new K({map:i.load(Te),bumpMap:i.load(Ye),bumpScale:.06,shininess:5}),E=new r(A,le);b.add(E);const de=U({rimHex:11184810,facingHex:0}),W=new r(A,de);W.scale.setScalar(1.04),b.add(W);const T=8;let I=Math.random()*Math.PI*2;const me=.0032,Y=100,D=100,O=[],X=128;for(let n=0;n<=X;n++){const h=n/X*Math.PI*2,w=Y*Math.cos(h),_=D*Math.sin(h),j=0;O.push(new g(w,_,j))}const ue=new te().setFromPoints(O),he=new Le({color:16777215,transparent:!0,opacity:0,blending:x,linewidth:1.5}),pe=new Re(ue,he);o.add(pe);let C=Math.random()*Math.PI*2;const we=6e-4;let V=0,J=0,z=0,H=0;const P=n=>{let h=n.clientX||(n.touches&&n.touches[0]?n.touches[0].clientX:window.innerWidth/2),w=n.clientY||(n.touches&&n.touches[0]?n.touches[0].clientY:window.innerHeight/2);V=h/window.innerWidth*2-1,J=-(w/window.innerHeight)*2+1};window.addEventListener("mousemove",P),window.addEventListener("touchmove",P,{passive:!0});let fe=new je;function N(){if(requestAnimationFrame(N),document.hidden)return;const n=fe.getElapsedTime();l.update(n),p.rotation.y-=15e-5,s.rotation.y+=.002,L.rotation.y+=.0072*.15,R.rotation.y+=.0072*.15,y.rotation.y-=.0075*.075,S.rotation.y+=.0072*.15,C+=we,t.position.set(Math.cos(C)*Y,Math.sin(C)*D,0),I+=me,b.position.set(Math.cos(I)*T,Math.sin(I)*T,0),E.rotation.y+=.004,z+=(V-z)*.02,H+=(J-H)*.02;const h=15,w=.3*Math.PI-H*Math.PI*.2,_=z*Math.PI*.5,j=new g(h*Math.sin(w)*Math.cos(_),h*Math.sin(w)*Math.sin(_),h*Math.cos(w));a.position.copy(t.position).add(j);const ve=new g(0,0,1).normalize(),Me=1*5.8,ge=ve.multiplyScalar(Me*1.3),xe=t.position.clone().add(ge);a.lookAt(xe),a.up.copy(new g(0,0,1)),e.render(o,a)}N();function q(){a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener("resize",q),()=>{window.removeEventListener("resize",q),window.removeEventListener("mousemove",P),window.removeEventListener("touchmove",P),e.dispose(),c.removeChild(e.domElement)}}export{Ne as initialiseBackground};
