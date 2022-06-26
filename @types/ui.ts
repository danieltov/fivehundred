export type Detail = {
  id: string
  name: string
  slug: string
}

export type Album = {
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
export type DetailWithAlbums = Detail & {
  albums?: Album[]
}

export type HomeItem = {
  text: string
  path: string
}
