import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import AnimManager from "./Classes/AnimManager.js";
import GameManager from "./Classes/GameManager.js";
import SpawnManager from "./Classes/SpawnManager.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// #region Projectsetup, Inputs
//#region basic Projectsetup

const mousePos = { x: 0, y: 0 };
const cursor = document.querySelector("div.cursor");
export const rifle = document.querySelector("div.rifle");
export const cursorImg = document.querySelector("img.cursorImg");
let cameraTarget = new THREE.Object3D();
cameraTarget.position.z = -5;

const clock = new THREE.Clock();
const animator = new AnimManager();
const gameManager = new GameManager(animator);
const spawner = new SpawnManager(animator, gameManager.scene, gameManager);
gameManager.initGameScene();
// #endregion

// #region Inputs

const inputs = new OrbitControls(gameManager.camera, gameManager.canvas);
//inputs.minPolarAngle = Math.PI * 0.4
//inputs.maxPolarAngle = Math.PI * 0.6
//inputs.enableDamping = true
//inputs.isLocked = true

window.addEventListener("mousemove", (event) => {
  mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = 1 - (event.clientY / window.innerHeight) * 2;
  cursor.style.left = event.clientX + "px";
  cursor.style.top = event.clientY + "px";
  rifle.style.left = 1 + 50 * (mousePos.x + 1) + (mousePos.y + 0.7) * 5 + "%";
  //event.clientX + 25 * mousePos.x + (mousePos.y + 0.9) * 150 + "px";
  rifle.style.top = 80 + 15 * -mousePos.y + "%";

  cameraTarget.position.x = mousePos.x / 2;
  cameraTarget.position.y = mousePos.y / 2;
  gameManager.camera.position.x = mousePos.x / 8;
  gameManager.camera.position.y = mousePos.y / 8;

  gameManager.camera.lookAt(cameraTarget.position);
});

