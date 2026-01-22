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
  }

  endTutorial() {
    console.log(this);
    this.tutorial = false;
  }
  bullet1 = document.querySelector("img.bullet1");
  bullet2 = document.querySelector("img.bullet2");
  bullet3 = document.querySelector("img.bullet3");
  // i wanted to do a blinking bullets animation, but cant get the bulletdiv.
  //bulletDiv = document.querySelector(".bullets");
  shootRifle() {
    switch (this.ammo) {
      case 0:
        //this.bulletDiv = document.querySelector(".bullets");
        //this.animator.animHudBlinkingBullets(bulletDiv);
        break;
      case 1:
        this.bullet1.src =
          "/kenney_shooting-gallery/PNG/HUD/icon_bullet_empty_short.png";
        this.ammo--;
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
    console.log(this.ammo);
  }

  gainPoints(points) {
    this.playerpoints += points;
    console.log(this.playerpoints);
  }
}
