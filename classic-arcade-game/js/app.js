"use strict";

var Constants = {
    // Global y positions
    y : [60, 145, 230, 315],
    // Enemies speed
    ENEMY_SPEED : 200,
    // Max Enemies to push ontop the screen
    MAX_ENEMIES : 5,
    // Multiplyer always starts at 0, as this is normal speed
    SPEED_STARTING_MULTIPLIER : 0,
    // Always start at level 1
    STARTING_LEVEL : 1,
    // Players Bounds
    PLAYER_BOUNDS : 50,
    // Player Sprite
    PLAYER_SPRITE : 'images/char-boy.png',
    // Player default Health and Score
    PLAYER_STARTING_LIVES : 5,
    PLAYER_STARTING_SCORE : 0,
    // Player Health and Score bars
    DIV_LIVES : document.getElementById('progressBarLife'),
    DIV_SCORE : document.getElementById('progressBarScore')
};

// Level Class -------------------------------------------------------------
var Level = function() {
    this.gameOver = false;
    this.level = 1;
    this.speedMultiplier = Constants.SPEED_STARTING_MULTIPLIER;
    this.divLevel = document.getElementById('level');
    this.displayLevel();
};

Level.prototype.displayLevel = function() {
    // Updates the displayed level
    this.divLevel.innerHTML = 'Level : ' + this.level;
};

Level.prototype.nextLevel = function() {
    this.level ++;
    this.speedMultiplier ++;
    console.log('Next Level:' + this.level + ', Speed Multiplier:'+ this.speedMultiplier);
    this.gameOver = true; // Disables user from using the 'allowedKeys'
    // Update the displayed level
    this.displayLevel();
};

Level.prototype.reset = function() {
    this.level = Constants.STARTING_LEVEL;
    this.speedMultiplier = Constants.SPEED_STARTING_MULTIPLIER;
    console.log('Next Level:' + this.level + ', Speed Multiplier:'+ this.speedMultiplier);
    this.gameOver = true; // Disables user from using the 'allowedKeys'
    // Update the displayed level
    this.displayLevel();
};

// Enemies our Player must avoid -----------------------------------------
var Enemy = function() {
    // Start outside of the canvas
    this.x = Math.floor((Math.random() * -200) + -50);
    // Randomly select a y position from the array declared globally
    this.y = Constants.y[Math.floor((Math.random()* 4))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * Constants.ENEMY_SPEED));
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
    if (player.y >= this.y - Constants.PLAYER_BOUNDS && player.y <= this.y + Constants.PLAYER_BOUNDS) {
        if (player.x >= this.x - Constants.PLAYER_BOUNDS && player.x <= this.x + Constants.PLAYER_BOUNDS) {
            player.lives --;
            player.startPosition(); // Reset player to starting position
        }
    }
};

Enemy.prototype.reset = function() {
    this.x = Math.floor((Math.random() * -100) + -50);
    // Randomly select a y position from the array declared globally
    this.y = Constants.y[Math.floor((Math.random()* 4))];
    // Adjust speed randomly
    this.speed = Math.floor(200 + (Math.random() * Constants.ENEMY_SPEED));
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player class----------------------------------------------------------
var Player = function() {
    this.startPosition();
    this.sprite = Constants.PLAYER_SPRITE;
    this.lives = Constants.PLAYER_STARTING_LIVES;
    this.score = Constants.PLAYER_STARTING_SCORE;
    this.divLives = Constants.DIV_LIVES;
    this.divScore = Constants.DIV_SCORE;
};

Player.prototype.update = function(dt) {
    // Set the progress width style
    this.divLives.style.width = (this.lives*20)+'%';
    this.divScore.style.width = (this.score*20)+'%';
    // Are we out of lives?? Then yea lets give the user a message to reflect that
    if (this.lives < 1){
        level.reset();
        this.modalText();
        this.reset();
    }
    if (this.score > 4){
        this.startPosition();
        this.modalText();
        this.score = Constants.PLAYER_STARTING_SCORE; // Resetting score here to ensure 'level.level' does not go into an endless loop
        level.nextLevel();
    }

    // Add to Players score when reaching the water
    if (this.y === -25) {
        this.score ++;
        console.log(this.score);
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
    this.lives = Constants.PLAYER_STARTING_LIVES;
};

Player.prototype.modalText = function() {
    if(this.lives < 1) {
        // Set the text for the modal
        this.gameButtonText = 'Restart';
        this.gameOverTitle = '<h4>Game Over!</h4>';
        this.gameOverMsg = '<h5>Damn... The chicken managed to cross the road! </h5> <br/><h4> Score: '+this.score+' </h4>';
        handleModal(this.gameOverTitle, this.gameOverMsg, this.gameButtonText);
    };
    if(this.score > 4){
        console.log('got it');
        this.gameButtonText = 'Continue';
        this.gameOverTitle = '<h4>Boom! You got there!</h4>';
        this.gameOverMsg = '<h5>You passed level '+level.level+' <br/> Now on to the next and it is only going to get faster!</h5>';
        handleModal(this.gameOverTitle, this.gameOverMsg, this.gameButtonText);
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

// Set the Level object in a variable called level
var level = new Level();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
// See the meximum amount of enemies

// Now push them into the array
for (var i = 0; i < Constants.MAX_ENEMIES; i++) {
    allEnemies.push(new Enemy(i));
}

// Place the player object in a variable called player
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
// Updated to lock keyboard when game over modal appears
document.addEventListener('keyup', function(e) {
    if(!level.gameOver){
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
        level.gameOver = false; // When dismissing the modal, re-enable 'allowedKeys'
    });
}