var timer;
var StateDistraction={
    create:function()
    {
        console.log("hello!");
        this.pause_label = game.add.text(game.width/2, 100, 'Distraction Time!', { font: '24px Arial', fill: '#fff' });
        this.pause_label.anchor.set(0.5,0.5);
        game.paused = true;

        timer = game.time.create(false);
        timerEvent = timer.add(Phaser.Timer.SECOND * 5, this.restartGame, this);
        timer.start();
    },
    restartGame:function()
    {
        game.paused = false;
    }
}