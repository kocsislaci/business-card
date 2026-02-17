import { lerpStrategy, springStrategy } from './strategies.js';

export class CursorController {
  constructor(config = {}) {
    this.current = { x: 0, y: 0 };
    this._target = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.state = {};
    this.config = {
      strategy: config.strategy || 'lerp',
      lerp: { damping: 10.0, ...config.lerp },
      spring: { stiffness: 150, damping: 10, ...config.spring },
    };
    
    this.strategies = {
      lerp: lerpStrategy,
      spring: springStrategy,
    };
    
    this.effectsPipeline = [];
  }
    
  addEffect(effect, config = {}) {
    this.effectsPipeline.push({
      effect,
      config,
      state: {}
    });
  }
  
  update(deltaTime) {
    const strategy = this.strategies[this.config.strategy];
    if (!strategy) {
      throw new Error(`Unknown smoothing strategy: ${this.config.strategy}`);
    }
    
    const strategyConfig = this.config[this.config.strategy];
    const result = strategy.update(this.current, this._target, deltaTime, strategyConfig, this.velocity);
    
    let state = {
      position: result.position,
      velocity: result.velocity,
      target: this._target
    };
    
    for (const { effect, config, state: effectState } of this.effectsPipeline) {
      const applyFn = typeof effect === 'function' ? effect : effect.apply.bind(effect);
      state = applyFn(state, deltaTime, effectState, config);
    }
    
    this.current = state.position;
    this.velocity = state.velocity;
  }

  set target(value) {
    this._target.x = value.x;
    this._target.y = value.y;
  }
  
  get position() {
    return { ...this.current };
  }
}
