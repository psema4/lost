/* Simple PRNG Based on https://en.wikipedia.org/wiki/Middle-square_method#Middle_Square_Weyl_Sequence_RNG
 *
 * Usage:
 *   node:
 *     var MSWS = require('msws.js');
 *
 *   browser:
 *     include this script in your html document
 *
 *   both:
 *     var prng = new MSWS();
 *
 *     var seed = prng.getSeed();
 *     prng.setSeet(seed);                                // static sequences
 *     //prng.setSeed(new Date().getTime());              // "random" sequences
 *
 *     var min=0, max=1000, precision=3;
 *     console.log(prng.random());                        //    0f <=> 1f
 *     console.log(prng.getInt(max, min);                 //    0  <=> 1000
 *     console.log(prng.getFloat(max, min);               //    0f <=> 1000f
 *     console.log(prng.getFixed(precision, max, min);    // 0.000 <=> 1000.000
 */

(function() {
    var MSWS = (function() {
        var MSWS = function(opts) {
            this.x = 0;
            this.w = 0;
            this.s = opts && opts.seed || 0x45ad4ece;
            this.maxPrecision = opts && opts.maxPrecision || 10;
        };
        
        MSWS.prototype.getSeed = function() {
            return this.s;
        }
        
        MSWS.prototype.setSeed = function(seed) {
            this.s = seed;
        }
        
        MSWS.prototype.msws = function(max, min) {
            var clamped = !!max
              , done = false
              , i = 0
            ;
        
            max = max || 1;
            min = min || 0;
        
            while (!done) {
                i += 1;
        
                this.x *= this.x;
                this.x += (this.w += this.s);
                this.x = (this.x>>16) | (this.x<<16);
        
                this.x = (this.x < 0) ? this.x * -1 : this.x;
        
                var outOfBounds = clamped && ( (this.x > max) || (min && this.x < min) );
        
                if (!clamped) {
                    done = true;
        
                } else if (!outOfBounds) {
                    done = true;
                }
            }
        
            return this.x;
        }
        
        MSWS.prototype.getInt = function(max, min) {
            return this.msws(max, min);
        }
        
        MSWS.prototype.getFloat = function(max, min) {
            min = min || 0;
            max = max || 1;
        
            var whole = (max === 1) ? 0 : this.getInt(max-1, min)
              , part = this.getInt(+'1'+'0'.repeat(this.maxPrecision))
              , result = +whole + '.' + part
            ;
        
            return result;
        }
        
        MSWS.prototype.getFixed = function(precision, max, min) {
            precision = precision || 2;
            min = min || 0;
            max = max || 1;

            precision = precision >= this.maxPrecision ? this.maxPrecision : precision;
            return new Number(this.getFloat(max, min)).toFixed(precision);
        }

        MSWS.prototype.random = function() {
            return this.getFloat(1, 0);
        }

        return MSWS;
    })();

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = MSWS
    } else {
        window.MSWS = MSWS
    }
})();
window.setSeed = function(s) {
    window.prng = new MSWS();
    window.seed = s;
    prng.setSeed(s);
}

setSeed(4242);
STATE_NORMAL = 0

function Door(opts) {
    opts = opts || {};

    this.name = opts.name || 'DOOR';
    this.glyph = 'd';
    this.layer = opts.layer || 0;
    this.id = opts.id || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;
    this.dest = opts.dest || 0;

    return this;
}

Door.prototype.getName = function(id) {
    var names = [ 'Door' ]
    return names[0];
}

Door.prototype.trigger = function() {
    var dest = this.dest;

    // prevent closure from restoring player glyph
    setTimeout(function() {
        console.log('teleporting from %s to %s', engine.seed, dest);
        engine.setSeed(dest);

        var previousRoom = +_$('#room').innerText
        _$('#room').innerText = (previousRoom + 1) + ''; 
    }, 0);
}
STATE_NORMAL = 0

function Pickup(opts) {
    opts = opts || {};

    this.name = opts.name || 'PICKUP';
    this.glyph = 'p';
    this.layer = opts.layer || 0;
    this.id = opts.id || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;

    return this;
}

