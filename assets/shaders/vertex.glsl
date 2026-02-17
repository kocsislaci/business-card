attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewProjectionMatrix;

varying vec3 vFragPos;
varying vec2 vTexCoord;

void main() {
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    vFragPos = vec3(worldPosition);
    vTexCoord = aTexCoord;
    gl_Position = uViewProjectionMatrix * worldPosition;
}
