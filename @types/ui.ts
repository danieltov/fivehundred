export interface Detail {
  id: string
  name: string
  slug: string
}

export interface Album {
  artist: Detail[]
  coverArt: string
  descriptors: Detail[]
  genres: Detail[]
  id: string
  lastPlayed: null
  owned: boolean
  ownedDate: null
  releaseDate: string
  slug: string
  title: string
  isAPlus: boolean
}
export interface DetailWithAlbums extends Detail {
  albums?: Album[]
}
