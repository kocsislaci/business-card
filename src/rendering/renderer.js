export function drawScene(gl, programInfo, buffers, texture, cursorState, camera) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const modelMatrix = mat4.create();
  
  setPositionAttribute(gl, buffers, programInfo);
  setNormalAttribute(gl, buffers, programInfo);
  setTexCoordAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);
  
  gl.useProgram(programInfo.program);
  
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelMatrix,
    false,
    modelMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.viewProjectionMatrix,
    false,
    camera.getViewProjectionMatrix(),
  );

  // Bind texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(programInfo.uniformLocations.texture, 0);

  // Compute light direction from cursor position in world space
  const viewDirX = cursorState.x * camera.getAspect() * Math.tan(camera.getFov() / 2);
  const viewDirY = cursorState.y * Math.tan(camera.getFov() / 2);
  const viewDirZ = -1.0;
  
  // Transform view-space direction to world space
  // Use inverse view matrix (not view-projection) to rotate direction
  const invViewMatrix = mat4.create();
  mat4.invert(invViewMatrix, camera.getViewMatrix());
  
  const viewDir = vec4.fromValues(viewDirX, viewDirY, viewDirZ, 0.0);
  const worldDir4 = vec4.create();
  vec4.transformMat4(worldDir4, viewDir, invViewMatrix);
  
  const worldDir = vec3.fromValues(worldDir4[0], worldDir4[1], worldDir4[2]);
  vec3.normalize(worldDir, worldDir);
  
  const lightDir = [worldDir[0], worldDir[1], worldDir[2]];

  // Light uniforms
  gl.uniform3fv(programInfo.uniformLocations.lightPos, camera.position);
  gl.uniform3fv(programInfo.uniformLocations.lightDir, lightDir);
  gl.uniform1f(programInfo.uniformLocations.coneAngle, 0.2);
  gl.uniform1f(programInfo.uniformLocations.coneSoftness, 0.08);
  gl.uniform3fv(programInfo.uniformLocations.cameraPos, camera.position);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setNormalAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexNormal,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

function setTexCoordAttribute(gl, buffers, programInfo) {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.texCoord,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);
}

function setColorAttribute(gl, buffers, programInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}