const rayCaster = new THREE.Raycaster();
let shootCooldown = false;
let initialClick = true;
window.addEventListener("click", () => {
  if (initialClick) {
    initialClick = false;
    //animator.playRandomAudioOnLoop(animator.streamSounds);
  }

  if (!shootCooldown && !gameManager.isReloading) {
    shootCooldown = true;
    animator.animHudShootRifle(rifle);
    gameManager.shootRifle();
    if (gameManager.ammo >= 0) {
      //raycast
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
        if (hitMesh.hitReaction) {
          hitMesh.hitReaction(hitMesh, hitObj.point);
        }
      }
    }
    setTimeout(() => {
      shootCooldown = false;
    }, 500);
  }
});
window.addEventListener("keydown", () => {
  if (event.key == "r") {
    if (gameManager.ammo < 3) gameManager.reloadRifle();
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

// #region Loaders, geometry

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

gltfLoader.load("/models/sceneStall.gltf", (gltf) => {
  gameManager.scene.add(gltf.scene);
  //console.log(gltf.scene);
  animator.lightsRight.push(gltf.scene.getObjectByName("lightRight001"));
  console.log(gltf.scene.getObjectByName("lightRight001"));
  animator.lightsRight.push(gltf.scene.getObjectByName("lightRight002"));
  animator.lightsRight.push(gltf.scene.getObjectByName("lightRight003"));
  animator.lightsRightNeutralPos.push(animator.lightsRight[0].rotation.clone());
  animator.lightsRightNeutralPos.push(animator.lightsRight[1].rotation.clone());
  animator.lightsRightNeutralPos.push(animator.lightsRight[2].rotation.clone());
  animator.lightsLeft.push(gltf.scene.getObjectByName("lightLeft001"));
  animator.lightsLeft.push(gltf.scene.getObjectByName("lightLeft002"));
  animator.lightsLeft.push(gltf.scene.getObjectByName("lightLeft003"));
  animator.lightsLeftNeutralPos.push(animator.lightsLeft[0].rotation.clone());
  animator.lightsLeftNeutralPos.push(animator.lightsLeft[1].rotation.clone());
  animator.lightsLeftNeutralPos.push(animator.lightsLeft[2].rotation.clone());
});
gltfLoader.load("/models/MeshesToSpawn.gltf", (gltf) => {
  //assign Meshes
  //console.log(gltf);
  spawner.wave1 = gltf.scene.getObjectByName("waves001");
  spawner.wave2 = gltf.scene.getObjectByName("waves002");
  spawner.wave3 = spawner.wave1.clone();

  spawner.wave1.hitReaction = (target, impactPoint) => {
    animator.playRandomAudioWithPlaybackVariance(animator.splashSounds, 1);
  };
  spawner.wave2.hitReaction = (target, impactPoint) => {
    animator.playRandomAudioWithPlaybackVariance(animator.splashSounds, 1);
  };
  spawner.wave3.hitReaction = (target, impactPoint) => {
    animator.playRandomAudioWithPlaybackVariance(animator.splashSounds, 1);
  };

  gltf.scene.getObjectByName("StandWood003").position.set(0, -2, 0);
  gltf.scene.getObjectByName("StandWood004").position.set(0, -2, 0);
  gltf.scene.getObjectByName("StandMetal001").position.set(0, -2, 0);
  gltf.scene.getObjectByName("StandWoodHit002").position.set(0, -2, 0);
  gltf.scene.getObjectByName("StandMetalHit002").position.set(0, -2, 0);
  gltf.scene.getObjectByName("TargetDuckYellow005").position.set(0.05, 0, 0);
  gltf.scene.getObjectByName("TargetDuckYellow006").position.set(0.05, 0, 0);
  gltf.scene.getObjectByName("TargetDuckBrown005").position.set(0.05, 0, 0);
  gltf.scene.getObjectByName("TargetDuckBrown006").position.set(0.05, 0, 0);
  gltf.scene.getObjectByName("TargetDuckBeige005").position.set(0.05, 0, 0);
  gltf.scene.getObjectByName("TargetDuckBeige006").position.set(0.05, 0, 0);
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
  spawner.hitDecals.push(gltf.scene.getObjectByName("DecalHit005"));
  spawner.hitDecals.push(gltf.scene.getObjectByName("DecalHit006"));
  spawner.hitDecals.push(gltf.scene.getObjectByName("DecalHit007"));
  spawner.hitDecals.push(gltf.scene.getObjectByName("DecalHit008"));
  //add Meshes
  gameManager.scene.add(spawner.wave1);
  gameManager.scene.add(spawner.wave2);
  gameManager.scene.add(spawner.wave3);
  const tree1 = gltf.scene.getObjectByName("Tree001");
  const tree2 = gltf.scene.getObjectByName("Tree002");
  spawner.instantiateBackgroundTarget(tree1, new THREE.Vector3(3, 0.1, -1.5));
  spawner.instantiateBackgroundTarget(tree1, new THREE.Vector3(-4, 0.1, -1.5));
  spawner.instantiateBackgroundTarget(
    tree1,
    new THREE.Vector3(-5.2, -0.25, -1),
  );

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
  wave1y: -3,
  wave2x: -15,
  wave2y: -2.625,
  wave3x: 15,
  wave3y: -2.25,
};

// #endregion
//event tick
const eventTick = () => {
  //set timevariables
  let elapsedTime = clock.getElapsedTime();
  //object updates
  if (gltfObjsLoaded) {
    //animate Waves
    spawner.wave1.position.set(
      wavePos.wave1x + Math.sin(elapsedTime),
      wavePos.wave1y + Math.sin(elapsedTime) * 0.1,
      2 + Math.sin(elapsedTime) * 0.1,
    );
    spawner.wave2.position.set(
      wavePos.wave2x - Math.sin(elapsedTime * 0.8),
      wavePos.wave2y + Math.sin(elapsedTime * 0.8) * 0.1,
      1 + Math.sin(elapsedTime * 0.8) * 0.1,
    );
    spawner.wave3.position.set(
      wavePos.wave3x + Math.sin(elapsedTime * 0.6),
      wavePos.wave3y + Math.sin(elapsedTime * 0.6) * 0.1,
      Math.sin(elapsedTime * 0.6) * 0.1,
    );
    if (gameManager.tutorial) {
      if (spawner.hittableObjects.length < 1) {
        const tutoDuck = spawner.instantiateTutorialDuck();
        animator.focusLightsOn(new THREE.Vector3(0, 2, 0));
      }
    } else {
      spawner.decideSpawn();
    }
  }
  elapsedTime > 100 ? (elapsedTime = 0) : null;
  gameManager.renderer.render(gameManager.scene, gameManager.camera);
  window.requestAnimationFrame(eventTick);
};
eventTick();
