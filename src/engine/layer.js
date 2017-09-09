function Layer(opts) {
    opts = opts || {};

    this.width = opts.W || 10;
    this.height = opts.H || 10;
    this.id = opts.id || this.uuid();
    this.thing = !!opts.T && opts.T || false;
    this.numThings = opts.N || 10;
    this.probability = opts.P || 1;
    this.border = opts.B || false;
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

Layer.prototype.generate = function(walls) {
    var pending = x = y = p = a = 0;

    if (typeof walls != 'object') {
        walls = [];
        for (y=0; y<this.height; y++) {
            var row = [];
            for (var x=0; x<this.width; x++) {
                row.push(' ');
            }
            walls.push(row);
        }
    }

    // floors, walls (and other things requiring "random" distribution; not implemented [check for walls])
    if (this.numThings < 0) {
        var t = 0;

        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                var placeThing = (this.probability >= 1 || prng.random() < this.probability);

                if (this.border && (y == 0 || y == this.height-1 || x == 0 || x == this.width-1))
                    placeThing = true;

                if (placeThing) {
                    var thing = new this.thing({ layer: this.id, id: t, x: x, y: y });
                    thing.name = thing.getName(t);
                    this.map[y][x] = thing.glyph || '?';
                    this.things.push(thing);
                }
                t += 1;
            }
        }

    } else {
        // when generating a specific number of things
        for (t=0; t<this.numThings; t++) {
            pending = true;
            x = y = 0;

            while (pending) {
                x = prng.getInt(this.width-1, 0);
                y = prng.getInt(this.height-1, 0);

                if (walls[y][x] != '#' && this.map[y][x] == ' ') {
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

