const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x1099bb,
});
document.body.appendChild(app.view);
app.interactive = true
const playerProperties = {
    radius: 20,
    color: 0x0000FF,
    speed: 5,
};
const playerBall = new PIXI.Graphics();
playerBall.beginFill(playerProperties.color);
playerBall.drawCircle(0, 0, playerProperties.radius);
playerBall.endFill();
playerBall.x = app.screen.width / 2;
playerBall.y = app.screen.height / 2;
app.stage.addChild(playerBall);

const bullets = [];

const keyState = {};
document.addEventListener('keydown', (e) => {
    keyState[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
});
app.ticker.add(() => {
    const speed = playerProperties.speed;

    if (keyState['w']) playerBall.y -= speed;
    if (keyState['a']) playerBall.x -= speed;
    if (keyState['s']) playerBall.y += speed;
    if (keyState['d']) playerBall.x += speed;
});
let mouseX, mouseY;

app.renderer.view.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY; 
});

function shootBullet() {

  // Calculate angle
  const angle = Math.atan2(mouseY - playerBall.y, mouseX - playerBall.x);

  // Rotate player 
  playerBall.rotation = angle;

   const bullet = new PIXI.Graphics();
    bullet.beginFill(0xFFFFFF);
    bullet.drawCircle(0, 0, 5); // Bullet size
    bullet.endFill();
    bullet.x = playerBall.x;
    bullet.y = playerBall.y;
  const speed = 7;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  bullet.vx = vx;
  bullet.vy = vy;
console.log(bullet.vx + "," + bullet.vy)
  app.stage.addChild(bullet);
  bullets.push(bullet)
}
app.renderer.view.addEventListener('click', shootBullet);


const properties = {
    ballRadius: 15,
    ballColor: 0x008B02,
    ballSpeed: 3,
    num: 99,
    numInfected: 10,
    worldBorderWidth: 5,
    worldBorderColor: 0xFFFFFF,
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
     bullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
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
    balls.forEach(ball => app.stage.removeChild(ball.ball));
    balls.length = 0;
    for (let i = 0; i < properties.num; i++) {
        createBall();
    }
    app.ticker.add(update);
    document.getElementById('startMenu').style.display = 'none';
}

document.getElementById('startButton').addEventListener('click', startSimulation);
