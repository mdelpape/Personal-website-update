import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Reflector } from "three/addons/objects/Reflector.js";
import LoaderManager from "../managers/LoaderManager";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import waterdudv from '../assets/waterdudv.jpg'
// OBJLoader(THREE);

const Scene = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);

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
      console.log(LoaderManager.get("waterdudv"));
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
      scene.background = new THREE.Color(0x091A32);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
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

      const mirrorGeometry = new THREE.CircleGeometry(100, 64);
      groundMirror = new Reflector(mirrorGeometry, {
        shader: customShader,
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x045278,
      });
      groundMirror.position.y = -2;
      groundMirror.rotateX(-Math.PI / 2);
      groundMirror.material.uniforms.time.value = 1;
      scene.add(groundMirror);
      //change speed of water

      const largeTorusGeometry = new THREE.TorusGeometry(10, 3, 10, 100);
      const largeTorusMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.1,
      });
      const largeTorus = new THREE.Mesh(largeTorusGeometry, largeTorusMaterial);
      largeTorus.position.y = -2;
      scene.add(largeTorus);

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
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} className="scene"></canvas>
    </div>
  );
};

export default Scene;
