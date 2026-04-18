import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router';

export default function Onboarding() {
  const mountRef = useRef(null);
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  function handleEnter() {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => navigate('/home'), 750);
  }

  useEffect(() => {
    const container = mountRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Generate text particle positions using offscreen 2D canvas
    const offCanvas = document.createElement('canvas');
    const ctx = offCanvas.getContext('2d');
    offCanvas.width = 1024;
    offCanvas.height = 256;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dubloo', offCanvas.width / 2, offCanvas.height / 2);

    const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const sampledPoints = [];
    const gap = 3;

    for (let y = 0; y < offCanvas.height; y += gap) {
      for (let x = 0; x < offCanvas.width; x += gap) {
        const i = (y * offCanvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          sampledPoints.push({
            x: (x - offCanvas.width / 2) * 0.55,
            y: -(y - offCanvas.height / 2) * 0.55,
            z: (Math.random() - 0.5) * 30
          });
        }
      }
    }

    const count = sampledPoints.length;
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('#1e88e5'),
      new THREE.Color('#00e676'),
      new THREE.Color('#4fc3f7'),
      new THREE.Color('#00bcd4'),
      new THREE.Color('#26c6da'),
    ];

    for (let i = 0; i < count; i++) {
      const p = sampledPoints[i];
      // Start scattered, then animate in
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      originalPositions[i * 3] = p.x;
      originalPositions[i * 3 + 1] = p.y;
      originalPositions[i * 3 + 2] = p.z;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Background starfield — dense, gently twinkling stars
    const bgCount = 15000;
    const bgPositions = new Float32Array(bgCount * 3);
    const bgColors = new Float32Array(bgCount * 3);
    const bgPhases = new Float32Array(bgCount);
    const bgSpeeds = new Float32Array(bgCount);
    for (let i = 0; i < bgCount; i++) {
      bgPositions[i * 3] = (Math.random() - 0.5) * 1800;
      bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      bgPositions[i * 3 + 2] = -100 - Math.random() * 600;
      const brightness = 0.15 + Math.random() * 0.35;
      bgColors[i * 3] = brightness * 0.4;
      bgColors[i * 3 + 1] = brightness * 0.6;
      bgColors[i * 3 + 2] = brightness;
      bgPhases[i] = Math.random() * Math.PI * 2;
      bgSpeeds[i] = 0.3 + Math.random() * 0.8;
    }
    const bgGeometry = new THREE.BufferGeometry();
    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
    const bgMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bgPoints = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(bgPoints);

    // Mouse tracking
    const mouse3D = new THREE.Vector3(9999, 9999, 0);

    function onMouseMove(e) {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -(e.clientY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(mx, my, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      mouse3D.copy(camera.position).add(dir.multiplyScalar(dist));
    }

    window.addEventListener('mousemove', onMouseMove);

    // Physics constants
    const repulsionRadius = 80;
    const repulsionStrength = 12;
    const returnStrength = 0.04;
    const damping = 0.9;
    let frame = 0;

    function animate() {
      requestAnimationFrame(animate);
      frame++;

      const posArray = geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const px = posArray[idx];
        const py = posArray[idx + 1];
        const pz = posArray[idx + 2];

        // Mouse repulsion
        const dx = px - mouse3D.x;
        const dy = py - mouse3D.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repulsionRadius && dist > 0.1) {
          const force = ((repulsionRadius - dist) / repulsionRadius) * repulsionStrength;
          velocities[idx] += (dx / dist) * force;
          velocities[idx + 1] += (dy / dist) * force;
          velocities[idx + 2] += (Math.random() - 0.5) * force * 0.5;
        }

        // Spring back
        velocities[idx] += (originalPositions[idx] - px) * returnStrength;
        velocities[idx + 1] += (originalPositions[idx + 1] - py) * returnStrength;
        velocities[idx + 2] += (originalPositions[idx + 2] - pz) * returnStrength;

        // Damping
        velocities[idx] *= damping;
        velocities[idx + 1] *= damping;
        velocities[idx + 2] *= damping;

        posArray[idx] += velocities[idx];
        posArray[idx + 1] += velocities[idx + 1];
        posArray[idx + 2] += velocities[idx + 2];
      }

      geometry.attributes.position.needsUpdate = true;

      // Slowly rotate + twinkle a subset of background stars each frame for performance
      bgPoints.rotation.y = frame * 0.00015;
      bgPoints.rotation.x = Math.sin(frame * 0.0002) * 0.05;
      const bgColArr = bgGeometry.attributes.color.array;
      const batchSize = 1500;
      const batchStart = (frame * batchSize) % bgCount;
      const batchEnd = Math.min(batchStart + batchSize, bgCount);
      for (let i = batchStart; i < batchEnd; i++) {
        const twinkle = 0.4 + 0.6 * ((Math.sin(bgPhases[i] + frame * 0.02 * bgSpeeds[i]) + 1) / 2);
        const brightness = (0.15 + 0.35 * (i / bgCount)) * twinkle;
        bgColArr[i * 3] = brightness * 0.4;
        bgColArr[i * 3 + 1] = brightness * 0.6;
        bgColArr[i * 3 + 2] = brightness;
      }
      bgGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="onboarding-page" onClick={handleEnter}>
      <div ref={mountRef} className="particle-canvas" />
      {transitioning && <div className="page-transition-overlay" />}
      <div className="onboarding-hint">
        Click anywhere to enter
      </div>
    </div>
  );
}
