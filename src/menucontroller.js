class GameController {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.playButton = new Button(width / 2, height / 2, 200, 90, 'Play');
        this.tutorialButton = new Button(width / 2, height / 2 + 120, 250, 80, 'Tutorial');
    }

    displayMenu() { // displays the main menu
        this.playButton.display();
        this.tutorialButton.display();
    }

    displayPauseMenu() { // displays the pause menu
        push();
        textAlign(CENTER, CENTER);
        textSize(50);
        text('The game is paused', width / 2, height / 2 - 20);

        textSize(30);
        text('Hit ESCAPE to resume the game', width / 2, height / 2 + 40);
        pop();
    }

    displayScore() { // displays the current score in the top right corner
        textAlign(RIGHT, TOP);
        textSize(30);
        fill(255);
        text(str(this.score) + " points", width - 5, 5);
    }

    keyHasBeenPressed() { // Detects if the escape key was hit and changes screens accordingly
        if (keyCode == ESCAPE && currentScreen != 0) {
            if (currentScreen == 1) {
                currentScreen = 2;
            } else if (currentScreen == 2) {
                currentScreen = 1;
            }
        }
    }

    mouseHasBeenPressed() { // detects if mouse has clicked on either the tutorial button or the play/start button
        if (currentScreen == 0) {
            if (this.playButton.isClicked()) {
                currentScreen = 1;
                enemies = [];
                bullets = [];
                for (let i = 0; i < tempAmount; i++) {
                    makeEnemy(true);
                }

            }
            if (this.tutorialButton.isClicked()) {
                currentScreen = 3;
                makeEnemy(false, tutorialList[currentTutorialEnemy]);
            }

        }
    }

    survivalScoreUpdater(wasSpaceship) { // updates the current score
        if (wasSpaceship) {
            this.score += 50;
        } else {
            this.score += 1000;
        }
    }

    displayLives() { // updates and draws lives in top left corner
        this.hearts = "❤️".repeat(this.lives);
        textAlign(LEFT, TOP);
        textSize(30);
        text(str(this.hearts), 0 + 5, 5);
    }

    saveHighscores() { // saves highscore in cookies
        let myName = window.prompt('Type in the name that should be displayed with the score', '');
        if (myName == null || myName == "") {
            myName = 'Unnamed';
        }
        if (myName.length > 9) {
            myName = myName.slice(0, 10);
        }
        // add
        highscores.push({
            name: myName,
            highscore: this.score,
        });

        // sort
        highscores.sort((a, b) => {
            return b.highscore - a.highscore;
        });
        console.log(highscores);

        // save
        let saveValue = JSON.stringify(highscores.slice(0, 5));
        CookieController.setCookie('minData', saveValue, 365);

    }


    resetHighscores() {
        alert('The highscore has been reset');
        CookieController.setCookie('minData', null, 0);
        location.reload()
    }
}

class Button { // a class for interactable buttons
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.active = true;
    }

    display() { // displays the button
        if (this.active) {
            push();
            translate(this.x - this.width / 2, this.y - this.height / 2);
            stroke(0);
            fill(180);
            rect(0, 0, this.width + 3, this.height + 4);
            fill(255);
            noStroke()
            rect(0, 0, this.width, this.height);
            fill(0);
            textSize(70);
            textAlign(CENTER, CENTER);
            text(this.text, this.width / 2 - 2, this.height / 2 + 4);
            pop();
        }
    }

    isClicked() { // checks if the button was clicked
        if (this.active && mouseX > this.x - this.width / 2 && mouseX < this.x - this.width / 2 + this.width && mouseY > this.y - this.height / 2 && mouseY < this.y - this.height / 2 + this.height) {
            this.active = false;
            return true;
        }
        return false;
    }
}

class CookieController { // compares current cookie with new data and adds values accordingly
    static setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    static getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}
