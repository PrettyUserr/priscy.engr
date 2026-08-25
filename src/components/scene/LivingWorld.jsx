import { useEffect, useRef } from "react";
import * as THREE from "three";

function createOrganicForm() {
  const group = new THREE.Group();

  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.025, 0.07, 2.5, 8);

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x294d32,
    roughness: 0.9,
  });

  const stem = new THREE.Mesh(stemGeometry, stemMaterial);

  stem.position.y = 1.25;
  stem.castShadow = true;

  group.add(stem);

  // Leaves
  for (let i = 0; i < 4; i++) {
    const leafGeometry = new THREE.SphereGeometry(0.35, 10, 6);

    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b7048,
      roughness: 0.85,
    });

    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

    const side = i % 2 === 0 ? -1 : 1;

    leaf.scale.set(1.4, 0.35, 0.7);

    leaf.position.set(side * 0.35, 0.7 + i * 0.42, 0);

    leaf.rotation.z = side * THREE.MathUtils.degToRad(25);

    leaf.castShadow = true;

    group.add(leaf);
  }

  return group;
}

function LivingWorld() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // -------------------------
    // SCENE
    // -------------------------

    const scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x07100c, 0.035);

    // -------------------------
    // CAMERA
    // -------------------------

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );

    camera.position.set(0, 1.8, 10);

    // -------------------------
    // RENDERER
    // -------------------------

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // -------------------------
    // WORLD
    // -------------------------

    const world = new THREE.Group();

    scene.add(world);

    // -------------------------
    // CINEMATIC LIGHTING
    // -------------------------

    const ambientLight = new THREE.AmbientLight(0xb7cbbd, 0.22);

    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xd9e8ff, 1.1);

    moonLight.position.set(-6, 10, 4);

    moonLight.castShadow = true;

    scene.add(moonLight);

    const worldGlow = new THREE.PointLight(0x8fd8a5, 2.2, 12);

    worldGlow.position.set(0, 2, -6);

    scene.add(worldGlow);

    const horizonGlow = new THREE.PointLight(0x4b8060, 1.5, 25);

    horizonGlow.position.set(0, 3, -16);

    scene.add(horizonGlow);

    // -------------------------
    // TERRAIN
    // -------------------------

    const terrainGeometry = new THREE.PlaneGeometry(50, 50, 40, 40);

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1710,
      roughness: 1,
    });

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);

    terrain.rotation.x = -Math.PI / 2;

    terrain.position.y = -1.5;

    terrain.receiveShadow = true;

    world.add(terrain);

    // -------------------------
    // DISTANT HORIZON
    // -------------------------

    const horizonGeometry = new THREE.SphereGeometry(35, 32, 32);

    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x102218,
      side: THREE.BackSide,
    });

    const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);

    horizon.position.set(0, 2, -15);

    world.add(horizon);

    // -------------------------
    // FLOATING OBJECTS
    // -------------------------

    const objects = [];

    for (let i = 0; i < 45; i++) {
      const geometry = new THREE.IcosahedronGeometry(
        THREE.MathUtils.randFloat(0.08, 0.35),
        1,
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0x203d29,
        roughness: 0.8,
        metalness: 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        THREE.MathUtils.randFloatSpread(18),
        THREE.MathUtils.randFloat(-1, 7),
        THREE.MathUtils.randFloat(-20, 2),
      );

      mesh.rotation.set(Math.random(), Math.random(), Math.random());

      mesh.castShadow = true;

      world.add(mesh);

      objects.push({
        mesh,
        speed: THREE.MathUtils.randFloat(0.2, 0.7),
        rotationSpeed: THREE.MathUtils.randFloat(0.001, 0.004),
        offset: Math.random() * Math.PI * 2,
      });
    }

    // -------------------------
    // ORGANIC ENVIRONMENT
    // -------------------------

    const organicForms = [];

    for (let i = 0; i < 18; i++) {
      const plant = createOrganicForm();

      const scale = THREE.MathUtils.randFloat(0.5, 1.4);

      plant.scale.setScalar(scale);

      plant.position.set(
        THREE.MathUtils.randFloatSpread(22),
        -1.5,
        THREE.MathUtils.randFloat(-18, -3),
      );

      plant.rotation.y = Math.random() * Math.PI * 2;

      world.add(plant);

      organicForms.push({
        mesh: plant,
        offset: Math.random() * Math.PI * 2,
        speed: THREE.MathUtils.randFloat(0.4, 0.9),
      });
    }

    // -------------------------
    // ATMOSPHERIC PARTICLES
    // -------------------------

    const particleCount = 1200;

    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = THREE.MathUtils.randFloatSpread(30);

      positions[i + 1] = THREE.MathUtils.randFloat(-2, 15);

      positions[i + 2] = THREE.MathUtils.randFloat(-25, 5);
    }

    const particleGeometry = new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xb5d8bd,
      size: 0.025,
      transparent: true,
      opacity: 0.45,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);

    scene.add(particles);

    // -------------------------
    // POINTER
    // -------------------------

    const pointer = {
      x: 0,
      y: 0,
    };

    const handlePointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // -------------------------
    // RESIZE
    // -------------------------

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // -------------------------
    // ANIMATION
    // -------------------------

    const clock = new THREE.Clock();

    let animationFrame;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Camera movement
      const targetCameraX = pointer.x * 1.5;

      const targetCameraY = 1.8 + pointer.y * 0.8;

      camera.position.x += (targetCameraX - camera.position.x) * 0.02;

      camera.position.y += (targetCameraY - camera.position.y) * 0.02;

      camera.lookAt(0, 1, -7);

      // Floating objects
      objects.forEach((object) => {
        object.mesh.position.y +=
          Math.sin(time * object.speed + object.offset) * 0.001;

        object.mesh.rotation.x += object.rotationSpeed;

        object.mesh.rotation.y += object.rotationSpeed;
      });

      // Organic plants
      organicForms.forEach((plant) => {
        const sway = Math.sin(time * plant.speed + plant.offset) * 0.08;

        plant.mesh.rotation.z = sway;
      });

      // Atmospheric particles
      particles.rotation.y = time * 0.006;

      particles.position.y = Math.sin(time * 0.2) * 0.15;

      // Distant horizon
      horizon.rotation.y = Math.sin(time * 0.03) * 0.02;

      // Breathing world light
      worldGlow.intensity = 1.8 + Math.sin(time * 0.8) * 0.35;

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // -------------------------
    // CLEANUP
    // -------------------------

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("resize", handleResize);

      terrainGeometry.dispose();
      terrainMaterial.dispose();

      horizonGeometry.dispose();
      horizonMaterial.dispose();

      particleGeometry.dispose();
      particleMaterial.dispose();

      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="living-world" />;
}

export default LivingWorld;
