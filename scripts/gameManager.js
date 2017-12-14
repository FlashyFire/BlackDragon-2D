var gameManager = {
    factory:{},
    entities: [],
    fireNum: 0,
    player: null,
    score: 0,
    levelNum: 1,
    playerName: "",
    laterKill: [],
    initPlayer: function (obj) {
        this.player = obj;
    },
    kill: function (obj) {
        this.laterKill.push(obj);
    },
    update: function () {
        if (this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;
        if (eventsManager.action["up"]) this.player.move_y = -1;
        if (eventsManager.action["down"]) this.player.move_y = 1;
        if (eventsManager.action["left"]) this.player.move_x = -1;
        if (eventsManager.action["right"]) this.player.move_x = 1;
        if (eventsManager.action["fire"]) this.player.fire();
        if (eventsManager.action["run"]) {
            this.player.run();
        }
        this.entities.forEach(function (e) {
            try {
                e.update();
            } catch(ex) {}
        });
        for (var i = 0; i<this.laterKill.length;i++){
            var idx = this.entities.indexOf(this.laterKill[i]);
            if (idx >-1)
                this.entities.splice(idx, 1);
        };
        if (this.laterKill.length > 0)
            this.laterKill.length = 0;
        this.draw(ctx);
    },
    draw: function (ctx) {
        mapManager.centerAt(this.player.pos_x,this.player.pos_y);
        mapManager.draw(ctx);
        for (var e = 0; e< this.entities.length; e++)
            this.entities[e].draw(ctx);
        this.drawScore(ctx);
        this.drawLife(ctx);
    },
    drawScore: function (ctx) {
        var scoreText = "SCORE: " + this.score.toString();
        ctx.font = "24px Cambria Bold";
        ctx.fillStyle = "#333";
        ctx.fillText(scoreText, 18, 36);
        ctx.fillStyle = "white";
        ctx.fillText(scoreText, 16, 32);
    },
    drawLife: function (ctx) {
        if (this.player === null)
            return;
        var scoreText = "LIFE: " + this.player.lifetime.toString();
        ctx.font = "16px Cambria Bold";
        ctx.fillStyle = "#333";
        ctx.fillText(scoreText, 17, 68);
        ctx.fillStyle = "white";
        ctx.fillText(scoreText, 16, 64);
    },
    loadAll: function () {
        mapManager.loadMap("data\/lev1.json");
        spriteManager.loadAtlas("data\/sprites.json", "images\/spritesheet.png");
        gameManager.factory['Player'] = Player;
        gameManager.factory['Enemy'] = Enemy;
        gameManager.factory['Potion'] = Potion;
        gameManager.factory['Fireball'] = Fireball;
        gameManager.factory['Gold'] = Gold;
        gameManager.factory['Gem'] = Gem;
        gameManager.factory['Chest'] = Chest;
        gameManager.factory['Exit'] = Exit;
        gameManager.factory['Wolf'] = Wolf;
        gameManager.factory['Lizard'] = Lizard;
        gameManager.factory['Goblin'] = Goblin;
        gameManager.factory['Orc'] = Orc;
        gameManager.factory['EnemyBoss'] = EnemyBoss;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
        soundManager.init();
        soundManager.loadArray(["effects\/breeze.mp3",
            "effects\/blackWaves.mp3",
            "effects\/stalker.mp3",
            "effects\/phoenixRising.mp3",
            "effects\/converter.mp3",
            "effects\/fireball.mp3", 
            "effects\/pickupgold.wav"]);
        soundManager.play("effects\/breeze.mp3", {looping: true, volume: 0.15});
    },
    play: function () {
        setInterval(updateWorld, 100);
    },
    nextLev: function () {
        this.levelNum += 1;
        this.player = null;
        this.entities.length = 0;
        soundManager.stopAll();
        if (this.levelNum === 2) {
            mapManager.loadMap("data\/lev2.json");
            soundManager.play("effects\/stalker.mp3", {looping: true, volume: 0.15});
        }
        else if (this.levelNum === 3) {
            mapManager.loadMap("data\/lev3.json");
            soundManager.play("effects\/blackWaves.mp3", {looping: true, volume: 0.15});
        }
        else if (this.levelNum === 4) {
            mapManager.loadMap("data\/lev4.json");
            soundManager.play("effects\/phoenixRising.mp3", {looping: true, volume: 0.15});
        }
        else if (this.levelNum === 5) {
            mapManager.loadMap("data\/lev5.json");
            soundManager.play("effects\/converter.mp3", {looping: true, volume: 0.15});
        }
        else if (this.levelNum > 5) {
            updateScores(this.playerName, this.score);
            window.location = "scores.html";
        }
        mapManager.parseEntities();
        mapManager.draw(ctx);
    },
    showResults: function(){
        ctx.clear();
        ctx.strokeText("Счёт:" + this.score.toString(), 400, 400);
        this.levelNum == 1;
    }
};

function updateWorld() {
    gameManager.update();
}