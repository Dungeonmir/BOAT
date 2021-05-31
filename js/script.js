import * as THREE from 'three';
import { Box3, Box3Helper, DirectionalLightHelper, Group, Object3D, ObjectLoader, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// to start node http server:
// five-server . -p 8000



const loader = new GLTFLoader();

let info = document.getElementById('info');
let gameOverInfo = document.getElementById('gameOver');
gameOverInfo.style.opacity = 0;
//let iiss = true;
let clock = new THREE.Clock();
let delta = 0;
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

let moveSpeed = 40;
let upperBorder = 40;
let bottomBorder = 2;
window.gameOver = false;
const bombArrays = new THREE.Group();
const backBombArrays = new THREE.Group();
let bombSpeed = 15;
let bombSpeedStart = bombSpeed;
let mousePos = {};
let bombArrayCounter = 0;
let bombStartCounter = 0;
let inter = false;
addInfo('bombSpeed', bombSpeed, info);
addInfo('time', 'Time', info);

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
                    makePause();
                    
                }
                else {
                    continueGame();
                    
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
            case "r":
                document.location.reload();
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
function continueGame(){
    if (!gameOver) {
        callTimer();
    
    }
    pause =false;
    scene.getObjectByName('subBox').visible = false;
    scene.traverse(function(child) {
        if (child.name === "bombBoxHelper") {
            child.visible = false;
        }});
    
    
}
function makePause(){
    clearInterval(window.timer);
                    scene.getObjectByName('subBox').visible = true;
                    scene.traverse(function(child) {
                        if (child.name === "bombBoxHelper") {
                            child.visible = true;
                        }});
                    pause = true;
}
function rotateObject(object, degreeX=0, degreeY=0, degreeZ=0) {
    object.rotateX(THREE.Math.degToRad(degreeX));
    object.rotateY(THREE.Math.degToRad(degreeY));
    object.rotateZ(THREE.Math.degToRad(degreeZ));
 }
function createScene() {
    

	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();


	scene.fog = new THREE.Fog(0x1d2591, 50, 110);
	
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
       
	camera.position.x = -44;
	camera.position.z = 33;
	camera.position.y =28;
    camera.rotation.x = -0.46993949433741544;
    camera.rotation.y = -1.0001786311740763;
    camera.rotation.z =  -0.40392160424921664;
	
    console.log(camera.rotation);
	renderer = new THREE.WebGLRenderer({ 
		
		alpha: true, 
		antialias: true 
	});

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
	
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
gridHelper.visible = false;
}
function WindowResize() {
    HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
    
}




function createLights(){
    
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .1);
    
    
    scene.add(hemisphereLight);  
	
    
    let light = new THREE.SpotLight(0xffa95c,1.5);
    light.position.set(-60,50,50);
    light.castShadow = true;
    light.bias = -0.004;
    scene.add( light );

    const spotLightHelper = new THREE.SpotLightHelper( light );
    scene.add( spotLightHelper );
    spotLightHelper.visible = false;
    

}

  function Bottom(){
   let geometry = new THREE.CylinderGeometry(150,100,300,40,10);
   geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

   

   let material = new THREE.MeshPhongMaterial({
    color: colors.blue,
    transparent:true,
    opacity:.7,
    shading:THREE.FlatShading,
    receiveShadow: true
});

this.mesh = new THREE.Mesh(geometry, material);
this.mesh.receiveShadow = true;

}


function createBottom(){
    bottom = new Bottom();
    bottom.mesh.position.y = -125;
    bottom.receiveShadow = true;
    scene.add(bottom.mesh);
}

function loop(){
    delta = clock.getDelta();
    
    if(pause == false && gameOver==false){
        updateInfo('time', Math.floor( clock.getElapsedTime()*10)/10);
        bottom.mesh.rotation.z += bombSpeed/50*delta;  
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

                subBox.min.x += vec1.x-1;
                subBox.min.y += vec1.y;
                subBox.min.z += vec1.z-5;

                subBox.max.x += vec1.x+1;
                subBox.max.y += vec1.y;
                subBox.max.z += vec1.z+5;
                bombBox.min.x += vec2.x;
                bombBox.min.y += vec2.y;
                bombBox.min.z += vec2.z;

                bombBox.max.x += vec2.x;
                bombBox.max.y += vec2.y;
                bombBox.max.z += vec2.z;

                inter = subBox.intersectsBox(bombBox);
                if (inter ==true) {
                    
                    addInfo('over', 'GAME OVER', gameOverInfo);
                    let keyframes =[
                        { // from
                          opacity: 0,
                          width:200 + 'px'
                        },
                        { // to
                          opacity: 1,
                          width: 500 + 'px'
                        }
                      ];
                      animationHide();
                    function animationHide(){
                        let anim = gameOverInfo.animate(keyframes, 2000);
                    let anim2 = over.animate(keyframes, 2000);
                      anim.play();
                      anim2.play();
                      setTimeout(() => {anim.reverse();anim2.reverse();}, 2000);
                      gameOverInfo.style.opacity = 0;
                    }
                    setTimeout(() => {
                        updateInfo('over', 'Press r to restart');
                        over.style.fontSize = 30 + 'px';
                        animationHide();
                    }, 4000);
                    
                    window.gameOver = true;
                    clearInterval(window.timer);
                    //const controls = new OrbitControls( camera, renderer.domElement );
                   
                    
                }
                
                
            }
          });

    }
    else{
        
        
        
    }
    
    
    
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}


