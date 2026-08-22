import { initShaderProgram } from '../webgl-utils/shaders.js';
import { createDataTexture, createFramebuffer, getUniforms, drawFullscreenTriangle } from './gpgpu.js';
import fullscreenVert from '../shaders/galaxy/fullscreen.vert';
import simFrag from '../shaders/galaxy/sim-update.frag';

// Owns the GPU N-body state (positions + velocities) and advances it one step
// per frame using ping-ponged float-texture framebuffers.
export class GalaxySimulation {
  constructor(gl, config) {
    this.gl = gl;
    this.config = config;
    this.texSize = config.texSize;
    this.starCount = this.texSize * this.texSize;

    const { positions, velocities } = createInitialState(config);

    // Two slots for ping-pong: read from one, write the other, then swap.
    this.posTextures = [
      createDataTexture(gl, this.texSize, this.texSize, positions),
      createDataTexture(gl, this.texSize, this.texSize, null),
    ];
    this.velTextures = [
      createDataTexture(gl, this.texSize, this.texSize, velocities),
      createDataTexture(gl, this.texSize, this.texSize, null),
    ];
    this.framebuffers = [
      createFramebuffer(gl, [this.posTextures[0], this.velTextures[0]]),
      createFramebuffer(gl, [this.posTextures[1], this.velTextures[1]]),
    ];
    this.read = 0;
    this.write = 1;

    this.program = initShaderProgram(gl, fullscreenVert, simFrag);
    this.uniforms = getUniforms(gl, this.program, [
      'uPosTex', 'uVelTex', 'uTexSize', 'uDt', 'uCoreStrength', 'uG',
      'uStarStarStrength', 'uSoftening', 'uDamping',
    ]);
    this.vao = gl.createVertexArray();
  }

  step(dt) {
    const gl = this.gl;
    const c = this.config;
    const u = this.uniforms;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.write]);
    gl.viewport(0, 0, this.texSize, this.texSize);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.posTextures[this.read]);
    gl.uniform1i(u.uPosTex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.velTextures[this.read]);
    gl.uniform1i(u.uVelTex, 1);

    gl.uniform1i(u.uTexSize, this.texSize);
    gl.uniform1f(u.uDt, dt);
    gl.uniform1f(u.uCoreStrength, c.coreStrength);
    gl.uniform1f(u.uG, c.G);
    gl.uniform1f(u.uStarStarStrength, c.starStarStrength);
    gl.uniform1f(u.uSoftening, c.softening);
    gl.uniform1f(u.uDamping, c.damping);

    drawFullscreenTriangle(gl);

    gl.bindVertexArray(null);
    [this.read, this.write] = [this.write, this.read];
  }

  get positionTexture() {
    return this.posTextures[this.read];
  }

  get velocityTexture() {
    return this.velTextures[this.read];
  }
}

// Builds the initial galaxy: a dense central bulge plus a thin disk laid on
// spiral arms. Every star gets solid-body rotation (v = omega x r) plus a
// random velocity dispersion that, in the harmonic core, becomes persistent
// epicyclic churn — strongest in the bulge.
function createInitialState(config) {
  const count = config.texSize * config.texSize;
  const positions = new Float32Array(count * 4);
  const velocities = new Float32Array(count * 4);

  const armAngle = (2.0 * Math.PI) / config.numArms;
  const omega = config.angularVelocity;
  const bulgeCount = Math.floor(count * config.bulgeFraction);

  for (let i = 0; i < count; i++) {
    let x, y, z, dispersion;

    if (i < bulgeCount) {
      // Dense central bulge: a roundish blob packed toward the core.
      const r = config.bulgeRadius * Math.pow(Math.random(), config.bulgeConcentration);
      const theta = Math.random() * Math.PI * 2.0;
      x = Math.cos(theta) * r;
      y = Math.sin(theta) * r;
      z = gaussian() * config.bulgeRadius * 0.5; // rounder than the thin disk
      dispersion = config.bulgeDispersion;
    } else {
      // Disk population laid on the spiral arms. sqrt() keeps it area-uniform.
      const r = config.innerRadius +
        (config.diskRadius - config.innerRadius) * Math.sqrt(Math.random());
      const branch = (i % config.numArms) * armAngle;
      const angle = branch - r * config.armWinding;
      x = Math.cos(angle) * r + armScatter(config) * r;
      y = Math.sin(angle) * r + armScatter(config) * r;
      z = gaussian() * config.diskThickness;
      dispersion = config.diskDispersion;
    }

    positions[i * 4 + 0] = x;
    positions[i * 4 + 1] = y;
    positions[i * 4 + 2] = z;
    positions[i * 4 + 3] = config.starMass;

    velocities[i * 4 + 0] = -y * omega + gaussian() * dispersion;
    velocities[i * 4 + 1] = x * omega + gaussian() * dispersion;
    velocities[i * 4 + 2] = gaussian() * dispersion * 0.5;
    velocities[i * 4 + 3] = 0.0;
  }

  return { positions, velocities };
}

// Signed lateral offset off the arm centerline (as a fraction of radius),
// concentrated near zero by armSpreadPower.
function armScatter(config) {
  const sign = Math.random() < 0.5 ? 1.0 : -1.0;
  return Math.pow(Math.random(), config.armSpreadPower) * sign * config.armSpread;
}

// Standard-normal sample via Box-Muller.
function gaussian() {
  const u = Math.random() || 1e-9;
  const v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
