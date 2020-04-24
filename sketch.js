let tempAmount = 10;
let player;
let projectiles = [];
let bullets = [];

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
  let projectileRemoveList = [];
  for (let projectile of projectiles) {
    projectile.move();
    projectile.display();
    // respawn if out of screen
    if (projectile.x > width + projectile.radius) {
      projectile.x = -projectile.radius;
      projectile.getCoefficients();
      // or remove it
      // let projectileIndex = projectiles.indexOf(projectile);
      // projectileRemoveList.push(projectileIndex);
    }
  }
  // this code removes the projectiles out of screen from the projectiles list
  for (let projectileToRemove of projectileRemoveList) {
    projectiles.splice(projectileToRemove, 1);
  }
  player.move();
  player.display();

  let removeBulletList = [];
  for (let bullet of bullets) {
    bullet.move();
    bullet.display();
    // if out of screen add to removelist - to not hog resources
    if (bullet.x < 0 - bullet.radius) {
      let bulletIndex = bullets.indexOf(bullet);
      removeBulletList.push(bulletIndex);
    }
  }
  // remove bullet from list if out of screen
  for (let bulletToRemove of removeBulletList) {
    bullets.splice(bulletToRemove, 1);
  }
}

function keyPressed() {
  player.movement("pressed", key);
}

function keyReleased() {
  player.movement("released", key);
}

// Makes canvas responsive aka. always the full span of the browser
function windowResized() {
  resizeCanvas(windowWidth * 0.723, windowHeight * 0.9);
}