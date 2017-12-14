var physicManager = {
    update: function (obj) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return "stop";
        var newX = obj.pos_x + Math.floor(obj.move_x*obj.speed);
        var newY = obj.pos_y + Math.floor(obj.move_y*obj.speed);
        var allowed = mapManager.isAllowed(newX + obj.size_x/2, newY + obj.size_y/2);
        var is_fireball = obj.name.startsWith("fireball");
        var e = this.entityAtXY(obj, newX, newY);
        if (e!== null && obj.onTouchEntity)
            obj.onTouchEntity(e);
        if (obj.onTouchMap)
            obj.onTouchMap();
        if (is_fireball || (allowed && e === null)) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else
            return "break";
        return "move";
    },

    entityAtXY: function (obj, x, y) {
        var tsx = mapManager.tSize.x;
        var tsy = mapManager.tSize.y;
        for (var i = 0; i < gameManager.entities.length; i++) {
            var e = gameManager.entities[i];
            if (e.name !== obj.name) {
                if (x + Math.min(obj.size_x, tsx) <= e.pos_x ||
                    y + Math.min(obj.size_y, tsy) <= e.pos_y ||
                    x >= e.pos_x + Math.min(e.size_x, tsx) ||
                    y >= e.pos_y + Math.min(e.size_y, tsy)) continue;
                return e;
            }
        }
        return null;
    }
};