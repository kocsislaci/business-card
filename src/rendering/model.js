export class Model {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.modelMatrix = mat4.create();
  }

  setPosition(x, y, z) {
    const translation = mat4.create();
    mat4.translate(translation, translation, [x, y, z]);
    mat4.copy(this.modelMatrix, translation);
    return this;
  }

  setRotation(x, y, z) {
    const rotation = mat4.create();
    mat4.rotateX(rotation, rotation, x);
    mat4.rotateY(rotation, rotation, y);
    mat4.rotateZ(rotation, rotation, z);
    mat4.multiply(this.modelMatrix, this.modelMatrix, rotation);
    return this;
  }

  setScale(x, y, z) {
    const scale = mat4.create();
    mat4.scale(scale, scale, [x, y, z]);
    mat4.multiply(this.modelMatrix, this.modelMatrix, scale);
    return this;
  }

  draw(gl, programInfo) {
    this.geometry.bind(gl, programInfo);    
    this.material.bind(gl, programInfo);
    
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelMatrix,
      false,
      this.modelMatrix
    );
    
    gl.drawArrays(
      this.geometry.drawMode,
      0,
      this.geometry.vertexCount
    );
  }
}
