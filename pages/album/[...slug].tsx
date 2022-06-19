import { Box } from '@chakra-ui/layout'
import { useRouter } from 'next/router'
import { AlbumSummary } from '../../components/Album'
import { ALBUM_INCLUDE, shelfProps, slugify } from '../../lib/constants'
import prisma from '../../lib/prisma'

const AlbumSummaryPage = ({ album }) => {
  const router = useRouter()

  return (
    <Box as="main" {...shelfProps} bg={`#${router.query.bg}`}>
      <AlbumSummary album={album} />
    </Box>
  )
}

export async function getStaticProps(context) {
  const { slug } = context.params
  const album = await prisma.album.findFirst({
    where: {
      artist: {
        some: {
          name: {
            endsWith: slug[0].split('-').pop(),
          },
        },
      },
      title: {
        endsWith: slug[1].split('-').pop(),
      },
    },
    include: ALBUM_INCLUDE,
  })
  return {
    props: {
      album,
    },
  }
}

export async function getStaticPaths() {
  const albums = await prisma.album.findMany({
    include: ALBUM_INCLUDE,
  })
  return {
    paths: albums.map((album) => ({
      params: {
        slug: [slugify(album.artist[0].name), slugify(album.title)],
      },
    })),
    fallback: true,
  }
}

export default AlbumSummaryPage
