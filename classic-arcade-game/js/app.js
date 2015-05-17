"use strict";

// Global y positions
var y = [60, 145, 230, 315];

var gameOverTitle = 'Game Over';
var gameOverMsg = 'Damn... The chicken managed to cross the road! ';
var gameButtonText= 'Restart';

// Global Defaults (Constants)
var ENEMY_SPEED = 200;
var SPEED_STARTING_MULTIPLIER = 0;
var PLAYER_STARTING_SCORE = 0;
var PLAYER_STARTING_LIVES = 5;
var STARTING_LEVEL = 1;

// Players Bounds
var PLAYER_BOUNDS = 50;

// Global variable to determine state of game
var gameOver = false;


var Level = function() {
    this.level = 1;
    this.speedMultiplier = SPEED_STARTING_MULTIPLIER;
    this.divLevel = document.getElementById('level');
    this.displayLevel();
};

Level.prototype.displayLevel = function() {
    // Updates the displayed level
    this.divLevel.innerHTML = 'Level : ' + this.level;
}

Level.prototype.nextLevel = function() {
    this.level ++;
    this.speedMultiplier ++;
    console.log('Next Level:' + this.level + ', Speed Multiplier:'+ this.speedMultiplier);
    gameOver = true; // Diables user from using the 'allowedKeys'
    // Set the text for the modal
    gameButtonText = 'Continue';
    gameOverTitle = '<h4>Boom! You got there!</h4>';
    gameOverMsg = '<h5>You passed level this level <br/> Now on to level '+this.level+' and it is only going to get faster!</h5>';
    handleModal(gameOverTitle, gameOverMsg, gameButtonText);
    // Update the displayed level
    this.displayLevel();
};

Level.prototype.reset = function() {
    this.level = STARTING_LEVEL;
    this.speedMultiplier = SPEED_STARTING_MULTIPLIER;
    console.log('Next Level:' + this.level + ', Speed Multiplier:'+ this.speedMultiplier);
    gameOver = true; // Diables user from using the 'allowedKeys'
    // Set the text for the modal
    gameButtonText = 'Restart';
    gameOverTitle = '<h4>Game Over!</h4>';
    gameOverMsg = '<h5>Damn... The chicken managed to cross the road! </h5> <br/><h4> Score: '+player.score+' </h4>';
    handleModal(gameOverTitle, gameOverMsg, gameButtonText);
    // Update the displayed level
    this.displayLevel();
};


// Enemies our Player must avoid
var Enemy = function() {
    // Start outside of the canvas
    this.x = Math.floor((Math.random() * -200) + -50);
    // Randomly select a y position from the array declared globally
    this.y = y[Math.floor((Math.random()* 3))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * ENEMY_SPEED));
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype.update = function(dt) {
    // Updating the speed reletive to delta Time and the level reached (levelSpeed)
    this.x = this.x + level.speedMultiplier + (this.speed * dt);

    // Recycle the Enemy and send them on their way again from a
    // random y position in the global array
    if (this.x > 500) {
        this.reset();
    }

    // Check collisions with the Players bounds
    if (player.y >= this.y - PLAYER_BOUNDS && player.y <= this.y + PLAYER_BOUNDS) {
        if (player.x >= this.x - PLAYER_BOUNDS && player.x <= this.x + PLAYER_BOUNDS) {
            player.lives --;
            player.startPosition(); // Reset player to starting position
        }
    }
};

Enemy.prototype.reset = function() {
    this.x = Math.floor((Math.random() * -100) + -50);
    // Randomly select a y position from the array declared globally
    this.y = y[Math.floor((Math.random()* 3))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * ENEMY_SPEED));
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player class
var Player = function() {
    this.startPosition();
    this.sprite = 'images/char-boy.png';
    this.lives = PLAYER_STARTING_LIVES;
    this.score = PLAYER_STARTING_SCORE; // When this reaches 5, the character will progress to the next level
    this.divLives = document.getElementById('progressBarLife');
    this.divScore = document.getElementById('progressBarScore');
};

Player.prototype.update = function(dt) {
    // Set the progress width style
    this.divLives.style.width = (this.lives*20)+'%';
    this.divScore.style.width = (this.score*20)+'%';
    // Are we out of lives?? Then yea lets give the user a message to reflect that
    if(this.lives < 1){
        level.reset();
        this.reset();
    }
    if(this.score > 4){
        this.score = PLAYER_STARTING_SCORE; // Resetting score here to ensure 'level.level' does not go into an endless loop
        this.startPosition();
        level.nextLevel();
    }

    // Add to Players score when reaching the water
    if (this.y === -25) {
        this.score ++;
        this.startPosition(); //reset player only
    }
};

// Draw the Player on the screen
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.startPosition = function() {
    // Resetting Player position
    this.x = 200;
    this.y = 400;
};

Player.prototype.reset = function() {
    this.lives = PLAYER_STARTING_LIVES;
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

// Set the Level object in a variable called level
var level = new Level();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
// See the meximum amount of enemies
var maxEnemies = 3;
// Now push them into the array
for (var i = 0; i < maxEnemies; i++) {
    allEnemies.push(new Enemy(i));
}

// Place the player object in a variable called player
var player = new Player();

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
    $('#myModal').on('hidden.bs.modal', function (e) {
        gameOver = false; // When dismissing the modal, re-enable 'allowedKeys'
    });
}