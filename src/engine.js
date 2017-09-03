DEBUG = true;
LYR_FLOORSWALLS = 0;
LYR_PICKUPS = 1;
LYR_ACTORS = 2;

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

    if (typeof opts.debug != 'undefined') DEBUG = opts.debug;
    prng.setSeed(seed);

    function test() {
        if (!DEBUG) return;

        console.groupCollapsed('TEST');
        console.log('this:', this);
        console.log('opts:', opts);
        console.groupEnd();
    }

    function newLayer() {
        var id = layers.length
          , layer = []
        ;

        function emptyRow() {
            return ' '.repeat(width).split('');
        }

        for (var i=0; i<height; i++) layer.push(emptyRow());
        layers.push(layer);

        return id;
    }

    function renderLayer(id) {
        var buf = '';

        for (var y=0; y<height; y++) {
            for (var x=0; x<width; x++) buf += layers[id][y][x];
            buf += "\n";
        }
        
        return buf;
    }

    function mergeLayers() {
        var tmpLayer = layers[newLayer()]
          , buf = ''
        ;

        if (DEBUG) console.groupCollapsed('mergeLayer');

        for (var y=0; y<height; y++) {
            for (var x=0; x<width; x++) {
                tmpLayer[y][x] = layers[LYR_FLOORSWALLS][y][x];

                if (DEBUG) console.log('FW: tmpLayer[%s][%s]: "%s"', y, x, tmpLayer[y][x]); 

                // cells without walls copy from other layers
                switch(tmpLayer[y][x]) {
                    case ' ':
                    case '.':
                    case '~':
                        if (layers[LYR_PICKUPS][y][x] != ' ') tmpLayer[y][x] = layers[LYR_PICKUPS][y][x];
                        if (layers[LYR_ACTORS][y][x] != ' ') tmpLayer[y][x] = layers[LYR_ACTORS][y][x];

                        if (DEBUG) console.log('PA: tmpLayer[%s][%s]: "%s"', y, x, tmpLayer[y][x]); 
                        break;
                }

                buf += tmpLayer[y][x];
            }

            buf += "\n";
        }

        if (DEBUG) console.groupEnd();

        layers.pop();
        return buf;
    }

    function generate() {
        var pending = x = y = p = a = 0;

        LYR_FLOORSWALLS = newLayer();
        LYR_PICKUPS = newLayer();
        LYR_ACTORS = newLayer();

        // Floors and walls
        for (y=0; y<height; y++) {
            for (x=0; x<width; x++) {
                var glyph = '';

                if (y == 0 || y == height-1 || x == 0 || x == width-1) {
                    glyph = '#';

                } else {
                    glyph = +prng.getFixed(2, 1, 0) > 0.75 ? '#' : '.';
                }

                layers[LYR_FLOORSWALLS][y][x] = glyph;
            }
        }

        if (DEBUG) console.groupCollapsed('actors & pickups')

        // Pickups
        for (p=0; p<numPickups; p++) {
            pending = true;
            x = y = 0;

            while (pending) {
                x = prng.getInt(width-1, 0);
                y = prng.getInt(height-1, 0);

                if (layers[LYR_FLOORSWALLS][y][x] != '#') {
                    pickups[p] = 'An item';
                    pending = false;

                    if (DEBUG) console.log('generating pickup %s at %s, %s', p, x, y);

                    layers[LYR_PICKUPS][y][x] = '!';
                }
            }
        }

        // Actors
        for (a=0; a<numActors; a++) {
            pending = true;
            x = y = 0;

            while (pending) {
                x = prng.getInt(width-1, 0);
                y = prng.getInt(height-1, 0);

                if (layers[LYR_FLOORSWALLS][y][x] != '#') {
                    actors[a] = 'An actor';
                    pending = false;

                    if (DEBUG) console.log('generating actor %s at %s, %s', a, x, y);

                    layers[LYR_ACTORS][y][x] = 'A';
                }
            }
        }

        if (DEBUG) console.groupEnd();

        return render();
    }

    function render() {
        var buf = mergeLayers();

        if (DEBUG) {
            console.groupCollapsed('render');
            console.log(buf);
            console.groupEnd();
        }

        return buf;
    }

    return {
        // properties
        opts: opts
      , layers: layers
      , pickups: pickups
      , actors: actors

        // methods
      , test: test
      , generate: generate
      , render: render
      , renderLayer: renderLayer
    }
}
