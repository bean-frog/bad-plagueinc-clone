const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x1099bb,
});
document.body.appendChild(app.view);

// Player Ball Properties
const playerProperties = {
    radius: 20,
    color: 0x0000FF,
    speed: 5,
};

// Player Ball
const playerBall = new PIXI.Graphics();
playerBall.beginFill(playerProperties.color);
playerBall.drawCircle(0, 0, playerProperties.radius);
playerBall.endFill();
playerBall.x = app.screen.width / 2;
playerBall.y = app.screen.height / 2;
app.stage.addChild(playerBall);

// Bullets Array
const bullets = [];

// Object to track the state of each key
const keyState = {};

// Player Movement
document.addEventListener('keydown', (e) => {
    keyState[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
});

// Update Function
app.ticker.add(() => {
    const speed = playerProperties.speed;

    // Smooth movement in both x and y directions
    if (keyState['w']) playerBall.y -= speed;
    if (keyState['a']) playerBall.x -= speed;
    if (keyState['s']) playerBall.y += speed;
    if (keyState['d']) playerBall.x += speed;

    bullets.forEach((bullet, index) => {
        bullet.y += bullet.vy;
        if (bullet.y < 0 || bullet.y > app.screen.height) {
            app.stage.removeChild(bullet);
            bullets.splice(index, 1);
        }
    });
});

// Shooting Mechanism
function shootBullet() {
    const bullet = new PIXI.Graphics();
    bullet.beginFill(0xFFFFFF);
    bullet.drawCircle(0, 0, 5); // Bullet size
    bullet.endFill();
    bullet.x = playerBall.x;
    bullet.y = playerBall.y;
    app.stage.addChild(bullet);

    // Bullet movement (example: straight up)
    bullet.vy = -5;
    bullets.push(bullet);
}

// Trigger Shooting on Spacebar
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        shootBullet();
    }
});

const properties = {
    ballRadius: 15,
    ballColor: 0x008B02,
    ballSpeed: 3,
    num: 99,
    numInfected: 10,
    worldBorderWidth: 3,
    worldBorderColor: 0xb00b69,
};

const balls = [];

function createBall() {
    const x = Math.random() * (app.screen.width - 2 * properties.ballRadius) + properties.ballRadius;
    const y = Math.random() * (app.screen.height - 2 * properties.ballRadius) + properties.ballRadius;
    const color = balls.length < properties.numInfected ? 0xFF0000 : properties.ballColor; // Set color to red for infected balls
    const ball = new Ball(x, y, properties.ballRadius, color, properties.ballSpeed);
    balls.push(ball);
}

function update() {
    balls.forEach((ball, index) => {
        ball.ball.x += ball.ball.vx;
        ball.ball.y += ball.ball.vy;

        if (ball.ball.x + properties.ballRadius >= app.screen.width || ball.ball.x - properties.ballRadius <= 0) {
            ball.ball.vx *= -1;
        }
        if (ball.ball.y + properties.ballRadius >= app.screen.height || ball.ball.y - properties.ballRadius <= 0) {
            ball.ball.vy *= -1;
        }

        for (let i = index + 1; i < balls.length; i++) {
            const otherBall = balls[i];
            if (areColliding(ball, otherBall)) {
                if (ball.color === 0xFF0000 && otherBall.color !== 0xFF0000) {
                    otherBall.infect();
                } else if (otherBall.color === 0xFF0000 && ball.color !== 0xFF0000) {
                    ball.infect();
                }
            }
        }
    });

    const border = new PIXI.Graphics();
    border.lineStyle(properties.worldBorderWidth, properties.worldBorderColor);
    border.drawRect(0, 0, app.screen.width, app.screen.height);
    app.stage.addChild(border);
}

function areColliding(ball1, ball2) {
    const dx = ball1.ball.x - ball2.ball.x;
    const dy = ball1.ball.y - ball2.ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 2 * properties.ballRadius;
}

class Ball {
    constructor(x, y, radius, color, speed) {
        this.ball = new PIXI.Graphics();
        this.ball.beginFill(color);
        this.ball.drawCircle(0, 0, radius);
        this.ball.endFill();
        this.ball.x = x;
        this.ball.y = y;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.color = color;
        app.stage.addChild(this.ball);
        this.moveRandomlyInterval = setInterval(() => this.moveRandomly(), Math.random() * 1000 + 500);
    }

    moveRandomly() {
        const randomAngle = Math.random() * Math.PI * 2;
        this.ball.vx = Math.cos(randomAngle) * properties.ballSpeed;
        this.ball.vy = Math.sin(randomAngle) * properties.ballSpeed;
        setTimeout(() => this.stop(), Math.random() * 1000 + 1000);
    }

    stop() {
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    infect() {
        if (this.color !== 0xFF0000) {
            this.color = 0xFF0000;
            this.ball.clear();
            this.ball.beginFill(this.color);
            this.ball.drawCircle(0, 0, properties.ballRadius);
            this.ball.endFill();
        }
    }
}

function startSimulation() {
    properties.ballSpeed = parseFloat(document.getElementById('ballSpeedInput').value);
    properties.num = parseInt(document.getElementById('numInput').value);
    properties.numInfected = parseInt(document.getElementById('numInfectedInput').value); // Update numInfected

    // Clear existing balls
    balls.forEach(ball => app.stage.removeChild(ball.ball));
    balls.length = 0;

    // Create new balls
    for (let i = 0; i < properties.num; i++) {
        createBall();
    }

    // Start animation
    app.ticker.add(update);

    // Remove start menu
    document.getElementById('startMenu').style.display = 'none';
}

document.getElementById('startButton').addEventListener('click', startSimulation);
