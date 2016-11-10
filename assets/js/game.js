/**
 * Created by Weizguy on 10/25/2016.
 * Game logic built with Phaser engine
 */

// declaration of game engine
// this is where you can change the board size
var gameWidth = 1150;
var gameHeight = 800;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'playground', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

// set up for use of Orbitron font
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  Set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function () {
        game.time.events.add(Phaser.Timer.SECOND, createText, this);
    },

    //  The Google Fonts we want to load (we could specify others, but we use Orbitron)
    google: {
        families: ['Orbitron']
    }
};

// declare all globals
var background = null;
var foreground = null;
var cursors = null;
var speed = 300;
var playerShip;
var alive = false;
var scouts;
var phoenix;
var phoenixLaunchTimer;
var phoenixLaunched = false;
var phoenixSpacing = 2500;
var blaster;
var bulletsL;
var bulletTimeL = 0;
var bullet;
var bulletL;
var scoutBullet;
var enemyBullets;
var explosions;
var explode;
var playerDeath;
var playerShield;
var music;
var gameOver;
var gameOverText = '';
var playGameText = '';
var scoreText = '';
var highScoreText = '';
var playAgainText = '';
var score = 0;
var highScore = 0;
var pLives;
var maxLives = 2; // actually 2 represents two lives beyond current life
var maxHealth = 80;
var phoenixTime = 100; // set phoenix scouts to come in after set score
var playerHealth = maxHealth;
var numLives = maxLives;

function preload() {

    // add the images/audio to the game
    game.load.image('background', 'assets/images/background.png');
    game.load.image('playerShip', 'assets/images/battlecruiser.png');
    game.load.image('scout', 'assets/images/scout.png');
    game.load.image('phoenix', 'assets/images/phoenix.png');
    game.load.image('bulletL', 'assets/images/playerBullet1.png');
    game.load.image('scoutBullet', 'assets/images/enemyBullet0.png');
    game.load.image('phoenixBullet', 'assets/images/enemyBullet1.png');
    game.load.spritesheet('kaboom', 'assets/images/explode.png', 128, 128);
    game.load.audio('blaster', 'assets/sounds/blaster.mp3');
    game.load.audio('explode', 'assets/sounds/explosion.mp3');
    game.load.audio('music', 'assets/sounds/gameMusic.mp3');
    game.load.image('shield0', 'assets/images/shield0.png');
    game.load.image('shield1', 'assets/images/shield1.png');
    game.load.image('shield2', 'assets/images/shield2.png');
    game.load.image('shield3', 'assets/images/shield3.png');
    game.load.image('lives', 'assets/images/lives.png');
    // Load the Google WebFont Loader script
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}

// create the score text
function createText() {

    // Score Text
    scoreText = game.add.text(10, 10, "Score:\n" + score);
    scoreText.font = 'Orbitron';
    scoreText.fontSize = 20;
    scoregrd = scoreText.context.createLinearGradient(0, 0, 0, scoreText.canvas.height);
    scoregrd.addColorStop(0, 'lightblue');
    scoregrd.addColorStop(1, 'blue');
    scoreText.fill = scoregrd;
    scoreText.align = 'left';
    scoreText.stroke = '#000000';
    scoreText.strokeThickness = 2;
    scoreText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

    // High Score Text
    game.time.events.add(1000, getHighScore);
    highScoreText = game.add.text(game.width - 150, 10, "High Score:\n" + highScore);
    highScoreText.font = 'Orbitron';
    highScoreText.fontSize = 20;
    highScoregrd = highScoreText.context.createLinearGradient(0, 0, 0, highScoreText.canvas.height);
    highScoregrd.addColorStop(0, 'lightblue');
    highScoregrd.addColorStop(1, 'blue');
    highScoreText.fill = highScoregrd;
    highScoreText.align = 'right';
    highScoreText.stroke = '#000000';
    highScoreText.strokeThickness = 2;
    highScoreText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
}

// Play game text and click event to start the game
function playGame() {
    // Play Game Text
    playGameText = game.add.text(game.world.centerX, game.world.centerY, "COMMENCE BATTLE ?");
    playGameText.anchor.set(0.5);
    playGameText.font = 'Orbitron';
    playGameText.fontSize = 70;
    playGamegrd = playGameText.context.createLinearGradient(0, 0, 0, playGameText.canvas.height);
    playGamegrd.addColorStop(0, 'lightblue');
    playGamegrd.addColorStop(1, 'blue');
    playGameText.fill = playGamegrd;
    playGameText.align = 'center';
    playGameText.stroke = '#000000';
    playGameText.strokeThickness = 2;
    playGameText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    playGameText.inputEnabled = true;
    playGameText.input.useHandCursor = true;
    playerShip.kill();

    playGameText.events.onInputDown.add(restart, this);
}

