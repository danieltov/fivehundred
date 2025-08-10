import { useQuery } from 'react-query'

import { AlbumsResponse, DetailsResponse } from '../@types/api'
import { Album, DetailWithAlbums } from '../@types/ui'
import fetcher from './fetcher'

/* Shelf View Hooks */

export const useAPlus = () => useQuery<Album[]>('a-plus', () => fetcher(`/get/album/a-plus`))
export const useAllAlbums = () => useQuery<AlbumsResponse>('all', () => fetcher(`/get/album`))
export const useDetails = (type: string) =>
  useQuery<DetailsResponse>(type, () => fetcher(`/get/${type}`))

/* Summary View Hooks */
export const useSingleAlbum = (albumId: string) =>
  useQuery<Album>('album', () => fetcher(`/get/album/${albumId}`))
export const useSingleDetail = (type: string, detailId: string) =>
  useQuery<DetailWithAlbums>(type, () => fetcher(`/get/${type}/${detailId}`))
