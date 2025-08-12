import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface AlbumListItemProps {
  rank?: number
  albumArtUrl: string
  albumTitle: string
  artistName: string
  path: string
  isPriority?: boolean
}

export const AlbumListItem = ({
  rank,
  albumArtUrl,
  albumTitle,
  artistName,
  path,
  isPriority = false,
}: AlbumListItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link href={path}>
      <Flex
        align='center'
        p={4}
        _hover={{
          cursor: 'pointer',
        }}
        w='100%'
      >
        {/* Rank Section - only show if provided */}
        {rank && (
          <Box minW='60px' mr={4} textAlign='center'>
            <Text fontSize='2xl' fontWeight='bold' color='black'>
              {rank}
            </Text>
          </Box>
        )}

        {/* Album Art Section */}
        <Box
          w='120px'
          h='120px'
          mr={4}
          flexShrink={0}
          borderRadius='none'
          overflow='hidden'
          bg='gray.200'
          position='relative'
        >
          {!imageLoaded && (
            <Skeleton w='100%' h='100%' position='absolute' top={0} left={0} borderRadius='none' />
          )}
          <Image
            src={albumArtUrl || '/no-cover.png'}
            alt={`${artistName} - ${albumTitle}`}
            layout='fill'
            sizes='120px'
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

        {/* Text Content Section */}
        <Box flex={1} minW={0}>
          <Text
            fontSize='lg'
            fontWeight='semibold'
            color='black'
            mb={1}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: ['200px', null, '300px'],
            }}
          >
            {albumTitle}
          </Text>
          <Text fontSize='md' fontWeight='normal' color='gray.600' noOfLines={1}>
            {artistName}
          </Text>
        </Box>
      </Flex>
    </Link>
  )
}
