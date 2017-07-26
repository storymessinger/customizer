{/*<script src="js/dat.gui.min.js"></script>
		<script src="js/stats.min.js"></script>
        <script src="js/three.min.js"></script>
		<script src="js/Detector.js"></script>


		<script>*/}



// *************************
// WebGL detection
// *************************

if ( ! Detector.webgl ) {
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
document.body.appendChild( stats.domElement );
stats.setMode( 0 );

// Show/hide stats
document.onkeypress = function (e) {

    e = e || window.event;

    if(e.keyCode == 115){

        if(document.getElementById("stats")){
            document.getElementById("stats").remove();
        }else{
            document.body.appendChild( stats.domElement );
            stats.setMode( 0 );
        }

    }

};

// Render on every frame
setInterval( function () {

    stats.begin();
    stats.end();

}, 1000 / 60 );




// *************************
// dat.gui
// *************************

var RoseDCRParams = function() {
    this.materialColor = "#EB1313";
    this.speedX = 1;
    this.speedY = 1;
    this.speedZ = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
    this.delay = 1;
    this.opacity = .5;
    this.reset = function(){ resetPosition(); };
    this.geometry = 'cube';
};
var params;
var gui;

var geometryController;
window.onload = function() {
    params = new RoseDCRParams();
    gui = new dat.GUI();
    gui.addColor(params, 'materialColor');
    gui.add(params, 'opacity', 0, 1);
    gui.add(params, 'speedX', -2, 2);
    gui.add(params, 'speedY', -2, 2);
    gui.add(params, 'speedZ', -2, 2);
    gui.add(params, 'delay', -2, 2);
    gui.add(params, 'reset');
    geometryController = gui.add(params, 'geometry', [ 'cube', 'plane', 'pipe' ] );
    geometryController.onFinishChange(function(value){
        changeGeometry(value);
    });
    gui.add(params, 'scaleX', 0.01, 2).listen();
    gui.add(params, 'scaleY', 0.01, 2).listen();
    gui.add(params, 'scaleZ', 0.01, 2).listen();
};




// *************************
// THREEJS
// *************************

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x000000, 0);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshLambertMaterial({color: RoseDCRParams.materialColor});
material.transparent = true;
material.opacity = .5;


// Cube generation
var maxCubes = 100;
var cube;
var cubes = [];
for (var i = 0; i < maxCubes; i++) {
    cube = new THREE.Mesh(geometry, material);
    cubes[i] = cube;
    scene.add(cube);
};

camera.position.z = 2;


// Directional lighting

var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);


// Rendering the cubes

var render = function () {

    requestAnimationFrame(render);

    if(params === undefined){
        return false;
    }

    var nuColor = params.materialColor.replace( '#','0x' );
    var endScale = new THREE.Vector3(params.scaleX, params.scaleY, params.scaleZ);

    for (var i = 0; i < maxCubes; i++) {
        cube = cubes[i];
        cube.rotation.x += params.speedX/100 + i*params.delay/10000;
        cube.rotation.y += params.speedY/100 + i*params.delay/8000;
        cube.rotation.z += params.speedZ/100 + i*params.delay/6000;

        var startScale = new THREE.Vector3(params.scaleX, params.scaleY, params.scaleZ);
        cube.scale = cube.scale.lerp(endScale, .05);

        cube.material.color.setHex( nuColor );
        cube.material.opacity = params.opacity;
    }

    renderer.render(scene, camera);
    return;

};


// Change geometry

var changeGeometry = function(value) {

    var scaleVector = new THREE.Vector3(1, 1, 1);
    switch(value){
        case 'cube':
            scaleVector.set(1, 1, 1);
            break;
        case 'plane':
            scaleVector.set(1.2, .01, 1.2);
            break;
        case 'pipe':
            scaleVector.set(1.5, .01, .01);
            break;
    }

    for (var i = 0; i < maxCubes; i++) {
        params.scaleX = scaleVector.x;
        params.scaleY = scaleVector.y;
        params.scaleZ = scaleVector.z;
    }

};


// Reset

var resetPosition = function () {

    for (var i = 0; i < maxCubes; i++) {
        cube = cubes[i];
        cube.rotation.x = 0;
        cube.rotation.y = 0;
        cube.rotation.z = 0;
    }

};


// Window resize behavior

window.onresize = function(){

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();

}

render();


// </script>