Pickup.prototype.getName = function(id) {
    var names = [ 'Potion', 'Scroll', 'Gold' ]
      , chance = prng.getInt(100, 1) - 1
      , selected
    ;

    if (chance < 35) {
        selected = 0;

    } else if (chance < 70) {
        selected = 1;

    } else {
        selected = 2;
    }

    return names[selected];
}

Pickup.prototype.trigger = function() {
    if (engine.player.addItem(this.name)) {
        engine.layers[2].map[this.y][this.x] = ' ';
        engine.pickups[this.id] = undefined;
    }
}
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
    if (this.id == 0) return;

    this.state = STATE_AGITATED;
    this.glyph = 'A';
    engine.layers[3].map[y][x] = this.glyph;
    engine.layers[3].render();
}

Actor.prototype.calm = function() {
    if (this.id == 0) return;

    this.state = STATE_NORMAL;
    this.glyph = 'a';
    engine.layers[3].map[y][x] = this.glyph;
    engine.layers[3].render();
}

Actor.prototype.move = function(dx, dy, isPlayer) {
    var id = this.id
      , tx = this.x + dx
      , ty = this.y + dy
    ;

    if (id == 0 && !isPlayer) {
        return false;
    }

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
function Layer(opts) {
    opts = opts || {};

    this.width = opts.W || 10;
    this.height = opts.H || 10;
    this.id = opts.id || this.uuid();
    this.thing = !!opts.T && opts.T || false;
    this.numThings = opts.N || 10;
    this.map = [];
    this.things = [];

    this.empty();

    return this;
}

Layer.prototype.uuid = function() {
    return 0;
}

Layer.prototype.empty = function() {
    this.map = [];

    for (var y=0; y<this.height; y++) {
        this.map.push([]);

        for (var x=0; x<this.width; x++) {
            this.map[y][x] = ' ';
        }
    }
    return this.id;
}

Layer.prototype.from = function(src) {
    switch (typeof src) {
        case 'string':
            // split rendered output into new map layer
            console.warn('STUB: from(rendered)');
            break;

        case 'object':
            // copy array of arrays into new map layer
            console.warn('STUB: from(AoA)');
            break;

        default:
            console.warn('Layer.from(): Unsupported layer source');
    }
}

// When generating things, a floors-and-walls map (AoA) is required.
Layer.prototype.generate = function(floorsAndWalls) {
    var pending = x = y = p = a = 0;

    if (!this.thing) {  // Floors and walls
        for (y=0; y<this.height; y++) {
            for (x=0; x<this.width; x++) {
                var glyph = '';

                if (y == 0 || y == this.height-1 || x == 0 || x == this.width-1) {
                    glyph = '#';

                } else {
                    glyph = +prng.getFixed(2, 1, 0) > 0.75 ? '#' : '.';
                }

                this.map[y][x] = glyph;
            }
        }

    } else { // Things
        if (typeof floorsAndWalls != 'object') {
            console.warn('WARN: invalid floorsAndWalls map');
            return false;
        }

        for (t=0; t<this.numThings; t++) {
            pending = true;
            x = y = 0;

            while (pending) {
                x = prng.getInt(this.width-1, 0);
                y = prng.getInt(this.height-1, 0);

                if (floorsAndWalls[y][x] != '#' && this.map[y][x] == ' ') {
                    this.things[t] = new this.thing({ layer: this.id, id: t, x: x, y: y });

                    var name = this.things[t].getName(t);
                    this.things[t].name = name;
                    pending = false;

                    this.map[y][x] = this.things[t].glyph || '?';
                }
            }
        }
    }

    return this.render();
}

Layer.prototype.render = function() {
    var buf = '';

    for (var y=0; y<this.height; y++) {
        for (var x=0; x<this.width; x++)
            buf += this.map[y][x];
        buf += "\n";
    }
    
    return buf;
}

function Player(opts) {
    opts = opts || {};

    this.hp = opts.hp || 3;
    this.hpMax = opts.hpMax || 3;
    this.inventory = opts.inventory || [];

    this.max_scroll = opts.maxScroll || 3;
    this.max_potion = opts.maxPotion || 3;
    this.max_gold = opts.maxGold || 10;

    return this;
}

Player.prototype.hit = function(other) {
    console.log('actor %s hit player', other.id);

    this.hp -= 1;

    if (this.hp <= 0) {
        this.hp = 0;
        this.die();
    }

    _$('#hp').innerText = this.hp;
}

Player.prototype.canTake = function(item) {
    var matches = []
      , maxTarget = 'max_' + item.toLowerCase()
      , max = this[maxTarget]
    ;

    matches = this.inventory.filter(function(invItem) {
        return invItem == item;
    });

    if (!matches.length) {
        return true;
    }

    if (max && matches.length < max) {
        return true;
    }

    return false;
}

Player.prototype.addItem = function(item, quiet) {
    if (this.canTake(item)) {
        ;

        this.inventory.push(item);

        if (!quiet)
            _$('#message').innerText = 'You found a ' + item;

        this.updateGameUI();
        this.updateInventoryUI();

        return true;

    } else {
        if (!quiet)
            _$('#message').innerText = "Can't take " + item;

        return false;
    }
}

Player.prototype.updateGameUI = function() {
    var matches = []
      , items = [ 'Potion', 'Scroll', 'Gold' ]
      , inventory = this.inventory
    ;

    items.forEach(function(item) {
        matches = inventory.filter(function(invItem) {
            return invItem == item;
        });

        _$('#' + item.toLowerCase()).innerText = matches.length;
    });

    _$('#hp').innerText = this.hp;
}

Player.prototype.updateInventoryUI = function() {
    var inventoryItems = []
      , inventoryItemKeys = []
    ;

    _$('#items').innerHTML = '';

    this.inventory.forEach(function(invItem) {
        if (typeof inventoryItems[invItem] === 'undefined') {
            inventoryItems[invItem] = {
                name: invItem
              , count: 0
            };
        }

        inventoryItems[invItem].count += 1;
    });

    inventoryItemKeys = Object.keys(inventoryItems);
    inventoryItemKeys.forEach(function(key) {
        var item = inventoryItems[key];
        _$('#items').innerHTML += '<li>' + item.count + ' x <span onclick="engine.player.use(\'' + item.name + '\')">' + item.name + '</span></li>';
    });
}

Player.prototype.addHealth = function(hp) {
    this.hp += hp;

    if (this.hp > this.hpMax)
        this.hp = this.hpMax;
}

Player.prototype.die = function() {
    _$('#died_in_room').innerText = _$('#room').innerText;
    engine.showScreen('died');
}

Player.prototype.use = function(item) {
    var found = -1;

    this.inventory.forEach(function(invItem, idx) {
        if (invItem.toLowerCase() === item.toLowerCase()) {
            found = idx;
        }
    });

    if (found > -1) {
        var item = this.inventory.splice(found, 1)[0];
        switch(item.toLowerCase()) {
            case 'scroll':
                _$('#message').innerText = 'You use a ' + item;
                engine.actors.forEach(function(actor, idx) {
                    if (idx == 0 || actor == undefined) return;
                    actor.hit(engine.actors[0]);
                });
                engine.render();
                break;

            case 'potion':
                _$('#message').innerText = 'You drink a ' + item;
                this.addHealth(this.hpMax);
                break;

            case 'gold':
            default:
                _$('#message').innerText = "You can't use " + item + ' right now.';
                this.addItem(item, true); // prevent default message
        }
    }

    this.updateGameUI();
    this.updateInventoryUI();
    engine.showScreen('game');
}
//TODO: World map: put doors on outer walls (solve 2-way travel)

DEBUG = true;

LYR_FLOORSWALLS = 0;
LYR_DOORS = 1;
LYR_PICKUPS = 2;
LYR_ACTORS = 3;

// alias Z to W, Q to A for AZERTY keyboards; see http://xem.github.io/articles/#jsgamesinputs
KEY_W = 87; KEY_Z = 90; KEY_UP = 38;
KEY_A = 65; KEY_Q = 81; KEY_LEFT = 37;
KEY_S = 83; KEY_DOWN = 40;
KEY_D = 68; KEY_RIGHT =  39;
KEY_SPACE = 32;
KEY_ENTER = 13;

function Engine(opts) {
    opts = opts || {};
    var sprite;

    this.seed = opts.seed || 4242;
    this.width = opts.W || 10;
    this.height = opts.H || 10;
    this.numDoors = opts.D || 1;
    this.numPickups = opts.P || 3;
    this.numActors = opts.A || 10;
    this.layers = [];
    this.doors = [];
    this.pickups = [];
    this.actors = [];
    this.player = new Player();
    this.mode = 'start';

    if (typeof opts.debug != 'undefined') DEBUG = opts.debug;
    window.addEventListener('keydown', this.handleInputs);
    this.setSeed(seed);

    // setup stage2d
    if (!opts.hasStarted) {
        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                sprite = document.createElement('span');
                sprite.id = 'C' + y + '_' + x;
                sprite.className = 'sprite';

                sprite.style.top = y * 20 + 'px';
                sprite.style.left = x * 15 + 'px';

                _$('#stage2d').appendChild(sprite);
            }
        }
    }

    this.player.updateGameUI();
    this.player.updateInventoryUI();
    _$('#room').innerText = 0;

    return this;
}

