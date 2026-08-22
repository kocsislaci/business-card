#version 300 es

// Generates a full-screen triangle from gl_VertexID (no vertex buffer needed).
// vUv spans 0..1 across the visible area.
out vec2 vUv;

void main() {
    vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    vUv = p;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
