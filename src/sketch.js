let gameController;

let bg;
let tempAmount = 5;
let player;
let projectiles = [];
let bullets = [];
let tutorialIsOver = true;

let nHighscores = [];
let highscore = 0;

let enemyImages = [];
let playerLaserImage;

function preload() {
  // load all enemy images
  let enemyColors = ['Blue', 'Green', 'Red'];
  for (let nColor of enemyColors) {
    for (let i = 1; i < 6; i++) {
      let nImage = loadImage(`assets/enemies/enemy${nColor}${i}.png`);
      enemyImages.push(nImage);
    }
  }

  // load player image
  playerImage = loadImage(`assets/playership.png`);


  // load player laser
  playerLaserImage = loadImage(`assets/playerlaser.png`);
}

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

  // Creates the canvas in a div with the id of 'canvas-holder'
  canvas = createCanvas($("#canvas-holder").width(), windowHeight * 0.9);
  document.querySelector('#defaultCanvas0').style.borderRadius = '0.4rem';
  canvas.parent('canvas-holder');

  // set the framerate to 60 so it is equal for all
  frameRate(60);

  gameController = new GameController();
  if (tutorialIsOver) {
    for (let i = 0; i < tempAmount; i++) {
      makeEnemy(true);
    }
  }

  player = new Player(width - 100, 20, 6);

  bg = loadImage('assets/star-background.jpg');

  windowResized();
}

function draw() {
  background(bg);

  // update score dependent on survival time (every second)
  if (GameController.isStarted && !GameController.isPaused) {
    if (tutorialIsOver) {

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
          let projectileIndex = projectiles.indexOf(projectile);
          projectileRemoveList.push(projectileIndex);
          makeEnemy(true);
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
      projectileRemoveList = [];
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


        // check if projectile and bullet has collided
        let removeBulletList = [];
        for (let bullet of bullets) {
          bulletDist = dist(projectile.x, projectile.y, bullet.x, bullet.y);
          if (bulletDist <= projectile.radius + Bullet.radius) {
            console.log("Bullet hit an enemy");

            let bulletIndex = bullets.indexOf(bullet);
            removeBulletList.push(bulletIndex);
            projectile.updateHealth();

            if (projectile.isDead()) {
              console.log("dead")
              let ind = projectiles.indexOf(projectile);
              projectileRemoveList.push(ind);
            }
          }
        }
        // remove bullet from list if it has hit an enemy
        for (let bulletToRemove of removeBulletList) {
          bullets.splice(bulletToRemove, 1);
        }
      }
      // remove the projectiles if they are dead
      for (let projectileToRemove of projectileRemoveList) {
        projectiles.splice(projectileToRemove, 1);
        makeEnemy();
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

// makes an enemy and appends it to the enemies list
function makeEnemy(makeRandom, specificFunc) {
  if (makeRandom == true) {
    projectiles.push(new Projectile(getImageSize(), floor(random(1, 5.9)), random(3, 6)));
  }
  if (makeRandom != true) {
    projectiles.push(new Projectile(getImageSize(), specificFunc, random(3, 6)));
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
  player.radius = getImageSize();
  Bullet.radius = floor(width * (1 / 498) + (298 / 249));
  player.iWidth = playerImage.width / 1.6 * getImageSize() / 20;
  player.iHeight = playerImage.height / 1.6 * getImageSize() / 20;

  for (let projectile of projectiles) {
    projectile.radius = getImageSize();
    projectile.iWidth = projectile.eImage.width / 1.6 * getImageSize() / 20;
    projectile.iHeight = projectile.eImage.height / 1.6 * getImageSize() / 20;
  }

  // we are missing image size of enemies and player...
}

function getImageSize() {
  return floor(width * (5 / 498) + (1490 / 249));
}

function tutorial() {
  tutorialIsOver = false;
  for (let i = 1; i < 6; i++) {
    makeEnemy(false, i);
  }
  tutorialIsOver = true;
}