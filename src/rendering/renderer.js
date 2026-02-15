export function drawScene(gl, programInfo, buffers, texture, camera, light) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const modelMatrix = mat4.create();

  mat4.scale(modelMatrix, modelMatrix, [3.0, 3.0, 1.0]);
  
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

  // Light uniforms
  gl.uniform3fv(programInfo.uniformLocations.lightPos, light.getPosition());
  gl.uniform3fv(programInfo.uniformLocations.lightDir, light.getDirection());
  gl.uniform1f(programInfo.uniformLocations.coneAngle, light.getConeAngle());
  gl.uniform1f(programInfo.uniformLocations.coneSoftness, light.getConeSoftness());
  gl.uniform1f(programInfo.uniformLocations.lightIntensity, light.getIntensity());
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
