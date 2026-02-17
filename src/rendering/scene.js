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
      cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),

      viewProjectionMatrix: gl.getUniformLocation(shaderProgram, "uViewProjectionMatrix"),
      modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),

      albedoTexture: gl.getUniformLocation(shaderProgram, "uAlbedoTexture"),
      ambientOcclusionTexture: gl.getUniformLocation(shaderProgram, "uAmbientOcclusionTexture"),
      normalTexture: gl.getUniformLocation(shaderProgram, "uNormalTexture"),
      roughnessTexture: gl.getUniformLocation(shaderProgram, "uRoughnessTexture"),
      metallicTexture: gl.getUniformLocation(shaderProgram, "uMetallicTexture"),

      lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
      lightDir: gl.getUniformLocation(shaderProgram, "uLightDir"),
      coneAngle: gl.getUniformLocation(shaderProgram, "uConeAngle"),
      coneSoftness: gl.getUniformLocation(shaderProgram, "uConeSoftness"),
      lightIntensity: gl.getUniformLocation(shaderProgram, "uLightIntensity"),
      lightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
    },
  };
}
