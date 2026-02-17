export class Geometry {
  constructor(gl, positions, texCoords, indices = null, drawMode = gl.TRIANGLES) {
    this.drawMode = drawMode;
    this.indices = indices;
    this.vertexCount = indices ? indices.length : positions.length / 3;
    
    this.positionBuffer = this._createBuffer(gl, positions);
    this.texCoordBuffer = this._createBuffer(gl, texCoords);
    
    if (indices) {
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }
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
    
    if (this.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
  }
}

export function createQuadGeometry(gl, aspectRatio = 1.0, subdivisions = 200) {
  const halfWidth = aspectRatio / 2.0;
  const halfHeight = 0.5;

  const positions = [];
  const texCoords = [];
  const indices = [];

  for (let y = 0; y <= subdivisions; y++) {
    for (let x = 0; x <= subdivisions; x++) {
      const u = x / subdivisions;
      const v = y / subdivisions;

      const posX = -halfWidth + u * aspectRatio;
      const posY = halfHeight - v * 1.0;
      const posZ = 0.5;

      positions.push(posX, posY, posZ);
      texCoords.push(u, v);
    }
  }

  for (let y = 0; y < subdivisions; y++) {
    for (let x = 0; x < subdivisions; x++) {
      const topLeft = y * (subdivisions + 1) + x;
      const topRight = topLeft + 1;
      const bottomLeft = (y + 1) * (subdivisions + 1) + x;
      const bottomRight = bottomLeft + 1;

      indices.push(topLeft, bottomLeft, topRight);
      indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  return new Geometry(gl, positions, texCoords, indices, gl.TRIANGLES);
}
