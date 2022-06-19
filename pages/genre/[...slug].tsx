import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import { shelfProps, slugify } from '../../lib/constants'
import prisma from '../../lib/prisma'

const GenresShelf = ({ albums }) => {
  return (
    <Box as="main" {...shelfProps}>
      <Shelf items={albums} type="album" />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params
  const genre = await prisma.genre.findFirst({
    where: {
      OR: [{ name: { contains: slug[0].replaceAll(/-/g, ' ') } }, { name: { contains: slug[0] } }],
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
        path: `/album/${slugify(album.artist[0].name)}/${slugify(album.title)}`,
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
        slug: [slugify(genre.name)],
      },
    })),
    fallback: false,
  }
}

export default GenresShelf
