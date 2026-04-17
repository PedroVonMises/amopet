/**
 * AMOPETS — Address Form Component Logic
 * Form state management, field validation, CEP lookup result processing.
 */

/**
 * Create initial address form state
 * @returns {object}
 */
export function createAddressFormState() {
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
export function updateField(state, field, value) {
  if (!state || typeof field !== 'string') return state;
  const newState = Object.assign({}, state);
  newState[field] = typeof value === 'string' ? value : '';
  newState.touched = Object.assign({}, state.touched);
  newState.touched[field] = true;
  newState.errors = Object.assign({}, state.errors);
  delete newState.errors[field];
  return newState;
}

/**
 * Apply CEP lookup result
 * @param {object} state
 * @param {object} cepData
 * @returns {object}
 */
export function applyCepLookup(state, cepData) {
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
export function setCepLoading(state, isLoading) {
  if (!state) return state;
  return Object.assign({}, state, { isLookingUpCep: !!isLoading });
}

/**
 * Validate entire address form
 * @param {object} state
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export function validateAddressForm(state) {
  if (!state) return { valid: false, errors: { form: 'Estado inválido' } };

  const errors = {};

  const cepDigits = (state.cep || '').replace(/\D/g, '');
  if (cepDigits.length === 0) {
    errors.cep = 'CEP é obrigatório';
  } else if (cepDigits.length !== 8) {
    errors.cep = 'CEP deve ter 8 dígitos';
  }

  if (!state.street || state.street.trim().length === 0) {
    errors.street = 'Rua é obrigatória';
  } else if (state.street.trim().length < 3) {
    errors.street = 'Rua deve ter pelo menos 3 caracteres';
  }

  if (!state.number || state.number.trim().length === 0) {
    errors.number = 'Número é obrigatório';
  }

  if (!state.neighborhood || state.neighborhood.trim().length === 0) {
    errors.neighborhood = 'Bairro é obrigatório';
  }

  if (!state.city || state.city.trim().length === 0) {
    errors.city = 'Cidade é obrigatória';
  }

  const validStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
  if (!state.state || state.state.trim().length === 0) {
    errors.state = 'Estado é obrigatório';
  } else if (validStates.indexOf(state.state.toUpperCase().trim()) === -1) {
    errors.state = 'Estado inválido';
  }

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
export function getFieldError(state, field) {
  if (!state || !state.touched || !state.touched[field]) return null;
  return state.errors && state.errors[field] ? state.errors[field] : null;
}

/**
 * Apply validation results to state
 * @param {object} state
 * @param {Object.<string, string>} errors
 * @returns {object}
 */
export function applyValidationErrors(state, errors) {
  if (!state) return state;
  const touched = Object.assign({}, state.touched);
  Object.keys(errors).forEach(function (key) { touched[key] = true; });
  return Object.assign({}, state, { errors: errors, touched: touched });
}

/**
 * Check if form is complete enough to submit
 * @param {object} state
 * @returns {boolean}
 */
export function isFormSubmittable(state) {
  if (!state) return false;
  const result = validateAddressForm(state);
  return result.valid;
}
