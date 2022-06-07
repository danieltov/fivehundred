import { Box } from '@chakra-ui/layout'
import { useRouter } from 'next/router'
import { AlbumSummary } from '../components/Album'
import { ALBUM_INCLUDE } from '../lib/constants'
import prisma from '../lib/prisma'

const AlbumPage = ({ album }) => {
  const router = useRouter()

  return (
    <Box as="main" mt="50px" width="100%" height="100vh" bg={`#${router.query.bg}`}>
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
            contains: slug[0].replace(/-/g, ' '),
          },
        },
      },
      title: {
        contains: slug[1].replace(/-/g, ' '),
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
        slug: [album.artist[0].name.replace(' ', '-').toLowerCase(), album.title.replace(' ', '-').toLowerCase()],
      },
    })),
    fallback: false,
  }
}

export default AlbumPage
