import { initShaderProgram } from '../webgl-utils/shaders.js';
import { createColorTexture, createFramebuffer, getUniforms, drawFullscreenTriangle } from './gpgpu.js';
import fullscreenVert from '../shaders/galaxy/fullscreen.vert';
import brightpassFrag from '../shaders/galaxy/brightpass.frag';
import blurFrag from '../shaders/galaxy/blur.frag';
import compositeFrag from '../shaders/galaxy/composite.frag';

// HDR scene buffer + a half-resolution bloom chain (bright pass -> separable
// blur -> composite). Stars render into the scene buffer; render() turns that
// into the final tonemapped image on screen.
export class PostProcessor {
  constructor(gl, config, width, height) {
    this.gl = gl;
    this.config = config;

    this.brightpassProgram = initShaderProgram(gl, fullscreenVert, brightpassFrag);
    this.brightpassUniforms = getUniforms(gl, this.brightpassProgram, ['uScene', 'uThreshold']);

    this.blurProgram = initShaderProgram(gl, fullscreenVert, blurFrag);
    this.blurUniforms = getUniforms(gl, this.blurProgram, ['uTex', 'uDirection']);

    this.compositeProgram = initShaderProgram(gl, fullscreenVert, compositeFrag);
    this.compositeUniforms = getUniforms(gl, this.compositeProgram, [
      'uScene', 'uBloom', 'uBloomIntensity', 'uExposure', 'uVignette', 'uAspect',
    ]);

    this.vao = gl.createVertexArray();
    this.resize(width, height);
  }

  resize(width, height) {
    const gl = this.gl;
    this.width = width;
    this.height = height;
    this.bloomWidth = Math.max(1, Math.floor(width / 2));
    this.bloomHeight = Math.max(1, Math.floor(height / 2));

    this._deleteTargets();

    this.sceneTexture = createColorTexture(gl, width, height);
    this.sceneFramebuffer = createFramebuffer(gl, [this.sceneTexture]);

    // Two half-res buffers ping-ponged by the bright pass and blur passes.
    this.bloomTextures = [
      createColorTexture(gl, this.bloomWidth, this.bloomHeight),
      createColorTexture(gl, this.bloomWidth, this.bloomHeight),
    ];
    this.bloomFramebuffers = [
      createFramebuffer(gl, [this.bloomTextures[0]]),
      createFramebuffer(gl, [this.bloomTextures[1]]),
    ];
  }

  // Binds the HDR scene buffer and clears it; stars are drawn after this.
  beginScene() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFramebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // Runs the bloom chain and composites the final image to the screen.
  render() {
    const gl = this.gl;
    const c = this.config;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);

    // Bright pass: scene -> bloom[0] (half res).
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFramebuffers[0]);
    gl.viewport(0, 0, this.bloomWidth, this.bloomHeight);
    gl.useProgram(this.brightpassProgram);
    this._bindTexture(this.sceneTexture, 0, this.brightpassUniforms.uScene);
    gl.uniform1f(this.brightpassUniforms.uThreshold, c.bloomThreshold);
    drawFullscreenTriangle(gl);

    // Separable blur: bloom[0] -H-> bloom[1] -V-> bloom[0].
    gl.useProgram(this.blurProgram);
    const stepX = (c.bloomRadius / this.bloomWidth);
    const stepY = (c.bloomRadius / this.bloomHeight);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFramebuffers[1]);
    this._bindTexture(this.bloomTextures[0], 0, this.blurUniforms.uTex);
    gl.uniform2f(this.blurUniforms.uDirection, stepX, 0.0);
    drawFullscreenTriangle(gl);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFramebuffers[0]);
    this._bindTexture(this.bloomTextures[1], 0, this.blurUniforms.uTex);
    gl.uniform2f(this.blurUniforms.uDirection, 0.0, stepY);
    drawFullscreenTriangle(gl);

    // Composite: scene + bloom -> screen.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.compositeProgram);
    this._bindTexture(this.sceneTexture, 0, this.compositeUniforms.uScene);
    this._bindTexture(this.bloomTextures[0], 1, this.compositeUniforms.uBloom);
    gl.uniform1f(this.compositeUniforms.uBloomIntensity, c.bloomIntensity);
    gl.uniform1f(this.compositeUniforms.uExposure, c.exposure);
    gl.uniform1f(this.compositeUniforms.uVignette, c.vignette);
    gl.uniform1f(this.compositeUniforms.uAspect, this.width / this.height);
    drawFullscreenTriangle(gl);

    gl.bindVertexArray(null);
  }

  _bindTexture(texture, unit, location) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
  }

  _deleteTargets() {
    const gl = this.gl;
    if (this.sceneTexture) gl.deleteTexture(this.sceneTexture);
    if (this.sceneFramebuffer) gl.deleteFramebuffer(this.sceneFramebuffer);
    if (this.bloomTextures) this.bloomTextures.forEach((t) => gl.deleteTexture(t));
    if (this.bloomFramebuffers) this.bloomFramebuffers.forEach((f) => gl.deleteFramebuffer(f));
  }
}
