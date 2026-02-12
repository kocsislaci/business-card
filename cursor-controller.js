/**
 * Smoothing strategy for cursor movement using linear interpolation
 */
const lerpStrategy = {
  update(current, target, deltaTime, config, velocity, state) {
    const damping = config.damping || 10.0;
    // Frame-rate independent exponential smoothing
    const blend = 1.0 - Math.exp(-damping * deltaTime);
    
    return {
      position: {
        x: current.x + (target.x - current.x) * blend,
        y: current.y + (target.y - current.y) * blend
      },
      velocity
    };
  }
};

/**
 * Smoothing strategy using spring physics with mass-spring-damper system
 */
const springStrategy = {
  update(current, target, deltaTime, config, velocity, state) {
    const stiffness = config.stiffness || 150;
    const damping = config.damping || 10;
    
    // Spring force: F = -k * displacement - d * velocity
    const forceX = -stiffness * (current.x - target.x) - damping * velocity.x;
    const forceY = -stiffness * (current.y - target.y) - damping * velocity.y;
    
    // Update velocity (assuming mass = 1)
    const newVelocity = {
      x: velocity.x + forceX * deltaTime,
      y: velocity.y + forceY * deltaTime
    };
    
    // Update position
    const newPosition = {
      x: current.x + newVelocity.x * deltaTime,
      y: current.y + newVelocity.y * deltaTime
    };
    
    return {
      position: newPosition,
      velocity: newVelocity
    };
  }
};

/**
 * Easing functions for time-based animation
 */
const easingFunctions = {
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

/**
 * Smoothing strategy using easing functions with fixed duration
 */
const easingStrategy = {
  init() {
    this.state = {
      startPos: { x: 0, y: 0 },
      startTarget: { x: 0, y: 0 },
      elapsed: 0
    };
  },
  
  update(current, target, deltaTime, config, velocity, state) {
    if (!state.easingState) {
      state.easingState = {
        startPos: { ...current },
        startTarget: { ...target },
        elapsed: 0
      };
    }
    
    const duration = config.duration || 0.3;
    const easingFn = easingFunctions[config.easing || 'easeOutCubic'];
    
    // Check if target changed - restart animation
    if (target.x !== state.easingState.startTarget.x || target.y !== state.easingState.startTarget.y) {
      state.easingState.startPos = { ...current };
      state.easingState.startTarget = { ...target };
      state.easingState.elapsed = 0;
    }
    
    // Update elapsed time
    state.easingState.elapsed += deltaTime;
    const t = Math.min(state.easingState.elapsed / duration, 1.0);
    const easedT = easingFn(t);
    
    // Interpolate position
    const newPosition = {
      x: state.easingState.startPos.x + (target.x - state.easingState.startPos.x) * easedT,
      y: state.easingState.startPos.y + (target.y - state.easingState.startPos.y) * easedT
    };
    
    return {
      position: newPosition,
      velocity
    };
  }
};

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
  }
  
  /**
   * Update target position (typically from mouse events)
   */
  setTarget(x, y) {
    this.target.x = x;
    this.target.y = y;
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
    
    const strategyConfig = this.config[this.config.strategy];
    const result = strategy.update(this.current, this.target, deltaTime, strategyConfig, this.velocity, this.state);
    this.current = result.position;
    this.velocity = result.velocity;
  }
  
  /**
   * Get current cursor position
   */
  getPosition() {
    return { ...this.current };
  }
}
