import{S as G,P as L,W as B,O as D,h as E,M as F,j as W,a as x,B as R,o as p,F as P,p as H,q as k,r as A,G as q,D as I,i as O,C as z,s as C,N as V,n as U,V as y}from"./OrbitControls-C-CyZXdv.js";function j(){const e=window.innerWidth/window.innerHeight,o=75*Math.PI/180,t=.55*(2*5*Math.tan(o/2))/(2/Math.sqrt(1+e*e)),s=new E(t,32,32),r=new F({color:65280,wireframe:!0,side:W,transparent:!0,opacity:0}),i=new x(s,r);return i.position.set(0,0,0),{mesh:i,update:()=>{},radius:t}}function _(e){const o=new R,a=[],t=.5*(e/10),s=t*Math.sqrt(3),r=Math.ceil(e/(1.5*t)),i=Math.ceil(e/s);for(let l=-r;l<=r;l++)for(let w=-i;w<=i;w++){const c=t*1.5*l,d=s*(w+l%2*.5);if(Math.sqrt(c*c+d*d)<=e*.5){const f=[new p(c+t*Math.cos(0),d+t*Math.sin(0)),new p(c+t*Math.cos(Math.PI/3),d+t*Math.sin(Math.PI/3)),new p(c+t*Math.cos(2*Math.PI/3),d+t*Math.sin(2*Math.PI/3)),new p(c+t*Math.cos(Math.PI),d+t*Math.sin(Math.PI)),new p(c+t*Math.cos(4*Math.PI/3),d+t*Math.sin(4*Math.PI/3)),new p(c+t*Math.cos(5*Math.PI/3),d+t*Math.sin(5*Math.PI/3)),new p(c+t*Math.cos(0),d+t*Math.sin(0))];for(let g=0;g<f.length-1;g++){const u=f[g],M=f[g+1],m=e*.1*(1-Math.sqrt(u.x*u.x+u.y*u.y)/(e*.5));a.push(u.x,u.y,m,M.x,M.y,m)}}}o.setAttribute("position",new P(a,3));const h=new H({color:26316,transparent:!0,opacity:.5}),n=new k(o,h);return n.position.set(0,e*-.8,0),n.rotation.set(-Math.PI/2,0,0),{mesh:n,update:l=>{const w=.5+.5*Math.sin(l*2*Math.PI/3);h.color.setHSL(.58,1,.4+.2*w),h.opacity=.5+.5*w}}}function T(e){const o=e*.8,a=new A(.5*(e/10),.5*(e/10),o,16),t=new F({color:16729344,wireframe:!0}),s=new x(a,t);return s.position.set(0,e*-.3,0),s}function N(e,o,a){const t=e*Math.sqrt(.4375),s=t*.95,r=2*o/24*Math.PI*2,i=(2*o+1)/24*Math.PI*2;return[new y(t*Math.cos(r),a,t*Math.sin(r)),new y(t*Math.cos(i),a,t*Math.sin(i)),new y(s*Math.cos(i),a,s*Math.sin(i)),new y(s*Math.cos(r),a,s*Math.sin(r))]}function X(e){const o=new q,a=-e*.75,t=12,s=e*.1,r=new F({color:8440063,transparent:!0,side:I,opacity:.85}),i=new O({uniforms:{color:{value:new z(8440063)},glow:{value:.5},fadeStart:{value:.7}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 color;
      uniform float glow;
      uniform float fadeStart;
      varying vec2 vUv;
      void main() {
        float baseOpacity = 0.3;
        float glowFactor = 0.2 + 0.2 * glow;
        float opacity;
        if (vUv.y < fadeStart) {
          opacity = baseOpacity * glowFactor;
        } else {
          float t = (vUv.y - fadeStart) / (1.0 - fadeStart);
          opacity = baseOpacity * (1.0 - t) * glowFactor;
        }
        gl_FragColor = vec4(color, opacity);
      }
    `,transparent:!0,side:I,depthWrite:!1});for(let h=0;h<t;h++){const n=N(e,h,a),l=new R,w=[n[0].x,n[0].y,n[0].z,n[1].x,n[1].y,n[1].z,n[2].x,n[2].y,n[2].z,n[3].x,n[3].y,n[3].z],c=[0,1,2,0,2,3];l.setAttribute("position",new P(w,3)),l.setIndex(c);const d=new x(l,r);d.renderOrder=1,o.add(d),[[n[0],n[1]],[n[1],n[2]],[n[2],n[3]],[n[3],n[0]]].forEach(([g,u])=>{const M=[g.x,g.y,g.z,u.x,u.y,u.z,u.x,u.y+s,u.z,g.x,g.y+s,g.z],m=new R;m.setAttribute("position",new P(M,3)),m.setAttribute("uv",new P([0,0,1,0,1,1,0,1],2)),m.setIndex([0,1,2,0,2,3]);const v=new x(m,i);v.renderOrder=0,o.add(v)})}return{rectMesh:o,update:h=>{const n=.5+.5*Math.sin(h*2*Math.PI/5);r.opacity=.7+.3*n,i.uniforms.glow.value=n,o.rotation.y=h*.1}}}function Z(e){const o=e*.05,a=e*.1,t=e*.3,s=new C(a,o,8,64),r=new O({uniforms:{color:{value:new z(10348031)},glow:{value:.5},ringRadius:{value:a},tubeRadius:{value:o},baseOpacity:{value:1}},vertexShader:`
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 color;
      uniform float glow;
      uniform float ringRadius;
      uniform float tubeRadius;
      uniform float baseOpacity;
      varying vec3 vPosition;
      void main() {
        float r = length(vPosition.xy); // Distance from ring center in xy-plane
        float distFromCenter = abs(r - ringRadius); // Distance from the ring's centerline
        float maxDist = tubeRadius; // Maximum distance (edge of the tube)
        float edgeOpacity = 1.0 - distFromCenter / maxDist; // Linear fade from center to edges
        edgeOpacity = clamp(edgeOpacity, 0.0, 1.0); // Ensure edge opacity stays within bounds
        float opacity = baseOpacity * edgeOpacity * (0.7 + 0.3 * glow); // Combine base opacity, edge fade, and glow
        gl_FragColor = vec4(color, opacity);
      }
    `,transparent:!0,side:I,depthWrite:!1,blending:V}),i=new x(s,r);return i.scale.set(1,1,.075),i.position.set(0,e*-.695,0),i.rotation.set(Math.PI/2,0,0),i.renderOrder=2,{mesh:i,update:h=>{const l=h%3/3,w=a+(t-a)*l;i.geometry.dispose(),i.geometry=new C(w,o,8,64),r.uniforms.ringRadius.value=w;let c;l<.5?c=.7*(l/.5):c=.7*(1-(l-.5)/.5),r.uniforms.baseOpacity.value=c;const d=.5+.5*Math.sin(h*2*Math.PI/5);r.uniforms.glow.value=d,i.rotation.z=h*.05}}}function K(e){const o=new G;o.background=null;const a=new L(75,window.innerWidth/window.innerHeight,.1,1e3),t=j(),s=t.radius;a.position.set(0,0,0);const r=new B({antialias:!0});r.setSize(window.innerWidth,window.innerHeight),e.appendChild(r.domElement),o.add(t.mesh);const i=_(s);o.add(i.mesh);const h=T(s);o.add(h);const n=X(s);o.add(n.rectMesh);const l=Z(s);o.add(l.mesh);const w=new y(0,0,s*.15),c=new D(a,r.domElement);c.enableRotate=!1,c.enableZoom=!1,c.enablePan=!1,c.enableDamping=!0,c.dampingFactor=.05;let d=0;const f=m=>{d=m.clientX/window.innerWidth*2-1};window.addEventListener("mousemove",f);let g=new U;function u(){requestAnimationFrame(u);const m=g.getElapsedTime();i.update(m),n.update(m),l.update(m);const v=s,b=.7*Math.PI,S=d*Math.PI*.5;a.position.set(v*Math.sin(b)*Math.cos(S),v*Math.sin(b)*Math.sin(S),v*Math.cos(b)),a.lookAt(w),c.target.copy(w),c.update(),r.render(o,a)}u();function M(){a.aspect=e.offsetWidth/e.offsetHeight,a.updateProjectionMatrix(),r.setSize(e.offsetWidth,e.offsetHeight)}return window.addEventListener("resize",M),()=>{window.removeEventListener("resize",M),window.removeEventListener("mousemove",f),e.removeChild(r.domElement)}}export{K as initialiseBackground};
