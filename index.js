// Audio
var ctx = new AudioContext();
var audio = document.querySelector("#track");
var audioSrc = ctx.createMediaElementSource(audio);
var analyser = ctx.createAnalyser();

audioSrc.connect(analyser);
audioSrc.connect(ctx.destination);
var fqData = new Uint8Array(analyser.frequencyBinCount);

var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Scene
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x503b66, 0.002);
scene.background = new THREE.Color(0x503b66);

// Camera and renderer
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
var renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMapEnabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.toneMapping = THREE.ReinhardToneMapping;   
// renderer.shadowMap.renderSingleSided = false;

document.body.appendChild(renderer.domElement);

camera.position.x = 1025;
camera.position.y = 250;
camera.position.z = 1025;

// Lights
var ambientLight = new THREE.AmbientLight(0x555555);
ambientLight.intensity = 12;
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 60);
directionalLight.position.set(1, 110, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.neat = 0.5;
directionalLight.shadow.camera.far = 1000;
scene.add(directionalLight);

// Mesh
var groundGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 32, 32);
var groundMaterial = new THREE.MeshStandardMaterial({color: 0x30424d});
var ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.rotation.x = - Math.PI / 2;
scene.add(ground);

var cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xF9F9F9});
var cubes = [];

for (let i = 0; i < 500; i++) {
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.x = Math.random() * 2500;
    cube.position.y = 0;
    cube.position.z = Math.random() * 2000;
    cube.scale.x = 7;
    cube.scale.y = Math.random() * 30 + 30;
    cube.scale.z = 7;
    // cube.rotation.y = Math.random() * Math.PI * 2;
    cube.updateMatrix();
    // cube.matrixAutoUpdate = false;
    cubes.push(cube);
    scene.add(cube);
}


// Animate
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    analyser.getByteFrequencyData(fqData);  

    cubes.forEach((cube) => {
        for (let fq = 0; fq < 256; fq++) {
            cube.scale.y = 1 + fqData[fq] * 0.5;
            cube.material.color = new THREE.Color(0xF9F9F9 + fqData[0] * 0xFF3300 * 0.05);
            camera.position.z = 1025 + fqData[fq] * 0.9;
        }
        
    });

    camera.rotation.y += -(mouseX) * 0.001 / 600;

}

render();

function onMouseMove(e) {
    mouseX = (e.clientX - windowHalfX) * 10;
    mouseY = (e.clientY - windowHalfY) * 10;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', onWindowResize, false);
