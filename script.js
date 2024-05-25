export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;
const resourceImage = new Image();
resourceImage.src = "./assets/G_Idle.png";
const tilemapImage = new Image();
tilemapImage.src = "./assets/Tilemap_Flat.png";

// global variables
export const cellSize = 100;
export const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
const spriteWidth = 64;
const spriteHeight = 64;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
export const projectiles = [];
const resources = [];

// mouse
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.clientX - canvasPosition.left;
  mouse.y = e.clientY - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.y = undefined;
  mouse.y = undefined;
});

// game board
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

const gridImage = new Image();
gridImage.src = "./assets/background.png";

class Cell {
  constructor(x, y, spriteX, spriteY) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.spriteX = spriteX;
    this.spriteY = spriteY;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y, 1, 1));
    }
  }
}
createGrid();
function handleGameGrid() {
  ctx.drawImage(gridImage, 0, cellSize, canvas.width, canvas.height);
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}
//projectiles
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}
function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        collision(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

const defenderImage = new Image();
defenderImage.src = "./assets/plant.png";
// defenders
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 1;
    this.spriteWidth = 167;
    this.spriteHeight = 243;
  }
  draw() {
    //ctx.fillStyle = "blue";
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "30px MedivalSharp";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeText(Math.floor(this.health), this.x + 25, this.y);
    ctx.fillStyle = "red";
    ctx.fillText(Math.floor(this.health), this.x + 25, this.y);

    ctx.drawImage(
      defenderImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(new Projectile(this.x + 70, this.y + 50));
      }
      if (frame % 40 == 0) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
      }
    } else {
      this.timer = 0;
    }
  }
}
canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }
  let defenderCost = 100;
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderCost;
  }
});
function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 1;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}
//enemies
const enemyImage = new Image();
enemyImage.src = "./assets/zombie.png";
class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 4;
    this.spriteWidth = 292;
    this.spriteHeight = 410;
  }
  update() {
    this.x -= this.movement;
    if (frame % 10 == 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
  draw() {
    //ctx.fillStyle = "red";
    //ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.font = "30px MedivalSharp";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeText(Math.floor(this.health), this.x + 25, this.y);
    ctx.fillStyle = "red";
    ctx.fillText(Math.floor(this.health), this.x + 25, this.y);
    //ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.drawImage(
      enemyImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10;
      numberOfResources += gainedResources;
      score += gainedResources;
      const findThisIndex = enemyPositions.indexOf(enemies[i].y);
      enemyPositions.splice(findThisIndex, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition =
      Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    enemies.push(new Enemy(verticalPosition));
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 30; // Reduced decrement
    if (enemiesInterval < 200) enemiesInterval = 200; // Minimum threshold
  }
}

// resources
const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }
  draw() {
    ctx.drawImage(resourceImage, this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px MedivalSharp";
    ctx.fillText(this.amount, this.x + 15, this.y + 25);
  }
}
function handleResources() {
  if (frame % 300 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount;
      resources.splice(i, 1);
      i--;
    }
  }
}

// utilities
function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px MedivalSharp";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Resources: " + numberOfResources, 20, 80);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "90px MedivalSharp";
    ctx.fillText("GAME OVER", canvas.width / 2 - 270, canvas.height / 2);
    ctx.font = "60px MedivalSharp";
    ctx.fillText(
      "Your Score: " + score,
      canvas.width / 2 - 200,
      canvas.height / 2 + 70
    );
  }
  if (score >= winningScore && enemies.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "60px MedivalSharp";
    ctx.fillText("LEVEL COMPLETE", canvas.width / 2 - 230, canvas.height / 2);
    ctx.font = "30px MedivalSharp";
    ctx.fillText(
      "You win with " + score + " points!",
      canvas.width / 2 - 150,
      canvas.height / 2 + 50
    );
  }
}

function animate() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame++;
    requestAnimationFrame(animate);
  } else {
    displayGameOverScreen();
  }
}

function displayGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.fillStyle = "black";
  ctx.font = "90px MedivalSharp";
  ctx.fillText("GAME OVER", canvas.width / 2 - 270, canvas.height / 2);
  ctx.font = "60px MedivalSharp";
  ctx.fillText(
    "Your Score: " + score,
    canvas.width / 2 - 200,
    canvas.height / 2 + 70
  );
}

resourceImage.onload = function () {
  document.getElementById("playButton").addEventListener("click", function () {
    document.getElementById("canvas").style.display = "block"; // Show the canvas
    canvasPosition = canvas.getBoundingClientRect(); // Update canvas position
    this.style.display = "none"; // Hide the play button
    animate(); // Start the game
  });
};

function collision(first, second) {
  return !(
    first.x > second.x + second.width ||
    first.x + first.width < second.x ||
    first.y > second.y + second.height ||
    first.y + first.height < second.y
  );
}

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
