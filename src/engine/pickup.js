STATE_NORMAL = 0

function Pickup(opts) {
    opts = opts || {};

    var prng = opts.prng || new MSWS()
      , seed = opts.seed || new Date().getTime()
      , name = opts.name || 'PICKUP'
      , glyph = 'p'
      , layer = opts.layer || 0
      , id = opts.id || 0
      , x = opts.x || 0
      , y = opts.y || 0
      , state = opts.state || STATE_NORMAL
    ;

    function getName(id) {
        var names = [ 'Potion', 'Scroll', 'Sword', 'Gold' ]
          , chance = prng.getInt(100, 1) - 1
          , selected
        ;

        if (chance < 35) {
            selected = 0;

        } else if (chance < 70) {
            selected = 1;

        } else if (chance < 90) {
            selected = 2;

        } else {
            selected = 3;
        }

        return names[selected];
    }

    return {
        name: name
      , glyph: glyph
      , layer: layer
      , id: id
      , x: x
      , y: y
      , state: state
      , getName: getName
    }
}
