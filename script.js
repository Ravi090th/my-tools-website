// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let game = {
    running: false,
    score: 0,
    level: 1,
    health: 100,
    ammo: 30,
    enemiesDestroyed: 0,
    difficulty: 'medium',
    powerUps: [],
    stars: []
};

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 60,
    speed: 8,
    bullets: [],
    lastShot: 0,
    shootDelay: 300,
    hasShield: false,
    shieldTime: 0
};

// Enemies
let enemies = [];
let enemyBullets = [];

// Input handling
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false,
    a: false,
    d: false
};

// Difficulty settings
const difficultySettings = {
    easy: { enemySpeed: 2, spawnRate: 90, enemyHealth: 1, enemyShootRate: 2000 },
    medium: { enemySpeed: 3, spawnRate: 60, enemyHealth: 2, enemyShootRate: 1500 },
    hard: { enemySpeed: 4, spawnRate: 40, enemyHealth: 3, enemyShootRate: 1000 }
};

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

// Initialize stars for background
function initStars() {
    game.stars = [];
    for (let i = 0; i < 200; i++) {
        game.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            speed: Math.random() * 2 + 1
        });
    }
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    game.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw player
function drawPlayer() {
    ctx.save();
    
    // Shield effect
    if (player.hasShield) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 40, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw spaceship
    ctx.fillStyle = '#00ffff';
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 20, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine glow
    if (game.running) {
        const gradient = ctx.createRadialGradient(
            player.x + player.width / 2, player.y + player.height,
            0,
            player.x + player.width / 2, player.y + player.height,
            30
        );
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x + 10, player.y + player.height, 30, 40);
    }
    
    ctx.restore();
}

