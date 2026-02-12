precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uConeAngle;
uniform float uConeSoftness;
uniform vec3 uCameraPos;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;
varying vec4 vColor;

void main() {
    vec3 baseColor = vColor.rgb;
    vec3 norm = normalize(vNormal);
    
    // Light direction from light to fragment
    vec3 lightToFrag = normalize(vFragPos - uLightPos);
    
    // Cone attenuation
    float theta = dot(lightToFrag, normalize(uLightDir));
    float cutoff = cos(uConeAngle);
    float outerCutoff = cos(uConeAngle + uConeSoftness);
    float spotEffect = smoothstep(outerCutoff, cutoff, theta);
    
    // Ambient
    vec3 ambient = 0.1 * baseColor;
    
    // Diffuse
    float diff = max(dot(norm, -lightToFrag), 0.0);
    vec3 diffuse = diff * baseColor * spotEffect;
    
    // Specular
    vec3 viewDir = normalize(uCameraPos - vFragPos);
    vec3 reflectDir = reflect(lightToFrag, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = vec3(0.5) * spec * spotEffect;
    
    vec3 finalColor = ambient + diffuse + specular;
    gl_FragColor = vec4(finalColor, 1.0);
}
