let gameController;

let bg;
let tempAmount = 5;
let player;
let showDamageUntil = 0;
let enemies = [];
let bullets = [];

let tutorialList = [1, 2, 3, 4, 5];
let nameofFunctionNumber = ['Lineaer', 'Parabola', 'Exponential', 'Hyperbole', 'Trigonometric'];
let currentTutorialEnemy = 0;
let enemySpawned = false;

let highscores = [];
let highscore = 0;

let enemyImages = [];

let playerLaserImages = [];
let selectedLaser;

let currentScreen = 0;
// 0 = startscreen
// 1 = game screen
// 2 = pause screen
// 3 = tutorial screen

let audioLasers = [];
let backgroundAudio;

// this function blocks the main thread and waits until all images are loaded
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
  let laserColors = ['Blue', 'Brown', 'Green', 'Red', 'Yellow']
  for (let lColor of laserColors) {
    playerLaserImages.push(loadImage(`assets/laser${lColor}.png`));
  }
  selectedLaser = 0;

  // load background image
  bg = loadImage('assets/star-background.jpg');

  // Load laser audio from file
  for (let i = 1; i < 6; i++) {
    const audioFile = loadSound(`assets/audio/laserSound${i}.ogg`);
    audioLasers.push(audioFile);
  }

  // Load background audio
  backgroundAudio = loadSound('assets/audio/Battleship.mp3');

}

