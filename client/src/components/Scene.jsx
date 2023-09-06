import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Reflector } from 'three/addons/objects/Reflector.js';

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
    scene.background = new THREE.Color(0x025B62);

    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

      let groundMirror;
      // ... you can now proceed with creating the reflector object
      const mirrorGeometry = new THREE.CircleGeometry( 40, 64 );
				groundMirror = new Reflector( mirrorGeometry, {
					clipBias: 0.003,
					textureWidth: window.innerWidth * window.devicePixelRatio,
					textureHeight: window.innerHeight * window.devicePixelRatio,
					color: 0x045278
				} );
				groundMirror.position.y = -2;
				groundMirror.rotateX( - Math.PI / 2 );
				scene.add( groundMirror );

    const largeTorusGeometry = new THREE.TorusGeometry( 10, 3, 10, 100 );
    const largeTorusMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, metalness: 0.5, roughness: 0.1 } );
    const largeTorus = new THREE.Mesh( largeTorusGeometry, largeTorusMaterial );
    largeTorus.position.y = -2;
    scene.add( largeTorus );





    // Geometry and Material (Example: simple cube)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = -2;
    scene.add(cube);

    // Geometry and Material (Example: simple torus)
    const geometry2 = new THREE.TorusGeometry();
    const torus = new THREE.Mesh(geometry2, material);
    torus.position.x = 2;
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
