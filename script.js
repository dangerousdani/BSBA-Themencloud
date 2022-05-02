// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';
import { OrbitControls } from './sources/OrbitControls.js';

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls;
let Cubes = [];

// RUN MAIN FUNCTIONS (AND LOAD JSON DATA (D3 Framework is in html!)-------------------------- 
d3.json("./sources/Themencloud-stichworte.json").then(function (data) {
  init(data);
  animate(renderer, scene, camera, controls);
});

// 🎛 RENDER SETTINGS -------------------------- 

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio / 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(30,30,30)');
document.body.appendChild(renderer.domElement);

// 🌇 SCENE SETTING -------------------------- 

scene = new THREE.Scene();
scene.background = new THREE.Color(0x96AFB9);

// 🎥 CAM SETTING -------------------------- 

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

// CONTROLS SETTING -------------------------- 

controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(17,17,17);

camera.position.set( 35, 35, 35 );
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.update();

// 🌞 LIGHT SETTINGS -------------------------- 

/*const skyColor = 0xffffff;
const groundColor = 0x000000;
const hemiIntensity = 5;
const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
hemiLight.position.set(17, 50, 17);
scene.add(hemiLight);

const ambiColor = 0x40ff40;
const ambiIntensity = 10;
const ambiLight = new THREE.AmbientLight(ambiColor, ambiIntensity);
scene.add(ambiLight);

let pointColor = 0xffffff;
let pointIntensity = 50;
let pointDistance = 1000;
let pointDecay = 0;

var pointLight1 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
var pointLight2 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
var pointLight3 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
var pointLight4 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);


pointLight1.position.set(17, 25, -10);
pointLight2.position.set(-10, 25, 17);
pointLight3.position.set(50, 25, 17);
pointLight4.position.set(17, 25, 50);*/

//scene.add(pointLight1);
//scene.add(pointLight2);
//scene.add(pointLight3);
//scene.add(pointLight4);

//DIR LIGHT 1
const light1 = new THREE.DirectionalLight(0xffffff, 1000);
light1.position.set(17, 30, 50);
scene.add(light1);
//+HELPER
const helper1 = new THREE.DirectionalLightHelper( light1, 5 );
scene.add( helper1 );

//DIR LIGHT 1
const light2 = new THREE.DirectionalLight(0xffffff, 1000);
light2.position.set(50, 30, 17);
scene.add(light2);
//+HELPER
const helper2 = new THREE.DirectionalLightHelper( light2, 5 );
scene.add( helper2 );



// 🎯 MAIN FUNCTION -------------------------- 

function init(data) {

  let keywords1 = [];
  for (var i = 0; i < data.article.length; i++) {
    if (data.article[i].Digitalisierung == 'x') {
    keywords1.push(data.article[i].Stichwort);
    }
  }

  let keywords2 = [];
  for (var i = 0; i < data.article.length; i++) {
    if (data.article[i].Stadtentwicklung == 'x') {
    keywords2.push(data.article[i].Stichwort);
    }
  }
  
  console.log(keywords1);
  console.log(keywords1.length);
  
  generate_cloud(keywords1);
  generate_cloud(keywords2);


  helper(); // Koordinatensystem  
}

// CLASS FOR CATEGORY CUBE

function generate_categoryCube() {

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
  const cube = new THREE.Mesh( geometry, material );

  cube.position.z = Math.random()*40;
  cube.position.y = Math.random()*40;
  cube.position.x = Math.random()*40;

  cube.scale.y = 5; // height = Math.random()*40;
  cube.scale.x = 5;
  cube.scale.z = 5;

  scene.add( cube );

}

// Material test


const material22 = new THREE.MeshPhysicalMaterial({  
  roughness: 0,  
  transmission: 1,  
  thickness: 0.5, // Add refraction!
});


const geometry22 = new THREE.IcosahedronGeometry(1, 0);
const mesh = new THREE.Mesh(geometry22, material22)
scene.add(mesh);

// CLASS FOR SINGLE CUBE -------------------------- 

class Cube {

  constructor(_xPos, _yPos, _zPos, _height, _keywordString, _fixedBoxSizeY) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.fixedBoxSizeY = _fixedBoxSizeY;

    this.keywordString = _keywordString;

