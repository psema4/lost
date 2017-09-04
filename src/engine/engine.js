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
    window.addEventListener('keydown', function(e) {
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
    });

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
    }
}
