// Opciones de personalización del avatar. Estilizado y de bajo poligonaje:
// formas suaves que se animan por cercanía y poses compartidas.

export const BODY_COLORS = [
  { id: 'rosa', label: 'Rosa', hex: '#ff9aa8' },
  { id: 'lavanda', label: 'Lavanda', hex: '#c4a7ff' },
  { id: 'menta', label: 'Menta', hex: '#9fe0c2' },
  { id: 'durazno', label: 'Durazno', hex: '#ffc7a0' },
  { id: 'cielo', label: 'Cielo', hex: '#9fc7ff' },
  { id: 'ambar', label: 'Ámbar', hex: '#ffd27a' },
]

export const GLOW_COLORS = [
  { id: 'dorado', label: 'Dorado', hex: '#ffd27a' },
  { id: 'rosa', label: 'Rosado', hex: '#ff9aa8' },
  { id: 'violeta', label: 'Violeta', hex: '#b794ff' },
  { id: 'turquesa', label: 'Turquesa', hex: '#7ce0d3' },
]

export const SHAPES = [
  { id: 'redondo', label: 'Suave' },
  { id: 'alto', label: 'Esbelto' },
]

export const ACCESSORIES = [
  { id: 'ninguno', label: 'Ninguno' },
  { id: 'flor', label: 'Flor' },
  { id: 'corona', label: 'Coronita' },
  { id: 'estrella', label: 'Estrella' },
]

export function defaultAvatar(seed = 0) {
  return {
    bodyColor: BODY_COLORS[seed % BODY_COLORS.length].hex,
    glowColor: GLOW_COLORS[seed % GLOW_COLORS.length].hex,
    shape: SHAPES[0].id,
    accessory: ACCESSORIES[0].id,
  }
}
