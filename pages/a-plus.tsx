import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'
import { Shelf } from '../components/Shelf'
import { ALBUM_INCLUDE } from '../lib/constants'
import prisma from '../lib/prisma'

const APlusPage = ({ albums }) => {
  const type = useConst('album')
  return (
    <Box as="main" width="100vw" maxWidth="100vw">
      <Shelf items={albums} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const albums = await prisma.album.findMany({
    include: ALBUM_INCLUDE,
    where: {
      isAPlus: true,
    },
    orderBy: { title: 'asc' },
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