function bombUpdate(){
    for (let i = bombStartCounter; i < bombArrayCounter; i++) {
        let array = bombArrays.getObjectByName('bombArray' + i);
            array.translateX(-bombSpeed*4*delta);
            
            
        
        if (array.position.x<-600) {
            bombArrays.remove(bombArrays.getObjectByName('bombArray' + i));
            bombStartCounter++;
        }
        
    }
    updateBackgroundBombs();
    
    
    
    
    
}
function submarineUpdate(){
    if (submarine.scene) {
        if (clock.elapsedTime<1) {
            submarine.scene.translateY(moveSpeed/2*delta);
        }
        if(Math.floor(clock.elapsedTime)%2==0){
            submarine.scene.translateZ(2*delta);
        } 
        else{
            submarine.scene.translateZ(-2*delta);
        }
        if (Math.random()<0.5) {
            submarine.scene.translateX(2*delta);
        }
        else{
            submarine.scene.translateX(-2*delta);
        }
    }
    
    if (up == true && submarine.scene.position.y < upperBorder) {
        submarine.scene.translateY( moveSpeed * delta); 
        
    }
    if (down ==true && submarine.scene.position.y > bottomBorder) {
        submarine.scene.translateY( -moveSpeed *delta);
    }
    submarinePropeller.rotateX(bombSpeed/2*delta);  

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
    submarine.scene.receiveShadow = true;
    scene.add( submarine.scene);
    console.log(submarine);
    
    let boxHelper = new THREE.BoxHelper( submarine.scene, 0xff0000 );
        boxHelper.name = 'subBox';
        boxHelper.visible = false;
        submarine.scene.add(boxHelper);
    
}

async function loadBomb(){
    //console.log('creating bombs');
    bomb = await loadModel('./obj/Bomb.gltf');
    
    createBombs();
    callTimer();
    
    
   
    scene.add(bombArrays);
    scene.add(backBombArrays);
}
function callTimer(){
    if (!gameOver) {
        window.timer = setInterval(() =>createBombs(), 1000 + (1000 * Math.random()));
    }
    
}
function createBombs(){

    bombSpeed += 1; // Speed up bombs!
    updateInfo('bombSpeed','Speed: '+ (bombSpeed-bombSpeedStart) );
    createBackgroundBombs();
    let amount = Math.floor( Math.random()*10)+2;
    let bombArray = new Group();
    bombArray.name = 'bombArray' + bombArrayCounter;
    for (let i = 0; i < amount; i++) {
        
        let obj = new Object3D();
        obj.copy(bomb.scene, true);
        
        let boxHelper = new THREE.BoxHelper( obj, 0xffff00 );
        boxHelper.name = 'bombBoxHelper';
        boxHelper.visible = false;
        obj.add(boxHelper);

        
        
        
        obj.name = 'bomb' + i;
        let randPosition = Math.floor( Math.random()*5*amount);
        let randPosition2 = ( Math.random()*5)-10;
        let randPosition3 = ( Math.random()*5)-2.5;
        obj.position.set(randPosition2+400, randPosition, randPosition3);
        bombArray.add(obj);
        
    }
    
    bombArrays.add(bombArray);
    //console.log(bombArrays);
    bombArrayCounter++;
    
    scene.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = true;
        if(n.material.map) n.material.map.anisotropy = 16; 
      }});
    submarine.scene.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = false;
        if(n.material.map) n.material.map.anisotropy = 16; 
      }});

}
function createBackgroundBombs(){
    //console.log(camera);
    let amount = Math.floor( Math.random()*50)+10;
    let backBombArray = new Group();
    backBombArray.name = 'backBombArray';
    for (let i = 0; i < amount; i++) {
        
        let randPosition = Math.floor( Math.random()*5*amount);
        let randPosition2 = ( Math.random()*10*(amount/2))-5;
        let randPosition3 = ( Math.random()*15*amount)-250;

        
        
        if (randPosition3>10 ||randPosition3<-10) {
            let object = new Object3D();
            object.copy(bomb.scene, true);
            object.position.set(randPosition2+100, randPosition, randPosition3);
            backBombArray.add(object);
        }
        
    }
    backBombArrays.add(backBombArray);
}
function updateBackgroundBombs(){
    for (let i = 0; i < backBombArrays.children.length; i++) {
        backBombArrays.children[i].translateX(-bombSpeed*2*delta);
        
        if (backBombArrays.children[i].position.x<-600) {
            backBombArrays.remove( backBombArrays.getObjectByName('backBombArray'));
        }
    }
    
}


    
