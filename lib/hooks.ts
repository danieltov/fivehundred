import { useQuery } from 'react-query'
import { AlbumsResponse, DetailsResponse } from '../@types/api'
import { Album, DetailWithAlbums } from '../@types/ui'
import fetcher from './fetcher'

// TODO - tier albums
// TODO const A_PLUS_TIER = 'a-plus-tier'

/* Shelf View Hooks */

// TODO export const useAPlus = () => useQuery<Album[]>('a-plus', () => fetcher(`/get/tier/${A_PLUS_TIER}`))
export const useAllAlbums = () => useQuery<AlbumsResponse>('all', () => fetcher(`/get/album`))
export const useDetails = (type: string) => useQuery<DetailsResponse>(type, () => fetcher(`/get/${type}`))

/* Summary View Hooks */
export const useSingleAlbum = (albumId: string) => useQuery<Album>('album', () => fetcher(`/get/album/${albumId}`))
export const useSingleDetail = (type: string, detailId: string) =>
  useQuery<DetailWithAlbums>(type, () => fetcher(`/get/${type}/${detailId}`))
