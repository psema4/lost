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
    console.log('teleporting from %s to %s', engine.seed, this.dest);
    engine.setSeed(this.dest);
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
    var names = [ 'Potion', 'Scroll', 'Sword', 'Gold' ]
      , chance = prng.getInt(100, 1) - 1
      , selected
    ;

    if (chance < 35) {
        selected = 0;

    } else if (chance < 70) {
        selected = 1;

    } else if (chance < 90) {
        selected = 2;

    } else {
        selected = 3;
    }

    return names[selected];
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
        this.hp = prng.getInt(3, 1);
    }

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

Actor.prototype.move = function(dx, dy) {
    var tx = this.x + dx
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

    //FIXME: check for collisions
    var targetCell = engine.layers[0].map[ty][tx];

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

                if (floorsAndWalls[y][x] != '#') {
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

//FIXME: World map

/*
    add one or more doors to LYR_FLOORSWALLS; upon landing on a door, generate layers based on the seed stored in the world cell

    world[y][x] = seed

    ie, given a world map:

            1000 1001 1002 1003
            1004 1005 1006 1007
            1008 1009 1010 1011
            1012 1013 1014 1015

    and the current map (seed = 1000):

            ####################
            #A.#........#..A.A.#
            #.....#.......#...A#
            #......#......#....#
            #........#.........#
            #..................D
            #..................#
            ##........#....A.#.#
            #.A....!......##...#
            #.....#.#....#...###
            #.A...#....#..#..#.#
            #..#....##.#.......#
            #.........#........#
            #............#.....#
            #.............A.#..#
            #.......A........#.#
            #...#....#...#.....#
            #...##...#......#..#
            #..#....A!...#!....#
            #########D##########

    then landing on the bottom door (D character) should cause the engine to generate a new map using the seed 1004, whereas landing
    on the door to the right should cause the engine to generate a new map with the seed 1001.
*/


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

    this.seed = opts.seed || 4242
    this.width = opts.W || 10
    this.height = opts.H || 10
    this.numDoors = opts.D || 1
    this.numPickups = opts.P || 3
    this.numActors = opts.A || 10
    this.layers = []
    this.doors = []
    this.pickups = []
    this.actors = [] 

    if (typeof opts.debug != 'undefined') DEBUG = opts.debug;
    window.addEventListener('keydown', this.handleInputs);
    this.setSeed(seed);

    return this;
}

Engine.prototype.setSeed = function(s) {
    this.seed = s;
    window.setSeed(s);
    this.generateLayers();
    this.render();
}

Engine.prototype.teardown = function() {
    this.layers.forEach(function(layer) {
        layer.map = undefined;
        layer.thing = undefined;
        layer.things = undefined;
    });

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
    switch (e.which) {
        case KEY_W:
        case KEY_Z:
        case KEY_UP:
            engine.actors[0].move(0, -1);
            engine.render();
            break;

        case KEY_A:
        case KEY_Q:
        case KEY_LEFT:
            engine.actors[0].move(-1, 0);
            engine.render();
            break;

        case KEY_S:
        case KEY_DOWN:
            engine.actors[0].move(0, 1);
            engine.render();
            break;

        case KEY_D:
        case KEY_RIGHT:
            engine.actors[0].move(1, 0);
            engine.render();
            break;

        case KEY_SPACE:
            console.log('space');
            break;

        case KEY_ENTER:
            console.log('enter');
            break;

        default:
    }

    engine.aiTurn();
}

Engine.prototype.aiTurn = function() {
    // process all non-player actors
    for (var id=1; id<this.actors.length; id++) {
        var d = prng.getInt(4, 1) - 1;
        
        if (d == 0) this.actors[id].move(0, -1);
        if (d == 1) this.actors[id].move(-1, 0);
        if (d == 2) this.actors[id].move(0, 1);
        if (d == 3) this.actors[id].move(1, 0);

        if (DEBUG) console.log('actor[%s] move direction: %s', id, d);
    }

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

    return buf;
}
window.addEventListener('load', function() {
    window.engine = new Engine({
        W: 20
      , H: 10
      , D: 1
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
    });

    // chrome 60 for android doesn't seem to like treating dom elements with id's as global vars, use querySelector
    function $(sel) { return document.querySelector(sel); }

    $('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    $('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    $('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    $('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    engine.render();
});
