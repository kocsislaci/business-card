import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { mat4, vec3, vec4 } from 'gl-matrix';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';

import { CursorController } from './cursor-controller/controller.js';
import { handShakeEffect, idleHandEffect } from './cursor-controller/effects.js';
import { initShaderProgram } from './webgl-utils/shaders.js';
import { drawScene } from './rendering/renderer.js';
import { setupProgramInfo } from './rendering/scene.js';
import { Camera } from './rendering/camera.js';
import { ConeLight } from './rendering/light.js';
import { createQuadGeometry } from './rendering/geometry.js';
import { Material } from './rendering/material.js';
import { Model } from './rendering/model.js';
import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';

inject({
  debug: import.meta.env.DEV,
});

injectSpeedInsights({
  debug: import.meta.env.DEV,
});

const cursorController = new CursorController({
  strategy: 'lerp',
  lerp: { damping: 10.0 }
});
cursorController.addEffect(handShakeEffect, {
  intensity: 0.00007,
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

  const nameElement = document.getElementById('name');

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    cursorController.target = { x, y };
  });

  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  const programInfo = setupProgramInfo(gl, shaderProgram);
  
  const camera = new Camera(
    [0, 0, 5], // position
    [0, 0, -1], // target
    [0, 1, 0], // up
    45,
    gl.canvas.clientWidth / gl.canvas.clientHeight,
  );

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  });
  
  const cameraTiltSensitivity = 0.4;
  const baseCameraTarget = vec3.fromValues(0, 0, -1);
  
  const light = new ConeLight(
    vec3.add(vec3.create(), camera.position, vec3.fromValues(1, -1, -1)),
    camera.target,
    0.25,
    0.4,
    40.0,
    vec3.fromValues(1.0, 1.0, 0.4)
  );
  
  const material = new Material(gl);
  const [
    { aspectRatio },
  ] = await Promise.all([
    material.loadAlbedo('/assets/textures/wall-a.webp'),
    material.loadAmbientOcclusion('/assets/textures/wall-ao.webp'),
    material.loadNormal('/assets/textures/wall-n.webp'),
    material.loadRoughness('/assets/textures/wall-r.webp'),
    material.loadDisplacement('/assets/textures/wall-d.webp'),
  ]);
  
  const geometry = createQuadGeometry(gl, aspectRatio);
  
  const model = new Model(geometry, material);
  model.setScale(10.0, 10.0, 1.0);

  let lastTime = 0;
  function render(currentTime) {
    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    cursorController.update(deltaTime);
    const cursorState = cursorController.position;

    const cameraTiltOffset = vec3.fromValues(
      cursorState.x * cameraTiltSensitivity,
      cursorState.y * cameraTiltSensitivity,
      0
    );
    const newCameraTarget = vec3.create();
    vec3.add(newCameraTarget, baseCameraTarget, cameraTiltOffset);
    camera.lookAt(newCameraTarget[0], newCameraTarget[1], newCameraTarget[2]);
    
    const offsetX = -cursorState.x * cameraTiltSensitivity * canvas.width * 0.135;
    const offsetY = cursorState.y * cameraTiltSensitivity * canvas.height * 0.225;
    nameElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    const viewDirX = cursorState.x * camera.aspect * Math.tan(camera.fov / 2);
    const viewDirY = cursorState.y * Math.tan(camera.fov / 2);
    const viewDirZ = -1.0;
    
    const invViewMatrix = mat4.create();
    mat4.invert(invViewMatrix, camera.viewMatrix);
    
    const viewDir = vec4.fromValues(viewDirX, viewDirY, viewDirZ, 0.0);
    const worldDir4 = vec4.create();
    vec4.transformMat4(worldDir4, viewDir, invViewMatrix);
    
    const worldDir = vec3.fromValues(worldDir4[0], worldDir4[1], worldDir4[2]);
    vec3.normalize(worldDir, worldDir);
    
    const cameraPos = camera.position;
    const t = -cameraPos[2] / worldDir[2];
    const intersectionPoint = vec3.create();
    vec3.scaleAndAdd(intersectionPoint, cameraPos, worldDir, t);
    
    light.setTarget(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]);

    drawScene(gl, programInfo, [model], camera, light);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
