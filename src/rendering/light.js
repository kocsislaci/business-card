export class ConeLight {
  constructor(position, target, coneAngle, coneSoftness, intensity = 25.0, color = vec3.fromValues(1.0, 1.0, 1.0)) {
    this.position = vec3.fromValues(...position);
    this.target = vec3.fromValues(...target);
    this.coneAngle = coneAngle;
    this.coneSoftness = coneSoftness;
    this.intensity = intensity;
    this.color = color;
    this.direction = vec3.create();
    this.updateDirection();
  }
  
  updateDirection() {
    vec3.subtract(this.direction, this.target, this.position);
    vec3.normalize(this.direction, this.direction);
  }
  
  getPosition() {
    return this.position;
  }
  
  getDirection() {
    return this.direction;
  }
  
  getConeAngle() {
    return this.coneAngle;
  }
  
  getConeSoftness() {
    return this.coneSoftness;
  }
  
  getIntensity() {
    return this.intensity;
  }
  
  setPosition(x, y, z) {
    vec3.set(this.position, x, y, z);
    this.updateDirection();
  }
  
  setTarget(x, y, z) {
    vec3.set(this.target, x, y, z);
    this.updateDirection();
  }
}
