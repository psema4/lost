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
    var names = [ 'Potion', 'Scroll', 'Gold', 'Lantern', 'Axe' ]
      , selected = prng.getInt(names.length, 1) - 1
    ;

    return names[selected];
}

Pickup.prototype.trigger = function() {
    if (engine.player.addItem(this.name)) {
        engine.layers[LYR_PICKUPS].map[this.y][this.x] = ' ';
        engine.layers[LYR_PICKUPS].dirty = true;
        engine.layers[LYR_PICKUPS].render();
        engine.pickups[this.id] = undefined;
    }
}
