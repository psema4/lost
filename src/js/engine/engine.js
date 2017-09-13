function Engine(opts) {
    opts = opts || {};
    var sprite;

    this.mode = 'start';
    this.menu = [];
    this.menuSelection = 0;

    this.layers  = [];
    this.floors  = [];
    this.walls   = [];
    this.doors   = [];
    this.pickups = [];
    this.actors  = [];
    this.player  = new Player();

    this.seed       = opts.seed || 4242;
    this.width      = opts.W || 10;
    this.height     = opts.H || 10;
    this.numDoors   = opts.D || 1;
    this.numPickups = opts.P || 3;
    this.numActors  = opts.A || 10;

    this.renderMode = '2d';
    this.cardDecks = [];
    this.storm = false;
    this.effects = (screen.availWidth >= 800); //FIXME: better mobile detection
    this.clkFlicker;
    this.time = 0; // start at noon
    this.day = 1;

    window.addEventListener('keydown', this.handleInputs);
    this.setSeed(seed);

    // NOTE: this render strategy is much more performant than creating document fragments
    // setup stage2d
    if (!opts.hasStarted) {
        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                sprite = document.createElement('span');
                sprite.id = 'B' + y + '_' + x;
                sprite.className = 'SP';

                sprite.style.top = y * 20 + 'px';
                sprite.style.left = x * 15 + 'px';

                _$('#stage2d').appendChild(sprite);
            }
        }

        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                sprite = document.createElement('span');
                sprite.id = 'C' + y + '_' + x;
                sprite.className = 'SP';

                sprite.style.top = y * 20 + 'px';
                sprite.style.left = x * 15 + 'px';

                _$('#stage2d').appendChild(sprite);
            }
        }
    }

    this.player.updateGameUI();
    this.player.updateInventoryUI();
    _$('#room').innerText = 0;

    // create event cards
    this.cardDecks[DECK_EVENTS] = createEventsDeck(10);
    this.shuffleDeck(DECK_EVENTS);
    this.cardDecks[DECK_EVENTS_DISCARDS] = [];

    return this;
}

Engine.prototype.setSeed = function(s) {
    this.seed = s;
    window.setSeed(s);
    this.generateLayers();
    this.render();
    this.centerView();
}

Engine.prototype.generateLayers = function() {
    this.layers = [];

    // Create a layer for floors
    this.layers.push(new Layer({ id: LYR_FLOORS, W: this.width, H: this.height, N: -1, T: Floor }));
    this.layers[LYR_FLOORS].generate();
    this.floors = this.layers[LYR_FLOORS].things;

    // Create a layer for walls
    this.layers.push(new Layer({ id: LYR_WALLS, W: this.width, H: this.height, N: -1, P: 0.15, T: Wall, B: 1 }));
    this.layers[LYR_WALLS].generate();
    this.walls = this.layers[LYR_WALLS].things;

    // Create a layer for doors
    this.layers.push(new Layer({ id: LYR_DOORS, W: this.width, H: this.height, N: this.numDoors, T: Door }));
    this.layers[LYR_DOORS].generate(this.layers[LYR_WALLS].map);
    this.doors = this.layers[LYR_DOORS].things;
    this.doors.forEach(function(door) {
        door.dest = 4242 + prng.getInt(1000, 1);
    });

    // Create a layer of pickups
    this.layers.push(new Layer({ id: LYR_PICKUPS, W: this.width, H: this.height, N: this.numPickups, T: Pickup }));
    this.layers[LYR_PICKUPS].generate(this.layers[LYR_WALLS].map);
    this.pickups = this.layers[LYR_PICKUPS].things;
    
    // Create a layer of actors
    this.layers.push(new Layer({ id: LYR_ACTORS, W: this.width, H: this.height, N: this.numActors, T: Actor }));
    this.layers[LYR_ACTORS].generate(this.layers[LYR_WALLS].map);

    this.actors = this.layers[LYR_ACTORS].things;
}

Engine.prototype.isMode = function(mode) {
    return mode === this.mode;
}

// handle inputs
Engine.prototype.handleInputs = function(e) {
    var isPlaying = engine.mode === 'game'
        isMenu = ['mainmenu', 'intro', 'inventory', 'died'].includes(engine.mode)
    ;

    switch (e.which) {
        case KEY_W:
        case KEY_Z:
        case KEY_UP:
            if (isPlaying) engine.actors[0].move(0, -1, true);
            if (isMenu) engine.selectPrevious();
            break;

        case KEY_A:
        case KEY_Q:
        case KEY_LEFT:
            if (isPlaying) engine.actors[0].move(-1, 0, true);
            if (isMenu) engine.selectPrevious();
            break;

        case KEY_S:
        case KEY_DOWN:
            if (isPlaying) engine.actors[0].move(0, 1, true);
            if (isMenu) engine.selectNext();
            break;

        case KEY_D:
        case KEY_RIGHT:
            if (isPlaying) engine.actors[0].move(1, 0, true);
            if (isMenu) engine.selectNext();
            break;

        case KEY_ENTER:
            if (isPlaying) engine.showScreen('inventory');
            if (isMenu) engine.activateSelected();
            break;

        default:
    }

    if (isPlaying) {
        engine.aiTurn();
        engine.render();
        engine.centerView();
        engine.clock();
    }
}

