/*
	Prototype_V01-01
	Seth Moczydlowski
	June 4, 2014
	http://www.moczys.com
	
 */

// MAIN

// standard global variables
var container, scene, camera, renderer, controls;
var keyboard = new KeyboardState();

// custom global variables
var targetList = [];
var projector, mouse = {
        x: 0,
        y: 0
    },
    INTERSECTED;
var floorSide = 1000;
var baseColor = new THREE.Color(0xf2f1ed);
var highlightedColor = new THREE.Color(0x5d9cd4);
var selectedColor = new THREE.Color(0x4466dd);
var wireframeMat = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 'blue'
});

var mouseSphereCoords = null;
var mouseSphere = [];

var tetSide = 100;
var position = [0, 0, 100];

init();
animate();

// FUNCTIONS 		
function init() {
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 250, 950);
    camera.lookAt(scene.position);






    // RENDERER
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    else
        renderer = new THREE.CanvasRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);
    // EVENTS
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({
        charCode: 'm'.charCodeAt(0)
    });
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // LIGHT
    var light = new THREE.AmbientLight(0x333333); // soft white light
    scene.add(light);
    var light = new THREE.PointLight(0xffffff, 1, 4500);
    light.position.set(-300, 1000, -300);
    scene.add(light);
    // FLOOR
    var faceMat = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
    });
    var wireMat = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        wireframe: true,
        transparent: true
    });
    var multiMat = [faceMat, wireMat];

    var floor = THREE.SceneUtils.createMultiMaterialObject(new THREE.PlaneGeometry(floorSide, floorSide, 10, 10), multiMat);

    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // ENVIRONMENT
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({
        color: 0xdddddd,
        side: THREE.BackSide
    });
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    ////////////
    // CUSTOM //
    ////////////

    initTet();
    //colorMesh();
    var newSphereGeom = new THREE.SphereGeometry(5, 5, 5);
    var sphere = new THREE.Mesh(newSphereGeom, new THREE.MeshBasicMaterial({
        color: 0x2266dd
    }));
    scene.add(sphere);
    mouseSphere.push(sphere);

    //////////////////////////////////////////////////////////////////////

    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();

    // when the mouse moves, call the given function
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function initTet() { //creates initial starting geometry
    var tetGeom = new THREE.TetrahedronGeometry(tetSide, 0);
    tetSide = tetGeom.vertices[0].distanceTo(tetGeom.vertices[1]);
    var tet = new THREE.Mesh(tetGeom, wireframeMat);

    // rotate mesh into upright position
    tet.position.set(position[0], position[2], position[1]);
    tet.rotation.y = Math.PI / 4;
    tet.rotation.x = Math.PI + (Math.PI - Math.acos(1 / 3)) / 2;

    // add mesh to scene and targetList for selection
    scene.add(tet);
    targetList.push(tet);
}

function onDocumentMouseMove(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    //event.preventDefault();

    // update the mouse variable
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


function onDocumentMouseDown(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    //console.log("Click.");

    // update the mouse variable
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    checkSelection();

}

function addGrowth(faceNum, meshGeom) {
    // copies vertices & faces of meshGeom
    var newGeom = new THREE.Geometry();
    meshGeom.object.geometry.vertices.forEach(function (arrayItem) {
        newGeom.vertices.push(arrayItem.clone());
    });
    meshGeom.object.geometry.faces.forEach(function (arrayItem) {
        newGeom.faces.push(new THREE.Face3(arrayItem.a, arrayItem.b, arrayItem.c));
    });

    // records vertex numbers of the selected face
    var vertNums = [];
    vertNums[0] = meshGeom.object.geometry.faces[faceNum].a;
    vertNums[1] = meshGeom.object.geometry.faces[faceNum].b;
    vertNums[2] = meshGeom.object.geometry.faces[faceNum].c;

    //creates new vertex from centroid
    var newPt = meshGeom.object.geometry.faces[faceNum].centroid.clone();
    var addVec = meshGeom.object.geometry.faces[faceNum].normal.clone();
    //moves new vertex to calculated location (height of tetrahedron) by scalar multiplication
    addVec.multiplyScalar(tetSide * Math.sqrt(6) / 3)
    newPt.add(addVec);
    //add new point
    newGeom.vertices.push(newPt);

    var newPtNum = newGeom.vertices.length - 1
    //modify existing face to include new point
    newGeom.faces[faceNum].c = newPtNum;
    // add two new faces to complete geometry
    newGeom.faces.push(new THREE.Face3(vertNums[1], vertNums[2], newPtNum));
    newGeom.faces.push(new THREE.Face3(vertNums[2], vertNums[0], newPtNum));
    // compute geometry parameters
    newGeom.computeCentroids();
    newGeom.computeFaceNormals();
    newGeom.computeVertexNormals();
    newGeom.verticesNeedUpdate = true;
    newGeom.normalsNeedUpdate = true;

    // add & position new geometry
    var object = new THREE.Mesh(newGeom, wireframeMat);
    object.position.set(position[0], position[2], position[1]);
    object.rotation.y = Math.PI / 4;
    object.rotation.x = Math.PI + (Math.PI - Math.acos(1 / 3)) / 2;
    //remove old geometry
    scene.remove(targetList[0]);
    targetList.shift();
    // add new geometry
    scene.add(object);
    targetList.push(object);

}

function checkSelection() {
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(targetList);

    //if an intersection is detected
    if (intersects.length > 0) {
        console.log("Hit @ " + toString(intersects[0].point));
        // actions for face
        addGrowth(intersects[0].faceIndex, intersects[0]);

    }
}

function checkHighlight() {
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(targetList);

    // INTERSECTED = the object in the scene currently closest to the camera 
    //		and intersected by the Ray projected from the mouse position 	

    // if there is one (or more) intersections
    if (intersects.length > 0) { // case if mouse is not currently over an object
        if (INTERSECTED == null) {
            INTERSECTED = intersects[0];
        } else { // if the mouse is over an object

            INTERSECTED = intersects[0];
        }
        // update mouseSphere coordinates
        mouseSphereCoords = [INTERSECTED.point.x, INTERSECTED.point.y, INTERSECTED.point.z];

    } else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED) {


        }
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"

        INTERSECTED = null;
        mouseSphereCoords = null;
    }
}

function CheckMouseSphere() {
    // if the coordinates exist, make the sphere visible
    if (mouseSphereCoords != null) {
        //console.log(mouseSphereCoords[0].toString()+","+mouseSphereCoords[1].toString()+","+mouseSphereCoords[2].toString());
        mouseSphere[0].position.set(mouseSphereCoords[0], mouseSphereCoords[1], mouseSphereCoords[2]);
        mouseSphere[0].visible = true;
    } else { // otherwise hide the sphere
        mouseSphere[0].visible = false;
    }
}

function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
}


function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    checkHighlight();
    CheckMouseSphere();
    keyboard.update();

    controls.update();
}

function render() {
    renderer.render(scene, camera);
}
