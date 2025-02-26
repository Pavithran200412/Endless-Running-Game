import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r155/three.module.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 5, 2);
scene.add(light);

// Load character model
const loader = new GLTFLoader();
let character;
loader.load('character.glb', function (gltf) {
    character = gltf.scene;
    character.scale.set(1, 1, 1);
    character.position.set(0, 0, 0);
    scene.add(character);
}, undefined, function (error) {
    console.error("Error loading model:", error);
});

// Player movement
let playerSpeed = 0.1;
document.addEventListener("keydown", (event) => {
    if (character) {
        if (event.key === "ArrowLeft") {
            character.position.x -= playerSpeed;
        } else if (event.key === "ArrowRight") {
            character.position.x += playerSpeed;
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
