function Card(opts) {
    opts = opts || {};

    this.id = opts.id || 0;
    this.name = opts.name || 'CARD';
    this.cb = opts.cb || function() {};

    return this;
}

Card.prototype.play = function() {
    console.log('Card played: %s', this.name);
    this.cb();
}

Card.prototype.discard = function() {
}
