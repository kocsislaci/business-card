#version 300 es
precision highp float;

// GPU N-body integration step. Run once per frame over the texSize x texSize
// grid; each fragment is one star. Reads the previous position/velocity and
// writes the new ones via MRT (out 0 = position, out 1 = velocity).

uniform sampler2D uPosTex;   // xyz = position, w = mass
uniform sampler2D uVelTex;   // xyz = velocity
uniform int   uTexSize;
uniform float uDt;
uniform float uCoreStrength;
uniform float uG;
uniform float uStarStarStrength;
uniform float uSoftening;
uniform float uDamping;

layout(location = 0) out vec4 outPos;
layout(location = 1) out vec4 outVel;

void main() {
    ivec2 coord = ivec2(gl_FragCoord.xy);
    vec4 P = texelFetch(uPosTex, coord, 0);
    vec4 V = texelFetch(uVelTex, coord, 0);
    vec3 pos = P.xyz;
    vec3 vel = V.xyz;

    // Harmonic galactic core: inward pull proportional to radius (a = -k * pos).
    // This is the field in which "speed proportional to radius" is a circular
    // orbit, so the disk rotates rigidly and stays bound (no explosion).
    vec3 acc = -uCoreStrength * pos;

    // Full mutual N-body: every star pulls every other (softened, and scaled
    // down by uStarStarStrength so the core stays in charge). Self-interaction
    // contributes ~0 because the displacement is zero.
    float soft2 = uSoftening * uSoftening;
    float f = uG * uStarStarStrength;
    for (int y = 0; y < uTexSize; y++) {
        for (int x = 0; x < uTexSize; x++) {
            vec4 Pj = texelFetch(uPosTex, ivec2(x, y), 0);
            vec3 d = Pj.xyz - pos;
            float r2 = dot(d, d) + soft2;
            acc += f * Pj.w * d / (r2 * sqrt(r2));
        }
    }

    // Semi-implicit Euler: update velocity, then position with the new velocity.
    vel += acc * uDt;
    vel *= max(0.0, 1.0 - uDamping * uDt);
    pos += vel * uDt;

    outPos = vec4(pos, P.w);
    outVel = vec4(vel, 0.0);
}
