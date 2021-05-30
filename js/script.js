import * as THREE from 'three';
import { Box3, Box3Helper, Group, Object3D, ObjectLoader, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// to start node http server:
// five-server . -p 8000



const loader = new GLTFLoader();

let info = document.getElementById('info');

let iiss = true;

let colors = {
    white: 0xe5dccc,
    gray: 0xccbcbc,
    pink: 0xb8a1b1,
    purple: 0x8a82a5,
    blue: 0x6e739d

};
let scene, camera, fieldOfView, aspectRatio, nearSubmarine, 
farSubmarine, HEIGHT, WIDTH, renderer, container;

let hemisphereLight, shadowLight;

let bottom;
let submarine =  new THREE.Object3D();
let submarinePropeller = new Group();
let bomb = new THREE.Object3D();
let pause = false, up = false, down = false;

let moveSpeed = 0.2;
let upperBorder = 40;
let bottomBorder = 2;

const bombArrays = new THREE.Group();
let bombSpeed = 0.04;
let mousePos = {};
let bombArrayCounter = 0;
let inter = false;
addInfo('bombArrayCounterInfo',bombArrayCounter, info);
addInfo('intersection', inter, info);
function addInfo(infoId,value, div){
    let p = document.createElement("p");
    let text = document.createTextNode(value);
    p.appendChild(text);
    p.id = infoId;
    div.appendChild(p);
}
function updateInfo(infoId, value){
    let infoP = document.getElementById(infoId);
    infoP.innerHTML = value;

}
window.addEventListener('DOMContentLoaded', init(), false); // При запуске сайта вызывается функция init

 function loadModel(pathToGLB) {
    return new Promise((resolve, reject) => {
    
     
     loader.load(pathToGLB,  data=> resolve(data), null, reject)});

}

function init() {

	createScene();
	createLights();
    debug();
	loadSubmarine();
	createBottom();
    loadBomb();
    

	loop();

    keyboardHandler();
    document.addEventListener('mousemove', MouseHandler, false);
    
}
function MouseHandler(e) {
    var tx =  -1 + (e.clientX / WIDTH) * 2;
    var ty = 1 - (e.clientY / HEIGHT) * 2;
	mousePos = {x:tx, y:ty};
}
function keyboardHandler() {
    window.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) {
            return;
        }
        
        switch (e.key) {
            case " ":
                if (pause==false) {
                    clearInterval(window.timer);
                    pause = true;
                }
                else {
                    callTimer();
                    pause =false;
                }
                break;
            case "w":
                up = true;
                //console.log( 'submarine y: ' + submarine.scene.position.y);
                
                break;
            case "s":
                down = true;
                //console.log( 'submarine x: ' + submarine.scene.position.y);
                break;
            }
            
        
    },
    window.addEventListener('keyup', (e) => {
        switch (e.key) {
        case"w":
            up = false;

            break;
        case "s":
            down = false;
            break;
        }
    }));
}
function createScene() {
    

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();


	scene.fog = new THREE.Fog(0x1d2591, 50, 300);
	
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearSubmarine = 1;
	farSubmarine = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearSubmarine,
		farSubmarine
		);
	
	camera.position.x = 0;
	camera.position.z = 50;
	camera.position.y = 25;
	
	renderer = new THREE.WebGLRenderer({ 
		
		alpha: true, 
		antialias: true 
	});

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	const controls = new OrbitControls( camera, renderer.domElement );
    const loader = new ObjectLoader();
	container = document.querySelector(".sea");
    container.appendChild(renderer.domElement);
    
	
	window.addEventListener('resize', WindowResize, false);
    // Если окно изменится - обновить контент
}
function debug(){
    const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );
}
function WindowResize() {
    HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
    
}




