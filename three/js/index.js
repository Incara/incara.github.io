var arToolkitSource, arToolkitContext, smoothedControls;
var markerRoot;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({
    antialias : true
});
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);

initialize();
animate();
requestAnimationFrame(render);

function initialize() {
    scene.add(camera);
    scene.add(ambientLight);

    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);

    renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType : 'webcam',
        displayWidth: width,
        displayHeight: height
    });

    arToolkitSource.init(function onReady(){
        onResize();
    });

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

    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type : 'pattern',
        patternUrl : "/resources/patterns/fin.patt",
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

function render() {
    resizeUpdate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function resizeUpdate() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width !== canvas.width || height !== canvas.height) {
        renderer.setSize(width, height, false);
    }
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth/canvas.clientHeight;
}

function update() {
    if(arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
    }
    smoothedControls.update(markerRoot);
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