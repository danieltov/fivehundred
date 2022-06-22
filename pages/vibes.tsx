/* eslint-disable no-underscore-dangle */
import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'
import { Shelf } from '../components/Shelf'
import prisma from '../lib/prisma'

const VibesPage = ({ vibes }) => {
  const type = useConst('detail')
  return (
    <Box as="main" mt="50px" width="100vw" maxWidth="100vw">
      <Shelf items={vibes} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const descriptors = await prisma.descriptor.findMany({
    include: { albums: true, _count: true },
    orderBy: {
      albums: {
        _count: 'desc',
      },
    },
  })
  return {
    props: {
      vibes: descriptors
        .filter((descriptor) => descriptor._count.albums > 5)
        .map((descriptor) => ({
          ...descriptor,
          path: `vibe/${descriptor.slug}`,
        })),
    },
  }
}

export default VibesPage
