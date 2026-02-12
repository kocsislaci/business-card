import { initBuffers } from './init-buffers.js';
import { drawScene } from './draw-scene.js';

const mouseState = { x: 0.0, y: 0.0 };

main();

async function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
  
    if (gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it.",
      );
      return;
    }

    // Mouse tracking
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseState.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseState.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    });

    const vertexShaderSource = await loadShaderFile('./vertex.glsl');
    const fragmentShaderSource = await loadShaderFile('./fragment.glsl');
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
          vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
          texCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
          vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
          texture: gl.getUniformLocation(shaderProgram, "uTexture"),
          lightPos: gl.getUniformLocation(shaderProgram, "uLightPos"),
          lightDir: gl.getUniformLocation(shaderProgram, "uLightDir"),
          coneAngle: gl.getUniformLocation(shaderProgram, "uConeAngle"),
          coneSoftness: gl.getUniformLocation(shaderProgram, "uConeSoftness"),
          cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),
        },
    };
    const buffers = initBuffers(gl);
    const texture = loadTexture(gl);

    function render() {
        drawScene(gl, programInfo, buffers, texture, mouseState);
        requestAnimationFrame(render);
    }
    render();
}

function loadTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Placeholder 1x1 pixel texture while image loads
    const pixel = new Uint8Array([255, 100, 150, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

async function loadShaderFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        alert(`Failed to load shader file: ${url}`);
        return null;
    }
    return await response.text();
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram,
        )}`,
      );
      return null;
    }
  
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);  
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
      );
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;  
}
