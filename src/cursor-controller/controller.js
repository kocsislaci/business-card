import { lerpStrategy, springStrategy, easingStrategy } from './strategies.js';

/**
 * CursorController manages smooth cursor position updates
 * with pluggable smoothing strategies
 */
export class CursorController {
  constructor(config = {}) {
    this.current = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.state = {};
    this.config = {
      strategy: config.strategy || 'lerp',
      lerp: { damping: 10.0, ...config.lerp },
      spring: { stiffness: 150, damping: 10, ...config.spring },
      easing: { duration: 0.3, easing: 'easeOutCubic', ...config.easing }
    };
    
    this.strategies = {
      lerp: lerpStrategy,
      spring: springStrategy,
      easing: easingStrategy
    };
    
    // Effects pipeline for post-processing position modifications
    this.effectsPipeline = [];
  }
  
  /**
   * Update target position (typically from mouse events)
   */
  setTarget(x, y) {
    this.target.x = x;
    this.target.y = y;
  }
  
  /**
   * Add an effect to the processing pipeline
   * @param {EffectFunction|EffectObject} effect - Effect function or object with apply() method
   * @param {Object} config - Configuration parameters passed to the effect
   */
  addEffect(effect, config = {}) {
    this.effectsPipeline.push({
      effect,
      config,
      state: {} // Isolated state object for this effect
    });
  }
  
  /**
   * Remove all effects from the pipeline
   */
  clearEffects() {
    this.effectsPipeline = [];
  }
  
  /**
   * Update current position using the selected smoothing strategy
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    const strategy = this.strategies[this.config.strategy];
    if (!strategy) {
      throw new Error(`Unknown smoothing strategy: ${this.config.strategy}`);
    }
    
    // Calculate base position using smoothing strategy
    const strategyConfig = this.config[this.config.strategy];
    const result = strategy.update(this.current, this.target, deltaTime, strategyConfig, this.velocity, this.state);
    
    // Process through effects pipeline
    let state = {
      position: result.position,
      velocity: result.velocity,
      target: this.target
    };
    
    for (const { effect, config, state: effectState } of this.effectsPipeline) {
      // Support both function and object with apply() method
      const applyFn = typeof effect === 'function' ? effect : effect.apply.bind(effect);
      state = applyFn(state, deltaTime, effectState, config);
    }
    
    // Apply final state
    this.current = state.position;
    this.velocity = state.velocity;
  }
  
  /**
   * Get current cursor position
   */
  getPosition() {
    return { ...this.current };
  }
}
