import gsap from "gsap";

export default class FunctionLibrary {
  hittableObjects = [];

  instantiate(obj, position, scale, rotation) {
    const objCopy = obj.clone();
    position ? objCopy.position.copy(position) : null;
    scale ? objCopy.scale.copy(scale) : null;
    rotation ? objCopy.rotation.copy(rotation) : null;
    return objCopy;
  }

  instantiateShootingTarget(obj, position, scale, rotation) {
    const objCopy = this.instantiate(obj, position, scale, rotation);
    objCopy.traverse((copy) => {
      if (copy.isMesh) {
        copy.hitReaction = (target, rightHit) =>
          this.AnimShootingTargetHit(target, rightHit);
      }
    });
    return objCopy;
  }
  instantiateBackgroundTarget(obj, position, scale, rotation) {
    const objCopy = this.instantiate(obj, position, scale, rotation);
    objCopy.traverse((copy) => {
      if (copy.isMesh) {
        copy.hitReaction = new BackgroundTarget("test");
      }
    });
    return objCopy;
  }

  gsapEases = [
    "sine.inOut",
    "power1.inOut",
    "power2.inOut",
    "power3.inOut",
    "power4.inOut",
    "back.inOut",
    "back.in",
    "elastic.inOut",
    "bounce.in",
    " ",
  ];

  animSwim(target) {
    if (Math.random() >= 0.5) {
      gsap.fromTo(
        target.position,
        { x: -9, y: -1.5, z: 0.5 },
        {
          duration: 10,
          x: 10,
          ease: "power4.outIn",
          onComplete: () => this.despawnTarget(target),
        },
      );
    } else {
      gsap.fromTo(
        target.position,
        { x: 9, y: -1.5, z: 0.5 },
        {
          duration: 10,
          x: -10,
          ease: "power4.outIn",
          onComplete: () => this.despawnTarget(target),
        },
      );
      target.scale.x = -1;
    }
    gsap.to(target.position, {
      y: "+=1",
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: gsap.utils.random(this.gsapEases),
    });
    gsap.fromTo(
      target.rotation,
      { z: -0.25 },
      {
        z: 0.25,
        repeatRefresh: true,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
    );
  }

  AnimTargetHit(target, rightHit) {
    if (rightHit) gsap.to(target.rotation, { y: Math.PI * 4, duration: 0.5 });
    else gsap.to(target.rotation, { y: -Math.PI * 4, duration: 0.5 });
  }

  AnimShootingTargetHit(target, rightHit) {
    if (rightHit)
      gsap.to(target.rotation, {
        y: Math.PI * 4,
        duration: 0.5,
        onComplete: () => this.despawnTarget(target),
      });
    else
      gsap.to(target.rotation, {
        y: -Math.PI * 4,
        duration: 0.5,
        onComplete: () => this.despawnTarget(target),
      });
  }

  despawnTarget(obj) {
    this.hittableObjects.pop(obj);
    obj.parent.remove(obj);
  }
}
