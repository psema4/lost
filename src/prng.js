window.setSeed = function(s) {
    window.prng = new MSWS();
    window.seed = s;
    prng.setSeed(s);
}

setSeed(4242);