Engine.prototype.centerView = function() {
    // reposition stage
    if (typeof engine != 'undefined' && engine.actors.length > 1) {
        var stage = _$('#stage2d')
          , bg = _$('#bg')
          , x = -1 * (engine.actors[0].x * 15 - 150)
          , y = -1 * (engine.actors[0].y * 20 - 100)
        ;

        stage.style.top =  y + 'px';
        stage.style.left = x + 'px';
        bg.style.top =  (y-100) + 'px';
        bg.style.left = (x-150) + 'px';
    }
}


Engine.prototype.selectPrevious = function() {
    var buttons;

    this.menuSelection -= 1;

    if (this.menuSelection < 0)
        this.menuSelection = this.menu.length - 1;

    buttons = _$$('#' + engine.mode + ' button');
    buttons.forEach(function(button) { button.classList.remove('highlight'); });

    this.menu[this.menuSelection].classList.add('highlight');
}

Engine.prototype.selectNext = function() {
    var buttons;

    this.menuSelection += 1;

    if (this.menuSelection >= this.menu.length)
        this.menuSelection = 0;

    buttons = _$$('#' + engine.mode + ' button');
    buttons.forEach(function(button) { button.classList.remove('highlight'); });

    this.menu[this.menuSelection].classList.add('highlight');
}

Engine.prototype.activateSelected = function() {
    var el = this.menu[this.menuSelection]
      , fn = el && el.getAttribute('onclick')
    ;

    //FIXME: hack, trigger event specified in buttons' onclick attribute
    if (fn && typeof fn === 'string')
        eval(fn);
}

Engine.prototype.aiTurn = function() {
    // process all non-player actors
    this.actors.forEach(function(actor) {
        if ((!actor) || actor.id == 0) return;

        var d = prng.getInt(4, 1) - 1;

        if (d == 0) actor.move(0, -1);
        if (d == 1) actor.move(-1, 0);
        if (d == 2) actor.move(0, 1);
        if (d == 3) actor.move(1, 0);
    });
}

// combine layers (raw render)
Engine.prototype.mergeLayers = function() {
    var buf = ''
      , ch
      , wall
      , w = this.width
      , h = this.height
      , floors = this.layers[LYR_FLOORS].map
      , walls = this.layers[LYR_WALLS].map
      , doors = this.layers[LYR_DOORS].map
      , pickups = this.layers[LYR_PICKUPS].map
      , actors = this.layers[LYR_ACTORS].map
    ;

    for (var y=0; y<h; y++) {
        for (var x=0; x<w; x++) {
            ch = '';
            wall = walls[y][x] === '#';

            if (wall) {
                ch = walls[y][x];

            } else {
                if (doors[y][x] != ' ') {
                    ch = doors[y][x]

                } else if (pickups[y][x] != ' ') {
                    ch = pickups[y][x];

                } else if (actors[y][x] != ' ') {
                    ch = actors[y][x];

                } else {
                    ch = floors[y][x];
                }
            }

            buf += ch;
        }
        buf += "\n";
    }

    return (this.renderMode === '2d') ? [ this.layers[LYR_FLOORS].render(), buf ] : buf;
}

// post-processing and final render
Engine.prototype.render = function() {
    var floors
      , buf
    ;

    if (this.renderMode === '2d') {
        var mergeParts = this.mergeLayers();
        floors = mergeParts[0];
        buf = mergeParts[1];

        if (_$('#B0_0')) {
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    //_$('#B' + y + '_' + x).className = "SP grass";
                    window['B'+y+'_'+x].className = 'SP grass';
                }
            }
        }

    } else {
        buf = this.mergeLayers();
    }

    stage.innerText = buf;

    if (! _$('#C0_0')) return buf;

    var lines = buf.split(/\n/)
      , classes = { '.':'GR', '#':'TR', '@':'PL', 'a':'AC', 'p':'GO', 'd':'ST' }
    ;

    for (var y=0; y<this.height; y++) {
        var line = lines[y]
          , columns = line.split('')
        ;

        for (var x=0; x<this.width; x++) {
            var ch = columns[x];
            _$('#C'+y+'_'+x).className = 'SP ' + classes[ch];
        }
    }

    return buf;
}

