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
