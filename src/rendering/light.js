export class ConeLight {
  constructor(position, target, coneAngle, coneSoftness, intensity = 25.0, color = vec3.fromValues(1.0, 1.0, 1.0)) {
    this._position = vec3.fromValues(...position);
    this._target = vec3.fromValues(...target);
    this._coneAngle = coneAngle;
    this._coneSoftness = coneSoftness;
    this._intensity = intensity;
    this.color = color;
    this._direction = vec3.create();
    this.updateDirection();
  }
  
  updateDirection() {
    vec3.subtract(this._direction, this._target, this._position);
    vec3.normalize(this._direction, this._direction);
  }
  
  get position() {
    return this._position;
  }
  
  get direction() {
    return this._direction;
  }
  
  get coneAngle() {
    return this._coneAngle;
  }
  
  get coneSoftness() {
    return this._coneSoftness;
  }
  
  get intensity() {
    return this._intensity;
  }
  
  setTarget(x, y, z) {
    vec3.set(this._target, x, y, z);
    this.updateDirection();
  }
}
