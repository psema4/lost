function startNewGame(hasStarted) {
    setSeed(4242);

    window.engine = new Engine({
        W: 50
      , H: 30
      , D: 1
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
      , hasStarted: hasStarted
    });

    engine.render();
    engine.centerView();
    dayNightCycle();

    if (!!hasStarted) {
        engine.showScreen('intro');

    } else {
        setTimeout(function() {
            engine.showScreen('mainmenu');
        }, 3000);
    }
}

function dayNightCycle(state) {
    // toggle if desired state not specified
    if (!state)
        state = _$('#lightmask').style.display == 'none' ? 'night' : 'day';

    if (state == 'night') {
        _$('#lightmask').style.display = 'inline-block';
        _$('#light').style.display = 'inline-block';
        lightFlicker();

    } else {
        _$('#lightmask').style.display = 'none';
        _$('#light').style.display = 'none';
    }
}

function lightFlicker() {
    var v = Math.floor(Math.random() * 128)
      , s = 1 + (Math.random() / 2)
      , next = Math.floor(Math.random() * 65) + 15
    ;

    // clamp scale
    if (s > 1.5) s = 1.5;

    _$('#light').style.backgroundColor = 'rgba(' + v + ', ' + v + ', 0, 0.5)';
    _$('#lightmask').style.transform = 'scale(' + s + ')';

    if (_$('#light').style.display != 'none')
        setTimeout(lightFlicker, next);
}

window.addEventListener('load', function() {
    _$('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    _$('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    _$('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    _$('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    startNewGame(false);
});
