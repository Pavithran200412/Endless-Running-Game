// Import Three.js and GLTFLoader
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
renderer.setClearColor(0x87CEEB);

// Add Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Load 3D Character Model
const loader = new THREE.GLTFLoader();
let player;
loader.load('assets/character.glb', function (gltf) {
    player = gltf.scene;
    player.scale.set(0.5, 0.5, 0.5);
    player.position.set(0, 0, 0);
    scene.add(player);
}, undefined, function (error) {
    console.error("❌ Model Load Error:", error);
});

// Ground
const groundGeometry = new THREE.PlaneGeometry(10, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

// Obstacles
const obstacles = [];
function addObstacle() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(Math.random() * 4 - 2, 0, -10);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Move Player
const keys = {};
window.addEventListener('keydown', (event) => keys[event.code] = true);
window.addEventListener('keyup', (event) => keys[event.code] = false);

let velocity = 0;
function updatePlayer() {
    if (player) {
        if (keys["ArrowLeft"]) player.position.x -= 0.1;
        if (keys["ArrowRight"]) player.position.x += 0.1;
        if (keys["Space"] && player.position.y === 0) velocity = 0.2;
        player.position.y += velocity;
        if (player.position.y > 0) velocity -= 0.01;
        else player.position.y = 0;
    }
}

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    updatePlayer();

    obstacles.forEach(obstacle => {
        obstacle.position.z += 0.1;
        if (obstacle.position.z > 5) {
            scene.remove(obstacle);
            obstacles.shift();
        }
    });

    renderer.render(scene, camera);
}

setInterval(addObstacle, 2000);
animate();
