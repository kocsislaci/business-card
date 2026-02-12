function drawScene(gl, programInfo, buffers, texture, mouseState) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    const modelViewMatrix = mat4.create();
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      [-0.0, 0.0, -6.0],
    );
    
    // Scale quad to fill viewport at z=-6
    const distance = 6.0;
    const vFOV = fieldOfView;
    const height = 2.0 * distance * Math.tan(vFOV / 2.0);
    const width = height * aspect;
    mat4.scale(modelViewMatrix, modelViewMatrix, [width / 2.0, height / 2.0, 1.0]);
    
    setPositionAttribute(gl, buffers, programInfo);
    setNormalAttribute(gl, buffers, programInfo);
    setTexCoordAttribute(gl, buffers, programInfo);
    setColorAttribute(gl, buffers, programInfo);
    
    gl.useProgram(programInfo.program);
    
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix,
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix,
    );

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.texture, 0);

    // Compute light direction from mouse position
    const fov = 45 * Math.PI / 180;
    const dirX = mouseState.x * aspect * Math.tan(fov / 2);
    const dirY = mouseState.y * Math.tan(fov / 2);
    const dirZ = -1.0;
    const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
    const lightDir = [dirX / length, dirY / length, dirZ / length];

    // Light uniforms
    gl.uniform3fv(programInfo.uniformLocations.lightPos, [0.0, 0.0, 0.0]);
    gl.uniform3fv(programInfo.uniformLocations.lightDir, lightDir);
    gl.uniform1f(programInfo.uniformLocations.coneAngle, 0.2);
    gl.uniform1f(programInfo.uniformLocations.coneSoftness, 0.08);
    gl.uniform3fv(programInfo.uniformLocations.cameraPos, [0.0, 0.0, 0.0]);
  
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
  
  export { drawScene };