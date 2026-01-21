import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import AnimManager from "./Classes/AnimManager.js";
import GameManager from "./Classes/GameManager.js";
import SpawnManager from "./Classes/SpawnManager.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// #region Projectsetup, Inputs
//#region basic Projectsetup

const clock = new THREE.Clock();

const gameManager = new GameManager();
gameManager.initGameScene();
const animator = new AnimManager();
const spawner = new SpawnManager();
spawner.initReferences(animator, gameManager.scene, gameManager);
// #endregion

// #region Inputs

const inputs = new OrbitControls(gameManager.camera, gameManager.canvas);
//inputs.minPolarAngle = Math.PI * 0.4
//inputs.maxPolarAngle = Math.PI * 0.6
//inputs.enableDamping = true
//inputs.isLocked = true

const rayCaster = new THREE.Raycaster();
let mousePos = { x: 0, y: 0 };
window.addEventListener("mousemove", (event) => {
  mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = 1 - (event.clientY / window.innerHeight) * 2;
});

window.addEventListener("click", () => {
  rayCaster.setFromCamera(mousePos, gameManager.camera);
  const intersectedObj = rayCaster.intersectObjects(
    gameManager.scene.children,
    true,
  );
  let hitObj;
  let hitMesh;

  //check and save the object if its hittable
  for (let i = 0; i < Math.min(5, intersectedObj.length); i++) {
    if (intersectedObj[i]?.object) {
      hitObj = intersectedObj[i];
      hitMesh = intersectedObj[i].object;
    }
    if (hitMesh.hitReaction) break;
  }

  //trigger hitreaction function if hitmesh is valid
  if (hitMesh.hitReaction) {
    if (hitObj.point.x >= hitObj.object.parent.position.x)
      hitMesh.hitReaction(hitMesh, true);
    else hitMesh.hitReaction(hitMesh, false);
    hitMesh.hitReaction = null;
  }
});

//on double click toggle fullscreen
/* window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;
  if (fullscreenElement) {
    //this syntax "?.()" is called optional chaining.
    // it checks if the method is valid/exists before running the method
    document.exitFullscreen?.();
    document.webkitFullscreenElement?.();
  } else {
    canvas.requestFullscreen?.();
    canvas.webkitFullscreenElement?.();
  }
}); */

// #endregion
// #endregion

// #region Loaders, geometry, Hud

// #region Loaders

//declare objects that will be loaded
let gltfObjsLoaded = false;

//loaders
const loadManager = new THREE.LoadingManager();
loadManager.onError = (texture) => {
  console.log("OnError", texture);
};
const texLoader = new THREE.TextureLoader(loadManager);
const gltfLoader = new GLTFLoader(loadManager);

gltfLoader.load("/models/StaticMeshesLightsCamera.gltf", (gltf) => {
  gameManager.scene.add(gltf.scene);
});
gltfLoader.load("/models/TargetsHudMovableAssets.gltf", (gltf) => {
  //assign Meshes
  console.log(gltf);
  spawner.wave1 = gltf.scene.getObjectByName("waves001");
  spawner.wave2 = gltf.scene.getObjectByName("waves002");
  spawner.wave3 = spawner.wave1.clone();
  gltf.scene.getObjectByName("StandWood003").position.set(-0.1, -1.95, -0.1);
  gltf.scene.getObjectByName("StandWood004").position.set(-0.1, -1.95, -0.1);
  gltf.scene.getObjectByName("StandMetal001").position.set(-0.1, -1.95, -0.1);
  gltf.scene.getObjectByName("StandWoodHit002").position.set(-0.1, -1.95, -0.1);
  gltf.scene
    .getObjectByName("StandMetalHit002")
    .position.set(-0.1, -1.95, -0.1);
  spawner.targetDucks.push(
    gltf.scene.getObjectByName("TargetDuckYellow005"),
    gltf.scene.getObjectByName("TargetDuckYellow006"),
    gltf.scene.getObjectByName("TargetDuckBrown005"),
    gltf.scene.getObjectByName("TargetDuckBrown006"),
    gltf.scene.getObjectByName("TargetDuckBeige005"),
    gltf.scene.getObjectByName("TargetDuckBeige006"),
  );
  spawner.targetStands.push(
    gltf.scene.getObjectByName("StandWood003"),
    gltf.scene.getObjectByName("StandWood004"),
    gltf.scene.getObjectByName("StandMetal001"),
  );
  //add Meshes
  gameManager.scene.add(spawner.wave1);
  gameManager.scene.add(spawner.wave2);
  gameManager.scene.add(spawner.wave3);

  gameManager.sceneHud.add(gltf.scene.children[0]);
  console.log(gameManager.sceneHud);

  gltfObjsLoaded = true;
});

// #endregion

// #endregion

// #region drawdebugstuff
const gui = new GUI({
  width: 300,
  title: "draw debug stuff",
  closeFolders: true,
}).hide();

window.addEventListener("keydown", (event) => {
  //the gui._hidden part returns a bool and turns the entire thing into a toggle, very handy
  if (event.key == "h") gui.show(gui._hidden);
});

const wavePos = {
  wave1x: 15,
  wave1y: -2.25,
  wave2x: -15,
  wave2y: -2.375,
  wave3x: 15,
  wave3y: -2.5,
};

// #endregion

//event tick
const eventTick = () => {
  //set timevariables
  let elapsedTime = clock.getElapsedTime();

  //object updates
  if (gltfObjsLoaded) {
    //Animate
    spawner.wave1.position.set(
      wavePos.wave1x + Math.sin(elapsedTime * 0.6),
      wavePos.wave1y + Math.sin(elapsedTime * 0.6) * 0.1,
      Math.sin(elapsedTime * 0.6) * 0.1,
    );
    spawner.wave2.position.set(
      wavePos.wave2x - Math.sin(elapsedTime * 0.8),
      wavePos.wave2y + Math.sin(elapsedTime * 0.8) * 0.1,
      1 + Math.sin(elapsedTime * 0.8) * 0.1,
    );
    spawner.wave3.position.set(
      wavePos.wave3x + Math.sin(elapsedTime),
      wavePos.wave3y + Math.sin(elapsedTime) * 0.1,
      2 + Math.sin(elapsedTime) * 0.1,
    );
    spawner.decideSpawn();
  }

  elapsedTime > 100 ? (elapsedTime = 0) : null;
  gameManager.renderer.render(gameManager.scene, gameManager.camera);
  gameManager.renderer.render(gameManager.sceneHud, gameManager.cameraHud);
  window.requestAnimationFrame(eventTick);
};
eventTick();
