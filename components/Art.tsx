import { Box } from '@chakra-ui/layout'
import { Skeleton, useMediaQuery } from '@chakra-ui/react'
import Image from 'next/image'
import { useState } from 'react'

import { Album } from '../@types/ui'

type Props = {
  coverArt: Album['coverArt']
}

export const Art = ({ coverArt }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isMobile] = useMediaQuery('(max-width: 768px)')

  return (
    <Box
      as='picture'
      width={['100%', '500px']}
      maxWidth={['100%', '500px']}
      height={['100%', '500px']}
      _after={
        isMobile
          ? null
          : {
              content: `""`,
              position: 'absolute',
              bg: 'gray.800',
              borderRadius: '100%',
              height: '90%',
              width: '90%',
              top: '5%',
              left: '15%',
              zIndex: 0,
              transitionDuration: '0.5s',
            }
      }
      _hover={{
        _after: {
          left: '25%',
        },
      }}
      display='inline-block'
      position='relative'
    >
      {!imageLoaded && (
        <Skeleton
          w='100%'
          h='100%'
          position='absolute'
          top={0}
          left={0}
          borderRadius='md'
          zIndex={2}
          opacity={1}
        />
      )}
      <Image
        src={imageError ? '/no-cover.png' : coverArt || '/no-cover.png'}
        alt='Album cover art'
        width={500}
        height={500}
        sizes='(max-width: 768px) 100vw, 500px'
        quality={85}
        priority={false}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          if (!imageError && coverArt) {
            setImageError(true)
            setImageLoaded(false)
          } else {
            setImageLoaded(true)
          }
        }}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}
      />
    </Box>
  )
}
