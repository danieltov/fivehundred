import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import { slugify } from '../../lib/constants'
import prisma from '../../lib/prisma'

const ArtistShelf = ({ albums }) => {
  return (
    <Box as="main" mt="50px" width="100%" height="100vh">
      <Shelf items={albums} type="album" />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params

  const artist = await prisma.artist.findFirst({
    where: {
      OR: [
        {
          name: { equals: slug[0] },
        },
        {
          name: {
            endsWith: slug[0].split('-').pop(),
          },
        },
        {
          name: {
            startsWith: slug[0].split('-')[0],
          },
        },
      ],
    },
    include: {
      albums: {
        include: { artist: true },
      },
    },
  })

  return {
    props: {
      albums: artist.albums.map((album) => ({
        ...album,
        path: `/album/${slugify(album.artist[0].name)}/${slugify(album.title)}`,
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
          slug: [slugify(artist.name)],
        },
      }
    }),
    fallback: false,
  }
}

export default ArtistShelf
