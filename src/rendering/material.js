import { loadTexture } from '../webgl-utils/textures.js';

export class Material {
  constructor(gl) {
    this.gl = gl;
    this.albedoTexture = null;
    this.ambientOcclusionTexture = null;
    this.normalTexture = null;
    this.roughnessTexture = null;
    this.metallicTexture = null;
  }

  async loadAlbedo(url) {
    const { texture, width, height } = await loadTexture(this.gl, url);
    this.albedoTexture = texture;
    return { width, height, aspectRatio: width / height };
  }

  async loadAmbientOcclusion(url) {
    const { texture, width, height } = await loadTexture(this.gl, url);
    this.ambientOcclusionTexture = texture;
    return { width, height, aspectRatio: width / height };
  }

  async loadNormal(url) {
    const { texture, width, height } = await loadTexture(this.gl, url);
    this.normalTexture = texture;
    return { width, height, aspectRatio: width / height };
  }

  async loadRoughness(url) {
    const { texture, width, height } = await loadTexture(this.gl, url);
    this.roughnessTexture = texture;
    return { width, height, aspectRatio: width / height };
  }

  async loadMetallic(url) {
    const { texture, width, height } = await loadTexture(this.gl, url);
    this.metallicTexture = texture;
    return { width, height, aspectRatio: width / height };
  }

  bind(gl, programInfo) {
    if (this.albedoTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);
      gl.uniform1i(programInfo.uniformLocations.albedoTexture, 0);
    }

    if (this.ambientOcclusionTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.ambientOcclusionTexture);
      gl.uniform1i(programInfo.uniformLocations.ambientOcclusionTexture, 1);
    }

    if (this.normalTexture) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
      gl.uniform1i(programInfo.uniformLocations.normalTexture, 2);
    }

    if (this.roughnessTexture) {
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.roughnessTexture);
      gl.uniform1i(programInfo.uniformLocations.roughnessTexture, 3);
    }

    if (this.metallicTexture) {
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, this.metallicTexture);
      gl.uniform1i(programInfo.uniformLocations.metallicTexture, 4);
    }
  }
}
