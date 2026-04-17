/**
 * AMOPETS — Unified Product Catalog
 * Single source of truth for product data.
 * Used by: product.js, catalog.js, checkout.js
 */

export const COLOR_MAP = {
  roxo: '#7B2D8E',
  amarelo: '#FFD23F',
  lilás: '#C589D6',
  laranja: '#E67E22',
  creme: '#F5E6C8',
  preto: '#2D1B36',
  tropical: '#2ECC71',
  rosa: '#FF8ED4',
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
    description: 'A Coleira Deepblue é perfeita para pets que adoram passeios com estilo. Feita com nylon de alta resistência, detalhes em dourado e acabamento premium.',
    images: [
      'images/collar-deepblue.png',
      'images/collar-lavanda.png',
      'images/collar-deepgreen.png',
      'images/collar-marshmallow.png',
    ],
    sizes: ['P', 'M'],
    colors: ['roxo', 'preto'],
    variants: [
      { size: 'PP', color: 'roxo', stock: 8, sku: 'AME-PP-ROX' },
      { size: 'P', color: 'roxo', stock: 12, sku: 'AME-P-ROX' },
      { size: 'M', color: 'roxo', stock: 5, sku: 'AME-M-ROX' },
      { size: 'G', color: 'roxo', stock: 3, sku: 'AME-G-ROX' },
      { size: 'PP', color: 'lilás', stock: 6, sku: 'AME-PP-LIL' },
      { size: 'P', color: 'lilás', stock: 9, sku: 'AME-P-LIL' },
      { size: 'M', color: 'lilás', stock: 0, sku: 'AME-M-LIL' },
      { size: 'G', color: 'lilás', stock: 2, sku: 'AME-G-LIL' },
      { size: 'PP', color: 'rosa', stock: 10, sku: 'AME-PP-ROS' },
      { size: 'P', color: 'rosa', stock: 7, sku: 'AME-P-ROS' },
      { size: 'M', color: 'rosa', stock: 4, sku: 'AME-M-ROS' },
    ],
    isNew: true,
    isPopular: false,
    variant: 'Tamanho M • Roxo',
  },
  'coleira-girassol-adventure': {
    id: 'col-002',
    name: 'Coleira Girassol Adventure',
    price: 59.90,
    rating: 4.6,
    reviewCount: 89,
    category: 'coleiras',
    images: ['images/collar-girassol.png'],
    sizes: ['M', 'G'],
    colors: ['amarelo', 'preto'],
    variants: [
      { size: 'P', color: 'amarelo', stock: 15, sku: 'GIR-P-AMA' },
      { size: 'M', color: 'amarelo', stock: 10, sku: 'GIR-M-AMA' },
      { size: 'G', color: 'amarelo', stock: 8, sku: 'GIR-G-AMA' },
    ],
    isPopular: true,
    variant: 'Tamanho G • Amarelo',
  },
  'coleira-lavanda-dreams': {
    id: 'col-003',
    name: 'Coleira Lavanda Dreams',
    price: 74.90,
    badge: 'POPULAR',
    rating: 4.9,
    reviewCount: 203,
    category: 'coleiras',
    images: ['images/collar-lavanda.png'],
    sizes: ['PP', 'P', 'M'],
    colors: ['roxo', 'rosa'],
    variants: [
      { size: 'PP', color: 'lilás', stock: 4, sku: 'LAV-PP-LIL' },
      { size: 'P', color: 'lilás', stock: 11, sku: 'LAV-P-LIL' },
      { size: 'M', color: 'lilás', stock: 7, sku: 'LAV-M-LIL' },
      { size: 'G', color: 'lilás', stock: 2, sku: 'LAV-G-LIL' },
    ],
    variant: 'Tamanho P • Lilás',
  },
  'coleira-sunset-glow-led': {
    id: 'col-004',
    name: 'Coleira Sunset Glow (LED)',
    price: 89.90,
    rating: 4.7,
    reviewCount: 76,
    category: 'coleiras-led',
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
  'coleira-deepgreen': {
    id: 'col-006',
    name: 'Coleira Deepgreen',
    price: 79.90,
    badge: 'PREMIUM',
    rating: 4.9,
    reviewCount: 165,
    category: 'coleiras',
    images: ['images/collar-deepgreen.png'],
    sizes: ['M', 'G'],
    colors: ['azul', 'preto'],
    variants: [
      { size: 'P', color: 'preto', stock: 8, sku: 'DGR-P-PRE' },
      { size: 'M', color: 'preto', stock: 6, sku: 'DGR-M-PRE' },
      { size: 'G', color: 'preto', stock: 3, sku: 'DGR-G-PRE' },
    ],
    variant: 'Tamanho G • Preto',
  },
  'coleira-tropical-vibes': {
    id: 'col-007',
    name: 'Coleira Tropical Vibes',
    price: 64.90,
    rating: 4.4,
    reviewCount: 41,
    category: 'coleiras-nylon',
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

/**
 * Get a flat array of catalog products for catalog grid usage.
 * @returns {object[]}
 */
export function getCatalogProducts() {
  return Object.keys(CATALOG).map(function (slug) {
    const p = CATALOG[slug];
    return {
      id: p.id,
      slug: slug,
      name: p.name,
      price: p.price,
      category: p.category || 'coleiras',
      sizes: p.sizes || [],
      colors: p.colors || [],
      imageUrl: p.images[0],
      isNew: !!p.isNew,
      isPopular: !!p.isPopular,
    };
  });
}
