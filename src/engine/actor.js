STATE_NORMAL = 0
STATE_AGITATED = 1

function Actor(opts) {
    opts = opts || {};

    var id = opts.id || 0;

    this.name = opts.name || 'ACTOR';
    this.glyph = 'a';
    this.layer = opts.layer || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;
    this.hp = 1;

    if (id == 0) {
        this.glyph = '@';
        this.hp = 3;

    } else {
        this.hp = prng.getInt(2, 1);
    }

    this.id = id;

    return this;
}

Actor.prototype.agitate = function() {
    if (this.id ==0) return;

    this.state = STATE_AGITATED;
    this.glyph = 'A';
    engine.layers[layer].map[y][x] = this.glyph;
    engine.layers[this.layer].render();
}

Actor.prototype.calm = function() {
    if (this.id ==0) return;

    this.state = STATE_NORMAL;
    this.glyph = 'a';
    engine.layers[layer].map[y][x] = this.glyph;
    engine.layers[this.layer].render();
}

Actor.prototype.move = function(dx, dy, isPlayer) {
    var id = this.id
      , tx = this.x + dx
      , ty = this.y + dy
    ;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        console.warn('WARN: actor movement range is out of range, got: %s, %s', dx, dy);
        return false;
    }

    if (tx < 0) tx = 0;
    if (tx > engine.width) tx = engine.width;
    if (ty < 0) ty = 0;
    if (ty > engine.height) ty = engine.height;

    var targetCell = engine.layers[0].map[ty][tx]
      , d = engine.layers[1].map[ty][tx]
      , p = engine.layers[2].map[ty][tx]
      , a = engine.layers[3].map[ty][tx]
    ;

    // Collisions
    if (isPlayer) {
        if (d.toLowerCase() == 'd') {
            engine.doors.forEach(function(door) {
                if (ty == door.y && tx == door.x) {
                    door.trigger(this);
                }
            });
        }

        if (p.toLowerCase() == 'p') {
            engine.pickups.forEach(function(pickup) {
                if (pickup && ty == pickup.y && tx == pickup.x) {
                    pickup.trigger(this);
                }
            });
        }

        if (a.toLowerCase() == 'a') {
            engine.actors.forEach(function(actor) {
                if (!actor) return;

                if (ty == actor.y && tx == actor.x) {
                    actor.hit(this);
                }
            });
            return true; // prevent move
        }

    } else {
        if (a == '@') {
            engine.player.hit(this);
            return true; // prevent move
        }

        if (a.toLowerCase() == 'a') {
            var attacker = this;

            engine.actors.forEach(function(actor) {
                if (!actor) return;

                if (ty == actor.y && tx == actor.x) {
                    actor.hit(attacker);
                }
            });
            return true; // prevent move
        }
    }

    if (targetCell != '#') {
        engine.layers[this.layer].map[this.y][this.x] = ' ';
        this.x = tx;
        this.y = ty;
        engine.layers[this.layer].map[this.y][this.x] = this.glyph;
        engine.layers[this.layer].render();
    }

    return true;
}

Actor.prototype.getName = function(id) {
    var names = [ 'Player', 'Actor1', 'Actor2', 'Actor3', 'Actor4', 'Actor5', 'Actor6', 'Actor7' ];

    if (this.id < names.length) {
        return names[this.id];

    } else {
        return 'Extra Actor';
    }
}

Actor.prototype.hit = function(other) {
    if (other.engine) other = engine.actors[0];

    console.log('actor %s hit actor %s', other.id, this.id);

    this.hp -= 1;

    if (this.hp <= 0) {
        this.hp = 0;
        this.die();
    }
    
}

Actor.prototype.die = function() {
    console.log('actor %s died', this.id);

    engine.layers[3].map[this.y][this.x] = ' ';
    engine.actors[this.id] = undefined;
}
