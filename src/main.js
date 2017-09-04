window.addEventListener('load', function() {
    window.engine = new Engine({
        W: 20
      , H: 10
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
    });

    // chrome 60 for android doesn't seem to like treating dom elements with id's as global vars, use querySelector
    function $(sel) { return document.querySelector(sel); }

    $('#btn_up').addEventListener('click', function() { engine.handleInputs({ which: 87 }); });
    $('#btn_lt').addEventListener('click', function() { engine.handleInputs({ which: 65 }); });
    $('#btn_dn').addEventListener('click', function() { engine.handleInputs({ which: 83 }); });
    $('#btn_rt').addEventListener('click', function() { engine.handleInputs({ which: 68 }); });

    engine.render();
});
