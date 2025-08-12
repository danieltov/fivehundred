import { Box, Flex } from '@chakra-ui/layout'
import { useMediaQuery } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { Album } from '../../@types/ui'
import { colorPages, colorsB } from '../../lib/constants'
import { AlbumList } from '../AlbumList'
import Intro from '../Intro'
import { MarqueeRow } from './MarqueeRow'

interface MarqueeShelfProps {
  items: Album[]
  showRanking?: boolean
}

export const MarqueeShelf = ({ items, showRanking = false }: MarqueeShelfProps) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: true,
    fallback: true,
  })
  const [showChevron, setShowChevron] = useState(true)
  const router = useRouter()
  const { pathname } = router

  // Track scroll position to show/hide chevron
  useEffect(() => {
    const handleScroll = () => {
      setShowChevron(window.scrollY === 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Number of rows based on screen size
  const numRows = isMobile ? 4 : 3

  // Filter out items without cover art
  const itemsWithCoverArt = useMemo(() => {
    return items.filter((item) => item.coverArt)
  }, [items])

  // Only create album rows if we have more than 20 items
  const shouldShowMarquee = itemsWithCoverArt.length > 20

  const albumRows = useMemo(() => {
    if (!shouldShowMarquee) return []

    const rows = Array.from({ length: numRows }, () => [])

    itemsWithCoverArt.forEach((album, index) => {
      rows[index % numRows].push(album)
    })

    return rows
  }, [itemsWithCoverArt, numRows, shouldShowMarquee])

  // Get page title for list
  const getListTitle = () => {
    if (pathname === '/top-50') return 'Top 50 Albums'
    if (pathname === '/a-plus') return 'A-Plus Albums'
    return 'Albums'
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
        bg={colorPages[pathname] ?? colorsB[0]}
      >
        <Intro />
      </Flex>

      {/* Only show MarqueeRow animation if we have more than 20 items */}
      {shouldShowMarquee && (
        <Box py={8}>
          {albumRows.map((albums, index) => (
            <MarqueeRow key={index} albums={albums} isEven={index % 2 === 0} rowIndex={index} />
          ))}
        </Box>
      )}

      {/* Album List Section */}
      <AlbumList items={items} showRanking={showRanking} title={getListTitle()} />

      {/* Floating Chevron */}
      {showChevron && (
        <Box
          position='fixed'
          bottom='20px'
          left='50%'
          transform='translateX(-50%)'
          fontSize='5xl'
          color='gray.900'
          zIndex={10}
          pointerEvents='none'
          opacity={0.9}
          transition='opacity 0.3s ease'
        >
          ⌄
        </Box>
      )}
    </>
  )
}
