import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  constructor(position, target, up, fov, aspect, tiltSensitivity = 0.4, baseTarget = vec3.fromValues(0, 0, -1)) {
    this._position = position;
    this._target = target;
    this._up = up;
    this._fov = fov * Math.PI / 180;
    this._aspect = aspect;
    this.near = 0.1;
    this.far = 100;
    
    this._viewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();
    this._tiltSensitivity = tiltSensitivity;
    this._baseTarget = baseTarget;

    this.updateMatrices();
  }
  
  updateMatrices() {
    mat4.lookAt(this._viewMatrix, this._position, this._target, this._up);
    mat4.perspective(this._projectionMatrix, this._fov, this._aspect, this.near, this.far);
    mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);
  }
  
  get viewMatrix() {
    return this._viewMatrix;
  }

  get viewProjectionMatrix() {
    return this._viewProjectionMatrix;
  }

  get position() {
    return this._position;
  }

  get target() {
    return this._target;
  }

  get fov() {
    return this._fov;
  }

  get aspect() {
    return this._aspect;
  }

  set aspect(value) {
    this._aspect = value;
    this.updateMatrices();
  }

  get tiltSensitivity() {
    return this._tiltSensitivity;
  }

  get baseTarget() {
    return this._baseTarget;
  }
  
  lookAt(targetX, targetY, targetZ) {
    vec3.set(this._target, targetX, targetY, targetZ);
    this.updateMatrices();
  }
}
