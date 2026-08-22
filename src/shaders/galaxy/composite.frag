#version 300 es
precision highp float;

// Combines the HDR scene with the blurred bloom, applies exposure, ACES tone
// mapping and gamma, then writes the final LDR image to the screen.

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomIntensity;
uniform float uExposure;
uniform float uVignette;
uniform float uAspect;

in vec2 vUv;
out vec4 outColor;

vec3 aces(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
    vec3 scene = texture(uScene, vUv).rgb;
    vec3 bloom = texture(uBloom, vUv).rgb;

    vec3 color = scene + bloom * uBloomIntensity;

    // Vignette to darken the frame edges and frame the galaxy.
    vec2 d = vUv - 0.5;
    d.x *= uAspect;
    float r = length(d);
    float vignette = 1.0 - uVignette * smoothstep(0.35, 0.95, r);
    color *= vignette;

    color *= uExposure;
    color = aces(color);
    color = pow(color, vec3(1.0 / 2.2));

    outColor = vec4(color, 1.0);
}
