function createEventsDeck(size) {
    var deck = []
      , cards = [
            { id: 0, name: 'Restore', cb: potion }
          , { id: 1, name: 'Refresh', cb: potion1 }
          , { id: 2, name: 'Refresh', cb: potion1 }
          , { id: 3, name: 'Lightning Strike', cb: scroll1 }
          , { id: 4, name: 'Lightning Strike', cb: scroll1 }
          , { id: 5, name: 'Magical Lightning', cb: scroll }
          , { id: 6, name: 'Sick', cb: sick }
          , { id: 7, name: 'Sick', cb: sick }
          , { id: 8, name: 'Daytime', cb: daytime }
          , { id: 9, name: 'Nighttime', cb: nighttime }
        ]
    ;

    // Equivalent to using a potion
    function potion() {
        engine.player.addHealth(engine.player.hpMax);
        _$('#message').innerText = 'You feel restored!';
    }

    // Same as potion, but only restores a single hit point
    function potion1() {
        engine.player.addHealth(1);
        _$('#message').innerText = 'You feel refreshed!';
    }

    // Equivalent to using a scroll
    function scroll() {
        engine.lightning();
        engine.actors.forEach(function(actor) {
            if (actor) {
                if (actor.id == 0) return;
                actor.hit();
            }
        });
        _$('#message').innerText = 'Magical lightning strike!';
    }

    // Similar to scroll, but only affects one actor
    function scroll1() {
        var idx = 0
          , actor = false
        ;

        while (! actor) {
            idx = Math.floor(Math.random() * engine.actors.length)
            actor = engine.actors[idx]
        }

        if (idx != 0) {
            actor.hit();
            engine.lightning();
            _$('#message').innerText = 'Lightning Strike!';
        }
    }

    // Won't kill player but will weaken
    function sick() {
        if (engine.player.hp > 1) {
            engine.player.hit();
            _$('#message').innerText = 'You don\'t feel well';
        }
    }

    function daytime() {
        engine.dayNightCycle('day');
    }

    function nighttime() {
        engine.dayNightCycle('night');
    }

    // Build the deck
    for (var i = 0; i < size; i++) {
        var selected = Math.floor(Math.random() * cards.length)
          , card = new Card(cards[selected])
        ;

        deck.push(card);
    }

    return deck;
}
