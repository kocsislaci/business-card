attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewProjectionMatrix;

uniform sampler2D uDisplacementTexture;

varying vec3 vFragPos;
varying vec2 vTexCoord;

void main() {
    vec4 displacement = texture2D(uDisplacementTexture, aTexCoord);
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    worldPosition.z += displacement.r;

    vFragPos = vec3(worldPosition);
    vTexCoord = aTexCoord;
    gl_Position = uViewProjectionMatrix * worldPosition;    
}
