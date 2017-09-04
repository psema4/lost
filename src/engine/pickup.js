STATE_NORMAL = 0

function Pickup(opts) {
    opts = opts || {};

    var name = opts.name || 'PICKUP'
      , glyph = 'p'
      , layer = opts.layer || 0
      , id = opts.id || 0
      , x = opts.x || 0
      , y = opts.y || 0
      , state = opts.state || STATE_NORMAL
    ;

    return {
        name: name
      , glyph: glyph
      , layer: layer
      , id: id
      , x: x
      , y: y
      , state: state
    }
}
