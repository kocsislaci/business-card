export class Geometry {
  constructor(gl, positions, texCoords, drawMode = gl.TRIANGLE_STRIP, vertexCount = 4) {
    this.drawMode = drawMode;
    this.vertexCount = vertexCount;
    
    this.positionBuffer = this._createBuffer(gl, positions);
    this.texCoordBuffer = this._createBuffer(gl, texCoords);
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
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.texCoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);
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

  const texCoords = [
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
  ];

  return new Geometry(gl, positions, texCoords, gl.TRIANGLE_STRIP, 4);
}
