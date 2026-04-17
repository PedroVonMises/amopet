/**
 * AMOPETS - Unified Product Catalog
 * Single source of truth for product data.
 * Used by: product.js, catalog.js, checkout.js
 */

export const COLOR_MAP = {
  amarelo: '#FFD23F',
  azul: '#1F5EFF',
  branco: '#FFFFFF',
  creme: '#F5E6C8',
  laranja: '#E67E22',
  lilas: '#C589D6',
  preto: '#2D1B36',
  rosa: '#FF8ED4',
  roxo: '#7B2D8E',
  tropical: '#2ECC71',
  verde: '#148F5A',
};

export const CATALOG = {
  'coleira-deepblue': {
    id: 'col-001',
    name: 'Coleira Deepblue',
    price: 69.90,
    badge: 'NOVO',
    rating: 4.8,
    reviewCount: 127,
    category: 'coleiras',
    collection: 'Gradient',
    legacySlugs: ['coleira-ametista-brilhante'],
    sortOrder: 1,
    description: 'A Coleira Deepblue faz parte da colecao Gradient e combina tons intensos de azul com acabamento premium para passeios cheios de personalidade.',
    images: ['images/collar-deepblue.png'],
    sizes: ['PP', 'P', 'M', 'G'],
    colors: ['azul', 'rosa'],
    variants: [
      { size: 'PP', color: 'azul', stock: 8, sku: 'DBL-PP-AZU' },
      { size: 'P', color: 'azul', stock: 12, sku: 'DBL-P-AZU' },
      { size: 'M', color: 'azul', stock: 6, sku: 'DBL-M-AZU' },
      { size: 'G', color: 'azul', stock: 4, sku: 'DBL-G-AZU' },
      { size: 'PP', color: 'rosa', stock: 5, sku: 'DBL-PP-ROS' },
      { size: 'P', color: 'rosa', stock: 7, sku: 'DBL-P-ROS' },
      { size: 'M', color: 'rosa', stock: 4, sku: 'DBL-M-ROS' },
      { size: 'G', color: 'rosa', stock: 2, sku: 'DBL-G-ROS' },
    ],
    isNew: true,
    isPopular: false,
    variant: 'Tamanho M • Azul',
  },
  'coleira-deeppink': {
    id: 'col-002',
    name: 'Coleira Deeppink',
    price: 59.90,
    badge: 'POPULAR',
    rating: 4.6,
    reviewCount: 89,
    category: 'coleiras',
    collection: 'Gradient',
    legacySlugs: ['coleira-girassol-adventure'],
    sortOrder: 2,
    description: 'A Coleira Deeppink traz o lado mais delicado da colecao Gradient, com um degrade suave em rosa e azul para looks leves e divertidos.',
    images: ['images/collar-deeppink.png'],
    sizes: ['PP', 'P', 'M', 'G'],
    colors: ['rosa', 'azul'],
    variants: [
      { size: 'PP', color: 'rosa', stock: 14, sku: 'DPK-PP-ROS' },
      { size: 'P', color: 'rosa', stock: 10, sku: 'DPK-P-ROS' },
      { size: 'M', color: 'rosa', stock: 8, sku: 'DPK-M-ROS' },
      { size: 'G', color: 'rosa', stock: 5, sku: 'DPK-G-ROS' },
      { size: 'PP', color: 'azul', stock: 9, sku: 'DPK-PP-AZU' },
      { size: 'P', color: 'azul', stock: 7, sku: 'DPK-P-AZU' },
      { size: 'M', color: 'azul', stock: 4, sku: 'DPK-M-AZU' },
      { size: 'G', color: 'azul', stock: 3, sku: 'DPK-G-AZU' },
    ],
    isNew: false,
    isPopular: true,
    variant: 'Tamanho M • Rosa',
  },
  'coleira-deepgreen': {
    id: 'col-006',
    name: 'Coleira Deepgreen',
    price: 79.90,
    badge: 'PREMIUM',
    rating: 4.9,
    reviewCount: 165,
    category: 'coleiras',
    collection: 'Gradient',
    legacySlugs: ['coleira-galaxy-night'],
    sortOrder: 3,
    description: 'A Coleira Deepgreen completa a colecao Gradient com um degrade verde profundo, toque macio e visual sofisticado para aventuras urbanas.',
    images: ['images/collar-deepgreen.png'],
    sizes: ['P', 'M', 'G'],
    colors: ['verde', 'preto'],
    variants: [
      { size: 'P', color: 'verde', stock: 9, sku: 'DGR-P-VER' },
      { size: 'M', color: 'verde', stock: 7, sku: 'DGR-M-VER' },
      { size: 'G', color: 'verde', stock: 5, sku: 'DGR-G-VER' },
      { size: 'P', color: 'preto', stock: 6, sku: 'DGR-P-PRE' },
      { size: 'M', color: 'preto', stock: 4, sku: 'DGR-M-PRE' },
      { size: 'G', color: 'preto', stock: 2, sku: 'DGR-G-PRE' },
    ],
    isNew: false,
    isPopular: false,
    variant: 'Tamanho G • Verde',
  },
  'coleira-lavanda-dreams': {
    id: 'col-003',
    name: 'Coleira Lavanda Dreams',
    price: 74.90,
    badge: 'POPULAR',
    rating: 4.9,
    reviewCount: 203,
    category: 'coleiras',
    sortOrder: 10,
    images: ['images/collar-lavanda.png'],
    sizes: ['PP', 'P', 'M'],
    colors: ['roxo', 'rosa'],
    variants: [
      { size: 'PP', color: 'lilas', stock: 4, sku: 'LAV-PP-LIL' },
      { size: 'P', color: 'lilas', stock: 11, sku: 'LAV-P-LIL' },
      { size: 'M', color: 'lilas', stock: 7, sku: 'LAV-M-LIL' },
      { size: 'G', color: 'lilas', stock: 2, sku: 'LAV-G-LIL' },
    ],
    variant: 'Tamanho P • Lilas',
  },
  'coleira-sunset-glow-led': {
    id: 'col-004',
    name: 'Coleira Sunset Glow (LED)',
    price: 89.90,
    rating: 4.7,
    reviewCount: 76,
    category: 'coleiras-led',
    sortOrder: 11,
    images: ['images/collar-sunset-led.png'],
    sizes: ['M', 'G', 'GG'],
    colors: ['amarelo', 'roxo'],
    variants: [
      { size: 'P', color: 'laranja', stock: 6, sku: 'SUN-P-LAR' },
      { size: 'M', color: 'laranja', stock: 9, sku: 'SUN-M-LAR' },
      { size: 'G', color: 'laranja', stock: 5, sku: 'SUN-G-LAR' },
    ],
    isNew: true,
    variant: 'Tamanho M • Laranja',
  },
  'coleira-vanilla-classic': {
    id: 'col-005',
    name: 'Coleira Vanilla Classic',
    price: 49.90,
    rating: 4.5,
    reviewCount: 52,
    category: 'coleiras-couro',
    sortOrder: 12,
    images: ['images/collar-vanilla.png'],
    sizes: ['P', 'M', 'G'],
    colors: ['branco', 'azul'],
    variants: [
      { size: 'PP', color: 'creme', stock: 20, sku: 'VAN-PP-CRE' },
      { size: 'P', color: 'creme', stock: 15, sku: 'VAN-P-CRE' },
      { size: 'M', color: 'creme', stock: 12, sku: 'VAN-M-CRE' },
    ],
    variant: 'Tamanho PP • Creme',
  },
  'coleira-tropical-vibes': {
    id: 'col-007',
    name: 'Coleira Tropical Vibes',
    price: 64.90,
    rating: 4.4,
    reviewCount: 41,
    category: 'coleiras-nylon',
    sortOrder: 13,
    images: ['images/collar-tropical.png'],
    sizes: ['P', 'M'],
    colors: ['amarelo', 'rosa'],
    variants: [
      { size: 'P', color: 'tropical', stock: 10, sku: 'TRO-P-TRO' },
      { size: 'M', color: 'tropical', stock: 7, sku: 'TRO-M-TRO' },
      { size: 'G', color: 'tropical', stock: 5, sku: 'TRO-G-TRO' },
    ],
    isPopular: true,
    variant: 'Tamanho M • Tropical',
  },
  'coleira-marshmallow-soft': {
    id: 'col-008',
    name: 'Coleira Marshmallow Soft',
    price: 54.90,
    rating: 4.6,
    reviewCount: 94,
    category: 'coleiras',
    sortOrder: 14,
    images: ['images/collar-marshmallow.png'],
    sizes: ['PP', 'P'],
    colors: ['rosa', 'branco'],
    variants: [
      { size: 'PP', color: 'rosa', stock: 14, sku: 'MAR-PP-ROS' },
      { size: 'P', color: 'rosa', stock: 11, sku: 'MAR-P-ROS' },
      { size: 'M', color: 'rosa', stock: 8, sku: 'MAR-M-ROS' },
    ],
    variant: 'Tamanho P • Rosa',
  },
};

