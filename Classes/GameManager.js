import * as THREE from "three";

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
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.animator = animator;
    this.tutorial = true;
  }

  initGameScene() {
    this.camera.position.set(0, 0, 7);
    this.scene.add(this.camera);
    this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
  startGame() {
    this.tutorial = false;
    this.animator.unfocusLights();
    this.timerRef = setInterval(() => {
      this.timeLeft--;
      this.setTime();
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  endGame() {
    clearInterval(this.timerRef);
    console.log("game over !");
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
  digitPaths = {
    0: "/public/kenney_shooting-gallery/PNG/HUD/text_0_small.png",
    1: "/public/kenney_shooting-gallery/PNG/HUD/text_1_small.png",
    2: "/public/kenney_shooting-gallery/PNG/HUD/text_2_small.png",
    3: "/public/kenney_shooting-gallery/PNG/HUD/text_3_small.png",
    4: "/public/kenney_shooting-gallery/PNG/HUD/text_4_small.png",
    5: "/public/kenney_shooting-gallery/PNG/HUD/text_5_small.png",
    6: "/public/kenney_shooting-gallery/PNG/HUD/text_6_small.png",
    7: "/public/kenney_shooting-gallery/PNG/HUD/text_7_small.png",
    8: "/public/kenney_shooting-gallery/PNG/HUD/text_8_small.png",
    9: "/public/kenney_shooting-gallery/PNG/HUD/text_9_small.png",
  };

  gainPoints(points) {
    this.playerpoints += points;
    //set points in hud
    const scoreString = this.playerpoints.toString();
    if (this.playerpoints >= 100) {
      this.scoreNum1.src = this.digitPaths[scoreString[0]];
      this.scoreNum2.src = this.digitPaths[scoreString[1]];
      this.scoreNum3.src = this.digitPaths[scoreString[2]];
    } else {
      this.scoreNum1.src = this.digitPaths[0];
      this.scoreNum2.src = this.digitPaths[scoreString[0]];
      this.scoreNum3.src = this.digitPaths[scoreString[1]];
    }
  }

  timerNum1 = document.querySelector("img.timerNum1");
  timerNum2 = document.querySelector("img.timerNum2");
  setTime() {
    const timeString = this.timeLeft.toString();
    if (this.timeLeft < 10) {
      this.timerNum1.src = this.digitPaths[0];
      this.timerNum2.src = this.digitPaths[timeString[0]];
    } else {
      this.timerNum1.src = this.digitPaths[timeString[0]];
      this.timerNum2.src = this.digitPaths[timeString[1]];
    }
  }
}
