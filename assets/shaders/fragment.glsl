precision highp float;

uniform sampler2D uTexture;
uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uConeAngle;
uniform float uConeSoftness;
uniform float uLightIntensity;
uniform vec3 uCameraPos;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vColor;

void main() {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    vec3 baseColor = texColor.rgb;
    vec3 norm = normalize(vNormal);
    
    // Light direction from light to fragment
    vec3 lightToFrag = normalize(vFragPos - uLightPos);
    
    // Distance from light to fragment
    float distance = length(vFragPos - uLightPos);
    
    // Inverse square law attenuation (physically based)
    float attenuation = uLightIntensity / (distance * distance);
    
    // Cone attenuation
    float theta = dot(lightToFrag, normalize(uLightDir));
    float cutoff = cos(uConeAngle);
    float outerCutoff = cos(uConeAngle + uConeSoftness);
    float spotEffect = smoothstep(outerCutoff, cutoff, theta);
    
    // Combine both attenuations for realistic flashlight
    float finalAttenuation = attenuation * spotEffect;
    
    // Ambient
    vec3 ambient = 0.1 * baseColor;
    
    // Diffuse
    float diff = max(dot(norm, -lightToFrag), 0.0);
    vec3 diffuse = diff * baseColor * finalAttenuation;
    
    // Specular (Blinn-Phong)
    vec3 viewDir = normalize(uCameraPos - vFragPos);
    vec3 halfDir = normalize(-lightToFrag + viewDir);
    float spec = pow(max(dot(norm, halfDir), 0.0), 32.0);
    vec3 specular = vec3(0.5) * spec * finalAttenuation;
    
    vec3 finalColor = ambient + diffuse + specular;
    gl_FragColor = vec4(finalColor, 1.0);
}
