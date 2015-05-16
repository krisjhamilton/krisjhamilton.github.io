"use strict";

// Global y positions
var y = [60, 145, 230, 315];

// Game Setting Defaults
var playerLivesDefault = 5;
var gameLevelDefault = 1;
var playerScoreDefault = 0;
var gameOverTitle = '';
var gameOverMsg = '';
var gameButtonText= '';

// Global speed for the enemy
var enemySpeed = 200;

// Global enemy speed adjustment for each level, 0 being the slowest
var levelSpeed = 0;

// Players Bounds
var playerBounds = 50;

// Global variable to determine state of game
var gameOver = false;

// Enemies our Player must avoid
var Enemy = function() {
    // Start outside of the canvas
    this.x = Math.floor((Math.random() * -200) + -50);
    // Randomly select a y position from the array declared globally
    this.y = y[Math.floor((Math.random()* 3))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * enemySpeed));
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype.update = function(dt) {
    // Updating the speed reletive to delta Time and the level reached (levelSpeed)
    this.x = this.x + levelSpeed + (this.speed * dt);

    // Recycle the Enemy and send them on their way again from a
    // random y position in the global array
    if (this.x > 500) {
        this.reset();
    }

    // Check collisions with the Players bounds
    if (player.y >= this.y - playerBounds && player.y <= this.y + playerBounds) {
        if (player.x >= this.x - playerBounds && player.x <= this.x + playerBounds) {
            player.lives --;
            player.reset(); //reset player only
        }
    }
};

Enemy.prototype.reset = function() {
    this.x = Math.floor((Math.random() * -100) + -50);
    // Randomly select a y position from the array declared globally
    this.y = y[Math.floor((Math.random()* 3))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * enemySpeed));
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player class
var Player = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = 'images/char-boy.png';
    this.lives = playerLivesDefault;
    this.score = playerScoreDefault;
    this.level = gameLevelDefault;
};

Player.prototype.update = function(dt) {
    // Update the players score and lives
    var displayLives = this.lives;
    var displayLevel = this.level;
    var displayScore = this.score;
    document.getElementById('level').innerHTML = 'Level : ' + displayLevel;

    // Decided to change to progress bars instead of labels
    //document.getElementById('lives').innerHTML = 'Lives : ' + displayLives;
    //document.getElementById('score').innerHTML = 'Score : ' + displayScore;

    // Find the div's to update
    var divArrayLife = document.getElementById('progressBarLife');
    var divArrayScore = document.getElementById('progressBarScore');

    // Set the progress width style
    divArrayLife.style.width = (displayLives*20)+'%';
    divArrayScore.style.width = (displayScore*20)+'%';

    // Add to Players score when reaching the water
    if (this.y === -25) {
        this.score ++;
        this.reset(); //reset player only
    }
};

// Draw the Player on the screen
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.reset = function() {
    // Resetting Player position
    this.x = 200;
    this.y = 400;
    var displayScore = this.score;
    var displayLevel = this.level;
    // Are we out of lives?? Then yea lets give the user a message to reflect that
    if(this.lives < 1){
        gameOver = true;
        gameButtonText = 'Restart';
        gameOverTitle = '<h4>Game Over!</h4>';
        gameOverMsg = '<h5>Damn... The chicken managed to cross the road! </h5> <br/><h4> Score: '+displayScore+' </h4>';
        handleModal(gameOverTitle, gameOverMsg, gameButtonText);
    }
    // Have we reached 5 points to progress to the next level? Then give the user a message to reflect that
    if(this.score > 4){
        gameOver = true;
        gameButtonText = 'Continue';
        gameOverTitle = '<h4>Boom! You got there!</h4>';
        gameOverMsg = '<h5>You passed level '+displayLevel+' <br/> Now it is only going to get faster!</h5>';
        handleModal(gameOverTitle, gameOverMsg, gameButtonText);
    }
};

// Adapting the input to ensure the Player does not go outside the canvas bounds
// We could make it though that the Player appears on the otherside - almost like teleporting
Player.prototype.handleInput = function(allowedKeys) {
    if (allowedKeys === 'left' && this.x > 0) {
        this.x = this.x - 100;
    }
    if (allowedKeys === 'right' && this.x < 400) {
        this.x = this.x + 100;
    }
    if (allowedKeys === 'down' && this.y < 400) {
        this.y = this.y + 85;
    }
    if (allowedKeys === 'up' && this.y > 0) {
        this.y = this.y - 85;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

// Now pushe them into the array, but only 3 of them
for (var i = 0; i < 3; i++) {
    allEnemies.push(new Enemy(i));
}

// Place the player object in a variable called player
var player = new Player(200, 400);

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
// Updated to lock keyboard when game over modal appears
document.addEventListener('keyup', function(e) {
    if(!gameOver){
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
    player.handleInput(allowedKeys[e.keyCode]);
    }
});

// Display the Bootstrap Model and pass through relevant message
function handleModal(modalTitle, modalMsg, modalButton) {
    $('#myModal').on('shown.bs.modal', function () {
        $('#myModal').find('h4').html(modalTitle);
        $('#myModal').find('p').html(modalMsg);
        $('#myModal').find(':button').text(modalButton);
        $('#myInput').focus();
    });
    $('#myModal').modal('show');
    // When closing, do the final checks and update variables
    $('#myModal').on('hidden.bs.modal', function (e) {
        if(player.lives < 1){
            player.level = gameLevelDefault;
            player.lives = 5;
            levelSpeed = 0;
        }
        if(player.score > 4){
            player.level ++;
            levelSpeed ++;
        }
        player.score = 0;
        gameOver = false;
    });
}