// game over text and even that brings up the leaderboard
function gameOver() {

    // Game Over Text
    gameOverText = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER !");
    gameOverText.anchor.set(0.5);
    gameOverText.font = 'Orbitron';
    gameOverText.fontSize = 70;
    gameOvergrd = gameOverText.context.createLinearGradient(0, 0, 0, gameOverText.canvas.height);
    gameOvergrd.addColorStop(0, 'lightblue');
    gameOvergrd.addColorStop(1, 'blue');
    gameOverText.fill = gameOvergrd;
    gameOverText.align = 'center';
    gameOverText.stroke = '#000000';
    gameOverText.strokeThickness = 2;
    gameOverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    // remove playerShip from screen
    playerShip.kill();
    alive = false;
    // allow the use of the WASD keys for high score name input
    game.input.keyboard.removeKey(Phaser.Keyboard.W);
    game.input.keyboard.removeKey(Phaser.Keyboard.S);
    game.input.keyboard.removeKey(Phaser.Keyboard.A);
    game.input.keyboard.removeKey(Phaser.Keyboard.D);
    game.time.events.add(1000, scoreBoard);
    // add the leaderboard
    function scoreBoard() {
        gameOverText.kill();
        $('#myModal').fadeIn(3000);
        if (score > lowScore) {
            $('#nameInput').show();
        } else
            $('#nameInput').hide();
    }
}

// play again text with click event to restart the game
function playAgain() {

    playAgainText = game.add.text(game.world.centerX, game.world.centerY, "PLAY AGAIN ?");
    playAgainText.anchor.set(0.5);
    playAgainText.font = 'Orbitron';
    playAgainText.fontSize = 70;
    playAgaingrd = playAgainText.context.createLinearGradient(0, 0, 0, playAgainText.canvas.height);
    playAgaingrd.addColorStop(0, 'lightblue');
    playAgaingrd.addColorStop(1, 'blue');
    playAgainText.fill = playAgaingrd;
    playAgainText.align = 'center';
    playAgainText.stroke = '#000000';
    playAgainText.strokeThickness = 2;
    playAgainText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);
    playAgainText.inputEnabled = true;
    playAgainText.input.useHandCursor = true;
    playAgainText.events.onInputDown.add(restart, this);
}

