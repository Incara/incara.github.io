var scene;
var arToolkitSource, arToolkitContext, smoothedControls;
var markerRoot1;

const canvas = document.querySelector("#canvas");
const width = canvas.clientWidth;
const height = canvas.clientHeight;

var camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);

var renderer = new THREE.WebGLRenderer({
    antialias : true,
    alpha: true,
    canvas: canvas
});

initialize();
animate();

function initialize() {
    scene = new THREE.Scene();
    scene.add(camera);

    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam'
    });

    arToolkitSource.init(function onReady(){
        onResize();
    });
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', function(){
        onResize();
    });

    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });

    arToolkitContext.init(function onCompleted(){
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);

    new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type : 'pattern',
        patternUrl : "/resources/patterns/fin.patt"
    });

    var smoothedRoot = new THREE.Group();
    scene.add(smoothedRoot);
    smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
        lerpPosition: 0.8,
        lerpQuaternion: 0.8,
        lerpScale: 1
    });

    loadModel(smoothedRoot);
}

function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    console.log("height: " + height + " width: " + width);
    if(arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

function update(){
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
    }
    // additional code for smoothed controls
    smoothedControls.update(markerRoot1);
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    render();
}

function loadModel(smoothedRoot) {
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/resources/models/shark-fin.gltf',
        function (gltf) {
            gltf.scene.scale.set(0.01, 0.01, 0.01);
            const root = gltf.scene;
            smoothedRoot.add(root);
        },
        function (xhr) {
            console.log(( xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error occurred loading model');
        }
    );
}