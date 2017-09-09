STATE_NORMAL = 0

function Floor(opts) {
    opts = opts || {};

    this.name = opts.name || 'FLOOR';
    this.glyph = '.';
    this.layer = opts.layer || 0;
    this.id = opts.id || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;
    this.eventCell = prng.random() < 0.125;
    this.hasFired = false;

    return this;
}

Floor.prototype.getName = function(id) {
    var names = [ 'Floor' ]
    return names[0];
}

Floor.prototype.trigger = function(other) {
    if (this.eventCell && !this.hasFired) {
        engine.drawCard(DECK_EVENTS);
        this.hasFired = true;
    }
}
