import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import { DETAIL_INCLUDE, shelfProps } from '../../lib/constants'
import prisma from '../../lib/prisma'

const ArtistShelf = ({ albums }) => {
  return (
    <Box as="main" {...shelfProps}>
      <Shelf items={albums} type="album" />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params

  const artist = await prisma.artist.findFirst({
    where: { slug: slug[0] },
    include: {
      albums: DETAIL_INCLUDE,
    },
  })

  return {
    props: {
      albums: artist.albums.map((album) => ({
        ...album,
        path: `/album/${album.artist[0].slug}/${album.slug}`,
      })),
    },
  }
}

export async function getStaticPaths() {
  const artists = await prisma.artist.findMany({
    include: { albums: true },
  })

  return {
    paths: artists.map((artist) => {
      return {
        params: {
          slug: [artist.slug],
        },
      }
    }),
    fallback: false,
  }
}

export default ArtistShelf
