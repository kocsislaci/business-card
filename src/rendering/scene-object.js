import { mat4, vec3 } from 'gl-matrix';
import { createQuadGeometry } from './geometry.js';
import { Material } from './material.js';
import { toRadians } from '../webgl-utils/degree.js';

export class SceneObject {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.modelMatrix = mat4.create();
  }

  setPosition(position) {
    const translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, position);
    const result = mat4.create();
    mat4.multiply(result, this.modelMatrix, translationMatrix);
    mat4.copy(this.modelMatrix, result);
    return this;
  }

  setRotation(rotation) {
    const rotationMatrix = mat4.create();
    mat4.rotateX(rotationMatrix, rotationMatrix, toRadians(rotation[0]));
    mat4.rotateY(rotationMatrix, rotationMatrix, toRadians(rotation[1]));
    mat4.rotateZ(rotationMatrix, rotationMatrix, toRadians(rotation[2]));
    mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
    return this;
  }
  
  setScale(scale) {
    const scaleMatrix = mat4.create();
    mat4.scale(scaleMatrix, scaleMatrix, scale);
    mat4.multiply(this.modelMatrix, this.modelMatrix, scaleMatrix);
    return this;
  }

  draw(gl, programInfo) {
    this.geometry.bind(gl, programInfo);
    this.material.bind(gl, programInfo);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, this.modelMatrix);
    if (this.geometry.indices) {
      gl.drawElements(this.geometry.drawMode, this.geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(this.geometry.drawMode, 0, this.geometry.vertexCount);
    }
  }

  drawShadow(gl, shadowProgramInfo) {
    this.geometry.bind(gl, shadowProgramInfo);
    if (this.material.displacementTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.material.displacementTexture);
      gl.uniform1i(shadowProgramInfo.uniformLocations.displacementTexture, 0);
    }
    if (this.material.albedoTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.material.albedoTexture);
      gl.uniform1i(shadowProgramInfo.uniformLocations.albedoTexture, 1);
    }
    gl.uniformMatrix4fv(shadowProgramInfo.uniformLocations.modelMatrix, false, this.modelMatrix);
    if (this.geometry.indices) {
      gl.drawElements(this.geometry.drawMode, this.geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(this.geometry.drawMode, 0, this.geometry.vertexCount);
    }
  }
}

export async function createSceneObject(
    gl,
    textureRoot = '/assets/textures/object-name',
    scale = vec3.fromValues(1.0, 1.0, 1.0),
    position = vec3.fromValues(0.0, 0.0, 0.0),
    rotation = vec3.fromValues(0.0, 0.0, 0.0)
  ) {
    const material = new Material(gl);
    const [
      { aspectRatio },
    ] = await Promise.all([
      material.loadAlbedo(`${textureRoot}-a.webp`),
      material.loadAmbientOcclusion(`${textureRoot}-ao.webp`),
      material.loadNormal(`${textureRoot}-n.webp`),
      material.loadRoughness(`${textureRoot}-r.webp`),
      material.loadDisplacement(`${textureRoot}-d.webp`),
    ]);
    const geometry = createQuadGeometry(gl, aspectRatio);
    const sceneObject = new SceneObject(geometry, material);
    sceneObject.setScale(scale);
    sceneObject.setRotation(rotation);
    sceneObject.setPosition(position);
  
    return sceneObject;
  }
  