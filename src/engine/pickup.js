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
