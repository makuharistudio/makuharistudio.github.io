import{S as Se,P as be,W as Pe,A as ye,s as _e,G as k,h as ee,e as Z,d as r,t as Ge,T as oe,I as K,c as Q,f as x,g as Be,B as te,n as Le,L as Re,r as ne,u as Ie,q as E,F as $,a as ze,j as Ce,k as Fe,C as He,V as g}from"./three.module-DA6eG0wX.js";import{e as ke,a as Ae,b as Ee,c as We,d as Ue,f as je}from"./planetary-mosaic-earth-6-cloudstransparent-CIHhVhej.js";const Oe="/assets/moon-mosaic-luna-1-DZdU1icd.jpg",Te="/assets/moon-mosaic-luna-1-bump-BROJ1aBL.jpg",Xe="/assets/star-CvDPdGmF.png";function Ye({numStars:c=1200,radius:o=200,exclusionRadius:a=60}={}){function e(){let s;do s=Math.random()*o*1.5;while(s<a*1.25);const u=Math.random(),m=Math.random(),p=2*Math.PI*u,t=Math.acos(2*m-1);let B=s*Math.sin(t)*Math.cos(p),i=s*Math.sin(t)*Math.sin(p),v=s*Math.cos(t);return{pos:new g(B,i,v),hue:.6,minDist:s}}const l=[],f=[];for(let s=0;s<c;s++){const u=e(),m=new E().setHSL(u.hue,.2,Math.random()*.7+.3);l.push(u.pos.x,u.pos.y,u.pos.z),f.push(m.r,m.g,m.b)}const d=new te;d.setAttribute("position",new $(l,3)),d.setAttribute("color",new $(f,3));const M=new oe().load(Xe);M.colorSpace=ze;const G=new Ce({size:.5,vertexColors:!0,map:M,transparent:!0,alphaTest:.08,blending:x});return new Fe(d,G)}function A({rimHex:c=3381759,facingHex:o=0}={}){const a={color1:{value:new E(c)},color2:{value:new E(o)},fresnelBias:{value:.08},fresnelScale:{value:1.1},fresnelPower:{value:3.8}},e=`
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
  `;return new ne({uniforms:a,vertexShader:e,fragmentShader:l,transparent:!0,blending:x})}function De(){const c=`
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
  `,a=new ee(1e3,16,12),e=new ne({vertexShader:c,fragmentShader:o,uniforms:{time:{value:0}},side:Ie,depthWrite:!1});return{mesh:new r(a,e),update:f=>{e.uniforms.time.value=f}}}function Je(c){const o=new Se;o.background=null;const a=new be(60,window.innerWidth/window.innerHeight,.1,2e3),e=new Pe({antialias:!0,alpha:!0});e.setSize(window.innerWidth,window.innerHeight),e.setPixelRatio(Math.min(window.devicePixelRatio,1.6)),e.toneMapping=ye,e.outputColorSpace=_e,c.appendChild(e.domElement);const l=De();o.add(l.mesh);const f=Ye({numStars:3e3,radius:200,exclusionRadius:100});o.add(f);const d=new k;d.rotation.z=-3.4*Math.PI/180,o.add(d);const M=new ee(3.2,32,24),G=new Z({color:16777215,transparent:!0,opacity:1}),s=new r(M,G);d.add(s);const u=A({rimHex:16777164,facingHex:16768324}),m=new r(M,u);m.scale.setScalar(1.18),d.add(m);const p=new Ge(16777215,2200,0);p.decay=1.5,p.position.set(0,0,0),o.add(p);const t=new k;o.add(t);const B=22,i=new oe,v=new K(1,B),ae=new Q({map:i.load(Ee),specularMap:i.load(Ae),bumpMap:i.load(ke),bumpScale:.035,shininess:12}),L=new r(v,ae);t.add(L),L.rotation.x=Math.PI/2;const se=new Z({map:i.load(We),blending:x}),R=new r(v,se);t.add(R),R.rotation.x=Math.PI/2;const ie=new Be({map:i.load(je),transparent:!0,opacity:.85,alphaMap:i.load(Ue),blending:x}),S=new r(v,ie);S.scale.setScalar(1.004),t.add(S),S.rotation.x=Math.PI/2;const re=A({rimHex:8965375}),b=new r(v,re);b.scale.setScalar(1.012),t.add(b),b.rotation.x=Math.PI/2,t.scale.setScalar(5.8);const P=new k;t.add(P);const ce=1/3.67,W=new K(ce,12),le=new Q({map:i.load(Oe),bumpMap:i.load(Te),bumpScale:.06,shininess:5}),U=new r(W,le);P.add(U);const de=A({rimHex:11184810,facingHex:0}),j=new r(W,de);j.scale.setScalar(1.04),P.add(j);const O=8;let I=Math.random()*Math.PI*2;const ue=.0032,T=100,X=100,Y=[],D=128;for(let n=0;n<=D;n++){const h=n/D*Math.PI*2,w=T*Math.cos(h),_=X*Math.sin(h),H=0;Y.push(new g(w,_,H))}const me=new te().setFromPoints(Y),he=new Le({color:16777215,transparent:!0,opacity:0,blending:x,linewidth:1.5}),fe=new Re(me,he);o.add(fe);let z=Math.random()*Math.PI*2;const we=6e-4;let V=0,q=0,C=0,F=0;const y=n=>{let h=n.clientX||(n.touches&&n.touches[0]?n.touches[0].clientX:window.innerWidth/2),w=n.clientY||(n.touches&&n.touches[0]?n.touches[0].clientY:window.innerHeight/2);V=h/window.innerWidth*2-1,q=-(w/window.innerHeight)*2+1};window.addEventListener("mousemove",y),window.addEventListener("touchmove",y,{passive:!0});let pe=new He;function N(){if(requestAnimationFrame(N),document.hidden)return;const n=pe.getElapsedTime();l.update(n),f.rotation.y-=15e-5,s.rotation.y+=.002,L.rotation.y+=.0072*.15,R.rotation.y+=.0072*.15,S.rotation.y-=.0075*.075,b.rotation.y+=.0072*.15,z+=we,t.position.set(Math.cos(z)*T,Math.sin(z)*X,0),I+=ue,P.position.set(Math.cos(I)*O,Math.sin(I)*O,0),U.rotation.y+=.004,C+=(V-C)*.02,F+=(q-F)*.02;const h=15,w=.3*Math.PI-F*Math.PI*.2,_=C*Math.PI*.5,H=new g(h*Math.sin(w)*Math.cos(_),h*Math.sin(w)*Math.sin(_),h*Math.cos(w));a.position.copy(t.position).add(H);const ve=new g(0,0,1).normalize(),Me=1*5.8,ge=ve.multiplyScalar(Me*1.3),xe=t.position.clone().add(ge);a.lookAt(xe),a.up.copy(new g(0,0,1)),e.render(o,a)}N();function J(){a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener("resize",J),()=>{window.removeEventListener("resize",J),window.removeEventListener("mousemove",y),window.removeEventListener("touchmove",y),e.dispose(),c.removeChild(e.domElement)}}export{Je as initialiseBackground};
