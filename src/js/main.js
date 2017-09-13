function startNewGame(hasStarted) {
    setSeed(4243);

    window.engine = new Engine({
        W: 50
      , H: 30
      , D: 1
      , A: 10
      , P: 3
      , seed: 4242 // FIXME: DEPRECATE
      , hasStarted: hasStarted
    });

    engine.render();
    engine.clock();
    engine.centerView();

    if (!!hasStarted) {
        engine.showScreen('intro');

    } else {
        setTimeout(function() {
            engine.showScreen('mainmenu');
        }, 3000);
    }
}

window.addEventListener('load', function() {
    _$('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    _$('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    _$('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    _$('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    startNewGame(false);
});
