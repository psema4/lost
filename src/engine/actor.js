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
