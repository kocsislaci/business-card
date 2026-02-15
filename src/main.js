import { CursorController } from './cursor-controller/controller.js';
import { handShakeEffect, idleHandEffect } from './cursor-controller/effects.js';
import { loadShaderFile, initShaderProgram } from './webgl-utils/shaders.js';
import { loadTexture } from './webgl-utils/textures.js';
import { initBuffers } from './rendering/buffers.js';
import { drawScene } from './rendering/renderer.js';
import { setupProgramInfo } from './rendering/scene.js';
import { Camera } from './rendering/camera.js';
import { ConeLight } from './rendering/light.js';

const cursorController = new CursorController({
  strategy: 'lerp',
  lerp: { damping: 10.0 }
});
cursorController.addEffect(handShakeEffect, {
  intensity: 0.00002,
  frequency: 8.0,
  velocityScale: 0.5,
  minVelocity: 1
});
cursorController.addEffect(idleHandEffect, {
  intensity: 0.002,
  frequency: 0.2,
  maxVelocity: 0.0001,
});

main();

async function main() {
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    cursorController.setTarget(x, y);
  });

  const vertexShaderSource = await loadShaderFile('../assets/shaders/vertex.glsl');
  const fragmentShaderSource = await loadShaderFile('../assets/shaders/fragment.glsl');
  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  const programInfo = setupProgramInfo(gl, shaderProgram);
  let buffers = initBuffers(gl);
  
  const camera = new Camera(
    [0, 0, 5], // position
    [0, 0, -1], // target
    [0, 1, 0], // up
    45,
    gl.canvas.clientWidth / gl.canvas.clientHeight,
  );
  
  const light = new ConeLight(
    camera.getPosition(),
    camera.getTarget(),
    0.2,
    0.08
  );
  
  const texture = loadTexture(gl, '../assets/textures/brick-wall.png', (width, height) => {
    const textureAspect = width / height;
    buffers = initBuffers(gl, textureAspect);
  });

  let lastTime = 0;
  function render(currentTime) {
    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    cursorController.update(deltaTime);
    const cursorState = cursorController.getPosition();

    const viewDirX = cursorState.x * camera.getAspect() * Math.tan(camera.getFov() / 2);
    const viewDirY = cursorState.y * Math.tan(camera.getFov() / 2);
    const viewDirZ = -1.0;
    
    const invViewMatrix = mat4.create();
    mat4.invert(invViewMatrix, camera.getViewMatrix());
    
    const viewDir = vec4.fromValues(viewDirX, viewDirY, viewDirZ, 0.0);
    const worldDir4 = vec4.create();
    vec4.transformMat4(worldDir4, viewDir, invViewMatrix);
    
    const worldDir = vec3.fromValues(worldDir4[0], worldDir4[1], worldDir4[2]);
    vec3.normalize(worldDir, worldDir);
    
    const lightTarget = vec3.create();
    vec3.scaleAndAdd(lightTarget, camera.getPosition(), worldDir, 10.0);
    light.setTarget(lightTarget[0], lightTarget[1], lightTarget[2]);

    drawScene(gl, programInfo, buffers, texture, camera, light);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
