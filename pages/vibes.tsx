/* eslint-disable no-underscore-dangle */
import { Box } from '@chakra-ui/layout'
import { useConst } from '@chakra-ui/react'

import { Shelf } from '../components/Shelf'
import prisma from '../lib/prisma'

const VibesPage = ({ vibes }) => {
  const type = useConst('detail')
  return (
    <Box as='main' width='100vw' maxWidth='100vw'>
      <Shelf items={vibes} type={type} />
    </Box>
  )
}

export async function getStaticProps() {
  const descriptors = await prisma.descriptor.findMany({
    where: {
      AND: [
        {
          name: {
            not: {
              contains: 'vocals',
            },
          },
        },
        {
          albums: { some: {} },
        },
      ],
    },
    include: { _count: { select: { albums: true } } },
    orderBy: {
      albums: {
        _count: 'desc',
      },
    },
  })
  return {
    props: {
      vibes: descriptors.map((descriptor) => ({
        ...descriptor,
        path: `vibe/${descriptor.slug}`,
      })),
    },
  }
}

export default VibesPage
