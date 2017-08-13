camera = {
    rotX: 90
  , rotY: 0
};

window.addEventListener('load', function() {
    console.log('load');
    createSkybox();
});

function createSkybox() {
    var divs = [];
    for (var i=0; i < 6; i++) {
        var div = document.createElement('div');
        div.id = 'sb' + i;
        div.innerHTML = i + '';
        scene.appendChild(div);
        divs.push(div);
    }
}

function rotCamY(deg) {
    camera.rotY = deg;
    cam_rotY.innerHTML = deg + '&deg;';
    updateCamera();
}

function rotCamX(deg) {
    camera.rotX = deg;
    cam_rotX.innerHTML = deg + '&deg;';
    updateCamera();
}

function updateCamera() {
    var c = camera;
    //FIXME: check uglifyjs version, throws error on template strings?
    //scene.style.transform = `translateZ(400px) rotateY(${c.rotY}deg) translateX(-2000px) rotateX(${c.rotX}deg) translateY(-2000px) translateZ(-32px)`;
    scene.style.transform = 'translateZ(400px) rotateY(' + c.rotY + 'deg) translateX(-2000px) rotateX(' + c.rotX + 'deg) translateY(-2000px) translateZ(-32px)';
}
