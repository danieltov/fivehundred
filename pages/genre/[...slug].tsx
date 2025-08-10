import { Box } from '@chakra-ui/layout'
import { GetStaticPropsContext } from 'next'

import { Shelf } from '../../components/Shelf'
import { DETAIL_INCLUDE, shelfProps } from '../../lib/constants'
import prisma from '../../lib/prisma'

const GenresShelf = ({ albums }) => {
  return (
    <Box as='main' {...shelfProps}>
      <Shelf items={albums} type='album' />
    </Box>
  )
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { slug } = context.params
  const genre = await prisma.genre.findFirst({
    where: {
      slug: slug[0],
    },
    include: {
      albums: DETAIL_INCLUDE,
    },
  })

  return {
    props: {
      albums: genre.albums.map((album) => ({
        ...album,
        path: `/album/${album.artist[0].slug}/${album.slug}`,
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
        slug: [genre.slug],
      },
    })),
    fallback: false,
  }
}

export default GenresShelf
