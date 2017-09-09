STATE_NORMAL = 0

function Wall(opts) {
    opts = opts || {};

    this.name = opts.name || 'WALL';
    this.glyph = '#';
    this.layer = opts.layer || 0;
    this.id = opts.id || 0;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.state = opts.state || STATE_NORMAL;

    return this;
}

Wall.prototype.getName = function(id) {
    var names = [ 'Wall' ]
    return names[0];
}

Wall.prototype.trigger = function() {
}
