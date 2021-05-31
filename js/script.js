import * as THREE from 'three';
import { Box3, Box3Helper, DirectionalLightHelper, Group, MathUtils, Object3D, ObjectLoader, SpotLightHelper, Vector3 } from 'three';
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

let bottom = new Group();
let cylinder;
let submarine =  new THREE.Object3D();
let submarinePropeller = new Group();
let bomb = new THREE.Object3D();
let stones = new THREE.Group();

let pause = false, up = false, down = false;

let moveSpeed = 40;
let upperBorder = 36;
let bottomBorder = -1;
window.gameOver = false;
const bombArrays = new THREE.Group();
const backBombArrays = new THREE.Group();
let bombSpeed = 15;
let bombSpeedStart = bombSpeed;
let mousePos = {};
let bombArrayCounter = 0;
let bombStartCounter = 0;
let inter = false;

addInfo('bombSpeed', 'Speed: '+ (bombSpeed-bombSpeedStart), info);
addInfo('time', 'Time: 0', info);

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
    loadStones();
	loadSubmarine();
	createBottom();
    loadBomb();
    
    setTimeout(() => {
        loop(); 
        keyboardHandler();
        document.addEventListener('mousemove', MouseHandler, false);
    }, 1500);
	

   
    
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
        
        controls.enabled = false;
        
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
    controls.enabled = true;
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
    
	camera.quaternion.w =  0.825161865567765;
    camera.quaternion.x = -0.2147798222998377;
    camera.quaternion.y =  -0.5056251584166417;
    camera.quaternion.z =  -0.13160821677130105;
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
     window.controls = new OrbitControls( camera, renderer.domElement );
     controls.enabled = false;
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
	
    
    let light = new THREE.SpotLight(0xffa95c,1.5, 500, Math.PI/3, 0.5, 2);
    
    light.position.set(-60,70,50);
    light.castShadow = true;
    light.bias = -0.004;
    scene.add( light );

    const spotLightHelper = new THREE.SpotLightHelper( light );
    scene.add( spotLightHelper );
    spotLightHelper.visible = false;
    

}

  function Bottom(){
   let geometry = new THREE.CylinderGeometry(128,128,400,60,10);
   geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

   

   let material = new THREE.MeshPhongMaterial({
    color: colors.blue,
    transparent:false,
    opacity:.7,
    
    receiveShadow: true
});

this.mesh = new THREE.Mesh(geometry, material);
this.mesh.receiveShadow = true;

}


function createBottom(){
    cylinder = new Bottom();
    cylinder.receiveShadow = true;
    bottom.add(cylinder.mesh);
    bottom.position.y = -140;
    scene.add(bottom);
}

