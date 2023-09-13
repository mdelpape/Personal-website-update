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

const Test = () => {
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
      camera.position.set(0, 500, 0);
      camera.far = 10000;

      const renderScene = () => {
        renderer.render(scene, camera);
      };
      // Initialize OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const light = new THREE.PointLight(0xffffff, 100000);
      light.position.set(250, 100, 0);
      light.castShadow = true; // To cast shadows
      scene.add(light);

      const pointLightHelper = new THREE.PointLightHelper(light, 1);

      // Add the helper to your scene
      scene.add(pointLightHelper);

      // Initialize the objects in the scene
      const mercuryGeometry = new THREE.SphereGeometry(20, 32, 32);
      const mercuryMaterial = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
      });
      const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
      mercury.position.set(200, 0, 0);
      scene.add(mercury);

      const animate = () => {
        renderScene();
        controls.update();

        animationFrameId.current = requestAnimationFrame(animate);
      };

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

export default Test;
