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
  hitDecals = [];
  constructor(animator, scene, gameManager) {
    this.animator = animator;
    this.scene = scene;
    this.hittableObjects = [];
    this.gameManager = gameManager;
  }

  //#region tutorial animations
  instantiateTutorialDuck() {
    const tutorialDuck = this.instantiate(
      this.randomizeTarget(),
      new THREE.Vector3(0, 0, 0.5),
    );
    tutorialDuck.children[0].hitReaction = (target, impactPoint) => {
      this.animator.animHitWithOnComplete(
        target,
        impactPoint,
        this.onCompleteHitTarget.bind(this),
      );
      target.hitReaction = null;

      this.animator.playRandomAudioWithPlaybackVariance(
        this.animator.pointSounds,
        0.5,
      );
      this.animator.animTutorialStand(
        tutorialDuck.children[1],
        this.gameManager.startGame.bind(this.gameManager),
      );
      this.spawnDecal(target, impactPoint);
    };

    this.scene.add(tutorialDuck);
    this.hittableObjects.push(tutorialDuck);
    this.animator.animTutorialDuck(tutorialDuck);
    return tutorialDuck;
  }

  //#endregion
  spawnCooldown = false;
  //#region decisionlogic
  decideSpawn() {
    if (this.hittableObjects.length < 10 && !this.spawnCooldown) {
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

    this.scene.add(objCopy);
    return objCopy;
  }

  instantiateShootingTarget(obj, position, scale, rotation) {
    const objCopy = this.instantiate(obj, position, scale, rotation);
    //child 0 for the duck
    objCopy.children[0].hitReaction = (target, impactPoint) => {
      this.animator.animHitWithOnComplete(
        target,
        impactPoint,
        this.onCompleteHitTarget.bind(this),
      );
      target.hitReaction = null;

      this.animator.playRandomAudioWithPlaybackVariance(
        this.animator.pointSounds,
        0.5,
      );
      this.spawnDecal(target, impactPoint);
    };

    console.log(window.innerWidth); // set swim spawn and direction to the width of the screen
    this.hittableObjects.push(objCopy);
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
    objCopy.hitReaction = (target, impactPoint) => {
      this.animator.animHit(
        target,
        impactPoint,
        this.onCompleteHitObject.bind(this),
      );
      this.spawnDecal(target, impactPoint);
    };

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

  spawnDecal(hitObject, impactPoint) {
    //das gespawnte decal ist kinda stuck in der position, es ist vermutlich so
    //weil die rotation des objs mit dem impact point nicht verrechnet wird.
    //ich müsste vermutlich die position mit der negativen rota des objects verrechnen
    // or something like that to fix it. Maybe there is an easier solution tho
    hitObject.add(this.hitDecals[0].clone());
    hitObject.worldToLocal(impactPoint);
    hitObject.children.at(-1).position.set(impactPoint.x, impactPoint.y, +0.2);
    hitObject.children.at(-1).rotation.set(0, 0, 0);
  }
  // #endregion

  //#region remove objects
  onCompleteHitObject(shotObject, impactPoint) {
    this.spawnDecal(shotObject, impactPoint);
  }
  onCompleteHitTarget(shotTarget) {
    shotTarget.parent.remove(shotTarget);
    this.gameManager.gainPoints(10);
  }

  despawnTarget(obj) {
    this.hittableObjects.pop(obj);
    obj.parent.remove(obj);
  }
  //#endregion
}
