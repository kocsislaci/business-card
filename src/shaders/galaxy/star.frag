#version 300 es
precision highp float;

// Soft, round, emissive point. Output is premultiplied by its falloff so it can
// be additively blended (blendFunc(ONE, ONE)) into the HDR scene buffer.

uniform float uBrightness;

in vec3 vColor;
in float vBrightness;
out vec4 outColor;

void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    outColor = vec4(vColor * uBrightness * vBrightness * a, a);
}
