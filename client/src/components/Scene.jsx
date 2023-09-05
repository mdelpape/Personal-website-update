import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Scene = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Geometry and Material (Example: simple cube)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Geometry and Material (Example: simple torus)
    const geometry2 = new THREE.TorusGeometry();
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const torus = new THREE.Mesh(geometry2, material2);
    scene.add(torus);

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderScene();
      controls.update(); // Required if controls.enableDamping or controls.autoRotate are set to true

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderScene();  // Re-render the scene
    };

    handleResize();  // Render the scene on mount
    window.addEventListener('resize', handleResize);
    animate();  // Start the animation loop

    // Cleanup: remove event listener, cancel animation frame, and dispose controls on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="scene"></canvas>
    </div>
  );
};

export default Scene;