Engine.prototype.setSeed = function(s) {
    this.seed = s;
    window.setSeed(s);
    this.generateLayers();
    this.render();
}

Engine.prototype.teardown = function() {
    this.layers = [];
    this.doors = [];
    this.pickups = [];
    this.actors = [];
}

Engine.prototype.generateLayers = function() {
    if (this.layers.length > 0) {
        this.teardown();
    }

    // Create a layer of floors and walls
    this.layers.push(new Layer({ id: LYR_FLOORSWALLS, W: this.width, H: this.height }));
    this.layers[LYR_FLOORSWALLS].generate();

    // Create a layer for doors
    this.layers.push(new Layer({ id: LYR_DOORS, W: this.width, H: this.height, N: this.numDoors, T: Door }));
    this.layers[LYR_DOORS].generate(this.layers[LYR_FLOORSWALLS].map);
    this.doors = this.layers[LYR_DOORS].things;
    this.doors.forEach(function(door) {
        door.dest = 4242 + prng.getInt(1000, 1);
    });

    // Create a layer of pickups
    this.layers.push(new Layer({ id: LYR_PICKUPS, W: this.width, H: this.height, N: this.numPickups, T: Pickup }));
    this.layers[LYR_PICKUPS].generate(this.layers[LYR_FLOORSWALLS].map);
    this.pickups = this.layers[LYR_PICKUPS].things;
    
    // Create a layer of actors
    this.layers.push(new Layer({ id: LYR_ACTORS, W: this.width, H: this.height, N: this.numActors, T: Actor }));
    this.layers[LYR_ACTORS].generate(this.layers[LYR_FLOORSWALLS].map);

    this.actors = this.layers[LYR_ACTORS].things;
}

