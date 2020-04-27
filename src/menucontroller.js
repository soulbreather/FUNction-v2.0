class GameController {
    static isStarted = false;
    static isPlaying = false;
    static isPaused = false;

    constructor() {
        this.score = 0;
        this.playButton = new Button(width / 2, height / 2, 200, 90, 'Start');
    }

    displayMenu() {
        this.playButton.display();
    }

    displayScore() {
        textAlign(RIGHT, TOP);
        textSize(30);
        fill(0)
        text(str(this.score) + " points", width - 5, 5);
    }

    mouseHasBeenPressed() {
        if (this.playButton.isClicked()) {
            GameController.isStarted = true;
        }
    }

    survivalScoreUpdater() {
        this.score += 10;
        if (this.score > highscore) {
            highscore = this.score;
            document.cookie = 'highscore='+highscore;
        }
    }
}

class Button {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.active = true;
    }

    display() {
        push();
        translate(this.x - this.width / 2, this.y - this.height / 2);
        stroke(0);
        fill(255);
        rect(0, 0, this.width, this.height);
        fill(0);
        textSize(70);
        textAlign(CENTER, CENTER);
        text(this.text, this.width / 2 - 2, this.height / 2 + 4);
        pop();
    }

    isClicked() {
        if (this.active && mouseX > this.x - this.width / 2 && mouseX < this.x - this.width / 2 + this.width && mouseY > this.y - this.height / 2 && mouseY < this.y - this.height / 2 + this.height) {
            console.log('yeet');
            this.active = false;
            return true;

        }
    }
}