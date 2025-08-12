import { Box } from '@chakra-ui/layout'

import { MarqueeShelf } from '../components/MarqueeShelf'
import { SHELF_ALBUM_INCLUDE } from '../lib/constants'
import prisma from '../lib/prisma'

const Top50Page = ({ albums }) => {
  return (
    <Box as='main' width='100vw' maxWidth='100vw'>
      <MarqueeShelf items={albums} showRanking={true} />
    </Box>
  )
}

export async function getStaticProps() {
  const albums = await prisma.album.findMany({
    include: SHELF_ALBUM_INCLUDE,
    where: {
      topRanking: { not: null },
    },
    orderBy: { topRanking: 'asc' },
  })

  return {
    props: {
      albums: albums.map((album) => ({
        ...album,
        path: `/album/${album.artist[0].slug}/${album.slug}`,
      })),
    },
  }
}

export default Top50Page
