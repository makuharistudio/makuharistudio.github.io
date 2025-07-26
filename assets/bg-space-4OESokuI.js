import{S as fe,P as ve,W as we,A as Me,L as ge,O as xe,G as I,I as R,M as X,a as m,b as ye,T as j,c as q,d as S,e as be,B as k,f as Q,g as K,h as Pe,i as ee,j as Se,C as A,F as Z,k as _e,l as Oe,m as Le,n as ze,V as P}from"./OrbitControls-C-CyZXdv.js";const Fe="/assets/planetary-mosaic-mars-1-BJ5MaV6c.jpg",Ce="/assets/planetary-mosaic-earth-1-_u7nelH2.jpg",Be="/assets/planetary-mosaic-earth-2-specular-BrwPnJHL.jpg",Ge="/assets/planetary-mosaic-earth-3-bump-B6TehQDS.jpg",Ie="/assets/planetary-mosaic-earth-4-lights-CpDOb4xs.jpg",Re="/assets/planetary-mosaic-earth-5-clouds-dVdUTghY.jpg",je="/assets/planetary-mosaic-earth-6-cloudstransparent-gIwjUcvY.jpg",ke="/assets/star-CvDPdGmF.png";function Ae({numStars:r=500,radius:e=250,exclusionRadius:t=30}={}){function a(){let s;do s=Math.random()*e*1.5;while(s<t*1.25);const n=Math.random(),p=Math.random(),c=2*Math.PI*n,d=Math.acos(2*p-1);let _=s*Math.sin(d)*Math.cos(c),v=s*Math.sin(d)*Math.sin(c),O=s*Math.cos(d);return{pos:new P(_,v,O),hue:.6,minDist:s}}const i=[],h=[];let o;for(let s=0;s<r;s+=1){let n=a();const{pos:p,hue:c}=n;o=new A().setHSL(c,.2,Math.random()),i.push(p.x,p.y,p.z),h.push(o.r,o.g,o.b)}const f=new k;f.setAttribute("position",new Z(i,3)),f.setAttribute("color",new Z(h,3));const M=new j().load(ke);M.colorSpace=_e;const g=new Oe({size:.2,vertexColors:!0,map:M,transparent:!0,alphaTest:.1,blending:S});return new Le(f,g)}function $({rimHex:r=35071,facingHex:e=0}={}){const t={color1:{value:new A(r)},color2:{value:new A(e)},fresnelBias:{value:.1},fresnelScale:{value:1},fresnelPower:{value:4}},a=`
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  varying float vReflectionFactor;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
    vec3 I = worldPosition.xyz - cameraPosition;
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
    gl_Position = projectionMatrix * mvPosition;
  }
  `,i=`
  uniform vec3 color1;
  uniform vec3 color2;
  varying float vReflectionFactor;
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;return new ee({uniforms:t,vertexShader:a,fragmentShader:i,transparent:!0,blending:S})}function Ue(){const r=`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,e=`
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
      vec3 color1 = vec3(0.0, 0.1, 0.2); 
      vec3 color2 = vec3(0.01, 0.03, 0.04);
      vec3 color3 = vec3(0.025, 0.025, 0.025); 
      vec3 color = mix(color1, color2, n);
      color = mix(color, color3, n * 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,t=new Pe(500,32,32),a=new ee({vertexShader:r,fragmentShader:e,uniforms:{time:{value:0}},side:Se,depthWrite:!1}),i=new m(t,a);return i.position.set(0,0,0),{mesh:i,update:h=>{a.uniforms.time.value=h}}}function He(r){const e=new fe;e.background=null;const t=new ve(75,window.innerWidth/window.innerHeight,.1,1e3);t.position.set(-1,-5.5,1.25),t.up.set(0,0,1),t.far=1e3,t.updateProjectionMatrix();const a=new we({antialias:!0});a.setSize(window.innerWidth,window.innerHeight),r.appendChild(a.domElement),a.toneMapping=Me,a.outputColorSpace=ge;const i=new xe(t,a.domElement);i.enabled=!1;const h=Ue();e.add(h.mesh);const o=new I;o.rotation.z=-3.4*Math.PI/180,o.rotation.x=90*Math.PI/180,o.position.set(0,0,0),e.add(o);const f=new R(3,5),M=new X({color:16775344,wireframe:!0}),g=new m(f,M);o.add(g);const s=new ye(16777198,1350,1e22);s.position.set(0,0,0),s.castShadow=!0,e.add(s);const n=new I;e.add(n);const p=60,c=new j,d=new R(1,p),_=new q({map:c.load(Ce),specularMap:c.load(Be),bumpMap:c.load(Ge),bumpScale:.04}),v=new m(d,_);n.add(v),v.rotation.x=Math.PI/2;const O=new X({map:c.load(Ie),blending:S}),L=new m(d,O);n.add(L),L.rotation.x=Math.PI/2;const te=new be({map:c.load(Re),transparent:!0,opacity:.8,blending:S,alphaMap:c.load(je)}),x=new m(d,te);x.scale.setScalar(.5015),n.add(x),x.rotation.x=Math.PI/2;const ae=$({rimHex:255}),y=new m(d,ae);y.scale.setScalar(1.01),n.add(y),y.rotation.x=Math.PI/2,n.scale.set(.5,.5,.5);let oe=75e-5,z=0;const U=15.2,D=16,H=[];for(let l=0;l<=360;l++){const u=l*Math.PI/180;H.push(new P(U*Math.cos(u),D*Math.sin(u),0))}const ne=new k().setFromPoints(H),se=new Q({color:16777215,dashSize:1,gapSize:0,transparent:!0,opacity:0}),T=new K(ne,se);T.computeLineDistances(),e.add(T);const w=new I;e.add(w);const re=60,ie=new j,W=new R(1,re),ce=new q({map:ie.load(Fe)}),F=new m(W,ce);w.add(F),F.rotation.x=Math.PI/2;const le=$({rimHex:16711680}),b=new m(W,le);b.scale.setScalar(1.01),w.add(b),b.rotation.x=Math.PI/2,w.scale.set(1,1,1);let de=25e-5,C=0;const B=30.4,G=32,E=[];for(let l=0;l<=360;l++){const u=l*Math.PI/180;E.push(new P(B*Math.cos(u),G*Math.sin(u),0))}const me=new k().setFromPoints(E),he=new Q({color:16777215,dashSize:1,gapSize:0,transparent:!0,opacity:0}),V=new K(me,he);V.computeLineDistances(),e.add(V);const pe=Math.max(B,G),Y=Ae({numStars:7500,radius:50,exclusionRadius:pe});e.add(Y);let ue=new ze;function J(){requestAnimationFrame(J);const l=ue.getElapsedTime();h.update(l),g.rotation.y+=.002,v.rotation.y+=.007,L.rotation.y+=.007,x.rotation.y+=.0073,y.rotation.y+=.007,F.rotation.y+=.007,b.rotation.y+=.007,z+=oe,n.position.set(o.position.x+U*Math.cos(z),o.position.y+D*Math.sin(z),0),C+=de,w.position.set(o.position.x+B*Math.cos(C),o.position.y+G*Math.sin(C),0);const u=new P(-7,1,2);t.position.copy(n.position).add(u),t.lookAt(n.position),i.target.copy(n.position),Y.rotation.y-=2e-4,i.update(),a.render(e,t)}J();function N(){t.aspect=r.offsetWidth/r.offsetHeight,t.updateProjectionMatrix(),a.setSize(r.offsetWidth,r.offsetHeight)}return window.addEventListener("resize",N),()=>{window.removeEventListener("resize",N),r.removeChild(a.domElement)}}export{He as initialiseBackground};