function setup() {

  // load cookie
  if (document.cookie != '') {
    let nCookie = CookieController.getCookie('minData');
    highscores = JSON.parse(nCookie);
  }

  // display highscores
  let tableBody = document.querySelector('#highscoreTable');
  for (let i = 0; i < highscores.length; i++) {
    let score = highscores[i];
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

  player = new Player(width - 100, 20, 6);

  windowResized();

  // start playing background music
  backgroundAudio.play();
  backgroundAudio.setVolume(0.18);
  backgroundAudio.loop();
}

function draw() {
  background(bg);

  // update score dependent on survival time (every second)
  if (currentScreen == 1) {

    if (frameCount % 60 == 0) {
      gameController.survivalScoreUpdater(false);
    }

    // draw and moveenemies
    let enemyRemoveList = [];
    for (let enemy of enemies) {
      enemy.move();
      enemy.display();
      // respawn if out of screen
      if (enemy.x > width + enemy.radius) {
        let enemyIndex = enemies.indexOf(enemy);
        enemyRemoveList.push(enemyIndex);
        makeEnemy(true);
      }
    }
    // remove the enemies out of screen from the enemies list
    for (let enemyToRemove of enemyRemoveList) {
      enemies.splice(enemyToRemove, 1);
    }
    // move and draw player
    player.move();
    player.display();

    // check if enemy and player has collided
    enemyRemoveList = [];
    for (let enemy of enemies) {
      if (!enemy.hasCollided) {
        myDistance = dist(enemy.x, enemy.y, player.x, player.y);
        if (myDistance <= enemy.radius + player.radius) {
          // A collision has occured
          console.log("A collision has occured.");
          gameController.lives -= 1;
          showDamageUntil = millis() + 100;
          if (gameController.lives <= 0) {
            gameController.saveHighscores();
            location.reload();
          }
          enemy.hasCollided = true;
        }
      }


      // check if enemy and bullet has collided
      let removeBulletList = [];
      for (let bullet of bullets) {
        bulletDist = dist(enemy.x, enemy.y, bullet.x, bullet.y);
        if (bulletDist <= enemy.radius + Bullet.radius) {
          console.log("Bullet hit an enemy");

          let bulletIndex = bullets.indexOf(bullet);
          removeBulletList.push(bulletIndex);
          enemy.updateHealth(bullet.laserNumber);

          if (enemy.isDead()) {
            // you get extra points for destroying enemy ships
            gameController.survivalScoreUpdater(true);
            let ind = enemies.indexOf(enemy);
            enemyRemoveList.push(ind);
          }
        }
      }
      // remove bullet from list if it has hit an enemy
      for (let bulletToRemove of removeBulletList) {
        bullets.splice(bulletToRemove, 1);
      }
    }
    // remove the enemies if they are dead
    for (let enemyToRemove of enemyRemoveList) {
      enemies.splice(enemyToRemove, 1);
      makeEnemy(true);
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

    push();
    textSize(32);
    noStroke();
    textAlign(CENTER, CENTER);
    fill(255, 190);
    text("Your laser type is effective against " + nameofFunctionNumber[selectedLaser], width / 2, height - 40);
    pop();

    if (showDamageUntil > millis()) {
      background(255, 0, 0);
    }

  } else if (currentScreen == 0) {
    // draw menu
    gameController.displayMenu();
  } else if (currentScreen == 2) {
    // draw pause menu
    gameController.displayPauseMenu();
  } else if (currentScreen == 3) {

    player.move();
    player.display();

    // move and display enemy
    let enemyRemoveList = [];
    for (let enemy of enemies) {
      enemy.move();
      enemy.display();
      // respawn if out of screen
      if (enemy.x > width + enemy.radius) {
        let enemyIndex = enemies.indexOf(enemy);
        enemyRemoveList.push(enemyIndex);
        makeEnemy(false, tutorialList[currentTutorialEnemy]);
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
    for (let enemy of enemies) {
      // check if enemy and bullet has collided
      removeBulletList = [];
      for (let bullet of bullets) {
        bulletDist = dist(enemy.x, enemy.y, bullet.x, bullet.y);
        if (bulletDist <= enemy.radius + Bullet.radius) {
          console.log("Bullet hit an enemy");

          let bulletIndex = bullets.indexOf(bullet);
          removeBulletList.push(bulletIndex);
          enemy.updateHealth(bullet.laserNumber, 7, 0.4);

          if (enemy.isDead()) {
            // spawn the next enemy type
            currentTutorialEnemy += 1;
            if (currentTutorialEnemy > 4) {
              currentScreen = 0;
            } else {
              makeEnemy(false, tutorialList[currentTutorialEnemy]);

            }

            let ind = enemies.indexOf(enemy);
            enemyRemoveList.push(ind);
          }
        }
      }

      // remove bullet from list if it has hit an enemy
      for (let bulletToRemove of removeBulletList) {
        bullets.splice(bulletToRemove, 1);
      }
    }


    // remove the enemies out of screen from the enemies list
    for (let enemyToRemove of enemyRemoveList) {
      enemies.splice(enemyToRemove, 1);
    }

    push();
    textSize(32);
    noStroke();
    textAlign(CENTER, CENTER);
    fill(255);
    text("Select the corresponding laser (1-5) for extra damage", width / 2, 40);
    fill(255, 200);
    text("Your laser type is " + nameofFunctionNumber[selectedLaser], width / 2, height - 80);
    text("Current function is " + nameofFunctionNumber[currentTutorialEnemy], width / 2, height - 40);
    pop();
  }

}

// makes an enemy and appends it to the enemies list
function makeEnemy(makeRandom, specificFunc) {
  if (makeRandom == true) {
    enemies.push(new Enemy(getImageSize(), floor(random(1, 5.9)), random(3, 6)));
  }
  if (makeRandom != true) {
    enemies.push(new Enemy(getImageSize(), specificFunc, random(3, 6)));
  }
}

function keyPressed() {
  player.movement("pressed", key);
  player.switchLaser();
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

  for (let enemy of enemies) {
    enemy.radius = getImageSize();
    enemy.iWidth = enemy.eImage.width / 1.6 * getImageSize() / 20;
    enemy.iHeight = enemy.eImage.height / 1.6 * getImageSize() / 20;
  }

}

function getImageSize() {
  return floor(width * (5 / 498) + (1490 / 249));
}