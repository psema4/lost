function Player(opts) {
    opts = opts || {};

    this.hp = opts.hp || 3;
    this.inventory = opts.inventory || [];

    this.max_scroll = opts.maxScroll || 3;
    this.max_potion = opts.maxPotion || 3;
    this.max_gold = opts.maxGold || 10;

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

Player.prototype.canTake = function(item) {
    var matches = []
      , maxTarget = 'max_' + item.toLowerCase()
      , max = this[maxTarget]
    ;

    matches = this.inventory.filter(function(invItem) {
        return invItem == item;
    });

    if (!matches.length) {
        return true;
    }

    if (max && matches.length < max) {
        return true;
    }

    return false;
}

Player.prototype.addItem = function(item) {
    if (this.canTake(item)) {
        var matches = [];

        this.inventory.push(item);
        _$('#message').innerText = 'You found a ' + item;

        matches = this.inventory.filter(function(invItem) {
            return invItem == item;
        });

        _$('#' + item.toLowerCase()).innerText = matches.length;
        return true;

    } else {
        _$('#message').innerText = "Can't take " + item;
        return false;
    }
}

Player.prototype.die = function() {
    engine.showScreen('died');
}
