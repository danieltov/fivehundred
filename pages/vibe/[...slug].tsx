import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import { DETAIL_INCLUDE, shelfProps } from '../../lib/constants'
import prisma from '../../lib/prisma'

const VibesShelf = ({ albums }) => {
  return (
    <Box as="main" {...shelfProps}>
      <Shelf items={albums} type="album" />
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
      albums: DETAIL_INCLUDE,
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
    include: { albums: true },
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
