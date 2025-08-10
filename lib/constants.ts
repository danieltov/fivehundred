/* Prisma */
export const ALBUM_INCLUDE = {
  artist: true,
  genres: true,
  descriptors: true,
}

export const SHELF_ALBUM_INCLUDE = {
  artist: { select: { name: true, slug: true } }
} as const

export const ALBUM_DETAIL_INCLUDE = {
  artist: { select: { name: true, slug: true } },
  genres: { select: { name: true, slug: true } },
  descriptors: { select: { name: true, slug: true } }
} as const

/* UI */
export const colorsA = ['#bef57c', '#f7a784', '#eb5050', '#92dbe1', '#9376e4']
export const colorsB = ['#42c8b0', '#d36f88', '#fc8d45', '#4575f3', '#f3c345']
export const colorsAll = [...colorsA, ...colorsB]
export const colorPages = {
  '/': '#F34575',
  '/a-plus': '#f57cbe',
  '/albums': '#45fc8d',
  '/artists': '#5050eb',
  '/genres': '#e49376',
  '/descriptors': '#dbe192',
}

export const links = [
  { text: 'A Plus', path: '/a-plus' },
  { text: 'Albums', path: '/albums' },
  { text: 'Artists', path: '/artists' },
  { text: 'Genres', path: '/genres' },
  { text: 'Vibes', path: '/vibes' },
]

export const shelfProps = { width: '100%', height: '100%' }
