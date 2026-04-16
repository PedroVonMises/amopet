/**
 * AMOPETS — Quantity Stepper Component Logic
 * Increment/decrement with min/max bounds.
 */

/**
 * Create initial stepper state
 * @param {number} [initial=1]
 * @param {number} [min=1]
 * @param {number} [max=99]
 * @returns {object} Stepper state
 */
function createStepperState(initial, min, max) {
  var _min = (typeof min === 'number' && min >= 0) ? min : 1;
  var _max = (typeof max === 'number' && max > 0) ? max : 99;
  if (_min > _max) _max = _min;
  var _val = (typeof initial === 'number') ? initial : _min;
  _val = Math.max(_min, Math.min(_max, _val));

  return {
    value: _val,
    min: _min,
    max: _max,
  };
}

/**
 * Increment the value by step
 * @param {object} state
 * @param {number} [step=1]
 * @returns {object} New state
 */
function increment(state, step) {
  if (!state) return state;
  var s = (typeof step === 'number' && step > 0) ? step : 1;
  var newVal = Math.min(state.max, state.value + s);
  return Object.assign({}, state, { value: newVal });
}

/**
 * Decrement the value by step
 * @param {object} state
 * @param {number} [step=1]
 * @returns {object} New state
 */
function decrement(state, step) {
  if (!state) return state;
  var s = (typeof step === 'number' && step > 0) ? step : 1;
  var newVal = Math.max(state.min, state.value - s);
  return Object.assign({}, state, { value: newVal });
}

/**
 * Set value directly (clamped to bounds)
 * @param {object} state
 * @param {number} value
 * @returns {object} New state
 */
function setValue(state, value) {
  if (!state) return state;
  if (typeof value !== 'number' || isNaN(value)) return state;
  var clamped = Math.max(state.min, Math.min(state.max, Math.round(value)));
  return Object.assign({}, state, { value: clamped });
}

/**
 * Check if increment is allowed
 * @param {object} state
 * @returns {boolean}
 */
function canIncrement(state) {
  if (!state) return false;
  return state.value < state.max;
}

/**
 * Check if decrement is allowed
 * @param {object} state
 * @returns {boolean}
 */
function canDecrement(state) {
  if (!state) return false;
  return state.value > state.min;
}

/**
 * Get accessibility label for current value
 * @param {object} state
 * @returns {string}
 */
function getStepperAriaLabel(state) {
  if (!state) return 'Quantidade';
  return 'Quantidade: ' + state.value + ' (mínimo ' + state.min + ', máximo ' + state.max + ')';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createStepperState: createStepperState,
    increment: increment,
    decrement: decrement,
    setValue: setValue,
    canIncrement: canIncrement,
    canDecrement: canDecrement,
    getStepperAriaLabel: getStepperAriaLabel,
  };
}
