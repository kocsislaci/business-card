import { CursorController } from './cursor-controller/controller.js';
import { handShakeEffect, idleHandEffect } from './cursor-controller/effects.js';
import { loadShaderFile, initShaderProgram } from './webgl-utils/shaders.js';
import { loadTexture } from './webgl-utils/textures.js';
import { initBuffers } from './rendering/buffers.js';
import { drawScene } from './rendering/renderer.js';
import { setupProgramInfo } from './rendering/scene.js';

const cursorLerpConfig = {
  strategy: 'lerp',
  lerp: { damping: 10.0 }
};

const cursorSpringConfig = {
  strategy: 'spring',
  spring: { stiffness: 150, damping: 10 }
};

const cursorEasingConfig = {
  strategy: 'easing',
  easing: { duration: 0.3, easing: 'easeOutCubic' }
};

const cursorController = new CursorController(cursorLerpConfig);

// Add hand-shake effect to cursor (active when moving)
cursorController.addEffect(handShakeEffect, {
  intensity: 0.0002,
  frequency: 8.0,
  velocityScale: 0.5,
  minVelocity: 0.05
});

// Add idle hand effect (active when stationary)
cursorController.addEffect(idleHandEffect, {
  intensity: 0.002,
  frequency: 0.2,
  maxVelocity: 0.0001,
  pattern: 'organic'
});

main();

async function main() {
  const gl = document.querySelector("#canvas").getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Mouse tracking across entire viewport
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -((event.clientY / window.innerHeight) * 2 - 1);
    cursorController.setTarget(x, y);
  });

  const vertexShaderSource = await loadShaderFile('../assets/shaders/vertex.glsl');
  const fragmentShaderSource = await loadShaderFile('../assets/shaders/fragment.glsl');
  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  const programInfo = setupProgramInfo(gl, shaderProgram);
  const buffers = initBuffers(gl);
  const texture = loadTexture(gl);

  let lastTime = 0;
  function render(currentTime) {
    // Calculate deltaTime in seconds
    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update cursor position with smoothing
    cursorController.update(deltaTime);
    const cursorState = cursorController.getPosition();

    drawScene(gl, programInfo, buffers, texture, cursorState);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
