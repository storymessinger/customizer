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
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleZ = 1;
};
var params;
var gui;
// var geometryController;
window.onload = function () {
    params = new RoseDCRParams();
    gui = new dat.GUI();
 
    gui.add(params, 'scaleX', 0.01, 2).listen();
    gui.add(params, 'scaleY', 0.01, 2).listen();
    gui.add(params, 'scaleZ', 0.01, 2).listen();
};



// *************************
// THREEJS
// *************************
let container;
let camera, scene, renderer;
let geometry = new THREE.BoxGeometry(20,20,20);
let transformControl;

let helperObjects = [];

init();
animate();


function init() {
    console.log('initiated');

    // Scene
    scene = new THREE.Scene();
    // Camera
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 250, 1000);
    scene.add(camera);


    // Light
    scene.add(new THREE.AmbientLight(0xf0f0f0));
    var light = new THREE.SpotLight(0xffffff, 1, 5);
    	light.position.set( 0, 1500, 200 );
        light.castShadow = true;
        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
        light.shadow.bias = -0.000222;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
    scene.add( light );

    // Plane Geometry
    let planeGeometry = new THREE.PlaneGeometry( 2000, 2000);
    planeGeometry.rotateX( - Math.PI / 2 );
    let planeMaterial = new THREE.ShadowMaterial( {opacity: 0.2} );
    let plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -200;
    plane.receiveShadow = true;
    scene.add( plane );


    // Helper
    var helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    // Axis
    var axis = new THREE.AxisHelper();
    axis.position.set( -500, -500, -500 );
    scene.add( axis );

    // Cube
    var Cube_geometry = new THREE.BoxGeometry( 30, 30, 30 );
    var Cube_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( Cube_geometry, Cube_material );
    scene.add( cube );

    // Renderer
    renderer = new THREE.WebGLRenderer( {antialias: false});
        // performance issue => antialias to false
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement )


   // Controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', render);
    controls.addEventListener('start', function () {
        cancelHideTransorm();
    });
    controls.addEventListener('end', function () {
        delayHideTransform();
    });
    transformControl = new THREE.TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    scene.add(transformControl);
    // Hiding transform situation is a little in a mess :()
    transformControl.addEventListener('change', function (e) {
        cancelHideTransorm();
    });
    transformControl.addEventListener('mouseDown', function (e) {
        cancelHideTransorm();
    });
    transformControl.addEventListener('mouseUp', function (e) {
        delayHideTransform();
    });
    transformControl.addEventListener('objectChange', function (e) {
        updateSplineOutline();
    });
    var dragcontrols = new THREE.DragControls(helperObjects, camera, renderer.domElement); //
    dragcontrols.enabled = false;
    dragcontrols.addEventListener('hoveron', function (event) {
        transformControl.attach(event.object);
        cancelHideTransorm();
    });
    dragcontrols.addEventListener('hoveroff', function (event) {
        delayHideTransform();
    });
    var hiding;

    function delayHideTransform() {
        cancelHideTransorm();
        hideTransform();
    }

    function hideTransform() {
        hiding = setTimeout(function () {
            transformControl.detach(transformControl.object);
        }, 2500)
    }

    function cancelHideTransorm() {
        if (hiding) clearTimeout(hiding);
    }
    


    initTet();
}


function animate() {
    requestAnimationFrame( animate );
    render();

    // stats.update();
    // transformControl.update();
}

function render() {
    // splines.uniform.mesh.visible = params.uniform;
    // splines.centripetal.mesh.visible = params.centripetal;
    // splines.chordal.mesh.visible = params.chordal;
    renderer.render( scene, camera );
}

function initTet() {
    var tetSide = 100;
    var wireframeMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'blue'
    });
    //
    let object = new THREE.Mesh(geometry, wireframeMat);

    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;
    //
    scene.add(object);
    helperObjects.push(object);
}


function addSplineObject(position) {
    var material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
    });
    var object = new THREE.Mesh(geometry, material);
    if (position) {
        object.position.copy(position);
    } else {
        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    splineHelperObjects.push(object);
    return object;
}




