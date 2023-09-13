import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Reflector } from "three/addons/objects/Reflector.js";
import { Refractor } from "three/addons/objects/Refractor.js";
import LoaderManager from "../managers/LoaderManager";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import waterdudv from "../assets/waterdudv.jpg";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { randFloat } from "three/src/math/MathUtils.js";
import house from "../assets/uploads_files_593643_247_House+15_obj.obj";
import water from "../assets/waterdudv.jpg";
import { WaterRefractionShader } from "three/examples/jsm/shaders/WaterRefractionShader.js";

const SolarSystem = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [cameraState, setCameraState] = React.useState(0);

  useEffect(() => {
    const init = async () => {
      const assets = [{}];
      await LoaderManager.load(assets);
      setAssetsLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (assetsLoaded) {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(window.devicePixelRatio);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      // Initialize camera
      const height = window.innerHeight - 500;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / height,
        0.1,
        1000
      );
      camera.position.set(0, 700, 0);
      camera.far = 10000;

      // Initialize OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);

      const pl1 = new THREE.PointLight(0xffffff, 3);
      pl1.decay = 0;
      pl1.position.set(0, 0, 0);
      pl1.castShadow = true; // To cast shadows
      scene.add(pl1);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      const renderScene = () => {
        renderer.render(scene, camera);
      };

      // Initialize the objects in the scene

      const sunGeometry = new THREE.SphereGeometry(100, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff, // Adds an emissive color, making the sun look like it's glowing
      });
      const sun = new THREE.Mesh(sunGeometry, material);
      scene.add(sun);

      const starGeometry = new THREE.BufferGeometry();

      // create a simple square shape. We duplicate the top left and bottom right
      // vertices because each vertex needs to appear once per triangle.
      const vertices = []; // 10000 vertices, 3 components each (x, y, z)
      const range = 2000;
      for (let i = 0; i < 2000; i++) {
        const point = new THREE.Vector3(
          randFloat(-range, range),
          randFloat(-range, range),
          randFloat(-range, range)
        );
        vertices.push(...point);
      }

      // itemSize = 3 because there are 3 values (components) per vertex
      starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(vertices), 3)
      );
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
      const mesh = new THREE.Points(starGeometry, starMaterial);
      // mesh.scale.set(2,2,2);
      scene.add(mesh);

      const mercuryGeometry = new THREE.SphereGeometry(20, 32, 32);
      const mercuryMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
      mercury.position.set(200, 0, 0);
      scene.add(mercury);

      let mercuryAngle = 0; // Initialize the angle outside the animate function

      const createOrbit = (speed, angle, centerX, centerY, radius, object) => {
        object.position.x = centerX + radius * Math.cos(speed * angle);
        object.position.z = centerY + radius * Math.sin(speed * angle);
      };

      const animate = () => {
        renderScene();
        controls.update();

        mercuryAngle += 0.01; // Increment the angle for Mercury

        // Orbit Mercury
        createOrbit(0.5, mercuryAngle, 0, 0, 200, mercury);

        animationFrameId.current = requestAnimationFrame(animate);
      };

      // Your initial setup code here
      // ...
      // Start the animation
      animate();

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderScene(); // Re-render the scene
      };

      handleResize(); // Render the scene on mount
      window.addEventListener("resize", handleResize);
      animate(); // Start the animation loop

      // Cleanup: remove event listener, cancel animation frame, and dispose controls on component unmount
      return () => {
        window.removeEventListener("resize", handleResize);
        controls.dispose();
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [assetsLoaded]);

  return (
    <div style={{ flex: 1 }}>
      <canvas
        style={{ width: "100%" }}
        ref={canvasRef}
        className="scene"
      ></canvas>
    </div>
  );
};

export default SolarSystem;
