export interface Detail {
  id: string
  name: string
}

export interface Album {
  coverArt: string
  id: string
  lastPlayed: null
  owned: boolean
  ownedDate: null
  releaseDate: string
  title: string
  artist: Detail[]
  genres: Detail[]
  descriptors: Detail[]
}
export interface DetailWithAlbums extends Detail {
  albums?: Album[]
}
