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

    if (typeof opts.debug != 'undefined') DEBUG = opts.debug;
    window.addEventListener('keydown', this.handleInputs);
    this.setSeed(seed);

    // setup stage2d
    if (!opts.hasStarted) {
        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                sprite = document.createElement('span');
                sprite.id = 'B' + y + '_' + x;
                sprite.className = 'sprite';

                sprite.style.top = y * 20 + 'px';
                sprite.style.left = x * 15 + 'px';

                _$('#stage2d').appendChild(sprite);
            }
        }

        for (var y=0; y<this.height; y++) {
            for (var x=0; x<this.width; x++) {
                sprite = document.createElement('span');
                sprite.id = 'C' + y + '_' + x;
                sprite.className = 'sprite';

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

Engine.prototype.teardown = function() {
    // stub: remove event listeners from layers and things here
    this.layers = [];
    this.floors = [];
    this.walls = [];
    this.doors = [];
    this.pickups = [];
    this.actors = [];
}

Engine.prototype.generateLayers = function() {
    if (this.layers.length > 0) {
        this.teardown();
    }

    // Create a layer for floors
    this.layers.push(new Layer({ id: LYR_FLOORS, W: this.width, H: this.height, N: -1, T: Floor }));
    this.layers[LYR_FLOORS].generate();
    this.floors = this.layers[LYR_FLOORS].things;

    // Create a layer for walls
    this.layers.push(new Layer({ id: LYR_WALLS, W: this.width, H: this.height, N: -1, P: 0.15, T: Wall, B: 5 }));
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

    if (isPlaying)
        _$('#message').innerText = '';

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

        case KEY_SPACE:
            //if (isPlaying) engine.showScreen('pause');
            break;

        case KEY_ENTER:
            if (isPlaying) engine.showScreen('inventory');
            if (isMenu) engine.activateSelected();
            break;

        default:
    }

    engine.centerView();

    if (isPlaying) {
        engine.render();
        engine.aiTurn();
    }
}

Engine.prototype.centerView = function() {
    // reposition stage
    if (typeof engine != 'undefined' && engine.actors.length > 1) {
        var stage = _$('#stage2d');
        stage.style.top =  ((engine.actors[0].y * 20 - 100) * -1) + 'px';
        stage.style.left = ((engine.actors[0].x * 15 - 150) * -1) + 'px';
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
        if (DEBUG) console.log('  actor %s move direction: %s', actor.id, d);

        if (d == 0) actor.move(0, -1);
        if (d == 1) actor.move(-1, 0);
        if (d == 2) actor.move(0, 1);
        if (d == 3) actor.move(1, 0);
    });

    this.render();
}

// combine layers (raw render)
Engine.prototype.mergeLayers = function() {
    var tmpLayer = new Layer({ W: this.width, H: this.height })
      , buf = ''
      , result
    ;

    if (DEBUG) console.groupCollapsed('mergeLayer');

    for (var y=0; y<this.height; y++) {
        for (var x=0; x<this.width; x++) {
//            tmpLayer.map[y][x] = this.layers[LYR_FLOORS].map[y][x];

            var wall = this.layers[LYR_WALLS].map[y][x] === '#';
            if (wall)
                tmpLayer.map[y][x] = this.layers[LYR_WALLS].map[y][x];

            if (DEBUG) console.log('FW: tmpLayer.map[%s][%s]: "%s"', y, x, tmpLayer.map[y][x]); 

            // cells without walls copy from other layers
            switch(tmpLayer.map[y][x]) {
                case ' ':
                case '.':
                case '~':
                    if (this.layers[LYR_DOORS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_DOORS].map[y][x];
                    if (this.layers[LYR_PICKUPS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_PICKUPS].map[y][x];
                    if (this.layers[LYR_ACTORS].map[y][x] != ' ') tmpLayer.map[y][x] = this.layers[LYR_ACTORS].map[y][x];

                    if (DEBUG) console.log('PA: tmpLayer[%s][%s]: "%s"', y, x, tmpLayer.map[y][x]); 
                    break;
            }

            buf += tmpLayer.map[y][x];
        }

        buf += "\n";
    }

    if (DEBUG) console.groupEnd();

    switch (this.renderMode) {
        case '2d':
            result = [ this.layers[LYR_FLOORS].render(), buf ];
            break;

        case 'ascii':
        case 'classic':
        case 'enhanced':
        default:
            result = buf;
    }

    return result;
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
                    _$('#B' + y + '_' + x).className = "sprite ground0";
                }
            }
        }

    } else {
        buf = this.mergeLayers();
    }

    if (DEBUG) {
        console.groupCollapsed('render');
        console.log(buf);
        console.groupEnd();
    }

    stage.innerText = buf;

    if (! _$('#C0_0')) return buf;

    var lines = buf.split(/\n/);
    for (var y=0; y<this.height; y++) {
        var line = lines[y]
          , columns = line.split('')
        ;

        for (var x=0; x<this.width; x++) {
            var column = columns[x]
              , classNames = ''
              , id = '#'
            ;

            switch(column) {
                case '.':
                    classNames = 'ground0';
                    break;

                case '#':
                    classNames = 'wall0';
                    break;

                case '@':
                    classNames = 'actor0 up frame1';
                    break;

                case 'a':
                    classNames = 'actor1 up frame1';
                    break;

                case 'p':
                    classNames = 'pickup0';
                    break;

                case 'd':
                    classNames = 'ground1';
                    break;

                default:
                    classNames = '';
            }

            id += 'C' + y + '_' + x;
            _$(id).className='sprite ' + classNames;
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
