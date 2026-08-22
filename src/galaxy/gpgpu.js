// Small WebGL2 helpers shared by the galaxy simulation, renderer and post FX.

// A high-precision (RGBA32F) texture used to hold simulation state (positions,
// velocities). Sampled with texelFetch, so filtering is NEAREST.
export function createDataTexture(gl, width, height, data) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// A filterable half-float (RGBA16F) HDR color texture used for the scene and
// bloom buffers. LINEAR filtering so the blur passes interpolate smoothly.
export function createColorTexture(gl, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// Wraps one or more color textures in a framebuffer, wiring each to a
// successive COLOR_ATTACHMENT and enabling them all as draw buffers (MRT).
export function createFramebuffer(gl, textures) {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const drawBuffers = [];
  textures.forEach((texture, i) => {
    const attachment = gl.COLOR_ATTACHMENT0 + i;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, 0);
    drawBuffers.push(attachment);
  });
  gl.drawBuffers(drawBuffers);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return framebuffer;
}

// Resolves a set of uniform names to their locations in one call.
export function getUniforms(gl, program, names) {
  const uniforms = {};
  for (const name of names) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return uniforms;
}

// Draws a single full-screen triangle. The vertex shader builds the positions
// from gl_VertexID, so no vertex buffers are needed — just a bound VAO.
export function drawFullscreenTriangle(gl) {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
