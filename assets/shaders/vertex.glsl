attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vColor;

void main() {
    vec4 mvPosition = uModelViewMatrix * aVertexPosition;
    vFragPos = vec3(mvPosition);
    vNormal = mat3(uModelViewMatrix) * aVertexNormal;
    vTexCoord = aTexCoord;
    vColor = aVertexColor;
    gl_Position = uProjectionMatrix * mvPosition;
}
