precision highp float;

const float PI = 3.14159265359;
const float GAMMA = 2.2;
float getKernelWeight(int x, int y) {
    int i = (y + 2) * 5 + (x + 2);
    if (i == 0) return 0.002969;
    if (i == 1) return 0.013306;
    if (i == 2) return 0.021938;
    if (i == 3) return 0.013306;
    if (i == 4) return 0.002969;
    if (i == 5) return 0.013306;
    if (i == 6) return 0.059634;
    if (i == 7) return 0.098320;
    if (i == 8) return 0.059634;
    if (i == 9) return 0.013306;
    if (i == 10) return 0.021938;
    if (i == 11) return 0.098320;
    if (i == 12) return 0.162103;
    if (i == 13) return 0.098320;
    if (i == 14) return 0.021938;
    if (i == 15) return 0.013306;
    if (i == 16) return 0.059634;
    if (i == 17) return 0.098320;
    if (i == 18) return 0.059634;
    if (i == 19) return 0.013306;
    if (i == 20) return 0.002969;
    if (i == 21) return 0.013306;
    if (i == 22) return 0.021938;
    if (i == 23) return 0.013306;
    return 0.002969;
}

uniform sampler2D uAlbedoTexture;
uniform sampler2D uAmbientOcclusionTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;

uniform vec3 uCameraPos;

uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uConeAngle;
uniform float uConeSoftness;
uniform float uLightIntensity;
uniform vec3 uLightColor;
uniform sampler2D uShadowMap;
uniform vec2 uShadowMapPixelSize;
uniform float uMetallic;

varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vLightSpacePos;

float calculateSpotEffect(vec3 w_i, vec3 lightDir, float coneAngle, float coneSoftness);
float getShadowFactor(vec4 lightSpacePos, float bias);
float distributionGGX(vec3 N, vec3 H, float roughness);
float geometrySchlickGGX(float NdotV, float roughness);
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness);
vec3 fresnelSchlick(float cosTheta, vec3 F0);

void main() {
    vec3 albedo = texture2D(uAlbedoTexture, vTexCoord).rgb;
    float albedoAlpha = texture2D(uAlbedoTexture, vTexCoord).a;
    vec3 n = normalize(texture2D(uNormalTexture, vTexCoord).rgb);
    float ao = texture2D(uAmbientOcclusionTexture, vTexCoord).r;
    float roughness = texture2D(uRoughnessTexture, vTexCoord).r;

    vec3 w_i = normalize(vFragPos - uLightPos);
    vec3 v = normalize(uCameraPos - vFragPos);
    float cosTheta = max(dot(n, -w_i), 0.0);

    vec3 F0 = mix(vec3(0.04), albedo, uMetallic);

    vec3 Lo = vec3(0.0);

    vec3 L = normalize(uLightPos - vFragPos);
    vec3 H = normalize(v + L);

    float dist = length(vFragPos - uLightPos);
    float attenuation = 1.0 / (dist * dist);
    float spotEffect = calculateSpotEffect(w_i, uLightDir, uConeAngle, uConeSoftness);
    float finalAttenuation = attenuation * spotEffect;

    vec3 radiance = uLightColor * uLightIntensity * finalAttenuation;        

    float NDF = distributionGGX(n, H, roughness);
    float G = geometrySmith(n, v, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, v), 0.0), F0);

    vec3 kS = F;
    vec3 kD = (vec3(1.0) - kS) * (1.0 - uMetallic);

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(n, v), 0.0) * max(dot(n, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(n, L), 0.0);
    float shadowBias = max(0.003, 0.02 * (1.0 - NdotL));
    float rawShadowFactor = getShadowFactor(vLightSpacePos, shadowBias);
    float shadowFactor = mix(1.0, rawShadowFactor, spotEffect);
    Lo += (kD * albedo / PI + specular) * radiance * NdotL * shadowFactor;

    vec3 ambient = 0.002 * ao * albedo;

    vec3 finalColor = ambient + Lo;

    finalColor = pow(finalColor, vec3(1.0 / GAMMA));

    gl_FragColor = vec4(finalColor, albedoAlpha);
}

float sampleShadow(vec2 uv, float currentDepth, float bias) {
    return currentDepth - bias <= texture2D(uShadowMap, uv).r ? 1.0 : 0.0;
}

float getShadowFactor(vec4 lightSpacePos, float bias) {
    vec3 ndc = lightSpacePos.xyz / lightSpacePos.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 1.0;
    float currentDepth = ndc.z * 0.5 + 0.5;

    // PCF: 5x5 Gaussian kernel with texel-sized offsets
    float shadow = 0.0;
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * uShadowMapPixelSize;
            shadow += getKernelWeight(x, y) * sampleShadow(uv + offset, currentDepth, bias);
        }
    }
    return shadow;
}

float calculateSpotEffect(vec3 w_i, vec3 lightDir, float coneAngle, float coneSoftness) {
    float theta = dot(w_i, normalize(lightDir));
    float cutoff = cos(coneAngle);
    float outerCutoff = cos(coneAngle + coneSoftness);
    float t = smoothstep(outerCutoff, cutoff, theta);
    return t * t;
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return num / denom;
}

float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = geometrySchlickGGX(NdotV, roughness);
    float ggx1  = geometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}  
