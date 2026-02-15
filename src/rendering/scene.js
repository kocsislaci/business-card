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
      // camera
      cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),
      // transformation
      viewProjectionMatrix: gl.getUniformLocation(shaderProgram, "uViewProjectionMatrix"),
      modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
      // material
      texture: gl.getUniformLocation(shaderProgram, "uTexture"),
      // light
      lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
      lightDir: gl.getUniformLocation(shaderProgram, "uLightDir"),
      coneAngle: gl.getUniformLocation(shaderProgram, "uConeAngle"),
      coneSoftness: gl.getUniformLocation(shaderProgram, "uConeSoftness"),
    },
  };
}
