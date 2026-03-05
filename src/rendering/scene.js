export function setupProgramInfo(gl, shaderProgram) {
  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      texCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
    },
    uniformLocations: {
      cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),

      viewProjectionMatrix: gl.getUniformLocation(shaderProgram, "uViewProjectionMatrix"),
      modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),

      albedoTexture: gl.getUniformLocation(shaderProgram, "uAlbedoTexture"),
      ambientOcclusionTexture: gl.getUniformLocation(shaderProgram, "uAmbientOcclusionTexture"),
      normalTexture: gl.getUniformLocation(shaderProgram, "uNormalTexture"),
      roughnessTexture: gl.getUniformLocation(shaderProgram, "uRoughnessTexture"),
      displacementTexture: gl.getUniformLocation(shaderProgram, "uDisplacementTexture"),

      lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
      lightDir: gl.getUniformLocation(shaderProgram, "uLightDir"),
      coneAngle: gl.getUniformLocation(shaderProgram, "uConeAngle"),
      coneSoftness: gl.getUniformLocation(shaderProgram, "uConeSoftness"),
      lightIntensity: gl.getUniformLocation(shaderProgram, "uLightIntensity"),
      lightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),

      lightViewProjectionMatrix: gl.getUniformLocation(shaderProgram, "uLightViewProjectionMatrix"),
      shadowMap: gl.getUniformLocation(shaderProgram, "uShadowMap"),
      shadowMapPixelSize: gl.getUniformLocation(shaderProgram, "uShadowMapPixelSize"),
      metallic: gl.getUniformLocation(shaderProgram, "uMetallic"),
    },
  };
}

export function setupShadowProgramInfo(gl, shadowProgram) {
  return {
    program: shadowProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shadowProgram, "aVertexPosition"),
      texCoord: gl.getAttribLocation(shadowProgram, "aTexCoord"),
    },
    uniformLocations: {
      modelMatrix: gl.getUniformLocation(shadowProgram, "uModelMatrix"),
      lightViewProjectionMatrix: gl.getUniformLocation(shadowProgram, "uLightViewProjectionMatrix"),
      displacementTexture: gl.getUniformLocation(shadowProgram, "uDisplacementTexture"),
      albedoTexture: gl.getUniformLocation(shadowProgram, "uAlbedoTexture"),
    },
  };
}
