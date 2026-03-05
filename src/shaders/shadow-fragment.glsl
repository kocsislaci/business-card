precision highp float;

uniform sampler2D uAlbedoTexture;
varying vec2 vTexCoord;

void main() {
    float alpha = texture2D(uAlbedoTexture, vTexCoord).a;
    if (alpha < 0.5) discard;

    float depth = gl_FragCoord.z;
    gl_FragColor = vec4(depth, depth, depth, alpha);
}
