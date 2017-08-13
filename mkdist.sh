#!/usr/bin/env bash

echo "copying files"
cp src/index.min.html dist/index.html
cp src/game.css dist/game.css #FIXME: minify css
cat src/main.js > src/game.js

echo "minifying and compressing"
echo "WARN: skipping css"
uglifyjs src/game.js -cm > dist/game.min.js

if [ "$1" == "--serve" ] || [ "$1" == "--server" ]; then
    echo "starting development server"
    cd dist
    http-server
    cd ..
fi
