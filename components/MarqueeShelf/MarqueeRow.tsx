import { Box, Flex, useMediaQuery } from '@chakra-ui/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

import { Album } from '../../@types/ui'
import { AlbumCoverCard } from './AlbumCoverCard'

interface MarqueeRowProps {
  albums: Album[]
  isEven: boolean
  rowIndex: number
}

export const MarqueeRow = ({ albums, isEven, rowIndex }: MarqueeRowProps) => {
  const wrapper = useRef<HTMLDivElement>(null)
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const [isTablet] = useMediaQuery('(max-width: 1024px)')

  useEffect(() => {
    if (!wrapper.current || albums.length === 0) return

    // Use responsive album widths to match AlbumCoverCard
    const albumWidth = isMobile ? 170 : isTablet ? 200 : 240 // includes margin
    const totalWidth = albumWidth * albums.length
    const screenWidth = window.innerWidth

    // Calculate minimum number of duplicate sets needed to fill screen + extra for seamless loop
    const minDuplicates = Math.ceil((screenWidth * 2) / totalWidth) + 1
    const actualDuplicates = Math.max(3, minDuplicates) // Ensure at least 3 for smooth animation

    const speed = 50 + rowIndex * 10 // Pixels per second
    const duration = totalWidth / speed

    const q = gsap.utils.selector(wrapper.current)
    const boxes = q('.marquee-box')

    // Set initial positions with proper spacing for seamless loop
    gsap.set(boxes, {
      x: (i) => {
        if (isEven) {
          // Right-to-left: position boxes side by side starting from right
          return i * totalWidth
        } else {
          // Left-to-right: position boxes side by side starting from left
          return i * totalWidth
        }
      },
    })

    const tl = gsap.timeline({ repeat: -1 })

    if (isEven) {
      // Right to left movement
      tl.to(boxes, {
        x: `-=${totalWidth}`,
        duration,
        ease: 'none',
        modifiers: {
          x: gsap.utils.unitize(gsap.utils.wrap(-totalWidth, totalWidth * (actualDuplicates - 1))),
        },
      })
    } else {
      // Left to right movement
      tl.to(boxes, {
        x: `+=${totalWidth}`,
        duration,
        ease: 'none',
        modifiers: {
          x: gsap.utils.unitize(gsap.utils.wrap(-totalWidth * (actualDuplicates - 1), totalWidth)),
        },
      })
    }

    return () => {
      tl.kill()
    }
  }, [albums, isEven, rowIndex, isMobile, isTablet])

  if (albums.length === 0) return null

  // Calculate number of duplicates needed for seamless loop
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const albumWidth = isMobile ? 170 : isTablet ? 200 : 240
  const totalWidth = albumWidth * albums.length
  const minDuplicates = Math.ceil((screenWidth * 2) / totalWidth) + 1
  const duplicateCount = Math.max(3, minDuplicates)

  return (
    <Box
      ref={wrapper}
      position='relative'
      width='100vw'
      height={['170px', '200px', '240px']}
      overflow='hidden'
      mb={4}
    >
      {Array.from({ length: duplicateCount }, (_, boxIndex) => (
        <Flex
          key={boxIndex}
          className='marquee-box'
          position='absolute'
          height='100%'
          alignItems='center'
          width='auto'
          whiteSpace='nowrap'
        >
          {albums.map((album, index) => (
            <AlbumCoverCard
              key={`${album.id}-${boxIndex}`}
              cover={album.coverArt}
              path={`/album/${album.artist[0]?.slug}/${album.slug}`}
              title={album.title}
              artist={album.artist[0]?.name}
              isPriority={boxIndex === 0 && index < 8}
            />
          ))}
        </Flex>
      ))}
    </Box>
  )
}
