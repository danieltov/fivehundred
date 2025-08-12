/* Prisma */
export const ALBUM_INCLUDE = {
  artist: true,
  genres: true,
  descriptors: true,
}

export const SHELF_ALBUM_INCLUDE = {
  artist: { select: { name: true, slug: true } },
} as const

/* UI */
export const colorsA = ['#bef57c', '#f7a784', '#eb5050', '#92dbe1', '#9376e4']
export const colorsB = ['#42c8b0', '#d36f88', '#fc8d45', '#4575f3', '#f3c345']
export const colorsAll = [...colorsA, ...colorsB]
export const colorPages = {
  '/': '#F34575',
  '/top-50': '#eb5050',
  '/a-plus': '#f57cbe',
  '/albums': '#45fc8d',
  // '/artists': '#5050eb',
  // '/genres': '#e49376',
  // '/vibes': '#dbe192',
}

export const links = [
  { text: 'Top 50', path: '/top-50', color: colorPages['/top-50'] },
  { text: 'A-Plus', path: '/a-plus', color: colorPages['/a-plus'] },
  { text: 'Albums', path: '/albums', color: colorPages['/albums'] },
  // { text: 'Artists', path: '/artists', color: colorPages['/artists'] },
  // { text: 'Genres', path: '/genres', color: colorPages['/genres'] },
  // { text: 'Vibes', path: '/vibes', color: colorPages['/vibes'] },
]

export const shelfProps = { width: '100%', height: '100%' }
