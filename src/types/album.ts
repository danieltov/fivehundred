export interface Artist {
  name: string
  slug: string
}

export interface Descriptor {
  name: string
  slug: string
}

export type AccentBucket = 'cold' | 'warm' | 'dreamy' | 'fierce' | 'pastoral'

export interface Album {
  id: string
  slug: string
  title: string
  artist: Artist[]
  releaseDate: string
  coverArt: string
  genres: Descriptor[]
  descriptors: Descriptor[]
  isAPlus: boolean
  owned: boolean
  topRanking: number | null
  appleMusicUrl: string | null
  spotifyUri: string | null
  accentBucket: AccentBucket | null
}

export interface AlbumsJson {
  generatedAt: string
  albums: Album[]
}
