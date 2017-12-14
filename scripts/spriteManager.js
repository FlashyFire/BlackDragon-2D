var spriteManager = {
    image: new Image(),
    sprites: new Array(),
    imgLoaded: false,
    jsonLoaded: false,
	
    loadAtlas: function (atlasJson, atlasImg) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200){
                spriteManager.parseAtlas(request.responseText);
            }
        };
        request.open("GET", atlasJson, true);
        request.send();
        this.loadImg(atlasImg);
    },

    loadImg: function (imgName) {
        this.image.onload = function () {
            spriteManager.imgLoaded = true;
        };
        this.image.src = imgName;
    },

    parseAtlas: function (atlasJSON) {
        var atlas = JSON.parse(atlasJSON);
        for (var i = 0; i < atlas.length; i++){
            var frame = atlas[i];
            this.sprites.push({name: frame.name, x: frame.x, y: frame.y, w: frame.width, h: frame.height});
        }
        this.jsonLoaded = true;
    },

    drawSprite: function(ctx, name, x, y){
        if (!this.imgLoaded || !this.jsonLoaded){
            setTimeout(function () {spriteManager.drawSprite(ctx, name, x, y);}, 100);
        } else {
            var sprite = this.getSprite(name);
            if(!mapManager.isVisible(x, y, sprite.w, sprite.h))
                return;
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
        }
    },

    drawSpriteState: function(ctx, name, x, y, state){
        if (!this.imgLoaded || !this.jsonLoaded){
            setTimeout(function () {spriteManager.drawSprite(ctx, name, x, y);}, 100);
        } else {
            var sprite = this.getSprite(name);
            var tsy = mapManager.tSize.y;
            if(!mapManager.isVisible(x, y, sprite.w, tsy))
                return;
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.drawImage(this.image, sprite.x, sprite.y + tsy * state, sprite.w, tsy, x, y, sprite.w, tsy);
        }
    },

    drawSpriteAnim: function(ctx, name, x, y, im, angle){
        if (!this.imgLoaded || !this.jsonLoaded){
            setTimeout(function () {spriteManager.drawSprite(ctx, name, x, y, im, angle);}, 100);
        } else {
            var sprite = this.getSprite(name);
            if(!mapManager.isVisible(x, y, 32, sprite.h))
                return;
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.save();
            var tsx = mapManager.tSize.x;
            var tsy = mapManager.tSize.y;
            ctx.translate(x + tsx/2, y + tsy/2);
            ctx.rotate(angle+ Math.PI/2);
            ctx.drawImage(this.image, sprite.x + im*tsx, sprite.y, tsx, sprite.h, -tsx/2, -tsy/2, tsx, sprite.h);
            ctx.restore();
        }
    },
	
    getSprite: function(name){
        for (var i = 0; i<this.sprites.length; i++){
            var s = this.sprites[i];
            if (s.name === name)
                return s;
        }
        return null;
    }
};