const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//globals
const cellSize = 100;
const cellGap = 3;
const defenderCost = 100;
let resources = 300;
let enemyInterval = 600;
let frame = 0;

const enemies = [];
const enemyPos = [];
const gameGrid = [];
const defenders = [];

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};

let pos = canvas.getBoundingClientRect();

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX - pos.left;
  mouse.y = e.clientY - pos.top;
});

canvas.addEventListener("mouseleave", (e) => {
  mouse.x = undefined;
  mouse.y = undefined;
});

//board
const headerBar = {
  width: canvas.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
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
      gameGrid.push(new Cell(x, y));
    }
  }
}

createGrid();

function drawGrid() {
  gameGrid.forEach((cell) => {
    cell.draw();
  });
}

class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "gold";
    ctx.font = "30px Arial";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

canvas.addEventListener("click", function () {
  const gridPosX = mouse.x - (mouse.x % cellSize);
  const gridPosY = mouse.y - (mouse.y % cellSize);
  if (gridPosY < cellSize) return;

  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPosX && defenders[i].y === gridPosY) return;
  }

  let defenderCost = 100;

  if (resources >= defenderCost) {
    defenders.push(new Defender(gridPosX, gridPosY));
    resources -= defenderCost;
  }
});

function handleDefenders() {
  defenders.forEach((defender) => {
    defender.draw();
  });
}

class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 * 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  update() {
    this.x -= this.movement;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
  }
  if (frame % 100 === 0) {
    let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(verticalPosition));
    enemyPos.push(verticalPosition);
  }
}

function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Arial";
  ctx.fillText("Resource: " + resources, 20, 55);
}

//animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, headerBar.width, headerBar.height);
  drawGrid();
  handleDefenders();
  handleEnemies();
  handleGameStatus();

  frame++;
  console.log(frame);
  requestAnimationFrame(animate);
}
animate();

function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}
