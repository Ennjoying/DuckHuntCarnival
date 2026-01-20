import * as THREE from "three";

export default class SceneInitializer {
  constructor() {
    this.canvas = document.querySelector("canvas.webgl");
    this.canvasSize = { width: window.innerWidth, height: window.innerHeight };
    this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
  }

  Init() {
    this.camera.position.set(0, 0, 7);
    this.scene.add(this.camera);

    this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener("resize", () => {
      this.canvasSize.width = window.innerWidth;
      this.canvasSize.height = window.innerHeight;
      this.aspectRatio = this.canvasSize.width / this.canvasSize.height;
      //weird that the resetting of camera.aspect is needed. if i set aspectRatio, the variable should be
      //updated in the camera object. it probably copies the value on assign it instead of referencing
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvasSize.width, this.canvasSize.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
}
