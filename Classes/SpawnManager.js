import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

//spawnmanager handles spawning of any object,
//deciding when to spawn and despawn

export default class SpawnManager {
  hittableObjects = [];
  wave1;
  wave2;
  wave3;
  targetDucks = [];
  targetStands = [];
  constructor(animator, scene, gameManager) {
    this.animator = animator;
    this.scene = scene;
    this.hittableObjects = [];
    this.gameManager = gameManager;
  }

  tutorialDuck = null;
  //#region tutorial animations
  instantiateTutorialDuck() {
    this.tutorialDuck = this.instantiate(
      this.randomizeTarget(),
      new THREE.Vector3(0, 0, 0.5),
    );
    this.tutorialDuck.children[0].hitReaction = (target, rightHit) => {
      this.animator.animHitTarget(target, rightHit, this.hitTarget.bind(this));
      this.animator.animTutorialStand(
        this.tutorialDuck.children[1],
        this.gameManager.endTutorial.bind(this.gameManager),
      );
    };

    this.scene.add(this.tutorialDuck);
    this.hittableObjects.push(this.tutorialDuck);
    this.animator.animTutorialDuck(this.tutorialDuck);
  }

  //#endregion
  spawnCooldown = false;
  //#region decisionlogic
  decideSpawn() {
    if (this.hittableObjects.length < 5 && !this.spawnCooldown) {
      this.instantiateShootingTarget(this.randomizeTarget());
      this.spawnCooldown = true;
      setTimeout(() => {
        this.spawnCooldown = false;
      }, 1500);
    }
  }
  //#endregion

  // #region spawn objects
  instantiate(obj, position, scale, rotation) {
    const objCopy = obj.clone();
    position ? objCopy.position.copy(position) : null;
    scale ? objCopy.scale.copy(scale) : null;
    rotation ? objCopy.rotation.copy(rotation) : null;
    return objCopy;
  }

  instantiateShootingTarget(obj, position, scale, rotation) {
    const objCopy = this.instantiate(obj, position, scale, rotation);
    objCopy.children[0].hitReaction = (target, rightHit) =>
      this.animator.animHitTarget(target, rightHit, this.hitTarget.bind(this));
    this.scene.add(objCopy);
    this.hittableObjects.push(objCopy);
    // 2.5, 1.5, 0.5 , -0.5
    const zValue = Math.floor(Math.random() * 4) - 0.5;
    this.animator.animSwim(
      objCopy,
      new THREE.Vector3(-10, Math.random() * 2 - 2, zValue),
      new THREE.Vector3(10, Math.random() * 2 - 1.5, zValue),
      this.despawnTarget.bind(this),
    );
  }

  instantiateBackgroundTarget(obj, position, scale, rotation) {
    const objCopy = this.instantiate(obj, position, scale, rotation);
    objCopy.traverse((copy) => {
      if (copy.isMesh) {
        copy.hitReaction = (target, rightHit) =>
          this.animator.animHitObject(target, rightHit);
      }
    });
    return objCopy;
  }
  randomizeTarget() {
    const target = new THREE.Group();
    target.add(
      this.targetDucks[
        Math.floor(Math.random() * this.targetDucks.length)
      ].clone(),
      this.targetStands[
        Math.floor(Math.random() * this.targetStands.length)
      ].clone(),
    );
    target.scale.set(0.75, 0.75, 0.75);
    return target;
  }
  // #endregion

  //#region remove objects
  hitTarget(shotTarget) {
    shotTarget.parent.remove(shotTarget);
    this.gameManager.gainPoints(10);
  }

  despawnTarget(obj) {
    this.hittableObjects.pop(obj);
    obj.parent.remove(obj);
  }
  //#endregion
}
