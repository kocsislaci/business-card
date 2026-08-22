#version 300 es
precision highp float;

// One vertex per star, drawn as a GL_POINT. The position is fetched from the
// simulation texture via gl_VertexID; color comes from galactocentric radius
// and each star gets a little random size/brightness so the field isn't sterile.

uniform sampler2D uPosTex;
uniform int  uTexSize;
uniform mat4 uViewProjection;
uniform float uPointSize;
uniform float uMinPointSize;
uniform float uMaxPointSize;
uniform vec3  uBulgeColor;
uniform vec3  uDiskColor;
uniform float uColorRadius;
uniform float uSizeVariation;
uniform float uBrightnessVariation;

out vec3 vColor;
out float vBrightness;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main() {
    int id = gl_VertexID;
    ivec2 coord = ivec2(id % uTexSize, id / uTexSize);
    vec3 pos = texelFetch(uPosTex, coord, 0).xyz;

    vec4 clip = uViewProjection * vec4(pos, 1.0);
    gl_Position = clip;

    // Warm, dusty core blending out to a cool blue-white disk.
    float radius = length(pos.xy);
    float t = clamp(radius / uColorRadius, 0.0, 1.0);
    vColor = mix(uBulgeColor, uDiskColor, t);

    // Per-star randomness so sizes and brightness vary star to star.
    float h1 = hash(float(id));
    float h2 = hash(float(id) + 17.0);
    float sizeMul = 1.0 + (h1 - 0.5) * uSizeVariation;
    vBrightness = 1.0 + (h2 - 0.5) * uBrightnessVariation;

    // Perspective-scaled point size: nearer stars appear larger.
    float s = uPointSize * sizeMul / max(clip.w, 0.001);
    gl_PointSize = clamp(s, uMinPointSize, uMaxPointSize);
}