function createLights(){
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 1024;
	shadowLight.shadow.mapSize.height = 1024;

    scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

  function Bottom(){
   let geometry = new THREE.CylinderGeometry(100,100,200,40,10);
   geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

   

   let material = new THREE.MeshPhongMaterial({
    color: colors.blue,
    transparent:true,
    opacity:.6,
    shading:THREE.FlatShading,
});

this.mesh = new THREE.Mesh(geometry, material);
this.mesh.receiveShadow = true;

}


function createBottom(){
    bottom = new Bottom();
    bottom.mesh.position.y = -100;
    bottom.receiveShadow = true;
    scene.add(bottom.mesh);
}

function loop(){
    
    
    if(pause == false){
        bottom.mesh.rotation.z += .003;  
        bombUpdate(); 
        submarineUpdate();   
        
        scene.traverse(function(child) {
            if (child.name === "bombBoxHelper") {
                let bombBox = new Box3().setFromObject(child.parent);
                let subBox = new Box3().setFromObject(submarine.scene);
                let vec1 = new Vector3();
                let vec2 = new Vector3();
                submarine.scene.getWorldPosition(vec1);
                child.getWorldPosition(vec2);

                subBox.min.x += vec1.x;
                subBox.min.y += vec1.y;
                subBox.min.z += vec1.z;

                subBox.max.x += vec1.x;
                subBox.max.y += vec1.y;
                subBox.max.z += vec1.z;
                bombBox.min.x += vec2.x;
                bombBox.min.y += vec2.y;
                bombBox.min.z += vec2.z;

                bombBox.max.x += vec2.x;
                bombBox.max.y += vec2.y;
                bombBox.max.z += vec2.z;

                inter = subBox.intersectsBox(bombBox);
                if (inter ==true) {
                    
                    setTimeout(() => {
                        console.log('intersect');
                    }, 10);
                }
                updateInfo('intersection', inter);
                /*if (iiss == true) {
                    //console.log(child.parent.position);
                    //.log(submarine.scene.position);
                    console.log('subbox');
                    console.log(subBox);
                    console.log('bombBox');
                    console.log(bombBox);
                    
                    iiss =false;
                    setTimeout(() => {
                        iiss =true;
                    }, 1000);
                }*/
                
            }
          });

    }
    else{
        
        
        
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}



function bombUpdate(){
    for (let i = 0; i < bombArrayCounter; i++) {
        let array = bombArrays.getObjectByName('bombArray' + i)
        for (let i = 0; i < array.children.length; i++) {
            
            let bomb = array.children[i];
            
        }    
        
            array.translateX(-bombSpeed);
            
            
        
        if (array.position.x<-150) {
            array.position.setX(100);
        }
        
    }
    
    updateInfo('bombArrayCounterInfo','Bomb Arrays: '+bombArrayCounter);
    
    
    
}
function submarineUpdate(){
    if (up == true && submarine.scene.position.y < upperBorder) {
        submarine.scene.translateY( moveSpeed); 
        
    }
    if (down ==true && submarine.scene.position.y > bottomBorder) {
        submarine.scene.translateY( -moveSpeed);
    }
    submarinePropeller.rotateX(0.08);  
}
function check() {
}
async function loadSubmarine(){
    //console.log('creating submarine');
    submarine = await loadModel('./obj/Submarine.glb');
    
    for (let i = 5; i < 10; i++) {
        let propellerPart =submarine.scene.children[7];
        submarinePropeller.add(propellerPart);
    }
    
    
    console.log(submarinePropeller);
    submarine.scene.add(submarinePropeller);
    submarine.name = 'submarine';
    submarine.scene.castShadow = true;
    scene.add( submarine.scene);
    console.log(submarine);
    
    let boxHelper = new THREE.BoxHelper( submarine.scene, 0xff0000 );
        boxHelper.name = 'subBox';
        submarine.scene.add(boxHelper);
    
}

async function loadBomb(){
    //console.log('creating bombs');
    bomb = await loadModel('./obj/Bomb.gltf');
    
    createBombs();
    callTimer();
    
    
   
    scene.add(bombArrays);
}
function callTimer(){
    window.timer = setInterval(() =>createBombs(), 5000);
}
function createBombs(){
    
    let amount = Math.floor( Math.random()*10)+2;
    let bombArray = new Group();
    bombArray.name = 'bombArray' + bombArrayCounter;
    for (let i = 0; i < amount; i++) {
        
        let obj = new Object3D();
        obj.copy(bomb.scene, true);
        
        let boxHelper = new THREE.BoxHelper( obj, 0xffff00 );
        boxHelper.name = 'bombBoxHelper';
        obj.add(boxHelper);

        
        
        bombArray.add(obj);
        obj.name = 'bomb' + i;
        let randPosition = Math.floor( Math.random()*5*amount);
        let randPosition2 = ( Math.random()*5)-10;
        let randPosition3 = ( Math.random()*5)-2.5;
        obj.position.set(randPosition2+100, randPosition, randPosition3);
        
        
    }
    
    bombArrays.add(bombArray);
    //console.log(bombArrays);
    bombArrayCounter++;
    
}


    
