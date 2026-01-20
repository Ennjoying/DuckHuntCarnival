import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Funcs from "./Classes/FunctionLibrary.js";
import SceneInit from "./Classes/SceneInitializer.js";
// #region Projectsetup, Inputs

//#region basic Projectsetup

const clock = new THREE.Clock();

const sceneInit = new SceneInit();
sceneInit.Init();
const scene = sceneInit.scene;
const funcs = new Funcs();
// #endregion

// #region Inputs

//const inputs = new OrbitControls(camera, canvas);
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
  rayCaster.setFromCamera(mousePos, sceneInit.camera);
  const intersectedObj = rayCaster.intersectObjects(scene.children, true);
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
let wave1;
let wave2;
let wave3;
let DuckYellow1;
let DuckYellow2;
let standWood1;
let standWood2;
let standWoodBroken;
let standMetal;
let standMetalBroken;

let TargetDuckYellow1 = new THREE.Group();
const TargetDuckYellow2 = new THREE.Group();

//loaders
const loadManager = new THREE.LoadingManager();
loadManager.onError = (texture) => {
  console.log("OnError", texture);
};
const texLoader = new THREE.TextureLoader(loadManager);
const gltfLoader = new GLTFLoader(loadManager);

gltfLoader.load("/models/StaticMeshesLightsCamera.gltf", (gltf) => {
  scene.add(gltf.scene);
});
gltfLoader.load("/models/TargetsHudMovableAssets.gltf", (gltf) => {
  //assign Meshes
  wave1 = gltf.scene.getObjectByName("waves001");
  wave2 = gltf.scene.getObjectByName("waves002");
  wave3 = wave1.clone();
  DuckYellow1 = gltf.scene.getObjectByName("TargetDuckYellow005");
  DuckYellow2 = gltf.scene.getObjectByName("TargetDuckYellow006");
  standWood1 = gltf.scene.getObjectByName("StandWood003");
  standWood2 = gltf.scene.getObjectByName("StandWood004");
  standWoodBroken = gltf.scene.getObjectByName("StandWoodHit002");
  standMetal = gltf.scene.getObjectByName("StandMetal001");
  standMetalBroken = gltf.scene.getObjectByName("StandMetalHit002");
  standWood1.position.set(-0.1, -1.95, -0.1);
  standWood2.position.set(-0.1, -1.95, -0.1);
  standMetal.position.set(-0.1, -1.95, -0.1);
  standWoodBroken.position.set(-0.1, -1.95, -0.1);
  standMetalBroken.position.set(-0.1, -1.95, -0.1);

  //Assign Meshes to targetGroups
  TargetDuckYellow1.add(DuckYellow1);
  TargetDuckYellow1.add(standWood1);
  TargetDuckYellow2.add(DuckYellow2);
  TargetDuckYellow2.add(standMetal);
  //add Meshes
  scene.add(wave1);
  scene.add(wave2);
  scene.add(wave3);

  gltfObjsLoaded = true;
});

// #endregion
// #region hud
function addHudOnLoad(gltf) {
  //crosshair = gltf.scene.children[0];
}

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

const debugVars = {};

const guiFolderWaves = gui.addFolder("waves");
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
    wave1.position.set(
      wavePos.wave1x + Math.sin(elapsedTime * 0.6),
      wavePos.wave1y + Math.sin(elapsedTime * 0.6) * 0.1,
      Math.sin(elapsedTime * 0.6) * 0.1,
    );
    wave2.position.set(
      wavePos.wave2x - Math.sin(elapsedTime * 0.8),
      wavePos.wave2y + Math.sin(elapsedTime * 0.8) * 0.1,
      1 + Math.sin(elapsedTime * 0.8) * 0.1,
    );
    wave3.position.set(
      wavePos.wave3x + Math.sin(elapsedTime),
      wavePos.wave3y + Math.sin(elapsedTime) * 0.1,
      2 + Math.sin(elapsedTime) * 0.1,
    );

    if (!funcs.hittableObjects.length > 0) {
      const newTarget = funcs.instantiateShootingTarget(TargetDuckYellow1);
      scene.add(newTarget);
      funcs.hittableObjects.push(newTarget);
      funcs.animSwim(newTarget);
      console.log(funcs.hittableObjects);
    }
  }

  elapsedTime > 100 ? (elapsedTime = 0) : null;
  sceneInit.renderer.render(scene, sceneInit.camera);
  window.requestAnimationFrame(eventTick);
};
eventTick();
