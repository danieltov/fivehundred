import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import prisma from '../../lib/prisma'

const GenresShelf = ({ albums }) => {
  return (
    <Box as="main" mt="50px" width="100%" height="100vh">
      <Shelf items={albums} type="album" />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params
  const genre = await prisma.genre.findFirst({
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
      albums: genre.albums.map((album) => ({
        ...album,
        path: `/album/${album.artist[0].name.replaceAll(' ', '-').toLowerCase()}/${album.title
          .replaceAll(' ', '-')
          .toLowerCase()}`,
      })),
    },
  }
}

export async function getStaticPaths() {
  const genres = await prisma.genre.findMany({
    include: { albums: true },
  })
  return {
    paths: genres.map((genre) => ({
      params: {
        slug: [genre.name.replaceAll(' ', '-').toLowerCase()],
      },
    })),
    fallback: false,
  }
}

export default GenresShelf
