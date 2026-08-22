import { initShaderProgram } from '../webgl-utils/shaders.js';
import { getUniforms } from './gpgpu.js';
import starVert from '../shaders/galaxy/star.vert';
import starFrag from '../shaders/galaxy/star.frag';

// Draws every star as an additive, emissive GL_POINT into the currently bound
// framebuffer (the HDR scene buffer). Positions/colors are read from the
// simulation textures in the vertex shader, so there are no vertex buffers.
export class StarRenderer {
  constructor(gl, config) {
    this.gl = gl;
    this.config = config;
    this.program = initShaderProgram(gl, starVert, starFrag);
    this.uniforms = getUniforms(gl, this.program, [
      'uPosTex', 'uTexSize', 'uViewProjection',
      'uPointSize', 'uMinPointSize', 'uMaxPointSize',
      'uBulgeColor', 'uDiskColor', 'uColorRadius',
      'uSizeVariation', 'uBrightnessVariation', 'uBrightness',
    ]);
    this.vao = gl.createVertexArray();
  }

  render(simulation, camera) {
    const gl = this.gl;
    const c = this.config;
    const u = this.uniforms;

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // additive (output is premultiplied by falloff)

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, simulation.positionTexture);
    gl.uniform1i(u.uPosTex, 0);

    gl.uniform1i(u.uTexSize, simulation.texSize);
    gl.uniformMatrix4fv(u.uViewProjection, false, camera.viewProjectionMatrix);
    gl.uniform1f(u.uPointSize, c.pointSize);
    gl.uniform1f(u.uMinPointSize, c.minPointSize);
    gl.uniform1f(u.uMaxPointSize, c.maxPointSize);
    gl.uniform3fv(u.uBulgeColor, c.bulgeColor);
    gl.uniform3fv(u.uDiskColor, c.diskColor);
    gl.uniform1f(u.uColorRadius, c.colorRadius);
    gl.uniform1f(u.uSizeVariation, c.sizeVariation);
    gl.uniform1f(u.uBrightnessVariation, c.brightnessVariation);
    gl.uniform1f(u.uBrightness, c.brightness);

    gl.drawArrays(gl.POINTS, 0, simulation.starCount);

    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }
}
