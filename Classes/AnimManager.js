import gsap from "gsap";
import SpawnManager from "./SpawnManager";
import { rifle, cursorImg } from "./../scripts";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { Vector3 } from "three";
//animManager, just fire and forget animations

export default class AnimManager {
  constructor() {
    this.streamSounds.forEach((element) => {
      element.volume = 0.3;
    });
    this.quackSounds[0].volume = 0.5;
    this.quackSounds[1].volume = 0.8;
    this.reloadSound[0].volume = 0.7;
    this.splashSounds[0].volume = 0.9;
    this.splashSounds[1].volume = 0.4;
  }

  gsapEases = [
    "sine.inOut",
    "power1.inOut",
    "power2.inOut",
    "power3.inOut",
    "power4.inOut",
    " ",
  ];
  gsapOutEases = [
    "sine.Out",
    "power1.Out",
    "power2.Out",
    "power3.Out",
    "power4.Out",
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

  animTutorialDuck(target) {
    gsap.to(target.rotation, {
      delay: 2,
      duration: 1,
      y: Math.PI * 2,
      yoyo: true,
      repeat: -1,
      repeatDelay: 3,
    });
  }
  animTutorialStand(stand, onCompleteFunc) {
    gsap.to(stand.position, {
      y: -6,
      duration: 2,
      ease: "elastic.in",
      onComplete: () => onCompleteFunc(),
    });
  }

  animSwim(target, fromPos, toPos, onCompleteFunc) {
    const tl = gsap.timeline();
    const swimDuration = 10;
    setTimeout(
      () => {
        this.playRandomAudioWithPlaybackVariance(this.quackSounds, 1);
      },
      Math.random() * swimDuration * 100,
    );
    if (Math.random() >= 0.5) {
      tl.fromTo(target.position, fromPos, {
        duration: swimDuration,
        x: toPos.x,
        y: toPos.y,
        z: toPos.z,
        ease: gsap.utils.random(this.gsapEases),
        onComplete: () => {
          onCompleteFunc(target);
          tl.kill();
        },
      });
    } else {
      target.scale.x *= -1;
      tl.fromTo(
        target.position,
        { x: -fromPos.x, y: fromPos.y, z: fromPos.z },
        {
          duration: swimDuration,
          x: -toPos.x,
          y: toPos.y,
          z: toPos.z,
          ease: gsap.utils.random(this.gsapEases),
          onComplete: () => {
            onCompleteFunc(target);
            tl.kill();
          },
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

  //#region hit animations
  animHit(shotObject, impactPoint) {
    //somehow the impactpoint thats sent is wrong again, gotta find the issue
    gsap.killTweensOf(shotObject);
    if (
      shotObject.position.x < shotObject.localToWorld(impactPoint.clone()).x
    ) {
      gsap.to(shotObject.rotation, {
        y: shotObject.rotation.y + Math.PI + Math.random() * Math.PI * 4,
        duration: 0.25 + Math.random(),
      });
    } else {
      gsap.to(shotObject.rotation, {
        y: shotObject.rotation.y - Math.PI - Math.random() * Math.PI * 4,
        duration: 0.25 + Math.random(),
      });
    }
  }
  animHitWithOnComplete(shotObject, impactPoint, onCompleteFunc) {
    //somehow the impactpoint thats sent is wrong again, gotta find the issue
    gsap.killTweensOf(shotObject);
    if (
      shotObject.position.x < shotObject.localToWorld(impactPoint.clone()).x
    ) {
      gsap.to(shotObject.rotation, {
        y: shotObject.rotation.y + Math.PI + Math.random() * Math.PI * 4,
        duration: 0.25 + Math.random(),
        onComplete: () => onCompleteFunc(shotObject, impactPoint),
      });
    } else {
      gsap.to(shotObject.rotation, {
        y: shotObject.rotation.y - Math.PI - Math.random() * Math.PI * 4,
        duration: 0.25 + Math.random(),
        onComplete: () => onCompleteFunc(shotObject, impactPoint),
      });
    }
  }

  /* 
  animHudBlinkingBullets(bulletDiv) {
    gsap.to(bulletDiv.style.opacity, {
      opacity: 0,
      duration: 0.5,
      yoyo: true,
      repeat: 3,
    });
  } */

  animHudShootRifle() {
    this.playRandomAudioWithPlaybackVariance(this.shotSounds, 0.3);
    gsap.to(rifle, {
      rotate: 35 + "deg",
      left: "+=4%",
      duration: 0.075,
      yoyo: true,
      repeat: 1,
    });
  }
  animHudReloadRifle(onCompleteFunc) {
    this.playRandomAudioWithPlaybackVariance(this.reloadSound, 0.3);
    cursorImg.src = "/kenney_shooting-gallery/PNG/HUD/crosshair_red_large.png";
    gsap.to(rifle, {
      rotate: -35 + "deg",
      duration: 1,
      yoyo: true,
      repeat: 1,
      ease: "bounce.out",
      onComplete: () => {
        onCompleteFunc();
        cursorImg.src =
          "/kenney_shooting-gallery/PNG/HUD/crosshair_outline_large.png";
      },
    });
    //ifle.style.rotate = "5deg";
  }

  //#region sounds
  shotSounds = [
    new Audio("/sounds/shot_01.ogg"),
    new Audio("/sounds/shot_02.ogg"),
    new Audio("/sounds/shot_03.ogg"),
  ];
  reloadSound = [new Audio("/sounds/gunreload1.wav")];
  splashSounds = [
    new Audio("/sounds/splash1.wav"),
    new Audio("/sounds/splash2.wav"),
  ];
  quackSounds = [
    new Audio("/sounds/Mudchute_duck_2.ogg"),
    new Audio("/sounds/some animal noise.wav"),
  ];
  pointSounds = [new Audio("/sounds/Coin01.ogg")];
  streamSounds = [
    new Audio("/sounds/stream1.ogg"),
    new Audio("/sounds/stream3.ogg"),
    new Audio("/sounds/stream5.ogg"),
    new Audio("/sounds/stream6.ogg"),
    new Audio("/sounds/stream7.ogg"),
  ];

  playRandomAudioWithPlaybackVariance(sounds, variance) {
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    sound.playbackRate = 1 + Math.random() * variance;
    sound.play();
  }

  playRandomAudioOnLoop(sounds) {
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    //sound.volume = volume;
    sound.play();
    sound.removeEventListener("ended", sound.onEnded);
    sound.addEventListener(
      "ended",
      (sound.onEnded = () => {
        this.playRandomAudioOnLoop(sounds);
      }),
    );
  }

  //#endregion

  //#region Lights
  lightsRight = [];
  lightsRightNeutralPos = [];
  lightsLeft = [];
  lightsLeftNeutralPos = [];

  focusLightsOn(target) {
    this.lightsLeft.forEach((light) => {
      light.lookAt(target);
      //light.angle = 0.3;
    });

    this.lightsRight.forEach((light) => {
      light.lookAt(target);
      //light.angle = 0.3;
    });
  }

  unfocusLights() {
    this.rotateLight(this.lightsRight[0], this.lightsRightNeutralPos[0]);
    this.rotateLight(this.lightsRight[1], this.lightsRightNeutralPos[1]);
    this.rotateLight(this.lightsRight[2], this.lightsRightNeutralPos[2]);
    this.rotateLight(this.lightsLeft[0], this.lightsLeftNeutralPos[0]);
    this.rotateLight(this.lightsLeft[1], this.lightsLeftNeutralPos[1]);
    this.rotateLight(this.lightsLeft[2], this.lightsLeftNeutralPos[2]);
  }

  rotateLight(light, targetRota) {
    gsap.to(light.rotation, { y: targetRota.y + 1, duration: 1 });
    gsap.to(light.rotation, {
      x: targetRota.x,
      y: targetRota.y,
      z: targetRota.z,
      duration: 1,
    });
    gsap.to(light, { angle: 0.4, duration: 1 });
  }

  //#endregion
}
