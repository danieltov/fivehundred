import { Album, DetailWithAlbums } from './ui'

export type ScrapedAlbum = {
  COVER: string
  TITLE: string
  ARTIST: string
  RELEASE_DATE: string
  GENRES: string[]
  DESCRIPTORS: string[]
}

export type AlbumsResponse = {
  data: Album[]
}

export type DetailsResponse = {
  data: DetailWithAlbums[]
}
