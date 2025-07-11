var canvas = document.getElementById("gameField");
var ctx = canvas.getContext("2d");

// Game object
class GameObject {
    constructor(x, y, width, height, speed = 0, color = 'black') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.status = true;
        this.color = color;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move(directionX, directionY) {
        this.x += this.speed * directionX;
        this.y += this.speed * directionY;
    }

    isColidingWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    isOutOfBounds(canvas) {
        return (
            this.x + this.width < 0 ||
            this.x > canvas.width ||
            this.y + this.height < 0 ||
            this.y > canvas.height
        )
    }
}

class Spaceship extends GameObject {
    constructor(x, y) {
        super(x, y, 20, 10, 0.5, 'black');
    }
}

class Shot extends GameObject {
    constructor(x, y) {
        super(x, y, 5, 10, 1, 'red');
    }

    update() {
        this.move(0, -1);
    }
}

class Enemy extends GameObject {
    constructor(x, y, speed) {
        super(x, y, 15, 15, speed, 'rgb(0, 0, 0)');
    }
}

patterns = [
    [
        '-*-',
        '***',
        '-*-',
    ],
];

class EnemyWave {
    constructor(shape, canvas, speed) {
        this.shape = shape;
        this.canvas = canvas;
        this.enemies = [];

        this.enemySpacing = 5;
        this.enemyWidth = 15;
        this.enemyHeight = 15;
        this.originX = (canvas.width - (shape[0].length * (this.enemyWidth + this.enemySpacing))) / 2;
        this.originY = 10;

        this.directionX = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.stepSize = 10;
        this.speed = speed;
        this.lastMoveTime = 0;
        this.moveDelay = 500;

        this.createWave();
    }

    createWave() {
        for (let r = 0; r < this.shape.length; r++) {
            this.enemies[r] = [];
            for (let c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c] != '-') {
                    const x = this.originX + c * (this.enemyWidth + this.enemySpacing);
                    const y = this.originY + r * (this.enemyHeight + this.enemySpacing);
                    this.enemies[r][c] = new Enemy(x, y, this.speed);
                } else {
                    this.enemies[r][c] = null;
                }
            }
        }
    }

    move() {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveDelay) {
            return;
        }
        this.lastMoveTime = now

        this.offsetX += this.stepSize * this.directionX;
        let minX = canvas.width;
        let maxX = -1;
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                const enemy = this.enemies[r][c]
                if (enemy && enemy.status) {
                    const x = this.originX + this.offsetX + c * (this.enemyWidth + this.enemySpacing);
                    if (x < minX) minX = x;
                    if (x + this.enemyWidth > maxX) maxX = x + this.enemyWidth;
                }
            }
        }
        if (minX <= 0 || maxX >= this.canvas.width) {
            this.directionX *= -1;
        }
    }

    getAliveEnemies() {
        return this.enemies.flat().filter(enemy => enemy && enemy.status);
    }

    draw(ctx) {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                const enemy = this.enemies[r][c];
                if (enemy && enemy.status) {
                    enemy.x = this.originX + this.offsetX + c * (this.enemyWidth + this.enemySpacing);
                    enemy.y = this.originY + this.offsetY + r * (this.enemyHeight + this.enemySpacing);
                    enemy.draw(ctx);
                }
            }
        }
    }
}

// drawing function
function drawText(font, color, text, x, y) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}


class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.playerSpaceship = new Spaceship(
            (canvas.width - 20) / 2,
            canvas.height - 30,
        );
        this.enemyWave = new EnemyWave(patterns[0], canvas, 0.1);

        this.lastShotTime = 0;
        this.shotCooldown = 500;
        this.shots = [];

        this.rightPressed = false;
        this.leftPressed = false;
        this.shootPressed = false;
        this.keysPressed = {};
        document.addEventListener("keydown", this.keyDownHandler.bind(this));
        document.addEventListener("keyup", this.keyUpHandler.bind(this));
    }

    keyDownHandler(e) {
        if (e.keyCode == 68 || e.keyCode == 39) {
            this.rightPressed = true;
        } else if (e.keyCode == 65 || e.keyCode == 37) {
            this.leftPressed = true;
        }
        if (e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 87) {
            this.shootPressed = true;
        }
    }

    keyUpHandler(e) {
        if (e.keyCode == 68 || e.keyCode == 39) {
            this.rightPressed = false;
        } else if (e.keyCode == 65 || e.keyCode == 37) {
            this.leftPressed = false;
        }
        if (e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 87) {
            this.shootPressed = false;
        }
    }

    update() {
        // player shot
        const now = Date.now();
        if (this.shootPressed && now - this.lastShotTime  >= this.shotCooldown) {
            this.lastShotTime = now;
            const shot = new Shot(
                this.playerSpaceship.x + this.playerSpaceship.width / 2 - 2.5,
                this.playerSpaceship.y - 10,
            );
            this.shots.push(shot);
        }

        // enemy hit check
        for (const shot of this.shots) {
            shot.update();
            for (const enemy of this.enemyWave.getAliveEnemies()) {
                if (shot.isColidingWith(enemy)) {
                    shot.status = false;
                    enemy.status = false;
                }
            }
        }
        this.shots = this.shots.filter(shot => shot.status && !shot.isOutOfBounds(canvas));

        // player move
        if (this.rightPressed && this.playerSpaceship.x <= this.canvas.width - this.playerSpaceship.width) {
            this.playerSpaceship.move(1, 0);
        }
        if (this.leftPressed && this.playerSpaceship.x >= 0) {
            this.playerSpaceship.move(-1, 0);
        }

        // enemy move
        this.enemyWave.move();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.playerSpaceship.draw(this.ctx);
        for (const shot of this.shots) {
            shot.draw(ctx);
        }
        this.enemyWave.draw(ctx);
        drawText(
            "16px Arial",
            "rgb(0, 0, 0)",
            "Bullets: " + this.shots.length,
            10,
            20,
        );
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}

const game = new GameEngine(canvas);
game.start();
