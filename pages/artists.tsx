/* eslint-disable no-underscore-dangle */
import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'
import { Shelf } from '../components/Shelf'
import prisma from '../lib/prisma'

const ArtistsPage = ({ artists }) => {
  const type = useConst('detail')
  return (
    <Box as="main" mt="50px" width="100vw" maxWidth="100vw" height="100%">
      <Shelf items={artists} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const artists = await prisma.artist.findMany({
    include: { albums: true, _count: true },
    orderBy: {
      albums: {
        _count: 'desc',
      },
    },
  })
  return {
    props: {
      artists: artists
        .filter((artist) => artist._count.albums > 2)
        .map((artist) => ({
          ...artist,
          path: `/artist/${artist.name.replaceAll(' ', '-').toLowerCase()}`,
        })),
    },
  }
}

export default ArtistsPage
