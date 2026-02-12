export function setupProgramInfo(gl, shaderProgram) {
  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      texCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      texture: gl.getUniformLocation(shaderProgram, "uTexture"),
      lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
      lightDir: gl.getUniformLocation(shaderProgram, "uLightDir"),
      coneAngle: gl.getUniformLocation(shaderProgram, "uConeAngle"),
      coneSoftness: gl.getUniformLocation(shaderProgram, "uConeSoftness"),
      cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),
    },
  };
}
