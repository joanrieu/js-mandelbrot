var view = {
    //center: [ -.745, .1 ],
    center: [ -.5, 0 ],
    block: Math.max(screen.width, screen.height) / 3 | 0,
    //zoom: 50,
    zoom: .3,
    iterations: 50,
    samples: 2
};

var color = (function() {
    function color(i) {
        i = 2 * Math.PI * Math.pow(i / view.iterations, .15);
        function d(a) {
            x0 = Math.cos(i);
            y0 = Math.sin(i);
            x1 = Math.cos(a);
            y1 = Math.sin(a);
            return ((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) / 4;
        }
        var r = d(0),
            g = d(2 * Math.PI / 3, 0),
            b = d(-2 * Math.PI / 3);
        return "rgb(" + (r * 255 | 0) + ", " + (g * 255 | 0) + ", " + (b * 255 | 0) + ")";
    }
    var cache = [];
    return function(i) {
        if (cache[i])
            return cache[i];
        return cache[i] = color(i);
    };
})();

function computePixel(x0, x1, d0, d1) {
    var zm0 = x0 + d0 / 2 | 0, zm1 = x1 + d1 / 2 | 0;
    var z00 = view.center[0] + (x0 - view.ctx.canvas.width / 2) / view.ctx.canvas.width / view.zoom,
        z01 = view.center[1] + (view.ctx.canvas.height / 2 - x1) / view.ctx.canvas.height / view.zoom / view.ratio;
    var zp0 = 0, zp1 = 0;
    for (var i = 0; i < view.iterations && zp0 * zp0 + zp1 * zp1 < 2 * 2; ++i) {
        var zn0 = z00 + zp0 * zp0 - zp1 * zp1,
            zn1 = z01 + 2 * zp0 * zp1;
        zp0 = zn0;
        zp1 = zn1;
    }
    view.ctx.fillStyle = i < view.iterations ? color(i) : "black";
    view.ctx.fillRect(x0, x1, d0, d1);
}

function computeBlock(x0, x1, samples) {
    for (var j = 0; j < view.block * samples; ++j)
        for (var i = 0; i < view.block * samples; ++i)
            computePixel(x0 + i / samples, x1 + j / samples, 1 / samples, 1 / samples);
}

function computeBlocks(x00, x01, x10, x11, samples) {
    if (samples) {
        for (var x1 = x01; x1 < x11; x1 += view.block)
            for (var x0 = x00; x0 < x10; x0 += view.block)
                setTimeout(computeBlock.bind(this, x0, x1, samples));
    } else {
        setTimeout(computeBlocks.bind(this, x00, x01, x10, x11, view.samples / 10));
        setTimeout(computeBlocks.bind(this, x00, x01, x10, x11, view.samples));
    }
}

function init() {
    document.body.style.background = "#222";
    document.body.style.textAlign = "center";
    document.body.style.margin = document.body.style.padding = "0";
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    view.ctx = canvas.getContext("2d");
}

function render() {
    view.ctx.canvas.width = document.body.clientWidth;
    view.ctx.canvas.height = document.body.clientHeight;
    view.ratio = view.ctx.canvas.width / view.ctx.canvas.height;
    computeBlocks(0, 0, view.ctx.canvas.width, view.ctx.canvas.height);
}

init();
window.addEventListener("resize", render.bind(this, view));
render();

/*
var i;
var d = 32;
while (d >= 1) {
    var line = "----------------".split("");
    i = d / 2;
    for (i = i % line.length; i < line.length; i += d)
        line[i] = "#";
    d /= 2;
    console.log(line.join(""));
}

#--- ---- ---- ----
---- ---- #--- ----
---- #--- ---- #---
--#- --#- --#- --#-
-#-# -#-# -#-# -#-#
*/
