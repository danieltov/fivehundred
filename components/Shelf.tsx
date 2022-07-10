/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Flex } from '@chakra-ui/layout'
import { Input } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Album, Detail, HomeItem } from '../@types/ui'
import { colorPages, colorsB } from '../lib/constants'
import Intro from './Intro'
import ShelfRow from './ShelfRow'

/**
 * Types
 */
type Props =
  | { type: 'album'; items?: Album[] }
  | { type: 'detail'; items?: Detail[] }
  | { type: 'home'; items: HomeItem[] }

/**
 *
 * Component
 *
 */
export const Shelf = React.memo(({ items, type }: Props) => {
  const [query, setQuery] = useState<string>()
  const [content, setContent] = useState<Props['items']>(() => items)

  const isAlbum = type === 'album'
  const isDetail = type === 'detail'
  const isHome = type === 'home'
  const router = useRouter()
  const { pathname } = router

  useEffect(() => {
    if (query !== undefined && isAlbum) {
      const albums = items as Album[]
      const filteredAlbums = albums.filter((item: Album) => {
        const isArtistFound = item.artist[0].name.toLowerCase().includes(query)
        const isAlbumFound = item.title.toLowerCase().includes(query)
        return isArtistFound || isAlbumFound
      })
      setContent(filteredAlbums)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <>
      <Flex
        direction="column"
        alignItems="center"
        as="section"
        minHeight="250px"
        textAlign="center"
        py="100px"
        bg={colorPages[pathname] ?? colorsB[Math.floor(Math.random() * colorsB.length)]}
      >
        <Intro />
        {isAlbum && (content.length > 10 || query !== undefined) && (
          <Input
            placeholder="Filter albums..."
            _placeholder={{ color: 'inherit' }}
            size="lg"
            w="sm"
            mt="10"
            variant="flushed"
            value={query}
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
          />
        )}
      </Flex>
      <Box>
        {content.map((item, i) => {
          const RowText = (
            <>
              {isAlbum &&
                `${item.artist[0]?.name}: ${item.title.length > 36 ? `${item.title.slice(0, 36)}...` : item.title}`}
              {isDetail && `${item.name}`}
              {isHome && `${item.text}`}
            </>
          )
          return (
            <ShelfRow
              key={item.path}
              text={RowText}
              count={items.length}
              itemIndex={i}
              path={item.path}
              cover={item.coverArt}
            />
          )
        })}
      </Box>
    </>
  )
})
