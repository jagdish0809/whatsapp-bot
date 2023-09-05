// import React from "react";
// import { Canvas } from "react-three-fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import cakeModalPath from "../assests/cake.glb";

const Cake3d = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;

      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        50,
        sizes.width / sizes.height
      );
      camera.position.z = 5;
      camera.position.y = 3;
      camera.position.x = 6;
      scene.add(camera);

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("draco/");

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      const spotLight = new THREE.SpotLight(0xffffff, 1.5);
      spotLight.position.set(30, 0, 30);
      scene.add(spotLight);

      const spotLight2 = new THREE.SpotLight(0xffffff, 2);
      spotLight2.position.set(0, 40, -30);
      spotLight2.castShadow = true;
      scene.add(spotLight2);

      let model;

      gltfLoader.load(cakeModalPath, (gltf) => {
        model = gltf.scene;
        model.position.set(0, 1, 0);
        model.scale.set(30, 30, 30);
        scene.add(model);
      });

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
      });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enabled = false; // Disable user interaction

      const rotationSpeed = 0.01;

      const animate = () => {
        requestAnimationFrame(animate);

        if (model) {
          model.rotation.y += rotationSpeed;
        }

        spotLight.position.copy(camera.position);

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };

      window.addEventListener("resize", handleResize);

      // Clean up
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    return <canvas ref={canvasRef} className="webgl" />;
}

export default Cake3d;