Engine.prototype.hideScreens = function() {
    var screens = _$$('.screen');
    screens.forEach(function(screen) {
        screen.style.display = 'none';
    });
}

Engine.prototype.showScreen = function (screen) {
    this.hideScreens();
    _$('#' + screen).style.display = 'block';
    this.mode = screen;

    this.menu = _$$('#' + screen + ' button');
    this.menuSelection = 0;

    if (screen !== 'game')
        this.menu[this.menuSelection].classList.add('highlight');
}

Engine.prototype.shuffleDeck = function(deck) {
    var numShuffles = Math.floor(Math.random() * 5) + 5
      , tmp = []
    ;

    for (var i = 0; i < numShuffles; i++) {
        while (this.cardDecks[deck].length > 0) {
            var idx = Math.floor(Math.random() * this.cardDecks[deck].length);
            tmp.push( this.cardDecks[deck].splice(idx, 1)[0] );
        }
    }

    this.cardDecks[deck] = tmp;
}

Engine.prototype.drawCard = function(deck) {
    var card = this.cardDecks[deck].shift()
      , discards = this.getDiscards(deck)
    ;

    card.play();
    card.discard();
    this.cardDecks[discards].push(card);

    // re-shuffle discards if there are no more cards in the deck
    if (this.cardDecks[deck].length < 1) {
        while (this.cardDecks[discards].length > 0) {
            this.cardDecks[deck].push( this.cardDecks[discards].pop() );
        }
    }
}

Engine.prototype.getDiscards = function(deck) {
    var discards = false;

    switch (deck) {
        case DECK_EVENTS:
            discards = DECK_EVENTS_DISCARDS;
            break;

        default:
            console.warn('WARN: Deck %s not found');
    }

    return discards;
}

Engine.prototype.dayNightCycle = function(state) {
    if (!state) // toggle if desired state not specified
        state = (this.time < 36 || this.time > 108) ? 'night' : 'day';

    if (state == 'night') {
        this.time = 36; // 6pm
        this.lightFlicker();

    } else {
        this.time = 108; // 6am
    }
}

Engine.prototype.lightFlicker = function() {
    clearTimeout(engine.clkFlicker);

    if (! engine.effects) return;
    if (engine.player.has('lantern') < 0) return; // NEW

    var v = Math.floor(Math.random() * 128)
      , s = 1.25 + (v/128) * 0.25
      , next = Math.floor(Math.random() * 200) + 50
    ;

    if (s > 1.5) s = 1.5; // clamp scale
    _$('#lightmask').style.transform = 'scale(' + s + ')';

    if (engine.effects) 
        light.style.backgroundColor = 'rgba(' + v + ', ' + v + ', 0, 0.5)';

    engine.clkFlicker = setTimeout(engine.lightFlicker, next);
}

Engine.prototype.lightning = function() {
    if (!engine.effects)
        return;

    engine.lightFlicker();

    if (engine.time < 36 || engine.time >= 108) {
        setTimeout(function() {
            clearTimeout(engine.clkFlicker);
            _$('#light').style.backgroundColor = 'rgba(64,64,0,0.5)';
        }, 1000);
    }
}

Engine.prototype.clock = function() {
    var time = this.time += 1
      , r, g, b
    ;

    if (time > 144)
        time = 0;
/*
    if (time == 0) {
        //console.warn('noon');
    }
*/

    if (time == 36) {
        //console.warn('6pm');
        engine.log("It's going to get dark soon");
    }

/*
    if (time == 72) {
        //console.warn('midnight');
    }
*/
    if (time == 108) {
        //console.warn('6am');
        clearTimeout(engine.clkFlicker);
        engine.days += 1;
        engine.player.updateGameUI();
        engine.log("It's morning");
    }

    // darken at dusk, lighten at dawn
    if (time > 60 && time <= 72)
        _$('lightmask').style.opacity = 1 - (72-time)/12;    // darken

    else if (time > 96 && time < 108)
        _$('lightmask').style.opacity = ((108-time)/12); // lighten

    else if (time >= 108)
        _$('lightmask').style.opacity = 0;

    // light color
    if (time > 36 && time <= 108) {
        var diff = (time < 72) ? 72-time : time-108
        r = 64+diff;
    } else {
        r = 128;
    }

    if (time < 36 || time >= 108) {
        var diff = (time < 36) ? 36-time : time-108;
        g = 64+(diff*2);
    } else {
        g = 0;
    }

    if (time > 36 && time < 108) {
        var diff = (time < 72) ? 72-time : time-108;
        b = 128 - diff * 2;
    } else {
        b = 0;
    }

    _$('#light').style.backgroundColor = 'rgba('+r+','+g+','+b+',0.5)';

    this.time = time;
}

Engine.prototype.log = function(m) {
    M.value += m + "\n";
    M.scrollTop = M.scrollHeight;
}
