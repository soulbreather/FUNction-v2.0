let tempAmount = 10;
let player;
let projectiles = [];

function setup() {
  // Creates the canvas in a div with the id of 'canvas-holder'
  windowWidth = windowWidth * 0.723;
  canvas = createCanvas(windowWidth, windowHeight * 0.9);
  canvas.parent('canvas-holder');
  for (let i = 0; i < tempAmount; i++) {
    projectiles[i] = new Projectile(20, floor(random(1, 5.9)), random(3, 6));
  }
  player = new Player(width - 100, 20, 6);
}

function draw() {
  background(220);
  for (let i = 0; i < tempAmount; i++) {
    projectiles[i].move();
    projectiles[i].display();
    // respawn if out of screen
    if (projectiles[i].x > width + projectiles[i].radius) {
      projectiles[i].x = -projectiles[i].radius;
      projectiles[i].getCoefficients();
    }
  }
  player.move();
  player.display();
}

function keyPressed() {
  if (keyCode == UP_ARROW || key == "w") {
    player.dir -= 1;
  }
  if (keyCode == DOWN_ARROW || key == "s") {
    player.dir += 1;
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW || key == "w") {
    player.dir += 1;
  }
  if (keyCode == DOWN_ARROW || key == "s") {
    player.dir -= 1;
  }
}

// Makes canvas responsive aka. always the full span of the browser
function windowResized() {
  resizeCanvas(windowWidth * 0.723, windowHeight * 0.9);
}