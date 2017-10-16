var score = 0;
var scoreText;
var timer, timerEvent, text;
var keyUp;
var pause_label;
var StateMain = {
    preload: function() {
        game.load.image("ground", "images/ground.png");
        //game.load.image("hero", "images/hero.png");
        game.load.atlasJSONHash('hero', 'images/explorer.png', 'images/explorer.json');
        game.load.image("bar", "images/powerbar.png");
        game.load.image("block", "images/block.png");
        game.load.image("playAgain", "images/playAgain.png");
        game.load.image("task", "images/paper.png");
        game.load.image("cat", "images/cat.jpg");
    },
    create: function() {
        this.clickLock = false;
        this.power = 0;
        //turn the background sky blue
        game.stage.backgroundColor = "#A5F2F3";
        //add the ground
        this.ground = game.add.sprite(0, game.height * .8, "ground");
        //add the hero in
        this.hero = game.add.sprite(game.width * .2, this.ground.y, "hero");
        //make animations
        this.hero.animations.add("die", this.makeArray(0, 10), 12, false);
        this.hero.animations.add("jump", this.makeArray(10, 20), 12, false);
        this.hero.animations.add("run", this.makeArray(20, 40), 12, true);
        this.hero.animations.play("run");
        this.hero.width = game.width / 12;
        this.hero.scale.y = this.hero.scale.x;
        this.hero.anchor.set(0.5, 1);
        //add the power bar just above the head of the hero
        this.powerBar = game.add.sprite(this.hero.x + this.hero.width / 2, this.hero.y - this.hero.height / 2, "bar");
        this.powerBar.width = 0;

        this.cat = game.add.image(game.width * .2, game.width * .2, "cat");
        this.cat.visible = false;
        //start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //enable the hero for physics
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        game.physics.enable(this.ground, Phaser.Physics.ARCADE);
        //game.physics.arcade.gravity.y = 100;
        this.hero.body.gravity.y = 200;
        this.hero.body.collideWorldBounds = true;
        //this.hero.body.bounce.set(0, .2);
        this.ground.body.immovable = true;
        //record the initial position
        this.startY = this.hero.y;

        this.blocks = game.add.group();
        this.makeBlocks();
        this.makeTask();

        // The score
        scoreText = game.add.text(16, 16, 'Tasks collected: 0/3', { fontSize: '20px', fill: '#000' });
        text = game.add.text(300, 300, '', {fontSize: '30px', fill: '#000'});
        
        //Timer
        timer = game.time.create(false);
        timerEvent = timer.add(Phaser.Timer.SECOND * 30, this.delayOver, this);
        timer.start();

        //  Our controls.
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
        keyUp.onDown.add(this.mouseDown, this);

        pause_label = game.add.text(game.width/2, 100, 'Distraction Time!', { font: '24px Arial', fill: '#fff' });
        pause_label.anchor.set(0.5,0.5);
        pause_label.visible = false;

        
    },
    makeArray:function(start,end)
    {
        var myArray=[];
        for (var i = start; i < end; i++) {
            myArray.push(i);
        }
        return myArray;
    },
    mouseDown: function() {
        if (this.hero.y != this.startY) {
            return;
        }
        keyUp.onDown.remove(this.mouseDown, this);
        this.timer = game.time.events.loop(Phaser.Timer.SECOND / 1000, this.increasePower, this);
        keyUp.onUp.add(this.keyboardUp, this);
        if (this.clickLock == true) {
            return;
        }
    },
    keyboardUp: function() {
        keyUp.onUp.remove(this.keyboardUp, this);
        this.doJump();
        game.time.events.remove(this.timer);
        this.power = 0;
        this.powerBar.width = 0;
        keyUp.onDown.add(this.mouseDown, this);
        this.hero.animations.play("jump");
    },
    increasePower: function() {
        this.power++;
        this.powerBar.width = this.power;
        if (this.power > 50) {
            this.power = 50;
        }
    },
    doJump: function() {
        this.hero.body.velocity.y = -this.power * 12;
    },
    makeBlocks: function() {
        this.blocks.removeAll();
        var wallHeight = game.rnd.integerInRange(1, 4);
        for (var i = 0; i < wallHeight; i++) {
            var block = game.add.sprite(0, -i * 50, "block");
            this.blocks.add(block);
        }
        this.blocks.x = game.width - this.blocks.width
        this.blocks.y = this.ground.y - 50;
        //
        //Loop through each block
        //and apply physics
        this.blocks.forEach(function(block) {
            //enable physics
            game.physics.enable(block, Phaser.Physics.ARCADE);
            //set the x velocity to -160
            if (distraction = false) {
                block.body.velocity.x = 0;
            }

            else if (distraction = true) {
                block.body.velocity.x = -150;
                //apply some gravity to the block
                //not too much or the blocks will bounce
                //against each other
                block.body.gravity.y = 4;
                //set the bounce so the blocks
                //will react to the runner
                block.body.bounce.set(1, 1);
            }
        });
    },
    makeTask: function() {
        //if the bird already exists
        //destory it
        if (this.task) {
            this.task.destroy();
        }
        //pick a number at the top of the screen
        //between 10 percent and 40 percent of the height of the screen
        var taskY = game.rnd.integerInRange(game.height * .1, game.height * .4);
        //add the bird sprite to the game
        this.task = game.add.sprite(game.width + 100, taskY, "task");
        //enable the sprite for physics
        game.physics.enable(this.task, Phaser.Physics.ARCADE);
        //set the x velocity at -200 which is a little faster than the blocks
        if (distraction = false) {
            this.task.body.velocity.x = 0;
        }
        else if (distraction = true) {
            this.task.body.velocity.x = -200;
        }

        //set the bounce for the bird
        this.task.body.bounce.set(2, 2);
    },

    render: function(){
        if (timer.running) {
            game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), 500, 32, "#000000");
        }
        else {
            game.debug.text("Done!", 2, 14, "#0f0");
        }
    },
    onGround: function() {
        if (this.hero) {
            this.hero.animations.play("run");
        }
    },

    update: function() {
        game.physics.arcade.collide(this.hero, this.ground, this.onGround, null, this);
        //
        //collide the hero with the blocks
        //
        game.physics.arcade.collide(this.hero, this.blocks, this.triggerDistraction, null, this);
        //
        //collide the blocks with the ground
        //
        game.physics.arcade.collide(this.ground, this.blocks);
        //
        //when only specifying one group, all children in that
        //group will collide with each other

        game.physics.arcade.overlap(this.hero, this.task, this.addPoint, null, this);
        //
        game.physics.arcade.collide(this.blocks);

        //get the first child
        //if off the screen reset the blocks

        var fchild = this.blocks.getChildAt(0);
        if (fchild.x < -game.width) {
            this.makeBlocks();
        }

        if (this.task.x < 0) {
            this.makeTask();
        }
    },

    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    },

    addPoint: function() {
        // Removes the task from the screen
        this.task.kill();
        //  Add and update the score
        score += 1;
        if (score != 3) {
            scoreText.text = 'Tasks collected: ' + score + '/3';
            this.makeTask();
        }
        else if (score = 3){
            this.gameOver();
        }
    },
    triggerDistraction: function() {
        this.cat.visible= true;
        this.hero.visible = false;
        this.blocks.visible = false;
        this.task.visible = false;
        this.ground.visible = false;

        pause_label.visible = true;
        game.time.events.add(Phaser.Timer.SECOND*5, this.unPause, this);

    },

    unPause: function() {
        this.cat.visible= false;
        pause_label.visible = false;
        this.hero.visible = true;
        this.blocks.visible = true;
        this.task.visible = true;
        this.ground.visible = true;
        console.log("Distraction: " + distraction);
    },

    delayOver: function() {
        this.clickLock = true;
        game.time.events.add(Phaser.Timer.SECOND, this.gameOver, this);
    },
    gameOver: function() {
        timer.stop();
        game.state.start("StateOver");
        score = 0;

    }

    /*endGame: function() {
        text.setText('Refresh the page to play again.', { fontSize: '32px', fill: '#000' });
        timer.stop();
    }*/
}