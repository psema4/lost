#!/usr/bin/env bash

echo "copying html files"
cp src/index.min.html dist/index.html

echo "copying asset files"
cp src/assets/lost.png dist/assets/lost.png

#FIXME: use a css minifier
echo "building and copying css files"
cat src/css/main.css    \
    src/css/sprites.css > src/css/game.css
cp src/css/game.css src/css/game.min.css
perl -pi -e's/\n/ /g' src/css/game.min.css
perl -pi -e's/\s\s\s\s/ /g' src/css/game.min.css
cp src/css/game.min.css dist/css/game.min.css

echo "building and copying js files"
cat src/js/msws.js                  \
    src/js/prng.js                  \
    src/js/util.js                  \
    src/js/engine/things/floor.js   \
    src/js/engine/things/wall.js    \
    src/js/engine/things/door.js    \
    src/js/engine/things/pickup.js  \
    src/js/engine/things/actor.js   \
    src/js/engine/cards/card.js     \
    src/js/engine/cards/events.js   \
    src/js/engine/layer.js          \
    src/js/engine/player.js         \
    src/js/engine/engine.js         \
    src/js/main.js > src/js/game.js

echo "minifying and compressing"
uglifyjs src/js/game.js -cm > dist/js/game.min.js

echo "building package"
if [ -f ~pkg.zip ]; then
    rm ~pkg.zip
fi
zip -r ~pkg dist
ls -lh ~pkg.zip

if [ "$1" == "--serve" ] || [ "$1" == "--server" ]; then
    echo "starting development server"
    cd dist
    http-server
    cd ..
fi
