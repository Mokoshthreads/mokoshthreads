import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.12.5';
import { ScrollTrigger } from 'https://cdn.skypack.dev/gsap@3.12.5/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 8);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

function makeParticleTexture() {
  const size = 96;
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = size;
  particleCanvas.height = size;
  const ctx = particleCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 210, 130, 1)');
  gradient.addColorStop(0.28, 'rgba(255, 120, 48, 0.85)');
  gradient.addColorStop(1, 'rgba(255, 120, 48, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(particleCanvas);
}

function createParticles({ count, spread, size, opacity, color }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread.x;
    positions[i3 + 1] = (Math.random() - 0.5) * spread.y;
    positions[i3 + 2] = (Math.random() - 0.5) * spread.z;
    speeds[i] = 0.25 + Math.random() * 0.85;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size,
    map: makeParticleTexture(),
    transparent: true,
    opacity,
    color,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  points.userData.speeds = speeds;
  points.userData.spread = spread;
  return points;
}

const emberCount = isMobile ? 95 : 180;
const mistCount = isMobile ? 70 : 130;

const embers = createParticles({
  count: emberCount,
  spread: { x: 13, y: 9, z: 8 },
  size: isMobile ? 0.08 : 0.06,
  opacity: 0.8,
  color: 0xff9c48
});
scene.add(embers);

const mist = createParticles({
  count: mistCount,
  spread: { x: 15, y: 7, z: 5 },
  size: isMobile ? 0.18 : 0.14,
  opacity: 0.16,
  color: 0x98b8b0
});
mist.position.y = -1.8;
scene.add(mist);

const portalGroup = new THREE.Group();
const ringGeometry = new THREE.TorusGeometry(1.55, 0.012, 8, 160);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xd8a84f,
  transparent: true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending
});

for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = i * 0.55;
  ring.scale.setScalar(1 + i * 0.11);
  portalGroup.add(ring);
}
portalGroup.position.set(0, 0.15, 1.5);
scene.add(portalGroup);

let scrollProgress = 0;
ScrollTrigger.create({
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: self => {
    scrollProgress = self.progress;
    camera.position.z = 8 - self.progress * 2.2;
    camera.position.y = -self.progress * 0.7;

    const portalPower = THREE.MathUtils.smoothstep(self.progress, 0.72, 1);
    portalGroup.children.forEach((ring, index) => {
      ring.material.opacity = portalPower * (0.18 + index * 0.08);
      ring.scale.setScalar((1 + index * 0.12) + portalPower * 0.22);
    });
  }
});

gsap.utils.toArray('.reveal').forEach((element) => {
  gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: 1.25,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 82%'
    }
  });
});

gsap.utils.toArray('.reveal-img').forEach((element) => {
  gsap.to(element, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.35,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 84%'
    }
  });
});

gsap.to('.branches', {
  yPercent: 10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-scene',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

gsap.to('.thread', {
  yPercent: -35,
  opacity: 0.2,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-scene',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

const pointer = new THREE.Vector2(0, 0);
window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

function animateParticles(points, elapsed, lift, drift) {
  const positions = points.geometry.attributes.position.array;
  const speeds = points.userData.speeds;
  const spread = points.userData.spread;

  for (let i = 0; i < speeds.length; i++) {
    const i3 = i * 3;
    positions[i3] += Math.sin(elapsed * speeds[i] + i) * drift;
    positions[i3 + 1] += lift * speeds[i];

    if (positions[i3 + 1] > spread.y / 2) {
      positions[i3 + 1] = -spread.y / 2;
      positions[i3] = (Math.random() - 0.5) * spread.x;
      positions[i3 + 2] = (Math.random() - 0.5) * spread.z;
    }
  }

  points.geometry.attributes.position.needsUpdate = true;
}

const clock = new THREE.Clock();
function render() {
  const elapsed = clock.getElapsedTime();

  if (!prefersReducedMotion) {
    animateParticles(embers, elapsed, 0.009, 0.0008);
    animateParticles(mist, elapsed, 0.0025, 0.00045);
    embers.rotation.y = elapsed * 0.025 + pointer.x * 0.05;
    mist.rotation.y = -elapsed * 0.012 + pointer.x * 0.025;
    portalGroup.rotation.z = elapsed * 0.08 + scrollProgress;
    portalGroup.rotation.y = pointer.x * 0.08;
    portalGroup.rotation.x = pointer.y * 0.04;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
});
