function Player(opts) {
    opts = opts || {};

    this.hp = opts.hp || 3;
    this.hpMax = opts.hpMax || 3;
    this.inventory = opts.inventory || [];

    this.max_scroll = opts.maxScroll || 3;
    this.max_potion = opts.maxPotion || 3;
    this.max_gold = opts.maxGold || 10;

    return this;
}

Player.prototype.hit = function(other) {
    console.log('actor %s hit player', other && other.id);

    this.hp -= 1;

    if (this.hp <= 0) {
        this.hp = 0;
        this.die();
    }

    this.updateGameUI();
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

Player.prototype.addItem = function(item, quiet) {
    if (this.canTake(item)) {
        ;

        this.inventory.push(item);

        if (!quiet)
            _$('#message').innerText = 'You found a ' + item;

        this.updateGameUI();
        this.updateInventoryUI();

        return true;

    } else {
        if (!quiet)
            _$('#message').innerText = "Can't take " + item;

        return false;
    }
}

Player.prototype.updateGameUI = function() {
    var matches = []
      , items = [ 'Potion', 'Scroll', 'Gold' ]
      , inventory = this.inventory
    ;

    items.forEach(function(item) {
        matches = inventory.filter(function(invItem) {
            return invItem == item;
        });

        _$('#' + item.toLowerCase()).innerText = matches.length;
    });

    _$('#hp').innerText = this.hp;
}

Player.prototype.updateInventoryUI = function() {
    var inventoryItems = []
      , inventoryItemKeys = []
    ;

    _$('#items').innerHTML = '';

    this.inventory.forEach(function(invItem) {
        if (typeof inventoryItems[invItem] === 'undefined') {
            inventoryItems[invItem] = {
                name: invItem
              , count: 0
            };
        }

        inventoryItems[invItem].count += 1;
    });

    inventoryItemKeys = Object.keys(inventoryItems);
    inventoryItemKeys.forEach(function(key) {
        var item = inventoryItems[key];
        _$('#items').innerHTML += '<li>' + item.count + ' x <button onclick="engine.player.use(\'' + item.name + '\')">' + item.name + '</button></li>';
    });
}

Player.prototype.addHealth = function(hp) {
    this.hp += hp;

    if (this.hp > this.hpMax)
        this.hp = this.hpMax;

    this.updateGameUI();
}

Player.prototype.die = function() {
    _$('#died_in_room').innerText = _$('#room').innerText;
    engine.showScreen('died');
}

Player.prototype.use = function(item) {
    var found = -1;

    this.inventory.forEach(function(invItem, idx) {
        if (invItem.toLowerCase() === item.toLowerCase()) {
            found = idx;
        }
    });

    if (found > -1) {
        var item = this.inventory.splice(found, 1)[0];
        switch(item.toLowerCase()) {
            case 'scroll':
                _$('#message').innerText = 'You use a ' + item;
                engine.actors.forEach(function(actor, idx) {
                    if (idx == 0 || actor == undefined) return;
                    actor.hit(engine.actors[0]);
                });
                engine.render();
                break;

            case 'potion':
                _$('#message').innerText = 'You drink a ' + item;
                this.addHealth(this.hpMax);
                break;

            case 'gold':
            default:
                _$('#message').innerText = "You can't use " + item + ' right now.';
                this.addItem(item, true); // prevent default message
        }
    }

    this.updateGameUI();
    this.updateInventoryUI();
    engine.showScreen('game');
}
