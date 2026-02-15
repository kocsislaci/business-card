export class Camera {
  constructor(position, target, up, fov, aspect) {
    this.position = vec3.fromValues(position[0], position[1], position[2]);
    this.target = vec3.fromValues(target[0], target[1], target[2]);
    this.up = vec3.fromValues(up[0], up[1], up[2]);
    this.fov = fov * Math.PI / 180;
    this.aspect = aspect;
    this.near = 0.1;
    this.far = 100;
    
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();
    
    this.updateMatrices();
  }
  
  updateMatrices() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
    mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
  }
  
  getViewMatrix() {
    return this.viewMatrix;
  }

  getViewProjectionMatrix() {
    return this.viewProjectionMatrix;
  }

  getPosition() {
    return this.position;
  }

  getTarget() {
    return this.target;
  }

  getViewDirection() {
    const viewDirection = vec3.create();
    vec3.subtract(viewDirection, this.target, this.position);
    vec3.normalize(viewDirection, viewDirection);
    return viewDirection;
  }

  getFov() {
    return this.fov;
  }

  getAspect() {
    return this.aspect;
  }
  
  setPosition(x, y, z) {
    vec3.set(this.position, x, y, z);
    this.updateMatrices();
  }
  
  lookAt(targetX, targetY, targetZ) {
    vec3.set(this.target, targetX, targetY, targetZ);
    this.updateMatrices();
  }
  
  setAspect(aspect) {
    this.aspect = aspect;
    this.updateMatrices();
  }
}
