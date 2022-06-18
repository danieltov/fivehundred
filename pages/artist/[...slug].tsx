import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import prisma from '../../lib/prisma'

const ArtistShelf = ({ albums }) => {
  // eslint-disable-next-line no-console
  console.log('%c albums', 'background:deepskyblue;padding:15px;font-weight:bold;color:white;', { albums })
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
      name: {
        contains: slug[0].replaceAll(/-/g, ' '),
      },
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
        path: `/album/${album.artist[0].name.replaceAll(' ', '-').toLowerCase()}/${album.title
          .replaceAll(' ', '-')
          .toLowerCase()}`,
      })),
    },
  }
}

export async function getStaticPaths() {
  const artists = await prisma.artist.findMany({
    include: { albums: true },
  })
  return {
    paths: artists.map((artist) => ({
      params: {
        slug: [artist.name.replaceAll(' ', '-').toLowerCase()],
      },
    })),
    fallback: false,
  }
}

export default ArtistShelf
