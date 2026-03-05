precision highp float;

const float PI = 3.14159265359;
const float GAMMA = 2.2;

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

varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vLightSpacePos;

float calculateSpotEffect(vec3 w_i, vec3 lightDir, float coneAngle, float coneSoftness);
float getShadowFactor(vec4 lightSpacePos);
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

    vec3 F0 = mix(vec3(0.04), albedo, 0.0); // 0.0 is the metallic value

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
    vec3 kD = vec3(1.0) - kS;
    // kD *= 1.0 - metallic; // metallic is 0.0 for non-metallic materials

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(n, v), 0.0) * max(dot(n, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(n, L), 0.0);
    float rawShadowFactor = getShadowFactor(vLightSpacePos);
    float shadowFactor = mix(1.0, rawShadowFactor, spotEffect);
    Lo += (kD * albedo / PI + specular) * radiance * NdotL * shadowFactor;

    vec3 ambient = 0.002 * ao * albedo;

    vec3 finalColor = ambient + Lo;

    // finalColor = pow(finalColor, vec3(1.0 / GAMMA));

    gl_FragColor = vec4(finalColor, albedoAlpha);
}

float sampleShadow(vec2 uv, float currentDepth, float bias) {
    return currentDepth - bias <= texture2D(uShadowMap, uv).r ? 1.0 : 0.0;
}

float getShadowFactor(vec4 lightSpacePos) {
    vec3 ndc = lightSpacePos.xyz / lightSpacePos.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 1.0;
    float currentDepth = ndc.z * 0.5 + 0.5;
    float bias = 0.005;

    // PCF: 5x5 kernel for smooth shadow edges
    float shadow = 0.0;
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * uShadowMapPixelSize;
            shadow += sampleShadow(uv + offset, currentDepth, bias);
        }
    }
    return shadow / 25.0;
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
