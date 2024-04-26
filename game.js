class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.init();
  }

  init() {
    // Initialization code here
    console.log("Game initialized");
    this.startGameLoop();
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
