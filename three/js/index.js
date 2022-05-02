var scene;
var arToolkitSource, arToolkitContext, sharkFinControlsWrapper, sharkMouthControlsWrapper;
var sharkFinMarkerRoot, sharkMouthMarkerRoot;

const canvas = document.querySelector("#canvas");
const width = canvas.clientWidth;
const height = canvas.clientHeight;

var camera = new THREE.PerspectiveCamera(45, screen.width / screen.height, 0.1, 1000);

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

    sharkFinMarkerRoot = new THREE.Group();
    scene.add(sharkFinMarkerRoot);

    sharkMouthMarkerRoot = new THREE.Group();
    scene.add(sharkMouthMarkerRoot);

    new THREEx.ArMarkerControls(arToolkitContext, sharkFinMarkerRoot, {
        type : 'pattern',
        patternUrl : "/resources/patterns/fin.patt"
    });

    new THREEx.ArMarkerControls(arToolkitContext, sharkMouthMarkerRoot, {
        type : 'pattern',
        patternUrl : "/resources/patterns/mouth.patt"
    });

    var sharkFinSmoothedRoot = new THREE.Group();
    scene.add(sharkFinSmoothedRoot);
    sharkFinControlsWrapper = new THREEx.ArSmoothedControls(sharkFinSmoothedRoot, {
        lerpPosition: 0.8,
        lerpQuaternion: 0.8,
        lerpScale: 1
    });

    var sharkMouthSmoothedRoot = new THREE.Group();
    scene.add(sharkMouthSmoothedRoot);
    sharkMouthControlsWrapper = new THREEx.ArSmoothedControls(sharkMouthSmoothedRoot, {
        lerpPosition: 0.8,
        lerpQuaternion: 0.8,
        lerpScale: 1
    });

    loadModel(sharkMouthSmoothedRoot);
    loadModel(sharkFinSmoothedRoot);

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
    sharkMouthControlsWrapper.update(sharkMouthMarkerRoot);
    sharkFinControlsWrapper.update(sharkFinMarkerRoot);
    //console.log(sharkFinControlsWrapper.object3d.children);
    if(sharkFinControlsWrapper.object3d.visible) {
        //the marker has been detected and our model is visible
    }
}

function render() {
    if (resizeUpdate()) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
}

function resizeUpdate() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
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
            gltf.scene.scale.set(0.05, 0.05, 0.05);
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