// Create the player, enemies, and bullets
function create() {

    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
    // this is where you set the speed of the scroll (and the direction)
    background.autoScroll(-60, 0);

    music = game.add.audio('music');

    // create the scout group
    scouts = game.add.group();
    scouts.enableBody = true;
    scouts.physicsBodyType = Phaser.Physics.ARCADE;
    scouts.createMultiple(10, 'scout');
    scouts.setAll('anchor.x', 0.5);
    scouts.setAll('anchor.y', 0.5);
    scouts.setAll('scale.x', 0.5);
    scouts.setAll('scale.y', 0.5);
    scouts.setAll('angle', 180);
    scouts.setAll('outOfBoundsKill', true);
    scouts.setAll('checkWorldBounds', true);

    // scout bullets
    scoutsBullets = game.add.group();
    scoutsBullets.enableBody = true;
    scoutsBullets.physicsBodyType = Phaser.Physics.ARCADE;
    scoutsBullets.createMultiple(30, 'scoutBullet');
    scoutsBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
    scoutsBullets.setAll('alpha', 0.9);
    scoutsBullets.setAll('anchor.x', 0.5);
    scoutsBullets.setAll('anchor.y', 0.5);
    scoutsBullets.setAll('outOfBoundsKill', true);
    scoutsBullets.setAll('checkWorldBounds', true);
    scoutsBullets.forEach(function (enemy) {
        enemy.body.setSize(20, 20);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
    });

    launchscout();

    // Next level of bad guys
    phoenix = game.add.group();
    phoenix.enableBody = true;
    phoenix.physicsBodyType = Phaser.Physics.ARCADE;
    phoenix.createMultiple(30, 'phoenix');
    phoenix.setAll('anchor.x', 0.5);
    phoenix.setAll('anchor.y', 0.5);
    phoenix.setAll('scale.x', 0.5);
    phoenix.setAll('scale.y', 0.5);
    phoenix.setAll('angle', 180);

    //  Phoenix  bullets
    phoenixBullets = game.add.group();
    phoenixBullets.enableBody = true;
    phoenixBullets.physicsBodyType = Phaser.Physics.ARCADE;
    phoenixBullets.createMultiple(30, 'phoenixBullet');
    phoenixBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
    phoenixBullets.setAll('alpha', 0.9);
    phoenixBullets.setAll('anchor.x', 0.5);
    phoenixBullets.setAll('anchor.y', 0.5);
    phoenixBullets.setAll('outOfBoundsKill', true);
    phoenixBullets.setAll('checkWorldBounds', true);
    phoenixBullets.forEach(function (enemy) {
        enemy.body.setSize(20, 20);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
    });

    // add the player (aka playerShip)
    playerShip = game.add.group();
    playerShip.enableBody = true;
    playerShip.physicsBodyType = Phaser.Physics.ARCADE;

    // add laser for playerShip
    bulletsL = game.add.group();
    bulletsL.enableBody = true;
    bulletsL.physicsBodyType = Phaser.Physics.ARCADE;
    bulletsL.createMultiple(30, 'bulletL');

    // Add sounds
    game.explode = game.add.audio('explode');
    game.blaster = game.add.audio('blaster');

    // create the bullets for the playerShip
    for (var i = 0; i < 200; i++) {
        var bL = bulletsL.create(40, 0, 'bulletL');
        bL.name = 'bulletL' + i;
        bL.exists = false;
        bL.visible = false;
        bL.checkWorldBounds = true;
        bL.events.onOutOfBounds.add(resetBullet, this);
    }

    // create the playerShip
    playerShip = game.add.sprite(50,  gameHeight / 2, 'playerShip');
    playerShip.anchor.setTo(0.5, 0.5);
    game.physics.enable(playerShip, Phaser.Physics.ARCADE);
    playerShip.body.collideWorldBounds = true;

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupExplosions, this);

    //  Bigger explosion
    playerDeath = game.add.emitter(playerShip.x, playerShip.y);
    playerDeath.width = 50;
    playerDeath.height = 50;
    playerDeath.makeParticles('kaboom', [0, 1, 2, 3, 4, 5, 6, 7], 10);
    playerDeath.setAlpha(0.9, 0, 800);
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);

    // allow the use of the arrow keys for player movement
    cursors = game.input.keyboard.createCursorKeys();
    // set up use of the WASD keys for player movement
    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D)
    };
    // set up the space bar and mouse button to allow firing the lasers
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    playerShield = game.add.sprite(10, gameHeight - 50, 'shield0');

    // create the mini ships on the bottom to represent the number of lives left
    pLives = game.add.group();
    var pLife;
    for (var i = 0; i < numLives; i++) {
        pLife = pLives.create(60 + (i * 50), gameHeight - 50, 'lives', i);
    }
    // start the game
    playerShip.kill();
    game.time.events.add(1000, playGame);
}

// function to change image based on shield damage
function shield(health) {

    var phealth = (health / maxHealth) * 100;

    playerShield.reset();
    if (phealth > 75) {
        playerShield.kill();
        playerShield = game.add.sprite(10, gameHeight - 50, 'shield0');
    } else if (phealth > 50 && phealth <= 75) {
        playerShield.kill();
        playerShield = game.add.sprite(10, gameHeight - 50, 'shield1');
    } else if (phealth > 25 && phealth <= 50) {
        playerShield.kill();
        playerShield = game.add.sprite(10, gameHeight - 50, 'shield2');
    } else if (phealth > 0 && phealth <= 25) {
        playerShield.kill();
        playerShield = game.add.sprite(10, gameHeight - 50, 'shield3');
    } else if (phealth <= 0) {
        // kill the player icons on bottom of page
        playerShield.kill();
        pLives.removeAll();
        numLives -= 1;
        life(numLives);
        if (numLives > -1) {
            playerHealth = maxHealth;
            playerShield = game.add.sprite(10, gameHeight - 50, 'shield0');
            shield(playerHealth);
        } else if (numLives <= -1) {
            // start the game over function
            gameOver();
        }
    }
}

