export class Geometry {
  constructor(gl, positions, normals, texCoords, colors, drawMode = gl.TRIANGLE_STRIP, vertexCount = 4) {
    this.drawMode = drawMode;
    this.vertexCount = vertexCount;
    
    this.positionBuffer = this._createBuffer(gl, positions);
    this.normalBuffer = this._createBuffer(gl, normals);
    this.texCoordBuffer = this._createBuffer(gl, texCoords);
    this.colorBuffer = this._createBuffer(gl, colors);
  }

  _createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
  }

  bind(gl, programInfo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3, // numComponents
      gl.FLOAT,
      false, // normalize
      0, // stride
      0  // offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal,
      3, // numComponents
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.texCoord,
      2, // numComponents
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      4, // numComponents
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }
}

export function createQuadGeometry(gl, aspectRatio = 1.0) {
  const halfWidth = aspectRatio / 2.0;
  const halfHeight = 0.5;

  const positions = [
    halfWidth, halfHeight, 0.5,
    -halfWidth, halfHeight, 0.5,
    halfWidth, -halfHeight, 0.5,
    -halfWidth, -halfHeight, 0.5,
  ];

  const normals = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
  ];

  const texCoords = [
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
  ];

  const colors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
  ];

  return new Geometry(gl, positions, normals, texCoords, colors, gl.TRIANGLE_STRIP, 4);
}
