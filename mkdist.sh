#!/usr/bin/env bash

echo "copying files"
cp src/index.min.html dist/index.html
cp src/assets/lost.png dist/assets/lost.png
cp src/sprites.css dist/sprites.css #FIXME: minify css
cp src/game.css dist/game.css #FIXME: minify css
cat src/msws.js                 \
    src/prng.js                 \
    src/util.js                 \
    src/engine/things/floor.js  \
    src/engine/things/wall.js   \
    src/engine/things/door.js   \
    src/engine/things/pickup.js \
    src/engine/things/actor.js  \
    src/engine/cards/card.js    \
    src/engine/cards/events.js  \
    src/engine/layer.js         \
    src/engine/player.js        \
    src/engine/engine.js        \
    src/main.js > src/game.js

echo "minifying and compressing"
echo "WARN: skipping css"
uglifyjs src/game.js -cm > dist/game.min.js

echo "building package"
zip -r ~pkg dist
ls -lh ~pkg.zip

if [ "$1" == "--serve" ] || [ "$1" == "--server" ]; then
    echo "starting development server"
    cd dist
    http-server
    cd ..
fi
