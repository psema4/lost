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
        div.style.backgroundImage = getStars();
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

function getStars() {
    var c = canvas
      , ctx = c.getContext('2d')
      , x, y, r, b, colours = ['#fff', '#ffe9c4', '#d4fbff'];
    ;

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0, 1000, 1000);

    for (var i=0; i<300; i++) {
        x = Math.random() * 1000;
        y = Math.random() * 1000;
        r = Math.random() * 3;
        b = Math.round((Math.random() * 100 - 80) + 80) / 100;

        ctx.beginPath();
        ctx.globalAlpha = b;
        ctx.fillStyle = colours[Math.round(Math.random() * colours.length)];
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    }

    ctx.restore();

    return 'url(' + c.toDataURL() + ')';
}
