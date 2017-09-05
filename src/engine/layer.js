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