    this.dynamicTexture = new THREEx.DynamicTexture(400, 400 * this.height)
    this.dynamicTexture.clear('rgb(29,41,81)')

    // GEOMETRY OF THE CUBE 

    //ROUNDED BOX

    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = 0.03;
    let radius0 = 0.03;
    let height = 1;
    let width = 1;
    let depth = 1;
    let smoothness = 3;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    this.geometry = new THREE.ExtrudeBufferGeometry(shape, {
      amount: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });

    //BOX WITH SHARP EDGES
    //this.geometry = new THREE.BoxGeometry(1, 1, 1);

    // COLORS OF THE CUBE

    let CubeColor = "rgb(220,255,35)";
    let EmissiveColor = "rgb(40,255,6)";
    let emissiveIntensityvalue = 11;

    this.checkText = true;

    this.dynamicTexture.drawTextCooked({
      background: "white", // Wenn emessiv muss der BG schwarz sein, damit die emissiveMap (als Maske) funktioniert
      text: this.keywordString,
      lineHeight: 0.12 / this.height,
      fillStyle: "black",
      font: "48px Helvetica",
      marginTop: ((this.height - this.fixedBoxSizeY + 1) / this.height) // da fixedBoxSize noch zu hoch ist.
    })

    // Haben verschiedene Seiten eines Cubes verschiedene Materialitäten, muss jede Seite einzeln definiert werden.
    this.material = new THREE.MeshPhysicalMaterial({
      color: CubeColor, 
      roughness: 0.2,  
      transmission: 1,  
      thickness: 0.2,
      emissiveIntensity: 7,
      emissive: new THREE.Color(EmissiveColor),
    })
    /*
    this.material = [
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
        emissiveMap: this.dynamicTexture.texture,
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
        emissiveMap: this.dynamicTexture.texture,
      }),
      new THREE.MeshStandardMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      }),
      new THREE.MeshPhongMaterial({
        emissiveIntensity: emissiveIntensityvalue,
        color: new THREE.Color(CubeColor),
        emissive: new THREE.Color(EmissiveColor),
      })
    ]; */

    this.mesh = new THREE.Mesh(this.geometry, this.material);


    this.mesh.position.x = Math.random()*35;
    this.mesh.position.y = Math.random()*35;
    this.mesh.position.z = Math.random()*35;
  }
}

// FUNCTION TO GENERATE CATEGORIE CLOUD (e.g. Zukunftsforschung) -------------------------- 

function generate_categoryCloud(keywords1, keywordID) {

  let boxSizeX = 1;
  let boxSizeZ = 1;
  let boxDistance = 0.5;
  let boxMaxRowItems = 3;

  let boxPositionX = 0;
  let boxPositionZ = 0;

  let fixedBoxSizeY = 2;

  for (var i = 0; i < 46; i++) { //tbd nicht die absolute zahl, sondern die array länge der kategorie

    let keywordText = keywords1[keywordID + i];

    let boxHeight = Math.random() * 2.5 + fixedBoxSizeY;
    let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

    if (boxPositionX >= boxRowBreak) {
      boxPositionX = Math.random();
      boxPositionZ = Math.random();
    }

    const cube = new Cube(boxPositionX + 100, 0, boxPositionZ - 100, boxHeight, keywordText, fixedBoxSizeY);

    boxPositionX = boxPositionX + boxDistance + boxSizeX;

    Cubes.push(cube); //Array von cubes -> fügt ein cube dem array "Cubes" hinzu
    scene.add(cube.mesh);
  }
}

// 🎯 FUNCTION TO GENERATE THEMENCLOUD -------------------------- 

function generate_cloud(keywords1) {

  const categoryClouds = 1; //Wie viel Kategorien Clouds gibt es?

  let keywordID = 0;

  for (let j = 0; j < categoryClouds; j++) {
      generate_categoryCloud(keywords1, keywordID);
      //generate_categoryCube();
  }
}

// 🎥 CAMERA ANIMATION + TEXT ----------------------- 

function animate() {

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // BUTTONS 

  document.getElementById("start").onclick = function () {
    document.getElementById("scrollbox1").style.display = "none";
  };

}

// 🔶 ORIENTATION CUBES FOR AXES -------------------------- 

function helper() {

  var dir = new THREE.Vector3(0, 1, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x00ff00;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(1, 0, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x0000ff;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(0, 0, 1);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);
}