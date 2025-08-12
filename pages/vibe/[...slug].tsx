import { Box } from '@chakra-ui/layout'

import { MarqueeShelf } from '../../components/MarqueeShelf'
import { SHELF_ALBUM_INCLUDE, shelfProps } from '../../lib/constants'
import prisma from '../../lib/prisma'

const VibesShelf = ({ albums }) => {
  return (
    <Box as='main' {...shelfProps}>
      <MarqueeShelf items={albums} />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params
  const descriptor = await prisma.descriptor.findFirst({
    where: {
      slug: slug[0],
    },
    include: {
      albums: {
        include: SHELF_ALBUM_INCLUDE,
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  return {
    props: {
      albums: descriptor.albums.map((album) => ({
        ...album,
        path: `/album/${album.artist[0].slug}/${album.slug}`,
      })),
    },
  }
}

export async function getStaticPaths() {
  const descriptors = await prisma.descriptor.findMany({
    select: { slug: true },
  })
  return {
    paths: descriptors.map((descriptor) => ({
      params: {
        slug: [descriptor.slug],
      },
    })),
    fallback: false,
  }
}

export default VibesShelf
