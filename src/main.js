function _$(sel) { return document.querySelector(sel); }

function startNewGame(hasStarted) {
    window.engine = new Engine({
        W: 20
      , H: 10
      , D: 1
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
    });


    _$('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    _$('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    _$('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    _$('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    engine.render();


    if (!!hasStarted) {
        engine.showScreen('intro');

    } else {
        setTimeout(function() {
            engine.showScreen('mainmenu');
        }, 3000);
    }
}
window.addEventListener('load', function() { startNewGame(false); });
