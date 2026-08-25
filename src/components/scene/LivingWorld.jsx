import { useEffect, useRef } from "react";
import * as THREE from "three";

function LivingWorld() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x07100c, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );

    camera.position.set(0, 1.8, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(window.innerWidth, window.innerHeight);

    // -------------------------
    // LIGHT
    // -------------------------

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);

    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd8ffe5, 1.5);

    keyLight.position.set(4, 8, 5);

    scene.add(keyLight);

    // -------------------------
    // WORLD
    // -------------------------

    const world = new THREE.Group();

    scene.add(world);

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

    world.add(terrain);

    // -------------------------
    // FLOATING ORGANIC OBJECTS
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

      world.add(mesh);

      objects.push({
        mesh,
        speed: THREE.MathUtils.randFloat(0.2, 0.7),
        rotationSpeed: THREE.MathUtils.randFloat(0.001, 0.004),
        offset: Math.random() * Math.PI * 2,
      });
    }

    // -------------------------
    // ATMOSPHERE
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
      camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.025;

      camera.position.y += (1.8 + pointer.y * 0.7 - camera.position.y) * 0.025;

      camera.lookAt(0, 1, -7);

      // Floating movement
      objects.forEach((object) => {
        object.mesh.position.y =
          object.mesh.position.y +
          Math.sin(time * object.speed + object.offset) * 0.001;

        object.mesh.rotation.x += object.rotationSpeed;

        object.mesh.rotation.y += object.rotationSpeed;
      });

      // Atmospheric movement
      particles.rotation.y = time * 0.006;

      particles.position.y = Math.sin(time * 0.2) * 0.15;

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

      particleGeometry.dispose();
      particleMaterial.dispose();

      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="living-world" />;
}

export default LivingWorld;
