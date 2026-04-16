/**
 * AMOPETS — Gallery Component Logic
 * Image navigation, thumbnails, zoom state for product detail pages.
 */

/**
 * Create initial gallery state
 * @param {string[]} images - Array of image URLs
 * @returns {object} Gallery state
 */
function createGalleryState(images) {
  var validImages = Array.isArray(images) ? images.filter(function (img) { return typeof img === 'string' && img.length > 0; }) : [];
  return {
    images: validImages,
    currentIndex: 0,
    isZoomed: false,
    zoomPosition: { x: 0, y: 0 },
    thumbnailScrollOffset: 0,
  };
}

/**
 * Navigate to next image
 * @param {object} state
 * @returns {object} New state
 */
function goToNext(state) {
  if (!state || state.images.length <= 1) return state;
  return Object.assign({}, state, {
    currentIndex: (state.currentIndex + 1) % state.images.length,
    isZoomed: false,
  });
}

/**
 * Navigate to previous image
 * @param {object} state
 * @returns {object} New state
 */
function goToPrev(state) {
  if (!state || state.images.length <= 1) return state;
  var newIndex = state.currentIndex === 0 ? state.images.length - 1 : state.currentIndex - 1;
  return Object.assign({}, state, {
    currentIndex: newIndex,
    isZoomed: false,
  });
}

/**
 * Jump to a specific image by index
 * @param {object} state
 * @param {number} index
 * @returns {object} New state
 */
function goToIndex(state, index) {
  if (!state || typeof index !== 'number') return state;
  if (index < 0 || index >= state.images.length) return state;
  return Object.assign({}, state, {
    currentIndex: index,
    isZoomed: false,
  });
}

/**
 * Toggle zoom on current image
 * @param {object} state
 * @returns {object} New state
 */
function toggleZoom(state) {
  if (!state || state.images.length === 0) return state;
  return Object.assign({}, state, {
    isZoomed: !state.isZoomed,
    zoomPosition: state.isZoomed ? { x: 0, y: 0 } : state.zoomPosition,
  });
}

/**
 * Update zoom position (mouse coordinates within image container)
 * @param {object} state
 * @param {number} x - 0 to 1 (left to right)
 * @param {number} y - 0 to 1 (top to bottom)
 * @returns {object} New state
 */
function updateZoomPosition(state, x, y) {
  if (!state || !state.isZoomed) return state;
  return Object.assign({}, state, {
    zoomPosition: {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    },
  });
}

/**
 * Get the currently active image URL
 * @param {object} state
 * @returns {string | null}
 */
function getCurrentImage(state) {
  if (!state || state.images.length === 0) return null;
  return state.images[state.currentIndex] || null;
}

/**
 * Get gallery navigation info — is there prev/next?
 * @param {object} state
 * @returns {{ hasPrev: boolean, hasNext: boolean, total: number, current: number }}
 */
function getNavigationInfo(state) {
  if (!state || state.images.length === 0) {
    return { hasPrev: false, hasNext: false, total: 0, current: 0 };
  }
  return {
    hasPrev: state.images.length > 1,
    hasNext: state.images.length > 1,
    total: state.images.length,
    current: state.currentIndex + 1, // 1-indexed for display
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createGalleryState: createGalleryState,
    goToNext: goToNext,
    goToPrev: goToPrev,
    goToIndex: goToIndex,
    toggleZoom: toggleZoom,
    updateZoomPosition: updateZoomPosition,
    getCurrentImage: getCurrentImage,
    getNavigationInfo: getNavigationInfo,
  };
}
