/* eslint-disable no-underscore-dangle */
import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'

import { Shelf } from '../components/Shelf'
import prisma from '../lib/prisma'

const ArtistsPage = ({ artists }) => {
  const type = useConst('detail')
  return (
    <Box as='main' width='100vw' maxWidth='100vw' height='100%'>
      <Shelf items={artists} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const artists = await prisma.artist.findMany({
    include: { albums: false, _count: true },
    orderBy: {
      albums: {
        _count: 'desc',
      },
    },
  })

  return {
    props: {
      artists: artists
        .filter((artist) => artist.albums.length > 1)
        .map((artist) => ({
          ...artist,
          path: `artist/${artist.slug}`,
        })),
    },
  }
}

export default ArtistsPage
