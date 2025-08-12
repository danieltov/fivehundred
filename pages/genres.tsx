/* eslint-disable no-underscore-dangle */
import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'

import { Shelf } from '../components/Shelf'
import prisma from '../lib/prisma'

const GenresPage = ({ genres }) => {
  const type = useConst('detail')
  return (
    <Box as='main' width='100vw' maxWidth='100vw'>
      <Shelf items={genres} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const genres = await prisma.genre.findMany({
    where: {
      albums: { some: {} },
    },
    include: { _count: { select: { albums: true } } },
    orderBy: {
      albums: {
        _count: 'desc',
      },
    },
  })
  return {
    props: {
      genres: genres.map((genre) => ({
        ...genre,
        path: `genre/${genre.slug}`,
      })),
    },
  }
}

export default GenresPage
