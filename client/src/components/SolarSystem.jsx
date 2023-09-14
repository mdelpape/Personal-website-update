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
// import jupiter from "../assets/jupiter.jpg";

const SolarSystem = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [cameraState, setCameraState] = React.useState(0);
  const [jupiterLoaded, setJupiterLoaded] = React.useState(false);
  console.log("jupiterLoaded", jupiterLoaded)

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
      let jupiter;

      const textureLoader = new THREE.TextureLoader();

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
      camera.position.set(0, 0, 1300);
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

      const sunGeometry = new THREE.SphereGeometry(200, 32, 32);
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

      const mercuryGeometry = new THREE.SphereGeometry(2.4, 32, 32);
      const mercuryMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
      mercury.position.set(600, 0, 0);
      scene.add(mercury);

      const venusGeometry = new THREE.SphereGeometry(6, 32, 32);
      const venusMaterial = new THREE.MeshStandardMaterial({
        color: 0xad5c21,
      });
      const venus = new THREE.Mesh(venusGeometry, venusMaterial);
      venus.position.set(900, 0, 0);
      scene.add(venus);

      const earthGeometry = new THREE.SphereGeometry(6.4, 32, 32);
      const earthMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f86eb,
      });
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.position.set(1000, 0, 0);
      scene.add(earth);

      const marsGeometry = new THREE.SphereGeometry(3.3, 32, 32);
      const marsMaterial = new THREE.MeshStandardMaterial({
        color: 0xa52700,
      });
      const mars = new THREE.Mesh(marsGeometry, marsMaterial);
      mars.position.set(1100, 0, 0);
      scene.add(mars);

      textureLoader.load("../assets/jupiter.jpg", (texture) => {
        const jupiterGeometry = new THREE.SphereGeometry(71.5, 32, 32);
        const jupiterMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: texture,
        });
        jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
        jupiter.position.set(1200, 0, 0);
        console.log("jupiter", jupiter);
        scene.add(jupiter);
        setJupiterLoaded(true);
      });

      const saturnGeometry = new THREE.SphereGeometry(60.2, 32, 32);
      const saturnMaterial = new THREE.MeshStandardMaterial({
        color: 0xCE9E61,
      });
      const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
      saturn.position.set(1300, 0, 0);
      scene.add(saturn);

      const uranusGeometry = new THREE.SphereGeometry(25.55, 32, 32);
      const uranusMaterial = new THREE.MeshStandardMaterial({
        color: 0xB4D7DD,
      });
      const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
      uranus.position.set(1400, 0, 0);
      scene.add(uranus);

      const neptuneGeometry = new THREE.SphereGeometry(25, 32, 32);
      const neptuneMaterial = new THREE.MeshStandardMaterial({
        color: 0x344BC8,
      });
      const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
      neptune.position.set(1500, 0, 0);
      scene.add(neptune);

      let me = 0; // Initialize the angle outside the animate function
      let ve = 0;
      let ea = 0;
      let ma = 0;
      let ju = 0;
      let sa = 0;
      let ur = 0;
      let ne = 0;

      const createOrbit = (speed, angle, centerX, centerY, radius, object) => {
        if (object && object.position) {
        object.position.x = centerX + radius * Math.cos(speed * angle);
        object.position.z = centerY + radius * Math.sin(speed * angle);
        }
      };
      let cam = 0;

      const animate = () => {
        renderScene();
        controls.update();
        cam -= 0.001;

        camera.position.x = 1300 * Math.cos(cam);
        camera.position.z = 1300 * Math.sin(cam);
        camera.lookAt(0, 0, 0);

        me += 0.01;
        ve += 0.009;
        ea += 0.008;
        ma += 0.007;
        ju += 0.006;
        sa += 0.005;
        ur += 0.004;
        ne += 0.003;

        // Orbit Mercury
        createOrbit(0.5, me, 0, 0, 300, mercury);
        createOrbit(0.5, ve, 0, 0, 400, venus);
        createOrbit(0.5, ea, 0, 0, 500, earth);
        createOrbit(0.5, ma, 0, 0, 600, mars);
        if (jupiter) {
          createOrbit(0.5, ju, 0, 0, 700, jupiter);
        }
        // createOrbit(0.5, ju, 0, 0, 700, jupiter);
        createOrbit(0.5, sa, 0, 0, 800, saturn);
        createOrbit(0.5, ur, 0, 0, 900, uranus);
        createOrbit(0.5, ne, 0, 0, 1000, neptune);

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
      // if (jupiterLoaded) {
      animate(); // Start the animation loop
      // }
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
