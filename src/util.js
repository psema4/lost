DEBUG = true;

LYR_FLOORS = 0;
LYR_WALLS = 1;
LYR_DOORS = 2;
LYR_PICKUPS = 3;
LYR_ACTORS = 4;

// alias Z to W, Q to A for AZERTY keyboards; see http://xem.github.io/articles/#jsgamesinputs
KEY_W = 87; KEY_Z = 90; KEY_UP = 38;
KEY_A = 65; KEY_Q = 81; KEY_LEFT = 37;
KEY_S = 83; KEY_DOWN = 40;
KEY_D = 68; KEY_RIGHT =  39;
KEY_SPACE = 32;
KEY_ENTER = 13;

function _$(sel) { return document.querySelector(sel); }
function _$$(sel) { return document.querySelectorAll(sel); }
