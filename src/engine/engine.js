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
            engine.actors[0].move(0, -1, true);
            break;

        case KEY_A:
        case KEY_Q:
        case KEY_LEFT:
            engine.actors[0].move(-1, 0, true);
            break;

        case KEY_S:
        case KEY_DOWN:
            engine.actors[0].move(0, 1, true);
            break;

        case KEY_D:
        case KEY_RIGHT:
            engine.actors[0].move(1, 0, true);
            break;

        case KEY_SPACE:
            console.log('space');
            break;

        case KEY_ENTER:
            console.log('enter');
            break;

        default:
    }

    engine.render();
    engine.aiTurn();
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

    return buf;
}