// re-create the lives on bottom of screen after shield dissapates
function life(lives) {

    for (var i = 0; i < numLives; i++) {
        pLife = pLives.create(60 + (i * 50), gameHeight - 50, 'lives', i);
    }
}

// render function for future use
function render() {

}

// add explosions
function setupExplosions(explode) {

    explode.animations.add('kaboom');
}

// listener function for change states in game
function update() {

    // add the collision handlers
    game.physics.arcade.collide(bulletsL, scouts, playerKillsEnemy, null, this);
    game.physics.arcade.collide(playerShip, scouts, enemyPlayerCollide, null, this);
    game.physics.arcade.collide(playerShip, scoutsBullets, enemyBulletKillPlayer, null, this);
    game.physics.arcade.collide(bulletsL, phoenix, playerKillsEnemy, null, this);
    game.physics.arcade.collide(playerShip, phoenix, enemyPlayerCollide, null, this);
    game.physics.arcade.collide(playerShip, phoenixBullets, enemyBulletKillPlayer, null, this);

    // make the playerShip controllable
    playerShip.body.velocity.x = 0;
    playerShip.body.velocity.y = 0;

    if (cursors.left.isDown || wasd.left.isDown) {
        playerShip.body.velocity.x = -speed;
    }
    else if (cursors.right.isDown || wasd.right.isDown) {
        playerShip.body.velocity.x = speed;
    }
    else if (cursors.up.isDown || wasd.up.isDown) {
        playerShip.body.velocity.y = -speed;
    }
    else if (cursors.down.isDown || wasd.down.isDown) {
        playerShip.body.velocity.y = speed;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.activePointer.isDown) {
        if (alive) {

            fireBulletL();
        }
    }

    // add pause function when 'p' is pressed
    window.onkeydown = function (event) {
        if (event.keyCode == 80) {
            game.paused = !game.paused;
        }
    }
}

// fire the bullet
function fireBulletL() {

    if (game.time.now > bulletTimeL) {
        bulletL = bulletsL.getFirstExists(false);

        if (bulletL && numLives > -1) {
            bulletL.reset(playerShip.x, playerShip.y - 35);
            bulletL.body.velocity.x = 500;
            bulletTimeL = game.time.now + 150;
            game.blaster.play();
        }
    }
}

//  Called if the bullet goes out of the screen
function resetBullet(bullet) {

    bullet.kill();
}

// called if enemy and player collide
function enemyPlayerCollide(player, enemy) {

    playerHealth -= 20;
    shield(playerHealth);
    enemy.kill();

    if (numLives > -1) {
        if (playerHealth > 0) {
            var explosion = explosions.getFirstExists(false);
            explosion.reset(enemy.body.x, enemy.body.y);
            explosion.alpha = 0.7;
            explosion.play('kaboom', 30, false, true);
            game.explode.play();
        } else {
            playerDeath.x = player.x;
            playerDeath.y = player.y;
            playerDeath.start(false, 1000, 10, 10);
            game.explode.play();
            playerShield.kill();
            playerShip.reset(50, 50);
        }
    }

    if (numLives <= -1) {
        playerShip.kill();
    }
}

// called if enemy bullet kills player
function enemyBulletKillPlayer(player, enemyBullet) {

    playerHealth -= 20;
    shield(playerHealth);
    enemyBullet.kill();

    if (numLives > -1) {
        if (playerHealth > 0) {
            var explosion = explosions.getFirstExists(false);
            explosion.reset(player.body.x - 25, player.body.y - 20);
            explosion.alpha = 0.7;
            explosion.play('kaboom', 30, false, true);
            game.explode.play();
        } else {
            playerDeath.x = player.x;
            playerDeath.y = player.y;
            playerDeath.start(false, 1000, 10, 10);
            game.explode.play();
            playerShield.kill();
            playerShip.reset(50, 50);
        }
    }

    if (numLives <= -1) {
        playerShip.kill();
    }
}

//  Called if the bullet hits one of the enemies
function playerKillsEnemy(bullet, enemy) {

    bullet.kill();
    enemy.kill();

    score += 20;

    if (score >= highScore) {

        highScoreText.kill();
        highScore = score;
        updateScore(highScore);
    }

    scoreText.kill();
    highScoreText.kill();
    createText();

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    explosion.play('kaboom', 30, false, true);
    game.explode.play();

    //  Phoenix come in after phoenixTime
    if (!phoenixLaunched && score > phoenixTime) {
        phoenixLaunched = true;
        launchphoenix();
    }
}