// Create enemy
function createEnemy() {
    const settings = difficultySettings[game.difficulty];
    return {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 40 + Math.random() * 20,
        height: 40 + Math.random() * 20,
        speed: settings.enemySpeed + Math.random() * 1,
        health: settings.enemyHealth,
        color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`,
        lastShot: 0,
        shootDelay: settings.enemyShootRate
    };
}

// Draw enemy
function drawEnemy(enemy) {
    ctx.save();
    
    // Enemy ship
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy details
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Create bullet
function createBullet(x, y, isPlayer = true) {
    return {
        x: x,
        y: y,
        width: 6,
        height: 20,
        speed: isPlayer ? -12 : 7,
        color: isPlayer ? '#ffff00' : '#ff4444'
    };
}

// Draw bullet
function drawBullet(bullet) {
    ctx.save();
    
    // Bullet glow
    const gradient = ctx.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2,
        15
    );
    gradient.addColorStop(0, bullet.color);
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(bullet.x - 7, bullet.y - 7, bullet.width + 14, bullet.height + 14);
    
    // Bullet core
    ctx.fillStyle = bullet.color === '#ffff00' ? '#ffffff' : '#ff0000';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

// Create power-up
function createPowerUp() {
    const types = ['health', 'ammo', 'rapidFire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let color;
    switch(type) {
        case 'health': color = '#ff4444'; break;
        case 'ammo': color = '#4488ff'; break;
        case 'rapidFire': color = '#ffff00'; break;
        case 'shield': color = '#00ffff'; break;
    }
    
    return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 35,
        height: 35,
        speed: 3,
        type: type,
        color: color
    };
}

// Draw power-up
function drawPowerUp(powerUp) {
    ctx.save();
    
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.roundRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, 8);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol;
    switch(powerUp.type) {
        case 'health': symbol = '❤️'; break;
        case 'ammo': symbol = '⚡'; break;
        case 'rapidFire': symbol = '🔥'; break;
        case 'shield': symbol = '🛡️'; break;
    }
    
    ctx.fillText(symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    
    ctx.restore();
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update HUD
function updateHUD() {
    document.getElementById('health').textContent = game.health;
    document.getElementById('score').textContent = game.score;
    document.getElementById('ammo').textContent = game.ammo;
    document.getElementById('level').textContent = game.level;
}

// Take damage
function takeDamage(amount) {
    if (player.hasShield) return;
    
    game.health -= amount;
    if (game.health < 0) game.health = 0;
    updateHUD();
    
    // Visual feedback
    canvas.style.boxShadow = '0 0 50px red';
    setTimeout(() => {
        canvas.style.boxShadow = 'none';
    }, 100);
}

// Apply power-up
function applyPowerUp(type) {
    switch(type) {
        case 'health':
            game.health = Math.min(100, game.health + 25);
            break;
        case 'ammo':
            game.ammo += 30;
            break;
        case 'rapidFire':
            player.shootDelay = 100;
            setTimeout(() => {
                player.shootDelay = 300;
            }, 8000);
            break;
        case 'shield':
            player.hasShield = true;
            setTimeout(() => {
                player.hasShield = false;
            }, 10000);
            break;
    }
    updateHUD();
}

// Main game loop
function gameLoop() {
    if (!game.running) return;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawStars();
    
    // Move player
    if ((keys.ArrowLeft || keys.a) && player.x > 10) {
        player.x -= player.speed;
    }
    if ((keys.ArrowRight || keys.d) && player.x < canvas.width - player.width - 10) {
        player.x += player.speed;
    }
    
    // Player shooting
    const currentTime = Date.now();
    if ((keys[' '] || keys.Space) && currentTime - player.lastShot > player.shootDelay && game.ammo > 0) {
        player.bullets.push(createBullet(
            player.x + player.width / 2 - 3,
            player.y
        ));
        player.lastShot = currentTime;
        game.ammo--;
        updateHUD();
    }
    
    // Spawn enemies
    const settings = difficultySettings[game.difficulty];
    if (Math.random() * settings.spawnRate < 1) {
        enemies.push(createEnemy());
    }
    
    // Spawn power-ups occasionally
    if (Math.random() * 400 < 1 && game.score > 500) {
        game.powerUps.push(createPowerUp());
    }
    
    // Update player bullets
    player.bullets = player.bullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y < 0) return false;
        
        // Check collision with enemies
        let hitEnemy = false;
        enemies = enemies.filter(enemy => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                if (enemy.health <= 0) {
                    game.score += 100;
                    game.enemiesDestroyed++;
                    
                    // Level up every 500 points
                    if (game.score >= game.level * 500) {
                        game.level++;
                    }
                    
                    updateHUD();
                    return false;
                }
                hitEnemy = true;
            }
            return true;
        });
        
        if (hitEnemy) return false;
        
        drawBullet(bullet);
        return true;
    });
    
    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Enemy shooting
        if (currentTime - enemy.lastShot > enemy.shootDelay) {
            enemyBullets.push(createBullet(
                enemy.x + enemy.width / 2 - 3,
                enemy.y + enemy.height,
                false
            ));
            enemy.lastShot = currentTime;
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            takeDamage(25);
            return false;
        }
        
        if (enemy.y > canvas.height) return false;
        
        drawEnemy(enemy);
        return true;
    });
    
    // Update enemy bullets
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        if (bullet.y > canvas.height) return false;
        
        if (checkCollision(player, bullet)) {
            takeDamage(15);
            return false;
        }
        
        drawBullet(bullet);
        return true;
    });
    
    // Update power-ups
    game.powerUps = game.powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        if (checkCollision(player, powerUp)) {
            applyPowerUp(powerUp.type);
            return false;
        }
        
        if (powerUp.y > canvas.height) return false;
        
        drawPowerUp(powerUp);
        return true;
    });
    
    // Draw player
    drawPlayer();
    
    // Check game over
    if (game.health <= 0) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Game over function
function gameOver() {
    game.running = false;
    
    // Update final stats
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;
    document.getElementById('finalEnemies').textContent = game.enemiesDestroyed;
    
    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

// Start game function
function startGame() {
    // Reset game state
    game = {
        running: true,
        score: 0,
        level: 1,
        health: 100,
        ammo: 30,
        enemiesDestroyed: 0,
        difficulty: 'medium',
        powerUps: [],
        stars: game.stars || []
    };
    
    // Reset player
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    player.bullets = [];
    player.hasShield = false;
    player.shootDelay = 300;
    
    // Clear arrays
    enemies = [];
    enemyBullets = [];
    
    // Initialize stars if not already done
    if (game.stars.length === 0) {
        initStars();
    }
    
    // Update HUD
    updateHUD();
    
    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Start game loop
    gameLoop();
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = keys.a = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = keys.d = true;
    if (e.key === ' ' || e.key === 'Spacebar') keys[' '] = true;
    
    if (e.key === ' ') e.preventDefault(); // Prevent spacebar from scrolling
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = keys.a = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys[' '] = false;
});

// Mobile controls
leftBtn.addEventListener('mousedown', () => keys.ArrowLeft = true);
leftBtn.addEventListener('mouseup', () => keys.ArrowLeft = false);
leftBtn.addEventListener('mouseleave', () => keys.ArrowLeft = false);
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.ArrowLeft = true;
});
leftBtn.addEventListener('touchend', () => keys.ArrowLeft = false);

rightBtn.addEventListener('mousedown', () => keys.ArrowRight = true);
rightBtn.addEventListener('mouseup', () => keys.ArrowRight = false);
rightBtn.addEventListener('mouseleave', () => keys.ArrowRight = false);
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.ArrowRight = true;
});
rightBtn.addEventListener('touchend', () => keys.ArrowRight = false);

shootBtn.addEventListener('mousedown', () => keys[' '] = true);
shootBtn.addEventListener('mouseup', () => keys[' '] = false);
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[' '] = true;
});
shootBtn.addEventListener('touchend', () => keys[' '] = false);

// Initialize
initStars();
updateHUD();

// Prevent context menu on right click
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Initialize with start screen visible
startScreen.style.display = 'flex';
gameOverScreen.style.display = 'none';
