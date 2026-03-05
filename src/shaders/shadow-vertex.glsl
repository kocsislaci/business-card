attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uLightViewProjectionMatrix;
uniform sampler2D uDisplacementTexture;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 displacement = texture2D(uDisplacementTexture, aTexCoord);
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    worldPosition.z += displacement.r;

    gl_Position = uLightViewProjectionMatrix * worldPosition;
}
