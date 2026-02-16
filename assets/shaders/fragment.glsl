precision highp float;

const float PI = 3.14159265359;
const float GAMMA = 2.2;

uniform sampler2D uAlbedoTexture;
uniform sampler2D uAmbientOcclusionTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRoughnessTexture;
uniform sampler2D uMetallicTexture;

uniform vec3 uCameraPos;

uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uConeAngle;
uniform float uConeSoftness;
uniform float uLightIntensity;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vColor;

float calculateSpotEffect(vec3 w_i, vec3 lightDir, float coneAngle, float coneSoftness);
float distributionGGX(vec3 N, vec3 H, float roughness);
float geometrySchlickGGX(float NdotV, float roughness);
float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness);
vec3 fresnelSchlick(float cosTheta, vec3 F0);

void main() {
    vec3 albedo = texture2D(uAlbedoTexture, vTexCoord).rgb;
    vec3 n = normalize(texture2D(uNormalTexture, vTexCoord).rgb);
    float ao = texture2D(uAmbientOcclusionTexture, vTexCoord).r;
    float roughness = texture2D(uRoughnessTexture, vTexCoord).r;
    float metallic = texture2D(uMetallicTexture, vTexCoord).r;

    vec3 w_i = normalize(vFragPos - uLightPos);
    vec3 v = normalize(uCameraPos - vFragPos);
    float cosTheta = max(dot(n, -w_i), 0.0);

    vec3 F0 = mix(vec3(0.04), albedo, metallic);

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
    kD *= 1.0 - metallic;

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(n, v), 0.0) * max(dot(n, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(n, L), 0.0);
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;

    vec3 ambient = 0.06 * ao * albedo;

    vec3 finalColor = ambient + Lo;

    // finalColor = finalColor / (finalColor + vec3(1.0));
    // finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, 1.0);
}

float calculateSpotEffect(vec3 w_i, vec3 lightDir, float coneAngle, float coneSoftness) {
    float theta = dot(w_i, normalize(lightDir));
    float cutoff = cos(coneAngle);
    float outerCutoff = cos(coneAngle + coneSoftness);
    return smoothstep(outerCutoff, cutoff, theta);
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
