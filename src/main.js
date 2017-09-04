window.addEventListener('load', function() {
    window.engine = new Engine({
        W: 20
      , H: 20
      , A: 10
      , P: 3
      , debug: false
      , seed: 4242
    });

    console.log(engine.render());
});
