// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';
import { OrbitControls } from '/sources/OrbitControls.js';

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls;

let houses = [];
let platforms = [];
let keywordColor = "white";

// RUN MAIN FUNCTIONS (AND LOAD JSON DATA (D3 Framework is in html!)-------------------------- 
d3.json("sources/Themencloud-stichworte.json").then(function (data) {
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

var setcolor = 0x00000;
scene = new THREE.Scene();
scene.background = new THREE.Color(setcolor);

// 🎥 CAM SETTING -------------------------- 

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

// CONTROLS SETTING -------------------------- 

controls = new OrbitControls( camera, renderer.domElement );
//controls.target.set(0,0,0);

camera.position.set( 5, 5, 5 );
controls.autoRotate = true;
controls.update();

// 🌞 LIGHT SETTINGS -------------------------- 

const skyColor = 0xffffff;
const groundColor = 0xffffff;
const hemiIntensity = 1;
const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);


// 🎯 MAIN FUNCTION -------------------------- 

function init(data) {

  let tweets = [];
  for (var i = 0; i < data.article.length; i++) {
    tweets.push(data.article[i].Stichwort);
  }
  // console.log('🐦 tweet: ' + tweets);

  let roof = [];
  for (var i = 0; i < data.article.length; i++) {
    roof.push(data.article[i].roof);
  }
  // console.log('🏠 roof: ' + roof);

  generate_city(tweets, roof);

  // helper(); // Koordinatensystem  
}

// 🎯 CLASS FOR SINGLE CUBE -------------------------- 

class House {

  constructor(_xPos, _yPos, _zPos, _height, _tweetString, _fixedBoxSizeY, _roofColor) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.fixedBoxSizeY = _fixedBoxSizeY;
    this.height = 1;
    this.width = 1;
    this.depth = 1;

    this.tweetString = _tweetString;

    this.dynamicTexture = new THREEx.DynamicTexture(400, 400 * this.height)
    this.dynamicTexture.clear('rgb(29,41,81)')

    // 🏠 GEOMETRY OF THE CUBE 

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);

    // COLORS OF THE ROOF AND BUILDING

    let buildingColor = "rgb(209,255,23)";
    this.roofColor = "rgb(209,255,23)";
    let emissiveColor = "rgb(209,255,23)";

    // die Dächer der Häuser sollen zu 10% weiß und 90% schwarz sein und das durch eine zufällige Anordnung
    let colorProbability = Math.random();

    if (colorProbability < 0.2) {
      this.roofColor = "rgb(209,255,23)";
    }

    this.checkText = true;

    this.dynamicTexture.drawTextCooked({
      background: "black", // der Hintergrund muss schwarz sein, damit die emissiveMap (als Maske) funktioniert
      text: this.tweetString,
      lineHeight: 0.12 / this.height,
      emissive: 1,
      blending: THREE.AdditiveBlending,
      fillStyle: keywordColor,
      font: "48px Helvetica",
      marginTop: ((this.height - this.fixedBoxSizeY + 1) / this.height) // da fixedBoxSize noch zu hoch ist.
    })

    this.material = [
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0x000000,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        //envMap: sunshine,
        shininess: 100,
        reflectivity: 0
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0x000000,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 0
      }),
      new THREE.MeshPhongMaterial({
        color: this.roofColor,
        specular: 0x000000,
        shininess: 100,
        reflectivity: 0
      }),
      new THREE.MeshPhongMaterial({
        color: this.roofColor,
        specular: 0x000000,
        shininess: 100,
        reflectivity: 0
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0x000000,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 0
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0x000000,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 0
      })
    ];

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();

    this.mesh.position.x = this.xPos + this.width / 2;
    this.mesh.position.y = this.yPos + this.height / 2;
    this.mesh.position.z = this.zPos + this.depth / 2;
  }

  
}

// 🎯 CLASS FOR CATEGORIE CLOUD -------------------------- 

class Platform {

  constructor(_xPos, _yPos, _zPos) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.height = 0;
    this.width = 0;
    this.depth = 0;

    // 🏠 GEOMETRY OF THE HOUSE

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);
    this.material = new THREE.MeshPhongMaterial({ color: "rgb(10,16,24)" });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.mesh.position.x = (this.xPos + this.width / 2) - 0.3;
    this.mesh.position.y = this.yPos + this.height / 2;
    this.mesh.position.z = (this.zPos + this.depth / 2) - 0.3;
  }
}

// CLASS FOR BIG CHAOS CLOUD

/*function generate_cloud() {
  
  for ( let i = 0; i < 320; i ++ ) {

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = Math.random() * 1600 - 800;
					mesh.position.y = 0;
					mesh.position.z = Math.random() * 1600 - 800;
					mesh.updateMatrix();
					mesh.matrixAutoUpdate = false;
					scene.add( mesh );
				}
}*/

// 🎯 FUNCTION TO GENERATE 3X2 DISTRICT -------------------------- 

function generate_district(_offsetX, _offsetZ, tweets, tweetID, roof) {

  let boxSizeX = 1;
  let boxSizeZ = 1;
  let boxDistance = 0.5;
  let boxMaxRowItems = 3;

  let boxPositionX = 0;
  let boxPositionZ = 0;

  let fixedBoxSizeY = 2;
  let districtSize = 6;

  for (var i = 0; i < 100; i++) {

    let tweetText = tweets[tweetID + i];
    let roofText = roof[tweetID + i];

    let boxHeight = Math.random() * 2.5 + fixedBoxSizeY;
    let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

    if (boxPositionX >= boxRowBreak) {
      boxPositionX = Math.random();
      boxPositionZ = Math.random();
    }

    const house = new House(boxPositionX + _offsetX, 0, boxPositionZ + _offsetZ, boxHeight, tweetText, fixedBoxSizeY, roofText);

    boxPositionX = boxPositionX + boxDistance + boxSizeX;

    houses.push(house); //Array von houses -> fügt ein house dem array hinzu
    scene.add(house.mesh);
  }
}

// 🎯 FUNCTION TO GENERATE GRID OF THE CITY -------------------------- 

function generate_city(tweets, roof) {

  const districtSize = 6;
  const bufferX = 6;
  const bufferZ = 4;
  const districts = 4; // wenn mehr häuser als daten in der datenbank sind, gehts nicht.

  let tweetID = 0;

  const offsetX = (bufferX * districts - (bufferX - 4)) / 2;
  const offsetZ = (bufferZ * districts - (bufferZ - 2.5)) / 2;

  for (let j = 0; j < districts; j++) {
    for (let k = 0; k < districts; k++) {
      generate_district(bufferX * j - offsetX, bufferZ * k - offsetZ, tweets, tweetID, roof);
      tweetID += districtSize;

      const platform = new Platform(bufferX * j - offsetX, 0, bufferZ * k - offsetZ);
      platforms.push(platform);
      scene.add(platform.mesh);
    }
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