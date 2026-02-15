attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewProjectionMatrix;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vColor;

void main() {
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    vFragPos = vec3(worldPosition);
    vNormal = mat3(uModelMatrix) * aVertexNormal;
    vTexCoord = aTexCoord;
    vColor = aVertexColor;
    gl_Position = uViewProjectionMatrix * worldPosition;
}
