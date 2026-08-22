#version 300 es
precision highp float;

// Keeps only the part of each pixel above the bloom threshold.

uniform sampler2D uScene;
uniform float uThreshold;

in vec2 vUv;
out vec4 outColor;

void main() {
    vec3 c = texture(uScene, vUv).rgb;
    float brightness = max(max(c.r, c.g), c.b);
    float k = max(brightness - uThreshold, 0.0) / max(brightness, 1e-4);
    outColor = vec4(c * k, 1.0);
}
