# Lost

A js13k entry. http://2017.js13kgames.com

## Playing

- Browse to https://psema4.github.io/lost/
- TBD

## Building

Install node.js if you don't have it already.

Install the uglifyjs and http-server node.js packages:

`npm install uglify-js -g`
`npm install http-server -g`

To build the game, run the mkdist.sh shell command; it takes an optional --serve (or --server) argument which, if provided, will launch a `http-server` instance.  Open http://localhost:8080/ to play the game

## Credits & Attributions

This entry is heavily inspired by Maxime Euzière's CSS3D article at http://xem.github.io/articles/#css3d

The skybox starfield is inspired by https://codepen.io/iblamefish/pen/xgefG

## Todo & Known Issues

- Find a tool to minify html and css
- Uglify-js doesn't like template strings, check version
- 
