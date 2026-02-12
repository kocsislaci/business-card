import { initBuffers } from './init-buffers.js';
import { drawScene } from './draw-scene.js';
import { CursorController, handShakeEffect } from './cursor-controller.js';

const cursorLerpConfig = {
  strategy: 'lerp',
  lerp: { damping: 10.0 }
}

const cursorSpringConfig = {
  strategy: 'spring',
  spring: { stiffness: 150, damping: 10 }
};

const cursorEasingConfig = {
  strategy: 'easing',
  easing: { duration: 0.3, easing: 'easeOutCubic' }
};
const cursorController = new CursorController(cursorLerpConfig);

// Add hand-shake effect to cursor (active when moving)
cursorController.addEffect(handShakeEffect, {
  intensity: 0.0002,
  frequency: 8.0,
  velocityScale: 0.5,
  minVelocity: 0.05
});

// Add idle hand effect (active when stationary)
cursorController.addEffect(idleHandEffect, {
  intensity: 0.002,
  frequency: 0.2,
  maxVelocity: 0.0001,
  pattern: 'organic'
});

main();

async function main() {    
    const gl = document.querySelector("#canvas").getContext("webgl");
    if (gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it.",
      );
      return;
    }

    // Mouse tracking across entire viewport
    window.addEventListener('mousemove', (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -((event.clientY / window.innerHeight) * 2 - 1);
        cursorController.setTarget(x, y);
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

    let lastTime = 0;
    function render(currentTime) {
        // Calculate deltaTime in seconds
        const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // Update cursor position with smoothing
        cursorController.update(deltaTime);
        const cursorState = cursorController.getPosition();

        drawScene(gl, programInfo, buffers, texture, cursorState);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
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
