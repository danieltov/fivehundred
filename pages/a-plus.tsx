import { Box } from '@chakra-ui/layout'

import { MarqueeShelf } from '../components/MarqueeShelf'
import { SHELF_ALBUM_INCLUDE } from '../lib/constants'
import prisma from '../lib/prisma'

const APlusPage = ({ albums }) => {
  return (
    <Box as='main' width='100vw' maxWidth='100vw'>
      {/*<Shelf items={albums} type={type} />*/}
      <MarqueeShelf items={albums} showRanking={false} />
    </Box>
  )
}

export async function getStaticProps() {
  const albums = await prisma.album.findMany({
    include: SHELF_ALBUM_INCLUDE,
    where: {
      isAPlus: true,
    },
    orderBy: { updatedAt: 'desc' },
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

export default APlusPage
