import * as THREE from "three";

export default class GameManager {
  playerpoints = 0;
  constructor() {
    this.canvas = document.querySelector("canvas.viewport");
    this.canvasHud = document.querySelector("canvas.hud");
    this.canvasSize = { width: window.innerWidth, height: window.innerHeight };
    this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
    this.scene = new THREE.Scene();
    this.sceneHud = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 100);
    this.cameraHud = new THREE.OrthographicCamera(
      -5 * this.aspectRatio,
      5 * this.aspectRatio,
      5,
      -5,
      0.1,
      1,
    );
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
  }

  initGameScene() {
    this.camera.position.set(0, 0, 7);
    this.scene.add(this.camera);
    this.cameraHud.position.set(0, 0, 0.5);
    this.sceneHud.add(this.cameraHud);
    this.sceneHud.add(new THREE.AmbientLight("#ffffff", 5));
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener("resize", () => {
      this.canvasSize.width = window.innerWidth;
      this.canvasSize.height = window.innerHeight;
      this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();
      this.cameraHud.left = -5 * this.aspectRatio;
      this.cameraHud.right = 5 * this.aspectRatio;
      this.cameraHud.updateProjectionMatrix();
      this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  gainPoints(points) {
    this.playerpoints += points;
    console.log(this.playerpoints);
  }
}
