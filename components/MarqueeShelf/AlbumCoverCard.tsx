import { Box, Skeleton } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface AlbumCoverCardProps {
  cover: string
  path: string
  title: string
  artist: string
  isPriority?: boolean
}

export const AlbumCoverCard = ({
  cover,
  path,
  title,
  artist,
  isPriority = false,
}: AlbumCoverCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Box
      mr={5} // 20px margin
      flexShrink={0}
      position='relative'
    >
      <Link href={path}>
        <Box
          w={['150px', '180px', '220px']} // Responsive sizes
          h={['150px', '180px', '220px']}
          cursor='pointer'
          borderRadius='md'
          overflow='hidden'
          _hover={{ transform: 'scale(1.02)' }}
          transition='transform 0.2s'
          position='relative'
          bg='gray.200'
        >
          {!imageLoaded && (
            <Skeleton w='100%' h='100%' position='absolute' top={0} left={0} borderRadius='md' />
          )}
          <Image
            src={cover || '/no-cover.png'}
            alt={`${artist} - ${title}`}
            layout='fill'
            sizes='(max-width: 768px) 150px, (max-width: 1024px) 180px, 220px'
            priority={isPriority}
            quality={60}
            onLoad={() => setImageLoaded(true)}
            style={{
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          />
        </Box>
      </Link>
    </Box>
  )
}