// launch the scout fighters
function launchscout() {
    var min = 300;
    var max = 3000;

    var enemy = scouts.getFirstExists(false);
    if (enemy) {
        enemy.reset(1100, game.rnd.integerInRange(10, 800));
        enemy.body.velocity.y = game.rnd.integerInRange(10, 300);
        enemy.body.velocity.x = -speed;
        enemy.body.drag.y = 100;

        //  Set up firing
        var bulletSpeed = 600;
        var firingDelay = 1000;
        enemy.enemyBullets = 1;
        enemy.lastShot = 0;
    }
    enemy.update = function () {
        enemy.angle =  game.math.radToDeg(Math.asin(enemy.body.velocity.y, -enemy.body.velocity.x));

        // Fire
        enemyBullet = scoutsBullets.getFirstExists(false);
        if (enemyBullet &&
            this.alive &&
            this.enemyBullets &&
            this.y > game.width / 8 &&
            game.time.now > firingDelay + this.lastShot) {
            this.lastShot = game.time.now;
            this.enemyBullets--;
            enemyBullet.reset(this.x, this.y + this.height / 2);
            enemyBullet.damageAmount = this.damageAmount;
            var angle = game.physics.arcade.moveToObject(enemyBullet, playerShip, bulletSpeed);
            enemyBullet.angle = game.math.radToDeg(angle);
        }
    };

    // Send another enemy soon
    game.time.events.add(game.rnd.integerInRange(min, max), launchscout);
}

// launch the advanced scout fighters
function launchphoenix() {
    var startingY = game.rnd.integerInRange(100, game.height - 100);
    var horizontalSpeed = 180;
    var spread = 120;
    var frequency = 70;
    var verticalSpacing = 70;
    var horizontalSpacing = 10;
    var numEnemiesInWave = 3;

    //  Launch wave
    for (var i = 0; i < numEnemiesInWave; i++) {
        var enemy = phoenix.getFirstExists(false);
        if (enemy) {
            enemy.startingY = startingY;
            enemy.reset(950, horizontalSpacing * i);
            enemy.body.velocity.x = -horizontalSpeed;

            // Set up firing
            var bulletSpeed = 400;
            var firingDelay = 2000;
            enemy.bullets = 1;
            enemy.lastShot = 0;

            // Update function for each enemy
            enemy.update = function () {
                // Wave movement
                this.body.y = this.startingY + Math.sin((this.x) / frequency) * spread;

                // Fire
                enemyBullet = phoenixBullets.getFirstExists(false);
                if (enemyBullet &&
                    this.alive &&
                    this.bullets &&
                    this.x > game.height / 8 &&
                    game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(enemyBullet, playerShip, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle);
                }

                //  Kill enemies once they go off screen
                if (this.x > game.width - 200) {
                    this.kill();
                    this.x = 20;
                }
            };
        }
    }
    //  Send another wave soon
    phoenixLaunchTimer = game.time.events.add(game.rnd.integerInRange(phoenixSpacing, phoenixSpacing + 4000), launchphoenix);
}

// function called to restart the game
function restart() {
    //  Reset the enemies
    scouts.callAll('kill');
    scoutsBullets.callAll('kill');
    phoenix.callAll('kill');
    phoenixBullets.callAll('kill');
    game.time.events.remove(phoenixLaunchTimer);
    game.time.events.remove(launchscout);
    phoenixLaunched = false;
    playerShip.revive();
    alive = true;
    playerHealth = maxHealth;
    numLives = maxLives;
    score = 0;
    shield(playerHealth);
    life(numLives);
    playGameText.kill();
    scoreText.kill();
    highScoreText.kill();
    createText();
    music.loop = true;
    music.play();

    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D)
    };
    // Hide the text
    playGameText.visible = false;
    gameOverText.visible = false;
    playAgainText.visible = false;
}

// Keep a mapping of firebase locations to HTML elements, so we can move / remove elements as necessary.
var htmlForPath = {};
var scoreArray = [];
var nameArray = [];
var lowScore;
var newScoreRow;
var rootRef;
var scoreListRef;
var highestScoreRef;

