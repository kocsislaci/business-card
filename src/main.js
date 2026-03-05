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
import { setupProgramInfo, setupShadowProgramInfo } from './rendering/scene.js';
import { Camera } from './rendering/camera.js';
import { ConeLight } from './rendering/light.js';
import { ShadowMap } from './rendering/shadow-map.js';
import { createSceneObject } from './rendering/scene-object.js';
import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';
import shadowVertexShaderSource from './shaders/shadow-vertex.glsl';
import shadowFragmentShaderSource from './shaders/shadow-fragment.glsl';

inject({
  debug: import.meta.env.DEV,
});

injectSpeedInsights({
  debug: import.meta.env.DEV,
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
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    cursorController.target = { x, y };
  });

  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  const programInfo = setupProgramInfo(gl, shaderProgram);

  const shadowProgram = initShaderProgram(gl, shadowVertexShaderSource, shadowFragmentShaderSource);
  const shadowProgramInfo = setupShadowProgramInfo(gl, shadowProgram);

  const shadowMap = new ShadowMap(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);

  const camera = new Camera(
    vec3.fromValues(0, 0, 5),
    vec3.fromValues(0, 0, -1),
    vec3.fromValues(0, 1, 0),
    45,
    gl.canvas.clientWidth / gl.canvas.clientHeight,
    0.4,
    vec3.fromValues(0, 0, -1)
  );

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  });
  
  
  const light = new ConeLight(
    vec3.add(vec3.create(), camera.position, vec3.fromValues(1.0, -0.5, -0.5)),
    camera.target,
    3.1415/18.0, // 10 degrees
    3.1415/6, // 30 degrees
    40.0,
    vec3.fromValues(1.0, 1.0, 1.0)
  );
  
  const wallObject = await createSceneObject(gl, '/assets/textures/wall', vec3.fromValues(10.0, 10.0, 1.0), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 0.0, 0.0));
  const nameObject = await createSceneObject(gl, '/assets/textures/name', vec3.fromValues(0.5, 0.5, 1.0), vec3.fromValues(0.0, 0.0, 0.3), vec3.fromValues(0.0, 0.0, 0.0));
  nameObject.material.metallic = 0.8;
  const objects = [wallObject, nameObject];

  let lastTime = 0;
  function render(currentTime) {
    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    cursorController.update(deltaTime);
    const cursorPosition = cursorController.position;

    const newCameraTarget = calculateCameraDirection(cursorPosition, camera);
    camera.lookAt(newCameraTarget[0], newCameraTarget[1], newCameraTarget[2]);

    const newLightTarget = calculateLightDirection(cursorPosition, camera);
    light.setTarget(newLightTarget[0], newLightTarget[1], newLightTarget[2]);

    drawScene(gl, programInfo, shadowProgramInfo, shadowMap, objects, camera, light);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function calculateCameraDirection(cursorPosition, camera) {
  const cameraTiltOffset = vec3.fromValues(
    cursorPosition.x * camera.tiltSensitivity,
    cursorPosition.y * camera.tiltSensitivity,
    0
  );
  const cameraTarget = vec3.create();
  vec3.add(cameraTarget, camera.baseTarget, cameraTiltOffset);

  return cameraTarget;
}

function calculateLightDirection(cursorPosition, camera) {
  const viewDirX = cursorPosition.x * camera.aspect * Math.tan(camera.fov / 2);
  const viewDirY = cursorPosition.y * Math.tan(camera.fov / 2);
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
  const lightTarget = vec3.create();
  vec3.scaleAndAdd(lightTarget, cameraPos, worldDir, t);

  return lightTarget;
}
