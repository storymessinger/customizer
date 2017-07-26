// *************************
// WebGL detection
// @author alteredq / http://alteredqualia.com/
// @author mr.doob / http://mrdoob.com/
// *************************
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}
// *************************
// STATS
// *************************
var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
stats.setMode(0);
// Show/hide stats
document.onkeypress = function (e) {
    e = e || window.event;
    if (e.keyCode == 115) {
        if (document.getElementById("stats")) {
            document.getElementById("stats").remove();
        }
        else {
            document.body.appendChild(stats.domElement);
            stats.setMode(0);
        }
    }
};
// Render on every frame
setInterval(function () {
    stats.begin();
    stats.end();
}, 1000 / 60);
// *************************
// dat.gui
// *************************
var RoseDCRParams = function () {
    // this.materialColor = "#EB1313";
    // this.speedX = 1;
    // this.speedY = 1;
    // this.speedZ = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    // this.delay = 1;
    // this.opacity = .5;
    // this.reset = function(){ resetPosition(); };
    // this.geometry = 'cube';
};
var params;
var gui;
// var geometryController;
window.onload = function () {
    params = new RoseDCRParams();
    gui = new dat.GUI();
    // gui.addColor(params, 'materialColor');
    // gui.add(params, 'opacity', 0, 1);
    // gui.add(params, 'speedX', -2, 2);
    // gui.add(params, 'speedY', -2, 2);
    // gui.add(params, 'speedZ', -2, 2);
    // gui.add(params, 'delay', -2, 2);
    // gui.add(params, 'reset');
    // geometryController = gui.add(params, 'geometry', [ 'cube', 'plane', 'pipe' ] );
    // geometryController.onFinishChange(function(value){
    //     changeGeometry(value);
    // });
    gui.add(params, 'scaleX', 0.01, 2).listen();
    gui.add(params, 'scaleY', 0.01, 2).listen();
    gui.add(params, 'scaleZ', 0.01, 2).listen();
};
// *************************
// THREEJS
// *************************
var container;
var camera, scene, renderer;
init();
animate();
function init() {
    container = document.getElementById('container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 250, 1000);
    scene.add(camera);
    scene.add(new THREE.AmbientLight(0xf0f0f0));
    var light = new THREE.SpotLight(0xffffff, 1, 5);
}
function animate() {
    var test;
}
//# sourceMappingURL=main.js.map