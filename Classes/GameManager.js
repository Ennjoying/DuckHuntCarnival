import * as THREE from "three";
import { readyText, tutorialCursor } from "./../scripts";

export default class GameManager {
  playerpoints = 0;
  tutorial = true;
  ammo = 3;
  constructor(animator) {
    this.canvas = document.querySelector("canvas.viewport");
    this.canvasSize = { width: window.innerWidth, height: window.innerHeight };
    this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.aspectRatio, 0.1, 100);
    /* this.camera = new THREE.OrthographicCamera(
      -3 * this.aspectRatio,
      3 * this.aspectRatio,
      3,
      -3,
      0.1,
      100,
    ); */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      depth: true,
    });
    this.animator = animator;
    this.tutorial = true;
  }

  initGameScene() {
    this.camera.position.set(0, 0, 7);
    this.scene.add(this.camera);

    this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = false;

    window.addEventListener("resize", () => {
      this.canvasSize.width = window.innerWidth;
      this.canvasSize.height = window.innerHeight;
      this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    this.setTime();
  }

  timerRef = null;
  timeLeft = 60;

  // #region start and end game
  endTutorialStage() {
    this.tutorial = false;
    this.animator.unfocusLights();
    this.animator.swayLights(0.4);
    this.animator.animLightAngle(0.4);
    this.animator.animHudTutorialEnd(tutorialCursor, readyText);
    document.getElementById("tutoText").style.opacity = 0;

    this.timerRef = setInterval(() => {
      this.timeLeft--;
      this.setTime();
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  endGameDiv = document.getElementById("endGame");
  textTimeUp = document.getElementById("textTimeUp");
  endScore = document.getElementById("endScore");
  continueButton = document.getElementById("continueBtn");
  gameEnded = false;
  endGame() {
    this.gameEnded = true;
    clearInterval(this.timerRef);
    document.getElementById("hud").style.opacity = 0;
    this.animator.animLightIntensity(5);
    this.animator.animHudTimeUp(
      this.textTimeUp,
      this.endScore,
      this.continueButton,
    );
    this.displayEndScore();
  }

  bullet1 = document.querySelector("img.bullet1");
  bullet2 = document.querySelector("img.bullet2");
  bullet3 = document.querySelector("img.bullet3");
  // i wanted to do a blinking bullets animation, but cant get the bulletdiv.
  //bulletDiv = document.querySelector(".bullets");
  shootRifle() {
    switch (this.ammo) {
      case 0:
        break;
      case 1:
        this.bullet1.src =
          "/kenney_shooting-gallery/PNG/HUD/icon_bullet_empty_short.png";
        this.ammo--;
        this.reloadRifle();
        break;
      case 2:
        this.bullet2.src =
          "/kenney_shooting-gallery/PNG/HUD/icon_bullet_empty_short.png";
        this.ammo--;
        break;
      case 3:
        this.bullet3.src =
          "/kenney_shooting-gallery/PNG/HUD/icon_bullet_empty_short.png";
        this.ammo--;
        break;
    }
  }
  isReloading = false;
  reloadRifle() {
    this.isReloading = true;
    this.completedReload = this.completedReload.bind(this);
    this.animator.animHudReloadRifle(this.completedReload);
  }
  completedReload() {
    this.isReloading = false;
    this.ammo = 3;

    this.bullet1.src =
      "/kenney_shooting-gallery/PNG/HUD/icon_bullet_gold_short.png";
    this.bullet2.src =
      "/kenney_shooting-gallery/PNG/HUD/icon_bullet_gold_short.png";
    this.bullet3.src =
      "/kenney_shooting-gallery/PNG/HUD/icon_bullet_gold_short.png";
  }
  scoreText = document.querySelector("div.scoreText");
  scoreNum1 = document.querySelector("img.scoreNum1");
  scoreNum2 = document.querySelector("img.scoreNum2");
  scoreNum3 = document.querySelector("img.scoreNum3");
  smallNumSrc = {
    0: "/kenney_shooting-gallery/PNG/HUD/text_0_small.png",
    1: "/kenney_shooting-gallery/PNG/HUD/text_1_small.png",
    2: "/kenney_shooting-gallery/PNG/HUD/text_2_small.png",
    3: "/kenney_shooting-gallery/PNG/HUD/text_3_small.png",
    4: "/kenney_shooting-gallery/PNG/HUD/text_4_small.png",
    5: "/kenney_shooting-gallery/PNG/HUD/text_5_small.png",
    6: "/kenney_shooting-gallery/PNG/HUD/text_6_small.png",
    7: "/kenney_shooting-gallery/PNG/HUD/text_7_small.png",
    8: "/kenney_shooting-gallery/PNG/HUD/text_8_small.png",
    9: "/kenney_shooting-gallery/PNG/HUD/text_9_small.png",
  };
  numSrc = {
    0: "/kenney_shooting-gallery/PNG/HUD/text_0.png",
    1: "/kenney_shooting-gallery/PNG/HUD/text_1.png",
    2: "/kenney_shooting-gallery/PNG/HUD/text_2.png",
    3: "/kenney_shooting-gallery/PNG/HUD/text_3.png",
    4: "/kenney_shooting-gallery/PNG/HUD/text_4.png",
    5: "/kenney_shooting-gallery/PNG/HUD/text_5.png",
    6: "/kenney_shooting-gallery/PNG/HUD/text_6.png",
    7: "/kenney_shooting-gallery/PNG/HUD/text_7.png",
    8: "/kenney_shooting-gallery/PNG/HUD/text_8.png",
    9: "/kenney_shooting-gallery/PNG/HUD/text_9.png",
  };

  gainPoints(points) {
    this.playerpoints += points;
    //set points in hud
    const scoreString = this.playerpoints.toString();
    if (this.playerpoints >= 100) {
      this.scoreNum1.src = this.smallNumSrc[scoreString[0]];
      this.scoreNum2.src = this.smallNumSrc[scoreString[1]];
      this.scoreNum3.src = this.smallNumSrc[scoreString[2]];
    } else {
      this.scoreNum1.src = this.smallNumSrc[0];
      this.scoreNum2.src = this.smallNumSrc[scoreString[0]];
      this.scoreNum3.src = this.smallNumSrc[scoreString[1]];
    }
  }

  timerNum1 = document.querySelector("img.timerNum1");
  timerNum2 = document.querySelector("img.timerNum2");
  setTime() {
    const timeString = this.timeLeft.toString();
    if (this.timeLeft < 10) {
      this.timerNum1.src = this.smallNumSrc[0];
      this.timerNum2.src = this.smallNumSrc[timeString[0]];
    } else {
      this.timerNum1.src = this.smallNumSrc[timeString[0]];
      this.timerNum2.src = this.smallNumSrc[timeString[1]];
    }
  }

  displayEndScore() {
    const scoreString = this.playerpoints.toString();
    if (this.playerpoints >= 100) {
      document.getElementById("endScoreNum1").src = this.numSrc[scoreString[0]];
      document.getElementById("endScoreNum2").src = this.numSrc[scoreString[1]];
      document.getElementById("endScoreNum3").src = this.numSrc[scoreString[2]];
    } else {
      document.getElementById("endScoreNum1").src = this.numSrc[0];
      document.getElementById("endScoreNum2").src = this.numSrc[scoreString[0]];
      document.getElementById("endScoreNum3").src = this.numSrc[scoreString[1]];
    }
  }
}
