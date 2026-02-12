function initBuffers(gl) {
    const position = initPositionBuffer(gl);
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
  
function initPositionBuffer(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // 3D positions for quad (z=0)
    const positions = [
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0,
    ];
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
  }

function initNormalBuffer(gl) {
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  
    // All normals point toward camera (0, 0, 1)
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
  
    // UV coordinates for quad corners
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
  
    // RGBW colors for quad corners (Red, Green, Blue, White)
    const colors = [
      1.0, 0.0, 0.0, 1.0,  // Red (top-right)
      0.0, 1.0, 0.0, 1.0,  // Green (top-left)
      0.0, 0.0, 1.0, 1.0,  // Blue (bottom-right)
      1.0, 1.0, 1.0, 1.0,  // White (bottom-left)
    ];
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    return colorBuffer;
  }
  
export { initBuffers };
