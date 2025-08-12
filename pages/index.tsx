import { Box, Heading, Link, VStack } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { useEffect } from 'react'

import Intro from '../components/Intro'
import { links } from '../lib/constants'
import { useImagePreload } from '../lib/hooks/useImagePreload'

const Home = ({ preloadedCovers }) => {
  const albumCovers = preloadedCovers || []

  // Preload images with smart batching
  const { loadedCount, totalCount, isPreloading } = useImagePreload(albumCovers, {
    enabled: albumCovers.length > 0,
    delay: 2000, // Start preloading 2 seconds after page load
    batchSize: 4, // Load 4 images at a time
  })

  useEffect(() => {
    if (isPreloading && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Preloading album covers: ${loadedCount}/${totalCount}`)
    }
  }, [loadedCount, totalCount, isPreloading])

  return (
    <Box as='main'>
      <VStack spacing={0} align='stretch' height='100%'>
        {/* Intro Section */}
        <VStack
          as='section'
          spacing={4}
          minHeight='250px'
          textAlign='center'
          py='100px'
          bg='#F34575'
          justify='center'
        >
          <Intro />
        </VStack>

        {/* Navigation Links Section */}
        <VStack bg='ivory' spacing={0} py='20' px={0} flex={1} justify='center'>
          {links.map((link) => (
            <NextLink href={link.path} passHref key={link.text}>
              <Link width='full'>
                <Heading
                  as='h3'
                  fontSize={['4rem', null, '8rem']}
                  textAlign='center'
                  lineHeight={0.9}
                  fontWeight={200}
                  textTransform='uppercase'
                  _hover={{
                    color: link.color,
                    fontWeight: 800,
                    transition: 'font-weight 0.5s',
                  }}
                >
                  {link.text}
                </Heading>
              </Link>
            </NextLink>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

export async function getStaticProps() {
  try {
    const { default: prisma } = await import('../lib/prisma')

    const aPlusAlbums = await prisma.album.findMany({
      where: {
        isAPlus: true,
      },
      select: {
        coverArt: true,
      },
      take: 20,
    })

    // Fetch Top 50 albums (using the correct query)
    const top50Albums = await prisma.album.findMany({
      where: {
        topRanking: { not: null },
      },
      orderBy: { topRanking: 'asc' },
      select: {
        coverArt: true,
      },
      take: 25,
    })

    // Extract cover URLs
    const allCovers = [
      ...aPlusAlbums.map((album) => album.coverArt),
      ...top50Albums.map((album) => album.coverArt),
    ].filter(Boolean) // Remove any null/undefined covers

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Server: Found ${allCovers.length} covers for preloading`)
    }

    return {
      props: {
        preloadedCovers: allCovers,
      },
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Server preload fetch failed:', error)
    }
    return {
      props: {
        preloadedCovers: [],
      },
    }
  }
}

export default Home
