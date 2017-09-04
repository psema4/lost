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
STATE_NORMAL = 0
STATE_AGITATED = 1

function Actor(opts) {
    opts = opts || {};

    var prng = opts.prng || new MSWS()
      , seed = opts.seed || new Date().getTime()
      , name = opts.name || 'ACTOR'
      , glyph = 'a'
      , layer = opts.layer || 0
      , id = opts.id || 0
      , x = opts.x || 0
      , y = opts.y || 0
      , state = opts.state || STATE_NORMAL
    ;

    if (id == 0) {
        glyph = '@';
        hp = 3;

    } else {
        hp = prng.getInt(3, 1);
    }
    

    function agitate() {
        if (this.id ==0) return;

        this.state = STATE_AGITATED;
        this.glyph = 'A';
        engine.layers[layer].map[y][x] = this.glyph;
        engine.layers[this.layer].render();
    }

    function calm() {
        if (this.id ==0) return;

        this.state = STATE_NORMAL;
        this.glyph = 'a';
        engine.layers[layer].map[y][x] = this.glyph;
        engine.layers[this.layer].render();
    }

    function move(dx, dy) {
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

    function getName(id) {
        var names = [ 'Player', 'Actor1', 'Actor2', 'Actor3', 'Actor4', 'Actor5', 'Actor6', 'Actor7' ];

        if (id < names.length) {
            return names[id];

        } else {
            return 'Extra Actor';
        }
    }

    return {
        name: name
      , glyph: glyph
      , layer: layer
      , id: id
      , x: x
      , y: y
      , state: state
      , agitate: agitate
      , calm: calm
      , move: move
      , getName: getName
    }
}
STATE_NORMAL = 0

function Pickup(opts) {
    opts = opts || {};

    var prng = opts.prng || new MSWS()
      , seed = opts.seed || new Date().getTime()
      , name = opts.name || 'PICKUP'
      , glyph = 'p'
      , layer = opts.layer || 0
      , id = opts.id || 0
      , x = opts.x || 0
      , y = opts.y || 0
      , state = opts.state || STATE_NORMAL
    ;

    function getName(id) {
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

    return {
        name: name
      , glyph: glyph
      , layer: layer
      , id: id
      , x: x
      , y: y
      , state: state
      , getName: getName
    }
}
function Layer(opts) {
    opts = opts || {};

    var prng = opts.prng || new MSWS()
      , seed = opts.seed || new Date().getTime()
      , width = opts.W || 10
      , height = opts.H || 10
      , id = opts.id || uuid()
      , thing = !!opts.T && opts.T || false
      , numThings = opts.N || 10
      , map = []
      , things = []
    ;

    prng.setSeed(seed);

    function uuid() {
        return 0;
    }

    function empty() {
        function emptyRow() {
            return ' '.repeat(width).split('');
        }

        for (var i=0; i<height; i++)
            map.push(emptyRow());

        return id;
    }

    function from(src) {
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
    function generate(floorsAndWalls) {
        var pending = x = y = p = a = 0;

        if (!thing) {  // Floors and walls
            for (y=0; y<height; y++) {
                for (x=0; x<width; x++) {
                    var glyph = '';

                    if (y == 0 || y == height-1 || x == 0 || x == width-1) {
                        glyph = '#';

                    } else {
                        glyph = +prng.getFixed(2, 1, 0) > 0.75 ? '#' : '.';
                    }

                    map[y][x] = glyph;
                }
            }

        } else { // Things
            if (typeof floorsAndWalls != 'object') {
                console.warn('WARN: invalid floorsAndWalls map');
                return false;
            }

            for (t=0; t<numThings; t++) {
                pending = true;
                x = y = 0;

                while (pending) {
                    x = prng.getInt(width-1, 0);
                    y = prng.getInt(height-1, 0);

                    if (floorsAndWalls[y][x] != '#') {
                        things[t] = new thing({ layer: this.id, id: t, x: x, y: y, prng: prng, seed: seed });
                        var name = things[t].getName(t);
                        things[t].name = name;
                        pending = false;

                        map[y][x] = things[t].glyph || '?';
                    }
                }
            }
        }

        return render();
    }

    function render() {
        var buf = '';

        for (var y=0; y<height; y++) {
            for (var x=0; x<width; x++)
                buf += map[y][x];
            buf += "\n";
        }
        
        return buf;
    }

    empty();

    return {
        // properties
        opts: opts
      , id: id
      , map: map
      , thing: thing
      , things: things

        // methods
      , uuid: uuid
      , empty: empty
      , from: from
      , generate: generate
      , render: render
    }
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
LYR_PICKUPS = 1;
LYR_ACTORS = 2;

// alias Z to W, Q to A for AZERTY keyboards; see http://xem.github.io/articles/#jsgamesinputs
KEY_W = 87; KEY_Z = 90; KEY_UP = 38;
KEY_A = 65; KEY_Q = 81; KEY_LEFT = 37;
KEY_S = 83; KEY_DOWN = 40;
KEY_D = 68; KEY_RIGHT =  39;
KEY_SPACE = 32;
KEY_ENTER = 13;

function Engine(opts) {
    opts = opts || {};

    var prng = opts.prng || new MSWS()
      , seed = opts.seed || new Date().getTime()
      , width = opts.W || 10
      , height = opts.H || 10
      , numPickups = opts.P || 3
      , numActors = opts.A || 10
      , layers = []
      , pickups = []
      , actors = [] 
    ;

    // Set the global prng
    if (typeof opts.debug != 'undefined') DEBUG = opts.debug;
    prng.setSeed(seed);

    // Create a layer of floors and walls
    layers.push(new Layer({ id: LYR_FLOORSWALLS, W: width, H: height, prng: prng, seed: seed }));
    layers[LYR_FLOORSWALLS].generate();

    // Create a layer of pickups
    layers.push(new Layer({ id: LYR_PICKUPS, W: width, H: height, N: numPickups, T: Pickup, prng: prng, seed: seed }));
    layers[LYR_PICKUPS].generate(layers[LYR_FLOORSWALLS].map);
    pickups = layers[LYR_PICKUPS].things;
    
    // Create a layer of actors
    layers.push(new Layer({ id: LYR_ACTORS, W: width, H: height, N: numActors, T: Actor, prng: prng, seed: seed }));
    layers[LYR_ACTORS].generate(layers[LYR_FLOORSWALLS].map);
    actors = layers[LYR_ACTORS].things;


    // handle inputs
    function handleInputs(e) {
        switch (e.which) {
            case KEY_W:
            case KEY_Z:
            case KEY_UP:
                actors[0].move(0, -1);
                render();
                break;

            case KEY_A:
            case KEY_Q:
            case KEY_LEFT:
                actors[0].move(-1, 0);
                render();
                break;

            case KEY_S:
            case KEY_DOWN:
                actors[0].move(0, 1);
                render();
                break;

            case KEY_D:
            case KEY_RIGHT:
                actors[0].move(1, 0);
                render();
                break;

            case KEY_SPACE:
                console.log('space');
                break;

            case KEY_ENTER:
                console.log('enter');
                break;

            default:
        }

        aiTurn();
    }
    window.addEventListener('keydown', handleInputs);

    function aiTurn() {
        // process all non-player actors
        for (var id=1; id<actors.length; id++) {
            var d = prng.getInt(4, 1) - 1;
            
            if (d == 0) actors[id].move(0, -1);
            if (d == 1) actors[id].move(-1, 0);
            if (d == 2) actors[id].move(0, 1);
            if (d == 3) actors[id].move(1, 0);

            if (DEBUG) console.log('actor[%s] move direction: %s', id, d);
        }

        render();
    }

    // combine layers (raw render)
    function mergeLayers() {
        var tmpLayer = new Layer({ W: width, H: height, prng: prng, seed: seed })
          , buf = ''
        ;

        if (DEBUG) console.groupCollapsed('mergeLayer');

        for (var y=0; y<height; y++) {
            for (var x=0; x<width; x++) {
                tmpLayer.map[y][x] = layers[LYR_FLOORSWALLS].map[y][x];

                if (DEBUG) console.log('FW: tmpLayer.map[%s][%s]: "%s"', y, x, tmpLayer.map[y][x]); 

                // cells without walls copy from other layers
                switch(tmpLayer.map[y][x]) {
                    case ' ':
                    case '.':
                    case '~':
                        if (layers[LYR_PICKUPS].map[y][x] != ' ') tmpLayer.map[y][x] = layers[LYR_PICKUPS].map[y][x];
                        if (layers[LYR_ACTORS].map[y][x] != ' ') tmpLayer.map[y][x] = layers[LYR_ACTORS].map[y][x];

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
    function render() {
        var buf = mergeLayers();

        if (DEBUG) {
            console.groupCollapsed('render');
            console.log(buf);
            console.groupEnd();
        }

        stage.innerText = buf;

        return buf;
    }

    return {
        // properties
        opts: opts
      , width: width
      , height: height
      , layers: layers
      , pickups: pickups
      , actors: actors

        // methods
      , render: render
      , handleInputs: handleInputs
    }
}
window.addEventListener('load', function() {
    window.engine = new Engine({
        W: 20
      , H: 10
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
    });

    function $(sel) { return document.querySelector(sel); }

    $('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    $('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    $('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    $('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    engine.render();
});
