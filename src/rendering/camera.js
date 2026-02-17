import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  constructor(position, target, up, fov, aspect) {
    this._position = vec3.fromValues(position[0], position[1], position[2]);
    this._target = vec3.fromValues(target[0], target[1], target[2]);
    this._up = vec3.fromValues(up[0], up[1], up[2]);
    this._fov = fov * Math.PI / 180;
    this._aspect = aspect;
    this.near = 0.1;
    this.far = 100;
    
    this._viewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();
    
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
  
  lookAt(targetX, targetY, targetZ) {
    vec3.set(this._target, targetX, targetY, targetZ);
    this.updateMatrices();
  }
}