function loop(){
    delta = clock.getDelta();
    
    if(pause == false && gameOver==false){
        updateInfo('time', 'Time: ' + Math.floor( clock.getElapsedTime()*10)/10);
        cylinder.mesh.rotation.z += bombSpeed/50*delta;  
        bombUpdate(); 
        submarineUpdate();   
        stones.rotation.z +=  bombSpeed/50*delta;
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
                subBox.min.z += vec1.z-2;

                subBox.max.x += vec1.x+1;
                subBox.max.y += vec1.y;
                subBox.max.z += vec1.z+2;
                bombBox.min.x += vec2.x;
                bombBox.min.y += vec2.y;
                bombBox.min.z += vec2.z;

                bombBox.max.x += vec2.x;
                bombBox.max.y += vec2.y;
                bombBox.max.z += vec2.z;

                inter = subBox.intersectsBox(bombBox);
                if (inter ==true) {
                    
                    addInfo('over', 'GAME OVER', gameOverInfo);
                    let over = document.getElementById('over');
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
                    
                    window.gameOver = true;
                    clearInterval(window.timer);

                   
                    
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
    if (submarine.scene &&pause ==false) {
        if (clock.elapsedTime<1) {
            submarine.scene.translateY(moveSpeed/2*delta);
        }
        let r = Math.random();
        if(r<0.5 && clock.elapsedTime>1){
            
            submarine.scene.rotation.x += delta/4;
        } 
        else if(r && clock.elapsedTime>1){
            
            submarine.scene.rotation.x -= delta/4;
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
async function loadStones(){
    for (let i = 1; i < 5; i++) {
        let stone1 = await loadModel(`./obj/stones`+i+`.gltf`);
        stone1 = stone1.scene;
        stones.add(stone1);
        
    }
    let seaweed = await loadModel(`./obj/seaweed.glb`);
    seaweed = seaweed.scene;
    seaweed.name = 'seaweed';
    stones.add(seaweed);
    stones.position.y;
    bottom.add(stones);


    for (let i = 0; i < 30; i++) {
        createStones();
        
    }
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
    scene.add( submarine.scene);
    console.log(submarine);
    
    let boxHelper = new THREE.BoxHelper( submarine.scene, 0xff0000 );
        boxHelper.name = 'subBox';
        boxHelper.visible = false;
        submarine.scene.add(boxHelper);
    let submarineLight = new THREE.SpotLight(0xffa95c,3, 150, Math.PI/6, 0.5, 2);
        submarineLight.position.set(0,5,-2);
        
        
    let helperLight = new THREE.SpotLightHelper(submarineLight);
        let point = new Object3D (); 
        point.position.x = -20;
        point.add(submarineLight);
        submarine.scene.add(point);
        submarineLight.castShadow = true;
        
        
        
    
}

async function loadBomb(){
    //console.log('creating bombs');
    bomb = await loadModel('./obj/Bomb.gltf');
    
    callTimer();
    
    
   
    scene.add(bombArrays);
    scene.add(backBombArrays);
}
function createStones(){
    let amount = Math.round( Math.random()*2)+3;
    let stonesArray = new Group();
    stonesArray.position.y;
    stonesArray.name = 'stonesArray' + bombArrayCounter;
    var cryptoArray = new Uint8Array(amount);
        window.crypto.getRandomValues(cryptoArray);

        //console.log("numbers:");
        for (var j = 0; j < cryptoArray.length; j++) {
        //console.log(cryptoArray[j]);
        }
    for (let i = 0; i < amount; i++) {
        
        let obj = new Object3D();
        
        for (let i = 0; i < 4; i++) {
            window.crypto.getRandomValues(cryptoArray);
            obj.copy(stones.children[i], true);
            
            
            let boxHelper = new THREE.BoxHelper( obj, 0xffff00 );
            boxHelper.name = 'stoneBoxHelper';
            boxHelper.visible = false;
            obj.add(boxHelper);
        
        
            obj.name = 'stone' + i;
            let randPosition =  cryptoArray[i] ;
            let randPosition2 = (Math.random()*2)-1
            obj.position.set(randPosition2,127.5, randPosition-120);
            obj.rotation.y = Math.PI/360*randPosition;
            let scale  = Math.random()*1.2+1;
            obj.scale.set(scale,scale,scale);
            stonesArray.add(obj);
        }
        
        
        
    }
    stonesArray.rotation.z +=Math.random()*30;
    stones.add(stonesArray);
}

function callTimer(){
    if (!gameOver) {
        window.timer = setInterval(() =>{createBombs(); }, 500 + (1500 * Math.random()));
    }
    
}
function createBombs(){

    bombSpeed += 0.25; // Speed up bombs!
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
        let randPosition = Math.floor( Math.random()*7*amount);
        let randPosition2 = ( Math.random()*5)-10;
        let randPosition3 = ( Math.random()*8)-4;
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
    stones.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true; 
        n.receiveShadow = false;
        if(n.material.map) n.material.map.anisotropy = 16; 
      }});

}
function createBackgroundBombs(){
    console.log(camera);
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



