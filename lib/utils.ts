export function isLight(color: string) {
  const hex = color.replace('#', '')
  const cR = parseInt(hex.substring(0, 2), 16)
  const cG = parseInt(hex.substring(2, 4), 16)
  const cB = parseInt(hex.substring(4, 6), 16)
  const brightness = (cR * 299 + cG * 587 + cB * 114) / 1000
  return brightness > 155
}

// String
export function slugify(str: string) {
  return str
    .replace(/[^0-9a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F()]/g, '-')
    .replace(/ /g, '-')
    .replace(/^-+|-+(?=-|$)/g, '')
    .toLowerCase()
}

export function unslugify(str: string) {
  return str
    .replace(/[-\/]/g, ' ')
    .replace(/^\w|\b\w/g, (letter) => letter.toUpperCase())
    .trim()
    .replace(' ', ': ')
}
