import { Box } from '@chakra-ui/layout'
import { Shelf } from '../../components/Shelf'
import { shelfProps, slugify } from '../../lib/constants'
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
      albums: descriptor.albums.map((album) => ({
        ...album,
        path: `/album/${slugify(album.artist[0].name)}/${slugify(album.title)}`,
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
        slug: [slugify(descriptor.name)],
      },
    })),
    fallback: false,
  }
}

export default VibesShelf
