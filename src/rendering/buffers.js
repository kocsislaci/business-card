export function initBuffers(gl, textureAspect = 1.0) {
  const position = initPositionBuffer(gl, textureAspect);
  const normal = initNormalBuffer(gl);
  const texCoord = initTexCoordBuffer(gl);
  const color = initColorBuffer(gl);

  return {
    position,
    normal,
    texCoord,
    color,
  };
}

function initPositionBuffer(gl, aspectRatio) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Create quad with aspect ratio matching the texture
  // Width = aspectRatio, Height = 1.0 in world space
  const halfWidth = aspectRatio / 2.0;
  const halfHeight = 0.5;

  const positions = [
    halfWidth, halfHeight, 0.0,
    -halfWidth, halfHeight, 0.0,
    halfWidth, -halfHeight, 0.0,
    -halfWidth, -halfHeight, 0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function initNormalBuffer(gl) {
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const normals = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  return normalBuffer;
}

function initTexCoordBuffer(gl) {
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // Simple 1:1 UV mapping - texture maps directly to quad
  const texCoords = [
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  return texCoordBuffer;
}

function initColorBuffer(gl) {
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  const colors = [
    1.0, 0.0, 0.0, 1.0,  // Red (top-right)
    0.0, 1.0, 0.0, 1.0,  // Green (top-left)
    0.0, 0.0, 1.0, 1.0,  // Blue (bottom-right)
    1.0, 1.0, 1.0, 1.0,  // White (bottom-left)
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
}
