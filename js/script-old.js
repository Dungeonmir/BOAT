// Each import is mapped automatically to the CDNs specified above,
// while using the same 'three' namespace as a bundled application.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';





// Core.
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement ); // Insert renderer in html document

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

console.log( 'Working fine✅' );

let bombs = {};


let geometry1 = new THREE.BoxGeometry(10, 1, 10);
const material1 = new THREE.MeshBasicMaterial( { color: 0xC0C0C0 } );
const ground = new THREE.Mesh( geometry1, material1 );
ground.position.x = 0;
ground.position.y = 0;
ground.position.z = -1;
scene.add( ground );


const submarine = new THREE.BoxGeometry(5, 1, 1);

const geometry = new THREE.BoxGeometry(1, 2, 1);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff11 } );
const cube = new THREE.Mesh( geometry, material );
cube.position.x = 3;
cube.position.y = 2;
scene.add( cube );


createLights();


camera.position.x = 0;
camera.position.z = 50;
camera.position.y = 25;

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );
window.addEventListener('resize', handleWindowResize, false);

function animate() {
  cube.rotation.y +=0.001;

  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
animate();

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function createLights(){
  let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
  let shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;

  shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

  shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
	scene.add(shadowLight);
}
