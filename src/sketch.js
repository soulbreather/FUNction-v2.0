let gameController;

let tempAmount = 10;
let player;
let projectiles = [];
let bullets = [];

let nHighscores = [];
let highscore = 0;

function setup() {

  // load cookie
  if (document.cookie != '') {
    let nCookie = CookieController.getCookie('minData');
    nHighscores = JSON.parse(nCookie);
  }

  // display highscores
  let tableBody = document.querySelector('#highscoreTable');
  for (let i = 0; i < nHighscores.length; i++) {
    let score = nHighscores[i];
    tableBody.innerHTML += `
      <tr>
        <td class="tableName pr-0">${score.name}</td>
        <td>${score.highscore} points</td>
      </tr>
    `;

  }
  console.log(nHighscores);

  // Creates the canvas in a div with the id of 'canvas-holder'
  canvas = createCanvas($("#canvas-holder").width(), windowHeight * 0.9);
  canvas.parent('canvas-holder');

  // set the framerate to 60 so it is equal for all
  frameRate(60);

  gameController = new GameController();

  for (let i = 0; i < tempAmount; i++) {
    projectiles[i] = new Projectile(20, floor(random(1, 5.9)), random(3, 6));
  }
  player = new Player(width - 100, 20, 6);

  windowResized();
}

function draw() {
  background(220);

  // update score dependent on survival time (every second)
  if (GameController.isStarted && !GameController.isPaused) {
    if (frameCount % 60 == 0) {
      gameController.survivalScoreUpdater();
    }

    // draw and moveprojectiles
    let projectileRemoveList = [];
    for (let projectile of projectiles) {
      projectile.move();
      projectile.display();
      // respawn if out of screen
      if (projectile.x > width + projectile.radius) {
        projectile.x = -projectile.radius;
        projectile.getCoefficients();
        projectile.hasCollided = false;
        // or remove it
        // let projectileIndex = projectiles.indexOf(projectile);
        // projectileRemoveList.push(projectileIndex);
      }
    }
    // remove the projectiles out of screen from the projectiles list
    for (let projectileToRemove of projectileRemoveList) {
      projectiles.splice(projectileToRemove, 1);
    }
    // move and draw player
    player.move();
    player.display();

    // check if projectile and player has collided
    for (let projectile of projectiles) {
      if (!projectile.hasCollided) {
        myDistance = dist(projectile.x, projectile.y, player.x, player.y);
        if (myDistance <= projectile.radius + player.radius) {
          // A collision has occured
          console.log("A collision has occured.");
          gameController.lives -= 1;
          if (gameController.lives <= 0) {
            gameController.saveHighscores();
            location.reload();
          }
          projectile.hasCollided = true;
        }
      }


    }

    // move and draw bullets 
    let removeBulletList = [];
    for (let bullet of bullets) {
      bullet.move();
      bullet.display();
      // if out of screen add to removelist - to not hog resources
      if (bullet.x < 0 - Bullet.radius) {
        let bulletIndex = bullets.indexOf(bullet);
        removeBulletList.push(bulletIndex);
      }
    }
    // remove bullet from list if out of screen
    for (let bulletToRemove of removeBulletList) {
      bullets.splice(bulletToRemove, 1);
    }

    gameController.displayScore();
    gameController.displayLives();
  } else if (!GameController.isStarted) {
    // draw menu
    gameController.displayMenu();
  } else if (GameController.isStarted && GameController.isPaused) {
    // draw pause menu
    gameController.displayPauseMenu();
  }

}

function keyPressed() {
  player.movement("pressed", key);
  gameController.keyHasBeenPressed();
}

function keyReleased() {
  player.movement("released", key);
}

function mousePressed() {
  gameController.mouseHasBeenPressed();
}

// Makes canvas responsive aka. always the full span of the browser
function windowResized() {
  resizeCanvas($("#canvas-holder").width(), windowHeight * 0.9);
  // make positions and sizes responsive
  player.x = floor(width * (473 / 498) - (7450 / 249));
  player.radius = floor(width * (5 / 498) + (1490 / 249));
  Bullet.radius = floor(width * (1 / 498) + (298 / 249));
  for (let projectile of projectiles) {
    projectile.radius = floor(width * (5 / 498) + (1490 / 249));
  }
}