#version 300 es
precision highp float;

// Separable 9-tap Gaussian blur. Run once horizontally, once vertically.
// uDirection is the per-tap step in UV space (texel size * radius).

uniform sampler2D uTex;
uniform vec2 uDirection;

in vec2 vUv;
out vec4 outColor;

void main() {
    float w0 = 0.227027;
    float w1 = 0.1945946;
    float w2 = 0.1216216;
    float w3 = 0.054054;
    float w4 = 0.016216;

    vec3 result = texture(uTex, vUv).rgb * w0;

    result += texture(uTex, vUv + uDirection * 1.0).rgb * w1;
    result += texture(uTex, vUv - uDirection * 1.0).rgb * w1;
    result += texture(uTex, vUv + uDirection * 2.0).rgb * w2;
    result += texture(uTex, vUv - uDirection * 2.0).rgb * w2;
    result += texture(uTex, vUv + uDirection * 3.0).rgb * w3;
    result += texture(uTex, vUv - uDirection * 3.0).rgb * w3;
    result += texture(uTex, vUv + uDirection * 4.0).rgb * w4;
    result += texture(uTex, vUv - uDirection * 4.0).rgb * w4;

    outColor = vec4(result, 1.0);
}
