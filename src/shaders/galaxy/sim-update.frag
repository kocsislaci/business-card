#version 300 es
precision highp float;

// GPU N-body integration step. Run once per frame over the texSize x texSize
// grid; each fragment is one star. Reads the previous position/velocity and
// writes the new ones via MRT (out 0 = position, out 1 = velocity).

// State textures are RGBA32UI holding raw float bits (see gpgpu.js), so they
// are read as uints and decoded with uintBitsToFloat.
uniform highp usampler2D uPosTex;   // xyz = position, w = mass
uniform highp usampler2D uVelTex;   // xyz = velocity
uniform int   uTexSize;
uniform float uDt;
uniform float uCoreStrength;
uniform float uG;
uniform float uStarStarStrength;
uniform float uSoftening;
uniform float uDamping;
uniform int   uSampleStride;  // 1 = every partner (exact), k = every k-th (cost / k)
uniform int   uFrame;         // rotates the sample offset so the error averages out

layout(location = 0) out uvec4 outPos;
layout(location = 1) out uvec4 outVel;

void main() {
    ivec2 coord = ivec2(gl_FragCoord.xy);
    vec4 P = uintBitsToFloat(texelFetch(uPosTex, coord, 0));
    vec4 V = uintBitsToFloat(texelFetch(uVelTex, coord, 0));
    vec3 pos = P.xyz;
    vec3 vel = V.xyz;

    // Harmonic galactic core: inward pull proportional to radius (a = -k * pos).
    // This is the field in which "speed proportional to radius" is a circular
    // orbit, so the disk rotates rigidly and stays bound (no explosion).
    vec3 acc = -uCoreStrength * pos;

    // Mutual N-body, sampled: each star sums over every uSampleStride-th
    // partner and scales the result by the stride, so the expected force is the
    // full O(N^2) sum at 1/stride of the cost. The start offset differs per star
    // and rotates every frame, so the sampling error changes direction each
    // step and the integrator averages it out. Self-interaction contributes ~0
    // because the displacement is zero. uStarStarStrength keeps the core in
    // charge.
    float soft2 = uSoftening * uSoftening;
    float f = uG * uStarStarStrength * float(uSampleStride);
    int N = uTexSize * uTexSize;
    int self = coord.y * uTexSize + coord.x;
    int start = (self * 7 + uFrame) % uSampleStride;
    for (int j = start; j < N; j += uSampleStride) {
        ivec2 c = ivec2(j % uTexSize, j / uTexSize);
        vec4 Pj = uintBitsToFloat(texelFetch(uPosTex, c, 0));
        vec3 d = Pj.xyz - pos;
        float r2 = dot(d, d) + soft2;
        acc += f * Pj.w * d / (r2 * sqrt(r2));
    }

    // Semi-implicit Euler: update velocity, then position with the new velocity.
    vel += acc * uDt;
    vel *= max(0.0, 1.0 - uDamping * uDt);
    pos += vel * uDt;

    outPos = floatBitsToUint(vec4(pos, P.w));
    outVel = floatBitsToUint(vec4(vel, 0.0));
}
