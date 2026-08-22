import { mat4 } from 'gl-matrix';
import { initShaderProgram } from '../webgl-utils/shaders.js';
import { getUniforms, drawFullscreenTriangle } from './gpgpu.js';
import fullscreenVert from '../shaders/galaxy/fullscreen.vert';
import backgroundFrag from '../shaders/galaxy/background.frag';

// Draws the procedural deep-field sky into the currently bound framebuffer (the
// HDR scene buffer) before the stars. Opaque, so it fills every pixel.
export class BackgroundRenderer {
  constructor(gl, config) {
    this.gl = gl;
    this.config = config;
    this.program = initShaderProgram(gl, fullscreenVert, backgroundFrag);
    this.uniforms = getUniforms(gl, this.program, [
      'uInvViewProjection', 'uCameraPos', 'uBackgroundColor',
      'uNebulaColorA', 'uNebulaColorB', 'uNebulaIntensity', 'uNebulaScale',
      'uStarBrightness', 'uStarDensity',
    ]);
    this.vao = gl.createVertexArray();
    this._invViewProjection = mat4.create();
  }

  render(camera) {
    const gl = this.gl;
    const c = this.config;
    const u = this.uniforms;

    mat4.invert(this._invViewProjection, camera.viewProjectionMatrix);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.uniformMatrix4fv(u.uInvViewProjection, false, this._invViewProjection);
    gl.uniform3fv(u.uCameraPos, camera.position);
    gl.uniform3fv(u.uBackgroundColor, c.backgroundColor);
    gl.uniform3fv(u.uNebulaColorA, c.nebulaColorA);
    gl.uniform3fv(u.uNebulaColorB, c.nebulaColorB);
    gl.uniform1f(u.uNebulaIntensity, c.nebulaIntensity);
    gl.uniform1f(u.uNebulaScale, c.nebulaScale);
    gl.uniform1f(u.uStarBrightness, c.starBrightness);
    gl.uniform1f(u.uStarDensity, c.starDensity);

    drawFullscreenTriangle(gl);

    gl.bindVertexArray(null);
  }
}