var LEADERBOARD_SIZE = 5;
// Initialize Firebase
var config = {
    apiKey: "AIzaSyB4IOXzUkZOyXsCjvhRsw0sKFNcD512yx0",
    authDomain: "roguefighter-8aefa.firebaseapp.com",
    databaseURL: "https://roguefighter-8aefa.firebaseio.com",
    storageBucket: "roguefighter-8aefa.appspot.com",
    messagingSenderId: "206138842370"
};
firebase.initializeApp(config);

// Build some firebase references.
rootRef = firebase;
scoreListRef = rootRef.database().ref('scoreList');
highestScoreRef = rootRef.database().ref('highestScore');

// check for anonymous login issues
rootRef.auth().signInAnonymously().catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
});

// Helper function that takes a new score snapshot and adds an appropriate row to the leaderboard table.
function handleScoreAdded(scoreSnapshot, prevScoreName) {
    newScoreRow = $("<tr/>");
    newScoreRow.append($("<td/>").text(scoreSnapshot.val().name));
    newScoreRow.append($("<td/>").text('........'));
    newScoreRow.append($("<td/>").text(scoreSnapshot.val().score));

    scoreArray.push(scoreSnapshot.val().score);
    nameArray.push(scoreSnapshot.val().name);

    // Store a reference to the table row so we can get it again later.
    htmlForPath[scoreSnapshot.key] = newScoreRow;

    // Insert the new score in the appropriate place in the table.
    if (prevScoreName === null) {
        $("#leaderboardTable").append(newScoreRow);
    }
    else {
        var lowerScoreRow = htmlForPath[prevScoreName];
        lowerScoreRow.before(newScoreRow);
    }
    lowScore = scoreArray[0];
}

// Helper function to handle a score object being removed; just removes the corresponding table row.
function handleScoreRemoved(scoreSnapshot) {
    var removedScoreRow = htmlForPath[scoreSnapshot.key];
    removedScoreRow.remove();
    delete htmlForPath[scoreSnapshot.key];
}

// Create a view to only receive callbacks for the last LEADERBOARD_SIZE scores
var scoreListView = scoreListRef.limitToLast(LEADERBOARD_SIZE);

// Add a callback to handle when a new score is added.
scoreListView.on("child_added", function (newScoreSnapshot, prevScoreName) {
    handleScoreAdded(newScoreSnapshot, prevScoreName);
});

// Add a callback to handle when a score is removed
scoreListView.on("child_removed", function (oldScoreSnapshot) {
    handleScoreRemoved(oldScoreSnapshot);
});

// Add a callback to handle when a score changes or moves positions.
var changedCallback = function (scoreSnapshot, prevScoreName) {
    handleScoreRemoved(scoreSnapshot);
    handleScoreAdded(scoreSnapshot, prevScoreName);
};
scoreListView.on("child_moved", changedCallback);
scoreListView.on("child_changed", changedCallback);

$(document).ready(function () {
    // When the user presses enter on scoreInput, add the score, and update the highest score.
    $("#nameInput").keypress(function (e) {
        // enter key adds name to leaderboard
        if (e.keyCode == 13) {
            var newScore = score;
            var name = $("#nameInput").val();
            var i = nameArray.indexOf(name);
            if ($.inArray(name, nameArray) && score < scoreArray[i]) {
                $('#nameInput').hide();
                return;
            }

            if (name.length === 0){
                name = ' ';
            }


            $('#nameInput').hide();

            var userScoreRef = scoreListRef.child(name);

            // Use setWithPriority to put the name / score in Firebase, and set the priority to be the score.
            userScoreRef.setWithPriority({name: name, score: newScore}, newScore);
        }
    });
});

// Get the modal
var modal = $('#myModal');

// Get the <span> element that closes the modal
var span = $(".close")[0];

$(document).ready(function () {
// When the user clicks on <span> (x), close the leaderboard and show Play again text
    $('.close').click(function () {
        $('#myModal').css('display', 'none');
        $('#nameInput').val('');
        playAgain();
    });
});

// set up database references
var state;
var fbRef = firebase.database();

// get score from database and set to high score in game
fbRef.ref('HiScore').on("value", function (newHighestScore) {
    state = newHighestScore.val();
    highScore = state.highestScore;
    getHighScore = function(){
        return highScore;
    }
});

// send the high score to the database
function updateScore(score) {
    var fbRef = firebase.database();

    var dataToSend = {
        highestScore: score
    };

    fbRef.ref('HiScore').set(dataToSend);
}




