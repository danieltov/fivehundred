import { Box } from '@chakra-ui/layout'
import { GetStaticPropsContext } from 'next'
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

export async function getStaticProps(context: GetStaticPropsContext) {
  const { slug } = context.params
  const genre = await prisma.genre.findFirst({
    where: {
      AND: [{ name: { startsWith: slug[0].split('-')[0] } }, { name: { endsWith: slug[0].split('-').pop() } }],
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
