#version 300 es
precision highp float;

// Procedural deep-field "skybox". For each pixel a world-space ray direction is
// reconstructed from the inverse view-projection, so the whole background drifts
// naturally as the camera tilts. Layers: background mottling + nebula clouds +
// faint distant galaxies + distant stars.

uniform mat4  uInvViewProjection;
uniform vec3  uCameraPos;
uniform vec3  uBackgroundColor;
uniform vec3  uNebulaColorA;
uniform vec3  uNebulaColorB;
uniform float uNebulaIntensity;
uniform float uNebulaScale;
uniform float uStarBrightness;
uniform float uStarDensity;

in vec2 vUv;
out vec4 outColor;

float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
}

// Value noise in 3D.
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash13(i + vec3(0, 0, 0));
    float n100 = hash13(i + vec3(1, 0, 0));
    float n010 = hash13(i + vec3(0, 1, 0));
    float n110 = hash13(i + vec3(1, 1, 0));
    float n001 = hash13(i + vec3(0, 0, 1));
    float n101 = hash13(i + vec3(1, 0, 1));
    float n011 = hash13(i + vec3(0, 1, 1));
    float n111 = hash13(i + vec3(1, 1, 1));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
               mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}

float fbm(vec3 p, int octaves) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        sum += amp * noise(p);
        p *= 2.02;
        amp *= 0.5;
    }
    return sum;
}

// A layer of distant stars laid out in 3D direction cells.
vec3 starLayer(vec3 dir, float scale, float threshold, float radius, float bright) {
    vec3 p = dir * scale;
    vec3 cell = floor(p);
    vec3 f = fract(p);
    vec3 rnd = hash33(cell);
    if (rnd.x < threshold) return vec3(0.0);

    vec3 center = vec3(0.5) + (hash33(cell + 1.7) - 0.5) * 0.5;
    float d = length(f - center);
    float c = smoothstep(radius, 0.0, d);
    c = pow(c, 3.0);

    vec3 tint = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.88, 0.72), rnd.y);
    return tint * c * bright * (0.4 + 0.6 * rnd.z);
}

// Rare, faint elliptical smudges standing in for distant galaxies.
vec3 galaxyLayer(vec3 dir, float scale, float threshold) {
    vec3 p = dir * scale;
    vec3 cell = floor(p);
    vec3 f = fract(p);
    vec3 rnd = hash33(cell + 5.3);
    if (rnd.x < threshold) return vec3(0.0);

    vec3 center = vec3(0.5) + (hash33(cell + 9.1) - 0.5) * 0.4;
    vec3 q = f - center;
    q.x *= 1.0 + rnd.y * 1.8;        // squash into an ellipse
    float d = length(q);
    float c = smoothstep(0.34, 0.0, d);
    c = pow(c, 2.0);

    vec3 tint = mix(vec3(1.0, 0.82, 0.7), vec3(0.7, 0.82, 1.0), rnd.z);
    return tint * c * 0.6;
}

void main() {
    // Reconstruct the world-space view ray for this pixel.
    vec2 ndc = vUv * 2.0 - 1.0;
    vec4 far = uInvViewProjection * vec4(ndc, 1.0, 1.0);
    vec3 dir = normalize(far.xyz / far.w - uCameraPos);

    // Background radiation: faint large-scale mottling over the base tint.
    float rad = fbm(dir * 1.5, 3);
    vec3 color = uBackgroundColor * (0.6 + 0.9 * rad);

    // Nebula clouds: patchy FBM, two-tone, kept subtle.
    float clouds = fbm(dir * uNebulaScale + 11.0, 5);
    float mask = smoothstep(0.45, 0.95, clouds);
    float toneMix = noise(dir * uNebulaScale * 2.0 + 30.0);
    vec3 nebula = mix(uNebulaColorA, uNebulaColorB, toneMix) * mask;
    color += nebula * uNebulaIntensity;

    // Distant galaxies (very sparse).
    color += galaxyLayer(dir, 16.0, 0.985) * uNebulaIntensity;

    // Distant stars: a dense faint layer plus a sparse bright layer.
    float faintThreshold = 1.0 - 0.35 * uStarDensity;
    float brightThreshold = 1.0 - 0.06 * uStarDensity;
    color += starLayer(dir, 240.0, faintThreshold, 0.20, 1.0) * uStarBrightness;
    color += starLayer(dir, 95.0, brightThreshold, 0.24, 2.4) * uStarBrightness;

    outColor = vec4(color, 1.0);
}
