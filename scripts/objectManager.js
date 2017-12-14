var Entity = {
    pos_x: 0, pos_y: 0,
    size_x: 0, size_y: 0,
    extend: function (extendProto) {
        var object = Object.create(this);
        for (var property in extendProto){
            if (this.hasOwnProperty(property) || typeof object[property] === 'undefined'){
                object[property] = extendProto[property];
            }
        }
        return object;
    },
    kill: function () {
        var idx = gameManager.entities.indexOf(this);
        gameManager.entities.splice(idx, 1);
    }
};

var Player = Entity.extend({
    lifetime: 1000,
    move_x: 0,
    move_y: 0,
    speed: 16,
    numOfPic: 0,
    dir_x: 1,
    dir_y: 0,
    rev: false,
    draw: function (ctx) {
        if (this.move_x === 0 && this.move_y === 0)
            spriteManager.drawSpriteAnim(ctx, "dragon", this.pos_x, this.pos_y, this.numOfPic, Math.atan2(this.dir_y, this.dir_x));
        else
            spriteManager.drawSpriteAnim(ctx, "dragonMove", this.pos_x, this.pos_y, this.numOfPic, Math.atan2(this.dir_y, this.dir_x));
    },
    update: function () {
        if (this.move_x !== 0 || this.move_y !== 0) {
            this.dir_x = this.move_x;
            this.dir_y = this.move_y;
            if (this.numOfPic >= 3)
                this.numOfPic = 0;
            else
                this.numOfPic++;
        } else {
            if (!this.rev) {
                if (this.numOfPic === 4) {
                    this.numOfPic--;
                    this.rev = true;
                }
                else
                    this.numOfPic++;
            }
            else {
                if (this.numOfPic === 0) {
                    this.numOfPic++;
                    this.rev = false;
                }
                else
                    this.numOfPic--;
            }
        }
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if (obj.name.match(/potion[\d]/)){
            soundManager.play("effects\/pickupgold.wav", {looping: false, volume: 0.25});
            this.lifetime += 300;
            if (this.lifetime > 1000)
                this.lifetime = 1000;
            obj.kill();
        }
        if (obj.name.match(/gold[\d]/)){
            soundManager.play("effects\/pickupgold.wav", {looping: false, volume: 0.25});
            gameManager.score+=100;
            obj.kill();
        }
        if (obj.name.match(/gem[\d]/)){
            soundManager.play("effects\/pickupgold.wav", {looping: false, volume: 0.25});
            gameManager.score += 500;
            obj.kill();
        }
        if (obj.name.match(/enemy[\d]/)){
        }
        if (obj.name.match(/boss[\d]/)){
            gameManager.score = 0;
        }
        if (obj.name.match(/chest[\d]/) && obj.state === 0){
            soundManager.play("effects\/pickupgold.wav", {looping: false, volume: 0.25});
            gameManager.score+=150;
            obj.state = 1;
        }
        if (obj.name.match(/exit/)){
            gameManager.nextLev();
        }
    },
    onTouchMap: function () {
        if (this.pos_x <= 0 && this.move_x < 0) {
            eventManager.action['left'] = false;
            this.move_x = 0;
        }
        if (this.pos_x >= mapManager.mapSize.x - mapManager.tSize.x && this.move_x > 0) {
            eventManager.action['right'] = false;
            this.move_x = 0;
        }
        if (this.pos_y < 0 && this.move_y < 0) {
            eventManager.action['up'] = false;
            this.move_y = 0;
        }
        if (this.pos_y > mapManager.mapSize.y - mapManager.tSize.y*2 && this.move_y > 0) {
            eventManager.action['down'] = false;
            this.move_y = 0;
        }
    },
    fire: function () {
        soundManager.play("effects\/fireball.mp3", {looping: false, volume: 0.25});
        var r = Object.create(Fireball);
        r.size_x = 16;
        r.size_y = 16;
        r.move_x = this.dir_x;
        r.move_y = this.dir_y;
        r.pos_x = this.pos_x + r.move_x * 16;
        r.pos_y = this.pos_y + r.move_y * 16;
        r.name = "fireball" + (++gameManager.fireNum);
        gameManager.entities.push(r);
    },
});

var Enemy = Entity.extend({
    lifetime:100,
    move_x:0, move_y: 0,
    speed: 4,
    damage: 20,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_s", this.pos_x, this.pos_y);
    },
    update: function () {
        if (gameManager.player === null)
            return;
        this.move_x = 0;
        this.move_y = 0;
        var dx = gameManager.player.pos_x - this.pos_x;
        var dy = gameManager.player.pos_y - this.pos_y;
        if (Math.sqrt(dx * dx + dy * dy) < 160){
            var alpha = Math.atan2(dy, dx);
            this.move_x = Math.cos(alpha);
            this.move_y = Math.sin(alpha);
        }
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if (obj.name.match(/player/)){
            gameManager.player.lifetime -= this.damage;
            if (gameManager.player.lifetime < 0) {
                gameManager.player.lifetime = 0;
                gameManager.player.kill();
                window.location = 'gameover.html';
            }
        }
    },
    onTouchMap: function () {
        if (this.pos_x <= 0 && this.move_x < 0)
            this.move_x = 0;
        if (this.pos_x >= mapManager.mapSize.x - mapManager.tSize.x && this.move_x > 0)
            this.move_x = 0;
        if (this.pos_y < 0 && this.move_y < 0)
            this.move_y = 0;
        if (this.pos_y > mapManager.mapSize.y - mapManager.tSize.y*2 && this.move_y > 0)
            this.move_y = 0;
    }
});

var Wolf = Enemy.extend({
    speed: 7,
    damage: 30,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_w2", this.pos_x, this.pos_y);
    }
});

var Lizard = Enemy.extend({
    speed: 12,
    damage: 10,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_l", this.pos_x, this.pos_y);
    }
});

var Goblin = Enemy.extend({
    speed: 6,
    damage: 25,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_l2", this.pos_x, this.pos_y);
    }
});

var Orc = Enemy.extend({
    speed: 3,
    damage: 25,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_o1", this.pos_x, this.pos_y);
    }
});

var EnemyBoss = Enemy.extend({
    speed: 5,
    damage: 50,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "enemy_g3", this.pos_x, this.pos_y);
    }
});

var Fireball = Entity.extend({
    move_x:0, move_y:0,
    speed:32,
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "fireball", this.pos_x, this.pos_y);
    },
    update: function () {
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if (obj.name.match(/enemy[\d*]/)||obj.name.match(/player/)||obj.name.match(/fireball[\d*]/)){
            obj.kill();
            this.kill();
        }
    },
    onTouchMap: function () {
        if (this.pos_x < 0 || this.pos_x > mapManager.mapSize.x ||
            this.pos_y < 0 || this.pos_y > mapManager.mapSize.y)
            this.kill();
    }
});

var Potion = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "potion", this.pos_x, this.pos_y);
    }
});

var Chest = Entity.extend({
   state: 0,
   draw: function (ctx) {
       spriteManager.drawSpriteState(ctx, "chest", this.pos_x, this.pos_y, this.state);
   }
});

var Gold = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "goldLarge", this.pos_x, this.pos_y);
    }
});

var Gem = Entity.extend({
    draw: function (ctx) {
       spriteManager.drawSprite(ctx, "gem", this.pos_x, this.pos_y);
    }
});

var Exit = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx, "exit", this.pos_x, this.pos_y)
    }
});