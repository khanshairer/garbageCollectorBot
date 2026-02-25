import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Creates and returns the scene
export function createScene() {
  const scene = new THREE.Scene();  
  scene.background = new THREE.Color(0xffffff);
  return scene;
}

// Creates and returns the camera
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, 
    1000
  );

  // Move our camera to a position upwards on y
  // then look at the origin
  camera.position.y = 20;
  //added
  camera.lookAt(0, 0, 0);
  return camera;
}

// Creates and returns the renderer
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  return renderer;
}
// Creates light and adds it to the scene
export function createLight(scene) {
  // Directional light (main light source)
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(0, 5, 5);
  scene.add(light);
  
  // Add ambient light to fill in shadows and illuminate all sides
  const ambientLight = new THREE.AmbientLight(0x404060); // Soft blue-ish ambient light
  scene.add(ambientLight);
  
  // Optional: Add a second directional light from the opposite side for better coverage
  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(0, 3, -5);
  scene.add(backLight);
  
  // Optional: Add a point light near where your model will be
  const pointLight = new THREE.PointLight(0xffffff, 1, 20);
  pointLight.position.set(0, 3, 0);
  scene.add(pointLight);
}
// Shows axesHelper, gridHelper, and OrbitControls
//MODIFIED
export function showHelpers(scene, camera, renderer, levelMap) {

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  const orbitControls = new OrbitControls(camera, renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
  const roadTexture = textureLoader.load('/woodenTexture.jpg');

  roadTexture.wrapS = THREE.RepeatWrapping;
  roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(6, 6);
  roadTexture.colorSpace = THREE.SRGBColorSpace;

  const floorGeometry = new THREE.PlaneGeometry(levelMap.width, levelMap.depth);
  const floorMaterial = new THREE.MeshStandardMaterial({ map: roadTexture });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  const gridHelper = new THREE.GridHelper(levelMap.width, levelMap.depth);
  scene.add(gridHelper);
}
