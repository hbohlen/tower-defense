const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

//globals
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

const mouse = {
  x: undefined,
  y: undefined,
  width: 0.1,
  height: 0.1,
};

let pos = canvas.getBoundingClientRect();

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX - pos.left;
  mouse.y = e.clientY - pos.top;
});

canvas.addEventListener("mousemove", (e) => {
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
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
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

//animation loop
function animate() {
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, headerBar.width, headerBar.height);
  drawGrid();
  requestAnimationFrame(animate);
}
animate();
