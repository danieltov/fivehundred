/* eslint-disable jsx-a11y/anchor-is-valid */
import { Box, Link } from '@chakra-ui/layout'
import Image from 'next/image'
import NextLink from 'next/link'

/**
 * Utils
 */
const getStripeHeight = (count: number) => {
  switch (true) {
    case count === 5:
      return `calc(24vh)`
    default:
      return 'calc(100vh / 6.25)'
  }
}

interface AlbumCoverProps {
  cover: string
  path: string
  count: number
  itemIndex: number
  type: 'album' | 'detail' | 'home'
  ranking?: number
  isEven: boolean
}

export const AlbumCover = ({
  cover,
  path,
  count,
  itemIndex,
  type,
  ranking,
  isEven,
}: AlbumCoverProps) => {
  if (type !== 'album') return null

  return (
    <NextLink href={path}>
      <Link>
        <Box minWidth={getStripeHeight(count)} height='100%' position='relative' overflow='hidden'>
          <Image
            src={cover || '/no-cover.png'}
            alt='Album cover'
            width={200}
            height={200}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            sizes={getStripeHeight(count)}
            quality={75}
            priority={itemIndex < 3}
          />
          {ranking && (
            <Box
              position='absolute'
              top='50%'
              left={isEven ? '33px' : 'auto'}
              right={isEven ? 'auto' : '33px'}
              transform='translateY(-50%)'
              zIndex={10}
              minW='60px'
              fontSize='2xl'
              fontWeight='bold'
              color='gold'
              textAlign='center'
              bg='rgba(0,0,0,0.7)'
              borderRadius='md'
              cursor='pointer'
              _hover={{
                bg: 'rgba(0,0,0,0.9)',
                transform: 'translateY(-50%) scale(1.05)',
                transition: 'all 0.2s ease',
              }}
            >
              #{ranking}
            </Box>
          )}
        </Box>
      </Link>
    </NextLink>
  )
}
