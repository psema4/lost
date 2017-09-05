STATE_NORMAL = 0

function Door(opts) {
    opts = opts || {};

    this.name = opts.name || 'DOOR';
    this.glyph = 'd';
    this.layer = opts.layer || 0;
    this.id = opts.id || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;
    this.dest = opts.dest || 0;

    return this;
}

Door.prototype.getName = function(id) {
    var names = [ 'Door' ]
    return names[0];
}

Door.prototype.trigger = function() {
    var dest = this.dest;

    // prevent closure from restoring player glyph
    setTimeout(function() {
        console.log('teleporting from %s to %s', engine.seed, dest);
        engine.setSeed(dest);
    }, 0);
}
