export function drawScene(gl, programInfo, models, camera, light) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
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

  for (const model of models) {
    model.draw(gl, programInfo);
  }
}
