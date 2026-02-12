/**
 * Effect Interface
 * 
 * Effects are transformations applied to cursor position after smoothing strategy calculation.
 * They enable modular position modifications like shake, boundaries, trails, etc.
 * 
 * An effect can be either:
 * - A function with signature: (state, deltaTime, effectState) => newState
 * - An object with an apply() method and optional config
 * 
 * @typedef {Object} EffectState
 * @property {Object} position - Current position {x, y}
 * @property {Object} velocity - Current velocity {x, y}
 * @property {Object} target - Target position {x, y}
 * 
 * @callback EffectFunction
 * @param {EffectState} state - Current state with position, velocity, and target
 * @param {number} deltaTime - Frame delta in seconds
 * @param {Object} effectState - Persistent state object for this effect (mutable)
 * @returns {Object} Modified state with {position, velocity}
 * 
 * @typedef {Object} EffectObject
 * @property {EffectFunction} apply - The effect function
 * 
 * State Management:
 * - Each effect receives an isolated effectState object
 * - effectState persists between frames for time-based effects
 * - Effects can mutate effectState to track animation time, history, etc.
 * - effectState is created empty {} for each registered effect
 */

/**
 * Hand-shake effect that adds velocity-dependent noise to cursor position
 * Simulates natural hand tremor that increases with movement speed
 * 
 * Configuration parameters:
 * @param {number} config.intensity - Base shake strength in coordinate units (default: 1.5)
 * @param {number} config.frequency - Shake frequency in Hz (default: 8.0)
 * @param {number} config.velocityScale - How much velocity affects shake (default: 0.02)
 * @param {number} config.minVelocity - Velocity threshold below which no shake occurs (default: 50)
 * 
 * Note: Units depend on your coordinate system. For normalized coords (-1 to 1), 
 * use small values like 0.002-0.005 for intensity and 0.05-0.1 for minVelocity.
 */
export const handShakeEffect = {
  apply(state, deltaTime, effectState, config) {
    // Initialize time accumulator
    if (!effectState.time) {
      effectState.time = 0;
    }
    effectState.time += deltaTime;
    
    // Use default config values if not provided
    const intensity = config.intensity ?? 1.5;
    const frequency = config.frequency ?? 8.0;
    const velocityScale = config.velocityScale ?? 0.02;
    const minVelocity = config.minVelocity ?? 50;
    
    // Calculate velocity magnitude (speed)
    const speed = Math.sqrt(
      state.velocity.x ** 2 + state.velocity.y ** 2
    );
    
    // Scale shake amplitude by velocity
    const velocityFactor = Math.max(0, (speed - minVelocity) * velocityScale);
    const amplitude = intensity * (1 + velocityFactor);
    
    // Generate natural-looking noise using multiple sine waves
    // Different frequencies for X and Y create uncorrelated movement
    const t = effectState.time * frequency * Math.PI * 2;
    const shake = {
      x: amplitude * Math.sin(t) * Math.cos(t * 0.75),
      y: amplitude * Math.cos(t) * Math.sin(t * 1.25)
    };
    
    return {
      position: {
        x: state.position.x + shake.x,
        y: state.position.y + shake.y
      },
      velocity: state.velocity
    };
  }
};

/**
 * Idle hand effect that adds subtle drift when cursor is stationary
 * Simulates natural micro-movements that occur when hand is at rest
 * 
 * Configuration parameters:
 * @param {number} config.intensity - Drift radius in coordinate units (default: 3.0)
 * @param {number} config.frequency - Drift speed in Hz (default: 0.8)
 * @param {number} config.maxVelocity - Velocity threshold above which effect fades out (default: 100)
 * @param {string} config.pattern - Movement pattern: 'circular', 'figure8', or 'organic' (default: 'organic')
 * 
 * Note: Units depend on your coordinate system. For normalized coords (-1 to 1),
 * use small values like 0.005-0.01 for intensity and 0.1-0.2 for maxVelocity.
 */
export const idleHandEffect = {
  apply(state, deltaTime, effectState, config) {
    // Initialize time accumulator
    if (!effectState.time) {
      effectState.time = 0;
    }
    effectState.time += deltaTime;
    
    // Use default config values if not provided
    const intensity = config.intensity ?? 3.0;
    const frequency = config.frequency ?? 0.8;
    const maxVelocity = config.maxVelocity ?? 100;
    const pattern = config.pattern ?? 'organic';
    
    // Calculate velocity magnitude (speed)
    const speed = Math.sqrt(
      state.velocity.x ** 2 + state.velocity.y ** 2
    );
    
    // Fade out as velocity increases
    const idleFactor = Math.max(0, 1 - (speed / maxVelocity));
    const amplitude = intensity * idleFactor;
    
    // Generate drift pattern
    const t = effectState.time * frequency * Math.PI * 2;
    let drift = { x: 0, y: 0 };
    
    switch (pattern) {
      case 'circular':
        // Simple circular motion
        drift = {
          x: amplitude * Math.cos(t),
          y: amplitude * Math.sin(t)
        };
        break;
        
      case 'figure8':
        // Figure-8 pattern (Lissajous curve)
        drift = {
          x: amplitude * Math.sin(t),
          y: amplitude * Math.sin(t * 2) * 0.5
        };
        break;
        
      case 'organic':
      default:
        // Organic drift using multiple frequencies
        drift = {
          x: amplitude * (Math.sin(t) * 0.6 + Math.sin(t * 1.3) * 0.4),
          y: amplitude * (Math.cos(t * 0.7) * 0.6 + Math.cos(t * 1.7) * 0.4)
        };
        break;
    }
    
    return {
      position: {
        x: state.position.x + drift.x,
        y: state.position.y + drift.y
      },
      velocity: state.velocity
    };
  }
};
