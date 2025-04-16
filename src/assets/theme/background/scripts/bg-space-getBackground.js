// bg-space-getBackground.js
import * as THREE from 'three';

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec2 vUv;
  uniform float time;

  // Simple 2D noise function
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
`;

function getBackground() {
  // Create a large sphere geometry to act as the background
  const geometry = new THREE.SphereGeometry(500, 32, 32); // Radius of 500

  // Create a shader material with the vertex and fragment shaders
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      time: { value: 0.0 },
    },
    side: THREE.BackSide, // Render the inside of the sphere
    depthWrite: false, // Disable depth writing
  });

  // Create the mesh
  const backgroundMesh = new THREE.Mesh(geometry, material);

  // Center the sphere at the origin
  backgroundMesh.position.set(0, 0, 0);

  // Return the mesh and a function to update the time uniform for animation
  return {
    mesh: backgroundMesh,
    update: (time) => {
      material.uniforms.time.value = time;
    },
  };
}

export default getBackground;