import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import AnimManager from "./Classes/AnimManager.js";
import GameManager from "./Classes/GameManager.js";
import SpawnManager from "./Classes/SpawnManager.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "stats.js";
// #region Projectsetup, Inputs
//#region basic Projectsetup

const mousePos = { x: 0, y: 0 };
export const cursor = document.querySelector("div.cursor");
export const rifle = document.querySelector("div.rifle");
export const cursorImg = document.querySelector("img.cursorImg");
let tree1 = null;
let tree2 = null;
let cameraTarget = new THREE.Object3D();
cameraTarget.position.z = -5;

let frames = 0;
let elapsedTime = 0;
let fpsCheckChecks = 5;
let fpsCheckTimer;
const clock = new THREE.Clock();
const animator = new AnimManager();
const gameManager = new GameManager(animator);
const spawner = new SpawnManager(animator, gameManager.scene, gameManager);
gameManager.initGameScene();
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
// #endregion

const btn = document.getElementById("continueBtn");
btn.addEventListener("click", () => {
  location.reload();
  /* window.location.href =
    "www.duckhuntcarneval.netlify.app/?magSize=" +
    (gameManager.magSize + 2); */
});

// #region Inputs

//Move cursor
const body = window.addEventListener("pointermove", (event) => {
  mousePos.x = (event.clientX / gameManager.canvasSize.width) * 2 - 1;
  mousePos.y = 1 - (event.clientY / gameManager.canvasSize.height) * 2;

  if (!gameManager.gameEnded) {
    //normal gameloop
    cameraTarget.position.x = mousePos.x / 2;
    cameraTarget.position.y = mousePos.y / 2;
    gameManager.camera.position.x = mousePos.x / 8;
    gameManager.camera.position.y = mousePos.y / 8;
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";

    rifle.style.left = 1 + 50 * (mousePos.x + 1) + (mousePos.y + 0.7) * 5 + "%";
    rifle.style.top = 80 + 15 * -mousePos.y + "%";
  } else {
    //endstage after timer expired
    cameraTarget.position.x = mousePos.x / 8;
    cameraTarget.position.y = mousePos.y / 8;
    gameManager.camera.position.x = mousePos.x / 32;
    gameManager.camera.position.y = mousePos.y / 32;
    cursor.style.display = "none";
    document.body.style.cursor = "default";
    rifle.style.left = 70 + 5 * (mousePos.x + 1) + "%";
    rifle.style.top = 85 + "%";
    rifle.style.rotate = -45 + "deg";
  }

  gameManager.camera.lookAt(cameraTarget.position);
});

