const SHADOW_MAP_NEAR = 0.5;
const SHADOW_MAP_FAR = 20;
const SHADOW_MAP_TEXTURE_UNIT = 4;

export function drawScene(gl, programInfo, shadowProgramInfo, shadowMap, models, camera, light) {
  const lightViewProjection = light.getShadowViewProjectionMatrix(SHADOW_MAP_NEAR, SHADOW_MAP_FAR);

  // Shadow pass
  shadowMap.bind();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.BLEND);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shadowProgramInfo.program);
  gl.uniformMatrix4fv(
    shadowProgramInfo.uniformLocations.lightViewProjectionMatrix,
    false,
    lightViewProjection,
  );

  for (const model of models) {
    model.drawShadow(gl, shadowProgramInfo);
  }

  // Main pass
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.viewProjectionMatrix,
    false,
    camera.viewProjectionMatrix,
  );
  gl.uniform3fv(programInfo.uniformLocations.cameraPos, camera.position);

  gl.uniform3fv(programInfo.uniformLocations.lightPos, light.position);
  gl.uniform3fv(programInfo.uniformLocations.lightDir, light.direction);
  gl.uniform1f(programInfo.uniformLocations.coneAngle, light.coneAngle);
  gl.uniform1f(programInfo.uniformLocations.coneSoftness, light.coneSoftness);
  gl.uniform1f(programInfo.uniformLocations.lightIntensity, light.intensity);
  gl.uniform3fv(programInfo.uniformLocations.lightColor, light.color);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.lightViewProjectionMatrix,
    false,
    lightViewProjection,
  );
  gl.activeTexture(gl.TEXTURE0 + SHADOW_MAP_TEXTURE_UNIT);
  gl.bindTexture(gl.TEXTURE_2D, shadowMap.getTexture());
  gl.uniform1i(programInfo.uniformLocations.shadowMap, SHADOW_MAP_TEXTURE_UNIT);
  gl.uniform2f(
    programInfo.uniformLocations.shadowMapPixelSize,
    1.0 / shadowMap.width,
    1.0 / shadowMap.height,
  );

  for (const model of models) {
    model.draw(gl, programInfo);
  }
}