// handle inputs
Engine.prototype.handleInputs = function(e) {
    var isPlaying = engine.mode === 'game';

    if (isPlaying)
        _$('#message').innerText = '';

    switch (e.which) {
        case KEY_W:
        case KEY_Z:
        case KEY_UP:
            if (isPlaying) engine.actors[0].move(0, -1, true);
            break;

        case KEY_A:
        case KEY_Q:
        case KEY_LEFT:
            if (isPlaying) engine.actors[0].move(-1, 0, true);
            break;

        case KEY_S:
        case KEY_DOWN:
            if (isPlaying) engine.actors[0].move(0, 1, true);
            break;

        case KEY_D:
        case KEY_RIGHT:
            if (isPlaying) engine.actors[0].move(1, 0, true);
            break;

        case KEY_SPACE:
            console.log('space');
            break;

        case KEY_ENTER:
            console.log('enter');
            break;

        default:
    }

    if (isPlaying) {
        engine.render();
        engine.aiTurn();
    }
}

Engine.prototype.aiTurn = function() {
    // process all non-player actors
    this.actors.forEach(function(actor) {
        if ((!actor) || actor.id == 0) return;

        var d = prng.getInt(4, 1) - 1;
        if (DEBUG) console.log('  actor %s move direction: %s', actor.id, d);

        if (d == 0) actor.move(0, -1);
        if (d == 1) actor.move(-1, 0);
        if (d == 2) actor.move(0, 1);
        if (d == 3) actor.move(1, 0);
    });

    this.render();
}