//Shoot
const rayCaster = new THREE.Raycaster();
let shootCooldown = false;
let initialClick = true;
window.addEventListener("pointerdown", (event) => {
  if (initialClick) {
    initialClick = false;
    animator.playRandomAudioOnLoop(animator.streamSounds);
  }

  if (
    !shootCooldown &&
    loadFinished &&
    !gameManager.isReloading &&
    !gameManager.gameEnded
  ) {
    shootCooldown = true;
    gameManager.shootRifle();
    animator.animShootRifle(gameManager.camera);

    //copy from mousemove for mobile
    cameraTarget.position.x = mousePos.x / 2;
    cameraTarget.position.y = mousePos.y / 2;
    gameManager.camera.position.x = mousePos.x / 8;
    gameManager.camera.position.y = mousePos.y / 8;
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";

    rifle.style.left = 1 + 50 * (mousePos.x + 1) + (mousePos.y + 0.7) * 5 + "%";
    rifle.style.top = 80 + 15 * -mousePos.y + "%";
    //

    if (gameManager.ammo >= 0) {
      //raycast

      rayCaster.setFromCamera(
        {
          x: (event.clientX / gameManager.rect.width) * 2 - 1,
          y: 1 - (event.clientY / gameManager.rect.height) * 2,
        },
        gameManager.camera,
      );
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

//reload on R
window.addEventListener("keydown", () => {
  if (event.key == "r") {
    if (gameManager.ammo < gameManager.magSize) gameManager.reloadRifle();
  }
});

// #endregion
// #endregion

// #region Loaders, geometry

// #region Loaders

//declare objects that will be loaded
//loaders
const loadManager = new THREE.LoadingManager();
const loadScreen = document.getElementById("loadScreen");
const loadText = document.getElementById("loadText");
loadManager.onError = (texture) => {
  console.log("OnError", texture);
};
loadManager.onProgress = (url, currentLoading, totalToLoad) => {
  let percent = Math.floor((currentLoading / totalToLoad) * 100);
  let duckString = `<img
      class="duckIcon"
      src="/kenney_shooting-gallery/PNG/HUD/icon_duck.png"
    />`;
  loadText.innerHTML = "Loading" + duckString + percent + "%";
  /* let percent = Math.floor((currentLoading / tot alToLoad) * 5);
  
  loadText.innerHTML = "";
  for (let i = 0; i < percent; i++) {
    loadText.innerHTML += duckString;
  } */
};
let loadFinished = false;
loadManager.onLoad = () => {
  animator.animHudFadeLoadscreen(loadScreen, loadText);
  setTimeout(() => (loadFinished = true), 1000);
  beginPlay();
};
const texLoader = new THREE.TextureLoader(loadManager);
const gltfLoader = new GLTFLoader(loadManager);

gltfLoader.load("/models/sceneStall.gltf", (gltf) => {
  gameManager.scene.add(gltf.scene);
  //console.log(gltf.scene);
  animator.lights.push(gltf.scene.getObjectByName("lightRight001"));
  animator.lights.push(gltf.scene.getObjectByName("lightRight002"));
  //animator.lights.push(gltf.scene.getObjectByName("lightRight003"));
  animator.lights.push(gltf.scene.getObjectByName("lightmiddle001"));
  animator.lights.push(gltf.scene.getObjectByName("lightLeft001"));
  animator.lights.push(gltf.scene.getObjectByName("lightLeft002"));
  //animator.lights.push(gltf.scene.getObjectByName("lightLeft003"));
  //animator.lights.push(gltf.scene.getObjectByName("lightLeft004"));
  animator.lightsNeutralPos.push(animator.lights[0].rotation.clone());
  animator.lightsNeutralPos.push(animator.lights[1].rotation.clone());
  animator.lightsNeutralPos.push(animator.lights[2].rotation.clone());
  animator.lightsNeutralPos.push(animator.lights[3].rotation.clone());
  animator.lightsNeutralPos.push(animator.lights[4].rotation.clone());
  //animator.lightsNeutralPos.push(animator.lights[6].rotation.clone());
  //animator.lightsNeutralPos.push(animator.lights[7].rotation.clone());
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
  spawner.plusPointsMesh = gltf.scene.getObjectByName("plusPoints001");
  //add Meshes
  gameManager.scene.add(spawner.wave1);
  gameManager.scene.add(spawner.wave2);
  gameManager.scene.add(spawner.wave3);
  tree1 = gltf.scene.getObjectByName("Tree001");
  tree2 = gltf.scene.getObjectByName("Tree002");
  /* spawner.instantiateBgTarget(tree1, new THREE.Vector3(3, 0.1, -1.5));
  spawner.instantiateBgTarget(tree1, new THREE.Vector3(-4, 0.1, -1.5));
  spawner.instantiateBgTarget(tree1, new THREE.Vector3(-5.2, -0.25, -1));
  spawner.instantiateBgTarget(
    tree1,
    new THREE.Vector3(Math.random() * 10 - 5, -0.25, -1),
  ); */
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

export const tutorialCursor = document.querySelector("img.tutorialCursor");
export const readyText = document.querySelector("img.readyText");
// #region beginplay
function beginPlay() {
  const tutoDuck = spawner.instantiateTutorialDuck();
  animator.focusLightsOn(tutoDuck.position);
  animator.swayLights(0.1);
  animator.animLightAngle(0.2);
  animator.animHudTutorialBegin(tutorialCursor, readyText);
  spawner.spawnTrees(tree1, tree2);

  //fps checker
  fpsCheckTimer = setInterval(() => {
    const avgFPS = frames / elapsedTime;
    //console.log("fpsCheckTimer:", avgFPS.toFixed(2));
    if (avgFPS < 50) {
      fpsCheckChecks -= 1;
      if (fpsCheckChecks == 0) {
        console.log("Set low graphics mode");
        gameManager.renderer.setPixelRatio(
          Math.min(window.devicePixelRatio, 1),
        );
        if (fpsCheckTimer !== null) clearInterval(fpsCheckTimer);
      }
    }
  }, 1000);

  eventTick();
}
//#region event tick
const eventTick = () => {
  stats.begin();

  //fps checker
  frames += 1;
  elapsedTime = clock.getElapsedTime();

  //object updates
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
  if (!gameManager.tutorial && !gameManager.gameEnded) spawner.decideSpawn();
  elapsedTime > 100 ? (elapsedTime = 0) : null;
  gameManager.renderer.render(gameManager.scene, gameManager.camera);
  window.requestAnimationFrame(eventTick);

  stats.end();
};
