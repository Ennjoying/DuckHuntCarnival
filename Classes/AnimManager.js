import gsap from "gsap";
import { rifle, cursorImg, cursor } from "./../scripts";
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
  animTutorialStand(stand) {
    gsap.to(stand.position, { y: -6, duration: 2, ease: "elastic.in" });
  }
  animSwim(target, fromPos, toPos, onCompleteFunc) {
    const tl = gsap.timeline();
    const swimDuration = 15;
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

  animPlusPoints(pointsObj) {
    gsap.to(pointsObj.rotation, {
      x: (Math.random() - 0.5) * Math.PI * 10,
      y: (Math.random() - 0.5) * Math.PI * 10,
      y: (Math.random() - 0.5) * Math.PI * 10,
      duration: 2,
      ease: "sine.inOut",
    });
    gsap.to(pointsObj.position, {
      x: "+=" + (Math.random() - 0.5) * 10,
      duration: 2,
    });
    gsap.to(pointsObj.position, {
      y: "+=" + 2,
      duration: 0.25,
      onComplete: () => {
        gsap.to(pointsObj.position, { y: -5, duration: 1, ease: "bounce" });
      },
    });
  }
  //#region hud Anims

  animHudTutorialBegin(cursor, readyText) {
    gsap.fromTo(
      cursor,
      { scale: 15, opacity: 0 },
      { scale: 3, opacity: 0.5, duration: 2, repeat: -1, ease: "power3.inOut" },
    );
    gsap.fromTo(
      readyText,
      { scale: 1 },
      {
        rotation: 360 + "deg",
        ease: "elastic.inOut",
        scale: 1.25,
        duration: 1,
        repeat: -1,
        delay: 3,
        yoyo: true,
        repeatDelay: 3,
      },
    );
  }
  animHudTutorialEnd(cursor, readyText) {
    gsap.killTweensOf(cursor);
    gsap.killTweensOf(readyText);
    gsap.fromTo(
      cursor,
      { scale: 5, rotation: 0 + "deg", opacity: 0.5 },
      {
        scale: 20,
        rotation: 90 + "deg",
        opacity: 0,
        duration: 0.5,
        ease: "sine.out",
      },
    );
    gsap.to(readyText, {
      scale: 3,
      opacity: 0,
      rotation: 720 + "deg",
      duration: 0.5,
    });
  }
  animShootRifle(camera) {
    this.playRandomAudioWithPlaybackVariance(this.shotSounds, 0.3);
    gsap.to(rifle, {
      rotate: 35 + "deg",
      left: "+=4%",
      duration: 0.075,
      yoyo: true,
      repeat: 1,
    });
    gsap.to(camera.rotation, {
      duration: 0.075,
      x: `+=${Math.random() * 0.1}`,

      y: `+=${(Math.random() - 0.5) * 0.05}`,

      z: `+=${(Math.random() - 0.5) * 0.05}`,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    });

    cursorImg.src = "/kenney_shooting-gallery/PNG/HUD/crosshair_red_large.png";
    gsap.to(cursor, {
      rotation: "+=" + 15 + "deg",
      scale: 1.25,
      yoyo: true,
      duration: 0.075,
      repeat: 1,
      onComplete: () => {
        if (!this.isReloading)
          cursorImg.src =
            "/kenney_shooting-gallery/PNG/HUD/crosshair_outline_large.png";
      },
    });
  }
  isReloading = false;
  animHudReloadRifle(onCompleteFunc) {
    this.isReloading = true;
    this.playRandomAudioWithPlaybackVariance(this.reloadSound, 0.3);
    cursorImg.src = "/kenney_shooting-gallery/PNG/HUD/crosshair_red_large.png";

    gsap.to(rifle, {
      rotate: -35 + "deg",
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      ease: "bounce.out",
      onComplete: () => {
        this.isReloading = false;
        onCompleteFunc();
        cursorImg.src =
          "/kenney_shooting-gallery/PNG/HUD/crosshair_outline_large.png";
      },
    });
    gsap.to(cursor, {
      rotation: "-=" + 360 + "deg",
      duration: 2.2,
      ease: "elastic.inOut",
    });
    gsap.to(cursor, {
      scale: 2,
      duration: 0.7,
      delay: 0.4,
      yoyo: true,
      repeat: 1,
      ease: "power4.in",
    });
    //ifle.style.rotate = "5deg";
  }

  animHudFadeLoadscreen(loadScreen, loadText) {
    gsap.to(loadText, {
      top: -5 + "%",
      duration: 1,
      ease: "elastic.in",
      onComplete: () => {
        gsap.to(loadScreen, {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            loadScreen.style.display = "none";
          },
        });
      },
    });
  }
  animHudTimeUp(textTimeUp, scoreText, replayButton) {
    gsap.fromTo(
      textTimeUp,
      { scale: 10 },
      {
        opacity: 1,
        scale: 1,
        rotation: 360 + "deg",
        duration: 1,
        onComplete: () => {
          gsap.to(textTimeUp, {
            top: -5 + "%",
            duration: 1.5,
            ease: "elastic.in",
          });
          gsap.to(scoreText, {
            top: 20 + "%",
            duration: 1.5,
            ease: "elastic.in",
          });
          gsap.to(replayButton, {
            top: 70 + "%",
            duration: 1.5,
            ease: "elastic.in",
            onComplete: () => {
              gsap.fromTo(
                replayButton,
                { scale: 1 },
                {
                  rotation: 360 + "deg",
                  ease: "elastic.inOut",
                  scale: 1.25,
                  duration: 1,
                  repeat: -1,
                  delay: 3,
                  yoyo: true,
                  repeatDelay: 3,
                },
              );
            },
          });
        },
      },
    );
  }

  //#endregion

  //#region hit animations
  animHit(shotObject, impactPoint) {
    //somehow the impactpoint thats sent is wrong again, gotta find the issue
    gsap.killTweensOf(shotObject);
    if (
      shotObject.position.x < shotObject.localToWorld(impactPoint.clone()).x
    ) {
      gsap.to(shotObject.rotation, {
        y:
          shotObject.rotation.y +
          Math.PI +
          (Math.min(0.2, Math.max(0.8, Math.random())) * Math.PI) / 4 +
          Math.PI * 3,
        duration: 0.25 + Math.random(),
      });
    } else {
      gsap.to(shotObject.rotation, {
        y:
          shotObject.rotation.y -
          Math.PI -
          (Math.min(0.2, Math.max(0.8, Math.random())) * Math.PI) / 4 +
          Math.PI * 3,
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

  //#region sounds
  shotSounds = [
    //new Audio("/sounds/shot_01.ogg"),
    //new Audio("/sounds/shot_02.ogg"),
    //new Audio("/sounds/shot_03.ogg"),
    new Audio("/sounds/bang_02.ogg"),
    new Audio("/sounds/bang_05.ogg"),
    new Audio("/sounds/bang_08.ogg"),
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
  lights = [];
  lightsNeutralPos = [];

  focusLightsOn(target) {
    this.lights.forEach((light) => {
      light.lookAt(target);
    });
  }
  animLightAngle(angleFrom, angleTo) {
    this.lights.forEach((light) => {
      gsap.fromTo(light, { angle: angleFrom }, { angle: angleTo, duration: 1 });
    });
  }
  animLightIntensity(lightIntensity) {
    this.lights.forEach((light) => {
      gsap.to(light, { intensity: lightIntensity, duration: 1 });
    });
  }

  unfocusLights() {
    for (let i = 0; i < this.lights.length; i++)
      this.rotateLightToward(this.lights[i], this.lightsNeutralPos[i]);
  }

  rotateLightToward(light, targetRota) {
    gsap.to(light.rotation, { y: targetRota.y + 1, duration: 1 });
    gsap.to(light.rotation, {
      x: targetRota.x,
      y: targetRota.y,
      z: targetRota.z,
      duration: 1,
    });
    gsap.to(light, { angle: 0.4, duration: 1 });
  }
  swayLights(maxSway) {
    this.lights.forEach((light) => {
      const neutralPos = light.rotation.clone();

      // Randomize direction (+/-) for variation
      const xDir = Math.random() < 0.5 ? 1 : -1;
      const yDir = Math.random() < 0.5 ? 1 : -1;

      // Tween rotation continuously
      gsap.to(light.rotation, {
        x: "+=" + xDir * maxSway,
        y: "+=" + yDir * maxSway,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
  }

  //#endregion
}
