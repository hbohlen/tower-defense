class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    // Log the width and height of the canvas
    console.log("Width:", canvas.width);
    console.log("Height:", canvas.height);
    this.init();
  }

  updateCanvasSize() {
    const style = window.getComputedStyle(this.canvas);
    const width = parseInt(style.width);
    const height = parseInt(style.height);
    this.canvas.width = width - (width % 64);
    this.canvas.height = height - (height % 64);
  }

  init() {
    // Initialization code here
    console.log("Game initialized");
    this.calculateMapSize();
    this.startGameLoop();
  }

  calculateMapSize() {
    const mapWidth = this.canvas.width / 64;
    const mapHeight = this.canvas.height / 64;
    console.log("Map Width in Tiles:", mapWidth);
    console.log("Map Height in Tiles:", mapHeight);
  }

  startGameLoop() {
    const gameLoop = () => {
      // Update and render game
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}

export default Game;
