// Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Score & High Score Display
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "10px";
scoreElement.style.left = "10px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "20px";
scoreElement.innerHTML = `Score: ${score} | High Score: ${highScore}`;
document.body.appendChild(scoreElement);

// Load Sound Effects
const jumpSound = new Audio("jump.mp3");
const collisionSound = new Audio("collision.mp3");
const powerUpSound = new Audio("powerup.mp3");

// Create Player
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Create Ground
const groundGeometry = new THREE.BoxGeometry(20, 0.5, 50);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -1;
scene.add(ground);

// Obstacles Array
let obstacles = [];
let gameSpeed = 0.2; // Speed increases over time

// Power-ups
let hasShield = false;
let speedBoost = false;
let slowMotion = false;

function spawnObstacle() {
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    
    obstacle.position.set((Math.random() > 0.5 ? 1.5 : -1.5), 0, -10);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Spawn Random Power-Up (Shield, Speed Boost, Slow Motion)
function spawnPowerUp() {
    const types = ["shield", "speed", "slow"];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUpGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const colorMap = { "shield": 0xffff00, "speed": 0xff8800, "slow": 0x00ffff };
    const powerUpMaterial = new THREE.MeshBasicMaterial({ color: colorMap[type] });
    const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);

    powerUp.position.set((Math.random() > 0.5 ? 1.5 : -1.5), 0.5, -10);
    scene.add(powerUp);

    function movePowerUp() {
        if (powerUp.position.z > 5) {
            scene.remove(powerUp);
            return;
        }
        powerUp.position.z += gameSpeed;
        requestAnimationFrame(movePowerUp);

        // Power-up Pickup
        if (
            powerUp.position.z > player.position.z - 1 &&
            powerUp.position.z < player.position.z + 1 &&
            powerUp.position.x === player.position.x
        ) {
            powerUpSound.play();
            scene.remove(powerUp);

            if (type === "shield") {
                hasShield = true;
                scoreElement.innerHTML = `Score: ${score} (Shield Active!)`;
            } else if (type === "speed") {
                speedBoost = true;
                gameSpeed += 0.1;
                setTimeout(() => { speedBoost = false; gameSpeed -= 0.1; }, 5000);
            } else if (type === "slow") {
                slowMotion = true;
                gameSpeed -= 0.1;
                setTimeout(() => { slowMotion = false; gameSpeed += 0.1; }, 5000);
            }
        }
    }
    movePowerUp();
}

// Player Movement
let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && player.position.x > -1.5) {
        player.position.x -= 1.5;
    } else if (event.key === "ArrowRight" && player.position.x < 1.5) {
        player.position.x += 1.5;
    } else if (event.key === " " && !isJumping) {
        isJumping = true;
        velocityY = 0.2;
        jumpSound.play();
    }
});

// Set Camera Position
camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(player.position);

// Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Move ground to create infinite effect
    ground.position.z += gameSpeed;
    if (ground.position.z > 10) {
        ground.position.z = -10;
    }

    // Move obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += gameSpeed;

        // Collision Detection
        if (
            obstacle.position.z > player.position.z - 1 &&
            obstacle.position.z < player.position.z + 1 &&
            obstacle.position.x === player.position.x
        ) {
            if (hasShield) {
                hasShield = false;
                scene.remove(obstacle);
                obstacles.splice(index, 1);
            } else {
                collisionSound.play();
                alert(`Game Over! Score: ${score}`);
                if (score > highScore) {
                    localStorage.setItem("highScore", score);
                }
                window.location.reload();
            }
        }

        // Remove obstacles that move past the player
        if (obstacle.position.z > 5) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
        }
    });

    // Handle Jumping Physics
    if (isJumping) {
        player.position.y += velocityY;
        velocityY += gravity;
        if (player.position.y <= 0) {
            player.position.y = 0;
            isJumping = false;
        }
    }

    // Update score
    score += 1;
    scoreElement.innerHTML = `Score: ${score} | High Score: ${highScore}${hasShield ? " (Shield Active!)" : ""}`;

    // Increase speed over time
    if (score % 500 === 0 && !speedBoost && !slowMotion) {
        gameSpeed += 0.02;
    }

    renderer.render(scene, camera);
}

// Spawn Obstacles & Power-Ups
setInterval(spawnObstacle, 2000);
setInterval(spawnPowerUp, 10000);

animate();
