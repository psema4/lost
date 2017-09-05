function Player(opts) {
    opts = opts || {};

    this.hp = opts.hp || 3;
    this.inventory = [];

    return this;
}

Player.prototype.hit = function(other) {
    console.log('actor %s hit player', other.id);

    this.hp -= 1;

    if (this.hp <= 0) {
        this.hp = 0;
        this.die();
    }

    _$('#hp').innerText = this.hp;
}

Player.prototype.addItem = function(item) {
    this.inventory.push(item);
}

Player.prototype.die = function() {
    console.log('player died');
}
