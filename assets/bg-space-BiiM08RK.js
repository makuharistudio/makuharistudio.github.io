import{S as oe,P as ae,W as ne,A as se,L as re,G as C,I as F,M as U,a as d,b as ie,T as G,c as k,d as x,e as ce,f as le,g as W,B as de,C as R,h as me,F as H,i as he,j as ue,k as pe,l as fe,V as D}from"./three.module-BMK5pwaj.js";const ve="/assets/planetary-mosaic-mars-1-BJ5MaV6c.jpg",we="/assets/planetary-mosaic-earth-1-_u7nelH2.jpg",Me="/assets/planetary-mosaic-earth-2-specular-BrwPnJHL.jpg",ge="/assets/planetary-mosaic-earth-3-bump-B6TehQDS.jpg",xe="/assets/planetary-mosaic-earth-4-lights-CpDOb4xs.jpg",ye="/assets/planetary-mosaic-earth-5-clouds-dVdUTghY.jpg",Se="/assets/planetary-mosaic-earth-6-cloudstransparent-gIwjUcvY.jpg",Pe="/assets/star-CvDPdGmF.png";function be({numStars:r=1200,radius:a=50,exclusionRadius:t=30}={}){function o(){let s;do s=Math.random()*a*1.5;while(s<t*1.25);const e=Math.random(),m=Math.random(),c=2*Math.PI*e,l=Math.acos(2*m-1);let y=s*Math.sin(l)*Math.cos(c),u=s*Math.sin(l)*Math.sin(c),S=s*Math.cos(l);return{pos:new D(y,u,S),hue:.6,minDist:s}}const i=[],n=[];for(let s=0;s<r;s++){const e=o(),m=new R().setHSL(e.hue,.2,Math.random());i.push(e.pos.x,e.pos.y,e.pos.z),n.push(m.r,m.g,m.b)}const h=new me;h.setAttribute("position",new H(i,3)),h.setAttribute("color",new H(n,3));const f=new G().load(Pe);f.colorSpace=he;const v=new ue({size:.2,vertexColors:!0,map:f,transparent:!0,alphaTest:.1,blending:x});return new pe(h,v)}function T({rimHex:r=35071,facingHex:a=0}={}){const t={color1:{value:new R(r)},color2:{value:new R(a)},fresnelBias:{value:.1},fresnelScale:{value:1},fresnelPower:{value:4}},o=`
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    varying float vReflectionFactor;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
      vec3 I = worldPosition.xyz - cameraPosition;
      vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,i=`
    uniform vec3 color1;
    uniform vec3 color2;
    varying float vReflectionFactor;
    void main() {
      float f = clamp(vReflectionFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
    }
  `;return new W({uniforms:t,vertexShader:o,fragmentShader:i,transparent:!0,blending:x})}function _e(){const r=`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,a=`
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
  `,t=new le(500,16,12),o=new W({vertexShader:r,fragmentShader:a,uniforms:{time:{value:0}},side:de,depthWrite:!1}),i=new d(t,o);return i.position.set(0,0,0),{mesh:i,update:n=>{o.uniforms.time.value=n}}}function Ce(r){const a=new oe;a.background=null;const t=new ae(75,window.innerWidth/window.innerHeight,.1,1e3);t.position.set(-1,-5.5,1.25),t.up.set(0,0,1),t.far=1e3,t.updateProjectionMatrix();const o=new ne({antialias:!0});o.setSize(window.innerWidth,window.innerHeight),o.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),o.toneMapping=se,o.outputColorSpace=re,r.appendChild(o.domElement);const i=_e();a.add(i.mesh);const n=new C;n.rotation.z=-3.4*Math.PI/180,n.rotation.x=90*Math.PI/180,a.add(n);const h=new F(3,5),f=new U({color:16775344,wireframe:!0}),v=new d(h,f);n.add(v);const s=new ie(16777198,1350,999999);s.position.set(0,0,0),s.castShadow=!1,a.add(s);const e=new C;a.add(e);const m=20,c=new G,l=new F(1,m),y=new k({map:c.load(we),specularMap:c.load(Me),bumpMap:c.load(ge),bumpScale:.04}),u=new d(l,y);e.add(u),u.rotation.x=Math.PI/2;const S=new U({map:c.load(xe),blending:x}),P=new d(l,S);e.add(P),P.rotation.x=Math.PI/2;const E=new ce({map:c.load(ye),transparent:!0,opacity:.8,blending:x,alphaMap:c.load(Se)}),w=new d(l,E);w.scale.setScalar(.5015),e.add(w),w.rotation.x=Math.PI/2;const V=T({rimHex:255}),M=new d(l,V);M.scale.setScalar(1.01),e.add(M),M.rotation.x=Math.PI/2,e.scale.set(.5,.5,.5);let Y=75e-5,b=0;const J=15.2,N=16,p=new C;a.add(p);const X=20,z=new F(1,X),q=new k({map:new G().load(ve)}),_=new d(z,q);p.add(_),_.rotation.x=Math.PI/2;const Q=T({rimHex:16711680}),g=new d(z,Q);g.scale.setScalar(1.01),p.add(g),g.rotation.x=Math.PI/2,p.scale.set(1,1,1);let K=25e-5,B=0;const I=30.4,j=32,Z=Math.max(I,j),L=be({numStars:1200,radius:50,exclusionRadius:Z});a.add(L);let $=new fe;function O(){if(requestAnimationFrame(O),document.hidden)return;const ee=$.getElapsedTime();i.update(ee),v.rotation.y+=.002,u.rotation.y+=.007,P.rotation.y+=.007,w.rotation.y+=.0073,M.rotation.y+=.007,_.rotation.y+=.007,g.rotation.y+=.007,b+=Y,e.position.set(n.position.x+J*Math.cos(b),n.position.y+N*Math.sin(b),0),B+=K,p.position.set(n.position.x+I*Math.cos(B),n.position.y+j*Math.sin(B),0);const te=new D(-7,1,2);t.position.copy(e.position).add(te),t.lookAt(e.position),L.rotation.y-=2e-4,o.render(a,t)}O();function A(){t.aspect=r.offsetWidth/r.offsetHeight,t.updateProjectionMatrix(),o.setSize(r.offsetWidth,r.offsetHeight)}return window.addEventListener("resize",A),()=>{window.removeEventListener("resize",A),r.removeChild(o.domElement)}}export{Ce as initialiseBackground};
