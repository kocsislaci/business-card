import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { vec3 } from 'gl-matrix';
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';

import { CursorController } from './cursor-controller/controller.js';
import { handShakeEffect, idleHandEffect } from './cursor-controller/effects.js';
import { Camera } from './rendering/camera.js';
import { config } from './galaxy/config.js';
import { GalaxySimulation } from './galaxy/simulation.js';
import { BackgroundRenderer } from './galaxy/background.js';
import { StarRenderer } from './galaxy/star-renderer.js';
import { PostProcessor } from './galaxy/postprocess.js';

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

function main() {
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext("webgl2");
  if (gl === null) {
    alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
    return;
  }
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    cursorController.target = { x, y };
  });

  // Place the camera on a ring tilted off the disk's face-on axis (+Z), raised
  // in +Y, so we look down at the galaxy at an angle. tilt 0 = straight down on
  // the disk, 90 = edge-on.
  const tilt = config.cameraTilt * Math.PI / 180;
  const cameraPosition = [
    0,
    config.cameraDistance * Math.sin(tilt),
    config.cameraDistance * Math.cos(tilt),
  ];

  const camera = new Camera(
    cameraPosition,
    [0, 0, 0],   // looking at the galactic core
    [0, 1, 0],
    45,
    gl.canvas.clientWidth / gl.canvas.clientHeight,
  );

  const simulation = new GalaxySimulation(gl, config);
  const backgroundRenderer = new BackgroundRenderer(gl, config);
  const starRenderer = new StarRenderer(gl, config);
  const postProcessor = new PostProcessor(gl, config, canvas.width, canvas.height);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    postProcessor.resize(canvas.width, canvas.height);
  });

  const cameraTiltSensitivity = 0.4;
  const baseCameraTarget = vec3.fromValues(0, 0, 0);

  let lastTime = 0;
  function render(currentTime) {
    const rawDelta = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    const deltaTime = Math.min(rawDelta, config.maxDeltaTime);

    cursorController.update(deltaTime);
    const cursorState = cursorController.position;

    // Cursor-driven camera tilt (the scene moves; the HTML overlay does not).
    const cameraTiltOffset = vec3.fromValues(
      cursorState.x * cameraTiltSensitivity,
      cursorState.y * cameraTiltSensitivity,
      0
    );
    const newCameraTarget = vec3.create();
    vec3.add(newCameraTarget, baseCameraTarget, cameraTiltOffset);
    camera.lookAt(newCameraTarget[0], newCameraTarget[1], newCameraTarget[2]);

    // Advance the GPU N-body simulation, paint the deep-field sky, render the
    // stars over it into the HDR buffer, then run bloom + tone mapping.
    simulation.step(deltaTime * config.timeScale);
    postProcessor.beginScene();
    backgroundRenderer.render(camera);
    starRenderer.render(simulation, camera);
    postProcessor.render();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