function getProductSortOrder(slug) {
  const product = CATALOG[slug];
  return product && typeof product.sortOrder === 'number' ? product.sortOrder : 999;
}

function buildLegacyProductSlugMap() {
  const aliases = {};
  Object.keys(CATALOG).forEach(function (slug) {
    const legacySlugs = Array.isArray(CATALOG[slug].legacySlugs) ? CATALOG[slug].legacySlugs : [];
    legacySlugs.forEach(function (legacySlug) {
      aliases[String(legacySlug).toLowerCase()] = slug;
    });
  });
  return aliases;
}

export const LEGACY_PRODUCT_SLUGS = buildLegacyProductSlugMap();

export function resolveProductSlug(slug) {
  if (typeof slug !== 'string') {
    return null;
  }

  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (CATALOG[normalized]) {
    return normalized;
  }

  return LEGACY_PRODUCT_SLUGS[normalized] || null;
}

/**
 * Get a flat array of catalog products for catalog grid usage.
 * @returns {object[]}
 */
export function getCatalogProducts() {
  return Object.keys(CATALOG)
    .sort(function (left, right) {
      return getProductSortOrder(left) - getProductSortOrder(right);
    })
    .map(function (slug) {
      const product = CATALOG[slug];
      return {
        id: product.id,
        slug: slug,
        name: product.name,
        price: product.price,
        category: product.category || 'coleiras',
        sizes: product.sizes || [],
        colors: product.colors || [],
        imageUrl: product.images[0],
        isNew: !!product.isNew,
        isPopular: !!product.isPopular,
        collection: product.collection || null,
      };
    });
}
