import { Application, Assets, Sprite} from "pixi.js";
import { Camera } from "./camera";
import { Scene } from "./scene";

/* Example of using the library */
(async () => {
  // Create a new application
  const app = new Application();

  
  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });
  
  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  app.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
  }, { passive: false });

  const texture = await Assets.load("/assets/bunny.png");

  const bunny = new Sprite(texture);
  const scene =  new Scene({width : 1000, height : 1000, interactive : true})
  scene.addChild(bunny);

  const camera = new Camera(app.stage, scene)

  camera.attachControl()

})();

     