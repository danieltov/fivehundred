import { Box } from '@chakra-ui/layout'
import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { AlbumSummary } from '../../../components/Album'
import { ALBUM_INCLUDE, colorsAll, shelfProps } from '../../../lib/constants'
import prisma from '../../../lib/prisma'

const AlbumSummaryPage = ({ album }) => {
  const router = useRouter()

  const bg = useMemo(() => {
    return router.query.bg
      ? `#${router.query.bg}`
      : colorsAll[Math.floor(Math.random() * colorsAll.length)]
  }, [router.query.bg])

  return (
    <Box as='main' {...shelfProps} bg={bg}>
      <AlbumSummary album={album} bg={bg} />
    </Box>
  )
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { artist, title } = context.params as { artist: string; title: string }

  const album = await prisma.album.findFirst({
    where: {
      slug: title,
      artist: {
        some: {
          slug: artist,
        },
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
    include: {
      artist: {
        select: { slug: true },
      },
    },
  })
  return {
    paths: albums.map((album) => {
      return {
        params: {
          artist: album.artist[0].slug,
          title: album.slug,
        },
      }
    }),
    fallback: false,
  }
}

export default AlbumSummaryPage
