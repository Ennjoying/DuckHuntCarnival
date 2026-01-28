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
  plusPointsMesh = null;
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
      this.gameManager.startGame();
      this.animator.animHitWithOnComplete(
        target,
        impactPoint,
        this.onCompleteHitTarget.bind(this),
      );
      target.hitReaction = null;

      const pointsIndicator = this.instantiate(
        this.plusPointsMesh,
        tutorialDuck.position,
        new THREE.Vector3(0.5, 0.5, 0.5),
      );
      this.animator.animPlusPoints(pointsIndicator);

      this.animator.playRandomAudioWithPlaybackVariance(
        this.animator.pointSounds,
        0.5,
      );
      this.animator.animTutorialStand(tutorialDuck.children[1]);
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
    if (objCopy.material) objCopy.material.depthWrite = true;
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
      const pointsIndicator = this.instantiate(
        this.plusPointsMesh,
        objCopy.position,
        new THREE.Vector3(0.5, 0.5, 0.5),
      );
      this.animator.animPlusPoints(pointsIndicator);
      this.spawnDecal(target, impactPoint);
    };

    this.hittableObjects.push(objCopy);
    const zValue = Math.floor(Math.random() * 4) - 0.5;
    this.animator.animSwim(
      objCopy,
      new THREE.Vector3(
        -window.innerWidth / 150 - 2,
        Math.random() * 2 - 2,
        zValue,
      ),
      new THREE.Vector3(
        window.innerWidth / 150 + 2,
        Math.random() * 2 - 1.5,
        zValue,
      ),
      this.despawnTarget.bind(this),
    );
  }

  instantiateBgTarget(obj, position, scale, rotation) {
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
    //das gespawnte decal war falsch positioniert weil die Z axis falsch ist.
    //somehow ist beim decal die local x axis die world z axis.
    hitObject.worldToLocal(impactPoint);
    hitObject.add(
      this.hitDecals[Math.floor(Math.random() * this.hitDecals.length)].clone(),
    );
    hitObject.add(
      this.hitDecals[Math.floor(Math.random() * this.hitDecals.length)].clone(),
    );
    hitObject.children.at(-2).rotation.set(0, 0, 0);
    hitObject.children
      .at(-2)
      .position.set(impactPoint.x + 0.05, impactPoint.y, impactPoint.z);
    hitObject.children.at(-1).rotation.set(0, 0, 0);
    hitObject.children
      .at(-1)
      .position.set(impactPoint.x - 0.05, impactPoint.y, impactPoint.z);
  }

  spawnTrees(tree1, tree2) {
    const loopMax = 20;
    const xFactor = 10;
    const yFactor = 1.5 / loopMax;
    const yConst = -0.75;
    const zFactor = 1.5 / loopMax;
    const zConst = -0.4;
    for (let i = 0; i < loopMax; i++) {
      if (Math.random() > 0.5) {
        this.instantiateBgTarget(
          tree1,
          new THREE.Vector3(
            Math.random() * xFactor - 1,
            yConst + i * yFactor,
            zConst - i * zFactor,
          ),
        );
        this.instantiateBgTarget(
          tree1,
          new THREE.Vector3(
            Math.random() * xFactor - xFactor + 1,
            yConst + i * yFactor,
            zConst - i * zFactor,
          ),
        );
      } else {
        this.instantiateBgTarget(
          tree2,
          new THREE.Vector3(
            Math.random() * xFactor - 1,
            yConst + i * yFactor,
            zConst - i * zFactor,
          ),
        );
        this.instantiateBgTarget(
          tree2,
          new THREE.Vector3(
            Math.random() * xFactor - xFactor + 1,
            yConst + i * yFactor,
            zConst - i * zFactor,
          ),
        );
      }
    }
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