// combine layers (raw render)
Engine.prototype.mergeLayers = function() {
    var tmpLayer = new Layer({ W: this.width, H: this.height })
      , buf = ''
    ;

    if (DEBUG) console.groupCollapsed('mergeLayer');

    for (var y=0; y<this.height; y++) {
        for (var x=0; x<this.width; x++) {
            tmpLayer.map[y][x] = this.layers[LYR_FLOORSWALLS].map[y][x];

            if (DEBUG) console.log('FW: tmpLayer.map[%s][%s]: "%s"', y, x, tmpLayer.map[y][x]); 

            // cells without walls copy from other layers
            switch(tmpLayer.map[y][x]) {
                case ' ':
                case '.':
                case '~':
                    if (this.layers[LYR_DOORS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_DOORS].map[y][x];
                    if (this.layers[LYR_PICKUPS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_PICKUPS].map[y][x];
                    if (this.layers[LYR_ACTORS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_ACTORS].map[y][x];

                    if (DEBUG) console.log('PA: tmpLayer[%s][%s]: "%s"', y, x, tmpLayer.map[y][x]); 
                    break;
            }

            buf += tmpLayer.map[y][x];
        }

        buf += "\n";
    }

    if (DEBUG) console.groupEnd();

    return buf;
}

// post-processing and final render
Engine.prototype.render = function() {
    var buf = this.mergeLayers();

    if (DEBUG) {
        console.groupCollapsed('render');
        console.log(buf);
        console.groupEnd();
    }

    stage.innerText = buf;

    //FIXME: Quick-n-Dirty 2d render: split walls and floors into their own layers. always draw the floor layer for sprites' transparency to work properly
    if (! _$('#C0_0')) return buf;

    var lines = buf.split(/\n/);
    for (var y=0; y<this.height; y++) {
        var line = lines[y]
          , columns = line.split('')
        ;

        for (var x=0; x<this.width; x++) {
            var column = columns[x]
              , classNames = ''
              , id = '#'
            ;

            switch(column) {
                case '.':
                    classNames = 'ground0';
                    break;

                case '#':
                    classNames = 'wall0';
                    break;

                case '@':
                    classNames = 'actor0 up frame1';
                    break;

                case 'a':
                    classNames = 'actor1 up frame1';
                    break;

                case 'p':
                    classNames = 'pickup0';
                    break;

                case 'd':
                default:
                    classNames = 'ground1';
            }

            id += 'C' + y + '_' + x;
            _$(id).className='sprite ' + classNames;
        }
    }

    return buf;
}

Engine.prototype.hideScreens = function() {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function(screen) {
        screen.style.display = 'none';
    });
}

Engine.prototype.showScreen = function (screen) {
    this.hideScreens();
    _$('#' + screen).style.display = 'block';
    this.mode = screen;
}
function _$(sel) { return document.querySelector(sel); }

function startNewGame(hasStarted) {
    window.engine = new Engine({
        W: 20
      , H: 10
      , D: 1
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
      , hasStarted: hasStarted
    });


    _$('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    _$('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    _$('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    _$('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    engine.render();


    if (!!hasStarted) {
        engine.showScreen('intro');

    } else {
        setTimeout(function() {
            engine.showScreen('mainmenu');
        }, 3000);
    }
}
window.addEventListener('load', function() { startNewGame(false); });
