/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Flex, Text, VStack } from '@chakra-ui/layout'
import { Input, useMediaQuery } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { Album, Detail, HomeItem } from '../@types/ui'
import { colorPages, colorsB } from '../lib/constants'
import Intro from './Intro'
import ShelfRow from './ShelfRow'

/**
 * Types
 */
type Props =
  | { type: 'album'; items?: Album[]; showRanking?: boolean }
  | { type: 'detail'; items?: Detail[]; showRanking?: boolean }
  | { type: 'home'; items: HomeItem[]; showRanking?: boolean }

/**
 *
 * Component
 *
 */
const ShelfComponent = ({ items, type, showRanking = false }: Props) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const [query, setQuery] = useState<string>()
  const [content, setContent] = useState<Props['items']>(() => items)
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: true,
    fallback: true,
  })

  const isAlbum = type === 'album'
  const isDetail = type === 'detail'
  const isHome = type === 'home'
  const router = useRouter()
  const { pathname } = router

  const bg = useMemo(() => {
    return colorPages[pathname] ?? colorsB[Math.floor(Math.random() * colorsB.length)]
  }, [pathname])

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

  if (!isDevelopment || isDevelopment) {
    return (
      <Flex
        direction='column'
        alignItems='center'
        justifyContent='center'
        as='section'
        minHeight='100vh'
        textAlign='center'
        py='100px'
        bg={bg}
      >
        <VStack spacing={6}>
          <Text fontSize='6xl' fontWeight='bold' color='white'>
            🚧
          </Text>
          <Text fontSize='2xl' fontWeight='bold' color='white'>
            Under Construction
          </Text>
          <Text fontSize='lg' color='white' opacity={0.8} maxWidth='400px'>
            This page is currently being worked on and will be available soon.
          </Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <>
      <Flex
        direction='column'
        alignItems='center'
        as='section'
        minHeight='250px'
        textAlign='center'
        py='100px'
        bg={bg}
      >
        <Intro />
        {isAlbum && (content.length > 10 || query !== undefined) && (
          <Input
            placeholder='Filter albums...'
            _placeholder={{ color: 'inherit' }}
            size='lg'
            w={isMobile ? 'xs' : 'sm'}
            mt='10'
            variant='flushed'
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
              disableAnimation
              type={type}
              ranking={showRanking && isAlbum ? item.topRanking : undefined}
            />
          )
        })}
      </Box>
    </>
  )
}

ShelfComponent.displayName = 'Shelf'

export const Shelf = React.memo(ShelfComponent)
