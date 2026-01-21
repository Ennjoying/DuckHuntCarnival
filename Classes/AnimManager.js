import gsap from "gsap";
import SpawnManager from "./SpawnManager";

//animManager, just fire and forget animations

export default class AnimManager {
  gsapEases = [
    "sine.inOut",
    "power1.inOut",
    "power2.inOut",
    "power3.inOut",
    "power4.inOut",
    " ",
  ];
  gsapSwayEases = [
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

  animSwim(target, fromPos, toPos, onCompleteFunc) {
    const tl = gsap.timeline();
    if (Math.random() >= 0.5) {
      tl.fromTo(target.position, fromPos, {
        duration: 10,
        x: toPos.x,
        y: toPos.y,
        z: toPos.z,
        ease: gsap.utils.random(this.gsapEases),
        onComplete: () => onCompleteFunc(target),
      });
    } else {
      target.scale.x = -1;
      tl.fromTo(
        target.position,
        { x: -fromPos.x, y: fromPos.y, z: fromPos.z },
        {
          duration: 10,
          x: -toPos.x,
          y: toPos.y,
          z: toPos.z,
          ease: gsap.utils.random(this.gsapEases),
          onComplete: () => onCompleteFunc(target),
        },
      );
    }
    //y sway to make the ducks sway with the waves
    tl.to(target.position, {
      y: target.position.y + 1,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: gsap.utils.random(this.gsapSwayEases),
    });
    //z sway to make the ducks seems like they move
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

  animHitObject(shotObject, hitOnRightSide) {
    if (hitOnRightSide)
      gsap.to(shotObject.rotation, { y: Math.PI * 4, duration: 0.5 });
    else gsap.to(shotObject.rotation, { y: -Math.PI * 4, duration: 0.5 });
  }

  animHitTarget(shotTarget, hitOnRightSide, onCompleteFunc) {
    if (hitOnRightSide)
      gsap.to(shotTarget.rotation, {
        y: Math.PI * 4,
        duration: 0.5,
        onComplete: () => onCompleteFunc(shotTarget),
      });
    else
      gsap.to(shotTarget.rotation, {
        y: -Math.PI * 4,
        duration: 0.5,
        onComplete: () => onCompleteFunc(shotTarget),
      });
  }
}
