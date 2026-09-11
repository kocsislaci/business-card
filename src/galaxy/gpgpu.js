// Small WebGL2 helpers shared by the galaxy simulation, renderer and post FX.

// Picks the best color-renderable format for the HDR scene/bloom buffers.
// Rendering into half-float textures needs EXT_color_buffer_float or
// EXT_color_buffer_half_float (iOS WebKit only exposes the latter). Without
// either we fall back to plain RGBA8, which clamps the scene to LDR but keeps
// the bloom chain and tone mapping working.
export function detectColorTargetFormat(gl) {
  if (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')) {
    return { internalFormat: gl.RGBA16F, type: gl.HALF_FLOAT, hdr: true };
  }
  return { internalFormat: gl.RGBA8, type: gl.UNSIGNED_BYTE, hdr: false };
}

// A high-precision texture used to hold simulation state (positions,
// velocities). Stored as RGBA32UI with the raw IEEE-754 bits of each float:
// integer textures are color-renderable in core WebGL2, so this works without
// EXT_color_buffer_float (missing on iOS). Shaders decode with uintBitsToFloat.
// Sampled with texelFetch, so filtering is NEAREST.
export function createDataTexture(gl, width, height, data) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const bits = data ? new Uint32Array(data.buffer, data.byteOffset, data.length) : null;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, width, height, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, bits);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// A filterable color texture used for the scene and bloom buffers, in the
// format chosen by detectColorTargetFormat (RGBA16F when available, else
// RGBA8). LINEAR filtering so the blur passes interpolate smoothly.
export function createColorTexture(gl, width, height, format) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, format.internalFormat, width, height, 0, gl.RGBA, format.type, null);
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
