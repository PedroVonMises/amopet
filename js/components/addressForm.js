/**
 * AMOPETS — Address Form Component Logic
 * Form state management, field validation, CEP lookup result processing.
 */

/**
 * Create initial address form state
 * @returns {object}
 */
function createAddressFormState() {
  return {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    isLookingUpCep: false,
    cepLookedUp: false,
    errors: {},
    touched: {},
  };
}

/**
 * Update a field value
 * @param {object} state
 * @param {string} field
 * @param {string} value
 * @returns {object}
 */
function updateField(state, field, value) {
  if (!state || typeof field !== 'string') return state;
  var newState = Object.assign({}, state);
  newState[field] = typeof value === 'string' ? value : '';
  newState.touched = Object.assign({}, state.touched);
  newState.touched[field] = true;
  // Clear error on change
  newState.errors = Object.assign({}, state.errors);
  delete newState.errors[field];
  return newState;
}

/**
 * Apply CEP lookup result (auto-fill street, neighborhood, city, state)
 * @param {object} state
 * @param {object} cepData - { street, neighborhood, city, state }
 * @returns {object}
 */
function applyCepLookup(state, cepData) {
  if (!state || !cepData) return state;
  return Object.assign({}, state, {
    street: cepData.street || state.street,
    neighborhood: cepData.neighborhood || state.neighborhood,
    city: cepData.city || state.city,
    state: cepData.state || state.state,
    isLookingUpCep: false,
    cepLookedUp: true,
  });
}

/**
 * Set CEP lookup loading state
 * @param {object} state
 * @param {boolean} isLoading
 * @returns {object}
 */
function setCepLoading(state, isLoading) {
  if (!state) return state;
  return Object.assign({}, state, { isLookingUpCep: !!isLoading });
}

/**
 * Validate entire address form
 * @param {object} state
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
function validateAddressForm(state) {
  if (!state) return { valid: false, errors: { form: 'Estado inválido' } };

  var errors = {};

  // CEP
  var cepDigits = (state.cep || '').replace(/\D/g, '');
  if (cepDigits.length === 0) {
    errors.cep = 'CEP é obrigatório';
  } else if (cepDigits.length !== 8) {
    errors.cep = 'CEP deve ter 8 dígitos';
  }

  // Street
  if (!state.street || state.street.trim().length === 0) {
    errors.street = 'Rua é obrigatória';
  } else if (state.street.trim().length < 3) {
    errors.street = 'Rua deve ter pelo menos 3 caracteres';
  }

  // Number
  if (!state.number || state.number.trim().length === 0) {
    errors.number = 'Número é obrigatório';
  }

  // Neighborhood
  if (!state.neighborhood || state.neighborhood.trim().length === 0) {
    errors.neighborhood = 'Bairro é obrigatório';
  }

  // City
  if (!state.city || state.city.trim().length === 0) {
    errors.city = 'Cidade é obrigatória';
  }

  // State
  var validStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
  if (!state.state || state.state.trim().length === 0) {
    errors.state = 'Estado é obrigatório';
  } else if (validStates.indexOf(state.state.toUpperCase().trim()) === -1) {
    errors.state = 'Estado inválido';
  }

  // Complement is optional — no validation

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
  };
}

/**
 * Get field-level error (only if field was touched)
 * @param {object} state
 * @param {string} field
 * @returns {string | null}
 */
function getFieldError(state, field) {
  if (!state || !state.touched || !state.touched[field]) return null;
  return state.errors && state.errors[field] ? state.errors[field] : null;
}

/**
 * Apply validation results to state (set all errors)
 * @param {object} state
 * @param {Object.<string, string>} errors
 * @returns {object}
 */
function applyValidationErrors(state, errors) {
  if (!state) return state;
  // Mark all fields as touched
  var touched = Object.assign({}, state.touched);
  Object.keys(errors).forEach(function (key) { touched[key] = true; });
  return Object.assign({}, state, { errors: errors, touched: touched });
}

/**
 * Check if form is complete enough to submit
 * @param {object} state
 * @returns {boolean}
 */
function isFormSubmittable(state) {
  if (!state) return false;
  var result = validateAddressForm(state);
  return result.valid;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createAddressFormState: createAddressFormState,
    updateField: updateField,
    applyCepLookup: applyCepLookup,
    setCepLoading: setCepLoading,
    validateAddressForm: validateAddressForm,
    getFieldError: getFieldError,
    applyValidationErrors: applyValidationErrors,
    isFormSubmittable: isFormSubmittable,
  };
}
