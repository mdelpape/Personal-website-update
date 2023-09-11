import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Reflector } from "three/addons/objects/Reflector.js";
import LoaderManager from "../managers/LoaderManager";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import waterdudv from "../assets/waterdudv.jpg";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { randFloat } from "three/src/math/MathUtils.js";
// import person from "../assets/OBJ.obj";
// import michal from "../assets/uploads_files_3684990_Michal.obj";
import house from "../assets/uploads_files_593643_247_House+15_obj.obj";
import water from "../assets/waterdudv.jpg";
// import fireHydrant from "../assets/FireHydrant_LOD1.obj";
// import font from '@/client/src/assets/fonts/optimer_bold.typeface.json'
// OBJLoader(THREE);

const Scene = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);
  const [cameraState, setCameraState] = React.useState(0);
  console.log(cameraState)

  useEffect(() => {
    const init = async () => {
      const assets = [
        {
          name: "waterdudv",
          texture: "../assets/waterdudv.jpg",
        },
      ];
      await LoaderManager.load(assets);
      setAssetsLoaded(true);
      // console.log(LoaderManager.get("waterdudv"));
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
      camera.position.set(0, 100, 2000);

      // Initialize OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(1, 1, 1);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);

      let groundMirror;

      const vertexShader = `

		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}
`;

      // Fragment Shader
      const fragmentShader = `
		uniform vec3 color;
		uniform sampler2D tDiffuse;
    uniform sampler2D tDudv;
    uniform float time;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>



		void main() {

			#include <logdepthbuf_fragment>

      float waveStrength = .1;
      float waveSpeed = 0.03;

       // simple distortion (ripple) via dudv map (see https://www.youtube.com/watch?v=6B7IF6GOu7s)

       vec2 distortedUv = texture2D( tDudv, vec2( vUv.x + time * waveSpeed, vUv.y ) ).rg * waveStrength;
       distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y + time * waveSpeed );
       vec2 distortion = ( texture2D( tDudv, distortedUv ).rg * 2.0 - 1.0 ) * waveStrength;

       // new uv coords

       vec4 uv = vec4( vUv );
       uv.xy += distortion;

			vec4 base = texture2DProj( tDiffuse, uv );
			gl_FragColor = vec4( mix( base.rgb, color, 0.7 ), 1.0 );

			#include <tonemapping_fragment>
			#include <encodings_fragment>

		}
`;
      // Creating Custom Shader
      const customShader = {
        uniforms: {
          color: { value: null },
          textureMatrix: { value: null },
          tDiffuse: { value: null },
          mirrorSampler: { value: null },
          tDudv: { value: null },
          time: { value: null },
          customTexture: { value: null }, // Add custom texture uniform
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      };

      // Apply texture to shader
      const dudvMap = LoaderManager.get("waterdudv").texture;

      dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

      customShader.uniforms.tDudv = { value: dudvMap };
      customShader.uniforms.time = { value: 0 };

      const mirrorGeometry = new THREE.CircleGeometry(1000, 64);
      groundMirror = new Reflector(mirrorGeometry, {
        shader: customShader,
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x003272,
      });
      groundMirror.position.y = -2;
      groundMirror.rotateX(-Math.PI / 2);
      groundMirror.material.uniforms.time.value = 1;
      scene.add(groundMirror);
      //change speed of water

      //change speed of water

      // Object Loader (Example: loaded object from the web);
      // const loader = new OBJLoader();
      // loader.load("../assets/FireHydrant_LOD1.obj", (object) => {
      //   object.position.y = -2;
      //   object.position.x = -100;
      //   object.position.z = -100;
      //   object.traverse((child) => {
      //     if (child.isMesh) {
      //       child.material.color.set(0x711f15); // Change to red color
      //     }
      //   });
      //   // scene.add(object);
      // });

      const houseLoader = new OBJLoader();
      houseLoader.load(
        "../assets/uploads_files_593643_247_House+15_obj.obj",
        (object) => {
          object.position.y = -2;
          object.position.x = -100;
          object.position.z = -150;
          object.rotateY(3);
          object.traverse((child) => {
            child.scale.set(0.5, 0.5, 0.5);
            if (child.material) {
              // If it's an array of materials, loop over each one
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  mat.color.set(0x61463a); // Set color to red
                });
              } else {
                // It's a single material
                child.material.color.set(0x691a11); // Set color to red
              }
            }
          });
          scene.add(object);
        }
      );

      const sphereGeometry2 = new THREE.SphereGeometry(0.3, 20, 50);
      const sphereMaterial2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
      sphere2.position.y = 3;
      scene.add(sphere2);

      // Geometry and Material (Example: simple cube)
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.y = 3;
      scene.add(cube);

      const sphereGeometry = new THREE.SphereGeometry(100, 20, 50);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xfec771,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.y = 200;
      sphere.position.z = -800;
      sphere.position.x = 200;
      scene.add(sphere);

      const ringGeometry = new THREE.RingGeometry(130, 200, 32);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x746755,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 200;
      ring.position.z = -800;
      ring.position.x = 200;
      ring.rotateX(-1);
      ring.rotateY(0.5);
      scene.add(ring);

      const moonGeometry = new THREE.SphereGeometry(20, 20, 20);
      const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.y = 200;
      moon.position.z = -800;
      moon.position.x = -200;
      scene.add(moon);

      // Geometry and Material (Example: simple sphere)
      const textStandGeometry = new THREE.BoxGeometry(13, 0.5, 2);
      const textStandMaterial = new THREE.MeshStandardMaterial({
        color: 0xdbdbdb,
      });
      const textStand = new THREE.Mesh(textStandGeometry, textStandMaterial);
      textStand.position.y = -1.8;
      // scene.add(textStand);

      // Geometry and Material (Example: simple torusKnot  with custom texture)
      const torusKnotGeometry = new THREE.TorusKnotGeometry(
        50,
        5,
        300,
        64,
        5,
        2,
        4
      );
      const torusKnotMaterial = new THREE.MeshStandardMaterial({
        color: 0x800000,
        metalness: 0.5,
        roughness: 0.1,
      });
      const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
      torusKnot.position.x = 0;
      torusKnot.position.z = 0;
      // scene.add(torusKnot);

      // Geometry and Material (Example: simple torus)
      const geometry2 = new THREE.TorusGeometry();
      const torus = new THREE.Mesh(geometry2, material);
      torus.position.x = 2;
      // scene.add(torus);

      //set stars
      const starGeometry = new THREE.BufferGeometry();

      // create a simple square shape. We duplicate the top left and bottom right
      // vertices because each vertex needs to appear once per triangle.
      const vertices = []; // 10000 vertices, 3 components each (x, y, z)
      const range = 1000;
      for (let i = 0; i < 2000; i++) {
        const point = new THREE.Vector3(
          randFloat(-range, range),
          randFloat(70, 200),
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

      // Load font
      const txtMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const fontLoader = new FontLoader();
      let text;
      fontLoader.load(
        "https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json",
        (font) => {
          const textGeometry = new TextGeometry("Michael Del Pape", {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5,
          });
          textGeometry.center();

          text = new THREE.Mesh(textGeometry, txtMaterial);
          text.position.y = -5;
          text.material.color.set(0xBABABA);
          scene.add(text);
        }
      );

      const renderScene = () => {
        renderer.render(scene, camera);
      };
      let angle = 0; // Initialize angle
      const radius = 2; // Define radius of the orbit
      const speed = 0.01; // Define speed of the orbit

      let cameraState = true
      const animate = () => {
        if (text && text.position.y < 0) {
          text.position.y += 0.01;
        }
        angle += speed;

        // camera.position.x = radius * Math.cos(angle);
        if (camera.position.z > 25 && cameraState) {
        camera.position.z -= 8
        if (camera.position.y > 5) {
          camera.position.y -= .4
          }
        } else {
          cameraState = false
        }

        // Calculate new position
        sphere2.position.x = radius * Math.cos(angle);
        sphere2.position.z = radius * Math.sin(angle);
        // ring.rotation.x += 0.001;
        torusKnot.rotation.x += 0.001;
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        groundMirror.material.uniforms.time.value += 0.1;

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

export default Scene;
